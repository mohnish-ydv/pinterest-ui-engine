// Acceptance — S4 Desk. Written from the product requirements only.
import { runSuite } from '../../../bench/lib/harness.mjs';
await runSuite('S4. Desk — confirmation scope', process.argv[2], async (t) => {
  t.check('R1 four categories are listed', await t.count('[data-testid="category-card"]') === 4, `n=${await t.count('[data-testid="category-card"]')}`);
  const items = await t.page.evaluate(() => Array.from(document.querySelectorAll('[data-testid="category-card"]')).map(e => e.innerText.replace(/\s+/g, ' ')));
  t.check('R2 every entry shows category, team and SLA',
    items.every(x => /Facilities|Housekeeping|Security/.test(x) && /\d+\s*h/.test(x)), items.map(x => x.slice(0, 40)).join(' | '));
  await t.click('[data-testid="category-card"][data-id="c1"]'); await t.sleep(340);
  const steps = await t.count('[data-testid="step"]');
  t.check('R3 raising a ticket is a three-step flow', steps === 3, `steps=${steps}`);
  await t.click('[data-testid="step-next"]'); await t.sleep(240);
  const errs = await t.page.evaluate(() => Array.from(document.querySelectorAll('[data-testid^="error-"]')).filter(e => !e.hidden && e.offsetParent).length);
  t.check('R4 an incomplete step is refused', errs > 0, `errors=${errs}`);
  const fill = () => t.page.evaluate(() => {
    document.querySelectorAll('[data-act="field"]').forEach(i => {
      if (!i.value) { i.value = i.type === 'tel' ? '9876543210' : (i.getAttribute('data-field') === 'email' ? 'a@b.com' : 'Nadia'); i.dispatchEvent(new Event('input', { bubbles: true })); }
    });
  });
  for (let i = 0; i < 3; i++) { await fill(); await t.click('[data-testid="step-next"]').catch(()=>{}); await t.sleep(240); }
  await fill(); await t.click('[data-testid="confirm-btn"]').catch(()=>{}); await t.sleep(420);
  const ref = await t.page.evaluate(() => { const e = document.querySelector('[data-testid="confirm-ref"], [data-testid="ticket-ref"]'); return e ? e.innerText.trim() : ''; });
  t.check('R5 a visible confirmation with a reference is shown', /^[A-Z]{2}-\d{6}$/.test(ref), ref || 'none');
  t.check('R6 no page or console errors', t.errors.length === 0, t.errors.slice(0, 2).join(' | '));
});
