# Evira board inventory — inv-04 (slices 13–16)

Scope: slices 13, 14, 15, 16 of the board (5 phone columns per row; slices cut
through rows, so partial screens at slice edges are inventoried as partials).
Total screens inventoried: **31** (10 in slice 13, 10 in slice 14, 8 in
slice 15, 3 angled mockups in slice 16).

Reading notes: text quoted verbatim only where legible at this resolution;
otherwise the kind of text is described. "Partial" means the slice boundary
cuts the phone, so only part of the screen is visible.

---

# SLICE 13

Slice 13 row 1 = bottom portions of five screens whose tops belong to the row
above. Slice 13 row 2 = five near-complete screens.

## S13-1-1
- Screen name/type: Payment methods — connected wallets/cards list (partial, top cut off)
- Purpose: Show which payment methods are connected and offer adding a new card.
- Layout, top to bottom: (top cut) three payment rows, each ≈12% of screen height — row 1: multicolour "G" logo + "Google Pay" label left, small "Connected" status right; row 2: black Apple logo + "Apple Pay", "Connected" right; row 3: red/orange overlapping-circles card logo + masked number text (ends "4679"), "Connected" right; large empty white space below rows; full-width black pill button "Add New Card" pinned near the bottom.
- Components & styling: rows are plain on white — no borders, no dividers, no shadows; status text is small and grey/black, unboxed; bottom button is a solid black full-width pill (height ≈7% of screen).
- Typography: row labels medium-weight black, body size; "Connected" smaller; button label white, centred, sentence case.
- Colour: black text on white; colour appears ONLY in the brand logos (Google "G", Mastercard circles). Everything else monochrome.
- Controls & interaction cues: tappable rows implied; one primary black pill CTA at bottom.
- Pattern(s): SETTINGS-ROW-LIST, BRAND-ICON-ROW, BLACK-PILL-CTA, STATUS-TEXT-RIGHT

## S13-2-1
- Screen name/type: Add New Card — card details form (partial, top cut off)
- Purpose: Enter a new payment card's details.
- Layout, top to bottom: (top cut) bottom ≈60% of a black credit-card graphic spanning full width — dotted masked number line across it and a small white/grey toggle-like switch graphic at its lower right; form stack below: label "Card Name" + value line beneath; label "Card Number" + digit-group value beneath; two-column row: "Expiry Date" + value (with a small calendar-ish icon) | "CVV" + value; large white gap; full-width black pill button "Add" at bottom.
- Components & styling: the card graphic is a solid black rounded rectangle (radius ≈16–20px) — the screen's one loud element; form fields are NOT boxed: just a bold-ish small label over a lighter value line, no underlines visible; bottom button solid black pill.
- Typography: field labels small, dark, semi-bold; values smaller and grey; button white centred sentence case.
- Colour: black card graphic and black CTA; all text black/grey on white; no other colour.
- Controls & interaction cues: text entry fields (label-over-value style), calendar affordance on expiry, primary "Add" pill.
- Pattern(s): BLACK-CARD-GRAPHIC, FORM-FIELD-STACK, LABEL-OVER-VALUE-FIELD, BLACK-PILL-CTA

## S13-3-1
- Screen name/type: Security settings (partial, top cut off)
- Purpose: Manage sign-in security: biometrics, authenticator, PIN/password changes.
- Layout, top to bottom: (top cut) row: "Biometric ID" label left, toggle switch right (ON — black track, white knob at right); row: "Google Authenticator" label left, small chevron ">" right; two stacked full-width light-grey filled pill buttons: "Change PIN", "Change Password"; remaining ≈55% of screen is empty white.
- Components & styling: rows plain on white, no borders/dividers; toggle is a black pill track with white circular knob; the two action buttons are light-grey filled pills (radius fully round) with black centred text — quiet/filled, NOT outlined and NOT black.
- Typography: row labels body-size black; button labels body-size black, centred, sentence case.
- Colour: monochrome — black toggle and text, light grey button fills, white ground.
- Controls & interaction cues: one toggle switch (on), one chevron disclosure row, two grey pill action buttons.
- Pattern(s): SETTINGS-ROW-LIST, TOGGLE-ROW, CHEVRON-ROW, GREY-PILL-ACTION-BUTTON

## S13-4-1
- Screen name/type: Settings — language radio list (partial, top cut off)
- Purpose: Choose the app language from a single-select list.
- Layout, top to bottom: (top cut) one row "English (UK)" with a radio circle at right (belongs to a section whose header is cut off); bold section header "Language"; then evenly spaced rows, each a language name left + radio circle right: Mandarin, Hindi, Spanish, French, Arabic, Bengali, Russian, Indonesia (bottom row partially visible). Rows take ≈8% of screen height each; generous white space between.
- Components & styling: rows plain on white — no borders, no dividers, no row backgrounds; radio controls are thin-outline empty circles (≈18px) at the right edge; none shows a filled centre at this resolution.
- Typography: language names body-size black, left-aligned, sentence case; section header same size but bold black.
- Colour: entirely monochrome black/grey on white.
- Controls & interaction cues: single-select radio group, one radio per row, whole row tappable implied.
- Pattern(s): SETTINGS-ROW-LIST, RADIO-ROW-LIST, SECTION-HEADER-INLINE

