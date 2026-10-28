# Board Decode — Fibo (AI Learning Companion)

- **Source board:** `00a7f91290a430ec4ccac48fbb5f681e70f36d2bcb89bc5ab9edad057d84f686.jpg` — labelled UI-kit sheet, 30 numbered screens in a 6 × 5 grid, each screen captioned below (1. Splash … 30. Help & Support). Captions are legible; body copy inside screens is legible at row-crop resolution except where noted.
- **App / domain:** "Fibo — AI Learning Companion". Gamified AI-education app for a named learner (Hussain): courses → lessons → quizzes, with coins, streaks, leaderboard, achievements, premium upsell, and an AI chat tutor.
- **Palette (approximate, from flat UI fields):** Primary orange gradient `#FF7A18 → #FF9E2C` approx. (solid CTA fill, hero cards, progress ring); pale peach tint `#FFF1E3 / #FFE8D1` approx. (selected rows, icon chips, onboarding wash); ground `#FFFBF6` approx. warm off-white; ink `#1E1E1E` approx.; muted text `#8A837C` approx.; coin/gold accent `#FFB020` approx. Photography: none — colour comes from a single 3D robot mascot illustration reused on ~12 screens.
- **Type roles:** Display/headings — bold, rounded-feel geometric sans, sentence case, tight ("Meet Fibo", "Great Job!", "What is Artificial Intelligence?"). UI/body — same sans family, regular, small grey secondary lines. Numeric display — large bold tabular for scores (4/5, 75%, 120, 7 Days). No serif anywhere.
- **Shape language:** Very soft. Screen cards ~20–24px radius; CTA buttons full-pill / large-radius (~14–16px on a pill-proportioned bar); inputs ~12px radius with hairline border; icon tiles rounded squares in peach tint; mascot is the only organic shape. Selected states are filled peach tint, not outline.
- **Density character:** Airy / low density. One primary idea per screen, generous white space, most screens fit without scrolling except list screens (Achievements, Notifications, Courses). List rows are tall (~56–64px) with icon + 2-line text + trailing badge/chevron.
- **Nav model:** Two regimes. (a) Pre-auth / focused tasks: no tab bar, single bottom-anchored CTA, back chevron top-left, dot pagination on onboarding. (b) In-app: 5-item bottom tab bar — Home, Levels (bar-chart icon), Chat (centre, Fibo-face icon), Courses (grad cap), Profile — active item in orange with label, inactive grey icon-only/weak label. Many in-app list/detail screens (Filter, Settings, Help) drop the tab bar and use back-arrow + bottom CTA instead.

---

## Screen inventory

### 1. Splash Screen
- **Purpose:** Brand entry.
- **Anatomy top→bottom:** Empty warm ground with faint sparkle/star specks → centred 3D robot mascot (white/orange, black face screen) → wordmark "Fibo" in large orange bold → caption "AI Learning Companion" in grey → soft orange glow blob at bottom edge.
- **Components:** Mascot illustration, logotype.
- **CTA:** None.
- **States:** Static launch state only.
- **Engine mapping:** Onboarding / splash — resembles engine onboarding hero, but mascot-led brand splash is **MISSING** as a distinct first screen (engine onboarding starts with value prop).

### 2. Onboarding 1 — "Meet Fibo / Your AI Learning Companion"
- **Purpose:** Value prop 1 of 3.
- **Anatomy:** Small step number top-left ("14" — kit page number, ignore) → heading (2 lines, bold) → subheading "Your AI Learning Companion" → 3-line grey body ("Fibo is here to make learning simple, smart and fun for you.") → centred mascot, arms open → bottom CTA → dot pagination (3 dots, first filled orange).
- **Components:** Heading block, mascot, pill CTA, dot pager.
- **CTA:** Solid orange pill, full-width inset, "Next", bottom-anchored.
- **States:** Page 1 of 3 active dot.
- **Engine mapping:** Onboarding.

### 3. Onboarding 2 — "Learn Anything Anytime, Anywhere"
- **Purpose:** Value prop 2 of 3.
- **Anatomy:** Heading → grey body ("Explore courses, practice skills and grow with personalised learning.") → mascot holding/reading a solid blue book (only non-orange accent object in the kit) → CTA → dots (middle filled).
- **Components / CTA / States:** As #2; mascot pose varies per page.
- **Engine mapping:** Onboarding.

