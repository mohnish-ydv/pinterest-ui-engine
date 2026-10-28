# Board Decode — Sneaker Store (ATLETE TREND)

- **Source:** `18644a075990dd0703b77e904411e4a1330accd45aef57114d2c15eef1beed4b.jpg`
- **Layout:** 8 screens, 2 rows × 4 columns, on a light grey studio background.
- **App / domain:** "ATLETE TREND" / "AT" monogram — sneaker / athletic footwear e-commerce, Albania (Tirana address, +355 phone, `.al` email/domain in contact screen). Prices in EUR (€).
- **Palette (approximate, from flat UI fields):** Background / card ground `#FFFFFF` to `#F4F4F2`; ink / primary button `#111111`–`#1A1A1A`; muted text `#6B6B6B`; hairline / chip ground `#EDEDEA`; hero photographic ground sepia-taupe `#8A7D6E`–`#B8A99A`; accent — effectively none: colour comes only from product photography (pink Dunk, red Nike). Sale label in red text only, no red fill.
- **Type roles:** Display — high-contrast serif / engraved monogram for "AT" logo, and a bold condensed sans for hero headlines ("More Than Sneakers. A Lifestyle.", "More Than a Store.") set in tight, large, left-aligned blocks. UI — clean geometric/humanist sans for everything else: screen titles centred semibold ~17px, product names ~13px semibold, price ~13–15px bold, meta/captions ~11px grey. Sentence case throughout; no all-caps except logo and tiny category eyebrow "ATLETE TREND".
- **Shape language:** Very rounded phone frames; cards radius ~16–20px; hero image bleeds to top of screen with bottom sheet radius ~24px overlapping; primary CTA is a full-width black pill (radius ~999px, white text, `→`); quantity stepper is a light pill with `− 1 +`; size selector is a row of small rounded-rectangle chips (selected = black fill, white text); colour selector is small circular swatches; thumbnail rail in detail is rounded-rectangle thumbnails, selected with dark outline.
- **Density character:** Airy / editorial. One hero idea per screen, generous white space, 2-column product grid only, no dense lists except Cart and Contact which are still spaced list rows. Product photos on plain light-grey studio grounds, lots of negative space around shoe.
- **Nav model:** 5-tab bottom bar — Home, Shop, Favorites, Cart, Profile — line icons, text label under icon, active tab black / inactive grey, Cart/Favorites show no badge in most screens. Secondary screens (Categories, Cart, Favorites, Contact) use top-left back chevron `<` + centred title, no bottom-bar change except active tab. Detail uses back chevron left, heart + share icons right. Hero/onboarding has a small top-right pill "SKIP".

---

## Screen inventory

### 1. Splash / Editorial Hero — full-bleed product hero
- **Purpose:** Brand entry / onboarding cover.
- **Anatomy top→bottom:** Status bar (9:41) → top-right small translucent pill "SKIP" → centred "AT" serif monogram + "ATLETE TREND" letterspaced caption over photo → large photographic hero of a chunky sneaker on rock, sepia sky, occupying top ~60% → dark gradient lower third → headline "More Than Sneakers. A Lifestyle." (3 lines, white, bold) → subcopy "Original brands. New trends. Your next favorite pair." (small, white/grey) → full-width white pill CTA "Explore Now →" (black text) near bottom → pagination dots (1 dark / others light, partially visible at very bottom).
- **Components:** Full-bleed photo hero, logo lockup, skip pill, dot pagination.
- **CTA:** Single white pill, bottom-anchored, arrow suffix.
- **States:** First / cover state only.
- **Engine mapping:** Onboarding / hero splash — resembles engine onboarding + promo/hero banner, but engine has no full-bleed photographic cover with gradient scrim + white-on-dark CTA. Partially **MISSING** as a dedicated pattern.

### 2. Home — greeting-less shop home with promo hero and brand rail
- **Purpose:** Main shopping home.
- **Anatomy top→bottom:** Status bar → header row: "AT / ATLETE TREND" logo left, bell icon + circular avatar right → pill search field "Search for sneakers, brands…" with magnifier left and sliders/tune icon in a small square at right end → large dark promo card (radius ~20px): "New Season / New Energy", small subcopy "Discover the latest sneaker collection", black pill "Shop Now →", photo of two New Balance sneakers right / overlapping → brand facet rail: 4 items in a row — grid icon "All", Nike swoosh, Adidas, New Balance "NB" — logo-only medallion equivalents, label underneath → section header "Trending Now" left + "See All" right (small grey) → 2-column product grid: card 1 "Nike Air Force 1, €129.00", card 2 "New Balance 530, €139.00", each with heart icon top-right of photo, photo on light grey, name, price → 5-tab bottom bar, Home active.
- **Components:** Search pill, promo banner card, brand/logo rail, section header + See All, product card (photo/name/price/favourite).
- **CTA:** "Shop Now →" black pill inside promo; cards themselves tappable; no add-to-cart on card.
- **States:** Default home; favourite hearts outline (unselected).
- **Engine mapping:** Greeting home (variant *without* personal greeting — brand header instead) + promo banner + medallion rail (brand logos, not initials/photos) + product card grid. Close to existing.

