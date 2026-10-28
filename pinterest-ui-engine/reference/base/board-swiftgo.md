# Board Decode — SwiftGo

- **Source:** `293503c765d507b79c8b6be58aaef2a0e1fe4ff5aa9ee50b23cf3fd08354d5bb.jpg` (736×736, beige presentation board, 2 rows of phone frames)
- **App / domain:** SwiftGo — consumer parcel / courier booking, tracking and delivery. Tagline "Fast. Safe. Everywhere."
- **Frames inventoried:** 11 distinct phone screens (5 top row, 6 bottom row). All legible at crop resolution except micro-copy under headings, noted where inferred.
- **Palette (approximate, from flat UI fields):** background cream `#FFF8EE` / `#FFFBF3`; board beige `#E8D5B7`; primary orange `#F97316`–`#EF6C0A` (solid CTA); dark text near-black brown `#1F1A14`; muted text `#8A7D6B`; pale peach icon discs / promo field `#FDEBD3`–`#FBE3C2`; white cards `#FFFFFF`; success green pill `#4CAF6D` (only on "Delivered" chip).
- **Type roles:** Display — bold geometric sans, tight, sentence/title case for hero ("Your Packages, Our Priority") and section heads ("Popular Services"). UI — same sans family, regular for body/address, medium for row titles, small grey for meta/prices ("From $4.99"). No serif anywhere.
- **Shape language:** Very soft. Phone frames ~28px radius; cards ~16–20px radius with no visible border and very faint warm shadow; primary CTA is a full-width pill (~28px radius); icon actions sit in peach circular discs; search is a white pill; selected package-type tile is white with a thin orange outline — outline used *only* for selection, not card chrome.
- **Density character:** Airy consumer density. One idea per card, generous white/cream space, 1 meta line per card, large tap targets. Lists are spaced cards, never ruled rows.
- **Nav model:** Two modes. (a) Bottom tab bar on in-app screens — 4 tabs: Home / Orders / Track / Account, line icons, active tab orange with label. (b) Stack screens use a top bar only: back chevron left + centred/left title ("Track Order", "Payment", "Services") — no tab bar on Book/Payment step screens in the bottom row except Services/Notifications/Profile which keep it. Splash has no nav.

---

## Screen inventory

### 1. Splash / Welcome — onboarding hero
- **Purpose:** Brand entry, convert to Get Started or Log In.
- **Anatomy top→bottom:** Status bar (9:41) → SwiftGo logo (orange paper-plane mark + wordmark) + tagline centred → full-bleed warm photo (courier carrying a box toward a branded van, city behind) occupying middle ~45% → headline "Your Packages, Our Priority" (2 lines, display) → 2-line supporting copy → solid orange pill CTA "Get Started" → text link "Already have an account? Log In".
- **Components:** photo hero, logo lockup, display headline, pill CTA, text link.
- **CTA style/placement:** Single solid orange pill, bottom-anchored above the log-in link. No secondary button box.
- **States shown:** Default/first-run only.
- **Engine mapping:** onboarding (photo-hero variant). Resembles engine onboarding, but the photo-first, logo-over-photo composition is stronger than a text onboarding.

### 2. Home — greeting / location home
- **Purpose:** Start a booking, jump to a quick action, browse popular services.
- **Anatomy top→bottom:** Location header: orange pin + "New York, USA ▾" left, bell icon + circular avatar right (note: this is a *location* header, not a named-person greeting) → pill search "Search for a service, package or location…" → promo/hero card (peach field, "Send Packages Anywhere", 2-line copy, small orange pill "Book Now", photo of plane + stacked boxes right) → quick-action row of 4 circular peach discs with labels under: Send Package / Track Package / International / Express → section head "Popular Services" + "View All ›" → 2×2 grid of service cards, each: small icon/illustration, title, single meta line "From $x.99" (Domestic Delivery $4.99, International Shipping $12.99, Same-Day Delivery $8.99, Large Packages $14.99) → bottom tab bar (Home active).
- **Components:** location header, pill search, promo banner card, icon-disc quick actions, section head, 2-col product/service card grid, tab bar.
- **CTA style/placement:** Promo's "Book Now" is a small pill *inside* the banner; no full-width CTA — the cards themselves are the actions.
- **States shown:** Default populated home.
- **Engine mapping:** greeting home (location variant) + promo banner + medallion/icon-disc rail (discs here are actions, not filter medallions) + product card grid.

### 3. Track Order — tracking-number lookup + status
- **Purpose:** Enter a tracking number, see current status and route.
- **Anatomy top→bottom:** Top bar: back + "Track Order" + scan/frame icon right → lookup card: label "Enter tracking number", example "e.g. SG123456789", orange square-rounded search button right → status card: box thumbnail in peach disc + "In Transit" bold + "Arriving in 2 hours" → horizontal stepper: 4 nodes (Picked Up ✓ filled / In Transit filled / Out for Delivery hollow / Delivered hollow) with date-time under each → map card (street map, route line, vehicle marker, orange destination pin) → "Delivery Address" label, address 2 lines, "Estimated Delivery / Today, 2:30 PM – 4:30 PM" → solid orange pill CTA "View Details".
- **Components:** top bar, search/lookup field with attached action, status summary card, horizontal progress stepper, map card, address block.
- **CTA style/placement:** Full-width solid pill pinned at bottom.
- **States shown:** Mid-journey state (2 of 4 steps complete).
- **Engine mapping:** tracker (horizontal-stepper variant) + map/tracking. Engine tracker exists as vertical timeline — this horizontal stepper variant is a distinct form.

