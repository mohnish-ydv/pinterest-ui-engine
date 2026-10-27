// Acceptance suite — Case D: Ledger expense claims (multi-step).
// Written from the BRIEF, independent of the engine's layout IR.
// Requirements: a claim list with status, a THREE-STEP filing flow with a step
// indicator and back/next, a filed claim landing in Approvals.
import { runSuite } from '../../lib/harness.mjs';
await runSuite('D. Ledger — multi-step productivity', process.argv[2], async (t) => {
  t.check('T1 5 claims render', await t.count('[data-testid="claim-card"]') === 5, `cards=${await t.count('[data-testid="claim-card"]')}`);
  t.check('T2 every claim carries a status pill', await t.count('[data-testid="claim-card"] .pill') === 5, `pills=${await t.count('[data-testid="claim-card"] .pill')}`);
  await t.click('[data-testid="status-chip"][data-status="Approved"]'); await t.sleep(220);
  t.check('T3 status filter Approved leaves 2', await t.count('[data-testid="claim-card"]') === 2, `cards=${await t.count('[data-testid="claim-card"]')}`);
  await t.click('[data-testid="status-chip"][data-status="All"]'); await t.sleep(200);

  await t.click('[data-testid="claim-card"][data-id="k1"]'); await t.sleep(300);
  t.check('T4 detail shows the claim amount', !!(await t.text('[data-testid="detail-price"]')));
  await t.click('[data-testid="back-btn"]'); await t.sleep(250);

  await t.click('[data-testid="new-claim"]'); await t.sleep(300);
  t.check('T5 filing opens a 3-step flow with a step indicator', await t.count('[data-testid="step"]') === 3, `steps=${await t.count('[data-testid="step"]')}`);
  t.check('T6 step 1 is current', (await t.attr('[data-testid="step"][data-step="1"]', 'data-state')) === 'current');
  await t.setValue('[data-testid="claim-title"]', 'Client dinner, Koramangala');
  await t.setValue('[data-testid="claim-amount"]', '2450');
  await t.click('[data-testid="step-next"]'); await t.sleep(280);
  t.check('T7 advancing moves to step 2', (await t.attr('[data-testid="step"][data-step="2"]', 'data-state')) === 'current', await t.attr('[data-testid="step"][data-step="2"]', 'data-state'));
  await t.click('[data-testid="step-back"]'); await t.sleep(250);
  t.check('T8 going back returns to step 1', (await t.attr('[data-testid="step"][data-step="1"]', 'data-state')) === 'current');
  await t.click('[data-testid="step-next"]'); await t.sleep(250);
  await t.click('[data-testid="step-next"]'); await t.sleep(250);
  t.check('T9 a review step is reached before filing', (await t.attr('[data-testid="step"][data-step="3"]', 'data-state')) === 'current');
  await t.click('[data-testid="file-btn"]'); await t.sleep(420);
  const ref = await t.text('[data-testid="file-ref"]');
  t.check('T10 filing issues an EXP reference', /^EXP-\d{6}$/.test(ref || ''), ref || 'none');

  await t.click('[data-testid="approvals-open"]'); await t.sleep(320);
  t.check('T11 the filed claim lands in Approvals', await t.count('[data-testid="approval-item"]') >= 1, `items=${await t.count('[data-testid="approval-item"]')}`);
  t.check('T12 no page or console errors', t.errors.length === 0, t.errors.slice(0, 2).join(' | '));
});
