// Acceptance — T6 Studio. Written from the product requirements only.
// This product needs real photographs and none are supplied. The suite accepts
// either real media or an explicit, labelled absence — but never an unlabelled
// decorative substitute presented as imagery.
import { runSuite } from '../../../bench/lib/harness.mjs';
await runSuite('T6. Studio — media required, not supplied', process.argv[2], async (t) => {
  t.check('R1 six projects are shown', await t.count('[data-testid="project-card"]') === 6, `n=${await t.count('[data-testid="project-card"]')}`);
  const m = await t.page.evaluate(() => {
    const blocks = Array.from(document.querySelectorAll('[data-testid="project-card"] .card-media, [data-testid="project-card"] img'));
    const imgs = blocks.filter(e => e.tagName === 'IMG').length;
    const labelled = blocks.filter(e => e.getAttribute('data-substitute') === 'true').length;
    const initials = blocks.filter(e => (e.textContent || '').trim().length <= 3 && !e.querySelector('img')).length;
    return { blocks: blocks.length, imgs, labelled, initials };
  });
  t.check('R2 media is present as image, or its absence is labelled', (m.imgs > 0) || (m.labelled > 0), JSON.stringify(m));
  t.check('R3 no unlabelled decorative initials stand in for photographs', m.initials === 0 || m.labelled > 0, JSON.stringify(m));
  await t.click('[data-testid="discipline-chip"][data-discipline="Documentary"]'); await t.sleep(240);
  t.check('R4 filtering by discipline leaves 2', await t.count('[data-testid="project-card"]') === 2, `n=${await t.count('[data-testid="project-card"]')}`);
  await t.click('[data-testid="discipline-chip"][data-discipline="All"]'); await t.sleep(200);
  await t.click('[data-testid="project-card"][data-id="p1"]'); await t.sleep(340);
  t.check('R5 opening a project shows its brief', /flats at dawn/.test(await t.page.evaluate(() => document.querySelector('main').innerText)));
  t.check('R6 no page or console errors', t.errors.length === 0, t.errors.slice(0, 2).join(' | '));
});
