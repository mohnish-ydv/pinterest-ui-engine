// Acceptance — neutral brief. Written from the product requirements only.
// Note: this suite deliberately does NOT require a particular composition.
// It asks only that the requirements are met, so that a composition chosen
// from the reference can still pass.
import { runSuite } from '../../../bench/lib/harness.mjs';
await runSuite('N2. Larder — neutral brief, text-led reference', process.argv[2], async (t) => {
  t.check('R1 six items are shown', await t.count('[data-testid="item-card"]') === 6, `n=${await t.count('[data-testid="item-card"]')}`);
  const txt = await t.page.evaluate(() => { const m = document.querySelector('main'); return m ? m.innerText.replace(/\s+/g, ' ') : ''; });
  t.check('R2 every item name is visible', ['Toor dal','Coconut oil','Basmati rice','Curry leaf','Tamarind','Ghee'].every(n => txt.includes(n)), txt.slice(0, 90));
  t.check('R3 quantities are visible', /2 kg/.test(txt) || (/2/.test(txt) && /kg/.test(txt)), txt.slice(0, 90));
  await t.type('[data-testid="search"]', 'tamarind'); await t.sleep(260);
  t.check('R4 searching by item leaves 1', await t.count('[data-testid="item-card"]') === 1, `n=${await t.count('[data-testid="item-card"]')}`);
  await t.type('[data-testid="search"]', ''); await t.sleep(200);
  await t.click('[data-testid="item-card"][data-id="n1"]'); await t.sleep(340);
  const det = await t.page.evaluate(() => { const m = document.querySelector('main'); return m ? m.innerText.replace(/\s+/g, ' ') : ''; });
  t.check('R5 opening an item shows its note', /March run/.test(det), det.slice(0, 90));
  const ov = await t.page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  t.check('R6 no horizontal overflow at 390', !ov);
  t.check('R7 no page or console errors', t.errors.length === 0, t.errors.slice(0, 2).join(' | '));
});
