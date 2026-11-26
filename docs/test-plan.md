# Test plan

How PomoPal is tested: automated unit tests for the game rules, automated API tests for buying and equipping, and a manual test run of every main use case. The results of the manual run go in this file and into the report.

## 1. Automated tests

| Suite      | Command            | What it covers                                                                       | Where                                                                  |
| ---------- | ------------------ | ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------- |
| Unit tests | `npm test`         | Game rules and shared helpers, in plain Node (no database, no server)                | `server/services/rules/*.test.ts`, `shared/**/*.test.ts`               |
| API tests  | `npm run test:api` | Real HTTP requests to the production build with a real Postgres: buying and equipping | `tests/api/*.test.ts`                                                  |

CI runs both on every pull request and on `main` (`.github/workflows/ci.yml`: jobs **Lint, typecheck, test, build** and **API tests**). A pull request is merged only when they pass.

### Running the API tests locally

1. Start the database: `docker compose up -d db` (`DATABASE_URL` in `.env` points to it).
2. Build the app: `npm run build`.
3. Run `npm run test:api`.

The tests start the build on port 3999 and sign up throwaway students (`api-test-…@example.test`). They delete those students again at the end.

### Game rules covered by unit tests

| Rule                                | Edge cases tested                                                                              | Test file                               |
| ----------------------------------- | ---------------------------------------------------------------------------------------------- | --------------------------------------- |
| XP and coins for a session          | 1 XP per planned minute and 10 coins for focus, nothing for breaks                              | `server/services/rules/rewards.test.ts` |
| Level-ups                           | Exactly 100 XP, **several level-ups at once** (two 50-coin bonuses), a level never goes down     | `server/services/rules/rewards.test.ts` |
| Level curve                         | 100 × n XP from level n to n + 1, progress inside a level                                       | `shared/levels.test.ts`                 |
| Streak                              | First day, next day, same day, **a skipped day** (back to 1), month and year ends, time zones    | `shared/streak.test.ts`                 |
| Session time check                  | Full length, **exactly 30 s early** (counts), 31 s early (refused), paused sessions              | `server/services/rules/session.test.ts` |
| Shop                                | Exactly enough coins, one coin short, level too low, already owned, the order of the checks     | `server/services/rules/shop.test.ts`    |
| Badges                              | Each badge at exactly its goal, progress stops at the goal                                      | `server/services/rules/achievements.test.ts` |
| Input validation                    | Every zod schema: valid input, limits, friendly messages                                        | `shared/schemas/*.test.ts`              |

### API tests

| Endpoint                            | Cases                                                                                                                                                  |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `POST /api/shop/:itemId/buy`        | Buys and pays; exactly enough coins; `NOT_ENOUGH_COINS` (one coin short, nothing taken); `LEVEL_TOO_LOW`; unlocked at the level; `ALREADY_OWNED` (charged once); a double click charges once; the shop list shows the new state; `404` unknown item; `401` signed out |
| `POST /api/inventory/:id/equip`     | Puts an item on; **one item per slot** (a second hat takes the first off); items in different slots together; two hats equipped at once end with one; equipping twice changes nothing; `404` for another student's item; `400` for a bad id |
| `POST /api/inventory/:id/unequip`   | Takes an item off                                                                                                                                       |

## 2. Manual test run

### Setup

| Field         | Value |
| ------------- | ----- |
| Date          |       |
| Tester        |       |
| Version       | commit or release on `main` |
| URL           | https://pomopal.viten.io (or `http://localhost:3000`) |
| Browser, size | Phone 375px and desktop 1280px |

Use a new account for the run unless a case says otherwise. To reach a level or coin amount quickly, set the focus length to 15 minutes in Settings.

**Result:** write **Pass** or **Fail**. For a fail, add what happened in Notes and open an issue.

### Sign up, log in, log out

| ID    | Use case     | Steps                                                                                     | Expected                                                                                     | Result | Notes |
| ----- | ------------ | ----------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | ------ | ----- |
| TC-01 | Sign up      | Open `/signup`, enter a name, a new email and a password of 8+ characters, **Create account** | You are signed in and see **Choose your study buddy**                                       |        |       |
| TC-02 | Sign up      | Sign up with a 7-character password                                                       | A friendly message under the field; no account is created                                    |        |       |
| TC-03 | Sign up      | Sign up with an email that already has an account                                         | "There is already an account with this email. Want to log in instead?"                       |        |       |
| TC-04 | Log in       | Log out, open `/login`, enter the right email and password, **Log in**                    | The home page with your pet                                                                  |        |       |
| TC-05 | Log in       | Log in with a wrong password                                                              | A friendly error; you stay on the login page                                                 |        |       |
| TC-06 | Log in       | Signed out, open `/home` directly                                                          | You are sent to `/login`                                                                     |        |       |
| TC-07 | Log out      | Settings → **Log out**                                                                    | The login page; opening `/home` sends you back to `/login`                                   |        |       |
| TC-08 | Google       | Only when Google is configured: **Continue with Google** with a Google account            | Signed in; a new account goes to **Choose your study buddy**                                 |        |       |

### Choose a pet

| ID    | Use case     | Steps                                                         | Expected                                                              | Result | Notes |
| ----- | ------------ | ------------------------------------------------------------- | --------------------------------------------------------------------- | ------ | ----- |
| TC-09 | Choose pet   | After sign-up, pick **Cat**, name it "Mochi", **Let's go!**     | Home shows a cat called Mochi                                         |        |       |
| TC-10 | Choose pet   | Try an empty name, then a name of 21 characters               | "Give your pet a name." and a length message; nothing is saved        |        |       |
| TC-11 | Rename pet   | Pet page → **Rename** → a new name → **Save name**            | The new name on the pet page and on home                              |        |       |

