# Design Engine — how the prototype works

## Why this shape (evidence, not taste)

The lab's experiments isolated why generated UI converges on generic: (1) builders never committed to a concept before coding — eight Taste-family builds drifted to the same ledger aesthetic; (2) design instructions lived as prose, so nothing enforced them at render time; (3) nobody inspected reached interaction states, so illegible selected/hover states shipped; (4) repairs, when they happened, were cosmetic. The engine is the smallest pipeline that attacks those four causes mechanically:

| Cause (evidence) | Engine countermeasure |
|---|---|
| No committed concept | Stage B forces 3 candidate directions with trade-offs and a **recorded, reasoned selection** before any code exists |
| Prose instructions unenforced | Stage C compiles the direction into tokens and **refuses to write them** if any text-bearing state pair fails WCAG contrast |
| States never inspected | Stage E measures reached states (selected chip, CTA rest/hover) with the Mission 016-B stateprobe on the rendered app |
| Cosmetic repair | Stage F repairs happen in templates/spec and the app is **regenerated**; before/after screenshots + full re-tests are the evidence |

## Pipeline (as implemented)

```
reference image ──► engine/analyze_image.py ──► measured palette JSON (deterministic, PIL)
measured palette + visual reading ──► design-spec.json (interpretation labelled as interpretation;
                                       uncertainty fields are mandatory in the format used)
design-spec.json ──► engine/art_direction.mjs ──► directions.json (3 archetype candidates)
directions.json ──► (selection with written rationale) ──► engine/make_tokens.mjs
                    ──► tokens.json, contrast-validated (imports stateprobe's WCAG maths)
tokens + brief ──► engine/generate.mjs + engine/templates/<name>/ ──► runnable app (vanilla, zero deps)
app ──► engine/tests/app.test.mjs (functional contract suite)
app ──► engine/inspect.mjs (screenshots 390/1440, stateprobe state measures, axe on 3 views)
screenshots ──► critique (critique.md) ──► template/spec repairs ──► regenerate ──► re-test, re-inspect
```

Archetypes in `art_direction.mjs` come from the forensics findings, not from a style catalogue: *committed field* (R02/R14: one hue owns real surface), *neutral gallery* (R01: colour delegated to imagery), *dark board* (the references' photo boards promoted to ground). A run picks one and says why; the other two remain in `directions.json` as the road not taken.

## What is automated vs what is judgement (honesty)

- **Automated/deterministic:** pixel palette analysis; direction candidate expansion; token generation; contrast validation of every text state; app generation from templates; functional tests; state measurements; axe; screenshot capture.
- **Model judgement, recorded as such:** reading the reference's composition/grammar into `design-spec.json`; the direction selection rationale; the visual critique in stage F; template design itself.
- **Not claimed:** the engine does not "see" images by itself — `analyze_image.py` measures pixels only. It does not invent layouts for arbitrary briefs: one template family (`butcher`) exists. Generalisation is unproven (see EVALUATION.md).

## Design decisions worth noting

- **Tokens carry states, not just colours.** `tokens.json` includes CTA hover, chip on/off, badge, stepper, tab states — because the SlotBook experiment proved the failures live in states, and stage C validates exactly those pairs.
- **The generator is a placeholder renderer, deliberately.** `{{dotted.path}}` substitution against tokens+brief; what the template says is what ships. The one bug this produced (a single-brace placeholder printing literally) was caught by rendered inspection, not by reading source — the pipeline working as intended.
- **Content is data.** Products/categories/prices live in `brief.json` and are injected as the app's dataset; the baseline evaluation build consumed the *same* brief, so content cannot explain score differences.
- **Zero new dependencies.** puppeteer-core/Chromium/axe are the lab's existing toolchain (via the documented symlink — see README's portability note); PIL was already installed.