### 4. Onboarding 3 — "Achieve More Every Day"
- **Purpose:** Value prop 3 / terminal onboarding page.
- **Anatomy:** Heading → body ("Track your progress, build streaks and achieve your daily goals.") → mascot raising a gold trophy → CTA label changes → dots (last filled).
- **CTA:** Solid orange pill, "Get Started" (terminal label, vs "Next").
- **Engine mapping:** Onboarding (terminal state).

### 5. Login — "Welcome Back"
- **Purpose:** Returning-user auth.
- **Anatomy:** Heading "Welcome Back" + bell icon top-right → sub "Login to continue your learning journey" → labelled field Email (filled `hussain@example.com`) → labelled field Password (masked dots, eye/visibility icon right) → right-aligned orange text link "Forgot Password?" → primary CTA → divider "or continue with" → two circular social buttons (Google "G", Apple) in white tiles → footer line "Don't have an account? **Sign up**" (link in orange).
- **Components:** Labelled text inputs, password-visibility toggle, social auth buttons, text links.
- **CTA:** Solid orange pill "Login", mid-screen directly under form (not bottom-pinned — form is short).
- **States:** Fields pre-filled (returning/demo state).
- **Engine mapping:** Auth (login).

### 6. Sign Up — "Create Account"
- **Purpose:** New-user auth.
- **Anatomy:** Heading → sub "Start your learning journey with Fibo" → Full Name field ("Hussain") → Email field → Password field (masked, eye icon) → CTA → "or continue with" → Google/Apple circular buttons → footer "Already have an account? **Sign up**" [sic — board copy reads "Sign up", presumably meant "Log in"; recorded as shown].
- **CTA:** Solid orange pill "Sign Up".
- **States:** Pre-filled demo values.
- **Engine mapping:** Auth (sign-up). Note: no confirm-password, no terms checkbox — leaner than Medica's sign-up.

### 7. OTP Verification — "Verify OTP"
- **Purpose:** 6-digit code verification.
- **Anatomy:** Centred heading → sub "We sent a 6-digit code to **hussain@example.com**" → single row of 6 spaced digit cells showing `4 7 8 2 1 6` (digits separated, no boxes visible — underline/space style at this resolution) → centred muted line "Resend code in 00:25" (timer) → large empty middle → bottom CTA.
- **CTA:** Solid orange pill "Verify", bottom-anchored.
- **States:** Code fully entered; resend disabled-by-timer state.
- **Engine mapping:** Auth — OTP digit-row is **MISSING** in current engine pattern list (no OTP pattern named).

### 8. Forgot Password
- **Purpose:** Password-reset request.
- **Anatomy:** Heading "Forgot Password?" → body "Enter your email and we'll send you a link to reset your password." → single Email field (filled) → CTA (narrower/centred, not full width) → large envelope illustration in peach/orange below CTA, centred, occupying lower third.
- **CTA:** Solid orange pill "Send Link", centred, ~55% width — the only non-full-width primary CTA in the auth cluster.
- **States:** Email pre-filled.
- **Engine mapping:** Auth (forgot password).

### 9. Reset Password
- **Purpose:** Set new password after link.
- **Anatomy:** Heading → sub "Create a new password for your account" → New Password field (masked, eye) → Confirm Password field (masked, eye) → empty middle → bottom CTA.
- **CTA:** Solid orange pill "Reset Password", bottom-anchored.
- **Engine mapping:** Auth (reset).

### 10. Set New Password — Success ("Password Updated!")
- **Purpose:** Auth-flow confirmation / success state.
- **Anatomy:** Back chevron top-left → large centred orange circle with white check, soft peach halo rings → heading "Password Updated!" → grey body "Your password has been successfully updated." → bottom CTA.
- **CTA:** Solid orange pill "Back to Login".
- **States:** Terminal success state — no form.
- **Engine mapping:** Success/confirmation state — resembles engine empty/result state; a dedicated **success-check state is MISSING** as a named pattern.

