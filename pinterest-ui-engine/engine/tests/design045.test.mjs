// design045.test.mjs — Mission 045, the Evira corrections, probed on a
// real built app in a real browser: substituted media is a light tile,
// the promo does not spend the brand colour twice, card meta is capped
// at two facts, an in-bag card control is a stepper, unique items
// cannot be quantity-inflated, the bag and order book sit on the
// ground without boxes or lines, cancel is a quiet danger, and the
// record page pairs its price with its action in the app frame.

import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createRequire } from 'node:module';

let passed = 0;
let failed = 0;
const check = (name, cond, detail = '') => {
  if (cond) { passed++; console.log(`  ok  ${name}`); }
  else { failed++; console.log(`  FAIL ${name} ${detail}`); }
};

const product = () => ({
  name: 'ReList', tagline: 'Buy and sell near you.',
  about: 'A neighbourhood classifieds marketplace: browse what people around you are selling.',
  location: 'Bengaluru, Karnataka', currency: '₹', domain: 'classifieds marketplace',
  bagLabel: 'Cart', submissionsLabel: 'My orders', referencePrefix: 'RL',
  uniqueItems: true, deliveryFee: 99, freeAbove: 999,
  promo: { title: 'Deal of the week', subtitle: 'MacBook Air M1, barely used, in Whitefield.', cta: 'View listing', recordId: 'l2' },
  collection: {
    label: 'Listing', plural: 'Listings', media: true,
    items: [
      { id: 'l1', name: 'iPhone 12 128GB — Blue', category: 'Mobiles', locality: 'Koramangala', seller: 'Rahul M', condition: 'Good', posted: '24 Oct', price: 28900, note: 'Battery health 86%.' },
      { id: 'l2', name: 'MacBook Air M1, 8GB / 256GB', category: 'Electronics', locality: 'Whitefield', seller: 'Arjun P', condition: 'Like new', posted: 'Today', price: 54000, note: 'Barely used, cycle count under 90.' },
      { id: 'l3', name: '3-seater fabric sofa, grey', category: 'Furniture', locality: 'HSR Layout', seller: 'Divya R', condition: 'Like new', posted: '25 Oct', price: 12500, note: 'No stains or sagging.' },
    ],
  },
  fields: [
    { id: 'name', type: 'text', label: 'Listing' },
    { id: 'category', type: 'enum', label: 'Category', options: ['Mobiles', 'Electronics', 'Furniture'] },
    { id: 'locality', type: 'text', label: 'Locality' },
    { id: 'seller', type: 'text', label: 'Seller' },
    { id: 'condition', type: 'text', label: 'Condition' },
    { id: 'posted', type: 'text', label: 'Posted' },
    { id: 'price', type: 'money', label: 'Price' },
    { id: 'note', type: 'text', label: 'Description' },
  ],
  requirements: [
    'The home screen is a gallery of every listing near the customer.',
    'Customers can search listings by name.',
    'Customers can filter listings by category.',
    'A customer can save a listing to favourites with a heart toggle.',
    'Customers add listings to a cart from the home screen and from each listing\'s page, and adjust quantities in the cart before ordering.',
    'Opening a listing shows its condition, description, seller and price.',
    'A customer checks out from the cart and places an order in three steps: your name and phone, then your delivery address, then review.',
    'A placed order ends with a confirmation showing a reference the customer can quote.',
    'Customers can review their placed orders and cancel an order they no longer want.',
  ],
});

const dir = mkdtempSync(join(tmpdir(), 'design045-'));
const runDir = join(dir, 'case');
execFileSync('mkdir', ['-p', runDir]);
writeFileSync(join(runDir, 'product-brief.json'), JSON.stringify(product(), null, 2));
const engineDir = join(new URL('.', import.meta.url).pathname, '..');
execFileSync('node', [join(engineDir, 'run.mjs'), runDir], { stdio: 'pipe' });

