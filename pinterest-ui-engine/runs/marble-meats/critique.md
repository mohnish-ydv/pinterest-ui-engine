# Critique & Repair Log — Marble Meats (engine run)

Method: rendered inspection via `engine/inspect.mjs` (screenshots 390/1440, stateprobe state measurements, axe on 3 views). Before = `shots-before/`, after = `shots-after/`. Repairs were made to the **templates and generator inputs**, then the app was regenerated — never hand-patched output.

## Findings on the first render (before)

1. **Harness defect (not an app defect):** inspect's pointer clicks on product cards silently landed on the fixed tab bar — puppeteer's minimum scroll left the card's centre under the bar (verified by click-capture: the click target was the `NAV` element at y=772). The functional suite (in-page clicks) was unaffected, which is why the app tested 17/17 while inspection "failed". *Fix:* `inspect.mjs` centres targets before pointer clicks. Lesson recorded in the script.
2. **axe `label-content-name-mismatch`** (home): icon-only buttons whose accessible names didn't contain their visible glyph (`+`, badge text). *Fix in template:* accessible names now include the visible text via visually-hidden spans; no visual change.
3. **axe `page-has-heading-one` + `region`** (detail, bag): sub-bar was a plain `<div>` outside landmarks and those views had no h1. *Fix:* sub-bar is a `<header>` with an `<h1>` title.
4. **axe `heading-order`** (bag, found after fix 3): bag item names were `<h3>` under the new `<h1>`. *Fix:* item names are `<h2>`.
5. **Craft — placeholder icons:** search/location/tab glyphs were unicode characters rendering as tiny or emoji forms (🛒 cart), off the reference's line-icon grammar. *Fix:* inline SVG line icons (pin, search, home, bag) in the template.
6. **Typography nit:** rating line read "4.8(320 reviews)" with no space. *Fix:* margin on `.reviews`.
7. **Redundant copy:** bag totals showed "Delivery (free)" **and** "Free". *Fix:* label is "Delivery", value carries the state.
8. **Generator bug (mine):** the repair patch wrote `{brief.location}` with single braces (Python f-string escaping), so the header printed the literal placeholder. *Fix:* corrected in the template; verified "Bengaluru" renders. This is exactly the class of bug only rendered inspection catches — the source looked plausible.
9. **Desktop promo blow-up:** at 1440px the promo SVG scaled to the full board width and the board became mostly empty dark space. *Fix:* visual capped at 300px, board vertically centred. Confirmed in `shots-after/home-1440.png`.

## What was deliberately NOT "fixed"

- The drawn SVG cuts read as stylised illustrations, not photographs — the declared substitution for R02's photography. No amount of CSS polish closes that gap; it is scored as a limitation, not hidden.
- Products begin below the fold at 390×844 (hero + promo first) — this matches the reference's own home composition (R02 shows the same pattern); changing it would reduce fidelity, not improve it.
- No shadows/gradients/animations were added during repair. Every fix above is structural, semantic or typographic.

## After-state evidence

- Functional suite: **17/17** (`engine/tests/app.test.mjs`).
- axe: **0 violations** on home, detail and bag views.
- stateprobe: selected chip **9.67:1**, CTA rest **9.67:1**, CTA hover **13.63:1** — identical to the token-stage predictions (9.67 / 9.67 / 13.63), i.e. the tokens survived generation and rendering intact.
