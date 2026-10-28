# Evira board — screen inventory, slices 05–08

Slices are horizontal cuts of one tall board, 5 phone columns per row. Top and bottom rows in
several slices are PARTIAL (the slice cuts through a row of phones); those are marked PARTIAL
and described for what is visible. Column numbering is left→right 1–5. Row numbering restarts
per slice: r0 = the partial row at the top edge, r1, r2… = successive rows downward.

Shared chrome note (applies to nearly every full screen below and is not repeated per screen):
white ground, no visible borders or drop shadows on cards/rows; separation is by whitespace
and very light grey photo tiles only. Status bar shows "9:41" left and signal/wifi/battery
glyphs right on full screens. Body type is one sans, sentence case; black is the only ink,
mid-grey is secondary text; colour appears only inside product photography and colour
swatches. The single filled-black pill is the one loud element per screen.

---

## S05-1-r0 — PARTIAL (lower ~60% of screen)
- Screen name/type: Create New Password (auth form)
- Purpose: set a new password after reset
- Layout, top to bottom: (top of screen cut off) small bold left-aligned title "Create Your New Password"; password field row — lock glyph, dotted password characters, small eye/visibility circle icon at right, hairline underline; second identical password field row below; a "Remember me" row with a small filled black checkbox square with white tick, left-of-centre; large empty white space; full-width black pill button "Continue" pinned near bottom
- Components & styling: fields are borderless with a single hairline underline (no boxes); checkbox is a small rounded square, solid black fill; CTA is a full-width pill (fully rounded ends), solid black fill, no shadow
- Typography: title small bold black; field text small; "Remember me" caption-size grey-black; button label centred white medium
- Colour: all black/grey on white; no colour anywhere
- Controls & interaction cues: two password inputs with visibility toggles, checkbox, one CTA pill
- Patterns: UNDERLINE-FIELD, SINGLE-BLACK-PILL-CTA, AUTH-FORM

## S05-2-r0 — PARTIAL (lower ~60% of screen)
- Screen name/type: Account-created success modal over a dimmed screen
- Purpose: confirm account setup finished, auto-redirect pending
- Layout, top to bottom: (top cut off) full-screen dark charcoal scrim; centred white rounded-rectangle modal card (~70% of screen width, upper-middle); inside the card: bold centred title "Congratulations!"; ~3 lines of small centred grey body text; a circular loading indicator made of small black dots below the text; behind/below the modal, the dimmed underlying screen shows a faint checkbox row and a dark pill button shape at the bottom
- Components & styling: modal card has large corner radius (~20px), white fill, no visible border; scrim is flat dark grey-black, no blur visible; spinner is a ring of dots, black
- Typography: modal title is the largest text on the screen, bold, centred; body small grey centred
- Colour: monochrome; scrim dark, card white, text black/grey
- Controls & interaction cues: none active — modal is a transient state with a loading spinner; underlying button is disabled/dimmed
- Patterns: CENTERED-SUCCESS-MODAL, LOADING-DOTS, DIMMED-SCRIM

## S05-3-r0 — PARTIAL (lower ~55% of screen)
- Screen name/type: Home — category medallions + Most Popular section
- Purpose: browse entry point: shop by category, jump to popular products
- Layout, top to bottom: (top cut off — a photo/promo area ends at the top edge) two rows of 4 circular category medallions: row 1 Clothes, Shoes, Bags, Electronics; row 2 Watch, Jewelry, Kitchen, Toys — each a light-grey circle with a small black line icon and a caption label under it; section header row: bold "Most Popular" left, small "See All" right; a horizontally scrolling chip row: first chip solid black with white text ("All"), following chips white/outline ("Clothes", "Shoes", "Bags", "Ele…" cut at right edge); bottom tab bar begins at the lower edge (home icon visible)
- Components & styling: medallions are flat light-grey circles (~44px), icons are thin black stroke glyphs, no borders/shadows; chips are pills, selected = solid black, unselected = thin outline with black text
- Typography: section header bold mid-size black; "See All" small; medallion captions small; chip labels small medium
- Colour: black/grey only; medallion tiles light grey
- Controls & interaction cues: 8 category medallions, filter chip rail, See All link, bottom tab bar (partially visible)
- Patterns: CATEGORY-MEDALLIONS, SECTION-HEADER-SEEALL, CHIP-RAIL, TAB-BAR

## S05-4-r0 — PARTIAL (lower ~60% of screen)
- Screen name/type: Notifications list
- Purpose: show account/activity notifications grouped by recency
- Layout, top to bottom: (top cut off) list rows, each = solid black circular icon disc (~40px) at left with a small white glyph, bold one-line title, one line of small grey subtext; visible rows include a "New Services Available!" row; a date group label "December 22, 2024" in small bold black standing alone between rows; then a "Credit Card Connected" row (card glyph in disc); then an "Account Setup Successful" row (person glyph in disc)
- Components & styling: icon discs are solid black circles with white icons; rows have no boxes, no dividers — separated by whitespace only
- Typography: row titles bold small black; subtext small grey; date label bold small black
- Colour: black discs are the only dark elements; everything else black/grey text on white
- Controls & interaction cues: tappable list rows (no visible buttons or toggles)
- Patterns: ICON-DISC-LIST-ROWS, DATE-GROUP-LABEL

