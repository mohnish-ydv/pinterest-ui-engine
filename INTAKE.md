# INTAKE.md — INTAKE v2: interview, plan, confirm, then build

**If you are an AI assistant holding this engine, this file is your first
instruction.** When a user says "start the engine", attaches this package,
or asks you to build an app with it, do **not** go straight to writing a
brief from their one-line prompt. A one-line prompt produces a thin brief,
and a thin brief produces a thin app: the engine's best screens (the
Evira families — greeting home, filter sheet, wallet, reviews, radio-row
checkout…) are **declared, never derived**, so anything the brief never
decided is a screen the app will not have.

INTAKE v2 (Mission 050) fixes the two failures Mohnish named after M047:
(1) the old protocol produced only a one-paragraph plan — no roadmap, no
todo, no art/design direction, no functionality or journey artifacts, and
no formal confirmation gate; (2) reference handling was colour pixels
only. v2 produces a **complete plan pack** and **does not generate until
the user confirms it**.

---

## Stage 0 — The opening line (exact)

The engine's first message to the user is exactly this line, on its own:

> Hi, What are we building?

Nothing precedes it — no preamble, no feature list, no menu. The user's
answer to that one question seeds the interview.

## Stage 1 — Staged questions

Ask the questions in `intake-questions.json` (v2), group by group, in
this staged order:

1. **Idea** (`idea`) — name, pitch, domain, place/currency, and the
   **archetype** (`q-archetype`, new in M051): what does the main list
   hold — things people buy (`commerce`), people (`roster`), bookings
   (`service`), records (`records`), or reading (`content`)? This one
   answer decides how the whole app renders. **Ask it early, and
   never let a money field answer it for you** — a member's fund
   contribution is not a price, and before M051 the engine treated
   every money field as one and built a family app as a marketplace
   (the Kutumb failure). The answer lands in the brief as
   `archetype`, in PLAN.json, and in the plan's FUNCTIONALITY and
   DESIGN_DIRECTION (the roster composition is specified there when
   the archetype is `roster`).
2. **Catalogue** (`catalogue`) — item word, facts, photos, item source.
3. **Commerce** (`commerce`) — buying model, bag name, uniqueness,
   checkout shape, delivery fee.
4. **Families** (`families`) — home shape, greeting person, the board's
   declared families, promo.
5. **Journey & reference** (`journey`, new in v2) — reference choice
   (`referenceChoice`: `base` vs user-attached), the primary journey in
   the user's own words (`journey.primary`), must-have screens
   (`mustHaveScreens`), booking needs, chat needs, wishlist/saved needs.
6. **Look** (`look`) — design world.

Rules: offer options as choices where the host allows it; always show
the marked default; accept "you decide" (take the default and say so);
never ask a question whose `when` condition is unmet (don't ask the
bag's name when there is no bag; don't ask booking detail for a pure
store). Keep it conversational — this is an interview, not a form dump.
Group the questions; do not fire all 25 at once.

**Reference choice handling.** If the user picks their own reference
(or has attached screenshots / a board / a Figma export), record
`referenceChoice` as `user:<decode-id>` once the reference has been
decoded into a screen-level profile (screen types, anatomy, palette,
type, shape — not colour pixels alone). The attached reference then
governs every screen it covers; screens it does not cover fall back to
the **base reference** (the engine's decoded Pinterest board library,
`pinterest-ui-engine/reference/base/base_reference.json`). If the user
attaches no reference, `referenceChoice` is `base` and every screen
must comply with the base reference.

## Stage 2 — Draft the brief

Draft `product-brief.json` from the answers, using each question's
`briefPath` and the mapping table below. The brief declares only what
the engine can actually fulfil (see `INTEGRATION.md` §2): families
`onboarding`, `auth`, `wallet`, `profile`, `notices`, `faq`, `promo`,
`product.flow`, per-record `variants` / `reviews`, `homeHeader`,
`showCategories`, `uniqueItems`, `bagLabel`, `deliveryFee` — declared,
never derived. Do not promise a brief key the engine cannot fulfil;
capabilities the engine cannot provide belong in the plan's honest
limits, not in the brief.

## Stage 3 — Brief doctor (kept from M047)

Run the brief doctor before planning:

```
node pinterest-ui-engine/engine/intake/brief_doctor.mjs <case>/product-brief.json
```

It prints `GAP` and `tip` lines, one per undecided decision, each tagged
with the question that decides it. Resolve every GAP — ask the user, or
take the default and tell them. (Generation also prints these as
`intake:` notes, so a brief written without the interview still gets
flagged — but by then the decisions should already be made.)

