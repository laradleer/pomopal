# PomoPal — Architecture

How the system is built: stack, structure, data, API and game rules.

## Tech stack

| Layer | Choice | Why |
| --- | --- | --- |
| Language | TypeScript | Both developers know it. Used on frontend and backend. |
| Framework | Nuxt (Vue 3) | Frontend and API in one project. Server-side rendering. Simpler state handling than React. |
| State | Pinia | Shares timer, profile and pet state across pages. |
| Styling | Tailwind CSS | Fast to build. Design tokens go straight into the theme. |
| Auth | Better Auth | Email/password and Google sign-in. Sessions stored in Postgres. Official Nuxt integration. |
| Database | PostgreSQL + Drizzle ORM | Type-safe queries and migrations in TypeScript. |
| 3D (stretch) | TresJS (Three.js for Vue) + GLB models | Accessories attach to the pet's head and neck bones. |
| Hosting | VPS + Docker Compose + Nginx + Certbot | Nginx already runs on the VPS. Certbot gives free HTTPS. |
| CI/CD | GitHub Actions | Checks every PR. Deploys on push to `main`. |

## System overview

```
Browser (phone or laptop)
  Nuxt client: Vue pages, Pinia store, timer clock, pet renderer
        │  HTTPS
        ▼
Nginx on the VPS host   ← HTTPS certificate from Certbot
        │  proxy_pass http://localhost:3000
        ▼
┌───────────── Docker Compose ─────────────┐
│  Nuxt app container                      │
│   • SSR + route middleware (auth)        │
│   • /api server routes + game rules      │
│   • Better Auth                          │
│   • Drizzle ORM                          │
│              │ SQL                       │
│              ▼                           │
│  PostgreSQL container  (volume: pgdata)  │
└──────────────────────────────────────────┘
```

- **Server-side auth redirect:** Nuxt renders pages on the server. Route middleware checks the Better Auth session before any HTML is sent. Logged-out users get a 302 redirect to `/login`, so they never see a protected page, not even for a millisecond.
- **Client-only parts:** the timer clock and the pet (2D or 3D) run in the browser. The 3D pet is wrapped in `<ClientOnly>`.
- **Server owns rewards:** the browser only runs the clock. The server checks real elapsed time before it gives XP or coins. Nobody can give themselves coins from the browser console.

## Folder structure

```
pomopal/
├── app/
│   ├── pages/            # login, signup, onboarding, home, tasks, shop, pet, stats, settings
│   ├── components/       # TimerRing, ModeTabs, StatChip, PetView, ShopItem, TabBar, RewardToast …
│   ├── stores/           # timer.ts, profile.ts, pet.ts
│   ├── middleware/       # auth.global.ts
│   └── assets/           # css, pet drawings, item drawings
├── server/
│   ├── api/              # REST endpoints (see below)
│   ├── db/               # schema.ts, migrations/, seed.ts
│   ├── services/         # rewards.ts, streak.ts, shop.ts
│   └── utils/auth.ts     # Better Auth instance
├── docs/diagrams/
├── Dockerfile
├── docker-compose.yml
└── .env.example
```

## Database tables

| Table | Key columns | Notes |
| --- | --- | --- |
| `user`, `session`, `account`, `verification` | managed by Better Auth | Generated with the Better Auth CLI. |
| `profile` | `user_id`, `display_name`, `xp`, `level`, `coins`, `streak_days`, `last_study_date`, `focus_min`, `short_break_min`, `long_break_min` | One per user. |
| `pet` | `id`, `user_id`, `species` (cat, dog), `name`, `mood` | One per user. |
| `focus_session` | `id`, `user_id`, `task_id?`, `mode` (focus, short, long), `planned_min`, `started_at`, `ended_at`, `status` (running, completed, abandoned), `xp_earned`, `coins_earned` | Rewards stored on the row. |
| `task` | `id`, `user_id`, `title`, `done`, `sessions_count`, `created_at` | |
| `shop_item` | `id`, `name`, `slot` (head, face, neck, background), `price`, `required_level`, `asset_key` | Seeded. |
| `inventory_item` | `id`, `user_id`, `item_id`, `equipped`, `bought_at` | Unique on (`user_id`, `item_id`). |

