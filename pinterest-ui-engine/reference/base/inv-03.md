# Evira board — forensic screen inventory, slices 09–12 (inv-03)

Slices are horizontal bands of one tall board, 5 phone screens per row. Rows are
numbered top-to-bottom **within each slice**. Slices cut through rows, so the top
and bottom rows of several slices are partial screens; they are inventoried as
such, describing only the visible strip. Screen IDs: S<slice>-<column>-<row>.

Recurring global facts (stated once, not repeated per screen): every full screen
sits on a white ground with no border and no drop shadow; grouping is done by
white space, never by hairline dividers or boxes; the only ink is black, the
only secondary tone is one mid-grey for captions/meta; colour appears only in
photography, brand logos and map graphics. Status bars show "9:41" left and
signal/wifi/battery glyphs right, in black.

---

# SLICE 09

## S09-1-1 — partial, bottom strip only
- Screen name/type: Product browse/detail screen (bottom edge only)
- Purpose: unknown beyond commerce content; only the foot of the screen survives the slice cut
- Layout, top to bottom: only the bottom ~10% visible — two product photographs side by side on very light grey tiles: left a yellow plush/toy figure, right a small doll figure in pink/lavender clothing
- Components & styling: photo tiles are rounded rectangles (approx 12–16px radius), light grey fill behind the photos; no borders, no shadows
- Typography: none visible
- Colour: colour only inside the two photos; surround is white/grey
- Controls & interaction cues: none visible
- Pattern(s): PRODUCT-GRID-TILE (partial)

## S09-2-1 — partial, bottom strip only
- Screen name/type: Product detail — price + action bar (bottom edge only)
- Purpose: closing strip of a product detail page: price and purchase action
- Layout, top to bottom: single visible row — bold price text "$430.00" at left; at right a black pill button labelled "Add to Cart" in white text
- Components & styling: button is a fully rounded pill, solid black fill, white label; no border, no shadow; the bar itself is unboxed on the white ground
- Typography: price is bold, roughly body-plus size; button label is small-medium white sans, sentence case
- Colour: black button and black price text; everything else white
- Controls & interaction cues: one primary pill button (Add to Cart)
- Pattern(s): PRICE-ACTION-BAR, BLACK-PILL-CTA

## S09-3-1 — partial, bottom strip only
- Screen name/type: Product reviews list (bottom edge only)
- Purpose: foot of a reviews screen — one reviewer's identity row and the start of their comment
- Layout, top to bottom: a row containing a small circular avatar photograph at left, a short bold name text beside it, and at right a small light pill containing two tiny icons; below the row, one line of small grey text (the review comment, illegible at this resolution)
- Components & styling: avatar is a perfect circle; the icon pill is a light tint fill, fully rounded, no border
- Typography: name is small bold; comment is small grey caption text
- Colour: black/grey text; colour only in the avatar photo
- Controls & interaction cues: the two-icon pill (reaction/more actions, icons illegible)
- Pattern(s): REVIEW-ROW (partial)

## S09-4-1 — partial, bottom strip only
- Screen name/type: Unidentified screen (bottom edge only)
- Purpose: not determinable from the visible strip
- Layout, top to bottom: one row of about five small outline icons spaced evenly across the width on white — consistent with a bottom tab bar or an icon action row; nothing else visible
- Components & styling: icons are thin-stroke, unfilled, no containers
- Typography: none visible
- Colour: black/grey strokes only
- Controls & interaction cues: five tappable icon positions
- Pattern(s): ICON-ROW (partial)

## S09-5-1 — partial, bottom strip only
- Screen name/type: Modal / bottom sheet action row (bottom edge only)
- Purpose: decision row of a dialogue — a quiet cancel against one primary action
- Layout, top to bottom: single visible row — plain text button "Cancel" at left; large black pill button at right (label cut/illegible)
- Components & styling: black pill is solid fill, fully rounded, no border/shadow; Cancel is bare text, no container
- Typography: Cancel is medium dark text; pill label is white (illegible)
- Colour: black and white only
- Controls & interaction cues: text button + primary pill button pair
- Pattern(s): MODAL-ACTION-PAIR, BLACK-PILL-CTA

## S09-1-2 — full screen
- Screen name/type: Checkout — shipping address summary + order list
- Purpose: review delivery address and ordered items before paying
- Layout, top to bottom: status bar; header row (back arrow left, bold title "Checkout", small circular outline icon right); section label "Shipping Address" (bold); address block — black circular medallion with white location-pin glyph at left, bold address name "Home", one line of small grey address text, pencil edit icon at right, all unboxed on white; section label "Order List" (bold); two product rows, each a light-grey rounded-square photo thumbnail (cardigan photo; black shoe photo) + bold product name + small grey meta line + bold price + small quantity figure at far right; large empty white space; fixed bottom black pill "Continue to Payment" with a small arrow glyph in the label
- Components & styling: thumbnails rounded rect approx 12px radius, light grey fill; medallion is a solid black circle; primary button is a full-width solid black pill (fully rounded ends), no border, no shadow anywhere on screen
- Typography: screen title bold approx 17px sentence case; section labels bold approx 15px; product names medium-bold; meta grey caption size; prices bold; all left-aligned
- Colour: black text/icons/medallion/button; grey captions; colour only in the two product photos
- Controls & interaction cues: back arrow, circular header action icon, pencil edit icon, one full-width pill CTA
- Pattern(s): BACK-TITLE-HEADER, SECTION-LABEL, PRODUCT-LIST-ROW, FIXED-BOTTOM-CTA, BLACK-PILL-CTA

