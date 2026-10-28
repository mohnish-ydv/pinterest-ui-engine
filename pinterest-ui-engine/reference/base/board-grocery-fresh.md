# Board Decode — Fresh Grocery (Fresh & Best / unnamed grocery app)

- **Source:** `33b2a081bfc1fcf5ed4c2c2dc114a616c48b23803085589a36f5a156de130d7e.jpg`
- **Layout:** 6 screens, 2 rows × 3 columns, photographed in a styled scene (real broccoli, tomatoes, peppers, corn, juice bottle around the phones — scene props are *not* UI).
- **App / domain:** Fresh grocery delivery — vegetables, fruit, dairy, bakery, beverages. Prices in USD ($). Copy: "Fresh Groceries Delivered to Your Doorstep".
- **Palette (approximate):** Ground mint-cream `#EAF6EE`–`#F7F3E8` (top screens mint, lower/category screens warm cream); primary green `#0E9F6E`–`#14B87A` (CTA gradient green, approx. `#0FA36B`); dark green ink `#123B2A` / headline `#14342B`; body grey-green `#5A6B62`; card white `#FFFFFF`; sale/alert red only in small scene/photo elements, and price-off text green; promo banner pale green `#DFF2E2`.
- **Type roles:** Display — bold rounded sans, dark green, for hero headline ("Fresh Groceries Delivered to Your Doorstep", 3 lines, ~28px) and no serif anywhere. UI — same sans family throughout: screen titles centred semibold, section heads ("Flash Deals", "Best Selling") bold ~15px left + "See All" small green/grey right, product name semibold ~13px, price bold, meta (weight "1kg", old price strikethrough) small grey.
- **Shape language:** Soft and chunky-rounded: cards radius ~16px, category rows radius ~16–20px, primary CTA is a full-width green pill with a white circular arrow badge `→` inset at the right end (signature detail — appears on Get Started, Proceed to Checkout, Place Order); secondary Add buttons are small green circles with white `+` (Flash Deals) or a green pill "Add to Cart" (detail); quantity stepper is a white/light pill `− 1 +`; search is a pill; category icon tiles are rounded squares in pastel tints.
- **Density character:** Medium-airy commerce. Home packs promo + 8 category tiles + two product rails in one scroll, but each chunk is separated by clear section headings and white space. Detail/cart/checkout are single-column, uncluttered.
- **Nav model:** 5-slot bottom bar — Home, Categories, **centre raised green circular Cart button with red badge "2"**, Orders, Profile — line icons, centre cart is a floating action button style. Secondary screens (Categories, Product Details, My Cart, Checkout) use back chevron left + centred title, and *keep* the bottom bar on Categories / Cart but drop it on Detail and Checkout (Checkout has no tab bar, only its CTA).

---

## Screen inventory

### 1. Onboarding / Welcome Hero
- **Purpose:** First-run value proposition and entry.
- **Anatomy top→bottom:** Status bar (9:41) → small circular white logo badge (leaf icon) top-left → headline "Fresh Groceries / Delivered to / Your Doorstep" dark green bold, left aligned → subcopy "Quality products, fast delivery and best prices everyday." small grey-green, 2 lines → green pill CTA "Get Started" with white circular `→` badge at right → large photographic hero: teal shopping basket overflowing with vegetables, milk bottle, baguette, oil bottle, leaves scattered → bottom white pill/card strip: "Trusted by 2M+ Happy Users" small text left + avatar cluster (3–4 faces) + `+` circle right.
- **Components:** Logo badge, hero photo, social-proof strip (avatars + claim).
- **CTA:** Green pill "Get Started →".
- **States:** Single welcome state.
- **Engine mapping:** Onboarding — resembles engine onboarding, but social-proof avatar strip and photographic basket hero are richer; onboarding pattern present.

### 2. Home — deliver-to home with promo, category grid, Flash Deals, Best Selling
- **Purpose:** Main grocery shopping home.
- **Anatomy top→bottom:** Status bar → location header: pin icon + "Deliver to / Home - 123 Green St ⌄" (2 lines, small) left, bell icon in circle right → search pill "Search for products…" + separate green square button with sliders/filter icon at right → promo banner card (pale green, radius ~16): "Fresh Vegetables / Up to 30% Off", small green pill "Shop Now →", photo of vegetable basket right → category icon grid 4 + 4: Fruits, Vegetables, Dairy, Beverages / Snacks, Bakery, Meat, More — pastel rounded-square icon tiles with small photo/icon, label below → section header "Flash Deals" + countdown "02 : 45 : 30" centre + "See All" right → horizontal product rail, 3 cards: Banana 1kg $1.25, Red Apple 1kg $2.45, Orange 1kg $1.85 — each photo, name, weight, price + small green circular `+` add button → section header "Best Selling" + "See All" → bottom bar: Home active (green), Categories, centre raised Cart (badge 2), Orders, Profile.
- **Components:** Location header, search pill + filter button, promo banner, category icon grid, countdown flash-deal rail, product card with `+` add.
- **CTA:** Promo "Shop Now"; per-product `+`.
- **States:** Cart badge = 2; flash countdown running.
- **Engine mapping:** Greeting home (location variant — "Deliver to" instead of "Hi, [name]") + promo banner + medallion/category grid + product card rail. Flash-deal countdown timer is **MISSING**.