## Stage 4 — Plan generation (new in v2)

Generate the complete plan pack from the collected answers:

```
node pinterest-ui-engine/engine/intake/make_plan.mjs <answers.json> <planDir>
node pinterest-ui-engine/engine/intake/plan_doctor.mjs <planDir>
```

`make_plan.mjs` writes into `<planDir>`:

| File | Contents |
| --- | --- |
| `ROADMAP.md` | Phases and milestones, in build order, with the outcome each milestone proves. |
| `TODO.md` | A checklist per milestone — the build is driven from this file and items are checked off as they land. |
| `ART_DIRECTION.md` | World, palette, type and shape — each justified **from the chosen reference** (base or the user's decode). |
| `DESIGN_DIRECTION.md` | Per-screen anatomy: every planned screen mapped to a base-reference screen type, with its regions and states. |
| `FUNCTIONALITY.md` | Features, data model, flows, states, and the honest local-only limits. |
| `USER_JOURNEY.md` | Primary journey (the user's own words, resolved step-by-step to screens) plus secondary journeys. |
| `REFERENCE_PLAN.md` | The governing reference for every screen: base type or user decode, screen by screen. |
| `product-brief.json` | The drafted brief from Stage 2. |
| `PLAN.json` | Machine-readable plan: `{ status: "awaiting_confirmation", screens: [...], milestones: [...] }`. |

`plan_doctor.mjs` validates the pack: every screen in the journey /
`PLAN.json` exists in `DESIGN_DIRECTION.md` and maps to a reference
screen type; functionality traces to brief declarations (it runs the
brief doctor on `product-brief.json` and surfaces its GAPs);
`ART_DIRECTION.md` names a reference source; `PLAN.json` status is
present. It prints `GAP` lines and exits 1 on gaps. A status of
`awaiting_confirmation` is **not** a gap — it prints a `gate:` note,
because the gate working is the point. Fix every GAP before Stage 5.

## Stage 5 — CONFIRMATION GATE (hard stop)

Show the user the plan — roadmap, todo, art direction, design
direction, functionality, user journey, reference plan — in summary,
with the full files available. Then ask, verbatim in substance:

> Shall I build this, or what should change?

**Do NOT generate, scaffold, or build anything until the user
confirms.** This is a hard gate, not a courtesy pause:

- If the user asks for changes: revise the answers, re-run
  `make_plan.mjs` + `plan_doctor.mjs`, and show the plan again.
- Only an explicit confirmation ("build it", "go ahead", "confirmed",
  or equivalent) moves `PLAN.json` `status` to `"confirmed"` and
  unlocks Stage 6.
- Silence, a topic change, or "looks interesting" is not confirmation.

## Stage 6 — Build, milestone by milestone

After confirmation, build **per the roadmap and per milestone**:

1. Work `TODO.md` in milestone order. Check off each item
   (`- [ ]` → `- [x]`) as it genuinely lands — never in advance.
2. Generate with the engine
   (`node pinterest-ui-engine/engine/run.mjs <caseDir>`, per
   `INTEGRATION.md`), then **drive the app and screenshot it at each
   milestone** — every planned screen for that milestone, at mobile
   width (390px) — and compare against `DESIGN_DIRECTION.md` /
   `REFERENCE_PLAN.md` before declaring the milestone done.
3. Report each milestone with its evidence (fulfilment count,
   screenshots, doctor output). A milestone with failing checks is
   reported as failing, with the fix, not smoothed over.
4. When all milestones are checked off, run the full verification
   (fulfilment, brief doctor, plan doctor) and hand over the app plus
   the completed plan pack.
5. **Hand over an APP, not a website (M051).** The deliverable is an
   installable app: the generated folder is a PWA (manifest +
   service worker — verify with
   `node pinterest-ui-engine/engine/tools/app_readiness.mjs <appDir>`)
   and `APP_PACKAGING.md` describes how it becomes an Android APK
   via `pinterest-ui-engine/app-shell/`. Never tell the user to
   "open index.html in a browser" or "host this folder" as the
   delivery — a browser open is how YOU test it, not what they
   receive. Say instead: *"Here is your app — install it on your
   phone (PWA) or install the APK; it works offline, and its data
   lives on the device."*

---

## Answer → brief mapping (the parts that are not obvious)

| Answer | Lands in the brief as |
| --- | --- |
| Archetype *(M051)* | `archetype` at the brief's top level — `commerce` / `roster` / `service` / `records` / `content`. It decides whether money fields are prices (commerce only) and how the main list composes (a roster renders people: avatar, relation · role, status chip). Undeclared, the engine infers conservatively — a people collection is a roster, a bag the user adds to is commerce — and a money field alone NEVER implies commerce. The brief doctor GAPs the undecidable cases (money + no signals) and the Kutumb shape (people + commerce) |
| Commerce = bag | A requirement sentence using a trigger word — "Customers add products to a **cart** they can review…" (the word bag/cart/basket + an add-verb is what derives the bag; the on-screen name is `bagLabel`, independent of it) |
| Commerce = contact / none | No bag sentence at all. Say what the primary action is instead ("Buyers contact the seller to arrange a purchase") — do not leave a stray "cart" word anywhere in the requirements |
| One-of-one items | `uniqueItems: true` (bag caps at 1, no steppers) |
| Checkout = radio steps | `product.flow` — `form` fields + `steps`; delivery/payment as enum fields whose options are **objects** `{label, value, caption, price}` so they render as the board's priced radio rows and join the total |
| Home = the board's | `homeHeader: "greeting"` + `showCategories: true`, and a facet field with options for the medallions |
| Families picked | Declared at the top level: `onboarding`, `auth`, `wallet`, `profile`, `notices`, `faq`; `promo` for the offer card; per-record `variants` / `reviews` on catalogue items |
| Look = mono | A fashion/apparel-flavoured `domain` (or the word "mono" in it) — the world is chosen from the domain text; the other worlds follow the domain the same way |
| A demo person's name | `profile.name` (+ `profile.sub`) — a greeting home without a named person is a GAP the doctor will flag |
| Reference = base *(v2)* | `referenceChoice: "base"` in the plan (not a brief key — the engine is reference-free by default; the base reference governs via `DESIGN_DIRECTION.md` / `REFERENCE_PLAN.md`) |
| Reference = user-attached *(v2)* | `referenceChoice: "user:<decode-id>"` in the plan; the decode's measured facts may also be supplied to generation as `reference-evidence.json` beside the brief (see `INTEGRATION.md` §2) |
| Primary journey *(v2)* | `journey.primary` in the plan (not a brief key); every step must resolve to a planned screen in `USER_JOURNEY.md`, and any capability it names (search, filter, save, book, pay) must also appear as a requirement sentence in the brief or it will not be derived |
| Must-have screens *(v2)* | `mustHaveScreens` in the plan; each screen is planned in `DESIGN_DIRECTION.md`. Screens the engine fulfils via families map to their declarations (e.g. `wallet` → `wallet`, `notifications` → `notices`); screens with no fulfilment path (e.g. live `map`, `chat` backend) are planned as local front-ends and named in the honest limits |
| Booking = yes *(v2)* | A booking requirement sentence ("Customers book a <item> by picking a date and time slot, then confirm") + the `booking` screen in the plan; if commerce is also `bag`, booking and bag coexist and the plan says which is primary |
| Chat = yes *(v2)* | A chat requirement sentence ("Customers can message the <seller/provider> about a <item>") + `chat` screens in the plan, labelled local-only (on-device threads; no live messaging service exists to connect) |
| Wishlist = yes *(v2)* | The save requirement sentence — "A customer can save a <item> to favourites with a heart toggle." (that sentence is what derives favourites) + the `wishlist` screen in the plan; toggle-only omits the separate screen |

## A worked minute (classifieds, the Bazaar shape)

Answers: name *Bazaar*; pitch "Buy and sell pre-loved things near you";
domain *marketplace*; Bengaluru, ₹; item word *listing*; facts = price,
category, second facet (locality), condition, description, seller;
photos supplied; commerce = **bag** named *Cart*; items **one of one**;
checkout **radio steps** (Pickup free / Delivery ₹149; Cash / UPI);
home = **the board's**; person = the owner; families = profile,
notifications, FAQ, promo ("40% — seller fees, this month"); look = auto;
*(v2)* reference = **base**; journey = "Find something nearby, check the
seller, add it to the cart, check out, arrange pickup"; must-have =
home, search, catalogue, detail, bag, checkout, orders, profile,
notifications; booking = no; chat = contact-only; wishlist = yes.

That set of answers declares: `homeHeader`, `showCategories`,
`uniqueItems: true`, a `flow` with object-option enums, `profile`,
`notices`, `faq`, `promo.percent` — and, in v2, a plan pack whose
journey resolves to home → search/catalogue → detail → bag → checkout
→ success → orders, each screen governed by its base-reference type.
The same app written from a bare prompt in the wild shipped without
half of these and with a used phone sittable at quantity 8 — the
interview, the plan, and the confirmation gate are what close that gap.
