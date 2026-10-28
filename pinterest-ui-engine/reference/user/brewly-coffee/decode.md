# User Reference Decode — Brewly Coffee (user: brewly-coffee)

- **Source:** `e0a02d5a714d98c7636d1742f5a866fcd7fc8b07b60303b612865dccab9b8d92.jpg`
- **Ingest:** SIMULATED USER UPLOAD for Mission 050 workstream C — this board ships in the base reference library as the coffee board (`work/decode/board-coffee.md`); it is ingested here exactly as if a user had attached it, to prove the REFERENCE_INGEST.md protocol end to end. Screen content below is the base board decode, reformatted as a user decode — same screens, same facts.
- **Measurement:** `measurement.json` in this directory is the verbatim `reference_profile.mjs` output for the source image (colour pixels only — see the decode-vs-measurement note at the end of the header block).
- **Layout:** 10 screens, 2 rows × 5 columns, on a warm cream studio background.
- **App / domain:** "Brewly" — coffee shop ordering, with food & snacks, rewards/loyalty, order tracking, wishlist. User shown: Ayesha Khan. Prices in USD ($).
- **Palette (approximate):** Deep forest / coffee green `#1E3D2F`–`#234534` (hero, rewards card, profile header); warm cream ground `#F6F1E7`–`#FAF6ED`; card white `#FFFFFF`; ink `#1C2420`; muted `#7A7F78`; accent caramel/tan `#C49A6C` in photos and small highlights only; price ink black/green. Green is used as large flat fields, not just buttons.
- **Type roles:** Display — elegant serif for hero headline "Good Coffee / Better Days" (white, large, on photo) — the only serif use. UI — clean sans for all app screens: greeting "Good Morning, Ayesha Khan", section heads bold sans, product names semibold, prices bold, meta ("Smooth & classic", "Rich & fresh") small grey. Rewards headline also sans bold white on green.
- **Shape language:** Cards radius ~16–18px; menu/wishlist rows are white cards with rounded-square photo thumb left; category chips are pills (selected = dark green fill, white text; unselected = white / light outline); primary CTA is a full-width dark-green pill (no arrow on most, `→` only on hero "Get Started →" and "Proceed to Checkout →"); size selector in detail is 3 segmented rectangular pills (Small selected green, Medium/Large white); add-on selector is checkbox rows; stepper is a light pill `− 1 +`.
- **Density character:** Comfortable medium density. Lists are 4–5 rows per screen with generous row height (~64px) and clear thumb + 2 text lines + price stack. Home is airier; tracker and rewards are information-dense but chunked into cards.
- **Nav model:** 5-tab bottom bar — Home, Menu, Orders (centre, sometimes with cart icon emphasis), Wishlist, Profile — line icons + labels, active in dark green. Secondary screens use back chevron left + centred title + a right icon (search, cart/bag, or bag with dot). Hero has no nav.
- **Decode vs measurement (why both exist):** `reference_profile.mjs` measures pixels and reports modal hue **orange (20°, 42.8% of coloured pixels)**, saturation regime **mixed**, archetype recommendation **neutral-gallery (85)** over committed-field (60). That is the photography talking — coffee, wood and tan food photography dominates the pixel count. The flat UI fields this decode records are a **dark-green committed-field world** (`#1E3D2F`–`#234534` heroes, rewards card, profile header, selected chips, every primary CTA) on a warm cream ground — and the measurement's own brand cluster agrees on the green (`#092B1B`, most saturated cluster). Per REFERENCE_INGEST.md, the decode governs art/design direction; the measurement governs only the colour numbers it actually measured (ground cluster `#F9F8F4` ≈ the decode's cream, brand cluster ≈ the decode's green band). Where they disagree, the disagreement is recorded here and in `profile.json`, never silently resolved.

---

## Screen inventory

