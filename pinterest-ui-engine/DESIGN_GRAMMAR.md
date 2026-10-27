# The Grammar — what fifteen professional boards agree on

Extracted in Mission 042 from fifteen reference boards (Evira, a blue
e-commerce kit, Medica, Car Wash, QuickServe, SwiftGo, StayNest, Fibo,
Proton Vault, Brewly, Atlete Trend, Airi, an orange food kit, Beefy,
Good Food), read independently by three analysts plus zoomed crops.
The boards disagree about palette, brand and category. They agree —
without exception — on the discipline below. That agreement is the
difference between "professional" and "generated": our engine's
palettes were never the problem; its component chrome was.

## The laws

1. **One accent works.** A single brand colour carries every
   interactive meaning — primary buttons, selected states, active
   tabs, links, key numbers. Everything else is ground, surface and
   two or three greys. Semantic colours appear only as small
   dots/pills, never as surfaces.
2. **Shadow OR outline, never both.** Cards are white, lifted by one
   soft shadow (roughly 0 6–18px, ≤8% black), borderless. An outlined
   element carries no shadow. Two outlines on one element is noise.
3. **Search is a pill with its icon inside.** Magnifier at the left,
   placeholder text, no button anywhere. A trailing filter icon is
   the only permitted extra.
4. **A card has an information budget:** media, a title (semibold,
   ≤2 lines), ONE meta line (facets · stat · rating, middot-joined,
   ellipsised), a price row. Nothing else earns a line. Rows carry a
   thumbnail, two text lines, and at most one right-side figure.
5. **Chips are quiet until chosen.** Unselected: a light tint of the
   ground, no border, dark text. Selected: solid accent, white text.
   One row, horizontally scrolled.
6. **Working type is one sans.** Semibold does the emphasis work;
   sizes per screen stay near four (headline 26–34 bold, titles
   15–17 semibold, body 13–14, meta 11–12 in the soft grey).
   Sentence case everywhere; capitals are for rare micro-labels.
   Serif/display faces belong to editorial compositions and brand
   marks — never to a working browse screen's furniture.
7. **Actions are filled or quiet, never outlined.** The primary
   action is a solid accent pill, usually pinned in a bottom bar.
   Secondary actions are text buttons or tint pills. An outlined
   pill doing a filled button's job reads as unfinished.
8. **Ratings are one line:** ★ + value + (count), the star in amber
   or the accent.
9. **Navigation is five icons at most,** stroke style, tiny labels,
   the active one in the accent (filled pill, filled icon or dot) —
   never bold text alone.
10. **Space separates; lines don't.** Page gutters 16–24px, section
    gaps 20–28, card-internal gaps 8–12. Hairlines appear inside
    tables and detail lists, almost nowhere else.
11. **Photography is the colour.** Photos sit in rounded tiles on a
    light neutral ground with no frame, no border, no shadow of
    their own. Where there is no photo, there is no fake photo box
    competing for attention.
12. **Every screen has one loud element** — the hero, the price, the
    primary button — and everything else is deliberately quieter.

## How the engine obeys

- The runtime CSS ends with the MISSION 042 grammar block: borderless
  lifted surfaces (cards, rows, metrics, bag, submissions), the pill
  search, quiet chips, sans working type (display faces only under
  `body.comp-index` / `comp-article`, fed by the compiled intent),
  filled/quiet save actions, tint-filled form fields, a shadow-lifted
  tab bar.
- The search renderer emits the icon inside the field and no button.
- Card markup folds subtitle, facets and stats into a single
  `.card-meta` line.
- The record page's save is a circular heart overlaid on the photo —
  the boards' pattern — falling back to a filled pill when a record
  has no photo.
- Worlds (ledger/market/care/studio/editorial) now tune only palette
  and type flavour inside these laws.

## What the grammar is not

It is not a theme. It does not pick colours, write copy, shoot
photography, or invent product content (riders, reviews, maps). An
engine can hold every law and still ship a dull product if the brief
is dull — but it will no longer ship a noisy one.