## S09-2-2 — full screen
- Screen name/type: Shipping Address — saved address picker (radio list)
- Purpose: choose which saved address the order ships to, or add a new one
- Layout, top to bottom: status bar; header (back arrow, bold title "Shipping Address"); four address rows, evenly spaced — each row: solid black circle with white location-pin glyph, bold address name ("Home", "Office", "Apartment", "Parent's House"), one line of small grey address text, and a radio circle at the far right; the first row's radio is filled black (selected), the other three are thin outline circles; below the list, a full-width light-grey pill button "Add New Address" with grey label; fixed bottom black pill "Apply"
- Components & styling: radios are small circles, selected = solid black fill, unselected = thin grey/black outline, no inner dot visible; quiet button is a tint (light grey) pill with no border; primary pill solid black; no shadows, no row dividers — rows separated by space only
- Typography: title bold sentence case; address names bold body size; addresses grey caption size; button labels medium, centred
- Colour: black medallions, radios, title and primary button; grey secondary text and quiet-button fill; no other colour
- Controls & interaction cues: 4 radio rows (single-select), quiet pill (add address), primary pill (Apply)
- Pattern(s): BACK-TITLE-HEADER, RADIO-ROW-WITH-ICON, QUIET-PILL-BUTTON, FIXED-BOTTOM-CTA, BLACK-PILL-CTA

## S09-3-2 — full screen
- Screen name/type: Choose Shipping — delivery method picker (radio rows with prices)
- Purpose: pick a shipping speed; each option shows its price
- Layout, top to bottom: status bar; header (back arrow, bold title "Choose Shipping"); four rows — each: solid black circle with a white truck/box glyph, bold method name ("Economy", "Regular", "Cargo", "Express"), small grey estimated-arrival caption beneath the name, bold price at right ("$10", "$15", "$20", "$30"), radio circle at the far right edge; second row (Regular) has the filled black radio, the rest outline; large white space; fixed bottom black pill "Apply"
- Components & styling: identical medallion + radio construction to S09-2-2; price sits between label block and radio; no boxes, borders or shadows
- Typography: names bold body size; captions grey small; prices bold body size; title bold
- Colour: black and grey only; no colour anywhere
- Controls & interaction cues: 4 radio rows with prices, primary pill
- Pattern(s): BACK-TITLE-HEADER, RADIO-ROW-WITH-ICON, FIXED-BOTTOM-CTA, BLACK-PILL-CTA

## S09-4-2 — full screen
- Screen name/type: Add Promo — promotion picker (radio list)
- Purpose: apply one discount promotion to the order
- Layout, top to bottom: status bar; header (back arrow, bold title "Add Promo", magnifier search icon at right in place of the usual circle icon); five promo rows — each: black rounded-square medallion with a white ticket/percent glyph, bold promo headline (reads as "Special 25% Off", "Discount 30% Off", "Special 20% Off", "Discount 40% Off", "Discount 35% Off"), one line of small grey caption text beneath, radio at far right; second row's radio filled black (selected), rest outline; fixed bottom black pill "Apply"
- Components & styling: medallions are rounded squares (approx 10px radius) rather than circles — the one shape variation in this radio family; radios as before; no borders/shadows
- Typography: promo headlines bold body size, sentence case; captions grey small; title bold
- Colour: black and grey only
- Controls & interaction cues: search icon in header, 5 radio rows, primary pill
- Pattern(s): BACK-TITLE-HEADER, SEARCH-ACTION-HEADER, RADIO-ROW-WITH-ICON, FIXED-BOTTOM-CTA, BLACK-PILL-CTA

## S09-5-2 — full screen
- Screen name/type: Payment Methods — payment picker (radio list with brand marks)
- Purpose: choose how to pay for the order
- Layout, top to bottom: status bar; header (back arrow, bold title "Payment Methods", small square outline icon at right); one line of small grey instruction text under the header; five payment rows — brand mark at left, method name, radio at far right: row 1 "My Wallet" with a wallet glyph and a right-aligned balance figure "$9,379" beside the radio, its radio filled black (selected); row 2 PayPal (blue logo); row 3 Google Pay (multicolour "G" mark); row 4 Apple Pay (black apple glyph); row 5 a card row — red/orange overlapping-circles card logo + masked number text "•••• 4679"; remaining radios outline; fixed bottom black pill "Confirm Payment"
- Components & styling: rows are bare on white, spaced not divided; radios as in the rest of the family; primary pill solid black
- Typography: method names medium body size (not bold, unlike the address/shipping rows); balance bold; grey instruction caption
- Colour: black/grey system plus the only brand colour in the slice — PayPal blue, Google Pay colours, Mastercard red/orange — carried by the logos themselves
- Controls & interaction cues: 5 radio rows, header square icon, primary pill
- Pattern(s): BACK-TITLE-HEADER, RADIO-ROW-CHOICE, BRAND-ICON-ROW, FIXED-BOTTOM-CTA, BLACK-PILL-CTA

## S09-1-3 — partial, top sliver only
- Screen name/type: Unidentified screen (top edge only)
- Purpose: not determinable; this sliver is the head of the screen fully visible as S10-1-1 in the next slice
- Layout: only a status bar (9:41 + signal/wifi/battery) and a sliver of white below it
- Components & styling / Typography / Colour / Controls: nothing further visible
- Pattern(s): PARTIAL-SLIVER

## S09-2-3 — partial, top sliver only
- Screen name/type: Dimmed modal screen (top edge only)
- Purpose: not determinable from the sliver; it is the head of the screen fully visible as S10-2-1 (success modal over a dimmed screen)
- Layout: status bar area over a dark grey fill — the only dark screen-top in the row
- Components & styling / Typography / Colour / Controls: dark grey ground; nothing else visible
- Pattern(s): PARTIAL-SLIVER, DIMMED-BACKDROP

## S09-3-3 — partial, top sliver only
- Screen name/type: Unidentified screen (top edge only); head of S10-3-1
- Layout: status bar and a sliver of white only
- Components & styling / Typography / Colour / Controls: nothing further visible
- Pattern(s): PARTIAL-SLIVER

## S09-4-3 — partial, top sliver only
- Screen name/type: Unidentified screen (top edge only); head of S10-4-1
- Layout: status bar and a sliver of white only
- Components & styling / Typography / Colour / Controls: nothing further visible
- Pattern(s): PARTIAL-SLIVER

## S09-5-3 — partial, top sliver only
- Screen name/type: Unidentified screen (top edge only); head of S10-5-1
- Layout: status bar and a sliver of white only
- Components & styling / Typography / Colour / Controls: nothing further visible
- Pattern(s): PARTIAL-SLIVER

---

# SLICE 10

