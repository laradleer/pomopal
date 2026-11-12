import { z } from 'zod'

/** Same rule as Better Auth's `minPasswordLength` in server/utils/auth.ts. */
export const PASSWORD_MIN_LENGTH = 8
export const PASSWORD_MAX_LENGTH = 128
export const NAME_MAX_LENGTH = 50

const email = z
  .string()
  .trim()
  .min(1, { error: 'Enter your email.' })
  .pipe(z.email({ error: "That doesn't look like an email address." }))

export const signInSchema = z.object({
  email,
  password: z.string().min(1, { error: 'Enter your password.' }),
})

export const signUpSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { error: 'Tell us what to call you.' })
    .max(NAME_MAX_LENGTH, { error: `Keep it under ${NAME_MAX_LENGTH} characters.` }),
  email,
  password: z
    .string()
    .min(PASSWORD_MIN_LENGTH, { error: `Use at least ${PASSWORD_MIN_LENGTH} characters.` })
    .max(PASSWORD_MAX_LENGTH, { error: `Keep it under ${PASSWORD_MAX_LENGTH} characters.` }),
})

export type SignInInput = z.infer<typeof signInSchema>
export type SignUpInput = z.infer<typeof signUpSchema>
