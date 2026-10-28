# Board Decode — Food Ordering, Full-Orange Onboarding (board-orange-food)

- Source file: `e65bc4befc498b382a68d25bef88f01d5bbde67fa716325cdfbfaf6445c66e9e.jpg` (736×1742)
- Panels: **19 panels** in a 4-column staggered grid (column 1 has 4 panels because the Home panel is double-height; columns 2–4 have 5 each).
- Distinct screens inventoried: **14 entries** below. Reductions from 19 panels: Sign In appears twice (empty + filled = 1 screen, 2 states); Home appears twice (short top-crop + full long version = 1 screen); Search, Filter and Near-Me results each appear twice in the bottom two rows (exact duplicate panels in the board itself = counted once, duplicates noted).
- Legibility: Good for headlines, field labels, prices and ratings after enlargement. Lorem-ipsum onboarding sub-copy is placeholder by design (quoted as such). Small restaurant address lines on Home/Near-Me are partly legible; ratings are legible. Nothing illegible was invented — uncertain micro-copy is marked “(small)”.

## Board header

- **App name / domain:** Unnamed food-ordering app (sign-in username example “FoodOrdering”, location “9 West 46th Street, New York City”). Domain: restaurant discovery + food menu ordering. Notably this board shows **no cart, no checkout, no order tracking and no profile screen** — the flow stops at discovery/filter/results plus auth and location.
- **Palette (approximate, from flat UI fields):**
  - Primary orange (full-bleed onboarding ground + all CTAs): ~`#F96100`–`#FF6A00`
  - Board backdrop: pale cream ~`#FDEED3`
  - Page ground: white ~`#FFFFFF`
  - Field / quiet-chip ground: light grey ~`#F4F4F4`–`#F7F7F7`
  - Ink: near-black ~`#1E2430` (headlines have a slight navy cast)
  - Muted grey text: ~`#9A9A9A`
  - Category tile tints (Food Menu grid): pale green, pale peach, pale pink, pale blue — one pastel per tile, photography is not the only colour here
  - Star rating orange (same primary, not gold): ~`#F96100`
  - Social brand colours used literally: Facebook blue ~`#3B5998`, Google red ~`#DB4437`, Twitter blue ~`#1DA1F2`
- **Type roles:**
  - Display: none as photo-overlay display; headlines are UI-bold sans, left-aligned, two-line where needed (“Forgot / Password”).
  - UI headline: bold sans ~20–24px for screen titles (“Sign in”, “Sign up”, “Forgot Password”, “Filter”), section titles smaller bold (“Food Menu”, “Near me”, “Popular”).
  - Onboarding title: medium-weight white sans centred (~18px) under a large line icon — deliberately quieter than the auth headlines.
  - Body/meta: regular grey sans; prices bold orange (unusual — price is in the accent colour, not ink) on menu/search tiles; restaurant meta is two small grey lines (address, time/distance) + star row.
- **Shape language:**
  - Buttons: pill primary (orange, white centred text), full content width. Secondary: pill on grey ground (“Sign Up”, “No, I do it later”).
  - Fields: pill / very large radius (~full-height radius) on light grey, left icon inside (person, lock, phone), placeholder grey; **no outline fields anywhere**.
  - Cards/tiles: rounded ~12–16px; category tiles are tinted squares with photo bottom-anchored; food tiles in Popular/Near-Me are square photos with label + orange price below.
  - Category selector (top of Home/Filter): square-ish rounded icon tiles (~56px) — label below; selected tile is solid orange with white icon.
  - Onboarding screens: no card at all — flat orange field, white line icon centred upper-middle, dots at bottom.
  - Filter chips: pill, grey ground; selected = solid orange, white text.
- **Density character:** Two contrasting densities. Auth/onboarding: extremely airy, 2–3 fields and one CTA per screen, huge top whitespace, decorative food photo cropping in from the bottom edge of auth screens. Discovery (Home/Search/Results): dense — 3-across food tile grids, stacked sections (menu grid → near-me list → 50% banner → breakfast grid) on one long scrolling Home. This board's Home is the densest screen in any of the three boards decoded here.
- **Nav model:**
  - App level: 4-tab bottom bar — Home, Order, My List, Profile — icon + label, selected = orange icon+label (Home selected on all discovery screens; tabs are present even on Filter and Search which are conceptually stack screens — the bar never disappears in this kit).
  - Stack level: chevron back “<” top-left on auth, forgot-password, search and results; “×” (close) top-left + “Clear all” top-right on Filter. **No centred screen titles in the app bar** — titles sit large in the body (auth) or the screen simply starts with search (discovery).