## S10-1-1 — full screen
- Screen name/type: Enter Your PIN — payment confirmation
- Purpose: authorise the payment with a 4-digit PIN
- Layout, top to bottom: header (back arrow, bold title "Enter Your PIN"); one line of grey instruction text "Enter your PIN to confirm payment"; PIN indicator row — three solid black dots and a fourth position rendered as a small rounded square outline containing the digit "9" (the active entry box); a full-width black pill "Continue" in the upper-middle of the screen; below it a numeric keypad, 3 columns × 4 rows (1–9, then a dot/blank key, 0, and a backspace glyph), plain numerals on the white ground with generous spacing; home indicator bar at the very bottom
- Components & styling: dots are small solid black circles; active box is a rounded square (approx 8px radius) with a thin outline; keypad keys have no background, border or shadow — bare numerals; Continue is the standard solid black pill
- Typography: title bold; instruction grey body-small; keypad numerals large-ish medium weight; PIN box digit medium
- Colour: black and grey only
- Controls & interaction cues: PIN dots + active digit box, numeric keypad with backspace, primary pill
- Pattern(s): PIN-ENTRY, PIN-DOTS, NUMERIC-KEYPAD, BLACK-PILL-CTA

## S10-2-1 — full screen (modal state)
- Screen name/type: Order Successful — confirmation modal over dimmed PIN screen
- Purpose: confirm the order was placed and offer the two next destinations
- Layout, top to bottom: the whole screen is dimmed dark grey (the PIN screen and its keypad faintly visible behind); centred white card occupying roughly the middle 40% of the height and ~75% of the width: inside, a large solid black circle containing a white shopping-cart glyph, with a few tiny decorative dots/stars scattered around the circle; bold centred title "Order Successful!"; one line of small grey centred caption text; full-width (of the card) black pill "View Order"; below it a full-width light-grey pill "View E-Receipt" with dark label
- Components & styling: card is a rounded rectangle (approx 24px radius), white fill, no border; the modal carries the screen's only real elevation effect (implied by the dim behind it); icon medallion solid black circle; pills fully rounded
- Typography: modal title bold, larger than body, centred; caption grey small centred; button labels medium centred
- Colour: black, white, greys; the dimmed backdrop is the only dark ground
- Controls & interaction cues: two stacked pills — primary black (View Order), quiet tint (View E-Receipt)
- Pattern(s): SUCCESS-MODAL, CENTER-MODAL-CARD, DIMMED-BACKDROP, BLACK-PILL-CTA, QUIET-PILL-BUTTON

## S10-3-1 — full screen
- Screen name/type: My Orders — empty state (Ongoing tab)
- Purpose: tell the user there are no ongoing orders yet
- Layout, top to bottom: app header — small circular logo glyph at left, bold title "My Orders", two small circular outline icons at right (search, more); text tab row — "Ongoing" in bold black with a short thick black underline, "Completed" in grey with no underline; centre of screen: a line-art illustration of two overlapping clipboards (thin black/grey strokes, very light grey fills); below it a bold centred line "You don't have an order yet"; one line of smaller grey centred caption beneath; bottom tab bar — five outline icons spread across the width, the bag/cart position filled solid black (active)
- Components & styling: tabs are bare text with an underline indicator (no pill background); illustration is outline style, no colour; tab bar icons thin-stroke except the active filled one; no borders or shadows
- Typography: title bold approx 17px; tab labels medium, active bold; empty-state headline bold body-plus, centred; caption grey small centred
- Colour: black/grey only; illustration monochrome
- Controls & interaction cues: two header icon buttons, two text tabs, five-icon tab bar
- Pattern(s): APP-HEADER-ACTIONS, TEXT-TABS, EMPTY-STATE, BOTTOM-TAB-BAR

## S10-4-1 — full screen
- Screen name/type: My Orders — Ongoing tab, order list
- Purpose: list in-flight orders, each with a direct tracking action
- Layout, top to bottom: same app header and text tabs as S10-3-1 (Ongoing active/underlined); a vertical list of order rows — each: light-grey rounded-square photo thumbnail (black shoe; cardigan; headphones; a watch row just starting at the bottom edge), bold product name, one small grey meta line (size/colour/quantity type text), bold price, and at the right a small solid black pill button "Track Order"; bottom tab bar with the bag icon filled black
- Components & styling: thumbnails as in checkout (rounded rect, light grey); mini action pills are solid black, fully rounded, roughly one-third text size of the main CTA; rows unboxed, separated by space
- Typography: names bold body; meta grey caption; prices bold; mini-pill labels small white medium
- Colour: black/grey; colour only in product photos
- Controls & interaction cues: text tabs, per-row Track Order mini pills, tab bar
- Pattern(s): APP-HEADER-ACTIONS, TEXT-TABS, PRODUCT-LIST-ROW, MINI-BLACK-PILL-ACTION, BOTTOM-TAB-BAR

## S10-5-1 — full screen
- Screen name/type: Track Order — shipment status with step tracker and timeline
- Purpose: show where one order is now and its full status history
- Layout, top to bottom: header (back arrow, bold title "Track Order", circular outline icon right); product summary row — light-grey photo thumbnail (black shoe), bold product name, small grey meta line, bold price "$375.00"; a horizontal progress tracker — five small icons (parcel/box, truck and similar glyphs) seated on a connecting line with dots beneath each stage; centred bold small caption under the tracker "Packet In Delivery"; section title "Order Status Details" (bold); vertical timeline of five entries — each entry: a small circled-dot node on a thin vertical line at left, a bold status line ("Order In Transit - Dec 17", "Order … Customs Port - Dec 16", "Orders are … Shipped - Dec 15", "Order is in Packing - Dec 15", "Verified Payments - Dec 15" — middle words partly illegible), a small grey sub-caption line, and a small right-aligned time text
- Components & styling: tracker icons are bare glyphs on a hairline track (the one place a line is used as a connector, not a divider); timeline nodes are small outline circles with a filled centre dot, joined by a thin vertical line; no boxes or shadows
- Typography: title and section title bold; status lines bold body-small; sub-captions and times grey caption size; current-stage caption bold centred
- Colour: black/grey only; colour only in the product photo
- Controls & interaction cues: back arrow, header icon; timeline is display-only
- Pattern(s): BACK-TITLE-HEADER, PRODUCT-LIST-ROW, HORIZONTAL-STEP-TRACKER, DOT-TIMELINE, SECTION-LABEL

