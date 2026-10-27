# Mission 044 — Portability Audit and Distribution Architecture

**Subject:** Pinterest UI Engine `1.24.0-mission043`, prepared for use
by an independent AI coding agent (e.g. Indus AI).
**Verdict: READY WITH LIMITATIONS** — a verified portable candidate,
28× smaller than the M043 archive, with one integration contract that
must be read (capability trigger words, §5.1) and one engine
hardening recommended as follow-up (§6). M043 itself was not
modified; the candidate's engine is byte-identical to it.

## 1. What the M043 package actually is (Stage 1 — measured, traced)

| | Bytes |
|---|---|
| M043 delivery archive | 91,280,786 |
| M043 tree, extracted | 139,862,429 |
| — of which `node_modules` | 26,997,782 |
| — of which historical experiment dirs (slotbook-experiment, forensics, bench025–034 working files, research, variants, mission021–023, references) | ≈ 89,000,000 |
| — of which the actual engine subtree `pinterest-ui-engine/` | 4,765,996 |
| — — engine source `engine/` (88 files) | 833,740 |
| — — fixture runs | 2,316,037 |
| — — historical `mission018` + `eval` + `baseline` inside the subtree | 1,586,010 |

Traced, not inferred:

- **The engine is self-contained.** No import in `engine/` escapes
  the folder (verified by import scan). Its own code even documents
  that deleting `slotbook-experiment/` must not break it.
- **One dependency exists:** `puppeteer-core` 25.16.0. Everything
  else is Node stdlib. Puppeteer is used by tests, inspection and
  test-plan execution — **generation never launches a browser**.
- **Generation pipeline** (`engine/run.mjs <caseDir>`): derive →
  spec → art direction → contrast-gated tokens → build. Only input:
  `<caseDir>/product-brief.json` (+ optional `reference-evidence.json`
  and per-item `image` files). Outputs land inside the case dir.
- **Optional Python 3 + Pillow** renders app icons; absence degrades
  gracefully (manifest without icons — code-verified try/catch).
- **Generated apps are dependency-free static files** (zero imports
  in the compiled `app.js`); state persists in localStorage.
- **Hidden assumptions found:** `engine/lib/chrome.mjs` probes
  `CHROME_PATH`, then PATH, then hardcoded candidates including the
  development machine's `/opt/meta-chromium/chrome`; three design
  test files repeat that fallback. Nine regression suites read
  historical case fixtures from the tree root (`bench*/cases`,
  `mission020` token files) — dev-workspace coupling, mapped
  file-by-file in §3.

## 2. The candidate distribution (Stages 2–3)

Internal layout is preserved exactly, so every engine path, suite
and script behaves as in the dev tree. Tiers:

| Tier | Contents | Bytes |
|---|---|---|
| Core engine | `pinterest-ui-engine/engine/` (verbatim M043, tests included) | 831,954 |
| Design intelligence | `pinterest-ui-engine/DESIGN_GRAMMAR.md` + engine docs | ≈ 29,000 |
| Fixtures | `pinterest-ui-engine/runs/` (4 testplan case apps + briefs; historical screenshots removed) | 782,530 |
| Regression corpus | `bench*/cases` (5 benches), `bench/lib`, `mission020` token files | 7,032,748 |
| Example | `examples/fern-and-co/` — a new plant-shop brief + 7 photos (Wikimedia Commons) | 708,739 |
| Integration | `README.md`, `INTEGRATION.md`, cleaned `package.json`, `run-suites.mjs` | ≈ 12,000 |
| **Total extracted** | | **9,397,396** |
| **Archive** | `pinterest-ui-engine-portable-1.24.0.zip` | **3,211,407** |

The engine alone (core + grammar + manifests) is ≈ **0.87 MB**; the
corpus is the honest price of running the historical regression
suites, and is labelled test tooling in the README.

**Excluded, and why it is safe:** `node_modules` (regenerable; one
dependency); all historical experiment/research/bench working dirs
(~89 MB — no engine import reaches them; the suites' fixture reads
were traced and only the `cases` subdirs + `bench/lib` + two
`tokens.json` files are actually consumed, and those are included);
`mission018`/`eval`/`baseline` inside the subtree (unreferenced);
`runs/*/shots-before|after` (historical screenshots no suite reads —
they also held the package's only absolute workspace paths; the
candidate now contains **zero** `/home/...` strings); legacy npm
scripts pointing at excluded dirs (replaced); mission reports
(history lives in the mission deliveries).

## 3. Clean-room verification (Stage 4)

