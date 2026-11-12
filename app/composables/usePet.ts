import type { PetCreateInput } from '#shared/schemas/pet'
import type { MePet } from '#shared/types/me'

/** Pet actions for pages. Each throws an Error with a friendly message on failure. */
export function usePet() {
  const user = useUserStore()

  /** Onboarding: create the pet, then go home. */
  async function createPet(input: PetCreateInput): Promise<void> {
    try {
      await $fetch<MePet>('/api/pet', { method: 'POST', body: input })
    } catch (error) {
      throw new Error(apiErrorMessage(error), { cause: error })
    }
    await user.refresh()
    await navigateTo('/home')
  }

  return { createPet }
}
