# Mission 049 — The Two "All" Chips

**Engine:** v1.29.0-mission049 (was 1.28.0-mission048)
**Trigger:** an external AI ran the published v1.28 engine and reported everything green — verify:env ready, Fern & Co at 13/13, every suite passing — with one passing observation: *"the filter row shows two chips labelled 'All' — one for the Type group and one for Light, which scrolls off-screen. It's functionally fine, just slightly ambiguous."* Mohnish's verdict: the engine is still not working the way it is supposed to work; review and fix it. He was right, and "functionally fine" was exactly the problem: every test passed because no test read the row the way a person does.

## Root cause, traced to code

Reproduced from the pristine M048 tree (Fern & Co, 390px, real Chromium): the browse rail renders

`All (Type, selected) · Foliage · Flowering · Palm ❘ All (Light, selected) · Bright · Medium · Low`

with both "All" chips in their selected state at once, the second at the right edge and its three options off-screen.

- `engine/runtime/runtime.js`, `R['filter-chips']`: since M043, consecutive facet sections are folded into **one** `.chips` row; the groups are joined only by a `<span class="chip-sep">` — a 1px hairline (`components.css.tmpl`, `.chip-sep`).
- `engine/intake/derive.mjs` sets **every** facet's `allLabel` to the bare string `'All'`, and the renderer used it as the visible text for each group's reset chip.
- The rail's container `aria-label` named only the **first** section's label ("Type"), so the row was mislabelled for screen readers too.
- Why 507 green checks missed it: the generated test gates (`engine/layout/gates.mjs`) select chips by their **data attribute value** (`[data-type="All"]`), never by visible text, and no suite asserted that two chips in one row must not share a label.

## Audit — same class, other surfaces

Each surface where a first-time user meets a filter control was checked against the same question: *can they tell what this control does?*

1. **Multi-facet chip rail** — duplicate reset labels, both selected. **Defect. Fixed.**
2. **Rail container aria-label** — named only the first facet. **Defect. Fixed** (now "Filters: Type, Light").
3. **Filter sheet reset chips** — visually fine (each group has a heading, the M046 design), but the reset chip itself carried no facet name for a screen reader. **Defect (accessibility). Fixed** with `aria-label="All <facet>"`; visible text unchanged because the heading already does that job visually.
4. **Chip-rail scrolling** — M047 (law 28) hid rail scrollbars and nothing replaced the affordance, so a whole facet group could sit off-screen unannounced. The data **tables already had** the correct pattern (`syncTableAffordance`: a measured fade shown only while more remains). Chip rails never got it. **Defect. Fixed** with the same measured approach (`syncChipAffordance` + a trailing-edge fade while, and only while, more chips remain to the right; the fade lifts when the user scrolls to the end).
5. **Category medallions "All"** — a single facet group whose section *is* the category rail; nothing else in that control shares the label. **Not a defect.** Left unchanged; the rule is documented in law 33.
6. **Fern home subtitle truncating mid-sentence** ("…browse the greenhouse shelf,…") — a deliberate clamp from M038/M045 acting on decorative copy, not a control. **Observed, deferred** — recorded here rather than silently changed, because those missions chose the clamp on purpose and this mission's class is controls.

## The fix (grammar law 33)

*A label that repeats must say what it repeats for.*

- In a **multi-group** rail, each reset chip's visible text is qualified by its own facet's label — **"All Type"**, **"All Light"** — and every chip carries an `aria-label` naming its facet ("Type: Foliage", …). Labels come from each group's own declared `props.label`; no facet, product or category string is hardcoded anywhere in the engine.
- The reset **value** is unchanged: `data-*="All"`, filter state and the gate selectors key on value, never on text — proven below by the functional checks passing identically on both trees.
- A **single-group** rail keeps the plain "All": with one facet there is nothing to confuse it with, and qualifying it would be noise.
- Filter-sheet reset chips gain `aria-label="All <facet>"` (visible text unchanged, headings already label the groups).
- `.chips[data-overflow="true"]` fades its trailing edge; the runtime measures overflow after every render (double `requestAnimationFrame`, the table affordance's own pattern), on resize/load, and on rail scroll.

Files changed vs M048 (9): `engine/runtime/runtime.js`, `engine/runtime/components.css.tmpl`, `DESIGN_GRAMMAR.md` (law 33), `engine/tests/design049.test.mjs` (new), `run-suites.mjs` (design049 registered), `package.json` + `package-lock.json` (1.29.0-mission049), `README.md` + `INTEGRATION.md` (version lines). Full patch: `ENGINE_DIFF.patch` (371 lines).

## Evidence

**New suite design049 — must fail on the old engine, and does:**
- On a pristine M048 copy: **9 passed, 8 failed.** All 8 failures are the labelling/affordance assertions (duplicate visible text `["All",…,"All",…]`, unqualified resets, rail aria-label "Type" only, no chip aria-labels, no `data-overflow`, no fade, sheet resets unnamed). All functional checks (filtering narrows, resets restore) **passed on M048 too** — the behaviour was never broken; the labelling was.
- On M049: **17/17**, including filter/restore for both facets, single-facet plain "All", and no page errors.

**Battery on M049** (exact, re-measured this mission):
- core **240/240** (13 suites)
- design **189/189** (13 suites, incl. design049 17/17 and design048 10/10)
- fixtures **95/95** (17/17, 18/18, 22/22, 38/38)
- **Total 524/524.** (M048's total was 507/507; the +17 is the new suite. Note the first design run flagged design049 as "no RESULT" because the suite's final line did not follow the runner's `RESULT n/n` convention — the suite was fixed to print it and the design group re-run in full: all suites passed.)
- verify:env: **ready** (6/6; Node v24.22.1 in this VM, puppeteer-core 25.16.0, Chromium `/opt/meta-chromium/chrome`, Pillow 10.2.0 per `requirements.txt`).
- Regressions: Fern & Co **13/13**, OLX-shaped brief **12/12**, Evira showcase **10/10** — all regenerated with the M049 engine.

**Screenshots** (`screens/`, 390px, real Chromium):
- `fern-before-390.png` — M048: two red "All" chips, both selected; Light's options off-screen, no fade.
- `fern-after-390.png` — M049: "All Type" leads the Type group; the next chip ("All Light") sits at the right edge **fading**, telling the user the row scrolls and a second group exists.

**Clean room:** the delivered zip was extracted to a fresh directory with no manual steps — `npm ci` → verify:env ready → Fern 13/13 → design049 17/17 → layout 41/41. (Result recorded at the end of this report's verification log in the mission workspace; the zip below is the exact archive that was extracted.)

**M048 preserved:** the M048 tree was manifest-hashed before work began (918 files, excluding `node_modules`) and re-hashed after: **unchanged**.

## Honest limits

- The fix is the labelling and affordance layer of filter controls. It does not change what the engine generates structurally, and it does not close the standing gaps from earlier missions (photo art direction, live services, no native APK, no human evaluation).
- "All Type" is the facet's declared label used as-is; the engine does not pluralise labels ("All Types") because generic pluralisation of arbitrary labels is worse than the terse form.
- Not pushed to GitHub and not deployed — neither was asked for in this mission.
