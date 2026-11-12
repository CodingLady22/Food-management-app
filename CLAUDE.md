Read @AGENTS.md first — it is the single source of truth for this project.

---

# Memory — Feature 02 (Models + Demo Seed)

Last updated: 2026-11-12

## What was built

- Branch `feature/02-models-and-demo-seed` (cut from `main`). Feature 02 is ticked in `context/progress-tracker.md`.
- `server/src/models/{User,Item,Recipe,Note}.ts` — Mongoose 8, strict TS, exported `type` aliases, `timestamps: true`, `index: true` on every `user` field, plus compound `{ user: 1, expiry: 1 }` on Item.
  - `User`: bcryptjs v3 (cost 12) pre-save hook that hashes only when `password` is modified; promise-based `comparePassword`; `password` is `select: false` and stripped in `toJSON`; `email` trimmed + lowercased; `email` and `userName` unique.
- `server/src/scripts/seedDemoUser.ts` + `npm run seed:demo -w server` — idempotent Guest creation (email `guest@intellipantry.app`, random throwaway password never stored/printed), logs `DEMO_USER_ID=<id>` via `utils/logger.ts`. Needs only `MONGODB_URI`.
- Dependencies: added `bcryptjs`; upgraded `zod` 3 → 4 (`^4.6.7`, clears a high-severity advisory; `npm audit` = 0).
- `AGENTS.md` "How To Work" gained a branching rule (see Decisions).

## Decisions made

- **Branching rule (standing):** at the start of a feature, if on `main`, create `feature/NN-short-name` first; if already on another branch, ask the developer whether it is the accepted branch for the feature before proceeding.
- `MONGODB_URI` now ends in `/intellipantry` (it had no db name and Mongoose was using `test`). Any new environment's URI must include the db name.
- Seed script lives in `server/src/scripts/` (inside `rootDir`) so `tsc` covers it.
- Model exports are `type` aliases, not `interface` (code-standards); keep that for later models.
- Login (feature 03) must load the user with `.select('+password')`.
- Fresh DB, no migration, Guest is a normal User document reachable only via `POST /api/auth/demo` (feature 03). Details are in the tracker's "Decisions Made During Build".

## Problems solved

- `@types/bcryptjs` is not needed — bcryptjs v3 ships its own types (removed the stale v2 types).
- Atlas works again after the cluster restart (new connection string, already in the git-ignored `.env`); verification ran against real Atlas, not an in-memory Mongo.
- Zod 4 upgrade needed no code changes (`env.ts`, `errorHandler.ts`, seed use only `z.object/string/enum/coerce/preprocess`, `.issues`); boot, `/api/health`, JSON 404 and the missing-vars exit path were re-verified.
- Windows quirk: the `cwd` shifts when a command `cd`s into `server/`; use absolute paths.

## Current state

- Works: typecheck + build; seed ran twice against Atlas → same id, exactly one Guest document; hashing, `comparePassword`, default query excludes the hash, `toJSON` strips it, indexes present (verified with throwaway scripts, deleted).
- Not done: no auth, sessions, services/controllers/routes for the models, AI code, Gemini SDK install, cron, or tests (no test runner yet — add model tests when one is introduced).
- The Guest user already exists in the `intellipantry` Atlas database. The developer pastes the id printed by `npm run seed:demo -w server` into `.env` as `DEMO_USER_ID` (still optional until feature 14).
- Credential rotation: the developer rotates the Mongo and Cloudinary credentials themselves; `config/.env` and `notes.txt` are untracked/ignored — delete `config/.env` after rotating.

## Next session starts with

Feature 03 — Auth API (`context/build-plan.md`). On `main`? Cut `feature/03-auth-api` first (see branching rule). Run `architect` before coding. Carry-overs recorded in the tracker under "Carry-overs for feature 03": cap `password` at 72 **bytes** (TextEncoder length) in the signup and login Zod schemas, keep the ≥ 8 minimum, load the user with `.select('+password')`, and run `syncIndexes()` once if `autoIndex` is ever disabled in production. Installs needed: passport, passport-local, express-session, connect-mongo (+ types); session cookie flags per `code-standards.md`.

## Open questions

- Gemini: `gemini-3.5-flash-lite` is confirmed free for this key. Still verify the call shape (Interactions API vs `generateContent`) against the installed `@google/genai` types at the start of feature 07 (`library-docs.md` marks it provisional).
- Push the local tag `v1-final` to GitHub?
