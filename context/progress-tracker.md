# Progress Tracker

Update this file after every completed feature. Any AI agent reading this should immediately know what is done, what is in progress, and what is next.

---

## Current Status

**Phase:** 1 — Foundation
**Last completed:** 02 Models + Migration Decision
**Next:** 03 Auth API (read "Carry-overs for feature 03" under Decisions Made During Build first)

---

## Progress

### Phase 1 — Foundation

- [x] 01 Repo Restructure + Server Scaffold
- [x] 02 Models + Migration Decision
- [ ] 03 Auth API
- [ ] 04 React Scaffold + Auth UI

### Phase 2 — Inventory

- [ ] 05 Items API
- [ ] 06 Dashboard UI

### Phase 3 — AI Features

- [ ] 07 Snap-to-Add API
- [ ] 08 Snap-to-Add UI
- [ ] 09 Fridge Chef API
- [ ] 10 Fridge Chef UI

### Phase 4 — Recipes

- [ ] 11 Recipes API
- [ ] 12 Recipes UI

### Phase 5 — Notes + Ship

- [ ] 13 Notes API + UI
- [ ] 14 Demo Hardening + Cron
- [ ] 15 Production Build + Deploy

---

## Decisions Made During Build

### 2026-11-09 — First-session repo audit (resolved by developer)

Audit of the v1 repo against `architecture.md`. Resolutions:

