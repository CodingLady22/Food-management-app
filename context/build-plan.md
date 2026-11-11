# Build Plan

## Core Principle

Backend-first per phase, but every feature ends user-visible and testable. The API for a resource is built and verified (via curl/REST client) in the same feature as the UI that consumes it — no invisible backend phases that span multiple features. One feature at a time, in order.

UI in this plan describes **functionality only** — layout, styling, and visual design come from the separate UI context files (to be added later). Build functional-but-plain UI; do not invent visual design.

---

## Phase 1 — Foundation

### 01 Repo Restructure + Server Scaffold

**Logic:**

- Create `client/` and `server/` folders per architecture.md
- `server/`: TypeScript, Express app skeleton, `config/env.ts` (Zod-validated env: `MONGODB_URI`, `SESSION_SECRET`, `GEMINI_API_KEY`, `GEMINI_MODEL` (optional), `CLOUDINARY_*`, `DEMO_USER_ID`), database connection, logger util, asyncHandler, central errorHandler
- `.env.example` with every key
- Root package.json scripts: `dev` (concurrently server + Vite), `build`, `start`
- Health route `GET /api/health` → `{ ok: true }`

**Verify:** server boots, refuses to boot with a missing env var, health route responds.

---

### 02 Models + Migration Decision

**Logic:**

