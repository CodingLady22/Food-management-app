# Library Docs

Project-specific usage patterns for third party libraries. Read the relevant section before implementing any feature that touches these libraries.

Order of authority:

```
MCP server (real-time docs) → Skills via AGENTS.md → This file → General training knowledge
```

Never rely on training knowledge alone for library APIs — verify against current docs, especially for the Google GenAI SDK and Mongoose 8.

---

## @google/genai (Gemini)

> **Provider switch (2026-11-11):** the project moved from Anthropic to Google Gemini to use free-tier quotas while testing. The previous Anthropic tool-forced pattern is retired. The SDK was at `@google/genai` 3.x (Node ≥ 22) when this was written, and Google's current docs steer towards the **Interactions API** (`client.interactions.create`) rather than `generateContent`. **The exact call shape below is provisional — verify it against the installed SDK types and the live docs at the start of feature 07, then replace this section with the verified code.** Never rely on training knowledge for this SDK.

### Client init — `server/src/ai/gemini.ts`

```typescript
import { GoogleGenAI } from "@google/genai";
import { env } from "../config/env.js";

export const gemini = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
export const MODEL = env.GEMINI_MODEL; // configurable — free-tier model names and quotas change; check AI Studio
```

### Vision + structured output pattern (used by BOTH AI features)

Send the image as base64 with its mime type plus the prompt, request **JSON output constrained by a schema**, then `JSON.parse` and **Zod-validate**. Zod stays the gate — provider-side schema support is best-effort and constraints such as `minLength`/`maxLength`/`uniqueItems` are stripped rather than enforced, so every limit must also live in the Zod schema.

```typescript
import { z } from "zod";

const ExtractedItemSchema = z.object({
  name: z.string().min(1),
  quantity: z.number().positive(),
  unit: z.enum(["pcs", "g", "kg", "ml", "l", "pack"]),
  estimatedExpiryDate: z.string(), // ISO date, AI estimates typical shelf life
  confidence: z.enum(["high", "medium", "low"]),
});
const SnapResultSchema = z.object({ items: z.array(ExtractedItemSchema).max(40) });

// Shape of the call (verify in feature 07):
//   model: MODEL
//   input/contents: [ { text: SNAP_TO_ADD_PROMPT /* includes today's date */ },
//                     { image, base64 data, mime_type } ]
//   response format: JSON (application/json) + JSON schema of SnapResultSchema
//   → text = response output text → SnapResultSchema.parse(JSON.parse(text))
// Any throw (no text, bad JSON, Zod failure, provider error) → AIExtractionError → 502.
```

Fridge Chef follows the identical pattern with a `RecipeSuggestion[]` schema; the prompt additionally embeds a plain-text summary of the user's inventory with days-left, and instructs the model to prioritise expiring items.

### Rules

- Always include today's date in prompts (the model can't know it) — needed for expiry estimation
- Log token usage (input/output) after every call, using whatever usage fields the SDK response exposes
- Resize images server-side with `sharp` to max 1568px on the long edge before sending — cuts token cost significantly on phone photos
- The model id comes from `GEMINI_MODEL`, never hardcoded in service code
- Provider `429`/quota errors are expected on the free tier (limits are per project and low) — map them to a friendly typed error (`429`/`503`), never surface raw provider messages
- **Privacy:** on Gemini's free tier, submitted content may be used by Google to improve its products. Do not send anything sensitive; keep the demo-mode copy honest about this (see progress-tracker decision)

---

## Mongoose 8

- **Promises only** — callbacks were removed in v7. `await Model.findOne(...)`, never `Model.findOne(query, cb)` (v1 did this; it now throws)
- `.lean()` on every read that only renders data
- Define indexes in schemas: `user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true }`
- Compound ownership filters per code-standards.md — no bare `findById` on user-owned collections
- Connection in `config/database.ts`; exit process on initial connection failure

---

## Passport + express-session

- Local strategy only, unchanged logic from v1 (bcrypt compare in User model method)
- Session store: `connect-mongo` pointing at the same MongoDB
- **API-mode auth middleware** — the SPA owns redirects:

```typescript
export function ensureAuth(req: Request, res: Response, next: NextFunction): void {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ error: "Not authenticated" });
}
```

- `POST /api/auth/demo` performs `req.logIn(guestUser)` where guestUser is fetched by `DEMO_USER_ID` env var — the demo user is a normal User document, no fake middleware, no Mixed types

---

## Multer

Two configs in `middleware/upload.ts`:

```typescript
export const aiImageUpload = multer({
  storage: multer.memoryStorage(),           // buffer only, never touches disk
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: imageOnlyFilter,               // jpeg/png/webp
});

export const recipeImageUpload = multer({ /* Cloudinary flow, same limits/filter */ });
```

---

## Cloudinary

- Keep the v1 flow: upload on create, `destroy(oldPublicId)` before replacing on update, `destroy` on delete
- v2 fix: recipe image is optional (Fridge Chef recipes have none) — guard all Cloudinary calls with `if (recipe.cloudinaryId)`

---

## TanStack Query v5

- One `QueryClient` in `main.tsx`, defaults: `staleTime: 30_000`, `retry: 1`
- Query keys centralised in `hooks/queryKeys.ts`:

```typescript
export const keys = {
  me: ["me"] as const,
  items: ["items"] as const,
  expiring: ["items", "expiring"] as const,
  recipes: ["recipes"] as const,
  feed: ["recipes", "feed"] as const,
  saved: ["recipes", "saved"] as const,
  recipe: (id: string) => ["recipes", id] as const,
  notes: ["notes"] as const,
};
```

- Mutations invalidate their list key; bulk item creation invalidates both `items` and `expiring`

---

## Vite

- Dev proxy in `vite.config.ts`: `/api` → `http://localhost:3000` (cookies work in dev without CORS)
- Production: `vite build` → Express serves `client/dist` with an SPA fallback (`app.get("*", ...)` after API routes)

---

## node-cron

- Unchanged from v1: `0 0 * * *` deletes all Items belonging to the demo user
- v2 additions: also wipe demo user's Notes and Fridge Chef-generated Recipes; wrap in try/catch + logger

---

## express-rate-limit

- AI routes only: keyed by session ID, 10/hour (5/hour when `req.user._id` equals demo user id)
- 429 response: `{ error: "AI limit reached. Try again later." }`
