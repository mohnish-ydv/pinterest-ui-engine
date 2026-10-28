# Evira board — screen inventory, slices 01–04

Scope notes: each slice is a horizontal band of one tall board, 5 phone columns per row. Slices overlap vertically: the partial row at the bottom of one slice is the same board row shown more fully in the next slice; those instances are inventoried in both places and cross-referenced. Phone frames throughout: white/light-grey ground, rounded-rect device outline (~28–32px corner radius) with a very soft drop shadow on the board's grey background; almost every screen carries a minimal status bar (time "9:41" left, signal/wifi/battery glyphs right, tiny black text). Unless stated otherwise: no visible borders, no visible shadows inside a screen, one sans-serif typeface, black as the only ink, grey for secondary text, colour only inside photographs, illustrations and brand/social icons.

---

## S1-1-1
- Screen name/type: Splash screen (light) — brand mark + loading state
- Purpose: App launch / loading.
- Layout, top to bottom: status bar (~4% height); large empty white space (~35%); a single large black spiral/swirl logo mark centred horizontally (~15% of screen width); long empty gap (~30%); a small circular loading spinner made of black dots of decreasing size near the bottom (~78% height); empty space to the bottom edge.
- Components & styling: no cards, no buttons; logo is a solid-black filled spiral glyph; spinner is a ring of ~8 round dots. No borders, no shadows.
- Typography: none except status-bar numerals.
- Colour: black marks on white; nothing else.
- Controls & interaction cues: none — passive loading indicator only.
- Pattern(s): SPLASH-LOGO-SPINNER, LOADING-SPINNER-DOTS

## S1-2-1
- Screen name/type: Onboarding 1 — photo hero card with overlay welcome text
- Purpose: First-run welcome / brand introduction.
- Layout, top to bottom: status bar; a large photographic portrait (man in tan blazer) filling the full width and ~92% of the height as an inset rounded-rect card (~20px radius) with small side margins; over the photo's lower third, a dark gradient scrim (transparent at top → near-black at bottom) carrying, left-aligned: a small line "Welcome to" followed by a yellow waving-hand emoji; a very large bold word "Evira"; then a two-line small white caption (tagline, partially legible: "The best e-commerce app of the century for your daily needs!").
- Components & styling: photo card with rounded corners; text sits directly on the scrim — no text box, no button on this screen; no borders; the only "shadow" is the photo's own gradient scrim.
- Typography: "Evira" is by far the largest text on the board so far (display size, extra-bold, sentence case); "Welcome to" is small-medium medium weight; caption is small, regular, white at reduced opacity.
- Colour: colour exists only in the photograph (tan, skin tones) plus the small yellow emoji; all UI ink is white on the dark scrim.
- Controls & interaction cues: none visible (no button, no dots) — implies tap/swipe to advance.
- Pattern(s): PHOTO-HERO-ONBOARDING, SCRIM-OVERLAY-TEXT

## S1-3-1
- Screen name/type: Onboarding 2 — value prop, photo top / text sheet bottom
- Purpose: Communicate product quality promise.
- Layout, top to bottom: status bar; photographic portrait (woman in blue shirt, hand to forehead) occupying the top ~55%, full-bleed width inside the frame, its bottom edge straight where it meets a white sheet; white sheet (~45%) containing: a centred bold headline in 3 lines ("We provide high quality products just for you"); a short horizontal dash indicator (one short dark dash, ~8% width, centred) about two-thirds down; a full-width black pill button labelled "Next" near the bottom (~6% height).
- Components & styling: photo block with no radius at the sheet junction; button is a solid-black pill (fully rounded ends), white label; dash indicator is a plain rounded line segment. No borders, no shadows.
- Typography: headline is large, bold, centred, sentence case; button label small, medium, white, centred.
- Colour: colour only in the photo (blue shirt); UI is black/white/grey.
- Controls & interaction cues: one primary black pill button; dash page indicator.
- Pattern(s): PHOTO-HERO-ONBOARDING, ONBOARDING-TEXT-SHEET, BLACK-PILL-CTA, PAGE-DOTS-DASH

## S1-4-1
- Screen name/type: Onboarding 3 — value prop, photo top / text sheet bottom
- Purpose: Communicate customer-priority promise.
- Layout, top to bottom: identical structure to S1-3-1 — status bar; portrait photo (woman in light-blue blazer touching her hair) top ~55%; white sheet with centred 3-line bold headline ("Your satisfaction is our number one priority"); centred dash indicator; full-width black pill button "Next" at the bottom.
- Components & styling: same as S1-3-1 — straight photo/sheet junction, solid black pill, plain dash.
- Typography: same scale relationship — bold centred headline roughly 3× body size; no body text on this screen.
- Colour: colour only in the photograph (pale blue blazer, red lipstick).
- Controls & interaction cues: "Next" black pill; dash indicator.
- Pattern(s): PHOTO-HERO-ONBOARDING, ONBOARDING-TEXT-SHEET, BLACK-PILL-CTA, PAGE-DOTS-DASH

## S1-5-1
- Screen name/type: Onboarding 4 (final) — value prop, photo top / text sheet bottom
- Purpose: Closing promise + conversion to sign-up.
- Layout, top to bottom: same skeleton as S1-3-1/S1-4-1 — portrait photo (smiling woman in red top) top ~55%; white sheet with centred 3-line bold headline ("Let's fulfill your daily needs with Evira right now!"); centred dash indicator; full-width black pill button at bottom, labelled "Get Started" instead of "Next".
- Components & styling: same as S1-3-1; only the button label changes on the final step.
- Typography: identical hierarchy to S1-3-1.
- Colour: colour only in the photo (deep red top — the most saturated UI-adjacent colour in the row, still inside the photograph).
- Controls & interaction cues: "Get Started" black pill (terminal CTA); dash indicator.
- Pattern(s): PHOTO-HERO-ONBOARDING, ONBOARDING-TEXT-SHEET, BLACK-PILL-CTA, PAGE-DOTS-DASH

