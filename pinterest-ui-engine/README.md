# Pinterest-Quality UI Engine

A reference-to-interface engine: it measures a design reference, derives design principles, compiles validated design tokens, renders a working app from a template family, and then **measures the rendered states** — contrast, hover, selection, error, post-action — rather than assuming them.

For what the references teach see `REFERENCE_ANALYSIS.md`; for the pipeline see `DESIGN_ENGINE.md`; for the baseline comparison and its limits see `EVALUATION.md`. Mission 020's audit, architecture, changes and results are in `../mission020/`.

> **Status, stated plainly (Mission 022).** The engine generates CarePoint from a declarative brief and the **original, unchanged 18-check hand-authored CarePoint suite passes 18/18**. The interaction vocabulary grew from 12 to 15 components (availability selection, committed-record collections with confirmed cancellation, banners) and the IR to v2 with declared test hooks and state transitions. A second unseen app (Deskly, desk booking) exercises the same primitives with different parameters and **zero app-specific engine code**. See `../mission022/`.
>
> **Status (Mission 021).** The engine both validates *design systems* and **generates layout**. From a brief and a reference it plans an information architecture, composes pages from a 12-component vocabulary, compiles a runnable app, and derives that app's own test plan and inspection contract. The new StayNest app contains **zero hand-written app-specific source lines**. It does not invent new components: a new *kind* of UI (calendar, map, media player) still needs a component written by hand. See `../mission021/`.

## Setup

```bash
npm install                      # once, at the package root (puppeteer-core)
pip install -r requirements.txt  # Pillow, for reference analysis only
export CHROME_PATH=/path/to/chromium   # optional — conventional locations are found automatically
```

## Run everything

```bash
npm run verify:env    # checklist with the specific fix for anything missing
npm run demo          # env -> tokens -> generate -> suites -> inspection -> one summary
```

`npm run demo` exits non-zero if any stage fails. It currently reports **15/15 stages green**.

## Generating an app (Mission 021)

```bash
node engine/reference_profile.mjs ../references/R09.jpg --out runs/staynest --draft
node engine/art_direction.mjs runs/staynest --choose neutral-gallery --why "…"
node engine/make_tokens.mjs runs/staynest
node engine/build_app.mjs runs/staynest          # PLAN -> IR -> app + gates
node engine/tests/flow.test.mjs runs/staynest/app
node engine/inspect.mjs runs/staynest/app runs/staynest/app/inspect.contract.json demo-out/staynest
```

`build_app.mjs` prints the plan it chose and why:

```
PLAN  StayNest  (domain: marketplace, density: comfortable — light share 76.1%, saturated share 9.49%)
      navigation: tabbar (2 top-level destinations, mobile-first)
      view "browse": app-header -> page-heading -> search-bar -> filter-chips -> entity-collection
      ...
      gates: testplan.json (38 checks), inspect.contract.json
```

The app is six generated files: `index.html`, `styles.css`, `data.js` (the layout IR + data model), `app.js` (the generic runtime), and its two derived gates. Nothing app-specific is written by hand.

## The pipeline, stage by stage

```bash
# A. measure the reference (deterministic pixel analysis)
node engine/reference_profile.mjs ../references/R12.jpg --out runs/swiftgo --draft
#    -> reference-profile.json: measured metrics, derived principles (each tagged
#       measured/interpreted/unknown), and a scored archetype recommendation

# B. art direction: candidates, then a recorded selection
node engine/art_direction.mjs runs/swiftgo
node engine/art_direction.mjs runs/swiftgo --choose neutral-gallery --why "<rationale>"

# C. tokens — family config + contrast gate. Refuses to write an illegible set.
node engine/make_tokens.mjs runs/swiftgo

# D. generate the app from a template family
node engine/generate.mjs runs/swiftgo swiftgo runs/swiftgo/app

# E. functional contract suite
node engine/tests/parcel.test.mjs runs/swiftgo/app        # expect RESULT 22/22

# F. rendered inspection — screenshots, state contrast, axe
node engine/inspect.mjs runs/swiftgo/app runs/swiftgo/inspect.contract.json demo-out/swiftgo
```

