# PomoPal — Coding Conventions

How we write code, so the project reads like one person wrote it.
Read this before your first pull request. If a rule is wrong or missing, change this file in a PR. Don't just break the rule.

Rules marked 🔒 are enforced by ESLint (`npm run lint`), so CI fails if you break them.

## Golden rules

1. **Every layer has one job.** Handlers handle HTTP, services do the work, rules do the maths.
2. **One pattern per problem.** Before writing something new, find the existing example of that layer and copy its shape.
3. **The server owns the truth.** The browser shows state and runs the clock. XP, coins, levels and purchases are decided on the server.
4. **Design tokens only.** No hex colours, no default Tailwind palette, no one-off styles.
5. **Small PRs, one issue each.** If a PR does two things, split it.

## Where things go

| I am adding…                         | It goes in                              | Example                             |
| ------------------------------------ | --------------------------------------- | ----------------------------------- |
| An API endpoint                      | `server/api/<resource>/…<method>.ts`    | `server/api/shop/[itemId]/buy.post.ts` |
| Business logic that touches the DB   | `server/services/<domain>.ts`           | `server/services/shop.ts`           |
| A game rule (pure calculation)       | `server/services/rules/<topic>.ts`      | `server/services/rules/session.ts`  |
| A server helper used by many routes  | `server/utils/` (auto-imported)         | `requireUser`, `useDb`, `apiError`  |
| A request/response shape             | `shared/schemas/<domain>.ts` (zod)      | `shared/schemas/pet.ts`             |
| A type used on both sides            | `shared/types/<domain>.ts`              | `shared/types/shop.ts`              |
| An error code                        | `shared/errors.ts`                      | `NOT_ENOUGH_COINS`                  |
| A constant or list used on both sides | `shared/constants.ts`                  | `PET_SPECIES`, `TIMER_LIMITS`       |
| A table or column                    | `server/db/schema.ts`, then `npm run db:generate` | `shop_item.price`        |
| A page                               | `app/pages/<route>.vue`                 | `app/pages/shop.vue`                |
| A base building block                | `app/components/ui/<Name>.vue`          | `ui/Button.vue` → `<UiButton>`      |
| A feature component                  | `app/components/<feature>/<Name>.vue`   | `timer/Ring.vue` → `<TimerRing>`    |
| Data loading + actions for a feature | `app/composables/use<Feature>.ts`       | `useShop()`                         |
| State shared by many pages           | `app/stores/<domain>.ts` (Pinia)        | `profile`, `pet`, `timer`           |
| A unit test                          | next to the file, `<name>.test.ts`      | `rules/session.test.ts`             |
| Pure browser logic worth testing (a state machine, a calculation) | `shared/<name>.ts`, used by the store | `shared/timer.ts` |

Nuxt names components after their folder, so don't repeat it in the file name: `components/timer/Ring.vue`, not `components/timer/TimerRing.vue`.

---

## Server

### Request flow

```
handler (server/api)  →  service (server/services)  →  rules (server/services/rules)
   auth + validate          DB + transactions             pure maths, no I/O
```

### Handlers: thin

A handler does four things: check the user, validate the input, call **one** service function, return its result.

```ts
// server/api/shop/[itemId]/buy.post.ts
import { buyItemParams } from '#shared/schemas/shop'
import { buyItem } from '~~/server/services/shop'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const { itemId } = getValidParams(event, buyItemParams)
  return buyItem(user.id, itemId)
})
```

- 🔒 No `drizzle-orm` imports and no `useDb()` in `server/api`.
- File names follow Nuxt: `index.get.ts`, `index.post.ts`, `[id].patch.ts`, `[id]/complete.post.ts`.
- Validate **every** input (body, query, params) with a zod schema from `shared/schemas` via `readValidBody`, `getValidQuery` or `getValidParams` (`server/utils/validation.ts`). They answer `VALIDATION_FAILED` with the schema's friendly message. Don't use h3's `readValidatedBody` directly: its errors have no code.
- Creating a row that may exist only once? Use one atomic `insert … onConflictDoNothing().returning()` and throw the conflict code when nothing came back (see `createPet`), instead of "check, then insert".
- **Auth:** `requireUser(event)` for routes that need a user, `getAuthSession(event)` when signed-out is allowed. Both look the session up once per request. Never read the auth cookie yourself.
- **Imports** use aliases: `~~/server/…` for server code, `#shared/…` for shared code. The only exception is `server/db` (see Database).

