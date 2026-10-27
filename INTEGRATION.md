# Integration Guide — Pinterest UI Engine 1.24.0

For an AI coding agent or developer integrating this engine into
another system (e.g. Indus AI). Everything here was verified in a
clean-room run (Mission 044): a fresh directory, only the commands in
this document, a brief the engine had never seen.

## 1. Entry point

```
node pinterest-ui-engine/engine/run.mjs <caseDir>
```

- `<caseDir>` must contain `product-brief.json`. That file is the
  **only required input**.
- The command runs five stages (derive → spec → art direction →
  tokens → build), stops at the first failure with a non-zero exit,
  and prints a fulfilment summary: how many of the brief's stated
  requirements the generated app demonstrably satisfies.
- It is safe to re-run: outputs are regenerated deterministically.

There is no daemon, no API key, no account, and no network access
during generation.

## 2. Input contract — `product-brief.json`

Top-level keys (all plain JSON):

| Key | Meaning |
|---|---|
| `name`, `tagline`, `about`, `location` | Brand identity and copy. |
| `domain` | Free-text product domain ("plant shop", "clinic"). |
| `currency` | Symbol used for money fields, e.g. `₹`, `$`. |
| `collection` | `{ label, plural, media: true, items: [...] }` — the catalogue. Each item is an object whose keys match `fields[].id`; an item may carry `"image": "assets/photo.jpg"` (path relative to the case dir) for real photography, or omit it for generated gradient media. |
| `fields` | Typed schema: `{ id, label, type, options? }` with `type` ∈ `text, enum, money, number, date`. Roles (facet/stat/price/title…) are derived from the requirements text, not declared. |
| `requirements` | Plain-language sentences stating what users can do. These drive capability derivation, layout, test-plan generation **and** the fulfilment report. Write them as user capabilities ("Customers can filter plants by type."). |
| `bagLabel`, `deliveryFee`, `freeAbove` | Optional commerce knobs; a bag exists only when a requirement asks for one. |

**Capability trigger words (important).** Capabilities are derived
from the requirement sentences, and the bag/cart is derived only
when a requirement uses one of the words **bag**, **cart** or
**basket** together with an add verb — e.g. "Customers add plants to
a bag…". The bag's *displayed* name is then taken from `bagLabel`,
so a shop can call it a Crate, Trolley or anything else on screen
while the requirement sentence keeps the trigger word. A brief that
only ever says "crate" will silently generate **without** a bag
(verified in the Mission 044 clean room; see the mission report).
The same pattern — plain capability sentences — drives search,
filters, favourites (a "save … with a heart toggle" sentence) and
the three-step checkout sentence; the worked example's
`requirements` are safe templates to copy and adapt.
| `promo` | Optional `{ title, subtitle, cta, recordId, image? }` banner. |
| `commitTitle`, `referencePrefix`, `submissionsLabel` | Optional flow wording (confirmation title, order-reference prefix, orders tab label). |

Optional beside the brief: `reference-evidence.json` — measured
facts about a reference design (palette samples, composition) that
bias art direction. Absence is normal; the engine is reference-free
by default.

A complete worked example: `examples/fern-and-co/product-brief.json`.

## 3. Output contract

After a successful run, `<caseDir>/` contains the pipeline reports
(`brief.json`, `design-spec.json`, `tokens.json`, `layout.json`,
`fulfilment.json`, …) and:

```
<caseDir>/app/
  index.html            open this
  styles.css  app.js  data.js
  assets/               your supplied photos, copied in
  icon-192.png  icon-512.png   (when Python+PIL is available)
  manifest.webmanifest
  testplan.json         a generated behavioural test plan for the app
```

**The app is fully self-contained static files.** No imports, no
runtime dependency on this engine, no build step. Host it on any
static host or open `index.html` via `file://`. State (bag,
favourites, orders) persists in the browser's localStorage.

## 4. Environment

| Requirement | Needed for | Notes |
|---|---|---|
| Node.js ≥ 18 (developed/tested on 24) | everything | ESM throughout. |
| `npm install` (puppeteer-core 25.16.0) | tests, inspection, test-plan execution | **Not** needed for generation. No other dependency exists — everything else is Node stdlib. |
| Chromium/Chrome binary + `CHROME_PATH` env var | tests, inspection, screenshots | Generation never launches a browser. `engine/lib/chrome.mjs` also probes PATH and a few conventional install locations if `CHROME_PATH` is unset. |
| Python 3 + Pillow (`PIL`) | app icons only | Optional: without it the build succeeds and writes the manifest without icons. |
| Network | `npm install` only | Generation and the generated app are offline. |

## 5. Guarantees an integrator can rely on

- **Determinism:** same brief + same engine → byte-identical app.
- **Fulfilment honesty:** the run prints `fulfilment N/M satisfied`;
  unmet requirements are named, never silently dropped.
- **Design behaviour:** the M042 grammar (one accent; shadow or
  outline, never both; pill search with the icon inside; quiet chips;
  one sans for working type) and the M043 composition layer (content
  first; facets share one row; priority-ordered card meta that wraps
  before it truncates) are compiled into every app — check any
  generated `styles.css` for the `MISSION 042` / `MISSION 043`
  blocks, or run `npm run test:design`.
- **Containment:** the engine reads/writes only inside the case dir
  and its own tree. Generated apps contain no absolute paths and no
  references back to the engine.

## 6. Limits (stated, not hidden)

- The engine generates **front-ends with local state**. Accounts,
  payments, maps, push, and multi-device sync are services an
  integrator must supply; the engine does not fake them.
- Photography is the integrator's to supply (per-item `image`);
  without it the engine renders branded gradient media.
- One known stale check: `layout.test.mjs` 40/41 (vocabulary corpus
  predates the bag component; disclosed since M039).
- `engine/lib/chrome.mjs` retains a fallback browser path from the
  original development environment (`/opt/meta-chromium/chrome`) as
  one of several probed locations. Set `CHROME_PATH` to be explicit;
  the fallback is inert on machines without that path.
