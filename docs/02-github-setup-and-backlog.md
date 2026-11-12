# PomoPal — GitHub Setup and Backlog

How to set up the repository, the project board, and every issue in the backlog.

---

## 1. Repository

- **Name:** `pomopal`
- **Default branch:** `main`, protected.
  - Changes only through pull requests.
  - 1 approval required (from your teammate).
  - CI must pass before merging.
- **Files to add first:** `README.md`, `.gitignore` (Node), `.env.example`, `LICENSE` (MIT).

## 2. Branches and commits

- **Branch names:** `feat/<issue>-short-name`, `fix/<issue>-short-name`, `docs/<issue>-short-name`.
  - Example: `feat/21-session-api`
- **Commit messages** follow Conventional Commits:
  - `feat: add session complete endpoint`
  - `fix: stop timer from going below zero`
  - `docs: add class diagram`
  - `chore: update dependencies`
  - `refactor: move reward rules to a service`
- **Pull requests** close their issue in the description: `Closes #21`.

## 3. Labels

| Label | Colour | Use for |
| --- | --- | --- |
| `epic` | `#6d3ef0` | A parent issue that groups others |
| `frontend` | `#1c6cc8` | Vue pages, components, styles |
| `backend` | `#267d18` | API routes, game rules, auth |
| `database` | `#7a5a00` | Schema, migrations, seed data |
| `devops` | `#2b2825` | Docker, Nginx, CI, deploy |
| `design` | `#ff7a5c` | Diagrams, wireframes, UI design |
| `docs` | `#a8a097` | Report, README, documentation |
| `bug` | `#c2185b` | Something is broken |
| `stretch` | `#e7e3de` | Only if there is time after the MVP |
| `priority:high` | `#c93a24` | Blocks other work |

Create them with the GitHub CLI:

```bash
gh label create epic          --color 6d3ef0 --description "Groups related issues"
gh label create frontend      --color 1c6cc8 --description "Vue pages, components, styles"
gh label create backend       --color 267d18 --description "API routes, game rules, auth"
gh label create database      --color 7a5a00 --description "Schema, migrations, seed data"
gh label create devops        --color 2b2825 --description "Docker, Nginx, CI, deploy"
gh label create design        --color ff7a5c --description "Diagrams, wireframes, UI"
gh label create docs          --color a8a097 --description "Report and documentation"
gh label create bug           --color c2185b --description "Something is broken" --force
gh label create stretch       --color e7e3de --description "Only after the MVP works"
gh label create priority:high --color c93a24 --description "Blocks other work"
```

## 4. Milestones

| Milestone | Due | Goal |
| --- | --- | --- |
| M1 Design and diagrams | 2026-11-12 | All UML diagrams and wireframes submitted |
| M2 Foundation | 2026-11-14 | Sign up, pick a pet, see the home screen on the live URL |
| M3 Core features | 2026-11-17 | Study → reward → shop loop works end to end |
| M4 Polish and delivery | 2026-11-19 | Stats, polish, final deploy, report and slides |

Create them with the GitHub CLI (replace `OWNER`):

```bash
for m in "M1 Design and diagrams|2026-11-12" "M2 Foundation|2026-11-14" \
         "M3 Core features|2026-11-17" "M4 Polish and delivery|2026-11-19"; do
  title="${m%%|*}"; due="${m##*|}"
  gh api repos/OWNER/pomopal/milestones -f title="$title" -f due_on="${due}T20:00:00Z"
done
```

## 5. Project board

Create a GitHub Project (new Projects, **Board** view) called **PomoPal**.

- **Columns (Status field):** Backlog → To do → In progress → In review → Done
- **Extra fields:**
  - `Size`: S (under 2 hours), M (half a day), L (a full day)
  - `Owner`: A or B
- **Automation:** new issues go to Backlog; merged PRs move their issue to Done.
- **Rule:** each person has at most 2 issues in "In progress" at a time.

## 6. Issue templates

Save these in `.github/ISSUE_TEMPLATE/`.

**`feature.md`**