### 11. Home Dashboard — "Hello, Hussain 👋"
- **Purpose:** In-app home / continue learning.
- **Anatomy:** Status bar (9:41) → greeting header: "Hello, Hussain 👋" bold + "Good Morning!" grey, right side two small circular icon buttons (mascot avatar tile, settings/gear tile) → **hero card**: full-width orange gradient card, left "Continue Learning" eyebrow, "AI Basics" large white title, "Lesson 4 of 20" + thin white progress bar "40%", white pill button "Continue ▸"; right: mascot waving, overlapping card edge → **Daily Goals card**: white card, target icon in peach circle, "Daily Goals", "2 / 6 Lesson Completed", thin orange progress bar, target icon right → **stat pair row**: two white mini-cards side by side — coin icon "Fibo Coins / 120", flame icon "Streak / 7 Days" → bottom tab bar.
- **Components:** Greeting header, gradient hero/continue card with progress, goal progress card, 2-up stat tiles, tab bar.
- **CTA:** White pill "Continue" inside hero (inverted CTA on colour), not a bottom bar.
- **States:** In-progress course (40%), partial daily goal (2/6).
- **Engine mapping:** Greeting home + promo/hero card. The **resume/continue card with embedded progress + mascot** is a specific sub-pattern; generic greeting home only partly covers it.

### 12. Chat with Fibo
- **Purpose:** AI tutor conversation.
- **Anatomy:** Header bar: orange square tile with X/close glyph, "Chat with Fibo" bold + "Online" green/grey sub, overflow "…" right → message thread: incoming white bubble top-right-aligned block "Hi there! I'm Fibo 👋 / How can I help you today?" (small, right side as rendered — bubble alignment at board resolution: tutor greeting is a small light bubble, user message is solid orange bubble "Explain machine learning in simple terms"), long tutor answer in light bubble (multi-line paragraph on machine learning), typing indicator "•••" in light bubble → composer at bottom: rounded input "Type our message…" [sic] with emoji icon left, circular orange send button with paper-plane right.
- **Components:** Chat header, message bubbles (filled orange = user, light = tutor), typing indicator, composer + send.
- **CTA:** Send is circular icon button; no text CTA.
- **States:** Typing state shown.
- **Engine mapping:** Chat thread — **MISSING** (no chat pattern in engine list).

### 13. Levels — Learning Path
- **Purpose:** Level map for "AI Basics".
- **Anatomy:** Orange gradient header card: eyebrow "AI BASICS", "Level 3" large white, "AI Explorer" sub, mascot peeking from right edge → white card "Daily Goal / 2 of 6 Lessons" with target icon + progress → **vertical winding path**: numbered nodes 1–4 connected by a dotted/S path, each node: number in peach circle, lesson title ("Getting Started", "How AI Works", "Real World Applications"), small dot/star progress markers, and a count badge on the right ("2" etc.) — alternating left/right offsets → bottom tab bar (Levels active).
- **Components:** Level header card, goal card, vertical stepper/path nodes.
- **CTA:** None (nodes are the targets).
- **States:** Mixed completed/current/locked-by-number states implied by fills; fine detail of lock icons illegible at board resolution — inferred type only for node states.
- **Engine mapping:** **MISSING** — vertical learning-path / level-map stepper has no engine equivalent (tracker is closest but is not a path).

### 14. Courses
- **Purpose:** Course catalogue list.
- **Anatomy:** Back chevron → heading "Courses" → sub "Explore and master AI skills 🧡" → vertical stack of 5 tall peach-tint rows, each: icon in white/orange rounded tile left (target, chat, image, code `</>`, gear), course name ("AI Basics", "Prompt Engineering", "AI Images", "AI Coding", "AI Automation"), circular chevron button right (white circle, orange arrow) → bottom tab bar (Courses active).
- **Components:** Category/course rows with trailing circular chevron.
- **CTA:** Row tap; no button CTA.
- **Engine mapping:** Resembles profile rows / list rows, but as **tinted catalogue rows with circular chevron** — closest to medallion rail alternative; treat as list-row pattern variant.

### 15. Lesson Content
- **Purpose:** Read a lesson.
- **Anatomy:** Breadcrumb/progress header: "AI Basics > Core Concepts", thin progress bar, "4 / 10" right → large heading question "What is Artificial Intelligence?" → body paragraph ("Artificial Intelligence (AI) is the simulation of human intelligence processes by machines, especially computer systems.") → centred mascot illustration lower-middle → bottom CTA.
- **CTA:** Solid orange pill "Next", bottom-anchored.
- **States:** Position 4 of 10 in lesson sequence.
- **Engine mapping:** Content/detail reading screen — **MISSING** as a paged lesson reader (detail sheet is a sheet, not a full reading page with progress).