const css = readFileSync(join(runDir, 'app', 'styles.css'), 'utf8');
check('the MISSION 045 layer ships in the compiled CSS', css.includes('MISSION 045'));
check('the promo is quiet when it has no photo (tint ground)', /\.promo \{ background: /.test(css) && css.includes('.promo-btn'));

const require = createRequire(import.meta.url);
let puppeteer;
try { puppeteer = require('puppeteer-core'); } catch { puppeteer = null; }
check('puppeteer-core is available for browser probes', !!puppeteer);
if (!puppeteer) { console.log(`design045: ${passed} passed, ${failed} failed`);
console.log(`RESULT ${passed}/${passed + failed}`); process.exit(failed ? 1 : 0); }

const { findChrome } = await import(join(engineDir, 'lib', 'chrome.mjs')).catch(() => ({ findChrome: null }));
const exe = (findChrome && findChrome()) || process.env.CHROME_PATH || '/opt/meta-chromium/chrome';
const browser = await puppeteer.launch({ executablePath: exe, args: ['--no-sandbox', '--allow-file-access-from-files'] });
const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844 });
await page.goto('file://' + join(runDir, 'app', 'index.html'), { waitUntil: 'networkidle0' });
const wait = ms => new Promise(r => setTimeout(r, ms));
await wait(500);

// 1 — substituted media is light
const light = await page.evaluate(() => {
  const el = document.querySelector('.card-media[data-substitute="true"]');
  return el ? parseFloat(el.style.getPropertyValue('--media-light')) : -1;
});
check('substituted media lightness is a pale tile (>= 80%)', light >= 80, `got ${light}`);

// 2 — card meta capped at two facts
const metaTokens = await page.evaluate(() => {
  const m = document.querySelector('.card-meta');
  return m ? m.textContent.split('·').map(x => x.trim()).filter(Boolean).length : 0;
});
check('card meta carries at most two facts', metaTokens >= 1 && metaTokens <= 2, `got ${metaTokens}`);

// 3 — promo does not repeat the brand colour
const promoQuiet = await page.evaluate(() => {
  const promo = document.querySelector('.promo');
  const hdr = document.querySelector('body.is-home .sect[data-section="heading"]');
  if (!promo || !hdr) return null;
  return getComputedStyle(promo).backgroundColor !== getComputedStyle(hdr).backgroundColor;
});
check('the promo background differs from the brand zone', promoQuiet === true);

// 4 — titles are the working sans
const titleSans = await page.evaluate(() => {
  const t = document.querySelector('.page-title');
  return t ? getComputedStyle(t).fontFamily === getComputedStyle(document.body).fontFamily : false;
});
check('page titles render in the working sans', titleSans);

// 5 — add twice: stepper appears, quantity stays 1 (unique)
await page.evaluate(() => document.querySelectorAll('.card-add')[0].click());
await wait(300);
await page.evaluate(() => { const b = document.querySelector('.card-add.is-stepper [data-testid="add-btn"]'); if (b) b.click(); });
await wait(300);
const stepper = await page.evaluate(() => {
  const st = document.querySelector('.card-add.is-stepper');
  return st ? { text: st.textContent.replace(/\s+/g, ''), hasInc: !!st.querySelector('[data-testid="add-btn"]') } : null;
});
check('an in-bag card control is a stepper', !!stepper && stepper.text.includes('1'));
check('a unique item offers no + on its card stepper', stepper && stepper.hasInc === false);
const badge = await page.evaluate(() => document.querySelector('[data-testid="bag-count"]')?.textContent || '');
check('the bag count stays 1 after a second add (unique cap)', badge === '1', `badge=${badge}`);

