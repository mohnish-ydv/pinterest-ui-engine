// Acceptance — N5 Belt. Written from the product requirements only.
import { runSuite } from '../../../bench/lib/harness.mjs';
await runSuite('N5. Belt — operations table', process.argv[2], async (t) => {
  t.check('R1 five faults are listed', await t.count('[data-testid="fault-card"]') === 5, `n=${await t.count('[data-testid="fault-card"]')}`);
  t.check('R2 the faults are presented as a table', await t.count('[data-testid="table-head"]') >= 4);
  const txt = await t.page.evaluate(() => { const m = document.querySelector('main'); return m ? m.innerText.replace(/\s+/g, ' ') : ''; });
  t.check('R3 age and owner are visible', /58/.test(txt) && /Deepa/.test(txt), txt.slice(0, 100));
  await t.click('[data-testid="severity-chip"][data-severity="Critical"]'); await t.sleep(240);
  t.check('R4 filtering by severity leaves 2', await t.count('[data-testid="fault-card"]') === 2, `n=${await t.count('[data-testid="fault-card"]')}`);
  await t.click('[data-testid="severity-chip"][data-severity="All"]'); await t.sleep(200);
  await t.type('[data-testid="search"]', 'diverter'); await t.sleep(260);
  t.check('R5 searching the issue leaves 1', await t.count('[data-testid="fault-card"]') === 1, `n=${await t.count('[data-testid="fault-card"]')}`);
  await t.type('[data-testid="search"]', ''); await t.sleep(200);
  await t.click('[data-testid="fault-card"][data-id="f1"]'); await t.sleep(340);
  t.check('R6 opening a fault shows its detail', /BT-9001/.test(await t.page.evaluate(() => document.querySelector('main').innerText)));
  await t.click('[data-act="back"]').catch(() => {}); await t.sleep(220);
  const cols = await t.page.evaluate(() => {
    const wrap = document.querySelector('[data-testid="table-scroll"]');
    const table = document.querySelector('.datatable');
    return { heads: table ? table.querySelectorAll('thead th').length : 0,
             cells: table ? table.querySelectorAll('tbody tr:first-child td').length : 0,
             scrolls: wrap ? wrap.scrollWidth > wrap.clientWidth + 1 : false,
             hint: !!document.querySelector('[data-testid="table-scroll-hint"]:not([hidden])') };
  });
  t.check('R7 the phone view hides no column', cols.heads >= 4 && cols.cells === cols.heads, `${cols.heads}/${cols.cells}`);
  t.check('R8 a scrolling table says it scrolls', !cols.scrolls || cols.hint);
  t.check('R9 no page or console errors', t.errors.length === 0, t.errors.slice(0, 2).join(' | '));
});
