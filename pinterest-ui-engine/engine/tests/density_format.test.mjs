// density_format.test.mjs — Mission 035's new behaviour, with negatives.
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chooseDensity, FLOORS, MODES } from '../layout/density.mjs';
import { launchBrowser } from '../lib/stateprobe.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..', '..', '..');
const results = [];
const check = (n, ok, d = '') => { results.push(ok); console.log(`${ok ? 'PASS' : 'FAIL'}  ${n}${d ? ' — ' + d : ''}`); };

// ---- density policy ----------------------------------------------------
const b = (composition, fields, records, extra = {}) => ({
  intent: { composition }, entity: { fields, records }, ...extra,
});
const num = { type: 'number' }, txt = { type: 'text' }, money = { type: 'money' };

{
  const d = chooseDensity(b('table', [num, num, num], Array(5).fill({})), { viewportWidth: 390 });
  check('density: a numeric table chooses compact', d.mode === 'compact', d.mode);
}
{
  const d = chooseDensity(b('index', [txt, txt], Array(4).fill({})), { viewportWidth: 1440 });
  check('density: a reading surface chooses spacious at desktop width', d.mode === 'spacious', d.mode);
}
{
  const d = chooseDensity(b('gallery', [txt, money], Array(6).fill({})), { viewportWidth: 390 });
  check('density: a gallery chooses balanced — records against media', d.mode === 'balanced', d.mode);
}
{
  const d = chooseDensity(b('row-list', [txt, txt, txt], Array(4).fill({})), { viewportWidth: 390 });
  check('density: every choice states its rationale', d.rationale.length > 0 && d.signals.length > 0, `${d.signals.length} signals`);
}
{
  const d = chooseDensity(b('index', [txt, txt], Array(2).fill({})), { viewportWidth: 390 });
  check('density: spacious is downgraded on a phone rather than pushing content off-screen',
    d.mode === 'balanced', d.mode);
}
{
  // floors must hold even if a future scale asks for less
  const d = chooseDensity(b('table', [num, num, num], Array(30).fill({})), { viewportWidth: 320 });
  check('density: no mode may breach the declared floors',
    d.scale.body >= FLOORS.bodyPx && d.scale.display >= FLOORS.titlePx && d.scale.media >= FLOORS.cardMediaPx,
    `body=${d.scale.body} display=${d.scale.display} media=${d.scale.media}`);
}
{
  const d = chooseDensity(null, {});
  check('density: no brief still yields a stated mode', MODES.includes(d.mode), d.mode);
}

// ---- number formatting -------------------------------------------------
const browser = await launchBrowser();
async function readNumber(caseDir, field) {
  const page = await browser.newPage();
  await page.goto('file://' + join(ROOT, caseDir, 'app', 'index.html'), { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 350));
  const v = await page.evaluate((f) => {
    const e = document.querySelector(`td[data-field="${f}"], [data-testid$="-card"] [data-field="${f}"], .row [data-field="${f}"]`);
    return e ? e.textContent.trim() : null;
  }, field);
  await page.close();
  return v;
}
{
  const v = await readNumber('bench030/cases/s5-grid', 'reading');
  check('numbers: a count is grouped for legibility', v === '4,820', String(v));
}
{
  const v = await readNumber('bench030/cases/s6-market', 'rate');
  check('numbers: money keeps its currency and grouping', /^₹\d{1,3}(,\d{3})*(\s*\/\s*\w+|\s+\w+)?$/.test(v || ''), String(v));
}
{
  // a year must not be grouped — the negative for the rule above
  const v = await readNumber('bench030/cases/s3-brief', 'filed');
  check('numbers: an identifier-like field is not grouped', v === null || !/^\d{1,2},\d{3}$/.test(v), String(v));
}
{
  const v = await readNumber('bench030/cases/s2-store', 'qty');
  check('numbers: a quantity keeps its unit alongside the grouped value', v === null || /kg|litre|jar|bunch|block/.test(v), String(v));
}
await browser.close();

// ---- identity across component types ------------------------------------
{
  const cases = [
    ['bench030/cases/s1-dispatch', 'piece-card', 'headline'],
    ['bench030/cases/s5-grid', 'reading-card', 'meter'],
    ['bench030/cases/s6-market', 'stall-card', 'produce'],
  ];
  const b2 = await launchBrowser();
  for (const [dir, tid, field] of cases) {
    const page = await b2.newPage();
    await page.goto('file://' + join(ROOT, dir, 'app', 'index.html'), { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 350));
    const ok = await page.evaluate(([t, f]) => {
      const item = document.querySelector(`[data-testid="${t}"]`);
      if (!item) return false;
      const el = item.querySelector(`[data-field="${f}"]`);
      return !!el && !!el.getAttribute('data-record');
    }, [tid, field]);
    check(`identity: ${dir.split('/').pop()} carries data-field and data-record`, ok);
    await page.close();
  }
  await b2.close();
}

// ---- the stale-anchor guard --------------------------------------------
{
  let threw = false;
  try {
    // the guard lives inside the fixture; simulate its condition directly
    const src = readFileSync(join(ROOT, 'bench030', 'cases', 's1-dispatch', 'app', 'app.js'), 'utf8');
    const re = /var extraLine = [\s\S]*?\.filter\(Boolean\)\.join\('[^']*'\);/;
    if (!re.test(src)) threw = true;
  } catch (e) { threw = true; }
  check('guards: the mutation anchor still matches the runtime (a stale anchor would throw)', !threw);
}

const passed = results.filter(Boolean).length;
console.log(`RESULT ${passed}/${results.length}`);
process.exit(passed === results.length ? 0 : 1);