Open `runs/<run>/app/index.html` directly — `file://`, no server needed.

## npm scripts

| Script | Does |
|---|---|
| `verify:env` | environment checklist, actionable fixes |
| `demo` | the whole pipeline, one summary |
| `tokens:{marble,carepoint,swiftgo}` / `tokens:all` | compile + gate tokens |
| `gen:{marble,carepoint,swiftgo}` / `gen:all` | generate apps |
| `test:unit` | pure-logic tests: gate, family config, contract, profiler, token parity |
| `test:layout` | planner, IR validation, gate derivation, vocabulary integrity |
| `test:carepoint-acceptance` | the **original, unchanged** 18-check CarePoint suite against the generated app |
| `test:{carepoint-ir,deskly}` | run a generated app's derived suite |
| `plan:{staynest,carepoint-ir}` | generate an app from a brief |
| `test:{staynest,carepoint-ir}` | run a generated app's derived suite |
| `inspect:{staynest,staynest-baseline}` | rendered inspection of the generated app and its baseline |
| `test:stateprobe` | measurement-library self-tests (21) |
| `test:{marble,carepoint,swiftgo}` | functional suites (17 / 18 / 22) |
| `test:slotbook` | the SlotBook experiment's own suite (32) |
| `test:engine` | unit + stateprobe + all three functional suites |
| `inspect:{marble,carepoint,swiftgo}` | rendered inspection |
| `profile:r02` / `r15` / `r12` | reference profiles |
| `check:directions` | verifies each run's chosen direction against the profiler |

## Layout

```
engine/
  layout/                 MISSION 021: the generation pipeline
    plan.mjs              planner: brief + reference -> layout IR
    compile.mjs           IR + tokens -> app + derived gates
    gates.mjs             derives testplan.json and inspect.contract.json
  runtime/                the generic app runtime + component CSS
  build_app.mjs           one command: run directory -> planned, compiled, gated app
  analyze_image.py        stage A: deterministic palette/saturation/hue metrics
  reference_profile.mjs   stage A->B: metrics -> principles -> archetype scores
  art_direction.mjs       stage B: candidates from engine/archetypes.json
  make_tokens.mjs         stage C: family config -> tokens, with a contrast gate
  generate.mjs            stage D: {{placeholder}} substitution
  inspect.mjs             stage E: contract-driven screenshots, state measures, axe
  verify_env.mjs, demo.mjs
  lib/
    color.mjs             pure WCAG maths — no browser, no I/O
    stateprobe.mjs        vendored measurement library (browser session + measure)
    chrome.mjs            portable Chromium resolution + shared launch args
    family.mjs            design-family config: load, resolve, validate
    gate.mjs              contrast gate, derived from the emitted tokens
    contract.mjs          inspection-contract validation
  families/               butcher.json, clinic.json, swiftgo.json
  archetypes.json         the three art-direction archetypes, as data
  templates/              butcher/, clinic/, swiftgo/
  tests/                  unit, stateprobe, app, clinic, parcel
runs/
  marble-meats/  carepoint/  swiftgo/
    brief.json  design-spec.json  directions.json  tokens.json
    reference-profile.json  inspect.contract.json  app/
```

## A design family is a JSON file

`engine/families/<name>.json` supplies every decision that is specific to a design direction: display/UI typography, hairlines and borders, shadows, ground source, semantic roles (error/warning/success), interaction states (hover/disabled/loading), spacing, density and responsive rules. The compiler contains no design literal of its own.

A colour field accepts a hex literal, `"spec"` (read `spec.palette[role]`), or `"palette:key"` (read another role) — so a family can say `"hairline": "palette:tint"` instead of repeating a hex. An absent required role is a hard failure with the fix named; the engine does not guess a colour.

## Portability

No cross-project imports: the engine's colour maths and measurement code live in `engine/lib/`. Deleting `slotbook-experiment/` does not break it (verified — see `../mission020/TEST_RESULTS.md` §4). Chromium is resolved from `CHROME_PATH`, then conventional locations, then `PATH`, with an actionable error if nothing is found. The SlotBook suite still runs unmodified via `engine/tools/run_with_chrome.mjs`.
