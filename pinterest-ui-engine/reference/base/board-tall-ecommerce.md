# Board Decode — Tall E-Commerce UI Kit, Purple/White (board-tall-ecommerce)

- Source file: `bdd78e68405c543c04172ccac3af52741a3929b31e4b8a9e44b74c68b1115d64.jpg` (736×6370)
- Board title: “E-Commerce / Mobile App UI/UX Design”, brand at top and foot: **“e commerce”** (lowercase e in a purple teardrop/circle mark).
- Panels: **35 panels** in a staggered 3-column waterfall (columns are offset; several panels are double- or triple-height long-scroll screens). Reading order below follows the kit's user journey (splash → onboarding → auth → home → product → cart/checkout → search/filter → chat → orders → profile), which is also the board's top-to-bottom order within each column.
- Distinct inventory entries: **33** — “My Order” is printed as 3 panels (Active / Completed / Cancelled) and is inventoried as one screen (§28) with 3 states; the two success modals (§11, §21) sit on top of other screens but have their own anatomy and are counted separately. Splash (§1) is separate from onboarding.
- Legibility: This is the lowest-resolution board relative to screen size. After slicing the board into 7 enlarged horizontal bands, all headlines, section titles, labels, prices and CTA copy below were readable. Body copy is lorem ipsum throughout the kit (by design, quoted as “Lorem ipsum…”). Fine meta under product names (Size/Qty/Category) is legible in most rows and marked “(small)” where read from crop. **Review body text, notification body text and chat bubbles are lorem ipsum and are not transcribed beyond that fact. No screen was wholly illegible; none is reduced to “inferred type only.”**

## Board header

- **App name / domain:** “e commerce” — general-store e-commerce (Clothing, Medicine, Beauty, Baby + Electronics, Home Appliances, Footwear, Accessories all appear as real categories/products). Named user example: “Owen Levi” (profile; email as printed on the Profile screen).
- **Palette (approximate, from flat UI fields):**
  - Primary indigo/violet-blue: ~`#4136D6`–`#463EDA` (buttons, selected chips, icons, logo)
  - Primary tint (icon circles, unselected illustration accents): pale lavender ~`#E9E7FB`–`#DCD9F7`
  - Page ground: white ~`#FFFFFF`; board ground light grey-lavender ~`#F3F3F8`, foot of board washes to lavender gradient
  - Card / field ground: very light grey ~`#F5F5F7`–`#F7F7F9`
  - Ink: ~`#17171C`; muted grey text: ~`#9B9BA4`
  - Star gold: ~`#FFB020`
  - Destructive / swipe-delete: pale red ground ~`#FFE9E9` with red trash icon
  - Success uses the **same primary indigo** (large check circle), not green — no green anywhere in the kit except product photography.
  - Visa/Mastercard-style card visual (§19) is primary-indigo with translucent circles and a red/yellow Mastercard mark.
- **Type roles:**
  - Display (board only, not in-app): extra-bold blue sans “E-Commerce” + regular black subtitle.
  - In-app headline: bold sans, centred on auth/utility screens (“Sign Up”, “Forgot Password”, “Enter Your OTP”), left-aligned in commerce sections (“Just For You”, “Category”, “Order List”). Screen titles in the app bar are small-medium centred text (“Product Details”, “My Cart”, “Checkout”), much quieter than in the other two boards.
  - Body: regular sans; lorem ipsum placeholder everywhere body copy is needed.
  - Meta: grey small sans, structured as stacked micro-lines under product names — “Size: 40 | Qty: 1” / category — consistently 2 micro-lines per commerce row.
  - Price: bold ink, left-aligned under meta in rows/grid; never in the accent colour (contrast board-orange-food, where price is orange).
- **Shape language:**
  - Buttons: **rounded-rectangle, not pills** — radius ~8–10px, full content width, solid indigo, white centred text. This is the board's most distinctive divergence from the two food boards.
  - Small action buttons (Track Order, Leave Review, Re-Order, Invite, Details, Apply, Buy Now): same indigo rounded-rect, compact, right-aligned in rows or inline.
  - Fields: rounded-rect (~8px) light-grey filled, no outline, no leading icon except search (magnifier) and review/message composers (pencil / emoji); password fields carry a trailing eye icon.
  - Cards: rounded-rect ~12px light-grey ground, product photo centred on the grey (not full-bleed to card edges — photos sit *in* the card with padding, except home promo + product hero).
  - Circular elements are reserved for: icon medallions in profile/settings/category (lavender circle + indigo glyph), OTP-adjacent elements, the round “→” next button and dot loading spinner on onboarding/splash, avatars, and the large check circle in success modals.
  - Chips: small rounded-rect (~6px), light grey; selected = solid indigo, white text. Not pills.
  - Radio rows: light-grey rounded-rect row, indigo icon circle left, title + one grey line, radio circle right (filled indigo dot when selected).
