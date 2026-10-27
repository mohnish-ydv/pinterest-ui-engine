# M045 — The Evira Corrections

**Engine:** v1.24.0-mission043 → **v1.25.0-mission045**
**Trigger:** Mohnish gave the portable engine to another AI, which built a
classifieds app ("OLX"). He supplied its five screens next to the Evira
board and asked three things: what went wrong, why the engine could not
produce the reference's visual language, and to decode that language
from the board and tune the engine. This report is the answer, with the
fix shipped as a new engine version — not as advice.

**Baselines preserved:** the M043 tree and the M044 candidate/GitHub
snapshot are untouched. All work is in `~/workspace/m045/`; the tuned
engine is `~/workspace/m045/improved/` (a full copy of the M044
distribution with the engine changes inside it).

---

## 1. What went wrong in the OLX build

The other AI's app *works* — browse, filter, save, cart, three-step
checkout, orders with a lifecycle timeline. Every M042 law is visibly
present somewhere (pill search, solid chips, filled CTAs, tab bar with
a filled active pill). And yet, next to the Evira board, it reads as
generated. Ten defects, each traced to a specific engine behaviour:

1. **Substituted media is dark and empty.** Every listing image is a
   small centred line-icon (their build) or a dark saturated gradient
   tile with two initials (the same brief rebuilt locally). Photography
   on the boards *fills* a light tile. Our stand-in filled nothing and
   shouted in six colours at once. *Cause:* media substitution defaults
   (`layout/compile.mjs`: lightness 29%).
2. **Two loud elements on the home screen.** A full-bleed brand-colour
   header block (logo, headline, tagline, search ≈ 38% of the first
   viewport) *and* a brand-colour promo box directly beneath it.
   *Cause:* the brand zone renders solid by default (M040), and the
   promo's no-photo fallback also renders solid (M040) — the "one loud
   element" law was stated per-component, never enforced across them.
3. **The brand tagline truncates mid-sentence** ("…save what…",
   locally "…locali…"). *Cause:* the brief's `about` text clamped at
   two lines in the brand zone.
4. **Serif page titles on a classifieds app** in their build ("Saved",
   "Cart", "My orders"). *Cause:* the M042 gate gives display faces to
   `comp-index` compositions — and a catalogue of listings can be
   derived as an "index", which is a *catalogue*, not a magazine.
5. **Card meta overload.** Category · locality · date · seller — four
   facts wrapping two lines under a two-line title. Evira cards carry
   name, rating, price. *Cause:* the card meta builder concatenated
   every facet + stat + meta token; M043 ordered them but never
   budgeted them.
6. **Boxes and hairlines survived outside the record page.** The cart
   summary is a shadowed card with divider rows; the order is a
   shadowed card with divider rows; detail facts are ruled with
   hairlines. M043 de-boxed only the record page's stats.
7. **An outlined red Cancel button** — the exact construction law 7
   forbids, in a second accent colour. *Cause:* `.btn-cancel` was an
   outline style.
8. **The in-bag card control is a bare number in a filled circle**
   ("1", locally "2") — it reads as a notification badge, not a
   quantity control. *Cause:* the card add-button swapped its "+"
   glyph for the raw count (M039).
9. **No unique-item semantics.** A used iPhone — a single physical
   item — sits in their cart at quantity **8**. *Cause:* the bag had
   no stock/unique concept and the brief contract could not declare
   one.
10. **The price is buried on the record page** — seller, date, then
    price as body text; the purchase action sits in the scroll.
    Evira pairs price + "Add to Cart" in the fixed bottom bar.

Two smaller tells: the empty cart said "**Your bag** is empty" in an
app whose container is called Cart (a hard-coded word in
`layout/plan.mjs`), and the order page printed its reference **twice**
(the `cm-head` and a `ref` fact row).

## 2. The Evira visual language, decoded

The board (90+ screens) was cropped into 8 bands and read screen by
screen. The full decode is in `work/ANALYSIS.md`; the essence:

- **Ground is white; content sits on it directly.** No bordered cards,
  no shadowed modules. Media tiles are very light grey, radius ~18px,
  and the **photo fills the tile**.
- **One ink: black.** Actions, selections, prices, icons. Secondary
  text is one grey. Colour enters only through photography.
- **One sans**, bold-tight headlines, sentence case. No serif anywhere.
- **One filled-black pill per screen**, usually in a fixed bottom bar.
- Home has **no brand block**: slim identity row, light-grey pill
  search, circular category medallions, **light** promo cards with the
  photo on the right, section headers with a quiet "See All".
- Cards: photo → name (1 line) → tiny rating → price + small black
  circular "+". No seller, no place, no date.
- Detail: photo full-bleed; title; rating; labelled option rows
  (circles/dots/stepper as plain text controls); **fixed bottom bar:
  price left, black pill right**. No tab bar, no dividers, no boxes.
- Cart/checkout/orders: plain rows and labelled sections on the
  ground; radio rows for choices; the wallet's black balance card is
  the one permitted loud element on its screen.
- Success is a centred modal: black circle icon, bold title, one grey
  line, black pill + quiet pill.

Evira spends its whole visual budget on photography and one black
action per screen, and lets white space do the grouping. Our engine
was spending it on chrome — brand blocks, boxes, hairlines, meta text,
display type — which is precisely the "AI-generated" signature.

## 3. The fixes (engine v1.25.0-mission045)

Six files changed in the engine, plus the grammar, the integration
contract, the version, and a new probe suite:

