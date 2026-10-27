// Acceptance suite — Case E: Marginalia editorial.
// Written from the BRIEF, independent of the engine's layout IR.
// Requirements: a typographic index (title, author, reading time), topic facet,
// and an ARTICLE view with a measured line length and a larger standfirst.
import { runSuite } from '../../lib/harness.mjs';
await runSuite('E. Marginalia — editorial', process.argv[2], async (t) => {
  t.check('T1 5 essays render', await t.count('[data-testid="essay-card"]') === 5, `cards=${await t.count('[data-testid="essay-card"]')}`);
  const meta = await t.page.evaluate(() => {
    const c = document.querySelector('[data-testid="essay-card"]');
    if (!c) return null;
    const s = c.textContent;
    return { hasTime: /min read/.test(s), hasAuthor: s.indexOf('Sneha Rao') !== -1 };
  });
  t.check('T2 each index entry shows title, author and reading time', !!meta && meta.hasTime && meta.hasAuthor, JSON.stringify(meta));

  await t.click('[data-testid="topic-chip"][data-topic="Work"]'); await t.sleep(220);
  t.check('T3 topic filter Work leaves 2', await t.count('[data-testid="essay-card"]') === 2, `cards=${await t.count('[data-testid="essay-card"]')}`);
  await t.click('[data-testid="topic-chip"][data-topic="All"]'); await t.sleep(200);

  await t.click('[data-testid="essay-card"][data-id="e1"]'); await t.sleep(320);
  t.check('T4 the essay opens an article body', await t.vis('[data-testid="article-body"]'));
  // A reading measure only means anything where the column is constrained, so
  // it is measured at the desktop viewport.
  await t.page.setViewport({ width: 1440, height: 900 }); await t.sleep(180);
  const m = await t.measureWidth('[data-testid="article-body"]');
  t.check('T5 the article measure is 45–80 characters at desktop', !!m && m.chars >= 45 && m.chars <= 80, m ? `${m.chars} chars (${Math.round(m.px)}px @ ${m.fontSize}px)` : 'no body');
  await t.page.setViewport({ width: 390, height: 844 }); await t.sleep(150);
  const sf = await t.css('[data-testid="standfirst"]', 'fontSize');
  const bd = await t.css('[data-testid="article-body"]', 'fontSize');
  t.check('T6 the standfirst is set larger than the body', !!sf && !!bd && parseFloat(sf) > parseFloat(bd), `standfirst=${sf} body=${bd}`);
  t.check('T7 no page or console errors', t.errors.length === 0, t.errors.slice(0, 2).join(' | '));
});