- **Density character:** Systematically denser and more uniform than the food boards: a complete UI kit, not a hero flow. Almost every commerce screen is a repeat of grey cards/rows on white with one indigo CTA at the bottom. Long screens exist (Home, Product Details, Checkout, Track Order) and are printed at full scroll length. Whitespace is even/functional rather than editorial; no full-bleed photo screens after onboarding.
- **Nav model:**
  - App level: 5-tab bottom bar — Home, Wishlist, Cart, Chat, Profile — icon + micro-label, selected indigo, others grey. Floating/rounded bar inset from screen edges on Wishlist/Cart/Inbox/Profile; Home's bar is at the foot of its long panel.
  - Stack level: circular light-grey back-button (← in a circle) top-left + centred small title on almost every non-tab screen; trailing action only where functional (heart on Product Details).
  - Tabs inside screens: underline text tabs for My Order (Active/Completed/Cancelled) and filter chips for Home (All/Popular/Newest/Most Sell *[sic]*) — no segmented pills.
  - Modals: centred white card over a dimmed underlying screen, used twice, both for success (§§11, 21).

---

## Screen inventory

### 1. Splash / loading
- **Anatomy top→bottom:** White screen; centred logo mid-height (“e” mark in indigo teardrop-circle + “commerce” in bold black lowercase); near bottom, a circular dot-spinner (indigo dots in a ring, loading indicator). Nothing else — no copy, no CTA, no progress %.
- **Components:** brand lockup, dot-ring loader.
- **CTA:** None. **States:** Loading only.
- **Engine mapping:** Splash/loading — **MISSING as a named pattern** in the listed set (onboarding starts after this).

### 2. Onboarding 1 — “Endless Choices, Easy & Quick Purchases”
- **Anatomy:** Illustration top ~55% (figure beside an oversized phone showing a card/payment screen, coins/wallet props); white sheet with rounded top corners over the bottom; headline (2 lines, bold, left-of-centre as printed — centred block); lorem sub-copy (3 lines, grey); bottom row: “Skip” text left, dot pager centre (pill-shaped active dot + 2 small dots), circular indigo “→” button right.
- **CTA:** Round arrow button bottom-right; Skip is a text button. **States:** Page 1 of 3 (first dot active).
- **Engine mapping:** Onboarding — illustrated-sheet variant (white sheet overlaps illustration zone).

### 3. Onboarding 2 — “Dive Into A Hassle-Free Shopping Experience”
- **Anatomy:** Same template as §2. Illustration: figure interacting with oversized phone/list, gear icons around. Headline + lorem copy in sheet. Bottom row identical (Skip / dots, 2nd active / round →).
- **CTA/States:** As §2, page 2 of 3.
- **Engine mapping:** Onboarding (same template).

### 4. Onboarding 3 — “Find All You Need Online, Explore & Easy”
- **Anatomy:** Same template. Illustration: figure browsing oversized product cards with magnifier, plant prop. Sheet headline + lorem. Bottom row Skip / dots (3rd active) / round →.
- **CTA/States:** As §2, page 3 of 3 in dot terms — but a fourth onboarding panel follows (§5), so dots under-count the actual panel count (kit inconsistency, as shown).
- **Engine mapping:** Onboarding (same template).

### 5. Onboarding 4 / terminal — “Dive Into A World Of Convenience”
- **Anatomy:** Same illustration+sheet template (figure seated beside oversized payments phone, plant). Difference in the sheet's footer: dot pager and Skip/arrow are **replaced by two side-by-side buttons**: solid indigo “Sign Up” (left) + light-grey “Sign In” (right).
- **CTA:** Dual auth entry, equal width, Sign Up primary. **States:** Terminal page.
- **Engine mapping:** Onboarding terminal / auth gateway (variant of board-orange-food §5, but buttons are rounded-rects and sit in the onboarding sheet).

### 6. Sign Up
- **Anatomy top→bottom:** Circular back button; centred title “Sign Up”; centred lorem line (2 lines); field “Full Name”; field “Email Address”; field “Password” with trailing eye icon; checkbox row (empty square checkbox + “I agree to the terms & conditions”); solid CTA “Sign Up”; divider “— Or —”; two square-ish social buttons side by side (Google “G”, Facebook “f”, each on light ground); footer centred “Already Have An Account? Sign In” (Sign In in indigo).
- **Components:** filled rounded-rect fields ×3, terms checkbox, primary CTA, social buttons ×2, footer switch link.
- **CTA:** Full-width indigo rounded-rect under the form.
- **States:** Empty, terms unchecked.
- **Engine mapping:** Auth (sign-up). Checkbox-terms row + paired social **buttons** (not circles) are the variants.

