# The Grammar — what fifteen professional boards agree on

Extracted in Mission 042 from fifteen reference boards (Evira, a blue
e-commerce kit, Medica, Car Wash, QuickServe, SwiftGo, StayNest, Fibo,
Proton Vault, Brewly, Atlete Trend, Airi, an orange food kit, Beefy,
Good Food), read independently by three analysts plus zoomed crops.
The boards disagree about palette, brand and category. They agree —
without exception — on the discipline below. That agreement is the
difference between "professional" and "generated": our engine's
palettes were never the problem; its component chrome was.

## The laws

1. **One accent works.** A single brand colour carries every
   interactive meaning — primary buttons, selected states, active
   tabs, links, key numbers. Everything else is ground, surface and
   two or three greys. Semantic colours appear only as small
   dots/pills, never as surfaces.
2. **Shadow OR outline, never both.** Cards are white, lifted by one
   soft shadow (roughly 0 6–18px, ≤8% black), borderless. An outlined
   element carries no shadow. Two outlines on one element is noise.
3. **Search is a pill with its icon inside.** Magnifier at the left,
   placeholder text, no button anywhere. A trailing filter icon is
   the only permitted extra.
4. **A card has an information budget:** media, a title (semibold,
   ≤2 lines), ONE meta line (facets · stat · rating, middot-joined,
   ellipsised), a price row. Nothing else earns a line. Rows carry a
   thumbnail, two text lines, and at most one right-side figure.
5. **Chips are quiet until chosen.** Unselected: a light tint of the
   ground, no border, dark text. Selected: solid accent, white text.
   One row, horizontally scrolled.
6. **Working type is one sans.** Semibold does the emphasis work;
   sizes per screen stay near four (headline 26–34 bold, titles
   15–17 semibold, body 13–14, meta 11–12 in the soft grey).
   Sentence case everywhere; capitals are for rare micro-labels.
   Serif/display faces belong to editorial compositions and brand
   marks — never to a working browse screen's furniture.
7. **Actions are filled or quiet, never outlined.** The primary
   action is a solid accent pill, usually pinned in a bottom bar.
   Secondary actions are text buttons or tint pills. An outlined
   pill doing a filled button's job reads as unfinished.
8. **Ratings are one line:** ★ + value + (count), the star in amber
   or the accent.
9. **Navigation is five icons at most,** stroke style, tiny labels,
   the active one in the accent (filled pill, filled icon or dot) —
   never bold text alone.
10. **Space separates; lines don't.** Page gutters 16–24px, section
    gaps 20–28, card-internal gaps 8–12. Hairlines appear inside
    tables and detail lists, almost nowhere else.
11. **Photography is the colour.** Photos sit in rounded tiles on a
    light neutral ground with no frame, no border, no shadow of
    their own. Where there is no photo, there is no fake photo box
    competing for attention.
12. **Every screen has one loud element** — the hero, the price, the
    primary button — and everything else is deliberately quieter.

## How the engine obeys

- The runtime CSS ends with the MISSION 042 grammar block: borderless
  lifted surfaces (cards, rows, metrics, bag, submissions), the pill
  search, quiet chips, sans working type (display faces only under
  `body.comp-index` / `comp-article`, fed by the compiled intent),
  filled/quiet save actions, tint-filled form fields, a shadow-lifted
  tab bar.
- The search renderer emits the icon inside the field and no button.
- Card markup folds subtitle, facets and stats into a single
  `.card-meta` line.
- The record page's save is a circular heart overlaid on the photo —
  the boards' pattern — falling back to a filled pill when a record
  has no photo.
- Worlds (ledger/market/care/studio/editorial) now tune only palette
  and type flavour inside these laws.

## What the grammar is not

It is not a theme. It does not pick colours, write copy, shoot
photography, or invent product content (riders, reviews, maps). An
engine can hold every law and still ship a dull product if the brief
is dull — but it will no longer ship a noisy one.

## Addenda — Mission 045 (learned from a field build)

A classifieds app built from this engine by another AI was compared,
screen by screen, with the Evira board. The twelve laws held; the
output still read as generated. These rules close the gaps found:

13. **Substituted media is a light tile.** When a brief supplies no
    photography, the stand-in is a pale tint of the product's hue
    with its initials printed deep — like a product shot on a
    seamless backdrop. Never a dark, saturated block: six of those
    in a grid shout louder than any headline.
14. **One loud element per screen is a budget shared by all
    components.** If the brand zone spends the brand colour, the
    promo may not spend it again: a promo without a photograph is a
    quiet tint band with one small filled button.
15. **Catalogue titles are working type.** The display face is for
    long-form reading. A grid of products, a cart, an order book —
    their titles are the UI sans, bold. (An index of products is a
    catalogue, not a magazine.)
16. **A card's meta line carries at most two facts** — the first
    facet and the strongest signal. Seller, place and date belong
    on the record page; a card is an invitation, not a record.
17. **The bag and the order book are not boxes.** Their rows sit on
    the ground and are separated by space. No card surface, no
    shadow, no dividing lines.
18. **Destructive actions are quiet.** Cancel is tint ground with
    error-coloured text — never an outline, never a second accent
    competing with the brand. Only the final confirm fills.
