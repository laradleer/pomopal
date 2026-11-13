import { eq } from 'drizzle-orm'
import type { Me, MeUser } from '#shared/types/me'
import { pet, profile } from '~~/server/db/schema'
import { getEquipped } from '~~/server/services/inventory'
import { createProfile } from '~~/server/services/profile'

/**
 * Everything the app needs about the signed-in user in one call.
 * Creates the profile if it is missing (e.g. the sign-up hook failed), so callers can rely on it.
 */
export async function getMe(user: MeUser): Promise<Me> {
  const db = useDb()

  const findProfile = () => db.query.profile.findFirst({ where: eq(profile.userId, user.id) })
  const [existingProfile, petRow, equipped] = await Promise.all([
    findProfile(),
    db.query.pet.findFirst({ where: eq(pet.userId, user.id) }),
    getEquipped(db, user.id),
  ])

  let profileRow = existingProfile
  if (!profileRow) {
    await createProfile(db, user.id, user.name)
    profileRow = await findProfile()
  }
  if (!profileRow) throw apiError('NOT_FOUND', 'Profile could not be created')

  return {
    user: { id: user.id, name: user.name, email: user.email, image: user.image },
    profile: {
      displayName: profileRow.displayName,
      xp: profileRow.xp,
      level: profileRow.level,
      coins: profileRow.coins,
      streakDays: profileRow.streakDays,
      lastStudyDate: profileRow.lastStudyDate,
      focusMin: profileRow.focusMin,
      shortBreakMin: profileRow.shortBreakMin,
      longBreakMin: profileRow.longBreakMin,
    },
    pet: petRow
      ? {
          id: petRow.id,
          species: petRow.species,
          name: petRow.name,
          mood: petRow.mood,
          equipped,
        }
      : null,
  }
}
