# UI Tokens

Design tokens for IntelliPantry, extracted from the two delivered design mockups (`context/designs/landing-page.png`, `context/designs/inventory.png`). Use these exact values throughout the codebase — never hardcode colors or use raw Tailwind color classes in components.

**Note on the mockups:** they are AI-generated and directional, not pixel-perfect. Tokens below are the canonical values. Where the mockups disagree with each other, this file wins.

---

## How to Use

This project uses **Tailwind CSS v4**. All design tokens are defined using the `@theme` directive in `client/src/index.css`. No `tailwind.config` needed for colors or tokens.

Tailwind v4 automatically generates utility classes from `@theme` variables:

- `--color-accent` → `bg-accent`, `text-accent`, `border-accent`
- `--color-surface` → `bg-surface`, `text-surface`, `border-surface`

```tsx
// Correct — uses generated utility classes
className="bg-surface text-text-primary border-border"

// Never — hardcoded hex values
className="bg-[#FAF7F2] text-[#22272B]"

// Never — raw Tailwind color classes
className="bg-orange-500 text-gray-600"
```

---

## index.css — Complete Token Definition

```css
@import "tailwindcss";

@theme {
  /* Font */
  --font-sans: "Plus Jakarta Sans", sans-serif;

  /* Page and surface backgrounds — warm cream, never pure gray */
  --color-background: #faf7f2;
  --color-surface: #ffffff;
  --color-surface-secondary: #f6f2ea;

  /* Brand accent surfaces (tinted cards — quick-access, hero, feature icons) */
  --color-mint: #ddf0e6;
  --color-mint-strong: #bfe3d2;
  --color-cream-yellow: #fdf3d6;
  --color-peach: #fbe3d4;

  /* Borders */
  --color-border: #eae4d9;
  --color-border-strong: #d9d2c5;

  /* Text */
  --color-text-primary: #22272b;
  --color-text-secondary: #5c6470;
  --color-text-muted: #9aa1ab;
  --color-text-inverse: #ffffff;

  /* Primary accent — tomato/coral (CTAs, active nav, links) */
  --color-accent: #ec5b2e;
  --color-accent-hover: #d94e23;
  --color-accent-light: #fdeae2;
  --color-accent-foreground: #ffffff;

  /* Freshness status — the core visual language of the app */
  --color-fresh: #3f9d5a;          /* > 7 days left */
  --color-fresh-light: #e3f4e8;
  --color-warning: #e8b931;        /* ≤ 7 days left */
  --color-warning-light: #fbf1cf;
  --color-warning-text: #6b5310;
  --color-danger: #d9402a;         /* ≤ 3 days left or expired */
  --color-danger-light: #fbe4e0;

  /* Info / AI feature highlight — soft teal */
  --color-ai: #2f8f83;
  --color-ai-light: #ddf0e6;

  /* Border radius — this app is rounder than average, it's friendly */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;
  --radius-xl: 20px;
  --radius-full: 9999px;
}
```

---

## Color Usage Guide

### Page Layout

| Element                 | Token                          |
| ----------------------- | ------------------------------ |
| Page background         | `bg-background` (cream)        |
| Card / surface          | `bg-surface` (white)           |
| Default border          | `border-border`                |
| Quick-access tinted card| `bg-mint`                      |
| Expiring-alert card     | `bg-cream-yellow`              |

### Accent (Primary Coral)

Used for: primary buttons, active nav item, links, focus rings, selected states.

| Element                 | Token                     |
| ----------------------- | ------------------------- |
| Primary button bg       | `bg-accent`               |
| Primary button hover    | `bg-accent-hover`         |
| Primary button text     | `text-accent-foreground`  |
| Active nav item         | `text-accent`             |
| Light accent background | `bg-accent-light`         |

### Freshness Status Pills

The days-left pill is the signature component. Solid fills, exactly as in the inventory mockup:

