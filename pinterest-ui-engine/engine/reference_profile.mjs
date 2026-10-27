// reference_profile.mjs — pipeline stage A→B bridge: reference to design principles.
//
// MISSION 020 (P2). Before this file, the pipeline went: analyze_image.py
// emitted numbers → a human/model wrote design-spec.json by hand → a
// human/model picked a direction and typed a rationale. Nothing converted
// measurement into design reasoning, and the direction choice was
// unconstrained prose. That is the gap this stage closes — as far as it can
// honestly be closed.
//
// WHAT IT DOES
//   1. runs the deterministic pixel analysis (analyze_image.py)
//   2. derives a REFERENCE PROFILE: saturation regime, hue discipline,
//      ground value, colour allocation — each tagged `measured` or
//      `interpreted`, and each carrying the evidence it came from
//   3. scores the three art-direction archetypes against that profile and
//      recommends one, with the reasons written out
//   4. optionally emits a draft design-spec scaffold (palette candidates
//      from the measured clusters, explicitly marked as a draft)
//
// WHAT IT DELIBERATELY DOES NOT DO
//   - It does not read brief.json. A visual reference influences art
//     direction; it must not dictate product behaviour. Enforced by
//     construction: this module never opens the brief.
//   - It does not claim to infer typography. A face cannot be identified
//     from pixels, so the profile says `unknown` and the spec must record
//     the type role as interpretation.
//   - It does not invent a layout. There is still no layout generator; the
//     template is authored. `templateOrigin` is reported per run so no
//     summary can upgrade that claim.
//
// Usage:
//   node engine/reference_profile.mjs <image> [--out <dir>] [--draft] [--json]
//   node engine/reference_profile.mjs --check <runDir>     (verifies the run's
//        chosen direction matches what the profile recommends)
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseColor, relativeLuminance } from './lib/color.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ARCHETYPES = JSON.parse(readFileSync(join(HERE, 'archetypes.json'), 'utf8')).archetypes;

// ---- measurement ---------------------------------------------------------

export function measureImage(imagePath, clusters = 8) {
  const py = join(HERE, 'analyze_image.py');
  let out;
  try {
    out = execFileSync('python3', [py, imagePath, String(clusters)], { encoding: 'utf8' });
  } catch (e) {
    throw new Error(
      `analyze_image.py failed for ${imagePath}.\n` +
      `  It needs Python 3 and Pillow (pip install -r requirements.txt).\n` +
      `  Underlying: ${String(e.stderr || e.message).split('\n')[0]}`
    );
  }
  return JSON.parse(out);
}

// ---- derivation ----------------------------------------------------------
// Every threshold below is stated with the observation that motivated it, so
// the rules can be argued with rather than trusted. They were set to
// reproduce the two decisions the project already made correctly (R02 →
// committed-field, R15 → neutral-gallery) and then applied blind to R12.

const REGIME = {
  // A reference that gives >=25% of its pixels to saturated colour is
  // spending hue on FIELDS, not accents (R02: 30.35%).
  committed: 25,
  // Below 8% the hue is confined to actions and state (R15: 3.88%).
  neutral: 8,
};
const SINGLE_HUE = 45;   // >=45% of coloured pixels in one hue family (R02 47.5, R15 62.4, R12 97.6)
const LIGHT_GROUND = 40; // >=40% of pixels above luminance 0.7 reads as a light canvas

const hueName = (deg) => {
  if (deg === null || deg === undefined) return null;
  const names = [[20, 'red'], [45, 'orange'], [70, 'yellow'], [160, 'green'], [200, 'cyan'], [260, 'blue'], [320, 'violet'], [360, 'red']];
  for (const [max, name] of names) if (deg < max) return name;
  return 'red';
};

