// Acceptance suite — Case A: Pulse analytics dashboard.
// Written from the BRIEF, independent of the engine's layout IR.
// Requirements: a KPI row, a date-range control, a channel table with headers,
// filtering, search, and a channel detail with revenue.
import { runSuite } from '../../lib/harness.mjs';
await runSuite('A. Pulse — analytics dashboard', process.argv[2], async (t) => {
  t.check('T1 brand and page heading render', (await t.text('.brand-name')) === 'Pulse' && !!(await t.text('.page-title')));
  t.check('T2 a KPI row of 4 tiles is present', await t.count('[data-testid="kpi-tile"]') === 4, `tiles=${await t.count('[data-testid="kpi-tile"]')}`);
  t.check('T3 each KPI tile shows a value', await t.count('[data-testid="kpi-tile"] [data-testid="kpi-value"]') === 4);
  t.check('T4 a date-range control offers 3 ranges', await t.count('[data-testid="range-chip"]') === 3, `ranges=${await t.count('[data-testid="range-chip"]')}`);
  t.check('T5 the channel table has 4 column headers', await t.count('[data-testid="table-head"]') === 4, `heads=${await t.count('[data-testid="table-head"]')}`);
  t.check('T6 5 channel rows render', await t.count('[data-testid="channel-row"]') === 5, `rows=${await t.count('[data-testid="channel-row"]')}`);

  await t.click('[data-testid="kind-chip"][data-kind="Paid"]'); await t.sleep(220);
  t.check('T7 filtering to Paid leaves 2 channels', await t.count('[data-testid="channel-row"]') === 2, `rows=${await t.count('[data-testid="channel-row"]')}`);
  await t.click('[data-testid="kind-chip"][data-kind="All"]'); await t.sleep(200);
  await t.type('[data-testid="search"]', 'news'); await t.sleep(250);
  t.check('T8 searching "news" leaves 1 channel', await t.count('[data-testid="channel-row"]') === 1, `rows=${await t.count('[data-testid="channel-row"]')}`);
  await t.type('[data-testid="search"]', ''); await t.sleep(200);

  await t.click('[data-testid="channel-row"][data-id="c1"]'); await t.sleep(300);
  t.check('T9 opening a channel shows its detail', (await t.text('[data-testid="detail-title"]')) === 'Google Ads', await t.text('[data-testid="detail-title"]'));
  const rev = await t.text('[data-testid="detail-price"]');
  t.check('T10 revenue is money-formatted in rupees', !!rev && rev.indexOf('\u20b9') !== -1, rev);
  t.check('T11 no page or console errors', t.errors.length === 0, t.errors.slice(0, 2).join(' | '));
});