## S10-1-2 — partial, top portion (continues as S11-1-1)
- Screen name/type: My Orders — Completed tab, order list
- Purpose: list delivered orders, each offering a review action
- Layout, top to bottom: app header (logo glyph, "My Orders", two circular outline icons); text tabs — "Ongoing" now grey, "Completed" bold black with black underline; first completed order row: light-grey headphone photo thumbnail, bold name "Sonia Headphone", grey meta line, bold price "$325.00", small black pill "Leave Review" at right; a second row begins (bag product) at the slice cut
- Components & styling: as S10-4-1 — mini black pill per row, unboxed rows, space-separated
- Typography: as S10-4-1
- Colour: black/grey; colour only in photos
- Controls & interaction cues: text tabs, Leave Review mini pill
- Pattern(s): TEXT-TABS, PRODUCT-LIST-ROW, MINI-BLACK-PILL-ACTION

## S10-2-2 — partial, top portion (continues as S11-2-1)
- Screen name/type: Leave a Review — bottom sheet over dimmed My Orders
- Purpose: collect a star rating and written review for a delivered item
- Layout, top to bottom: the My Orders screen dimmed dark behind; a white bottom sheet with a strongly rounded top edge rising from the bottom; centred bold sheet title "Leave a Review"; below it the start of a product row (headphone thumbnail edge, bold name "Sonia Headphone", small meta dot/line) — sheet content is cut off by the slice
- Components & styling: sheet is white, large top radius (approx 24px), no border; backdrop dim is uniform dark grey
- Typography: sheet title bold, centred, body-plus size
- Colour: white sheet on dark grey dim; black text
- Controls & interaction cues: bottom sheet presentation (drag-dismiss implied); rest cut off
- Pattern(s): BOTTOM-SHEET-MODAL, DIMMED-BACKDROP, REVIEW-FORM (partial)

## S10-3-2 — partial, top portion (continues as S11-3-1)
- Screen name/type: My E-Wallet — balance card + transaction history head
- Purpose: show wallet balance and recent money movement
- Layout, top to bottom: app header (logo glyph, bold "My E-Wallet", two circular outline icons right); a large black rounded-rectangle card — inside: cardholder name in white at top left, "VISA" wordmark and red/orange card circles at top right, a masked-number dotted line, small grey-on-black label "Your Balance", very large white bold balance "$9,379", and a small white pill button with dark label ("Top Up" with a small icon) at the card's lower right; below the card a section row: bold "Transaction History" left, small "See All" right; the first transaction row starts at the slice cut
- Components & styling: the black card (radius approx 20px) is the one permitted loud element — solid black fill, no border; the Top Up pill inverts the system (white fill, black text) because it sits on black
- Typography: balance is the largest type on any screen in this range (display size, bold, white); card text white/grey-on-black; section title bold black
- Colour: black card with white text; brand colour only in the small card-network circles (red/orange) on the card
- Controls & interaction cues: white Top Up pill on the card, See All text action, header icons
- Pattern(s): BLACK-WALLET-CARD, SECTION-HEADER-SEEALL

## S10-4-2 — partial, top portion (continues as S11-4-1)
- Screen name/type: Top Up E-Wallet — amount entry
- Purpose: choose how much money to add to the wallet
- Layout, top to bottom: header (back arrow, bold title "Top Up E-Wallet"); small grey caption "Enter the amount of top up"; a large rounded-rectangle display field, outlined with a thin dark border, containing a centred very large bold amount "$500"; below it a grid of quick-amount chips, two rows of three — each chip an outlined pill with a centred amount label ("$10", "$20", "$50" / "$100", "$200", "$500"); remainder cut off by the slice
- Components & styling: the amount field is the range's clearest outlined container — rounded rect approx 16px radius, thin outline, white fill; chips are outline pills, no fill; no shadows
- Typography: field amount is display-size bold, centred; chip labels medium; caption grey small
- Colour: black text/outlines on white; no colour
- Controls & interaction cues: six preset amount chips + (below the cut) a Continue pill and keypad per S11-4-1
- Pattern(s): BACK-TITLE-HEADER, AMOUNT-DISPLAY-FIELD, AMOUNT-CHIP-GRID

## S10-5-2 — partial, top portion (continues as S11-5-1)
- Screen name/type: Top Up E-Wallet — top-up method picker (radio list)
- Purpose: choose the funding source for the top-up
- Layout, top to bottom: header (back arrow, bold title "Top Up E-Wallet"); small grey caption "Select the top up method you want to use"; radio rows with brand marks — PayPal (blue logo), Google Pay (multicolour G), Apple Pay (black apple glyph) — each with an outline radio circle at the far right; remainder (card row, Add New Card, Continue) continues in S11-5-1
- Components & styling: same bare radio-row construction as S09-5-2
- Typography: method names medium body; caption grey small
- Colour: black/grey plus brand logo colours (PayPal blue, Google Pay colours)
- Controls & interaction cues: radio rows
- Pattern(s): BACK-TITLE-HEADER, RADIO-ROW-CHOICE, BRAND-ICON-ROW

---

# SLICE 11

## S11-1-1 — partial, bottom portion (head is S10-1-2)
- Screen name/type: My Orders — Completed tab (lower part)
- Purpose: rest of the completed-orders list
- Layout, top to bottom: three completed order rows — an item priced "$540.00" with a "Leave Review" black mini pill; "Puma Sneaker Shoe" with photo thumbnail, grey meta line, "$390.00" and Leave Review pill; "Fujifilm Camera" row beginning at the bottom; below the list a bottom tab bar of five icons (the wallet/bag position appears to be the filled/active one)
- Components & styling: as S10-4-1; thumbnails light grey rounded rects with photos; mini pills solid black
- Typography: names/prices bold body; meta grey caption; pill labels small white
- Colour: black/grey; colour only in photos
- Controls & interaction cues: per-row Leave Review pills, tab bar
- Pattern(s): PRODUCT-LIST-ROW, MINI-BLACK-PILL-ACTION, BOTTOM-TAB-BAR

