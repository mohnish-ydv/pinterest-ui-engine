# Board Decode — Pizza / Food Delivery (board-pizza-food)

- Source file: `3960e444b21ce935d6d6f970ec266be6884a64ff58d43aea432ce0e855c8a3e2.jpg` (736×785)
- Panels: **8** — all 8 are distinct screens, no duplicate panels, no state-only repeats.
- Layout of board: 2 rows × 4 columns. Row 1: Welcome, Home, Restaurant detail, Cart. Row 2: Track Order, Favorites, Profile, Explore/Trending.
- Legibility: Good at board resolution. Headlines, prices, ratings and nav labels are readable. Only micro-meta (street-level address text, review counts in parentheses) is small; nothing below is invented from illegible text — where a line is inferred it is marked as such.

## Board header

- **App name / domain:** Unnamed food-delivery app. Copy examples: deliver-to “Lahore, Pakistan”, restaurant “Pizza Planet”, user “Ayesha Khan”. Domain: multi-restaurant food ordering + delivery tracking.
- **Palette (approximate, sampled from flat UI fields, not photos):**
  - Primary / CTA orange: ~`#F97300`–`#FF7E1B`
  - Ink / headline black: ~`#111111`–`#1A1A1A`
  - Page ground: warm off-white ~`#FFFBF4`–`#FFF8EE`
  - Card ground: white ~`#FFFFFF`
  - Muted meta grey: ~`#8A8A8A`
  - Soft tint for selected nav / promo / membership row: pale peach ~`#FFF1E3`
  - Success / live green (tracker): ~`#2E9E5B`
  - Photography supplies most other colour (food), UI chrome itself is orange + black + warm white only.
- **Type roles:**
  - Display: bold, tight, sans, large two-line statements (“Good Food / Good Mood”, sentence case with capitalised words) — used only on the welcome screen.
  - UI / headline: same sans, bold, ~17–20px for screen titles (“Your Cart”, “Favorites”, “Track Order”) and section titles (“Popular Near You”, “Recommended”, “Trending Right Now”).
  - Body / meta: regular sans, grey, single line under titles (restaurant cuisine • category, time, distance). Prices are bold black, same size as or slightly larger than the item name.
  - No serif, no all-caps labels anywhere.
- **Shape language:**
  - Cards / sheets: large radius ~16–20px; phone frames themselves heavily rounded.
  - Buttons: full-pill primary CTA (orange, white text, right-arrow glyph “→” at the right end).
  - Chips: pill, quiet — white/grey ground, orange outline+text only for the selected chip (“Restaurants” in Favorites).
  - Category medallions: circular photo/icon medallions (~52px) on white/very pale ground, label underneath.
  - Icon buttons: plain stroke icons, no filled squares except the orange circular “+” add button on menu rows.
  - Search field: pill, light grey ground, magnifier inside left, no separate search button.
- **Density character:** Airy consumer density. One primary section per visual band, generous white space, photos large (restaurant cards ~half the column width, menu thumbs square and cropped full-bleed). Lists are single-column with ~64–72px rows; nothing is table-like. Every screen fits without a visible scrollbar cue except the horizontal medallion/category and card rails.
- **Nav model:** Two levels.
  - App level: 4-tab bottom bar — Home, Explore, Orders, Profile — stroke icons + label, selected tab orange (icon + label), others grey. Present on Home, Favorites (Home selected — Favorites is reached inside the app, not a tab), Profile, Explore.
  - Stack level: back-arrow top-left + centred/left title + one trailing action (heart on restaurant detail, trash on Cart, settings gear on Profile) on Cart, Track Order, Favorites, Restaurant detail. These stack screens have **no bottom tab bar**.

---

## Screen inventory

### 1. Welcome / onboarding splash — “Good Food Good Mood”
- **Purpose:** First-run value proposition and single entry into the app. No login fields on this screen.
- **Anatomy top→bottom:**
  1. Status bar (9:41, signal/wifi/battery) over photo.
  2. Full-bleed dark food photograph (bowl salad/chicken dish, dark background) filling the whole screen.
  3. Headline, left-aligned, upper third: “Good Food / Good Mood” (two lines, white, display size), with a small orange brush/scribble underline under “Good”.
  4. Sub-copy, white, two lines: “Fresh, tasty & delivered / to your door.”
  5. Large empty photo space (dish bowl lower centre).
  6. Bottom CTA, full-width pill with side margins.