## S13-5-1
- Screen name/type: Privacy Policy — long-form legal text (partial, top and bottom cut)
- Purpose: Present the privacy policy as numbered sections of body text.
- Layout, top to bottom: dense block of small body text filling the full width (continuation of a section from above); bold numbered section heading "2. Use of Your Personal Data"; another dense multi-line body block; bold numbered heading "3. Disclosure of Your Personal Data"; further body text continuing past the bottom edge. Text occupies ≈90% of the visible screen; narrow side margins.
- Components & styling: no cards, boxes, icons or buttons visible — pure text column on white; no dividers.
- Typography: body text small (caption-to-body size), grey-dark, justified-looking block paragraphs; headings body-size, bold, black, sentence case with leading numeral.
- Colour: monochrome; headings black, body a softer dark grey.
- Controls & interaction cues: none visible — scroll-only reading screen.
- Pattern(s): LONG-FORM-TEXT, NUMBERED-SECTION-HEADINGS

## S13-1-2
- Screen name/type: Invite Friends — contact list (all "Invite" state)
- Purpose: Invite contacts to the app.
- Layout, top to bottom: status bar (9:41, signal/wifi/battery); header row: back arrow left + bold title "Invite Friends"; six contact rows, each ≈11% of height: circular avatar photo left (≈40px), name in bold black with a small grey phone-number caption beneath, small solid black pill button "Invite" with white text at right.
- Components & styling: rows plain on white, no borders/dividers/shadows; avatars are full circles (photos in colour); buttons are small fully-rounded black pills (≈64×28px).
- Typography: names body-size bold black; captions small grey; button labels small white sentence case.
- Colour: black buttons and text; colour only in avatar photos.
- Controls & interaction cues: back arrow; per-row "Invite" pill buttons.
- Pattern(s): BACK-HEADER, AVATAR-CONTACT-ROW, SMALL-BLACK-PILL-BUTTON

## S13-2-2
- Screen name/type: Invite Friends — contact list (mixed Invite/Invited states)
- Purpose: Same invite list showing which contacts are already invited.
- Layout, top to bottom: identical structure to S13-1-2 — status bar; back arrow + "Invite Friends" title; six avatar/name/phone rows. Button states differ per row: rows 1, 5 (and the pattern repeats) show solid black "Invite" pills; rows 2, 3, 4 show white/empty OUTLINE pill buttons labelled "Invited" in black.
- Components & styling: same plain rows; the "Invited" buttons are outline-only pills (thin black border, white fill, black text) — the only outlined buttons in this range alongside filter chips; no shadows anywhere.
- Typography: same as S13-1-2; "Invited" label black, small.
- Colour: monochrome; colour only in avatar photos.
- Controls & interaction cues: state-dependent pill buttons (filled = actionable, outline = already invited).
- Pattern(s): BACK-HEADER, AVATAR-CONTACT-ROW, SMALL-BLACK-PILL-BUTTON, OUTLINE-PILL-BUTTON

## S13-3-2
- Screen name/type: Help Center — FAQ tab with category chips, search, accordion
- Purpose: Browse/search frequently asked questions by category.
- Layout, top to bottom: status bar; header: back arrow + bold "Help Center" title + circular outline icon button at right; two text tabs "FAQ" (active — black label with thick black underline) and "Contact us" (grey label); horizontal chip row: "General" solid black pill with white text, then outline pills "Account", "Service", "Payment" (row runs off the right edge); search field: light-grey filled rounded rect (≈14px radius) with magnifier icon left, placeholder text, small sliders icon right; accordion item 1: bold question "What is Evira?" + small black chevron-down at right, expanded answer = three lines of small grey placeholder-style body text; accordion item 2 (collapsed, at bottom edge): bold "How to use Evira?" + chevron.
- Components & styling: tabs are text + underline only (no pill background); chips fully rounded — active solid black, inactive thin-outline white; search field light tint fill, no border; accordion rows plain on white separated by space; no shadows.
- Typography: title large bold black; tab labels body-size (active black, inactive grey); chip labels small; question text body-size bold black; answer small grey.
- Colour: monochrome throughout.
- Controls & interaction cues: underline tabs, filter chips (single-select), search input, expandable accordion rows with chevrons.
- Pattern(s): BACK-HEADER, UNDERLINE-TAB-BAR, FILTER-CHIP-ROW, SEARCH-FIELD, FAQ-ACCORDION

## S13-4-2
- Screen name/type: Help Center — FAQ tab, search active with results list
- Purpose: Show FAQ results filtered by a typed search query.
- Layout, top to bottom: status bar; back arrow + "Help Center" + circular outline icon right; "FAQ" active underline tab, "Contact us" grey; same chip row ("General" solid black; "Account", "Service", "Payment" outline); search field now in focused style — white fill with a dark outline border, magnifier icon, typed text "Why I" in black, sliders icon right; results list of plain question rows in dark text, evenly spaced: "Why did my payment didn't working?", "Why are the shipping prices different?", "Why I can't add a new payment method?", "Why didn't I get the e-receipt after payment?"; at bottom, one collapsed accordion row "How to use Evira?" with chevron-down.
- Components & styling: search field switches from tint fill (idle) to white + outline (focused); result rows are bare text lines — no boxes, borders, icons or chevrons; no shadows.
- Typography: result questions body-size, regular weight, black; same header/tab/chip typography as S13-3-2.
- Colour: monochrome.
- Controls & interaction cues: text search with live result list; tappable question rows; accordion row.
- Pattern(s): BACK-HEADER, UNDERLINE-TAB-BAR, FILTER-CHIP-ROW, SEARCH-FIELD-FOCUSED, SEARCH-RESULT-LIST, FAQ-ACCORDION

