// gates029.test.mjs — the Mission 029 gates, each with a positive and a
// negative fixture. A gate that has only seen defects is untested; a gate that
// has only seen clean output is worse.
import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync, appendFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { critique } from '../critique/critique.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..', '..', '..');
const TMP = join(HERE, '.tmp-gates029');
const PANTRY = join(ROOT, 'bench028', 'cases', 'n1-larder');
const results = [];
const check = (n, ok, d = '') => { results.push(ok); console.log(`${ok ? 'PASS' : 'FAIL'}  ${n}${d ? ' — ' + d : ''}`); };

const ir = JSON.parse(readFileSync(join(PANTRY, 'layout.json'), 'utf8'));
const UNIT = ['kg', 'litre', 'bunch', 'block', 'jar'];

function copy(name, mutate) {
  const dir = join(TMP, name);
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  for (const f of ['index.html', 'styles.css', 'data.js', 'app.js']) cpSync(join(PANTRY, 'app', f), join(dir, f));
  if (mutate) mutate(dir);
  return dir;
}
const has = (rep, id) => rep.findings.some(f => f.id === id);
rmSync(TMP, { recursive: true, force: true }); mkdirSync(TMP, { recursive: true });

// ---- unit-dropped -------------------------------------------------------
{
  const clean = await critique(join(PANTRY, 'app'), ir, { units: UNIT });
  check('unit gate: quiet when the unit renders', !has(clean, 'unit-dropped'));
  const dir = copy('nounit', d => {
    const p = join(d, 'app.js');
    writeFileSync(p, readFileSync(p, 'utf8').replace("return base ? base + ' ' + String(rec[field.unitField]) : base;", "return base;"));
  });
  const rep = await critique(dir, ir, { units: UNIT });
  check('unit gate: fires when the unit is dropped', has(rep, 'unit-dropped'), rep.findings.map(f => f.id).join(', '));
}

// ---- decorative-media-substitute ---------------------------------------
{
  const clean = await critique(join(PANTRY, 'app'), ir, { expectsRealMedia: false });
  check('media gate: quiet when there are no media blocks', !has(clean, 'decorative-media-substitute'));
  const dir = copy('initials', d => {
    const p = join(d, 'app.js');
    writeFileSync(p, readFileSync(p, 'utf8').replace("(s.props.showChip === false ? '' :", "(false ? '' :"));
  });
  const rep = await critique(dir, ir, { expectsRealMedia: false });
  check('media gate: quiet for a chip in a row list (a chip is not a media block)', !has(rep, 'decorative-media-substitute'));
  const dir2 = copy('media-initials', d => {
    const p = join(d, 'app.js');
    writeFileSync(p, readFileSync(p, 'utf8').replace("'<article class=\"row\">'", "'<article class=\"row\"><span class=\"card-media\">TD</span>'"));
  });
  const rep2 = await critique(dir2, ir, { expectsRealMedia: false });
  check('media gate: fires when a media block is an initial', has(rep2, 'decorative-media-substitute'), rep2.findings.map(f => f.id).join(', '));
}

// ---- scan-cost ----------------------------------------------------------
{
  const clean = await critique(join(PANTRY, 'app'), ir, { simpleRepeatedTask: true });
  check('scan gate: quiet for a dense row list', !has(clean, 'scan-cost'), clean.findings.map(f => f.id).join(', ') || 'none');
  const dir = copy('sparse', d => appendFileSync(join(d, 'styles.css'), '\n.row { padding: 500px 0; }\n'));
  const rep = await critique(dir, ir, { simpleRepeatedTask: true });
  check('scan gate: fires when a 6-item checklist needs many screens', has(rep, 'scan-cost'), rep.findings.map(f => f.id).join(', '));
}

// ---- a gate must not fire on a legitimate variant -----------------------
{
  const rep = await critique(join(PANTRY, 'app'), ir, { units: UNIT, expectsRealMedia: false, simpleRepeatedTask: true });
  check('no gate fires on the corrected pantry app', rep.findings.filter(f => ['unit-dropped','decorative-media-substitute','scan-cost'].includes(f.id)).length === 0,
    rep.findings.map(f => f.id).join(', ') || 'none');
}

rmSync(TMP, { recursive: true, force: true });
const passed = results.filter(Boolean).length;
console.log(`RESULT ${passed}/${results.length}`);
process.exit(passed === results.length ? 0 : 1);