## S11-2-1 — partial, bottom portion (head is S10-2-2)
- Screen name/type: Leave a Review — rating + text form (lower part of sheet)
- Purpose: capture the star rating, written review and submission
- Layout, top to bottom: at the top edge the reviewed item's price "$325.00"; centred bold question "How is your order?"; one line of small grey centred caption beneath; a row of five stars — four filled black, the fifth an outline star (4/5 rating state); a rounded-rectangle text field containing one line of review text (reads as a positive short sentence) with a small icon at the field's right end; a button pair — light-grey pill "Cancel" (dark label) at left, solid black pill "Submit" (white label) at right, equal widths
- Components & styling: stars are bare glyphs, filled vs outline carries the state; text field is a thin-outline rounded rect (approx 12px radius), white fill; the two pills are the standard quiet/primary pair at half width each
- Typography: question bold body-plus centred; caption grey small centred; field text body size; button labels medium centred
- Colour: black/grey only
- Controls & interaction cues: 5-star rating input, single-line review field, Cancel/Submit pill pair
- Pattern(s): STAR-RATING, REVIEW-FORM, TEXT-FIELD-ROUNDED, MODAL-ACTION-PAIR, QUIET-PILL-BUTTON, BLACK-PILL-CTA

## S11-3-1 — partial, bottom portion (head is S10-3-2)
- Screen name/type: My E-Wallet — transaction history (lower part)
- Purpose: recent wallet transactions with amounts and direction
- Layout, top to bottom: four transaction rows — each: a small circular black medallion with a white glyph (or a small photo thumbnail for product purchases), bold transaction name ("Top Up Wallet", "Warsila Cardigans", "Mini Leather Bag", "Top Up Wallet"), small grey date/time caption beneath, and at right a bold amount ("$500", "$285", "$540", "$550") with a tiny coloured status word/dot beneath it (micro text in red or blue, illegible beyond its colour); bottom tab bar with the wallet icon filled black (active)
- Components & styling: medallions solid black circles; rows unboxed, space-separated; tab bar standard
- Typography: names bold body; captions grey small; amounts bold body right-aligned; status micro-text is the smallest type in the range
- Colour: black/grey; the only colour accents are the tiny red/blue status marks at the right edge of each row
- Controls & interaction cues: tab bar; rows read as tappable list items
- Pattern(s): TRANSACTION-ROW, BOTTOM-TAB-BAR

## S11-4-1 — partial, bottom portion (head is S10-4-2)
- Screen name/type: Top Up E-Wallet — amount entry (lower part)
- Purpose: confirm the chosen top-up amount
- Layout, top to bottom: a full-width solid black pill "Continue"; below it the numeric keypad (1–9 in a 3×3 grid, then blank/dot, 0, backspace glyph), bare numerals on white; home indicator at the bottom
- Components & styling: keypad identical in construction to the PIN screens — no key backgrounds or borders
- Typography: keypad numerals medium-large; pill label medium white centred
- Colour: black on white only
- Controls & interaction cues: Continue pill, numeric keypad with backspace
- Pattern(s): NUMERIC-KEYPAD, BLACK-PILL-CTA

## S11-5-1 — partial, bottom portion (head is S10-5-2)
- Screen name/type: Top Up E-Wallet — method picker (lower part)
- Purpose: card funding option, add-card action and confirmation
- Layout, top to bottom: a card radio row — red/orange overlapping-circles card logo, masked number "•••• 4679", and a filled black radio at the right (selected); below it a full-width light-grey pill "Add New Card" with grey label; a tall stretch of empty white; at the bottom a full-width solid black pill "Continue"
- Components & styling: as the payment family — bare rows, tint quiet pill, solid black primary pill; no borders/shadows
- Typography: masked number medium; button labels medium centred
- Colour: black/grey plus the card logo's red/orange
- Controls & interaction cues: selected card radio, quiet Add New Card pill, primary Continue pill
- Pattern(s): RADIO-ROW-CHOICE, QUIET-PILL-BUTTON, FIXED-BOTTOM-CTA, BLACK-PILL-CTA

## S11-1-2 — full screen
- Screen name/type: Enter Your PIN — top-up confirmation
- Purpose: authorise the wallet top-up with a PIN (same pattern as payment PIN, different caption)
- Layout, top to bottom: header (back arrow, bold title "Enter Your PIN"); grey instruction line "Enter your PIN to confirm top up"; PIN indicator row — three solid black dots and a fourth position as an empty small rounded-square outline (active box, no digit yet); full-width black pill "Continue"; numeric keypad 3×4 (1–9, dot/blank, 0, backspace); home indicator
- Components & styling: identical construction to S10-1-1
- Typography: as S10-1-1
- Colour: black and grey only
- Controls & interaction cues: PIN dots + active box, keypad, Continue pill
- Pattern(s): BACK-TITLE-HEADER, PIN-ENTRY, PIN-DOTS, NUMERIC-KEYPAD, BLACK-PILL-CTA

## S11-2-2 — full screen (modal state)
- Screen name/type: Top Up Successful — confirmation modal over dimmed PIN screen
- Purpose: confirm the top-up succeeded and offer the receipt
- Layout, top to bottom: dimmed dark-grey screen (keypad ghosts behind); centred white rounded card: large solid black circle with a white wallet glyph, tiny decorative dots around it; bold centred title "Top Up Successful!"; one line of small grey centred caption (a success sentence mentioning the amount, partly illegible); black pill "View E-Receipt"; light-grey pill "Cancel" beneath it
- Components & styling: card approx 24px radius, white, borderless; medallion solid black circle; quiet pill tint fill
- Typography: title bold body-plus centred; caption grey small centred
- Colour: black/white/greys; dark dim backdrop
- Controls & interaction cues: primary black pill (receipt), quiet pill (Cancel — here the dismiss action)
- Pattern(s): SUCCESS-MODAL, CENTER-MODAL-CARD, DIMMED-BACKDROP, BLACK-PILL-CTA, QUIET-PILL-BUTTON

