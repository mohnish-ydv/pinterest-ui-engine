# Board Decode — Medica (Doctor Appointment)

- **Source board:** `e7820de7e4796ae2c3d3bab8024ef22d5a2dee04d75ae6af5349d30f6185fc4f.jpg` — 19 screens in a 5-5-5-4 grid on light grey. Screens are small; headings, prices, dates, times, names and CTA labels are legible at row-crop resolution. Paragraph body under "About" is lorem ipsum and is noted as such; tiny sub-labels on doctor cards on the home screen are partially illegible — flagged per screen.
- **App / domain:** "Medica" — doctor discovery and appointment booking: account → profile setup → find doctor → doctor detail → date/time → consultation package (message / voice / video) → patient details → payment method → review & pay → appointments (upcoming/completed/cancelled) → chat consultation → profile/logout.
- **Palette (approximate, from flat UI fields):** Primary blue `#2F6BFF → #3B82F6` approx. (CTA pills, selected date/time/package states, chat bubbles, upcoming-visit card); pale blue tint `#EAF1FF` approx. (screen top wash, icon tiles, unselected chips' ground); ground white `#FFFFFF`; ink `#16233B` approx.; muted `#8A94A6` approx.; success/warning colours are not used — even "Cancelled" state uses the same blue/grey system.
- **Type roles:** Display — bold geometric sans for screen titles centred in the header ("Create New Account", "Fill Your Profile", "Login to Your Account") and doctor names. UI — same sans throughout, regular grey for labels above fields; prices in bold blue. No serif, no display face.
- **Shape language:** Soft and uniform. Screens ~20px radius on the board; cards ~16px; inputs are borderless pale-filled rounded rectangles (~12px) rather than outlined fields; primary CTA is a full pill; date selector uses pill/circle states (selected day = solid blue elongated pill); time chips are pills; radio rows are pale cards with a radio circle on the right; bottom nav active item is a solid blue pill capsule containing the icon.
- **Density character:** Medium-high but very regular: this is a **wizard/flow board** — almost every screen is one step with a single bottom CTA, generous spacing between grouped rows, and identical doctor-summary headers repeated across 4 consecutive steps (a strong "persistent summary header in a flow" signal).
- **Nav model:** Two regimes. (a) Flow screens: top header = circular/back chevron left + centred title (+ occasional right icon: expand on Payment, kebab on chat), no tab bar, single bottom pill CTA. (b) Main screens (Home, Appointments, Chat, Profile): bottom tab bar with 5 slots — home, appointments/calendar (active = blue pill capsule), centre "+" , chat, profile. The centre "+" is a plain icon slot here, not a raised FAB (contrast Proton Vault).

---

## Screen inventory

### 1. Splash
- **Purpose:** Brand entry.
- **Anatomy:** White ground → large pale-blue abstract heart/ECG blob shape bleeding from bottom-left corner → centred lockup: blue heart-with-pulse-line logo mark + "Medica" bold black wordmark. Nothing else.
- **CTA:** None.
- **States:** Static.
- **Engine mapping:** Onboarding/splash (logo-only variant; cf. Fibo mascot splash).

### 2. Create New Account (Sign Up)
- **Purpose:** Account creation.
- **Anatomy:** Back chevron in circle top-left → centred title "Create New Account" → labelled fields: Email (filled `jameskel123@gmail.com` approx. — demo email, small text), New Password (masked, eye icon right), Confirm Password (placeholder "Enter password", eye icon) → checkbox row: empty checkbox + "Remember me" → primary CTA (partially obscured by the on-screen keyboard) → **system keyboard open** occupying lower ~40% (QWERTY, suggestion strip "Hello / Hello / Hello", "Leerzeichen" space bar — a stock keyboard render, part of the kit mock, not app UI).
- **CTA:** Solid blue pill "Create New Account" (label inferred from title/position; partially covered by keyboard at board resolution).
- **States:** Keyboard-up state; fields mixed filled/placeholder.
- **Engine mapping:** Auth (sign-up, with confirm password — fuller than Fibo's).

### 3. Fill Your Profile (Profile Setup)
- **Purpose:** Post-signup profile completion.
- **Anatomy:** Back chevron → centred title → centred circular avatar photo with small blue circular edit/plus badge at its lower-right → fields: First Name (placeholder), Last Name (placeholder), Date of Birth (placeholder + calendar icon right), Gender (dropdown, chevron down) → bottom CTA.
- **CTA:** Solid blue pill "Continue".
- **States:** Empty form (all placeholders), avatar already present.
- **Engine mapping:** Auth-adjacent profile form / step form — resembles engine form screens; avatar-with-edit-badge is a named component here.

### 4. Login to Your Account
- **Purpose:** Returning-user auth.
- **Anatomy:** Back chevron → centred title → Email field (filled demo email) → Password field (masked, eye icon) → options row: checkbox + "Remember me" left, blue text link "Forgot Password" right → CTA → small fingerprint/biometric glyph centred below CTA approx. (small circle mark at board resolution) → system keyboard open lower ~40% (same stock render as #2).
- **CTA:** Solid blue pill "Login".
- **States:** Keyboard-up; remember-me unchecked.
- **Engine mapping:** Auth (login).

### 5. Home — "Hello Kelvin"
- **Purpose:** Patient home: greeting, search, upcoming visit, specialties, popular doctors.
- **Anatomy:** Header row: small circular avatar left + "Hello Kelvin" bold / "Good Morning" grey, bell icon right in circle → pill search field (magnifier, "Search doctor…", filter icon right) → section "Upcoming Visit" → **filled blue visit card**: doctor avatar + "Dr. Daniel Michael / Cardiologist", video-call icon right in pale tile, bottom row inside card: calendar icon + "Date / 17 June 2025" approx., clock icon + "Time / 8:30 AM" approx. (small text on blue — dates read at crop resolution, treat day/month as approx.) → **specialty icon row**: 4 items, icon in pale-blue circle + label under ("Neurologist", "Cardiologist", "ENT", "Dentist" — labels small, first two legible, last two inferred from icons at board resolution) → section "Popular Doctors" → **2×2 doctor card grid** (2 rows visible, second row cut): each card — avatar photo, name ("Dr. Daniel…", "Dr. James…", second row "Dr. Ayaan…", "Dr. Zayan…"), specialty sub (small, partially illegible at board resolution — inferred type only), price "$20.00" / "$25.00" in blue + small arrow/message tile → bottom tab bar (Home active, blue capsule).
- **Components:** Greeting home header, search pill, filled appointment/hero card, specialty medallion-style icon row, doctor product cards (person cards with price), tab bar.
- **CTA:** None full-width; cards are tappable.
- **Engine mapping:** Greeting home + medallion rail (specialties are icon medallions) + product card (applied to people/services).

### 6. Doctor Details — "Dr. Daniel Michael"
- **Purpose:** Doctor profile / service detail.
- **Anatomy:** Header: back chevron + centred "Doctor Details" → **summary header**: left text block — name (2 lines, large bold), specialty "Cardiologist" grey, price "$20.00" bold blue + "/Consultation fee" small; right: large cut-out photo of the doctor (white coat, stethoscope) bleeding to the card edge → **stat trio row** overlapping/below photo: 3 pale mini-cards — "12 YRS / Experience", "4.5 / Rating" (star), "4,200 / Patients" (values legible at crop) → section "About" → paragraph (explicit lorem ipsum dummy text in the kit) → section "Working Time" → rows: "Monday — 8:00 PM – 10:00 PM", "Tuesday — 8:00 PM – 10:00 PM" (further days below fold) → bottom CTA.
- **CTA:** Solid blue pill "Book Appointment", bottom-anchored.
- **Engine mapping:** Detail sheet pattern but as a **full page** (not a sheet) with person-photo header + stat trio — mapping: detail page variant of detail sheet.

### 7. Booking Appointment — Select Date & Time
- **Purpose:** Flow step 1: choose date/time for the same doctor.
- **Anatomy:** Header: back + "Booking Appointment" → same doctor summary header as #6 (name, specialty, $20.00, photo, stat trio — repeated verbatim, slightly compressed) → section "Select Date" → **horizontal date strip**: day cells (number over weekday) 15 Sun, 16 Mon, **17 Tue selected — solid blue tall pill**, 18 Wed, 19 Thu, 20 Fri → section "Select Time" → time chip row: "8:00 PM" (unselected pale), **"8:30 PM" selected solid blue**, "9:00 PM" → small row under: "Write a custom schedule" + right link "Request Schedule" approx. → bottom CTA.
- **CTA:** Solid blue pill "Make Appointment".
- **States:** Exactly one date + one time selected.
- **Engine mapping:** Booking flow step — **date strip + time chips component is MISSING** as a named engine pattern (closest: filter chips + radio rows, neither is a calendar strip).

### 8. Select Package — Consultation Type
- **Purpose:** Flow step 2: choose consultation channel.
- **Anatomy:** Header: back + "Select Package" → same doctor summary header again → section "Select Package" → **3 radio rows** (pale cards): icon tile + label + radio circle right — "Message", "Voice Call", "Video Call" (**selected: filled blue radio**) → bottom CTA.
- **CTA:** Solid blue pill "Continue".
- **States:** Video Call selected; others unselected.
- **Engine mapping:** Radio-row checkout pattern (exact match — radio rows used for a service package, not payment).

### 9. Patient Details
- **Purpose:** Flow step 3: who the appointment is for.
- **Anatomy:** Header: back + "Patient Details" → **segmented selector row**: two option cards — "For Myself" (avatar icon, **selected radio filled**) / "Other" (person icon, unselected radio) → fields: Patient Name (text, placeholder), Gender (dropdown), Age (dropdown), Notes (multi-line textarea, placeholder "Enter message") → bottom CTA.
- **CTA:** Solid blue pill "Continue".
- **States:** "For Myself" pre-selected; form empty.
- **Engine mapping:** Step form with a 2-option radio-card selector on top — radio rows (card variant) + form.

### 10. Payment Method
- **Purpose:** Flow step 4: choose payment.
- **Anatomy:** Header: back + "Payment Method" + expand/fullscreen icon right → **4 radio rows**: brand mark + label + radio right — Paypal, **Master Card (selected)**, Google Pay, Apple Pay → outlined pill button "Add New Card" (blue text, hairline blue border — the only outlined button in the board) → large empty space → bottom CTA.
- **CTA:** Solid blue pill "Continue"; secondary outlined "Add New Card" in flow.
- **States:** Master Card selected.
- **Engine mapping:** Radio-row checkout (canonical example) + wallet-adjacent "add card" secondary action.

### 11. Review Booking (variant A)
- **Purpose:** Flow step 5: review summary before paying.
- **Anatomy:** Header: back + "Review Booking" → doctor summary row (small avatar + name + specialty in a pale card) → **definition rows** (label left grey, value right bold): Date "17 June, 2025", Time "8:30 PM", Package "Video Call" → divider → Patient Name "James Kelvin", Age "21", Gender "Male" → divider → Fee "$20.00", Tax "$2.00", **Total Amount "$22.00"** → payment row: MasterCard mark + masked "1234 •••• 5678" + right link "Change" → bottom CTA.
- **CTA:** Solid blue pill "Pay".
- **States:** Complete summary state.
- **Engine mapping:** Checkout review / summary — resembles tracker/receipt rows; **booking-review summary is the checkout-summary pattern** (engine: radio-row checkout's final step).

### 12. Review Booking (variant B — duplicate)
- **Purpose:** Same as #11.
- **Anatomy:** Visually identical to #11 at board resolution: same doctor, date, time, package, patient, fee $20.00 / tax $2.00 / total $22.00 (reads $22.00; first-glance crop suggested $21.00, on re-read both variants show the same layout — any numeric difference between A and B is **illegible at board resolution**, so B is recorded as a duplicate/variant, not a distinct screen state).
- **CTA / States:** "Pay", as #11.
- **Engine mapping:** As #11. Counted as a distinct board screen (the kit places it separately) but **not a distinct pattern**.

### 13. Appointments — Upcoming tab
- **Purpose:** Appointment list, upcoming state.
- **Anatomy:** Header: back + "Appointment" → **tab row**: "Upcoming" (active, blue text + blue underline), "Completed", "Cancelled" (grey) → 3 appointment cards, each: avatar + name + specialty, video/phone icon tile right, date row (calendar icon + date, clock icon + time), action row: pale pill "Cancel" + solid blue pill "Change Schedule" (labels small; read at crop as Cancel / Change Schedule approx.) — doctors: Dr. Daniel Michael, Dr. David John, Dr. James William → bottom tab bar (Appointments active).
- **CTA:** Per-card dual actions (quiet cancel + solid reschedule).
- **States:** Upcoming tab active.
- **Engine mapping:** Tracker/list with segmented tabs + list cards with dual actions — **segmented tab header (Upcoming/Completed/Cancelled) is a distinct component**; closest engine: tracker.

### 14. Appointments — Completed tab
- **Purpose:** Past appointments.
- **Anatomy:** Same shell as #13 → tab row with "Completed" active → 3 cards (Dr. Ayaan Arin, Dr. Zayan Kian, Dr. Leo Nathan) with date/time rows → action row per card: pale pill "Re-Book" approx. + solid blue pill "Leave Review" approx. (small text, read at crop resolution).
- **States:** Completed tab active; actions switch to re-book/review.
- **Engine mapping:** As #13 — same pattern, different state + action set.

### 15. Appointments — Cancelled tab
- **Purpose:** Cancelled appointments.
- **Anatomy:** Same shell → "Cancelled" active (blue underline on the third tab) → 3 cards (same doctors as #14) → action row: pale pill "Delete" + solid blue pill "Re-Book".
- **States:** Cancelled tab active; actions switch to delete/re-book.
- **Engine mapping:** As #13. Together #13–15 prove the engine needs **one list pattern whose actions are state-dependent**, not three patterns.

### 16. Chat — Conversation List
- **Purpose:** Doctor chat inbox.
- **Anatomy:** Header: back + centred "Chat" → search pill ("Search doctor…", filter icon) → 7 conversation rows: avatar, name bold, one-line grey preview ("Hey! What about your health?", "Sure, I'll update you on your test results…", etc. — previews legible in gist, exact wording varies per row), time right (small, "5m ago" style — exact values illegible at board resolution, inferred type only) → bottom tab bar (Chat active, blue capsule).
- **CTA:** None; rows open threads.
- **Engine mapping:** Chat list — **MISSING** (chat pattern absent; rows otherwise resemble profile rows).

### 17. Chat Thread — "Dr. Daniel Michael"
- **Purpose:** 1:1 consultation chat.
- **Anatomy:** Header: back + doctor name centred + kebab right → centred info card: "Consultation Start" blue bold + sub "You can consult your problem to the doctor" → thread: incoming pale bubble with small avatar ("Good afternoon! What's your problem?") + timestamp; outgoing **solid blue bubble**, white text (patient describing headache/fever symptoms — multi-line, legible in gist); incoming follow-up questions bubble; outgoing blue bubble reply; typing/identity line at bottom of thread: small avatar + "Prof. Dr. Daniel Michael" + typing dots "•••" → composer: pale pill input "Type message…" + attachment icon, circular blue send button with white paper-plane/arrow.
- **CTA:** Send = circular blue icon button.
- **States:** Typing indicator shown; consultation-started state.
- **Engine mapping:** Chat thread — **MISSING** (pair with Fibo #12: same pattern, different palette/bubble treatment — incoming pale vs Fibo light, outgoing solid primary in both).

### 18. Profile — "James Kelvin"
- **Purpose:** Patient profile hub.
- **Anatomy:** Header: back + "Profile" → centred circular avatar photo → name "James Kelvin" bold → email sub (small, `jameskel123@gmail.com` approx.) → menu rows (pale cards, icon in pale-blue circle left + label, no chevrons visible — rows read as full tappable cards): Edit Profile, Payment, Security, Help Center, Invite Friends, Logout (logout icon in blue circle, label in dark — not red) → bottom tab bar (Profile active).
- **CTA:** None.
- **Engine mapping:** Profile rows (card-style variant: full pale cards instead of hairline rows).

### 19. Profile — Logout Confirmation (Modal over #18)
- **Purpose:** Destructive-action confirmation.
- **Anatomy:** Same profile screen **dimmed** under a dark slate scrim (whole screen darkened, avatar/name still faintly visible) → centred white modal card (~16px radius): large pale-blue circle with blue logout/exit arrow icon, decorative dots around it → heading "Sure You Want to Leave?" bold centred → action row: pale pill "Cancel" left + solid blue pill "Logout" right → profile rows and tab bar visible but dimmed behind.
- **CTA:** Dual: quiet "Cancel" vs solid "Logout" (destructive action is the solid one — notable inversion of the usual quiet-destructive convention).
- **States:** Modal-open state over profile.
- **Engine mapping:** **MISSING** — confirmation modal/dialog over a dimmed screen has no named engine pattern (detail sheet is not a centred dialog).

---

## Pattern census — Medica

| Pattern | Count |
|---|---|
| Bottom pill CTA (solid blue, flow-anchored) | 10 (screens 3,4,6,7,8,9,10,11,12 + 2 under keyboard) |
| Persistent doctor summary header in a flow | 4 (6,7,8 + compact row in 11/12) |
| Radio rows (package / payment / patient-for) | 3 screens (8: 3 rows, 9: 2 cards, 10: 4 rows) |
| Auth / profile form (labelled pale inputs) | 3 (2,3,4) + 1 form step (9) |
| List cards with state-dependent dual actions | 3 tab states (13,14,15) |
| Profile rows | 2 screens (18, 19-behind-modal) |
| Bottom tab bar with capsule-active item | 4 (5,13/14/15 counted as 1 shell + variants,16,18) |
| Chat (list + thread) | 2 (16,17) |
| Greeting home | 1 (5) |
| Medallion/icon rail (specialties) | 1 (5) |
| Product/person cards | 1 grid of 4 (5) |
| Date strip + time chips | 1 (7) |
| Review/summary (definition rows + totals) | 2 (11,12 duplicate) |
| Confirmation modal | 1 (19) |
| Splash | 1 (1) |

**MISSING in engine (from this board):** Date strip + time-chip booking step; chat list; chat thread; centred confirmation modal; segmented tab header for state lists (Upcoming/Completed/Cancelled); avatar-with-edit-badge.