```markdown
---
name: Feature
about: A user story for the backlog
labels: []
---

**User story**
As a student, I want … so that …

**Acceptance criteria**
- [ ] …
- [ ] …

**Notes**
Design, API or diagram links.
```

**`bug.md`**

```markdown
---
name: Bug
about: Something is broken
labels: [bug]
---

**Steps to reproduce**
1. …

**Expected**
…

**Actual**
…

**Device / browser**
…
```

## 7. CI and deploy workflows

- **`.github/workflows/ci.yml`** — runs on every pull request: install, `lint`, `typecheck`, `nuxt build`.
- **`.github/workflows/deploy.yml`** — runs on push to `main`: SSH into the VPS, `git pull`, `docker compose up -d --build`.
- Store the VPS host, user and SSH key as repository secrets: `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`.

---

## 8. Backlog

38 issues in 13 epics. A = backend/database/devops, B = frontend/pet/design.

### Summary

| # | Epic | Issue | Milestone | Labels | Size | Owner |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Design | Use case diagram | M1 | design, docs | M | A |
| 2 | Design | Class diagram | M1 | design, docs | M | B |
| 3 | Design | Sequence diagram: complete a focus session | M1 | design, docs | S | A |
| 4 | Design | Sequence diagram: buy and equip an item | M1 | design, docs | S | B |
| 5 | Design | Activity diagram: one Pomodoro cycle | M1 | design, docs | S | B |
| 6 | Design | State machine diagram: timer | M1 | design, docs | S | A |
| 7 | Design | Component and deployment diagrams | M1 | design, docs | S | A |
| 8 | Design | Wireframes for the main screens | M1 | design | M | B |
| 9 | Setup | Repo, board, milestones, labels, templates | M2 | devops | S | A |
| 10 | Setup | Scaffold Nuxt + TypeScript + Tailwind + Pinia | M2 | frontend | S | B |
| 11 | Setup | Tailwind theme from design tokens + fonts | M2 | frontend, design | S | B |
| 12 | Setup | Docker Compose: app + PostgreSQL | M2 | devops | M | A |
| 13 | Setup | Drizzle schema, migrations, shop seed | M2 | database | M | A |
| 14 | Setup | Nginx server block + Certbot HTTPS | M2 | devops | S | A |
| 15 | Setup | CI workflow | M2 | devops | S | A |
| 16 | Auth | Better Auth: email/password + Google | M2 | backend | M | A |
| 17 | Auth | Login and sign-up pages | M2 | frontend | M | B |
| 18 | Auth | Server-side auth redirect middleware | M2 | backend, frontend | S | A |
| 19 | Onboarding | Choose and name your pet | M2 | frontend, backend | M | B |
| 20 | Timer | Timer store and ring UI | M3 | frontend, priority:high | L | B |
| 21 | Timer | Session API with time check | M3 | backend, priority:high | M | A |
| 22 | Timer | Timer settings | M3 | frontend, backend | S | B |
| 23 | Rewards | XP, levels and coins rules | M3 | backend, priority:high | M | A |
| 24 | Rewards | Top bar chips, XP bar, reward toast | M3 | frontend | M | B |
| 25 | Rewards | Study streak | M3 | backend | S | A |
| 26 | Pet | Pet component with moods (2D) | M3 | frontend | L | B |
| 27 | Pet | 3D pet spike (max 1 day) | M3 | frontend, stretch | M | B |
| 28 | Shop | Shop API with buy transaction | M3 | backend | M | A |
| 29 | Shop | Shop page | M3 | frontend | M | B |
| 30 | Shop | Inventory and equip | M3 | frontend, backend | M | B |
| 31 | Tasks | Task list (API + UI) | M3 | frontend, backend | M | A |
| 32 | Stats | Statistics page | M4 | frontend, backend | M | A |
| 33 | Polish | Responsive pass, empty states, dark mode | M4 | frontend | M | B |
| 34 | Polish | Achievements | M4 | stretch | M | A |
| 35 | Polish | Installable PWA | M4 | frontend, stretch | S | B |
| 36 | QA | Tests for game rules + manual test plan | M4 | backend | M | A |
| 37 | Delivery | Final deploy + demo account | M4 | devops | S | A |
| 38 | Delivery | Report and presentation | M4 | docs | L | A + B |