### 4. Live Tracking — map-first tracking
- **Purpose:** Watch driver approach, contact driver.
- **Anatomy top→bottom:** Top bar: back + "Live Tracking" + scan icon → full-width map (~55% of screen) with black route line, car marker mid-route, orange destination pin, floating white pill caption "Your driver is 5 minutes away" → driver card overlapping map bottom: circular driver photo, name "James Carter", vehicle "Toyota Prius • AB1234", rating "4.8 ★ (124)", two equal quiet buttons "Call" (phone icon) / "Message" (chat icon) → arrival card: van icon in peach disc + "Arriving in 5 minutes" bold + "Your package is almost there!" → (no tab bar).
- **Components:** full-bleed map, floating status pill, person/driver card, paired quiet action buttons, arrival notice card.
- **CTA style/placement:** No primary pill — paired equal-weight Call/Message buttons inside the driver card.
- **States shown:** Near-arrival live state.
- **Engine mapping:** map/tracking + profile/person card. The floating map caption pill and driver-contact card are specific compositions — see Missing notes in census.

### 5. Order Details — vertical timeline detail
- **Purpose:** Full record of one delivery.
- **Anatomy top→bottom:** Top bar: back + "Order Details" → order ID "#SG123456789" bold + green "Delivered" pill right → "Expected delivery / Apr 25, 2:30 PM – 4:30 PM" → vertical timeline card: 5 orange check nodes joined by a line — Order Placed / Picked Up / In Transit / Out for Delivery / Delivered, each with date-time under → package information card: box icon in disc + "Package Information" + weight/dimensions line "1.2 kg • 25 × 20 × 15 cm", then From: Amazon Store, To: 123 Madison Ave, New York, NY 10016 → outlined pill CTA "Need Help?".
- **Components:** ID + status pill header, vertical timeline, detail/spec card, From/To block.
- **CTA style/placement:** Outlined (quiet) pill at bottom — deliberately *not* solid, because help is secondary. This is the only outlined CTA on the board.
- **States shown:** Completed/delivered state (all nodes checked).
- **Engine mapping:** tracker (vertical timeline) + detail sheet (as a full screen) + spec/attribute block.

### 6. Services — service catalogue list
- **Purpose:** Browse/search all delivery services.
- **Anatomy top→bottom:** Top bar: back + "Services" → pill search "Search services…" → vertical stack of 5 spaced white cards, each: peach disc icon left, title bold, 1-line descriptor, chevron right — Domestic Delivery ("Fast & reliable within your country"), International Shipping ("Global delivery to 200+ countries"), Same-Day Delivery ("When you need it, today"), Express Delivery ("Priority handling for urgent shipments"), Large Packages ("For bulky and heavy items") → bottom tab bar (Home active).
- **Components:** pill search, icon-disc list cards with chevron.
- **CTA style/placement:** None — whole cards are tappable.
- **States shown:** Default list.
- **Engine mapping:** product/service list — closest to profile rows but with icon discs + descriptors; functionally a catalogue list, not a settings list.

### 7. Book a Delivery — Step 1 of 3, form flow
- **Purpose:** Choose package type/size/weight/dimensions.
- **Anatomy top→bottom:** Top bar: back + "Book a Delivery" → stepper header: ① Package (active, orange) — ② Address (hollow) — ③ Payment (hollow), joined by a line → "Package Type" label → selectable tile grid: Document (up to 1 kg), Small (1–5 kg, **selected: orange outline**), Medium (5–10 kg) on row 1; Large (10–20 kg), Extra Large (20+ kg) on row 2 — each tile: box/document illustration + name + weight range → "Package Weight" label → stepper control: −  "1 kg"  + in a white pill field → "Dimensions (cm)" label → 3 equal numeric fields Length 20 / Width 15 / Height 10, label above value → solid orange pill CTA "Next". No tab bar.
- **Components:** numbered step indicator, selectable tile grid (radio behaviour), quantity stepper, grouped numeric inputs.
- **CTA style/placement:** Full-width solid pill pinned bottom.
- **States shown:** Step 1 active, Small selected.
- **Engine mapping:** form flow + radio-row checkout (tile-grid variant of radio selection — engine radio rows are list rows; tiles are a variant worth naming) + stepper input (MISSING as a named input, see census).

