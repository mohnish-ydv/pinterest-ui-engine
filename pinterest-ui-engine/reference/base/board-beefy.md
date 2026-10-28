# Board Decode — Beefy (Fresh Meat / Butcher Shop)

- **Source board:** `14f57414312a348ab99f84144a1b46ea885cd14beffbaec240ac03d8e553a15c.jpg` — 3 full phones on a cream studio background. All screens large and legible, including prices and ratings.
- **App / domain:** "Beefy — Fresh Meat. Better Meals." Single-category grocery commerce: beef cuts by weight (per-kg pricing), Dhaka location, halal certified.
- **Palette (approximate, from flat UI fields):** Deep beef-red primary `#8E1220 → #A31621` approx. (header ground, CTA, onboarding button); cream ground `#FFF8F0 / #FDF3E7` approx.; ink near-black `#17110E` approx. for the display headline; muted warm grey `#8A7A70` approx.; star gold `#F5A623` approx.; green is used only inside the small "100% HALAL" seal (dark green disc, white text) on the promo banner. Colour is carried by **photography** — raw-meat photos are the dominant colour field on all 3 screens.
- **Type roles:** Display — high-contrast **serif** for the onboarding headline only ("Good Meat / Brighter Days", large, black). UI — clean geometric sans everywhere else: bold sans for product names/prices, regular sans for body, small caps-ish eyebrow not used. The serif/sans split (editorial onboarding vs utilitarian commerce) is deliberate in this board.
- **Shape language:** Large radii. Phones ~28px; hero photo cards and the detail photo are ~20–24px with the detail screen using a **sheet-over-photo** layout (white sheet with ~24px top radius overlapping the full-bleed photo). CTA is a full pill. Category medallions are circles. Small add-to-cart buttons are red rounded squares/circles with a white cart glyph. Quantity stepper is a pill outline with − / +.
- **Density character:** Screen 1 airy (one message, one photo, one CTA). Screen 2 medium-dense commerce home (search + rail + banner + product row, still one screenful). Screen 3 medium (photo half, sheet half, related rail at bottom).
- **Nav model:** Screen 1: no tab bar; top bar is logo left + "Skip" text right. Screen 2: 4-item bottom tab bar — Home (active, red, labelled), Explore (magnifier), Cart (with red badge "3"), Profile — icons with labels, active in red. Screen 3: no tab bar; top overlay controls on the photo (circular white back button left; circular white heart/favourite and cart-with-badge buttons right), bottom action lives inside the sheet.

---

## Screen inventory

### 1. Onboarding / Welcome — "Good Meat Brighter Days"
- **Purpose:** First-run brand + trust pitch for a food-commerce app.
- **Anatomy top→bottom:** Status bar (9:41) → header row: red logo lockup left (cow-head mark in a swoosh + "Beefy" script-ish wordmark), "Skip" text button right → **serif headline** (3 lines, very large, black): "Good Meat / Brighter Days" → body (2 lines, grey sans): "Premium quality beef, sourced responsibly for fresher, happier meals." → **trust trio row**: 3 columns, small red icon + label — leaf "Farm Fresh", shield-check "Hygienic Cut", truck "Fast Delivery" → **hero photo**: large rounded card photo of a raw ribeye steak on a wooden board with rosemary, black pepper and a knife, bleeding toward the bottom edge; pagination dots overlaid at the photo's lower area (3 dots, first filled red, rest light) → primary CTA overlapping/below photo.
- **Components:** Logo/Skip header, serif display headline, icon trust trio, full-width food photo card, dot pager, pill CTA.
- **CTA style/placement:** Solid beef-red pill, full-width inset at bottom, "Get Started →" (text + arrow).
- **States:** Page 1 of onboarding carousel (first dot active); "Skip" available.
- **Engine mapping:** Onboarding. Note the **photo-hero + trust-trio** composition (vs Fibo's mascot, Proton's 3D shield): same slot, photography-led. Serif display headline is a type treatment the current engine grammar (one sans, editorial faces only for display) must explicitly allow.

