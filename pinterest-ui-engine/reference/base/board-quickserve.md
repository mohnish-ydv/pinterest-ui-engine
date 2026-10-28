# Board Decode — QuickServe Livraison

- **Source:** `3c92c119bfd9d9af9d19cf102fad15a4ce6f2e254cd6caaf55478dfa44505910.jpg` (736×1104, dark presentation board)
- **App / domain:** QuickServe — **delivery-driver / courier companion app** (French, meal delivery "Livraison Repas"). Board headline: "QuickServe Livraison Repas — Kit d'interface livreur"; sub: "Interfaces modernes pour une livraison plus rapide et plus intelligente."; board CTA pill "Prêt à livrer" (marketing panel, **not** an app screen — excluded from inventory).
- **Frames inventoried:** 12 phone screens. Language on screens is French throughout; translations in brackets where helpful.
- **Palette (approximate, from flat UI fields):** board background near-black warm brown `#1A0D08`–`#2A120A`; primary orange-red `#FF4D0D`–`#F9530B` (solid CTAs, splash field, pins); splash gradient orange `#FF6A00` → deep `#E63E00`; screens white `#FFFFFF`; text near-black `#14100E`; muted grey `#9A918B`; pale orange tint fields/discs `#FFF0E8`; success green `#2EAF5A` (online dot, verified checks); earnings chart bars in peach `#FBD9C3`, mid orange, and grey.
- **Type roles:** Display — extra-bold geometric sans for board headline and screen heroes ("Livrez chaud, livrez vite", "128,40 €", "Livraison terminée !"). UI — same sans, medium labels, small grey meta. Numbers are display-weight (earnings total, distance, fee).
- **Shape language:** Phones have thick black bezels (device frames, unlike the other boards). Cards ~16px radius, flat, no border. Primary CTA is a full-width rounded rectangle-pill (~14–16px radius, less fully-round than SwiftGo). Map pins are orange teardrops with white glyphs. Bottom sheet cards on maps have a top-radius only.
- **Density character:** Driver-glanceable density: fewer, bigger elements per screen; map screens are mostly map; KPI screen is one huge number + one chart + 3 stat rows. Nothing is a dense catalogue.
- **Nav model:** Bottom tab bar (4 tabs: Accueil / Courses / Messages / Profil, line icons, active orange) visible on the map home only in this board; all task screens use a top bar (back chevron + title, sometimes a small icon right) with no tab bar. Splash/auth have no nav.

---

## Screen inventory

