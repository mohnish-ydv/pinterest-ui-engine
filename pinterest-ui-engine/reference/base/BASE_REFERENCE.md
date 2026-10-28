# BASE REFERENCE — the default design the engine must comply with

Mission 050, Workstream A. This is the **base reference**: when a user
attaches no reference of their own, a generated app must comply with
this document, screen by screen. It is synthesised — not re-decoded —
from the decode files copied into this directory:

- 15 board decodes (`board-*.md`): Fibo, Medica, blue-ecommerce (AIRI),
  StayNest, tall-ecommerce, car-service (Proglow), orange-food,
  SwiftGo, QuickServe, coffee (Brewly), sneaker-store (Atlete Trend),
  pizza-food, grocery-fresh, Beefy, Proton Vault.
- The Evira decode (`PATTERN_LIBRARY.md` + `inv-01.md` … `inv-04.md`,
  from `~/workspace/m046/delivery/`): 162 inventoried screen entries,
  ≈95 unique screens.

Machine-readable companion: `base_reference.json` in this directory.
Checker: `engine/reference/base_compliance.mjs` (see §4).

**Engine status** below is judged against the engine as it stands at
v1.29.0-mission049 (the tree this directory ships in), from
`INTEGRATION.md`, `pinterest-ui-engine/DESIGN_GRAMMAR.md` (laws 1–33)
and the runtime/layout sources (`engine/runtime/runtime.js`,
`engine/layout/plan.mjs`). Where the evidence is ambiguous the status
says PARTIAL — nothing here is upgraded on hope. This workstream did
not edit the runtime, so no status is claimed "FIXED"; MISSING entries
name the fix that would close them.

---

## 1. Measured census — how the counts were taken

All counts in this section are **measured from the files in this
directory**, reproducible with grep/python, not estimated.

### 1.1 Screens per board

Method: headings under each file's `## Screen inventory` section,
excluding `Row …` group headings, with ranged headings
(e.g. orange-food `### 1–4. Onboarding carousel`) expanded by their
range. Raw heading count is 268; minus 19 row headings (blue 9,
StayNest 6, car-service 4) and plus the 3 extra panels inside
orange-food's ranged heading = **249 screens**.

| Board file | Screens | Pattern-census rows |
|---|---:|---:|
| board-tall-ecommerce.md | 33 | 31 |
| board-blue-ecommerce.md | 36 | 23 |
| board-staynest.md | 36 | 24 |
| board-fibo.md | 30 | 13 |
| board-car-service.md | 20 | 17 |
| board-medica.md | 19 | 15 |
| board-orange-food.md | 14 | 20 |
| board-quickserve.md | 12 | 17 |
| board-swiftgo.md | 11 | 17 |
| board-coffee.md | 10 | 17 |
| board-pizza-food.md | 8 | 20 |
| board-sneaker-store.md | 8 | 16 |
| board-grocery-fresh.md | 6 | 15 |
| board-beefy.md | 3 | 12 |
| board-proton-vault.md | 3 | 11 |
| **Total** | **249** | **268 census rows** |

Evira separately: `PATTERN_LIBRARY.md` carries 64 pattern rows across
6 tables (commerce core, cart/checkout/orders, money, account,
entry/auth, shared atoms), distilled from the 162 entries in
`inv-01..04.md`.

### 1.2 Canonical screen types — screen-heading matches

Method: the 249 screen headings above matched against a keyword
pattern per canonical type. Headings are **non-exclusive** (a
"Booking Appointment" heading counts for both booking and orders),
so columns do not sum to 249. This is a frequency signal, not a
partition.

| Canonical type | Headings matching | Canonical type | Headings matching |
|---|---:|---|---:|
| catalogue/list | 34 | payment | 11 |
| onboarding | 30 | reviews | 10 |
| auth | 24 | booking | 10 |
| detail | 21 | splash | 10 |
| profile | 19 | wallet | 9 |
| home | 16 | success | 8 |
| map | 16 | chat | 8 |
| orders+status-tabs | 14 | wishlist | 7 |
| search+suggestions | 12 | notifications | 7 |
| loyalty | 7 | OTP | 6 |
| dashboard | 6 | tracker | 6 |
| filter-sheet | 5 | checkout | 5 |
| bag/cart | 7 | permission-priming | 3 |
| settings | 2 |  |  |