### Epics

Create these as issues with the `epic` label. Link each child issue to its epic using a task list or sub-issues.

- **Design** — all UML diagrams and wireframes.
- **Setup** — repository, project, server, database, CI.
- **Auth** — sign up, log in, protected pages.
- **Onboarding** — first-time pet choice.
- **Timer** — the Pomodoro timer and sessions.
- **Rewards** — XP, levels, coins, streak.
- **Pet** — the pet and its moods.
- **Shop** — buying, inventory and equipping items.
- **Tasks** — the task list.
- **Stats** — daily and weekly statistics.
- **Polish** — UI quality and stretch features.
- **QA** — testing.
- **Delivery** — final deploy, report and presentation.

---

### Issue details

Copy each block into a new issue.

#### M1 — Design and diagrams

**#1 Use case diagram** · `design` `docs` · M · A
As a team, we want a use case diagram so that the system's features are clear.
- [ ] Actors: Student, Google (OAuth provider).
- [ ] Use cases: sign up, log in, choose pet, start/pause/quit session, manage tasks, buy item, equip item, view stats, change settings.
- [ ] Exported as PNG and added to `docs/diagrams/`.

**#2 Class diagram** · `design` `docs` · M · B
As a team, we want a class diagram so that the code structure matches the design.
- [ ] Classes: User, Profile, Pet, Cat, Dog, FocusSession, Task, ShopItem, InventoryItem.
- [ ] Cat and Dog inherit from Pet. User has one Profile and one Pet.
- [ ] Attributes and main methods shown; names match `03-architecture.md`.

**#3 Sequence diagram: complete a focus session** · `design` `docs` · S · A
As a team, we want to show how a session is rewarded so that the anti-cheat rule is clear.
- [ ] Browser → `POST /api/sessions` → database stores `started_at`.
- [ ] Browser → `POST /api/sessions/:id/complete` → server checks time → updates XP, coins, level → returns rewards.

**#4 Sequence diagram: buy and equip an item** · `design` `docs` · S · B
As a team, we want to show the shop flow step by step.
- [ ] Buy: check level → check coins → subtract coins → add inventory item (one transaction).
- [ ] Equip: unequip the item in the same slot → equip the new one.

**#5 Activity diagram: one Pomodoro cycle** · `design` `docs` · S · B
As a team, we want an activity diagram of the study cycle.
- [ ] 4 focus sessions with short breaks, then a long break.
- [ ] Decision points: quit early? session complete? 4th session?

**#6 State machine diagram: timer** · `design` `docs` · S · A
As a team, we want the timer's states documented.
- [ ] States: Idle, Focusing, Paused, ShortBreak, LongBreak.
- [ ] Transitions: start, pause, resume, quit, time up, skip break.

**#7 Component and deployment diagrams** · `design` `docs` · S · A
As a team, we want to show how the system is built and hosted.
- [ ] Components: Vue frontend, API routes, Better Auth, game rules, Drizzle, PostgreSQL.
- [ ] Deployment: VPS → Nginx (host) → Docker: Nuxt app container + PostgreSQL container.

**#8 Wireframes for the main screens** · `design` · M · B
As a team, we want wireframes so that we build the same screens.
- [ ] Screens: login, onboarding, home/timer, shop, pet/inventory, stats.
- [ ] Mobile-first layouts following the design system.

#### M2 — Foundation

**#9 Repo, board, milestones, labels, templates** · `devops` · S · A
- [ ] Repository with protected `main`.
- [ ] Labels, milestones, project board and issue templates from this document.
- [ ] All backlog issues created and assigned.

