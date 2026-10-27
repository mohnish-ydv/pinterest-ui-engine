// Acceptance — S5 Grid. Written from the product requirements only.
import { runSuite } from '../../../bench/lib/harness.mjs';
await runSuite('S5. Grid — table scope', process.argv[2], async (t) => {
  t.check('R1 five readings are listed', await t.count('[data-testid="reading-card"]') === 5, `n=${await t.count('[data-testid="reading-card"]')}`);
  t.check('R2 the readings are presented as a table', await t.count('[data-testid="table-head"]') >= 4);
  const rows = await t.page.evaluate(() => Array.from(document.querySelectorAll('[data-testid="reading-card"]')).map(e => e.innerText.replace(/\s+/g, ' ')));
  t.check('R3 EVERY row shows meter, site, reading and change',
    rows.length === 5 && rows.every(x => /M-\d+/.test(x) && /North|South|East/.test(x) && /\d{3,}/.test(x) && /\b\d{1,3}\b/.test(x)),
    rows.map(x => x.slice(0, 40)).join(' | '));
  await t.click('[data-testid="site-chip"][data-site="South"]'); await t.sleep(240);
  t.check('R4 filtering by site leaves 2', await t.count('[data-testid="reading-card"]') === 2, `n=${await t.count('[data-testid="reading-card"]')}`);
  await t.click('[data-testid="site-chip"][data-site="All"]'); await t.sleep(200);
  await t.click('[data-testid="reading-card"][data-id="g3"]'); await t.sleep(340);
  t.check('R5 opening a reading shows its detail', /M-201/.test(await t.page.evaluate(() => document.querySelector('main').innerText)));
  await t.click('[data-act="back"]').catch(()=>{}); await t.sleep(220);
  const cols = await t.page.evaluate(() => {
    const wrap = document.querySelector('[data-testid="table-scroll"]');
    const table = document.querySelector('.datatable');
    return { heads: table ? table.querySelectorAll('thead th').length : 0,
             cells: table ? table.querySelectorAll('tbody tr:first-child td').length : 0,
             hint: !!document.querySelector('[data-testid="table-scroll-hint"]:not([hidden])'),
             scrolls: wrap ? wrap.scrollWidth > wrap.clientWidth + 1 : false };
  });
  t.check('R6 the phone view hides no column', cols.heads >= 4 && cols.cells === cols.heads, `${cols.heads}/${cols.cells}`);
  t.check('R7 a scrolling table says it scrolls', !cols.scrolls || cols.hint);
  t.check('R8 no page or console errors', t.errors.length === 0, t.errors.slice(0, 2).join(' | '));
});
