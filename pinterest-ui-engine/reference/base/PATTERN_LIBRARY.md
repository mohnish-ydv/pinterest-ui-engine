# M046 — The Evira Pattern Library

Synthesised from the four exhaustive inventories in `work/inventory/`
(inv-01…04: 162 screen entries — every full screen, substantial partial
and edge sliver on the board, ≈95 unique screens; overlaps across slice
edges were inventoried twice by design and cross-referenced).

Counts below are merged across inventories (name variants unified).
**Engine status** is against v1.25.0-mission045, whose planner knows 25
components (app-header, page-heading, search-bar, filter-chips,
promo-banner, entity-collection, record-header, detail-list,
related-rail, option-grid, form-fields, step-flow, bag-list, bag-totals,
bag-add, bag-checkout, collection-manager, confirmation, stat-strip,
metric-row, kpi, data-table, article, availability-picker,
status-banner).

---

## A. The invariants (true on effectively every screen)

1. White ground; content unboxed; space groups, hairlines almost never.
2. One ink (black). Grey is text-only. Colour = photography, swatches,
   payment brand marks, tiny status micro-text. Nothing else.
3. One sans, sentence case. Two headline scales: BIG-LEFT-HEADLINE for
   auth/onboarding; small bold FORM-HEADER-TITLE for every task flow.
4. Selection/focus has ONE expression everywhere: light fill at rest →
   white + thin dark outline when active (fields, OTP slots, PIN slot,
   chosen contact row); solid black fill for chosen chips, size
   circles, radios, checkboxes, toggles.
5. Exactly one loud element per screen. On wallet screens it is the
   black balance card; everywhere else it is the single black pill CTA.
6. Every flow ends in the same centred SUCCESS-MODAL (black circle
   medallion + bold title + one grey line + black pill + quiet pill).

## B. Pattern census → engine status

### Commerce core
| Pattern | Screens | Engine |
|---|---|---|
| PRODUCT-GRID-2COL + CARD-NAME-META-PRICE | ~16 | HAS (M042–45) |
| PHOTO-CORNER-BADGE (small black disc on tile corner) | 15 | MISSING — save/add lives below the tile today |
| PRODUCT-DETAIL-HERO (photo full-bleed or floating on white) | ~12 | PARTIAL — hero exists; no carousel, no floating-cutout treatment |
| HERO-PHOTO-CAROUSEL + pill-dot pagination | 2 | MISSING |
| PRICE-PLUS-BLACK-PILL-BAR | ~11 | HAS (M045) |
| STEPPER-PLAIN (− n + as bare text) | 10 | PARTIAL — detail uses it; card stepper is a pill (M045), board also shows a tint PILL stepper on the mockup detail |
| SELECTOR-ROW-SWATCHES (tick on selected) | ~7 | MISSING |
| SELECTOR-ROW-SIZE-CIRCLES (solid black = selected) | ~3 | MISSING |
| FAVOURITE-HEART on detail | 8 | HAS (save toggle, different placement) |
| CATEGORY-MEDALLIONS (tint circle + glyph + label) | 2 (home ×2) | MISSING |
| PROMO-CARD-PERCENT-PHOTO (huge % + photo right, tint card) | ~4 | PARTIAL — promo exists, quiet since M045; percent-led variant missing |
| PROMO-CARD-LIST (offers list of the above) | 1 | MISSING |
| RESULTS-COUNT-HEADER ("Results for X" + count) | 2 | MISSING |
| RECENT-SEARCH-LIST | 1 | MISSING |
| FILTER-SHEET (bottom sheet: chip groups, price histogram + dual slider, sort chips, star chips, Reset/Apply) | 1 | MISSING — engine filters are inline chips only |
| DUAL-RANGE-SLIDER | 1 | MISSING |

