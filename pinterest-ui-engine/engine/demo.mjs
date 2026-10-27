// demo.mjs — the ONE end-to-end command.
//
// Mission 020 (P0.3). The handoff required six separate npm scripts plus a
// hand-written inspector invocation, and nothing tied them together or told
// you whether the whole thing was healthy. This runs the supported workflow
// and prints one summary: generate → functional suites → unit suites →
// rendered inspection, for every design family in the repo.
//
// It exits non-zero if any stage fails, so it is usable as a gate.
//
// Usage: npm run demo            (or: node engine/demo.mjs [--quiet])
import { spawnSync } from 'node:child_process';
import { readFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..', '..');
const OUT = join(ROOT, 'demo-out');
const QUIET = process.argv.includes('--quiet');

// Hand-authored template runs (Missions 017-020)
const RUNS = [
  { run: 'marble-meats', template: 'butcher', suite: 'app.test.mjs' },
  { run: 'carepoint', template: 'clinic', suite: 'clinic.test.mjs' },
  { run: 'swiftgo', template: 'swiftgo', suite: 'parcel.test.mjs' },
];

const stages = [];
const record = (name, ok, detail) => {
  stages.push({ name, ok, detail });
  if (!QUIET) console.log(`  ${ok ? 'ok  ' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`);
};

const node = (args, opts = {}) => spawnSync(process.execPath, args, { encoding: 'utf8', cwd: ROOT, ...opts });

console.log('SwiftGo / Pinterest UI Engine — end-to-end demo\n');

// ---- 1. environment ------------------------------------------------------
console.log('1. environment');
{
  const r = node([join(HERE, 'verify_env.mjs')]);
  const last = (r.stdout || '').trim().split('\n').pop();
  record('verify_env', r.status === 0, last);
  if (r.status !== 0) {
    console.log('\n' + (r.stdout || '') + (r.stderr || ''));
    console.log('\nStopping: the environment is not ready. Fix the items above and re-run.');
    process.exit(1);
  }
}

// ---- 2. compile tokens ---------------------------------------------------
console.log('\n2. compile tokens (family config + contrast gate)');
for (const { run } of RUNS) {
  const r = node([join(HERE, 'make_tokens.mjs'), join('pinterest-ui-engine', 'runs', run)]);
  const m = /\(direction: [^,]+, family: ([^,]+), (\d+) pairs gated\)/.exec(r.stdout || '');
  record(`make_tokens ${run}`, r.status === 0, m ? `${m[1]}, ${m[2]} pairs gated` : 'see output');
  if (r.status !== 0) console.log((r.stdout || '') + (r.stderr || ''));
}

// ---- 3. generate ---------------------------------------------------------
console.log('\n3. generate apps');
for (const { run, template } of RUNS) {
  const r = node([join(HERE, 'generate.mjs'), join('pinterest-ui-engine', 'runs', run), template, join('pinterest-ui-engine', 'runs', run, 'app')]);
  record(`generate ${run}`, r.status === 0, template);
  if (r.status !== 0) console.log((r.stderr || ''));
}

// ---- 4. unit suites ------------------------------------------------------
console.log('\n4. unit suites (no browser)');
for (const [label, file] of [
  ['engine unit', 'unit.test.mjs'],
  ['colour/gate', null], // covered by unit.test.mjs
]) {
  if (!file) continue;
  const r = node([join(HERE, 'tests', file)]);
  const res = /RESULT (\d+\/\d+)/.exec(r.stdout || '');
  record(label, r.status === 0, res ? res[1] : 'no RESULT line');
  if (r.status !== 0) console.log((r.stdout || '') + (r.stderr || ''));
}

// ---- 5. browser suites ---------------------------------------------------
console.log('\n5. functional suites (real browser)');
for (const { run, suite } of RUNS) {
  const r = node([join(HERE, 'tests', suite), join('pinterest-ui-engine', 'runs', run, 'app')]);
  const res = /RESULT (\d+\/\d+)/.exec(r.stdout || '');
  record(`functional ${run}`, r.status === 0, res ? res[1] : 'no RESULT line');
  if (r.status !== 0) console.log((r.stdout || '') + (r.stderr || ''));
}
{
  const r = node([join(HERE, 'tests', 'stateprobe.test.mjs')]);
  const res = /RESULT (\d+\/\d+)/.exec(r.stdout || '');
  record('stateprobe self-tests', r.status === 0, res ? res[1] : 'no RESULT line');
  if (r.status !== 0) console.log((r.stdout || '') + (r.stderr || ''));
}

// ---- 6. rendered inspection ---------------------------------------------
console.log('\n6. rendered inspection (screenshots, state measures, axe)');
mkdirSync(OUT, { recursive: true });
const headline = {};
for (const { run } of RUNS) {
  const appDir = join(ROOT, 'pinterest-ui-engine', 'runs', run, 'app');
  const contract = join(ROOT, 'pinterest-ui-engine', 'runs', run, 'inspect.contract.json');
  if (!existsSync(contract)) { record(`inspect ${run}`, false, 'no inspect.contract.json'); continue; }
  const r = node([join(HERE, 'inspect.mjs'), appDir, contract, join(OUT, run)]);
  const ok = r.status === 0 && !/FAILED:/.test(r.stdout || '');
  const axeLine = /axe: (.*)/.exec(r.stdout || '');
  const axeClean = axeLine ? /"(\w+)":\[\]/.test(axeLine[1]) && !/"\w+":\["/.test(axeLine[1]) : false;
  const ratios = [...(r.stdout || '').matchAll(/^ {2}(\w+)\s+\[([\w-]+)\]\s+([\d.]+)$/gm)]
    .map(m => ({ name: m[1], kind: m[2], ratio: Number(m[3]) }));
  headline[run] = ratios;
  const minRatio = ratios.length ? Math.min(...ratios.map(x => x.ratio)) : 0;
  record(`inspect ${run}`, ok && axeClean, `${ratios.length} states measured, min ${minRatio}:1, axe ${axeClean ? '0 violations' : 'HAS VIOLATIONS'}`);
  if (!ok) console.log((r.stdout || '') + (r.stderr || ''));
}

// ---- 7. layout generation (Mission 021) --------------------------------
console.log('\n7. layout generation (brief + reference -> IR -> app + gates)');
const GENERATED = [
  { run: 'staynest', label: 'StayNest (marketplace)' },
  { run: 'carepoint-ir', label: 'CarePoint (booking, full interaction contract)' },
  { run: 'deskly', label: 'Deskly (desk booking, generalisation)' },
];
for (const g of GENERATED) {
  const r = node([join(HERE, 'build_app.mjs'), join('pinterest-ui-engine', 'runs', g.run)]);
  const plan = /navigation: (\w[\w-]*)/.exec(r.stdout || '');
  const gates = /testplan\.json \((\d+) checks\)/.exec(r.stdout || '');
  record(`plan ${g.run}`, r.status === 0, plan ? `${plan[1]}, ${gates ? gates[1] : '?'} derived checks` : 'see output');
  if (r.status !== 0) console.log((r.stdout || '') + (r.stderr || ''));
}

// ---- 8. generated-app gates -------------------------------------------
console.log('\n8. generated apps (derived suites + rendered inspection)');
for (const g of GENERATED) {
  const appDir = join(ROOT, 'pinterest-ui-engine', 'runs', g.run, 'app');
  const r = node([join(HERE, 'tests', 'flow.test.mjs'), appDir]);
  const res = /RESULT (\d+\/\d+)/.exec(r.stdout || '');
  record(`generated suite ${g.run}`, r.status === 0, res ? res[1] + ' derived checks' : 'no RESULT line');
  if (r.status !== 0) console.log((r.stdout || '') + (r.stderr || ''));

  const contract = join(appDir, 'inspect.contract.json');
  if (existsSync(contract)) {
    const ir = node([join(HERE, 'inspect.mjs'), appDir, contract, join(OUT, g.run)]);
    const axeLine = /axe: (.*)/.exec(ir.stdout || '');
    const axeClean = axeLine ? !/\["/.test(axeLine[1]) : false;
    const ratios = [...(ir.stdout || '').matchAll(/^ {2}(\w+)\s+\[([\w-]+)\]\s+([\d.]+)$/gm)].map(m => ({ name: m[1], kind: m[2], ratio: Number(m[3]) }));
    headline[g.run] = ratios;
    const minRatio = ratios.length ? Math.min(...ratios.map(x => x.ratio)) : 0;
    record(`generated inspect ${g.run}`, ir.status === 0 && axeClean, `${ratios.length} states, min ${minRatio}:1, axe ${axeClean ? '0 violations' : 'HAS VIOLATIONS'}`);
    if (ir.status !== 0) console.log((ir.stdout || '') + (ir.stderr || ''));
  }
}
{
  const r = node([join(HERE, 'tests', 'flow.test.mjs'), join(ROOT, 'pinterest-ui-engine', 'runs', 'staynest', 'baseline', 'app')]);
  const res = /RESULT (\d+\/\d+)/.exec(r.stdout || '');
  record('fair baseline suite (StayNest)', r.status === 0, res ? res[1] : 'no RESULT line');
}

// ---- 9. the unchanged hand-authored regression suite --------------------
console.log('\n9. unchanged hand-authored suite against the generated app');
{
  const r = node([join(HERE, 'tests', 'clinic.test.mjs'), join(ROOT, 'pinterest-ui-engine', 'runs', 'carepoint-ir', 'app')]);
  const res = /RESULT (\d+\/\d+)/.exec(r.stdout || '');
  record('ORIGINAL clinic suite vs generated CarePoint', r.status === 0, res ? res[1] + ' (unchanged assertions)' : 'no RESULT line');
  if (r.status !== 0) console.log((r.stdout || '') + (r.stderr || ''));
}

// ---- 9b. capability + semantic gates -----------------------------------
console.log('\n9b. capability honesty and semantic completeness');
{
  const r = node([join(HERE, 'tests', 'capability.test.mjs')]);
  const res = /RESULT (\d+\/\d+)/.exec(r.stdout || '');
  record('capability registry / ledger / preflight', r.status === 0, res ? res[1] : 'no RESULT line');
}
{
  const r = node([join(HERE, 'tests', 'semantic.test.mjs')]);
  const res = /RESULT (\d+\/\d+)/.exec(r.stdout || '');
  record('semantic completeness (incl. negatives)', r.status === 0, res ? res[1] : 'no RESULT line');
}

// ---- 9c. visual critique ------------------------------------------------
console.log('\n9c. evidence-driven critique and repair protocol');
{
  const r = node([join(HERE, 'tests', 'critique.test.mjs')]);
  const res = /RESULT (\d+\/\d+)/.exec(r.stdout || '');
  record('critique detector + repair re-checks', r.status === 0, res ? res[1] : 'no RESULT line');
}

// ---- 9d. constraint enforcement and responsive strategies ---------------
console.log('\n9d. design-constraint enforcement and responsive fidelity');
{
  const r = node([join(HERE, 'tests', 'detectors.test.mjs')]);
  const res = /RESULT (\d+\/\d+)/.exec(r.stdout || '');
  record('critique detectors vs injected defects', r.status === 0, res ? res[1] : 'no RESULT line');
}
{
  const r = node([join(HERE, 'tests', 'responsive.test.mjs')]);
  const res = /RESULT (\d+\/\d+)/.exec(r.stdout || '');
  record('responsive table strategy', r.status === 0, res ? res[1] : 'no RESULT line');
}

// ---- 10. summary --------------------------------------------------------
const failed = stages.filter(s => !s.ok);
console.log('\n' + '─'.repeat(72));
console.log('MEASURED HEADLINE (contrast of rendered states, minimum per app)');
for (const [run, ratios] of Object.entries(headline)) {
  if (!ratios.length) continue;
  const worst = ratios.reduce((a, b) => (a.ratio <= b.ratio ? a : b));
  console.log(`  ${run.padEnd(14)} worst state ${worst.ratio}:1 (${worst.name}, ${worst.kind}) of ${ratios.length} measured`);
}
console.log('─'.repeat(72));
console.log(`\n${stages.length - failed.length}/${stages.length} stages passed`);
if (failed.length) {
  console.log('\nFAILED STAGES:');
  for (const f of failed) console.log(`  - ${f.name}: ${f.detail}`);
  process.exit(1);
}
console.log(`Screenshots and inspection.json: ${OUT}`);
console.log('DEMO RESULT: all stages green');