## S13-5-2
- Screen name/type: Help Center — Contact us tab (channel list)
- Purpose: Offer contact channels: support chat, WhatsApp, website, socials.
- Layout, top to bottom: status bar; back arrow + "Help Center" title + square-ish outline icon button right; tabs: "FAQ" grey, "Contact us" active (black label, black underline, right-aligned under its label); channel rows, each ≈13% of height, widely spaced: small circular icon left + label — headset icon "Customer Service", chat-bubble icon "WhatsApp", globe icon "Website", "f" logo in a filled black circle "Facebook", bird logo "Twitter" (bottom row partially visible).
- Components & styling: rows plain on white, no borders/dividers/shadows; icons are small black glyphs, several inside thin-outline or filled circles ≈32px; generous vertical spacing does the grouping.
- Typography: header/tab typography as S13-3-2; row labels body-size black, medium weight.
- Colour: monochrome — brand channels are rendered as black glyphs, not brand colours.
- Controls & interaction cues: underline tabs; tappable channel rows.
- Pattern(s): BACK-HEADER, UNDERLINE-TAB-BAR, CONTACT-CHANNEL-ROW, SETTINGS-ROW-LIST

---

# SLICE 14

Slice 14 row 1 = bottom strips of the Invite Friends / Help Center screens
from the row above (continuations). Slice 14 row 2 = five near-complete
screens: Home, two Checkout states, two Customer Service chat states.

## S14-1-1
- Screen name/type: Invite Friends — list continuation (partial, top cut off)
- Purpose: Continuation of the invite contact list (rows below the fold of S13-1-2/S13-2-2).
- Layout, top to bottom: four contact rows visible (top row cut): circular avatar + bold name + small grey phone caption + small solid black pill "Invite" at right — Tyra Dhillon, Jamel Eusebio, Pedro Huard, Clinton Mcclure (last row cut at bottom). White space below.
- Components & styling: identical to S13-1-2 rows — plain white rows, circular photo avatars, small black fully-rounded pills; no borders or shadows.
- Typography: names bold black body-size; captions small grey; button labels small white.
- Colour: monochrome except avatar photos.
- Controls & interaction cues: per-row "Invite" buttons.
- Pattern(s): AVATAR-CONTACT-ROW, SMALL-BLACK-PILL-BUTTON

## S14-2-1
- Screen name/type: Invite Friends — list continuation, mixed states (partial, top cut off)
- Purpose: Continuation of the mixed-state invite list (cf. S13-2-2).
- Layout, top to bottom: four rows visible: Tyra Dhillon — solid black "Invite" pill; Jamel Eusebio — outline "Invited" pill; Pedro Huard — solid black "Invite" pill; Clinton Mcclure — row cut at bottom. Same avatar/name/phone-caption structure.
- Components & styling: filled vs outline small pills mark state; rows otherwise identical, unboxed, no dividers.
- Typography: as S14-1-1.
- Colour: monochrome except avatar photos.
- Controls & interaction cues: state-dependent invite pills.
- Pattern(s): AVATAR-CONTACT-ROW, SMALL-BLACK-PILL-BUTTON, OUTLINE-PILL-BUTTON

## S14-3-1
- Screen name/type: Help Center FAQ — accordion continuation (partial, top cut off)
- Purpose: Continuation of the FAQ accordion list below the fold.
- Layout, top to bottom: three collapsed accordion rows visible, each a bold-ish question line with a small black chevron-down at the right: "How do I cancel a orders product?", "Is Evira free to use?", "How to add promo on Evira?"; large white space below.
- Components & styling: bare text rows on white; no boxes, borders or shadows; chevrons small filled black triangles/chevrons.
- Typography: questions body-size black, medium weight, sentence case.
- Colour: monochrome.
- Controls & interaction cues: expandable accordion rows.
- Pattern(s): FAQ-ACCORDION

## S14-4-1
- Screen name/type: Help Center — screen bottom with on-screen keyboard raised (partial)
- Purpose: Bottom portion of a Help Center screen while the system keyboard is open (search typing state).
- Layout, top to bottom: mostly empty white content area (upper part cut); at bottom a full QWERTY on-screen keyboard: three letter rows of light-grey rounded keys with black letters, a bottom row with a "123" key, wide "space" bar, emoji icon key and microphone icon; a thin home-indicator bar beneath.
- Components & styling: keyboard is the standard light-grey system keyboard — keys are light grey rounded rects with soft shadow, black glyphs; the app content above is plain white.
- Typography: key letters black, sentence/upper mix as per keyboard convention.
- Colour: greys and black only.
- Controls & interaction cues: QWERTY keypad with 123/space/emoji/mic keys.
- Pattern(s): KEYBOARD-RAISED

