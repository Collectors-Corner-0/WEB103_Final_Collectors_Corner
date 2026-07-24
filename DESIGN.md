# DESIGN.md — Collector's Corner

Visual direction and token system. Every component derives its colors, type, and spacing from here. No hardcoded hex values or pixel sizes in component CSS.

---

## Thesis

The cover art is the content. Book jackets, film posters, and album sleeves already carry enormous color and personality. The interface holds them in an even grid and otherwise stays quiet.

This means near-monochrome chrome, a single restrained accent, and strict uniform card proportions so a mixed shelf of books and films reads as one coherent collection rather than a ransom note.

Deliberately **not** warm cream with terracotta, and **not** dark with a neon accent. Cool, papery, close to a modern archive catalog.

---

## Color

```css
:root {
  --surface:        #F4F5F7;  /* page background, cool paper */
  --surface-raised:  #FFFFFF; /* cards, modals, inputs */
  --ink:            #16181D;  /* primary text, near-black with a blue cast */
  --ink-muted:      #5B6170;  /* secondary text, labels, metadata */
  --line:           #E2E5EA;  /* borders, dividers */
  --accent:         #2F4858;  /* deep slate — active nav, focus rings, primary buttons */
  --accent-hover:   #24394A;
  --danger:         #A33A2E;  /* destructive actions, validation errors */
}
```

Nine values, and that's the whole palette. Media-type labels are set in `--ink-muted`, not in colors of their own — the covers already differentiate them.

`--ink-muted` was darkened from the original `#6C7280` (~4.4:1 on `--surface`, just under WCAG AA for normal text) to `#5B6170` (~5.7:1) after checking the relative-luminance math by hand — see Quality floor.

---

## Type

Two families, loaded from Google Fonts.

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600&family=Literata:ital,wght@0,400;1,400;1,500&display=swap" rel="stylesheet">
```

```css
:root {
  --font-ui:    'Instrument Sans', system-ui, sans-serif;
  --font-title: 'Literata', Georgia, serif;
}
```

**Titles of works are set in Literata italic.** This is not decoration — italicizing the title of a work is the typographic convention in catalogs and citations, and it lets a title sit inline with its creator's name without needing a separator. Everything else — navigation, labels, buttons, body copy, form fields — is Instrument Sans.

(Literata was designed by Google Fonts/TypeTogether specifically for Play Books' reading experience — an apt pick for a media-cataloging app.)

Scale:

```css
:root {
  --text-xs:  0.75rem;   /* media-type labels, metadata */
  --text-sm:  0.875rem;  /* secondary text, form labels */
  --text-base: 1rem;     /* body */
  --text-lg:  1.125rem;  /* card titles */
  --text-xl:  1.5rem;    /* page headings */
  --text-2xl: 2rem;      /* the one page title */
}
```

Media-type labels: `--text-xs`, uppercase, `letter-spacing: 0.08em`, `--ink-muted`. That's the only uppercase in the interface, which is what makes it read as a taxonomy label rather than emphasis.

---

## Spacing and shape

```css
:root {
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-12: 3rem;

  --radius:    6px;
  --radius-lg: 10px;

  --shadow-card:  0 1px 2px rgba(22, 24, 29, 0.06);
  --shadow-modal: 0 16px 48px rgba(22, 24, 29, 0.18);
}
```

Every margin and padding uses a token. Nothing gets an arbitrary `13px`.

---

## Layout rules

**Global reset.** Set `box-sizing: border-box` on everything, zero out default body margin, and set the base font and background on `body`.

**No fixed-height scroll containers.** The page scrolls; inner containers do not. Never set a height plus `overflow: scroll` on a content wrapper.

**Page shell.** A max width of `1200px`, centered, with `--space-6` of horizontal padding.

**Card grid.**

```css
display: grid;
grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
gap: var(--space-6);
```

Never a fixed column count. The grid reflows on its own down to mobile.

**Covers are uniformly cropped.**

```css
aspect-ratio: 2 / 3;
object-fit: cover;
width: 100%;
```

This is what makes the shelf read as a shelf. A wide film poster and a tall paperback occupy identical rectangles. Without it, cards have ragged heights and text collides.

**Cards are flex columns** with the image first, then a content block with its own padding. Text never overlaps because nothing is absolutely positioned and nothing has a fixed height.

**Missing covers** get a placeholder block in `--line` with the media type centered in `--ink-muted`. Never a broken image icon.

---

## Components

**Navigation.** A single row, left-aligned, sitting on `--surface-raised` with a `--line` bottom border. Links are `--ink-muted`, no underline, `--text-sm`, medium weight. The active route is `--ink` with a 2px `--accent` underline. Never default browser link styling.

**Buttons.** Primary is `--accent` background, white text, `--radius`. Secondary is transparent with a `--line` border and `--ink` text. Both get `--space-2` vertical and `--space-4` horizontal padding. Disabled drops to 50% opacity with `cursor: not-allowed`.

**Inputs.** `--surface-raised` background, `--line` border, `--radius`, `--space-3` padding. On focus, the border turns `--accent` plus a 3px ring at 15% opacity. Invalid fields get a `--danger` border with the message beneath in `--danger` at `--text-sm`.

**Modal.** Centered, `--surface-raised`, `--radius-lg`, `--shadow-modal`, max width `520px`, with a backdrop of `rgba(22, 24, 29, 0.4)`. Closes on backdrop click and on Escape.

**Loading.** A skeleton block in `--line` matching the shape of what's coming — for the card grid, that's six 2:3 rectangles. Never a centered spinner on an empty page.

**Empty states.** A single line in `--ink-muted` naming what's missing and a primary button offering the action that fixes it. "No media in this collection yet" plus an "Add media" button. Never just "No results."

---

## Quality floor

Non-negotiable, and not worth announcing in the UI:

- Responsive down to 375px with no horizontal scroll
- Visible keyboard focus on every interactive element — never `outline: none` without a replacement
- Body text meets 4.5:1 contrast; `--ink-muted` on `--surface` clears it (~5.7:1, checked by hand against the WCAG relative-luminance formula — re-verify with a real contrast tool before shipping anything new that leans on this pairing)
- All images carry meaningful `alt` text
- `prefers-reduced-motion` respected; transitions capped at 150ms

---

## Copy

Buttons name what happens: "Add media", "Save changes", "Remove from collection". Never "Submit".

An action keeps its name through the whole flow — a button that says "Add media" produces a message that says "Media added".

Errors say what went wrong and how to fix it, without apologizing. "Title is required" beats "Oops! Something went wrong."

Sentence case everywhere except media-type labels.

---

## Implementation status

Applied to what's built so far (`client/src/index.css`, `client/src/App.css`): color tokens, type tokens/fonts, spacing tokens, page shell, nav, card grid, cover cropping, media-type/status badges, error text.

Not yet built anywhere in the codebase (spec only, until the phase that needs them lands): buttons, inputs, modal, loading skeletons, empty states. `Phase 4`'s pages currently show plain `Loading…` text rather than a skeleton, and have no empty-state handling — both should switch to this spec when touched next, rather than being retrofitted speculatively now.
