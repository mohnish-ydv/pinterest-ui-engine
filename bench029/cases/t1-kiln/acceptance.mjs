// Acceptance — T1 Kiln. Written from the product requirements only.
import { runSuite } from '../../../bench/lib/harness.mjs';
await runSuite('T1. Kiln — commerce gallery', process.argv[2], async (t) => {
  t.check('R1 six pieces are shown', await t.count('[data-testid="piece-card"]') === 6, `n=${await t.count('[data-testid="piece-card"]')}`);
  const media = await t.page.evaluate(() => document.querySelectorAll('[data-testid="piece-card"] .card-media, [data-testid="piece-card"] img').length);
  t.check('R2 the photograph leads on every card', media === 6, `media=${media}`);
  const row = await t.page.evaluate(() => { const c = document.querySelector('[data-testid="piece-card"]'); return c ? c.innerText.replace(/\s+/g, ' ') : ''; });
  t.check('R3 the price sits on the card', /1,850/.test(row), row.slice(0, 80));
  await t.click('[data-testid="glaze-chip"][data-glaze="Ash"]'); await t.sleep(240);
  t.check('R4 filtering by glaze leaves 2', await t.count('[data-testid="piece-card"]') === 2, `n=${await t.count('[data-testid="piece-card"]')}`);
  await t.click('[data-testid="glaze-chip"][data-glaze="All"]'); await t.sleep(200);
  await t.type('[data-testid="search"]', 'loom'); await t.sleep(260);
  t.check('R5 searching a studio leaves 2', await t.count('[data-testid="piece-card"]') === 2, `n=${await t.count('[data-testid="piece-card"]')}`);
  await t.type('[data-testid="search"]', ''); await t.sleep(200);
  await t.click('[data-testid="piece-card"][data-id="k3"]'); await t.sleep(340);
  const det = await t.page.evaluate(() => { const m = document.querySelector('main'); return m ? m.innerText.replace(/\s+/g, ' ') : ''; });
  t.check('R6 the detail shows the note and price', /whole fish/.test(det) && /2,600/.test(det), det.slice(0, 100));
  t.check('R7 no page or console errors', t.errors.length === 0, t.errors.slice(0, 2).join(' | '));
});