## S11-3-2 — full screen (list continues past bottom edge)
- Screen name/type: Transaction History — full wallet ledger
- Purpose: searchable list of all wallet movements
- Layout, top to bottom: header (back arrow, bold title "Transaction History", magnifier icon at right); a long list of about ten transaction rows, same construction as S11-3-1 — thumbnail or black medallion, bold name, grey date caption, right-aligned bold amount with a tiny red/blue status mark beneath: "Suga Leather Shoes $262.5", "Top Up Wallet $500", "Warsila Cardigans $385", "Mini Leather Bag $540", "Top Up Wallet $550", "Zonia Super Watch $850", "Sonia Headphone $325", "Fujifilm Camera $870", "Top Up Wallet $480" and one more row starting at the bottom edge; list is cut by the slice, no tab bar visible in this screen's visible area
- Components & styling: rows unboxed and evenly spaced; amounts form a clean right column
- Typography: names bold body; dates grey caption; amounts bold; status micro-text smallest size
- Colour: black/grey; only accents are the red/blue micro status marks
- Controls & interaction cues: search icon in header; rows tappable (each leads to a receipt, cf. S11-4-2)
- Pattern(s): BACK-TITLE-HEADER, SEARCH-ACTION-HEADER, TRANSACTION-ROW

## S11-4-2 — full screen
- Screen name/type: E-Receipt — transaction receipt with barcode
- Purpose: proof of one purchase, with totals breakdown
- Layout, top to bottom: header (back arrow, bold title "E-Receipt", small circular outline icon right); a large barcode graphic — dense black vertical bars of varying widths, roughly a quarter of the screen height, with a small number string centred beneath it; product row — shoe photo thumbnail, bold name "Suga Leather Shoes", small grey meta line (size/quantity type), a small filled dot icon at right; label–value rows: "Amount" / "$375.00", "Promo" / a negative value "-$92.50"-like, "Total" / a bold right-aligned total; then detail rows: "Payment Methods" / "My E-Wallet", "Date" / a date-and-time string, "Transaction ID" / an alphanumeric string with a small copy icon beside it, "Status" / a small solid black pill badge with white micro-label
- Components & styling: barcode is pure black bars on white, no container; label–value rows are bare text pairs, left label grey, right value dark, no divider lines; status badge is a miniature black pill
- Typography: labels grey body-small; values medium/bold body; total bold; barcode number caption small
- Colour: black/grey only — the whole receipt is monochrome
- Controls & interaction cues: header icon (share/more), copy icon on the transaction ID, status badge is display-only
- Pattern(s): BACK-TITLE-HEADER, BARCODE-RECEIPT, LABEL-VALUE-ROWS, PRODUCT-LIST-ROW, STATUS-BADGE-PILL

## S11-5-2 — full screen
- Screen name/type: E-Receipt — variant with receipt actions beside the barcode
- Purpose: same receipt, with share/download/print offered inline
- Layout, top to bottom: header as S11-4-2 (back arrow, "E-Receipt", circular outline icon); barcode smaller, placed at top-left; to its right a vertical stack of three small icon+label rows (share, download, print — each a small outline icon with a short grey label such as "Share E-Receipt"); product row (shoe thumbnail, bold name, grey meta, dot icon) as S11-4-2; label–value totals (Amount / Promo / Total); detail rows (Payment Methods, Date, Transaction ID with copy icon, Status with small black pill badge)
- Components & styling: action rows are bare icon+text, no buttons or containers; barcode unboxed; badge pill as S11-4-2
- Typography: action labels grey small; rest as S11-4-2
- Colour: black/grey only
- Controls & interaction cues: three receipt action rows, copy icon, header icon
- Pattern(s): BACK-TITLE-HEADER, BARCODE-RECEIPT, ICON-ACTION-LIST, LABEL-VALUE-ROWS, PRODUCT-LIST-ROW, STATUS-BADGE-PILL

---

# SLICE 12

## S12-1-1 — partial, bottom strip only
- Screen name/type: Unidentified screen (bottom edge only); foot of S11-1-2
- Layout: plain white bottom edge with the screen's rounded lower corners; nothing else visible
- Components & styling / Typography / Colour / Controls: nothing visible beyond white ground
- Pattern(s): PARTIAL-SLIVER

## S12-2-1 — partial, bottom strip only
- Screen name/type: Dimmed modal screen (bottom edge only); foot of S11-2-2
- Layout: a dark grey rounded bottom edge — the foot of the dimmed top-up-success screen
- Components & styling / Typography / Colour / Controls: dark grey ground only
- Pattern(s): PARTIAL-SLIVER, DIMMED-BACKDROP

## S12-3-1 — partial, bottom strip only
- Screen name/type: Transaction History (bottom edge only); foot of S11-3-2
- Layout: one last transaction row fragment — product name "Nike Sneaker Shoe" at left, price "$340" at right — above a white bottom edge
- Components & styling / Typography / Colour / Controls: as TRANSACTION-ROW elsewhere; nothing else visible
- Pattern(s): PARTIAL-SLIVER, TRANSACTION-ROW

## S12-4-1 — partial, bottom strip only
- Screen name/type: Unidentified screen (bottom edge only); foot of S11-4-2
- Layout: plain white bottom edge with rounded corners; nothing else visible
- Components & styling / Typography / Colour / Controls: nothing visible beyond white ground
- Pattern(s): PARTIAL-SLIVER

## S12-5-1 — partial, bottom strip only
- Screen name/type: Unidentified screen (bottom edge only); foot of S11-5-2
- Layout: plain white bottom edge with rounded corners; nothing else visible
- Components & styling / Typography / Colour / Controls: nothing visible beyond white ground
- Pattern(s): PARTIAL-SLIVER

