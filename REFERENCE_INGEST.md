# REFERENCE INGEST — when the user attaches their own reference

Mission 050. The engine has two ways of knowing what "good" looks like:

1. **The base reference** (`pinterest-ui-engine/reference/base/`) — the
   decoded Pinterest boards the engine ships with. It governs when the
   user attaches nothing.
2. **A user reference** — image(s) the user attaches to THIS project.
   When one is attached, it governs instead of the base. Not "inspires".
   Governs.

Until now the only ingest machinery was
`engine/reference_profile.mjs`, which measures **colour pixels only**
and deliberately refuses layout/typography inference (its own header:
a typeface cannot be identified from pixels; there is no layout
generator in the measurement). That refusal is honest — and it means
measurement alone can never tell the engine that a reference's detail
screen is a photo hero with an overlapping sheet, or that its CTA is a
dark-green pill and its selection colour is the brand field itself.
**Ingest is the screen-level decode layer on top of the measurement.**
Keep the measurement. Add the decode. Never let either impersonate
the other.

Worked example, complete and validated:
`pinterest-ui-engine/reference/user/brewly-coffee/`
(decode.md + profile.json + measurement.json).

---

## The protocol — five steps, in order, no skipping

Run from the engine root (`pinterest-ui-engine/`) unless a step says
otherwise. `<id>` is a short kebab-case name for the reference
(`brewly-coffee`, `user-travel-app`, …). One attached image set = one
`<id>` = one directory `reference/user/<id>/`.

### Step 1 — Measure (colour only, verbatim)

```bash
mkdir -p reference/user/<id>
node engine/reference_profile.mjs <attached-image> --out /tmp/ref-measure-<id>
cp /tmp/ref-measure-<id>/reference-profile.json reference/user/<id>/measurement.json
```

- Repeat per attached image if the user attached several separate
  screens rather than one board; keep each output, named
  `measurement-<n>.json`, and say so in the decode header.
- `measurement.json` is stored **verbatim**. Do not edit measured
  numbers, do not round them, do not delete the archetype scores when
  they disagree with the decode — the disagreement is information
  (see Step 3).
- This step needs Python 3 + Pillow (`pip install -r requirements.txt`
  from the distribution root). If it fails, STOP and report: an ingest
  without its measurement is incomplete, and a hand-typed palette is
  not a substitute.

### Step 2 — Decode EVERY screen (`reference/user/<id>/decode.md`)

Open the image(s) and decode **every** screen, in board order, into
`reference/user/<id>/decode.md`, in **exactly** the base board decode
format (spec below — the base files under `reference/base/` are the
reference examples; `brewly-coffee/decode.md` is a user-format one).

Rules:

- **Every screen.** A board of 10 screens gets 10 numbered sections.
  A screen you skipped is a screen the generated app will invent.
- **Anatomy is top→bottom and concrete**: real copy where legible
  (names, prices, labels), real component order, real states
  ("All chip selected"). Where the board resolution makes text
  illegible, write what is legible and mark the rest as inferred —
  never present a guess as a transcription.
- **Every screen gets an engine mapping line**: the engine pattern it
  matches, matches as a variant, or — explicitly — `MISSING`. A
  MISSING is a plan input (the pattern must be built or the deviation
  declared), not an embarrassment to omit.
- **End with the pattern census**: count each pattern across screens
  so one-off screens are not mistaken for the system.
- Record the header facts a planner needs: palette **roles** (which
  colour is the field, which is the ground, which is ink/muted/accent
  — with hex bands as seen), type roles (display vs UI, serif vs sans
  and WHERE each is used), shape language (radii, chip/CTA/sheet
  forms), density character, nav model.

### Step 3 — Summarise (`reference/user/<id>/profile.json`)

Write `profile.json` in the **base_reference.json schema** — the same
shape the planner reads for the base reference:

| Field | Content |
|---|---|
| `id` | the `<id>` |
| `screens[]` | one entry per decoded screen, each `{ type, anatomy, headerStyle, ctaStyle }` — `anatomy` is the decode's anatomy, condensed, not rewritten |
| `palette` | role → `{ hex, role, source }`. `source` states where the value came from: `decode`, `measurement`, or both when they agree |
| `typeRoles` | display role, UI role, numeric role — from the decode (measurement reports typography as `unknown` by design; say so) |
| `shape` | card radius, CTA form, chip form, sheet form, selectors, steppers |
| `ctaRules` | the reference's CTA grammar as rules (form, arrow use, selection colour, inverted CTA on fields, quiet/destructive treatment) |
| `headerRules` | the reference's header grammar as rules (secondary-screen header, home header, colour-field headers, photo-header buttons) |
| `deviations` | how this reference differs from the base reference AND from its own pixel measurement, screen by screen where relevant |
| `source` | image filename(s), ingest kind, decode/measurement filenames |

**Measurement vs decode disagreements are resolved by this rule, and
recorded in `deviations`, never silently:** the measurement governs
only the colour numbers it actually measured (cluster values, shares,
luminance). The decode governs art and design direction — palette
roles, layout, type roles, CTA/header grammar — because pixels cannot
see roles (a board's photography will outvote its flat UI fields
every time; the Brewly board measures modal-hue *orange* from coffee
photography while every flat field is dark green). When the decode
overrides an archetype recommendation from the measurement, the
override and its reason go in `deviations`.

### Step 4 — Validate (the gate)

