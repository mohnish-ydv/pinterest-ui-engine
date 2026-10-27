// Acceptance — S3 Brief. Written from the product requirements only.
// Note: the record must NOT appear on the list — the requirement says the list
// shows three things only. This is the inverse of the usual scope test.
import { runSuite } from '../../../bench/lib/harness.mjs';
await runSuite('S3. Brief — detail scope only', process.argv[2], async (t) => {
  t.check('R1 three matters are listed', await t.count('[data-testid="matter-card"]') === 3, `n=${await t.count('[data-testid="matter-card"]')}`);
  const items = await t.page.evaluate(() => Array.from(document.querySelectorAll('[data-testid="matter-card"]')).map(e => e.innerText.replace(/\s+/g, ' ')));
  t.check('R2 every entry shows matter, court and status',
    items.every(x => /Sharma|Iyer|Coastal/.test(x) && /Court|District|Revenue/.test(x) && /Open|Closed/.test(x)),
    items.map(x => x.slice(0, 50)).join(' | '));
  t.check('R3 the record is not on the list', !items.some(x => /1974 Act|arrears|eleven years/.test(x)),
    items.map(x => x.slice(0, 50)).join(' | '));
  await t.click('[data-testid="status-chip"][data-status="Open"]'); await t.sleep(240);
  t.check('R4 filtering by status leaves 2', await t.count('[data-testid="matter-card"]') === 2, `n=${await t.count('[data-testid="matter-card"]')}`);
  await t.click('[data-testid="status-chip"][data-status="All"]'); await t.sleep(200);
  await t.click('[data-testid="matter-card"][data-id="m1"]'); await t.sleep(340);
  const det = await t.page.evaluate(() => { const m = document.querySelector('main'); return m ? m.innerText.replace(/\s+/g, ' ') : ''; });
  t.check('R5 opening a matter shows the complete record', /1974 Act/.test(det) && /autumn list/.test(det), det.slice(0, 100));
  t.check('R6 no page or console errors', t.errors.length === 0, t.errors.slice(0, 2).join(' | '));
});
