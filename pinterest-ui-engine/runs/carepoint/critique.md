# Critique & Repair Log — CarePoint (engine run, Mission 018)

Method: `runs/carepoint/inspect2.mjs` (screenshots 390/1440, stateprobe state measures, axe on 3 views, error-state capture). Before = `shots-before/`, after = `shots-after/`. Repairs were made to the template (or the spec) and the app regenerated.

## What the pipeline caught, in order

1. **Stage C (before any rendering): the token gate refused the spec.** First `make_tokens` run failed: inkSoft #68798D measured 4.46:1 on white — 0.04 under AA — in two pairs (soft-ink, tab-idle). Tokens were not written. Spec darkened to #5B6E84 (5.24:1) and the gate passed. This is the earliest defect interception the pipeline has achieved: zero rendering cost.
2. **Harness occlusion, again (inspect, not app):** the book button sits low on the detail page; puppeteer's minimum scroll left its centre under the fixed tab bar, so the error-state click and booking click never landed (`form-errors-390.png` was byte-identical to `detail-390.png`; CTA hover measured at rest value 4.72). Fixed by centring targets in inspect2, as in Mission 017. After the fix, hover measured **7.77** — exactly the token prediction.
3. **axe `page-has-heading-one` (detail):** the detail view had no h1. Fixed in template (doctor name is the h1).
4. **axe `heading-order` (detail, after fix 3):** section titles were h3 under the new h1. Fixed to h2.
5. **axe `color-contrast` (home, state-dependent):** `.upcoming-when` — soft ink on the tint card — measured **4.44:1**. This violation only exists *after a booking is made*, so a load-time audit can never see it; the inspect flow books first, then audits. Fixed: the line now uses full ink.
6. **Error state verified, not assumed:** after the harness fix, the empty-submit state was captured (`form-errors-390.png`) and the error text measured with stateprobe: **5.05:1** (spec red on white).

## Pipeline leaks found (reusable-vs-specific evidence)

`make_tokens.mjs` carries constants from the butcher run: a **warm hairline colour** (`line: #EADBD4`, plus a warm stepper line), a **serif display stack** as `font.display`, a **hardcoded white ground** in the neutral-gallery sketch (spec ground was #F4F7FB), and **no error colour role** at all. The clinic template worked around all four with documented deviations (tint hairlines, ui font throughout, literal spec ground, literal error red). None blocked the run; all four are concrete, fixable items if the engine is productised — and none was visible until a second, differently-flavoured run exercised the code.

## After-state evidence

- Functional suite: **17/17** (`engine/tests/clinic.test.mjs`).
- axe: **0 violations** on home, detail, appointments.
- stateprobe vs token predictions: specialty chip 6.59 (= badge pair), selected day 4.72, selected slot 4.72, CTA rest 4.72, CTA hover 7.77 — every rendered state equals its token-stage prediction.
