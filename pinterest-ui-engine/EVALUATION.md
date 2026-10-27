# Evaluation — Engine vs Baseline (Mission 017)

## Setup

- **Brief (identical for both):** `runs/marble-meats/brief.json` — Marble Meats premium butcher delivery: browse/search/filter 8 cuts, product detail with weight stepper, bag with correct totals, checkout confirmation. Same content, same `data-testid` contract, same viewports (390×844, 1440×900).
- **Engine output:** `runs/marble-meats/app/` — produced by the full pipeline from reference R02 (spec → directions → validated tokens → template generation → inspection → critique → repair → regenerate).
- **Baseline:** `baseline/app/` — an ordinary single-pass build of the same brief by the same model: no spec, no tokens, no direction stage, no inspection-repair loop. It received the same functional test (and passed), but no visual iteration. This simulates the ordinary process; it is not an independent team's work (declared limitation).
- **Reference constraint (both):** no photography available offline — engine uses drawn SVG cuts; baseline uses letter tiles. The substitution is the baseline's ordinary choice and the engine's declared limitation.

## Results — kept separate by kind, per protocol

### Visual quality (blind scorer, screenshots only, anonymized setP/setQ; key in `eval/KEY.md`)

Full justifications: `eval/blinded-scores.md`.

| Axis (0–6) | Engine (setP) | Baseline (setQ) |
|---|---|---|
| 1. Hierarchy & composition | 5 | 3 |
| 2. Typography & spacing | 5 | 3 |
| 3. Colour coherence & restraint | 5 | 2 |
| 4. Component craft & consistency | 4 | 3 |
| 5. Distinctiveness / identity | 5 | 1 |
| 6. Responsive behaviour | 5 | 3 |
| **Total** | **29/36** | **15/36** |

The scorer's sharpest distinctions: setP "layers the home screen deliberately" with the hero → overlapping sheet composition and a palette used "identically on every screen"; setQ "could be any category of shop… nothing in it says butcher, premium, or this brand" (distinctiveness 1/6). setP lost its craft point for the "You May Also Like" heading sitting clipped at the fold in the detail screenshot (a scroll-framing artifact of a scrollable page — noted for fairness; the score stands) and for flat vector art where the reference is photographic.

### Functional correctness (shared suite, `engine/tests/app.test.mjs`)

| | Engine | Baseline |
|---|---|---|
| Result | **17/17** | **17/17** |

Function does not separate the two — replicating the SlotBook finding (15/15 builds at 32/32). The engine's claim is not functional superiority.

### Accessibility & measured states (axe + stateprobe, rendered)

| Measure | Engine | Baseline |
|---|---|---|
| axe violations (home/detail/bag) | **0 / 0 / 0** | color-contrast on all 3 views; + page-has-heading-one (detail); + heading-order (bag) |
| CTA contrast rest / hover | **9.67 / 13.63** (hover deepens, as tokenised) | 5.17 / 5.17 (no hover state change) |
| Selected-chip contrast | **9.67** | n/a (no equivalent measured element) |

The engine's rendered values equal its token-stage predictions exactly — the validation survived generation.

### Pixel metrics (home @390, `engine/analyze_image.py`)

| | Engine | Baseline | (R02 itself) |
|---|---|---|---|
| Saturated share (S≥0.25) | 54.3% | 26.0% | 30.4% |
| Largest hue-family share of coloured px | 89.9% (red family) | 61.5% | 47.5% |

Read carefully: the engine *overshoots* the reference's saturation share because its hero field fills more of the first viewport than R02's presentation crop — commitment achieved, dose not identical. The baseline's 61.5% hue-family share is produced by its four unrelated category tile colours pooling into warm bins; the metric alone cannot see incoherence — the blind scorer could (colour axis 2/6). Metrics support the visual verdict; they do not replace it.

## Verdict

On this single brief, the engine produced a markedly more reference-faithful, distinctive and accessible interface than the ordinary process, at equal functional correctness. The improvement concentrates exactly where the pipeline intervenes: committed composition (hero + sheet), a rationed one-hue system with validated states, serif/sans role pairing, and desktop re-composition rather than stretching.

## Limitations (explicit)

1. **Feasibility demonstration only** — one brief, one reference, one build per condition, one blind scorer. Nothing here proves general superiority.
2. **Blinding was partial** — the scorer was a fresh agent judging anonymized screenshots, but it inherited this session's context by platform design; it was instructed to judge only the images. Its justifications cite only visible screenshot facts.
3. **Same author for both builds** — the baseline is a *simulated* ordinary process. An independent ordinary build could be better or worse; the engine's margin (29 vs 15) is large, but the design is not a controlled trial like SlotBook.
4. **Photography substitution caps fidelity** — R02 is photo-led; both builds lack real photography. With a photo library, both would change; the engine's composition grammar is built to receive photos, the baseline's letter tiles are not a photo treatment.
5. **One template family** — the generator ships a `butcher` template. The pipeline stages (analyze → spec → directions → tokens → inspect) are brief-agnostic; template generation for a new category is new work, not a config change.
6. **Environment-bound** — the toolchain inherits the lab's symlinked modules and absolute paths (Mission 016-A Gap G3), unchanged by design in this mission.

## What would justify further token expenditure

- A second brief + reference family through the same pipeline (e.g. R15's clinical blue or R01's neutral gallery) to test whether the *pipeline* — not the butcher template — carries the gain. This is the single most informative next spend.
- An independent ordinary-process baseline (different builder, no shared context) to firm up the comparison.
Not justified: more directions for this brief, more repair rounds on this app (returns have flattened — axe 0, states at prediction, scorer deductions are now photography-bound), or a multi-agent swarm.
