// run-suites.mjs — distribution-level test runner (not part of the
// engine). Runs each suite as its own process so one suite's exit
// code cannot mask the rest, and prints a summary. Every suite is
// expected to pass in full: the layout suite's long-standing 40/41
// (a vocabulary corpus that predated the bag and the declared
// families) was fixed at the corpus in Mission 048, so there is no
// known-failure exemption any more — a failure is a failure.
import { spawnSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const E = join(ROOT, 'pinterest-ui-engine', 'engine', 'tests');
const RUNS = join(ROOT, 'pinterest-ui-engine', 'runs');

const GROUPS = {
  core: ['unit', 'layout', 'stateprobe', 'capability', 'semantic', 'critique',
    'detectors', 'responsive', 'gates029', 'scope', 'runner', 'density_format', 'recovery'],
  design: ['design036', 'design037', 'design038', 'design039', 'design040',
    'design041', 'design042', 'design043', 'design045', 'design046', 'design047', 'design048'],
  fixtures: [
    ['app', join(RUNS, 'marble-meats', 'app')],
    ['clinic', join(RUNS, 'carepoint', 'app')],
    ['parcel', join(RUNS, 'swiftgo', 'app')],
    ['flow', join(RUNS, 'staynest', 'app')],
  ],
};

const group = process.argv[2] || 'core';
let bad = 0;
for (const item of GROUPS[group]) {
  const [name, arg] = Array.isArray(item) ? item : [item, null];
  const file = join(E, name + '.test.mjs');
  const r = spawnSync(process.execPath, arg ? [file, arg] : [file], { encoding: 'utf8', env: process.env });
  const m = (r.stdout || '').match(/RESULT (\d+)\/(\d+)/);
  const line = m ? `RESULT ${m[1]}/${m[2]}` : `exit=${r.status} (no RESULT)`;
  if (!m || m[1] !== m[2]) bad++;
  console.log(`${name.padEnd(16)} ${line}`);
}
console.log(bad ? `\n${bad} suite(s) failed` : '\nall suites passed');
process.exit(bad ? 1 : 0);