### Cart / checkout / orders
| Pattern | Screens | Engine |
|---|---|---|
| CART-ITEM-ROWS (tile + name + variant + stepper) | 2 | HAS (M045 de-boxed) |
| CONFIRM-REMOVE-SHEET (scrim + sheet + item + Cancel/Remove) | 1 | MISSING — no sheet/modal system exists |
| RADIO-ROW-CHOICE (medallion + name + caption + price + radio) | ~10 | MISSING — checkout steps render as generic form fields |
| CHECKOUT-SECTION-STACK + TOTALS-TABLE (bare label/value) | ~4 | PARTIAL — totals exist; sections aren't Evira radio rows |
| PROMO-CHIP-APPLIED (black pill chip with ×) | 1 | MISSING |
| TEXT-TABS (bold + thick underline, no pill) | ~6 | MISSING — collection tabs are not underline tabs |
| MINI-BLACK-PILL-ACTION (Track Order / Leave Review in rows) | 3 | PARTIAL |
| HORIZONTAL-STEP-TRACKER (icon steps) | 1 | MISSING |
| DOT-TIMELINE (dated order statuses) | 1 | HAS (timeline, M040) |
| BARCODE-RECEIPT (barcode + LABEL-VALUE-ROWS + status pill + icon actions) | 2 | MISSING |
| REVIEW-ROWS (summary header, star filter chips, avatar rows) | 1 | MISSING — no reviews data path |
| REVIEW-FORM (bottom sheet, stars, field, Cancel/Submit) | 2 | MISSING |
| STAR-RATING input/display | ~3 | MISSING as a component (ratings exist as text stats) |
| EMPTY-STATE-LINE-ILLUSTRATION (clipboard art + headline + line) | ~3 | PARTIAL — M045 empty states are sentences only |

### Money
| Pattern | Screens | Engine |
|---|---|---|
| BLACK-WALLET/BALANCE-CARD (white display balance, inverted Top Up pill) | ~3 | MISSING |
| TRANSACTION-ROW (thumb/glyph disc + label + signed amount, tiny red/blue status) | ~4 | MISSING |
| AMOUNT-DISPLAY-FIELD + AMOUNT-CHIP-GRID (outline chips) | 1 | MISSING |
| PIN-ENTRY (dots + outlined active slot + BARE-NUMERAL keypad) | ~5 | MISSING |
| SUCCESS-MODAL | ~7 | MISSING — engine's confirmation is a page, not a modal |

### Account / settings / support
| Pattern | Screens | Engine |
|---|---|---|
| SETTINGS-ROW-LIST / SETTINGS-MENU-ROW (medallion or plain + label + chevron) | ~6 | MISSING |
| TOGGLE-ROW (black track ON, grey track OFF) | ~3 | MISSING |
| RADIO-ROW-LIST (language picker) | 1 | MISSING |
| AVATAR-HEADER + AVATAR-UPLOAD-CIRCLE (black edit badge) | ~3 | MISSING |
| FORM-FIELD-STACK (borderless light-filled fields; labelled variant in address forms) | ~4 | PARTIAL — form-fields exist for checkout; not as a general profile form |
| LONG-FORM-TEXT (numbered headings, dense grey text) | 1 | HAS-ish (article) |
| FAQ-ACCORDION (+ underline tabs + chip rail) | 3 | MISSING |
| CONTACT-CHANNEL-ROW (black glyph, monochrome brand logos) | 2 | MISSING |
| CHAT-BUBBLES (grey in / SOLID BLACK out) + CHAT-INPUT-BAR | 2 | MISSING |
| AVATAR-CONTACT-ROW + SMALL-BLACK-PILL-BUTTON (Invite/Invited states) | ~4 | MISSING |
| NOTIFICATION-ROW-ICON-CIRCLE + DAY-GROUPED-LIST | ~2 | MISSING |
| MAP-PICKER (grey map + black pin) | 1 | OUT OF SCOPE for a static generator (no maps service); a brief may embed an image instead |

