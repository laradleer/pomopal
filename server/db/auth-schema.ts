import { boolean, pgTable, text, timestamp } from 'drizzle-orm/pg-core'

/**
 * Better Auth tables.
 *
 * Only `user` exists for now, so the app tables can reference it. #9 adds `session`,
 * `account` and `verification` with the Better Auth CLI; keep `user` compatible with its output.
 */
export const user = pgTable('user', {
  id: text().primaryKey(),
  name: text().notNull(),
  email: text().notNull().unique(),
  emailVerified: boolean().notNull().default(false),
  image: text(),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
})
