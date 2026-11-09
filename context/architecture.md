# Architecture

## Stack

| Layer          | Tool                                  | Purpose                                      |
| -------------- | ------------------------------------- | -------------------------------------------- |
| Frontend       | React 18 + Vite + TypeScript          | SPA                                          |
| Routing        | React Router v7 (library mode)        | Client-side routing                          |
| Server state   | TanStack Query v5                     | API fetching, caching, mutations             |
| Styling        | Tailwind CSS v4 (CSS-native @theme)   | UI styling                                   |
| Backend        | Node.js + Express 4 + TypeScript      | JSON API (converted from EJS monolith)       |
| Database       | MongoDB + Mongoose 8                  | Data persistence                             |
| Auth           | Passport.js (local) + express-session + connect-mongo | Cookie sessions, same-origin |
| AI             | Anthropic API (@anthropic-ai/sdk), Claude vision + tool-based structured output | Snap-to-Add, Fridge Chef |
| Images         | Multer (memory storage) + Cloudinary  | Recipe images; vision uploads never persist  |
| Validation     | Zod                                   | All API input validation, AI output validation |
| Scheduler      | node-cron                             | Nightly demo data reset                      |
| Deployment     | Render (single service)               | Express serves API + built React app         |

**Key decision — single origin monolith:** Express serves the built React app from `client/dist` and the API under `/api/*`. One deploy, no CORS, cookie sessions just work. Do not split into two deployments.

**Key decision — plain Anthropic SDK, not LangChain:** both AI features are single vision calls with structured output. No chains, no graphs. Keep it simple.

---

## Folder Structure

```
/
├── AGENTS.md
├── context/
│   ├── project-overview.md
│   ├── architecture.md
│   ├── code-standards.md
│   ├── library-docs.md
│   ├── build-plan.md
│   └── progress-tracker.md
├── client/                              → Vite React app
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx                      → Router setup
│   │   ├── api/                         → One file per resource, typed fetch wrappers
│   │   │   ├── client.ts               → base fetch wrapper (credentials: 'include', error handling)
│   │   │   ├── auth.ts
│   │   │   ├── items.ts
│   │   │   ├── recipes.ts
│   │   │   ├── notes.ts
│   │   │   └── ai.ts
│   │   ├── hooks/                       → TanStack Query hooks per resource
│   │   ├── pages/                       → One folder per route
│   │   ├── components/                  → Shared UI components
│   │   ├── context/AuthContext.tsx      → Current user state
│   │   └── types/index.ts              → Shared with server via copy (see code-standards)
│   └── vite.config.ts                  → dev proxy /api → localhost:3000
├── server/
│   ├── src/
│   │   ├── index.ts                     → App entry: middleware, routes, static serving, cron
│   │   ├── config/
│   │   │   ├── database.ts
│   │   │   ├── passport.ts
│   │   │   └── demoUser.ts
│   │   ├── models/
│   │   │   ├── User.ts
│   │   │   ├── Item.ts                 → renamed from NewItems
│   │   │   ├── Recipe.ts
│   │   │   └── Note.ts                 → renamed from Comment
│   │   ├── routes/                      → Route definitions only, no logic
│   │   │   ├── auth.routes.ts
│   │   │   ├── items.routes.ts
│   │   │   ├── recipes.routes.ts
│   │   │   ├── notes.routes.ts
│   │   │   └── ai.routes.ts
│   │   ├── controllers/                 → Thin: parse/validate → call service → respond
│   │   ├── services/                    → Business logic, DB access
│   │   ├── ai/
│   │   │   ├── anthropic.ts            → SDK client init
│   │   │   ├── snapToAdd.ts            → image → extracted items
│   │   │   ├── fridgeChef.ts           → image + inventory → recipe suggestions
│   │   │   └── prompts.ts              → All prompt text in one place
│   │   ├── middleware/
│   │   │   ├── auth.ts                 → ensureAuth (returns 401 JSON, no redirects)
│   │   │   ├── demo.ts                 → guest session handling + demo rate limit
│   │   │   ├── upload.ts               → Multer configs (memory for AI, Cloudinary for recipes)
│   │   │   └── errorHandler.ts         → Central error handler, last middleware
│   │   ├── validation/                  → Zod schemas per resource
│   │   └── utils/
│   └── tsconfig.json
└── package.json                         → workspace scripts (dev, build, start)
```

---

## System Boundaries

| Folder                | Owns                                                                     |
| --------------------- | ------------------------------------------------------------------------ |
| `client/src/api/`     | All HTTP calls. Components never call fetch directly.                    |
| `client/src/pages/`   | Route composition only. Data via hooks.                                  |
| `server/routes/`      | URL → controller mapping + middleware chains. Nothing else.              |
| `server/controllers/` | Request/response handling. No DB calls, no business logic.               |
| `server/services/`    | All DB access and business logic. Every query filters by user ownership. |
| `server/ai/`          | All Anthropic calls and prompts. Returns validated typed data or throws. |

---

## API Design

All endpoints under `/api`. JSON in, JSON out. Errors: `{ error: string }` with proper status codes (400 validation, 401 unauthenticated, 403 not owner, 404 not found, 500 server).

### Auth
```
POST   /api/auth/signup          { userName, email, password, confirmPassword }
POST   /api/auth/login           { email, password }
POST   /api/auth/logout
POST   /api/auth/demo            → logs in as shared Guest user
GET    /api/auth/me              → current user or 401
```

### Items (inventory)
```
GET    /api/items                → user's items + computed daysLeft + expiringSoonCount
GET    /api/items/expiring       → items expiring within 7 days
POST   /api/items                → create one item
POST   /api/items/bulk           → create many (used by Snap-to-Add confirm step)
PUT    /api/items/:id            → owner-only
DELETE /api/items/:id            → owner-only
```