## S1-1-2 (partial — top of screen only, continues in S2-1-1)
- Screen name/type: Splash screen (dark) — top fragment
- Purpose: Dark-mode launch screen variant.
- Layout: only the top ~35% is visible in this slice: status bar with white glyphs on a solid black screen ground; a tiny white dot (start of the dotted spinner) visible near the cut edge. The full screen is S2-1-1.
- Components & styling: solid black fill, no borders.
- Typography: status-bar only, white.
- Colour: black ground, white marks — full inversion of S1-1-1.
- Controls & interaction cues: none visible.
- Pattern(s): SPLASH-LOGO-SPINNER (dark variant, partial)

## S1-2-2 (partial — top of screen only, continues in S2-2-1)
- Screen name/type: Onboarding 1 (full-bleed variant) — top fragment
- Purpose: Same welcome screen as S1-2-1 in a second art direction.
- Layout: top ~30% visible: status bar; the upper part of a photographic portrait (woman with blonde hair, hand near face) filling the frame edge-to-edge. Full screen is S2-2-1.
- Components & styling: photo is full-bleed (no inset card margins, unlike S1-2-1).
- Typography: none visible in the fragment.
- Colour: photograph only.
- Controls & interaction cues: none visible.
- Pattern(s): PHOTO-HERO-ONBOARDING (partial)

## S1-3-2 (partial — top of screen only, continues in S2-3-1)
- Screen name/type: Onboarding (illustration variant) — top fragment
- Purpose: Value-prop screen in flat-illustration art direction.
- Layout: top ~30% visible: status bar; the top of a flat vector illustration (raised arm, black hair shape of a figure) on white.
- Components & styling: flat illustration, no photo, no borders.
- Typography: none visible in the fragment.
- Colour: illustration uses black shapes with skin-tone pink accents.
- Controls & interaction cues: none visible.
- Pattern(s): ILLUSTRATION-HERO-ONBOARDING (partial)

