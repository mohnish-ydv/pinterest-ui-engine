// Acceptance suite — Case C: Vitalis physiotherapy booking.
// Written from the BRIEF, independent of the engine's layout IR.
// Requirements: therapist list with specialty facet, availability with taken
// slots, validated booking, sessions list, cancellation that frees the slot.
import { runSuite } from '../../lib/harness.mjs';
await runSuite('C. Vitalis — healthcare booking', process.argv[2], async (t) => {
  t.check('T1 5 therapists render', await t.count('[data-testid="therapist-card"]') === 5, `cards=${await t.count('[data-testid="therapist-card"]')}`);
  await t.click('[data-testid="specialty-chip"][data-spec="Sports"]'); await t.sleep(220);
  t.check('T2 specialty filter Sports leaves 2', await t.count('[data-testid="therapist-card"]') === 2, `cards=${await t.count('[data-testid="therapist-card"]')}`);
  await t.click('[data-testid="specialty-chip"][data-spec="All"]'); await t.sleep(200);

  await t.click('[data-testid="therapist-card"][data-id="t1"]'); await t.sleep(320);
  t.check('T3 detail opens with the therapist name', (await t.text('[data-testid="detail-title"]')) === 'Dr. Rhea Kulkarni', await t.text('[data-testid="detail-title"]'));
  t.check('T4 6 day chips are offered', await t.count('[data-testid="day-chip"]') === 6, `days=${await t.count('[data-testid="day-chip"]')}`);
  const taken = await t.count('[data-testid="slot"][data-state="taken"]');
  const free = await t.count('[data-testid="slot"][data-state="free"]');
  t.check('T5 the declared rule marks 2 of 6 slots taken', taken === 2 && free === 4, `taken=${taken} free=${free}`);

  await t.click('[data-testid="book-btn"]'); await t.sleep(250);
  t.check('T6 empty submit shows both field errors', (await t.vis('[data-testid="error-name"]')) && (await t.vis('[data-testid="error-phone"]')));
  t.check('T7 submitting without a time is refused', await t.vis('[data-testid="error-slot"]'));

  await t.setValue('[data-testid="patient-name"]', 'Asha Nair');
  await t.setValue('[data-testid="patient-phone"]', '98 7654 3210');
  const firstFree = await t.page.evaluate(() => { const e = document.querySelector('[data-testid="slot"][data-state="free"]'); return e ? e.getAttribute('data-slot') : null; });
  await t.click(`[data-testid="slot"][data-slot="${firstFree}"]`); await t.sleep(220);
  t.check('T8 choosing a free slot marks it selected', (await t.attr(`[data-testid="slot"][data-slot="${firstFree}"]`, 'data-state')) === 'selected');
  await t.click('[data-testid="book-btn"]'); await t.sleep(420);
  const ref = await t.text('[data-testid="session-ref"]');
  t.check('T9 a valid booking issues a VS reference', /^VS-\d{6}$/.test(ref || ''), ref || 'none');

  await t.click('[data-testid="sessions-open"]'); await t.sleep(300);
  t.check('T10 the session appears in My sessions', await t.count('[data-testid="session-item"]') === 1, `items=${await t.count('[data-testid="session-item"]')}`);
  await t.click('[data-testid="nav-team"]'); await t.sleep(280);
  t.check('T11 the next-session banner shows on the entry view', await t.vis('[data-testid="next-session"]'));

  await t.click('[data-testid="sessions-open"]'); await t.sleep(280);
  await t.click('[data-testid="cancel-btn"]'); await t.sleep(200);
  await t.click('[data-testid="cancel-confirm"]'); await t.sleep(320);
  t.check('T12 cancelling removes the session', await t.count('[data-testid="session-item"]') === 0, `items=${await t.count('[data-testid="session-item"]')}`);
  await t.click('[data-testid="back-btn"]'); await t.sleep(260);
  await t.click('[data-testid="therapist-card"][data-id="t1"]'); await t.sleep(320);
  t.check('T13 cancelling frees the slot again', (await t.attr(`[data-testid="slot"][data-slot="${firstFree}"]`, 'data-state')) === 'free');
  t.check('T14 no page or console errors', t.errors.length === 0, t.errors.slice(0, 2).join(' | '));
});
