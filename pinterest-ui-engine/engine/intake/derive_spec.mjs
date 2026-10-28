// derive_spec.mjs — a design spec from reference evidence, not from an author.
//
// MISSION 027. Every previous mission's cases shipped a hand-authored
// design-spec.json: a palette, a type scale and a shape language, chosen by
// whoever wrote the case. A product manager does not write that file, so
// shipping one with a "held-out" brief is leakage.
//
// This derives the spec from what the reference actually measures:
//   brand   <- the most saturated colour cluster
//   ground  <- the lightest cluster with meaningful share
//   ink     <- the darkest cluster
//   tint    <- brand mixed toward ground
// When there is no reference, a stated neutral default is used and labelled.
//
// The contrast gate still decides: if the derived palette cannot pass, the
// build refuses rather than shipping an unreadable app.

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { chooseDensity } from '../layout/density.mjs';
import { join } from 'node:path';

const hexToRgb = (h) => { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
const rgbToHex = (r) => '#' + r.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('').toUpperCase();
const lum = (c) => { const [r, g, b] = hexToRgb(c).map(v => { const s = v / 255; return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4); }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const sat = (c) => { const [r, g, b] = hexToRgb(c); const mx = Math.max(r, g, b), mn = Math.min(r, g, b); return mx === 0 ? 0 : (mx - mn) / mx; };
const mix = (a, b, t) => rgbToHex(hexToRgb(a).map((v, i) => v * (1 - t) + hexToRgb(b)[i] * t));
const darken = (c, t) => rgbToHex(hexToRgb(c).map(v => v * (1 - t)));

// ---------------------------------------------------------------------------
// MISSION 036: design worlds for reference-free briefs.
//
// Before this, every brief without a reference image received the SAME
// design: dark-teal brand #1F4E4A, warm-grey ground, system sans, one shape
// language. Three unrelated products came out as one product in three
// skeletons — the single largest source of the "generic AI" look, because
// identity is the first thing a reader sees.
//
// The references this engine learns from do the opposite: each product
// commits to a coherent world — Beefy's oxblood-and-cream serif world,
// Medica's clinical blue, Brewly's deep green, Fibo's warm orange. A world
// is a bundle of mutually consistent decisions (brand hue, ground
// temperature, ink temperature, type character, shape, rhythm), not an
// accent colour swapped onto a grey chassis.
//
// With no reference, the world is derived from the brief itself: the
// product's domain, its chosen composition and what its records are.
// These are archetypes, not templates — composition, layout and content
// still come from the brief; the archetype only decides the visual world
// they are rendered in. A stated product.family always wins.
const SERIF_DISPLAY = '"Iowan Old Style", "Palatino Linotype", Palatino, Georgia, "Times New Roman", serif';
const GROTESQUE = '-apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
const ARCHETYPES = {
  ledger: {
    why: 'operational product: quiet cool neutrals, a deep slate-blue brand, tight rhythm, small radii — the world of tools people use all day',
    brand: '#2B4C7E', ground: '#F6F7F9', ink: '#171A21',
    displayStrategy: 'sans', displayStack: null, displayPx: 0,
    shape: { sheetRadius: 12, cardRadius: 10, controlRadius: 999, addBtn: 34 },
    hairline: '#DFE3E8', inputBg: '#EEF1F4', lineHeight: 1.45,
    shadow: '0 3px 10px rgba(23,26,33,0.06)',
  },
  editorial: {
    why: 'content-led product: warm paper ground, serif display type, an oxblood accent used sparingly, print-like restraint with hairline rules instead of boxes',
    brand: '#7A1E1E', ground: '#FAF6EE', ink: '#1C1917',
    displayStrategy: 'serif', displayStack: SERIF_DISPLAY, displayPx: 32,
    shape: { sheetRadius: 8, cardRadius: 6, controlRadius: 999, addBtn: 34 },
    hairline: '#E7DECF', inputBg: '#F3ECDF', lineHeight: 1.6,
    shadow: '0 2px 8px rgba(28,25,23,0.05)',
  },
  market: {
    why: 'consumer product people browse and buy from: warm cream ground, a deep product-world brand, soft generous shapes and a display face with character',
    brand: '#8C2B1B', ground: '#FBF6EE', ink: '#211712',
    displayStrategy: 'serif', displayStack: SERIF_DISPLAY, displayPx: 30,
    shape: { sheetRadius: 20, cardRadius: 16, controlRadius: 999, addBtn: 36 },
    hairline: '#EBDFCE', inputBg: '#F5EDDF', lineHeight: 1.5,
    shadow: '0 8px 22px rgba(33,23,18,0.08)',
  },
  care: {
    why: 'health and care service: near-white blue-tinted ground, a clinical blue brand, calm spacing — the world the clinic family (from reference R15) already encodes',
    brand: '#2563C9', ground: '#F6F9FD', ink: '#152238',
    displayStrategy: 'sans', displayStack: null, displayPx: 0,
    shape: { sheetRadius: 16, cardRadius: 14, controlRadius: 999, addBtn: 34 },
    hairline: '#DCE6F2', inputBg: '#EDF2F9', lineHeight: 1.45,
    shadow: '0 4px 14px rgba(21,34,56,0.06)',
  },
  mono: {
    // M046: the Evira world, decoded screen by screen — white ground,
    // black as the only brand colour, a grotesque face, generous radii;
    // the photography carries every other colour on the screen.
    why: 'fashion and lifestyle commerce: a white ground, black as the only brand colour, grotesque type and generous radii — the product photography carries all the colour',
    brand: '#141414', ground: '#FFFFFF', ink: '#141414',
    displayStrategy: 'sans', displayStack: null, displayPx: 0,
    shape: { sheetRadius: 24, cardRadius: 18, controlRadius: 999, addBtn: 36 },
    hairline: '#ECECEC', inputBg: '#F4F4F4', lineHeight: 1.5,
    shadow: '0 8px 22px rgba(20,20,20,0.07)',
  },
  studio: {
    why: 'no stronger signal in the brief: a quiet petrol-and-paper default, deliberately neutral rather than the old universal teal',
    brand: '#2E4A5A', ground: '#F7F6F2', ink: '#191B1E',
    displayStrategy: 'sans', displayStack: null, displayPx: 0,
    shape: { sheetRadius: 16, cardRadius: 12, controlRadius: 999, addBtn: 34 },
    hairline: '#E4E2DB', inputBg: '#F0EFE9', lineHeight: 1.5,
    shadow: '0 6px 18px rgba(25,27,30,0.07)',
  },
};
export function pickArchetype(product, engineBrief) {
  const domain = String(product.domain || '').toLowerCase();
  const composition = engineBrief && engineBrief._derived ? String(engineBrief._derived.composition || '') : '';
  const text = [product.name || '', product.about || '', product.tagline || ''].join(' ').toLowerCase();
  const has = (words) => words.some(w => domain.includes(w) || text.includes(w));
  if (['publish', 'media', 'journal', 'magazine', 'editorial', 'blog', 'news', 'stories'].some(w => domain.includes(w)) || composition === 'index' || composition === 'editorial')
    return { id: 'editorial', ...ARCHETYPES.editorial };
  if (['health', 'clinic', 'medical', 'care', 'dental', 'therapy', 'physio', 'wellness'].some(w => domain.includes(w)) || has(['clinic', 'patients', 'doctor', 'therapy']))
    return { id: 'care', ...ARCHETYPES.care };
  if (['fashion', 'apparel', 'clothing', 'footwear', 'streetwear', 'boutique'].some(w => domain.includes(w)) || has(['fashion', 'apparel']))
    return { id: 'mono', ...ARCHETYPES.mono };
  if (['food', 'grocery', 'restaurant', 'bakery', 'cafe', 'retail', 'commerce', 'shop', 'store', 'marketplace'].some(w => domain.includes(w)) || composition === 'gallery')
    return { id: 'market', ...ARCHETYPES.market };
  if (['inventory', 'logistics', 'operations', 'finance', 'manufacturing', 'field', 'admin', 'saas', 'b2b', 'warehouse'].some(w => domain.includes(w)) || composition === 'table' || composition === 'dashboard')
    return { id: 'ledger', ...ARCHETYPES.ledger };
  return { id: 'studio', ...ARCHETYPES.studio };
}

export function deriveSpec(product, evidence, engineBrief) {
  const notes = [];
  let clusters = [];
  // M036: colour comes from the colour analyser (observed.colour), not
  // from structure.py's observed.clusters. The structural clusters are
  // computed on a 96px resize with steps of 24 for LAYOUT analysis; as a
  // colour source they systematically erase saturated accents, and this
  // branch used to prefer them — reference-guided runs came out grey
  // (#606078 for a blue clinic board) while the accurate measurement sat
  // unused in the same file.
  if (evidence && evidence.observed && evidence.observed.colour && evidence.observed.colour.topClusters) {
    clusters = evidence.observed.colour.topClusters.map(c => ({ hex: c.hex || c.colour, sharePct: c.sharePct || c.share_pct || 0 }));
  } else if (evidence && evidence.observed && evidence.observed.clusters) clusters = evidence.observed.clusters;

  let brand, ground, ink, source;
  // M036: the reference-free design world, derived from the brief (see
  // ARCHETYPES above). Reference-derived runs are untouched: a measured
  // palette always beats an archetype.
  const archetype = product.family ? null : pickArchetype(product, engineBrief);
  if (clusters.length >= 3) {
    const usable = clusters.filter(c => c.hex && c.hex !== '#FFFFFF' && c.hex !== '#000000');
    const bySat = [...usable].sort((a, b) => sat(b.hex) - sat(a.hex));
    const byLum = [...usable].sort((a, b) => lum(b.hex) - lum(a.hex));
    brand = bySat[0] && sat(bySat[0].hex) > 0.12 ? bySat[0].hex : '#1F4E4A';
    ground = byLum[0] && lum(byLum[0].hex) > 0.7 ? byLum[0].hex : '#FAFAF8';
    ink = byLum[byLum.length - 1] && lum(byLum[byLum.length - 1].hex) < 0.2 ? byLum[byLum.length - 1].hex : '#141414';
    source = `measured from ${clusters.length} reference clusters`;
    if (sat(brand) <= 0.12) notes.push('the reference is near-neutral, so the brand colour is a stated default rather than a measured accent');
    // the gate needs a readable pair; darken the brand until white text passes
    let guard = 0;
    while ((1.05 / (lum(brand) + 0.05)) < 4.6 && guard++ < 20) brand = darken(brand, 0.08);
    if (guard > 0) notes.push(`brand darkened ${guard} step(s) so white text meets 4.5:1`);
  } else if (archetype) {
    brand = archetype.brand; ground = archetype.ground; ink = archetype.ink;
    source = `no reference available — design world "${archetype.id}" derived from the brief`;
    notes.push(`design world: ${archetype.id} — ${archetype.why}`);
    let guard = 0;
    while ((1.05 / (lum(brand) + 0.05)) < 4.6 && guard++ < 20) brand = darken(brand, 0.08);
    if (guard > 0) notes.push(`brand darkened ${guard} step(s) so white text meets 4.5:1`);
  } else {
    brand = '#1F4E4A'; ground = '#FAFAF8'; ink = '#141414';
    source = 'no reference available — stated neutral default';
    notes.push('no reference image: palette is a default, not a measurement');
  }

  // The token gate is the specification, so the derivation must satisfy it.
  // A fixed mix toward the ground produced 4.0:1 on every case; walk the soft
  // ink back toward the ink until it clears 4.5:1 on both ground and surface.
  const ratio = (a, b) => { const la = lum(a), lb = lum(b); const hi = Math.max(la, lb), lo = Math.min(la, lb); return (hi + 0.05) / (lo + 0.05); };
  // The darkest cluster in a light board can still be a mid grey (R01 gave
  // #787878, 3.87:1). Body text must clear the gate, so walk the ink toward
  // black until it does — the palette is derived, the contrast rule is not.
  let inkSteps = 0;
  // Aim well past the 4.5:1 floor: secondary text is derived FROM the ink, and
  // a barely-passing ink leaves no headroom, so soft ink can never clear the
  // gate (found on N5, where the reference's darkest cluster was a mid grey).
  while (ratio(ink, ground) < 8.0 && inkSteps < 30) { ink = darken(ink, 0.10); inkSteps += 1; }
  if (inkSteps) notes.push(`ink darkened ${inkSteps} step(s) to clear 4.5:1 on the derived ground`);
  let inkSoft = mix(ink, ground, 0.45);
  let steps = 0;
  // Tint (brand mixed toward ground) is darker than the ground, so a soft
  // ink that clears the ground can still fail on tint — it measured 3.89:1
  // where a table header composed the two. The walk clears all three
  // grounds the CSS composes soft ink or its neighbours on.
  const tintPreview = mix(brand, ground, 0.88);
  while ((ratio(inkSoft, ground) < 4.6 || ratio(inkSoft, '#FFFFFF') < 4.6 || ratio(inkSoft, tintPreview) < 4.6) && steps < 20) {
    inkSoft = mix(inkSoft, '#000000', 0.10); steps += 1;
  }
  if (steps) notes.push(`soft ink darkened ${steps} step(s) to clear 4.5:1 (naive mix gave ${ratio(mix(ink, ground, 0.45), ground).toFixed(2)}:1)`);

  // The engine brief carries the composition, which the policy needs. It is
  // passed explicitly: an earlier version read it from a path that did not
  // exist, silently fell back to `compact`, and compressed every case to the
  // floor without saying so.
  const density = chooseDensity(engineBrief || null, { viewportWidth: 390 });

  const spec = {
    reference: evidence ? 'derived from reference evidence' : 'none',
    family: product.family || (archetype ? archetype.id : 'generic'),
    archetype: archetype ? archetype.id : null,
    _derived: {
      note: 'Generated by engine/intake/derive_spec.mjs. No human authored this palette.',
      source, notes,
      density: { mode: density.mode, rationale: density.rationale, floors: density.floors, clamped: density.clamped },
    },
    palette: {
      brand, brandDeep: darken(brand, 0.22), ground,
      surface: '#FFFFFF', board: darken(ink, 0.1), ink,
      inkSoft, tint: mix(brand, ground, 0.88),
      star: '#E8A33D', cert: '#1E5B3C', error: '#A32026',
    },
    typography: {
      displayRole: 'derived — no typeface identity can be recovered from a flat image',
      uiRole: 'grotesque; tabular numerals for money',
      // MISSION 034: display 28 -> 24. Measured against competent baselines,
      // the 28px page title pushed list content below the fold on utility
      // screens; every baseline used 24.
      // MISSION 035: the type scale comes from a documented density policy,
      // not from a global constant. See layout/density.mjs.
      scalePx: { body: density.scale.body, display: archetype && archetype.displayPx ? Math.max(density.scale.display, archetype.displayPx) : density.scale.display, section: density.scale.section,
                 small: density.scale.small, amount: density.scale.amount },
    },
    shape: archetype ? archetype.shape : { sheetRadius: 16, cardRadius: 12, controlRadius: 999, addBtn: 34 },
    composition: { home: 'derived', detail: 'derived', density: 'derived from the reference density class' },
    grammar: { cta: 'derived', selection: 'derived', numbers: 'derived', errors: 'derived', tabs: 'derived' },
    imagery: { role: product.collection && product.collection.media ? 'photographic — substituted with a brand-derived gradient offline' : 'None.' },
    provenance: { measured: source, interpreted: 'typography and shape are defaults, not measurements', uncertainty: ['No typeface identity, spacing scale or interaction state can be recovered from a static board.'] },
    specVersion: 1,
  };
  return spec;
}

export function deriveFamily(product, engineBrief) {
  const shell = {
    borders: { hairlineWidth: '1px', stepperWidth: '1.5px',
      focusRing: { width: '3px', offset: '2px', color: 'brand' } },
    surfaces: { groundSource: 'spec', inputTextSource: 'ink' },
    semantic: { error: 'spec', warning: null, success: 'palette:cert' },
    space: [4, 8, 12, 16, 20, 24, 32],
    responsive: { breakpoint: 900, mobile: 'single column', desktop: 'multi-column, tab bar hidden' },
  };
  if (product.family) {
    return { $schema: 'design-family/1', ...shell, family: product.family,
      description: 'Generic family: the reference cannot supply a typeface, so the system stack is used.',
      typography: { displayStrategy: 'sans', displayStack: null, uiStack: GROTESQUE, displayRoleNote: 'role only' },
      borders: { ...shell.borders, hairline: '#E6E4E0', stepperHairline: '#E6E4E0' },
      shadows: { card: '0 6px 18px rgba(20,20,20,0.07)', sheet: '0 -12px 32px rgba(20,20,20,0.10)' },
      surfaces: { ...shell.surfaces, inputBg: '#F4F2EE' },
      states: { hoverTarget: 'brandDeep', disabled: { bg: '#EFEDE9', fg: '#6B6B6B' } },
      density: { lineHeight: 1.5, bodyScale: 1 } };
  }
  // M036: with no stated family, the family IS the design world (see
  // ARCHETYPES). Hairlines, inputs, shadows and rhythm take the world's
  // own temperature instead of one universal warm grey.
  const a = pickArchetype(product, engineBrief);
  const inkRgb = a.ink.match(/\w\w/g).map(h => parseInt(h, 16));
  return { $schema: 'design-family/1', ...shell, family: a.id,
    description: `Design world "${a.id}", derived from the brief: ${a.why}.`,
    typography: { displayStrategy: a.displayStrategy, displayStack: a.displayStack, uiStack: GROTESQUE,
      displayRoleNote: a.displayStrategy === 'serif' ? 'serif display for headings; grotesque for UI' : 'grotesque throughout; hierarchy by weight and scale' },
    borders: { ...shell.borders, hairline: a.hairline, stepperHairline: a.hairline },
    shadows: { card: a.shadow, sheet: `0 -12px 32px rgba(${inkRgb[0]},${inkRgb[1]},${inkRgb[2]},0.10)` },
    surfaces: { ...shell.surfaces, inputBg: a.inputBg },
    states: { hoverTarget: 'brandDeep', disabled: { bg: a.inputBg, fg: '#6B6B6B' } },
    density: { lineHeight: a.lineHeight, bodyScale: 1 } };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const dir = process.argv[2];
  if (!dir) { console.error('usage: node derive_spec.mjs <caseDir>'); process.exit(2); }
  const product = JSON.parse(readFileSync(join(dir, 'product-brief.json'), 'utf8'));
  const evPath = join(dir, 'reference-evidence.json');
  const evidence = existsSync(evPath) ? JSON.parse(readFileSync(evPath, 'utf8')) : null;
  const briefPath = join(dir, 'brief.json');
  const engineBrief = existsSync(briefPath) ? JSON.parse(readFileSync(briefPath, 'utf8')) : null;
  const spec = deriveSpec(product, evidence, engineBrief);
  writeFileSync(join(dir, 'design-spec.json'), JSON.stringify(spec, null, 2) + '\n');
  writeFileSync(join(dir, 'family.json'), JSON.stringify(deriveFamily(product, engineBrief), null, 2) + '\n');
  console.log(`derive_spec: ${spec.palette.brand} on ${spec.palette.ground} — ${spec._derived.source}; density ${spec._derived.density.mode} (display ${spec.typography.scalePx.display}px)`);
  for (const n of spec._derived.notes) console.log(`  ! ${n}`);
}
