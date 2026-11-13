import { eq } from 'drizzle-orm'
import type { PetCreateInput, PetRenameInput } from '#shared/schemas/pet'
import type { MePet } from '#shared/types/me'
import { pet } from '~~/server/db/schema'
import { getEquipped } from '~~/server/services/inventory'

const petColumns = { id: pet.id, species: pet.species, name: pet.name, mood: pet.mood }

/**
 * Creates the user's one and only pet. A single atomic insert: if a pet already exists
 * (unique user_id), nothing is inserted and `PET_ALREADY_EXISTS` is thrown.
 */
export async function createPet(userId: string, input: PetCreateInput): Promise<MePet> {
  const [created] = await useDb()
    .insert(pet)
    .values({ userId, species: input.species, name: input.name })
    .onConflictDoNothing({ target: pet.userId })
    .returning(petColumns)

  if (!created) throw apiError('PET_ALREADY_EXISTS')
  // A new pet wears nothing yet.
  return { ...created, equipped: {} }
}

/** Gives the user's pet a new name. */
export async function renamePet(userId: string, input: PetRenameInput): Promise<MePet> {
  const db = useDb()
  const [renamed] = await db
    .update(pet)
    .set({ name: input.name })
    .where(eq(pet.userId, userId))
    .returning(petColumns)

  if (!renamed) throw apiError('NOT_FOUND', 'Pet not found')
  return { ...renamed, equipped: await getEquipped(db, userId) }
}