### 3. Categories — 2-column category tile grid
- **Purpose:** Browse by category / facet value.
- **Anatomy top→bottom:** Status bar → back chevron left, centred title "Categories" → 2-column grid of tall category tiles (photo top, label + descriptor below, on light grey/photo ground): Row 1 "All Sneakers / 120+ Models", "Lifestyle / Everyday Style"; Row 2 "Running / Performance", "Classic / Timeless Models"; Row 3 "Chunky / Bold Looks", "Slides & Sandals / Comfort First" (black slide photo); Row 4 (partially cut by bottom bar) "Kids / Little Trends", "Sale / Best Deals" (red/black Nike) → 5-tab bottom bar, Shop active.
- **Components:** Category tile (photo + name + sublabel + count/style note).
- **CTA:** Tile tap only; no button.
- **States:** Full grid; Sale tile is the only colour-accented photo.
- **Engine mapping:** Medallion rail expanded to a full grid / category list — resembles medallion homes and filter facets, but as 2-col photo tiles this is a **category-grid** variant. Engine mapping: partial medallion / facet-browse.

### 4. Product Detail — Nike Air Force 1 '07
- **Purpose:** Single product conversion.
- **Anatomy top→bottom:** Status bar → back chevron left, heart + share icons right → large product photo (white/grey Nike Air Force 1, side profile, light grey ground, full width) → thumbnail / pager strip: "1/6" counter small left, then row of ~5 rounded thumbnails (side, pair, sole, detail views), first selected with outline → name "Nike Air Force 1 '07" (bold) → price "€129.00" bold left, star rating right "★★★★★ 4.8 (124)" in amber/grey small → description paragraph (2–3 lines, grey: timeless classic / iconic style / everyday comfort — partially legible at board resolution, gist only) → "Size" label left + "Size Guide" link right → size chip row: 36, 37, **38 selected (black fill)**, 39, 40, 41, 42, 43 → "Color: Light Bone" label → colour swatch row: 4–5 circles (light bone selected, grey, dark grey, black) → bottom action row: quantity stepper pill "− 1 +" left (narrow) + black pill "Add to Cart" with bag icon right (wide).
- **Components:** Photo gallery + thumbnails + counter, rating stars/count, size selector chips, colour swatches, quantity stepper, sticky bottom action bar.
- **CTA:** Black pill "Add to Cart", bottom right, bag icon.
- **States:** Size 38 selected; colour Light Bone selected; image 1 of 6.
- **Engine mapping:** Detail sheet / product detail — close to existing detail sheet, but gallery-with-thumbnails + size-grid chips + swatches + stepper in one sticky bar is richer than a plain detail sheet. Pattern present, variant richer.

### 5. Your Cart (3)
- **Purpose:** Bag review and checkout entry.
- **Anatomy top→bottom:** Status bar → back chevron left, centred title "Your Cart (3)", "Clear All" text action right (grey/red-tinted small) → cart line rows (3): thumbnail left (small, light grey), name (2 lines max: "Nike Air Force 1 '07 / Light Bone • 42"), price bold below name, trash/delete icon top-right of row, quantity stepper pill "− 1 +" bottom-right of row. Items: Nike Air Force 1 '07 €129.00, New Balance 530 (Grey • 40) €139.00, Adidas Campus 00s (Black • 41) €119.00 → divider → "Order Summary" heading → rows: "Subtotal €387.00", "Shipping Free", divider, "Total €387.00" bold → full-width black pill CTA "Checkout →" → 5-tab bottom bar, Cart active with dot/badge indication.
- **Components:** Cart line item (thumb/name/variant/price/stepper/delete), order summary table, clear-all.
- **CTA:** Black pill "Checkout →", above tab bar.
- **States:** Populated cart, quantity 1 each, free shipping.
- **Engine mapping:** Bag / cart + order summary — matches existing bag pattern with unique line items and summary rows.

