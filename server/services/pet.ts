import type { PetCreateInput } from '#shared/schemas/pet'
import type { MePet } from '#shared/types/me'
import { pet } from '~~/server/db/schema'

/**
 * Creates the user's one and only pet. A single atomic insert: if a pet already exists
 * (unique user_id), nothing is inserted and `PET_ALREADY_EXISTS` is thrown.
 */
export async function createPet(userId: string, input: PetCreateInput): Promise<MePet> {
  const [created] = await useDb()
    .insert(pet)
    .values({ userId, species: input.species, name: input.name })
    .onConflictDoNothing({ target: pet.userId })
    .returning({ id: pet.id, species: pet.species, name: pet.name, mood: pet.mood })

  if (!created) throw apiError('PET_ALREADY_EXISTS')
  return created
}