export function deriveProfile(m) {
  const clusters = m.clusters || [];
  const totalShare = clusters.reduce((s, c) => s + c.share_pct, 0) || 1;
  const lumOf = (hex) => { const c = parseColor(hex); return c ? relativeLuminance(c) : 0; };
  const weightedLum = clusters.reduce((s, c) => s + lumOf(c.hex) * c.share_pct, 0) / totalShare;
  const lightShare = clusters.filter(c => lumOf(c.hex) > 0.7).reduce((s, c) => s + c.share_pct, 0);
  const darkShare = clusters.filter(c => lumOf(c.hex) < 0.15).reduce((s, c) => s + c.share_pct, 0);

  const sat = m['sat_ge_0.25_pct'];
  const saturationRegime = sat >= REGIME.committed ? 'committed' : sat >= REGIME.neutral ? 'mixed' : 'neutral';
  const hueShare = m.hue_family_share_of_coloured_pct;
  const hueDiscipline = hueShare >= SINGLE_HUE ? 'single-hue' : 'multi-hue';
  const groundValue = lightShare >= LIGHT_GROUND ? 'light' : lightShare >= 15 ? 'mid' : 'dark';

  // The most saturated cluster is the brand-hue candidate; the most common
  // near-white is the ground candidate; the darkest is the ink candidate.
  const satOf = (hex) => {
    const c = parseColor(hex); if (!c) return 0;
    const mx = Math.max(c.r, c.g, c.b), mn = Math.min(c.r, c.g, c.b);
    return mx === 0 ? 0 : (mx - mn) / mx;
  };
  const brandCluster = [...clusters].sort((a, b) => (satOf(b.hex) * b.share_pct) - (satOf(a.hex) * a.share_pct))[0] || null;
  const groundCluster = [...clusters].filter(c => lumOf(c.hex) > 0.7).sort((a, b) => b.share_pct - a.share_pct)[0] || null;
  const inkCluster = [...clusters].sort((a, b) => lumOf(a.hex) - lumOf(b.hex))[0] || null;

  return {
    measured: {
      'sat_ge_0.25_pct': sat,
      'sat_ge_0.03_pct': m['sat_ge_0.03_pct'],
      modal_hue_bin_deg: m.modal_hue_bin_deg,
      modal_hue_name: hueName(m.modal_hue_bin_deg),
      hue_family_share_of_coloured_pct: hueShare,
      weighted_luminance: Math.round(weightedLum * 1000) / 1000,
      light_pixel_share_pct: Math.round(lightShare * 10) / 10,
      dark_pixel_share_pct: Math.round(darkShare * 10) / 10,
      clusters,
      sampled_px: m.sampled_px,
    },
    derived: {
      saturationRegime: { value: saturationRegime, evidence: `sat>=0.25 = ${sat}% (committed>=${REGIME.committed}, neutral<${REGIME.neutral})`, tag: 'interpreted' },
      hueDiscipline: { value: hueDiscipline, evidence: `${hueShare}% of coloured pixels in the modal hue family (single-hue>=${SINGLE_HUE}%)`, tag: 'interpreted' },
      groundValue: { value: groundValue, evidence: `${Math.round(lightShare * 10) / 10}% of pixels above luminance 0.7 (light>=${LIGHT_GROUND}%)`, tag: 'interpreted' },
      colourAllocation: {
        value: {
          brand_share_pct: sat,
          neutral_share_pct: Math.round((100 - m['sat_ge_0.03_pct']) * 10) / 10,
        },
        evidence: 'saturated share vs near-neutral share of sampled pixels',
        tag: 'measured',
      },
      typography: {
        value: 'unknown',
        evidence: 'A typeface cannot be identified from pixels. Record the type ROLE (serif/sans, display/UI) in design-spec.json as interpretation.',
        tag: 'unknown',
      },
      density: {
        value: 'requires interpretation',
        evidence: 'A single presentation board does not reliably yield information density; it is a per-screen judgement. Record it in the spec.',
        tag: 'unknown',
      },
    },
    paletteCandidates: {
      note: 'Cluster centres over a board that includes photography and presentation background. Flat UI fields in the reference sit in a band around these, not exactly on them.',
      brand: brandCluster ? { hex: brandCluster.hex, share_pct: brandCluster.share_pct, basis: 'most saturated cluster weighted by share' } : null,
      ground: groundCluster ? { hex: groundCluster.hex, share_pct: groundCluster.share_pct, basis: 'most common cluster above luminance 0.7' } : null,
      ink: inkCluster ? { hex: inkCluster.hex, share_pct: inkCluster.share_pct, basis: 'darkest cluster' } : null,
    },
  };
}