### 1. Welcome / Hero — Brewly cover
- **Purpose:** Entry / onboarding cover.
- **Anatomy top→bottom:** Status bar (dark photo) → top-left brand row: small green circular logo + "Brewly" white text → headline "Good / Coffee / Better Days" in white serif, large, left → subcopy "Freshly brewed. Expertly crafted. Just for you." small white → large photo occupying most of screen: cup of latte art in dark green cup on wooden table, beans, dramatic warm light → near bottom: full-width dark green pill CTA "Get Started →" (white text) → below it centred text link "Already have an account? Log In" (white/small, "Log In" emphasised).
- **Components:** Full-bleed photo hero, serif display headline, brand lockup, primary + text-link secondary action.
- **CTA:** Dark green pill "Get Started →"; secondary text Log In.
- **States:** Cover only.
- **Engine mapping:** Onboarding — resembles engine onboarding; serif-on-photo cover is a style variant, pattern present.

### 2. Home — "Good Morning, Ayesha Khan"
- **Purpose:** Personalised coffee home.
- **Anatomy top→bottom:** Status bar → greeting block left: "Good Morning," small grey, "Ayesha Khan" bold large; circular avatar right → search pill "Search your favorite coffee…" with magnifier → promo banner card (photo right of iced coffee, warm tan ground): "Special Offer / Get 20% Off / on Your First Order" + small dark pill "Shop Now →" → category icon rail: 4 circular/rounded items with icon + label — Hot Coffee, Iced Coffee, Cold Brew, Food & Snacks → section header "Popular Drinks" + "See All" right → 2 product cards side by side: Cappuccino $4.50 (photo, name, price), Iced Latte $4.00 — cards white, photo top → 5-tab bottom bar, Home active.
- **Components:** Greeting home header + avatar, search pill, promo banner, icon category rail, product card rail.
- **CTA:** "Shop Now →" in promo; cards tappable.
- **States:** Default.
- **Engine mapping:** Greeting home — canonical match (greeting + avatar + search + promo + rail + cards).

### 3. Our Menu — category chips + drink list
- **Purpose:** Full drinks menu browse / filter.
- **Anatomy top→bottom:** Status bar → back chevron left, centred title "Our Menu", search icon right → filter chip rail: **All (selected, dark green pill)**, Coffee, Iced, Food, Snacks (white pills) → vertical list of menu rows (white cards, photo thumb left, name bold + descriptor small grey + price bold below): Espresso "Rich & bold" $3.00, Americano "Smooth & classic" $3.50, Cappuccino "Espresso with steamed milk" $4.50, Latte "Creamy & smooth" $4.50, Mocha "Chocolate & coffee" $5.00 (partially cut) → 5-tab bottom bar, Menu active.
- **Components:** Filter chip rail, product list row (thumb/name/meta/price).
- **CTA:** None explicit; row tap.
- **States:** "All" chip selected.
- **Engine mapping:** Filter chips + list — resembles filter sheet's rail form / product list. Chip rail pattern present; this is a menu-list variant of product card (horizontal row form).

### 4. Product Detail — Cappuccino, size + add-ons
- **Purpose:** Configure and add a drink.
- **Anatomy top→bottom:** Status bar (photo header) → back chevron in white circle left over photo, bag/cart icon in white circle right → large photo hero (latte art cup, dark moody cafe ground) top ~35% → white sheet (rounded top) overlapping: name "Cappuccino" bold left + price "$4.50" bold right → rating "★ 4.8 (2.4k reviews)" small (star amber/green) → description "A perfect blend of espresso, steamed milk and velvety foam. Smooth, rich and absolutely delicious." 2–3 lines grey → label "Size" → 3 segmented options: **Small $4.50 selected (dark green)**, Medium $5.00, Large $5.50 (white pills/rectangles, price under label) → label "Add-ons" → checkbox rows: "Extra Shot +$0.50" unchecked square, "Oat Milk +$0.50" unchecked square → bottom action row: stepper pill "− 1 +" left + dark green pill "Add to Cart →" right (wide).
- **Components:** Photo hero + sheet, rating, size segmented selector with per-size price, add-on checkboxes, stepper, sticky CTA bar.
- **CTA:** Dark green pill "Add to Cart →".
- **States:** Small selected; add-ons unselected; qty 1.
- **Engine mapping:** Detail sheet — strong match, but size-with-price segmented control and paid add-on checkboxes are specific variants. Pattern present, add-on checkbox group is a distinct sub-pattern.