---

## Screen inventory

### 1–4. Onboarding carousel — 4 panels, one template
Common template for all four: status bar (white icons on orange); flat full-bleed orange ground; large white **line icon** centred at ~35% height; title centred white below icon; two lines of lorem-ipsum sub-copy centred, smaller, white at reduced opacity (“Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat” — placeholder, same on all four); page dots at bottom centre (4 dots, active dot white/brighter, position advances per panel: panel 1 dot 1, panel 2 dot 2, panel 3 dot 3, panel 4 dot 4 — read from dot emphasis, small at board resolution). **No Skip, no Next/arrow button, no CTA at all** — swipe-only onboarding as shown.

- **1. “Delicious Food”** — Icon: roast chicken/turkey on a pie/platter with steam lines.
- **2. “Fast Shipping”** — Icon: delivery truck side view with speed lines.
- **3. “Certificate Food”** — Icon: rosette/award badge with cloche inside, sparkles either side.
- **4. “Payment Online”** — Icon: credit card with shield + check badge overlapping bottom-right.
- **Components (all 4):** line-icon illustration, centred title, centred placeholder copy, dot pager.
- **CTA:** None.
- **States:** Pager position only.
- **Engine mapping:** Onboarding — flat-colour + line-icon variant. Distinct from board-pizza-food §1 (photo). Engine onboarding must support **both** hero treatments and a no-CTA swipe variant.

### 5. Auth welcome / entry — burger photo
- **Purpose:** Auth gateway after onboarding: choose sign in or sign up.
- **Anatomy top→bottom:**
  1. Status bar.
  2. Large square photo card (rounded ~16px, margins): burger close-up with tomato beside it.
  3. Primary pill: “Sign In”.
  4. Secondary pill (grey ground, ink text): “Sign Up”.
  5. Divider row: hairline — “Or connect with” — hairline.
  6. Social row: three circular brand buttons (Facebook, Google G+, Twitter) right-of-centre; the bottom-left of the screen is overlapped by a decorative salad-bowl photo cropping in from the bottom-left corner (photo bleeds off-screen).
- **Components:** photo card, primary + secondary pill stack, social-auth row, corner-bleed decorative photo.
- **CTA style/placement:** Two stacked full-width pills mid-screen; sign-in is primary.
- **States:** Default only.
- **Engine mapping:** Auth (welcome variant). Social-auth row + decorative corner photo = auth decorations; social row recurs on §§6–7.

### 6. Sign In — shown in 2 panels (empty + filled states)
- **Purpose:** Username/password login.
- **Anatomy top→bottom:**
  1. Back chevron top-left. Large top whitespace.
  2. Title “Sign in”, left-aligned, bold.
  3. Field 1 (grey pill, person icon): placeholder “Username” (empty panel) / value “FoodOrdering” (filled panel).
  4. Field 2 (grey pill, lock icon): placeholder “Password” (empty) / masked “••••••••” (filled).
  5. Primary pill: “Sign In”.
  6. Right-aligned small link under CTA: “Forgot password?”
  7. Divider “Or connect with” + social circles (Facebook, Google, Twitter).
  8. Decorative salad photo bleeding in at bottom-left corner (partly visible).
- **Components:** icon-inside pill fields, primary pill, text link, social-auth row.
- **CTA:** Full-width orange pill directly below fields; forgot-password is a link, not a button.
- **States:** **Empty vs filled are two separate panels in the board** — this is the only auth screen given a filled state; password masking shown.
- **Engine mapping:** Auth (sign-in). Covered; note field style = filled pill, not outlined box.

### 7. Sign Up
- **Purpose:** Account creation.
- **Anatomy top→bottom:**
  1. Back chevron. Title “Sign up”.
  2. Field 1: “Enter Username” (person icon). Field 2: “Enter Password” (lock icon). Field 3: “Re-enter Password” (lock icon) — confirm password is a third field, no email/phone field on this screen.
  3. Primary pill labelled **“Sign In”** — as shown in the board; the button copy does not match the screen title (kit error, recorded verbatim, not corrected).
  4. “Forgot password?” small link right (also arguably misplaced on sign-up; as shown).
  5. “Or connect with” divider + social circles. Decorative salad photo bottom-left.
