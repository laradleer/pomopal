# PomoPal

Study with a pet. A Pomodoro web app where every finished focus session earns XP and coins, and coins buy accessories for your cat or dog.

Built with Nuxt 4, TypeScript, Tailwind CSS v4, Pinia, Better Auth, PostgreSQL and Drizzle.

## Run locally

Requirements: **Node 24** (see `.nvmrc`) and npm.

```bash
npm ci          # install exact versions from package-lock.json
npm run dev     # http://localhost:3000
```

## Run with Docker

Requirements: Docker with Compose v2.

```bash
cp .env.example .env            # then set POSTGRES_PASSWORD and BETTER_AUTH_SECRET
docker compose up -d --build    # app on http://localhost:3000, Postgres on localhost:5432
docker compose logs -f app      # follow the app logs
docker compose down             # stop (data stays in the pgdata volume)
```

For day-to-day coding, run only the database in Docker and the app with hot reload:

```bash
docker compose up -d db
npm run dev
```

Both ports are bound to `127.0.0.1`, so nothing is exposed to the internet. On the VPS, Nginx forwards the domain to port 3000. `GET /api/health` returns `{ "status": "ok" }` for health checks.

## Scripts

| Script                | What it does                                |
| --------------------- | ------------------------------------------- |
| `npm run dev`         | Start the dev server with hot reload        |
| `npm run build`       | Production build into `.output/`            |
| `npm run preview`     | Run the production build locally            |
| `npm run lint`        | ESLint + Prettier check (CI runs this)      |
| `npm run lint:fix`    | Fix lint errors and format every file       |
| `npm run typecheck`   | Type-check the whole project with `vue-tsc` |
| `npm test`            | Run the unit tests once (Vitest)            |
| `npm run test:watch`  | Run the unit tests in watch mode            |
| `npm run db:generate` | Create a migration from schema changes      |
| `npm run db:migrate`  | Apply pending migrations                    |
| `npm run db:seed`     | Sync the shop items                         |
| `npm run db:studio`   | Browse the database in Drizzle Studio       |

All four checks (`lint`, `typecheck`, `test`, `build`) must pass before a pull request is merged.

## Database

The schema lives in `server/db/schema.ts` (Drizzle, PostgreSQL). **The app applies pending migrations and syncs the shop items by itself on every start**, locally and in Docker, so you normally never run them by hand.

To change the schema:

1. Edit `server/db/schema.ts`.
2. `npm run db:generate -- --name short-description` writes a new SQL file to `server/db/migrations/`.
3. Read the SQL, then commit it together with the schema change.
4. Restart `npm run dev`. The migration is applied on start.

Never edit a migration that is already on `main`; add a new one instead. Shop items are defined in `server/db/shop-items.ts`.

## Project structure

```
app/                Vue side (runs in the browser and during SSR)
  assets/css/       main.css: Tailwind and design tokens
  components/       ui/ base components, feature folders (timer/, pet/, shop/ …)
  composables/      use*.ts: data fetching and shared logic
  layouts/          page frames (top bar, tab bar)
  middleware/       route guards (auth)
  pages/            one file per route
  stores/           Pinia stores: profile, pet, timer
server/             Nitro side (API, never shipped to the browser)
  api/              REST endpoints, thin handlers only
  db/               Drizzle schema, migrations, seed
  services/         business logic; rules/ holds pure game-rule functions
  utils/            auth, db client, shared server helpers
shared/             code used by both sides: zod schemas, types, error codes
docs/               plan, backlog, architecture, design system
```

## Documentation

> **Before your first pull request, read the [coding conventions](docs/05-conventions.md).**
> Most of them are enforced by `npm run lint`.

- [Development plan](docs/01-development-plan.md)
- [GitHub setup and backlog](docs/02-github-setup-and-backlog.md)
- [Architecture](docs/03-architecture.md)
- [Design system](docs/04-design-system.md)
- [Coding conventions](docs/05-conventions.md)