### Focus sessions

| ID    | Use case        | Steps                                                                               | Expected                                                                                                   | Result | Notes |
| ----- | --------------- | ----------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ------ | ----- |
| TC-12 | Start session   | Home → **Start focus**                                                              | The ring counts down from the focus length                                                                 |        |       |
| TC-13 | Pause session   | During a session: **Pause**, wait a minute, **Resume**                              | The clock stops while paused and goes on from the same time                                                |        |       |
| TC-14 | Finish session  | Let a 25-minute focus session run to the end                                        | A chime, "+10 coins · +25 XP", the XP bar and coin chip go up, a dot of today's goal fills, streak 1       |        |       |
| TC-15 | Quit session    | Start a session → **Quit** → **Quit session**                                       | The timer stops, no coins or XP, the pet is sad                                                            |        |       |
| TC-16 | Breaks          | After a focus session, start the short break, then try **Skip break**               | The break counts down in green; skipping goes back to focus; breaks give no XP                             |        |       |
| TC-17 | Level up        | Finish focus sessions until the XP bar reaches 100 XP                               | The level-up screen, level 2, and 50 bonus coins                                                           |        |       |
| TC-18 | Daily goal      | Finish 4 focus sessions in one day                                                  | All four dots are full; the pet celebrates and "Daily goal reached!" appears once                         |        |       |
| TC-19 | Badges          | New account: finish the first focus session, then open the Pet page                 | A "Badge unlocked: First Tomato!" toast; the badge is unlocked under **Badges**, the others show progress |        |       |

### Tasks

| ID    | Use case      | Steps                                                                                       | Expected                                                              | Result | Notes |
| ----- | ------------- | ------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- | ------ | ----- |
| TC-20 | Add task      | Tasks page → type "Read chapter 3" → add                                                    | The task appears under **To do** and on home under **Today's tasks**   |        |       |
| TC-21 | Add task      | Try to add an empty task                                                                    | A friendly message; nothing is added                                  |        |       |
| TC-22 | Edit task     | Edit the task's title and save                                                              | The new title everywhere                                              |        |       |
| TC-23 | Finish task   | Tick the task off                                                                           | It moves under **Done**; with no open tasks: "All done. Time for a well-earned break!" |        |       |
| TC-24 | Delete task   | Delete a task → confirm                                                                     | The task is gone; **Keep it** cancels instead                         |        |       |
| TC-25 | Task session  | Home → **What are you studying?** → pick a task → finish a focus session                    | The task's session count goes up by 1                                 |        |       |

### Shop and pet

| ID    | Use case     | Steps                                                                                 | Expected                                                                                | Result | Notes |
| ----- | ------------ | ------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | ------ | ----- |
| TC-26 | Buy item     | With 30+ coins, buy the **Party hat** (30 coins)                                      | Coins go down by 30, the hat shows as owned and appears in the Pet page's wardrobe     |        |       |
| TC-27 | Buy item     | With fewer coins than an item costs, try to buy it                                    | The price is greyed out; buying is refused with a friendly pet message; coins stay the same |        |       |
| TC-28 | Buy item     | At level 1, look at the **Wizard hat** (level 5)                                      | Dimmed with "Unlocks at Lv 5"; tapping it gives a small shake and can't buy it        |        |       |
| TC-29 | Equip item   | Pet page → tap the party hat, then a second hat                                       | The pet wears the first hat, then only the second one (one item per slot)              |        |       |
| TC-30 | Equip item   | Wear a hat and glasses, then tap the hat again                                        | Both are worn together; tapping the hat takes it off and the glasses stay              |        |       |

### Stats and settings

| ID    | Use case        | Steps                                                                                  | Expected                                                                                          | Result | Notes |
| ----- | --------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ------ | ----- |
| TC-31 | View stats      | New account: open **Stats**                                                            | "No focus sessions in the last 7 days" with a link to the timer                                   |        |       |
| TC-32 | View stats      | After some sessions, open **Stats** and hover today's bar                              | 7 days with today last; today's tiles match home; the tooltip shows today's minutes and sessions |        |       |
| TC-33 | Change settings | Settings → focus 30 minutes → **Save timer** → home                                    | The next focus session starts at 30:00                                                            |        |       |
| TC-34 | Change settings | Try a focus length of 10 or 70 minutes                                                 | "Focus can be 15 to 60 minutes."; nothing is saved                                              |        |       |
| TC-35 | Change settings | Turn **Animations** and **Sounds** off, finish a session                               | No coin flight or pops, no sounds; the numbers still change                                       |        |       |

### Whole app

| ID    | Use case      | Steps                                                                               | Expected                                                                       | Result | Notes |
| ----- | ------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | ------ | ----- |
| TC-36 | Layout        | Go through every page at 375px and at 1280px                                        | Nothing overlaps or is cut off; the tab bar on phones, the side rail on desktop |        |       |
| TC-37 | Dark mode     | Switch the system to dark mode and go through every page                            | Every text is readable; no white boxes left over                               |        |       |
| TC-38 | Install       | On a phone: **Add to Home Screen**, open the app from the icon                      | The tomato icon; the app opens on home without the browser bar                 |        |       |
| TC-39 | Keyboard      | Use the timer, tasks and shop with the keyboard only                                | Everything can be reached with Tab and used with Enter or Space; focus is visible |        |       |

### Summary

| Total | Pass | Fail | Not run |
| ----- | ---- | ---- | ------- |
| 39    |      |      |         |