Fresh directory, the candidate archive (the shipped ZIP is that archive plus this report), only documented commands
(`unzip`, `npm install`, `CHROME_PATH=…`, `node …/run.mjs`). A new
brief the engine had never seen — **Fern & Co**, a plant shop with a
bag, two filter facets, a promo and supplied photos:

- Photo variant: generated, **fulfilment 13/13**; journey driven in
  a real browser **19/19** — search, both facets from the shared
  chips row, adds from card and detail, crate totals ₹2,997 with
  free delivery, 3-step checkout, confirmation `FC-…`, order listed.
- Reference-free variant (image fields stripped): **13/13**, journey
  **19/19** with gradient media.
- Grammar/composition probes on the generated app: pill search
  (radius 999, no search button), one chips row for two facets,
  card meta 2-line clamp, first product card at **378px** (390px
  viewport) — M042/M043 behaviour intact in a foreign brief.
- Layouts captured at 390px and 1440px.
- Regression **from the archive itself**: core 13 suites, design
  8 suites (M036–M043), fixture testplans 4 — **427/428**, identical
  to the M043 dev-tree result. The one failure is the pre-existing
  layout vocabulary check (40/41, corpus predates the bag,
  disclosed since M039). **No new failures.**

### Clean-room findings and fixes (all inside the candidate)

1. **Nine suites failed on missing bench fixtures** → the corpus
   tier was identified file-by-file and included.
2. **critique scored 8/10**: a fixture's `acceptance.mjs` imports
   `bench/lib/harness.mjs` (3.8 KB, cross-bench) → included → 10/10.
3. **`&&`-chained npm test scripts masked later suites** (first
   non-zero exit stopped the chain) → `run-suites.mjs` runs each
   suite as its own process and reports all of them.

## 4. Dependencies and runtime requirements

Node.js ≥ 18 (developed and verified on v24.22.1); one npm
dependency (`puppeteer-core` 25.16.0, tests/inspection only);
Chromium/Chrome + `CHROME_PATH` for anything browser-driven;
optional Python 3 + Pillow for app icons; network only for
`npm install`. No API keys, accounts, or services.

## 5. Limitations and blockers for Indus AI integration

### 5.1 Capability trigger words — read this before writing briefs
The bag/cart is derived only when a requirement sentence uses
**bag**, **cart** or **basket** with an add verb. My first clean-room
brief said "crate" throughout: the engine generated a complete-
looking app **with no bag at all**, while still reporting fulfilment
13/13 — because fulfilment decomposes only the capabilities it
derived, so an un-derived requirement leaves no trace. This is the
single most important integration fact in this report. The candidate
handles it at the contract level: `INTEGRATION.md` documents the
trigger vocabulary, and the shipped example uses it (the bag still
*displays* as "Crate" via `bagLabel`). **Recommended engine
follow-up (not in this package):** broaden the vocabulary
(crate/trolley/basket synonyms) and, more importantly, make
fulfilment report requirements that produced no outcomes, so a
missing capability can never again pass silently.

### 5.2 Smaller items
- `lib/chrome.mjs` retains the dev machine's browser path as one
  fallback among several; harmless elsewhere, but integrators
  should set `CHROME_PATH` explicitly.
- Reference-guided generation (`reference_profile.mjs` on supplied
  reference JPGs) is an engine feature whose historical reference
  set (`references/`, 2.5 MB) is excluded as example data; an
  integrator supplies their own reference images + a
  `reference-evidence.json` per the contract.
- Generated apps are front-ends with local state: accounts,
  payments, maps and sync remain the integrator's services to
  supply. The engine does not fake them.
- GitHub publication itself was **not** performed (per the
  commission). Nothing technical blocks it: the candidate is a
  clean tree with a manifest, docs and a verified test story. A
  licence file has not been chosen — that is the publisher's
  decision, and the one remaining non-technical blocker.

## 6. Recommendation

**READY WITH LIMITATIONS.** An independent agent can download the
candidate, follow `INTEGRATION.md`, and generate working apps from
new briefs today — proven from the shipped archive, twice, with two
brief variants and the full regression battery. The limitations are
documented contracts (§5.1), an optional dependency story (§4), and
one recommended engine hardening (silent requirement omission) that
should land before the engine is trusted with fully autonomous,
unreviewed brief-writing.

## Reproduce the clean room

```bash
unzip pinterest-ui-engine-portable-1.24.0.zip -d cleanroom
cd cleanroom/pinterest-ui-engine-portable
npm install
export CHROME_PATH=/path/to/chrome
node pinterest-ui-engine/engine/run.mjs examples/fern-and-co   # fulfilment 13/13
node run-suites.mjs core && node run-suites.mjs design && node run-suites.mjs fixtures
```