### 5. Your Cart
- **Purpose:** Bag review.
- **Anatomy top→bottom:** Status bar → back chevron left, centred title "Your Cart", trash/delete icon right → cart rows (white cards, thumb left, name bold, variant small grey, price bold, stepper right): Cappuccino / Small / $4.50 with `− 1 +` (? stepper small), Iced Latte / Medium / $5.00, Blueberry Muffin / (no variant shown) / $3.50 → summary block: "Subtotal $13.00", "Delivery Fee $2.00", divider, "Total $15.00" bold large right → full-width dark green pill CTA "Proceed to Checkout →" → 5-tab bottom bar, Orders/cart active.
- **Components:** Cart line item, summary table, delete-all (trash in header).
- **CTA:** Dark green pill "Proceed to Checkout →".
- **States:** 3 items. Steppers at board resolution are small — quantities inferred as 1, not individually legible.
- **Engine mapping:** Bag / cart — matches existing bag pattern.

### 6. Track Order — map tracker with courier
- **Purpose:** Live delivery tracking.
- **Anatomy top→bottom:** Status bar → back chevron left, centred title "Track Order" → white card: "Your order is on the way!" bold + "Arriving in 12 mins" small grey → map area (light street map, curved dark route line, house pin at top-right end, courier/bike marker mid-route) — map is the central visual, approx. 35% of screen → courier card row: circular avatar left, "Ali Raza" bold + "Delivery Partner" grey + star "★ 4.9", phone/call and chat icons right (in circles/squares) → order summary row: "Order #BWL4587" bold + "Placed at 10:24 AM" grey left, "View Details" link right → horizontal progress tracker: 4 nodes on a line — Confirmed (filled/check), Preparing (filled), On the way (filled/current), Delivered (empty) — labels under nodes → bottom encouragement card: small coffee photo thumb + "Almost there! / Your coffee is on the way." (2 lines).
- **Components:** Map + route, courier profile row, order meta row, 4-step horizontal tracker, status card.
- **CTA:** Call / chat icon buttons on courier row; "View Details" link.
- **States:** In-transit, step 3 of 4.
- **Engine mapping:** Tracker — matches existing order tracker pattern, plus **MISSING** map-with-route and courier contact row (tracker pattern alone does not include map/courier).

### 7. Coffee Rewards — loyalty / points
- **Purpose:** Loyalty programme home.
- **Anatomy top→bottom:** Status bar → back chevron left, centred title/logo area "Brewly" with logo (header over cream) → large dark-green hero card (radius ~20): coffee-cup illustration/photo centre top, headline "Coffee Rewards" white bold centred, subcopy "The more you sip, the more you earn!" small white centred, points display "Your Points / 320" (label small, number large white bold), small pill button "Redeem" (light/white pill) → section "How to Earn Points" → 3 stacked rows (icon in light circle left, bold title + small grey sub): "Place an Order / Earn points on every purchase", "Write a Review / …", "Refer a Friend / …" (subtexts small, gist legible, verbatim too small) → offer card (light/white with dashed or tinted edge): gift/cup icon, "Unlock Free Coffee / Reach 500 points and get a free medium drink!" → bottom tab bar (Rewards reached from Profile, tab bar present, Profile/Wishlist active area — at board resolution active tab is ambiguous).
- **Components:** Points hero card, earn-points instruction rows, unlock/target offer card, redeem pill.
- **CTA:** "Redeem" pill inside hero card.
- **States:** 320 points, below 500-point free-coffee threshold.
- **Engine mapping:** Wallet-adjacent loyalty — closest is wallet (points balance + redeem), but a dedicated **rewards/loyalty pattern is MISSING**: points hero, earn rows, and progress-to-reward offer are not a wallet.

### 8. Food & Snacks — category chips + food list
- **Purpose:** Food category browse (sibling of Screen 3).
- **Anatomy top→bottom:** Status bar → back chevron left, centred title "Food & Snacks", search icon right → chip rail: **All selected (dark green)**, Pastries, Sandwiches, Snacks → list rows (same row anatomy as Menu): Blueberry Muffin "Soft & fresh" $3.50, Croissant "Buttery & flaky" $3.00, Chocolate Croissant "Rich & delicious" $3.50, Avocado Toast "Healthy & tasty" $6.50, Chicken Sandwich "Fresh & filling" $6.00 → 5-tab bottom bar, Menu active.
- **Components:** Filter chip rail, product list row.
- **CTA:** None explicit; row tap.
- **States:** "All" selected.
- **Engine mapping:** Same as Screen 3 — filter chips + menu list row. Duplicate pattern confirming it is the board's list system.

