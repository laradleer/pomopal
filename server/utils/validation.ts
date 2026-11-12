import type { H3Event } from 'h3'
import type { z } from 'zod'

/**
 * Validate request input with a shared zod schema. On failure they throw `VALIDATION_FAILED`
 * (400) with the schema's first friendly message, so the client can show it as is.
 *
 *   const input = await readValidBody(event, petCreateSchema)
 */
function parseOrThrow<Schema extends z.ZodType>(schema: Schema, value: unknown): z.output<Schema> {
  const result = schema.safeParse(value)
  if (!result.success) {
    throw apiError('VALIDATION_FAILED', result.error.issues[0]?.message ?? 'Invalid input.')
  }
  return result.data
}

export async function readValidBody<Schema extends z.ZodType>(
  event: H3Event,
  schema: Schema,
): Promise<z.output<Schema>> {
  return parseOrThrow(schema, await readBody(event))
}

export function getValidQuery<Schema extends z.ZodType>(
  event: H3Event,
  schema: Schema,
): z.output<Schema> {
  return parseOrThrow(schema, getQuery(event))
}

export function getValidParams<Schema extends z.ZodType>(
  event: H3Event,
  schema: Schema,
): z.output<Schema> {
  return parseOrThrow(schema, getRouterParams(event))
}
