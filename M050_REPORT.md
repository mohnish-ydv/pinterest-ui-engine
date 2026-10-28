# MISSION 050 — Report

**Engine v1.30.0-mission050** (`~/workspace/m050/improved/`, from M049's
v1.29.0 tree, manifest-style diff: **21 top-level diff entries — 14
modified files, 7 new paths, of which `reference/` is a 25-file tree;
45 files in total**; M049 and all earlier trees untouched).
`ENGINE_DIFF.patch` (9,462 lines) is against the m049 improved tree.

Mohnish's spec was the contract: (1) intake that opens with
"Hi, What are we building?", produces a complete plan, and builds
only after confirmation; (2) UI/UX governed by a screen-by-screen
decoded BASE reference; (3) user-attached references understood at
screen level and built to; (4) finished, proven by rendered apps.

## A. Base Reference Library — shipped in the distribution

`pinterest-ui-engine/reference/base/`: all 15 board decodes + Evira's
PATTERN_LIBRARY and inv-01..04 (md5-verified byte-identical copies),
**BASE_REFERENCE.md**, **base_reference.json**.

- Measured census: **249 screens** exactly (tall-ecommerce 33,
  blue-ecommerce 36, StayNest 36, Fibo 30, car-service 20, Medica 19,
  orange-food 14, QuickServe 12, SwiftGo 11, coffee 10, pizza 8,
  sneaker 8, grocery 6, Beefy 3, Proton 3), 268 board pattern rows,
  Evira 64 patterns / 162 entries.
- Canonical screen index for **27 screen types**: binding anatomy
  top→bottom, header/CTA/shape rules, best exemplars, honest engine
  status. At decode time: HAS 14 / PARTIAL 7 / MISSING 6. After §D,
  splash, OTP, permission-priming, chat moved MISSING→FIXED and
  search+suggestions, orders+status-tabs PARTIAL→FIXED (recorded in a
  coordinator resolution note in BASE_REFERENCE.md itself).
- **base_compliance.mjs**: honest DOM/text checks against
  base_reference.json markers, with `data:`-scoped discriminators in
  the compiled data.js so unplanned families cannot PASS on renderer
  presence alone. Fern after §D: **11 checked, 0 gaps** (before §D:
  9 PASS, 2 GAP — search recents, orders tabs).

## B. Intake v2 — the front door Mohnish specified

- **INTAKE.md rewritten**: Stage 0 is the exact line
  **"Hi, What are we building?"**; staged questions → brief draft →
  brief doctor → plan generation → **hard CONFIRMATION GATE**
  ("Shall I build this, or what should change?" — no generation
  before explicit confirmation; changes loop back) → build
  milestone-by-milestone per TODO.md with check-offs and a 390px
  drive + screenshot per milestone.
