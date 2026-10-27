// Acceptance — U1 Trellis (analytics dashboard). Written from the brief.
import { runSuite } from '../../../bench/lib/harness.mjs';
await runSuite('U1. Trellis — analytics dashboard', process.argv[2], async (t) => {
  t.check('T1 5 campaign rows render', await t.count('[data-testid="campaign-row"]') === 5, `rows=${await t.count('[data-testid="campaign-row"]')}`);
  t.check('T2 a KPI row of 4 tiles with values', await t.count('[data-testid="kpi-tile"]') === 4 && await t.count('[data-testid="kpi-value"]') === 4);
  t.check('T3 a date-range control offers 3 ranges', await t.count('[data-testid="range-chip"]') === 3, `ranges=${await t.count('[data-testid="range-chip"]')}`);
  t.check('T4 the table has 5 column headers', await t.count('[data-testid="table-head"]') === 5, `heads=${await t.count('[data-testid="table-head"]')}`);
  const listText = await t.page.evaluate(() => { const m = document.querySelector('main'); return m ? m.innerText.replace(/\s+/g,' ') : ''; });
  t.check('T5 spend is visible in the list', listText.indexOf('\u20b94,80,000') !== -1 || listText.indexOf('4,80,000') !== -1, listText.slice(0, 90));
  await t.click('[data-testid="channel-chip"][data-channel="Paid search"]'); await t.sleep(220);
  t.check('T6 channel filter Paid search leaves 1', await t.count('[data-testid="campaign-row"]') === 1, `rows=${await t.count('[data-testid="campaign-row"]')}`);
  await t.click('[data-testid="channel-chip"][data-channel="All"]'); await t.sleep(200);
  await t.type('[data-testid="search"]', 'digest'); await t.sleep(250);
  t.check('T7 searching "digest" leaves 1', await t.count('[data-testid="campaign-row"]') === 1, `rows=${await t.count('[data-testid="campaign-row"]')}`);
  await t.type('[data-testid="search"]', ''); await t.sleep(200);
  await t.click('[data-testid="campaign-row"][data-id="m1"]'); await t.sleep(320);
  t.check('T8 opening a campaign shows its detail', (await t.text('[data-testid="detail-title"]')) === 'Monsoon sale — search', await t.text('[data-testid="detail-title"]'));
  t.check('T9 no page or console errors', t.errors.length === 0, t.errors.slice(0,2).join(' | '));
});