### Services: the work

Services are plain exported `async` functions. They take simple values (ids, validated input), not the `event`.

```ts
// server/services/shop.ts
export async function buyItem(userId: string, itemId: number): Promise<BuyResult> {
  return useDb().transaction(async (tx) => {
    const item = await tx.query.shopItem.findFirst({ where: eq(shopItem.id, itemId) })
    if (!item) throw apiError('NOT_FOUND')

    const check = canBuy(item, await getProfile(tx, userId)) // pure rule
    if (!check.ok) throw apiError(check.code)

    // … subtract coins, insert inventory row …
    return { coins: newBalance }
  })
}
```

- Any write that changes **coins, XP, level, streak or inventory** runs inside `db.transaction`.
- Coin changes are one atomic `UPDATE … SET coins = coins - price WHERE coins >= price`. Never read the balance, subtract in JS, then write it back.
- When a request acts on a row's current state (complete a running session, equip an item), **lock the row** in the transaction with `.for('update')` first, like `lockRunningSession` in `server/services/sessions.ts`. Two identical requests at once then get one success and one 409.
- Services take `now: Date` from the handler instead of calling `new Date()` themselves, and pass it on to the rules.
- Every query filters by `userId`. A user can never read or change another user's rows. If the row isn't theirs, answer `NOT_FOUND`, not `FORBIDDEN`.
- Return plain typed objects. Never return a whole user or auth row.

### Rules: pure functions

Game rules are plain functions with no database, no HTTP and no hidden clock. They are easy to test and easy to show in the report.

```ts
// server/services/rules/session.ts
export const SESSION_GRACE_MS = 30_000

export function isSessionValid(startedAt: Date, plannedMin: number, now: Date): boolean {
  return now.getTime() - startedAt.getTime() >= plannedMin * 60_000 - SESSION_GRACE_MS
}
```

```ts
// server/services/rules/session.test.ts
describe('isSessionValid', () => {
  it('accepts a session that ends 30 seconds early', () => {
    const start = new Date('2026-11-15T10:00:00Z')
    expect(isSessionValid(start, 25, new Date('2026-11-15T10:24:30Z'))).toBe(true)
  })
})
```

- 🔒 No database, `h3` or `~~/server` imports, and no `apiError` or `createError` in `rules/`. Return a result and let the service throw.
- 🔒 No `Date.now()` or `new Date()`. Pass `now` in as a parameter.
- Every rule has tests next to it. Name tests after the behaviour ("resets to 1 after a skipped day").
- Numbers from the game rules (`10` coins, `100 × n` XP, `30 s`) are named constants at the top of the rule file.

### Errors

All error codes live in `shared/errors.ts`, together with their HTTP status. Throw them with `apiError`:

```ts
throw apiError('NOT_ENOUGH_COINS')
```

- Statuses: **401/403/404** for who you are and what you can see, **409** when something already exists or is in the wrong state, **422** when a game rule says no.
- Need a new error? Add the code to `shared/errors.ts` in the same PR. Never invent a string inline.
- The client reads the code with `getErrorCode(error)` and shows a friendly pet message. The user never sees raw server text.

### Database

- Tables and columns are `snake_case` in Postgres and `camelCase` in TypeScript. Drizzle maps them (`casing: 'snake_case'`).
- Get types from the schema (`typeof shopItem.$inferSelect`, or the exported `ShopItem`, `Profile` …) instead of writing them by hand.
- Enum values and limits come from `shared/constants.ts`, so the database, zod schemas and UI always agree.
- Rules that protect money and fairness are also database constraints: coins and XP can't go below zero, one running session per user, each item owned once. The service checks first to give a friendly error; the constraint is the safety net.
- Services that may run inside a transaction take a `DbOrTx` parameter (`server/db/client.ts`).
- Files in `server/db` use **relative imports** (`../../shared/constants`), not `~~` or `#shared`: drizzle-kit and the db CLI load them outside Nuxt.
- Never edit a migration that is already on `main`. Change the schema and generate a new one.
- Seeds are idempotent: running them twice changes nothing.

