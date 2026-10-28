# Board Decode — Proton Vault (Password / Security Vault)

- **Source board:** `07d44b083a7bf2022d37e0fc89aeb151f46ee2606ef921239881cee4d88403fb.jpg` — 3 full phones side by side on a soft grey studio background. All three screens are large and legible; small body lines under headings are legible, fine print in list rows is legible at board resolution.
- **App / domain:** "Proton Vault" — password manager / digital vault: store logins, cards, notes, IDs; security score, breach monitoring, 2FA recommendations.
- **Palette (approximate, from flat UI fields):** Deep maroon/burgundy primary `#6E1423 → #8E1E2F` approx. gradient (CTA, hero shield, header wash on screen 3); blush/pink tint `#F9E8EC / #F5D9DE` approx. (ground wash, icon chips); ground near-white pink `#FFF9FA` approx.; ink `#241218` approx.; muted `#8A6B72` approx.; success/strength is expressed in maroon itself + check icons, no green accent visible except tiny status checks. Colour is carried by the gradient and the 3D shield, not photography.
- **Type roles:** Display — bold geometric sans, large, sentence case with line breaks as design ("Your Passwords, / Safely Secured"); greeting/name in bold sans ("Brett"). UI — same sans, regular grey for secondary lines; big bold numerals for metrics (142, 87%, 0 / 2 / 15).
- **Shape language:** Very round. Phones/cards ~24–28px radius; CTA is a full pill with a circular arrow knob inset at the right end; search field is a full pill filled solid maroon; category tiles are rounded squares; central FAB is a large maroon circle. Hero is a glossy 3D shield-with-padlock on a stepped plinth — illustration, not photo.
- **Density character:** Medium. Screens 2–3 are information-dense but ordered by cards: one hero metric zone, then a grid/row of counts, then a list. Screen 1 is airy marketing density.
- **Nav model:** Screen 1: no nav (marketing/auth entry). Screens 2–3: bottom tab bar with 4 slots — Vault (left), centre **raised circular + FAB** (create), Activity (right of FAB), and on screen 3 the rendered bar shows grid/apps icon, shield (active, filled maroon circle), profile — i.e. the kit renders two bar variants: (a) Vault / + / Activity with labels (screen 2), (b) icon-only 3-item bar with centre active shield in a filled circle (screen 3). Headers are in-app: hamburger + centred logo + notification bell with dot (screen 2); back chevron + overflow in white circles on a coloured header (screen 3).

---

## Screen inventory

### 1. Welcome / Marketing — "Your Passwords, Safely Secured"
- **Purpose:** First-run value prop + entry to auth.
- **Anatomy top→bottom:** Status bar (9:41, signal/wifi/battery 99) → top-left brand lockup: shield logo mark in maroon + "Proton Vault" → headline (3 lines, bold, large) "Your Passwords, / Safely Secured" → subline "Encrypted. Private. Always yours." → **hero illustration**: large glossy maroon shield with padlock, floating on a 2-step plinth, small orbit rings + lock/heart specks around it, pink wash behind → **trust-feature trio**: 3 columns, each icon in a white rounded tile (padlock, fingerprint/zero-knowledge swirl, shield-check) + 2-line label ("End-to-End Encryption", "Zero-Knowledge Privacy", "Secure Sync Everywhere") → **social proof row**: overlapping circular avatar photos (3–4 faces) + "Trusted by 2M+ users" + 5-star row in maroon → primary CTA → footer "Already have an account? **Sign In**".
- **Components:** Brand header, headline block, 3D hero, icon-feature trio, avatar-stack social proof, pill CTA with arrow knob.
- **CTA style/placement:** Solid maroon pill, full-width inset near bottom, "Get Started" left-aligned text + white circular knob with right-arrow at the right end of the pill.
- **States:** Logged-out / first-run only.
- **Engine mapping:** Onboarding (single-page marketing variant, no dot pager). Avatar-stack + star social proof is **MISSING** as a component; feature trio resembles a 3-up icon row (generic).

