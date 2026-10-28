# INTAKE.md — start here: the engine interviews first

**If you are an AI assistant holding this engine, this file is your first
instruction.** When a user says "start the engine", attaches this package,
or asks you to build an app with it, do **not** go straight to writing a
brief from their one-line prompt. A one-line prompt produces a thin brief,
and a thin brief produces a thin app: the engine's best screens (the
Evira families — greeting home, filter sheet, wallet, reviews, radio-row
checkout…) are **declared, never derived**, so anything the brief never
decided is a screen the app will not have. The interview below exists to
make those decisions with the user, in about two minutes.

## The protocol

1. **Ask the questions** in `intake-questions.json`. Group by group
   (Idea → Catalogue → Commerce → Families → Look), conversationally —
   offer the options as choices where your host allows it, always show
   the marked default, and accept "you decide" (take the default and say
   so). Never ask a question whose `when` condition is unmet (don't ask
   the bag's name when there is no bag).
2. **Draft `product-brief.json`** from the answers, using each question's
   `briefPath` and the mapping notes below.
3. **Run the brief doctor** before generating:
   `node pinterest-ui-engine/engine/intake/brief_doctor.mjs <case>/product-brief.json`
   It prints `GAP` and `tip` lines, one per undecided decision, each
   tagged with the question that decides it. Resolve every GAP — ask
   the user, or take the default and tell them. (Generation also prints
   these as `intake:` notes, so a brief written without the interview
   still gets flagged — but by then the decisions should already be made.)
4. **Show the user a one-paragraph plan** — the app, its commerce model,
   the families it will and will not have — then generate, drive the
   app, and screenshot it, as `INTEGRATION.md` describes.

## Answer → brief mapping (the parts that are not obvious)

| Answer | Lands in the brief as |
| --- | --- |
| Commerce = bag | A requirement sentence using a trigger word — "Customers add products to a **cart** they can review…" (the word bag/cart/basket + an add-verb is what derives the bag; the on-screen name is `bagLabel`, independent of it) |
| Commerce = contact / none | No bag sentence at all. Say what the primary action is instead ("Buyers contact the seller to arrange a purchase") — do not leave a stray "cart" word anywhere in the requirements |
| One-of-one items | `uniqueItems: true` (bag caps at 1, no steppers) |
| Checkout = radio steps | `product.flow` — `form` fields + `steps`; delivery/payment as enum fields whose options are **objects** `{label, value, caption, price}` so they render as the board's priced radio rows and join the total |
| Home = the board's | `homeHeader: "greeting"` + `showCategories: true`, and a facet field with options for the medallions |
| Families picked | Declared at the top level: `onboarding`, `auth`, `wallet`, `profile`, `notices`, `faq`; `promo` for the offer card; per-record `variants` / `reviews` on catalogue items |
| Look = mono | A fashion/apparel-flavoured `domain` (or the word "mono" in it) — the world is chosen from the domain text; the other worlds follow the domain the same way |
| A demo person's name | `profile.name` (+ `profile.sub`) — a greeting home without a named person is a GAP the doctor will flag |

## A worked minute (classifieds, the Bazaar shape)

Answers: name *Bazaar*; pitch "Buy and sell pre-loved things near you";
domain *marketplace*; Bengaluru, ₹; item word *listing*; facts = price,
category, second facet (locality), condition, description, seller;
photos supplied; commerce = **bag** named *Cart*; items **one of one**;
checkout **radio steps** (Pickup free / Delivery ₹149; Cash / UPI);
home = **the board's**; person = the owner; families = profile,
notifications, FAQ, promo ("40% — seller fees, this month"); look = auto.

That set of answers declares: `homeHeader`, `showCategories`,
`uniqueItems: true`, a `flow` with object-option enums, `profile`,
`notices`, `faq`, `promo.percent`. The same app written from a bare
prompt in the wild shipped without half of these and with a used phone
sittable at quantity 8 — the interview is what closes that gap.