- **Components:** full-bleed photo hero, display headline, scribble accent, primary pill CTA.
- **CTA style/placement:** Single orange pill, bottom-anchored, “Get Started →”, white text left-of-centre with arrow at right end of the label group. No secondary / skip / sign-in link visible.
- **States shown:** Default only.
- **Engine mapping:** Onboarding — full-photo variant. Engine onboarding exists but this specific treatment (photo fills screen, headline overlays photo, no card/sheet at bottom, CTA floats over photo) is a distinct sub-pattern; closest existing = onboarding. Photo-overlay headline = **partial / MISSING as a named variant** if engine onboarding is illustration-on-white only.

### 2. Home / discovery — greeting home
- **Purpose:** Deliver-to home: search, promo, category shortcuts, nearby restaurants.
- **Anatomy top→bottom:**
  1. Status bar.
  2. Location header row: orange pin icon + small label “Deliver to” over bold “Lahore, Pakistan ⌄” (left); bell icon button; circular avatar photo (right).
  3. Pill search field: “Search for food, restaurants...”
  4. Promo banner card (rounded, photo right — burger): small label “Today's Special”, headline “Big Flavor / Bigger Happiness”, small orange pill “Order Now →”.
  5. Category medallion rail, 4 visible: Burgers, Pizza, Asian, Desserts — each a circular medallion with a simple coloured food icon/illustration, label below.
  6. Section header row: “Popular Near You” + “See All ›” (right, grey).
  7. Horizontal restaurant card rail, 2 cards fully visible: photo top (rounded), name (“The Burger House”, “Pizza Planet”), meta line (cuisine • category, e.g. “Burgers • Fast Food”), second meta line with star rating + count and delivery time (“★ 4.6 (2.3k)”, “25–35 min” / “★ 4.5 (1.8k)”, “35–45 min”).
  8. Bottom tab bar.
- **Components:** location/greeting header, pill search, promo banner, medallion rail, section header, horizontal product/restaurant cards, bottom nav.
- **CTA style/placement:** No single page CTA; conversion is distributed — promo pill inside the banner, cards themselves tappable. Nothing sticky at bottom except nav.
- **States shown:** Home tab selected (orange). All other states default.
- **Engine mapping:** Greeting home (exact) + promo banner + medallion rail + product card (restaurant variant). Fully covered pattern set.

### 3. Restaurant detail / menu — “Pizza Planet”
- **Purpose:** One restaurant: identity, trust/delivery meta, tabbed menu, addable dishes.
- **Anatomy top→bottom:**
  1. Hero photo band (top ~30%): whole pizza photographed from above, status bar over photo, back arrow top-left (white circle/scrim — small, legible as back control), heart/favourite icon top-right.
  2. Overlapping/ground section, white: restaurant name “Pizza Planet” (bold, large).
  3. Rating line: orange star “4.5 (1.8k reviews)”.
  4. Meta line: “Italian • Pizza • Fast Food”.
  5. Delivery meta row: clock icon “35–45 min” • (separator) “Free delivery over $15”.
  6. Segmented text tabs: “Menu” (selected, bold/underlined in black/orange), “Reviews”, “Info” — text tabs, not pills.
  7. Section title: “Recommended”.
  8. Menu rows ×3, each: square rounded photo thumb left; name bold (“Margherita Pizza”, “Pepperoni Pizza”, “BBQ Chicken Pizza”); one-line description grey (“Classic cheese & tomato sauce”, “Loaded with pepperoni”, “Smoky BBQ, chicken, onions” — third line partly truncated in board, read as shown); price bold (“$8.99”, “$10.99”, “$11.99”); circular orange “+” add button right-aligned, vertically centred.
  9. (Screen ends at third row; no tab bar, no sticky cart bar visible.)
- **Components:** photo hero with overlay controls, rating/meta stack, text tab strip, dish list rows, circular add button.
- **CTA style/placement:** Per-row “+” add buttons; no page-level CTA and no “view cart” bar in the state shown.
- **States shown:** Menu tab selected; restaurant not favourited (outline heart) — inferred from outline style.
- **Engine mapping:** Detail sheet / detail page (hero variant) + product rows. Resembles engine detail sheet but this is a **full-page hero detail with in-page tabs (Menu/Reviews/Info)** — tabs-inside-detail = **MISSING / partial** if engine detail has no tab strip.

### 4. Cart — “Your Cart”
- **Purpose:** Review line items, quantities, promo, totals, proceed.
- **Anatomy top→bottom:**
  1. Header row: back arrow, title “Your Cart”, trash/delete icon top-right.
  2. Line-item rows ×4, each: square rounded photo thumb; name (“Margherita Pizza”, “Chicken Burger”, “French Fries”, “Coke (500ml)”); price under name (“$8.99”, “$6.99”, “$3.49”, “$1.99”); quantity stepper right-aligned on the row's vertical centre: “−  1  +” (minus, count, plus, plain text/glyphs, no boxed stepper background).
  3. Promo row: pale-green/peach tinted rounded row, tag icon, “Add promo code” bold + “Get up to 20% OFF” small, chevron right.
  4. Totals block, label left / amount right, regular weight: “Subtotal $21.46”, “Delivery Fee $2.00”.
  5. Total row, bold both sides: “Total $23.46”.
  6. Bottom CTA.