| State                    | Background   | Text                 | Label format        |
| ------------------------ | ------------ | -------------------- | ------------------- |
| Fresh (> 7 days)         | `bg-fresh`   | `text-text-inverse`  | "14 days left"      |
| Expiring (4–7 days)      | `bg-warning` | `text-warning-text`  | "6 days left"       |
| Critical (1–3 days)      | `bg-danger`  | `text-text-inverse`  | "2 days left"       |
| Expired                  | `bg-danger`  | `text-text-inverse`  | "Expired"           |

Light variants (`bg-fresh-light` etc. with matching dark text) are used for stat cards and secondary contexts where a solid pill would be too loud.

### AI Feature Elements

Anything AI-powered (Snap-to-Add, Fridge Chef, AI badges on suggestions) uses the teal `ai` tokens — a consistent visual signal that "this is the smart part":

| Element                     | Token         |
| --------------------------- | ------------- |
| AI feature card background  | `bg-ai-light` |
| AI badge / icon             | `text-ai`     |
| "Suggested by AI" pill      | `bg-ai-light` + `text-ai` |

---

## Typography

Font family: **Plus Jakarta Sans** — Google Fonts. Friendly and rounded, matches the mockups' tone. Load weights 400, 500, 600, 700, 800.

| Element                    | Size | Weight | Color token           |
| -------------------------- | ---- | ------ | --------------------- |
| Hero headline (landing)    | 48px | 800    | `text-text-primary`   |
| Page title                 | 24px | 700    | `text-text-primary`   |
| Card / section heading     | 17px | 700    | `text-text-primary`   |
| Stat number                | 28px | 700    | `text-text-primary`   |
| Nav item                   | 14px | 600    | active: `text-accent`, inactive: `text-text-secondary` |
| Body text                  | 14px | 500    | `text-text-primary`   |
| Table header               | 12px | 600    | `text-text-secondary` |
| Labels, timestamps, muted  | 12px | 500    | `text-text-muted`     |
| Pill / badge text          | 12px | 600    | per status table      |

---

## Spacing

| Token       | Value      | Usage                 |
| ----------- | ---------- | --------------------- |
| `gap-2`     | 8px        | Badge and inline gaps |
| `gap-3`     | 12px       | Form field gaps       |
| `gap-4`     | 16px       | Card internal gaps    |
| `gap-6`     | 24px       | Between cards         |
| `p-5`       | 20px       | Card padding          |
| `p-6`       | 24px       | Large card padding    |
| `px-4 py-2` | 16px / 8px | Button padding        |
| `px-3 py-1` | 12px / 4px | Pill padding          |

---

## Component Tokens

### Cards

```
background: bg-surface
border: 1px solid var(--color-border)
border-radius: 20px (rounded-xl token)
padding: 20–24px
box-shadow: 0px 1px 3px rgba(0,0,0,0.06)
```

Tinted quick-access cards (`bg-mint`, `bg-cream-yellow`) use the same radius/padding, no border.

### Buttons

**Primary:**
```
background: bg-accent → hover bg-accent-hover
text: text-accent-foreground, 14px, weight 600
border-radius: 10px
padding: px-4 py-2
```

**Secondary:**
```
background: bg-surface
border: 1px solid var(--color-border-strong)
text: text-text-primary
same radius/padding as primary
```

### Inputs

```
background: bg-surface
border: 1px solid var(--color-border-strong)
border-radius: 10px
padding: 10px 12px
font-size: 14px
focus: 2px ring var(--color-accent)
error state: border var(--color-danger) + 12px danger help text below
```

### Table (inventory, notes lists)

- Header row: 12px / 600 / `text-text-secondary`, no background
- Row divider: 1px `border-border`
- Row hover: `bg-surface-secondary`
- Row height: comfortable, ~56px, item icon (emoji or small illustration) + name leading

### Toasts

Success: `bg-fresh-light` + `text-fresh` border-left. Error: `bg-danger-light` + `text-danger` border-left. Top-right, auto-dismiss 4s.
