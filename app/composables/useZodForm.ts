import type { z } from 'zod'

/**
 * Form state validated by a shared zod schema, the same one the API uses.
 *
 *   const { values, errors, formError, pending, submit } = useZodForm(signInSchema, { email: '', password: '' })
 *   <form @submit.prevent="submit(signIn)">
 *
 * - Field errors appear after the first submit, then update while typing.
 * - `submit(action)` runs `action` with the parsed data. If it throws, the error's message
 *   becomes `formError`, so actions should throw friendly messages (see app/utils/error-messages.ts).
 * - `reset(values?)` starts over (e.g. after adding a task, or when a sheet opens): new values,
 *   no errors, and no validation until the next submit.
 */
/** Every field may start empty (e.g. no pet chosen yet); the schema decides what is required. */
type FormValues<Schema extends z.ZodObject> = {
  [Key in keyof z.input<Schema>]: z.input<Schema>[Key] | undefined
}

export function useZodForm<Schema extends z.ZodObject>(
  schema: Schema,
  initial: FormValues<Schema>,
) {
  type Values = FormValues<Schema>
  type FieldErrors = Partial<Record<keyof Values & string, string>>

  const values = ref(structuredClone(initial)) as Ref<Values>
  const errors = ref<FieldErrors>({})
  const formError = ref<string>()
  const pending = ref(false)
  const submitted = ref(false)

  function validate(): z.output<Schema> | undefined {
    const result = schema.safeParse(values.value)
    if (result.success) {
      errors.value = {}
      return result.data
    }
    const next: FieldErrors = {}
    for (const issue of result.error.issues) {
      const field = issue.path[0] as keyof FieldErrors | undefined
      if (field !== undefined && !next[field]) next[field] = issue.message
    }
    errors.value = next
    return undefined
  }

  watch(
    values,
    () => {
      if (submitted.value) validate()
    },
    { deep: true },
  )

  async function submit(action: (data: z.output<Schema>) => Promise<void>): Promise<void> {
    if (pending.value) return
    submitted.value = true
    formError.value = undefined
    const data = validate()
    if (!data) return

    pending.value = true
    try {
      await action(data)
    } catch (error) {
      formError.value = error instanceof Error ? error.message : GENERIC_ERROR_MESSAGE
    } finally {
      pending.value = false
    }
  }

  function reset(next: Values = initial) {
    values.value = structuredClone(next)
    errors.value = {}
    formError.value = undefined
    submitted.value = false
  }

  return { values, errors, formError, pending, submit, reset }
}
