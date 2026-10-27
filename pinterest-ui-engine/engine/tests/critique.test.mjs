// critique.test.mjs — the critique detector and the repair protocol.
//
// Mission 025 Phase 5 requires two things this file proves:
//   1. the detector finds concrete defects (so it is tested against injected ones,
//      not only against apps that happen to be clean);
//   2. a repair is accepted only after the FULL check suite is re-run — not
//      because the detector's own score improved.
//
// Usage: node engine/tests/critique.test.mjs
import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync, appendFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { critique } from '../critique/critique.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..', '..', '..');
const CASE = join(ROOT, 'bench025', 'cases', 'u4-marketrow');
const TMP = join(HERE, '.tmp-critique');
const results = [];
const check = (n, ok, d = '') => { results.push(ok); console.log(`${ok ? 'PASS' : 'FAIL'}  ${n}${d ? ' — ' + d : ''}`); };

const ir = JSON.parse(readFileSync(join(CASE, 'layout.json'), 'utf8'));

function copy(name) {
  const dir = join(TMP, name);
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  for (const f of ['index.html', 'styles.css', 'data.js', 'app.js']) cpSync(join(CASE, 'app', f), join(dir, f));
  return dir;
}
const runAccept = (dir) => {
  try {
    const out = execFileSync(process.execPath, [join(CASE, 'acceptance.mjs'), dir], { encoding: 'utf8' });
    const m = /RESULT (\d+)\/(\d+)/.exec(out); return m ? `${m[1]}/${m[2]}` : 'abort';
  } catch (e) { const m = /RESULT (\d+)\/(\d+)/.exec((e.stdout || '') + (e.stderr || '')); return m ? `${m[1]}/${m[2]}` : 'abort'; }
};
const has = (rep, id) => rep.findings.some(f => f.id === id);

rmSync(TMP, { recursive: true, force: true }); mkdirSync(TMP, { recursive: true });

// ---- 1. a clean app reports no S1 --------------------------------------
{
  const rep = await critique(join(CASE, 'app'), ir);
  check('clean app: no S1 findings', rep.counts.S1 === 0, `${rep.total} finding(s)`);
  check('clean app: acceptance is 10/10 before any repair', runAccept(join(CASE, 'app')) === '10/10');
}

// ---- 2. injected defect: horizontal overflow ---------------------------
{
  const dir = copy('overflow');
  appendFileSync(join(dir, 'styles.css'), '\n.card { min-width: 620px; }\n');
  const rep = await critique(dir, ir);
  check('NEGATIVE: injected overflow is detected as S1', has(rep, 'overflow-mobile'), rep.findings.map(f => f.id).join(', '));
}

// ---- 3. injected defect: every media block the same hue ----------------
{
  const dir = copy('media');
  const app = readFileSync(join(dir, 'app.js'), 'utf8');
  writeFileSync(join(dir, 'app.js'), app.replace("var hue = ((MEDIA.baseHue + (hsh % span) - MEDIA.spread) + 360) % 360;",
    "var hue = MEDIA.baseHue;"));
  const rep = await critique(dir, ir);
  check('NEGATIVE: identical media hues are detected', has(rep, 'media-repetition'), rep.findings.map(f => f.id).join(', '));
  check('the media defect is marked auto-repairable', rep.findings.find(f => f.id === 'media-repetition')?.repairable === true);
}

// ---- 4. repair protocol: fix, then re-run EVERYTHING -------------------
{
  const dir = copy('repaired');
  const app = readFileSync(join(dir, 'app.js'), 'utf8');
  writeFileSync(join(dir, 'app.js'), app.replace("var hue = ((MEDIA.baseHue + (hsh % span) - MEDIA.spread) + 360) % 360;", "var hue = MEDIA.baseHue;"));
  const before = await critique(dir, ir);
  check('repair: the defect is present before the fix', has(before, 'media-repetition'));

  // apply the repair
  const broken = readFileSync(join(dir, 'app.js'), 'utf8');
  writeFileSync(join(dir, 'app.js'), broken.replace("var hue = MEDIA.baseHue;",
    "var hue = ((MEDIA.baseHue + (hsh % span) - MEDIA.spread) + 360) % 360;"));

  const after = await critique(dir, ir);
  check('repair: the detector no longer reports it', !has(after, 'media-repetition'));
  // NOT sufficient on its own — re-run the independent checks
  check('repair ACCEPTED only because acceptance is still 10/10', runAccept(dir) === '10/10');
  check('repair: no new findings appeared', after.total <= before.total - 1, `${before.total} -> ${after.total}`);
}

// ---- 5. the occlusion check does not fire below the fold --------------
{
  const dir = copy('nofold');
  const rep = await critique(dir, ir);
  check('occlusion is not reported for content that is merely below the fold', !has(rep, 'occlusion-fixed-bar'));
}

rmSync(TMP, { recursive: true, force: true });
const passed = results.filter(Boolean).length;
console.log(`RESULT ${passed}/${results.length}`);
process.exit(passed === results.length ? 0 : 1);
