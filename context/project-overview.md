# Project Overview

## About the Project

**FreshTrack** (working name — the existing Food Management App, upgraded) is a full stack AI-powered food waste reduction app. Users track the food they own, get alerts before items expire, and use AI to turn what's in their fridge into meals.

This is a **v2 rebuild** of an existing 4-year-old Express + EJS monolith. The rebuild:

1. Converts the server-rendered EJS app into a **React SPA + Express JSON API**
2. Fixes long-standing security and data-integrity bugs in the old controllers
3. Adds two AI vision features:
   - **Snap-to-Add** — photograph groceries/receipts and the AI populates the inventory automatically
   - **Fridge Chef** — photograph fridge contents and the AI suggests recipes using what you have, prioritising items that expire soonest
4. Upgrades the recipes section (better feed, AI-assisted recipe import from photos)
5. Keeps the **demo/guest mode** so recruiters can try the app without signing up

---

## The Problem It Solves

Households throw away food because they forget what they own and when it expires. Manually typing every grocery item into a tracker is tedious enough that people stop doing it.

FreshTrack removes the friction: photograph your shopping and the inventory fills itself. When items approach expiry, the app doesn't just warn you — it tells you what to cook to use them up.

---

## Pages

```
/                    → Homepage (marketing + demo CTA)
/login               → Login
/signup              → Signup
/dashboard           → Inventory: item list, expiry badges, Snap-to-Add
/dashboard/expiring  → Items expiring within 7 days
/fridge-chef         → Upload fridge photo → AI recipe suggestions
/recipes             → My recipes (CRUD)
/recipes/feed        → Public feed of all users' recipes
/recipes/saved       → Recipes saved from the feed
/recipes/:id         → Single recipe view/edit
/notes               → Notes/shopping lists (formerly "comments")
```

---

## Navigation

Top navbar, protected routes only visible when logged in:

```
Dashboard    Fridge Chef    Recipes    Notes
```

Guest (demo) users see the same navbar; a persistent banner reminds them data resets nightly.

---

## Core User Flow

### Inventory (Dashboard)

- List of owned food items: name, quantity, unit, purchase date, expiry date
- Each item shows days-left badge; ≤7 days = warning state, expired = danger state
- Add items two ways:
  - **Manual form** (kept from v1)
  - **Snap-to-Add**: upload/take a photo of groceries or a receipt → AI extracts items with guessed quantities and typical shelf lives → user reviews an editable preview table → confirms → items saved in bulk
- Edit and delete items (owner-only, enforced server-side)

### Fridge Chef

- User uploads a photo of their fridge/pantry contents
- AI identifies visible ingredients, cross-references the user's tracked inventory (especially soon-to-expire items), and returns 3 recipe suggestions: title, why it fits (uses X expiring items), ingredients on hand vs. missing, brief steps
- User can save a suggestion straight into their recipes

### Recipes

- Personal recipe CRUD with image upload (Cloudinary)
- Public feed sorted by newest, with save-to-my-list
- Food quote on feed pages (kept from v1, external API, non-blocking)

### Notes

- Simple personal notes/shopping lists (rename of v1 "comments")
- CRUD, owner-only

### Demo Mode

- "Try the demo" button logs the visitor in as a shared Guest user (no signup)
- Guest can use the full dashboard including AI features (rate-limited)
- Nightly cron wipes Guest inventory data
- Still relevant: the app's primary audience right now is recruiters reviewing the portfolio

---

## What Carries Over From v1

| v1                            | v2                                              |
| ----------------------------- | ----------------------------------------------- |
| Mongoose models (User, NewItem, Recipe, Comment) | Kept, cleaned up (see architecture.md)          |
| Passport local auth + sessions | Kept — served same-origin, no JWT complexity   |
| Cloudinary recipe images      | Kept                                            |
| Demo user + nightly cron reset | Kept                                           |
| EJS views                     | **Deleted** — replaced by React SPA             |
| `UploadedRecipe` model        | **Deleted** — dead code                         |

---

## Out of Scope for v2

- Mobile app
- Barcode scanning
- Push/email notifications for expiry (candidate for v3)
- Social features beyond the existing recipe feed (likes, comments on recipes)