- **Components:** 3 icon pill fields, primary pill, social row.
- **CTA:** Orange pill below fields.
- **States:** Empty only.
- **Engine mapping:** Auth (sign-up). Covered, with copy-fidelity note above.

### 8. Forgot Password — step 1, phone entry (with keyboard)
- **Purpose:** Start recovery by phone number.
- **Anatomy top→bottom:**
  1. Back chevron.
  2. Title, two lines: “Forgot / Password”.
  3. Instruction line: “Enter your phone”.
  4. Field (grey pill, phone icon): placeholder “Phone number”.
  5. Primary pill: “Next”.
  6. **System keyboard occupies bottom ~40%** (QWERTY, grey/white keys, “space”/“Go” row) — keyboard-open state is part of the panel design.
- **Components:** single-field form, primary pill, OS keyboard state.
- **CTA:** Orange pill below the field, above the keyboard.
- **States:** Keyboard open, field empty.
- **Engine mapping:** Auth — recovery step. Multi-step recovery as separate screens (phone → OTP) = auth flow variant.

### 9. Forgot Password — step 2, OTP entry (with keyboard)
- **Purpose:** Enter the sent code. Same screen title, second step.
- **Anatomy top→bottom:**
  1. Back chevron. Title “Forgot / Password”.
  2. Instruction: “An OTP code sent to your phone. Enter it here:”.
  3. Single field (grey pill, no icon visible): placeholder “Enter OTP Code” — **note: one long field, not segmented OTP boxes** (contrast board-tall-ecommerce OTP).
  4. Primary pill: “Next”.
  5. System keyboard open, bottom ~40%, same as §8.
- **Components:** single OTP field, primary pill, keyboard state.
- **CTA:** Orange pill below field.
- **States:** Keyboard open, code empty. No resend timer/link visible on this panel.
- **Engine mapping:** Auth — OTP step, single-field variant = **MISSING / distinct variant** vs segmented-box OTP.

### 10. Location permission / set location
- **Purpose:** Ask for location before discovery.
- **Anatomy top→bottom:**
  1. Status bar (no back, no title).
  2. Map card (rounded, light grey map) with two orange pins joined by a dotted route line.
  3. Centred copy, two lines: “Set your location to start exploring / restaurants around you”.
  4. Primary pill: “Enable Location”.
  5. Secondary pill (grey ground): “No, I do it later” (copy as shown).
  6. Bottom tab bar visible behind/below (Home selected) — permission is presented **inside the app shell**, not as a pre-app gate.
- **Components:** map illustration card, centred explainer, primary + secondary pill stack.
- **CTA:** Orange pill primary; deferral is a full secondary button (not a text link).
- **States:** Not-yet-granted state only; no denied state shown.
- **Engine mapping:** Permission / location gate — **MISSING as a named engine pattern** (no equivalent in the listed engine patterns: not onboarding, not auth). Recurs in concept only.

### 11. Home / discovery — long screen (short panel + full panel = same screen)
- **Purpose:** Main discovery: search, category selector, menu grid, nearby restaurants, promo, breakfast rail-grid.
- **Anatomy top→bottom (full/long panel):**
  1. Pill search field: “Search” with magnifier.
  2. Location line: pin icon + “9 West 46th Street, New York City” (small).
  3. Category selector row, 4+ tiles (horizontally scrollable, 5th cut off): Drinks (cup icon), **Food (selected — solid orange tile, white icon)**, Cake (cupcake icon), Snack (partly visible). Icon in rounded-square tile, label below.
  4. Section title: “Food Menu”.
  5. Category photo grid, 2 rows × ~2.5 visible (horizontal continuation implied): Row 1 Burgers (pale green tint tile), Pizza (pale peach), BBQ (cut off). Row 2 Fruit (pale pink), Sushi (pale blue), Noodles (cut off). Tile = label top-left, food photo bottom/right.
  6. Section header: “Near me” + “See all” right.
  7. Restaurant list rows ×3: square photo thumb; name (“Awesome Fruit Restaurant”, “Pizza Lover Company”, “Chicken Fried Restaurant”); address line (small); time/distance line (small, e.g. “3 min • 1.5 km” — approximate at board size); star row (orange stars, ~4 filled) + “(4.6)”-style count (small).
  8. Promo banner (dark photo banner): “Sale Off”, huge “50%”, “For Breakfast”, burger photo right.
  9. Section header: “For Breakfast” + “See all”.
  10. Food tile grid/rail, 2 rows × ~3.5: square photo, name below (“Hamburger”, “Tuna Salad”, “Chicken Fried”, “Spag…” / “Shrimp Pizza”, “Spaghetti”, “Lamb chops”, “Cooki…”), no price on these home tiles (prices appear on Search/Results tiles).
  11. Bottom tab bar (Home selected).
  - The short panel shows items 1–6 and the top of §7 only — it is the same Home at scroll-top with less board height, not a second home design.