### Recipes
```
GET    /api/recipes              → user's recipes
GET    /api/recipes/feed         → all recipes, newest first, + food quote
GET    /api/recipes/saved        → user's saved recipes
POST   /api/recipes/:id/save     → add to saved list
DELETE /api/recipes/:id/save     → remove from saved list
POST   /api/recipes              → multipart (image) — create
GET    /api/recipes/:id
PUT    /api/recipes/:id          → owner-only, optional new image
DELETE /api/recipes/:id          → owner-only
```

### Notes
```
GET    /api/notes
POST   /api/notes
GET    /api/notes/:id            → owner-only
PUT    /api/notes/:id            → owner-only
DELETE /api/notes/:id            → owner-only
```

### AI
```
POST   /api/ai/snap-to-add       → multipart image → { items: ExtractedItem[] } (nothing saved yet)
POST   /api/ai/fridge-chef       → multipart image → { suggestions: RecipeSuggestion[] }
```

---

## Data Flow

### Snap-to-Add

```
User uploads grocery/receipt photo
        ↓
POST /api/ai/snap-to-add (Multer memory storage, max 10MB, jpeg/png/webp only)
        ↓
ai/snapToAdd.ts → Claude vision call with tool-forced structured output
        ↓
Zod-validate the AI response → ExtractedItem[]
  { name, quantity, unit, estimatedExpiryDate, confidence }
        ↓
Return to client — NOT saved to DB
        ↓
Client renders editable preview table → user edits/removes rows → Confirm
        ↓
POST /api/items/bulk → validated → saved with user id from session
```

**Rule: the AI never writes to the database. Users confirm everything.**

### Fridge Chef

```
User uploads fridge photo
        ↓
POST /api/ai/fridge-chef
        ↓
Service loads user's current inventory (name, quantity, daysLeft)
        ↓
ai/fridgeChef.ts → Claude vision call: photo + inventory summary in prompt
        ↓
Zod-validate → RecipeSuggestion[]
  { title, description, usesExpiring: string[], onHand: string[], missing: string[], steps: string[] }
        ↓
Return to client → user can "Save as recipe" → POST /api/recipes (no image required for AI recipes)
```

### Standard CRUD

```
Component → TanStack Query hook → client/src/api/* → /api/* route
→ ensureAuth → Zod validation → controller → service (ownership-filtered query)
→ JSON response → Query cache invalidation
```

---

## Database Schema (Mongoose)

### User (unchanged shape)
| Field        | Type       | Notes                        |
| ------------ | ---------- | ---------------------------- |
| userName     | String     | unique                       |
| email        | String     | unique, lowercase            |
| password     | String     | bcrypt hash, pre-save hook   |
| savedRecipes | [ObjectId] | ref Recipe                   |

### Item (was NewItems)
| Field        | Type     | Notes                                              |
| ------------ | -------- | -------------------------------------------------- |
| name         | String   | was `itemInput`                                    |
| quantity     | Number   |                                                    |
| unit         | String   |                                                    |
| purchaseDate | Date     |                                                    |
| expiry       | Date     |                                                    |
| source       | String   | 'manual' \| 'ai' — track Snap-to-Add adoption      |
| user         | ObjectId | ref User, **indexed**. Demo user is a real User doc — kills the v1 Mixed-type hack |

### Recipe (cleaned)
| Field        | Type     | Notes                                   |
| ------------ | -------- | --------------------------------------- |
| title        | String   |                                          |
| image        | String   | Cloudinary URL, **optional** in v2       |
| cloudinaryId | String   | optional                                 |
| prep/cook/total/serving | String |                              |
| ingredients  | [String] | was a single string — now an array      |
| instructions | [String] | now an array                            |
| note         | String   |                                          |
| hashtags     | [String] | v1 stored a string despite the name — fix |
| source       | String   | 'user' \| 'fridge-chef'                 |
| user         | ObjectId | ref User, indexed                        |

### Note (was Comment)
| Field   | Type     | Notes            |
| ------- | -------- | ---------------- |
| title   | String   |                  |
| body    | String   | was `comment`    |
| user    | ObjectId | ref User, indexed |

**Migration note:** this is a portfolio app — old production data doesn't need preserving. Write a small one-off migration script only if the existing MongoDB data should carry over; otherwise start with a fresh database and seed the demo user.

---

## v1 Bugs That Must Not Survive the Rewrite

These exist in the old controllers. Every one is fixed by the service-layer rules above, but they are listed so no pattern gets copied over:

1. **IDOR everywhere** — `getOneComment`, `updateComment`, `deleteComment`, `singleRecipe` (edit), `updateRecipe`, `deleteRecipe` never check ownership. Any logged-in user could modify anyone's data by ID. v2 rule: every single-document query includes `user: req.user._id`.
2. **`editComments` fetched ALL comments** (`Comment.find()` with no filter) — leaked every user's notes.
3. **Callback-style Mongoose** in `postSignup` (`User.findOne(query, callback)`) — throws on Mongoose 7+.
4. **Hardcoded session secret** ("keyboard cat") — must come from `SESSION_SECRET` env var; server refuses to start without it.
5. **`deleteRecipe` deletes twice** and calls `err.status(500)` (crashes — `err` has no `.status`).
6. **Unreachable code**: `res.redirect` after `return res.status(500)` in several catch blocks.
7. **`hashtagsArray` is a string** — `.split().join(' ')` produces a string, not the array the schema name implies.
8. **`NewItem.user` as Mixed type** for the demo hack — replaced by making Guest a normal User document.
9. **50s axios timeout** on the quote API (`50000`) in `recipeFeed` — v2: 3s timeout, quote failure never blocks the feed.
10. **Dead `UploadedRecipe` model** — do not port.