---

## Client

### Pages: composition only

A page sets its meta, calls composables or stores, and arranges components. No business logic, no direct fetching.

**Who may open a page** is declared once, with `definePageMeta({ auth })`, and enforced by `app/middleware/auth.global.ts` (on the server for the first request, so nothing flashes):

| `auth`         | Who can open it                    | Others go to                 |
| -------------- | ---------------------------------- | ---------------------------- |
| _(not set)_    | signed in, with a pet              | `/login` or `/onboarding`    |
| `'onboarding'` | signed in, without a pet yet       | `/login` or `/home`          |
| `'guest'`      | signed out (login, sign-up)        | `/home` or `/onboarding`     |
| `false`        | anyone                             | —                            |

The signed-in user, profile and pet live in `useUserStore()` (from `GET /api/me`). Call `refresh()` after something changes them.

```vue
<!-- app/pages/shop.vue -->
<script setup lang="ts">
const { items, buy, pending } = await useShop()
</script>

<template>
  <ShopGrid :items="items" :loading="pending" @buy="buy" />
</template>
```

- 🔒 `$fetch`, `useFetch` and `useAsyncData` are not allowed in `app/pages`, `app/components` or `app/layouts`.

### Composables: data and actions for one feature

```ts
// app/composables/useShop.ts
export async function useShop() {
  const profile = useProfileStore()
  const { data: items, pending, refresh } = await useFetch('/api/shop', { default: () => [] })

  async function buy(itemId: number) {
    const result = await $fetch(`/api/shop/${itemId}/buy`, { method: 'POST' })
    profile.setCoins(result.coins)
    await refresh()
  }

  return { items, pending, buy }
}
```

- One composable per feature: `useShop`, `useTasks`, `useStats`, `useSessions`.
- It returns refs and functions, never raw promises for the template to unwrap.
- Errors: catch only where you can show something useful. `apiErrorMessage(error)` (`app/utils/error-messages.ts`) turns an API error into the friendly text; every error code needs a message there.
- **Forms** use `useZodForm(schema, initialValues)` with the same zod schema as the API. Its `submit(action)` shows field errors, and any error the action throws becomes `formError` (show it with `<UiAlert>`).

### Stores: shared state only

Use Pinia **only** for state that several pages need and that must survive navigation: `profile` (XP, level, coins, streak), `pet` (species, mood, equipped items), `timer` (mode, phase, end time).

`user` holds the `GET /api/me` response and is the **single source of truth**. `profile` and `pet` are read-only views on it (`computed`), so they can never disagree. After the server changes something, call `useUserStore().refresh()` instead of patching copies.

```ts
// app/stores/profile.ts
export const useProfileStore = defineStore('profile', () => {
  const coins = ref(0)
  const level = ref(1)

  const canAfford = (price: number) => coins.value >= price

  function setCoins(value: number) {
    coins.value = value
  }

  return { coins, level, canAfford, setCoins }
})
```

- Always the **setup** syntax shown above: refs for state, `computed` or functions for getters, functions for actions.
- Change store state only through actions, never `store.coins = 5` from a component.
- Data used by one page lives in that page's composable, not in a store.

### Components

```vue
<!-- app/components/ui/Button.vue -->
<script setup lang="ts">
const props = withDefaults(defineProps<{ variant?: 'primary' | 'leaf' | 'grape' | 'outline' | 'ink'; loading?: boolean }>(), {
  variant: 'primary',
  loading: false,
})
const emit = defineEmits<{ click: [event: MouseEvent] }>()
</script>

<template>…</template>
```

