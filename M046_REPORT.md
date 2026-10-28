# Mission 046 — the Evira board, decoded screen by screen, and the engine tuned to it

**Engine: v1.26.0-mission046** (from v1.25.0-mission045; M043–M045 trees untouched).
**Commission:** decode *each and every* screen of the Evira board (90+ screens) and tune the engine so briefs produce results like these. M045 had decoded the board's general language and fixed the classifieds app's defects; it had never inventoried the screens individually. This mission did the inventory first, then built what was missing.

## 1. The decode (evidence in `decode/`)

The board was cut into 16 slices at 2× and inventoried in four parallel passes: **162 screen entries, ~95 unique screens** after slice-edge duplicates are cross-referenced (`decode/inv-01..04.md`). Every recurring construction was named and specified in `decode/PATTERN_LIBRARY.md` — 60+ patterns with a census (BACK-header ×~64, BLACK-PILL-CTA ×~47, product grid ×~16, PHOTO-CORNER-BADGE ×15, detail hero ×~12, price+action bar ×~11, plain steppers ×10, success modal ×~7, swatch selectors ×~7, size circles ×~3 …) and an honest engine status per pattern: HAS / PARTIAL / MISSING.

**Missing outright:** variant selectors (swatches, size circles, pills) whose choice means something downstream; the filter sheet with a dual price range; any modal/sheet system; reviews; radio-row checkout choices; category medallions; the greeting home header; the percent-led promo; illustrated empty states; the icon order tracker; the barcode receipt; the whole settings/profile family; the wallet family (black balance card, transactions, top-up); the entry family (onboarding, auth, OTP-style inputs); notifications; the FAQ accordion; the hero carousel; the tile corner badge; recent-search and results-count furniture.
**Partial:** cards (badge sat in the media's bottom corner, not the board's tile corner), promo (no percent-led form), order detail (status timeline only), checkout selects (native dropdowns of text).

## 2. What the engine gained (13 files, +2,087 diff lines)

All of it **declared in the brief, never derived from prose** — the same contract as the promo. A brief that declares none of it compiles exactly as v1.25 did.

- **Entry gates** — `onboarding` (slides, dash indicator, Skip/Next) and `auth` (provider discs, "or continue with" with no rule lines, filled fields with the board's focus treatment, remember-me, mode switch) render *instead of* the shell and persist on-device.
- **Greeting home** — `homeHeader: "greeting"`: avatar + greeting + name, two outline circle buttons (notices, wallet). The tagline heading is *not* planned under it (grammar law 22: one identity block). Category **medallions** (`showCategories`) fed by the first facet replace that facet's chip rail on the home (law 23); the facet remains in the sheet.
- **Filter sheet** — every faceted browse gets a sliders button in the search row opening a bottom sheet: facet chips (options now resolved onto the model), dual price range, rating floors (★ Any / 4.0+ / 4.5+), sort (featured, price ↑↓, top rated) — applied to the grid for real.
- **Mono design world** — fashion-domain briefs now derive a sixth art-direction world: white ground, black the only brand colour, grotesque type, generous radii (the board's world; photography carries the colour).
- **Variants** — records may carry `variants` (swatch / circles / pills). The selection is part of the bag key: the bag line, the card stepper totals and the order's item text all carry it (`1 × Suga Leather Shoes (Black · 9)`); unique/stock caps count across variants.
- **Declared checkout flow** — `product.flow` ({ form, steps }) beats derived parsing; an enum field with object options `{ label, value, caption, price }` renders **radio rows** (medallion, name, caption, price, filled radio) and its price joins the order total.
- **Reviews** — average + stars + rows on the record page, and a write-a-review form (star picker) kept on the device.
- **Hero carousel** — `images: [...]` on a record: arrows, dots, and every listed file bundled (the bundler previously copied only the primary image — a bug found by the first showcase drive, along with onboarding images).
- **Sheets/modals as a system** — one scrim, three sheets (filter, remove-item with the board's Cancel / "Yes, Remove", top-up), and the confirmation as a centred modal card over the checkout.
- **Orders** — a horizontal icon stage tracker (the older dot track steps aside when it is present, per law 27) and a View/Hide receipt: label/value rows and a wide barcode drawn *from* the reference, which is itself never printed on the receipt.
- **Wallet** — black balance card, white Top Up pill, signed transaction rows; the top-up sheet (amount chips + bare-numeral keypad) really moves the on-device balance and prepends the transaction.
- **Profile/settings** — avatar header with edit badge; link rows (chevron), toggle rows (persisted, ink switch), radio rows (persisted); FAQ accordion rides the profile view; **notices** list grouped by declared day.
- **Search furniture** — "Results for "q" · N found" on hits; on a miss, the illustrated Not-Found state (line art, headline, one sentence, Clear filters) instead of a dashed box.
- **Card corner badge** — the save control moved to the board's form: a small black disc at the tile's top corner.
- Grammar gained laws 22–27 (DESIGN_GRAMMAR.md); INTEGRATION.md documents every new declaration.

## 3. Evidence

- **Showcase app** (`evira-showcase/`, brand "Evira", mono world): fulfilment **10/10**; a 27-screen drive — gates → home → filter sheet → detail (carousel, variants, review written) → cart → remove sheet → checkout radio steps → success modal → orders (tracker, receipt) → profile (toggles, radio, FAQ) → wallet top-up (₹9,379 → ₹9,879) → notices — ends with order **EV-508621**, **0 page errors**. Screenshots in `screens/`, each construction matching its board pattern.
- **Probe suite** `design046`: **33/33** on a purpose-built brief (gates, medallions, sheet contents, variant→bag, declared radio flow, modal, tracker, barcode privacy, top-up, FAQ, notices, no errors).
- **Full battery on final code:** core **247/248**, design **147/147** (incl. design046), fixtures **109/109** — total **503/504**. The one failure is the standing layout-vocabulary exception that predates this mission (the fixture corpus predates the bag vocabulary); no suite was edited to hide it.
- **Regression proof:** the M045 classifieds case regenerated on v1.26 — fulfilment **12/12**, journey to order OLX-993249, 0 errors. Nothing about existing apps changed unless a brief declares the new families.
- **Clean room:** the delivered zip (1.26.0, 3,193,612 B) extracted fresh and the Fern & Co example generated from the archive alone — fulfilment **13/13**.

## 4. Honest limits

- **Local only, stated plainly:** auth verifies nothing and sends nothing; the wallet is an on-device ledger, not a payment rail; reviews and profile settings persist per device. Where the board shows a backend (real chat, maps, biometrics, live tracking), the engine reproduces the *visual pattern* as a local interaction — the PIN/fingerprint screens are represented by the auth + keypad patterns, not simulated security.
- **Not built:** underline text-tabs (committed records carry no status taxonomy to tab over — inventing one would fake data), a splash screen, a detail-page quantity stepper (quantity lives in the bag, as on the board's own flow), recent-search history (search state is session-scoped today).
- **Back behaviour:** navigation is tab-rooted; Back from the wallet returns to the home root rather than the profile it was opened from. Coherent, but noted.
- Substituted media remains initials-on-tint: the board's photography is photography because briefs supply it (the showcase's product/onboarding photos were generated for the case, as a brief author would supply theirs).
- The other AI's OLX app and any Indus build do **not** self-update: they change only when their briefs are regenerated with v1.26 — ideally declaring `uniqueItems: true` and whichever families their screens need.
