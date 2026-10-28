# Board Decode — Car Wash / Auto Service ("Proglow Auto Spa")

- **Source:** `e106c6ca33fa06b2eb7bf3192a6c001c0055355af863d3d9df1819c395493312.jpg` (736×1182, pale lavender-grey presentation board, 5 columns × 4 rows of phone frames)
- **App / domain:** Car wash / auto-service marketplace — find a washing centre, view a provider (hero example "Proglow Auto Spa", service "Car Washing"), book, navigate there, rate. No app name beyond the splash logo text "CAR WASH".
- **Legibility warning:** This is the smallest-rendered board of the four. Headings, CTAs and structure are legible at crop resolution, but almost all body copy, field values, prices ("$7.2–$21…" † on map cards) and review text are **illegible at board resolution — inferred type only** where marked †. Nothing below invents body text.
- **Frames inventoried:** 20 phone frames. Frames 10/6 are the same location screen (10 is Row 1's last frame; 6 opens Row 2 — the board itself repeats it, likely a layout duplicate; both are inventoried and flagged as one distinct screen). Frames 12–15 are four tab states of ONE provider-detail screen.
- **Palette (approximate, from flat UI fields):** primary coral-red `#F24E3E`–`#EE4B38` (solid CTAs, pins, logo drop, active tab underline); white `#FFFFFF`; text near-black `#1C1B1A`; muted grey `#9B968F`; pale grey filled fields `#F1F0EE`; pale pink tint `#FDECEA` (splash corners, check disc); star amber `#F6B73C`; dark photo headers (provider hero is a near-black workshop photo).
- **Type roles:** Display — bold sans, red for screen titles on auth/setup screens ("Enter Your Mobile Number", "OTP Verification", "Complete Your Profile!"), black for in-app titles. Titles are centre-aligned on setup screens, left on in-app screens. UI — small grey body †.
- **Shape language:** The most pill-forward board: every primary CTA is a fully-round pill. Fields are fully-round pills too (grey filled). Setup screens centre a huge pale-grey circle holding one oversized red glyph (phone, OTP shield, pin, bell) — a signature motif repeated 4 times. Cards ~14px radius; provider photos have rating pills overlaid. Tab underline on detail is a short red rule under the active label.
- **Density character:** Setup flow is extremely sparse (one glyph, one title, one field, one CTA per screen). In-app screens (Home, Detail, Videos) are denser: grids and lists. Two density modes in one app.
- **Nav model:** Bottom tab bar, 4 icons (Home filled red disc when active / Location / Favourites-heart / Profile) visible on Home and Map frames only. Everything else: back chevron top-left or no header. Detail screen has its own in-page tab row (About / Service / Gallery / Review).

---

## Screen inventory

### Row 1 — Brand, welcome, phone auth, location ask

#### 1. Splash — Logo
- **Anatomy:** White field with pale-pink corner blobs → centred logo: red water-drop containing a black/white car front, bubbles either side → wordmark "CAR WASH" bold black under. Nothing else — no CTA, no tagline.
- **States:** Launch/static.
- **Engine mapping:** onboarding / splash (logo-only variant).

#### 2. Welcome — Photo onboarding
- **Anatomy:** Photo header (~55%): white sports car covered in wash foam, front view → red headline "Your Journey to a Gleaming Car Begins Here!" centred → 2–3 lines grey copy † → solid red pill CTA "Let's Get Started" †(label partly legible) → footer "Already have an account? Sign In" †.
- **Engine mapping:** onboarding (photo hero — same family as SwiftGo Screen 1).

#### 3. Enter Your Mobile Number — Phone auth step
- **Anatomy:** Centred pale circle with oversized red telephone handset glyph → red title "Enter Your Mobile Number" → sub "We Send You a 4-digit OTP on Your Mobile Number For Verification" †wording approximate → single pill field "Mobile Number" † → reassurance line † ("Don't worry your number will not be share with anyone" as rendered in tiny type — type only) → solid red pill CTA "Get OTP" †.
- **Engine mapping:** auth (phone-number step). One-field-per-screen auth is a distinct pacing from StayNest/QuickServe combined login forms.

#### 4. OTP Verification
- **Anatomy:** Centred pale circle with red OTP/shield-phone glyph → red title "OTP Verification" → sub with masked number † → 4 separate digit boxes "4 6 8 0" filled → "Didn't receive the OTP? Resend OTP" † with Resend as red link → solid red pill CTA "Verify & Proceed".
- **Engine mapping:** auth — OTP variant (4 boxes here vs StayNest's 6).

#### 5. Location / Best Price — Location ask
- **Anatomy:** Red headline centred "Let us create the best price For you!" + sub † ("It helps us with your location?"-type line, illegible verbatim) → centred pale circle with oversized red location pin → (large space) → solid red pill CTA "Verify & Proceed" with a small icon left † → below it an outlined pill field/button with search icon and the same "Verify & Proceed" label † — an odd board duplication of the CTA in two treatments; recorded as rendered.
- **Engine mapping:** permission/location-priming screen — MISSING as a named pattern (a "prime + ask" screen before a system permission). Closest: onboarding.

### Row 2 — Location (repeat), profile, password, notifications, home

#### 6. Location / Best Price — Repeat of Screen 5
- **Anatomy:** Identical in type to Screen 5 (same headline, pin disc, solid + outlined CTA pair). Counted as a board duplicate, **not** a second distinct screen.
- **Engine mapping:** As Screen 5.

#### 7. Complete Your Profile! — Profile form
- **Anatomy:** Red title centred "Complete Your Profile!" + sub † → centred circular avatar photo (man) → labelled pill fields †: Name (user icon, value illegible), Phone Number (phone icon), Gender (dropdown chevron, "Select…" †) → solid red pill CTA "Complete Profile".
- **Engine mapping:** form flow (profile completion) / auth-adjacent onboarding form.

#### 8. New Password! — Password reset form
- **Anatomy:** Back chevron → red title centred "New Password!" + sub † → "Password" label → pill password field with eye/lock icon † → "Confirm Password" label → pill field → solid red pill CTA "Create New Password".
- **Engine mapping:** auth (password-reset step).

#### 9. Enable Notification Access! — Permission priming
- **Anatomy:** Back chevron → centred pale circle with red bell glyph + small "1" badge disc → title "Enable Notification Access!" (black) → sub "Enable notification to receive real-time updates." → solid red pill CTA "Allow Notification" → text link "Maybe Later" under.
- **Engine mapping:** permission-priming screen — same MISSING family as Screen 5. Two permission primes on one board makes this a recurring pattern, not a one-off.

#### 10. Home — Greeting / services home
- **Anatomy:** Header: "Location" label + location line with chevron † ("Korangi…" † — proper noun illegible, type only) left, notification/bell disc right † → pill search field + black circular filter/tune button right → section "Especially For You" † + promo carousel: dark photo card "Limited Time / Get Special Offer / Up to 40%" with small red CTA pill †, second card peeking at right edge (carousel) → services icon grid: 2 rows × 4 circular pale discs with red vehicle/service glyphs and tiny labels † (labels illegible — type only: service categories) → section "Popular Service Provider" + "See All" † → provider photo cards row: photo, rating pill "4.8" on photo, bookmark/heart disc → 4-icon bottom tab bar (Home active in red disc).
- **Components:** location header, pill search + filter button, promo carousel, circular icon service grid, provider cards, tab bar.
- **Engine mapping:** greeting home (location variant, cf. SwiftGo 2) + promo banner (carousel form) + medallion/icon-disc grid — here the discs are *service categories* (navigational), closer to SwiftGo's quick-action discs than to selectable medallions + product card.

### Row 3 — Map and provider detail (4 tab states)

#### 11. Map Explore — Providers on a map
- **Anatomy:** Full-bleed pale map → floating search pill at top ("Search…" †) + red circular filter button top-right → red service-area blob/overlay with several red dots and a central location marker → bottom: horizontally scrolling provider cards overlapping the map edge: photo, rating pill "4.8", red location disc, name † ("Platinumglow car Wash" †), price range † ("$7.2–$21…") → 4-icon tab bar (Location active, red disc).
- **Engine mapping:** map/tracking (provider-discovery variant) + product card rail over map.

#### 12. Provider Detail — About tab
- **Anatomy:** Dark photo/video header: workshop photo, back icon top-left, search + more icons top-right, centred "Demo Video" play pill, thumbnail filmstrip row (7 small photos) along header bottom → title block: category "Car Washing", star rating "4.8" + review count †, provider name "Proglow Auto Spa" bold, address line †, red circular share/locate button right † → in-page tab row: About (active, red underline) / Service / Gallery / Review → About section: grey copy block † with "Read more" † → "Service Provider" sub-block: avatar + "Robert Fox" † + role, message/call icon buttons right → solid red pill CTA "Book Service Now" bottom-pinned.
- **Engine mapping:** detail sheet (video-hero + filmstrip variant) + profile/provider row. The video header with filmstrip is a richer hero than the engine's photo detail sheet.

#### 13. Provider Detail — Service tab
- **Anatomy:** Identical header/title/tab shell to Screen 12, Service tab active → "Service" section: 2 pale pill rows with clock icon + service name † ("Premium …" / "Interior Cleaning"-type — illegible verbatim, type only) → solid red pill CTA "Book Service Now".
- **Engine mapping:** detail sheet (tab state) — services as selectable/priceable rows, family of radio rows but rendered as info pills † (selection state not legible).

#### 14. Provider Detail — Gallery tab
- **Anatomy:** Same shell, Gallery tab active → "Gallery" label + "See All" † → photo grid 2 rows × 3 (wheel, car rear, foam wash, etc.) → solid red pill CTA "Book Service Now".
- **Engine mapping:** detail sheet (tab state) + gallery grid (in-tab form; cf. StayNest's full-screen gallery).

#### 15. Provider Detail — Review tab
- **Anatomy:** Same shell, Review tab active → search field "Search reviews" † → filter chips row (All / selected red chips † — labels illegible) → review rows: avatar + name ("Dale Thiel" † as rendered) + meta right †, repeated ×2 visible → solid red pill CTA "Book Service Now".
- **Engine mapping:** detail sheet (tab state) + reviews list + filter chips. Note the CTA stays booking even on the Review tab.

### Row 4 — Journey to the centre, rating, video list

#### 16. Washing Centre Location — Map + directions
- **Anatomy:** Map fills screen: river/road geography, single red pin with provider avatar inside it top area → header line: back chevron + title "Washing Center Location" † → solid red pill CTA "Get Direction" bottom-pinned over map.
- **Engine mapping:** map/tracking (single-destination map).

#### 17. You Have Arrived! — Arrival success
- **Anatomy:** Back chevron → centred huge red check inside an open red circle on pale pink disc field → red headline "You Have Arrived!" → sub "You Have Arrived at the washing center" †wording approximate → (large space) → solid red pill CTA "Ok" bottom.
- **Engine mapping:** success/confirmation (arrival variant) — a location-triggered success, distinct from a booking confirmation.

#### 18. Navigation / Route — Map with route line
- **Anatomy:** Same map geography as Screen 16, now with a red route line from a red origin disc (bottom) curving to the avatar pin (top) → header † ("Direction" in red, top) → solid red pill CTA "Start" bottom.
- **States:** Pre-navigation route preview; Screen 16 → 18 → 17 reads as one journey sequence (locate → route → arrived).
- **Engine mapping:** map/tracking (route preview).

#### 19. Rate the Provider — Review submission
- **Anatomy:** Photo header (car in spray/mist, dark) with back + title † → title block as Screen 12 (Car Washing / 4.8 † / Proglow Auto Spa / red disc button) → rating card: prompt "Your overall rating of this product!" † + star row (4 amber filled, 1 empty) in a bordered white card → "Add detailed review" label † → empty text area → solid red pill CTA "Submit".
- **Engine mapping:** reviews (write form) + star-rating input — same pattern family as StayNest Screen 35, here attached to a provider detail header.

#### 20. All Servicing Video — Video list
- **Anatomy:** Back chevron → hero video card: dark "CAR WASH" branded thumbnail with red car, centre play button → section title "All Servicing Video" → vertical list of 6 video rows: thumbnail left (with play/detail graphics), title lines † (illegible), star rating in red (4.8 / 3.6 / 4.1 / 1.8 / 4.6 / 1.6 †as rendered) + review count †.
- **Engine mapping:** MISSING — video/media list. No engine pattern covers a video catalogue list; closest is a product list with video thumbnails, but play affordance + duration/rating semantics differ.

---

## Pattern census — Car Service

| Pattern | Count (frames) |
|---|---|
| Solid red pill CTA (bottom or lower-third) | 15+ instances — every frame except Splash (1) has one |
| Auth / setup form (one-purpose screens) | 5 (3, 4, 7, 8 + login implied in 2) |
| Centred glyph-disc hero (pale circle + oversized red icon) | 4 (3, 4, 5/6, 9) |
| Permission-priming screen | 2 (5/6 location, 9 notifications) |
| Onboarding / splash | 2 (1, 2) |
| Detail sheet (provider) | 4 frames / 1 screen (12–15) |
| Map / tracking | 3 (11, 16, 18) |
| Gallery grid | 1 (14, in-tab) + filmstrip in 12–15 headers |
| Reviews (list in 15, write in 19) | 2 |
| Success / confirmation | 1 (17) |
| Greeting home | 1 (10) |
| Promo banner (carousel) | 1 (10) |
| Icon-disc service grid | 1 (10) + provider cards (10, 11) |
| Product/provider card | 2 screens (10, 11) |
| Filter chips | 1 (15, review filters) |
| Video list | 1 (20) |
| Profile rows / wallet / filter sheet / radio-row checkout / tracker timeline | 0 — no profile hub, no payment, no checkout and no order tracking on this board at all (booking is a CTA into an unshown flow) |

**MISSING / not covered by a named engine pattern:**
- **Permission-priming screens** (location, notifications) — recurring ×2, always: glyph disc + benefit title + Allow/Verify + "Maybe Later".
- **One-field-per-screen phone auth** (mobile → OTP as separate sparse screens, Screens 3–4).
- **Video list / media catalogue** (Screen 20) and **video-hero detail header with filmstrip** (Screens 12–15).
- **Arrival success** as a location-triggered terminal state (Screen 17).
- Note the *absences*: this board has no checkout, wallet, profile hub or order tracker — an engine generated from it must not invent those patterns.
