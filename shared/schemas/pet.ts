import { z } from 'zod'
import { PET_NAME_MAX_LENGTH, PET_SPECIES } from '../constants'

export const petCreateSchema = z.object({
  species: z.enum(PET_SPECIES, { error: 'Pick a cat or a dog.' }),
  name: z
    .string({ error: 'Give your pet a name.' })
    .trim()
    .min(1, { error: 'Give your pet a name.' })
    .max(PET_NAME_MAX_LENGTH, { error: `Names can be up to ${PET_NAME_MAX_LENGTH} characters.` }),
})

export type PetCreateInput = z.infer<typeof petCreateSchema>
