# Library Docs

Project-specific usage patterns for third party libraries. Read the relevant section before implementing any feature that touches these libraries.

Order of authority:

```
MCP server (real-time docs) → Skills via AGENTS.md → This file → General training knowledge
```

Never rely on training knowledge alone for library APIs — verify against current docs, especially for the Anthropic SDK and Mongoose 8.

---

## @anthropic-ai/sdk

### Client init — `server/src/ai/anthropic.ts`

```typescript
import Anthropic from "@anthropic-ai/sdk";
import { env } from "../config/env";

export const anthropic = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
export const MODEL = "claude-sonnet-4-6";
```

### Vision + structured output pattern (used by BOTH AI features)

Send the image as base64, force a tool call, Zod-validate the tool input:

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

export async function extractItemsFromImage(
  imageBase64: string,
  mediaType: "image/jpeg" | "image/png" | "image/webp"
): Promise<z.infer<typeof SnapResultSchema>> {
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 2000,
    tools: [
      {
        name: "record_food_items",
        description: "Record the food items identified in the image",
        input_schema: {
          type: "object",
          properties: {
            items: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  quantity: { type: "number" },
                  unit: { type: "string", enum: ["pcs", "g", "kg", "ml", "l", "pack"] },
                  estimatedExpiryDate: { type: "string", description: "ISO date, today + typical shelf life" },
                  confidence: { type: "string", enum: ["high", "medium", "low"] },
                },
                required: ["name", "quantity", "unit", "estimatedExpiryDate", "confidence"],
              },
            },
          },
          required: ["items"],
        },
      },
    ],
    tool_choice: { type: "tool", name: "record_food_items" },
    messages: [
      {
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: mediaType, data: imageBase64 } },
          { type: "text", text: SNAP_TO_ADD_PROMPT }, // from prompts.ts, includes today's date
        ],
      },
    ],
  });

  const toolUse = response.content.find((b) => b.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") throw new AIExtractionError("No tool call in response");
  return SnapResultSchema.parse(toolUse.input); // Zod is the gate — AI output is untrusted
}
```

Fridge Chef follows the identical pattern with a `suggest_recipes` tool; the prompt additionally embeds a plain-text summary of the user's inventory with days-left, and instructs the model to prioritise expiring items.

### Rules

- Always include today's date in prompts (the model can't know it) — needed for expiry estimation
- Log `response.usage.input_tokens` / `output_tokens` after every call
- Resize images server-side with `sharp` to max 1568px on the long edge before sending — cuts token cost significantly on phone photos

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