## S1-4-2 (partial — top of screen only, continues in S2-4-1)
- Screen name/type: Onboarding (illustration variant) — top fragment
- Purpose: Value-prop screen, illustration art direction.
- Layout: top ~30% visible: status bar; top of a flat illustration (back of a figure's head/shoulders, black hair, black top).
- Components & styling: flat illustration on white.
- Typography: none visible.
- Colour: black illustration shapes, muted grey/pink accents.
- Controls & interaction cues: none visible.
- Pattern(s): ILLUSTRATION-HERO-ONBOARDING (partial)

## S1-5-2 (partial — top of screen only, continues in S2-5-1)
- Screen name/type: Onboarding (illustration variant) — top fragment
- Purpose: Final value-prop screen, illustration art direction.
- Layout: top ~30% visible: status bar; top of a flat illustration (raised arms, confetti-like dots, edge of a document shape).
- Components & styling: flat illustration on white.
- Typography: none visible.
- Colour: black/grey illustration with small muted colour specks.
- Controls & interaction cues: none visible.
- Pattern(s): ILLUSTRATION-HERO-ONBOARDING (partial)

---

## S2-1-1
- Screen name/type: Splash screen (dark) — brand mark + loading state
- Purpose: App launch / loading, dark variant of S1-1-1.
- Layout, top to bottom: status bar (white glyphs); large black space; centred white spiral logo mark (~15% width) at ~35% height, surrounded by scattered white dots of varying sizes (starfield/sparkle effect) spread over the middle two-thirds; a small white dotted loading spinner near ~78% height; black to the bottom edge.
- Components & styling: solid-black ground; logo and dots are flat white fills; no borders, no cards, no shadows.
- Typography: status-bar only.
- Colour: pure black/white inversion; no other colour.
- Controls & interaction cues: none — passive spinner.
- Pattern(s): SPLASH-LOGO-SPINNER, LOADING-SPINNER-DOTS

## S2-2-1
- Screen name/type: Onboarding 1 — full-bleed photo with white fade scrim
- Purpose: Welcome / brand introduction, second art direction of S1-2-1.
- Layout, top to bottom: status bar over photo; photographic portrait (woman in white top adjusting sunglasses) fills the whole screen edge-to-edge; the bottom ~45% is covered by a white gradient scrim (photo → transparent → solid white); left-aligned on the scrim: small dark line "Welcome to" + yellow waving-hand emoji; very large extra-bold dark "Evira"; two-line small grey caption (tagline, partially legible: "The best e-commerce app of the century for your daily needs!"). No button visible.
- Components & styling: no card margins (contrast S1-2-1's inset card); text sits directly on the gradient — no box; gradient is white-based here vs black-based in S1-2-1.
- Typography: "Evira" display-size extra-bold; small intro line; small grey caption.
- Colour: colour only in the photo + yellow emoji; ink is black/grey on white.
- Controls & interaction cues: none visible.
- Pattern(s): PHOTO-HERO-ONBOARDING, SCRIM-OVERLAY-TEXT

## S2-3-1
- Screen name/type: Onboarding 2 — flat illustration hero
- Purpose: Quality promise, illustration art direction of S1-3-1.
- Layout, top to bottom: status bar; flat vector illustration occupying the top ~45% (woman in black top and grey trousers holding black shopping bags, arms raised; faint grey circles behind); white space; centred bold 3-line headline ("We provide high quality products just for you"); centred short dash indicator; full-width black pill button "Next" near the bottom.
- Components & styling: illustration is flat shapes with no outline/shadow; button solid black pill; dash a plain segment. No borders.
- Typography: bold centred headline, sentence case; no body copy.
- Colour: illustration palette is black + grey + skin-tone pink; UI black/white.
- Controls & interaction cues: "Next" pill; dash indicator.
- Pattern(s): ILLUSTRATION-HERO-ONBOARDING, ONBOARDING-TEXT-SHEET, BLACK-PILL-CTA, PAGE-DOTS-DASH

## S2-4-1
- Screen name/type: Onboarding 3 — flat illustration hero
- Purpose: Satisfaction promise, illustration art direction of S1-4-1.
- Layout, top to bottom: status bar; flat illustration top ~45% (figure in black long-sleeve top holding an oversized document/receipt with lines and a circled check mark); centred bold 3-line headline ("Your satisfaction is our number one priority"); dash indicator; black pill "Next".
- Components & styling: flat illustration, document drawn with simple line rows and a check badge; solid black pill; no borders/shadows.
- Typography: same headline treatment as S2-3-1.
- Colour: black/grey illustration, white ground.
- Controls & interaction cues: "Next" pill; dash indicator.
- Pattern(s): ILLUSTRATION-HERO-ONBOARDING, ONBOARDING-TEXT-SHEET, BLACK-PILL-CTA, PAGE-DOTS-DASH

## S2-5-1
- Screen name/type: Onboarding 4 (final) — flat illustration hero
- Purpose: Closing promise + sign-up conversion, illustration art direction of S1-5-1.
- Layout, top to bottom: status bar; flat illustration top ~45% (woman in black top/grey trousers, arms raised holding a document, confetti dots around); centred bold 3-line headline ("Let's fulfill your daily needs with Evira right now!"); dash indicator; black pill button labelled "Get Started".
- Components & styling: as S2-3-1; terminal button label differs.
- Typography: as S2-3-1.
- Colour: black/grey/pink illustration on white.
- Controls & interaction cues: "Get Started" pill; dash indicator.
- Pattern(s): ILLUSTRATION-HERO-ONBOARDING, ONBOARDING-TEXT-SHEET, BLACK-PILL-CTA, PAGE-DOTS-DASH

## S2-1-2
- Screen name/type: Auth gateway — "Let's you in" social sign-in chooser (bottom cut off in this slice; lower portion continues in S3-1-1)
- Purpose: Choose a sign-in method.
- Layout, top to bottom: status bar; small left-aligned back arrow (~8% height); centred flat illustration (~30% height: seated figure at a desk with oversized black blob/cloud shapes, tiny red accent in the artwork); large bold headline "Let's you in" (the board's wording) centred-left under the illustration; a vertical stack of social sign-in rows, centred text with brand icon at left of each label: "Continue with Facebook" (blue f icon), "Continue with Google" (multicolour G), and the top of a third row (Apple) cut off by the slice edge — the rows show no visible box/border at this resolution, reading as plain icon+text rows; (continued in S3-1-1: an "or" divider, a black pill "Sign in with password", and a sign-up text link).
- Components & styling: illustration flat black/grey with one small red accent; rows are borderless at this resolution; headline is the largest element after the illustration.
- Typography: headline large extra-bold, sentence case, left-of-centre alignment; row labels medium, regular weight.
- Colour: black ink; colour only in the social brand icons (Facebook blue, Google multicolour) and the illustration's tiny red accent.
- Controls & interaction cues: back arrow; tappable social rows; (below the fold) primary pill + text link.
- Pattern(s): BACK-ARROW-HEADER, SOCIAL-SIGNIN-ROWS, BIG-LEFT-HEADLINE, ILLUSTRATION-HERO-ONBOARDING (small)

## S2-2-2
- Screen name/type: Create account — empty form state (bottom edge cut at the button)
- Purpose: Email/password registration.
- Layout, top to bottom: status bar; back arrow left; large bold two-line headline "Create your Account" (~18% height); generous white space; two stacked text fields (~9% height each) with very light grey fill and rounded corners (~12px radius): first with a small envelope icon and faint placeholder text (email), second with a small lock/key icon, faint placeholder text (password) and a small eye icon at the right end; below right, a small empty square checkbox with a tiny grey label ("Remember me"); a wide black/dark pill button "Sign up" at the bottom (partially cut by the slice edge).
- Components & styling: fields are filled (very light grey), borderless; checkbox is a small rounded square outline, unchecked; button solid dark pill.
- Typography: headline large extra-bold sentence case; placeholders small light grey; checkbox label tiny grey; button label white medium.
- Colour: black/grey/white only.
- Controls & interaction cues: two text inputs, password visibility eye toggle, checkbox, primary pill button.
- Pattern(s): BACK-ARROW-HEADER, BIG-LEFT-HEADLINE, FILLED-TEXT-FIELD, REMEMBER-ME-CHECKBOX, BLACK-PILL-CTA

## S2-3-2
- Screen name/type: Create account — filled form, password field in focused state
- Purpose: Registration with data entered.
- Layout, top to bottom: same skeleton as S2-2-2 — back arrow; "Create your Account" headline; email field now showing entered dark text (an email address, small); password field showing a row of dots, distinguished by a visible thin dark outline (focused/active state) with an eye icon at right; small unchecked square checkbox + "Remember me" label beneath; black pill "Sign up" at bottom (cut edge).
- Components & styling: email field keeps light fill; password field switches to white with a dark outline border — the board's focused-field treatment; checkbox remains an empty rounded square.
- Typography: entered text small dark; dots uniform.
- Colour: black/grey/white only.
- Controls & interaction cues: text inputs, eye toggle, checkbox, pill button.
- Pattern(s): BACK-ARROW-HEADER, BIG-LEFT-HEADLINE, FILLED-TEXT-FIELD, FOCUSED-OUTLINE-FIELD, REMEMBER-ME-CHECKBOX, BLACK-PILL-CTA

## S2-4-2
- Screen name/type: Create account — filled form, remember-me checked
- Purpose: Registration, alternate filled state.
- Layout, top to bottom: back arrow; "Create your Account" headline; email field with entered address; password field with dots and eye icon (light fill here, no strong outline); checkbox now filled solid black with a white tick, label "Remember me"; black pill "Sign up" at bottom (cut edge).
- Components & styling: checked checkbox = solid black rounded square with white check glyph — the only filled control besides the button; fields light-filled rounded rects.
- Typography: as S2-3-2.
- Colour: black/grey/white only.
- Controls & interaction cues: inputs, eye toggle, checked checkbox, pill.
- Pattern(s): BACK-ARROW-HEADER, BIG-LEFT-HEADLINE, FILLED-TEXT-FIELD, REMEMBER-ME-CHECKBOX, BLACK-PILL-CTA

## S2-5-2
- Screen name/type: Login — empty form state (bottom cut at "Forgot the password?")
- Purpose: Email/password sign-in.
- Layout, top to bottom: status bar; back arrow; large bold two-line headline "Login to your Account"; two light-filled rounded fields (email with small icon + faint placeholder; password with icon, faint placeholder + eye icon); small empty checkbox + "Remember me" at right; wide black pill button "Sign in"; below the button the start of a small centred text line "Forgot the password?" cut off by the slice edge (full version in S3-2-2).
- Components & styling: identical form language to the create-account screens.
- Typography: headline extra-bold; placeholders light grey.
- Colour: black/grey/white only.
- Controls & interaction cues: inputs, eye toggle, checkbox, primary pill, text link (partial).
- Pattern(s): BACK-ARROW-HEADER, BIG-LEFT-HEADLINE, FILLED-TEXT-FIELD, REMEMBER-ME-CHECKBOX, BLACK-PILL-CTA

---

## S3-1-1 (partial — bottom fragment of the screen begun in S2-1-2)
- Screen name/type: Auth gateway "Let's you in" — lower fragment
- Purpose: Lower half of the sign-in method chooser.
- Layout, top to bottom (fragment only): the tail of the third social row (black Apple icon + "Continue with Apple" text); a small centred grey word "or"; a full-width solid black pill button "Sign in with password"; a bottom line of small grey text with a bold black link ("Don't have an account? Sign up" — wording approximate at this resolution).
- Components & styling: black pill identical to other primary CTAs; "or" is plain text, no rule lines either side; footer link is text-only.
- Typography: button label white medium; footer small, grey with bold black final word(s).
- Colour: black/white/grey; Apple icon black.
- Controls & interaction cues: primary pill; text link; social row (partial).
- Pattern(s): SOCIAL-SIGNIN-ROWS, OR-DIVIDER-TEXT, BLACK-PILL-CTA, TEXT-LINK-FOOTER

## S3-2-1 (partial — bottom fragment of a Create Account screen)
- Screen name/type: Create account — lower fragment (social alternatives + footer)
- Purpose: Bottom of a registration screen showing alternative sign-up methods.
- Layout, top to bottom (fragment only): a small centred grey line "or continue with"; a centred row of three small social brand icons (Facebook blue f, Google multicolour G, Apple black apple) spaced evenly, no visible boxes around them; below, a small grey line with a bold black link at its right ("Already have an account? Sign in" — wording approximate).
- Components & styling: bare icons, no circular chips/borders visible at this resolution; generous white space.
- Typography: small grey captions; bold black link word.
- Colour: colour only in the Facebook/Google icons.
- Controls & interaction cues: three tappable brand icons; text link.
- Pattern(s): SOCIAL-ICON-ROW, OR-DIVIDER-TEXT, TEXT-LINK-FOOTER

## S3-3-1 (partial — keyboard fragment)
- Screen name/type: Form screen with system keyboard open — fragment
- Purpose: Shows a form screen in typing state (upper content cut off by the slice).
- Layout: the fragment is almost entirely a light-grey QWERTY system keyboard (three letter rows, shift key, grey "123" key, wide space bar, emoji icon bottom-left, microphone icon bottom-right); above it only a sliver of white screen with a faint fragment of text/an icon at the very top edge.
- Components & styling: keyboard keys are white rounded rects on a light grey tray; the "123" and shift keys are darker grey — standard system keyboard, not app-styled.
- Typography: keyboard letters small, dark grey, uppercase.
- Colour: greys only.
- Controls & interaction cues: full keyboard; implies an active text field above the fold.
- Pattern(s): SYSTEM-KEYBOARD-OPEN

## S3-4-1 (partial — bottom fragment of an auth screen)
- Screen name/type: Auth screen (create/login family) — lower fragment
- Purpose: Alternative sign-in methods + footer link.
- Layout, top to bottom (fragment only): small centred grey "or continue with"; centred row of three bare social icons (Facebook, Google, Apple); small grey footer line ending in a bold black link ("…Sign in" — wording approximate).
- Components & styling: same as S3-2-1.
- Typography: small grey captions, bold black link.
- Colour: colour only in brand icons.
- Controls & interaction cues: three brand icons; text link.
- Pattern(s): SOCIAL-ICON-ROW, OR-DIVIDER-TEXT, TEXT-LINK-FOOTER

## S3-5-1 (partial — bottom fragment of an auth screen)
- Screen name/type: Auth screen (create/login family) — lower fragment
- Purpose: Alternative sign-in methods + footer link.
- Layout, top to bottom (fragment only): small centred grey "or continue with"; centred row of three bare social icons (Facebook, Google, Apple); small grey footer line ending in a bold black link ("…Sign up" — wording approximate).
- Components & styling: same as S3-2-1/S3-4-1.
- Typography: small grey captions, bold black link.
- Colour: colour only in brand icons.
- Controls & interaction cues: three brand icons; text link.
- Pattern(s): SOCIAL-ICON-ROW, OR-DIVIDER-TEXT, TEXT-LINK-FOOTER

## S3-1-2
- Screen name/type: Login — filled form with system keyboard open
- Purpose: Sign-in while typing the password.
- Layout, top to bottom: status bar; back arrow; large bold two-line headline "Login to your Account"; email field (light fill) showing an entered email address in small dark text with a small icon at left; password field directly below shown as a white field with a thin dark outline (focused state), a row of dots, and an eye icon at right; a small row with an empty square checkbox + "Remember me" label; a full-width black pill button "Sign in"; a small centred grey line "Forgot the password?"; the bottom ~38% of the screen is the light-grey QWERTY system keyboard (with "123" key, space bar, emoji and mic icons).
- Components & styling: focused field = outline treatment (as S2-3-2); other field light-filled; button solid black pill; keyboard is system-styled, overlapping the screen's lower area.
- Typography: headline extra-bold; entered text small; footer link small grey.
- Colour: black/grey/white only.
- Controls & interaction cues: inputs, eye toggle, checkbox, pill button, text link, open keyboard.
- Pattern(s): BACK-ARROW-HEADER, BIG-LEFT-HEADLINE, FILLED-TEXT-FIELD, FOCUSED-OUTLINE-FIELD, REMEMBER-ME-CHECKBOX, BLACK-PILL-CTA, SYSTEM-KEYBOARD-OPEN

## S3-2-2
- Screen name/type: Login — filled form, remember-me checked, social alternatives
- Purpose: Sign-in, completed-state variant.
- Layout, top to bottom: status bar; back arrow; "Login to your Account" two-line headline; email field (entered address); password field (dots + eye icon, light fill); checkbox filled black with white tick + "Remember me"; black pill "Sign in"; small centred dark text link "Forgot the password?"; small centred grey "or continue with"; centred row of three bare social icons (Facebook, Google, Apple); bottom small grey line with bold black link ("Don't have an account? Sign up").
- Components & styling: checked checkbox solid black; social icons bare (no chips); no borders anywhere except none at all — fields are fill-only.
- Typography: headline extra-bold; all secondary lines small; link words bold black against grey text.
- Colour: colour only in Facebook/Google icons.
- Controls & interaction cues: inputs, eye toggle, checked checkbox, pill, two text links, three social icons.
- Pattern(s): BACK-ARROW-HEADER, BIG-LEFT-HEADLINE, FILLED-TEXT-FIELD, REMEMBER-ME-CHECKBOX, BLACK-PILL-CTA, SOCIAL-ICON-ROW, OR-DIVIDER-TEXT, TEXT-LINK-FOOTER

## S3-3-2
- Screen name/type: Fill Your Profile — empty state with avatar placeholder
- Purpose: Profile completion after registration.
- Layout, top to bottom: status bar; header row: back arrow + small bold title "Fill Your Profile" (left-aligned, much smaller than the auth headlines); centred large circular avatar placeholder (light grey circle with a faint silhouette) with a small black square badge bearing a white pencil icon overlapping its bottom-right edge; a stack of five full-width light-filled rounded fields with faint placeholder labels (name-type fields, a date-type field with a small calendar-ish icon at right, an email-type field with a small icon at right); a phone-number field with a small flag glyph + country code at its left; a final field with a small chevron/dropdown mark at right (gender-type selector, approximate); a full-width black pill button "Continue" pinned near the bottom.
- Components & styling: avatar is a perfect circle, flat light-grey fill, no ring border; edit badge is a small black rounded square; fields are the same light-fill rounded rects as auth (~12px radius), no borders; button solid black pill.
- Typography: header title small-bold (form-header scale, not display); placeholders small light grey.
- Colour: black/grey/white; the flag glyph introduces a tiny muted colour patch (red/blue at this size).
- Controls & interaction cues: avatar edit badge, five–six text fields, one dropdown-style field, primary pill.
- Pattern(s): BACK-ARROW-HEADER, FORM-HEADER-TITLE, AVATAR-UPLOAD-CIRCLE, FILLED-TEXT-FIELD, PHONE-FIELD-FLAG, BLACK-PILL-CTA

## S3-4-2
- Screen name/type: Fill Your Profile — filled state with photo avatar
- Purpose: Same profile form, completed.
- Layout, top to bottom: identical skeleton to S3-3-2 — back arrow + "Fill Your Profile" title; the avatar circle now contains a real portrait photograph (man's face) with the same black pencil badge at bottom-right; fields now show entered dark text: full name, first name, a numeric ID/date-type value with a small icon at right, an email address with a small icon at right, a phone field with flag + country code + number, and a final field with dropdown chevron at right; black pill "Continue" at the bottom.
- Components & styling: photo avatar is a clean circle crop, no ring; fields keep light fill with dark entered text.
- Typography: entered values small dark; header small-bold.
- Colour: colour only inside the avatar photograph and the tiny flag.
- Controls & interaction cues: avatar edit badge, filled fields, dropdown field, pill.
- Pattern(s): BACK-ARROW-HEADER, FORM-HEADER-TITLE, AVATAR-UPLOAD-CIRCLE, FILLED-TEXT-FIELD, PHONE-FIELD-FLAG, BLACK-PILL-CTA

## S3-5-2
- Screen name/type: Create New PIN — PIN entry with custom numeric keypad
- Purpose: Set a 4-digit security PIN.
- Layout, top to bottom: status bar; header row: back arrow + small bold title "Create New PIN"; a centred two-line small grey instruction ("Add a PIN number to make your account more secure" — approximate); a horizontal row of four PIN slots centred (~30% height): two solid black dots (entered), one square slot with a thin dark outline containing the digit "7" (active slot), and one empty light slot (partially visible); a full-width black pill button "Continue"; below it a large custom numeric keypad occupying the bottom ~35%: digits 1–9 in a 3×3 grid, then a bottom row with a small dot/asterisk key, 0, and a backspace icon — digits are plain dark numerals on white, no key backgrounds; a thin horizontal home-indicator bar at the very bottom.
- Components & styling: PIN dots are solid black circles; the active slot is an outlined rounded square (~10px radius) — the only outlined element on the screen; keypad keys have no fills, borders or shadows.
- Typography: header small-bold; instruction small grey centred; keypad numerals large-ish, regular weight.
- Colour: black/grey/white only.
- Controls & interaction cues: PIN slots, pill button, full numeric keypad with backspace.
- Pattern(s): BACK-ARROW-HEADER, FORM-HEADER-TITLE, PIN-DOTS-ENTRY, NUMERIC-KEYPAD, BLACK-PILL-CTA

---

## S4-1-1
- Screen name/type: Set Your Fingerprint — biometric enrolment
- Purpose: Optional fingerprint setup after PIN creation.
- Layout, top to bottom: status bar; header row: back arrow + small bold title "Set Your Fingerprint"; a two-line small grey instruction under the header ("Add a fingerprint to make your account more secure" — approximate); a very large black fingerprint glyph (concentric arc line-work) centred, occupying ~35% of the height; below it a two-line small grey centred caption ("Please put your finger on the fingerprint scanner to get started" — approximate); at the bottom a two-button row: a light-grey filled pill "Skip" (left, ~42% width) and a solid black pill "Continue" (right, ~42% width).
- Components & styling: fingerprint is a bold line icon, pure black, no circle container; buttons are pills — secondary is light tint with dark text, primary is solid black with white text; no borders, no shadows.
- Typography: header small-bold; captions small grey centred; button labels medium.
- Colour: black/grey/white only.
- Controls & interaction cues: Skip (quiet) + Continue (primary) dual buttons — the board's two-button row pattern.
- Pattern(s): BACK-ARROW-HEADER, FORM-HEADER-TITLE, FINGERPRINT-GLYPH, DUAL-BUTTON-ROW

## S4-2-1
- Screen name/type: Set Your Fingerprint — with "Congratulations!" success modal over dimmed screen
- Purpose: Account-setup completion feedback.
- Layout, top to bottom: the underlying screen is S4-1-1 (header "Set Your Fingerprint", grey instruction line, Skip/Continue row at the bottom) but the whole screen is covered by a dark grey translucent dim; centred on it, a white rounded-rect card (~78% width, ~52% height, ~24px radius) containing: a large solid black circle with a white person silhouette glyph, ringed by small black dots of assorted sizes (confetti/orbit dots); bold centred title "Congratulations!"; a three-line small grey centred message (account ready / redirect notice — approximate: "Your account is ready to use. You will be redirected to the Home page in a few seconds"); a dotted circular loading spinner (black dots) beneath the text.
- Components & styling: modal card is flat white with large radius, no visible shadow (dim provides separation); the black circle icon is the single loud element; dim overlay darkens the parent screen uniformly.
- Typography: modal title medium-large bold; message small grey; both centred.
- Colour: black/white/greys; the dim is neutral dark grey.
- Controls & interaction cues: none inside the modal (auto-dismiss implied by spinner + redirect text); dimmed Skip/Continue visible behind.
- Pattern(s): SUCCESS-MODAL-CARD, DIMMED-OVERLAY, LOADING-SPINNER-DOTS, DUAL-BUTTON-ROW (behind modal)

## S4-3-1
- Screen name/type: Forgot Password — choose reset channel
- Purpose: Pick where the reset code is sent.
- Layout, top to bottom: status bar; header row: back arrow + small bold title "Forgot Password"; a centred flat illustration (~28% height: person with oversized phone, message bubbles and padlock shapes); a two-line small grey instruction ("Select which contact details should we use to reset your password" — approximate); two stacked selectable option rows (each ~11% height): row 1 has a visible thin dark outline (selected state) and contains a small light circle with a chat/message icon, a tiny grey label line, and a bold dark value line (masked phone number); row 2 is borderless/light and contains a small light circle with an envelope icon, a tiny grey label, and a bold dark masked email value; a full-width black pill button "Continue" near the bottom.
- Components & styling: option rows are rounded rects (~14px radius); selected = outline border, unselected = no border/flat; icon medallions are light-grey circles; button solid black pill.
- Typography: header small-bold; instruction small grey; option labels tiny grey over small bold values.
- Colour: black/grey/white; illustration uses black shapes with grey/skin accents.
- Controls & interaction cues: two radio-style selectable rows; primary pill.
- Pattern(s): BACK-ARROW-HEADER, FORM-HEADER-TITLE, SELECTABLE-CONTACT-ROW, BLACK-PILL-CTA

## S4-4-1
- Screen name/type: Forgot Password — OTP entry with keypad
- Purpose: Enter the 4-digit reset code.
- Layout, top to bottom: status bar; header row: back arrow + small bold title "Forgot Password"; a small grey centred line "Code has been sent to +1 111 ****99" (approximate); a row of four OTP slots (~32% height): slot 1 shows digit "7" as plain dark text, slot 2 is an outlined rounded square containing "4" (active), slots 3–4 are empty light squares; beneath, a small grey centred line "Resend code in 55 s" (approximate); a full-width black pill button "Verify"; below the button a custom numeric keypad (1–9 grid; bottom row dot/asterisk, 0, backspace icon) occupying ~30%; thin home-indicator bar at the bottom.
- Components & styling: OTP slots are light-filled rounded squares (~10px radius); active slot = white with thin dark outline; keypad keys are bare numerals, no fills.
- Typography: header small-bold; OTP digits medium dark; resend line small grey with the seconds in the same grey (no accent colour).
- Colour: black/grey/white only.
- Controls & interaction cues: OTP boxes, Verify pill, numeric keypad with backspace.
- Pattern(s): BACK-ARROW-HEADER, FORM-HEADER-TITLE, OTP-BOXES, RESEND-TIMER-TEXT, NUMERIC-KEYPAD, BLACK-PILL-CTA

## S4-5-1
- Screen name/type: Forgot Password — OTP entry, code complete (no keypad)
- Purpose: OTP confirmation state after entry.
- Layout, top to bottom: status bar; header row: back arrow + small bold title "Forgot Password"; a large empty gap (~25%); a small grey centred line "Code has been sent to +1 111 ****99" (approximate); a centred row of four OTP slots, all filled with digits as plain dark text ("7 4 5 8"), the slots reading as very light/invisible boxes at this state; beneath, a small grey centred line "Resend code in 53 s" (approximate); a long white gap; a full-width black pill button "Verify" pinned near the bottom.
- Components & styling: filled OTP slots lose their box emphasis (digits on near-white); button identical black pill; no keypad on this variant.
- Typography: as S4-4-1; digits medium.
- Colour: black/grey/white only.
- Controls & interaction cues: OTP boxes (complete), Verify pill; resend is text-only (no link styling visible).
- Pattern(s): BACK-ARROW-HEADER, FORM-HEADER-TITLE, OTP-BOXES, RESEND-TIMER-TEXT, BLACK-PILL-CTA

## S4-1-2 (partial — bottom cut off)
- Screen name/type: Create New Password — intro/illustration state
- Purpose: Start of password reset completion.
- Layout (visible portion): status bar; header row: back arrow + small bold title "Create New Password"; below, a flat illustration occupying the upper-middle area: an outlined smartphone shape containing a bold black circle with a white tick, next to a figure in dark clothing raising an arm, standing on a baseline; the rest of the screen (presumably password fields and button) is cut off by the slice edge.
- Components & styling: phone in the illustration is a thin-outline rounded rect; the tick medallion is solid black; figure flat black/grey.
- Typography: header small-bold only, in the visible part.
- Colour: black/grey/white; illustration neutral.
- Controls & interaction cues: back arrow; remainder not visible.
- Pattern(s): BACK-ARROW-HEADER, FORM-HEADER-TITLE (partial)

## S4-2-2 (partial — bottom cut off, modal state)
- Screen name/type: Create New Password — with success modal over dimmed screen
- Purpose: Password-changed confirmation feedback.
- Layout (visible portion): the underlying "Create New Password" screen (header row with back arrow + title) is dimmed dark grey; a white rounded card rises from the bottom/centre of the frame (top ~55% visible): inside it, a large solid black circle containing a white shield-with-tick glyph, ringed by small black orbit dots; the card's title and message are below the visible cut.
- Components & styling: same modal language as S4-2-1 — white card, large radius, flat; dim overlay; black circle as the single loud element.
- Typography: header small-bold (dimmed); modal text not visible.
- Colour: black/white/greys.
- Controls & interaction cues: none visible; modal state.
- Pattern(s): SUCCESS-MODAL-CARD, DIMMED-OVERLAY (partial)

## S4-3-2 (partial — bottom cut off)
- Screen name/type: Home / shop front — greeting header, search, special offers
- Purpose: Main commerce home screen.
- Layout (visible portion, top ~45% of the screen): status bar; greeting row: a small circular photo avatar at left, next to two stacked lines — a tiny grey greeting ("Good Morning" with a small yellow wave emoji, approximate) over a small bold name ("Andrew Ainsley"); at the right, two small circular outline buttons with stroke icons (a bell/notification-type icon and a heart-type icon — approximate); below, a full-width light-filled pill search bar with a small magnifier icon at left, faint placeholder text, and a sliders/filter icon at right; below that, a section header row: bold "Special Offers" left, small bold "See All" right; then the top of a wide promo card (light grey fill, ~20px radius): very large bold "30%" at left, bold line "Today's Special!" under it, a small grey caption line beneath, and a photographic portrait (woman in blue shirt) occupying the card's right portion; card continues past the cut.
- Components & styling: icon buttons are thin-outline circles with stroke glyphs (the board's first outline-icon treatment); search is a filled pill (fully rounded); promo card is flat light tint, no border, no shadow; avatar is a circle photo crop.
- Typography: name small-bold; section header medium-bold; "30%" is display-size bold — the largest type in the visible area; captions small grey.
- Colour: colour inside the avatar and promo photographs + tiny yellow emoji; everything else black/grey/white; the promo card tint is neutral light grey.
- Controls & interaction cues: two circular icon buttons, search pill with filter affordance, "See All" text link, promo card (tappable).
- Pattern(s): HOME-GREETING-HEADER, CIRCLE-ICON-BUTTON, SEARCH-PILL-FILTER, SECTION-HEADER-SEEALL, PROMO-CARD-PHOTO-RIGHT

## S4-4-2 (partial — bottom cut off)
- Screen name/type: Notifications — day-grouped list
- Purpose: Notification centre.
- Layout (visible portion): status bar; header row: back arrow + small bold title "Notification", and a small circular outline icon button at the right (settings/options-type glyph — approximate); a bold small section label "Today"; a notification row: a solid black circle medallion with a white percentage/discount glyph at left, beside two stacked lines — a small bold title ("30% Special Discount!") and a small grey one-line caption; below, a second bold section label "Yesterday"; the top of another row (black circle medallion + bold title beginning "Top Up E-Wallet Successful…" — approximate) before the cut.
- Components & styling: rows are borderless — medallion + two text lines on white, separated by space alone; medallions solid black circles (~11% width).
- Typography: section labels small-bold; row titles small-bold; captions small grey.
- Colour: black/grey/white only in the visible part.
- Controls & interaction cues: back arrow, circular icon button; rows are tappable list items.
- Pattern(s): BACK-ARROW-HEADER, FORM-HEADER-TITLE, DAY-GROUPED-LIST, NOTIFICATION-ROW-ICON-CIRCLE, CIRCLE-ICON-BUTTON

## S4-5-2 (partial — bottom cut off)
- Screen name/type: My Wishlist — filter chips + product grid
- Purpose: Saved items with category filtering.
- Layout (visible portion): status bar; header row: back arrow + small bold title "My Wishlist" and a small search (magnifier) icon at the right; a horizontal chip row: first chip is a solid black pill with white text ("All"), followed by outline-style chips (thin border, white fill, dark text) labelled "Clothes", "Shoes", "Bags", and a fifth chip cut off at the right edge ("Ele…" — Electronics, approximate); below, the top of a two-column product grid: left card shows a photographic product image (camera) on a very light background with a small solid black circle icon badge at the photo's top-right corner; right card shows a watch photograph with the same black circle badge; product names/prices sit below the photos, past the cut.
- Components & styling: chips are full pills; selected = solid black, unselected = thin outline — the board's chip treatments; grid photos sit on light tint tiles (no visible card border/shadow); badge is a small black filled circle with a white glyph.
- Typography: header small-bold; chip labels small medium.
- Colour: colour only inside product photographs; chips and badges are black/white.
- Controls & interaction cues: filter chip row (single-select), search icon, wishlist item cards with corner badge buttons.
- Pattern(s): BACK-ARROW-HEADER, FORM-HEADER-TITLE, FILTER-CHIP-ROW, PRODUCT-GRID-CARD

---

## Pattern frequency in this range

Counted over all 40 screen instances inventoried above (partials counted when the pattern is actually visible in the fragment).

- BLACK-PILL-CTA: 19 standalone — S1-3-1, S1-4-1, S1-5-1, S2-3-1, S2-4-1, S2-5-1, S2-2-2, S2-3-2, S2-4-2, S2-5-2, S3-1-1, S3-1-2, S3-2-2, S3-3-2, S3-4-2, S3-5-2, S4-3-1, S4-4-1, S4-5-1; it also appears as the primary half of DUAL-BUTTON-ROW on S4-1-1 and (dimmed) S4-2-1.
- BACK-ARROW-HEADER: 19 — S2-1-2, S2-2-2, S2-3-2, S2-4-2, S2-5-2, S3-1-2, S3-2-2, S3-3-2, S3-4-2, S3-5-2, S4-1-1, S4-2-1 (dimmed), S4-3-1, S4-4-1, S4-5-1, S4-1-2, S4-2-2 (dimmed), S4-4-2, S4-5-2. (The Home screen S4-3-2 is the exception: greeting header instead of a back arrow.)
- FORM-HEADER-TITLE (small bold header title, as opposed to display headlines): 11 — S3-3-2, S3-4-2, S3-5-2, S4-1-1, S4-2-1, S4-3-1, S4-4-1, S4-5-1, S4-1-2, S4-4-2, S4-5-2.
- FILLED-TEXT-FIELD: 8 — S2-2-2, S2-3-2, S2-4-2, S2-5-2, S3-1-2, S3-2-2, S3-3-2, S3-4-2.
- ONBOARDING-TEXT-SHEET (headline + dash + pill block): 6 — S1-3-1, S1-4-1, S1-5-1, S2-3-1, S2-4-1, S2-5-1.
- PAGE-DOTS-DASH: 6 — S1-3-1, S1-4-1, S1-5-1, S2-3-1, S2-4-1, S2-5-1.
- REMEMBER-ME-CHECKBOX: 6 — S2-2-2, S2-3-2, S2-4-2, S2-5-2, S3-1-2, S3-2-2.
- PHOTO-HERO-ONBOARDING: 5 full + 1 partial — S1-2-1, S1-3-1, S1-4-1, S1-5-1, S2-2-1 (+ S1-2-2 partial).
- BIG-LEFT-HEADLINE: 7 — S2-1-2, S2-2-2, S2-3-2, S2-4-2, S2-5-2, S3-1-2, S3-2-2.
- ILLUSTRATION-HERO-ONBOARDING: 3 full + 3 partial + 1 small — S2-3-1, S2-4-1, S2-5-1 (+ S1-3-2, S1-4-2, S1-5-2 partials; S2-1-2 small illustration).
- TEXT-LINK-FOOTER: 5 — S3-1-1, S3-2-1, S3-4-1, S3-5-1, S3-2-2.
- SOCIAL-ICON-ROW: 4 — S3-2-1, S3-4-1, S3-5-1, S3-2-2.
- OR-DIVIDER-TEXT: 5 — S3-1-1, S3-2-1, S3-4-1, S3-5-1, S3-2-2.
- FOCUSED-OUTLINE-FIELD: 2 — S2-3-2, S3-1-2.
- NUMERIC-KEYPAD: 2 — S3-5-2, S4-4-1.
- OTP/PIN slot rows: PIN-DOTS-ENTRY 1 (S3-5-2); OTP-BOXES 2 (S4-4-1, S4-5-1).
- RESEND-TIMER-TEXT: 2 — S4-4-1, S4-5-1.
- SYSTEM-KEYBOARD-OPEN: 2 — S3-3-1 (fragment), S3-1-2.
- AVATAR-UPLOAD-CIRCLE: 2 — S3-3-2, S3-4-2.
- PHONE-FIELD-FLAG: 2 — S3-3-2, S3-4-2.
- SPLASH-LOGO-SPINNER: 2 full + 1 partial — S1-1-1, S2-1-1 (+ S1-1-2 partial).
- LOADING-SPINNER-DOTS: 3 — S1-1-1, S2-1-1, S4-2-1 (inside modal).
- SCRIM-OVERLAY-TEXT: 2 — S1-2-1 (dark scrim), S2-2-1 (white scrim).
- SOCIAL-SIGNIN-ROWS: 1 screen across 2 slices — S2-1-2 + S3-1-1.
- SUCCESS-MODAL-CARD: 2 — S4-2-1, S4-2-2.
- DIMMED-OVERLAY: 2 — S4-2-1, S4-2-2.
- DUAL-BUTTON-ROW: 2 — S4-1-1, S4-2-1 (behind modal).
- CIRCLE-ICON-BUTTON: 2 — S4-3-2 (×2 in one screen), S4-4-2.
- SELECTABLE-CONTACT-ROW: 1 — S4-3-1 (two rows in one screen).
- FINGERPRINT-GLYPH: 1 — S4-1-1.
- HOME-GREETING-HEADER: 1 — S4-3-2.
- SEARCH-PILL-FILTER: 1 — S4-3-2.
- SECTION-HEADER-SEEALL: 1 — S4-3-2.
- PROMO-CARD-PHOTO-RIGHT: 1 — S4-3-2.
- DAY-GROUPED-LIST: 1 — S4-4-2.
- NOTIFICATION-ROW-ICON-CIRCLE: 1 screen — S4-4-2 (two rows visible).
- FILTER-CHIP-ROW: 1 — S4-5-2.
- PRODUCT-GRID-CARD: 1 — S4-5-2.