## S05-5-r0 — PARTIAL (lower ~60% of screen)
- Screen name/type: Wishlist / saved-items product grid
- Purpose: grid of saved products with prices
- Layout, top to bottom: (top cut off) tops of two product cards with price text "$550.00" and "$75.00" visible at the very top edge; a full card row: left card = photo of a microphone on a tripod on a light tile, small circular badge at the photo's top-right corner, product name line ("Airtight Microphone"), small rating/meta line, price "$348.00"; right card = headphones photo, name ("Silent Headphones"), price "$460.00"; below, the tops of two shoe product photos (black shoe, black/white sneaker) cut at the bottom edge
- Components & styling: photo tiles are light grey rounded rectangles (~14px radius); cards unboxed (no border/shadow); tiny circular badge sits on the photo corner
- Typography: name small medium black; meta tiny grey; price small bold black
- Colour: colour only inside product photos; text black/grey
- Controls & interaction cues: product cards; small circular corner badge on each photo (wishlist/remove affordance)
- Patterns: PRODUCT-GRID-2COL, CARD-NAME-META-PRICE, PHOTO-CORNER-BADGE

## S05-1-r1
- Screen name/type: Special Offers — promo list
- Purpose: list discount campaigns
- Layout, top to bottom: status bar; header row: left back-arrow + bold title "Special Offers", small circular outline icon button at right; a vertical stack of large promo cards, each ~28% of screen height: left column inside card = very large bold percentage ("30%", "25%", "40%"), a small bold campaign label under it ("Today's Special", "Weekends Deals", "New Arrivals"), 2 lines of tiny grey caption; right ~45% of card = product/lifestyle photo filling the card's right side (woman in denim; black headphones; black shoe — third card cut at bottom edge). First card photo is a person, the others are product shots
- Components & styling: promo cards are light-grey tint rounded rectangles (~18px radius), no border, no shadow; header icon button is a thin-outline circle
- Typography: percentage is the largest text anywhere in this range (extra-bold, ~3× headline size); campaign label bold small; caption tiny grey
- Colour: photos carry all colour; card ground is light grey tint; text black/grey
- Controls & interaction cues: back arrow, header icon button, tappable promo cards
- Patterns: PROMO-CARD-PERCENT-PHOTO, BACK-TITLE-HEADER

## S05-2-r1
- Screen name/type: Most Popular — filtered product grid
- Purpose: popular products with category chip filter
- Layout, top to bottom: status bar; header row: back arrow + bold "Most Popular" + magnifier icon at right; chip rail: "All" solid black pill, then outline pills "Clothes", "Shoes", "Bags", "Ele…" (rail continues off right edge); 2-column product grid: card = light photo tile (brown leather satchel; black shoe) with small black circular badge at photo top-right, name line ("Snake Leather Bag", "Suga Leather Shoes"), tiny rating/meta line, bold price ("$448.00", "$375.00"); second row begins (grey blazer outfit photo; black crossbody bag photo) cut at bottom edge
- Components & styling: photo tiles light grey rounded rect; cards unboxed; corner badge is a small solid black circle with a white glyph; chips pills, selected solid black
- Typography: header bold mid; names small medium; meta tiny grey; prices small bold
- Colour: colour only in photos
- Controls & interaction cues: back, search icon, filter chips, product cards
- Patterns: PRODUCT-GRID-2COL, CHIP-RAIL, CARD-NAME-META-PRICE, PHOTO-CORNER-BADGE, BACK-TITLE-HEADER

## S05-3-r1
- Screen name/type: Search — recent searches (keyboard up)
- Purpose: search with history shortcuts
- Layout, top to bottom: status bar; a light-grey pill search field spanning the width: magnifier glyph, typed query text (illegible, appears as a placeholder-like string), a small filter/sliders icon at the right inside the field; section row: bold "Recent" left, small "Clear All" right; a vertical list of recent-search rows, each = one line of black text ("Snake Skin Bag", "Casual Shirt", "Black Nike Shoes", "Airtight Microphone", "Headphones White", "Nikon Camera", "Silver Watch", "Kitchen Appliances") with a small circular outline icon at the right of each row; the top of an on-screen keyboard is visible at the bottom edge
- Components & styling: search field is a filled light-grey pill, no border; recent rows are plain text lines, no dividers, no boxes
- Typography: "Recent" bold small; list text regular small black; "Clear All" small grey-black
- Colour: monochrome; field tint light grey
- Controls & interaction cues: search input, filter icon inside field, Clear All action, tappable history rows, system keyboard rising
- Patterns: SEARCH-PILL-FIELD, RECENT-SEARCH-LIST, KEYBOARD-UP

## S05-4-r1
- Screen name/type: Search — no results (empty state)
- Purpose: tell the user the query matched nothing
- Layout, top to bottom: status bar; light-grey pill search field with the query and a filter icon at right; results header line: bold text 'Results for "Abcdefghjk"' left, small "0 found" right; large empty white space; centred illustration (~30% of screen height) of two overlapping outlined documents/clipboards drawn in thin black line with small filled black clip shapes at top; bold centred heading "Not Found"; ~2 lines of small centred grey explanatory caption (partially cut at bottom edge)
- Components & styling: illustration is line-art only (thin outlines, two small solid black accents), no fill, no colour; everything else identical chrome to S05-3-r1
- Typography: heading bold mid-size centred; caption small grey centred; results line small, count grey
- Colour: monochrome
- Controls & interaction cues: search field only; no retry button visible
- Patterns: EMPTY-STATE-LINE-ILLUSTRATION, SEARCH-PILL-FIELD, RESULTS-COUNT-HEADER

## S05-5-r1
- Screen name/type: Search results — product grid with result count
- Purpose: show matches for a category query
- Layout, top to bottom: status bar; slim header row: small pill-shaped category label at left ("Electronics" with a tiny icon) and a filter/sliders icon at right; results line: bold 'Results for "Electronics"' left, small "12,789 founds" right; 2-column product grid: cards with light photo tiles (studio microphone; film camera), black circular badge at photo top-right, name lines ("Rode Microphone", "Fujifilm Camera"), tiny meta lines, bold prices ("$543.00", "$870.00"); second row begins (headphones; microphone) cut at bottom edge
- Components & styling: same card system as S05-2-r1 — unboxed cards, light tiles, solid black corner badges
- Typography: results title bold small; count small grey; names small medium; prices small bold
- Colour: colour only in photos
- Controls & interaction cues: filter icon, product cards
- Patterns: RESULTS-COUNT-HEADER, PRODUCT-GRID-2COL, CARD-NAME-META-PRICE, PHOTO-CORNER-BADGE