- Port models to TypeScript with v2 shapes (architecture.md): `User`, `Item`, `Recipe`, `Note`
- User model: bcrypt pre-save hook + `comparePassword` method (promise-based — v1's callback version is dead)
- Indexes on every `user` field
- Delete: `UploadedRecipe`, the `Mixed` user type, `createDemoUser.js`'s file-writing hack
- New `scripts/seedDemoUser.ts`: idempotently creates the Guest user, prints its id for `DEMO_USER_ID`
- Fresh database (portfolio app) — no data migration

**Verify:** seed script runs twice without duplicating; models compile strict.

---

### 03 Auth API

**Logic:**

- Passport local strategy + session config (connect-mongo, secure cookie settings from code-standards)
- Routes: signup, login, logout, `me`, demo — per architecture.md
- Zod schemas: signup (email format, password ≥ 8, match confirm, userName), login
- Duplicate email/username check with promise syntax (v1 bug #3)
- `POST /api/auth/demo` logs in the seeded Guest user

**Verify:** full curl flow — signup → me → logout → me (401) → login → demo login.

---

### 04 React Scaffold + Auth UI

**UI (functional):**

- Vite + TS + Tailwind v4 + React Router + TanStack Query wired up
- Pages: Home (logged-out landing with Login / Signup / Try Demo actions), Login, Signup
- `AuthContext` from `GET /api/auth/me`; `ProtectedRoute` wrapper; navbar with auth-aware links + logout
- Demo banner component shown when logged in as Guest

**Logic:**

- api/client.ts base wrapper (JSON, credentials, typed errors)
- Login/signup forms with field-level validation errors from the API
- After login/signup/demo → `/dashboard`

**Verify:** in the browser — signup, logout, login, demo login, protected route redirect.

---

## Phase 2 — Inventory

### 05 Items API

**Logic:**

- Routes/controllers/services for items per architecture.md, ownership-filtered everywhere
- `GET /api/items` computes `daysLeft` per item (server-side, single place — port the v1 math, fix: expired = `timeDiff <= 0`) and `expiringSoonCount`
- `GET /api/items/expiring` — 0 < daysLeft ≤ 7
- Date validation in Zod schema: purchase ≤ today, expiry ≥ today, expiry ≥ purchase (v1 flash-message logic becomes 400 responses)
- `POST /api/items/bulk` — array of items, all-or-nothing validation, `source: 'ai'`

**Verify:** curl CRUD + bulk; cross-user access attempt returns 404.

---### 06 Dashboard UI

**UI (functional):**

- Items table: name, quantity+unit, purchase date, expiry date, days-left badge (normal / warning ≤7 / expired)
- Add-item form (manual path), edit (inline or per-item page), delete with confirm
- Expiring-soon count summary + link to `/dashboard/expiring` filtered view

**Logic:**

- Query hooks + mutations with cache invalidation
- Server validation errors displayed on the form

**Verify:** full CRUD in browser as real user and as demo user.

---

## Phase 3 — AI Features

### 07 Snap-to-Add API

**Logic:**

- `ai/gemini.ts`, `ai/prompts.ts`, `ai/snapToAdd.ts` per library-docs.md pattern (verify the Gemini SDK call shape against installed types + live docs first)
- `sharp` resize before sending; Multer memory upload middleware; rate limiter
- `POST /api/ai/snap-to-add` returns extracted items — saves nothing
- Prompt requirements: identify food items only, estimate quantity + sensible unit, estimate expiry as today + typical shelf life for that food, mark confidence, ignore non-food objects; handles both grocery photos and receipts
- Token usage logging

**Verify:** curl with a real grocery photo and a receipt photo; junk photo (e.g. a desk) returns empty/low-confidence items; rate limit triggers.

---

### 08 Snap-to-Add UI

**UI (functional):**

- "Snap to Add" action on dashboard → image picker (mobile: camera capture attribute)
- Loading state during extraction
- **Review table**: every extracted item as an editable row (name, quantity, unit, expiry date), low-confidence rows visually flagged, remove-row, add-row
- Confirm → bulk create → back to dashboard with new items present

**Logic:**

- Multipart upload from the client; graceful 429 and 502 error states

**Verify:** end-to-end photo → review → edit a row → confirm → items on dashboard.

---

### 09 Fridge Chef API

**Logic:**

- `ai/fridgeChef.ts`: loads user inventory summary (names + daysLeft), embeds in prompt, vision call with a `RecipeSuggestion[]` JSON schema → 3 suggestions per the schema in architecture.md
- Prompt requirements: only suggest recipes plausible from visible + tracked ingredients; explicitly prioritise items expiring within 7 days; list what's on hand vs missing; short step list
- Same upload/rate-limit/validation stack as 07

**Verify:** curl with fridge photo while inventory has expiring items — suggestions reference them.

---

### 10 Fridge Chef UI

**UI (functional):**

- `/fridge-chef` page: upload → loading → 3 suggestion cards (title, why-this, uses-expiring highlights, on-hand vs missing lists, steps)
- "Save as recipe" per card → creates a Recipe (`source: 'fridge-chef'`, no image) → link to it

**Verify:** end-to-end including saving a suggestion and seeing it in `/recipes`.

---

## Phase 4 — Recipes

### 11 Recipes API

**Logic:**

- Full CRUD per architecture.md, ownership on mutations, optional image (Cloudinary flow guarded per library-docs)
- Ingredients + instructions as arrays; hashtags as a real string array (v1 bug #7)
- Feed endpoint: newest first, populated author userName only (not full user docs), quote fetched with 3s timeout and safe fallback
- Save/unsave endpoints using `$addToSet` / `$pull`

**Verify:** curl CRUD, feed, save/unsave; image replace deletes old Cloudinary asset.

---

### 12 Recipes UI

**UI (functional):**

- `/recipes` my-recipes list; create/edit form with dynamic ingredient + instruction rows and optional image upload
- `/recipes/feed` public feed with author, save/unsave toggle, quote display
- `/recipes/saved` saved list with unsave
- `/recipes/:id` full view; edit/delete only visible to the owner

**Verify:** two accounts in two browsers — A creates, B saves from feed, B cannot edit A's recipe.

---

## Phase 5 — Notes + Ship

### 13 Notes API + UI

**Logic + UI (functional):**

- Full CRUD per architecture.md (the v1 comments feature, renamed, with bugs #1/#2 fixed by construction)
- Simple list + create/edit/delete pages

**Verify:** CRUD in browser; cross-user access returns 404.

---

### 14 Demo Hardening + Cron

**Logic:**

- Nightly cron: wipe demo user's Items, Notes, and fridge-chef Recipes; try/catch + log
- Demo AI rate limit (5/hour) confirmed
- Manual `scripts/resetDemo.ts` for on-demand reset before sending the link to someone

**Verify:** run reset script, confirm wipe; demo login still works after.

---

### 15 Production Build + Deploy

**Logic:**

- Express serves `client/dist` + SPA fallback after API routes
- Render deploy: build command runs both builds; env vars set; secure cookies verified behind Render's proxy (`app.set('trust proxy', 1)`)
- Smoke test every feature on the live URL, including both AI features and demo mode

**Verify:** live URL works logged-out → demo → real account, AI features respond.