// ---- archetype scoring ---------------------------------------------------

export function scoreArchetypes(profile) {
  const regime = profile.derived.saturationRegime.value;
  const hue = profile.derived.hueDiscipline.value;
  const ground = profile.derived.groundValue.value;

  const scores = {
    'committed-field': {
      score: 30 + (regime === 'committed' ? 50 : regime === 'mixed' ? 25 : 0) + (hue === 'single-hue' ? 15 : 0) + (ground === 'light' ? 5 : 0),
      reasons: [
        regime === 'committed'
          ? 'the reference commits its hue to large fields (saturation regime: committed)'
          : `the reference rations its hue (saturation regime: ${regime}) — a full field would overstate it`,
        hue === 'single-hue' ? 'one hue family dominates, so a committed field has a single colour to commit' : 'several hue families compete, so a single committed field would misrepresent the palette',
        ground === 'light' ? 'a light ground lets a committed field read as an accent plane rather than the whole app' : `ground reads ${ground}`,
      ],
    },
    'neutral-gallery': {
      score: 30 + (regime === 'neutral' ? 50 : regime === 'mixed' ? 40 : 10) + (ground === 'light' ? 15 : 0),
      reasons: [
        regime === 'neutral' || regime === 'mixed'
          ? `the reference keeps its ground quiet and delegates colour to actions and state (saturation regime: ${regime})`
          : 'the reference does commit its hue to fields, which this archetype would discard',
        ground === 'light' ? 'a light, near-neutral ground is the reference\'s own canvas' : `ground reads ${ground}`,
      ],
    },
    'dark-board': {
      score: 10 + (ground === 'dark' ? 70 : 0) + (regime === 'committed' ? 10 : 0),
      reasons: [
        ground === 'dark' ? 'the reference canvas is itself dark' : `the reference canvas reads ${ground}, so inverting it to dark would not be faithful`,
      ],
    },
  };

  const ranked = Object.entries(scores)
    .map(([id, v]) => ({ id, ...v }))
    .sort((a, b) => b.score - a.score);

  return {
    recommended: ranked[0].id,
    ranked,
    note: 'Scores rank the archetypes against measured properties only. They do not know the brief, the product category, or the client. A human may override — and the override must be recorded in directions.json.',
  };
}

// ---- principles ----------------------------------------------------------

export function derivePrinciples(profile) {
  const d = profile.derived;
  const p = [];
  p.push({
    principle: d.saturationRegime.value === 'committed'
      ? 'Hue is a material, not a garnish: the reference gives a large share of its surface to one colour.'
      : 'Hue is rationed: colour is reserved for actions, selection and state; surfaces stay neutral.',
    basis: d.saturationRegime.evidence, tag: 'interpreted',
  });
  p.push({
    principle: d.hueDiscipline.value === 'single-hue'
      ? 'One hue family does all the accent work, so "this colour means tappable / current" is learnable in one screen.'
      : 'Several hue families share the accent work; the grammar for what each colour means must be written down.',
    basis: d.hueDiscipline.evidence, tag: 'interpreted',
  });
  p.push({
    principle: `Ground is ${d.groundValue.value}: hierarchy starts from a ${d.groundValue.value} canvas.`,
    basis: d.groundValue.evidence, tag: 'interpreted',
  });
  p.push({
    principle: 'Numeric and state grammar must be identical on every screen (prices, totals, timestamps, statuses).',
    basis: 'forensics/EXECUTIVE_FINDINGS.md — cross-screen numeric/grammar consistency', tag: 'interpreted',
  });
  return p;
}

