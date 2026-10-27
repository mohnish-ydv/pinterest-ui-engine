// unit.test.mjs — pure-logic tests for the engine. No browser required.
//
// Mission 020 added this suite because the engine had no unit tests at all:
// every existing test drove a browser, so the token gate, the family-config
// resolver, the contract validator and the reference profiler — the parts
// that decide things — were untested. They are also the parts that used to
// live in other projects.
//
// It also contains the P1.5 PARITY CHECK: the refactored compiler must
// reproduce the historical token values for the two existing families.
// Pre-existing design values may not drift; additions (error, warning,
// success, disabled, lineStrong, input) are expected and enumerated.
//
// Usage: node engine/tests/unit.test.mjs   (exit 0 iff all pass)
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseColor, contrastRatio, contrastOf, darkenHex } from '../lib/color.mjs';
import { gateTokens, derivePairs, REQUIRED_ROLES, AA_NORMAL } from '../lib/gate.mjs';
import { resolveColor, requireColor, validateFamily, normalizeFamily, displayStack, loadFamily } from '../lib/family.mjs';
import { validateContract } from '../lib/contract.mjs';
import { deriveProfile, scoreArchetypes } from '../reference_profile.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ENGINE = join(HERE, '..');
const ROOT = join(ENGINE, '..', '..');

