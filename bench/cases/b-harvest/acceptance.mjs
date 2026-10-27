// Acceptance suite — Case B: Harvest produce marketplace.
// Written from the BRIEF, independent of the engine's layout IR.
// Requirements: image-led cards, category facet, search, save-to-collection,
// detail with per-kg price, validated reservation, confirmation reference.
import { runSuite } from '../../lib/harness.mjs';
await runSuite('B. Harvest — marketplace', process.argv[2], async (t) => {
  t.check('T1 6 produce cards render', await t.count('[data-testid="produce-card"]') === 6, `cards=${await t.count('[data-testid="produce-card"]')}`);
  const media = await t.page.evaluate(() => document.querySelectorAll('[data-testid="produce-card"] .card-media, [data-testid="produce-card"] img, [data-testid="produce-card"] .media').length);
  t.check('T2 every card carries a media block', media === 6, `media=${media}`);

  await t.click('[data-testid="category-chip"][data-category="Greens"]'); await t.sleep(220);
  t.check('T3 category filter Greens leaves 2', await t.count('[data-testid="produce-card"]') === 2, `cards=${await t.count('[data-testid="produce-card"]')}`);
  await t.click('[data-testid="category-chip"][data-category="All"]'); await t.sleep(200);
  await t.type('[data-testid="search"]', 'mango'); await t.sleep(250);
  t.check('T4 searching "mango" leaves 1', await t.count('[data-testid="produce-card"]') === 1, `cards=${await t.count('[data-testid="produce-card"]')}`);
  await t.type('[data-testid="search"]', ''); await t.sleep(200);

  await t.click('[data-testid="save-toggle"][data-id="p1"]'); await t.sleep(250);
  await t.click('[data-testid="saved-open"]'); await t.sleep(250);
  t.check('T5 saving persists into the Saved view', await t.count('[data-testid="produce-card"]') === 1, `saved=${await t.count('[data-testid="produce-card"]')}`);
  await t.click('[data-testid="nav-shop"]'); await t.sleep(250);

  await t.click('[data-testid="produce-card"][data-id="p1"]'); await t.sleep(300);
  const price = await t.text('[data-testid="detail-price"]');
  t.check('T6 detail shows the price per kg', !!price && price.indexOf('/kg') !== -1, price);

  await t.click('[data-testid="reserve-btn"]'); await t.sleep(250);
  t.check('T7 empty submit shows both field errors', (await t.vis('[data-testid="error-name"]')) && (await t.vis('[data-testid="error-phone"]')));
  await t.setValue('[data-testid="buyer-name"]', 'Asha Nair');
  await t.setValue('[data-testid="buyer-phone"]', '98765 43210');
  await t.click('[data-testid="option-pickup"][data-value="Today 5\u20137 PM"]'); await t.sleep(200);
  await t.click('[data-testid="reserve-btn"]'); await t.sleep(400);
  const ref = await t.text('[data-testid="reserve-ref"]');
  t.check('T8 a valid reservation issues an HV reference', /^HV-\d{6}$/.test(ref || ''), ref || 'none');
  t.check('T9 the confirmation summarises the reservation', await t.vis('[data-testid="reserve-summary"]'));
  t.check('T10 no page or console errors', t.errors.length === 0, t.errors.slice(0, 2).join(' | '));
});