// Patterns a reference may exhibit that must NOT be copied into an app.
export const NOT_TO_COPY = [
  'Marketing-only composition: a presentation board shows a hero and a few cards; it does not show empty, loading, error or long-list states. Those must be designed, not inferred.',
  'Missing application states: several reference kits ship zero error states and zero empty states. Their absence is a gap in the reference, not a design decision to honour.',
  'Photography as the quality carrier: if the reference leans on product photography, substituting illustrations caps the ceiling — declare the substitution instead of pretending it matches.',
  'Screenshot-specific artefacts: off-screen steppers, clipped frames and placeholder personas in the source board are not design intent.',
  'Layout copying: the reference shows one product\'s information architecture. Copying its layout imports its product decisions, which may contradict the brief.',
];

// ---- reporting -----------------------------------------------------------

export function formatReport(imagePath, profile, rec) {
  const L = [];
  L.push(`REFERENCE PROFILE — ${imagePath}`);
  L.push('');
  L.push('MEASURED');
  const m = profile.measured;
  L.push(`  saturated share (sat>=0.25): ${m['sat_ge_0.25_pct']}%`);
  L.push(`  coloured share (sat>=0.03):  ${m['sat_ge_0.03_pct']}%`);
  L.push(`  modal hue:                   ${m.modal_hue_bin_deg}deg (${m.modal_hue_name}), ${m.hue_family_share_of_coloured_pct}% of coloured pixels`);
  L.push(`  light pixels:                ${m.light_pixel_share_pct}%   dark pixels: ${m.dark_pixel_share_pct}%`);
  L.push(`  weighted luminance:          ${m.weighted_luminance}`);
  L.push('');
  L.push('DERIVED (interpreted, with evidence)');
  for (const [k, v] of Object.entries(profile.derived)) {
    L.push(`  ${k}: ${typeof v.value === 'object' ? JSON.stringify(v.value) : v.value}`);
    L.push(`    because ${v.evidence}   [${v.tag}]`);
  }
  L.push('');
  L.push('PALETTE CANDIDATES (draft — cluster centres, not flat UI colours)');
  for (const k of ['brand', 'ground', 'ink']) {
    const c = profile.paletteCandidates[k];
    L.push(`  ${k.padEnd(7)} ${c ? c.hex + '  (' + c.share_pct + '% of pixels; ' + c.basis + ')' : 'none'}`);
  }
  L.push('');
  L.push('ARCHETYPE SCORES');
  for (const r of rec.ranked) L.push(`  ${String(r.score).padStart(3)}  ${r.id}${r.id === rec.recommended ? '   <-- recommended' : ''}`);
  L.push('');
  L.push(`RECOMMENDED DIRECTION: ${rec.recommended}`);
  for (const reason of rec.ranked[0].reasons) L.push(`  - ${reason}`);
  L.push('');
  L.push('PATTERNS NOT TO COPY');
  for (const n of NOT_TO_COPY) L.push('  - ' + n);
  return L.join('\n');
}