### 16. Quiz Question
- **Purpose:** Multiple-choice question 3 of 5.
- **Anatomy:** Heading "Quiz" → sub "Question 3 of 5" → question text "Which of the following is an example of AI?" (2 lines, bold-ish) → 4 option rows A–D, each: letter in small circle + label — A "Calculator", B "Self-driving car" (**selected: full peach fill, orange letter disc**), C "Manual typewriter", D "Ordinary watch" → empty space → bottom CTA.
- **CTA:** Solid orange pill "Next".
- **States:** One option selected (B); others unselected white/hairline.
- **Engine mapping:** Radio-row pattern (same selection mechanics as radio-row checkout) applied to a quiz — engine radio rows exist, **quiz question screen is a distinct composition, MISSING as named pattern**.

### 17. Quiz Result — "Great Job! 🎉"
- **Purpose:** Quiz completion celebration.
- **Anatomy:** Mascot centred with confetti/sparkle burst around it → heading "Great Job! 🎉" → "You scored" grey → huge "4 / 5" numeric display → bottom CTA.
- **CTA:** Solid orange pill "Continue".
- **States:** Terminal result state (4/5).
- **Engine mapping:** Success/result state (see #10) — celebration-with-mascot + score variant; dedicated result pattern **MISSING**.

### 18. Progress — "Your Progress"
- **Purpose:** Weekly progress dashboard.
- **Anatomy:** Heading + period selector pill right "This Week ⌄" → large centred **donut ring** in orange, ~75% filled, centre "75%" huge + "Great Progress!" → stat list (4 rows, icon + label left, value right): Lessons Completed 12, Quizzes Completed 8, Streak Days 7, Time Spent 5h 30m → (no tab bar visible; back chevron top-left).
- **Components:** Donut/progress ring, stat rows.
- **CTA:** None; period selector is the control.
- **Engine mapping:** Tracker — ring chart + stat rows; engine tracker exists but **donut-ring hero is a specific visual, flag as tracker variant**.

### 19. Achievements
- **Purpose:** Badge list.
- **Anatomy:** Back chevron → heading "Achievements" → 5 rows, each: star icon in peach left, title ("First Steps", "Quick Learner", "Consistent", "AI Explorer", "Perfectionist"), grey criteria line ("Complete your first lesson", "Complete 5 lessons", "Maintain a 3-day streak", "Complete 10 lessons", "Score 100% in a quiz"), trailing medal/badge icon right — first two/three in gold (earned), later ones grey (unearned, at board resolution the 3rd reads gold-orange and 4th–5th grey).
- **CTA:** None.
- **States:** Earned vs unearned shown by badge colour (gold vs grey) on the same list.
- **Engine mapping:** Profile rows / list rows with status badge — badge-earned state is a variant; no dedicated achievements pattern, **partially MISSING**.

### 20. Leaderboard
- **Purpose:** Weekly ranking.
- **Anatomy:** Heading "Leaderboard" + overflow/filter icon top-right → sub-selector "This Week ⌄" → **podium row**: 3 centred avatars on implied podium — #1 centre, raised, larger avatar in orange ring, name "Hussain", score 980, orange disc "1" below avatar; #2 left "Ali Khan" 1250 [sic — #2 shows a higher number than #1 at board resolution; recorded as shown, likely kit inconsistency], #3 right "Sara" 870 → ranked list rows 4–6: rank number, name, score right ("4 Ahmed 760", "5 Zainab 650", "6 Usman 540") → no tab bar.
- **Components:** Podium (top-3), ranked rows.
- **CTA:** None.
- **States:** Current user is podium #1 (highlighted, orange).
- **Engine mapping:** **MISSING** — podium leaderboard has no engine equivalent.

### 21. Streak
- **Purpose:** Streak detail / motivation.
- **Anatomy:** Full orange gradient card occupying upper ~55%: large white flame silhouette containing "7" huge + "Days", caption "Current Streak", sparkle marks → white lower sheet overlapping: weekday strip S M T W T F S with day circles — filled orange check/filled for completed days, X-marked/empty for missed/future (exact glyphs small; pattern of mixed filled vs marked circles is clear) → centred heading "Keep it up! 🔥" → body "Complete a lesson daily to increase your streak." → no CTA button.
- **Components:** Gradient hero, week calendar strip, motivational copy block.
- **CTA:** None.
- **Engine mapping:** Tracker variant (streak calendar strip) — **week-strip with per-day states is a distinct component, MISSING as named component**.

### 22. Coins / Rewards — "Fibo Coins"
- **Purpose:** Currency balance + earning tasks.
- **Anatomy:** Heading "Fibo Coins" → centred large 3D gold coin with mascot face → "120" huge → "Total Coins" grey → section "Rewards" → 3 task rows: icon, "50 Coins / Complete 5 lessons" + status right "Completed" (green text); "100 Coins / Score 100% in quiz" + progress "80/100"; "30 Coins / Maintain 3-day streak" + "Completed".
- **CTA:** None (rows are status, not buttons).
- **States:** Completed vs in-progress (80/100) tasks mixed.
- **Engine mapping:** Wallet-adjacent (balance hero) + tracker tasks. Engine has wallet, but **coin-balance hero + earn-task list is a wallet variant, not a payment wallet**.

### 23. Shop / Rewards — "Rewards Store"
- **Purpose:** Spend coins.
- **Anatomy:** Heading "Rewards Store" → balance line "Your Coins: 🪙 120" → 4 product rows: coloured icon tile (blue triangle "Streak Freeze / Protect your streak", blue "Hint Pack / Get 3 hints", orange "Premium Lesson / Unlock premium lesson", blue "Custom Theme / Unlock new theme"), price right with coin icon (50, 30, 100, 80).
- **CTA:** Row tap to redeem; no explicit button.
- **States:** All items listed with prices; affordability state not visually distinguished at this resolution.
- **Engine mapping:** Product card list / shop rows — resembles product rows but priced in virtual currency; wallet/shop hybrid.

### 24. Notifications
- **Purpose:** Notification inbox.
- **Anatomy:** Back chevron → heading "Notifications" → 5 rows: icon in peach circle (star, book, flame, book/spark, tag), title ("New Achievement", "Lesson Reminder", "Streak Alert", "New Course", "Special Offer"), one-line grey body ("You earned 'Quick Learner'…", "Don't forget to complete your daily lesson", "Keep your streak going!", "AI Automation is now available", "Unlock premium features"), relative time right (small, e.g. "…ago" — exact times illegible at board resolution — inferred type only).
- **CTA:** None.
- **Engine mapping:** Profile/list rows (notification row variant with timestamp).

### 25. Search
- **Purpose:** Course search with suggestions.
- **Anatomy:** Back chevron → pill search field with magnifier, placeholder "Search courses…" → section "Popular Searches" → **chip cloud**: peach pill chips in wrapped rows ("Machine Learning", "AI Basics", "Prompt Engineering", "AI Tools", "Deep Learning", "ChatGPT") → section "Recent Searches" + right link "Clear All" (orange) → 3 recent rows: clock/history icon, query ("What is AI?", "Neural Networks", "Python for AI"), chevron right.
- **Components:** Search input, suggestion chips (static cloud, not a filter rail), recent-search rows.
- **CTA:** None.
- **Engine mapping:** Search + chip cloud — chips here are suggestions, distinct from filter chips; resembles filter-sheet chips but used inline. **Search-suggestion screen partially MISSING.**

### 26. Filter
- **Purpose:** Filter courses (full screen, not a sheet).
- **Anatomy:** Back chevron → heading "Filter" → group "Category": chip row — "All" (filled orange, white text), "AI Basics", "Coding", "Tools" (tint/white) → group "Level": chips "All", "Beginner", "Intermediate", "Advanced" → group "Price Range": horizontal orange range slider (track with filled segment, thumb), end labels "Free" / "Premium" approx. (small) → group "Rating": 5 stars (4 filled orange, 1 outline) + "4 & up" right → bottom CTA.
- **CTA:** Solid orange pill "Apply", bottom-anchored.
- **Components:** Chip groups (single-select per group), range slider, star rating selector.
- **Engine mapping:** Filter sheet — but here it is a **full screen, not a bottom sheet**, and it adds **range slider + star-rating selector, both MISSING components** in engine filter pattern.

### 27. Profile
- **Purpose:** User profile hub.
- **Anatomy:** Back chevron → centred avatar (photo, blue background) with no edit badge visible → name "Hussain" bold → sub "AI Learner" → **3-stat row**: Lessons 24 | Streak 7 | Coins 120 (numbers bold, labels grey, divided by space) → menu rows (icon + label + chevron): Edit Profile, Learning History, Achievements, Saved Courses, Settings → no tab bar in this rendering (back-arrow variant).
- **CTA:** None (rows navigate).
- **Engine mapping:** Profile rows + profile header with stat trio.

### 28. Settings
- **Purpose:** App settings.
- **Anatomy:** Heading "Settings" → group label "Account" → rows: Edit Profile (chevron), Change Password (chevron), Email Notifications (**toggle ON, orange**) → group "Preferences" → rows: Sound (**toggle ON**), Dark Mode (toggle OFF, grey), Language (value "English ⌄" right) → group "About" → Help & Support (chevron).
- **Components:** Grouped profile rows, toggle switches (on/off states both shown), value-selector row.
- **CTA:** None.
- **Engine mapping:** Profile rows + toggles — toggle switch component in settings context.

### 29. Premium — "Go Premium"
- **Purpose:** Paywall / upsell.
- **Anatomy:** Full orange gradient screen → heading "Go Premium" with crown marks → mascot wearing crown centred → benefit list (5 rows, white check + white text): Unlimited Lessons, Premium Quizzes, Advanced Progress, Custom Themes, Ad-Free Experience → white price pill/card centred "₹299 / Month" (orange text) → CTA → (no close X legible; back number "38" is kit pagination).
- **CTA:** Solid darker-orange pill "Start Free Trial", bottom area — trial CTA, price shown separately above it.
- **States:** Single plan only (monthly); no plan selector.
- **Engine mapping:** **MISSING** — paywall/premium upsell screen has no engine equivalent (promo card is in-app, not a full paywall).

### 30. Help & Support
- **Purpose:** Support hub.
- **Anatomy:** Back chevron → heading "Help & Support" → sub "How can we help you?" → 5 rows (circled icon + label + chevron): FAQs, Contact Us, Report a Problem, Feedback, About Fibo → bottom area: small speech-bubble line "We're here to help! 😊" + mascot peeking from bottom-right corner (overlapping the card edge).
- **CTA:** None.
- **Engine mapping:** Profile rows (support variant).

---

## Pattern census — Fibo

| Pattern | Count |
|---|---|
| Solid orange pill primary CTA (bottom or form-anchored) | 15 (screens 2,3,4,5,6,7,8,9,10,15,16,17,26 + inverted white pill on 11 counts separately; 29 uses trial CTA) |
| Onboarding (mascot + heading + dots) | 3 (+1 splash = 4) |
| Auth form (labelled inputs + primary CTA) | 5 (5,6,8,9 + 7 OTP variant) |
| Mascot illustration as hero/celebration | 12 (1,2,3,4,10-var.,11,12-header,13,15,17,22-coin,29,30 — approx. 12 distinct) |
| List/profile rows (icon + title + sub + chevron/badge) | 7 screens (14,19,23,24,27,28,30) |
| Bottom tab bar (5-item) | 3 clearly visible (11,13,14); implied on other in-app screens cropped by kit layout |
| Progress visualisation (bar / ring / path) | 5 (11 bar ×2, 13 path, 18 ring, 21 week strip) |
| Chip groups (filter or suggestion) | 2 (25,26) |
| Toggle switches | 1 screen, 3 toggles (28) |
| Radio-style single-select rows | 1 (16 quiz; mechanics shared with checkout radio rows) |
| Chat bubbles + composer | 1 (12) |
| Success/result celebration | 2 (10,17) |
| Stat tiles / stat trio | 3 (11,18,27) |

**MISSING in engine (from this board):** OTP digit row; chat thread; vertical learning-path/level map; podium leaderboard; paywall; lesson reader page; quiz-question composition; success-check celebration; range slider; star-rating selector; streak week-strip.
