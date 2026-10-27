// Acceptance — S1 Dispatch. Written from the product requirements only.
import { runSuite } from '../../../bench/lib/harness.mjs';
await runSuite('S1. Dispatch — entry scope', process.argv[2], async (t) => {
  t.check('R1 four pieces are listed', await t.count('[data-testid="piece-card"]') === 4, `n=${await t.count('[data-testid="piece-card"]')}`);
  const items = await t.page.evaluate(() => Array.from(document.querySelectorAll('[data-testid="piece-card"]')).map(e => e.innerText.replace(/\s+/g, ' ')));
  const need = [['queue outside','the first entry'],['Six hundred people','a summary'],['Meera','a reporter'],['9','a reading time']];
  t.check('R2 EVERY entry shows headline, summary, reporter and reading time',
    items.length === 4 && items.every(txt => /queue outside|fifth floor|licence clerk|tanker/.test(txt) && /summary|Six hundred|Pressure is|A counter|Four hundred/.test(txt) && /Meera|Anil|Farah/.test(txt) && /\b(9|12|7|5)\b/.test(txt)),
    items.map(x => x.slice(0, 60)).join(' | '));
  t.check('R3 no cards (prohibited)', await t.count('.card') === 0);
  t.check('R4 no images (prohibited)', await t.page.evaluate(() => document.querySelectorAll('main img, .card-media').length) === 0);
  await t.click('[data-testid="section-chip"][data-section="Water"]'); await t.sleep(240);
  t.check('R5 filtering by section leaves 2', await t.count('[data-testid="piece-card"]') === 2, `n=${await t.count('[data-testid="piece-card"]')}`);
  await t.click('[data-testid="section-chip"][data-section="All"]'); await t.sleep(200);
  await t.click('[data-testid="piece-card"][data-id="d2"]'); await t.sleep(340);
  const body = await t.page.evaluate(() => { const e = document.querySelector('[data-testid="article-body"]'); return e ? e.textContent.replace(/\s+/g, ' ') : ''; });
  t.check('R6 opening a piece shows the full copy', /pump runs for two hours/.test(body), body.slice(0, 80));
  await t.page.setViewport({ width: 1440, height: 900 }); await t.sleep(200);
  const m = await t.measureWidth('[data-testid="article-body"]');
  t.check('R7 the copy has a comfortable line length', !!m && m.chars >= 45 && m.chars <= 80, m ? `${m.chars}` : 'none');
  await t.page.setViewport({ width: 390, height: 844 }); await t.sleep(150);
  t.check('R8 no page or console errors', t.errors.length === 0, t.errors.slice(0, 2).join(' | '));
});