| # | Fix | Where |
|---|---|---|
| 1 | Substituted media defaults to a **light tile** (lightness 29% → 87%); the initials print in a deep tint of the tile's own hue | `layout/compile.mjs`, `runtime.js` fallback, CSS layer |
| 2 | **Promo goes quiet**: tint ground, ink text, one small filled brand button — with or without a photo. The brand zone keeps the colour alone | CSS layer |
| 3 | Brand zone gives back height: subline rationed to **one line** | CSS layer (over M043) |
| 4 | **Catalogue titles are working type**: `comp-index` no longer earns the display face; `comp-article` (long-form reading) keeps it | CSS layer |
| 5 | **Card meta budget = 2 facts**, spent deliberately: first facet + first statistic outrank the rest (a food card reads "South Indian · 4.7", a listing "Mobiles · Koramangala") | `runtime.js` card renderer |
| 6 | **Bag and order book de-boxed**: rows and totals on the ground, no shadows, no divider lines; record-page fact rows and head sheet lose their remaining hairlines | CSS layer |
| 7 | **Cancel is a quiet danger**: tint ground, error-coloured text, no outline. The confirm step still fills | CSS layer |
| 8 | **Empty states are sentences** (no dashed box) and **name the container the user sees** ("Your cart is empty.") | CSS layer + `layout/plan.mjs` |
| 9 | **Card control becomes a stepper** (− qty +) once an item is in the bag; same on the related rail | `runtime.js` + CSS |
| 10 | **Unique/stock semantics**: briefs may declare `uniqueItems: true`; a record may carry `stock`. The bag enforces the cap in the add/inc handlers, card steppers omit "+" at the cap, and unique items show no "+" anywhere | `intake/derive.mjs`, `runtime.js`, `INTEGRATION.md` |
| 11 | **Price joins the action**: on record pages the purchase action moves into the fixed bottom bar with the price at its left; the head sheet stops repeating the price; the tab bar yields (existing frame behaviour) | `runtime.js` render + CSS |
| 12 | The order's reference prints **once** (the duplicate `ref` fact row is suppressed; the head already carries it) | `runtime.js` collection-manager |

The grammar gained nine addenda laws (13–21 in
`DESIGN_GRAMMAR.md`) written the way the M042 laws are written, so the
next agent who reads the engine learns them as rules, not folklore.

## 4. Evidence

**The same classifieds brief**, rebuilt before/after (screenshots in
`delivery/screenshots/`, 390×844):

- Browse: dark gradient tiles → **light tiles**; solid promo box →
  **quiet tint band**; tagline now ends cleanly at one line.
- Browse, after adding: the bare "2" badge → a **− 1 stepper with no
  "+"** (unique); a second add attempt leaves the cart badge at **1** —
  the quantity-8 used iPhone is now impossible for a declared-unique
  catalogue.
- Detail: hairline-ruled facts → **space-separated facts**; price +
  "Add to cart" in the **fixed bar**; head price retired.
- Cart: boxed summary → **plain rows and totals on the ground**;
  unique rows show "− 1" only. Totals verified: ₹28,900 + ₹54,000 =
  ₹82,900, delivery Free.
- Orders: box → **ground**; duplicate ref row gone; Cancel is a quiet
  tint pill; timeline unchanged.
- Full journey driven end-to-end on the rebuilt app: browse → add ×2
  → cart → 3-step checkout → confirmation **OLX-158171** → orders.
  0 page errors.

**Generality checks:**
- **Rasoi** (photo-led food app, M040 brief, real photography)
  rebuilt: the promo is now a light card with its thali photo — the
  Evira promo pattern — and card meta reads "South Indian · 4.7"
  (facet + rating) instead of a four-token wrap. Fulfilment 11/11.
- **Fern & Co** (the M044 worked example) still generates at
  fulfilment **13/13**.
- **design045 probe suite: 21/21** — browser-level assertions for
  every fix above (media lightness ≥ 80%, meta ≤ 2 tokens, promo ≠
  brand-zone colour, stepper + cap behaviour, bar price pairing, bag/
  order computed styles, single ref, quiet cancel, label-true empty
  copy), including a full in-suite checkout journey.
- **Regression battery (all three groups, run on the final code):**
  core **239/240**, design **114/114** (design036–043 plus the new
  design045), fixtures **95/95** — total **448/449**. The single
  failure is the same disclosed layout-suite vocabulary exception
  that has stood since M039 (its fixed fixture corpus predates the
  bag component); it is unchanged, not a regression. Every other
  suite passes, including the journeys in the four fixture apps.
- **Clean room:** the delivered zip
  (`pinterest-ui-engine-portable-1.25.0.zip`) was extracted to a fresh
  directory and the Fern & Co example generated from the archive
  itself — fulfilment **13/13**.

## 5. Honest limits

- The engine still cannot invent photography. With no images in a
  brief, the light-tile stand-in is calmer and more honest, but a
  marketplace *with* seller photos will always out-render one without.
  Briefs should ship images; the contract already supports them.
- The brand zone remains a solid brand block on the home screen — a
  deliberate identity decision kept from M040 (it is now the screen's
  *only* loud element, and shorter). Evira has no equivalent; if a
  future brief wants the full Evira home, that is a composition
  choice the engine does not yet offer.
- Long order values (the items summary) still wrap right-aligned in
  fact rows; readable, not beautiful. Noted, not fixed — it needs a
  stacked-row rule keyed on value length, which deserves its own
  probe.
- This mission tuned the *engine's* defaults. The app the other AI
  built was generated from v1.24; it does not update itself. The
  route to a corrected OLX is regeneration from the same brief with
  v1.25 (plus `uniqueItems: true`, which a classifieds brief should
  declare).
