# Pinterest UI Engine — Portable Distribution

**Version:** engine `1.30.0-mission050` (portable distribution; M044
candidate, repaired out-of-box in Mission 048, chip-rail repair in Mission 049)
**What it does:** give it a product brief — one JSON file describing a
product in plain language — and it generates a complete, working,
self-contained mobile web application: catalogue, search, filters,
favourites, bag/cart, multi-step checkout, orders, confirmations.
No framework, no build step, no server required for the output.

The design intelligence is in the engine, not in templates per
product: a 12-law design grammar (`pinterest-ui-engine/DESIGN_GRAMMAR.md`)
and a composition layer that keeps chrome compact and information
prioritised, applied to any brief.

## Quickstart

```bash
npm install                 # once: puppeteer-core, used by tests/inspection only
node pinterest-ui-engine/engine/run.mjs examples/fern-and-co
# → examples/fern-and-co/app/index.html   (open it, or serve the folder)
```

Generation itself needs **no browser and no network**. To run the
test suites and inspection tools you also need a Chromium/Chrome
binary; point the engine at it with `CHROME_PATH=/path/to/chrome`
(see INTEGRATION.md §Environment).

## Make your own app

**Starting with a person, not a pipeline? Begin with `INTAKE.md`.**
The engine interviews the user first (questions in
`intake-questions.json`), drafts the brief from their answers, and
checks it with the brief doctor — because its best screens are
declared, never derived, and a brief written straight from a one-line
prompt silently omits them.

1. Create a folder, e.g. `cases/my-shop/`.
2. Write `product-brief.json` in it (contract: INTEGRATION.md §Input).
3. Optional: drop photos in `cases/my-shop/assets/` and reference
   them from the brief (`"image": "assets/dish.jpg"`).
4. Run `node pinterest-ui-engine/engine/run.mjs cases/my-shop`.
5. Your app is in `cases/my-shop/app/` — static files, yours to host
   anywhere. It stores its state in the browser (localStorage).

## Layout

| Path | Contents |
|---|---|
| `pinterest-ui-engine/engine/` | The engine: pipeline, runtime, templates, tests. Self-contained; nothing imports outside this folder. |
| `pinterest-ui-engine/runs/` | Regression fixtures: four pre-generated case apps with their briefs and test plans. |
| `pinterest-ui-engine/DESIGN_GRAMMAR.md` | The design laws the engine obeys. |
| `examples/fern-and-co/` | A complete worked example (brief + photo assets). |
| `bench*/cases/`, `mission020/` | The regression corpus: historical case fixtures that nine engine suites read. Test tooling only — generation never touches them. |
| `INTAKE.md` + `intake-questions.json` | The intake interview: the questions the engine asks before a brief is written, and the brief doctor that checks it. |
| `INTEGRATION.md` | The full contract for integrating agents: inputs, outputs, environment, guarantees, limits. |
| `vendor/axe-core/` | The vendored axe-core build (4.14.0, MPL-2.0) used by inspection and accessibility checks. Ships in the tree; never install it by hand. |
| `package-lock.json`, `requirements.txt` | The pinned npm dependency and the optional Pillow pin for reference analysis. |

## Verify your install

```bash
export CHROME_PATH=/path/to/chrome   # only needed for tests
npm run verify:env       # environment checklist — expect "ENV RESULT: ready"
npm run test:core        # engine suites
npm run test:design      # design-grammar + composition suites (M036–M048)
npm run test:fixtures    # the four fixture apps' behavioural test plans
```

Everything the engine needs ships in the tree: axe-core is vendored
at `vendor/axe-core/` (no manual step — if `verify:env` ever says it
is missing, the tree was extracted incompletely), and the one npm
dependency is pinned by `package-lock.json` (`npm ci` works).
All suites are expected to pass in full.
