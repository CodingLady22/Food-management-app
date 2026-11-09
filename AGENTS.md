# AGENTS.md

This is the entry point for any AI agent (Claude Code) working on IntelliPantry. Read this first, every session.

---

## What This Project Is

IntelliPantry is an AI-powered pantry manager that helps users waste less food. It is a **v2 rebuild** of a 4-year-old Express + EJS monolith into a React SPA + Express JSON API, with two new AI vision features: **Snap-to-Add** (photograph groceries/receipts → inventory fills itself after user review) and **Fridge Chef** (photograph fridge contents → recipes that rescue expiring food). A demo/guest mode lets recruiters try it without signing up.

Full detail is in `context/`. Read these before building:

1. `context/project-overview.md` — what it does and why (app name there is "FreshTrack" — superseded: the app is **IntelliPantry**)
2. `context/architecture.md` — stack, folders, API design, data flow, schema, **and the v1 bug blocklist**
3. `context/code-standards.md` — how to write code here, including the non-negotiable security rules
4. `context/library-docs.md` — how this project uses each library (Anthropic SDK vision pattern lives here)
5. `context/ui-tokens.md`, `context/ui-rules.md`, `context/ui-registry.md` — UI tokens, rules, and page blueprints
6. `context/designs/landing-page.png`, `context/designs/inventory.png` — the two design mockups; `ui-rules.md` Rule Zero governs how to read them (directional, never copy their text)
7. `context/build-plan.md` — the 15-feature plan, in order
8. `context/progress-tracker.md` — what's done and what's next

---

## The v1 Codebase — Handle With Gloves

The repo currently contains the old EJS app (controllers, models, views, server.js). It is **reference material for behavior, not a source to copy from**:

- `context/architecture.md` ends with a numbered list of 10 v1 bugs (IDOR on comments/recipes, callback-style Mongoose, hardcoded session secret, double-delete, dead code…). **Never port a pattern from v1 without checking it against that list.**
- Feature 01 restructures the repo into `client/` + `server/`. Old EJS views and dead models (`UploadedRecipe`) are deleted per the build plan, not migrated.
- This is a fresh database build — no data migration unless the developer says otherwise.

---

## First Session — Repo Audit (do this once, before feature 01)

The context files were written from the controllers and an app summary, not the full repo. Before starting feature 01:

1. Map the actual repo: `server.js`, `routes/`, `models/`, `middleware/`, `config/`, `package.json` scripts and dependency versions.
2. Diff reality against `context/architecture.md` assumptions (model field names, demo-user mechanism, cron job, session setup).
3. Report any mismatch to the developer and record the resolution in `context/progress-tracker.md` under "Decisions Made During Build" — **do not silently adapt the plan**.
4. Confirm whether `.agents/skills/` exists (see Skills below) and which MCP connectors are configured.

---

## How To Work

- **One feature at a time**, in the order in `context/build-plan.md`. Fifteen features, five phases.
- **Read context before coding.** Never assume an API or pattern — verify against the context files.
- **Backend verified, then UI** — each feature's API is proven with curl/REST client before the UI consuming it is built, and every feature ends user-visible and testable (the "Verify" line in each build-plan feature is the exit criterion).
- **Update `context/progress-tracker.md`** after every completed feature.
- **Respect the security rules** in `code-standards.md` and the bug blocklist in `architecture.md` — they are not optional.
- **AI features run on real photos during development** (a grocery photo, a fridge photo, a junk photo) — never mark 07–10 done on code inspection alone.
- **UI copy comes from `ui-rules.md`**, never from the mockups (they contain AI-generated typos and filler).

---

## Skills — The Engineering Loop

If `.agents/skills/` exists in this repo (from https://github.com/JavaScript-Mastery-Pro/skills), use the loop; they are files to read and follow, not slash commands:

| Skill (file) | When to use |
| ----- | ----------- |
| `architect` (`.agents/skills/architect/SKILL.md`) | Before each feature in `build-plan.md` — confirm the plan before code |
| `remember` (`.agents/skills/remember/SKILL.md`) | Restore at session start, save at session end (`memory.md` at repo root) |
| `review` (`.agents/skills/review/SKILL.md`) | After each feature, before ticking it off in `progress-tracker.md` |
| `imprint` (`.agents/skills/imprint/SKILL.md`) | After each UI component — it maintains `context/ui-registry.md`; don't fill that file by hand |
| `recover` (`.agents/skills/recover/SKILL.md`) | When something breaks — diagnose before patching |

The loop:

```
architect  →  Build  →  review  →  Ship
                 ↓
imprint   (after every UI component)
remember  (start and end of every session)
recover   (when something breaks)
```

If the skills folder does not exist, follow the same discipline manually: plan → build → self-review against the context files → update tracker.

Order of authority for library usage:

```
MCP server (real-time) → Skills (this repo) → context/library-docs.md (project rules) → general knowledge
```

Never rely on training knowledge alone for the Anthropic SDK, Mongoose 8, or Tailwind v4 APIs.

---

## MCP Connectors

If any of these are configured, prefer them over manual work:

- **MongoDB** — schema/index work and queries
- (others as added)

---

## Hard Safety Rules (never break)

- **The AI never writes to the database.** Snap-to-Add returns extracted items for the user to review and edit; only the user's confirm triggers `POST /api/items/bulk`. Fridge Chef suggestions are saved only by an explicit user action.
- **Every AI response is Zod-validated** before it reaches a client. AI output is untrusted input. Validation failure → typed 502, never raw errors to users.
- **Every single-document query on user-owned data is ownership-filtered** (`{ _id, user }`). No bare `findById` on Items, Recipes, Notes. Cross-user access returns 404.
- **All secrets from env vars** (`config/env.ts`, Zod-validated at boot; server refuses to start if missing). Never in code, never in the DB, never in the frontend. Never commit `.env`.
- **All Anthropic calls go through `server/src/ai/`**; all prompts live in `ai/prompts.ts`; token usage is logged on every call.
- **AI routes are rate-limited** (10/hr per session; 5/hr for the demo user). The demo is public and AI calls cost money — never remove the limiter "temporarily".
- **Demo user is a normal User document**; its data (Items, Notes, fridge-chef Recipes) is wiped nightly by cron. Never special-case `'demo'` string ids — that v1 hack is dead.
- **Vision image buffers are never persisted** — memory storage only, resized with sharp, discarded after the call.

---

## Stack At A Glance

React 18 + Vite + Tailwind v4 + React Router v7 + TanStack Query v5 (client) · Node + Express 4 + TypeScript strict (server) · MongoDB + Mongoose 8 · Passport local + express-session + connect-mongo (same-origin cookie auth — Express serves `client/dist`, one Render deploy) · @anthropic-ai/sdk with `claude-sonnet-4-6` vision + tool-forced structured output · Zod everywhere · Multer + sharp + Cloudinary · node-cron · express-rate-limit. REST API under `/api`.