```bash
node engine/reference/reference_doctor.mjs reference/user/<id>
```

Must print `0 gap(s)` and exit 0. The doctor checks: decode.md exists
with a proper header; every numbered screen section carries an
**Anatomy** line and an **Engine mapping** line; screen numbering is
sequential; a pattern census exists; profile.json parses and carries
`id`, `screens[]`, `palette`, `typeRoles`, `shape`, `ctaRules`,
`headerRules`; every screen entry carries
`type/anatomy/headerStyle/ctaStyle`; and the profile's screen count
equals the decode's. **Any GAP stops the ingest** — fix the decode or
the profile, re-run, and only proceed on a clean pass. Do not proceed
to planning on a failing ingest and do not hand-wave a gap in prose.

### Step 5 — Hand over to the plan (the decode governs)

- The plan package's `REFERENCE_PLAN.md` **names this decode as the
  governing reference**: `reference/user/<id>/decode.md`, plus the
  doctor's clean result.
- Art direction and design direction in the plan derive from **this
  decode and profile — not the base reference**. The base reference
  applies only where the user reference is genuinely silent (e.g.
  states the reference never shows: empty, loading, error — design
  those from the base/grammar and declare that you did).
- Every `MISSING` from the decode's mapping lines and census appears
  in the plan either as a build item or as an explicit deviation.
- The brief/intake flow is unchanged: the reference governs how the
  app looks and behaves on screen; the brief still governs what the
  product is. `reference_profile.mjs`'s standing rule holds — a visual
  reference must not dictate product behaviour.

---

## decode.md format spec (exact)

Identical to the base board decode format. Structure:

```markdown
# User Reference Decode — <Name> (user: <id>)

- **Source:** `<image filename>`
- **Ingest:** <how this reference arrived; for a real upload: "user-attached
  reference, <date>"; multiple images: list each>
- **Measurement:** `measurement.json` in this directory is the verbatim
  reference_profile.mjs output (colour pixels only).
- **Layout:** <screens count, board arrangement, studio background>
- **App / domain:** <what the app is; persona shown; currency>
- **Palette (approximate):** <role by role, hex bands as seen, which
  colour is used as large fields vs accents only>
- **Type roles:** <display role + where used; UI role; numeric treatment>
- **Shape language:** <card radius; row form; chips; CTA form and arrow
  rule; selectors; steppers>
- **Density character:** <density + row heights/counts as seen>
- **Nav model:** <tab bar / headers / what secondary screens use>
- **Decode vs measurement:** <REQUIRED when the measurement and the
  decode disagree: what each says, and the resolution per Step 3>

---

## Screen inventory

### 1. <Screen name> — <short qualifier>
- **Purpose:** …
- **Anatomy top→bottom:** …
- **Components:** …
- **CTA:** …
- **States:** …
- **Engine mapping:** <pattern it matches / variant / MISSING — …>

### 2. … (every screen, numbered sequentially, board order)

---

## Pattern census

| Pattern | Count |
|---|---:|
| … | … |

**MISSING / weak in engine:** <every pattern the decode flagged MISSING>
```

Header bullet labels may flex where a fact does not apply, but
`**Source:**`, the numbered `### N.` screen sections, the per-screen
`**Anatomy` / `**Engine mapping:**` lines, and the `## Pattern census`
section are mandatory — `reference_doctor.mjs` enforces them.

## profile.json schema (exact)

```jsonc
{
  "id": "<id>",
  "kind": "user-reference",
  "app": "<domain, persona, currency>",
  "source": { "image": "<filename>", "ingest": "<…>", "decode": "decode.md", "measurement": "measurement.json" },
  "screens": [
    { "type": "<screen type>", "anatomy": "<condensed anatomy>",
      "headerStyle": "<header form>", "ctaStyle": "<CTA form>" }
    // one per decoded screen, same order
  ],
  "palette": {
    "<role>": { "hex": "<hex or band>", "role": "<what it does>", "source": "decode | measurement | decode; measurement …" },
    "measured": { /* key measured numbers + pointer to measurement.json */ }
  },
  "typeRoles": { "display": "…", "ui": "…", "numeric": "…", "note": "measurement reports typography unknown; these are decode interpretation" },
  "shape": { "cardRadius": "…", "cta": "…", "chips": "…", "sheet": "…", "stepper": "…" },
  "density": "…",
  "navModel": "…",
  "ctaRules": ["…"],
  "headerRules": ["…"],
  "deviations": ["…"]   // vs base reference AND vs own measurement
}
```

Required (doctor-enforced, non-empty): `id`, `screens[]`, `palette`,
`typeRoles`, `shape`, `ctaRules`, `headerRules`; per screen: `type`,
`anatomy`, `headerStyle`, `ctaStyle`. The rest is expected craft:
a profile without `deviations` is claiming the user reference is
identical to the base and to its own pixels, which is never true.

## Commands — the whole ingest, copy-paste

```bash
cd pinterest-ui-engine
ID=<id>; IMG=<path-to-attached-image>
mkdir -p reference/user/$ID
node engine/reference_profile.mjs "$IMG" --out /tmp/ref-measure-$ID
cp /tmp/ref-measure-$ID/reference-profile.json reference/user/$ID/measurement.json
# … decode every screen into reference/user/$ID/decode.md (format above) …
# … summarise into reference/user/$ID/profile.json (schema above) …
node engine/reference/reference_doctor.mjs reference/user/$ID   # must exit 0
```