// ---- CLI -----------------------------------------------------------------
const isMain = process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url));
if (isMain) {
  const argv = process.argv.slice(2);
  const checkIdx = argv.indexOf('--check');
  const outIdx = argv.indexOf('--out');

  if (checkIdx !== -1) {
    // Verify a run's recorded direction against what the profile recommends.
    const runDir = argv[checkIdx + 1];
    if (!runDir) { console.error('usage: reference_profile.mjs --check <runDir>'); process.exit(2); }
    const spec = JSON.parse(readFileSync(join(runDir, 'design-spec.json'), 'utf8'));
    const dirs = JSON.parse(readFileSync(join(runDir, 'directions.json'), 'utf8'));
    const profPath = join(runDir, 'reference-profile.json');
    let profile;
    if (existsSync(profPath)) {
      profile = JSON.parse(readFileSync(profPath, 'utf8')).profile;
    } else {
      const imgIdx = argv.indexOf('--image');
      const imagePath = imgIdx === -1 ? null : argv[imgIdx + 1];
      if (!imagePath) {
        console.error(`reference_profile: ${runDir} has no reference-profile.json.\n  Run: node engine/reference_profile.mjs <image> --out ${runDir}`);
        process.exit(1);
      }
      profile = deriveProfile(measureImage(imagePath));
    }
    const rec = scoreArchetypes(profile);
    const chosen = dirs.selection && dirs.selection.id;
    const agree = chosen === rec.recommended;
    console.log(`run:          ${runDir}`);
    console.log(`reference:    ${spec.reference}`);
    console.log(`recommended:  ${rec.recommended} (score ${rec.ranked[0].score})`);
    console.log(`chosen:       ${chosen}${agree ? '  AGREE' : '  DIFFERS'}`);
    if (!agree) {
      console.log('  The run chose a different archetype. That is allowed — but the rationale in');
      console.log('  directions.json must explain why the profile\'s recommendation was overridden.');
    }
    process.exit(agree ? 0 : 3);
  }

  const imagePath = argv[0];
  if (!imagePath) {
    console.error('usage: node engine/reference_profile.mjs <image> [--out <dir>] [--draft] [--json]');
    console.error('       node engine/reference_profile.mjs --check <runDir> [--image <img>]');
    process.exit(2);
  }
  const measured = measureImage(imagePath);
  const profile = deriveProfile(measured);
  const rec = scoreArchetypes(profile);
  const principles = derivePrinciples(profile);

  if (argv.includes('--json')) {
    console.log(JSON.stringify({ image: imagePath, profile, recommendation: rec, principles, notToCopy: NOT_TO_COPY }, null, 2));
  } else {
    console.log(formatReport(imagePath, profile, rec));
  }

  if (outIdx !== -1) {
    const outDir = argv[outIdx + 1];
    mkdirSync(outDir, { recursive: true });
    writeFileSync(join(outDir, 'reference-profile.json'), JSON.stringify({
      image: imagePath, profile, recommendation: rec, principles, notToCopy: NOT_TO_COPY,
      note: 'Derived by engine/reference_profile.mjs. `measured` values come from analyze_image.py; `derived` values are interpretations and say what evidence produced them.',
    }, null, 2));
    console.log(`\nwrote ${join(outDir, 'reference-profile.json')}`);

    if (argv.includes('--draft')) {
      const cand = profile.paletteCandidates;
      const draft = {
        _draft: true,
        _note: 'DRAFT palette scaffold. Cluster centres are not flat UI colours — a human must confirm each role and record typography, composition and grammar by hand. Everything here is a starting point, not a design.',
        family: null,
        reference: imagePath,
        palette: {
          brand: cand.brand?.hex ?? null,
          brandDeep: cand.ink?.hex ?? null,
          ground: cand.ground?.hex ?? null,
          surface: '#FFFFFF',
          board: cand.ink?.hex ?? null,
          ink: cand.ink?.hex ?? null,
          inkSoft: null,
          tint: null,
          error: null,
        },
        typography: { scalePx: null, displayRole: 'REQUIRES INTERPRETATION — a face cannot be identified from pixels', uiRole: 'REQUIRES INTERPRETATION' },
        shape: { sheetRadius: null, cardRadius: null, controlRadius: null, addBtn: null },
        composition: { home: null, detail: null, density: null },
        grammar: { cta: null, selection: null, numbers: null, errors: null },
        provenance: {
          measured: profile.measured,
          interpreted: 'Fill in; keep this file honest about which claims are measurements and which are judgements.',
          uncertainty: ['Every palette value is a cluster centre over a board including photography and presentation background.'],
        },
        specVersion: 1,
      };
      writeFileSync(join(outDir, 'design-spec.draft.json'), JSON.stringify(draft, null, 2));
      console.log(`wrote ${join(outDir, 'design-spec.draft.json')} (draft — not a finished spec)`);
    }
  }
}