- **Components:** pill search, location line, icon-tile category selector, tinted category tiles, restaurant list rows, photo promo banner, food tile grid, bottom nav.
- **CTA:** No page CTA; promo banner has no button; tiles/rows are tappable.
- **States:** Category “Food” selected; Home tab selected.
- **Engine mapping:** Greeting home variant — but the greeting is replaced by search+location, and categories are **icon tiles in a square rail, not medallions**, and the Food Menu is **tinted label tiles**, not cards. Icon-tile category rail + tinted category tile = variants / **partial-MISSING** vs engine medallion rail.

### 12. Search — history + popular (panel duplicated in board)
- **Purpose:** Search entry state: recent searches and popular dishes.
- **Anatomy top→bottom:**
  1. Header row: back chevron + pill search field (“Search”, empty).
  2. Row: clock/history icon + “Search History” (small grey) … “Clear all” right.
  3. History list ×5, each row term left + “×” remove right: “Humburger” (spelling as shown), “Sushi”, “Pizza”, “Noodle”, “Spaghetti”.
  4. Section title: “Popular”.
  5. Food tile grid, 2 rows × ~3.5: square photos with name below (“Hamburger”, “Tuna Salad”, “Chicken Fried”, “Spag…” / “Shrimp Pizza”, “Spaghetti”, “Lamb chops”, “Cooki…”). No prices on Popular tiles.
  6. Bottom tab bar (Home selected, despite being in search — kit keeps Home active).
  - The same panel is printed **twice** in the board's bottom rows — duplicate, counted once.
- **Components:** search field, history rows with per-row remove, popular tile grid.
- **CTA:** None; history removal is “×” text-glyph buttons.
- **States:** Empty query state (history + popular shown, no results, no keyboard open).
- **Engine mapping:** Search — history/popular pre-query state = **MISSING as a named state** in the listed patterns (filter sheet / search results exist, pre-query search home does not appear in the list).

### 13. Filter — full page (panel duplicated in board)
- **Purpose:** Filter discovery by category, location, attributes and price.
- **Anatomy top→bottom:**
  1. Header row: “×” close left, title “Filter” bold, “Clear all” right (small).
  2. Category icon-tile row (same as Home §11 item 3): Drinks, **Food selected (solid orange)**, Cake, Snack (cut off) — labels below tiles.
  3. Group label: “Location”.
  4. Location chips, 2 rows: Bronx, Manhattan, Queens / Brooklyn, Staten Island, **“Near me” selected (solid orange pill)** — grey pills otherwise.
  5. Group label: “Filter by”.
  6. Attribute chips, 2 rows: **“Open” selected**, “Sale off”, “Pick up” / “Verified”, “Preferred”, “Ordered” (labels small but legible in crop).
  7. Group label: “Price”.
  8. Range slider: orange track with two circular orange handles, scale labels “$1   $10 … $70   $99+” (end labels small).
  9. Primary pill: “Apply”.
  10. Bottom tab bar (Home selected) — filter is a **full page inside the shell**, not a modal sheet.
  - Duplicate panel in board counted once.
- **Components:** chip groups ×3, icon-tile selector, dual-handle range slider, clear-all header action.
- **CTA:** Full-width orange “Apply” pill directly under the slider, above the tab bar (not sticky-bar separated).
- **States:** One selection per group shown selected (Food / Near me / Open); other groups show a single selection each — multi- vs single-select per group is not labelled in the kit.
- **Engine mapping:** Filter sheet analogue — but as a **full page, with bottom nav retained, and including a price range slider and a location chip group**. Range slider = **MISSING** component in the listed patterns; full-page filter = variant of filter sheet.