---

## S06-1-r0 — PARTIAL (lower ~55% of screen)
- Screen name/type: Special Offers promo card (single card visible)
- Purpose: one discount campaign entry (20% Black Friday) in the offers list
- Layout: (top and sides cut) light tint card; left column: very large bold "20%", bold small label "Black Friday", tiny grey caption lines; right: photo of a black camera filling the right portion of the card
- Components & styling: identical promo-card construction to S05-1-r1 (tint fill, ~18px radius, no border/shadow)
- Typography: percentage extra-bold very large; label bold small; caption tiny grey
- Colour: colour only in the camera photo
- Controls & interaction cues: tappable card (implied)
- Patterns: PROMO-CARD-PERCENT-PHOTO

## S06-2-r0 — PARTIAL (lower ~60% of screen)
- Screen name/type: Product grid (category or popular list)
- Purpose: browse products in 2 columns
- Layout: two card columns visible: name/price lines at top ("Leather Casual Suit" "$430.00"; "Black Leather Bag" "765.00" — currency sign illegible); below, two more photo tiles (a black elongated product, possibly a skateboard/accessory; a black sneaker) each with a small black circular badge at the photo's top-right
- Components & styling: standard unboxed card system; light photo tiles; solid black corner badges
- Typography: names small medium; prices small bold
- Colour: colour only in photos
- Controls & interaction cues: product cards
- Patterns: PRODUCT-GRID-2COL, CARD-NAME-META-PRICE, PHOTO-CORNER-BADGE

## S06-3-r0 — PARTIAL (lower ~65% of screen)
- Screen name/type: On-screen keyboard over a search screen
- Purpose: text entry state
- Layout: full QWERTY keyboard occupying the lower two-thirds: three letter rows with light-grey rounded key tiles, a wider dark-grey key at bottom-left of the letter block (shift/123 key), a wide white "space" bar key, an emoji/smiley key at bottom-left, a microphone key at bottom-right; above the keyboard a sliver of the underlying white screen
- Components & styling: keys are light grey rounded rectangles with black letters; space bar is white with a borderless look; keyboard ground light grey-white
- Typography: key letters small black centred; "space" caption small grey
- Colour: monochrome greys
- Controls & interaction cues: the keyboard itself (system component)
- Patterns: KEYBOARD-UP

## S06-4-r0 — PARTIAL (mostly blank)
- Screen name/type: Search results — empty/blank state (indeterminate)
- Purpose: cannot be determined beyond a search context
- Layout: almost entirely blank white phone body; a single short line of small grey text near the top ("…another keyword" — tail of an empty-state caption); the rest of the screen is empty white
- Components & styling: nothing else visible — no cards, buttons or bars in frame
- Typography: one line of small grey caption text
- Colour: white/grey only
- Controls & interaction cues: none visible
- Patterns: EMPTY-STATE (probable; screen mostly out of frame)

## S06-5-r0 — PARTIAL (lower ~60% of screen)
- Screen name/type: Search results / grid continuation
- Purpose: product matches in 2 columns
- Layout: name/price header lines of two cards at top ("Silent Headphones" "$438.00"; "Airtight Microphone" "$310.00"), each with a tiny meta line; below, two photo tiles (microphone on stand; black camera) each with a small black circular badge at top-right
- Components & styling: standard card system; light tiles; black corner badges
- Typography: names small medium; prices small bold; meta tiny grey
- Colour: colour only in photos
- Controls & interaction cues: product cards
- Patterns: PRODUCT-GRID-2COL, CARD-NAME-META-PRICE, PHOTO-CORNER-BADGE

## S06-1-r1
- Screen name/type: Sort & Filter — bottom sheet over dimmed results
- Purpose: refine a product list by category, price, sort order, rating
- Layout, top to bottom: behind the sheet, a dimmed dark screen shows a status bar, a faint header and the ghost of a results title; the sheet occupies the lower ~78% of the screen with a rounded top edge (~24px radius): centred bold title "Sort & Filter"; section label "Categories" (small bold); chip row: outline pills "All", "Clothes", solid black pill "Electronics", outline pill "Shoes"; section label "Price Range"; a small grey histogram silhouette above a dual-handle range slider (thin track, two black circular handles) with tiny min/max labels under the ends; section label "Sort by"; chip row: outline "Popular", solid black "Most Recent", outline "Price High…" (rail runs off right edge); section label "Rating"; chip row: outline "All", outline star+"1", solid black star+"2", outline star+"3", outline star+"4" (partial); bottom action row inside the sheet: left pill "Reset" in light grey tint with black text, right pill "Apply" solid black with white text — the pair spans the width
- Components & styling: sheet is white with large top radius, no border; the scrim behind is flat dark; chips are pills (selected solid black, unselected thin outline); slider handles are solid black circles on a thin grey track; action pills are both fully rounded, Reset quiet tint vs Apply solid black
- Typography: sheet title bold mid centred; section labels bold small left; chip labels small; histogram labels tiny grey
- Colour: monochrome; selection shown purely by black fill
- Controls & interaction cues: multi-select chips, dual-range slider, single-select chip groups, Reset/Apply pair
- Patterns: FILTER-SHEET, CHIP-RAIL, DUAL-RANGE-SLIDER, QUIET-RESET-SOLID-APPLY, DIMMED-SCRIM