## S12-1-2 — full screen
- Screen name/type: Profile — account hub with settings menu
- Purpose: identity summary plus the entry point to every account setting
- Layout, top to bottom: app header (logo glyph, bold "Profile", circular outline icon right); centred large circular avatar photograph (approx 70px) with a small solid black square edit badge (white pencil glyph) overlapping its lower-right edge; centred bold name "Andrew Ainsley"; centred small grey phone-number caption beneath; a menu list of ten rows — each row: small outline icon at left, body-size label, chevron/right-arrow glyph at far right: "Edit Profile", "Address", "Notification", "Payment", "Security", "Language" (this row also carries a grey right-aligned value "English (US)" before the chevron), "Dark Mode", "Privacy Policy", "Help Center", "Invite Friends"; an eleventh row "Logout" whose icon and label are in red/pink rather than black; bottom tab bar — five icons, the profile (rightmost) icon filled black (active)
- Components & styling: avatar is a true circle photo; edit badge is a small rounded square, solid black; menu rows are bare — no dividers, no boxes, spaced evenly; chevrons are small grey/black strokes
- Typography: screen title bold; name bold body-plus centred; phone caption grey small centred; menu labels medium body left-aligned; Logout label same size but red
- Colour: black/grey system; colour in the avatar photo; the single red accent is the Logout row
- Controls & interaction cues: header icon, edit badge on avatar, eleven chevron rows, tab bar
- Pattern(s): APP-HEADER-ACTIONS, AVATAR-HEADER, SETTINGS-MENU-ROW, BOTTOM-TAB-BAR

