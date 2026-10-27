// Acceptance — S6 Market. Written from the product requirements only.
import { runSuite } from '../../../bench/lib/harness.mjs';
await runSuite('S6. Market — card scope with units', process.argv[2], async (t) => {
  t.check('R1 six stalls are shown', await t.count('[data-testid="stall-card"]') === 6, `n=${await t.count('[data-testid="stall-card"]')}`);
  const cards = await t.page.evaluate(() => Array.from(document.querySelectorAll('[data-testid="stall-card"]')).map(e => e.innerText.replace(/\s+/g, ' ')));
  t.check('R2 EVERY card shows produce, rate WITH unit and grade',
    cards.length === 6 && cards.every(x => /Spinach|Drumstick|Banana|Coconut|Tomato|Ginger/.test(x) && /\u20b9?\s*\d+\s*\/?(kg|piece)/i.test(x) && /\b[AB]\b/.test(x)),
    cards.map(x => x.slice(0, 50)).join(' | '));
  await t.click('[data-testid="grade-chip"][data-grade="A"]'); await t.sleep(240);
  t.check('R3 filtering by grade leaves 4', await t.count('[data-testid="stall-card"]') === 4, `n=${await t.count('[data-testid="stall-card"]')}`);
  await t.click('[data-testid="grade-chip"][data-grade="All"]'); await t.sleep(200);
  await t.click('[data-testid="stall-card"][data-id="k1"]'); await t.sleep(340);
  t.check('R4 opening a stall shows its note', /Cut this morning/.test(await t.page.evaluate(() => document.querySelector('main').innerText)));
  t.check('R5 no page or console errors', t.errors.length === 0, t.errors.slice(0, 2).join(' | '));
});