### 14. Search results — “Near me” for “Hamburger” (panel duplicated in board)
- **Purpose:** Results for a query, grouped by restaurant.
- **Anatomy top→bottom (repeating unit ×2, then a third partial):**
  1. Header row: back chevron + search field containing “Hamburger” with “×” clear inside + filter/sliders icon button right.
  2. Section title: “Near me”.
  3. Restaurant header row: square photo thumb (burger), name “Pizza Lover Company”, address line (small), time/distance line (small), star row orange + “(4.9)” (small).
  4. Dish tile row (horizontal, 3 full + 1 cut off): square photo, name below (“Hamburger”, “Tuna Salad”, “Chicken Fried”, “Spag…”), **price below name in bold orange (“$15.99”, “$7.99”/“$7.50” in the duplicate, “$12.99”, “$20.9…”)**.
  5. Unit repeats identically (same restaurant, same dishes) — the board re-uses the same restaurant block rather than showing a second different restaurant.
  6. Bottom tab bar (Home selected).
  - Duplicate panel in board counted once; price variance between the two printings (“$7.99” vs “$7.50” for Tuna Salad) is a kit inconsistency, recorded as shown.
- **Components:** query field with clear, filter icon button, restaurant header, horizontal dish-tile rail with priced tiles.
- **CTA:** None; filter icon is the only action besides rows/tiles.
- **States:** Query present (“Hamburger”); results state, no empty/loading state shown.
- **Engine mapping:** Search results + product card (tile variant). Restaurant-grouped results (header + its dishes as a rail) = grouped-results pattern, **partial** vs a flat product grid.

---

## Pattern census — board-orange-food

Screen occurrences across the 14 distinct entries (onboarding template counted once per panel where stated).

| Pattern | Screens | Instances / notes |
|---|---|---|
| Primary pill CTA (orange, full-width) | 7 | Auth welcome, Sign In, Sign Up, Forgot ×2, Location, Filter (Apply) |
| Secondary pill CTA (grey ground) | 2 | Auth welcome (Sign Up), Location (do it later) |
| Filled pill text field with leading icon | 4 | Sign In ×2 fields, Sign Up ×3, Forgot ×2 (phone/OTP) |
| Social-auth row (3 circular brand buttons) | 3 | Auth welcome, Sign In, Sign Up |
| Decorative photo bleed / photo card in auth | 4 | Welcome photo card; salad bleed on Sign In/Sign Up/welcome footer |
| Onboarding (flat colour + line icon + dots, no CTA) | 4 panels | §§1–4, 1 template |
| Bottom tab bar (4 tabs) | 4 | Location, Home, Search, Filter, Results = actually **5** incl. Results |
| Back chevron header | 6 | Sign In, Sign Up, Forgot ×2, Search, Results |
| Pill search field | 3 | Home, Search, Results (with query + clear in Results) |
| Icon-tile category selector (selected = solid orange) | 2 | Home, Filter — 4 tiles each |
| Food tile (square photo + name [+ orange price]) | 3 | Home breakfast grid (no price), Search Popular (no price), Results rail (priced) |
| Tinted category tile (label + photo) | 1 | Home Food Menu, 6 tiles |
| Restaurant list row (thumb + name + 2 meta lines + stars) | 2 | Home Near-me ×3 rows; Results header ×2 (grouped variant) |
| Chip group (grey pills, 1 solid selected) | 1 screen, 2 groups | Filter: Location ×6 chips, Filter-by ×6 chips |
| Range slider (dual-handle) | 1 | Filter price |
| Promo banner (photo, % headline, no button) | 1 | Home “50% For Breakfast” |
| History rows with × remove | 1 | Search, ×5 |
| Map card (pins + dotted route) | 1 | Location |
| OS keyboard open state | 2 | Forgot ×2 |
| Dot pager | 4 panels | Onboarding §§1–4 |

Correction to table row 7: bottom tab bar appears on **5** distinct screens (Location, Home, Search, Filter, Results).

**Top 5 patterns:** (1) primary pill CTA — 7 screens; (2) back-chevron header — 6; (3) bottom tab bar — 5; (4) filled pill icon fields — 4 screens / 7 fields; (5) tie: social-auth row — 3, pill search — 3, food tile — 3.

**MISSING patterns that recur / stand out:**
- **Location-permission gate inside the shell** (§10) — no named engine equivalent.
- **Pre-query search home** (history rows + popular grid) (§12) — no named engine equivalent.
- **Dual-handle price range slider** (§13) — component not in the listed patterns.
- **Single-field OTP** (§9) vs segmented OTP boxes elsewhere.
- **Icon-tile category selector + tinted category tiles** (§§11,13) as the alternative to medallion rails.
- Swipe-only onboarding with **no CTA/skip** (§§1–4).
- Absences in this board (not MISSING from engine, missing from board): cart, checkout, payment, tracking, profile, favourites — the kit simply does not show them.
