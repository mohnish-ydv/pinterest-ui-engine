// design047.test.mjs — Mission 047: the Bazaar corrections + the intake.
//
// Part A (engine): a medallion home carries NO chip rails at all;
// medallions wear photographs when a record lends one; sheet chips
// wrap and no chip rail shows a scrollbar; the step form sits on the
// ground (no panel box); an empty order book is illustrated.
// Part B (intake): the brief doctor names the decisions a thin brief
// never made, and stays silent on a complete one.
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';
import { doctorBrief } from '../intake/brief_doctor.mjs';

const ENGINE = join(dirname(fileURLToPath(import.meta.url)), '..');
const CHROME = process.env.CHROME_PATH || '/opt/meta-chromium/chrome';
let pass = 0, fail = 0;
const check = (name, ok, extra = '') => { console.log(`${ok ? '✓' : '✗ FAIL'} ${name}${extra ? ' — ' + extra : ''}`); ok ? pass++ : fail++; };

const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFAAH/q842iQAAAABJRU5ErkJggg==', 'base64');

const brief = {
  name: 'Bazaar', tagline: 'Buy and sell pre-loved things near you',
  about: 'A neighbourhood marketplace.', domain: 'classifieds marketplace',
  location: 'Bengaluru, Karnataka', currency: '₹', referencePrefix: 'BZ',
  homeHeader: 'greeting', showCategories: true, categoriesLabel: 'Categories',
  bagLabel: 'Cart', uniqueItems: true, submissionsLabel: 'My orders',
  profile: { name: 'Test User', sub: 'test@example.com' },
  notices: [{ title: 'Welcome', body: 'Say hello.', when: 'Today' }],
  fields: [
    { id: 'name', label: 'Name', type: 'text', role: 'title' },
    { id: 'category', label: 'Category', type: 'enum', filter: true, options: ['Shoes', 'Bags', 'Audio'] },
    { id: 'locality', label: 'Locality', type: 'enum', filter: true, options: ['Koramangala', 'HSR'] },
    { id: 'rating', label: 'Rating', type: 'rating' },
    { id: 'price', label: 'Price', type: 'money' },
    { id: 'blurb', label: 'Description', type: 'text' },
  ],
  requirements: [
    'Shoppers can search listings by name, browse them in a gallery and save favourites.',
    'Shoppers can filter listings by category and locality.',
    'Shoppers add listings to a cart, review the cart, and check out to place an order.',
    'Placed orders are listed under My orders.',
  ],
  flow: {
    form: [
      { id: 'name2', label: 'Your name', type: 'text', required: true },
      { id: 'delivery', label: 'Delivery', type: 'enum', options: [
        { label: 'Pickup', value: 'Pickup', caption: 'Collect it yourself', price: 0 },
        { label: 'Courier', value: 'Courier', caption: 'To your door', price: 99 }] },
    ],
    steps: [{ id: 'details', label: 'Details', fields: ['name2'] }, { id: 'delivery', label: 'Delivery', fields: ['delivery'] }],
  },
  collection: { label: 'listings', media: true, items: [
    { id: 's1', name: 'Runner One', category: 'Shoes', locality: 'Koramangala', rating: 4.6, price: 2400, blurb: 'Barely worn.', image: 'assets/a.png' },
    { id: 's2', name: 'Trail Two', category: 'Shoes', locality: 'HSR', rating: 4.2, price: 1800, blurb: 'Good grip.', image: 'assets/b.png' },
    { id: 'b1', name: 'Tote Three', category: 'Bags', locality: 'HSR', rating: 4.9, price: 3200, blurb: 'Canvas.', image: 'assets/c.png' },
  ] },
};

const dir = mkdtempSync(join(tmpdir(), 'd47-'));
mkdirSync(join(dir, 'assets'), { recursive: true });
for (const f of ['a.png', 'b.png', 'c.png']) writeFileSync(join(dir, 'assets', f), PNG);
writeFileSync(join(dir, 'product-brief.json'), JSON.stringify(brief, null, 2));
execFileSync('node', [join(ENGINE, 'run.mjs'), dir], { stdio: 'pipe' });