const results = [];
const check = (name, ok, detail = '') => {
  results.push(ok);
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`);
};
const near = (a, b, tol) => Math.abs(a - b) <= tol;

// ---- colour maths --------------------------------------------------------
check('contrast anchors hold (21, 4.54, 4.48)',
  near(contrastOf('#000000', '#FFFFFF'), 21, 0.01) &&
  near(contrastOf('#767676', '#FFFFFF'), 4.54, 0.01) &&
  near(contrastOf('#777777', '#FFFFFF'), 4.48, 0.01));
check('darkenHex mixes toward black without inventing a hue',
  darkenHex('#C2410C', 0.2) === '#9b340a', darkenHex('#C2410C', 0.2));
check('parseColor rejects garbage rather than guessing', parseColor('chartreuse-ish') === null);

// ---- gate ----------------------------------------------------------------
const GOOD = {
  color: { ground: '#FAF4EE', surface: '#FFFFFF', ink: '#241417', inkSoft: '#6E5A5E', brand: '#8A1114', brandDeep: '#5F0B0E', tint: '#F8E7E2', line: '#EADBD4', error: '#A02026', board: '#2B1D20' },
  state: { cta: { bg: '#8A1114', fg: '#FFFFFF', hoverBg: '#5F0B0E' }, chipOn: { bg: '#8A1114', fg: '#FFFFFF' }, chipOff: { bg: '#FFFFFF', fg: '#241417' }, badge: { bg: '#F8E7E2', fg: '#5F0B0E' }, tabIdle: { fg: '#6E5A5E' }, tabActive: { fg: '#8A1114' } },
};
{
  const g = gateTokens(GOOD);
  check('gate passes a valid token set', g.ok === true, `${g.results.length} pairs`);
  check('gate covers error, hover and disabled classes',
    g.results.some(r => r.name.startsWith('error text')) && g.results.some(r => r.name === 'CTA hover'),
    g.results.map(r => r.name).join(', ').slice(0, 120));
  check('gate is derived from the tokens, not a fixed list', derivePairs(GOOD).length === g.results.length);
}
{
  const bad = JSON.parse(JSON.stringify(GOOD));
  bad.color.error = '#F0D9D9'; // pale pink on a cream ground
  const g = gateTokens(bad);
  check('gate FAILS a low-contrast error role', g.ok === false && g.failures.some(f => f.name.includes('error')),
    g.failures.map(f => `${f.name}=${f.ratio}`).join(', '));
}
{
  const missing = JSON.parse(JSON.stringify(GOOD));
  delete missing.color.error;
  const g = gateTokens(missing);
  check('gate reports a missing required role instead of skipping it',
    g.ok === false && g.missing.some(m => m.name.includes('error')));
  check('REQUIRED_ROLES includes error', REQUIRED_ROLES.includes('error'));
}
check('threshold is 4.5 and is not loosened for large text', AA_NORMAL === 4.5);

// ---- family config -------------------------------------------------------
{
  const spec = { palette: { brand: '#2F6FDE', tint: '#E4EDFB', error: '#C62F3B' } };
  check('resolveColor: hex literal', resolveColor('#EADBD4', spec, 'line', 'x') === '#EADBD4');
  check('resolveColor: "spec" reads the named palette role', resolveColor('spec', spec, 'error', 'x') === '#C62F3B');
  check('resolveColor: "palette:key" reads another role', resolveColor('palette:tint', spec, 'line', 'x') === '#E4EDFB');
  check('resolveColor: optional role absent returns null (not a guess)', resolveColor(null, spec, 'warning', 'x') === null);
  let msg = '';
  try { requireColor(null, spec, 'warning', 'semantic.warning'); } catch (e) { msg = e.message; }
  check('requireColor throws an actionable diagnostic when a role is absent',
    /MISSING SEMANTIC ROLE/.test(msg) && /design-spec\.json/.test(msg), msg.split('\n')[0]);
}
{
  const ok = normalizeFamily({ family: 't', typography: { displayStrategy: 'serif', displayStack: 'Georgia, serif' }, surfaces: { groundSource: 'spec' }, space: [4, 8, 12, 16], responsive: { breakpoint: 900 } });
  check('validateFamily accepts a well-formed family', validateFamily(ok).errors.length === 0);
  const badStrat = normalizeFamily({ family: 't', typography: { displayStrategy: 'comic' } });
  check('validateFamily rejects an unknown display strategy',
    validateFamily(badStrat).errors.some(e => /displayStrategy/.test(e)));
  const badGround = normalizeFamily({ family: 't', surfaces: { groundSource: 'nonsense' } });
  check('validateFamily rejects a bad groundSource',
    validateFamily(badGround).errors.some(e => /groundSource/.test(e)));
  check('displayStack: serif uses the serif stack',
    displayStack(normalizeFamily({ typography: { displayStrategy: 'serif', displayStack: 'Georgia' } })) === 'Georgia');
  check('displayStack: sans resolves to the UI stack (the CarePoint fix)',
    displayStack(normalizeFamily({ typography: { displayStrategy: 'sans', uiStack: 'Inter, sans-serif' } })) === 'Inter, sans-serif');
  const all = ['butcher', 'clinic', 'swiftgo'].every(f => {
    try { const { family } = loadFamily(null, f); return validateFamily(family).errors.length === 0; } catch { return false; }
  });
  check('all three shipped families load and validate', all);
}

// ---- inspect contract ----------------------------------------------------
{
  const base = { id: 'x', steps: [{ measure: 'a', kind: 'rest', selector: '#a' }, { measure: 'b', kind: 'post-action', selector: '#b' }, { axe: 'home' }] };
  check('contract without an error state is rejected',
    validateContract(base).some(e => /error/.test(e)));
  check('contract without an error state is accepted only with a declared waiver',
    validateContract({ ...base, errorStateWaiver: 'app has no error UI' }).length === 0);
  check('contract without a post-action state is rejected',
    validateContract({
      id: 'x', errorStateWaiver: 'no error UI',
      steps: [{ measure: 'a', kind: 'rest', selector: '#a' }, { axe: 'home' }],
    }).some(e => /post-action/.test(e)));
  check('measure without a kind is rejected',
    validateContract({ id: 'x', errorStateWaiver: 'x', steps: [{ measure: 'a', selector: '#a', kind: 'rest' }, { measure: 'b', selector: '#b' }, { axe: 'h' }] })
      .some(e => /has no kind/.test(e)));
}

// ---- reference profiler --------------------------------------------------
{
  const committed = deriveProfile({ 'sat_ge_0.25_pct': 30.35, 'sat_ge_0.03_pct': 90.56, modal_hue_bin_deg: 0, hue_family_share_of_coloured_pct: 47.5, sampled_px: 43200,
    clusters: [{ hex: '#F0F0F0', share_pct: 34 }, { hex: '#801010', share_pct: 30 }, { hex: '#2B1D20', share_pct: 10 }] });
  const neutral = deriveProfile({ 'sat_ge_0.25_pct': 3.88, 'sat_ge_0.03_pct': 14.27, modal_hue_bin_deg: 200, hue_family_share_of_coloured_pct: 62.4, sampled_px: 36240,
    clusters: [{ hex: '#F0F0F0', share_pct: 50 }, { hex: '#E0E0E0', share_pct: 32 }, { hex: '#3070D0', share_pct: 3 }] });
  check('profiler: R02-like metrics read as committed',
    committed.derived.saturationRegime.value === 'committed');
  check('profiler: R15-like metrics read as neutral',
    neutral.derived.saturationRegime.value === 'neutral');
  check('profiler recommends committed-field for the R02 profile',
    scoreArchetypes(committed).recommended === 'committed-field');
  check('profiler recommends neutral-gallery for the R15 profile',
    scoreArchetypes(neutral).recommended === 'neutral-gallery');
  check('profiler declares typography unknowable rather than guessing',
    committed.derived.typography.tag === 'unknown');
}

// ---- P1.5 PARITY: the historical token values must not drift -------------
{
  const EXPECTED_ADDITIONS = new Set([
    'meta.family', 'meta.familyConfig', 'color.onBrand', 'color.lineStrong', 'color.error',
    'color.warning', 'color.success', 'color.input', 'color.inputText',
    'borders.hairlineWidth', 'borders.stepperWidth', 'borders.focusRing.width',
    'borders.focusRing.offset', 'borders.focusRing.color',
    'responsive.breakpoint', 'responsive.mobile', 'responsive.desktop',
    'density.lineHeight', 'density.bodyScale',
    'state.disabled.bg', 'state.disabled.fg',
    'shadow.search', 'shadow.chip',
  ]);
  // The six values the refactor is SUPPOSED to change for the clinic family:
  // the four leaks plus the two cool shadows they implied.
  const CLINIC_INTENDED = new Set(['color.ground', 'color.line', 'font.display', 'shadow.card', 'shadow.sheet', 'state.stepper.line']);
  // Metadata, not design values: the run path and the compiler's declared inputs.
  const META_MAY_CHANGE = new Set(['meta.run', 'meta.generatedFrom']);

  const flat = (o, pre = '') => {
    const r = {};
    for (const [k, v] of Object.entries(o)) {
      const key = pre ? pre + '.' + k : k;
      if (v && typeof v === 'object' && !Array.isArray(v)) Object.assign(r, flat(v, key));
      else r[key] = JSON.stringify(v);
    }
    return r;
  };

  for (const [run, baseDir, intended] of [
    ['marble-meats', 'mission020/baseline-p017', new Set()],
    ['carepoint', 'mission020/baseline-p018', CLINIC_INTENDED],
  ]) {
    const oldT = flat(JSON.parse(readFileSync(join(ROOT, baseDir, 'tokens.json'), 'utf8')));
    const newT = flat(JSON.parse(readFileSync(join(ENGINE, '..', 'runs', run, 'tokens.json'), 'utf8')));
    const unexpected = [], expected = [];
    for (const k of Object.keys(oldT)) {
      if (!(k in newT)) { unexpected.push(k + ' removed'); continue; }
      if (oldT[k] === newT[k]) continue;
      if (intended.has(k)) expected.push(k);
      else if (META_MAY_CHANGE.has(k)) expected.push(k);
      else unexpected.push(`${k}: ${oldT[k]} -> ${newT[k]}`);
    }
    const unexplainedAdditions = Object.keys(newT).filter(k => !(k in oldT) && !EXPECTED_ADDITIONS.has(k));
    check(`parity: ${run} changed only the intended token values`,
      unexpected.length === 0 && unexplainedAdditions.length === 0,
      unexpected.length ? unexpected.join('; ')
        : (intended.size ? `intended changes: ${expected.filter(k => intended.has(k)).join(', ')}`
                         : 'no design value changed (metadata only)'));
  }
}

// ---- compiled artifacts still gate --------------------------------------
for (const run of ['marble-meats', 'carepoint', 'swiftgo']) {
  const p = join(ENGINE, '..', 'runs', run, 'tokens.json');
  if (!existsSync(p)) { check(`tokens: ${run} compiled`, false, 'tokens.json missing'); continue; }
  const g = gateTokens(JSON.parse(readFileSync(p, 'utf8')));
  check(`tokens: ${run} tokens.json passes the gate`, g.ok === true, `${g.results.length} pairs`);
}

const passed = results.filter(Boolean).length;
console.log(`RESULT ${passed}/${results.length}`);
process.exit(passed === results.length ? 0 : 1);
