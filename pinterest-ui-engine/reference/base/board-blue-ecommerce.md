# Board Decode — Blue E-commerce / Food + Wallet (AIRI)

- **Source:** `301a160ddb364fa3be6add129de812b117332fe6c850a377f9e30889777b2a7e.jpg`
- **Layout:** Tall thin board, 36 distinct screens in 9 rows × 4 columns. Original is 564 × 2503 px, so each screen is ~141 px wide in the file — body copy under headings is frequently illegible at board resolution. Where that is the case it is flagged below; headings, prices, CTA labels and layout were verified on 2× enlarged horizontal bands.
- **App / domain:** "AIRI — Get your food online" — food ordering / recipes + built-in wallet, top-up, cards and delivery payment. This is not a pure shop: roughly one third of the board is wallet / top-up / payment infrastructure. Prices in USD ($). Recurring dish names: Kue Dadar Mandala / Telur, Vegetable Salad, Juicy Lucy Burger, Nasi Lemak.
- **Palette (approximate):** Primary royal / cobalt blue `#2E3DBE`–`#3446C8` (full-screen fields, keypads, primary buttons, bottom sheet); darker blue text/header variant `#26339E`; accent mustard-orange `#F5A623`–`#F7B733` (icon squares, selected chips, secondary cards, highlights); ground white `#FFFFFF`; field / card grey `#F4F5F7`; ink `#1F2430`; muted `#8A8FA3`; pale peach illustration ground `#FBEED3`.
- **Type roles:** Display — bold rounded sans, white, for blue-screen headlines ("Getting all fresh food recipes", "We promise fast delivery", "Top up successfull" [sic in source]). UI — same sans family: screen titles bold ~15px (black on white, white on blue headers), field labels / placeholders small grey with left icon, prices bold with superscript `$`, section heads ("Latest order", "Popular", "Personal Offer", "For You", "Wallets") semibold black. No serif anywhere.
- **Shape language:** Strongest shape system of the four boards: (1) White content sheet with very large top radius (~28px) sliding over a blue header field — repeated on almost every auth / form / detail screen. (2) Full-bleed blue screens for splash, onboarding, numeric keypad, success. (3) Primary CTA is a blue pill (white sheet) or white pill (blue screen), full width, bottom-anchored. (4) Custom numeric keypad is a blue rounded panel with white numerals in a 3-column grid — reused verbatim for phone, OTP and money amount. (5) Small orange rounded-square icon badges (≈28px) mark back / close / section icons. (6) Cards radius ~16px; food photos are circular plates or rounded rectangles.
- **Density character:** Two densities: onboarding/auth are airy (one illustration, one headline, one form chunk); home/explore/wallet screens are dense dashboard-like grids (2×2 action tiles, offer cards, transaction rows) in the same visual language.
- **Nav model:** No conventional persistent tab bar on most screens. Navigation is: orange icon-badge back (top-left) / `×` close (top-right) on flow screens, "Skip" text top-right on onboarding/auth, and on home-type screens a blue bottom bar with 4 icons (delivery/home, search, menu/list, profile) with an orange pill highlighting the active item (visible on Home and Recipe/Explore variants). Checkout-type flows are linear stacks with a single bottom CTA, no tab bar.

---

## Screen inventory

### Row 1 — Splash + Onboarding

#### 1. Splash — AIRI
- **Anatomy top→bottom:** Full blue field → faint outline food icons scattered as pattern (fries top, burger, drink, bread — line art, low contrast) → centred wordmark "AIRI" white bold + tagline "Get your food online" small white → home indicator only.
- **Components:** Brand splash, decorative icon pattern.
- **CTA:** None.
- **Engine mapping:** Onboarding / splash. Pattern present.

#### 2. Onboarding 1 — "Getting all fresh food recipes"
- **Anatomy:** Blue field → `×` close in white square top-right → headline (white, 2 lines) → large illustration in an organic blob oval (chef holding cloche) → subcopy (small white, gist: chef-certified fresh recipes for you — verbatim illegible at board resolution) → bottom pagination "1 · · →" (page dots/numbers + arrow).
- **CTA:** Arrow / pagination advance; close to skip.
- **Engine mapping:** Onboarding carousel page. Present.

