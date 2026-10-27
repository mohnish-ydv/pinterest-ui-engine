// app.test.mjs — shared functional suite for the Mission 017 demo brief.
// Runs against ANY app implementing the brief's testid contract (engine
// output or baseline), so functional results are comparable.
// Usage: node engine/tests/app.test.mjs <appDir>
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
const text = (sel) => page.evaluate(s => { const el = document.querySelector(s); return el ? el.textContent.trim() : null; }, sel);
const count = (sel) => page.evaluate(s => document.querySelectorAll(s).length, sel);
const money = async (sel) => { const t = await text(sel); return t ? Number(t.replace(/[₹,]/g, '')) : NaN; };

// T1 catalogue
check('T1 8 product cards render', await count('#grid [data-testid="product-card"]') === 8);
// T2 category filter
await click('[data-testid="category-chip"][data-cat="Mince"]'); await sleep(250);
check('T2 category filter shows only Mince (1 card)', await count('#grid [data-testid="product-card"]') === 1);
await click('[data-testid="category-chip"][data-cat="All"]'); await sleep(250);
check('T2b All restores 8 cards', await count('#grid [data-testid="product-card"]') === 8);
// T3 search
await page.type('[data-testid="search"]', 'ribeye'); await sleep(250);
check('T3 search filters to Ribeye (1 card)', await count('#grid [data-testid="product-card"]') === 1);
await page.evaluate(() => { const i = document.querySelector('[data-testid="search"]'); i.value = ''; i.dispatchEvent(new Event('input', { bubbles: true })); });
await sleep(250);
// T4 detail + weight stepper
await click('#grid [data-testid="product-card"][data-id="ribeye"] [data-testid="product-open"]'); await sleep(300);
check('T4 detail opens for Ribeye Steak', (await text('[data-testid="detail-name"]')) === 'Ribeye Steak');
await click('[data-testid="qty-plus"]'); await sleep(150);
check('T5 stepper shows 1.5 kg', (await text('[data-testid="qty-value"]')) === '1.5 kg');
check('T5b buy price updates to 2175', (await text('#buy-price')) === '₹2,175', await text('#buy-price'));
// T6 add to bag -> bag totals
await click('[data-testid="add-to-bag"]'); await sleep(300);
check('T6 bag has 1 item', await count('[data-testid="bag-item"]') === 1);
check('T7 subtotal 2175', (await money('[data-testid="bag-subtotal"]')) === 2175);
check('T7b delivery free >= 999', (await text('[data-testid="bag-delivery"]')) === 'Free');
check('T7c total 2175', (await money('[data-testid="bag-total"]')) === 2175);
// T8 bag stepper
await click('[data-testid="bag-item"] [data-inc]'); await sleep(250);
check('T8 bag stepper -> subtotal 2900', (await money('[data-testid="bag-subtotal"]')) === 2900);
// T9 second product via quick add
await click('[data-testid="back-btn"]'); await sleep(250);
await click('#grid [data-testid="product-card"][data-id="mince"] [data-testid="add-btn"]'); await sleep(250);
await click('.tabbar [data-testid="bag-open"]'); await sleep(250);
check('T9 bag has 2 items', await count('[data-testid="bag-item"]') === 2);
check('T9b subtotal 3540 (2900 + 640)', (await money('[data-testid="bag-subtotal"]')) === 3540, await text('[data-testid="bag-subtotal"]'));
// T10 checkout
await click('[data-testid="checkout-btn"]'); await sleep(300);
const ref = await text('[data-testid="order-ref"]');
check('T10 order ref format MM-######', /^MM-\d{6}$/.test(ref || ''), ref || 'none');
await click('.tabbar [data-testid="bag-open"]'); await sleep(250);
check('T11 bag empty state after checkout', await page.evaluate(() => !!document.querySelector('[data-testid="empty-bag"]')));
check('T12 no page/console errors', errors.length === 0, errors.slice(0, 2).join(' | '));

await browser.close();
const passed = results.filter(Boolean).length;
console.log(`RESULT ${passed}/${results.length}`);
process.exit(passed === results.length ? 0 : 1);