### 7. Sign In
- **Anatomy:** Circular back; centred “Sign In” + lorem line; field “Email Address”; field “Password” + eye; right-aligned small indigo link “Forgot Password”; CTA “Sign In”; “— Or —” divider; Google + Facebook buttons; footer “Don't Have An Account? Sign Up”.
- **Components:** As §6 minus checkbox/name field. **CTA:** Full-width indigo.
- **States:** Empty only (no filled variant panel in this kit).
- **Engine mapping:** Auth (sign-in).

### 8. Forgot Password
- **Anatomy:** Circular back; centred “Forgot Password” + lorem line; single field “Email Address”; CTA “Send Code”; large empty space; footer centred “Go Back To Sign In”.
- **Components:** Single-field recovery form. **CTA:** Indigo “Send Code”.
- **States:** Empty. Recovery is by **email** here (contrast orange board: by phone).
- **Engine mapping:** Auth — recovery step 1.

### 9. Enter Your OTP
- **Anatomy top→bottom:** Circular back; centred “Enter Your OTP” + lorem line; **4 segmented OTP boxes** in a row (light grey squares; values as shown: “3”, “3”, third box active with text cursor, fourth empty); centred small text “Resend Code In 20 Sec”; CTA “Verify”; bottom ~35% is the **system numeric keypad with an autofill banner above it (“From Messages / 3340”)** — the suggested code in the banner does not match the digits typed (kit detail, as shown).
- **Components:** segmented OTP input, resend timer text, primary CTA, OS keypad + autofill state.
- **CTA:** Indigo “Verify” above keypad.
- **States:** Partially entered (2 of 4), timer counting, keyboard/autofill open.
- **Engine mapping:** Auth — OTP step, **segmented-box variant** (contrast orange board §9 single field).

### 10. Reset Password
- **Anatomy:** Circular back; centred “Reset Password” + lorem line; field “New Password” + eye; field “Confirm Password” + eye; CTA “Reset Password”. Rest of screen empty.
- **Components:** 2 password fields, primary CTA. **States:** Empty.
- **Engine mapping:** Auth — recovery step 3 (set new password).

### 11. Reset success — modal over Reset Password
- **Anatomy:** Underlying Reset Password screen dimmed to dark grey (title/fields ghosted). Centred white modal card (rounded ~16px): large indigo circle with white check; headline “New Password Set / Successfully!” (2 lines, bold, centred); lorem line centred; indigo button “Go To Home” inside the card.
- **Components:** success modal (scrim + card + check medallion + single button).
- **CTA:** Inside modal only; underlying screen inert.
- **States:** Success state of §10.
- **Engine mapping:** Success / confirmation modal — **MISSING as a named pattern**; recurs at §21 (payment), so it is a kit-level pattern, not a one-off.

### 12. Home / discovery — long screen
- **Purpose:** Storefront home. Printed at full scroll length (tallest commerce panel alongside §13).
- **Anatomy top→bottom:**
  1. Header row: location left — indigo pin + “New York, USA ⌄” (small bold); circular bell icon button right.
  2. Search row: pill/grey search field “Search” (magnifier inside) + square indigo filter/sliders button right.
  3. Promo banner (indigo, rounded): “NEW COLLECTIONS / 2024” white bold, small white pill button “Buy Now”, photo of a shopper with bags right; dot pager under banner (3 dots, one active pill-dot).
  4. Section header: “Category” + “See All” (indigo, right).
  5. Category medallion row ×4: lavender/grey circle with indigo glyph + label below — Clothing, Medicine, Beauty, Baby.
  6. Section header: “Just For You”.
  7. Filter chip row: **All (selected, solid indigo)**, Popular, Newest, Most Sell [sic].
  8. Product grid 2×2 (grey cards, photo centred with padding, name, 2 micro-meta lines (small), price bold + small heart icon right): “Earbuds” $70.00; “Logitech Headp…” $82.99; “Electric Fan” $17.00; “Black Jacket” $29.00.
  9. Section header: “Invite Friend” + “See All”.
  10. Referral card rail (horizontal, 2nd card cut off): illustration, title “Invite On Ride” [sic, as printed], 2-line share copy, “Share this code” label, code field showing “N2X1Y” with copy icon, two buttons: grey “Invite” + indigo “Details”.
  11. Bottom tab bar (Home selected): Home, Wishlist, Cart, Chat, Profile.
- **Components:** location header, search+filter-button row, promo banner with pager, medallion rail, filter chips, 2-col product grid, referral cards, 5-tab bar.
- **CTA:** Distributed: “Buy Now” in banner, “Details” in referral card; no page CTA.
- **States:** Chip “All” selected; Home tab selected; banner page 1.
- **Engine mapping:** Greeting home (location variant, no person greeting) + promo banner + medallion rail + filter chips + product card grid + **referral/invite card — MISSING as a named pattern**.

