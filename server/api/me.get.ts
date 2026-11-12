import { getMe } from '~~/server/services/me'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  return getMe({ id: user.id, name: user.name, email: user.email, image: user.image ?? null })
})