### 3. Categories — promo header + stacked category rows
- **Purpose:** Full category browse.
- **Anatomy top→bottom:** Status bar → back chevron left, centred title "Categories" → promo banner card (warm peach): "Big Savings / On Everyday / Essentials", small white pill "Shop Now →", photo of grocery basket right with green "%" tag badge hanging from it → stacked full-width category rows (white cards, photo thumb left, name + descriptor + item count centre, chevron `>` right): "Fruits & Vegetables / Fresh and Organic / 120+ Items", "Dairy & Eggs / Farm Fresh Products / 85+ Items", "Snacks & Munchies / Top Brands / 150+ Items", "Beverages / Hot & Cold Drinks / 60+ Items" → bottom bar (same 5-slot, Categories active, centre Cart badge 2).
- **Components:** Promo banner, category list row (photo, name, descriptor, count, chevron).
- **CTA:** "Shop Now" in banner; row tap / chevron.
- **States:** Default list.
- **Engine mapping:** Category list — resembles profile rows but with photo thumb + count; also medallion alternative. Pattern: profile-rows variant / category row. Present in spirit, specific photo+count row is a distinct variant.

### 4. Product Details — Fresh Avocado
- **Purpose:** Single grocery product conversion.
- **Anatomy top→bottom:** Status bar → back chevron left, centred title "Product Details", heart outline icon right → large product photo (halved avocado + leaves, mint ground) → name "Fresh Avocado" bold left + star rating right "★ 4.8 (230)" → weight "1kg" small grey → price row: "$3.45" bold large, strikethrough "$4.20" grey, green pill/tag "18% OFF" → description "Creamy, nutritious and perfectly ripe avocados." 2 lines grey → bottom purchase row: quantity stepper pill "− 1 +" left + green pill "Add to Cart" right (wide) → section "You May Also Like" → 3 mini product cards in a row: Blueberry $2.25, Strawberry $2.15, Kiwi $1.85 — each small photo, name, price + green circular `+`.
- **Components:** Product photo, rating, discount price block, stepper, related-products rail (mini cards).
- **CTA:** Green pill "Add to Cart".
- **States:** Quantity 1; not favourited (outline heart); discount active.
- **Engine mapping:** Detail sheet / product detail + related rail — matches existing detail + related rail patterns. Discount strikethrough + % tag included.

### 5. My Cart (3 items)
- **Purpose:** Bag review.
- **Anatomy top→bottom:** Status bar → back chevron left, centred title "My Cart", small "3 items" sublabel under title, "Edit" text action top-right (green/small) → cart rows (3, white cards): photo thumb left, name bold, weight small grey, price bold below, stepper pill "− 1 +" right. Items: Banana 1kg $1.25, Milk Full Cream 1L $1.80, Whole Wheat Bread 400g $2.25 → promo row: "Have a promo code?" left + "Apply" right (green link) → summary rows: "Subtotal $5.30", "Delivery Fee $1.00", divider, "Total $6.30" bold → full-width green pill CTA "Proceed to Checkout" with white circular `→` badge → bottom bar, centre Cart active/raised with badge.
- **Components:** Cart line item with stepper, promo-code row, summary table.
- **CTA:** Green pill "Proceed to Checkout →".
- **States:** Populated, quantities all 1, promo not applied.
- **Engine mapping:** Bag / cart — matches existing bag pattern (with promo row).

### 6. Checkout
- **Purpose:** Address, delivery time, payment, place order.
- **Anatomy top→bottom:** Status bar → back chevron left, centred title "Checkout" (no bottom tab bar) → section "Delivery Address" → selected address card/row: green radio dot, "Home" bold, address "123 Green Street, Green City, GC 12345" small grey (2 lines), "Change" green link right → section "Delivery Time" → two selectable option cards side by side: "Express Delivery / 30–45 mins" with filled green radio/check (selected, green outline), "Free Delivery / 2–3 days" unselected → section "Payment Method" → payment radio rows (icon + label + masked detail, radio/check right): "VISA •••• 4242 / Visa" selected with green filled check circle, "PayPal", "Apple Pay" (each row separated, unselected empty radio) → "Total Amount" label + "$6.30" bold large → full-width green pill CTA "Place Order" with white circular `→` badge.
- **Components:** Address radio row, delivery-time option cards (2-up selectable tiles), payment radio rows, total + CTA footer.
- **CTA:** Green pill "Place Order →", bottom.
- **States:** Home address selected; Express selected; Visa selected.
- **Engine mapping:** Radio-row checkout — strongly matches existing radio-row checkout pattern (address / time / payment as radio groups). Delivery-time as 2-up tiles is a variant of radio rows.

---

## Pattern census

| Pattern | Count |
|---|---:|
| Green pill CTA with circular `→` badge | 3 (Get Started, Proceed to Checkout, Place Order) |
| Product card / mini card with `+` add | 2 screens (Home rails, Detail related rail; 6 cards total) |
| Quantity stepper pill | 2 screens (Detail ×1, Cart ×3) |
| Category tile / row | 2 screens (Home icon grid ×8, Categories rows ×4) |
| Promo banner card | 2 (Home % off, Categories Big Savings) |
| Bottom bar with centre raised Cart FAB + badge | 3 (Home, Categories, Cart) |
| Back + centred title header | 4 (Categories, Detail, Cart, Checkout) |
| Radio/check selectable rows or tiles | 1 screen, 3 groups (Checkout) |
| Section header + See All | 1 screen, 2× (Home) |
| Search pill (+ filter button) | 1 |
| Rating stars + count | 1 |
| Discount price (strikethrough + % off) | 1 |
| Cart line item + summary | 1 |
| Social-proof avatar strip | 1 |
| Flash-deal countdown | 1 |

**MISSING / weak in engine:** flash-deal countdown timer, centre-raised cart FAB in tab bar, social-proof avatar strip on onboarding, 2-up delivery-time selectable tiles (radio variant).