- **Components:** cart line rows, inline quantity stepper, promo disclosure row, totals table (2+1 rows), primary pill CTA.
- **CTA style/placement:** Full-width orange pill, bottom, “Proceed to Checkout →”. Not in a separate sticky bar with a price — price lives in the totals block above it.
- **States shown:** All quantities = 1; promo not yet applied (row is an invitation, not an applied discount line).
- **Engine mapping:** Bag/cart (exact) + radio-row checkout precursor. Promo-as-disclosure-row (not an input field) is the notable form.

### 5. Track Order — live delivery tracking
- **Purpose:** Post-order status: map progress, step timeline, rider contact.
- **Anatomy top→bottom:**
  1. Header row: back arrow + title “Track Order”. No trailing action.
  2. Map card (rounded, light map): route line in green from rider/scooter icon (left) to home pin (right), green pill callout on the route “Arriving in / 12 min”.
  3. Vertical timeline, 4 steps, dot + connecting line left, text right:
     - “Order Confirmed” — “10:24 AM” — “Your order has been confirmed.” (completed, filled green dot)
     - “Preparing Your Food” — “10:32 AM” — “Our chef is preparing your food.” (completed/current, filled green dot)
     - “Out for Delivery” — “10:45 AM” — “Your food is on the way!” (upcoming, hollow dot)
     - “Delivered” — “Soon” — “Enjoy your meal!” (upcoming, hollow dot)
  4. Rider card at bottom (white, separated by space): circular rider avatar, “Rider is on the way” bold, rider name “Ali Raza” + “★ 4.8” beneath (small text; name legible in crop), phone icon button and chat/message icon button right (green-tinted icon buttons).
- **Components:** map card with ETA pill, vertical order tracker (timeline), contact card with icon actions.
- **CTA style/placement:** No primary CTA; actions are the two small icon buttons (call, message) in the rider card.
- **States shown:** Step 2 of 4 in progress; delivered not reached.
- **Engine mapping:** Tracker (exact — order timeline + map + contact card). Map-with-live-route-and-ETA-callout = tracker variant; engine tracker covers timeline, map card is the extension to note.

### 6. Favorites — saved restaurants
- **Purpose:** Saved places/dishes, switchable by a two-option segment.
- **Anatomy top→bottom:**
  1. Header row: back arrow + title “Favorites”. No trailing action, no tab bar at top.
  2. Segmented pill control, two options in a light track: “Restaurants” (selected — white/orange-outlined pill, orange text), “Dishes” (unselected, grey text).
  3. Favourite rows ×4, each: square rounded photo thumb; name bold (“The Burger House”, “Pizza Planet”, “Sushi World”, “Sweet Treats”); meta line (“Burgers • Fast Food”, “Pizza • Italian”, “Asian • Japanese”, “Desserts • Bakery”); rating line (“★ 4.6 (2.3k)”, “★ 4.5 (1.8k)”, “★ 4.7 (1.2k)”, “★ 4.8 (980)”); heart icon right-aligned — filled orange on the first two rows, outline/grey on the last two (mixed states, see below).
  4. Bottom tab bar (Home selected in orange, although this is the Favorites screen — i.e. Favorites is a stack screen over Home, or the board re-uses the home shell; stated as shown).
- **Components:** segmented control, saved-item list rows, favourite toggle.
- **CTA style/placement:** None; rows are the navigation.
- **States shown:** “Restaurants” segment selected. Heart states mixed: rows 1–2 filled, rows 3–4 outline — at board resolution this reads as favourited vs not, which is inconsistent for a Favorites list; more likely the board shows toggle states. Recorded as shown, not rationalised.
- **Engine mapping:** Wishlist/favourites list — resembles product/restaurant list rows + segmented filter. Two-option segmented pill at top of a list = **partial** (engine filter-chips cover filtering, a binary segmented track is a different component).

### 7. Profile — account home
- **Purpose:** Identity, membership, and account destinations.
- **Anatomy top→bottom:**
  1. Top row: spacer / settings gear icon top-right only (no back arrow, no “Profile” title — identity is the header).
  2. Identity row: circular avatar photo (large), name “Ayesha Khan” bold, email “ayesha.khan@gmail.com” grey beneath.
  3. Membership row (pale peach tinted rounded card): crown icon in a small tinted square, “Foodie Plus” bold + “You're a member!” small, chevron right.
  4. Menu rows ×6, each: stroke icon in no container (plain), label, chevron right, generous vertical padding, separated by space/hairlines: “My Orders”, “Addresses”, “Payment Methods”, “Notifications”, “Help & Support”, “Settings”.
  5. Bottom tab bar, Profile selected (orange).
