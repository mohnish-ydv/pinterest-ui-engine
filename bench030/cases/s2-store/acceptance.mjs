// Acceptance — S2 Store. Written from the product requirements only.
import { runSuite } from '../../../bench/lib/harness.mjs';
await runSuite('S2. Store — units in every row', process.argv[2], async (t) => {
  t.check('R1 five items are listed', await t.count('[data-testid="item-card"]') === 5, `n=${await t.count('[data-testid="item-card"]')}`);
  const items = await t.page.evaluate(() => Array.from(document.querySelectorAll('[data-testid="item-card"]')).map(e => e.innerText.replace(/\s+/g, ' ')));
  t.check('R2 EVERY row shows a quantity WITH its unit',
    items.length === 5 && items.every(x => /\d+\s*(kg|litre|jar)/i.test(x)),
    items.map(x => x.slice(0, 40)).join(' | '));
  t.check('R3 EVERY row shows whether to reorder',
    items.every(x => /\b(Yes|No)\b/.test(x)), items.map(x => x.slice(0, 40)).join(' | '));
  await t.click('[data-testid="category-chip"][data-category="Dry"]'); await t.sleep(240);
  t.check('R4 filtering by category leaves 3', await t.count('[data-testid="item-card"]') === 3, `n=${await t.count('[data-testid="item-card"]')}`);
  await t.click('[data-testid="category-chip"][data-category="All"]'); await t.sleep(200);
  await t.click('[data-testid="item-card"][data-id="i3"]'); await t.sleep(340);
  t.check('R5 opening an item shows its detail', /Sunflower/.test(await t.page.evaluate(() => document.querySelector('main').innerText)));
  t.check('R6 no page or console errors', t.errors.length === 0, t.errors.slice(0, 2).join(' | '));
});
