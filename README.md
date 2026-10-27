# Pinterest UI Engine — Portable Distribution

**Version:** engine `1.24.0-mission043` · portable candidate 1 (Mission 044)
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
| `INTEGRATION.md` | The full contract for integrating agents: inputs, outputs, environment, guarantees, limits. |

## Verify your install

```bash
export CHROME_PATH=/path/to/chrome   # only needed for tests
npm run test:core        # engine suites
npm run test:design      # design-grammar + composition suites (M036–M043)
npm run test:fixtures    # the four fixture apps' behavioural test plans
```

One known, pre-existing failure: `layout.test.mjs` reports 40/41 —
its fixed vocabulary corpus predates the bag component (disclosed
since Mission 039; the check, not the engine, is stale).
