# Progress Tracker

Update this file after every completed feature. Any AI agent reading this should immediately know what is done, what is in progress, and what is next.

---

## Current Status

**Phase:**
**Last completed:**
**Next:** 01 Repo Restructure + Server Scaffold

---

## Progress

### Phase 1 — Foundation

- [ ] 01 Repo Restructure + Server Scaffold
- [ ] 02 Models + Migration Decision
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
| 9 | No Zod, sharp, express-rate-limit, @anthropic-ai/sdk in package.json; Tailwind is v3. | Added/upgraded by the features that need them. |
| 10 | Quote API has two timeouts in v1 (50000 ms and 5000 ms). | **Keep the 3s timeout** from the plan (bug #9, feature 11). |
| 11 | Session secret hardcoded `"keyboard cat"`; `dotenv.config()` runs after imports; no cookie flags / `trust proxy`. | Fixed by `config/env.ts` (Zod, required `SESSION_SECRET`) in feature 01 and session config in feature 03. |
| 12 | `middleware/multer.js` uses diskStorage with `fileFilter` on the storage (never runs), no size limit. | Replaced by `upload.ts` (memory storage, size + mime limits) in feature 07/11. |
| 13 | No `.agents/skills/` in the repo; no MongoDB MCP connector configured. | Follow the loop manually (plan → build → self-review → tracker). Skills available as Claude Code skills in-session. |

**Secrets check (git history, all branches):** `config/.env` and `notes.txt` were **never committed**. `config/.env` is correctly ignored. `notes.txt` is untracked and lists plaintext test-account passwords — the developer will rotate the Mongo and Cloudinary credentials regardless as a precaution.

**Entry files:** `AGENTS.md` is the single source of truth. `CLAUDE.md` is a one-line pointer to it; per-session notes from the `remember` skill are saved to `CLAUDE.md` and restored from it.

---

## Notes

_Add notes here as the build progresses — workarounds, patterns, anything that differs from the context files._