Under-counted by headings, present in bodies: bag/cart, checkout and
filter-sheet appear inside many screens whose headings name something
else (e.g. every commerce home carries a cart tab; Evira's filter
sheet is 1 screen but its pattern governs every browse screen).

### 1.3 Cross-board agreements (the invariants)

These hold across effectively all 16 sources (15 boards + Evira) and
are already grammar law in `DESIGN_GRAMMAR.md`; they bind every
screen in §2:

1. **One accent.** One brand colour carries all interactive meaning;
   semantic colour is small dots/pills only. (Law 1; Evira: one ink,
   colour = photography.)
2. **Shadow OR outline, never both**; cards are lifted surfaces,
   rows sit on the ground. (Law 2.)
3. **Search is a pill with its icon inside** — no search button; a
   trailing sliders/filter button is the only extra. (Law 3.)
4. **Card budget:** media, semibold title ≤2 lines, ONE meta line
   (≤2 facts since M045), price row. (Laws 4, 16.)
5. **Chips quiet until chosen** (tint → solid accent, white text),
   one scrolled row, no visible scrollbar, measured fade while more
   exists off-edge. (Laws 5, 28, 33.)
6. **One working sans**, ~4 sizes/screen, sentence case. Display/
   serif faces are for onboarding headlines and brand marks only.
   (Laws 6, 15.)
7. **Actions are filled or quiet, never outlined.** Primary = solid
   accent pill, usually pinned in a bottom bar; secondary = text or
   tint pill; destructive = quiet tint with error text. (Laws 7, 18.)
8. **Ratings are one line:** ★ value (count). (Law 8.)
9. **Bottom navigation ≤5 tabs**, stroke icons + tiny labels, active
   in accent; bag tab carries a count badge. (Law 9.)
10. **Space separates; lines don't.** Gutters 16–24, section gaps
    20–28; hairlines only inside tables/detail lists. (Law 10.)
11. **One loud element per screen** — hero, price, balance card or
    the single primary CTA; the budget is shared by all components
    on that screen. (Laws 12, 14.)
12. **Back + centred small title** on non-tab screens (coffee: 7 of
    10 screens; tall-ecommerce: "almost every non-tab screen";
    Evira BACK-TITLE-HEADER ≈64 instances, BLACK-PILL-CTA ≈47 —
    the two most frequent atoms in any source).
13. **Choices are rows, not dropdowns** — delivery/payment/package
    choices are radio rows: medallion, name, caption, price, filled
    radio. (Law 25; Medica radio rows on 3 screens, Evira ≈10.)
14. **Every flow ends the same way:** a success state with a
    reference the user can quote. (Evira invariant 6.)

---

## 2. Canonical screen index

For each type: **anatomy** (top→bottom, binding — a generated screen
that omits a listed block does not comply), **header** and **CTA**
rules, **best exemplars**, and **engine status**.
`HAS` = the engine produces this today from a brief declaration or
requirement. `PARTIAL` = a real part is missing (named). `MISSING` =
no renderer/planner path exists (fix named; not fixed by this
workstream — runtime edits were out of its scope).

### splash — MISSING → FIXED in M050
- **Anatomy:** blank/brand ground → centred brand lockup (mark +
  wordmark) mid-height → dot-ring or dot loader near bottom. No copy,
  no CTA, no progress %.
- **Header:** none. **CTA:** none.
- **Exemplars:** tall-ecommerce §1, blue-ecommerce §1, Fibo §1,
  Medica §1, StayNest §1; Evira SPLASH-LOGO-SPINNER (2, light+dark).
- **Status:** MISSING — no splash renderer or brief key exists; the
  first thing a generated app shows is the shell or the onboarding
  gate. Fix: a trivial timed/branded gate in front of onboarding.

### onboarding — HAS
- **Anatomy:** hero zone (photo/illustration, top ~55%) → sheet or
  ground with headline (display scale) + 1–2 grey lines → dash/dot
  pager → bottom row: Skip text + solid Next/Get Started.
