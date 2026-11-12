# PomoPal — Development Plan

What to do, and when. Two developers, ten days, Nov 10 → Nov 19, 2026.

- **A** = backend, database, deployment
- **B** = frontend, pet, design
- Both review each other's pull requests and write the report together.

## Deadlines

| What | Due |
| --- | --- |
| UML diagrams | **Thu, Nov 12** |
| App deployed on the VPS (code freeze) | **Wed, Nov 18** |
| Report and presentation | **Thu, Nov 19** |

## Milestone overview

| Milestone | Dates | Goal | Done when |
| --- | --- | --- | --- |
| M1 Design and diagrams | Nov 10–12 | Agree on requirements and draw every diagram. | Diagrams are submitted. |
| M2 Foundation | Nov 13–14 | Project, server, database and login work. | You can sign up, pick a pet and see an empty home screen on the live URL. |
| M3 Core features | Nov 15–17 | The full study → reward → shop loop. | A user can finish a session, earn coins and buy a hat for their pet. |
| M4 Polish and delivery | Nov 18–19 | Stats, polish, tests, final deploy, report. | App is live, report and slides are ready. |

---

## Day by day

### Tue, Nov 10 — Requirements
- **Both:** Finalise the feature list and the game rules (see `03-architecture.md`).
- **Both:** Ask the instructor which diagrams are required and in which tool.
- **A:** Create the GitHub repo, project board, labels and milestones (see `02-github-setup-and-backlog.md`).
- **B:** Sketch rough wireframes on paper: login, onboarding, home/timer, shop, pet, stats.

### Wed, Nov 11 — Diagrams, part 1
- **A:** Use case diagram. Actors: Student, Google (OAuth). Main use cases: sign up, log in, start session, manage tasks, buy item, equip item, view stats.
- **A:** Timer state machine: Idle → Focusing → Paused → Short break / Long break → Idle.
- **B:** Class diagram: User, Profile, Pet (Cat and Dog inherit from it), FocusSession, Task, ShopItem, InventoryItem.
- **B:** Activity diagram of one full Pomodoro cycle (4 focus sessions + breaks).

### Thu, Nov 12 — Diagrams, part 2 + submit ✅
- **A:** Sequence diagram "complete a focus session" (browser → API → database → reward).
- **A:** Component and deployment diagrams (browser, Nginx, Nuxt container, Postgres container).
- **B:** Sequence diagram "buy and equip an item".
- **B:** Clean wireframes for the five main screens.
- **Both:** Review every diagram against the class names in `03-architecture.md`, then submit.

### Fri, Nov 13 — Project foundation
- **B:** Create the Nuxt project with TypeScript, Tailwind, Pinia and ESLint.
- **B:** Put the design tokens into the Tailwind theme. Load the Rubik and Nunito fonts.
- **A:** Write `docker-compose.yml` with the app and PostgreSQL. Add `.env.example`.
- **A:** Write the Drizzle schema and the first migration. Seed 8–10 shop items.
- **A:** Add the Nginx server block and get an HTTPS certificate with Certbot.
- **A:** Add the CI workflow (lint, type-check, build on every PR).

### Sat, Nov 14 — Login and onboarding
- **A:** Set up Better Auth with email/password. Add Google sign-in if time allows.
- **A:** Add the global route middleware. Logged-out users go to `/login` on the server, before any HTML is sent.
- **B:** Build the login and sign-up pages.
- **B:** Build onboarding: choose cat or dog, give it a name.
- **Both:** Deploy and test on the real domain. **M2 done.**

### Sun, Nov 15 — Timer and sessions
- **B:** Build the timer store (Pinia) and the timer ring with mode tabs.
- **A:** Build the session API: start, complete, abandon. The server checks that enough time really passed.
- **B:** 3D spike — max one day. Look for a rigged cat and dog (Quaternius, Kenney, Poly Pizza, Sketchfab). No good match by evening → stay with 2D.

### Mon, Nov 16 — Rewards and pet
- **A:** Add XP, levels, coins and the level-up bonus. Add the streak calculation.
- **B:** Build the top bar chips (streak, level, coins), the XP bar and the reward toast.
- **B:** Build the pet component with moods: happy, sleepy, sad, neutral.
- **A:** Build the task API (create, edit, delete, link a session to a task).

### Tue, Nov 17 — Shop and inventory
- **A:** Build the shop API. Buying checks level and coins inside one database transaction.
- **B:** Build the shop page with item tiles: for sale, owned, locked.
- **B:** Build inventory and equip: one item per slot (head, face, neck, background), drawn on the pet.
- **A:** Build the task list UI. **M3 done** — the full loop works end to end.

### Wed, Nov 18 — Polish and code freeze
- **A:** Build the stats API and a simple weekly chart.
- **B:** Responsive pass on phone and desktop. Empty states. Dark mode if quick.
- **A:** Unit tests for the game rules. Write a short manual test plan.
- **Both:** Final deploy. Create a demo account with some coins and items. Record a backup demo video.
- **Code freeze at the end of the day.** Only fixes after this.

### Thu, Nov 19 — Report and presentation ✅
- **Both:** Write the report: problem, requirements, diagrams, architecture, design, testing, what you learned.
- **Both:** Make the slides. Show the live demo first, then the diagrams and architecture.
- **Both:** Rehearse once. Keep the backup video ready.

---

## Rules that keep you on time

- **MVP first.** Anything labelled `stretch` (3D pet, achievements, sounds, PWA) waits until the MVP works.
- **Deploy early.** Deploy at the end of M2 and after every big feature, not only at the end.
- **Small pull requests.** One issue per branch. Merge the same day.
- **Daily 10-minute check-in.** What did I finish, what am I doing next, what is blocking me?
- **Behind on Nov 17?** Drop all stretch items. Stats can be a list instead of a chart.

## Definition of done

An issue is done when:
- [ ] It is merged into `main` through a reviewed pull request that closes the issue.
- [ ] CI passes (lint, type-check, build).
- [ ] It works on a phone-sized screen and on desktop.
- [ ] It uses design tokens only, with no hard-coded colours.
- [ ] It is deployed and checked on the VPS.

## Risks

| Risk | What we do |
| --- | --- |
| 3D models take too long or don't fit together | Hard stop after one day. Ship the 2D pet with layered accessories. |
| Google sign-in setup blocks login | Ship email/password first. Add Google once HTTPS works. |
| Behind schedule | Drop stretch items. Simplify stats. |
| Server breaks on demo day | Freeze on Nov 18. Keep a backup demo video. |
