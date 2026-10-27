// Acceptance — T4 Lane. Written from the product requirements only.
import { runSuite } from '../../../bench/lib/harness.mjs';
await runSuite('T4. Lane — brief overrides the reference', process.argv[2], async (t) => {
  t.check('R1 six slots are listed', await t.count('[data-testid="slot-card"]') === 6, `n=${await t.count('[data-testid="slot-card"]')}`);
  t.check('R2 no cards (the brief overrides the reference)', await t.count('.card') === 0, `cards=${await t.count('.card')}`);
  const oneCol = await t.page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('[data-testid="slot-card"]')).map(r => Math.round(r.getBoundingClientRect().left));
    return new Set(rows).size === 1;
  });
  t.check('R3 one slot per row, not a grid', oneCol);
  const row = await t.page.evaluate(() => { const c = document.querySelector('[data-testid="slot-card"]'); return c ? c.innerText.replace(/\s+/g, ' ') : ''; });
  t.check('R4 a row shows window, driver and capacity', /09:00/.test(row) && /Anil/.test(row) && /12/.test(row), row.slice(0, 90));
  await t.click('[data-testid="area-chip"][data-area="North"]'); await t.sleep(240);
  t.check('R5 filtering by area leaves 2', await t.count('[data-testid="slot-card"]') === 2, `n=${await t.count('[data-testid="slot-card"]')}`);
  await t.click('[data-testid="area-chip"][data-area="All"]'); await t.sleep(200);
  await t.click('[data-testid="slot-card"][data-id="l1"]'); await t.sleep(340);
  t.check('R6 opening a slot shows its note', /loading bay/.test(await t.page.evaluate(() => document.querySelector('main').innerText)));
  t.check('R7 no page or console errors', t.errors.length === 0, t.errors.slice(0, 2).join(' | '));
});