**#10 Scaffold Nuxt + TypeScript + Tailwind + Pinia** · `frontend` · S · B
- [ ] Nuxt project with TypeScript strict mode.
- [ ] Tailwind, Pinia and ESLint installed and working.
- [ ] `npm run dev`, `lint`, `typecheck` and `build` all pass.

**#11 Tailwind theme from design tokens + fonts** · `frontend` `design` · S · B
- [ ] Colours, radii and spacing from the design system in `tailwind.config`.
- [ ] Light and dark colour values as CSS variables.
- [ ] Rubik and Nunito loaded from Google Fonts.

**#12 Docker Compose: app + PostgreSQL** · `devops` · M · A
- [ ] `Dockerfile` for the Nuxt app (multi-stage build).
- [ ] `docker-compose.yml` with `app` and `db`, a `pgdata` volume, and the app on port 3000.
- [ ] `.env.example` lists every variable.

**#13 Drizzle schema, migrations, shop seed** · `database` · M · A
- [ ] Tables: profile, pet, focus_session, task, shop_item, inventory_item (+ Better Auth tables).
- [ ] Migrations run on container start.
- [ ] Seed script adds 8–10 shop items with prices and required levels.

**#14 Nginx server block + Certbot HTTPS** · `devops` · S · A
- [ ] Server block proxies the domain to `localhost:3000`.
- [ ] HTTPS certificate from Certbot with auto-renewal.
- [ ] HTTP redirects to HTTPS.

**#15 CI workflow** · `devops` · S · A
- [ ] Runs on every pull request.
- [ ] Steps: install, lint, typecheck, build.
- [ ] Required to pass before merge.

**#16 Better Auth: email/password + Google** · `backend` · M · A
As a student, I want to create an account so that my progress is saved.
- [ ] Sign up, log in and log out with email and password.
- [ ] Google sign-in works on the live domain.
- [ ] A profile row is created for every new user.

**#17 Login and sign-up pages** · `frontend` · M · B
As a student, I want simple login and sign-up pages.
- [ ] Forms with validation and clear error messages.
- [ ] "Continue with Google" button.
- [ ] Styled with the design system (chunky buttons, pet greeting).

**#18 Server-side auth redirect middleware** · `backend` `frontend` · S · A
As a student, I should never see a page I can't use.
- [ ] Logged-out users requesting a protected page get a server redirect to `/login`, with no flash.
- [ ] Logged-in users visiting `/login` go to `/home`.
- [ ] Users without a pet go to `/onboarding`.

**#19 Choose and name your pet** · `frontend` `backend` · M · B
As a new student, I want to choose a cat or a dog and name it.
- [ ] Onboarding screen with two choices and a name field.
- [ ] `POST /api/pet` saves it; it can only be created once.
- [ ] After saving, redirect to `/home`.

#### M3 — Core features

**#20 Timer store and ring UI** · `frontend` `priority:high` · L · B
As a student, I want a clear timer so that I know how long I have left.
- [ ] Mode tabs: Focus, Short break, Long break.
- [ ] Start, pause, resume and quit buttons.
- [ ] Ring and time update every second; correct after the tab was in the background.
- [ ] After 4 focus sessions the next break is a long break.

**#21 Session API with time check** · `backend` `priority:high` · M · A
As a student, I want my sessions saved so that I get rewards.
- [ ] `POST /api/sessions` creates a running session with `started_at`.
- [ ] `POST /api/sessions/:id/complete` rejects it if less than `planned_min − 30 s` has passed.
- [ ] `POST /api/sessions/:id/abandon` marks it abandoned and sets the pet mood to sad.

**#22 Timer settings** · `frontend` `backend` · S · B
As a student, I want to change the focus and break lengths.
- [ ] Settings page with focus (15–60 min), short break (3–15), long break (10–30).
- [ ] `PATCH /api/settings` saves them to the profile.

**#23 XP, levels and coins rules** · `backend` `priority:high` · M · A
As a student, I want rewards for studying so that I stay motivated.
- [ ] +1 XP per planned focus minute, +10 coins per completed focus session.
- [ ] Level n → n+1 needs 100 × n XP; +50 coins on level-up.
- [ ] Rules live in one service file with unit tests.

