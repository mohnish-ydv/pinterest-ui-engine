# Reference Analysis — what the Pinterest corpus actually teaches

## Corpus verification

16 references, R01–R16, per `forensics/01-reference-image-manifest.md` (the 2 remaining media-library images are FORGE screenshots, excluded in the forensics mission). For this mission the following were **visually re-opened**: R02 and R14 at full resolution, plus all 16 via `forensics/artifacts/contact-sheet-references.png`. Phase-1 per-image analyses (`forensics/phase1/`) were used for the rest; nothing here relies on a description contradicted by the pixels.

## Principles that recur across the corpus (heterogeneous styles, shared discipline)

1. **One hue, committed or deliberately absent.** R02 spends deep red on ~a third of its home screen (hero field, CTAs, selection); R14 reserves flat orange for onboarding (100%) and then rations it to actions inside a white app; R01 spends almost none (0.37% saturated) and delegates colour to photography. What never appears: three or four mid-strength hues sharing a screen.
2. **Hierarchy by scarcity.** Each screen has exactly one largest element (R02's serif headline, R14's product photo, R15's doctor card). Generated UI typically makes everything the same size — the kits never do.
3. **A sheet geometry.** Content repeatedly arrives as a rounded sheet overlapping a coloured/photo field (R02 detail, R04, R09). The overlap itself is the brand gesture; cards *inside* the sheet stay flat and quiet.
4. **Photography (or a strong visual field) does the persuading; UI stays quiet.** Where photos lead, chrome is minimal: one search pill, one category row, one CTA colour.
5. **Micro-grammar is invariant across screens:** one button shape (R14: full pill everywhere; R02: pill CTAs + round icon buttons), one chip form, star ratings always the same amber, badges always the same tint pill. Numbers agree across screens (established in forensics: R16's checkout arithmetic matches its receipt exactly).
6. **Density is bimodal.** Browse screens are sparse and image-led; transaction screens (checkout, filter, form) are dense and text-led. Nothing sits at a uniform medium density.
7. **Disclosure at the decision point.** Totals, delivery and fees appear on the confirmation/checkout screen, not dripped into browse screens.

## Demo reference: R02 "Beefy" (deep-dive, from the full-resolution image)

Chosen because its family — deep red + warm cream + serif display + photo-led product presentation — is maximally distant from the paper/ink/green/Georgia-ledger direction all eight Taste-family SlotBook builds converged on, while its grammar is fully implementable without photography (see Limitations).

Measured (`engine/analyze_image.py` on the original file): modal hue bin 0° (red); deepest brand cluster ≈ **#801010** (quantized centre of the hero field); warm near-whites (#F0E0E0 / #F0F0E0 / #F0F0F0) ≈ 51% of pixels; saturation ≥0.25 covers 30.4% — a committed but not majority colour field.

Observed grammar:
- **Composition:** onboarding = serif display headline (two lines, tight leading) over cream, product photo breaking the bottom edge, red pill CTA. Home = deep-red hero field carrying brand row, tagline and a white search pill; a cream sheet with a large top radius (~28px) overlaps the hero; promo banner is a dark photo board with a circular badge; product cards are visual-first (photo ≈ 60% of card height), name + price beneath, small round red add-button. Detail = full-bleed photo header, white sheet overlapping it, content in a strict left rail.
- **Typography:** high-contrast serif for display and product names; clean grotesque sans for UI text, prices semi-bold; ratings small with amber stars. Two families, no more.
- **Palette roles:** deep red = brand field + primary action + selection (one role family); cream = ground; warm ink = text; pale pink tint = badge surface; amber = ratings only; dark green appears exactly once, as the "100% Halal" certification badge — semantics rationed to a single use.
- **Shape:** pills for CTAs, circles for category selectors (selected = filled red, white glyph), ~20px card radius, ~28px sheet radius, round 36px add buttons.
- **States:** selected category is a filled circle, not an outline; the cart tab carries a count badge; the detail stepper is a bordered pill with − / +.

## Contrast reference: R14 (food ordering, flat orange)

Measured: modal hue 20°, hue family = 89.6% of coloured pixels — the most single-hued board in the corpus. Its lesson is the inverse of R02's: total commitment in onboarding, then strict rationing inside the app (white screens, orange only where a finger lands). Both are the *same* principle at different doses — which is why the engine treats "colour commitment" as a direction parameter, not a fixed rule.

## What was NOT inferred (uncertainty preserved)

Fonts cannot be identified from the boards (the spec records *roles*: "high-contrast serif display", not font names). Exact hex values come from pixel clusters, which mix the UI with photography — brand values in the spec are cluster centres adjusted to the flat fields visible in the UI chrome, and are labelled as such. Animation, haptics and real content quality are not visible in static boards and are not claimed.

## Limitation carried into the demo

R02 is photography-led and this environment has no photo library and no network. The demo therefore substitutes **drawn product visuals** (SVG cut illustrations on dark boards, in the photo's compositional slot). The composition, geometry, palette and grammar transfer; photographic richness does not, and the evaluation scores the result with that substitution declared — the baseline lives under the same constraint.
