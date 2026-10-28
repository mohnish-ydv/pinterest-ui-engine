// design048.test.mjs — Mission 048: the out-of-box fix.
//
// An independent run of v1.27 from a fresh clone failed
// `verify:env` with "axe-core vendored: missing": the M044 slimming
// dropped vendor/ (and package-lock.json, and requirements.txt) from
// the distribution, and every later version inherited the hole —
// verify_env hard-failed, inspect.mjs exited 1, and the capability
// verifier's axe checks silently went unmeasured. These checks pin
// the repaired state so the files cannot go missing again unnoticed.
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, mkdtempSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ENGINE = join(dirname(fileURLToPath(import.meta.url)), '..');
const ROOT = join(ENGINE, '..', '..');
let pass = 0, fail = 0;
const check = (name, ok, extra = '') => { console.log(`${ok ? '✓' : '✗ FAIL'} ${name}${extra ? ' — ' + extra : ''}`); ok ? pass++ : fail++; };

// ---- the vendored axe-core is actually in the tree --------------------
const axePath = join(ROOT, 'vendor', 'axe-core', 'axe.min.js');
check('vendor/axe-core/axe.min.js ships in the tree', existsSync(axePath));
if (existsSync(axePath)) {
  const head = readFileSync(axePath, 'utf8').slice(0, 200);
  const versionTxt = readFileSync(join(ROOT, 'vendor', 'axe-core', 'VERSION.txt'), 'utf8');
  const v = (versionTxt.match(/axe-core (\d+\.\d+\.\d+)/) || [])[1];
  check('vendored axe version matches VERSION.txt', !!v && head.includes(`axe v${v}`), v || 'unparsed');
  check('vendored axe is the full build', statSync(axePath).size > 500000, statSync(axePath).size + ' bytes');
}
const lic = join(ROOT, 'vendor', 'axe-core', 'LICENSE');
check('vendored axe carries its MPL-2.0 LICENSE', existsSync(lic) && readFileSync(lic, 'utf8').includes('Mozilla Public License'));

// ---- the other two files the M044 slimming dropped --------------------
const req = join(ROOT, 'requirements.txt');
check('requirements.txt ships (verify_env tells users to install from it)',
  existsSync(req) && readFileSync(req, 'utf8').includes('Pillow'));
let lockOk = false, lockDetail = 'missing';
try {
  const lock = JSON.parse(readFileSync(join(ROOT, 'package-lock.json'), 'utf8'));
  const pin = lock.packages && lock.packages['node_modules/puppeteer-core'];
  lockOk = lock.lockfileVersion >= 3 && pin && pin.version === '25.16.0';
  lockDetail = pin ? 'puppeteer-core ' + pin.version : 'no pin';
} catch (e) { lockDetail = e.message; }
check('package-lock.json pins the one dependency', lockOk, lockDetail);

// ---- verify:env is green with no manual steps --------------------------
try {
  const out = execFileSync(process.execPath, [join(ENGINE, 'verify_env.mjs')], { encoding: 'utf8', env: process.env });
  check('verify:env exits ready on an untouched tree', out.includes('ENV RESULT: ready'));
  check('verify:env reports axe-core vendored OK', /OK\s+axe-core vendored/.test(out));
} catch (e) {
  check('verify:env exits ready on an untouched tree', false, String(e.stdout || e.message).slice(0, 160));
  check('verify:env reports axe-core vendored OK', false);
}

// ---- inspect.mjs runs: the axe stage is no longer dead ------------------
try {
  const runs = join(ENGINE, '..', 'runs', 'marble-meats');
  const outDir = mkdtempSync(join(tmpdir(), 'inspect048-'));
  const out = execFileSync(process.execPath,
    [join(ENGINE, 'inspect.mjs'), join(runs, 'app'), join(runs, 'inspect.contract.json'), outDir],
    { encoding: 'utf8', env: process.env, timeout: 120000 });
  check('inspect.mjs runs end to end on a fixture app', out.includes('axe:'));
} catch (e) {
  check('inspect.mjs runs end to end on a fixture app', false, String(e.stderr || e.message).slice(0, 160));
}

// ---- the layout vocabulary check is whole again -------------------------
try {
  const out = execFileSync(process.execPath, [join(ENGINE, 'tests', 'layout.test.mjs')], { encoding: 'utf8', env: process.env });
  const m = out.match(/RESULT (\d+)\/(\d+)/);
  // NB: do not print the literal word RESULT here — run-suites reads the
  // first RESULT line of this suite's output as this suite's own score.
  check('layout suite passes in full (vocabulary corpus covers the declared families)',
    !!m && m[1] === m[2], m ? `layout scored ${m[1]}/${m[2]}` : 'no score line');
} catch (e) {
  const m = String(e.stdout || '').match(/RESULT (\d+)\/(\d+)/);
  check('layout suite passes in full (vocabulary corpus covers the declared families)', false, m ? `layout scored ${m[1]}/${m[2]}` : 'no score line');
}

console.log(`RESULT ${pass}/${pass + fail}`);
process.exit(fail ? 1 : 0);
