// detectors.test.mjs — every Mission 026 critique detector, validated against
// a deliberately injected defect. A detector that has only ever seen clean
// output is untested.
//
// Each case also records the false positives: the same detector run against the
// clean app must stay quiet.
//
// Usage: node engine/tests/detectors.test.mjs
import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync, appendFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { critique } from '../critique/critique.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..', '..', '..');
const TMP = join(HERE, '.tmp-detectors');
const INDEX = join(ROOT, 'bench025', 'cases', 'u2-quarto');   // index composition
const TABLE = join(ROOT, 'bench025', 'cases', 'u1-trellis');  // dense table

const results = [];
const check = (n, ok, d = '') => { results.push(ok); console.log(`${ok ? 'PASS' : 'FAIL'}  ${n}${d ? ' — ' + d : ''}`); };

const load = (dir) => ({
  ir: JSON.parse(readFileSync(join(dir, 'layout.json'), 'utf8')),
  constraints: (() => { try { return JSON.parse(readFileSync(join(dir, 'intent-report.json'), 'utf8')).constraints; } catch (e) { return []; } })(),
});

function copy(base, name) {
  const dir = join(TMP, name);
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  for (const f of ['index.html', 'styles.css', 'data.js', 'app.js']) cpSync(join(base, 'app', f), join(dir, f));
  return dir;
}
const has = (rep, id) => rep.findings.some(f => f.id === id);

rmSync(TMP, { recursive: true, force: true });
mkdirSync(TMP, { recursive: true });

// ---- 0. no false positives on the clean apps ---------------------------
{
  const a = load(INDEX);
  const rep = await critique(join(INDEX, 'app'), a.ir, { constraints: a.constraints });
  check('clean index app: no S1/S2 findings', rep.counts.S1 === 0 && rep.counts.S2 === 0,
    rep.findings.map(f => `${f.severity}:${f.id}`).join(', ') || 'none');
  const b = load(TABLE);
  const rep2 = await critique(join(TABLE, 'app'), b.ir, { constraints: b.constraints });
  check('clean table app: no S1/S2 findings', rep2.counts.S1 === 0 && rep2.counts.S2 === 0,
    rep2.findings.map(f => `${f.severity}:${f.id}`).join(', ') || 'none');
}

// ---- 1. constraint-violation: a card in an index composition -----------
{
  const dir = copy(INDEX, 'card-in-index');
  appendFileSync(join(dir, 'styles.css'), '\n.idx-row::before { content: ""; }\n');
  const app = readFileSync(join(dir, 'app.js'), 'utf8');
  writeFileSync(join(dir, 'app.js'), app.replace('class="idx-row"', 'class="idx-row card"'));
  const a = load(INDEX);
  const rep = await critique(dir, a.ir, { constraints: a.constraints });
  check('INJECTED: a card class in an index composition is a constraint violation',
    has(rep, 'constraint-violation:card'), rep.findings.map(f => f.id).join(', '));
  check('the violation is S1 and names the constraint source', (() => {
    const f = rep.findings.find(x => x.id === 'constraint-violation:card');
    return !!f && f.severity === 'S1' && /constraint CI-/.test(f.evidence);
  })());
}

// ---- 2. constraint-violation: media where none is allowed --------------
{
  const dir = copy(INDEX, 'media-in-index');
  const app = readFileSync(join(dir, 'app.js'), 'utf8');
  writeFileSync(join(dir, 'app.js'), app.replace('<h2 class="idx-title">',
    '<span class="card-media" style="display:block;height:8px"></span><h2 class="idx-title">'));
  const a = load(INDEX);
  const rep = await critique(dir, a.ir, { constraints: a.constraints });
  check('INJECTED: media in a media-free composition is a constraint violation',
    has(rep, 'constraint-violation:media'), rep.findings.map(f => f.id).join(', '));
}