### 8. Pickup & Address — Step 2 of 3, form flow
- **Purpose:** Confirm pickup/delivery addresses and instructions.
- **Anatomy top→bottom:** Top bar: back + "Pickup & Address" (stepper not repeated on this frame) → "Pickup Address" label → address card: location/bell-style icon, "Home" bold + "Change" text action right, address 2 lines (123 Madison Ave, New York, NY 10016) → "Delivery Address" label → address card: "Work", "Change", 456 Park Ave, New York, NY 10022 → checkbox row "Same as pickup address" (unchecked) → "Delivery Instructions" label → free-text field with placeholder "e.g. Leave at door, call on arrival…" → solid orange pill CTA "Continue to Payment".
- **Components:** saved-address cards with Change action, checkbox, textarea.
- **CTA style/placement:** Full-width solid pill pinned bottom, labelled with the next step name.
- **States shown:** Both addresses populated; checkbox off.
- **Engine mapping:** form flow (address step) + saved-address card (variant of radio-row: address as selectable card).

### 9. Payment — radio-row checkout
- **Purpose:** Choose payment method and pay.
- **Anatomy top→bottom:** Top bar: back + "Payment" → "Payment Method" label → radio list, each row a white card: Credit/Debit Card (**selected, orange radio**) with VISA/Mastercard/Amex marks under; PayPal with PayPal logo right; Apple Pay with Apple Pay logo right; Cash on Delivery with cash icon right → "Add Card Details" label → card-number field "1234 5678 9012 3456" → two half fields: Expiry MM/YY | CVV 123 → solid orange pill CTA "Pay Now – $12.99" (price embedded in CTA).
- **Components:** radio rows with brand marks, card form, price-bearing CTA.
- **CTA style/placement:** Full-width solid pill pinned bottom, price in label.
- **States shown:** Card method selected, card form expanded under it.
- **Engine mapping:** radio-row checkout + wallet/payment form. Direct match to engine checkout pattern.

### 10. Notifications — activity feed
- **Purpose:** Delivery updates and offers.
- **Anatomy top→bottom:** Header: bell icon + "Notifications" (no back chevron — this is a tab destination) → vertical list of 5 spaced items, each: orange circular icon left, title bold, 1–2 line body, small time right ("2h", "4h", "6h", "1d" — partially legible at board resolution) — Order Delivered, Package In Transit, New Message, Discount Offer ("Get 20% off on your next delivery!"), Order Placed → bottom tab bar (third tab highlighted orange in this frame, inconsistent with the "Notifications" title — board artefact, noted honestly).
- **Components:** icon-led notification rows.
- **CTA style/placement:** None.
- **States shown:** Populated feed, mixed ages.
- **Engine mapping:** notifications feed — resembles profile rows / list rows; a dedicated notifications pattern is not a core engine pattern (see census).

### 11. My Profile — profile rows
- **Purpose:** Account hub.
- **Anatomy top→bottom:** Header: bell + "My Profile" + gear icon right → profile header: large circular photo left, name "Sarah Johnson", email underneath → menu card stack of spaced rows, icon + label + chevron: My Orders / Addresses / Payment Methods / Notifications / Help & Support / Settings → outlined pill CTA "Log Out" (orange text, thin orange outline) → bottom tab bar (Account active, orange).
- **Components:** avatar header, profile rows, quiet destructive/logout button.
- **CTA style/placement:** Outlined pill above tab bar — quiet because logout is secondary/destructive-adjacent.
- **States shown:** Signed-in default.
- **Engine mapping:** profile rows + avatar header. Direct match.

---

## Pattern census — SwiftGo

| Pattern | Count |
|---|---|
| Solid full-width pill CTA (bottom-pinned) | 5 (Screens 1, 3, 7, 8, 9) |
| Outlined/quiet pill CTA | 2 (5, 11) |
| Bottom tab bar (4 tabs) | 4 (2, 6, 10, 11) |
| Top bar with back + title | 7 (3, 5, 6, 7, 8, 9 + 4) |
| Pill search field | 3 (2, 6; lookup variant in 3) |
| Product/service card (icon + title + 1 meta line) | 3 screens (2 grid, 6 list; status card in 3 related) |
| Tracker — timeline/stepper | 2 (3 horizontal, 5 vertical) |
| Map / tracking | 2 (3 map card, 4 full-bleed map) |
| Form flow (multi-step) | 2 (7, 8 — steps 1–2 of one flow; 9 is its payment step) |
| Radio selection | 2 (7 tiles, 9 rows) |
| Profile rows | 1 (11) + notifications list (10, row-like) |
| Promo banner card | 1 (2) |
| Icon-disc quick-action rail | 1 (2) + disc icons reused in 5, 6, 10 |
| Onboarding (photo hero) | 1 (1) |
| Notifications feed | 1 (10) |
| Person/driver contact card | 1 (4) |
| Wallet | 0 — payment is checkout radio rows, no stored-balance wallet screen |

**MISSING / not covered by a named engine pattern:**
- **Horizontal progress stepper** for tracking (Screen 3) — distinct from the vertical timeline; both appear on this one board, so the engine needs both orientations.
- **Floating status pill over a map** ("Your driver is 5 minutes away", Screen 4) and the **driver card with paired Call/Message** actions.
- **Quantity stepper input** (− value +) and **grouped dimension fields** (Screen 7) as named form controls.
- **Notifications feed** as a first-class pattern (Screen 10) — currently only approximable with generic list rows.