## S06-2-r1
- Screen name/type: Category product grid — Clothes
- Purpose: browse one category
- Layout, top to bottom: status bar; header row: back arrow + bold "Clothes" + magnifier at right; 2-column grid of product cards: photo tiles with fashion photography (woman in blue shirt; woman in cardigan; grey blazer outfit; man in light suit), black circular badge at each photo top-right, names ("Venesa Long Shirt", "Wenela Cardigans", "Viyane Mo Blazer", "Moca Blue Suit"), tiny rating/meta lines, bold prices ("$320.00", "$245.00", "$385.00", "$410.00"); third row begins (two portrait photos) cut at bottom edge
- Components & styling: standard card system; unboxed; light tiles
- Typography: as other grids — header bold mid, name small medium, price small bold
- Colour: colour only in photos (clothing blues/greys)
- Controls & interaction cues: back, search, product cards
- Patterns: PRODUCT-GRID-2COL, CARD-NAME-META-PRICE, PHOTO-CORNER-BADGE, BACK-TITLE-HEADER

## S06-3-r1
- Screen name/type: Product detail — fashion item with size + colour selectors
- Purpose: configure and add a clothing product to cart
- Layout, top to bottom: status bar; small back chevron at top-left over white (no bar background); large product photo (woman in an oversized blue shirt, hand at forehead) filling the full width and ~45% of height; a short centred carousel/dot indicator under the photo (small dark dash); title row: bold title "Venesa Long Shirt" left, outline heart icon at right; a small rating/meta line (star + numbers, tiny grey); label "Description" (small bold) + ~3 lines of small grey body text; selector row: left block label "Size" with 4 circular options "S", "M", "L", "XL" — "M" is a solid black circle with white letter, others are outline circles, "XL" appears greyed; right block label "Color" with 4 colour swatch circles — the first carries a white checkmark (selected), followed by brown and grey swatches; label "Quantity" with a plain stepper "−  1  +" (no box around it); bottom bar: bold price "$320.00" at left, solid black pill "Add to Cart" (with a small bag icon) at right, roughly 55% width
- Components & styling: size options are ~34px circles, selected = solid black fill; swatches are filled colour circles ~26px, selected marked by a white tick; stepper is bare glyphs/text, no border or container; bottom bar is plain white with the price text and one black pill
- Typography: title bold, largest on screen after photo; price bold mid; labels small bold; description small grey; rating tiny grey
- Colour: colour in the photo and in the swatches only; controls black/grey
- Controls & interaction cues: back chevron, favourite heart (outline), size circles, colour swatches, quantity stepper, Add to Cart pill
- Patterns: PRODUCT-DETAIL-HERO, SELECTOR-ROW-SIZE-CIRCLES, SELECTOR-ROW-SWATCHES, STEPPER-PLAIN, PRICE-PLUS-BLACK-PILL-BAR, FAVOURITE-HEART

## S06-4-r1
- Screen name/type: Category product grid — Shoes
- Purpose: browse shoes
- Layout, top to bottom: status bar; header row: back arrow + bold "Shoes" + magnifier at right; 2-column grid: photo tiles (black leather shoe; white sneaker / red Nike shoe; black-white Puma; white shoe at bottom), black circular badges at photo top-rights, names ("Suga Leather Shoes", "Puma White Shoes", "Puma Black White", "Nike Red Shoes"), tiny meta lines, bold prices ("$375.00", "$495.00", "$390.00", "$480.00" approx.); third row begins at bottom edge
- Components & styling: standard grid card system
- Typography: as S06-2-r1
- Colour: colour only in photos (one red shoe is the strongest colour accent in this slice)
- Controls & interaction cues: back, search, product cards
- Patterns: PRODUCT-GRID-2COL, CARD-NAME-META-PRICE, PHOTO-CORNER-BADGE, BACK-TITLE-HEADER