| # | Finding | Resolution |
|---|---------|-----------|
| 1 | No demo-user mechanism exists in the repo (no `demo`/`guest` anywhere on this branch; the old `'demo'` string-id hack lives on another branch/unpushed). | **Greenfield.** Build guest mode per the v2 plan: Guest is a normal User document, seeded by script (feature 02), logged in via `POST /api/auth/demo`. Do not hunt for the old hack. |
| 2 | Mongoose is 6.8.3 (plan: 8); callback-style code in `config/passport.js` and `controllers/auth.js`. | **Upgrade to Mongoose 8 in feature 01**; all callback-style code is rewritten to promises. |
| 3 | Existing data (String dates etc.). | **Fresh database, no migration.** |
| 4 | Ignore file is named `.gitIgnore` (wrong case; breaks on Linux/Render). | **Rename to `.gitignore` in feature 01.** |
| 5 | `NewItems.expiry` / `purchaseDate` are `String`, not `Date`. | Erased by the v2 `Item` model (Date types). |
| 6 | `require: true` typo (should be `required`) on Comment/Recipe/UploadedRecipe — validation never enforced. | Erased by the v2 model rewrite. |
| 7 | `source` field missing on Item and Recipe. | Added by the v2 models (feature 02). |
| 8 | `node-cron` 3.0.3 is installed but not in package.json and never imported; no cron job exists. | Greenfield in feature 14; add as a proper dependency then. |
| 9 | No Zod, sharp, express-rate-limit, the AI SDK in package.json (now @google/genai, see 2026-11-11); Tailwind is v3. | Added/upgraded by the features that need them. |
| 10 | Quote API has two timeouts in v1 (50000 ms and 5000 ms). | **Keep the 3s timeout** from the plan (bug #9, feature 11). |
| 11 | Session secret hardcoded `"keyboard cat"`; `dotenv.config()` runs after imports; no cookie flags / `trust proxy`. | Fixed by `config/env.ts` (Zod, required `SESSION_SECRET`) in feature 01 and session config in feature 03. |
| 12 | `middleware/multer.js` uses diskStorage with `fileFilter` on the storage (never runs), no size limit. | Replaced by `upload.ts` (memory storage, size + mime limits) in feature 07/11. |
| 13 | No `.agents/skills/` in the repo; no MongoDB MCP connector configured. | Follow the loop manually (plan → build → self-review → tracker). Skills available as Claude Code skills in-session. |

**Secrets check (git history, all branches):** `config/.env` and `notes.txt` were **never committed**. `config/.env` is correctly ignored. `notes.txt` is untracked and lists plaintext test-account passwords — the developer will rotate the Mongo and Cloudinary credentials regardless as a precaution.

**Entry files:** `AGENTS.md` is the single source of truth. `CLAUDE.md` is a one-line pointer to it; per-session notes from the `remember` skill are saved to `CLAUDE.md` and restored from it.

---

### 2026-11-10 — Feature 01 decisions

- **v1 preserved by tag:** the final v1 code is tagged `v1-final` (local tag; push it if you want it on GitHub). All v1 files (EJS views, controllers, models, routes, middleware, public, server.js, Tailwind 3 config) were removed from the working tree — look them up with `git show v1-final:<path>`.
- **Env var names changed** to the v2 plan: `MONGODB_URI`, `CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET` (v1 used `CONNECTION_STRING_DB`, `CLOUD_NAME`, `API_KEY`, `API_SECRET`). The `.env` now lives at the **repo root** (see `.env.example`). The old untracked `config/.env` was left in place and is no longer read — delete it after rotating the credentials.
- **`DEMO_USER_ID` is optional for now** (validated as an ObjectId when present). It can't be required until the seed script (feature 02) has produced the Guest id; make it required in feature 14.
- **Env loading** uses Node's `--env-file-if-exists=../.env` (Node ≥ 20.6) instead of the `dotenv` package, so `dotenv` is not a dependency.
- **`client/` is a minimal Vite + React 18 + TS placeholder** (just enough for `npm run dev`/`build`). Tailwind v4, React Router and TanStack Query are installed in feature 04.
- **Workspaces:** root `package.json` uses npm workspaces (`server`, `client`); scripts `dev` (concurrently), `build`, `start`.
- **No `app.ts`/`index.ts` split:** `server/src/index.ts` builds the app and starts it, as in architecture.md.
- **Verification environment:** the old Atlas cluster in v1's `.env` no longer resolves (DNS `ENOTFOUND`), so boot/health were verified against a throwaway in-memory MongoDB. The server exited cleanly with a logged error on the failed connection.

### 2026-11-11 — AI provider switched from Anthropic to Google Gemini

Developer decision: use Google Gemini instead of Anthropic while testing, to rely on free tiers.

- **Env:** `ANTHROPIC_API_KEY` → `GEMINI_API_KEY` (required); new optional `GEMINI_MODEL` (default `gemini-3.8-flash`, **unverified as free-tier** — confirm in AI Studio and override in `.env`).
- **Code/docs renamed:** `ai/anthropic.ts` → `ai/gemini.ts`; `@anthropic-ai/sdk` → `@google/genai`; "tool-forced structured output" → "schema-constrained JSON output + Zod". Updated in AGENTS.md, architecture.md, build-plan.md, code-standards.md, library-docs.md, `env.ts`, `.env.example`. No SDK is installed yet (first needed in feature 07).
- **Provisional SDK pattern:** the live Google docs now show the Interactions API (`client.interactions.create`) with `gemini-3.8-flash`, which differs from the `generateContent` style I know. `library-docs.md` marks the call shape as provisional — **verify against the installed `@google/genai` types and live docs at the start of feature 07.** The docs I could fetch gave no free-tier quota numbers; quotas are per project and have been cut before, so check AI Studio.
- **Node ≥ 22** now required (`@google/genai` 3.x engine requirement); root `engines` updated.
- **Privacy caveat:** on Gemini's free tier, submitted content may be used to improve Google's products. Grocery/fridge photos are low-sensitivity, but demo-mode/landing copy should not claim otherwise. Revisit before public launch (paid tier changes data handling).
- **Rate limits:** our own limiter (10/hr per session, 5/hr demo) stays; Google 429s must map to a friendly typed error.
- **Unchanged:** "AI never writes to the DB", Zod validation of every AI response, sharp resize, memory-only uploads, token-usage logging.

### 2026-11-12 — Feature 02 decisions

- **Database name:** `MONGODB_URI` now ends in `/intellipantry` (it had no db name, so Mongoose was using the default `test` database). Any new environment's URI must include the db name.
- **Zod upgraded 3 → 4** (`^4.6.7`) to clear a high-severity advisory (memory exhaustion on oversized constrained collections, fixed in 4.6.6). Done now while only `env.ts`, `errorHandler.ts` and the seed script use Zod. Verified: typecheck, build, boot with `.env`, `/api/health` 200, JSON 404, and the missing-vars exit path. `npm audit` reports 0 vulnerabilities. Zod 4 error text differs from v3 (e.g. "Invalid input: expected string, received undefined").
- **Models:** `User`, `Item`, `Recipe`, `Note` in `server/src/models/`, exported types are `type` aliases (code-standards), all with `timestamps: true` and `index: true` on `user`; extra compound index `{ user: 1, expiry: 1 }` on Item. Enums: Item `source` `manual|ai`, Recipe `source` `user|fridge-chef`.
- **User:** `bcryptjs` v3 (pure JS, ships its own types, no `@types`), cost 12, hash only when `password` is modified. `password` is `select: false` and stripped in `toJSON`, so login must query with `.select('+password')` before `comparePassword`. `email` is trimmed + lowercased; `userName` is trimmed. Both are unique.
- **Seed script:** `server/src/scripts/seedDemoUser.ts` (inside `src` so `tsc` covers it), run with `npm run seed:demo -w server`. Needs only `MONGODB_URI`. Finds the Guest by email `guest@intellipantry.app`, creates it if missing with a random throwaway password (never stored or printed, so nobody can log in as Guest except through `POST /api/auth/demo`), and logs `DEMO_USER_ID=<id>`. Verified against Atlas: run twice, same id, exactly 1 Guest document. The Guest now exists in the `intellipantry` database; the developer pastes the printed id into `.env` as `DEMO_USER_ID`.
- **Workflow rule added to AGENTS.md:** on `main`, create `feature/NN-short-name` before building; on any other branch, ask whether it is the accepted branch for the feature before proceeding.
- **Review (skill) outcome:** no Critical issues. Fixed: `console.*` → `utils/logger.ts`, `interface` → `type`, explicit return types on the `pre('save')` hook and `toJSON` transform. Skipped for now: unit tests for the models (no test setup yet — add them when a test runner is introduced).

#### Carry-overs for feature 03

- **Cap `password` at 72 bytes in the signup Zod schema** (bcryptjs ignores everything after 72 bytes). Measure bytes, not characters (`new TextEncoder().encode(p).length <= 72`), and keep the ≥ 8 minimum. Apply the same cap to the login schema.
- Login must load the user with `.select('+password')`; the default query returns no hash.
- If `autoIndex` is ever turned off for production, run `syncIndexes()` once so the unique `email`/`userName` indexes and the `user` indexes exist.

## Notes

_Add notes here as the build progresses — workarounds, patterns, anything that differs from the context files._
