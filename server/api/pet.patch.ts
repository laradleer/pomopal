import { petRenameSchema } from '#shared/schemas/pet'
import { renamePet } from '~~/server/services/pet'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const input = await readValidBody(event, petRenameSchema)
  return renamePet(user.id, input)
})
