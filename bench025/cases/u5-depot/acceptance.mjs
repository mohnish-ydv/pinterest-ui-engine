// Acceptance — U5 Depot (operational queue). Written from the brief.
import { runSuite } from '../../../bench/lib/harness.mjs';
await runSuite('U5. Depot — operational queue', process.argv[2], async (t) => {
  t.check('T1 5 ticket rows render', await t.count('[data-testid="ticket-row"]') === 5, `rows=${await t.count('[data-testid="ticket-row"]')}`);
  t.check('T2 the table has 5 column headers', await t.count('[data-testid="table-head"]') === 5, `heads=${await t.count('[data-testid="table-head"]')}`);
  const listText = await t.page.evaluate(() => { const m = document.querySelector('main'); return m ? m.innerText.replace(/\s+/g,' ') : ''; });
  t.check('T3 the ticket age is visible in the list', listText.indexOf('31') !== -1 && /age/i.test(listText), listText.slice(0, 80));
  await t.click('[data-testid="priority-chip"][data-priority="P1"]'); await t.sleep(220);
  t.check('T4 priority P1 leaves 2', await t.count('[data-testid="ticket-row"]') === 2, `rows=${await t.count('[data-testid="ticket-row"]')}`);
  await t.click('[data-testid="priority-chip"][data-priority="All"]'); await t.sleep(200);
  await t.type('[data-testid="search"]', 'invoice'); await t.sleep(250);
  t.check('T5 searching "invoice" leaves 1', await t.count('[data-testid="ticket-row"]') === 1, `rows=${await t.count('[data-testid="ticket-row"]')}`);
  await t.type('[data-testid="search"]', ''); await t.sleep(200);
  await t.click('[data-testid="ticket-row"][data-id="t1"]'); await t.sleep(320);
  t.check('T6 opening a ticket shows its reference', (await t.text('[data-testid="detail-title"]')) === 'DP-4471', await t.text('[data-testid="detail-title"]'));
  const ov = await t.page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  t.check('T7 no horizontal overflow at 390', !ov);
  t.check('T8 no page or console errors', t.errors.length === 0, t.errors.slice(0,2).join(' | '));
});
