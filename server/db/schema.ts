// Files in server/db use relative imports (no `~~` or `#shared`): drizzle-kit and the
// db CLI load them outside Nuxt, where those aliases don't exist.
import { relations, sql } from 'drizzle-orm'
import type { SQL } from 'drizzle-orm'
import {
  boolean,
  check,
  date,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core'
import type { AnyPgColumn } from 'drizzle-orm/pg-core'
import {
  ITEM_SLOTS,
  PET_MOODS,
  PET_NAME_MAX_LENGTH,
  PET_SPECIES,
  SESSION_MODES,
  SESSION_STATUSES,
  TASK_TITLE_MAX_LENGTH,
  TIMER_LIMITS,
} from '../../shared/constants'
import { user } from './auth-schema'

export * from './auth-schema'

// Column names are snake_case in Postgres and camelCase in TypeScript (`casing: 'snake_case'`).

// ---------- Enums ----------

export const petSpecies = pgEnum('pet_species', PET_SPECIES)
export const petMood = pgEnum('pet_mood', PET_MOODS)
export const sessionMode = pgEnum('session_mode', SESSION_MODES)
export const sessionStatus = pgEnum('session_status', SESSION_STATUSES)
export const itemSlot = pgEnum('item_slot', ITEM_SLOTS)

// ---------- Shared column helpers ----------

/** The owning user. Deleting a user deletes all their rows. */
const ownerId = () =>
  text()
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' })

const createdAt = () => timestamp({ withTimezone: true }).notNull().defaultNow()

/** `value BETWEEN min AND max` with literal numbers (check constraints can't use parameters). */
const between = (value: AnyPgColumn | SQL, range: { min: number; max: number }): SQL =>
  sql`${value} between ${sql.raw(String(range.min))} and ${sql.raw(String(range.max))}`

// ---------- Tables ----------

/** Game progress and timer settings. Exactly one per user. */
export const profile = pgTable(
  'profile',
  {
    userId: ownerId().primaryKey(),
    displayName: text(),
    xp: integer().notNull().default(0),
    level: integer().notNull().default(1),
    coins: integer().notNull().default(0),
    streakDays: integer().notNull().default(0),
    lastStudyDate: date({ mode: 'string' }),
    focusMin: integer().notNull().default(TIMER_LIMITS.focus.default),
    shortBreakMin: integer().notNull().default(TIMER_LIMITS.shortBreak.default),
    longBreakMin: integer().notNull().default(TIMER_LIMITS.longBreak.default),
    createdAt: createdAt(),
  },
  (t) => [
    check('profile_xp_not_negative', sql`${t.xp} >= 0`),
    check('profile_level_at_least_1', sql`${t.level} >= 1`),
    check('profile_coins_not_negative', sql`${t.coins} >= 0`),
    check('profile_streak_not_negative', sql`${t.streakDays} >= 0`),
    check('profile_focus_min_range', between(t.focusMin, TIMER_LIMITS.focus)),
    check('profile_short_break_min_range', between(t.shortBreakMin, TIMER_LIMITS.shortBreak)),
    check('profile_long_break_min_range', between(t.longBreakMin, TIMER_LIMITS.longBreak)),
  ],
)

/** The student's cat or dog. Exactly one per user, created during onboarding. */
export const pet = pgTable(
  'pet',
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    userId: ownerId().unique('pet_user_id_unique'),
    species: petSpecies().notNull(),
    name: text().notNull(),
    mood: petMood().notNull().default('neutral'),
    createdAt: createdAt(),
  },
  (t) => [
    check(
      'pet_name_length',
      between(sql`char_length(${t.name})`, { min: 1, max: PET_NAME_MAX_LENGTH }),
    ),
  ],
)

export const task = pgTable(
  'task',
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    userId: ownerId(),
    title: text().notNull(),
    done: boolean().notNull().default(false),
    sessionsCount: integer().notNull().default(0),
    createdAt: createdAt(),
  },
  (t) => [
    index('task_user_created_idx').on(t.userId, t.createdAt),
    check(
      'task_title_length',
      between(sql`char_length(${t.title})`, { min: 1, max: TASK_TITLE_MAX_LENGTH }),
    ),
    check('task_sessions_count_not_negative', sql`${t.sessionsCount} >= 0`),
  ],
)