### 13. Product Details — long screen
- **Purpose:** Single product with variants, reviews, sticky buy bar. Printed at full scroll length.
- **Anatomy top→bottom:**
  1. Header: circular back button; centred title “Product Details”; heart icon button right in a light circle (filled indigo heart = favourited state).
  2. Hero: large product photo (Black T-Shirt) centred on white/light ground; image pager dots below (3 dots, active = indigo pill-dot).
  3. Title row: “Black T-Shirt” bold + right-aligned star “★ 5.x” (rating digit partly cropped at column edge in the board; read as 5-point-something, exact decimal **illegible at board resolution**).
  4. Category micro-line: “Clothing”.
  5. Section: “About Product” + lorem paragraph ending “…Read more” (Read more in indigo).
  6. Section: “Choose Color” + chip row: White, **Black (selected, solid indigo)**, Blue, Red.
  7. Section: “Select Size” + chip row: **S (selected)**, M, L, XL, XXL.
  8. Section: “Ratings & Reviews” + lorem line.
  9. Rating summary block: large “4.5”, star row (4.5 stars gold), “(107 Reviews)” left; right = 5-row histogram (5,4,3,2,1 with indigo progress bars, descending lengths).
  10. “Write A Review” row (pencil icon + grey text, tappable row/field).
  11. Review cards ×2: avatar, name (“Thomas Alva”, “Kyle Martin”), time (“1 hour ago”, “2 hours ago”), star + “4.7” right, lorem body (2 lines), like/dislike icon row (indigo thumbs-up filled on first, grey thumbs-down).
  12. Sticky bottom bar: left “Total Price / $15.99”; right indigo button “Add To Cart”.
- **Components:** hero + pager, option chip groups ×2 (colour/size), rating histogram, review cards, sticky price+CTA bar.
- **CTA:** “Add To Cart” — half-width indigo button in a sticky bottom bar beside the total (not full-width).
- **States:** Favourited; Black + Size S selected; 4.5 aggregate.
- **Engine mapping:** Detail sheet/page (exact, long-form variant) + **ratings histogram + review cards — MISSING as named patterns**; variant option chips correspond to engine option/radio patterns but as chips, not rows.

### 14. Wishlist
- **Anatomy:** Header: circular back, centred “Wishlist”. 2-col product grid ×4 cards (same card as Home §12: photo, name, Size/Qty+Category micro-lines, price + **filled indigo heart** right): Black Jacket $29.00, Black T-Shirt $15.99, Electric Fan $17.00, Nail Polish $07.00 [price as printed]. Bottom tab bar (Wishlist selected).
- **Components:** product card grid (favourited state), 5-tab bar.
- **CTA:** None. **States:** All 4 items favourited.
- **Engine mapping:** Wishlist / favourites grid — product card reuse; grid form of board-pizza-food §6 list form.

### 15. My Cart
- **Anatomy top→bottom:**
  1. Header: circular back, centred “My Cart”.
  2. Cart rows (grey cards): thumb left (padded photo); name; “Size: 40 | Qty: 1” + category micro-lines; price bold; stepper right-bottom: “−  1” + circular indigo “+” button. Rows: Black Jacket $29.00; Black T-Shirt $15.99; Sneakers $84.96; Logitech Headphone $82.99.
  3. One row (Sneakers) is shown **swiped**: a pale-red delete panel with red trash icon is revealed at the row's right edge.
  4. Promo row: grey field “Promo Code” + compact indigo “Apply” button right (inside/overlapping the field row).
  5. Totals card (grey): “Total Items 04”, “Amount $212.94”, “Delivery Charge $10.00”, “Promo −$42.61”, divider, “Total Amount $180.32” (amounts right-aligned).
  6. CTA: full-width indigo “Checkout”.
  7. Bottom tab bar (Cart selected).
- **Components:** cart rows with stepper, swipe-to-delete state, promo input+apply, totals card.
- **CTA:** “Checkout” full-width above the tab bar.
- **States:** Swipe-delete revealed on 1 row; promo already reflected in totals.
- **Engine mapping:** Bag/cart (exact) + **swipe-to-delete row state — MISSING/variant** (other boards use a header trash icon, not swipe).

### 16. Checkout — review & choose (long-ish screen)
- **Anatomy top→bottom:**
  1. Header: circular back, centred “Checkout”.
  2. Section: “Order List”. Rows ×3 (same cart-row anatomy, steppers present): Black Jacket $29.00, Black T-Shirt $15.99, Logitech Headphone $82.99.
  3. Section: “Shipping Address”. Single selector row (grey card): indigo home icon circle, “Home” bold + lorem line, chevron right.
  4. Section: “Payment Method”. Selector row: indigo cash icon circle, “Cash On Delivery” + lorem line, chevron right.
  5. Section: “Shipping Type”. Selector row: indigo icon circle, “Standard” + lorem line, chevron right.
  6. Totals card: Total Items 03, Amount $127.98, Delivery Charge $10.00, Promo −$42.61, Total Amount $95.96.
  7. CTA: full-width indigo “Continue To Payment”.
  - No bottom tab bar (checkout is a stack flow).
