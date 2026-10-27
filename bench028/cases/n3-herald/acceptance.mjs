// Acceptance — N3 Herald. Written from the product requirements only.
import { runSuite } from '../../../bench/lib/harness.mjs';
await runSuite('N3. Herald — editorial index', process.argv[2], async (t) => {
  t.check('R1 four dispatches are listed', await t.count('[data-testid="dispatch-card"]') === 4, `n=${await t.count('[data-testid="dispatch-card"]')}`);
  const row = await t.page.evaluate(() => { const c = document.querySelector('[data-testid="dispatch-card"]'); return c ? c.innerText.replace(/\s+/g, ' ') : ''; });
  t.check('R2 an entry shows headline, summary, reporter and reading time', /well under the car park/.test(row) && /1912/.test(row) && /Meera Suresh/.test(row) && /14/.test(row), row.slice(0, 120));
  t.check('R3 no cards (prohibited)', await t.count('.card') === 0);
  t.check('R4 no images (prohibited)', await t.page.evaluate(() => document.querySelectorAll('main img, .card-media').length) === 0);
  t.check('R5 no decorative initials (prohibited)', await t.page.evaluate(() => document.querySelectorAll('.row-chip, .card-chip').length) === 0);
  await t.click('[data-testid="section-chip"][data-section="Water"]'); await t.sleep(240);
  t.check('R6 filtering by section leaves 2', await t.count('[data-testid="dispatch-card"]') === 2, `n=${await t.count('[data-testid="dispatch-card"]')}`);
  await t.click('[data-testid="section-chip"][data-section="All"]'); await t.sleep(200);
  await t.click('[data-testid="dispatch-card"][data-id="d1"]'); await t.sleep(340);
  const body = await t.page.evaluate(() => { const e = document.querySelector('[data-testid="article-body"]'); return e ? e.textContent.replace(/\s+/g, ' ') : ''; });
  t.check('R7 opening a dispatch shows the full piece', /digging started as a drainage job/.test(body), body.slice(0, 90));
  await t.page.setViewport({ width: 1440, height: 900 }); await t.sleep(200);
  const m = await t.measureWidth('[data-testid="article-body"]');
  t.check('R8 the piece has a comfortable line length (45-80 chars)', !!m && m.chars >= 45 && m.chars <= 80, m ? `${m.chars} chars` : 'none');
  await t.page.setViewport({ width: 390, height: 844 }); await t.sleep(150);
  t.check('R9 no page or console errors', t.errors.length === 0, t.errors.slice(0, 2).join(' | '));
});
