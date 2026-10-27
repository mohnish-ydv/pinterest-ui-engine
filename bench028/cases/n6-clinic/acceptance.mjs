// Acceptance — N6 Clinic. Written from the product requirements only.
import { runSuite } from '../../../bench/lib/harness.mjs';
await runSuite('N6. Clinic — booking wizard', process.argv[2], async (t) => {
  t.check('R1 four clinics are listed', await t.count('[data-testid="clinic-card"]') === 4, `n=${await t.count('[data-testid="clinic-card"]')}`);
  await t.click('[data-testid="area-chip"][data-area="North"]'); await t.sleep(240);
  t.check('R2 filtering by area leaves 2', await t.count('[data-testid="clinic-card"]') === 2, `n=${await t.count('[data-testid="clinic-card"]')}`);
  await t.click('[data-testid="area-chip"][data-area="All"]'); await t.sleep(200);
  await t.type('[data-testid="search"]', 'rao'); await t.sleep(260);
  t.check('R3 searching a doctor leaves 1', await t.count('[data-testid="clinic-card"]') === 1, `n=${await t.count('[data-testid="clinic-card"]')}`);
  await t.type('[data-testid="search"]', ''); await t.sleep(200);
  await t.click('[data-testid="clinic-card"][data-id="c1"]'); await t.sleep(340);
  const steps = await t.count('[data-testid="step"]');
  t.check('R4 booking is a three-step flow', steps === 3, `steps=${steps}`);
  t.check('R5 the first step is current', (await t.attr('[data-testid="step"][data-step="1"]', 'data-state')) === 'current');
  await t.click('[data-testid="step-next"]'); await t.sleep(250);
  const errs = await t.page.evaluate(() => Array.from(document.querySelectorAll('[data-testid^="error-"]')).filter(e => !e.hidden && e.offsetParent).length);
  t.check('R6 an incomplete step is refused', errs > 0, `errors=${errs}`);
  const fill = () => t.page.evaluate(() => {
    document.querySelectorAll('[data-act="field"]').forEach(i => {
      if (!i.value) { i.value = i.type === 'tel' ? '9876543210' : (i.getAttribute('data-field') === 'email' ? 'n@example.com' : 'Nadia'); i.dispatchEvent(new Event('input', { bubbles: true })); }
    });
  });
  await fill(); await t.click('[data-testid="step-next"]'); await t.sleep(260);
  await fill(); await t.click('[data-testid="step-next"]'); await t.sleep(260);
  await fill(); await t.click('[data-testid="step-next"]'); await t.sleep(260);
  const ref = await t.page.evaluate(() => { const e = document.querySelector('[data-testid="confirm-ref"], [data-testid="booking-ref"]'); return e ? e.innerText.trim() : ''; });
  t.check('R7 confirming issues a booking reference', /^[A-Z]{2}-\d{6}$/.test(ref), ref || 'none');
  t.check('R8 no page or console errors', t.errors.length === 0, t.errors.slice(0, 2).join(' | '));
});