**#24 Top bar chips, XP bar, reward toast** · `frontend` · M · B
As a student, I want to see my progress at a glance.
- [ ] Top bar shows streak, level and coins.
- [ ] XP bar fills after each session.
- [ ] Reward toast shows "+10 coins · +25 XP"; level-up shows a full screen.

**#25 Study streak** · `backend` · S · A
As a student, I want a streak so that I study every day.
- [ ] +1 on the first completed focus session of a new day.
- [ ] Resets to 1 if a day was skipped.

**#26 Pet component with moods (2D)** · `frontend` · L · B
As a student, I want my pet to react to how I study.
- [ ] Cat and dog drawings with happy, sleepy, sad and neutral moods.
- [ ] Mood follows the timer state and the last session result.
- [ ] Speech bubble with short messages.

**#27 3D pet spike (max 1 day)** · `frontend` `stretch` · M · B
As a team, we want to know if a 3D pet is possible in time.
- [ ] Find a free, rigged cat and dog with similar head positions.
- [ ] Load one GLB with TresJS inside `<ClientOnly>` and attach a hat to the head bone.
- [ ] Decision written in the issue: go 3D or stay 2D.

**#28 Shop API with buy transaction** · `backend` · M · A
As a student, I want to buy items with my coins.
- [ ] `GET /api/shop` returns items with owned, locked and affordable flags.
- [ ] `POST /api/shop/:itemId/buy` checks level and coins inside one transaction.
- [ ] You can't buy the same item twice.

**#29 Shop page** · `frontend` · M · B
As a student, I want to browse items for my pet.
- [ ] Item tiles show for sale, owned and locked states.
- [ ] Tap an item to preview it on the pet, then buy.
- [ ] Coins update immediately after buying.

**#30 Inventory and equip** · `frontend` `backend` · M · B
As a student, I want to dress up my pet with my items.
- [ ] Inventory grid grouped by slot: head, face, neck, background.
- [ ] `POST /api/inventory/:id/equip` keeps one item per slot.
- [ ] Equipped items show on the pet everywhere in the app.

**#31 Task list (API + UI)** · `frontend` `backend` · M · A
As a student, I want to track what I'm studying.
- [ ] Add, edit, complete and delete tasks.
- [ ] Choose a task before starting a focus session.
- [ ] Each task shows how many sessions it took.

#### M4 — Polish and delivery

**#32 Statistics page** · `frontend` `backend` · M · A
As a student, I want to see how much I studied this week.
- [ ] `GET /api/stats?range=week` returns focus minutes and sessions per day.
- [ ] Bar chart of the last 7 days, plus today's totals and the streak.

**#33 Responsive pass, empty states, dark mode** · `frontend` · M · B
- [ ] Every page works at 375 px and 1280 px wide.
- [ ] Friendly empty states with the pet ("No tasks yet").
- [ ] Dark mode using the dark token values (if time allows).

**#34 Achievements** · `stretch` · M · A
- [ ] Badges: First Tomato, 5-day streak, 10 sessions, Level 5.
- [ ] Shown on the profile; a toast when one unlocks.

**#35 Installable PWA** · `frontend` `stretch` · S · B
- [ ] Web app manifest and icons.
- [ ] "Add to Home Screen" opens the app full-screen.

**#36 Tests for game rules + manual test plan** · `backend` · M · A
- [ ] Unit tests for XP, level, coins, streak and the time check.
- [ ] Manual test plan covering every main use case, with results for the report.

**#37 Final deploy + demo account** · `devops` · S · A
- [ ] Final version deployed on Nov 18; `main` frozen.
- [ ] Demo account with coins, items and a week of sessions.
- [ ] Backup demo video recorded.

**#38 Report and presentation** · `docs` · L · A + B
- [ ] Report: problem, requirements, diagrams, architecture, design, testing, conclusion.
- [ ] Slides: live demo, diagrams, architecture, what we learned.
- [ ] One full rehearsal.