## Main classes (for the class diagram)

- **User** — id, email, name. Has one Profile and one Pet.
- **Profile** — xp, level, coins, streakDays, timer settings. `addXp()`, `addCoins()`, `spendCoins()`.
- **Pet** (abstract) — name, mood, equippedItems. `setMood()`, `equip()`. **Cat** and **Dog** inherit from it.
- **FocusSession** — mode, plannedMin, startedAt, endedAt, status. `complete()`, `abandon()`, `isValid()`.
- **Task** — title, done, sessionsCount. `markDone()`.
- **ShopItem** — name, slot, price, requiredLevel. `isUnlockedFor(level)`.
- **InventoryItem** — item, equipped, boughtAt.

## API endpoints

| Method and path | What it does |
| --- | --- |
| `/api/auth/*` | Sign up, log in, log out, Google OAuth (Better Auth). |
| `GET /api/me` | Profile, level, XP, coins, streak and pet. |
| `POST /api/pet` | Create the pet during onboarding. |
| `PATCH /api/pet` | Rename the pet. |
| `POST /api/sessions` | Start a session. Server saves `started_at`. |
| `POST /api/sessions/:id/complete` | Check elapsed time. Give XP and coins. Update streak and level. |
| `POST /api/sessions/:id/abandon` | Quit early. Pet becomes sad. No reward. |
| `GET/POST/PATCH/DELETE /api/tasks` | Task create, read, update, delete. |
| `GET /api/shop` | Items with owned, locked and affordable flags. |
| `POST /api/shop/:itemId/buy` | Check level and coins, then buy in one transaction. |
| `POST /api/inventory/:id/equip` | Equip an item. Unequips the other item in that slot. |
| `GET /api/stats?range=week` | Focus minutes and sessions per day. |
| `PATCH /api/settings` | Save timer lengths. |

## Game rules (first version)

- **XP:** +1 XP per planned focus minute (25 XP for a 25-minute session). Breaks give nothing.
- **Coins:** +10 coins per completed focus session.
- **Valid session:** counts only if `now − started_at ≥ planned_min − 30 seconds`.
- **Levels:** going from level n to n+1 needs 100 × n XP. Level-up bonus: +50 coins.
- **Streak:** +1 on the first completed focus session of a new day. Resets to 1 if a day was skipped.
- **Pet mood:** happy after a completed session, sleepy during breaks, sad after quitting early, neutral otherwise.
- **Cycle:** after 4 focus sessions, the next break is a long break.

## Timer states (for the state machine diagram)

| From | Event | To |
| --- | --- | --- |
| Idle | start | Focusing |
| Focusing | pause | Paused |
| Paused | resume | Focusing |
| Focusing / Paused | quit | Idle (session abandoned) |
| Focusing | time up, sessions < 4 | ShortBreak |
| Focusing | time up, 4th session | LongBreak |
| ShortBreak / LongBreak | time up or skip | Idle |

## Deployment

1. Nginx on the VPS host listens on 443 and forwards the domain to `localhost:3000`.
2. Certbot gets and renews the HTTPS certificate.
3. Docker Compose runs two containers: `app` (Nuxt, port 3000) and `db` (PostgreSQL, volume `pgdata`).
4. Migrations run when the app container starts.
5. GitHub Actions deploys on push to `main`: SSH → `git pull` → `docker compose up -d --build`.

## Environment variables

```
DATABASE_URL=postgres://pomopal:password@db:5432/pomopal
BETTER_AUTH_SECRET=change-me
BETTER_AUTH_URL=https://your-domain.com
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```