- 🔒 `<script setup lang="ts">` only, in the order `script → template → style`.
- 🔒 Typed `defineProps<…>()` and `defineEmits<…>()`. Use `defineModel()` for `v-model`.
- 🔒 Components are written in PascalCase in templates: `<UiButton>`, not `<ui-button>`.
- Build screens from `Ui*` components first. If a `Ui*` component is missing something, extend it there instead of styling around it. All of them are shown on `/dev/ui`.
- Confirmations use `<UiSheet>`, short messages use `useToast().show()`, icons use `<UiIcon name="…">` (Lucide names). Never `alert()`, `confirm()` or a raw `<svg>` icon.
- Components get data through props and report changes through events. Only feature components may read a store.
- Every interactive element is reachable by keyboard and shows the focus ring.

---

## Styling

- Use Tailwind utilities with **design tokens only**: `bg-tomato`, `text-ink-muted`, `rounded-lg`, `text-heading`. The default Tailwind palette is switched off in #4, so `bg-red-500` won't exist.
- 🔒 No arbitrary colours (`bg-[#c93a24]`, `text-[rgb(…)]`) and no static `style="…"`. Dynamic values (`:style="{ '--progress': p }"`) are fine.
- `<style scoped>` only for what Tailwind can't express: keyframes, SVG details, complex animations. Colours inside it use `var(--token)`.
- Mobile-first: the base classes are for the phone, `md:` and up for desktop.
- Anything that should feel pressable gets `pressable edge-<token>` (for example `pressable edge-tomato-edge`): the 4px edge that sinks on press. `UiButton` already does this.
- Class order is sorted by Prettier automatically. Don't fight it.
- Motion respects `prefers-reduced-motion` (`motion-safe:` / `motion-reduce:`).

## TypeScript

- `strict` is on. 🔒 No `any`: use `unknown` and narrow it.
- 🔒 Type-only imports use `import type`.
- Get types from zod (`z.infer<typeof schema>`) and Drizzle (`$inferSelect`) instead of hand-writing duplicates.
- Prefer named exports. The only default exports are the ones Nuxt requires (handlers, pages, config).
- Auto-imported names must be unique across `app/` and `server/`: typecheck sees both. The server has `useAuth()` (Better Auth), so the browser composable is `useAuthActions()`.
- No commented-out code and no `console.log` in a PR (🔒 warned). Delete it; Git remembers.

## Naming

| Thing                       | Style                 | Example                        |
| --------------------------- | --------------------- | ------------------------------ |
| Database tables and columns | `snake_case`          | `focus_session.planned_min`    |
| Variables and functions     | `camelCase`           | `plannedMin`, `isSessionValid` |
| Booleans                    | `is/has/can` prefix   | `isLocked`, `canAfford`        |
| Types                       | `PascalCase`          | `BuyResult`, `PetMood`         |
| Constants from game rules   | `UPPER_SNAKE_CASE`    | `COINS_PER_SESSION`            |
| Vue components              | `PascalCase` files    | `ui/Button.vue`, `pet/View.vue`|
| Composables                 | `useXxx.ts`           | `useShop.ts`                   |
| Pages, routes, other files  | `kebab-case`          | `pages/sign-up.vue`            |
| Error codes                 | `UPPER_SNAKE_CASE`    | `LEVEL_TOO_LOW`                |

## Tests

- `npm test` runs every `*.test.ts` in `server/` and `shared/` with Vitest, in plain Node (no Nuxt boot).
- Every function in `server/services/rules/` has tests. Any other pure helper in `shared/` should too.
- A bug fix comes with a test that fails without the fix, whenever the code is testable.

## Git and pull requests

- **Branch:** `feat/<issue>-short-name`, `fix/<issue>-short-name`, `docs/<issue>-short-name`.
- **Commits:** Conventional Commits: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`.
- **Pull request:** one issue per PR, `Closes #<issue>` in the description, reviewed and approved by the teammate.
- **Before you ask for review:** `npm run lint`, `npm run typecheck`, `npm test` and `npm run build` all pass, and you checked the page at 375px and 1280px.
- **As a reviewer**, check against this file first. "This doesn't follow the conventions" is a valid review comment.
