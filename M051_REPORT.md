# M051 — Root-cause fix: the engine stops turning every app into a marketplace

**Engine:** v1.31.0-mission051 · **Tree:** `~/workspace/m051/improved/` ·
**Delivery:** this folder · **Not pushed to GitHub** (Mohnish did not ask).

## 1. What Mohnish reported

An external AI used engine v1.30 to build **Kutumb**, a private family
app (member roster, invites, chat, location check-ins, a
needs/complaints household log, a family fund). The engine forced it
into a marketplace shape: every member card carried a price
(₹2,000 / ₹1,500 / **₹0** — a child rendered as a free product), and
the deliverable was a website zip, not an app. The external AI
hand-patched four real bugs locally; the engine still shipped all of
them.

## 2. Root cause (verified from the forensic copy, not assumed)

1. **`engine/intake/derive.mjs`, `ROLE_BY_TYPE`:** every `money`-typed
   field in *any* app was assigned the `price` role unconditionally,
   and the card renderer always prints the price line. Kutumb's
   per-member *contribution* field is money-typed → it became the
   price on every member card. A second fallback (any money field
   becomes the bag's `priceField`) compounded it.
2. **No archetype concept existed.** The engine's only collection
   pattern was a shop catalogue; the Kutumb plan itself wrote "the
   family roster is the catalogue" because no other vocabulary was
   available. People, patients, students, records — everything became
   products in a grid.
3. **Three bugs the external AI fixed locally** (still in v1.30):
   (a) wallet amounts followed the *stored sign*, ignoring the
   transaction `kind` — a debit stored positive printed as a credit;
   (b) flow review / confirmation / submissions log printed raw enum
   values ("need", "today") — only M050 chip fields got label
   mapping; (c) the permission-priming disc fell back to the
   permission *title's initials* ("SW", "L", "FA") because derive
   **dropped the declared glyph** when mapping permissions.
4. **App, not website:** generated apps had a manifest and icons but
   **no service worker / offline shell**, and the handover language
   framed the output as a website.

## 3. What changed (grammar laws 43–45)

**Law 43 — money is not a price until the archetype says so.**
A brief gains a top-level `archetype`: `commerce | roster | service |
records | content`, declared in INTAKE (new question `q-archetype`,
25 questions total) or inferred conservatively — people labels
(Member/Patient/Student/…) infer roster *before* any commerce check;
a bag or buy/sell prose infers commerce; **a money field alone never
implies commerce**. A money field takes the `price` role only in
commerce (or when the field itself declares `role: "price"`); in
every other archetype it is a labelled value ("Fund contribution
₹2,000") on detail/profile views and in tables — never an unlabelled
card price line, never with add/stepper affordances. Semantics are
*not* chrome: aggregate math still finds money fields by type, so a
records app's "total value of stock = qty × unit price" still
derives (this separation is locked by a design051 check; it was
caught mid-mission by the recovery/design041 suites).

**Law 44 — a collection renders its archetype.**
Roster = people list: avatar, name, meta = *relation · role*, and a
**status chip** for the designated status field (an enum field named
like where/place/location/status — Kutumb's check-in, CarePoint's
visit status) on cards, rows, and the detail hero. No price line, no
"+" add button, no delivery-fee line outside commerce, related rails
titled "Other members" / "Related …" instead of "You may also like",
filter-sheet sort options gated to fields that exist (no "Price"
sort in a roster). `brief_doctor` GAPs: people collection driven as
commerce; money + no archetype + no signals (undecidable);
commerce vocabulary (cart/checkout/delivery fee) inside a roster
brief. `plan_doctor` checks PLAN ↔ brief ↔ DESIGN_DIRECTION
archetype consistency, incl. a required ROSTER composition paragraph.

**Law 45 — stored values are data; shown values are labels.**
Wallet sign derives from `kind` (debit −, credit +, stored sign only
as fallback for kindless transactions); enum value→label mapping
(object *and* string options) now covers the flow review step, the
confirmation, and the submissions/orders log; the permission disc
renders the declared glyph, falling back to a neutral `✦` — never
title initials (derive now preserves the glyph).

**Adjacent planner fix (found by the clinic proof):** a stated or
derived **row-list composition with a media entity planned cards**
and the build hard-failed its own intent constraint (CI-001).
`plan.mjs` now honours row-list in every variant decision.

**Real app (workstream C):** the generator emits **`sw.js`** — a
versioned cache-first service worker (app shell precached, offline
navigation fallback) registered from `index.html` on http(s);
manifest completed (`id`, real `short_name` rule, icon `purpose`;
192/512 icons verified by real PNG dimensions). New checker
`engine/tools/app_readiness.mjs` (PASS/GAP, exit 1 on gaps).
`pinterest-ui-engine/app-shell/` ships a minimal Android WebView
wrapper (Kotlin, AndroidX only) and **`APP_PACKAGING.md`** the exact
PWA + APK steps. INTAKE Stage 6 and INTEGRATION now instruct:
*hand over an APP — never "open in a browser / host this folder".*

## 4. Measured results

- **design051 (new suite): 28/28** on v1.31. The same suite against
  the pristine v1.30 tree: **6 pass / 22 FAIL** — the failures
  reproduce every reported defect exactly (role=price, 3 price lines
  on a 3-member roster, discs "L"/"FA", debit stored positive
  printed +₹3,200, raw "need"/"today" in review, confirmation and
  log, archetype undefined).
- **Full battery (frozen tree):** core **240/240** · design
  **233/233** (+ design051 28/28) · fixtures **95/95** — **568/568**,
  no exemptions. verify:env **ready**.
- **Commerce regressions:** Fern **13/13**, OLX **12/12**, Evira
  **10/10**, Brewly (M050 user-reference showcase) **13/13** — prices
  and bag render exactly as before.
- **App readiness:** Fern before (v1.30) **19/21** — the 2 GAPs are
  exactly the missing service worker; the uploaded Kutumb app scores
  identically. After: **31/31** (Fern, Kutumb-after, clinic).

## 5. Proof 1 — Kutumb, same brief, unedited

Regenerated from the forensic brief **byte-unchanged** (no archetype
line added — inference derives roster from the Member collection),
driven end-to-end at 390px, 14 screenshots, **0 page errors**.
Acceptance, measured from the DOM:

| Check | Before (v1.30, forensic) | After (v1.31) |
|---|---|---|
| Home | product cards, price lines ₹2,000/₹1,500/₹0 | 6 person cards, **0 price elements, 0 add buttons** |
| Card meta | role · place ("Head · Home") | **relation · role** ("Self · Head", "Son · Child") |
| Check-in | invisible on cards | **status chips**: Home, Work, School, Home, School, Out |
| Detail | price block | no price element; labelled row **"Fund contribution ₹2,000"** |
| Permission disc | initials of a title | declared glyph **⌖** |
| Wallet | debits as credits where stored unsigned | **+₹6,000 / −₹3,200 / −₹1,850 / +₹3,850** (sign = kind) |
| Review / confirmation / log | raw "need", "today" | labels **"A need"**, **"Today"** |

Screenshots: `screens/kutumb-before/` (forensic) vs
`screens/kutumb-after/` (14, same journey).

## 6. Proof 2 — CarePoint clinic roster (different non-commerce kind)

A fresh brief (patient list; status enum Waiting/In consultation/
Done/Follow-up; a "Consultation fee" money trap field; distinct
label≠value flow options; **no archetype key, no commerce words**).
Generated **9/9**: archetype inferred roster, home = person rows with
status pills, detail shows **"Consultation fee ₹500"** as a labelled
row only, flow review/confirmation/log show labels, readiness
31/31, 0 page errors. Screenshots: `screens/clinic/`. (This proof is
what exposed the row-list planner bug in §3.)

## 7. APK smoke build — real

The shipped `app-shell/` was copied out, the regenerated Fern app
dropped into `assets/app/`, and built with the proven sandbox
toolchain (Temurin JDK 17, SDK 34, Gradle 8.7, `--offline` mirrored
repo): **BUILD SUCCESSFUL**. `FernAppShell-debug.apk` —
**3,000,717 bytes**, `aapt` badging package
`com.generatedapp.shell`, minSdk 26 / targetSdk 34, apksigner-valid
(debug), contents verified (full Fern bundle incl. sw.js + both
icons + 7 photos). Kept at `~/workspace/m051/work/c/`. **Not run on
a device/emulator** (no KVM in this sandbox) — first on-device
launch remains the open check, same caveat as VibeVote.

## 8. Clean room

From the delivered zip, extracted to a fresh directory: `npm ci` →
verify:env **ready** → Fern **13/13** → Kutumb regenerated from the
unedited forensic brief **7/7** with app readiness **31/31** →
design051 **28/28**.

## 9. Honest limits

- Archetype inference is deliberately conservative: an ambiguous
  brief (money + no signals) gets a doctor GAP asking for the
  declaration rather than a guess.
- The service worker's offline behaviour was verified in a Node VM
  harness (headless Chromium in this sandbox refuses loopback
  navigations); install/activate/fetch/navigation-fallback all
  behaved, and determinism (byte-identical regeneration) was
  verified — but a real-device offline run is still unproven.
- The legacy `engine/generate.mjs` template path (Mission-020 era)
  predates the packaging contract and does not emit a manifest or
  worker; all supported generation goes through `run.mjs` →
  `build_app`. Retrofitting the legacy path was out of scope.
- Chat and location remain local-only simulations (no backend) —
  unchanged from v1.30 and labelled as such in generated apps.
- During verification I regenerated `m050/work/showcase-user/app`
  once with the new engine by mistake (wrong path); it was
  immediately regenerated back with the m050 engine (13/13). The
  m050 engine tree was never modified.

## 10. Files

Engine diff vs the M050 tree: **ENGINE_DIFF.patch** (29 files,
1,879 lines). New/changed: archetype system in derive/doctors/
make_plan, runtime roster + label/sign/glyph fixes, `sw.js`
emission, `app_readiness.mjs`, `app-shell/`, `APP_PACKAGING.md`,
`design051.test.mjs`, grammar laws 43–45, INTAKE/INTEGRATION
updates. **NOTE_FOR_BUILDER.md** is the paste-ready note for the
external AI. Portable zip: `pinterest-ui-engine-v1.31.0-mission051.zip`
(3,779,642 bytes delivered; the clean-room in §8 ran on this exact
archive's contents).