// ---- 3. forbidden initials --------------------------------------------
{
  const dir = copy(INDEX, 'initials');
  const app = readFileSync(join(dir, 'app.js'), 'utf8');
  writeFileSync(join(dir, 'app.js'), app.replace('<h2 class="idx-title">',
    '<span class="row-chip" style="display:inline-block">BF</span><h2 class="idx-title">'));
  const a = load(INDEX);
  const rep = await critique(dir, a.ir, { constraints: a.constraints });
  check('INJECTED: decorative initials are detected where prohibited',
    has(rep, 'forbidden-initials') || has(rep, 'constraint-violation:initial-chip'),
    rep.findings.map(f => f.id).join(', '));
}

// ---- 4. composition not honoured --------------------------------------
{
  const dir = copy(INDEX, 'no-idx');
  const app = readFileSync(join(dir, 'app.js'), 'utf8');
  writeFileSync(join(dir, 'app.js'), app.replace(/class="idx-row"/g, 'class="row"'));
  const a = load(INDEX);
  const rep = await critique(dir, a.ir, { constraints: a.constraints });
  check('INJECTED: an index composition with no .idx-row is a constraint violation',
    has(rep, 'constraint-violation:composition'), rep.findings.map(f => f.id).join(', '));
}

// ---- 5. table without an affordance -----------------------------------
{
  const dir = copy(TABLE, 'no-affordance');
  appendFileSync(join(dir, 'styles.css'), '\n.table-fade, .table-hint { display: none !important; }\n');
  const b = load(TABLE);
  const rep = await critique(dir, b.ir, { constraints: b.constraints });
  check('INJECTED: a scrolling table with no affordance is detected',
    has(rep, 'table-no-affordance'), rep.findings.map(f => f.id).join(', '));
}

// ---- 6. table not keyboard reachable ----------------------------------
{
  const dir = copy(TABLE, 'no-tabindex');
  const app = readFileSync(join(dir, 'app.js'), 'utf8');
  writeFileSync(join(dir, 'app.js'), app.replace('tabindex="0" role="region"', 'role="region"'));
  const b = load(TABLE);
  const rep = await critique(dir, b.ir, { constraints: b.constraints });
  check('INJECTED: a scroll container without tabindex is detected',
    has(rep, 'table-not-focusable'), rep.findings.map(f => f.id).join(', '));
}

// ---- 7. silent clipping inside a nested container ---------------------
{
  const dir = copy(INDEX, 'clipping');
  appendFileSync(join(dir, 'styles.css'),
    '\n.idx-title { overflow: hidden; white-space: nowrap; text-overflow: clip; width: 60px; }\n');
  const a = load(INDEX);
  const rep = await critique(dir, a.ir, { constraints: a.constraints });
  check('INJECTED: content clipped with no ellipsis is detected as nested-clipping',
    has(rep, 'nested-clipping'), rep.findings.map(f => f.id).join(', '));
}

// ---- 8. truncation with an ellipsis is reported separately ------------
{
  const dir = copy(INDEX, 'truncation');
  appendFileSync(join(dir, 'styles.css'),
    '\n.idx-title { overflow: hidden; white-space: nowrap; text-overflow: ellipsis; width: 60px; }\n');
  const a = load(INDEX);
  const rep = await critique(dir, a.ir, { constraints: a.constraints });
  check('INJECTED: truncation with an ellipsis is reported as text-truncated, not clipping',
    has(rep, 'text-truncated') && !has(rep, 'nested-clipping'), rep.findings.map(f => f.id).join(', '));
}

// ---- 9. the visually-hidden helper is not a false positive ------------
{
  const rep = await critique(join(INDEX, 'app'), load(INDEX).ir, { constraints: load(INDEX).constraints });
  check('the .vh screen-reader helper is not reported as clipping', !has(rep, 'nested-clipping'));
}

rmSync(TMP, { recursive: true, force: true });
const passed = results.filter(Boolean).length;
console.log(`RESULT ${passed}/${results.length}`);
process.exit(passed === results.length ? 0 : 1);