/** One focus session or break. Rewards are stored on the row when it completes. */
export const focusSession = pgTable(
  'focus_session',
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    userId: ownerId(),
    taskId: integer().references(() => task.id, { onDelete: 'set null' }),
    mode: sessionMode().notNull(),
    plannedMin: integer().notNull(),
    startedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    endedAt: timestamp({ withTimezone: true }),
    status: sessionStatus().notNull().default('running'),
    xpEarned: integer().notNull().default(0),
    coinsEarned: integer().notNull().default(0),
  },
  (t) => [
    index('focus_session_user_started_idx').on(t.userId, t.startedAt),
    // At most one running session per user, enforced by the database.
    uniqueIndex('focus_session_one_running_per_user')
      .on(t.userId)
      .where(sql`status = 'running'`),
    check('focus_session_planned_min_positive', sql`${t.plannedMin} > 0`),
    check('focus_session_rewards_not_negative', sql`${t.xpEarned} >= 0 and ${t.coinsEarned} >= 0`),
    check(
      'focus_session_ends_after_start',
      sql`${t.endedAt} is null or ${t.endedAt} >= ${t.startedAt}`,
    ),
  ],
)

/** Items for sale. Reference data, kept in sync by server/db/seed.ts. */
export const shopItem = pgTable(
  'shop_item',
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    assetKey: text().notNull().unique('shop_item_asset_key_unique'),
    name: text().notNull(),
    slot: itemSlot().notNull(),
    price: integer().notNull(),
    requiredLevel: integer().notNull().default(1),
  },
  (t) => [
    check('shop_item_price_not_negative', sql`${t.price} >= 0`),
    check('shop_item_required_level_at_least_1', sql`${t.requiredLevel} >= 1`),
  ],
)

/** Items a user owns. Each item can be owned once. */
export const inventoryItem = pgTable(
  'inventory_item',
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    userId: ownerId(),
    itemId: integer()
      .notNull()
      .references(() => shopItem.id, { onDelete: 'restrict' }),
    equipped: boolean().notNull().default(false),
    boughtAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex('inventory_item_user_item_unique').on(t.userId, t.itemId)],
)

// ---------- Relations (for db.query.…({ with })) ----------

export const userRelations = relations(user, ({ one, many }) => ({
  profile: one(profile),
  pet: one(pet),
  tasks: many(task),
  sessions: many(focusSession),
  inventory: many(inventoryItem),
}))

export const profileRelations = relations(profile, ({ one }) => ({
  user: one(user, { fields: [profile.userId], references: [user.id] }),
}))

export const petRelations = relations(pet, ({ one }) => ({
  user: one(user, { fields: [pet.userId], references: [user.id] }),
}))

export const taskRelations = relations(task, ({ one, many }) => ({
  user: one(user, { fields: [task.userId], references: [user.id] }),
  sessions: many(focusSession),
}))

export const focusSessionRelations = relations(focusSession, ({ one }) => ({
  user: one(user, { fields: [focusSession.userId], references: [user.id] }),
  task: one(task, { fields: [focusSession.taskId], references: [task.id] }),
}))

export const shopItemRelations = relations(shopItem, ({ many }) => ({
  owners: many(inventoryItem),
}))

export const inventoryItemRelations = relations(inventoryItem, ({ one }) => ({
  user: one(user, { fields: [inventoryItem.userId], references: [user.id] }),
  item: one(shopItem, { fields: [inventoryItem.itemId], references: [shopItem.id] }),
}))

// ---------- Row types ----------

export type User = typeof user.$inferSelect
export type Profile = typeof profile.$inferSelect
export type Pet = typeof pet.$inferSelect
export type Task = typeof task.$inferSelect
export type FocusSession = typeof focusSession.$inferSelect
export type ShopItem = typeof shopItem.$inferSelect
export type NewShopItem = typeof shopItem.$inferInsert
export type InventoryItem = typeof inventoryItem.$inferSelect
