// scope.test.mjs — challenge the scope validator with the nine fixture classes
// the mission names. A validator is only worth its false-positive rate.
import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync, appendFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { verifyScopes } from '../trace/scope.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..', '..', '..');
const CASE = join(ROOT, 'bench029', 'cases', 't2-shelf');
const TMP = join(HERE, '.tmp-scope');
const results = [];
const check = (n, ok, d = '') => { results.push(ok); console.log(`${ok ? 'PASS' : 'FAIL'}  ${n}${d ? ' — ' + d : ''}`); };

const brief = JSON.parse(readFileSync(join(CASE, 'brief.json'), 'utf8'));
const scoped = brief._derived.scoped;

function copy(name, mutate) {
  const dir = join(TMP, name);
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  for (const f of ['index.html', 'styles.css', 'data.js', 'app.js']) cpSync(join(CASE, 'app', f), join(dir, f));
  if (mutate) mutate(dir);
  return dir;
}
const statusOf = (rep, subject) => (rep.results.find(r => r.subject === subject) || {}).status;

rmSync(TMP, { recursive: true, force: true }); mkdirSync(TMP, { recursive: true });

// 1. correct field in the required region
{
  const rep = await verifyScopes({ brief, scoped, appDir: join(CASE, 'app') });
  check('1 correct field in the required region → ok', statusOf(rep, 'summary') === 'ok', statusOf(rep, 'summary'));
  check('1 no false positives on a correct app', rep.failed === 0, `${rep.failed} failed`);
}

// 2. field only in another view
{
  const dir = copy('wrongscope', d => {
    const p = join(d, 'app.js');
    writeFileSync(p, readFileSync(p, 'utf8').replace(/\(s\.props\.entryExtra \|\| \[\]\)/g, '([])'));
  });
  const rep = await verifyScopes({ brief, scoped, appDir: dir });
  check('2 field only on the detail view → wrong-scope', statusOf(rep, 'summary') === 'wrong-scope', statusOf(rep, 'summary'));
}

// 3. absent from one repeated entry
{
  // blank one record's summary: that item genuinely lacks the value while the
  // others have it, which is "present in some entries but not others"
  const dir = copy('partial', d => {
    const p = join(d, 'data.js');
    writeFileSync(p, readFileSync(p, 'utf8').replace('A short guide for people who have only seen one and nodded.', ''));
  });
  const rep = await verifyScopes({ brief, scoped, appDir: dir });
  check('3 absent from one of five entries → partial', statusOf(rep, 'summary') === 'partial',
    `${statusOf(rep, 'summary')} ${JSON.stringify(rep.counts)} items=${rep.items}`);
}

// 4. correct number, missing unit
{
  // The pantry brief never says "each row shows the quantity and unit", so it
  // carries no such scope. This fixture states the scope explicitly and checks
  // the validator against two apps: one with units, one without.
  const pantry = JSON.parse(readFileSync(join(ROOT, 'bench028', 'cases', 'n1-larder', 'brief.json'), 'utf8'));
  const pantryScoped = {
    requirements: [{ id: 'SR-UNIT', kind: 'field', subject: 'qty', label: 'Quantity', units: 'kg',
      scope: { view: 'entry', cardinality: 'every-item', region: 'item' }, mandatory: true,
      source: { text: 'Each row shows the quantity and unit.', requirementIndex: 0 },
      validation: { method: 'scoped-text' } }],
  };
  const dir2 = join(TMP, 'pantry-nounit');
  rmSync(dir2, { recursive: true, force: true }); mkdirSync(dir2, { recursive: true });
  for (const f of ['index.html', 'styles.css', 'data.js', 'app.js']) cpSync(join(ROOT, 'bench028', 'cases', 'n1-larder', 'app', f), join(dir2, f));
  const q = join(dir2, 'app.js');
  writeFileSync(q, readFileSync(q, 'utf8').replace("return base ? base + ' ' + String(rec[field.unitField]) : base;", 'return base;'));
  const rep = await verifyScopes({ brief: pantry, scoped: pantryScoped, appDir: dir2 });
  const anyMissingUnits = rep.results.some(r => r.status === 'missing-units');
  check('4 number without its unit → missing-units', anyMissingUnits, JSON.stringify(rep.counts));
  // and the same requirement on the app that DOES render units must pass
  const repOk = await verifyScopes({ brief: pantry, scoped: pantryScoped, appDir: join(ROOT, 'bench028', 'cases', 'n1-larder', 'app') });
  check('4 control: the same requirement passes when the unit renders', repOk.results[0].status === 'ok', repOk.results[0].status);
}