#### 3. Onboarding 2 — "We promise fast delivery"
- **Anatomy:** Identical shell to #2 → headline → blob illustration (waiter/courier carrying tray) → subcopy (gist: professional driver, food delivered as promised) → pagination "· 2 · →".
- **Engine mapping:** Onboarding carousel page. Present.

#### 4. Onboarding 3 — "We made payment is easy" [sic] + Get Started
- **Anatomy:** Identical shell → headline → blob illustration (person paying at large card/terminal) → subcopy (gist: supports credit card and PayPal) → **white pill CTA "Get Started"** (the only onboarding screen with a labelled button).
- **Engine mapping:** Onboarding final page. Present.

### Row 2 — Auth

#### 5. Sign In — "Welcome back"
- **Anatomy top→bottom:** Blue header strip: orange badge icon left, centred "Sign in" white → white sheet (large top radius) → "Welcome back" bold + "Enter your credential login" grey small → icon fields: Email, Password (eye icon right) → blue pill CTA "Sign In" → orange text link "Forgot your password" → divider "or" → outlined/white buttons: "Create an account", "Sign in with Google" (G icon).
- **Components:** Auth form (icon fields), social sign-in button.
- **CTA:** Blue pill "Sign In".
- **Engine mapping:** Auth — matches existing auth pattern.

#### 6. Sign Up — "Registration"
- **Anatomy:** Blue header "Sign up" → white sheet → "Registration" + "Fill your account detail" → fields: First name, Last name, Email, Password (each icon-left, light grey field) → checked orange checkbox row "I agree to the Airi Terms…" (rest illegible) → blue pill "Sign up" → "Sign up with Google" white button.
- **Engine mapping:** Auth (registration variant, with terms checkbox). Present.

#### 7. Forgot Password
- **Anatomy:** Blue header (title area cut in board crop — screen purpose from heading) → white sheet → "Forgot password?" bold + "Enter your email address to reset your password instruction" grey → single Email field → blue pill "Send link" → small orange centred link below (gist: alternative account-recovery route — verbatim illegible).
- **Engine mapping:** Auth — password-reset variant. Present as auth sub-flow; no dedicated engine pattern named for reset, map to auth.

#### 8. Register Phone — numeric keypad entry
- **Anatomy:** Blue header: orange badge, "Skip" top-right → white sheet top part → "Register phone" bold + "Enter your mobile number to enable 2-step verification" → phone field with flag icon: "+62 85-747-015-554" (number as printed; country Indonesia +62) → below the sheet, a **full blue numeric keypad panel** (1–9, 0, delete) → outlined/transparent pill "Continue" on blue.
- **Components:** Phone field, custom keypad.
- **CTA:** "Continue" ghost pill on blue.
- **Engine mapping:** **MISSING** — custom in-app numeric keypad for phone/amount/OTP is not in the listed engine patterns (auth covers the form, not the keypad).

### Row 3 — Verification, Permission, Home, Explore

