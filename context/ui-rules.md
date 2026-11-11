# UI Rules

Rules for building IntelliPantry UI. Two design mockups exist (`context/designs/`): the landing page and the inventory page. **These two define the design language for the entire app.** Every other page is described as a written blueprint below — build it from the blueprint using the tokens and patterns from the mockups. Never invent a new visual pattern when an existing one fits.

---

## Rule Zero — The Mockups Are Directional

The mockups are AI-generated concepts. Follow their layout, color, and mood — but:

- **Never copy text from the mockups.** They contain typos ("Waster Less") and garbled filler ("aAI-powered pantry itow"). All copy comes from this file or is written fresh, on-brand: friendly, short, food-waste focused. Hero headline is **"Waste Less. Taste More."**
- **Naming is canonical from context files, not mockups.** The mockups say "Comments" in one nav and "Notes" in another, and show "Inventory" and "Dashboard" as separate pages. Canonical: the inventory page **is** the dashboard (route `/dashboard`, nav label **"Inventory"**), and notes are **"Notes"** everywhere.
- App name: **IntelliPantry** (supersedes the FreshTrack working name in project-overview.md).

---

## Font

Import Plus Jakarta Sans from Google Fonts in `index.css`. Never use system fonts as primary.

---

## Layout

- Page max-width: 1280px, centered, 24px side padding (16px on mobile)
- Navbar: 64px, `bg-surface`, bottom border `border-border`, sticky
- Gap between page sections/cards: 24px
- All pages: top navbar only — no sidebar
- Responsive: the app must be fully usable on mobile (users photograph groceries with their phone). Tables collapse to stacked cards below 768px; two-column layouts stack.

---

## Navbar

Logged in: logo + **Inventory · Fridge Chef · Recipes · Notes** + profile menu (userName, Logout).
Logged out (landing): logo + **Recipes** (feed is public-viewable read-only? No — feed requires auth; landing nav shows only) **Log In** ghost link + **Sign Up** primary button.

- Active item: `text-accent`, weight 600, 2px accent underline offset 8px (as in inventory mockup)
- Inactive: `text-text-secondary`
- Demo user: persistent slim banner under navbar, `bg-cream-yellow`, 13px: "You're in demo mode — data resets nightly. **Create a free account** to keep yours." with link to /signup.

---

## Signature Patterns (from the mockups — reuse everywhere)

1. **Quick-access tinted cards** — mint/yellow rounded cards with icon + bold label at the top of the dashboard. Reuse this shape for any "entry point" element on other pages.
2. **Freshness pills** — solid green/amber/red days-left pills (ui-tokens.md). The only place these colors appear as solids. Reuse in tables, item cards, Fridge Chef "uses expiring" highlights.
3. **White card on cream** — every content block is a white rounded card on the cream background. Color lives inside cards (pills, tinted sub-cards, buttons), never as full-card backgrounds except the tinted quick-access cards and the landing hero.
4. **Two-column work layout** — narrow form/action column (~320px) left, wide content right (as inventory mockup: Add New Item | Pantry Inventory). Reuse wherever a page pairs an action with a list.
5. **AI = teal** — every AI touchpoint carries the `ai` tokens so users learn the signal.

---

## Page Blueprints

Pages with a mockup: build to the mockup. Pages without: build to these blueprints with the patterns above.

### `/` Landing — HAS MOCKUP

Per mockup: hero on mint panel (headline, subtext, primary "Get Started Free" + secondary "Try the Demo"), phone-style visual of the scan flow (build with real UI components, not an image), features grid (4 white cards: AI Scan, Fridge Chef, Expiry Alerts, Recipe Sharing — icon in tinted square + title + one honest sentence each), "Dashboard Sneak Peek" card with 3 stat cards + mini table with pills, footer.
Change from mockup: secondary CTA is **Try the Demo** (calls demo login), not "Scan Groceries".

### `/login`, `/signup` — no mockup

Single centered white card (max 420px) on cream. Logo on top, heading, fields per auth API, primary full-width button, swap-link ("No account? Sign up"), and a divider with a secondary **Try the demo instead** button. Field errors inline under inputs in `text-danger` 12px.

### `/dashboard` Inventory — HAS MOCKUP