### 1. Splash / Onboarding — illustrated hero
- **Purpose:** Brand + value proposition for drivers.
- **Anatomy top→bottom:** Full-bleed orange gradient field → centred flat illustration: rider in orange helmet/jacket on an orange scooter with delivery box (cloche icon on box), simple cloud shapes above → headline "Livrez chaud, livrez vite" [Deliver hot, deliver fast] white display, centred → sub "Chaque commande compte." [Every order counts] → carousel dots at bottom (3 dots, first active).
- **Components:** full-bleed colour field, spot illustration, display headline, pager dots.
- **CTA style/placement:** None on this frame — swipe/pager onboarding.
- **States shown:** Page 1 of 3.
- **Engine mapping:** onboarding (illustrated, full-bleed colour variant — different from SwiftGo's photo hero).

### 2. Connexion — Auth / Login
- **Purpose:** Driver sign-in.
- **Anatomy top→bottom:** Title "Connexion" display left → sub "Connectez-vous pour commencer vos livraisons" → field "Téléphone ou e-mail" (filled grey field) → field "Mot de passe" with eye/visibility icon right → text link "Mot de passe oublié ?" → solid orange CTA "Se connecter" → divider "ou" → 3 circular social/other sign-in buttons in a row (phone icon / Google G / Apple) → footer "Pas encore de compte ? S'inscrire" (S'inscrire in orange).
- **Components:** auth form, password field with visibility toggle, social sign-in discs, footer switch link.
- **CTA style/placement:** Full-width solid orange, mid-screen directly under the form (not bottom-pinned — form is short).
- **States shown:** Empty/default.
- **Engine mapping:** auth.

### 3. Accueil — Map home / availability (online)
- **Purpose:** Driver is online; see demand around them and search for orders.
- **Anatomy top→bottom:** Top bar: hamburger left, centred status "● En ligne" [Online] with green dot, green status disc right → full-bleed street map with blue self-location dot and 5 orange demand pins (flame glyphs) scattered → floating black pill CTA near bottom "Rechercher des commandes" [Search for orders] → bottom tab bar (Accueil active orange; Courses / Messages / Profil).
- **Components:** full-bleed map, availability/status header, floating dark CTA pill, tab bar.
- **CTA style/placement:** Floating black pill over the map — the board's only black CTA; contrast device against map, not the brand orange.
- **States shown:** Online/available, demand pins present.
- **Engine mapping:** map/tracking (availability home variant) + greeting home (map form). Availability toggle/status header is driver-specific — see census.

### 4. Avant de commencer — Pre-flight checklist
- **Purpose:** Verify driver is ready before taking orders.
- **Anatomy top→bottom:** Title "Avant de commencer" + sub "Assurez-vous d'être prêt" → 2-up tile pair: "Véhicule — Vérifié" with green check disc; "Documents — Vérifié" with check disc → list row: green check disc + "Sac isotherme — Requis" [Insulated bag — Required] + chevron → list row: orange check disc + "Taux d'acceptation — Bon" [Acceptance rate — Good] + chevron → large empty space → solid orange CTA "Tout est prêt" [All ready] bottom-pinned.
- **Components:** verified-status tiles, checklist rows with status discs, chevrons.
- **CTA style/placement:** Full-width solid orange, bottom-pinned.
- **States shown:** All checks passed/verified.
- **Engine mapping:** MISSING as a named pattern — a readiness/verification checklist. Closest relatives: form flow (no inputs here) and profile rows (rows here are status, not navigation).

### 5. Nouvelle demande — New delivery request (timed accept)
- **Purpose:** Decide on an incoming job under time pressure.
- **Anatomy top→bottom:** Floating black pill header over map: "Nouvelle demande" + countdown "00:28" right → map with orange route line, restaurant pin (fork/knife glyph, orange disc) at origin, home pin at destination → bottom sheet card: big stat pair "1,8 km / Distance" left and "8,50 € / Estimation" right → pickup block "Bistro du Marché, 26 Rue de la Paix, 75002 Paris ›" → drop block "Appartement 12, 15 Rue des Lilas, 75010 Paris" → paired CTAs: quiet grey "Refuser" + solid orange "Accepter", equal width.
- **Components:** countdown header pill, route map, bottom sheet with fee/distance stats, paired accept/decline CTAs.
- **CTA style/placement:** Paired bottom CTAs inside the sheet — decline quiet, accept solid.
- **States shown:** Pending request, 28 seconds remaining.
- **Engine mapping:** map/tracking + detail sheet (bottom-sheet-over-map form). The **timed accept/decline job card** is MISSING as a named engine pattern — it is the core loop of a driver app.

### 6. Livraison #8432 — Active delivery detail
- **Purpose:** Execute the current delivery.
- **Anatomy top→bottom:** Top bar over map: back chevron left, expand icon right → map upper ~45% with orange route, restaurant pin left, home (destination) pin in black disc right → white content area: title "Livraison #8432" + pale "En cours" [In progress] status pill right → "Restaurant / Le Petit Gourmet" label-value → "Client / Sophie Martin" label-value + circular phone/call button right → "Détails de la commande" [Order details] → item lines "1x Burger classique / 1x Frites / 1x Boisson" → solid orange CTA "Commander livrée" [Mark order delivered — as labelled on board] bottom.
- **Components:** route map header, order ID + status pill, label/value parties block, itemised order list, call button.
- **CTA style/placement:** Full-width solid orange at bottom of the content area.
- **States shown:** In-progress delivery.
- **Engine mapping:** map/tracking + detail sheet + order-items list. Item-quantity lines ("1x …") are a distinct list type.

### 7. Livraison terminée ! — Success / completion
- **Purpose:** Confirm completion, show what was earned.
- **Anatomy top→bottom:** Top bar: back + small icon right → centred party-popper/confetti illustration (orange) → headline "Livraison terminée !" display centred → sub "Merci pour votre excellent service." → two-column stat pair centred: "Gains / 12,30 €" and "Durée / 28 min" → solid orange CTA "Voir le récapitulatif" [See the summary] → text link under: "Retour à l'accueil".
- **Components:** celebratory illustration, success headline, stat pair, primary + text-link exits.
- **CTA style/placement:** Full-width solid orange, lower third, with a quiet text alternative under it.
- **States shown:** Terminal success state.
- **Engine mapping:** success/confirmation state — closest to a confirmation screen; a dedicated success pattern with stat pair is not a core engine pattern (see census).

### 8. Mes gains — Earnings / KPI dashboard
- **Purpose:** Weekly earnings at a glance.
- **Anatomy top→bottom:** Top bar: back + "Mes gains" + small wallet icon right → date-range selector right-aligned "12 mai – 15 mai ›" → huge total "128,40 €" display + caption "Total cette semaine" → bar chart: 7 day bars (Lun–Dim), today (Mer) highlighted solid orange with its label in an orange pill, other days peach/grey → stat rows with small icon discs: "Courses terminées — 18", "Heures en ligne — 12 h 30", "Évaluation moyenne — 4,9 ★" → quiet full-width row-button "Voir le détail →" (pale field).
- **Components:** KPI total, weekly bar chart, icon stat rows, detail link-row.
- **CTA style/placement:** No solid CTA — only a quiet "Voir le détail" row at bottom.
- **States shown:** Current week, mid-week day selected.
- **Engine mapping:** KPI dashboard. Direct match in type, but the engine KPI pattern must support a *chart + stat rows*, not just a number band.

### 9. Défi du jour — Bonus-zone map + daily challenge
- **Purpose:** Show bonus areas and a daily incentive challenge.
- **Anatomy top→bottom:** Map fills upper ~60%: orange heat-blob zones over streets, black tooltip pill "Zone bonus" pointing at one zone; floating round white icon buttons at map edges (filter top-left, share/locate top-right, help bottom-right) → bottom sheet card: "Défi du jour" [Daily challenge] + small counter/icons right → challenge row: orange disc icon + "Terminez 5 livraisons supplémentaires" + trophy/points icon right → orange progress bar (nearly full) → solid orange CTA "Voir les défis".
- **Components:** heat-map, map tooltip label, floating map controls, challenge card with progress bar.
- **CTA style/placement:** Full-width solid orange inside the bottom sheet.
- **States shown:** Challenge in progress, progress bar ~90%.
- **Engine mapping:** map/tracking + gamified challenge card. **Heat/bonus-zone map and progress-bar challenge are MISSING** as named patterns.

### 10. Mon compte — Profile / account
- **Purpose:** Driver account hub.
- **Anatomy top→bottom:** Top bar: back + centred "Mon compte" + icon right → profile header: circular avatar (illustrated driver) left, name "Lucas", rating "4,9 ★" under, small arrow/edit disc right → profile rows with icons + chevrons: Informations personnelles / Véhicule / Méthodes de paiement / Paramètres / Aide et support → final row in orange/red text "Se déconnecter" [Log out].
- **Components:** avatar + rating header, profile rows, destructive text row.
- **CTA style/placement:** No button; logout is a red text row, not a pill (contrast SwiftGo's outlined pill).
- **States shown:** Signed-in default.
- **Engine mapping:** profile rows. Direct match.

### 11. Mon véhicule — Vehicle detail
- **Purpose:** Show/manage the registered delivery vehicle.
- **Anatomy top→bottom:** Top bar: back + centred "Mon véhicule" + icon right → centred scooter illustration (orange, large) → vehicle name "Scooter 125cc" bold + green "Actif" pill right → label/value rows: "Plaque d'immatriculation — AB-123-CD", "Marque / Modèle — Yamaha NMAX" (partly legible at board resolution), "Année — 2022" → bottom quiet row/link "Modifier les informations" (partially cut at board edge).
- **Components:** hero illustration, name + status pill, spec label/value list.
- **CTA style/placement:** Quiet text/row action at bottom only.
- **States shown:** Active vehicle.
- **Engine mapping:** detail sheet (spec-list form) + profile-adjacent detail. Spec label/value list is its own component type.

### 12. Notifications — feed with filter chips
- **Purpose:** Driver notifications, filterable by type.
- **Anatomy top→bottom:** Top bar: back + centred title (spelled "Notificcions" on the board — board typo, recorded as-is) + icon right → section label "Notifications" → filter chip row: "Toutes" (selected, solid orange) / "Courses" / "Système" (quiet) → list rows, each: coloured circular icon, title bold, 1-line body/value, relative time right ("il y a 5 min", "il y a 1 h", "il y a 3 h", "il y a 1 j" — small, partly legible): Nouvelle zone bonus; Paiement reçu — 12,30 € (green icon); Votre évaluation a augmenté — 4,9 ★ (yellow icon); Maintenance prévue — Dimanche à 02h00 (orange icon).
- **Components:** filter chip rail, icon-led notification rows with timestamps.
- **CTA style/placement:** None.
- **States shown:** "All" filter selected, mixed notification types.
- **Engine mapping:** notifications feed + filter chips. The chip rail here filters a *list*, not a product grid — same component, different host.

---

## Pattern census — QuickServe

| Pattern | Count |
|---|---|
| Map / tracking (full-bleed or header map) | 4 (3, 5, 6, 9) |
| Solid orange full-width CTA | 6 (2, 4, 6, 7, 9 + splash-adjacent none; incl. paired Accept in 5 = 7 CTA instances on 6 screens) |
| Bottom sheet over map | 2 (5, 9) |
| Profile rows | 1 screen, 2 uses (10 rows; 4 checklist rows related) |
| Top bar (back + title) | 8 (4–12 except 3) |
| Onboarding / splash | 1 (1) |
| Auth | 1 (2) |
| KPI dashboard (total + chart + stats) | 1 (8) |
| Success / confirmation | 1 (7) |
| Notifications feed | 1 (12) |
| Filter chips | 1 (12) |
| Detail / spec list | 2 (6 order detail, 11 vehicle specs) |
| Paired CTAs (quiet + solid) | 1 (5) |
| Floating CTA over map | 1 (3, black pill) |
| Bottom tab bar | 1 (3) |
| Wallet | 0 — earnings (8) replaces wallet; payment methods are only a profile row |
| Product card / filter sheet / medallion rail / radio-row checkout | 0 — not a shopping app |

**MISSING / not covered by a named engine pattern:**
- **Timed job-offer card** — countdown header + fee/distance sheet + Refuser/Accepter (Screen 5). The defining screen of a driver app.
- **Pre-flight readiness checklist** with verified states (Screen 4).
- **Bonus heat-zone map + challenge card with progress bar** (Screen 9).
- **Availability status header** ("En ligne" with live dot, Screen 3).
- **Success screen with earned-stat pair** (Screen 7) as a reusable terminal state.
