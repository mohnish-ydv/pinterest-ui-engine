// capability.test.mjs — unit and negative tests for the capability layer.
//
// Mission 024 requires unit, integration and negative tests for each new
// semantic capability. These are the unit/negative half; semantic.test.mjs
// covers the rendered half.
//
// Usage: node engine/tests/capability.test.mjs
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CAPABILITIES, UNSUPPORTED, COLLECTION_RENDERS, resolveCapability, renderedRoles } from '../capability/registry.mjs';
import { buildLedger, summarise } from '../capability/ledger.mjs';
import { preflight, implementedComponents } from '../capability/preflight.mjs';
import { declaredStates } from '../capability/states.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..', '..', '..');
const RUNTIME = join(HERE, '..', 'runtime', 'runtime.js');
const CASES = join(ROOT, 'bench', 'cases');

const results = [];
const check = (name, ok, detail = '') => {
  results.push(ok);
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`);
};

const impl = implementedComponents(RUNTIME);
const caseDirs = readdirSync(CASES).filter(d => existsSync(join(CASES, d, 'brief.json')));
const briefs = {};
for (const c of caseDirs) briefs[c] = JSON.parse(readFileSync(join(CASES, c, 'brief.json'), 'utf8'));

// ---- registry integrity -------------------------------------------------
check('registry: every declared capability names a component the runtime implements',
  CAPABILITIES.every(c => !c.component || impl.includes(c.component)),
  CAPABILITIES.filter(c => c.component && !impl.includes(c.component)).map(c => c.id).join(', ') || 'all present');

check('registry: the four Mission 024 gaps are closed',
  ['metric-row', 'data-table', 'article', 'step-flow'].every(c => impl.includes(c)),
  `runtime implements ${impl.length} components`);

check('registry: gaps are resolved by a component, not by wishful thinking',
  UNSUPPORTED.every(u => typeof u.resolvedBy === 'string' && u.resolvedBy.length > 0));

check('registry: resolveCapability reports unsupported when the component is absent',
  resolveCapability('aggregates', ['app-header']).supported === false);

check('registry: resolveCapability reports supported when the component is present',
  resolveCapability('aggregates', ['metric-row']).supported === true);

check('registry: rendered roles are declared per collection variant',
  renderedRoles('row').includes('price') && renderedRoles('card').includes('stat'));

// ---- ledger -------------------------------------------------------------
const ledgers = {};
for (const c of caseDirs) ledgers[c] = buildLedger(c, briefs[c]);

check('ledger: every case produces requirements', caseDirs.every(c => ledgers[c].requirements.length > 0),
  caseDirs.map(c => `${c}=${ledgers[c].requirements.length}`).join(' '));

const CATS = ['content', 'layout', 'interaction', 'navigation', 'responsive', 'accessibility'];
check('ledger: every requirement has a valid category',
  caseDirs.every(c => ledgers[c].requirements.every(r => CATS.includes(r.category))));

check('ledger: every requirement id is unique within its case',
  caseDirs.every(c => new Set(ledgers[c].requirements.map(r => r.id)).size === ledgers[c].requirements.length));

check('ledger: every requirement declares how it will be verified',
  caseDirs.every(c => ledgers[c].requirements.every(r => r.verification && r.verification.method)));

check('ledger: content requirements cover every visible field role',
  ledgers['a-pulse'].requirements.some(r => /C-revenue-list/.test(r.id)) &&
  ledgers['e-marginalia'].requirements.some(r => /C-readTime-list/.test(r.id)));

check('ledger: the dashboard case has a list requirement for revenue (the M023 failure)',
  ledgers['a-pulse'].requirements.find(r => /C-revenue-list/.test(r.id))?.required === true);

// ---- preflight ----------------------------------------------------------
const pf = {};
for (const c of caseDirs) pf[c] = preflight(c, briefs[c], { implementedComponents: impl });

check('preflight: all five frozen briefs now proceed',
  caseDirs.every(c => pf[c].decision === 'proceed'),
  caseDirs.map(c => `${c}=${pf[c].decision}`).join(' '));

check('preflight: the denominator is the whole ledger',
  caseDirs.every(c => pf[c].counts.supported + pf[c].counts.disclosed + pf[c].counts.unsupported === pf[c].summary.total));

// negative: an under-powered engine must STOP on the same brief
{
  const crippled = impl.filter(x => x !== 'entity-collection');
  const p = preflight('a-pulse', briefs['a-pulse'], { implementedComponents: crippled });
  check('preflight NEGATIVE: a runtime without the collection component stops the build',
    p.decision === 'stop' && p.unsupported.length > 0, `${p.unsupported.length} unsupported`);
}

// negative: a brief declaring a capability with no implementation
{
  const brief = JSON.parse(JSON.stringify(briefs['a-pulse']));
  brief.aggregates = [{ id: 'x', label: 'X', op: 'sum', field: 'sessions' }];
  const noMetrics = impl.filter(x => x !== 'metric-row');
  const p = preflight('a-pulse', brief, { implementedComponents: noMetrics });
  check('preflight NEGATIVE: aggregates with no metric-row is unsupported, not silently dropped',
    p.decision === 'stop' && p.unsupported.some(u => /L-aggregates/.test(u.id)),
    p.unsupported.map(u => u.id).join(', '));
}

// negative: a declared time-range control
{
  const brief = JSON.parse(JSON.stringify(briefs['a-pulse']));
  brief.ranges = [{ id: '7d' }, { id: '30d' }, { id: '90d' }];
  const p = preflight('a-pulse', brief, { implementedComponents: impl });
  check('preflight NEGATIVE: an unimplemented time-range control is reported',
    p.decision === 'stop' && p.unsupported.some(u => /L-ranges/.test(u.id)),
    p.unsupported.map(u => u.id).join(', '));
  check('preflight: the refusal names a cause, not just a code',
    /time-range|date dimension/i.test(p.unsupported.find(u => /L-ranges/.test(u.id))?.limitation || ''));
}

// positive: v3 briefs that declare the capabilities proceed
for (const c of ['a-pulse', 'd-ledger', 'e-marginalia']) {
  const v3 = JSON.parse(readFileSync(join(CASES, c, 'v3', 'brief.json'), 'utf8'));
  const p = preflight(c, v3, { implementedComponents: impl });
  check(`preflight: ${c} v3 declares capabilities it can now satisfy`,
    p.decision === 'proceed' || (p.decision === 'stop' && p.unsupported.every(u => /L-ranges/.test(u.id))),
    `${p.decision}, unsupported=${p.unsupported.map(u => u.id).join(',') || 'none'}`);
}

// ---- declared states ----------------------------------------------------
for (const c of ['a-pulse', 'd-ledger', 'e-marginalia']) {
  const layoutPath = join(CASES, c, 'v3', 'layout.json');
  if (!existsSync(layoutPath)) continue;
  const ir = JSON.parse(readFileSync(layoutPath, 'utf8'));
  const st = declaredStates(ir);
  check(`states: ${c} v3 declares reachable states with expectations`,
    st.length > 0 && st.every(s => !!s.expect), `${st.length} states`);
}
{
  const ir = JSON.parse(readFileSync(join(CASES, 'd-ledger', 'v3', 'layout.json'), 'utf8'));
  const st = declaredStates(ir);
  check('states: a stepped flow declares one state per step',
    [1, 2, 3].every(i => st.some(s => s.id === `steps:step-${i}`)),
    st.filter(s => /^steps:/.test(s.id)).map(s => s.id).join(', '));
}

const passed = results.filter(Boolean).length;
console.log(`RESULT ${passed}/${results.length}`);
process.exit(passed === results.length ? 0 : 1);
