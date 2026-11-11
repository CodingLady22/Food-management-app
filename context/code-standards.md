# Code Standards

Implementation rules for the entire project. The AI agent must follow these in every session without exception. These rules prevent pattern drift across sessions.

---

## Engineering Mindset

- **Think before implementing** — understand what is being built and why before writing a single line
- **Read context files first** — never assume, always verify against architecture.md and project-overview.md
- **Scope is sacred** — only build what the current feature requires
- **Every feature must be testable** — if it cannot be verified immediately after implementation, it is incomplete
- **One thing at a time** — complete one feature fully before touching the next
- **This is a rewrite, not a port** — never copy v1 controller code. The v1 bug list in architecture.md is a blocklist, not a reference.

---

## TypeScript (client and server)

- Strict mode enabled — no exceptions
- Never use `any` — use `unknown` and narrow
- No type assertions (`as X`) unless unavoidable and commented why
- All function parameters and return types explicitly typed
- `type` for object shapes and unions; `interface` only for extendable component props
- `const` by default
- Shared API types (request/response shapes) live in `server/src/types/api.ts` and are copied verbatim to `client/src/types/api.ts`. When one changes, change both in the same commit. (No monorepo package tooling — keep it simple.)

---

## Security Rules (non-negotiable)

These exist because v1 violated every one of them:

1. **Ownership on every query.** Any service function touching a single document uses `Model.findOne({ _id, user: userId })` — never bare `findById` for user-owned data. Update/delete: `findOneAndUpdate`/`findOneAndDelete` with the same compound filter. Missing → 404 (never reveal the document exists).
2. **All secrets from env.** `SESSION_SECRET`, `MONGODB_URI`, `GEMINI_API_KEY`, `CLOUDINARY_*`. On boot, validate required env vars with Zod (`config/env.ts`); crash with a clear message if missing.
3. **Validate every request body with Zod** before it reaches a service. Validation failure → 400 with field-level messages.
4. **Validate every AI response with Zod** before it reaches the client. AI output is untrusted input.
5. **Upload limits:** images max 10MB, mimetype allowlist (jpeg/png/webp), Multer memory storage for AI endpoints — image buffers are never written to disk or DB.
6. **Rate-limit AI endpoints** (express-rate-limit): 10 req/hour per session for real users, 5/hour for the demo user. AI calls cost money; the demo is public.
7. **Session cookies:** `httpOnly: true`, `secure: true` in production, `sameSite: 'lax'`.
8. **Never log secrets, passwords, or full request bodies.**

---

## Express Conventions

- Routes files contain only route definitions and middleware chains
- Controllers: parse → validate (Zod) → call service → respond. No DB imports in controllers
- Services own all Mongoose access
- Async errors: wrap controllers with a shared `asyncHandler`; the central `errorHandler` middleware is the only place that formats 500s
- API responses are always JSON — never `res.redirect`, never `res.render` (the SPA owns navigation)
- No `console.log` in committed code — use a tiny logger util (`utils/logger.ts`) so log levels can be silenced in tests

---

## React Conventions

- Function components only
- Data fetching only through TanStack Query hooks in `client/src/hooks/` — components never call fetch or the api layer directly
- Mutations invalidate the relevant query keys — query keys defined once in `client/src/hooks/queryKeys.ts`
- Forms: controlled components + Zod validation on submit (reuse the same schemas as the server where shapes match)
- Auth state from `AuthContext` (populated by `GET /api/auth/me` on load); protected routes redirect to `/login`
- Loading and error states are mandatory for every query — no blank screens
- Keep components under ~150 lines; extract when bigger

---

## AI Code Conventions

- All prompts live in `server/src/ai/prompts.ts` — never inline prompt strings in services
- Every AI call uses **schema-constrained JSON output** (JSON response type + the desired JSON schema), then `JSON.parse` and Zod-validate — never parse free text
- Every AI function: try/catch → on failure return a typed error the controller maps to `502 { error: "AI extraction failed, please try again" }` — AI failures never crash the server and never surface raw API errors to users
- Model: read from `GEMINI_MODEL` (env) for both features — never hardcode a model id in services. Set an explicit max output token limit
- Log token usage (input/output) per call via the logger — cost visibility from day one

---

## File and Folder Naming

- Folders: kebab-case
- React components: PascalCase — `ItemTable.tsx`
- Everything else: camelCase — `snapToAdd.ts`, `items.routes.ts`
- One component per file

---

## Git

- One feature per commit, message format: `feat(scope): description`, `fix(scope): ...`
- Never commit `.env` — commit `.env.example` with every required key listed