- **Components:** order rows, three chevron selector rows (each opens §§17/18/20), totals card.
- **CTA:** “Continue To Payment”, bottom.
- **States:** All three selectors show a chosen value.
- **Engine mapping:** Radio-row checkout (summary form) — the actual radio choices live on the three linked screens below.

### 17. Shipping Address — choose address
- **Anatomy:** Header: circular back, centred title “Shipping Address”. Body section title “Shipping Address” (title repeated in body — kit quirk, as shown). Radio rows ×3 (grey cards, indigo icon circle, title + lorem line, radio right): “Home” (**selected, filled radio**), “Office”, “Friends House”. Dashed/grey “+ Add New Address” row (full-width light button). Large empty space. Bottom CTA “Continue”.
- **Components:** radio rows ×3, add-new row, primary CTA.
- **CTA:** Full-width indigo “Continue” bottom-anchored.
- **States:** Home selected.
- **Engine mapping:** Radio-row checkout (address variant) — exact.

### 18. Payment Method — choose payment
- **Anatomy:** Header: back, centred “Payment Method”. Body title “Payment Option”. Radio rows ×3: “Cash On Delivery” (**selected**), “Mastercard”, “Discover” — each with indigo brand/cash icon circle + lorem line + radio. “+ Add New Card” light row (opens §19). Bottom CTA “Continue”.
- **Components:** radio rows, add-card entry row.
- **CTA:** Full-width “Continue”. **States:** Cash On Delivery selected.
- **Engine mapping:** Radio-row checkout (payment variant) + wallet-adjacent; exact.

### 19. Add Card
- **Anatomy top→bottom:**
  1. Header: back, centred “Add Card”.
  2. **Visual credit card** (indigo gradient/rounded ~16px, translucent circles): “A Bank” top-left, Mastercard mark top-right, number “7986 •••• •••• 6985” large, bottom row: “CARD HOLDER / LOUIS ANDERSON” left, “VALID THRU / 08/21” right. (Name/number copied exactly as printed on the board.)
  3. Field: “Card Holder Name”. Field: “Card Number”. Half-width field pair: “Expiry Date” | “CVV”.
  4. Bottom CTA: “Add Card”.
- **Components:** rendered card preview, card form (2 full + 2 half fields).
- **CTA:** Full-width indigo bottom.
- **States:** Card preview populated; form fields empty (placeholders = labels).
- **Engine mapping:** Wallet / card form — **visual card preview that mirrors entry = MISSING as a named component**; form itself is standard auth-style fields.

### 20. Choose Shipping — shipping type
- **Anatomy:** Header: back, centred “Choose Shipping”. Body title “Shipping Type”. Radio rows ×3: “Standard” (**selected**), “Click & Collect”, “Same-Day Delivery” (icon circles: truck/box variants, lorem line each). Bottom CTA “Continue”.
- **Components:** radio rows ×3.
- **CTA:** Full-width “Continue”. **States:** Standard selected.
- **Engine mapping:** Radio-row checkout (shipping variant) — exact; third instance of the radio-row screen template (§§17, 18, 20).

### 21. Payment Successfully — modal over Checkout
- **Anatomy:** Underlying Checkout screen dimmed (Order List title + totals + “Continue To Payment” ghosted). Centred white modal: large indigo check circle; “Payment / Successfully !” headline (as printed, with space before !); lorem line; indigo button “Okey” [sic, as printed].
- **Components:** success modal (same template as §11).
- **CTA:** Modal button dismisses. **States:** Post-payment success.
- **Engine mapping:** Success modal (see §11 — recurring pattern, 2 instances).

### 22. E-Receipt
- **Anatomy top→bottom:** Header: back, centred “E-Receipt”. Barcode card (grey card, large black barcode). Totals card: Total Items 03, Amount $127.98, Delivery Charge $10.00, Promo −$42.61, Total Amount $95.36 [totals differ by $0.60 from §16 as printed — kit inconsistency, recorded as shown]. Meta card: “Date — 02 Apr, 2024, 01:12 AM”, “Order ID — SMT53237653”, “Payment Method — Cash On Delivery”. Bottom CTA: “Download E-Receipt”.
- **Components:** barcode, totals card, meta definition rows.
- **CTA:** Full-width indigo, bottom.
- **States:** Final document state; no share action shown.
- **Engine mapping:** Receipt / order confirmation document — **MISSING as a named pattern** (tracker shows status, not a downloadable receipt with barcode).