### 2. Vault Home — "Good morning, Brett 👋"
- **Purpose:** Vault dashboard / item home.
- **Anatomy top→bottom:** Status bar → header row: hamburger icon left, centred shield + "Proton Vault", bell icon right in white circle with red notification dot → greeting block: "Good morning," grey, "Brett 👋" large bold, sub "Your vault is secure" (with small green/check implication at this resolution) → **solid maroon pill search field**: magnifier left, placeholder "Search passwords…", filter/sliders icon right in the same pill → **metric pair row**: two cards side by side — (a) dark maroon filled card: "All Items" small, "142" huge white, "Total stored" small, cube/vault glyph; (b) white card: "Security Score", "87%" huge maroon, "Very Strong", thin progress bar filled ~87% maroon → section header "Quick Access" + right link "View All" → **category tile row** (4 tiles, icon + label + count): Logins 98, Cards 16, Notes 12, IDs 6 (last tile partially cut by phone edge — horizontal scroll implied) → section "Recent Items" → **item rows** (4 visible): brand initial/logo tile (Netflix "N" black tile, Dropbox blue, Stripe "S" purple, Apple), name bold ("Netflix", "Dropbox", "Stripe", "Apple ID"), email sub "brett.adams@mail.com" approx. (same demo email repeated — small text, read as a repeated placeholder), right: pale pill tag "Login" + vertical overflow "⋮" → bottom nav (see Nav model) with centre + FAB raised above the bar.
- **Components:** Greeting home header, filled search pill, metric/stat card pair (one inverted dark), category count tiles, credential list rows with tag pill + overflow, FAB tab bar.
- **CTA style/placement:** No text CTA; primary action is the centre circular "+" FAB in maroon with white plus, elevated, straddling the tab bar.
- **States:** Populated vault (142 items); security score in a good state (87%, "Very Strong"); notification dot present.
- **Engine mapping:** Greeting home + wallet/vault list. Close patterns: greeting home, product/credential rows, stat tiles. The **solid-filled search pill** and **dark inverted metric card paired with a light metric card** are specific variants worth naming; category tiles resemble a medallion rail but are **count tiles in a row, not medallions** — mapping: medallion rail (loose).

### 3. Security Overview — "Monitor your vault health"
- **Purpose:** Security health detail / recommendations.
- **Anatomy top→bottom:** Coloured header zone (deep maroon gradient wash bleeding from top, curved bottom edge): status bar → header row: white circular back button left, white circular overflow "…" button right → title "Security Overview" white bold → sub "Monitor your vault health" pale → **score hero**: left, large circular emblem — maroon ring/disc with white shield-check, on a glossy plinth/shadow; right, "Overall Score" small, "87%" huge white/maroon-on-light as rendered against the fading wash, "Very Strong" sub → **3-up mini stat row** (white cards): "Breaches / 0 / No leaks found" with check icon; "Weak / 2 / Fix now" with "!" badge; "2FA Enabled / 15 / Accounts" with shield icon → section "Security Recommendations" → **recommendation rows** (4): each white row, maroon circular icon tile left, title bold + one-line grey action sub, chevron right — "Enable 2FA on 3 accounts / Increase your security", "2 weak passwords detected / Update to stronger passwords", "Dark Web Monitoring / No new leaks found", "Backup Codes / Save your recovery codes" → bottom tab bar (icon variant, centre shield active in filled maroon circle).
- **Components:** Coloured detail header, circular score emblem + big-percent score, 3-up stat cards, recommendation/action rows with chevrons.
- **CTA style/placement:** No single CTA; each recommendation row is tappable (chevron = go fix it). "Fix now" is a text state on the Weak card, not a button.
- **States:** Mixed health states on one screen: good (0 breaches), attention (2 weak, "Fix now"), informational (15 accounts).
- **Engine mapping:** Tracker (security score + recommendations) + profile rows for recommendations. **Score-emblem hero (circular shield medallion + %)** resembles a medallion but at hero scale — mapping: tracker variant; a dedicated **health-score detail header is MISSING** as a named pattern.

---

## Pattern census — Proton Vault

| Pattern | Count |
|---|---|
| Greeting home | 1 (screen 2) |
| Onboarding / marketing entry | 1 (screen 1) |
| Tracker / score (big % + progress + sub-stats) | 2 (screens 2 metric card, 3 full screen) |
| List rows with leading tile + trailing control | 2 screens (2 credential rows ×4, 3 recommendation rows ×4) |
| Stat tiles / cards (pair or 3-up) | 2 (screen 2 pair, screen 3 trio) |
| Pill CTA with arrow knob | 1 (screen 1) |
| FAB centre tab bar | 2 (screens 2, 3 — two variants) |
| Filled search pill | 1 (screen 2) |
| Category count tiles | 1 row of 4 (screen 2) |
| Social proof (avatar stack + stars) | 1 (screen 1) |
| Coloured header detail screen | 1 (screen 3) |

**MISSING / recurring gaps from this board:** Avatar-stack social proof; pill CTA with inset circular arrow knob; raised centre FAB tab bar (both variants); health-score emblem hero.