- **Header:** none, or logo left + Skip right (Beefy). **CTA:** solid
  accent pill bottom (full-width, or round arrow bottom-right on
  tall/blue-ecommerce).
- **Exemplars:** Fibo §§2–4 (3 slides), orange-food §§1–4 (4 panels,
  one template), StayNest §§2–4, tall-ecommerce §§2–5, Beefy §1.
- **Status:** HAS — declared `onboarding` brief key; runtime gate
  (`data-testid="onboarding"`, dash indicator, Skip/Next, law in
  INTEGRATION.md §2). Slide images bundle like record images.

### auth — HAS
- **Anatomy:** big left headline (Sign in / Create account scale) →
  social discs + "or continue with" (no rule lines) when providers
  declared → filled fields (label above, tint fill, outline on
  focus) → remember-me checkbox row → error line → solid CTA →
  text-link footer ("Do not have an account? Sign up").
- **Header:** the big headline IS the header; no back-title bar on
  the entry screen. **CTA:** solid pill, full-width.
- **Exemplars:** Fibo §§5–6, Medica §§2/4, tall-ecommerce §§6–7,
  orange-food §§6–7, Evira entry/auth table (≈10 field screens,
  6 remember-me, 5 text-link footers).
- **Status:** HAS — declared `auth` key; local-only sign-in/up with
  providers, remember-me, footer mode link (runtime `gateHtml`).
  Honest limit (INTEGRATION.md §6): nothing is verified or sent.

### OTP — MISSING → FIXED in M050
- **Anatomy:** back + title → one-line instruction naming the
  destination number/address → row of OTP boxes (filled tint at
  rest, white + dark outline on the active slot) → resend timer
  text → (on device boards) bare-numeral keypad.
- **Header:** back + centred small title. **CTA:** solid pill
  Verify/Continue; resend is text, never a button.
- **Exemplars:** Fibo §7, car-service §4, StayNest §8,
  tall-ecommerce §9, blue-ecommerce §9, orange-food §9.
- **Status:** MISSING — the auth family ships email+password only;
  no OTP-box renderer, no brief key. Evira OTP-BOXES + RESEND-TIMER
  was already MISSING at v1.25 and was not in the M046 build list.
  Fix: an `auth.otp` variant of the gate with box inputs + timer.

### permission-priming — MISSING → FIXED in M050
- **Anatomy:** centred icon/illustration disc → headline naming the
  permission in user terms ("Enable Notification Access!") → one
  benefit line → solid Allow/Enable pill → quiet Skip/Not now.
  Shown BEFORE the system prompt, never instead of explaining.
- **Header:** none. **CTA:** solid pill + quiet text beneath.
- **Exemplars:** blue-ecommerce §10 (notification permission),
  car-service §9 (notification access), orange-food §10 (location).
- **Status:** MISSING — no renderer, no brief key, in any source
  engine doc. Fix: a declared gate like onboarding with one slide
  whose CTA is the priming action.

### home — HAS
- **Anatomy:** ONE identity block (greeting header: avatar +
  greeting + name + circle buttons to notices/wallet — OR brand
  zone, never both, law 22) → pill search (+ filter button) →
  facet furniture in ONE shape (medallions OR chip rail, never
  both, laws 23/31) → promo (quiet tint unless photographed;
  percent-led variant when declared) → section header (+ See all)
  → collection grid/list → bottom tab bar (≤5).
- **Header:** greeting or brand, per above. **CTA:** none at page
  level; the promo's one small filled button is the loudest action.
- **Exemplars:** coffee §2, Medica §5, StayNest §9, Beefy §2,
  SwiftGo §2, Evira home (medallions + greeting header).
- **Status:** HAS — browse view with app-header (greeting variant),
  page-heading, search-bar, filter-chips/medallions, promo-banner,
  entity-collection (plan.mjs `browseSections`).

### search+suggestions — PARTIAL → FIXED in M050
- **Anatomy:** back + pill search field (icon inside, autofocus) →
  BEFORE typing: recent-search list and/or popular terms/categories
  → WHILE typing: result count header ("Results for X" + count) →
  results in the catalogue's own card/row shape → not-found empty
  state (sentence on the ground, law 19).
