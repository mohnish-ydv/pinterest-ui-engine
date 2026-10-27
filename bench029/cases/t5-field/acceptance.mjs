// Acceptance — T5 Field. Written from the product requirements only.
// The brief names no composition; the suite therefore requires none.
import { runSuite } from '../../../bench/lib/harness.mjs';
await runSuite('T5. Field — ambiguous evidence', process.argv[2], async (t) => {
  t.check('R1 five responses are shown', await t.count('[data-testid="response-card"]') === 5, `n=${await t.count('[data-testid="response-card"]')}`);
  const txt = await t.page.evaluate(() => { const m = document.querySelector('main'); return m ? m.innerText.replace(/\s+/g, ' ') : ''; });
  t.check('R2 every household is visible', ['H-014','H-027','H-041','H-058','H-063'].every(h => txt.includes(h)), txt.slice(0, 90));
  t.check('R3 hours carry their unit', /3 h/.test(txt) || /5 h/.test(txt), txt.slice(0, 90));
  await t.click('[data-testid="ward-chip"][data-ward="Ward 5"]'); await t.sleep(240);
  t.check('R4 filtering by ward leaves 2', await t.count('[data-testid="response-card"]') === 2, `n=${await t.count('[data-testid="response-card"]')}`);
  await t.click('[data-testid="ward-chip"][data-ward="All"]'); await t.sleep(200);
  await t.click('[data-testid="response-card"][data-id="f2"]'); await t.sleep(340);
  t.check('R5 opening a response shows the comment', /Two tankers a week/.test(await t.page.evaluate(() => document.querySelector('main').innerText)));
  t.check('R6 no page or console errors', t.errors.length === 0, t.errors.slice(0, 2).join(' | '));
});
