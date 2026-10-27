// Acceptance — T2 Shelf. Written from the product requirements only.
import { runSuite } from '../../../bench/lib/harness.mjs';
await runSuite('T2. Shelf — reading list', process.argv[2], async (t) => {
  t.check('R1 five notes are listed', await t.count('[data-testid="note-card"]') === 5, `n=${await t.count('[data-testid="note-card"]')}`);
  const row = await t.page.evaluate(() => { const c = document.querySelector('[data-testid="note-card"]'); return c ? c.innerText.replace(/\s+/g, ' ') : ''; });
  t.check('R2 an entry shows title, summary, author and reading time', /stopped using a queue/.test(row) && /retry semantics/.test(row) && /Ravi/.test(row) && /8/.test(row), row.slice(0, 120));
  t.check('R3 no cards (prohibited)', await t.count('.card') === 0);
  t.check('R4 no images (prohibited)', await t.page.evaluate(() => document.querySelectorAll('main img, .card-media').length) === 0);
  await t.click('[data-testid="topic-chip"][data-topic="Practice"]'); await t.sleep(240);
  t.check('R5 filtering by topic leaves 2', await t.count('[data-testid="note-card"]') === 2, `n=${await t.count('[data-testid="note-card"]')}`);
  await t.click('[data-testid="topic-chip"][data-topic="All"]'); await t.sleep(200);
  await t.click('[data-testid="note-card"][data-id="s2"]'); await t.sleep(340);
  const body = await t.page.evaluate(() => { const e = document.querySelector('[data-testid="article-body"]'); return e ? e.textContent.replace(/\s+/g, ' ') : ''; });
  t.check('R6 opening a note shows the full text', /stack trace with ambition/.test(body), body.slice(0, 90));
  await t.page.setViewport({ width: 1440, height: 900 }); await t.sleep(200);
  const m = await t.measureWidth('[data-testid="article-body"]');
  t.check('R7 the text has a comfortable line length (45-80 chars)', !!m && m.chars >= 45 && m.chars <= 80, m ? `${m.chars}` : 'none');
  await t.page.setViewport({ width: 390, height: 844 }); await t.sleep(150);
  t.check('R8 no page or console errors', t.errors.length === 0, t.errors.slice(0, 2).join(' | '));
});
