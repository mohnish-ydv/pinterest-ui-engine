// stateprobe.test.mjs — tests for the ENGINE'S OWN copy of stateprobe.
//
// Mission 020 (P0.1). The handoff wired `npm run test:stateprobe` to
// slotbook-experiment/tools/stateprobe.test.mjs — a different project's test
// of a different project's copy. Nothing tested the module the engine
// actually imports. This suite does, and it is self-contained: the
// integration fixtures are generated here rather than read out of another
// project's evaluation directory, so deleting slotbook-experiment/ cannot
// silently weaken the engine's own coverage.
//
// The 21 checks are the same checks, same order, same published WCAG anchors.
// Usage: node engine/tests/stateprobe.test.mjs   (exit 0 iff all pass)
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  parseColor, relativeLuminance, compositeOver, contrastRatio,
  launchBrowser, openFixture, runSequence, measure,
} from '../lib/stateprobe.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const OUT = join(here, '.tmp');
mkdirSync(OUT, { recursive: true });

const results = [];
const check = (name, ok, detail = '') => {
  results.push(ok);
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`);
};
const near = (a, b, tol) => Math.abs(a - b) <= tol;

// ---- unit: colour parsing -------------------------------------------------
check('parseColor rgb()', JSON.stringify(parseColor('rgb(11, 107, 74)')) === JSON.stringify({ r: 11, g: 107, b: 74, a: 1 }));
check('parseColor rgba() keeps alpha', parseColor('rgba(0, 0, 0, 0.5)')?.a === 0.5);
check('parseColor transparent', parseColor('transparent')?.a === 0);
check('parseColor #hex', JSON.stringify(parseColor('#0B6B4A')) === JSON.stringify({ r: 11, g: 107, b: 74, a: 1 }));
check('parseColor garbage -> null (no fabricated colour)', parseColor('banana') === null && parseColor('') === null && parseColor(undefined) === null);

// ---- unit: luminance + contrast against published anchors -----------------
check('luminance white = 1, black = 0',
  near(relativeLuminance({ r: 255, g: 255, b: 255 }), 1, 1e-9) && relativeLuminance({ r: 0, g: 0, b: 0 }) === 0);
check('contrast black/white = 21.00', near(contrastRatio(parseColor('#000'), parseColor('#fff')), 21, 0.01),
  String(contrastRatio(parseColor('#000'), parseColor('#fff'))));
check('contrast white/white = 1.00', near(contrastRatio(parseColor('#fff'), parseColor('#fff')), 1, 1e-9));
check('contrast #767676 on white = 4.54 (published WCAG example)',
  near(contrastRatio(parseColor('#767676'), parseColor('#ffffff')), 4.54, 0.01),
  contrastRatio(parseColor('#767676'), parseColor('#ffffff')).toFixed(2));
check('contrast #777777 on white = 4.48 (published WCAG example)',
  near(contrastRatio(parseColor('#777777'), parseColor('#ffffff')), 4.48, 0.01),
  contrastRatio(parseColor('#777777'), parseColor('#ffffff')).toFixed(2));
check('contrast reference pair (verify-r1 defect colours) = 1.36',
  near(contrastRatio(parseColor('rgb(8, 85, 59)'), parseColor('rgb(11, 107, 74)')), 1.36, 0.01),
  contrastRatio(parseColor('rgb(8, 85, 59)'), parseColor('rgb(11, 107, 74)')).toFixed(2));
check('contrast white on reference green = 6.53',
  near(contrastRatio(parseColor('#ffffff'), parseColor('rgb(11, 107, 74)')), 6.53, 0.01),
  contrastRatio(parseColor('#ffffff'), parseColor('rgb(11, 107, 74)')).toFixed(2));
check('contrastRatio with unparseable input = NaN', Number.isNaN(contrastRatio(null, parseColor('#fff'))));

// ---- unit: alpha compositing ----------------------------------------------
{
  const c = compositeOver({ r: 0, g: 0, b: 0, a: 0.5 }, { r: 255, g: 255, b: 255, a: 1 });
  check('compositeOver 50% black over white = 127.5 grey, opaque',
    near(c.r, 127.5, 0.01) && near(c.g, 127.5, 0.01) && c.a === 1);
  check('contrast of 50%-black-on-white composite = 3.98',
    near(contrastRatio(parseColor('rgba(0, 0, 0, 0.5)'), parseColor('#ffffff')), 3.98, 0.01),
    contrastRatio(parseColor('rgba(0, 0, 0, 0.5)'), parseColor('#ffffff')).toFixed(2));
}

// ---- integration: failure cases + stale-node discipline -------------------
// Self-contained fixture reproducing the behaviour the original cal-verify
// fixture provided: a provider list that reveals slots, and slots that
// re-render into a distinct selected state.
const FIX = join(OUT, 'slot-fixture');
mkdirSync(FIX, { recursive: true });
writeFileSync(join(FIX, 'index.html'), `<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>slot fixture</title><style>
 body{margin:0;font-family:sans-serif;background:#F4F7FB;color:#16283F}
 .wrap{padding:16px;max-width:420px}
 .slot{border:1.5px solid #E4EDFB;background:#FFFFFF;color:#16283F;border-radius:10px;padding:10px;margin:6px 0;font-weight:600}
 .slot[data-state="selected"]{background:#2F6FDE;color:#FFFFFF;border-color:#2F6FDE}
 #slots[hidden]{display:none}
</style></head><body><div class="wrap">
<button data-testid="provider-open" id="open">Open provider</button>
<div id="slots" hidden>
  <button class="slot" data-testid="slot" data-slot="10:00" data-state="free">10:00</button>
  <button class="slot" data-testid="slot" data-slot="10:30" data-state="free">10:30</button>
</div></div>
<script>
 document.getElementById('open').addEventListener('click',()=>{
   const s=document.getElementById('slots'); s.hidden=false;
 });
 // re-render on selection: the node is REPLACED, so a stale handle would lie
 document.querySelectorAll('[data-testid="slot"]').forEach(b=>{
   b.addEventListener('click',()=>{
     document.querySelectorAll('[data-testid="slot"]').forEach(x=>x.dataset.state='free');
     const fresh=b.cloneNode(true); fresh.dataset.state='selected'; b.replaceWith(fresh);
     fresh.addEventListener('click',()=>{});
   });
 });
</script></body></html>`);

const SLOT = '[data-testid="slot"][data-slot="10:00"]';
const browser = await launchBrowser();
try {
  const { page } = await openFixture(browser, { root: FIX, id: 'slot-fixture' });

  const missing = await measure(page, { selector: '[data-testid="no-such-thing"]', fixture: 'slot-fixture' });
  check('missing selector -> structured SELECTOR_NOT_FOUND, no throw',
    missing.ok === false && missing.error.code === 'SELECTOR_NOT_FOUND');

  const badSeq = await runSequence(page, [{ do: 'click', selector: '[data-testid="no-such-thing"]', settleMs: 50 }]);
  check('unreachable step -> structured failure at step 0',
    badSeq.ok === false && badSeq.failedStep === 0 && !!badSeq.error.code, JSON.stringify(badSeq.error || {}));

  await runSequence(page, [{ do: 'click', selector: '[data-testid="provider-open"]', settleMs: 400 }]);
  const free = await measure(page, { selector: SLOT, fixture: 'slot-fixture' });
  check('slot measurable in free state before selection',
    free.ok === true && free.state === 'free', `state=${free.state} ratio=${free.ratio}`);

  await runSequence(page, [{ do: 'click', selector: SLOT, settleMs: 500 }]);
  const sel = await measure(page, { selector: SLOT, fixture: 'slot-fixture' });
  check('re-measure after re-render returns fresh selected state (no stale handle)',
    sel.ok === true && sel.state === 'selected' && sel.foreground.css !== free.foreground.css,
    `fg ${free.foreground?.css} -> ${sel.foreground?.css}`);
} finally {
  await browser.close();
}

// ---- integration: alpha / transparent backgrounds (synthetic fixture) -----
writeFileSync(join(OUT, 'alpha-fixture.html'), `<!doctype html><html><head><meta charset="utf-8"><title>alpha fixture</title></head>
<body style="margin:0;background:#336699">
<div style="background:#ffffff;padding:20px;width:220px"><span id="alpha-text" style="color:rgba(0,0,0,0.5);font-size:20px">Alpha</span></div>
<div style="background:rgba(255,0,0,0.5);padding:20px;width:220px"><span id="tint-text" style="color:#000000;font-size:20px">Tint</span></div>
</body></html>`);
const browser2 = await launchBrowser();
try {
  const page = await browser2.newPage();
  await page.setViewport({ width: 390, height: 844 });
  await page.goto('file://' + join(OUT, 'alpha-fixture.html'), { waitUntil: 'networkidle0' });

  const a = await measure(page, { selector: '#alpha-text', fixture: 'alpha-fixture' });
  check('alpha foreground composited over walked-to opaque background',
    a.ok === true && a.foreground.composited === 'rgb(128, 128, 128)' && a.background.composited === 'rgb(255, 255, 255)' && near(a.ratio, 3.98, 0.02),
    `fg=${a.foreground?.composited} bg=${a.background?.composited} ratio=${a.ratio}`);

  const t = await measure(page, { selector: '#tint-text', fixture: 'alpha-fixture' });
  check('translucent ancestor layer composited into effective background',
    t.ok === true && t.background.composited === 'rgb(153, 51, 77)' && t.background.chain.length >= 3,
    `bg=${t.background?.composited} chain=${JSON.stringify(t.background?.chain)}`);
} finally {
  await browser2.close();
}

const passed = results.filter(Boolean).length;
console.log(`RESULT ${passed}/${results.length}`);
process.exit(passed === results.length ? 0 : 1);