- **Header:** the search pill is the header. **CTA:** none.
- **Exemplars:** orange-food §12 (history + popular), tall-ecommerce
  §23 (typing/similar matches) + §25 (results), StayNest §§10–11
  (results + location recents), Fibo §25.
- **Status:** PARTIAL — search-bar, live filtering, results-count
  and not-found empty state exist; **recent-search / suggestion
  lists do not** (Evira RECENT-SEARCH-LIST: MISSING; StayNest
  location-recents: MISSING). The checker GAPs Fern on exactly this
  marker. Fix: a recents list under the field, fed by on-device
  search history.

### filter-sheet — HAS
- **Anatomy:** scrim → bottom sheet: head ("Sort & Filter" + ×) →
  one group per facet (label + wrapped chips, law 28) → price range
  → rating floor → sort chips → foot: quiet Reset + solid Apply.
  All choices apply together (law 24).
- **Header:** sheet title. **CTA:** Reset (quiet) / Apply (solid).
- **Exemplars:** StayNest §12 (full-screen variant), tall-ecommerce
  §24, orange-food §13, Evira FILTER-SHEET (1 screen, governing
  pattern for all browse).
- **Status:** HAS — since M046: sliders button in the search row,
  `sheet` filter body with facet groups, price range, rating, sort,
  Reset/Apply; M049 qualified reset chips ("All Type"/"All Light").

### catalogue/list — HAS
- **Anatomy:** header (back+title on pushed lists, tab header on
  roots) → optional chip rail / medallion rail → cards or rows in
  the card budget (§1.3.4): media, title, one meta line, price row;
  rows: thumbnail, two text lines, ≤1 right-side figure → empty
  state sentence when the list is empty.
- **Header:** back + centred title, or tab-root header. **CTA:**
  per-card quiet add/save only; no page CTA.
- **Exemplars:** coffee §§3/8 (rows), sneaker-store §3 (category
  tiles) + home grid, grocery §§2–3, tall-ecommerce §12 (long home).
- **Status:** HAS — entity-collection (card/row/index variants),
  data-table for declared tables, collection-manager for owned
  collections.

### detail — HAS
- **Anatomy:** media hero (full-bleed photo or carousel with
  pill-dots when 2+ images) with overlay circular back + save
  discs → title → rating one-line → meta/stat strip → variant
  selectors (swatches = tick, size circles = solid when chosen,
  option pills) BEFORE the purchase action → detail list / prose →
  reviews section (when the record carries reviews) → related rail
  ("You may also like") → FIXED bottom bar: price + solid action.
- **Header:** overlay discs on media, else back + centred title.
  **CTA:** solid pill in the bottom bar beside the price (law 20);
  save is a heart disc on the photo (law: M042 runtime note).
- **Exemplars:** Beefy §3 (sheet-over-photo), sneaker-store §4,
  coffee §4 (size segment + add-ons), Medica §6, Evira
  PRODUCT-DETAIL-HERO ≈12 + PRICE-PLUS-BLACK-PILL-BAR ≈11.
- **Status:** HAS — record-header (+ carousel/dots), stat-strip,
  detail-list, variant-selectors, reviews, related-rail, bag-add
  (plan.mjs `detailSections` + M046 extras).

