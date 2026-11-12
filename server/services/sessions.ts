import { and, eq } from 'drizzle-orm'
import type { SessionStartInput } from '#shared/schemas/session'
import type { CompleteSessionResult, FocusSessionDto } from '#shared/types/session'
import type { Transaction } from '~~/server/db/client'
import { focusSession, pet, profile, task } from '~~/server/db/schema'
import type { FocusSession } from '~~/server/db/schema'
import { isSessionValid } from '~~/server/services/rules/session'

export function toSessionDto(row: FocusSession): FocusSessionDto {
  return {
    id: row.id,
    mode: row.mode,
    plannedMin: row.plannedMin,
    taskId: row.taskId,
    startedAt: row.startedAt.toISOString(),
    endedAt: row.endedAt?.toISOString() ?? null,
    status: row.status,
    xpEarned: row.xpEarned,
    coinsEarned: row.coinsEarned,
  }
}

/**
 * Starts a session with the server's own start time (the client never sends it).
 * A user has at most one running session: starting a new one abandons the old one.
 */
export async function startSession(
  userId: string,
  input: SessionStartInput,
  now: Date,
): Promise<FocusSessionDto> {
  return useDb().transaction(async (tx) => {
    if (input.taskId !== undefined) {
      const ownTask = await tx.query.task.findFirst({
        where: and(eq(task.id, input.taskId), eq(task.userId, userId)),
        columns: { id: true },
      })
      if (!ownTask) throw apiError('NOT_FOUND', 'Task not found')
    }

    await tx
      .update(focusSession)
      .set({ status: 'abandoned', endedAt: now })
      .where(and(eq(focusSession.userId, userId), eq(focusSession.status, 'running')))

    const [created] = await tx
      .insert(focusSession)
      .values({
        userId,
        mode: input.mode,
        plannedMin: input.plannedMin,
        taskId: input.taskId ?? null,
        startedAt: now,
      })
      .returning()
    if (!created) throw new Error('Session insert returned no row')
    return toSessionDto(created)
  })
}

/** Locks the user's own running session for this transaction, or throws 404 / 409. */
async function lockRunningSession(tx: Transaction, userId: string, id: number) {
  const [row] = await tx
    .select()
    .from(focusSession)
    .where(and(eq(focusSession.id, id), eq(focusSession.userId, userId)))
    .for('update')
  if (!row) throw apiError('NOT_FOUND', 'Session not found')
  if (row.status !== 'running') throw apiError('SESSION_NOT_RUNNING')
  return row
}

/**
 * Completes a running session if enough real time has passed (`isSessionValid`).
 * Rewards are zero for now; XP, coins and levels are added in #17.
 */
export async function completeSession(
  userId: string,
  id: number,
  now: Date,
): Promise<CompleteSessionResult> {
  return useDb().transaction(async (tx) => {
    const running = await lockRunningSession(tx, userId, id)
    if (!isSessionValid(running.startedAt, running.plannedMin, now)) {
      throw apiError('SESSION_TOO_SHORT')
    }

    const [completed] = await tx
      .update(focusSession)
      .set({ status: 'completed', endedAt: now })
      .where(eq(focusSession.id, id))
      .returning()
    if (!completed) throw new Error('Session update returned no row')

    const current = await tx.query.profile.findFirst({
      where: eq(profile.userId, userId),
      columns: { level: true },
    })

    return {
      session: toSessionDto(completed),
      rewards: { xp: 0, coins: 0, levelUp: false, newLevel: current?.level ?? 1 },
    }
  })
}

/** Quits a running session. Quitting a focus session makes the pet sad (no reward). */
export async function abandonSession(
  userId: string,
  id: number,
  now: Date,
): Promise<FocusSessionDto> {
  return useDb().transaction(async (tx) => {
    const running = await lockRunningSession(tx, userId, id)

    const [abandoned] = await tx
      .update(focusSession)
      .set({ status: 'abandoned', endedAt: now })
      .where(eq(focusSession.id, id))
      .returning()
    if (!abandoned) throw new Error('Session update returned no row')

    if (running.mode === 'focus') {
      await tx.update(pet).set({ mood: 'sad' }).where(eq(pet.userId, userId))
    }
    return toSessionDto(abandoned)
  })
}
