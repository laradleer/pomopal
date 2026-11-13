/**
 * The signed-in user's pet. A view on useUserStore (filled once from GET /api/me).
 */
export const usePetStore = defineStore('pet', () => {
  const user = useUserStore()

  const pet = computed(() => user.me?.pet ?? null)
  const name = computed(() => pet.value?.name ?? 'Your pet')
  const species = computed(() => pet.value?.species ?? 'cat')
  const mood = computed(() => pet.value?.mood ?? 'neutral')
  /** What the pet wears, shown on it everywhere in the app. */
  const equipped = computed(() => pet.value?.equipped ?? {})

  return { pet, name, species, mood, equipped }
})