- **intake-questions.json v2**: 24 questions (18 M047 ids unchanged +
  a `journey` group: reference choice base/user, primary journey in
  the user's words, must-have screens, booking/chat/wishlist needs).
- **make_plan.mjs** → a plan/ directory of 9 artefacts: ROADMAP.md,
  TODO.md, ART_DIRECTION.md (justified from the chosen reference),
  DESIGN_DIRECTION.md (per-screen anatomy mapped to
  base_reference.json types), FUNCTIONALITY.md, USER_JOURNEY.md,
  REFERENCE_PLAN.md, product-brief.json, PLAN.json
  (`status: awaiting_confirmation`). It prints the gate warning.
- **plan_doctor.mjs**: journey screens ↔ design direction ↔
  reference types; surfaces brief_doctor GAPs; art direction must
  name a reference source. PawCare worked example: make_plan 9 files
  / 18 screens / 5 milestones, plan_doctor **0 gaps**; a tampered
  plan fails with exactly 5 GAPs, exit 1.
- Showcase 1's full plan is delivered in `plan-example/`.

## C. Reference Ingest — user references at screen level

- **REFERENCE_INGEST.md**: measure (reference_profile.mjs, output
  stored verbatim) → decode EVERY screen in the base board format →
  profile.json in the base schema → validate → the plan names the
  decode as governing. Resolution rule: measurement governs measured
  colour numbers only; the decode governs direction; disagreements
  are recorded in `deviations`, never silently resolved.
- **reference_doctor.mjs**: decode anatomy + engine mapping per
  screen, census, profile schema. Brewly: **34 PASS, 0 GAP**;
  broken-ingest negative test: 9 GAPs, exit 1.
- **Worked ingest** `reference/user/brewly-coffee/` (simulated upload
  of the coffee board): measurement.json, decode.md (10 screens),
  profile.json. It caught the exact failure of pixel-only reference
  understanding: pixels recommend neutral-gallery/orange (board
  photography dominates) while every flat UI field is dark-green
  committed-field.

## D. Engine gap fixes — grammar laws 34–42, all declaration-gated

Landed (each with probe + DOM/interaction evidence; probe drive
**27/27**, design050 **44/44**):

| Law | Item | Declaration |
| --- | --- | --- |
| 34 | Splash screen (first gate, tap/`holdMs` dismiss, once per session, reduced-motion aware) | `splash` |
| 35 | Permission-priming (glyph disc, benefit, Allow / Maybe later, choice persisted, never re-asked) | `permissions[]` |
| 36 | OTP digit row (email-first, no password, 4–6 boxes, auto-advance/auto-verify, honestly labelled local demo) | `auth.otp` |
| 37 | Chat family (list + thread, bubbles, composer appends + canned reply, persisted, labelled local-only) | `chat` |
| 38 | Wishlist dedicated view (replaces generic Saved tab; declaring it implies the save toggle) | `wishlist` |
| 39 | Booking field types `date-strip` + `time-chips` in product.flow (selection joins review + confirmation summary) | flow fields |
| 40 | Dual-handle price range — **verified already working, not rebuilt**: both range inputs, both bounds enforced in `visibleRecords()`, measured on the probe (max=500 → 2 of 6 cards; min=1000 → 2; reset → 6) | existing |
| 41 | Search suggestions (focused + empty query: recent chips persisted, popular chips, tappable rows) | existing search |
| 42 | Orders segmented status tabs (built from statuses orders actually carry; honest empty segment) | orders view |

Undeclared apps render unchanged (verified on Fern's compiled model:
splash/permissions/chat/wishlist null).

## E. Showcases — proof through the full new flow

**Showcase 1 — Fixora (base reference)**, home services (new
category): answers → plan (16 screens, plan_doctor 0 gaps) → status
confirmed (note: Mohnish's M050 brief is the confirmation) →
**fulfilment 14/14** → journey drive **36/36, 0 page errors** →
**21 screenshots** (delivery `screens/showcase-base/`) → base
compliance **18 PASS, 4 GAP, 5 SKIP** (forced OTP: PASS). Of the
GAPs, **payment is substantive** (no dedicated payment pattern); the
other three are marker-literal artifacts verified against live DOM
(medallion homes compile `category-medallions`, not the
`filter-chips` component the checker names; `.stars`/`.switch` are
built by concatenation).

**Showcase 2 — Brewly (user reference)**: plan names brewly-coffee
as governing (make_plan propagated it; ART_DIRECTION's palette/type
boilerplate was hand-corrected to the decode and that is recorded) →
**fulfilment 13/13** → journey **23/23** → **14 screenshots**
(`screens/showcase-user/`). The user reference governed the palette
**exactly**: brand **#092B1B** (Brewly's measured cluster; ground
#F9F8F4, ink #070502 also exact), where the same brief without the
evidence file ships oxblood #8C2B1B. Against the user profile: home
and cart PASS; six screens PARTIAL; **order-tracker and
rewards-loyalty GAP** (no map/courier or loyalty screen exists).

## Battery & regressions (measured, this tree, after integration)

- verify:env **ready 6/6**
- Core **240/240** + design **233/233** (design050 44/44 included) +
  fixtures **95/95** = **568/568 — all suites passed, no exemptions**
- Fern **13/13**, OLX **12/12**, Evira **10/10**
- One cross-workstream failure was found and fixed during
  integration: design041's category-blind check tripped on pet-care
  example words in make_plan.mjs's header; examples made generic →
  13/13.

## Clean room

Zip (`pinterest-ui-engine-portable-1.30.0.zip`, **3,673,008 B**)
extracted fresh → `npm ci` → verify:env ready → Fern **13/13** →
Showcase 1 regenerated **14/14** → design050 **44/44** → layout
**41/41** → Fern base_compliance **11 checked, 0 gaps, exit 0**.
No manual steps; INTAKE.md and REFERENCE_INGEST.md are at the zip
root, the reference library inside the engine tree.

## Honest limits — what is still not finished

1. **Loyalty/rewards and map/tracking have no renderer** (base index
   still MISSING). Brewly compliance GAPs on both; nothing was
   substituted or faked.
2. **Art-direction selection still follows the measurement, not the
   decode.** Brewly's *palette* arrived exactly, but run.mjs selected
   neutral-gallery (85) over committed-field (60) because board
   photography outvotes flat UI fields. REFERENCE_INGEST.md's
   decode-governs-direction rule is documented, **not implemented**
   in the pipeline.
3. **Payment is a flow choice, not a screen pattern**; success is a
   page, not the boards' celebration modal; settings live inside
   profile; dashboard components exist without a dashboard home.
4. **Showcase-audit flaws (from looking at the screenshots):**
   Fixora's detail-page availability slot is validated then discarded
   for bag-carried bookings, and the booked day/time are missing from
   the Bookings card; the chat composer input renders as a narrow
   oval beside a full-width Send bar; shop vocabulary ("Cart",
   "Delivery ₹49", "Preparing / On the way") leaks into a service
   app; orders tabs render as pills, not the base's underline tabs;
   the splash carries a Continue CTA where base anatomy has none;
   Brewly's selection colour is inconsistent (filter chips select
   brand green; size selector and "All" medallion select black) and
   its serif lands on page titles while the onboarding hero — the
   board's one serif surface — renders sans.
5. **Photography**: both showcases used sample/initials media (the
   brief doctor's tip); the boards are photo-led, and that remains
   the largest visual distance after loyalty.
6. OTP and chat are local demos and say so on their own screens; no
   live services (accounts, payments, maps, messaging) exist.
7. make_plan does not yet list splash/permission-priming in
   PLAN.json's screen list when they are added at brief stage (the
   showcases added them per INTEGRATION.md and kept plan and brief
   in sync manually).

Not pushed to GitHub. Nothing outside `~/workspace/m050/` modified.