#### 9. Phone Verification — OTP + keypad
- **Anatomy:** Blue header with orange badge + orange `×` → white sheet → "Phone verification" bold + "Enter your otp code here" (with small icon) → OTP boxes row: 4 boxes, first values visible ("3", second box filled blue with a digit — individual digits illegible), others empty white boxes with outline → blue keypad panel (same as #8) → white pill CTA "Next".
- **Components:** OTP boxes, custom keypad.
- **CTA:** White pill "Next".
- **Engine mapping:** Auth OTP — form maps to auth, keypad again **MISSING** as a component.

#### 10. Notification Permission
- **Anatomy:** Full-ish blue screen (white top strip with orange `×`) → centred illustration (hand holding phone in front of a notification card with check) in a blob → title "Notification" white bold centred → subcopy "Stay notified about new food, updates, menu and recipes." centred small white → white pill "Allow Notification" → outlined pill "Don't Allow".
- **Components:** Permission priming screen, dual accept/decline pills.
- **CTA:** White pill primary, ghost pill secondary.
- **Engine mapping:** **MISSING** — permission-priming screen is not a listed engine pattern (closest is onboarding, which is marketing, not a system-permission ask).

#### 11. Home — "Hi, Jack!"
- **Anatomy top→bottom:** White ground → header: small avatar left, orange badge/notification icon right → "Hi, Jack!" (Jack in orange) + "Get ready to breakfast!" grey → 2×2 tile grid: large **blue tile "Delivery"** with McDonald's "M" and "Update at 17:17" + camera/scan icon; white tile "Recent / 56 Items"; white tile "Dine in / 10 Book"; white tile "Explore / 4 Near" (chips/labels small, counts legible, descriptors partially legible) → section "Personal Offer / See all >" → offer card: brand logo left ("BR…" burger brand, small), "Discount up to 20%" bold + "4 Days Remaining" orange small → blue bottom bar: orange pill active (delivery icon), search, list, profile icons.
- **Components:** Greeting header, 2×2 action tile grid, offer card, icon bottom bar.
- **CTA:** Tile taps; no labelled button.
- **Engine mapping:** Greeting home — matches (greeting + avatar), but the 2×2 dashboard tile grid replaces the usual search+promo anatomy. Greeting home variant.

#### 12. Explore — "Top Order"
- **Anatomy:** White ground → header icons (orange badge left, notification + bag right) → "Explore" title + "See all >" orange right → large blue card "Top Order" white title + orange pill "4 Near >" top-right → overlapping white product card: "Kue Dadar Mandala" bold, rating "4.9 ★", stepper/serving row (person icon "1" + `+`), price "$14.99" right, circular pizza/food photo right overlapping card edge, cherry/leaf garnish → "About product" bold + 3-line grey lorem-style copy (verbatim illegible) → bottom row: blue pill "Add to cart" (wide) + orange square favourite/bookmark button with count "43".
- **Components:** Featured-order hero card, overlapping product card, favourite count button.
- **CTA:** Blue pill "Add to cart".
- **Engine mapping:** Greeting home / browse variant + product card. The blue "Top Order" hero with overlapping white card is a composition **variant** not in engine list verbatim.

### Row 4 — Search / Detail variants

#### 13. Search Results / Latest Order list
- **Anatomy:** Header: orange badge, search pill (magnifier + "Tempe…" placeholder — word partially legible) + `×` → section "Latest order / Clear" → list rows (circular food photo, name, price, blue circular `+` button right): Pizza Tomato $11.99, Nasi Goreng $11.99, Salad Buah $23.99 → section "Popular / See all >" → wide photo card "Baked French Toast / Breakfast / $11.99" with bookmark icon.
- **Components:** Search field, order-history list row with quick-add, popular photo card.
- **CTA:** Circular `+` per row.
- **Engine mapping:** Search + product list — resembles filter/list and product card; quick-add history row is a variant.

#### 14. Product Detail A — Telur Dadar Mandalika (photo hero)
- **Anatomy:** Full-width food photo top (fried-egg dish on plate, fork) with orange back badge top-left and bag icon top-right → white sheet overlapping photo → name "Telur Dadar Mandalika" bold + filled red heart right → descriptor "Veg cheese grilled sandwich / vegetable cheese Sandwich Vegetarian" grey (as printed) → serving stepper + price "$14.99" row → label "Ingredient / 17 Reviews >" → horizontal thumbnail strip of ingredient photos (5 small rounded squares) → blue pill "Add to cart" + orange favourite button "43".
- **Components:** Photo hero + sheet, ingredient thumbnail rail, reviews link.
- **CTA:** Blue pill "Add to cart".
- **Engine mapping:** Detail sheet — strong match; ingredient rail is a detail-specific sub-pattern (related rail variant).

#### 15. Product Detail B — Vegetable Salad (blue sheet)
- **Anatomy:** Full blue screen, header "Taste Sweet" centred white + document icon right, orange badge left → large circular plate photo centred, garnish (tomato, leaves, lemon) spilling outside the circle → name "Vegetable Salad" white bold → "Nutrition facts" white subhead → 3 translucent/blue stat tiles: Carbs 16.5, Protein, Fat (values for Protein/Fat illegible at board resolution) → large **orange bottom sheet/card**: serving stepper left + "$14.99" right, blue pill "Add to cart" + white favourite button "43" → below the phone's sheet edge, a peek of the next layer: "Cart / Detail >" bar (this is a stacked-sheet state in the source mock, not a separate screen).
- **Components:** Nutrition stat tiles, orange price/action sheet.
- **CTA:** Blue pill on orange sheet.
- **States:** Same product type as #14, opposite colour treatment (dark vs white sheet).
- **Engine mapping:** Detail sheet (dark variant). Nutrition facts tiles are **MISSING** as a named sub-pattern.

#### 16. Recipe / Explore Search — categories + For You
- **Anatomy:** Header: orange badge, search pill, `×` → category thumbnail grid: blue filled tile "Trends", food photo tiles, "10 recipe best for breakfast" text tile, "Salad" tile (labels partially legible) → section "For You / See all >" → recommendation rows (name + orange time/tag chip + duration, circular photo right): "Juicy Lucy Burger", "Lime Sorb Margarites" [sic, approx.] → solid blue bottom bar (delivery icon active with orange dot, 3 other icons).
- **Components:** Category thumbnail grid, recommendation list row.
- **CTA:** None labelled; tile/row taps.
- **Engine mapping:** Browse / category grid — resembles medallion rail expanded to thumbnails + product list. Recipe content type is beyond shop patterns; anatomy maps, domain does not.

### Row 5 — Wallet / Transactions

#### 17. Transaction History — Complete
- **Anatomy:** Header: orange badge, search pill, `×` → heading "Complete / View all >" → two transaction cards: orange card (food thumb, dish name — "Mie ayam sepatu" approx., "DELIVERED", "- $25.02", "9 Oct"), blue card (same dish type, "- $25.02", "9 Oct") — names partially legible, amounts/dates legible → large blue panel "Transaction / Current rate (?) …" with 4 small icon tabs (Delivery active), large McDonald's "M", "Update at 17:17", "23 MIN" chip.
- **Components:** Transaction history cards (debit, delivered state), rate/status panel.
- **CTA:** None.
- **Engine mapping:** Wallet / transaction history — maps to wallet pattern (statement rows in card form).

#### 18. Top Up — Enter Amount (keypad)
- **Anatomy:** Header: orange badge, centred "Top up", notification icon right → white ground → "Enter amount" bold + "Set Manually" grey → currency/amount row: small "USD ⌄" chip + large "$145.99" + orange "+ 202 points" below → quick-amount chips row (values illegible) → blue keypad panel (same keypad) → white pill "Top up wallet" on blue panel.
- **Components:** Amount display, custom keypad, points-earn note.
- **CTA:** "Top up wallet".
- **Engine mapping:** Wallet top-up — wallet pattern for the flow, keypad **MISSING** as component (third reuse).

#### 19. Top Up — Source of Fund / Card Destination
- **Anatomy:** Header: "Card destination" centred, notification right → "Source of fund" bold → selected card: blue card row "Johansayah Anastasia / •••• 2203 / 09/20" + VISA logo + orange check circle right → white row "+ Add credit card" → (large empty middle) → blue pill CTA at bottom (label reads "Label" in the mock — placeholder text in source, not a real CTA label).
- **Components:** Saved-card radio row (selected card), add-card row.
- **CTA:** Bottom blue pill (placeholder label in source).
- **Engine mapping:** Wallet + radio-row checkout (card selection). Present.

#### 20. Top Up — Successful (blue)
- **Anatomy:** Full blue screen → header: orange `×`, centred "Top up" white → centred illustration (money bag with coins, blob) → "Top up successfull" [sic] white bold centred → "You have complete your topup payment" small white centred → lower block: "Top up amount paid / $145.99 / You will earn + 202 points" (points in orange).
- **Components:** Success state, amount recap, points note.
- **CTA:** None on this screen (close `×` only).
- **Engine mapping:** Success / confirmation state — **MISSING** as a named engine pattern (closest is tracker / order confirmation, neither is a generic payment-success screen).

### Row 6 — Balance / Receipt / Cart

#### 21. Top Up Success! (white variant)
- **Anatomy:** White screen, orange `×` top-left → large pale-peach blob illustration (hands, phone, banknotes — gist only) → "Top up Success!" bold centred → "$1,290.35" large centred → "has been added to your account balance" grey centred (2 lines) → blue pill "Back to home".
- **Components:** Success state (light variant of #20).
- **CTA:** Blue pill "Back to home".
- **Engine mapping:** Success state — same **MISSING** generic success pattern as #20; board deliberately shows two visual treatments of it.

#### 22. Top Up — Expense / Existing Balance
- **Anatomy:** Header "Top up" → "Expense on" bold + orange date chip right → large blue card: "Existing Balance / $0,00" white centred + illustration (plant growing coins / telescope figure — gist) → white sheet overlapping bottom: 3 action tiles — "Detail" (grey/disabled), **"Topup" orange filled (selected)**, "Add Card".
- **Components:** Balance card, segmented action tiles.
- **CTA:** Tile taps.
- **Engine mapping:** Wallet (balance home variant). Present.

#### 23. Receipt — Current Balance + Wallets
- **Anatomy:** Header "Top up" → "Receipt" bold + orange date chip → blue card "Current Balance / $2,343.99" white → white sheet: "Wallets" heading → wallet chips row: pale "+ New wallet", orange "VISA •••• 1821", orange "VISA •••• 322…" (third cut off) → transaction row: pink icon square, "- $2.99 / Beli mie angklung" (?) — merchant text partially illegible, amount legible, `⋮` menu right → row: chart icon "Display Statistic".
- **Components:** Balance header, saved-wallet chips, statement row, statistic link.
- **CTA:** None labelled.
- **Engine mapping:** Wallet — canonical wallet screen in this board's language (balance + cards + statement).

#### 24. Cart (list)
- **Anatomy:** Header "Cart" + search icon right, orange badge → list rows (circular photo, name, price small, stepper, blue circular `×` remove right): Zucchini $7.99 ×1, Corn Swiss $10.99 ×2, Brussel sprouts $10.99 ×1 → orange link "+ Add more item" → footer: date "Oct, 2019" small orange, "Total: $14.99" right bold (note: footer total does not sum the visible rows in the source mock — reported as printed) → blue pill "Checkout".
- **Components:** Cart line item with remove `×`, add-more link, total footer.
- **CTA:** Blue pill "Checkout".
- **Engine mapping:** Bag / cart. Present.

### Row 7 — Delivery / Payment / Order

#### 25. Delivery (address selection)
- **Anatomy:** Heading "Delivery" → selected address card (blue, name "Jack Narraw" approx. — spelling partially legible, address 2 lines Yogyakarta 45348 approx., "Change" orange link top-right, sub-row "Shipping method >") → section "My address" → white rows: "+ Add another location", location row (orange pin badge, "Work / Kantor Cafe Indo" approx.) → blue pill "Continue".
- **Components:** Address card (selected, on blue), address list rows.
- **CTA:** Blue pill "Continue".
- **Engine mapping:** Radio-row checkout (address group) — selected state rendered as a filled blue card instead of a radio dot. Present as variant.

#### 26. Payment (method + summary sheet)
- **Anatomy:** Heading "Payment" → horizontal card carousel: blue VISA card "•••• 2203 / 09/20" in front, PayPal card peeking right → white row "+ Add new card" → saved method row: green icon square, "•••• 2923 / Bank Indonesia" + VISA → large blue summary sheet (bottom, radius top): date "Oct, 2019", rows "Subtotal $12.99", "Delivery fee $2", divider, "Total: $14.99" → white pill "Continue" inside the blue sheet.
- **Components:** Card carousel, payment radio row, summary sheet on blue.
- **CTA:** White pill "Continue".
- **Engine mapping:** Radio-row checkout (payment group) + wallet cards. Present.

#### 27. Order Review / Checkout
- **Anatomy:** Blue header strip → white sheet → heading "Order" → delivery-to card: orange truck badge, "Delivery to / Jogjakarta…" (place text partially legible), chevron in light square right → section "Items" → item row: Zucchini photo, name, price, stepper, blue `×` → white row "+ Add more items" → promo row: orange ticket badge "APBED02B / - $5.5" (code as printed, approx.) + `+` button right → footer "Total: $14.99" → blue pill "Checkout".
- **Components:** Delivery-to summary card, item row, promo-code row.
- **CTA:** Blue pill "Checkout".
- **Engine mapping:** Checkout review — bag + radio-row checkout summary. Present.

#### 28. Delivery Progress (tracker)
- **Anatomy:** Header icons → delivery summary card: orange icon, "Delivery / 30 MIN" → section "Delivery Progress" + small orange status right → vertical tracker (icon nodes on a line, top→bottom): green check "Complete at 8.39 AM" → blue card node "Arrived Order on Sleman, DIY" with avatar/thumb → person icon "Driver on the way" → orange card node with driver avatar "Sarwoto is your courier" (name approx.) → shield icon "Driver pickup item at 8.00 AM" → chat-bubble row "Hurray!".
- **Components:** Vertical step tracker with embedded info cards, courier identity card.
- **CTA:** None labelled.
- **States:** Multi-step, current step highlighted in orange/blue cards.
- **Engine mapping:** Tracker — matches existing tracker, but **vertical** form with card nodes (engine tracker in other boards is horizontal).

### Row 8 — Cards / Empty states / Rating

#### 29. Add New Card (form)
- **Anatomy:** Blue header with white row "+ Add new credit card" → white sheet → "Add new card" bold → icon fields: Name, Card Number, Exp. Date, CVV (light grey fields) → blue pill "Save Card".
- **Components:** Card form (4 fields).
- **CTA:** Blue pill "Save Card".
- **Engine mapping:** Wallet / payment form — maps to wallet + form/step patterns; no dedicated "add card" pattern named, map to wallet.

#### 30. Payment — Card Not Set (empty state)
- **Anatomy:** Heading "Payment" → centred illustration (stack of cards on peach blob) → "Card not set" bold centred → "Today is good day for you to make a choice" grey centred (stock empty-state copy reused in #31) → white/grey row "+ Add new card".
- **Components:** Illustrated empty state.
- **CTA:** Add-new-card row (not a pill).
- **Engine mapping:** Empty state — **MISSING** as a named pattern in the listed engine set (illustrated empty + single action). Reappears in #31.

#### 31. Cart — Empty state
- **Anatomy:** Heading "Cart" → centred illustration (person pushing shopping cart, peach blob) → "Your cart is empty" bold centred → same stock subcopy as #30 → small orange "‹ Back to Home" link → footer sheet: date "Oct, 2019", "Total: $0" → blue pill "Checkout" (present but meaningless at $0 — source mock flaw, reported as shown).
- **Components:** Illustrated empty state over a cart footer.
- **CTA:** Blue pill "Checkout" + Back to Home link.
- **Engine mapping:** Bag empty state — same **MISSING** illustrated-empty pattern; bag pattern covers populated state only.

#### 32. Rate Your Order
- **Anatomy:** Blue header field with centred white title "Rate your order" → white sheet → dish name "Kue Dadar Telur" centred bold → large circular food photo with garnish → 5 gold stars (all filled) centred → "225 Reviews" small grey → light grey text area "Add your thoughts here…" → blue pill "Submit".
- **Components:** Star rating input, review textarea.
- **CTA:** Blue pill "Submit".
- **Engine mapping:** **MISSING** — rating/review submission (stars + free text) is not in the listed engine patterns.

### Row 9 — Feedback / Profile / Chat

#### 33. Feedback — "How do you feel?"
- **Anatomy:** Blue header: "Skip" right, heading "How do you feel?" white bold + "Tell us about your experience" small white → 3 emoji/mood tiles in a row: first **orange filled (selected)**, other two blue-outlined → white sheet → "Give us feedback" bold + "Write your suggestion here" grey → large text area "Ex. feedback" → character counter "100 chars" right small → blue pill "Back to home" (note: CTA returns home rather than "Submit" — as printed).
- **Components:** Mood selector (3 icon tiles), feedback textarea with counter.
- **CTA:** Blue pill "Back to home".
- **Engine mapping:** **MISSING** — mood + feedback form is not a listed pattern (form/step covers fields, not mood selection).

#### 34. Profile — Dean Jean (favourites / best selling)
- **Anatomy:** Blue header: name "Dean Jean" white bold + "Senior Food Traveler" small white + circular avatar right, orange badge left → white sheet → action icon row: blue filled "Message" tile, plus Favourite / Wholesaler(?) / Help outline tiles (labels small, third label illegible) → section "My Favorite / See all >" → horizontal cards: orange filled food card (photo + name), white cards "Mie Lemak $10", "Terong Bulan $14" (names approx.) → blue panel "Best selling / See all >" → white product card "Juicy Lucy Burger" + tag chip + photo.
- **Components:** Profile header on blue, action tile row, favourite cards rail, best-selling panel.
- **CTA:** "Message" tile.
- **Engine mapping:** Profile rows alternative — this profile is **content-first** (favourites/best-selling) rather than row-list; maps to profile + product card, layout is a variant.

#### 35. Chat — Dean Jean conversation
- **Anatomy:** Blue header: back badge, centred "Dean Jean" + presence sublabel (illegible), phone icon in white square right → white sheet → date divider "Today" orange small centred → incoming bubbles (avatar left, white/grey bubble): "Hello, may I ask some question to you?" + time, "Are you happy with my delivery services?" + time → outgoing bubble (blue fill, white text, avatar right): "Sure, I'm happy" + time → composer at bottom: "Type something text" field + edit/attachment icons → quick-reply chips row below composer (3 small orange text chips, verbatim illegible).
- **Components:** Chat bubbles (in/out), composer, quick replies.
- **CTA:** Send via composer (no labelled button visible).
- **Engine mapping:** **MISSING** — in-app chat / conversation screen is not in the listed engine patterns at all.

#### 36. Profile Detail — Dean Jean photos + wishlist
- **Anatomy:** Blue header identical to #34 (Dean Jean / Senior Food Traveler / avatar) → white sheet → section "Photos / See all >" → photo grid: 1 large photo left (food dish) + 1 small top-right, then 1 small bottom-left + 1 large bottom-right (2×2 asymmetric grid, all food photos) → blue panel "Wishlist / See all >" → white product card: "Nasi Lemak Singapur" + price chip "$3.99" orange + photo with red bookmark ribbon.
- **Components:** Photo grid (profile media), wishlist product card on blue panel.
- **CTA:** None labelled.
- **Engine mapping:** Profile + product card; asymmetric photo grid is **MISSING** as a pattern (not a product grid — personal media grid).

---

## Pattern census

| Pattern | Count |
|---|---:|
| Blue pill / white pill full-width primary CTA | 20+ screens (near-universal) |
| White sheet over blue header (large top radius) | ~18 screens |
| Orange rounded-square icon badge (back / close / section) | ~25 screens |
| Custom numeric keypad (blue panel) | 3 (Register Phone, OTP, Top-up Amount) |
| Auth form (icon fields) | 4 (Sign In, Sign Up, Forgot, Add Card as payment form) |
| Onboarding (blob illustration + headline) | 3 (+ splash = 4) |
| Product / food detail sheet | 3 (Explore Top Order, Detail A, Detail B) |
| Wallet: balance / cards / statement | 4 (Source of Fund, Expense/Balance, Receipt/Wallets, Transaction History) |
| Top-up flow screens | 5 (Enter Amount, Source, Success-blue, Success-white, Expense) |
| Success / confirmation (illustrated) | 2 |
| Empty state (illustrated) | 2 (Card Not Set, Cart Empty) |
| Bag / cart (populated) | 2 (Cart list, Order Review) |
| Radio-row checkout (address/payment/order) | 3 (Delivery, Payment, Order) |
| Tracker (vertical, card nodes) | 1 |
| Greeting home | 1 (+ Explore as browse variant) |
| Profile (header + content) | 2 |
| Rating stars input | 1 |
| Feedback / mood form | 1 |
| Chat conversation | 1 |
| Permission priming | 1 |
| Photo grid | 1 |
| Nutrition stat tiles | 1 |
| Search field + results list | 2 |

**MISSING / weak in engine (this board):** custom numeric keypad component, generic illustrated success state, illustrated empty state, permission-priming screen, star-rating + review form, mood/feedback form, in-app chat, personal photo grid, nutrition stat tiles, vertical tracker variant.
