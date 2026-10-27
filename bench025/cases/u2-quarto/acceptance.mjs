// Acceptance — U2 Quarto (editorial long-form). Written from the brief.
import { runSuite } from '../../../bench/lib/harness.mjs';
await runSuite('U2. Quarto — editorial', process.argv[2], async (t) => {
  t.check('T1 5 essays render', await t.count('[data-testid="piece-card"]') === 5, `cards=${await t.count('[data-testid="piece-card"]')}`);
  const idx = await t.page.evaluate(() => { const c = document.querySelector('[data-testid="piece-card"]'); return c ? c.innerText.replace(/\s+/g,' ') : ''; });
  t.check('T2 the index shows a reading time', /min read/.test(idx), idx.slice(0, 90));
  await t.click('[data-testid="topic-chip"][data-topic="Archives"]'); await t.sleep(220);
  t.check('T3 topic filter Archives leaves 2', await t.count('[data-testid="piece-card"]') === 2, `cards=${await t.count('[data-testid="piece-card"]')}`);
  await t.click('[data-testid="topic-chip"][data-topic="All"]'); await t.sleep(200);
  await t.type('[data-testid="search"]', 'mirza'); await t.sleep(250);
  t.check('T4 searching an author leaves 2', await t.count('[data-testid="piece-card"]') === 2, `cards=${await t.count('[data-testid="piece-card"]')}`);
  await t.type('[data-testid="search"]', ''); await t.sleep(200);
  await t.click('[data-testid="piece-card"][data-id="q1"]'); await t.sleep(340);
  t.check('T5 the essay opens an article body', await t.vis('[data-testid="article-body"]'));
  await t.page.setViewport({ width: 1440, height: 900 }); await t.sleep(180);
  const m = await t.measureWidth('[data-testid="article-body"]');
  t.check('T6 the article measure is 45–80 characters', !!m && m.chars >= 45 && m.chars <= 80, m ? `${m.chars} chars` : 'no body');
  const sf = await t.css('[data-testid="standfirst"]','fontSize'), bd = await t.css('[data-testid="article-body"]','fontSize');
  t.check('T7 the standfirst is set larger than the body', !!sf && !!bd && parseFloat(sf) > parseFloat(bd), `${sf} vs ${bd}`);
  await t.page.setViewport({ width: 390, height: 844 }); await t.sleep(120);
  t.check('T8 no page or console errors', t.errors.length === 0, t.errors.slice(0,2).join(' | '));
});
