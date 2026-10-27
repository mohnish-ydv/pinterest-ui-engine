// parcel.test.mjs — functional suite for the SwiftGo brief (Mission 020, Phase 5).
// Runs against ANY app implementing the brief's contract (engine output or a
// baseline build), so functional results are comparable under the same brief.
// Usage: node engine/tests/parcel.test.mjs <appDir>
import { resolve } from 'node:path';
import { launchBrowser } from '../lib/stateprobe.mjs';

const root = resolve(process.argv[2]);
if (!process.argv[2]) { console.error('usage: node engine/tests/parcel.test.mjs <appDir>'); process.exit(2); }

// Mission 020 (P0.2): browser + launch args come from the shared launcher.
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
await sleep(350);

const click = (sel) => page.evaluate(s => { const el = document.querySelector(s); if (!el) return false; el.scrollIntoView({ block: 'center' }); el.click(); return true; }, sel);
const vis = (sel) => page.evaluate(s => { const el = document.querySelector(s); if (!el) return false; const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.height > 0 && cs.display !== 'none' && cs.visibility !== 'hidden' && !el.hidden; }, sel);
const text = (sel) => page.evaluate(s => { const el = document.querySelector(s); return el ? el.textContent.trim() : null; }, sel);
const count = (sel) => page.evaluate(s => document.querySelectorAll(s).length, sel);
const setVal = (sel, v) => page.evaluate(([s, val]) => { const el = document.querySelector(s); if (!el) return false; el.value = val; el.dispatchEvent(new Event('input', { bubbles: true })); return true; }, [sel, v]);
const VIEW = (v) => `[data-view="${v}"]`;

// ---- home ----------------------------------------------------------------
check('T1 recent shipment rows render (2)', await count(`${VIEW('home')} [data-testid="shipment-item"]`) === 2,
  `rows=${await count(`${VIEW('home')} [data-testid="shipment-item"]`)}`);
check('T2 active shipment card shows a status pill',
  await vis(`${VIEW('home')} [data-testid="shipment-open"]`) && (await text(`${VIEW('home')} [data-testid="shipment-open"] [data-testid="status-pill"]`)) === 'In transit',
  `status=${await text(`${VIEW('home')} [data-testid="shipment-open"] [data-testid="status-pill"]`)}`);
check('T3 active card shows an ETA', !!(await text(`${VIEW('home')} [data-testid="shipment-open"] [data-testid="eta"]`)),
  `${await text(`${VIEW('home')} [data-testid="shipment-open"] [data-testid="eta"]`)}`);

// ---- tracking ------------------------------------------------------------
await setVal('[data-testid="track-input"]', 'SG000000000');
await click('[data-testid="track-btn"]'); await sleep(250);
check('T4 unknown reference shows a track error', await vis('[data-testid="track-error"]'),
  `${(await text('[data-testid="track-error"]'))?.slice(0, 60)}`);

await setVal('[data-testid="track-input"]', 'SG482910375');
await click('[data-testid="track-btn"]'); await sleep(350);
check('T5 known reference opens the shipment detail', await vis(VIEW('detail')),
  `detailVisible=${await vis(VIEW('detail'))}`);
check('T6 detail shows 5 timeline steps', await count(`${VIEW('detail')} [data-testid="timeline-step"]`) === 5,
  `steps=${await count(`${VIEW('detail')} [data-testid="timeline-step"]`)}`);
check('T7 detail shows the ETA and status', !!(await text(`${VIEW('detail')} [data-testid="eta"]`)) && (await text(`${VIEW('detail')} .hero-status`)) === 'In transit',
  `${await text(`${VIEW('detail')} .hero-status`)} / ${await text(`${VIEW('detail')} [data-testid="eta"]`)}`);

// ---- send flow: quote maths ---------------------------------------------
await click('[data-testid="back-btn"]'); await sleep(250);
await click('[data-testid="send-open"]'); await sleep(350);
check('T8 send view offers 4 package types', await count(`${VIEW('send')} [data-testid="package-type"]`) === 4,
  `types=${await count(`${VIEW('send')} [data-testid="package-type"]`)}`);

// default: Small (base 60), 1.5 kg (0.5 kg over the included 1 kg => +9), Standard x1 => 69
const q0 = await text('[data-testid="quote-total"]');
check('T9 default quote is base + overage (₹69)', q0 === '₹69', `quote=${q0}`);

// Express x1.5 => round(69 * 1.5) = 104
await click('[data-testid="service-type"][data-svc="express"]'); await sleep(200);
const q1 = await text('[data-testid="quote-total"]');
check('T10 Express service multiplies the quote (₹104)', q1 === '₹104', `quote=${q1}`);