## S06-5-r1
- Screen name/type: Product detail — shoe, hero cropped by slice edge
- Purpose: configure and buy a shoe
- Layout, top to bottom: status bar; back chevron top-left; very large product photo of a single black leather shoe angled across the frame (~40% of height, photo extends past the slice's right edge); carousel dash indicator under photo; title row: bold "Suga Leather Shoes" + outline heart at right; tiny rating/meta line; "Description" label + ~3 lines grey text; "Size" selector: 4 small outline circles with numbers (41–44 approx., illegible exactly) — none filled black in view; "Color" swatches at right of the same row block: first swatch has a checkmark, then blue-grey, brown, grey swatches; "Quantity" label + plain stepper "−  2  +"; bottom bar: price "$750.00" left, black "Add to Cart" pill right
- Components & styling: identical detail system to S06-3-r1; size circles outline-only here; swatch selected state = tick
- Typography: as S06-3-r1
- Colour: colour in photo + swatches only
- Controls & interaction cues: back, heart, size circles, swatches, stepper, Add to Cart
- Patterns: PRODUCT-DETAIL-HERO, SELECTOR-ROW-SIZE-CIRCLES, SELECTOR-ROW-SWATCHES, STEPPER-PLAIN, PRICE-PLUS-BLACK-PILL-BAR, FAVOURITE-HEART

## S06-1-r2 — PARTIAL (top slivers only)
- Screen name/type: Unidentifiable screen tops
- Purpose: cannot be determined
- Layout: only the status bars / very top edges of the next row of phones are visible at the bottom edge of the slice (five thin slivers, one shows "9:41")
- Components & styling: nothing describable beyond status-bar fragments
- Typography: none legible
- Colour: white/black fragments
- Controls & interaction cues: none visible
- Patterns: none assignable

---

## S07-1-r1
- Screen name/type: Category product grid — Bags
- Purpose: browse bags
- Layout, top to bottom: status bar; header row: back arrow + bold "Bags" + magnifier at right; 2-column × 3-row grid of cards: photo tiles (black mini bag; brown tote; orange handbag; red handbag; quilted black bag; grey briefcase-style bag), black circular badge at each photo top-right, names ("Mini Leather Bag", "Snake Leather Bag", "Orange Leather Bag", "Red Leather Bag", + 2 more), tiny meta lines, bold prices ("$440.00", "$280.00", "$395.00", "$305.00", + 2 cut at bottom)
- Components & styling: standard grid card system; light tiles, unboxed
- Typography: as other category grids
- Colour: colour only in photos (orange/red bags are strong accents against the monochrome UI)
- Controls & interaction cues: back, search, product cards
- Patterns: PRODUCT-GRID-2COL, CARD-NAME-META-PRICE, PHOTO-CORNER-BADGE, BACK-TITLE-HEADER

## S07-2-r1
- Screen name/type: Product detail — bag, colour-only selectors
- Purpose: configure and add a bag to cart
- Layout, top to bottom: status bar; back chevron top-left; large product photo (black crossbody bag with long strap, diagonal across frame) ~38% of height; carousel dash under photo; title row: bold "Mini Leather Bag" + outline heart right; tiny rating/meta line; "Description" label + ~3 lines grey text; "Color" label + row of 6 swatch circles — first is solid black with white tick (selected), then brown, purple, orange, grey, blue swatches; "Quantity" label + plain stepper "−  1  +"; bottom bar: price "$540.00" left, black "Add to Cart" pill right
- Components & styling: as S06-3-r1 detail system; no size row (colour + quantity only)
- Typography: as S06-3-r1
- Colour: swatches are the most colourful element (purple/orange/blue dots) besides the photo
- Controls & interaction cues: back, heart, swatches, stepper, Add to Cart
- Patterns: PRODUCT-DETAIL-HERO, SELECTOR-ROW-SWATCHES, STEPPER-PLAIN, PRICE-PLUS-BLACK-PILL-BAR, FAVOURITE-HEART

## S07-3-r1
- Screen name/type: Category product grid — Electronics
- Purpose: browse electronics
- Layout, top to bottom: status bar; header row: back arrow + bold "Electronics" + magnifier at right; 2-column grid: photo tiles (headphones; camera; studio microphone on stand; headphones), black circular badges top-right of photos, names ("Vinia Headphone", "Fujifilm Camera", "Rode Microphone", "Sonica Headphone" approx.), tiny meta lines, bold prices ("$360.00", "$870.00", "$285.00", "$315.00" approx.); third row begins (camera; microphone) at bottom edge
- Components & styling: standard grid card system
- Typography: as other grids
- Colour: photos mostly black products on light tiles — grid reads almost monochrome
- Controls & interaction cues: back, search, product cards
- Patterns: PRODUCT-GRID-2COL, CARD-NAME-META-PRICE, PHOTO-CORNER-BADGE, BACK-TITLE-HEADER

## S07-4-r1
- Screen name/type: Product detail — headphones, colour-only selectors
- Purpose: configure and add headphones to cart
- Layout, top to bottom: status bar; back chevron top-left; large centred product photo (black over-ear headphones) ~35% of height on white (no tile — product floats on the ground); carousel dash under photo; title row: bold "Vinia Headphone" + outline heart right; tiny rating line ("4.5" + review count, grey); "Description" label + ~3 lines grey text; "Color" label + 6 swatches — first dark slate with white tick, then grey, grey, brown, purple, magenta-purple; "Quantity" label + plain stepper "−  2  +"; bottom bar: price "$720.00" left, black "Add to Cart" pill right
- Components & styling: detail system as before; note the hero photo here has NO grey tile behind it — white ground
- Typography: as S06-3-r1
- Colour: swatches + product photo only
- Controls & interaction cues: back, heart, swatches, stepper, Add to Cart
- Patterns: PRODUCT-DETAIL-HERO, SELECTOR-ROW-SWATCHES, STEPPER-PLAIN, PRICE-PLUS-BLACK-PILL-BAR, FAVOURITE-HEART

## S07-5-r1
- Screen name/type: Category product grid — Watch
- Purpose: browse watches
- Layout, top to bottom: status bar; header row: back arrow + bold "Watch" + magnifier at right; 2-column grid over 3 rows: photo tiles (silver metal watch; gold/ring watch; black smartwatch with orange face; blue-strap watch; white-strap watch; gold watch), black circular badges on photos, names ("Zonio Super Watch", "Golden Ring Watch", "Black Fire Watch", "Glanoia Watch" approx., + 2), tiny meta lines, bold prices ("$880.00", "$790.00", "$435.00", "$455.00", + 2 cut at bottom edge)
- Components & styling: standard grid card system
- Typography: as other grids
- Colour: colour only in photos (smartwatch face has an orange/red glow)
- Controls & interaction cues: back, search, product cards
- Patterns: PRODUCT-GRID-2COL, CARD-NAME-META-PRICE, PHOTO-CORNER-BADGE, BACK-TITLE-HEADER

## S07-1-r2
- Screen name/type: Product detail — watch hero (partial, right portion cut by slice edge)
- Purpose: product detail page, hero zone only in frame
- Layout: status bar; back chevron top-left; a very large photo of a silver metal-link wristwatch fills the width and most of the visible height; a short dark carousel dash is visible near the bottom of the frame; the title/selector/bar area is below the slice's bottom edge
- Components & styling: photo floats on white, no tile, no border
- Typography: none visible except status bar
- Colour: silver/grey photo tones
- Controls & interaction cues: back chevron, carousel indicator
- Patterns: PRODUCT-DETAIL-HERO (partial)

## S07-2-r2
- Screen name/type: Category product grid — Jewelry
- Purpose: browse jewelry
- Layout, top to bottom: status bar; header row: back arrow + bold "Jewelry" + magnifier at right; 2-column grid: photo tiles (pink-stone ring; blue-stone ring), black circular badges on photos, names ("Red Ruby Rings", "Viya Blue Diamond" approx.), tiny meta lines, bold prices ("$960.00", "$880.00" approx.); screen continues below the frame
- Components & styling: standard grid card system
- Typography: as other grids
- Colour: colour in photos (pink/blue gemstones)
- Controls & interaction cues: back, search, product cards
- Patterns: PRODUCT-GRID-2COL, CARD-NAME-META-PRICE, PHOTO-CORNER-BADGE, BACK-TITLE-HEADER

## S07-3-r2
- Screen name/type: Product detail — ring hero (partial)
- Purpose: product detail page, hero zone only in frame
- Layout: status bar; back chevron top-left; one very large centred photo of a gold ring with a large pink rectangular gemstone, filling most of the frame on white; a short carousel dash under the photo at the bottom edge; everything below is out of frame
- Components & styling: photo floats on white ground, no tile
- Typography: none visible except status bar
- Colour: pink/gold photo is the only colour
- Controls & interaction cues: back chevron, carousel indicator
- Patterns: PRODUCT-DETAIL-HERO (partial)

## S07-4-r2
- Screen name/type: Category product grid — Kitchen
- Purpose: browse kitchen items
- Layout, top to bottom: status bar; header row: back arrow + bold "Kitchen" + magnifier at right; 2-column grid: photo tiles (a knife; a black spoon on a round plate/board), black circular badges on photos, names ("Slicia Silver Knife", "Spoon Bowl Set" approx.), tiny meta lines, bold prices ("$240.00", "$105.00" approx.); continues below frame
- Components & styling: standard grid card system
- Typography: as other grids
- Colour: near-monochrome photos
- Controls & interaction cues: back, search, product cards
- Patterns: PRODUCT-GRID-2COL, CARD-NAME-META-PRICE, PHOTO-CORNER-BADGE, BACK-TITLE-HEADER

## S07-5-r2
- Screen name/type: Product detail — knife hero (partial)
- Purpose: product detail page, hero zone only in frame
- Layout: status bar; back chevron top-left; one large photo of a chef's knife angled diagonally on white, filling the visible frame; title/selectors/bar below the frame
- Components & styling: photo floats on white, no tile
- Typography: none visible except status bar
- Colour: steel/grey photo tones
- Controls & interaction cues: back chevron
- Patterns: PRODUCT-DETAIL-HERO (partial)

---

## S08-1-r0 — PARTIAL (lower ~65% of screen)
- Screen name/type: Product detail — watch (lower half)
- Purpose: configure and add a watch to cart
- Layout, top to bottom: (hero photo above frame) title "Zonio Super Watch" bold at left with an outline heart at the right edge (partially out of frame); tiny rating/meta line; "Description" label + ~4 lines of small grey text; "Color" label + 4 swatches — first is light grey with a dark tick (selected), then slate blue, brown, grey; "Quantity" label + plain stepper "−  1  +"; bottom bar: price "$850.00" left, black "Add to Cart" pill right (partially cut at right edge)
- Components & styling: detail system as S06-3-r1; swatch selected state = tick
- Typography: title bold mid-large; labels small bold; body small grey; price bold
- Colour: swatches + nothing else (photo out of frame)
- Controls & interaction cues: heart, swatches, stepper, Add to Cart
- Patterns: PRODUCT-DETAIL-HERO (lower half), SELECTOR-ROW-SWATCHES, STEPPER-PLAIN, PRICE-PLUS-BLACK-PILL-BAR, FAVOURITE-HEART

## S08-2-r0 — PARTIAL (lower ~65% of screen)
- Screen name/type: Jewelry product grid (continuation)
- Purpose: browse jewelry items
- Layout: two card rows visible: row 1 = two light photo tiles (silver ring/diamond jewellery pieces) with black circular badges, names ("Hujia Silver Rings" approx., "Riano Silver Ring" approx.), tiny meta lines, prices ("$870.00", "$920.00" approx.); row 2 = two more tiles (gold drop earrings; gold glasses/eyewear-shaped item) with badges — names/prices below the frame
- Components & styling: standard grid card system
- Typography: names small medium; prices small bold
- Colour: colour only in photos (gold items)
- Controls & interaction cues: product cards
- Patterns: PRODUCT-GRID-2COL, CARD-NAME-META-PRICE, PHOTO-CORNER-BADGE

## S08-3-r0 — PARTIAL (lower ~65% of screen)
- Screen name/type: Product detail — ring (lower half)
- Purpose: configure and add a ring to cart
- Layout, top to bottom: (hero above frame) title "Red Ruby Rings" bold + outline heart at right; tiny rating/meta line (illegible numbers); "Description" label + ~5 lines of small grey text (longer text block than other details); "Quantity" label + plain stepper "−  1  +" (no colour/size rows on this product); bottom bar: price "$960.00" left, black "Add to Cart" pill right
- Components & styling: detail system; note absence of selectors — quantity only
- Typography: as S08-1-r0
- Colour: no colour visible in this portion
- Controls & interaction cues: heart, stepper, Add to Cart
- Patterns: PRODUCT-DETAIL-HERO (lower half), STEPPER-PLAIN, PRICE-PLUS-BLACK-PILL-BAR, FAVOURITE-HEART

## S08-4-r0 — PARTIAL (lower ~65% of screen)
- Screen name/type: Kitchen product grid (continuation)
- Purpose: browse kitchen items
- Layout: two card rows: row 1 = photo tiles (two cleavers/butcher knives; a wooden bowl set) with black circular badges, names ("Double Butcher Knife", "Wooden Bowl Set"), tiny meta lines, prices ("$155.00", "$80.00" approx.); row 2 = tiles (a knife set laid in a row; metal spoons) with badges, names below frame
- Components & styling: standard grid card system
- Typography: names small medium; prices small bold
- Colour: colour only in photos (wood tones)
- Controls & interaction cues: product cards
- Patterns: PRODUCT-GRID-2COL, CARD-NAME-META-PRICE, PHOTO-CORNER-BADGE

## S08-5-r0 — PARTIAL (lower ~65% of screen)
- Screen name/type: Product detail — knife (lower half)
- Purpose: configure and add a knife to cart
- Layout, top to bottom: (hero above frame) title "Slicia Silver Knife" bold + outline heart right; tiny rating/meta line; "Description" label + ~6 lines of small grey text (longest description block in this range); "Quantity" label + plain stepper "−  2  +"; bottom bar: price "$240.00" left, black "Add to Cart" pill right
- Components & styling: detail system; quantity-only configuration
- Typography: as S08-1-r0
- Colour: no colour visible in this portion
- Controls & interaction cues: heart, stepper, Add to Cart
- Patterns: PRODUCT-DETAIL-HERO (lower half), STEPPER-PLAIN, PRICE-PLUS-BLACK-PILL-BAR, FAVOURITE-HEART

## S08-1-r1
- Screen name/type: Category product grid — Toys
- Purpose: browse toys
- Layout, top to bottom: status bar; header row: back arrow + bold "Toys" + magnifier at right; 2-column grid: photo tiles (black toy vehicle/Batmobile; green chibi figurine; Santa-hat plush rabbit; orange bunny figurine; two more toys cut at bottom), black circular badges on photos, names ("Batmobile Batman", "Mini Cute Groot" approx., "Cute Rabbit", "Manya Teddy Bear" approx.), tiny meta lines, bold prices ("$430.00", "$298.00" approx., "$320.00", "$340.00" approx.)
- Components & styling: standard grid card system
- Typography: as other grids
- Colour: colour only in photos (green/orange/red toys — the most colourful grid in this range)
- Controls & interaction cues: back, search, product cards
- Patterns: PRODUCT-GRID-2COL, CARD-NAME-META-PRICE, PHOTO-CORNER-BADGE, BACK-TITLE-HEADER

## S08-2-r1
- Screen name/type: Product detail — toy vehicle (lower portion in frame)
- Purpose: configure and add a toy to cart
- Layout, top to bottom: status bar; back chevron (top-left, faint at frame edge); large product photo (black Batmobile toy car, three-quarter view) ~35% of height on white; carousel dash under photo; title row: bold "Batmobile Batman" + outline heart right; tiny rating/meta line; "Description" label + ~3 lines grey text; "Color" label + 5 swatches — first solid black with white tick, then slate, brown, grey, dark grey; "Quantity" label + plain stepper "−  1  +"; bottom black pill bar begins at the very bottom edge (cut off)
- Components & styling: detail system as S06-3-r1
- Typography: as S06-3-r1
- Colour: swatches + photo (photo is near-black product on white)
- Controls & interaction cues: back, heart, swatches, stepper, Add to Cart (partially visible)
- Patterns: PRODUCT-DETAIL-HERO, SELECTOR-ROW-SWATCHES, STEPPER-PLAIN, PRICE-PLUS-BLACK-PILL-BAR, FAVOURITE-HEART

## S08-3-r1
- Screen name/type: Reviews list — rating summary with filter chips
- Purpose: read product reviews, filter by star level
- Layout, top to bottom: status bar; header row: back arrow + bold title "4.8 (4,974 reviews)" + magnifier at right; filter chip rail: solid black pill "All", outline pills with star glyphs "5", "4", "3", "2" (rail continues off right edge); a vertical list of review rows, each = small circular avatar photo at left, bold reviewer name ("Darlene Robertson", "Jane Cooper", "Jenny Wilson", "Marvin McKinney" approx.), a small pill-shaped outlined rating badge and a small circular outline icon at the right of the name line, ~2 lines of small grey review text, and a small meta line under the text (heart/like glyph + tiny text); rows repeat identically down the screen (4+ visible, continuing below frame)
- Components & styling: avatars are small photo circles (~36px); rating badge is a tiny outline pill; rows unboxed, no dividers — whitespace separation
- Typography: header title bold mid; names bold small; review text small grey; meta tiny grey
- Colour: colour only in avatar photos; one or two tiny yellow star/emoji accents inside review text lines; UI itself monochrome
- Controls & interaction cues: back, search, star-filter chips, per-review like/meta affordance
- Patterns: REVIEW-ROWS, CHIP-RAIL, AVATAR-CIRCLE, BACK-TITLE-HEADER

## S08-4-r1
- Screen name/type: My Cart — line items with quantity steppers
- Purpose: review cart contents and proceed to checkout
- Layout, top to bottom: status bar; header row: small circular outline icon at left (cart/back glyph) + bold "My Cart" + magnifier at right; cart item rows, each = small light photo tile at left (~64px, rounded), bold product name at right of tile ("Wenella Cardigans", "Suga Leather Shoes", "Vinia Headphone"), a small circular outline icon at the row's right edge (remove/edit affordance), price line under the name ("$385.00", "$375.00", "$360.00" approx.), and a small plain stepper "−  1  +" at the row's bottom-right; a faint promo/rewards line is partially visible below the third row (cut); bottom bar: bold total "$1,970.00" at left, solid black pill "Checkout" (with a small arrow/chevron glyph) at right
- Components & styling: item rows are unboxed — photo tile is the only filled element (light grey, ~12px radius); steppers small and borderless; bottom bar mirrors the detail-page bar but with total + Checkout
- Typography: names bold small; prices small; total bold mid; header bold mid
- Colour: colour only in the small product photos
- Controls & interaction cues: search icon, per-row remove icon, per-row steppers, Checkout pill
- Patterns: CART-ITEM-ROWS, STEPPER-PLAIN, PRICE-PLUS-BLACK-PILL-BAR, BACK-TITLE-HEADER

## S08-5-r1
- Screen name/type: My Cart with "Remove From Cart?" confirmation sheet
- Purpose: confirm removal of one cart item
- Layout, top to bottom: the cart screen dimmed under a dark scrim (header "My Cart" and two item rows — cardigan, shoes — faintly visible); a white bottom sheet rises over the lower ~45%: large top corner radius; centred bold title "Remove From Cart?"; inside the sheet, one cart item row: small photo tile (black shoe), name "Suga Leather Shoes", tiny meta line, price "$375.00", small stepper at right; below the row, the tops of two action buttons are visible at the frame's bottom edge (a light pill at left and a black pill at right, labels cut off — the Cancel / Yes, Remove pair)
- Components & styling: sheet white with ~24px top radius; scrim flat dark; item row identical to S08-4-r1 cart rows
- Typography: sheet title bold mid centred; item text as cart rows
- Colour: monochrome + photo colour, all muted by scrim above the sheet
- Controls & interaction cues: bottom sheet modal, item stepper (inert in this state), two action pills (partially visible)
- Patterns: CONFIRM-REMOVE-SHEET, CART-ITEM-ROWS, DIMMED-SCRIM, QUIET-RESET-SOLID-APPLY (inferred pair, labels out of frame)

---

## Pattern frequency in this range

Counts = number of inventoried screens (including partials) in slices 05–08 where the pattern
is visibly present. Total inventoried entries: 41 (one of them, S06-1-r2, is a shared entry for
five screen-top slivers with no patterns assignable).

- PRODUCT-GRID-2COL — 15 (S05-5-r0, S05-2-r1, S05-5-r1, S06-2-r0, S06-5-r0, S06-2-r1, S06-4-r1, S07-1-r1, S07-3-r1, S07-5-r1, S07-2-r2, S07-4-r2, S08-2-r0, S08-4-r0, S08-1-r1)
- CARD-NAME-META-PRICE — 15 (same set as PRODUCT-GRID-2COL)
- PHOTO-CORNER-BADGE — 15 (same set as PRODUCT-GRID-2COL)
- BACK-TITLE-HEADER — 13 (S05-1-r1, S05-2-r1, S06-2-r1, S06-4-r1, S07-1-r1, S07-3-r1, S07-5-r1, S07-2-r2, S07-4-r2, S08-1-r1, S08-3-r1, S08-4-r1, + S05-5-r1 variant with category pill — 12 full + 1 variant)
- PRODUCT-DETAIL-HERO — 11 (S06-3-r1, S06-5-r1, S07-2-r1, S07-4-r1, S07-1-r2 partial, S07-3-r2 partial, S07-5-r2 partial, S08-1-r0 lower half, S08-3-r0 lower half, S08-5-r0 lower half, S08-2-r1)
- PRICE-PLUS-BLACK-PILL-BAR — 9 (S06-3-r1, S06-5-r1, S07-2-r1, S07-4-r1, S08-1-r0, S08-3-r0, S08-5-r0, S08-2-r1 partial, S08-4-r1 as total+Checkout)
- STEPPER-PLAIN — 10 (S06-3-r1, S06-5-r1, S07-2-r1, S07-4-r1, S08-1-r0, S08-3-r0, S08-5-r0, S08-2-r1, S08-4-r1 in cart rows, S08-5-r1 inside the confirm sheet's item row)
- FAVOURITE-HEART — 8 (S06-3-r1, S06-5-r1, S07-2-r1, S07-4-r1, S08-1-r0, S08-3-r0, S08-5-r0, S08-2-r1)
- SELECTOR-ROW-SWATCHES — 6 (S06-3-r1, S06-5-r1, S07-2-r1, S07-4-r1, S08-1-r0, S08-2-r1)
- CHIP-RAIL — 4 screens (S05-3-r0 home partial, S05-2-r1, S06-1-r1 — which stacks 3 separate chip groups on one screen, S08-3-r1)
- SELECTOR-ROW-SIZE-CIRCLES — 2 (S06-3-r1, S06-5-r1)
- SEARCH-PILL-FIELD — 3 (S05-3-r1, S05-4-r1, + header-icon search on grids counted under BACK-TITLE-HEADER)
- PROMO-CARD-PERCENT-PHOTO — 2 (S05-1-r1, S06-1-r0)
- RESULTS-COUNT-HEADER — 2 (S05-4-r1, S05-5-r1)
- DIMMED-SCRIM — 3 (S05-2-r0, S06-1-r1, S08-5-r1)
- KEYBOARD-UP — 2 (S05-3-r1 edge, S06-3-r0)
- CART-ITEM-ROWS — 2 (S08-4-r1, S08-5-r1)
- SINGLE-BLACK-PILL-CTA — 1 (S05-1-r0)
- UNDERLINE-FIELD — 1 (S05-1-r0)
- AUTH-FORM — 1 (S05-1-r0)
- CENTERED-SUCCESS-MODAL — 1 (S05-2-r0)
- LOADING-DOTS — 1 (S05-2-r0)
- CATEGORY-MEDALLIONS — 1 (S05-3-r0)
- SECTION-HEADER-SEEALL — 1 (S05-3-r0)
- TAB-BAR — 1 (S05-3-r0, partial)
- ICON-DISC-LIST-ROWS — 1 (S05-4-r0)
- DATE-GROUP-LABEL — 1 (S05-4-r0)
- RECENT-SEARCH-LIST — 1 (S05-3-r1)
- EMPTY-STATE-LINE-ILLUSTRATION — 1 (S05-4-r1)
- EMPTY-STATE — 1 (S06-4-r0, probable)
- FILTER-SHEET — 1 (S06-1-r1)
- DUAL-RANGE-SLIDER — 1 (S06-1-r1)
- QUIET-RESET-SOLID-APPLY — 2 (S06-1-r1 full, S08-5-r1 inferred partial)
- REVIEW-ROWS — 1 (S08-3-r1)
- AVATAR-CIRCLE — 1 (S08-3-r1)
- CONFIRM-REMOVE-SHEET — 1 (S08-5-r1)