## S14-5-1
- Screen name/type: Help Center — Contact us channel list continuation (partial, top cut off)
- Purpose: Continuation of the contact channel list: one visible row.
- Layout, top to bottom: a single channel row near the top: small camera-glyph icon in a circle + label "Instagram"; the rest of the visible screen is empty white to the bottom edge (phone's rounded bottom corner visible).
- Components & styling: plain row on white, no border/divider; icon monochrome black.
- Typography: label body-size black.
- Colour: monochrome.
- Controls & interaction cues: tappable channel row.
- Pattern(s): CONTACT-CHANNEL-ROW, SETTINGS-ROW-LIST

## S14-1-2
- Screen name/type: Home — shop front (greeting header, search, promo, categories, popular)
- Purpose: Store home: greet user, search, promote an offer, browse categories and popular products.
- Layout, top to bottom: status bar (9:41); greeting header (≈9%): circular avatar photo left, small grey caption "Good Morning" with a wave emoji above bold black name "Andrew Ainsley"; two circular outline icon buttons at right (bell, heart); search field: light-grey filled pill/rounded rect with magnifier icon + placeholder left and sliders icon right; section header row: bold "Special Offers" left, smaller "See All" right; promo card (≈18%): light-grey rounded rect (radius ≈20px) — left side: very large bold "30%", bold "Today's Special!" beneath, two lines of tiny grey caption, small black pagination dot near bottom; right ≈45% is a full-colour fashion photo bleeding to the card's right edge; category medallion grid: two rows of four — light-grey filled circles (≈52px) with a black category glyph, small black label beneath (Clothes, Shoes, Bags, Electronics / Watch, Jewelry, Kitchen, Toys); section header "Most Popular" + "See All"; filter chip row: "All" solid black pill (white text), "Clothes", "Shoes", "Bags", "Ele…" outline pills (row runs off right edge); bottom edge: tops of two product cards — light photo tiles with a small black circular button at the tile's top-right corner.
- Components & styling: search and promo use light tint fills, no borders; medallions are tint-filled circles with black stroke-style glyphs; chips fully rounded, active solid black / inactive outline; product tiles light grey rounded rects (≈16px radius); no shadows visible anywhere; grouping is by white space.
- Typography: name and section headers bold black, ≈headline size for "30%"; greeting caption small grey; category labels small black; chip labels small.
- Colour: black text and active states; light grey tints for search/promo/medallion fills; colour appears only in the promo photo and avatar photo.
- Controls & interaction cues: icon buttons, search field with filter affordance, tappable promo card, category medallions, filter chips, product cards with corner buttons.
- Pattern(s): GREETING-HEADER, SEARCH-FIELD, SECTION-HEADER-SEEALL, PROMO-CARD, CATEGORY-MEDALLION-GRID, FILTER-CHIP-ROW, PRODUCT-CARD

## S14-2-2
- Screen name/type: Checkout — shipping address + order list (state A)
- Purpose: Review delivery address and the items being bought before payment.
- Layout, top to bottom: status bar; header: back arrow + bold "Checkout" title + circular outline icon button right; section header "Shipping Address" (bold); address row (≈9%): solid black circle with white location-pin glyph left, bold "Home" label with a small grey one-line address caption beneath, pencil/edit icon at right; section header "Order List"; three order item rows, each ≈14%: product photo in a light rounded tile at left (≈25% width), bold product name ("Werolla Cardigans", "Suga Leather Shoes", "Vinia Headphone" — third row cut at bottom edge), small grey variant line with a tiny colour dot (colour | size text), bold price ("$385.00", "$375.00", "$360.00"), and a small light circle containing the quantity "1" at the row's right edge.
- Components & styling: address row and item rows sit on white with at most a barely-visible soft shadow — no borders, no dividers; photo tiles light tint rounded rects; the pin badge is a filled black circle; quantity shown as a small plain circle with a numeral, not a stepper.
- Typography: title and section headers bold black; item names bold body-size; variant captions small grey; prices bold black.
- Colour: monochrome UI; colour only in product photos and the tiny variant colour dots.
- Controls & interaction cues: back arrow, header icon button, edit (pencil) affordance on the address, quantity indicator per item.
- Pattern(s): BACK-HEADER, SECTION-HEADER-INLINE, ADDRESS-ROW, ORDER-ITEM-ROW

## S14-3-2
- Screen name/type: Checkout — shipping address + order list (state B, near-duplicate of state A)
- Purpose: Same checkout review screen; no visible difference from S14-2-2 within the visible region (same address row, same three order items, prices and quantities) — the difference between the two states, if any, lies below the slice's cut.
- Layout, top to bottom: identical to S14-2-2: status bar; back arrow + "Checkout" + circular outline icon; "Shipping Address" header; black pin-circle address row "Home" with grey address caption and pencil icon; "Order List" header; item rows Werolla Cardigans $385.00, Suga Leather Shoes $375.00, Vinia Headphone $360.00 (cut), each with variant line, colour dot and quantity "1" circle.
- Components & styling: as S14-2-2 — unboxed rows, light photo tiles, filled black pin badge, no borders/shadows.
- Typography: as S14-2-2.
- Colour: as S14-2-2.
- Controls & interaction cues: as S14-2-2.
- Pattern(s): BACK-HEADER, SECTION-HEADER-INLINE, ADDRESS-ROW, ORDER-ITEM-ROW

## S14-4-2
- Screen name/type: Customer Service — chat conversation
- Purpose: Text chat with customer support.
- Layout, top to bottom: status bar; header: back arrow + bold "Customer Service" title + two circular outline icon buttons right (phone, more); centred tiny grey date label "Today"; message thread: incoming bubbles left — light-grey filled rounded rects (radius ≈16px, smaller corner at the tail side) with black multi-line text, small grey timestamps beside/below, some ending with an emoji; outgoing bubbles right — SOLID BLACK rounded rects with white text ("Hi, I'm having problems with my order & payment", "Can you help me?"), small grey timestamps; alternating support replies in grey bubbles ("Of course…", "Can you tell me the problem you are having? so I can help solve it"); at the bottom right a solid black circular button (≈48px) with a white icon (compose/mic-style glyph). No tab bar.
- Components & styling: bubbles are the only filled shapes — light grey for incoming, solid black for outgoing; no borders; timestamps tiny grey; header icon buttons thin-outline circles with black glyphs.
- Typography: title bold black; bubble text body-size (black on grey, white on black); timestamps caption-size grey.
- Colour: monochrome; emoji inside messages are the only colour.
- Controls & interaction cues: back, call and more buttons; chat thread; black circular action button.
- Pattern(s): BACK-HEADER, CHAT-BUBBLES, CHAT-ACTION-BUTTON

## S14-5-2
- Screen name/type: Customer Service — chat with message input and keyboard raised
- Purpose: Same support chat while composing a message.
- Layout, top to bottom: status bar; back arrow + "Customer Service" + two circular outline icon buttons; "Today" date label; thread: two outgoing SOLID BLACK bubbles right with white text, incoming light-grey bubbles left with black text and emoji, grey timestamps; message input row: light-grey filled pill field with placeholder text ("Type a problem…" style) and a small emoji icon inside at right, plus a solid black circular button (≈44px) with a white microphone/send glyph at the row's right; below, the full QWERTY system keyboard (light-grey keys, black letters, "123" key, wide space bar, emoji and mic keys) occupying the bottom ≈35%.
- Components & styling: input field is a tint-filled pill, no border; send/compose button solid black circle; bubbles as S14-4-2; keyboard standard light grey.
- Typography: as S14-4-2; placeholder grey.
- Colour: monochrome; emoji only.
- Controls & interaction cues: text input pill, black circular send button, raised keyboard.
- Pattern(s): BACK-HEADER, CHAT-BUBBLES, CHAT-INPUT-BAR, KEYBOARD-RAISED

---

# SLICE 15

Slice 15 row 1 shows the lower portions of three screens (cols 1–3) plus thin
bottom-edge slivers of two further screens at the top edge (cols 4–5 area).
Slice 15 row 2 cuts through the board's final angled-mockup row: only the tops
of the three mockup phones are visible (fully inventoried in slice 16).

## S15-1-1
- Screen name/type: Home — product grid continuation with bottom tab bar (partial, top cut off)
- Purpose: Lower half of the shop home: the Most Popular product grid and main navigation.
- Layout, top to bottom: two-column product grid, three rows visible (top row cut): each card = light-grey rounded photo tile (≈16px radius) with a small solid black circular button (white heart-style glyph) overlapping the tile's top-right corner; beneath the tile: small bold product name ("Snake Leather Bag", "Suga Leather Shoes", "Leather Casual Suit", "Black Leather Bag", "Airflight Microphone", "Black Nike Shoes"), a tiny grey rating/sold line, bold price ("$445.00", "$375.00", "$420.00", "$61.00", "$392.00", "$582.00"); bottom tab bar (≈9%): five stroke-icon tabs with tiny labels on white — Home (filled black icon, black label = active), then four outline/grey icons (bag, heart-style, wallet/cart-style, profile).
- Components & styling: cards are unboxed — photo tile + text lines on white, no card border or shadow; corner button is a small black filled circle; tab bar is plain white with no visible top border or shadow; icons stroke style, active filled black.
- Typography: product names small bold black; meta line tiny grey; prices bold black; tab labels tiny (active black, inactive grey).
- Colour: monochrome UI; colour only in product photos.
- Controls & interaction cues: product cards, per-card circular favourite button, 5-tab bottom navigation.
- Pattern(s): PRODUCT-GRID-2COL, PRODUCT-CARD, TAB-BAR-5

## S15-2-1
- Screen name/type: Checkout — lower half, shipping & promo NOT yet chosen (partial, top cut off)
- Purpose: Second half of checkout: pick shipping, enter promo, review totals, continue.
- Layout, top to bottom: (top cut) last order item row: light photo tile (watch photo) + bold "Zania Super Watch" + small grey variant line + bold "$850.00" + quantity "1" circle at right; section header "Choose Shipping" (bold); shipping row: small black truck glyph icon + text "Choose Shipping Type" + chevron ">" at right; section header "Promo Code"; promo row: light-grey filled rounded input field with faint placeholder text, and a separate solid black circular button (≈40px, white "+"-style glyph) at its right; totals block: three label/value rows in muted grey — "Amount" with a faint "$1,970" value, "Shipping" with a dash, "Total" with a dash (values right-aligned); full-width solid black pill button "Continue to Payment" with a small white arrow at the label's right, near the bottom.
- Components & styling: section rows plain on white; input light tint fill, no border; totals are bare label/value text rows — no box, no divider lines; CTA solid black pill; no shadows.
- Typography: section headers bold black; row text body black; totals labels/values smaller, grey in this unfilled state; button white centred sentence case.
- Colour: monochrome.
- Controls & interaction cues: shipping selector row with chevron, promo input + black circular apply button, primary black pill CTA.
- Pattern(s): ORDER-ITEM-ROW, SECTION-HEADER-INLINE, CHECKOUT-SECTION-STACK, TOTALS-TABLE, BLACK-PILL-CTA, BLACK-CIRCLE-BUTTON

## S15-3-1
- Screen name/type: Checkout — lower half, shipping chosen & promo applied (partial, top cut off)
- Purpose: Same checkout half in its completed state: shipping selected, discount applied, totals computed.
- Layout, top to bottom: (top cut) same Zania Super Watch order row ($850.00, qty 1); "Choose Shipping" header; selected shipping row: solid black circle with white truck glyph, bold "Regular" + small grey estimated-arrival caption beneath, bold "$15" and a pencil/edit icon at right; "Promo Code" header; applied promo: solid black pill chip with white text "Discount 30% Off" and a small "×" at its right end, plus a separate solid black circular "+" button beside it; totals block (now black, filled in): "Amount $1,970.00", "Shipping $15.00", "Promo −$391.00", "Total $1,594.00" — labels left, values right-aligned; full-width black pill "Continue to Payment →" at bottom.
- Components & styling: selected shipping uses the filled-black-circle badge (same shape language as the address pin in S14-2-2); promo chip is a black pill, not a tinted tag; totals remain bare text rows without a box; no shadows or dividers.
- Typography: section headers bold black; "Regular" bold; caption small grey; totals body-size, labels regular black, values black (total not enlarged); button white centred.
- Colour: monochrome.
- Controls & interaction cues: edit affordance on shipping, removable promo chip (×), add-promo circle button, primary CTA.
- Pattern(s): ORDER-ITEM-ROW, SECTION-HEADER-INLINE, CHECKOUT-SECTION-STACK, PROMO-CHIP-APPLIED, TOTALS-TABLE, BLACK-PILL-CTA, BLACK-CIRCLE-BUTTON

## S15-4-1
- Screen name/type: Unidentifiable screen — bottom-edge sliver (partial)
- Purpose: Cannot be determined: only a thin white strip with the rounded bottom corner of a phone is visible at the top edge of the slice (columns 4 area).
- Layout, top to bottom: a ≈2%-of-slice-height white sliver showing a phone's rounded bottom corners; no UI elements visible.
- Components & styling: white phone body on the board's light-grey background; no content discernible.
- Typography: none visible.
- Colour: white/grey only.
- Controls & interaction cues: none visible.
- Pattern(s): PARTIAL-SCREEN-SLIVER

## S15-5-1
- Screen name/type: Unidentifiable screen — bottom-edge sliver (partial)
- Purpose: Cannot be determined: a second thin white strip with a phone's rounded bottom corner at the top edge of the slice (column 5 area).
- Layout, top to bottom: as S15-4-1 — sliver only, no UI elements.
- Components & styling: as S15-4-1.
- Typography: none visible.
- Colour: white/grey only.
- Controls & interaction cues: none visible.
- Pattern(s): PARTIAL-SCREEN-SLIVER

## S15-1-2
- Screen name/type: Angled mockup — left phone, only a curved edge sliver visible (partial)
- Purpose: The board's closing mockup row begins here; in this slice only the left phone's curved white edge/corner is visible at the bottom-left, so its screen content cannot be identified from this slice (it is the Special Offers phone inventoried as S16-1-1).
- Layout, top to bottom: a white curved phone-edge sliver at the bottom-left corner of the slice; no UI visible.
- Components & styling: white device body on light-grey board background.
- Typography: none visible.
- Colour: white/grey.
- Controls & interaction cues: none visible.
- Pattern(s): ANGLED-MOCKUP-ROW, PARTIAL-SCREEN-SLIVER

## S15-2-2
- Screen name/type: Angled mockup — centre phone top: "My E-Wallet" header (partial)
- Purpose: Top of the wallet phone: identifies the E-Wallet screen (fully inventoried as S16-2-1).
- Layout, top to bottom: top edge of an angled phone: status bar fragment ("9:41" visible on the neighbouring phone); header row: small black circular "e"-style logo glyph + bold title "My E-Wallet" + a circular outline search icon at right; the rest is cut off by the slice's bottom edge.
- Components & styling: plain white header, black glyphs; no border or shadow.
- Typography: title bold black, headline size.
- Colour: monochrome.
- Controls & interaction cues: search icon button.
- Pattern(s): ANGLED-MOCKUP-ROW, BACK-HEADER (title + icon header variant)

## S15-3-2
- Screen name/type: Angled mockup — right phone top: product detail hero (partial)
- Purpose: Top of the product-detail phone: hero photo area (fully inventoried as S16-3-1).
- Layout, top to bottom: top of an angled phone: status bar (9:41, signal/wifi/battery); a plain back chevron "<" at upper left; the upper part of a large product photo — a black boot/shoe with a tan sole on a light ground — filling the width; rest cut off by the slice's bottom edge.
- Components & styling: photo sits on the white/light screen with no frame or card; back chevron is a bare black glyph, not in a circle.
- Typography: none visible in this fragment.
- Colour: photo carries the colour (black product, tan sole); UI monochrome.
- Controls & interaction cues: back chevron over/above the hero photo.
- Pattern(s): ANGLED-MOCKUP-ROW, HERO-PHOTO-CAROUSEL

---

# SLICE 16

The board's final row: three large angled (perspective) phone mockups
standing on a light ground with soft shadows under the devices. They do not
follow the 5-column grid; columns below are mockup positions 1–3, left to
right.

## S16-1-1
- Screen name/type: Special Offers — promo card list (angled mockup, left phone)
- Purpose: List all current discount offers as large tappable cards.
- Layout, top to bottom: status bar fragment; header: back arrow left + bold "Special Offers" title + circular outline icon at right; a vertical stack of four large offer cards, each ≈20% of screen height, light-grey filled rounded rects (radius ≈20px): big bold percentage at left ("30%", "25%", "40%", "20%"), bold offer name beneath ("Today's Special!", "Weekends Deals", "New Arrivals", "Black Friday"), two lines of tiny grey caption text, a small black pagination-style dot near the card's bottom-left, and a product/fashion photo occupying the right ≈40% of the card (woman in denim, black headphones, black shoe, camera — full colour photos bleeding to the card edge).
- Components & styling: cards are tint-filled with no border and no individual shadow (the only shadow is under the physical phone mockup); text block left, photo right; header icon a thin-outline circle.
- Typography: percentages very large bold black (≈2× headline); offer names bold body-size; captions tiny grey; title bold black.
- Colour: monochrome UI on white/light-grey; colour only in the card photos.
- Controls & interaction cues: back arrow, header icon button, tappable offer cards.
- Pattern(s): BACK-HEADER, PROMO-CARD, PROMO-CARD-LIST

## S16-2-1
- Screen name/type: My E-Wallet — black balance card + transaction history (angled mockup, centre phone)
- Purpose: Show wallet balance on a bank-card-style panel and the transaction ledger below.
- Layout, top to bottom: (header cut by the phone's top edge in this mockup; the "My E-Wallet" header is visible in S15-2-2) BLACK BALANCE CARD (≈26% of screen): solid black rounded rect (radius ≈24px) with a subtle dark sheen — top row: white bold cardholder name "Andrew Ainsley" left, "VISA" in white bold italic + the red/orange Mastercard circles right; masked number line (white dots + "3629"); small light-grey caption "Your balance"; very large white bold balance "$9,379"; at the card's bottom right a WHITE pill button with a small black wallet glyph + black "Top Up" text; section header row: bold "Transaction History" left, smaller "See All" right; five transaction rows, each ≈11%: circular thumbnail left (≈44px — product photo in a light circle for purchases; solid black circle with a white wallet glyph for top-ups), bold black name ("Suga Leather Shoes", "Top Up Wallet", "Werolla Cardigans", "Mini Leather Bag", "Top Up Wallet"), small grey date-time caption beneath ("Dec 15, 2024 | 10:00 AM" style), bold amount right-aligned ("$262.5", "$500", "$385", "$540", "$550"), beneath each amount a tiny grey type label ("Orders" / "Top Up") with a tiny coloured square arrow icon (red for Orders, blue for Top Up); bottom tab bar: five stroke icons with tiny labels (Home, Cart, Orders, Wallet — filled black/active, Profile), plain white bar.
- Components & styling: the black card is the screen's single loud element — solid black, large radius, no border; the Top Up button is a white pill ON the black card (inverted); transaction rows are plain on white, no dividers, no shadows; tab bar unboxed.
- Typography: balance is the largest text on the screen (white, extra-bold); cardholder name bold white; section header bold black; row names bold body-size; captions small grey; amounts bold black.
- Colour: black card with white text; the ONLY non-photo colour accents on the whole board range appear here: the Mastercard red/orange circles and the tiny red/blue transaction-type icons. Everything else monochrome.
- Controls & interaction cues: Top Up white pill, See All link, tappable transaction rows, 5-tab navigation.
- Pattern(s): BLACK-BALANCE-CARD, BLACK-CARD-GRAPHIC, WHITE-PILL-ON-BLACK, SECTION-HEADER-SEEALL, TRANSACTION-ROW, TAB-BAR-5

## S16-3-1
- Screen name/type: Product detail — "Suga Leather Shoes" (angled mockup, right phone)
- Purpose: Present one product with photo, rating, description, size/colour/quantity selectors and a purchase bar.
- Layout, top to bottom: status bar (9:41); plain back chevron at upper left (its hero area top is shared with S15-3-2); hero photo (≈30%): a black leather shoe with tan sole, large, on a light ground filling the width; carousel pagination centred beneath the photo: one elongated black pill-dot (active) + three small grey dots; title row: very large bold black product name "Suga Leather Shoes" + an outline heart icon button at right; meta row: small light-grey pill chip with tiny text (sold count) + a black star glyph + grey text "4.7 (5,387 reviews)"; "Description" bold header; three lines of small grey body text; two-column selector block: left column label "Size" with a row of four circular buttons — "39" outline, "40" SOLID BLACK with white text (selected), "41" outline, "42" outline; right column label "Color" with three filled colour swatch circles (slate blue-grey, brown with a white checkmark = selected, mid grey); quantity row: bold-ish label "Quantity" + a light-grey filled pill stepper containing "−", the numeral "2", "+"; bottom purchase bar (≈10%, no tab bar): left — tiny grey caption "Total price" over large bold "$750.00"; right — solid black pill button with a small white bag glyph + "Add to Cart" white text.
- Components & styling: hero photo unframed on the ground; size selectors are ≈40px circles (thin outline, or solid black when selected); swatches are filled circles, selected carries a white check; stepper is a tint-filled pill with black glyphs; purchase bar is plain white, no border/shadow; heart is a bare outline glyph.
- Typography: product name is headline-plus, bold black, sentence case; section labels ("Description", "Size", "Color", "Quantity") body-size bold black; body text small grey; price large bold black; button white sentence case.
- Colour: monochrome UI; colour appears in the hero photo and — uniquely for a control — in the colour swatch circles (muted slate, brown, grey).
- Controls & interaction cues: back chevron, photo carousel with pill-dot pagination, favourite heart, single-select size circles, colour swatches with checkmark, quantity stepper pill, Add to Cart black pill in a fixed price bar.
- Pattern(s): HERO-PHOTO-CAROUSEL, CAROUSEL-PILL-DOTS, RATING-META-ROW, SELECTOR-CIRCLES, COLOUR-SWATCH-ROW, STEPPER-PILL, PRICE-ACTION-BAR, BLACK-PILL-CTA

---

## Pattern frequency in this range

Counted over the 31 inventoried screens (a screen counts once per pattern it
visibly uses; partials count only for what is visible).

- SETTINGS-ROW-LIST — 5 (S13-1-1, S13-3-1, S13-4-1, S13-5-2, S14-5-1)
- BACK-HEADER — 11 (S13-1-2, S13-2-2, S13-3-2, S13-4-2, S13-5-2, S14-2-2, S14-3-2, S14-4-2, S14-5-2, S15-2-2, S16-1-1)
- BLACK-PILL-CTA — 5 (S13-1-1, S13-2-1, S15-2-1, S15-3-1, S16-3-1)
- AVATAR-CONTACT-ROW — 4 (S13-1-2, S13-2-2, S14-1-1, S14-2-1)
- SMALL-BLACK-PILL-BUTTON — 4 (S13-1-2, S13-2-2, S14-1-1, S14-2-1)
- ORDER-ITEM-ROW — 4 (S14-2-2, S14-3-2, S15-2-1, S15-3-1)
- SECTION-HEADER-INLINE — 4 (S14-2-2, S14-3-2, S15-2-1, S15-3-1)
- FILTER-CHIP-ROW — 3 (S13-3-2, S13-4-2, S14-1-2)
- FAQ-ACCORDION — 3 (S13-3-2, S13-4-2, S14-3-1)
- UNDERLINE-TAB-BAR — 3 (S13-3-2, S13-4-2, S13-5-2)
- BLACK-CARD-GRAPHIC — 2 (S13-2-1, S16-2-1)
- OUTLINE-PILL-BUTTON — 2 (S13-2-2, S14-2-1)
- SEARCH-FIELD — 2 (S13-3-2, S14-1-2)
- CONTACT-CHANNEL-ROW — 2 (S13-5-2, S14-5-1)
- KEYBOARD-RAISED — 2 (S14-4-1, S14-5-2)
- CHAT-BUBBLES — 2 (S14-4-2, S14-5-2)
- ADDRESS-ROW — 2 (S14-2-2, S14-3-2)
- PROMO-CARD — 2 (S14-1-2, S16-1-1)
- SECTION-HEADER-SEEALL — 2 (S14-1-2, S16-2-1)
- PRODUCT-CARD — 2 (S14-1-2, S15-1-1)
- CHECKOUT-SECTION-STACK — 2 (S15-2-1, S15-3-1)
- TOTALS-TABLE — 2 (S15-2-1, S15-3-1)
- BLACK-CIRCLE-BUTTON — 2 (S15-2-1, S15-3-1)
- TAB-BAR-5 — 2 (S15-1-1, S16-2-1)
- ANGLED-MOCKUP-ROW — 3 (S15-1-2, S15-2-2, S15-3-2)
- HERO-PHOTO-CAROUSEL — 2 (S15-3-2, S16-3-1)
- PARTIAL-SCREEN-SLIVER — 3 (S15-4-1, S15-5-1, S15-1-2)
- BRAND-ICON-ROW — 1 (S13-1-1)
- STATUS-TEXT-RIGHT — 1 (S13-1-1)
- FORM-FIELD-STACK — 1 (S13-2-1)
- LABEL-OVER-VALUE-FIELD — 1 (S13-2-1)
- TOGGLE-ROW — 1 (S13-3-1)
- CHEVRON-ROW — 1 (S13-3-1)
- GREY-PILL-ACTION-BUTTON — 1 (S13-3-1)
- RADIO-ROW-LIST — 1 (S13-4-1)
- LONG-FORM-TEXT — 1 (S13-5-1)
- NUMBERED-SECTION-HEADINGS — 1 (S13-5-1)
- SEARCH-FIELD-FOCUSED — 1 (S13-4-2)
- SEARCH-RESULT-LIST — 1 (S13-4-2)
- GREETING-HEADER — 1 (S14-1-2)
- CATEGORY-MEDALLION-GRID — 1 (S14-1-2)
- CHAT-ACTION-BUTTON — 1 (S14-4-2)
- CHAT-INPUT-BAR — 1 (S14-5-2)
- PRODUCT-GRID-2COL — 1 (S15-1-1)
- PROMO-CHIP-APPLIED — 1 (S15-3-1)
- PROMO-CARD-LIST — 1 (S16-1-1)
- BLACK-BALANCE-CARD — 1 (S16-2-1)
- WHITE-PILL-ON-BLACK — 1 (S16-2-1)
- TRANSACTION-ROW — 1 (S16-2-1)
- CAROUSEL-PILL-DOTS — 1 (S16-3-1)
- RATING-META-ROW — 1 (S16-3-1)
- SELECTOR-CIRCLES — 1 (S16-3-1)
- COLOUR-SWATCH-ROW — 1 (S16-3-1)
- STEPPER-PILL — 1 (S16-3-1)
- PRICE-ACTION-BAR — 1 (S16-3-1)