### 6. Favorites (6)
- **Purpose:** Saved / wishlist grid.
- **Anatomy top→bottom:** Status bar → back chevron left, centred title "Favorites (6)" → 2-column product grid, 4 fully visible (+ implied more below): "Nike Dunk Low €129.00" (pink/white), "New Balance 2002R €149.00" (grey), "Adidas Samba €119.00" (white/black), "Nike Air Max 270 €159.00" (black) — each card photo on light grey, filled black heart top-right (selected state contrasting Screen 2 outline hearts), name, price → 5-tab bottom bar, Favorites active.
- **Components:** Product card grid, filled-heart state.
- **CTA:** None explicit; card tap implied.
- **States:** All hearts filled = favourited state.
- **Engine mapping:** Wishlist / favourites grid — reuses product card; engine mapping is product card in a saved-items view. If engine has no dedicated wishlist view, mark **MISSING as a view, pattern = product card**.

### 7. About / Brand Story — "More Than a Store."
- **Purpose:** Brand / trust / about.
- **Anatomy top→bottom:** Status bar → top bar over photo: "AT / ATLETE TREND" logo centre-left, hamburger menu icon right → large photo hero (pair of Nike sneakers, dark/mottled ground) top ~45% → headline "More Than / Than a Store." (bold, large, black on white) → body paragraph in Albanian (grey, ~6 lines — legible gist: ATLETE TREND created for all who live sneakers as passion, original models, care — full text too small to transcribe verbatim, do not quote beyond gist) → trust row: 4 small icon+label columns (shield "100% Originale", truck/delivery, payment, support "24/7" — labels in Albanian, small, partially legible) → full-width black pill CTA "Mëso më shumë →" ("Learn more").
- **Components:** Photo hero, brand story text block, 4-up trust/badge row.
- **CTA:** Black pill, bottom.
- **States:** Static informational.
- **Engine mapping:** **MISSING** — no engine equivalent for a brand/about story screen with trust-badge row. Closest is promo banner / onboarding, neither matches.

### 8. Contact — "Na Kontaktoni" (Contact Us)
- **Purpose:** Store contact and directions.
- **Anatomy top→bottom:** Status bar → back chevron left, centred title "Na Kontaktoni" (Albanian: Contact Us) → contact rows (icon in dark circle left, bold value, small grey sublabel below): phone "+355 68 123 4567" (sub: hours Mon–Sat 09:00–20:00 approx.), Instagram "@atlete_trend" (sub: follow us on Instagram), email "info@atletetrend.al" (sub in Albanian) → section heading "Lokacioni Ynë" (Our Location) → map card (light map, street lines, black location pin, label "Atlete Trend", "Tirana" city label below/over map) → address row: pin icon + "Rr. Myslym Shyri, Tiranë, Shqipëri" → hours row: clock icon + "Hapur çdo ditë: 09:00 – 20:00" (approx.) → full-width black pill CTA "Get Directions →".
- **Components:** Contact info rows (icon medallion + value + sublabel), embedded map card, address/hours rows.
- **CTA:** Black pill "Get Directions →", bottom.
- **States:** Static.
- **Engine mapping:** Profile rows (icon + label rows) for the contact list, but map card + directions CTA is **MISSING** in engine patterns listed. Overall: profile rows + MISSING map/directions.

---

## Pattern census

| Pattern | Count |
|---|---:|
| Product card (photo / name / price, heart) | 2 screens (Home grid, Favorites grid; 6 individual cards total) |
| Full-width black pill primary CTA | 5 (Hero, About, Contact, Cart checkout, Detail add-to-cart as split bar) |
| 5-tab bottom navigation | 4 (Home, Categories, Cart, Favorites) |
| Back-chevron + centred title header | 4 (Categories, Cart, Favorites, Contact) |
| Photo hero (full-bleed / large) | 3 (Splash, Home promo, About) |
| Quantity stepper pill (− / +) | 2 (Detail, Cart rows ×3) |
| Category photo tile | 1 screen, 8 tiles |
| Brand/logo facet rail | 1 (Home) |
| Size chip selector (selected = black) | 1 |
| Colour swatch row | 1 |
| Gallery thumbnails + counter | 1 |
| Cart line item + order summary | 1 |
| Trust-badge 4-up row | 1 |
| Contact rows + map card | 1 |
| Search pill | 1 |
| Rating stars + count | 1 |

**MISSING / weak in engine:** full-bleed editorial splash, brand/about story with trust row, map + Get Directions, dedicated wishlist view, photo gallery with thumbnails in detail.