### 9. My Wishlist
- **Purpose:** Saved items list.
- **Anatomy top→bottom:** Status bar → back chevron left, centred title "My Wishlist", search icon right → vertical list of wishlist rows (white cards, thumb left, name + descriptor/meta + price, heart filled green/red? at right or below price): Caramel Latte $4.75, Matcha Latte $4.50, Chocolate Croissant $3.50, Iced Americano $3.50 — each row shows a filled heart icon indicating saved state (position: right edge of text block, small) → 5-tab bottom bar, Wishlist (heart) active.
- **Components:** Wishlist row (reuses menu row + filled heart).
- **CTA:** None explicit; row tap / heart to remove.
- **States:** All listed items favourited. Row descriptors too small to transcribe verbatim — type inferred from menu rows, names/prices legible.
- **Engine mapping:** Wishlist list — reuses product list row; dedicated wishlist *view* as in sneaker board. Pattern = product list row in saved view.

### 10. Profile — Ayesha Khan account hub
- **Purpose:** Account, rewards entry, settings navigation.
- **Anatomy top→bottom:** Status bar (dark green header) → dark-green header block: circular avatar left, "Ayesha Khan" white bold, email "ayeshakhan@gmail.com" small white/grey below (spelling as shown at board resolution — `ayeshakhan@gmail.com`), chevron/edit implied right → rewards entry card overlapping header (white/gold-tinted row): crown/medal icon in circle, "Brewly Rewards" bold + "320 points" small, chevron right → profile rows list (icon left in light circle, label, chevron right): My Orders, Wishlist, Addresses, Payment Methods, Help & Support, Settings → logout row: "Log Out" with logout icon, centred/left, in a white pill/card separated from list → 5-tab bottom bar, Profile active.
- **Components:** Profile header (avatar/name/email on colour field), rewards summary row, profile navigation rows, logout action.
- **CTA:** Log Out (quiet pill, not primary green); rows tappable.
- **States:** Logged-in, 320 points consistent with Screen 7.
- **Engine mapping:** Profile rows — canonical match (header + rows + logout). Rewards summary row inside profile is the wallet/rewards bridge.

---

## Pattern census

| Pattern | Count |
|---|---:|
| Product list row (thumb / name / meta / price) | 3 screens (Menu ×5, Food ×5, Wishlist ×4; 14 rows total) |
| Dark-green pill primary CTA | 4 (Hero, Detail add-to-cart, Cart checkout, plus promo Shop Now small pill) |
| Filter chip rail (selected = green) | 2 (Menu, Food & Snacks) |
| 5-tab bottom bar | 7 (all except Hero; Rewards/Profile ambiguous but present) |
| Back + centred title header | 7 (Menu, Detail, Cart, Track, Rewards, Food, Wishlist) |
| Product card (photo top, 2-up) | 1 screen, 2 cards (Home) |
| Greeting header + avatar | 1 |
| Promo banner | 1 |
| Cart line item + summary | 1 |
| Size segmented selector | 1 |
| Add-on checkbox group | 1 |
| Rating stars + count | 1 (Detail; also courier rating in Track) |
| Tracker (steps) | 1 |
| Map + route + courier row | 1 |
| Points / rewards hero card | 1 |
| Profile rows | 1 screen, 6 rows + logout |
| Search pill / search icon | 3 screens |

**MISSING / weak in engine:** loyalty/rewards pattern (points hero + earn rows + unlock offer), map-with-route + courier contact card in tracker, paid add-on checkbox group in detail, wishlist as a list view (vs grid in sneaker board — engine needs both forms).

---

## Ingest record

- **Ingested as:** `reference/user/brewly-coffee/` (simulated user upload, Mission 050).
- **Governs:** any plan whose REFERENCE_PLAN.md names this decode. Art and design direction derive from THIS decode, not the base reference (see REFERENCE_INGEST.md step 5).
- **Files:** `decode.md` (this file), `profile.json` (base_reference.json schema), `measurement.json` (verbatim reference_profile.mjs output).
- **Validation:** `node engine/reference/reference_doctor.mjs reference/user/brewly-coffee` — result recorded in the Mission 050 workstream C report.
