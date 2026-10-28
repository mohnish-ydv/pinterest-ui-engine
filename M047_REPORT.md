# Mission 047 — The intake interview, and the Bazaar corrections

**Engine: 1.27.0-mission047** (`improved/`, a full copy of the M046
distribution; M043–M046 trees untouched). Diff vs 1.26:
`delivery/ENGINE_DIFF.patch` — 14 files.

## Why this mission exists

Mohnish supplied screenshots of **Bazaar**, a classifieds app another
AI built from engine 1.26, next to the Evira board, with two charges:
(1) the user's *prompt* may be the real problem — so when someone says
"start the engine", the engine should **ask questions** and build the
brief from the answers; (2) the results still do not match the board —
work on the engine. He was right on both, and the screenshots show
exactly where the line falls.

## What the Bazaar build proved

**Transferred intact:** greeting home, percent promo, category
medallions, the three-group filter sheet with dual price range and
sorts, the profile with toggles + radio group, radio-row form steps,
corner-badge cards, the "Post your ad" FAB. The M046 families work in
other hands.

**Brief failures** (the prompt's fault, as charged): no category
imagery was even declarable; the listing page's action is a bare
"Continue"; nothing in a free-form prompt forced decisions about the
commerce model, the demo person, or which families exist.

**Engine failures** (visible in the screenshots): a locality chip rail
*and* medallions stacked on one home; chip rows scrolling sideways
with grey scrollbars showing; the posting form boxed in a bordered
card; medallions as initial letters where the board uses photographs;
an unillustrated "My ads" empty state.

## Part 1 — the intake (the front door)

- **`INTAKE.md`** (distribution root): the protocol for any AI holding
  the engine. On "start the engine": ask the questions, draft the
  brief from the answers, run the doctor, show the user the plan,
  then generate. Includes the answer→brief mapping (the trigger-word
  rule for the bag, object options for radio rows, the domain→world
  cue, `profile.name` for the greeting) and a worked Bazaar minute.
- **`intake-questions.json`**: 17 questions in 5 groups (Idea,
  Catalogue, Commerce, Families, Look), each with its `briefPath`,
  options, default, and a one-line *why* — so the asking AI can
  explain what each answer changes.
- **`engine/intake/brief_doctor.mjs`**: reads a drafted brief and
  reports the undecided decisions as `GAP` (breaks or empties a
  declared feature: greeting with no named person, a wallet nothing
  reaches, a profile row linking an undeclared view, a flow step
  asking for an undeclared field, medallions with no optioned field…)
  and `tip` (thins the app: no promo, media with no photos, string
  flow options instead of priced radio rows, a marketplace bag
  without `uniqueItems` — the M045 iPhone ×8 lesson). CLI exits 1 on
  gaps; `run.mjs` also prints findings as `intake:` notes during
  generation, so even a brief written without the interview is
  flagged before it ships.
- Verified: the Evira showcase brief (written the M046 way) passes
  with **0 gaps, 0 tips**; the M045 OLX brief draws exactly its two
  true tips (no photos, no reviews); a synthetic thin brief draws all
  five expected findings; Fern & Co generation now prints its one
  honest tip (no reviews) and still fulfils 13/13.

## Part 2 — the engine corrections (grammar laws 28–32)

1. **Medallion homes lose the chip rails entirely.** Plan suppresses
   every browse chip section when medallions are planned; all facets
   live in the filter sheet. Consequential fix in `fulfil.mjs`: the
   contract verifier now recognises the sheet as the binding surface
   for facets beyond the first ("filter-sheet binds this field") —
   without it, suppressing the rails made second facets read as
   unsupported and failed builds.
2. **Chip rails hide their scrollbars; sheet chips wrap** (flex-wrap),
   as the board's do.
3. **Forms sit on the ground.** `.stepflow .panel` loses its surface,
   border, radius and padding; the filled fields are the boxes.
4. **Photo medallions.** A medallion wears the first photographed
   record in its facet value; unphotographed values keep initial
   discs; a selected photo medallion keeps its photo and takes a
   ring instead of the ink fill.
5. **Illustrated order empties.** A bag app's empty order book gets
   the line-art treatment previously reserved for search misses.

## Evidence

- New probe suite **design047: 15/15** (doctor unit checks + the five
  fixes driven in a generated Bazaar-shaped app: no chip rail beside
  medallions, 2 photo medallions + initial 'All', wrapped sheet
  chips, ground-form checkout measured `rgba(0,0,0,0)`/0px border,
  illustrated empty orders, 0 page errors).
- Regressions: OLX case **12/12** on 1.27 (its chips remain — no
  medallions declared there); Evira showcase **10/10**; clean-room
  from the delivered zip: Fern **13/13**, INTAKE files present.
- Battery: core **239/240**, design **162/162**, fixtures **95/95** —
  **496/497**, the only failure the standing layout vocabulary
  exception.
- Screenshots in `delivery/screens/`: the Bazaar-shaped probe app
  after the fixes (its 1×1 placeholder images render red — the
  structure is the evidence): medallion home with photo discs and no
  chip rail, wrapped filter sheet, ground-form checkout.

## A correction to Mission 046's numbers

Re-running the battery for this mission produced core 239/240 and
fixtures 95/95 — not the 247/248 and 109/109 reported in M046. A
control run on the **pristine M046 tree** reproduces today's numbers
exactly, suite by suite. Conclusion: M046's group totals were
misaggregated in its report (its design total, 147/147, was right);
no suite result ever differed — every suite passed then as now,
except the one known layout failure. M046's true battery was
**481/482**, and this report's 496/497 is measured the same way.
The M046 report on GitHub still carries the wrong totals; this note
is the correction of record.

## Limits, stated plainly

- The intake improves the brief; it cannot supply taste or content.
  Category imagery beyond record photos, real photography, and the
  commerce decisions remain the user's answers to give.
- The doctor checks structure, not quality: a brief can pass with
  dull items and a vague promo. It flags the promo's *absence*, not
  its weakness.
- The other AI's Bazaar build does not self-update; regenerating its
  brief through the intake on 1.27 is the route.