Per mockup:
- Top row: three quick-access cards — **Fridge Chef** (mint, replaces mockup's "Recipe Suggestions", links to /fridge-chef), **My Notes** (mint), **Soon to Expire** (yellow, live count "N expiring within 7 days" + "View Expiring" secondary button → /dashboard/expiring)
- Left column: **Add New Item** card — name, quantity + unit, purchase date (optional), expiry date (required), primary "Add to Inventory", then "OR" divider and secondary **📷 Snap to Add** button (opens Snap flow)
- Right column: **Pantry Inventory** card — search input (client-side filter on name), table: item name, quantity & unit, purchase date, expiry date, freshness pill, edit/delete icon actions, pagination if > 10 items
- Skip the mockup's Veg/Dairy/Meat radio filters — no category field in the data model. Do not add one.
- Empty state: friendly illustration-free card — "Your pantry is empty. Add an item or snap a photo of your groceries." with both CTAs.

### Snap-to-Add review — no mockup (modal/sheet over dashboard)

1. Image picker (drag-drop zone + file input, `capture="environment"` on mobile) inside a modal
2. Loading: teal AI spinner + "Reading your groceries…"
3. **Review table**: editable rows (name, quantity, unit, expiry date inputs), low-confidence rows get a `bg-cream-yellow` row tint + "check this" hint, per-row remove, add-row link
4. Footer: item count + primary "Add N items to pantry" + cancel. On success: toast + table refresh.

### `/dashboard/expiring` — no mockup

Same table card as dashboard, pre-filtered, page title "Expiring within 7 days", pills only amber/red. Each row gets an extra "Cook it" link → /fridge-chef. Empty state: "Nothing expiring this week. Nice work. 🎉"

### `/fridge-chef` — no mockup

Hero-lite header card (mint): title "Fridge Chef", one line "Photograph your fridge — get recipes that rescue your expiring food."
- Upload zone (same component as Snap-to-Add step 1)
- Loading state: "Chef is thinking…" teal spinner
- Results: 3 suggestion cards in a row (stack on mobile). Each card: title, one-line why, **"Uses expiring: [pills]"** row (amber/red freshness pills of the matched items), "On hand" vs "Missing" as two compact tag lists, collapsible steps, footer button **Save as recipe** (secondary) → success turns into a link "View in My Recipes".
- Under results: muted 12px "AI suggestions — double-check ingredients before cooking."

### `/recipes` My Recipes — no mockup

Page title + primary "New Recipe" button. Card grid (3 cols → 1 on mobile): image (or `bg-mint` placeholder with 🍳 for imageless AI recipes), title, prep/cook line, `source: fridge-chef` recipes get a teal "AI" pill. Card click → detail. Empty state points to Fridge Chef.

### `/recipes/feed` — no mockup

Same card grid, plus author userName + save/unsave heart toggle (accent when saved) per card. Food quote in a slim `bg-peach` banner card above the grid — hidden entirely if the quote API failed. 

### `/recipes/saved` — no mockup

Same grid as feed, unsave only. Empty state links to feed.

### `/recipes/:id` — no mockup

Single centered column (max 760px): image (if any), title, meta row (prep/cook/total/serving as small tinted chips), ingredients as checklist-style list, numbered instructions, note block. Owner sees Edit (secondary) + Delete (danger ghost + confirm dialog).
Create/edit form: same column width, dynamic ingredient/instruction rows (add/remove), optional image upload with preview.

### `/notes` — no mockup

Two-column work layout (pattern 4): left "New Note" card (title + body + primary Save), right list of note cards (title, 2-line body preview, edited date, edit/delete icons). Click → inline expand or edit view. Keep it deliberately simple.

---

## States — Mandatory on Every Page

- **Loading**: skeleton cards/rows, never spinners for full pages (spinners only for AI operations, teal)
- **Empty**: every list has a written empty state with a CTA (as specified per page)
- **Error**: query errors render a card with "Something went wrong" + Retry button; mutation errors use toasts + inline field errors
- **AI errors**: 429 → "You've hit the AI limit for now — try again in a bit."; 502 → "Couldn't read that photo. Try a clearer shot." Never show raw error payloads.

---

## Accessibility Basics

- All inputs have visible labels (mockup style: 12px label above input)
- Buttons are `<button>`, links are `<Link>` — never divs with onClick
- Freshness pills always include the text ("6 days left"), never color alone
- Focus rings: 2px accent, never removed