// Large (base 140) at 1.5 kg Express => round((140+9)*1.5) = 224
await click('[data-testid="package-type"][data-pkg="large"]'); await sleep(200);
const q2 = await text('[data-testid="quote-total"]');
check('T11 larger package re-prices the quote (₹224)', q2 === '₹224', `quote=${q2}`);

// weight + => 2.0 kg: (140 + 1*18) * 1.5 = 237
await click('[data-testid="weight-plus"]'); await sleep(200);
const w = await text('[data-testid="weight-value"]');
const q3 = await text('[data-testid="quote-total"]');
check('T12 weight stepper updates weight and quote (2 kg, ₹237)', w === '2 kg' && q3 === '₹237', `weight=${w} quote=${q3}`);

// back to a realistic booking: Small + Standard + 1.5 kg
await click('[data-testid="package-type"][data-pkg="small"]'); await sleep(150);
await click('[data-testid="service-type"][data-svc="standard"]'); await sleep(150);
await click('[data-testid="weight-minus"]'); await sleep(150);

// ---- send flow: validation ---------------------------------------------
await click('[data-testid="send-submit"]'); await sleep(250);
check('T13 empty submit shows drop + phone errors',
  (await vis('[data-testid="error-drop"]')) && (await vis('[data-testid="error-phone"]')));

await setVal('[data-testid="drop"]', 'Hostel · Jayanagar');
await setVal('[data-testid="phone"]', '12345');
await click('[data-testid="send-submit"]'); await sleep(250);
check('T14 bad phone keeps the phone error and hides the drop error',
  !(await vis('[data-testid="error-drop"]')) && (await vis('[data-testid="error-phone"]')));

await setVal('[data-testid="phone"]', '9876543210');
await setVal('[data-testid="pickup"]', 'Home · Indiranagar');
await click('[data-testid="send-submit"]'); await sleep(400);
const ref = await text('[data-testid="confirm-ref"]');
check('T15 valid submit reaches confirmation with an SG reference', await vis(VIEW('confirmation')) && /^SG\d{9}$/.test(ref || ''),
  `ref=${ref}`);

// ---- persistence --------------------------------------------------------
await click(`${VIEW('confirmation')} [data-nav="home"]`); await sleep(300);
await page.reload({ waitUntil: 'networkidle0' }); await sleep(400);
await click('[data-testid="shipments-open"]'); await sleep(300);
check('T16 new shipment persists after reload (3 total)', await count(`${VIEW('shipments')} [data-testid="shipment-item"]`) === 3,
  `rows=${await count(`${VIEW('shipments')} [data-testid="shipment-item"]`)}`);
check('T17 the new reference is in the shipments list',
  await page.evaluate(r => Array.from(document.querySelectorAll('[data-testid="shipment-item"]')).some(e => e.dataset.ref === r), ref));

// ---- post-action: cancel -------------------------------------------------
await click(`${VIEW('shipments')} [data-testid="shipment-item"][data-ref="SG482910375"]`); await sleep(350);
check('T18 detail offers a cancel action for an active shipment', await vis('[data-testid="cancel-btn"]'));
await click('[data-testid="cancel-btn"]'); await sleep(200);
await click('[data-testid="cancel-confirm"]'); await sleep(350);
check('T19 cancelling sets the status to Cancelled',
  (await text(`${VIEW('detail')} .hero-status`)) === 'Cancelled',
  `${await text(`${VIEW('detail')} .hero-status`)}`);
await click('[data-testid="back-btn"]'); await sleep(250);
const activePill = await text(`${VIEW('home')} [data-testid="shipment-open"] [data-testid="status-pill"]`);
check('T20 the cancelled shipment is no longer the active card', activePill !== 'Cancelled' && activePill !== null,
  `active status=${activePill}`);

// ---- T22 back navigation returns to the originating list -----------------
// Regression for a defect found by rendered inspection: the detail view's
// Back button was static markup that no handler was attached to, so it did
// nothing and the "home" screenshot after it was actually the detail view.
await click('[data-testid="shipments-open"]'); await sleep(300);
await click(`${VIEW('shipments')} [data-testid="shipment-item"]`); await sleep(350);
const inDetail = await vis(VIEW('detail'));
await click('[data-testid="back-btn"]'); await sleep(350);
check('T22 Back from a shipment opened in Shipments returns to Shipments',
  inDetail && (await vis(VIEW('shipments'))) && !(await vis(VIEW('detail'))),
  `detail=${await vis(VIEW('detail'))} shipments=${await vis(VIEW('shipments'))}`);

// ---- T23 console/page errors --------------------------------------------
check('T23 no page/console errors', errors.length === 0, errors.slice(0, 2).join(' | '));

await browser.close();
const passed = results.filter(Boolean).length;
console.log(`RESULT ${passed}/${results.length}`);
process.exit(passed === results.length ? 0 : 1);