// 6 — detail: price + action in the frame, head price retired
await page.evaluate(() => document.querySelectorAll('[data-testid="listing-card"]')[1].click());
await wait(600);
const frame = await page.evaluate(() => {
  const bar = document.querySelector('#actionbar');
  const rp = document.querySelector('.rec-price');
  return {
    barVisible: !!bar && !bar.hidden,
    hasPrice: !!bar?.querySelector('.bar-price'),
    hasAdd: !!bar?.querySelector('[data-testid="add-to-bag"]'),
    headPriceHidden: rp ? getComputedStyle(rp).display === 'none' : false,
  };
});
check('the detail action bar is up with price + add', frame.barVisible && frame.hasPrice && frame.hasAdd, JSON.stringify(frame));
check('the head sheet does not repeat the bar price', frame.headPriceHidden);
await page.evaluate(() => document.querySelector('[data-testid="back-btn"]')?.click());
await wait(500);

// 7 — bag: rows on the ground, no lines; empty copy names the cart
await page.evaluate(() => { [...document.querySelectorAll('.tab')].find(e => e.querySelector('.tab-lb')?.textContent.includes('Cart'))?.click(); });
await wait(600);
const bagStyle = await page.evaluate(() => {
  const item = document.querySelector('.bag-item');
  const row = document.querySelector('.bag-totals .dl-row');
  return {
    shadow: item ? getComputedStyle(item).boxShadow : null,
    bg: item ? getComputedStyle(item).backgroundColor : null,
    border: row ? getComputedStyle(row).borderBottomWidth : null,
    hasInc: !!document.querySelector('.bag-item [data-testid="bag-inc"]'),
  };
});
check('bag rows carry no shadow', bagStyle.shadow === 'none', bagStyle.shadow);
check('bag rows sit on the ground (transparent)', bagStyle.bg === 'rgba(0, 0, 0, 0)', bagStyle.bg);
check('bag totals rows have no dividing line', bagStyle.border === '0px', bagStyle.border);
check('a unique bag row offers no + stepper', bagStyle.hasInc === false);

// 8 — checkout journey -> orders: quiet cancel, single ref
await page.click('[data-testid="checkout-btn"]');
await wait(500);
await page.type('[data-testid="field-your-name"]', 'Test Person');
await page.type('[data-testid="field-phone"]', '9876543210');
await page.click('[data-testid="step-next"]');
await wait(400);
await page.type('[data-testid="field-your-delivery-address"]', '1 Test Street');
await page.click('[data-testid="step-next"]');
await wait(400);
await page.click('[data-testid="confirm-btn"]');
await wait(600);
const ref = await page.evaluate(() => document.querySelector('[data-testid="confirm-ref"]')?.textContent.trim() || '');
check('the journey issues a reference', /^RL-\d{6}$/.test(ref), ref);
await page.evaluate(() => { [...document.querySelectorAll('.tab')].find(e => e.querySelector('.tab-lb')?.textContent.includes('My orders'))?.click(); });
await wait(600);
const orders = await page.evaluate((r) => {
  const item = document.querySelector('.cm-item');
  const cancel = document.querySelector('.btn-cancel');
  return {
    shadow: item ? getComputedStyle(item).boxShadow : null,
    refCount: item ? item.textContent.split(r).length - 1 : 0,
    cancelBorder: cancel ? getComputedStyle(cancel).borderTopWidth : null,
  };
}, ref);
check('order items carry no shadow box', orders.shadow === 'none', orders.shadow);
check('the reference appears once, not twice', orders.refCount === 1, `count=${orders.refCount}`);
check('cancel wears no outline', orders.cancelBorder === '0px', orders.cancelBorder);

// 9 — empty state names the container the user sees
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: 'networkidle0' });
await wait(500);
await page.evaluate(() => { [...document.querySelectorAll('.tab')].find(e => e.querySelector('.tab-lb')?.textContent.includes('Cart'))?.click(); });
await wait(500);
const emptyTxt = await page.evaluate(() => document.querySelector('[data-testid="empty-state"]')?.textContent.trim() || '');
check('the empty bag names the cart, not a "bag"', /your cart is empty/i.test(emptyTxt), emptyTxt);

await browser.close();
console.log(`design045: ${passed} passed, ${failed} failed`);
console.log(`RESULT ${passed}/${passed + failed}`);
process.exit(failed ? 1 : 0);