### 2. Home / Shop — "Fresh Meat. Better Meals."
- **Purpose:** Commerce home: search, browse by cut, promo, best sellers.
- **Anatomy top→bottom:** **Red header zone** (solid deep-red ground, rounded bottom corners of the header block): status bar (white) → header row: logo + "Beefy" white left, location selector right — pin/glyph + "Dhaka ⌄" in white → tagline "Fresh Meat. Better Meals." in pale white small → **search field**: white pill overlapping/inside header bottom, magnifier left, placeholder "Search for beef cuts…", filter/sliders icon right → **category medallion rail** (on cream ground): 5 circular photo/icon medallions with labels under — "All" (selected: red filled circle with white cow/steak glyph), "Steaks", "Curry Cuts", "Mince", "Organs" (unselected: pale tint circles with red line icons) → **promo banner card**: dark photo card (raw cuts on slate), left text "Premium / Beef Cuts" large white, sub "Naturally Better", white pill button "Shop Now →"; top-right circular dark-green seal "100% / HALAL" → section header row: "Best Sellers" bold + right link "See All →" → **product card row** (3 cards visible, horizontal): each card — photo of the cut on white/cream (ribeye, sirloin, minced beef pile), name below ("Ribeye Steak", "Sirloin Steak", "Beef Mince"), price bold ("$16.20/kg", "$14.90/kg", "$9.50/kg"), small red square button with white cart icon at the card's bottom-right → bottom tab bar.
- **Components:** Coloured home header with location, search pill, medallion rail (photo/line-icon circles, selected = filled), promo photo banner with seal badge, section header with See All, product cards with price-per-unit and icon add button, tab bar with cart badge.
- **CTA style/placement:** Promo CTA is a small white pill inside the banner ("Shop Now →"); commerce CTA is the per-card cart icon button (no full-width CTA on home).
- **States:** Category "All" selected; cart count state = 3 (badge on tab bar); no sold-out/discount states shown.
- **Engine mapping:** Greeting home (location variant — header is brand+location, not a named-person greeting), medallion rail, product card, promo banner. This is the clearest **medallion rail** example across all four boards: circles are a mix of line icons (not photos) except the concept matches M047 medallions.

### 3. Product Detail — "Ribeye Steak"
- **Purpose:** Single product detail + add to cart + cross-sell.
- **Anatomy top→bottom:** **Full-bleed hero photo** (upper ~45%): raw marbled ribeye on dark slate with rosemary; status bar over photo → overlay controls row: circular white back chevron left; right pair of circular white buttons — heart (favourite) and cart with red badge "3" → **white detail sheet** overlapping the photo (rounded top corners): small pink/red tint pill tag "Best Seller" → product name "Ribeye Steak" large bold sans → price "$16.20 / kg" bold, unit in regular weight → star rating row: 5 gold stars (4.8 implied by fill) + "4.8 (320 reviews)" grey → description (3 lines): "Rich marbling, tender texture, and bold flavor. Perfect for grilling, pan-searing, or steakhouse style cooking." → **attribute trio row**: 3 columns, red line icon + label — "Freshly Cut", "Halal Certified", "Chilled Delivery" → **buy row**: quantity stepper left (pill: "−  1 kg  +", weight as the quantity unit) + primary CTA right taking remaining width: red pill, cart icon + "Add to Cart" → section header row: "You May Also Like" bold + "See All →" right → related product photo row (2 cards partially visible, cut off by screen bottom — photos of other cuts, names/prices below the fold).
- **Components:** Photo hero with overlay icon buttons, detail sheet, tag pill, rating stars + review count, attribute trio, quantity stepper (by kg), add-to-cart pill, related-products rail.
- **CTA style/placement:** Solid red pill "Add to Cart" with cart glyph, in-sheet buy row beside the stepper — not a floating bottom bar; it sits in flow at the sheet's buy row.
- **States:** Quantity = 1 kg (default); favourited state not shown (heart is outline); cart badge = 3 pre-existing.
- **Engine mapping:** Detail sheet (sheet-over-photo form) + product card (related). **Quantity-by-weight stepper** and **star rating + review-count line** are specific components; engine detail sheet exists, stepper exists generically, rating line should be named in the mapping.

---

## Pattern census — Beefy

| Pattern | Count |
|---|---|
| Product card (photo + name + price/unit + add button) | 1 row of 3 (+2 partial related = 5 rendered) |
| Onboarding | 1 |
| Commerce/greeting home (coloured header) | 1 |
| Medallion rail | 1 (5 medallions, 1 selected) |
| Detail sheet over photo | 1 |
| Promo banner with badge/seal | 1 |
| Trust/attribute trio (icon + label ×3) | 2 (screens 1, 3) |
| Pill primary CTA | 2 (Get Started, Add to Cart) |
| Search pill | 1 |
| Quantity stepper | 1 |
| Rating stars + count | 1 |
| Tab bar with badge | 1 (screen 2); overlay photo controls instead of nav on 3 |

**MISSING / recurring gaps from this board:** Serif editorial display headline for onboarding (type-role exception); sheet-over-full-bleed-photo detail layout; per-weight (kg) quantity stepper; seal/certification badge on promo (HALAL disc); location selector in home header.