- **Components:** profile identity header, membership/status card, profile rows (icon + label + chevron list).
- **CTA style/placement:** None; membership row is the only promoted row (tint distinguishes it from plain rows).
- **States shown:** Member state (membership row says member, not join/upsell).
- **Engine mapping:** Profile rows (exact) + wallet/membership card analogue (tinted status card at top of profile). Fully covered.

### 8. Explore / Trending — browse + all categories
- **Purpose:** Search-led browsing: trending dishes, complete category grid, delivery promo.
- **Anatomy top→bottom:**
  1. Header row: back arrow + pill search field (“Search for food, restaurants...”) filling the rest of the row (search is in the header, not below a greeting).
  2. Section header: “Trending Right Now” + “See All ›”.
  3. Dish card row, 2 cards: photo top, name (“Chicken Biryani”, “Pasta Alfredo”), price + rating on one line (“$7.99  ★ 4.7”, “$8.49  ★ 4.5”).
  4. Section title: “All Categories”.
  5. Category medallion grid, 2 rows × 4: Burgers, Pizza, Asian, Desserts / Healthy, Seafood, Drinks, More — circular medallions with coloured icons, label below; last cell “More” uses a “•••” medallion (overflow category is a cell, not a link).
  6. Promo banner (pale green tint): headline “Fast Delivery / Hot & Fresh”, small copy “Your favorite food, / right at your doorstep.”, scooter-rider illustration right.
  7. Bottom tab bar, Explore selected (orange).
- **Components:** header search, product cards (compact price+rating variant), medallion grid (not rail), illustrated promo banner.
- **CTA style/placement:** No button CTA; banner has no button (illustration + copy only) — contrast with Home promo which has “Order Now”.
- **States shown:** Explore tab selected.
- **Engine mapping:** Greeting-home sibling / browse page + medallion rail recast as medallion **grid** + product card. Medallion grid (2-row, with “More” overflow cell) = variant worth naming; otherwise covered.

---

## Pattern census — board-pizza-food

Counts are screen occurrences across the 8 screens (a pattern used twice on one screen counts once per screen, except rows/cards where the instance count is given).

| Pattern | Screens | Instances / notes |
|---|---|---|
| Bottom tab bar (4 tabs) | 4 | Home, Favorites, Profile, Explore |
| Back-arrow stack header | 5 | Restaurant, Cart, Track, Favorites, Explore |
| Primary pill CTA (full-width, bottom) | 2 | Welcome, Cart |
| Pill search field | 2 | Home (below header), Explore (inside header) |
| Promo banner | 2 | Home (photo, with button), Explore (illustrated, no button) |
| Medallion rail / grid | 2 | Home = rail (4), Explore = grid (8 incl. “More”) |
| Restaurant / dish card (photo + name + meta + rating) | 3 | Home rail, Explore trending, (menu rows are a different pattern) |
| List rows with photo thumb + name + meta + rating | 2 | Favorites (4 rows), Restaurant menu (3 rows, + add button instead of heart) |
| Circular “+” add button | 1 | Restaurant menu, ×3 |
| Quantity stepper (− n +) inline | 1 | Cart, ×4 rows |
| Totals block (label/amount rows + bold total) | 1 | Cart |
| Promo / membership tinted disclosure row | 2 | Cart promo row, Profile membership row |
| Profile rows (icon + label + chevron) | 1 | Profile, ×6 rows |
| Vertical order tracker / timeline | 1 | Track Order, 4 steps |
| Map card with route + ETA pill | 1 | Track Order |
| Contact card (avatar + call/chat icons) | 1 | Track Order rider card |
| Segmented control (2-option) | 1 | Favorites Restaurants/Dishes |
| Text tab strip (Menu/Reviews/Info) | 1 | Restaurant detail |
| Full-bleed photo hero / onboarding | 1 | Welcome; restaurant hero is a partial (band) version on 1 more screen |
| Favourite heart toggle | 2 | Restaurant hero, Favorites rows |

**Top patterns (by screen spread):** back-arrow stack header (5), bottom tab bar (4), photo-thumb list/card rows (3+), pill search (2), promo banner (2), medallions (2), tinted disclosure row (2).

**MISSING / partial in engine terms (from this board alone):**
- Tabs *inside* a detail page (Menu / Reviews / Info) — §3.
- Binary segmented pill track as a list switcher — §6 (distinct from filter chips).
- Full-bleed photo onboarding with headline over photo and no bottom sheet — §1 variant.
- Medallion **grid** with an overflow “More” medallion cell — §8 variant.