// ---- Part B: the doctor ----
check('doctor: the probe brief itself is complete (0 gaps)', doctorBrief(brief).filter(f => f.level === 'gap').length === 0);
const thin = {
  name: 'Thin', domain: 'classifieds marketplace', homeHeader: 'greeting',
  wallet: { balance: 100, transactions: [] },
  flow: { form: [{ id: 'delivery', label: 'Delivery', type: 'enum', options: ['Pickup', 'Courier'] }], steps: [{ id: 'd', label: 'Delivery', fields: ['delivery', 'ghost'] }] },
  requirements: ['Shoppers add things to a cart and check out.'],
  fields: [{ id: 'name', label: 'Name', type: 'text', role: 'title' }, { id: 'price', label: 'Price', type: 'money' }],
  collection: { label: 'things', media: false, items: [{ id: 'x', name: 'X', price: 10 }] },
};
const found = doctorBrief(thin);
const has = (qid, level) => found.some(f => f.qid === qid && (!level || f.level === level));
check('doctor: greeting without a person is a GAP', has('q-user-name', 'gap'));
const orphan = { name: 'Orphan', wallet: { balance: 5, transactions: [] }, fields: thin.fields, collection: thin.collection, requirements: [] };
check('doctor: an unreachable wallet is a GAP', doctorBrief(orphan).some(f => f.qid === 'q-families' && f.level === 'gap'));
check('doctor: a flow step asking for an undeclared field is a GAP', has('q-checkout', 'gap'));
check('doctor: string flow options draw the radio-row tip', found.some(f => f.qid === 'q-checkout' && f.level === 'tip'));
check('doctor: marketplace bag without uniqueItems draws the tip', has('q-unique', 'tip'));

// ---- Part A: the generated app ----
const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'shell', args: ['--no-sandbox', '--allow-file-access-from-files'] });
const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844 });
const errors = [];
page.on('pageerror', e => errors.push(String(e)));
await page.goto('file://' + join(dir, 'app', 'index.html'), { waitUntil: 'networkidle0' });
await new Promise(r => setTimeout(r, 300));

check('home: medallions present', await page.$('.medallions') !== null);
check('home: NO chip rail beside the medallions (Bazaar fix)', await page.$('.view-products .chips, [data-testid="browse"] .chips') === null && (await page.$$('.wrap > .chips')).length === 0);
const med = await page.evaluate(() => {
  const discs = [...document.querySelectorAll('.med-disc')];
  return { total: discs.length, photos: discs.filter(d => d.classList.contains('has-photo') && d.querySelector('img')).length, allInitial: discs[0] && !discs[0].classList.contains('has-photo') };
});
check('medallions: photographed categories wear photos', med.photos >= 2, JSON.stringify(med));
check("medallions: 'All' keeps its initial disc", med.allInitial === true);
const chipCss = await page.evaluate(() => {
  const el = document.querySelector('.medallions');
  return getComputedStyle(el).scrollbarWidth;
});
check('chip rails hide their scrollbar', chipCss === 'none');

await page.evaluate(() => document.querySelector('.filter-btn').click());
await new Promise(r => setTimeout(r, 300));
const sheetCss = await page.evaluate(() => {
  const el = document.querySelector('.sheet .chips');
  return el ? getComputedStyle(el).flexWrap : 'none';
});
check('sheet chips wrap', sheetCss === 'wrap');
await page.keyboard.press('Escape');

// into the flow: open a record, add, check out — the step panel must be boxless
await page.evaluate(() => document.querySelector('[data-act="open"]').click());
await new Promise(r => setTimeout(r, 250));
await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /add to cart/i.test(x.textContent)); if (b) b.click(); });
await new Promise(r => setTimeout(r, 250));
await page.evaluate(() => { const t = [...document.querySelectorAll('.tab')].find(x => /cart/i.test(x.textContent)); if (t) t.click(); });
await new Promise(r => setTimeout(r, 300));
await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /check ?out/i.test(x.textContent)); if (b) b.click(); });
await new Promise(r => setTimeout(r, 400));
const panelCss = await page.evaluate(() => {
  const el = document.querySelector('.stepflow .panel');
  if (!el) return null;
  const cs = getComputedStyle(el);
  return { bg: cs.backgroundColor, bw: cs.borderTopWidth };
});
check('step form sits on the ground (no panel box)', !!panelCss && panelCss.bg === 'rgba(0, 0, 0, 0)' && panelCss.bw === '0px', JSON.stringify(panelCss));

// orders empty art: fresh profile, no orders
await page.evaluate(() => { localStorage.clear(); location.hash = '#/'; });
await page.reload({ waitUntil: 'networkidle0' });
await new Promise(r => setTimeout(r, 300));
await page.evaluate(() => { const t = [...document.querySelectorAll('.tab')].find(x => /orders/i.test(x.textContent)); if (t) t.click(); });
await new Promise(r => setTimeout(r, 300));
check('empty order book is illustrated', await page.$('.empty .empty-art') !== null);
check('no page errors', errors.length === 0, errors.join(' | '));
await browser.close();

console.log(`RESULT ${pass}/${pass + fail}`);
process.exit(fail ? 1 : 0);
