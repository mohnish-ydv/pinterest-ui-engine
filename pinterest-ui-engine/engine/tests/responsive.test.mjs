// responsive.test.mjs — the dense-table mobile strategy, tested rather than assumed.
//
// MISSION 026, Phase 4. "A document that technically fits the viewport is not
// proof that every table column is visible or usable." So this checks the
// affordance is *discoverable*, the scroller is *keyboard reachable*, the row
// identity survives horizontal scrolling, and no column is *lost*.
//
// Usage: node engine/tests/responsive.test.mjs [appDir]
import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { launchBrowser } from '../lib/stateprobe.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..', '..', '..');
const CASE = join(ROOT, 'bench025', 'cases', 'u1-trellis');
const TMP = join(HERE, '.tmp-responsive');
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const results = [];
const check = (n, ok, d = '') => { results.push(ok); console.log(`${ok ? 'PASS' : 'FAIL'}  ${n}${d ? ' — ' + d : ''}`); };

const b = await launchBrowser();

async function open(dir, w, h) {
  const page = await b.newPage();
  await page.setViewport({ width: w, height: h });
  await page.goto('file://' + dir + '/index.html', { waitUntil: 'networkidle0' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle0' });
  await sleep(350);
  return page;
}

const state = (page) => page.evaluate(() => {
  const frame = document.querySelector('[data-testid="table-frame"]');
  const wrap = document.querySelector('[data-testid="table-scroll"]');
  const hint = document.querySelector('[data-testid="table-scroll-hint"]');
  const table = document.querySelector('.datatable');
  if (!frame || !wrap) return null;
  const fade = frame.querySelector('.table-fade');
  const vis = (el) => {
    if (!el) return false;
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') return false;
    const r = el.getBoundingClientRect();
    return r.height > 0 && r.width > 0;
  };
  return {
    overflow: frame.getAttribute('data-overflow'),
    scrolls: wrap.scrollWidth > wrap.clientWidth + 1,
    hintVisible: vis(hint),
    fadeOpacity: fade && getComputedStyle(fade).display !== 'none' ? parseFloat(getComputedStyle(fade).opacity) : 0,
    tabindex: wrap.getAttribute('tabindex'),
    role: wrap.getAttribute('role'),
    ariaLabel: wrap.getAttribute('aria-label'),
    headers: table ? table.querySelectorAll('thead th').length : 0,
    cells: table ? table.querySelectorAll('tbody tr:first-child td').length : 0,
    stickyFirst: table ? getComputedStyle(table.querySelector('tbody td')).position : 'static',
    docOverflow: document.documentElement.scrollWidth > window.innerWidth + 1,
  };
});

// ---- 390: narrow mobile, the table must overflow -------------------------
{
  const page = await open(join(CASE, 'app'), 390, 844);
  const s = await state(page);
  check('390: the table overflows its container', s.overflow === 'true' && s.scrolls, `overflow=${s.overflow}`);
  check('390: the overflow is announced by a visible hint', s.hintVisible === true);
  check('390: the trailing-edge fade is visible', s.fadeOpacity > 0.5, `opacity ${s.fadeOpacity}`);
  check('390: the scroller is keyboard reachable', s.tabindex === '0' && s.role === 'region', `tabindex=${s.tabindex} role=${s.role}`);
  check('390: the scroller is named for assistive tech', !!s.ariaLabel, s.ariaLabel || 'none');
  check('390: the first column is sticky', s.stickyFirst === 'sticky', s.stickyFirst);
  check('390: no column is lost from the DOM', s.headers === 5 && s.cells === 5, `${s.headers} headers, ${s.cells} cells`);

  // keyboard scrolling actually moves the viewport
  await page.evaluate(() => document.querySelector('[data-testid="table-scroll"]').focus());
  const before = await page.evaluate(() => document.querySelector('[data-testid="table-scroll"]').scrollLeft);
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowRight');
  await sleep(200);
  const after = await page.evaluate(() => document.querySelector('[data-testid="table-scroll"]').scrollLeft);
  check('390: arrow keys scroll the table', after > before, `${before} -> ${after}`);

  // the row identity is still on screen after scrolling
  const identity = await page.evaluate(() => {
    const wrap = document.querySelector('[data-testid="table-scroll"]');
    wrap.scrollLeft = wrap.scrollWidth;
    const cell = document.querySelector('.datatable tbody td:first-child');
    const r = cell.getBoundingClientRect();
    return { left: Math.round(r.left), text: (cell.innerText || '').trim() };
  });
  check('390: the first column stays in view after scrolling right', identity.left >= 0 && identity.left < 120, `left=${identity.left} "${identity.text}"`);
  check('390: the page itself does not overflow', s.docOverflow === false);
  await page.close();
}

// ---- 768: wider mobile ---------------------------------------------------
{
  const page = await open(join(CASE, 'app'), 768, 900);
  const s = await state(page);
  const consistent = (s.overflow === 'true') === s.hintVisible && (s.overflow === 'true') === (s.fadeOpacity > 0.5);
  check('768: the affordance matches the measured overflow', consistent,
    `overflow=${s.overflow} hint=${s.hintVisible} fade=${s.fadeOpacity}`);
  check('768: every column is present', s.headers === 5 && s.cells === 5);
  await page.close();
}

// ---- 1440: desktop, no affordance needed ---------------------------------
{
  const page = await open(join(CASE, 'app'), 1440, 900);
  const s = await state(page);
  check('1440: the table fits, so no affordance is shown',
    s.overflow === 'false' && s.hintVisible === false && s.fadeOpacity < 0.5,
    `overflow=${s.overflow} hint=${s.hintVisible}`);
  check('1440: every column is present', s.headers === 5 && s.cells === 5);
  await page.close();
}

// ---- injected defect: affordance removed, must be detectable ------------
{
  rmSync(TMP, { recursive: true, force: true });
  mkdirSync(TMP, { recursive: true });
  for (const f of ['index.html', 'styles.css', 'data.js', 'app.js']) cpSync(join(CASE, 'app', f), join(TMP, f));
  const css = readFileSync(join(TMP, 'styles.css'), 'utf8');
  // the exact regression: a scroll container with the hint and fade removed
  writeFileSync(join(TMP, 'styles.css'), css + '\n.table-fade { display: none !important; }\n.table-hint { display: none !important; }\n');
  const page = await open(TMP, 390, 844);
  const s = await state(page);
  check('INJECTED: removing the affordance leaves a scroll container with no discoverable cue',
    s.scrolls === true && s.hintVisible === false && s.fadeOpacity < 0.5,
    `scrolls=${s.scrolls} hint=${s.hintVisible} fade=${s.fadeOpacity}`);
  await page.close();
}

// ---- injected defect: a column dropped, must be detectable --------------
{
  rmSync(TMP, { recursive: true, force: true });
  mkdirSync(TMP, { recursive: true });
  for (const f of ['index.html', 'styles.css', 'data.js', 'app.js']) cpSync(join(CASE, 'app', f), join(TMP, f));
  const app = readFileSync(join(TMP, 'app.js'), 'utf8');
  writeFileSync(join(TMP, 'app.js'), app.replace("cols.map(function (c) {", "cols.slice(0,3).map(function (c) {"));
  const page = await open(TMP, 390, 844);
  const s = await state(page);
  check('INJECTED: dropping a column reduces the rendered header count',
    s.headers === 3, `${s.headers} headers`);
  check('a dropped column is a detectable data loss, not a layout choice', s.headers !== 5);
  await page.close();
}

rmSync(TMP, { recursive: true, force: true });
await b.close();
const passed = results.filter(Boolean).length;
console.log(`RESULT ${passed}/${results.length}`);
process.exit(passed === results.length ? 0 : 1);
