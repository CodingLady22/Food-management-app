Read @AGENTS.md first — it is the single source of truth for this project.

---

# Memory — Feature 03 (Auth API)

Last updated: 2026-11-13

## What was built

- Branch `feature/03-auth-api` (cut from `main`). Feature 03 is ticked in `context/progress-tracker.md`, which has the full decision log.
- Auth API under `/api/auth`: `signup` (201, logs in), `login`, `logout`, `demo`, `me`. Success responses are `{ user: PublicUser }`; logout returns `{ ok: true }`.
- New server files: `config/{passport,session,demo}.ts`, `controllers/auth.controller.ts`, `routes/auth.routes.ts`, `services/auth.service.ts`, `schemas/auth.schemas.ts`, `middleware/{requireAuth,validate,rateLimiters}.ts`. `index.ts` now builds the app inside `start()` after `connectDB()` (the session store reuses Mongoose's connection).
- Shared types `PublicUser`, `SignupRequest`, `LoginRequest`, `AuthResponse` added to `server/src/types/api.ts` and the byte-identical client copy.
- Dependencies added: passport, passport-local, express-session, connect-mongo 6, express-rate-limit 8 (+ types). `npm audit` = 0.
- `models/User.ts` now exports `BCRYPT_COST` and `USERNAME_COLLATION`; the `userName` unique index is `userName_ci_unique` (case-insensitive). `syncIndexes()` was run once against Atlas and dropped the old `userName_1`.
- `scripts/seedDemoUser.ts` now imports the Guest email/username from `config/demo.ts`.

## Decisions made

- **Branching rule (standing):** on `main` at the start of a feature, cut `feature/NN-short-name`; on any other branch, ask whether it is the accepted branch before proceeding.
- **Sessions:** server-side in Mongo, 7 days with `rolling: true`, cookie `connect.sid` (`httpOnly`, `sameSite: lax`, `secure` in production). No JWTs. `app.set('trust proxy', 1)`.
- **Demo login is by email** (`findDemoUser()` in `auth.service.ts`), decoupled from `DEMO_USER_ID`. **Feature 14's cron must reuse `findDemoUser()`.**
- **Login schema checks presence only**; the ≥ 8 / 72-byte password rules apply to signup only. Signup rejects the reserved email `guest@intellipantry.app` and the username `Guest` (case-insensitive).
- **Brute-force limiters** (in-memory): login per IP+email 5 failed/15 min, login per IP 30 failed/15 min (per-IP runs before validation, per-email after), signup 10/hr, demo 30/hr. **The in-memory store assumes a single instance — swap in a Mongo-backed store if the app scales out.**
- Unknown email and wrong password return the same 401. Signup does say which of email/username is taken (accepted trade-off).
- `createUser` checks email and username with two separate `exists()` queries, because a single `$or` with the collation would force a collection scan on the email branch.
- Shared API types are hand-copied to the client by convention (code-standards); a CI diff check is a possible later addition.

## Problems solved

- connect-mongo's `client` option accepts `mongoose.connection.getClient()` with no cast. The store must be created after `connectDB()`.
- A `userName` unique index with a collation needs an explicit `name`, and `syncIndexes()` then drops the stale case-sensitive one. Run `Model.diffIndexes()` first to see what it will drop.
- Windows quirk: the `cwd` shifts when a command `cd`s into `server/`; use absolute paths. Kill test servers by port with PowerShell (`Get-NetTCPConnection` + `Stop-Process`).
- Test data from curl runs was deleted from Atlas each time; only the Guest user should remain in the `intellipantry` database.

## Current state

- Works: typecheck and build (server and client), full curl flow against real Atlas (signup → me → logout → me 401 → login → demo), duplicate/reserved/case-variant rejections, lockout 429s, `Secure` cookie behind a proxy header in production, seed idempotent.
- Not done: no services/controllers/routes for Items, Recipes or Notes, no client auth UI, no AI code, no Gemini SDK, no cron, no automated tests (no runner yet).
- Still unproven: the 11000 duplicate-key mapping. A concurrent-signup race test produced the right outcome (one account per round) but can't show which layer rejected the loser.
- The developer rotates the Mongo and Cloudinary credentials themselves; `config/.env` and `notes.txt` are untracked/ignored — delete `config/.env` after rotating.

## Next session starts with

Feature 04 — React Scaffold + Auth UI (`context/build-plan.md`). On `main` after the PR merges? Cut `feature/04-react-scaffold-auth-ui` first. Run `architect` before coding. Read "Carry-overs for feature 04 and 14" in the tracker: `AuthContext` loads from `GET /api/auth/me` (401 = logged out), send `credentials: 'same-origin'`, show field-level `fields[]` from 400s and the `{ error }` message from 401/409/429. Installs for 04: Tailwind v4, React Router v7, TanStack Query v5.

## Open questions

- Gemini: `gemini-3.5-flash-lite` is confirmed free for this key. Still verify the call shape (Interactions API vs `generateContent`) against the installed `@google/genai` types at the start of feature 07 (`library-docs.md` marks it provisional).
- Whether to add automated tests once a runner is introduced (models, auth service, limiters).
