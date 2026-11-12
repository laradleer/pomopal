import { petCreateSchema } from '#shared/schemas/pet'
import { createPet } from '~~/server/services/pet'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const input = await readValidBody(event, petCreateSchema)
  setResponseStatus(event, 201)
  return createPet(user.id, input)
})
