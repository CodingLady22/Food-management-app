Read @AGENTS.md first — it is the single source of truth for this project.

---

# Memory — Feature 01 (Repo Restructure + Server Scaffold) + Gemini switch

Last updated: 2026-11-11

## What was built

- Commit `1e6d3bb`: AGENTS.md, this CLAUDE.md pointer, and `context/` committed first (before restructuring), with audit decisions recorded in `context/progress-tracker.md`.
- Commit `caba7ce` (feature 01): repo restructured into npm workspaces `server/` + `client/`.
  - `server/src/`: `index.ts`, `config/env.ts` (Zod, exits 1 listing missing var names only), `config/database.ts` (Mongoose 8), `middleware/errorHandler.ts` (Zod→400, HttpError, 500), `routes/health.routes.ts` (`GET /api/health` → `{ok:true}`), `utils/{logger,asyncHandler,httpError}.ts`, `types/api.ts` (copied to `client/src/types/api.ts`).
  - `client/`: minimal Vite + React 18 + TS placeholder, dev proxy `/api` → `localhost:3000`.
  - Root: `package.json` (scripts `dev`/`build`/`start`, `engines.node >=22`), `.env.example`, `.gitignore` (renamed from `.gitIgnore`).
  - v1 EJS app deleted; preserved as **local git tag `v1-final`** (`git show v1-final:<path>`). Not pushed.
- Commit `9ea69e3`: AI provider switched Anthropic → Google Gemini (env + all context docs).
- Working tree: developer changed the `GEMINI_MODEL` default in `server/src/config/env.ts` to `gemini-3.5-flash-lite` (uncommitted at time of saving — commit it with the next change).

## Decisions made

- Greenfield demo/guest user (a normal User document, seeded in feature 02, logged in via `POST /api/auth/demo`). The old `'demo'` hack is dead; a leftover copy exists only as a dangling git blob — do not hunt for it.
- Mongoose upgraded 6 → 8; all callback-style code is rewritten as promises. Fresh DB, no migration.
- Env names are the v2 ones: `MONGODB_URI`, `SESSION_SECRET` (≥32 chars), `GEMINI_API_KEY`, optional `GEMINI_MODEL`, `CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET`, optional `DEMO_USER_ID` (make required in feature 14). `.env` lives at the repo root and is loaded via Node `--env-file-if-exists`; `dotenv` is not a dependency.
- AI provider is Gemini (`@google/genai`), model from `GEMINI_MODEL`, schema-constrained JSON output then Zod. Rate limiter (10/hr, demo 5/hr) stays; Google 429s map to a friendly typed error. Free-tier content may be used by Google to improve products — keep demo copy honest.
- Keep the 3s timeout on the food-quote API (feature 11). `CLAUDE.md` = pointer + per-session memory; `AGENTS.md` = source of truth.
- All of the above are recorded in `context/progress-tracker.md` → "Decisions Made During Build".

## Problems solved

- A large bash heredoc failed to parse; use the Write tool for multi-file scaffolds.
- The old Atlas cluster no longer resolves (DNS `ENOTFOUND`). Boot/health were verified against a throwaway in-memory MongoDB (`mongodb-memory-server`, kept in the session scratchpad, not the repo).
- A blank `GEMINI_MODEL=` line in `.env` used to break `.min(1).default()`; fixed with `z.preprocess` so blank means default.

## Current state

- Works: env validation (refuses to boot without required vars), clean DB-failure exit, `/api/health` 200, JSON 404 for unknown `/api/*`, server typecheck + build, client build.
- Not done: no models, auth, sessions, AI code, Gemini SDK install, or cron yet. Feature 01 is ticked in the tracker.
- Branch: `addContextFiles` (not `main`); nothing pushed.
- The developer will rotate the Mongo and Cloudinary credentials themselves. `config/.env` and `notes.txt` were never committed on any branch; both remain on disk, untracked and ignored. Delete `config/.env` after rotating.

## Next session starts with

Feature 02 — Models + Migration Decision (`context/build-plan.md`): TypeScript models `User`, `Item`, `Recipe`, `Note` with v2 shapes and `user` indexes; promise-based `comparePassword` plus bcrypt pre-save hook; idempotent `scripts/seedDemoUser.ts` that prints the Guest id (its own minimal env — don't depend on `DEMO_USER_ID`). Verify: seed runs twice without duplicating; models compile strict. Commit the pending `env.ts` model-default change first.

## Open questions

- Which Gemini model is actually free for this key? Default is now `gemini-3.5-flash-lite` — confirm in AI Studio.
- Google's docs now show the Interactions API rather than `generateContent`; verify the call shape against the installed `@google/genai` types at the start of feature 07 (`library-docs.md` marks it provisional).
- Push `v1-final` and the branch to GitHub? Merge `addContextFiles` into `main` when?
