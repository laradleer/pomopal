/** How much earlier than planned a session may end and still count (network lag, a slow tab). */
export const SESSION_GRACE_MS = 30_000

const MS_PER_MINUTE = 60_000

/**
 * A session counts only if enough real time has passed since the server saved `startedAt`:
 * now − startedAt ≥ plannedMin − 30 seconds. Pausing only adds time, so it never hurts.
 */
export function isSessionValid(startedAt: Date, plannedMin: number, now: Date): boolean {
  const elapsedMs = now.getTime() - startedAt.getTime()
  return elapsedMs >= plannedMin * MS_PER_MINUTE - SESSION_GRACE_MS
}