### wishlist — HAS
- **Anatomy:** header → saved collection in card OR list form
  (boards show both: grid on sneaker-store, list on coffee — the
  composition decides, the shape must match the catalogue's) →
  per-item heart toggle (filled = saved) → empty sentence
  ("Nothing saved yet…").
- **Header:** back + centred title, or tab-root header. **CTA:**
  none at page level.
- **Exemplars:** coffee §9 (list), sneaker-store §6 (grid, 6 items),
  tall-ecommerce §14, pizza-food §6 (saved restaurants).
- **Status:** HAS — `saved` view planned from any save/heart
  requirement; save-toggle persists on-device (M038).

### bag/cart — HAS
- **Anatomy:** header → line rows ON THE GROUND (no card, no shadow,
  no dividing lines, law 17): thumbnail, name, variant line,
  stepper (− qty +, law 21; no stepper for unique items) or
  remove → totals table (bare label/value: subtotal, delivery,
  total) → empty state naming the bag ("Your crate is empty.").
- **Header:** back + centred title with count. **CTA:** solid pill
  Checkout pinned with the totals.
- **Exemplars:** coffee §5, tall-ecommerce §15, grocery §5,
  blue-ecommerce §24, Evira CART-ITEM-ROWS + CONFIRM-REMOVE-SHEET.
- **Status:** HAS — bag-list / bag-totals / bag-checkout, steppers,
  confirm-remove sheet (M046), unique-items rule (INTEGRATION §2).

### checkout — HAS
- **Anatomy:** header → numbered step indicator → one step panel
  ON THE GROUND (law 29): contact/details fields → address fields
  → choice steps as radio rows → REVIEW step: everything entered,
  as a bare label/value list, plus the totals table → commit.
- **Header:** back + small bold form-header title. **CTA:** solid
  Continue per step; solid commit (label + amount) on review.
- **Exemplars:** grocery §6, tall-ecommerce §16, SwiftGo §§7–9
  (steps 1–3), Medica §§7–12 (the booking-shaped twin).
- **Status:** HAS — step-flow with radio rows for priced enum
  options, review step, step validation (derive + plan).

### payment — PARTIAL
- **Anatomy:** header → payment-method radio rows (medallion +
  name + caption + price + filled radio) → card form when "new
  card" is chosen (labelled filled fields) → totals/summary sheet
  → solid Pay pill. Wallet balance, when a wallet exists, is one
  of the radio rows — not a separate screen.
- **Header:** back + small bold title. **CTA:** solid Pay (amount
  on the button on blue-ecommerce/tall-ecommerce).
- **Exemplars:** Medica §10 (4 radio rows), blue-ecommerce §§26/29–30
  (method + summary sheet; card-not-set empty state), SwiftGo §9,
  tall-ecommerce §§18–19 (method + add card).
- **Status:** PARTIAL — payment exists ONLY as a radio-row choice
  inside a declared checkout flow (its price joins the total).
  There is no standalone payment view, no add-card form, and no
  card-not-set empty state. Honest limit: no real payment rail
  exists to connect (INTEGRATION §6) — the gap is the *pattern*,
  not processing.

### success — PARTIAL
- **Anatomy:** centred success medallion (brand/black circle +
  check) → bold title ("Order placed" / "Payment Successfully") →
  one grey line → the reference, quotable → actions.
- **Header:** none. **CTA:** one solid pill (View order / Done) +
  one quiet pill (Continue / Back to home).
- **Exemplars:** tall-ecommerce §21 (modal over checkout),
  blue-ecommerce §§20–21, StayNest §25 ("Booking Confirmed!"),
  QuickServe §7, Fibo §10 (password-updated variant).
- **Status:** PARTIAL — the confirmation PAGE has all of the above
  (confirm-card, check medallion, reference, summary), and a
  success modal was in the M046 plan; the boards' dominant form is
  the centred MODAL over the flow (Evira SUCCESS-MODAL ≈7 screens;
  Medica's only modal), and the generated confirmation is a page,
  not that modal. Fix: render the same content as the sheet/modal
  system's centred variant after commit.

### orders+status-tabs — PARTIAL → FIXED in M050
- **Anatomy:** header → TEXT tabs (bold + thick underline:
  Active / Completed / Cancelled — never pills, Evira TEXT-TABS
  ≈6) → order rows: reference head, label/value rows, status →
  per-row tracker + receipt access + quiet cancel (with confirm).
- **Header:** back + centred title (submissions label). **CTA:**
  per-row mini pill (Track Order / Leave Review); cancel is quiet
  tint, its confirm is the only filled danger (law 18).
- **Exemplars:** tall-ecommerce §28 (one screen, 3 tab panels),
  Medica §§13–15 (same list in 3 tab states), StayNest §26
  (bookings with status tabs).
- **Status:** PARTIAL — the submissions/collection-manager view
  HAS order rows, tracker, receipt and cancel-with-confirm, but
  **no status tabs**: all orders render in one list regardless of
  state (Medica census: "segmented tab header for state lists —
  MISSING"). The checker GAPs Fern on the `status-tab` marker.
  Fix: split the manager list by order state under underline tabs.

### tracker — HAS
- **Anatomy:** header → (live boards) map with route + floating
  status pill + courier card → ALWAYS: stage tracker — horizontal
  icon steps (Placed → Preparing → On the way → Delivered) and/or
  vertical dot timeline with the first stage dated → receipt
  toggle (barcode drawn FROM the reference, wide; reference never
  reprinted under it, law 27).
- **Header:** back + centred title. **CTA:** quiet Call/Message on
  the courier card (live boards only); otherwise none.
- **Exemplars:** coffee §6 (map + courier), SwiftGo §§3–5 (both
  orientations on one board), blue-ecommerce §28, pizza-food §5,
  tall-ecommerce §29.
- **Status:** HAS for the stage/receipt half — order-tracker icon
  steps + dot timeline + barcode receipt in the orders view
  (M040/M046). The map/courier half is map-dependent: see **map**.

### wallet — HAS
- **Anatomy:** header → BLACK balance card (label, display balance,
  one white/inverted Top Up pill — law 26) → "Transaction History"
  → signed transaction rows (disc, label, when, +/− amount, tiny
  status) → top-up as a SHEET: amount display, amount chips,
  bare-numeral keypad, confirm.
- **Header:** back + centred title; reached from the greeting
  header's wallet circle button or profile. **CTA:** Top Up on the
  card; Confirm in the sheet.
- **Exemplars:** blue-ecommerce §§17–23 (history, top-up ×3,
  receipt), Evira money table (black card ≈3, transaction rows ≈4,
  PIN/keypad ≈5), StayNest §32 (stored payment methods variant).
- **Status:** HAS — declared `wallet` key: wallet-card, txn-list,
  top-up sheet that really moves the on-device balance
  (INTEGRATION §2). Local only; no payment rail.

### loyalty — MISSING
- **Anatomy:** header → points hero card (balance in display type,
  tier/progress to next reward) → earn rows (action + points) →
  unlock/redeem offer rows with small filled pills → history.
- **Header:** back + centred title. **CTA:** small filled pill per
  offer; no page CTA.
- **Exemplars:** coffee §7 (Coffee Rewards — points hero + offers),
  Fibo §§21–23 (coins, streak, rewards store), Proton §3 is the
  adjacent "health score" dashboard form.
- **Status:** MISSING — coffee's own census flags it ("loyalty/
  rewards pattern — MISSING / weak in engine"); no renderer, no
  brief key in v1.29. Fix: a declared `loyalty` family shaped like
  wallet (hero card + rows), reusing wallet's local-state pattern.

### profile — HAS
- **Anatomy:** avatar header (disc with photo/initials + black edit
  badge, name, sub) → grouped menu rows (medallion or plain +
  label + chevron; link rows navigate, toggle rows persist, radio
  rows persist) → FAQ accordion when declared → Logout (quiet,
  error-coloured text) at the foot.
- **Header:** the avatar header IS the header on tab-root profiles.
  **CTA:** rows; no page CTA.
- **Exemplars:** coffee §10 (6 rows + logout), Medica §18 (+ logout
  confirm modal), StayNest §30, tall-ecommerce §31, Fibo §27.
- **Status:** HAS — declared `profile` key: profile-sheet with
  link/toggle/radio rows, avatar header, logout when auth declared.

### settings — PARTIAL
- **Anatomy:** header → grouped row list (account / preferences /
  support groups separated by space, not lines) → toggle rows
  (brand track ON, grey OFF) → radio-list rows (language, theme) →
  plain form rows for editable fields (avatar + edit badge on
  edit-profile).
- **Header:** back + centred title ("Settings"). **CTA:** none —
  changes persist in place.
- **Exemplars:** Fibo §28, tall-ecommerce §33 (sub-list),
  StayNest §§31–34 (edit profile, payment methods, help).
- **Status:** PARTIAL — the ROW TYPES all exist inside the profile
  view (toggle/radio/link rows, persisted), but there is no
  standalone settings view or grouped sub-list destination; a brief
  cannot declare "Settings" as its own screen. Fix: allow a
  profile section group to be planned as a pushed settings view.

### notifications — HAS
- **Anatomy:** header → day-grouped list (Today / Earlier headings)
  → rows: icon disc + title + one-line text + time → (QuickServe)
  filter chips above the feed → empty sentence when none.
- **Header:** back + centred title ("Notification"). **CTA:**
  none; reached from the greeting header's bell circle button.
- **Exemplars:** Fibo §24, SwiftGo §10, StayNest §28, QuickServe
  §12 (chips variant), tall-ecommerce §32.
- **Status:** HAS — declared `notices` key: notice-list with day
  groups, notices button in the greeting header (M046).

### reviews — HAS
- **Anatomy:** on detail: summary header (big average, star row,
  count) → avatar-initial rows (name, stars, text, date) → on a
  completed order: "Leave a review" opens a sheet — star INPUT,
  text field, Cancel (quiet) / Submit (solid).
- **Header:** a section header on detail; sheet head on the form.
  **CTA:** Submit solid; display stars are never buttons.
- **Exemplars:** StayNest §§33/35 (summary + distribution bars;
  write-a-review form), car-service §§15/19, tall-ecommerce §30,
  Evira REVIEW-ROWS + REVIEW-FORM.
- **Status:** HAS — records carrying `reviews` render the section
  (average, stars, rows) and the write-a-review form keeps the
  review on-device (INTEGRATION §2). One board element is not
  reproduced: StayNest's rating-DISTRIBUTION bars.

### chat — MISSING → FIXED in M050
- **Anatomy:** list: conversation rows (avatar, name, last line,
  time, unread dot) → thread: partner header (avatar, name,
  presence) → bubbles (grey incoming / solid brand outgoing, small
  radius asymmetry) → pinned input bar (field + round send disc).
- **Header:** list = back + title; thread = partner header.
  **CTA:** the send disc; no page CTA.
- **Exemplars:** Medica §§16–17 (list + thread), StayNest §§22–23,
  tall-ecommerce §§26–27, blue-ecommerce §35, Evira CHAT-BUBBLES.
- **Status:** MISSING — flagged by Medica, StayNest and Evira
  censuses alike; no renderer and no brief key (a real backend is
  out of scope, but the boards' pattern is visual and every other
  family is reproduced as a local interaction — chat is the
  exception). Fix: a declared `chat` family with local threads.

### booking — PARTIAL
- **Anatomy:** header → persistent summary header for the thing
  being booked (doctor/property/service compact row rides every
  step, Medica: 4 screens) → date strip (day discs) + time-slot
  chips, or calendar + slots → package/type radio rows → details
  form → review (definition rows + totals) → confirmation.
- **Header:** back + small bold title + the summary header.
  **CTA:** solid pill at the foot of every step.
- **Exemplars:** Medica §§7–12 (the complete arc), StayNest §24
  (calendar booking) + §25 (confirmed), car-service (service
  journey), SwiftGo §§7–8.
- **Status:** PARTIAL — availability-picker (day strip + slots),
  step-flow, radio rows and confirmation all exist and compose
  into a working booking (the CarePoint runs prove the arc), but
  there is no calendar-month picker and no persistent summary
  header inside the flow; booking is assembled, not a family.
  StayNest/Medica censuses flag the calendar picker as missing.

### map — MISSING
- **Anatomy:** full-bleed map → floating pill search or price pins
  → floating status pill when live ("Your driver is 5 minutes
  away") → bottom sheet card over the map (place/provider summary
  + solid Directions/Book pill).
- **Header:** none — controls float on the map. **CTA:** solid
  pill on the sheet card only.
- **Exemplars:** StayNest §§13/19–20 (pins, location, commute),
  car-service §§11/16/18, SwiftGo §4, QuickServe §§3/9.
- **Status:** MISSING — honestly out of scope for a static
  generator with no maps service (Evira: MAP-PICKER "OUT OF
  SCOPE"; INTEGRATION §6 lists maps among services an integrator
  must supply). A brief may embed a map IMAGE; the engine renders
  no map pattern around it. Fix (pattern only): a declared map
  view with pins/sheet over a supplied image.

### dashboard — PARTIAL
- **Anatomy:** greeting/page heading → KPI/stat trio (value in
  display weight, label in soft grey, one line each) → chart or
  progress block on the ground (no chart chrome) → ranked/list
  rows (leaderboard, recent activity) → tab bar.
- **Header:** greeting header or page heading. **CTA:** none;
  tiles and rows navigate.
- **Exemplars:** Fibo §11 (home dashboard) + §§18–21 (progress,
  achievements, leaderboard, streak), QuickServe §8 (earnings/KPI),
  Proton §3 (security overview score).
- **Status:** PARTIAL — metric-row / kpi / stat-strip / data-table
  components exist and operational compositions (table/dashboard)
  are planned, but there is no dashboard HOME type: a brief asking
  for a dashboard gets an operational browse view, not the
  KPI-first composition above. Where unsure, this is the honest
  call: components HAS, composition PARTIAL.

### Status summary

| Status | Types |
|---|---|
| HAS (14) | onboarding, auth, home, filter-sheet, catalogue/list, detail, wishlist, bag/cart, checkout, tracker, wallet, profile, notifications, reviews |
| PARTIAL (7) | search+suggestions (no recents/suggestions), payment (flow step only), success (page, not modal), orders+status-tabs (no status tabs), settings (rows inside profile only), booking (assembled, no calendar/summary header), dashboard (components, no dashboard home) |
| MISSING (6) | splash, OTP, permission-priming, loyalty, chat, map (map = out-of-scope by design, pattern still absent) |

---

## 3. How a brief produces each screen (declarations)

The full mapping is machine-readable in `base_reference.json`
(`screens[].declarations`). In short — **declared, never derived**
for families (M046 rule): `onboarding`, `auth`, `wallet`, `profile`,
`notices` keys switch those screens on; `collection` produces home,
catalogue and detail; requirement sentences produce search
("…can search…"), filters, wishlist ("save … with a heart…"), the
bag (a bag/cart/basket word with an add verb), checkout, success
(a confirmation sentence) and orders (`submissionsLabel` / placed
orders); `collection.items[].reviews` produces reviews; a declared
`flow` produces the payment choice step. Screens with **no**
declaration — splash, OTP, permission-priming, loyalty, chat, map —
cannot be produced by any current brief; that is the definition of
MISSING above, and the checker can only test them when forced.

## 4. Compliance checker

```
node pinterest-ui-engine/engine/reference/base_compliance.mjs \
  <appDir> <briefJson> [--screens type,type]
```

- Plans the screens the brief plans (per §3), checks each planned
  screen's anatomy markers in the app files, prints
  `PASS <type>` / `GAP <type>: missing <marker>` / `SKIP <type>
  (not planned by brief)`, and exits 1 if any checked screen GAPs.
- Markers are honest DOM/text markers from the real generated
  output (`data-testid`, component names in the compiled
  `data.js`, class names, visible words) — **not** fulfilment
  scores. Scope prefixes matter: `data:` markers are read only
  from `data.js`, because `app.js` embeds every runtime renderer
  whether or not the brief planned that family; an app.js-only
  check would PASS unplanned screens. (Verified: forcing
  `--screens wallet,auth,onboarding` on the Fern app GAPs them on
  exactly their `data:` markers.)
- First recorded run (Fern & Co, generated fresh from
  `examples/fern-and-co` with engine v1.29.0, fulfilment 13/13):
  11 planned screens checked — 9 PASS, 2 honest GAPs
  (`search+suggestions`: no recent-search marker;
  `orders+status-tabs`: no status-tab marker), exit 1.
  Full output: `~/workspace/m050/work/A-report.md`.

## Mission 050 resolution (coordinator note, measured)

After this index was written, workstream D landed in the same mission:
splash (law 34), permission-priming (35), OTP (36), chat (37), wishlist
view (38, was HAS as saves; now a dedicated declared view), booking
date-strip/time-chips (39), dual-handle price range verified working
(40), search suggestions incl. recents (41), orders status tabs (42).
design050 suite 44/44 and a 27/27 standalone probe drive are the
evidence. Remaining honestly open: loyalty and map (still MISSING —
no renderer), payment / success / settings / dashboard (still PARTIAL
as described above). The permission-priming anatomy marker in
base_reference.json was changed from one board's button copy
("Enable Notification") to the engine's real markers
(data-testid="permission", perm-allow, perm-later): a generic engine
takes the permission's title from the brief, so board copy is not a
compliance requirement.