// 5. wrong value
{
  const dir = copy('wrongvalue', d => {
    const p = join(d, 'data.js');
    writeFileSync(p, readFileSync(p, 'utf8').replace('The retry semantics were doing more harm than the throughput helped.', 'Something else entirely.'));
  });
  const rep = await verifyScopes({ brief, scoped, appDir: dir });
  const s = statusOf(rep, 'summary');
  check('5 wrong value in the right region → not ok', s !== 'ok', s);
}

// 6. present only in hidden content
{
  const dir = copy('hidden', d => appendFileSync(join(d, 'styles.css'), '\n.row-extra, .card-extra, .idx-extra { display: none !important; }\n'));
  const rep = await verifyScopes({ brief, scoped, appDir: dir });
  const s = statusOf(rep, 'summary');
  check('6 present only in hidden content → hidden', s === 'hidden' || s === 'missing' || s === 'wrong-scope', s);
}

// 7. present through a legitimate accessible equivalent
{
  const dir = copy('accessible', d => {
    const p = join(d, 'app.js');
    writeFileSync(p, readFileSync(p, 'utf8').replace(
      "var extraLine = extraFs.map(function (f) { return esc(fmt(f, rec)); }).filter(Boolean).join(' \\u00b7 ');",
      "var extraLine = '<span aria-label=\"' + esc(extraFs.map(function (f) { return fmt(f, rec); }).join(' ')) + '\"></span>';"));
  });
  const rep = await verifyScopes({ brief, scoped, appDir: dir });
  check('7 accessible equivalent counts as present', statusOf(rep, 'summary') === 'ok', statusOf(rep, 'summary'));
}

// 8. required behaviour with no confirmation state
{
  const behaviours = scoped.requirements.filter(r => r.kind === 'behaviour');
  const rep = await verifyScopes({ brief, scoped, appDir: join(CASE, 'app') });
  const b = rep.results.filter(r => r.kind === 'behaviour');
  check('8 behavioural requirements are reported as unmeasured, not as passing',
    behaviours.length === 0 ? true : b.every(x => x.status === 'unmeasured'),
    `${behaviours.length} behaviour(s)`);
}

// 9. intentional truncation versus data loss
{
  const dir = copy('ellipsis', d => appendFileSync(join(d, 'styles.css'), '\n.row-extra { overflow:hidden; white-space:nowrap; text-overflow:ellipsis; max-width:120px; }\n'));
  const rep = await verifyScopes({ brief, scoped, appDir: dir });
  check('9 visual truncation is not reported as data loss (text remains in the DOM)',
    statusOf(rep, 'summary') === 'ok', statusOf(rep, 'summary'));
  // The anchor must track the runtime. Mission 033 rewrote this line to emit
  // data-field spans, so the old anchor silently matched nothing and the
  // fixture became a no-op that "passed" by not mutating. Anchor on the
  // declaration only, and assert the mutation actually changed the file.
  const dir2 = copy('loss', d => {
    const p = join(d, 'app.js');
    const src = readFileSync(p, 'utf8');
    const re = /var extraLine = [\s\S]*?\.filter\(Boolean\)\.join\('[^']*'\);/;
    if (!re.test(src)) throw new Error('scope.test 9b: anchor no longer present in app.js — fixture is stale');
    const out = src.replace(re, "var extraLine = '';");
    if (out === src) throw new Error('scope.test 9b: mutation changed nothing');
    writeFileSync(p, out);
  });
  const rep2 = await verifyScopes({ brief, scoped, appDir: dir2 });
  check('9 actual data loss is reported', statusOf(rep2, 'summary') !== 'ok', statusOf(rep2, 'summary'));
}

rmSync(TMP, { recursive: true, force: true });
const passed = results.filter(Boolean).length;
console.log(`RESULT ${passed}/${results.length}`);
process.exit(passed === results.length ? 0 : 1);
