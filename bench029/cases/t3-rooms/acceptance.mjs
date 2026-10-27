// Acceptance — T3 Rooms. Written from the product requirements only.
import { runSuite } from '../../../bench/lib/harness.mjs';
await runSuite('T3. Rooms — single-column list', process.argv[2], async (t) => {
  t.check('R1 five rooms are listed', await t.count('[data-testid="room-card"]') === 5, `n=${await t.count('[data-testid="room-card"]')}`);
  const row = await t.page.evaluate(() => { const c = document.querySelector('[data-testid="room-card"]'); return c ? c.innerText.replace(/\s+/g, ' ') : ''; });
  t.check('R2 a row shows room, floor, seats and status', /Cauvery/.test(row) && /2/.test(row) && /8/.test(row) && /Free/.test(row), row.slice(0, 90));
  const oneCol = await t.page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('[data-testid="room-card"]')).map(r => Math.round(r.getBoundingClientRect().left));
    return new Set(rows).size === 1;
  });
  t.check('R3 one room per row', oneCol);
  await t.click('[data-testid="status-chip"][data-status="Free"]'); await t.sleep(240);
  t.check('R4 filtering by status leaves 3', await t.count('[data-testid="room-card"]') === 3, `n=${await t.count('[data-testid="room-card"]')}`);
  await t.click('[data-testid="status-chip"][data-status="All"]'); await t.sleep(200);
  await t.click('[data-testid="room-card"][data-id="r3"]'); await t.sleep(340);
  t.check('R5 opening a room shows its detail', /Krishna/.test(await t.page.evaluate(() => document.querySelector('main').innerText)));
  t.check('R6 no page or console errors', t.errors.length === 0, t.errors.slice(0, 2).join(' | '));
});