## S12-2-2 — full screen
- Screen name/type: Edit Profile — account details form
- Purpose: edit name, username, contact details and locale
- Layout, top to bottom: header (back arrow, bold title "Edit Profile", circular outline icon right); a stack of seven form fields, evenly spaced — each field a very light grey filled rounded rectangle (approx 14px radius) with its current value in dark text at left: full name ("Andrew Ainsley"), first name ("Andrew"), username (with a small icon at the field's right end), email address (with a small icon at right), country selector ("United States", dropdown chevron at right), phone number (small US flag graphic + dial code and number), state selector (dropdown chevron at right); a long white gap; fixed bottom black pill "Update"
- Components & styling: fields are tint-filled, borderless, identical height; selector fields distinguished only by the chevron; the flag is the only colour graphic in the form; no field labels outside the fields — values sit inside them
- Typography: field values body size, dark; title bold; button label medium white centred
- Colour: black text and button; light grey field fills; tiny flag colours only
- Controls & interaction cues: seven text/selector fields, two with dropdown chevrons, Update pill
- Pattern(s): BACK-TITLE-HEADER, FORM-FIELD-STACK, SELECT-FIELD, FIXED-BOTTOM-CTA, BLACK-PILL-CTA

## S12-3-2 — full screen
- Screen name/type: Address — saved addresses (settings variant, edit affordance)
- Purpose: manage saved addresses from settings — edit any, add a new one
- Layout, top to bottom: header (back arrow, bold title "Address", circular outline icon right); five address rows — each: solid black circle with white location-pin glyph, bold address name ("Home" — with a small grey "Default" tag beside it — "Office", "Apartment", "Parent's House", "Town Square"), one line of small grey address text, and a pencil edit icon at the far right (note: no radios on this variant — the right-side affordance is edit, not select); long white space; fixed bottom black pill "Add New Address"
- Components & styling: medallions identical to the checkout address family; rows unboxed, undivided; pill solid black
- Typography: names bold body; "Default" tag grey caption; addresses grey caption; title bold
- Colour: black and grey only
- Controls & interaction cues: five pencil edit icons, Add New Address pill
- Pattern(s): BACK-TITLE-HEADER, ICON-MEDALLION-ROW, FIXED-BOTTOM-CTA, BLACK-PILL-CTA

## S12-4-2 — full screen
- Screen name/type: Add New Address — map pin + address details form
- Purpose: create an address by placing it on a map and naming it
- Layout, top to bottom: header (back arrow, bold title "Add New Address", circular outline icon right); a map graphic filling roughly the top 40% — light grey street/block linework on white, with a location pin at its centre: a black teardrop/circular pin whose centre holds a small brown/orange photo-like disc; below the map a bold section heading "Address Details" (centred-left, larger than body); field label "Name Address" (small bold) above a light-grey filled rounded field containing "Apartment"; field label "Address Details" (small bold) above a light-grey filled rounded field containing a one-line street address with a small location-pin icon at the field's right end; a row with a small outline radio circle + small text "Make this as the default address"; fixed bottom black pill "Add"
- Components & styling: map is a flat graphic panel with squared (not rounded) edges bleeding to the screen sides; fields are the same tint-filled borderless rounded rects as Edit Profile, but here they carry small bold labels above them (the labelled variant of the form pattern); pin is solid black with a photographic centre
- Typography: section heading bold body-plus; field labels bold caption-small; field values body; default-address text small
- Colour: map in greys; pin black with a warm photo centre (the only colour); black text/button
- Controls & interaction cues: map pin (drag implied), two text fields, one radio-style default toggle, Add pill
- Pattern(s): BACK-TITLE-HEADER, MAP-PICKER, LOCATION-PIN, FORM-FIELD-STACK, RADIO-ROW-CHOICE, FIXED-BOTTOM-CTA, BLACK-PILL-CTA

## S12-5-2 — full screen
- Screen name/type: Notification — settings toggle list
- Purpose: switch ten notification/preference categories on or off
- Layout, top to bottom: header (back arrow, bold title "Notification", circular outline icon right); ten toggle rows, evenly spaced — label at left (body size, dark), toggle switch at far right: "General Notification" ON, "Sound" ON, "Vibrate" OFF, "Special Offers" ON, "Promo & Discount" OFF, "Payments" ON, "Cashback" OFF, "App Updates" ON, "New Service Available" OFF, "New Tips Available" OFF; the screen ends after the last row with white space
- Components & styling: toggle ON = solid black pill track with a white knob at the right end; toggle OFF = light grey pill track with a white/light knob at the left end; rows have no dividers, icons or containers — label + switch only
- Typography: title bold; labels medium body, left-aligned; no captions on this screen
- Colour: black (on-toggles, text) and light grey (off-toggles) only
- Controls & interaction cues: ten toggle switches
- Pattern(s): BACK-TITLE-HEADER, TOGGLE-ROW

## S12-1-3 — partial, top portion only
- Screen name/type: Payment — connected payment accounts (settings)
- Purpose: show which payment services are linked
- Layout, top to bottom: header (back arrow, bold title "Payment", circular outline icon right); first row — PayPal logo at left, "PayPal" label, and a grey right-aligned status word "Connected"; cut off below (further rows not visible)
- Components & styling: bare row, no container; status text is plain grey, not a badge
- Typography: title bold; label medium body; status grey body-small
- Colour: black/grey plus PayPal blue in the logo
- Controls & interaction cues: back arrow, header icon; row implied tappable
- Pattern(s): BACK-TITLE-HEADER, BRAND-ICON-ROW (partial)

## S12-2-3 — partial, top portion only
- Screen name/type: Add New Card — card entry with card preview
- Purpose: add a payment card
- Layout, top to bottom: header (back arrow, bold title "Add New Card", circular outline icon right); below it the top portion of a large black rounded-rectangle card graphic — dark fill with small white text fragments at its top edge (card brand/scheme marks, illegible at this resolution); cut off below (form fields not visible)
- Components & styling: card graphic uses the same solid-black, approx 20px radius construction as the wallet card
- Typography: title bold; card text small white
- Colour: black card on white; white micro-text
- Controls & interaction cues: header only in the visible part
- Pattern(s): BACK-TITLE-HEADER, BLACK-WALLET-CARD (partial)

## S12-3-3 — partial, top portion only
- Screen name/type: Security — security preferences (toggle rows)
- Purpose: manage sign-in/security options
- Layout, top to bottom: header (back arrow, bold title "Security"); row "Remember me" with an ON toggle (black track, white knob) at right; row "Face ID" with an OFF/light toggle at right; cut off below
- Components & styling: toggles identical to S12-5-2; rows bare
- Typography: title bold; labels medium body
- Colour: black and light grey only
- Controls & interaction cues: two toggle switches visible
- Pattern(s): BACK-TITLE-HEADER, TOGGLE-ROW (partial)

## S12-4-3 — partial, top portion only
- Screen name/type: Language — language picker (radio list)
- Purpose: choose the app language
- Layout, top to bottom: header (back arrow, bold title "Language"); bold section label "Suggested"; a row "English (US)" with a filled black radio at the far right (selected); cut off below (further language rows not visible)
- Components & styling: radio as in the checkout family — solid black fill when selected; row bare on white
- Typography: title and section label bold; language name medium body
- Colour: black and grey only
- Controls & interaction cues: radio row(s)
- Pattern(s): BACK-TITLE-HEADER, SECTION-LABEL, RADIO-ROW-CHOICE (partial)

## S12-5-3 — partial, top portion only
- Screen name/type: Privacy Policy — long-form text page
- Purpose: present legal text
- Layout, top to bottom: header (back arrow, bold title "Privacy Policy"); bold numbered section heading "1. Types of Data We Collect"; several lines of small grey body text beneath (paragraph wording illegible at this resolution); cut off below
- Components & styling: pure text page — no containers, icons or controls in the visible part
- Typography: heading bold body-plus; body text small grey, left-aligned, comfortable line spacing — the only caption-density text block in the range
- Colour: black heading, grey body text, white ground
- Controls & interaction cues: back arrow only
- Pattern(s): BACK-TITLE-HEADER, TEXT-ARTICLE (partial)

---

## Pattern frequency in this range

Counted across all 50 inventoried screens in slices 09–12, including partials
(a pattern counts once per screen it appears on; partial-only appearances are
included in the number).

| Pattern | Screens |
|---|---|
| BACK-TITLE-HEADER | 21 |
| BLACK-PILL-CTA | 18 |
| FIXED-BOTTOM-CTA | 9 |
| PRODUCT-LIST-ROW | 7 |
| RADIO-ROW-CHOICE | 6 |
| BOTTOM-TAB-BAR | 5 |
| PARTIAL-SLIVER | 10 |
| QUIET-PILL-BUTTON | 5 |
| APP-HEADER-ACTIONS | 3 |
| BRAND-ICON-ROW | 3 |
| DIMMED-BACKDROP | 3 |
| MINI-BLACK-PILL-ACTION | 3 |
| RADIO-ROW-WITH-ICON | 3 |
| SECTION-LABEL | 3 |
| TEXT-TABS | 3 |
| TRANSACTION-ROW | 3 |
| BARCODE-RECEIPT | 2 |
| BLACK-WALLET-CARD | 2 |
| CENTER-MODAL-CARD | 2 |
| FORM-FIELD-STACK | 2 |
| LABEL-VALUE-ROWS | 2 |
| MODAL-ACTION-PAIR | 2 |
| NUMERIC-KEYPAD | 3 |
| PIN-DOTS | 2 |
| PIN-ENTRY | 2 |
| REVIEW-FORM | 2 |
| SEARCH-ACTION-HEADER | 2 |
| STATUS-BADGE-PILL | 2 |
| SUCCESS-MODAL | 2 |
| TOGGLE-ROW | 2 |
| AMOUNT-CHIP-GRID | 1 |
| AMOUNT-DISPLAY-FIELD | 1 |
| AVATAR-HEADER | 1 |
| BOTTOM-SHEET-MODAL | 1 |
| DOT-TIMELINE | 1 |
| EMPTY-STATE | 1 |
| HORIZONTAL-STEP-TRACKER | 1 |
| ICON-ACTION-LIST | 1 |
| ICON-MEDALLION-ROW | 1 |
| ICON-ROW | 1 |
| LOCATION-PIN | 1 |
| MAP-PICKER | 1 |
| PRICE-ACTION-BAR | 1 |
| PRODUCT-GRID-TILE | 1 |
| REVIEW-ROW | 1 |
| SECTION-HEADER-SEEALL | 1 |
| SELECT-FIELD | 1 |
| SETTINGS-MENU-ROW | 1 |
| STAR-RATING | 1 |
| TEXT-ARTICLE | 1 |
| TEXT-FIELD-ROUNDED | 1 |

**Screens inventoried: 50** (slice 09: 15, slice 10: 10, slice 11: 10, slice 12: 15),
of which 20 are full screens, 20 are substantial partials (roughly half or more
visible), and 10 are edge slivers showing only a status bar, a screen foot, or a
dark dim strip.
