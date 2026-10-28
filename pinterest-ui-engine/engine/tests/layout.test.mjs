// layout.test.mjs — pure tests for the layout planner, IR and derived gates.
//
// MISSION 021. These are the tests that keep "generation" honest: they check
// that the planner makes the decisions it claims to make, that the IR is
// self-consistent and deterministic, and — most importantly — that the
// planner cannot emit a component the runtime does not implement.
//
// No browser required. Usage: node engine/tests/layout.test.mjs
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { planApp, planNavigation, densityFromProfile, validateIR, PLANNER_VERSION } from '../layout/plan.mjs';
import { planTestplan, planInspectContract, availabilityStates } from '../layout/gates.mjs';
import { buildModel } from '../layout/compile.mjs';
import { deriveBrief } from '../intake/derive.mjs';
import { validateContract } from '../lib/contract.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ENGINE = join(HERE, '..');
const ROOT = join(ENGINE, '..', '..');

const results = [];
const check = (name, ok, detail = '') => {
  results.push(ok);
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`);
};

const loadRun = (run) => ({
  brief: JSON.parse(readFileSync(join(ENGINE, '..', 'runs', run, 'brief.json'), 'utf8')),
  profile: existsSync(join(ENGINE, '..', 'runs', run, 'reference-profile.json'))
    ? JSON.parse(readFileSync(join(ENGINE, '..', 'runs', run, 'reference-profile.json'), 'utf8')).profile
    : null,
});

const stay = loadRun('staynest');
const care = loadRun('carepoint-gen');          // M021 artifact: 3 records, no availability
const careFull = loadRun('carepoint-ir');       // M022: full interaction contract

// ---- density rule --------------------------------------------------------
{
  const compact = densityFromProfile({ measured: { 'light_pixel_share_pct': 53.4, 'sat_ge_0.25_pct': 30.35 } });
  const airy = densityFromProfile({ measured: { 'light_pixel_share_pct': 86.1, 'sat_ge_0.25_pct': 3.88 } });
  const mid = densityFromProfile({ measured: { 'light_pixel_share_pct': 57.2, 'sat_ge_0.25_pct': 15.03 } });
  check('density: a colour-committed board reads compact', compact.density === 'compact', compact.basis);
  check('density: a near-white board reads airy', airy.density === 'airy', airy.basis);
  check('density: a mid board reads comfortable', mid.density === 'comfortable', mid.basis);
  check('density: every verdict states its basis', [compact, airy, mid].every(d => typeof d.basis === 'string' && d.basis.length > 10));
  check('density: no profile falls back explicitly', densityFromProfile(null).basis.includes('no reference profile'));
}

// ---- navigation rule -----------------------------------------------------
{
  const two = planNavigation({ views: ['browse', 'saved'] });
  const one = planNavigation({ views: ['browse'] });
  check('navigation: two destinations get a tab bar', two.pattern === 'tabbar' && two.items.length === 2);
  check('navigation: one destination gets a header-only shell', one.pattern === 'header-only' && one.items.length === 0);
  check('navigation: the choice states its reason', /destinations/.test(two.basis) && /one top-level/.test(one.basis));
}

// ---- planning the two real briefs ---------------------------------------
let irStay, irCare, irCareFull;
try { irStay = planApp(stay.brief, stay.profile); } catch (e) { check('plan: StayNest brief plans', false, e.message); }
try { irCare = planApp(care.brief, care.profile); } catch (e) { check('plan: CarePoint brief plans', false, e.message); }
try { irCareFull = planApp(careFull.brief, careFull.profile); } catch (e) { check('plan: full CarePoint brief plans', false, e.message); }

if (irStay && irCare) {
  check('plan: StayNest plans 4 views', irStay.views.length === 4, irStay.views.map(v => v.id).join(','));
  check('plan: CarePoint plans 3 views (no saved collection)', irCare.views.length === 3, irCare.views.map(v => v.id).join(','));
  check('plan: the two briefs produce DIFFERENT navigation patterns',
    irStay.navigation.pattern === 'tabbar' && irCare.navigation.pattern === 'header-only');
  check('plan: a media entity gets a card collection',
    irStay.views[0].sections.find(s => s.component === 'entity-collection').variant === 'card');
  check('plan: a non-media entity gets a row collection',
    irCare.views[0].sections.find(s => s.component === 'entity-collection').variant === 'row');
  check('plan: a commit action adds options, form and a primary action to the detail view',
    ['option-grid', 'form-fields', 'primary-action'].every(c => irCare.views.find(v => v.id === 'detail').sections.some(s => s.component === c)));
  check('plan: the detail view is hidden from navigation', irCare.views.find(v => v.id === 'detail').hidden === true);
  check('plan: role-based field binding picks the title and price',
    irStay.views.find(v => v.id === 'detail').sections.find(s => s.component === 'record-header').binding.title === 'name' &&
    irStay.views.find(v => v.id === 'detail').sections.find(s => s.component === 'record-header').binding.price === 'price');
}

// ---- the IR is deterministic --------------------------------------------
if (irStay) {
  const again = planApp(stay.brief, stay.profile);
  check('IR: planning twice yields byte-identical output',
    JSON.stringify(irStay) === JSON.stringify(again));
  check('IR: carries its planner version and provenance',
    irStay.meta.plannerVersion === PLANNER_VERSION && Array.isArray(irStay.meta.generatedFrom));
  check('IR: declares a11y expectations', !!irStay.a11y && irStay.a11y.minTargetPx >= 44);
}

// ---- vocabulary integrity: the planner cannot emit what the runtime lacks -
{
  const runtimeSrc = readFileSync(join(ENGINE, 'runtime', 'runtime.js'), 'utf8');
  const implemented = [...runtimeSrc.matchAll(/R\['([a-z-]+)'\]\s*=/g)].map(m => m[1]);
  // include the Mission 024 cases: they are the ones that declare metric-row,
// data-table, article and step-flow
const v3irs = [];
for (const c of ['a-pulse', 'd-ledger', 'e-marginalia']) {
  const p = join(ROOT, 'bench', 'cases', c, 'v3', 'layout.json');
  if (existsSync(p)) { try { v3irs.push(JSON.parse(readFileSync(p, 'utf8'))); } catch (e) {} }
}
// M048: the vocabulary corpus must include a brief that declares the
// M039–M046 families (bag, promo, medallions, variants, reviews, wallet,
// profile, FAQ, notices). The old corpus (StayNest, CarePoint, three v3
// bench cases) predates all of them, so every one of those components
// read as "implemented but never used" and this suite sat at 40/41 from
// Mission 039 on. The fixture is a real product brief (the M046 Evira
// showcase); it is derived and planned here, by the engine itself, so
// the corpus is planner output — not a hand-written layout.
let irDeclared = null;
try {
  const product = JSON.parse(readFileSync(join(HERE, 'fixtures', 'declared-families.product-brief.json'), 'utf8'));
  irDeclared = planApp(deriveBrief(product, null), null);
} catch (e) { check('plan: declared-families fixture brief plans', false, e.message); }
const used = [...new Set([irStay, irCare, irCareFull, irDeclared, ...v3irs].filter(Boolean).flatMap(ir => ir.views.flatMap(v => v.sections.map(s => s.component))))];
  const missing = used.filter(c => !implemented.includes(c));
  check('vocabulary: every planned component is implemented by the runtime',
    missing.length === 0, missing.length ? 'missing: ' + missing.join(', ') : `${used.length} components, ${implemented.length} implemented`);
  const unused = implemented.filter(c => !used.includes(c));
  check('vocabulary: the runtime implements no component the planner never uses',
    unused.length === 0, unused.length ? 'unused: ' + unused.join(', ') : `${used.length} components, all used and all implemented`);
}

// ---- IR validation ------------------------------------------------------
{
  const bad = JSON.parse(JSON.stringify(irStay));
  bad.views[0].sections.push({ id: 'x', component: 'not-a-component', props: {} });
  let msg = '';
  try { validateIR(bad, stay.brief); } catch (e) { msg = e.message; }
  check('validateIR rejects an unknown component', /unknown component/.test(msg));

  const promise = JSON.parse(JSON.stringify(stay.brief));
  promise.functionalContract.testids = promise.functionalContract.testids.concat(['never-emitted-testid']);
  let msg2 = '';
  try { planApp(promise, stay.profile); } catch (e) { msg2 = e.message; }
  check('validateIR rejects a contract promising a testid nothing emits',
    /never-emitted-testid/.test(msg2), msg2.split('\n')[1] || '');

  let msg3 = '';
  try { planApp({ brand: 'x', tagline: 'y' }, null); } catch (e) { msg3 = e.message; }
  check('plan refuses a brief with no entity model', /brief\.entity is required/.test(msg3));
}

// ---- new interaction semantics: negative cases --------------------------
if (irCareFull) {
  const clone = (o) => JSON.parse(JSON.stringify(o));

  const badTransition = clone(irCareFull);
  badTransition.transitions.push({ id: 'x', from: 'nowhere', to: 'detail', trigger: 'open' });
  let m1 = '';
  try { validateIR(badTransition, careFull.brief); } catch (e) { m1 = e.message; }
  check('validateIR rejects a transition from an unknown view', /starts in unknown view "nowhere"/.test(m1));

  const noSlots = clone(irCareFull);
  noSlots.availability = Object.assign({}, noSlots.availability, { slots: [] });
  let m2 = '';
  try { validateIR(noSlots, careFull.brief); } catch (e) { m2 = e.message; }
  check('validateIR rejects availability with no slots', /availability\.slots must be a non-empty array/.test(m2));

  const badModulus = clone(irCareFull);
  badModulus.availability.rule = { kind: 'modulo', modulus: 0, remainder: 0, inputs: ['slotIndex'] };
  let m3 = '';
  try { validateIR(badModulus, careFull.brief); } catch (e) { m3 = e.message; }
  check('validateIR rejects a modulo rule with modulus 0', /modulus must be > 0/.test(m3));

  const badKind = clone(irCareFull);
  badKind.availability.rule = { kind: 'tarot', inputs: ['slotIndex'] };
  let m4 = '';
  try { validateIR(badKind, careFull.brief); } catch (e) { m4 = e.message; }
  check('validateIR rejects an unimplemented availability rule', /"tarot" is not implemented/.test(m4));

  const badInput = clone(irCareFull);
  badInput.availability.rule = { kind: 'modulo', modulus: 3, remainder: 0, inputs: ['moonPhase'] };
  let m5 = '';
  try { validateIR(badInput, careFull.brief); } catch (e) { m5 = e.message; }
  check('validateIR rejects an unsupported rule input', /unsupported input "moonPhase"/.test(m5));

  const badComp = clone(irCareFull);
  badComp.views.find(v => v.id === 'appointments').sections.push({ id: 'z', component: 'gantt-chart', props: {} });
  let m6 = '';
  try { validateIR(badComp, careFull.brief); } catch (e) { m6 = e.message; }
  check('validateIR rejects an unsupported component configuration', /unknown component "gantt-chart"/.test(m6));
}

// ---- the availability rule is the brief's data, not the engine's ---------
{
  const avA = { slots: ['a', 'b', 'c', 'd', 'e', 'f'], days: 5, rule: { kind: 'modulo', modulus: 3, remainder: 0, inputs: ['recordIndex', 'dayIndex', 'slotIndex'] } };
  const avB = { slots: ['a', 'b', 'c', 'd', 'e', 'f'], days: 5, rule: { kind: 'modulo', modulus: 4, remainder: 1, inputs: ['recordIndex', 'dayIndex', 'slotIndex'] } };
  const a = availabilityStates(avA, 0, 0, []);
  const b = availabilityStates(avB, 0, 0, []);
  check('availability: modulus 3 on day 0 takes 2 of 6 slots', a.filter(x => x.state === 'taken').length === 2, a.map(x => x.state).join(','));
  check('availability: modulus 4 on day 0 takes a different set', b.filter(x => x.state === 'taken').length === 2 && JSON.stringify(a) !== JSON.stringify(b), b.map(x => x.state).join(','));
  const blocked = availabilityStates(avB, 0, 0, ['a']);
  check('availability: a committed record blocks its slot', blocked.find(x => x.slot === 'a').state === 'taken');
  const none = availabilityStates({ slots: ['a', 'b'], days: 1, rule: { kind: 'none' } }, 0, 0, []);
  check('availability: rule "none" leaves every slot free', none.every(x => x.state === 'free'));
}

// ---- derived gates ------------------------------------------------------
if (irStay && irCare) {
  const mStay = buildModel(stay.brief, irStay, { color: { brand: '#4F46E5' } });
  const tp = planTestplan(stay.brief, irStay, mStay);
  const ids = tp.steps.map(s => s.id);
  check('testplan: ids are unique and ordered', new Set(ids).size === ids.length && ids[0] === 'T1');
  const filterStep = tp.steps.find(s => s.desc.includes('only') && s.act === 'count');
  check('testplan: filter expectation is computed from the records, not guessed',
    !!filterStep && filterStep.eq === 3, filterStep ? `expected ${filterStep.eq}` : 'missing');
  const searchStep = tp.steps.find(s => s.desc.startsWith('search yields'));
  check('testplan: search expectation is computed from the records', !!searchStep && searchStep.eq === 1, searchStep ? `expected ${searchStep.eq}` : 'missing');
  check('testplan: covers persistence across a reload', tp.steps.some(s => s.act === 'reload'));

  const ic = planInspectContract(stay.brief, irStay, mStay);
  const problems = validateContract(ic);
  check('inspect contract: satisfies the Mission 020 contract rules', problems.length === 0, problems.join('; '));
  const kinds = new Set(ic.steps.filter(s => s.measure).map(s => s.kind));
  check('inspect contract: measures error and post-action states', kinds.has('error') && kinds.has('post-action'), [...kinds].join(','));

  // A generated app and a hand-authored baseline can be held to one contract.
  const tpCare = planTestplan(care.brief, irCare, buildModel(care.brief, irCare, { color: { brand: '#2F6FDE' } }));
  check('testplan: a second, structurally different app gets a different plan',
    tpCare.steps.length !== tp.steps.length, `${tp.steps.length} vs ${tpCare.steps.length} checks`);
}

const passed = results.filter(Boolean).length;
console.log(`\nRESULT ${passed}/${results.length}`);
process.exit(passed === results.length ? 0 : 1);
