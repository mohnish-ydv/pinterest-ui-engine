// clinic.test.mjs — functional suite for the Mission 018 CarePoint brief.
// Runs against ANY app implementing the brief's contract (engine output
// or baseline). Date-agnostic: days/slots are addressed by index.
// Usage: node engine/tests/clinic.test.mjs <appDir>
import { resolve } from 'node:path';
import { launchBrowser } from '../lib/stateprobe.mjs';

const root = resolve(process.argv[2]);
// Mission 020 (P0.2): the browser and its launch args come from the shared
// launcher, so the suites, the inspector and the demo cannot drift apart.
const browser = await launchBrowser();
const results = []; const errors = [];
const check = (name, ok, detail = '') => { results.push(ok); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`); };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844 });
page.on('pageerror', e => errors.push('pageerror: ' + e.message));
page.on('console', m => { if (m.type() === 'error' && !/favicon/.test(m.text())) errors.push('console: ' + m.text()); });
page.on('dialog', d => d.accept());
await page.goto('file://' + root + '/index.html', { waitUntil: 'networkidle0' });
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: 'networkidle0' });
await sleep(300);

const click = (sel) => page.evaluate(s => { const el = document.querySelector(s); if (!el) return false; el.scrollIntoView({ block: 'center' }); el.click(); return true; }, sel);
const vis = (sel) => page.evaluate(s => { const el = document.querySelector(s); if (!el) return false; const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.height > 0 && cs.display !== 'none' && cs.visibility !== 'hidden'; }, sel);
const text = (sel) => page.evaluate(s => { const el = document.querySelector(s); return el ? el.textContent.trim() : null; }, sel);
const count = (sel) => page.evaluate(s => document.querySelectorAll(s).length, sel);
const state = (sel) => page.evaluate(s => { const el = document.querySelector(s); return el ? el.getAttribute('data-state') : null; }, sel);

// T1 catalogue + filters + search
check('T1 6 doctor cards render', await count('[data-testid="doctor-card"]') === 6);
await click('[data-testid="specialty-chip"][data-spec="Dentist"]'); await sleep(200);
check('T2 specialty filter -> 1 doctor', await count('[data-testid="doctor-card"]') === 1);
await click('[data-testid="specialty-chip"][data-spec="All"]'); await sleep(200);
await page.type('[data-testid="search"]', 'meera'); await sleep(200);
check('T3 search -> 1 doctor', await count('[data-testid="doctor-card"]') === 1);
await page.evaluate(() => { const i = document.querySelector('[data-testid="search"]'); i.value = ''; i.dispatchEvent(new Event('input', { bubbles: true })); });
await sleep(200);

// T4 detail, days, slot pattern (doctor 0, day 0: idx 0,3,6 taken)
await click('[data-testid="doctor-card"][data-id="ananya-rao"]'); await sleep(300);
check('T4 detail opens (Dr. Ananya Rao)', (await text('.detail-name')) === 'Dr. Ananya Rao');
check('T5 7 day chips', await count('[data-testid="day-chip"]') === 7);
check('T6 slot pattern: 3 taken / 5 free on day 0',
  (await count('[data-testid="slot"][data-state="taken"]')) === 3 && (await count('[data-testid="slot"][data-state="free"]')) === 5,
  `taken=${await count('[data-testid="slot"][data-state="taken"]')}`);

// T7 validation: empty form
await click('[data-testid="book-btn"]'); await sleep(200);
check('T7 empty submit -> name + phone errors visible', (await vis('[data-testid="error-name"]')) && (await vis('[data-testid="error-phone"]')));
// T8 validation: bad values
await page.type('[data-testid="patient-name"]', 'A');
await page.type('[data-testid="patient-phone"]', '123');
await click('[data-testid="book-btn"]'); await sleep(200);
check('T8 short name + bad phone -> errors remain', (await vis('[data-testid="error-name"]')) && (await vis('[data-testid="error-phone"]')));
// T9 valid form, no slot -> stays on detail
await page.evaluate(() => { document.querySelector('[data-testid="patient-name"]').value = 'Asha Nair'; document.querySelector('[data-testid="patient-phone"]').value = '98 7654 3210'; });
await click('[data-testid="book-btn"]'); await sleep(200);
check('T9 valid form without slot -> no confirmation yet', !(await vis('[data-testid="appt-ref"]')));
// T10 select free slot + book
await click('[data-testid="slot"][data-slot="10:00 AM"]'); await sleep(150);
check('T10 slot selects', (await state('[data-testid="slot"][data-slot="10:00 AM"]')) === 'selected');
await click('[data-testid="book-btn"]'); await sleep(300);
const ref = await text('[data-testid="appt-ref"]');
check('T11 confirmation with ref CP-######', /^CP-\d{6}$/.test(ref || ''), ref || 'none');
// T12 appointments + upcoming card
await click('[data-testid="appts-open"]'); await sleep(250);
check('T12 appointments list has 1 item', await count('[data-testid="appt-item"]') === 1);
await click('.tabbar [data-nav="home"]'); await sleep(200);
check('T13 upcoming card on home', await vis('[data-testid="upcoming-card"]'));
// T14 persistence + booked slot becomes taken
await page.reload({ waitUntil: 'networkidle0' }); await sleep(300);
await click('[data-testid="doctor-card"][data-id="ananya-rao"]'); await sleep(300);
check('T14 booked slot is taken after reload (persistence)', (await state('[data-testid="slot"][data-slot="10:00 AM"]')) === 'taken');
// T15 cancel frees the slot
await click('.tabbar [data-testid="appts-open"]'); await sleep(250);
await click('[data-testid="cancel-btn"]'); await sleep(200);
await click('[data-testid="cancel-confirm"]'); await sleep(250);
check('T15a appointment removed after cancel-confirm', await count('[data-testid="appt-item"]') === 0);
await click('[data-testid="back-btn"]'); await sleep(200);
await click('[data-testid="doctor-card"][data-id="ananya-rao"]'); await sleep(300);
check('T15b slot free again after cancel', (await state('[data-testid="slot"][data-slot="10:00 AM"]')) === 'free');
// T16 — coverage gap closed (Mission 020). The original 17 checks tested an
// empty submit BEFORE a slot was chosen (T7) and a valid form WITHOUT a slot
// (T9). Neither exercises the combination that matters most: a chosen slot
// plus an invalid form, which is the state a real user reaches by tapping a
// time first. Both the engine and the baseline pass it, so this is a
// strengthened contract rather than a discovered defect — it exists so the
// case can never silently regress.
// Reload first: earlier checks leave form values in the DOM, which masks the
// defect. A clean session is the honest condition for this assertion.
await page.reload({ waitUntil: 'networkidle0' }); await sleep(300);
await click('[data-testid="doctor-card"][data-id="ananya-rao"]'); await sleep(300);
await click('[data-testid="slot"][data-slot="10:00 AM"]'); await sleep(250);
await click('[data-testid="book-btn"]'); await sleep(450);
check('T16 slot selected + empty form -> no booking, errors shown',
  (await vis('[data-testid="error-name"]')) && !(await vis('[data-testid="appt-ref"]')),
  `errorVisible=${await vis('[data-testid="error-name"]')} confirmation=${await vis('[data-testid="appt-ref"]')}`);

check('T17 no page/console errors', errors.length === 0, errors.slice(0, 2).join(' | '));

await browser.close();
const passed = results.filter(Boolean).length;
console.log(`RESULT ${passed}/${results.length}`);
process.exit(passed === results.length ? 0 : 1);
