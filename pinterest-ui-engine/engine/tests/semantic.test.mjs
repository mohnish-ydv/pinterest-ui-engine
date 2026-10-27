// semantic.test.mjs — the semantic-completeness validator, including the
// negative cases the mission requires: it must FAIL when required content is
// removed, replaced with the wrong value, or rendered into an inaccessible
// state. A validator that only ever passes is worthless.
//
// Usage: node engine/tests/semantic.test.mjs
import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync, existsSync, appendFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildLedger } from '../capability/ledger.mjs';
import { verifyLedger, formatValue } from '../capability/verify.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..', '..', '..');
const CASE = join(ROOT, 'bench', 'cases', 'a-pulse');
const TMP = join(HERE, '.tmp-semantic');

const results = [];
const check = (name, ok, detail = '') => {
  results.push(ok);
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`);
};

const brief = JSON.parse(readFileSync(join(CASE, 'brief.json'), 'utf8'));
const ledger = buildLedger('a-pulse', brief);
const ITEM = '[data-testid="channel-row"]';

function freshCopy(name) {
  const dir = join(TMP, name);
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  for (const f of ['index.html', 'styles.css', 'data.js', 'app.js']) {
    cpSync(join(CASE, 'app', f), join(dir, f));
  }
  return dir;
}

rmSync(TMP, { recursive: true, force: true });
mkdirSync(TMP, { recursive: true });

// ---- 1. positive: the repaired app is complete --------------------------
{
  const r = await verifyLedger({ appDir: join(CASE, 'app'), ledger, brief, itemSelector: ITEM });
  check('repaired app: every implemented content requirement is verified',
    r.counts.failed === 0, `${r.counts.verified} verified, ${r.counts.failed} failed`);
  check('repaired app: the denominator is the whole ledger',
    r.total === ledger.requirements.length, `${r.total} of ${ledger.requirements.length}`);
  check('repaired app: unimplemented checks are reported as unmeasured, not dropped',
    r.counts.unmeasured > 0 && r.counts.verified + r.counts.failed + r.counts.unmeasured === r.total,
    `${r.counts.unmeasured} unmeasured`);
}

// ---- 2. negative: required content REMOVED ------------------------------
{
  const dir = freshCopy('removed');
  const data = readFileSync(join(dir, 'data.js'), 'utf8');
  // strip the revenue field from every record — the Mission 023 failure, exactly
  const mutated = data.replace(/"revenue":\s*\d+,?/g, '');
  writeFileSync(join(dir, 'data.js'), mutated);
  const r = await verifyLedger({ appDir: dir, ledger, brief, itemSelector: ITEM });
  const hit = r.results.filter(x => x.status === 'failed').map(x => x.id);
  check('validator FAILS when required content is removed',
    r.counts.failed > 0, `failed: ${hit.join(', ') || 'none'}`);
  check('the removal is attributed to the revenue requirement specifically',
    hit.some(id => /revenue/.test(id)), hit.join(', '));
}

// ---- 3. negative: required content REPLACED WITH THE WRONG VALUE --------
{
  const dir = freshCopy('wrong');
  const data = readFileSync(join(dir, 'data.js'), 'utf8');
  // the brief says c1 revenue is 1240000; make the app claim 9999999
  writeFileSync(join(dir, 'data.js'), data.replace(/"revenue":\s*1240000/, '"revenue":9999999'));
  const r = await verifyLedger({ appDir: dir, ledger, brief, itemSelector: ITEM });
  const hit = r.results.filter(x => x.status === 'failed').map(x => x.id);
  check('validator FAILS when a value is replaced with the wrong number',
    hit.some(id => /revenue-list/.test(id)), `failed: ${hit.join(', ') || 'none'}`);
}

// ---- 4. negative: content rendered but INACCESSIBLE ---------------------
{
  const dir = freshCopy('inaccessible');
  // present in the DOM, invisible to a sighted user
  appendFileSync(join(dir, 'styles.css'), '\n.row-figures, .row-meta { display: none !important; }\n');
  const r = await verifyLedger({ appDir: dir, ledger, brief, itemSelector: ITEM });
  const hit = r.results.filter(x => x.status === 'failed').map(x => x.id);
  check('validator FAILS when required content is hidden from view',
    hit.length >= 3, `failed: ${hit.join(', ') || 'none'}`);
}

// ---- 5. negative: content present only inside an aria-hidden subtree ----
{
  const dir = freshCopy('aria-hidden');
  const app = readFileSync(join(dir, 'app.js'), 'utf8');
  // mark the figures column aria-hidden: visible pixels, absent from the a11y tree
  writeFileSync(join(dir, 'app.js'), app.replace("'<span class=\"row-figures\">'", "'<span class=\"row-figures\" aria-hidden=\"true\">'"));
  const r = await verifyLedger({ appDir: dir, ledger, brief, itemSelector: ITEM });
  const hit = r.results.filter(x => x.status === 'failed');
  check('validator FAILS when required content is only in an aria-hidden subtree',
    hit.length >= 3, `failed: ${hit.map(x => x.id).join(', ') || 'none'}`);
  check('the aria-hidden failure names accessibility as the cause',
    hit.some(x => /assistive technology/.test(x.reason || '')),
    hit.map(x => x.reason).filter(Boolean)[0] || 'none');
}

// ---- 6. the registry claim is checked against reality -------------------
{
  const { COLLECTION_RENDERS } = await import('../capability/registry.mjs');
  const roles = COLLECTION_RENDERS.row.list;
  check('registry: the row variant claims price, stat and meta',
    ['price', 'stat', 'meta'].every(r => roles.includes(r)), roles.join(','));
  const src = readFileSync(join(HERE, '..', 'runtime', 'runtime.js'), 'utf8');
  check('runtime: the row branch actually renders figures and meta',
    /row-figures/.test(src) && /row-meta/.test(src));
}

// ---- 7. formatting parity ----------------------------------------------
{
  const money = formatValue({ type: 'money', suffix: '/kg' }, 48, '\u20b9');
  check('formatValue matches the runtime money format', money === '\u20b948/kg', money);
  const rating = formatValue({ type: 'rating' }, 4.7, '');
  check('formatValue matches the runtime rating format', rating === '\u2605 4.7', rating);
}

rmSync(TMP, { recursive: true, force: true });

const passed = results.filter(Boolean).length;
console.log(`RESULT ${passed}/${results.length}`);
process.exit(passed === results.length ? 0 : 1);
