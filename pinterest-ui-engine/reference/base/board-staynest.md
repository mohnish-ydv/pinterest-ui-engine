# Board Decode — StayNest (Tenants Portal UI Kit)

- **Source:** `34002a76bbcf055898084f5747f8929b301f9504c36ac51295ff2f5272def8fc.jpg` (736×1472, light-grey presentation board, 6 columns × 6 rows of phone frames, footer "StayNest — Tenants Portal UI Kit © 2026 StayNet")
- **App / domain:** StayNest — rental property discovery and tenant portal (Kenya-flavoured data: KSh prices, M-PESA, +254 numbers, Nairobi-area names). Screens are small on the board; headings, structure and controls are legible at crop resolution, but most body micro-copy, prices beyond "Kes. 12k", and list-row sub-lines are **illegible at board resolution — inferred type only** where marked †.
- **Frames inventoried:** 36 phone frames. Two are tab/state variants of one screen (15/16 Property Detail) and one duplicates the search list in a map context (14) — all 36 are inventoried, variants flagged.
- **Palette (approximate, from flat UI fields):** primary indigo/blue `#3D3BE0`–`#4440E8` (solid CTAs, splash field, active tabs); white `#FFFFFF` screens on board grey `#F1F1F4`; text near-black `#17171F`; muted `#8B8B96`; dark navy panels `#101B33` (voice-call screen, Invite & Earn); heart/favourite red-pink `#F0446C`-ish †; rating amber `#F5B301`; verified green `#2FBF71`.
- **Type roles:** Display — bold geometric sans for screen titles ("Find Your Perfect Place", "Find your perfect place") and the big review score "4.8". UI — same sans; property cards carry title + price + rating in 3 tight lines (denser than SwiftGo's 1 meta line).
- **Shape language:** Cards ~14–16px radius, flat, no border, faint shadow. Primary CTA is a full-width rounded rectangle (~10–12px radius — noticeably less pill-like than SwiftGo/QuickServe). Filter chips are pills; selected chip is black on Home ("Apartments") but blue in Filters — two selection treatments on one board. Favourite is a heart icon overlaid on card photos. Photo cards have rating pill and verified badge overlaid on the image.
- **Density character:** The densest board of the four. Property lists pack photo + 3 data lines per row; detail screens stack photo, chips, icon amenity row, thumbnails and copy in one scroll. Still one clear column, no multi-column body except photo gallery and calendar.
- **Nav model:** Bottom tab bar, **5 tabs** (Home / Search / Saved-or-Bookings / Messages / Profile — icon labels †illegible, inferred from active states) on the main-destination screens (Home, Search results, Saved, Messages, Profile). Stack/detail screens use a back + title top bar. Splash/onboarding/auth have no nav.

---

## Screen inventory

### Row 1 — Entry

#### 1. Splash / Welcome
- **Anatomy:** Full-bleed indigo field → centred white house-in-circle logo → "StayNest" display → "Find. Rent. Live" → 2-line sub "Your Perfect place is just a tap away" → white solid button "Get Started" (blue text) → outlined-on-blue button "Login" → quiet button/text "Explore as Guest".
- **CTA:** Three stacked entry actions, in descending emphasis: white solid > outline > text.
- **States:** First-run.
- **Engine mapping:** onboarding / splash with 3-way entry — guest entry is a distinct option the engine's auth pattern should name.

#### 2. Onboarding 1 — "Find Your Perfect Place"
- **Anatomy:** Title (2 lines) + 1-line sub † → large 3D/photo house illustration centred → solid blue CTA "Next" → pager dots under (first active). No Skip on this frame.
- **CTA:** Full-width solid, lower third.
- **Engine mapping:** onboarding (illustrated value-prop page).

#### 3. Onboarding 2 — "Verified Homes, Trusted Landlords"
- **Anatomy:** Title + sub † → centred blue shield-with-check illustration in a pale halo disc → CTA "Next" → "Skip" text link under.
- **Engine mapping:** onboarding. Trust/verification as a value-prop page.

#### 4. Onboarding 3 — "Easy Search, Smart Choice"
- **Anatomy:** Title + sub † → centred illustration: house inside a magnifying glass → CTA "Next" → "Skip" link.
- **Engine mapping:** onboarding. (Screens 2–4 are one pager pattern ×3, differing only in illustration + headline.)

#### 5. Choose Your Role — role selection
- **Anatomy:** Title "Choose Your Role" + sub † → 3 stacked selectable rows/cards, each icon disc + role label + sub-label †: "I'm looking for a place" (Tenant — **selected, blue outline + tint**), "I'm a Landlord/Agent", "I'm an Administrator" → solid CTA "Continue".
- **CTA:** Full-width solid, bottom.
- **States:** First role selected.
- **Engine mapping:** radio-row selection in card form — same family as radio-row checkout, used pre-auth for role, not payment.

#### 6. Welcome Back — Login / Auth
- **Anatomy:** Title "Welcome Back 👋" + sub → field "Phone Number or Email" † → password field with eye icon + "Forgot Password?" right-aligned link → solid CTA "Login" → divider "Or continue with" → Google + Apple circular buttons → footer "Don't have an account? Sign Up".
- **Engine mapping:** auth. Direct match (same skeleton as QuickServe login).

### Row 2 — Account creation, home, search, filters

#### 7. Create Account — Sign-up form
- **Anatomy:** Back chevron → title "Create Account" + sub † → stacked fields: Full Name / Phone Number / Email Address / Password (eye icon) †labels inferred from field order → solid CTA "Sign Up" → divider + Google/Apple buttons → footer "Already have an account? Login".
- **Engine mapping:** auth (sign-up variant) / form flow (flat, single-step).

#### 8. Verify Your Phone — OTP
- **Anatomy:** Back → title "Verify Your Phone" → "Enter the 6-digit code sent to +254 712 345 678" → 6 separate digit boxes "6 2 4 1 0 8" filled → "Resend code in 00:29" †countdown text centred → solid CTA "Verify".
- **Engine mapping:** auth — OTP variant. Digit-box row + resend countdown are the named components.

#### 9. Home — Greeting home
- **Anatomy:** Greeting header: "Hello, Jamison 👋" left, bell icon + circular avatar right → headline "Find your perfect place" → pill search with filter/tune icon right → filter chip rail: "Apartments" (selected, **black** pill) / "Bedsitter" / "Single Room" (quiet, rail continues off-edge) → section head "Nearby You" + "See All" → large photo property card: full-bleed photo, rating pill "4.8" top-left on photo, green verified disc top-right, name/price overlaid at photo bottom † ("11 Green bank / Kes. 12k" inferred from detail screens) → section head "Recommended For You" (list continues below fold) → 5-tab bottom bar (Home active).
- **Components:** named greeting header, pill search, chip rail, hero property card with on-photo badges, tab bar.
- **Engine mapping:** greeting home + filter chips + product card (property form). This is the board's canonical home.

#### 10. Search — Search results list
- **Anatomy:** Title "Search" + sub "Where do you want to live?" → search field (query text †) with icon right → toolbar row: "Filters" (sliders icon) left, "Sort" right → vertical list of property rows: square photo left, name, price "Kes. 12k / month" †, rating "4.8", heart icon top-right of each row (first row's heart filled red = favourited) → 5-tab bar (Search active).
- **Engine mapping:** product list + search + filter/sort toolbar. Row = product card (horizontal variant).

#### 11. Where are you looking for? — Location search
- **Anatomy:** Back → title "Where are you looking for?" → search field → "Recent Searches" label → list of recent locations, each pin/clock icon + place name † (Kilimani Nairobi / …Karenya / Ruiru Kiambu / Mfangano… — proper nouns partly illegible, recorded as type only) → "Clear All" text action at bottom of list.
- **Engine mapping:** search (location/recents variant) — a dedicated location-picker pattern; closest engine relative is the filter sheet's search, but this is a full screen.

#### 12. Filters — Filter sheet (full screen)
- **Anatomy:** Header "Filters" + "Reset" right → "Property Type" label → chip wrap: Apartment (selected blue) / Bedsitter / Single / One Bedroom… (chips wrap to 2 rows) → "Price Range" label → range slider (blue track) with min/max labels "Ksh. 10,000 — Ksh. 200,000+" † → "Amenities" label → checkbox rows with icons: WiFi (checked), Water Included, Electricity Included, Furnished (checked), Parking, Security, CCTV †labels partly inferred → solid CTA "Apply Filters" bottom-pinned.
- **Components:** chip wrap, range slider, checkbox list.
- **Engine mapping:** filter sheet — the fullest filter example across all four boards: it adds a **range slider** and **checkbox amenity list** to the chip groups.

### Row 3 — Map, detail, gallery

#### 13. Map Search — Map with price pins
- **Anatomy:** Full-bleed map → floating search field at top ("Mautini, Kili…" †) with icon right → blue price/location pins on map, blue self dot → bottom: floating blue pill "Search this area" + target/locate disc button right. No tab bar visible.
- **Engine mapping:** map/tracking (search-by-map variant). Price pins on a map are property-specific.

#### 14. Search Results (map-adjacent variant)
- **Anatomy:** Search field at top → Filters / Sort toolbar → same property row list as Screen 10 (4 rows, hearts). Treated as a variant frame of Screen 10 shown after a map search; anatomy identical in type.
- **Engine mapping:** product list. Variant, not a new pattern.

#### 15. Property Detail A — Hero + summary
- **Anatomy:** Full-width photo header (~40%) with back disc top-left and green verified disc top-right → white sheet overlapping photo bottom: name "11 Green bank", rating "4.8", price "Kes. 12k" → action/info chip row (blue filled chip + quiet chips †) → icon amenity row (4 pale discs with labels under †: WiFi / Water / Parking / Security inferred) → "About Property" head + copy † (below fold).
- **Engine mapping:** detail sheet (photo-hero form) + amenity icon row.

#### 16. Property Detail B — Same detail, scrolled / alternate state
- **Anatomy:** Same photo header, sheet scrolled: name/rating/price → blue chip + chips † → horizontal thumbnail strip of 3 interior photos → "About Property" copy block † → bottom mini-nav of text tabs † (Amenities / Gallery / Location / Landlord inferred) → paired bottom CTAs: quiet "Message" + solid "Book a Visit".
- **States:** Scrolled state of Screen 15, with the booking CTA revealed.
- **Engine mapping:** detail sheet + paired CTAs. Screens 15–16 = ONE screen, two scroll states — an important honesty note for screen counts.

#### 17. Amenities — Full amenity list
- **Anatomy:** Back + title "Amenities" → "Essentials" label → 4-up icon-disc grid (WiFi / Water / Parking / Security †) + second row (Electricity / CCTV †) → "Additional" label → vertical icon list rows: Balcony / Shared Kitchen / Ensuite Bathroom / Borehole Water / Laundry Area / Gym Access / Security Guards †.
- **Engine mapping:** detail sub-page / spec list. Icon-grid + icon-list in one screen.

#### 18. Photo Gallery — Media grid
- **Anatomy:** Back + title "Photo Gallery" → segmented tabs: "Photos" (selected blue pill) / "Videos" / "360°" → masonry-ish photo grid: 1 wide exterior photo, then mixed interior photos (bedroom, kitchen, balcony) → solid CTA "View all Media (43)" bottom.
- **Engine mapping:** gallery grid — MISSING as a named engine pattern (engine detail sheets show a single photo/rail; a tabbed Photos/Videos/360 gallery is distinct).

### Row 4 — Location, people, booking

#### 19. Location — Property location + nearby
- **Anatomy:** Back + title "Location" → map upper half with pin + price label → sheet: address name † + distance line → "Nearby Places" label + "View All" → nearby rows: coloured icon discs + place type † + distance right (4 rows) → solid CTA "Get Directions".
- **Engine mapping:** map/tracking + detail sub-page (nearby-places list).

#### 20. Commute Estimation — Route planner
- **Anatomy:** Back + title "Commute Estimation" → origin/destination fields (dot + pin icons, destination "Mujenga, Kili…" †) with search icon → transport-mode chips: Drive / Walk / Bike / Matatu with times † (selected = pale blue) → "Best Routes" label → map with route + pin filling lower half → solid CTA "Start Navigation".
- **Engine mapping:** map/tracking (commute variant) — mode chips + route map. Transport-mode selector is a distinct component.

#### 21. Landlord Info — Verified party profile
- **Anatomy:** Back + title "Landlord Info" → landlord header: green house logo mark, "GreenHomes Ltd.", "Verified Landlord" green sub, rating "4.8 (220 Reviews)" † → stat trio in a row: "98%" (Response Rate †) / "32" (Properties †) / "May 2002" (Member Since †) → "About" copy † → "Verified Documents" label → checked list (green check discs): ID/Passport / Business Registration / Property Ownership / KRA Pin Certificate † → solid CTA "View all Properties".
- **Engine mapping:** profile (organisation variant) + KPI stat trio + verified-documents checklist. The stat trio and document checklist are named sub-patterns.

#### 22. Chat Thread — Conversation with landlord
- **Anatomy:** Top bar: back + avatar + "John Kamau" + phone/call icon right → date pill "Today" centred → message bubbles alternating: incoming white bubbles with sender avatar (room availability question †), outgoing blue bubbles right-aligned ("Yes, it is available. When would you like to come for a viewing?" †partly legible) → composer at bottom: "Type a message…" field + attachment/camera icons.
- **Engine mapping:** MISSING — chat thread (bubbles + composer) is not a named engine pattern; Messages list (23) exists in type but a thread view is distinct.

#### 23. Messages — Conversation list
- **Anatomy:** Title "Messages" → search field "Search Messages" → conversation rows: avatar, name, last-message line †, time/unread dot right — John Kamau (unread blue dot), Mary Wanjiku, GreenHomes Ltd. (logo avatar), Mary Wanjiru †, David Odhiambo, Support Team (house icon avatar) → 5-tab bar (Messages active).
- **Engine mapping:** MISSING as named pattern — conversation list; approximable with profile rows but semantics (unread, last message) differ.

#### 24. Book a Visit — Calendar booking
- **Anatomy:** Back + title "Book a Visit" → month calendar "May 2026" with ‹ ›, weekday header, date grid, one date selected (blue filled circle, 24th †) → "Selected Date" + value † → "Selected Time" label → time-slot chip grid (09:00 AM / 01:00 PM / 03:00 PM / 04:00 PM… †, chips in 3 columns) → solid CTA "Confirm Booking".
- **Engine mapping:** form flow — **calendar + time-slot picker**. MISSING as a named engine pattern; no other board has a calendar.

### Row 5 — Bookings, saved, notifications, call

#### 25. Booking Confirmed! — Success
- **Anatomy:** Centred large green check disc → headline "Booking Confirmed!" → sub † → booking summary card: property thumbnail + name + visit date/time † → explanatory line † → (large space) → solid CTA "View My Booking" bottom.
- **Engine mapping:** success/confirmation (same family as QuickServe Screen 7, without the stat pair).

#### 26. My Bookings — Booking list with status tabs
- **Anatomy:** Back + title "My Bookings" → tab/chip row: Upcoming (selected) / Completed / Cancelled † → booking rows: photo left, name, date-time †, heart, status pill under (Upcoming blue / Completed green / Cancelled red-pink †) — 3 rows visible.
- **Engine mapping:** product/booking list + status filter tabs + status pills.

#### 27. Saved Properties — Favourites list
- **Anatomy:** Title "Saved Properties" (no back — tab destination) → property rows identical in type to Screen 10, every heart filled red: 11 Green bank / Smart Apartment / Cozy Bedsitter / Single Room †, each price + rating → 5-tab bar (Saved active).
- **Engine mapping:** product list (favourites state).

#### 28. Notifications — Feed
- **Anatomy:** Back + title "Notifications" + kebab menu right → search field † → notification rows: coloured circular icon (green check / blue chat / green logo / red alert / avatar / green check), title, 1–2 line body †, time right — Booking Confirmed / New Message / GreenHomes Ltd. / Price Drop / New Property / Verification Update.
- **Engine mapping:** notifications feed.

#### 29. Voice Call — In-call screen
- **Anatomy:** Full-bleed dark navy field → small status line † ("Calling…" inferred) → name "John Kamau" display centred → large circular caller photo in a glowing ring → bottom control row: mute (mic) disc left, large red end-call button centre, speaker disc right. No other UI.
- **Engine mapping:** MISSING — voice-call screen. No relative in the engine pattern list.

#### 30. Profile — Account hub
- **Anatomy:** Back + title "Profile" → header row: avatar + name "Jamison" + email † → profile rows with icons + chevrons: Personal Information / Saved Properties / My Bookings / Payment Methods / Reviews / Settings / Help & Support → "Logout" in red with logout icon → 5-tab bar (Profile active).
- **Engine mapping:** profile rows. Direct match.

### Row 6 — Settings-depth screens

#### 31. Edit Profile — Form
- **Anatomy:** Back + title "Edit Profile" → centred circular avatar with "Change Photo" link under → fields: Full Name "Jamison Muharia" † / Phone Number "+254 …" / Email Address "jamison@example.com" † → solid CTA "Save Changes" bottom.
- **Engine mapping:** form flow (profile edit) / profile.

#### 32. Payment Methods — Wallet
- **Anatomy:** Back + title "Payment Methods" → saved-method cards: M-PESA card (green logo, "+254 712 345 678", green "Default" pill †) → VISA card (logo, masked number "•••• 0023" †, blue action pill †) → (space) → solid CTA "Add Payment Method" bottom.
- **Engine mapping:** wallet. Direct match — stored payment methods, not checkout.

#### 33. Reviews — Rating summary + review list
- **Anatomy:** Back + title "Reviews" → summary block: giant "4.8" + 5 stars (4 filled amber, 1 empty) + "(220 Reviews)" † → rating distribution bars: 5 rows (5★→1★) with amber progress bars of decreasing length → reviewer rows: avatar + name (Mary Wanjiku / James Odhiambo †) + stars + review text † → outlined CTA "View All Reviews".
- **Engine mapping:** reviews pattern — rating summary with **distribution bars** is a named sub-pattern; MISSING as a core engine pattern (see census).

#### 34. Help & Support — Link list
- **Anatomy:** Back + title "Help & Support" → plain text rows with chevrons: FAQs / Contact Support / Safety Tools / Report a Problem / Terms & Conditions / Privacy Policy † → "Logout" red text at bottom (below a divider).
- **Engine mapping:** profile rows (link-list variant, no icons/discs — visibly plainer than Screen 30).

#### 35. Write a Review — Rating form
- **Anatomy:** Back + title "Write a Review" → "Overall Rating" label → large star row: 4 amber filled + 1 grey empty (4 stars selected) → "Your Review" label → large empty textarea with placeholder † → outlined CTA "Submit Review" (note: outline, not solid — the only outlined primary-style CTA in this row).
- **Engine mapping:** form flow (review form) + star-rating input. Star input is a distinct control.

#### 36. Invite & Earn — Referral promo
- **Anatomy:** Full-bleed dark navy field → title "Invite & Earn" centred white → sub "Invite your friends and earn up to Ksh 500" (amount in blue) → centred illustration (two people high-fiving, documents) → white referral-code field/card: "Your Referral Code: ESQ234" + copy icon † → solid blue CTA "Invite Now" → text link "How it works?".
- **Engine mapping:** promo/referral screen — closest to promo banner grown to a full screen; MISSING as a named full-screen pattern.

---

## Pattern census — StayNest

| Pattern | Count (screens) |
|---|---|
| Product card / property list row | 5 (9 hero card, 10, 14, 26, 27) |
| Profile rows | 3 (30, 34; 23 conversation rows related) |
| Form flow / auth forms | 5 (6, 7, 8 OTP, 31, 35) |
| Onboarding | 4 (1 splash + 2, 3, 4 pager) |
| Map / tracking | 3 (13, 19, 20) |
| Detail sheet (property) | 2 frames / 1 screen (15, 16) |
| Solid blue full-width CTA | 20+ instances across 36 screens — the board's default |
| Filter chips / chip rail | 4 (9, 12, 20 mode chips, 24 time slots related) |
| Greeting home | 1 (9) |
| Filter sheet | 1 (12) |
| Search (field-led screens) | 4 (10, 11, 13, 23/28 fields) |
| Notifications feed | 1 (28) |
| Wallet / payment methods | 1 (32) |
| Success / confirmation | 1 (25) |
| Radio/card selection | 2 (5 role, 24 time slots) |
| Reviews (summary + list / write) | 2 (33, 35) |
| Gallery | 1 (18) |
| Chat / messages | 2 (22, 23) |
| Calendar booking | 1 (24) |
| Voice call | 1 (29) |
| Referral promo (full screen) | 1 (36) |
| KPI/stat trio | 1 (21, inside landlord profile) |
| Medallion rail | 0 — amenity discs (15, 17) are display-only, not selectable medallions |
| Radio-row checkout | 0 — no checkout; payment is stored methods only |

**MISSING / not covered by a named engine pattern (recurring value in brackets):**
- **Chat thread + conversation list** (22, 23) — a complete messaging pair.
- **Calendar + time-slot booking picker** (24).
- **Voice-call screen** (29).
- **Tabbed photo/video/360 gallery** (18).
- **Reviews with rating-distribution bars** (33) and **star-rating input** (35).
- **Range slider** in filters (12) and **checkbox amenity list** (12).
- **Location-recents search screen** (11) and **commute planner with transport-mode chips** (20).
- **Full-screen referral promo** (36).
