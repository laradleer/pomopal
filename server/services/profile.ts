import type { DbOrTx } from '~~/server/db/client'
import { profile } from '~~/server/db/schema'

/**
 * Creates the game profile for a new user. Called by the Better Auth hook after sign-up.
 * Does nothing if the profile already exists, so it is safe to call again.
 */
export async function createProfile(
  db: DbOrTx,
  userId: string,
  displayName: string,
): Promise<void> {
  await db.insert(profile).values({ userId, displayName }).onConflictDoNothing()
}