### 23. Search — typing / similar matches
- **Anatomy top→bottom:** Header: circular back, centred “Search”. Search row: grey field with magnifier + partial query “Headph…” (text cursor, as shown) + square indigo filter button right. Row: “Similar matches” bold + “Clear All” (indigo, right). Suggestion rows ×7, each term left with the matched keyword bold (“Blue **Headphone**”, “New Arrival **Headphone**”, “A4 Tech **Headphone**”, “Export Quality **Headphone**”, “Red **Headphone**”, “New **Headphone**”, “Best Quality **Headphone**”) + diagonal “↗” arrow right. Bottom: system keyboard open (QWERTY; space bar labelled in German “Leerzeichen” — stock-image keyboard artefact, as shown) with a suggestion strip (“Hello / Hello / Hello”) above it.
- **Components:** search field + filter button, suggestion rows, keyboard state.
- **CTA:** None. **States:** Mid-typing, suggestions shown, keyboard open.
- **Engine mapping:** Search — suggestions state (cf. orange board §12 history state; this kit's search shows **suggestions, no history**).

### 24. Filter — full page
- **Anatomy top→bottom:**
  1. Header: circular back, centred “Filter”.
  2. Group “Category”: chips All, **Clothes (selected)**, Medicine, Beauty (+1 cut off at edge).
  3. Group “Gender”: chips All, **Male (selected)**, Female.
  4. Group “Sort By”: chips All, Popular, **Newest (selected)**, Most Recent.
  5. Group “Available Brand”: chips All, Chanel, Ralph Lauren, **Prada (selected)**.
  6. Group “Price Range”: dual-handle slider (indigo track, two hollow/indigo-ring handles, faint histogram bars behind the track), labels “$50.00” and “$300.00” under handles.
  7. Group “Reviews”: star row (4 gold stars + 1 empty) + “4/5” right.
  8. Bottom action row, two half-width buttons: grey “Reset” + indigo “Apply Filter”.
  - No bottom tab bar.
- **Components:** chip groups ×4, dual range slider with histogram, star-rating selector, dual action row.
- **CTA:** “Apply Filter” (half width, paired with Reset — different from orange board's full-width Apply).
- **States:** Exactly one selected chip per group; price $50–$300; reviews 4/5.
- **Engine mapping:** Filter sheet as a **full page** + range slider (see orange §13 — slider recurs across boards, strengthening the MISSING case).

### 25. Search results — “Result For Headphone”
- **Anatomy:** Header: back, centred “Search”. Search row: field with “Headphone” + “×” clear + indigo filter button. Result header row: “Result For Headphone” bold + right “6,245 Founds” [sic, indigo, small]. 2-col product grid (same grey card as Home): Black Headphone $27.99, RGB Headphone $23.00, Micropack GH-0… $08.05, A4 Tech Headph… $197.00 (+ a third row cut off at panel foot); each card has small heart right of price (one filled indigo).
- **Components:** query field, result-count header, product grid.
- **CTA:** None. **States:** Results loaded; mixed favourite states.
- **Engine mapping:** Search results + product card grid — exact; flat grid (contrast orange board §14 grouped-by-restaurant results).

### 26. Inbox — chat list
- **Anatomy:** Header: back, centred “Inbox”. Search row: grey search field “Search” + indigo filter button. Conversation rows ×6+: circular avatar, name (“Liam Peterson”, “Henry Jack”, “Thomas Alva”, “Zyan Topper”, “Steven March”, “Jason Mile”), lorem preview line (truncated), right column: indigo unread-count circle (2, 1, 1 on the first three; none thereafter) over time “9:31”. Bottom tab bar (Chat selected).
- **Components:** conversation list rows with unread badge, search+filter row.
- **CTA:** None. **States:** First 3 conversations unread.
- **Engine mapping:** Chat / inbox list — **MISSING as a named pattern** in the listed engine set.

### 27. Chat thread — “Liam Peterson”
- **Anatomy:** Header: circular back, centred contact name “Liam Peterson”, vertical-ellipsis icon button right. Message stream: alternating bubbles — indigo bubbles right-aligned with white text + small time/read ticks (“9:31” + double check), light-grey bubbles left-aligned with ink text + time; 4 bubbles fully visible (2 sent, 2 received), lorem text. Bottom composer: grey rounded field (“😊 Type A Message”, microphone icon inside right) + square indigo send button (paper-plane) right.
- **Components:** message bubbles (sent/received), composer with voice + send.
- **CTA:** Send button only. **States:** Read receipts on sent bubbles.
- **Engine mapping:** Chat thread — **MISSING** (pair with §26).

### 28. My Order — one screen, 3 tab panels (Active / Completed / Cancelled)
- **Common anatomy:** Header: circular back, centred “My Order”. Underline tab row: Active | Completed | Cancelled (selected = indigo text + indigo underline). Order rows (grey cards): product thumb, name, micro-meta, price, compact indigo action button bottom-right of the row. No bottom tab bar.
  - **Active panel:** rows Black Jacket $29.00, Black T-Shirt $375.00 [as printed — differs from $15.99 elsewhere, kit inconsistency], Logitech Headphone $82.99; action = **“Track Order”** (opens §29).
  - **Completed panel:** rows Smart Watch $119.00, Nail Polish $07.00, Earbuds $70.00, Electric fan $17.00; action = **“Leave Review”** (opens §30).
  - **Cancelled panel:** rows Leather Bag $47.00, Laptop $715.00, Body Lotion $16.00, Sneakers $84.96 (+1 cut off); action = **“Re-Order”**.
- **Components:** underline tabs, order rows with status-dependent action button.
- **CTA:** Per-row compact button; action label is the state.
- **States:** The tab **is** the state: same rows template, button semantics change per tab.
- **Engine mapping:** Orders list + tracker entry. Tabbed order list with per-status row actions = **partial** (engine tracker covers one order; a status-tabbed order list is a separate pattern).

### 29. Track Order — delivery detail (long screen)
- **Anatomy top→bottom:**
  1. Header: back, centred “Track Order”.
  2. Section: “Delivery Address” + address line “120 Lane San Fransisco, East Falmouth Ma” [sic, as printed].
  3. Map card (rounded, street map, single indigo pin centre).
  4. Order card (grey): “Order #SMT53237652” [order number differs in last digit from §22 receipt, as printed]; vertical timeline ×4 with indigo check dots + connecting line (completed steps filled, upcoming pale): “Order Placed — Expected 12 Sep 2023”, “In Progress — Expected 12 Sep 2023”, “Shipped — Expected 12 Sep 2023”, “Delivered — Expected 12 Sep 2023”.
  5. Section: “Product List”. Rows ×3 (thumb + name + meta + price, no steppers, no buttons): Black Jacket $29.00, Black T-Shirt $15.99, Logitech Headphone $82.99.
- **Components:** address block, map card, vertical tracker, read-only product rows.
- **CTA:** None. **States:** Steps 1–2 checked, 3–4 pending (dot fill as shown).
- **Engine mapping:** Tracker (exact — timeline + map). Map here is a **static pin card**, simpler than pizza board §5 live route.

### 30. Review — write a review
- **Anatomy top→bottom:** Header: back, centred “Review”. Product summary card (grey): Black T-Shirt thumb + name + meta + $15.99. Section: “Add Photo or Video”. Upload card (grey, large): indigo cloud-upload icon in a blob/circle, “Click Here To Upload” grey text. Section: “What Do You Think?” + lorem line. Star selector row: 4 large gold stars filled + 1 empty (4-star selection shown). Review text field (large grey rounded rect, pencil icon + “Write A Review” placeholder). Bottom CTA: “Submit Review”.
- **Components:** product summary card, media upload zone, star rating input, large text area.
- **CTA:** Full-width indigo bottom. **States:** 4 stars selected, no photo added, text empty.
- **Engine mapping:** Review / rating form — **MISSING as a named pattern** (engine detail shows reviews; *writing* one — upload + stars + text — is not in the listed set).

### 31. Profile — “Owen Levi”
- **Anatomy top→bottom:** Header: back, centred “Profile”. Identity block centred: large circular avatar photo, name “Owen Levi” bold, email below in grey (as printed on the screen). Profile rows ×8 (grey rounded rows, lavender/indigo icon-circle left, label, chevron right): “My Account”, “Payment Method”, “My Order”, “Settings” (opens §33), “Help Center”, “Privacy Policy”, “Invite Friends”, “Sign Out”. Bottom tab bar (Profile selected).
- **Components:** centred identity header, profile rows ×8.
- **CTA:** None (Sign Out is a row, not a button). **States:** Signed-in default.
- **Engine mapping:** Profile rows (exact). Identity is **centred** here vs left-aligned in pizza board §7 — variant worth noting.

### 32. Notification — grouped feed
- **Anatomy:** Header: back, centred “Notification”. Group label “Today”. Notification rows ×2 (grey cards): indigo icon circle, bold title (“Order Confirm Successful!” [sic], “Order Shipped”), lorem 2-line body, small time right (“1h”). Group label “Yesterday”. Rows ×3: “New Product Arrival Alerts”, “Holiday Promotions”, “New Card Added” (same anatomy).
- **Components:** date-grouped notification rows with icon medallions.
- **CTA:** None. **States:** All shown as read (no unread dot/badge visible).
- **Engine mapping:** Notifications feed — **MISSING as a named pattern** (profile has a Notifications *row* in pizza board §7; a grouped feed screen is not in the listed set).

### 33. Settings — sub-list
- **Anatomy:** Header: back, centred “Settings”. Rows ×3 only (same profile-row anatomy: icon circle + label + chevron): “Notification Settings”, “Password Manager”, “Delete Account” (Delete uses the same indigo styling as every other row — **not red**, as shown). Rest of screen empty.
- **Components:** profile/settings rows ×3.
- **CTA:** None. **States:** Default; destructive action un-differentiated.
- **Engine mapping:** Profile rows (settings subset) — exact reuse.

---

## Pattern census — board-tall-ecommerce

Screen occurrences across the 33 entries (My Order counted once; its 3 panels noted).

| Pattern | Screens | Instances / notes |
|---|---|---|
| Full-width indigo rounded-rect CTA | 15 | Sign Up, Sign In, Forgot, OTP, Reset, Home=0 — actually: §§6,7,8,9,10,15,16,17,18,19,20,22,24(half),30 + cart checkout; count = **15 entries incl. §24 half-width** |
| Circular back button + centred title header | 24 | Every stack screen except splash/onboarding |
| Filled grey rounded-rect text field | 8 entries | Auth §§6–10 (9 fields), Add Card §19 (4 fields), Search/Inbox fields §§23,25,26 |
| Bottom tab bar (5 tabs) | 5 | Home, Wishlist, Cart, Inbox, Profile |
| Product card (grey card, padded photo, name, meta, price, heart) | 4 | Home grid ×4, Wishlist ×4, Search results ×4+ — 12+ instances |
| Commerce list row (thumb + name + meta + price) | 6 | Cart ×4, Checkout ×3, My Order ×11 across 3 tabs, Track ×3, Review summary ×1 |
| Radio rows (icon circle + title + lorem + radio) | 3 screens | §§17,18,20 — 3 rows each, 9 instances; the kit's core checkout template |
| Selector rows (chevron, opens a radio screen) | 1 | Checkout §16, ×3 |
| Chip groups (grey chips, 1 indigo selected) | 3 | Product colour+size §13 (2 groups), Filter §24 (4 groups), Home §12 (1 group) |
| Profile rows (icon circle + label + chevron) | 2 | Profile ×8, Settings ×3 |
| Totals card (label/amount rows) | 3 | Cart, Checkout, E-Receipt (+ meta card in §22) |
| Success modal (scrim + check card) | 2 | §§11, 21 |
| Onboarding (illustration + sheet + dots/arrow) | 4 panels | §§2–5 |
| Promo banner | 1 | Home |
| Medallion rail (category circles) | 1 | Home, ×4 |
| Quantity stepper (− n + with indigo +) | 2 | Cart, Checkout order list |
| Promo code field + Apply | 1 | Cart |
| Range slider (dual-handle) | 1 | Filter (with histogram) |
| Star rating (display or input) | 4 | Product summary/histogram, Filter selector, Review input, review cards |
| Review cards / histogram | 1 | Product Details |
| Map card | 1 | Track Order (static pin) |
| Vertical tracker timeline | 1 | Track Order, 4 steps |
| Chat bubbles + composer | 1 | Chat thread; inbox list is §26 |
| Notification rows (grouped) | 1 | §32, ×5 |
| Visual credit card | 1 | Add Card |
| Barcode | 1 | E-Receipt |
| Segmented OTP boxes | 1 | §9 (4 boxes) |
| OS keyboard/keypad open state | 2 | OTP (numeric + autofill), Search (QWERTY) |
| Swipe-to-delete row | 1 | Cart (1 row revealed) |
| Upload zone (photo/video) | 1 | Review |
| Referral / invite card | 1 | Home Invite Friend rail |

**Top 5 patterns:** (1) circular-back + centred-title header — 24 screens; (2) full-width indigo CTA — 15; (3) filled grey fields — 8 entries; (4) commerce list row — 6 screens / 22+ instances; (5) bottom 5-tab bar — 5 screens, tied with product card — 4 screens but 12+ instances.

**MISSING patterns that recur (≥2 screens or kit-level):**
- **Success modal** (§§11, 21 — recurs, same template, two different flows).
- **Chat: inbox list + thread** (§§26, 27 — a two-screen system, absent from the listed engine patterns).
- **Notifications feed, date-grouped** (§32; also foreshadowed by Profile's row).
- **Review-writing form** (§30) and **ratings histogram + review cards** (§13) — the read and write sides of reviews.
- **E-Receipt document with barcode** (§22).
- **Splash/loading** (§1).
- **Visual credit-card preview** (§19), **referral/invite card** (§12), **swipe-to-delete** (§15), **media upload zone** (§30) — single occurrences in this board; listed as MISSING singles, not recurring.
- Recurring cross-board note: the **dual-handle price range slider** appears here (§24) and in board-orange-food (§13) — two independent kits, same component, no named engine pattern.
