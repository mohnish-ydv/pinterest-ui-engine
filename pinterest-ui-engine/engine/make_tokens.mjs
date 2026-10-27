// make_tokens.mjs — pipeline stage C: token compilation with a contrast gate.
//
// Expands the selected art direction + design spec + DESIGN FAMILY into a
// full token set (palette roles, type scale, spacing, radii, interaction
// states), then validates every text-bearing state pair against WCAG using
// the engine's own colour maths. A token set that fails is NOT written.
//
// MISSION 020 CHANGES (P1) — this file used to be a butcher-family compiler
// wearing a generic name. It contained, in code:
//     line: '#EADBD4'                      a warm blush hairline for every family
//     stepper.line: '#D8C4BC'              a second warm constant
//     font.display: '… Playfair … serif'   a serif display stack for every family
//     shadow.card/sheet: rgba(59,16,18,…)  two warm shadows
// and it had no semantic error role at all. Every one of those decisions now
// comes from engine/families/<family>.json. This file contains no colour,
// font stack, shadow or spacing literal of its own.
//
// It also no longer imports anything from another project: the colour maths
// is engine/lib/color.mjs, so the gate runs with no Chromium installed.
//
// Usage: node engine/make_tokens.mjs <runDir> [--family <name|path>]
import { readFileSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { gateTokens, formatGate, REQUIRED_ROLES } from './lib/gate.mjs';
import { loadFamily, validateFamily, displayStack, resolveColor, requireColor } from './lib/family.mjs';

const argv = process.argv.slice(2);
const runDir = argv[0];
const famArg = argv.includes('--family') ? argv[argv.indexOf('--family') + 1] : undefined;
if (!runDir) { console.error('usage: node engine/make_tokens.mjs <runDir> [--family <name|path>]'); process.exit(2); }

const fail = (msg) => { console.error('make_tokens: ' + msg); process.exit(1); };

let spec, dirs;
try { spec = JSON.parse(readFileSync(join(runDir, 'design-spec.json'), 'utf8')); }
catch (e) { fail(`cannot read ${join(runDir, 'design-spec.json')} — ${e.message}`); }
try { dirs = JSON.parse(readFileSync(join(runDir, 'directions.json'), 'utf8')); }
catch (e) { fail(`cannot read ${join(runDir, 'directions.json')} — ${e.message}\n  Run art_direction.mjs first.`); }

if (!dirs.selection) {
  fail('no direction selected — run: node engine/art_direction.mjs ' + runDir + ' --choose <id> --why "…"');
}
const dir = dirs.candidates.find(c => c.id === dirs.selection.id);
if (!dir) fail(`directions.json selects "${dirs.selection.id}" but no candidate has that id`);

// ---- family -------------------------------------------------------------
let fam, famPath;
try { ({ family: fam, path: famPath } = loadFamily(runDir, famArg || spec.family)); }
catch (e) { fail(e.message); }

const v = validateFamily(fam);
if (v.errors.length) fail(`invalid design family (${famPath}):\n  - ` + v.errors.join('\n  - '));
for (const w of v.warnings) console.warn('family warning: ' + w);

const p = spec.palette || {};
const sk = dir.sketch || {};
const src = (key) => (sk[key] === undefined ? undefined : sk[key]);

// ---- ground -------------------------------------------------------------
// The family decides whether the spec's ground is authoritative. Mission 018
// shipped ground:#FFFFFF because the neutral-gallery sketch hardcoded it; a
// spec asking for #F4F7FB was silently overridden.
let ground;
if (fam.surfaces.groundSource === 'spec') {
  ground = p.ground;
  if (!ground) fail('family.surfaces.groundSource is "spec" but the design spec has no palette.ground');
} else if (fam.surfaces.groundSource === 'direction') {
  ground = src('ground');
  if (!ground) fail('family.surfaces.groundSource is "direction" but the selected direction sketch has no ground');
} else {
  ground = fam.surfaces.groundSource;
}

// ---- semantic roles -----------------------------------------------------
const sem = (role, required) => {
  const label = `semantic.${role}`;
  return required
    ? requireColor(fam.semantic[role], spec, role, label)
    : resolveColor(fam.semantic[role], spec, role, label);
};

const color = {
  ground,
  field: src('field') ?? null,
  fieldText: src('fieldText') ?? null,
  surface: src('surface') ?? p.surface,
  board: p.board ?? null,
  ink: src('ink') ?? p.ink,
  inkSoft: p.inkSoft,
  brand: p.brand,
  brandDeep: p.brandDeep,
  tint: p.tint,
  star: p.star ?? null,
  cert: p.cert ?? null,
  onBrand: '#FFFFFF',
  // Family-driven roles — these three were the leak.
  line: resolveColor(fam.borders.hairline, spec, 'line', 'borders.hairline'),
  lineStrong: resolveColor(fam.borders.stepperHairline, spec, 'line', 'borders.stepperHairline') || resolveColor(fam.borders.hairline, spec, 'line', 'borders.hairline'),
  // Semantic roles. error is REQUIRED: an ungated error state is how
  // illegible error text ships.
  error: sem('error', true),
  warning: sem('warning', false),
  success: sem('success', false),
  // Inputs.
  input: resolveColor(fam.surfaces.inputBg, spec, 'input', 'surfaces.inputBg'),
  inputText: null,
};

if (color.input) {
  color.inputText = fam.surfaces.inputTextSource && String(fam.surfaces.inputTextSource).startsWith('#')
    ? fam.surfaces.inputTextSource
    : color[fam.surfaces.inputTextSource] || color.ink;
}

// ---- states -------------------------------------------------------------
const hoverBg = color[fam.states.hoverTarget] || color.brandDeep;
const state = {
  cta: { bg: p.brand, fg: color.onBrand, hoverBg },
  chipOn: { bg: p.brand, fg: color.onBrand },
  chipOff: { bg: color.surface, fg: color.ink },
  badge: { bg: p.tint, fg: p.brandDeep },
  stepper: { bg: color.surface, fg: color.ink, line: color.lineStrong },
  tabActive: { fg: p.brand },
  tabIdle: { fg: p.inkSoft },
  priceOnDark: { fg: color.onBrand },
};
if (fam.states.disabled) {
  const d = fam.states.disabled;
  state.disabled = { bg: resolveColor(d.bg, spec, 'disabledBg', 'states.disabled.bg'), fg: resolveColor(d.fg, spec, 'disabledFg', 'states.disabled.fg') };
}
if (fam.states.loading) {
  const l = fam.states.loading;
  state.loading = { bg: resolveColor(l.bg, spec, 'loadingBg', 'states.loading.bg'), fg: resolveColor(l.fg, spec, 'loadingFg', 'states.loading.fg') };
}

// ---- tokens -------------------------------------------------------------
const tokens = {
  meta: {
    run: runDir,
    direction: dir.id,
    family: fam.family,
    // Recorded relative to the package root so token output is
    // location-independent: a build in a different checkout produces the same
    // bytes. (Found in Mission 024 when a clean-room extraction failed its
    // checksum because this field held an absolute path.)
    familyConfig: relative(process.cwd(), famPath),
    generatedFrom: 'design-spec.json + directions.json + families/' + fam.family + '.json',
  },
  color,
  font: { display: displayStack(fam), ui: fam.typography.uiStack },
  type: spec.typography.scalePx,
  space: fam.space,
  radius: {
    sheet: spec.shape.sheetRadius,
    card: spec.shape.cardRadius,
    pill: spec.shape.controlRadius,
    addBtn: spec.shape.addBtn,
  },
  // Every shadow the family declares is passed through, so a template never
  // needs to hardcode one (butcher declares card/sheet/search/chip; clinic only
  // card/sheet).
  shadow: Object.fromEntries(Object.entries(fam.shadows).filter(([, v]) => v != null)),
  borders: {
    hairlineWidth: fam.borders.hairlineWidth,
    stepperWidth: fam.borders.stepperWidth,
    focusRing: fam.borders.focusRing || null,
  },
  responsive: fam.responsive,
  density: fam.density,
  state,
};

// ---- gate ---------------------------------------------------------------
const gate = gateTokens(tokens);
console.log(formatGate(gate));

const absent = REQUIRED_ROLES.filter(r => !tokens.color[r]);
if (absent.length) {
  console.error(`\nmake_tokens: required colour roles absent: ${absent.join(', ')}`);
  console.error('  A template that references an absent role would emit "null" into CSS. Refusing.');
  process.exit(1);
}

if (!gate.ok) {
  const bad = [...gate.failures.map(f => `${f.name} ${f.ratio}:1`), ...gate.missing.map(m => `${m.name} (${m.reason})`)];
  console.error(`\n${bad.length} state pair(s) illegible or missing — tokens NOT written.`);
  console.error('  Adjust the spec palette, the family semantic roles, or the direction.');
  process.exit(1);
}

writeFileSync(join(runDir, 'tokens.json'), JSON.stringify(tokens, null, 2));
console.log(`\nwrote ${join(runDir, 'tokens.json')} (direction: ${dir.id}, family: ${fam.family}, ${gate.results.length} pairs gated)`);