19. **An empty state is a sentence on the ground.** No dashed box.
    And it names the container the user sees ("Your cart is
    empty."), never an internal word.
20. **Price and action share the frame.** On a record page the
    price sits in the fixed bottom bar beside the purchase button.
    A price buried in the text flow is a price not seen.
21. **An in-bag card control is a stepper** (− quantity +), never
    a bare number in a filled circle — that reads as a notification
    badge. Unique items show no stepper at all.
22. **A home has one identity block.** Either the brand zone or a
    greeting header (avatar, greeting, name) — never both stacked.
    A home in the board's language opens with the person, not the
    slogan.
23. **One facet may wear two shapes, not two rows.** When a facet
    becomes category medallions on the home, its chip rail is not
    also planned; the facet still lives, whole, in the filter
    sheet.
24. **Filters live in a sheet.** The home carries one sliders
    button in the search row; facets, price span, rating floor and
    sort are chosen together in a bottom sheet and applied
    together.
25. **Choices are rows, not dropdowns.** Delivery and payment are
    radio rows — a medallion, a name, a caption, a price, one
    filled radio. A choice the user cannot see is a choice they
    cannot make.
26. **Money that can change is a card.** The wallet's balance sits
    on a black card with one white action; its history is plain
    rows with signed amounts. Top-up is a sheet with an amount
    keypad, never a settings toggle.
27. **A receipt proves, it does not repeat.** The barcode is drawn
    from the order reference, wide; the reference itself is never
    printed under it. An order's stages are one icon tracker —
    never two stage rows saying the same thing.

## Addendum — Mission 047 (the intake, and the Bazaar corrections)

28. **Chip rails never show a scrollbar; sheet chips wrap.** Scrolling
    is invisible or it does not happen: rails hide their scrollbar,
    and inside a sheet the chips sit in wrapped rows like the board's.
29. **A form sits on the ground.** The step panel has no box — no
    surface, border or radius of its own; the filled fields are the
    boxes, the ground is the page.
30. **A medallion wears a photograph when the catalogue can lend one**
    — the first photographed record in the facet value. A selected
    photo medallion keeps its photo and takes a ring; the ink fill is
    only for initial discs.
31. **One home, one filter furniture.** When category medallions are
    declared, no chip rails are planned beside them; every facet
    lives in the filter sheet.
32. **An undeclared family is an undecided question, not a default.**
    The brief doctor names it before generation (INTAKE.md); an app
    missing a screen should be missing it on purpose.

## Addendum — Mission 049 (the two "All" chips)

33. **A label that repeats must say what it repeats for.** When
    several facet groups share one chip rail, every group's reset
    chip is qualified by its facet ("All Type", "All Light") — two
    identical labels meaning different things is a defect, however
    tidy the row looks, and a hairline separator is not a label.
    The reset *value* stays "All" (state and gates key on value,
    never on visible text); a single-group rail, where nothing can
    be confused, keeps the plain label. A hidden scrollbar (law 28)
    removes the scroll affordance, not the knowledge that more
    exists: while more chips sit to the right, the rail's trailing
    edge fades, measured — the affordance the data tables already
    had. Inside the filter sheet the group heading does the visual
    labelling, and the reset chip still names its facet to a
    screen reader.

## Addendum — Mission 050 (the remaining families)

34. **A splash is a brand moment, not a screen.** When declared, it
    is the whole first view — brand mark, name and tagline on the
    brand ground, nothing else competing — and it leaves on its own
    after its declared hold or on any tap, whichever comes first.
    It shows once per session: a return visit in a new session earns
    it again; a reload mid-visit does not. Under reduced motion it
    does not animate and does not linger.
35. **A permission is asked for with its benefit attached.** Priming
    is one ask per view — a glyph disc, what the permission is for
    in one plain line, Allow and Maybe later as equals in reach —
    never a system prompt sprung without a reason, and never a
    dark-pattern exit. The choice persists: asked once, remembered.
36. **A code is typed into boxes, one digit each.** The OTP step is
    a row of 4–6 single-digit boxes; typing advances the focus, the
    last digit completes the code, and Backspace on an empty box
    steps back. The step says honestly when it is local: no code
    was sent, and the screen must not pretend otherwise.
37. **Chat is a list, a thread and a composer — labelled local.**
    Threads open to bubbles (mine on the brand, theirs on the
    ground), the composer appends for real and persists on the
    device, and a declared canned reply is presented as what it
    is. A chat that cannot reach another person says so on its
    own screen ("Local demo · messages stay on this device").
38. **Saved things live in a view named for them.** A wishlist is
    not a filter on the catalogue: it is its own destination in
    the tab bar, fed by the same save toggle the cards and record
    pages carry, and it replaces the generic Saved tab rather than
    duplicating it. Declaring the view declares the toggle that
    feeds it — an always-empty wishlist is a dead screen.
39. **A booking day is a strip, a booking time is chips.** Flow
    fields of type `date-strip` (the next days as single-select
    chips) and `time-chips` (slot chips) choose the way the boards
    choose — by tapping a visible option, never by typing a date
    into a blank. The choice is a form value like any other: it
    validates as required, reviews as the label the user tapped,
    and lands in the order summary.
40. **A price range has two handles and both are wired.** The
    filter sheet's minimum and maximum sliders each bound the
    catalogue on their side; dragging one, applying, and counting
    the results is the proof, and a range control that moves
    nothing is a defect even when it renders. Reset restores both.
41. **An empty, focused search offers, it does not wait.** While
    the catalogue search is focused with no query, it shows the
    suggestion state — recent searches first (the user's own,
    persisted), popular terms, and tappable record rows. A tap
    fills the query and runs the same search typing runs. The
    state exists only in that moment: unfocused or filled, the
    search is exactly what it was.
42. **Orders filter by the statuses they actually carry.** The
    orders view's segmented tabs are built from the statuses
    present in the order book (All first, then each real status),
    never an invented lifecycle. One segment, one filtered list;
    a segment with nothing under it says so in an empty state,
    it does not borrow another segment's orders.