### Entry / auth
| Pattern | Screens | Engine |
|---|---|---|
| SPLASH-LOGO-SPINNER (light + dark) | 2 | MISSING (trivial) |
| ONBOARDING-TEXT-SHEET + PAGE-DOTS-DASH (dash = current) | ~12 | MISSING |
| PHOTO-HERO-ONBOARDING (3 scrim treatments) / ILLUSTRATION-HERO | ~11 | MISSING |
| BIG-LEFT-HEADLINE | 7 | MISSING |
| FILLED-TEXT-FIELD + FOCUSED-OUTLINE-FIELD | ~10 | PARTIAL (fields exist in forms; focus language not Evira's) |
| SOCIAL-SIGNIN-ROWS / SOCIAL-ICON-ROW + OR-DIVIDER-TEXT ("or continue with", NO rule lines) | ~5 | MISSING |
| REMEMBER-ME-CHECKBOX (black fill + white tick) | 6 | MISSING |
| TEXT-LINK-FOOTER (grey text + bold black link) | 5 | MISSING |
| OTP-BOXES + RESEND-TIMER-TEXT | 2 | MISSING |
| FINGERPRINT-GLYPH screen + DUAL-BUTTON-ROW (quiet Skip + solid Continue) | 1+2 | PARTIAL — dual buttons exist in flows; fingerprint is device theatre, pattern only |
| HOME-GREETING-HEADER (avatar + greeting + 2 outline circle buttons) | 2 | MISSING — home header is the M040 brand zone |
| CIRCLE-ICON-BUTTON (outline) | ~3 | MISSING |

### Shared atoms (already mostly HAS)
BLACK-PILL-CTA (~47), BACK-TITLE-HEADER (~64 across variants),
QUIET-PILL-BUTTON (~7), FIXED-BOTTOM-CTA (9), SEARCH-PILL (≈4),
SECTION-HEADER-SEEALL (~4), BOTTOM-TAB-BAR (5+2), DIMMED-SCRIM (3+3),
LOADING-DOTS (splash/modals).

## C. What v1.26 will build (brief-gated, additive — nothing existing changes shape unless a brief asks)

1. **Variant selectors on detail** — swatch row / size circles / option
   rows derived from record variant fields; selection is carried into
   the bag (bag key = record + variant) and shown on bag rows.
2. **Filter sheet** — browse gains a filter button opening a bottom
   sheet: facet chip groups, price range, sort, minimum rating;
   Reset (quiet) / Apply (solid).
3. **Sheet + modal system** — success modal after commit (ref, View
   order / Continue), confirm-remove sheet in the bag.
4. **Reviews** — records may carry reviews: summary header, star rows,
   avatar-initial rows on detail; Leave-a-review sheet on completed
   orders (stored locally).
5. **Radio-row checkout** — choice steps (shipping/payment declared in
   the brief) render as medallion radio rows with prices.
6. **Underline text tabs** for collection views.
7. **Category medallions** + **greeting home header** as a home
   composition option; **percent promo** variant.
8. **Illustrated empty states** (line-art + headline + sentence) for
   search-not-found and empty collections.
9. **Order tracking + receipt** — horizontal step tracker over the dot
   timeline; receipt section (label/value rows, status pill, barcode
   rendered from the ref).
10. **Profile/settings family** — brief-declared profile view: avatar
    header with edit badge, chevron menu rows, toggle rows, radio
    lists, plain forms.
11. **Wallet family** — brief-declared wallet view: black balance card,
    transaction rows, top-up sheet (amount chips + PIN-style keypad),
    all local state.
12. **Entry family** — brief-declared onboarding slides (photo hero,
    dash indicator, Next/Get Started) and auth screens (big headline,
    filled fields with Evira focus, social row, or-text, footer link,
    OTP boxes + resend line) as local front-end flows.
13. **Detail hero carousel** for records with multiple images +
    pill-dot pagination; **tile corner badge** (heart disc) on cards.
14. **Support patterns** — FAQ accordion section; notifications list
    (icon discs, day groups) when a brief declares notices.

Out of scope, honestly: real maps, real payments, real biometrics,
real chat backends — the board's *patterns* for these are visual, and
where a pattern is visual-only (PIN pad, fingerprint glyph) the engine
reproduces the visual pattern as a local interaction.
