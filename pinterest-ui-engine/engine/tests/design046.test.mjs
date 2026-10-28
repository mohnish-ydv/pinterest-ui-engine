// design046.test.mjs — Mission 046, the Evira families, probed on a
// real built app in a real browser: an entry gate (onboarding, then
// auth) in front of the shell, a greeting home with category
// medallions instead of a duplicated chip rail, a filter sheet with
// facet chips, a price range and rating floors, variant selectors
// whose choice rides into the bag and the order, a declared checkout
// flow with priced radio rows, a success modal, an order tracker and
// barcode receipt, a wallet that tops up, a profile whose toggles
// persist beside an FAQ accordion, a notices list, and a search
// not-found state. All of it declared in the brief; none of it
// derived from prose.

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
  name: 'Evira Probe', tagline: 'Fashion, decoded.',
  about: 'A fashion store probe for the Evira families.',
  location: 'Bengaluru, Karnataka', currency: '₹', domain: 'fashion store',
  bagLabel: 'Cart', submissionsLabel: 'My Orders', referencePrefix: 'EP',
  deliveryFee: 0, freeAbove: 0,
  homeHeader: 'greeting', showCategories: true,
  promo: { title: 'Sale on now', subtitle: "Today's Special", percent: '30%', cta: 'Shop now', recordId: 'r1' },
  collection: {
    label: 'Product', plural: 'Products', media: true,
    items: [
      {
        id: 'r1', name: 'Suga Leather Shoes', category: 'Shoes', rating: 4.8, price: 7499,
        note: 'Full-grain leather derby.', images: ['assets/a.jpg', 'assets/b.jpg'],
        variants: [
          { label: 'Colour', style: 'swatch', options: [{ label: 'Tan', value: 'Tan', color: '#b07d4f' }, { label: 'Black', value: 'Black', color: '#1c1c22' }] },
          { label: 'Size', style: 'circles', options: ['8', '9'] },
        ],
        reviews: [{ name: 'Jane Cooper', rating: 5, date: 'Dec 12, 2024', text: 'Superb leather.' }],
      },
      { id: 'r2', name: 'Vinia Headphone', category: 'Audio', rating: 4.7, price: 5999, note: 'Over-ear, ANC.' },
      { id: 'r3', name: 'Mini Leather Bag', category: 'Bags', rating: 4.6, price: 4299, note: 'Compact crossbody.' },
    ],
  },
  fields: [
    { id: 'name', type: 'text', label: 'Product' },
    { id: 'category', type: 'enum', label: 'Category', options: ['Shoes', 'Audio', 'Bags'] },
    { id: 'rating', type: 'rating', label: 'Rating' },
    { id: 'price', type: 'money', label: 'Price' },
    { id: 'note', type: 'text', label: 'Description' },
  ],
  flow: {
    form: [
      { id: 'fullName', label: 'Your name', type: 'text', required: true, minLength: 2, testid: 'field-name', errorTestid: 'error-name', message: 'Enter your name.' },
      { id: 'phone', label: 'Mobile number', type: 'tel', required: true, pattern: '^\\d{10}$', stripWhitespace: true, testid: 'field-phone', errorTestid: 'error-phone', message: 'Enter a 10-digit mobile number.' },
      {
        id: 'delivery', label: 'Choose Shipping', type: 'enum', required: true, testid: 'field-delivery', errorTestid: 'error-delivery', message: 'Choose a delivery method.',
        options: [
          { label: 'Standard', value: 'Standard', caption: 'Arrives in 3–5 days', price: 0 },
          { label: 'Express', value: 'Express', caption: 'Tomorrow by 9 pm', price: 79 },
        ],
      },
    ],
    steps: [
      { id: 'details', label: 'Your details', fields: ['fullName', 'phone'] },
      { id: 'delivery', label: 'Delivery', fields: ['delivery'] },
      { id: 'review', label: 'Review', fields: [], review: true },
    ],
  },
  wallet: { label: 'My E-Wallet', balance: 1000, transactions: [{ label: 'Top Up Wallet', amount: 1000, kind: 'topup', when: 'Dec 12, 2024' }] },
  profile: {
    name: 'Andrew Ainsley', sub: 'andrew@yourdomain.com',
    sections: [
      { rows: [{ kind: 'link', label: 'E-Wallet', view: 'wallet' }, { kind: 'link', label: 'Notification', view: 'notices' }] },
      { title: 'Preferences', rows: [{ kind: 'toggle', label: 'Notifications', value: true }] },
    ],
  },
  notices: [{ when: 'Today', title: '30% Special Discount!', text: 'Get 30% off your first order.' }],
  faq: [{ q: 'How do I track my order?', a: 'Open My Orders and tap Track Order.' }],
  onboarding: { cta: 'Get Started', slides: [{ headline: 'Welcome', text: 'The probe store.' }] },
  auth: { providers: ['Google'], titleIn: 'Login to your Account', titleUp: 'Create your Account' },
  requirements: [
    'The home screen is a gallery of every product in the store.',
    'Customers can search products by name.',
    'Customers can filter products by category.',
    'A customer can save a product to favourites with a heart toggle.',
    'Customers add products to a cart from the home screen and from each product\'s page, and adjust quantities in the cart before ordering.',
    'Opening a product shows its description and price.',
    'A customer checks out from the cart and places an order.',
    'A placed order ends with a confirmation showing a reference the customer can quote.',
    'Customers can review their placed orders and cancel an order they no longer want.',
  ],
});

const dir = mkdtempSync(join(tmpdir(), 'design046-'));
const runDir = join(dir, 'case');
execFileSync('mkdir', ['-p', runDir]);
writeFileSync(join(runDir, 'product-brief.json'), JSON.stringify(product(), null, 2));
const engineDir = join(new URL('.', import.meta.url).pathname, '..');
execFileSync('node', [join(engineDir, 'run.mjs'), runDir], { stdio: 'pipe' });

const css = readFileSync(join(runDir, 'app', 'styles.css'), 'utf8');
check('the MISSION 046 layer ships in the compiled CSS', css.includes('MISSION 046'));
const spec = JSON.parse(readFileSync(join(runDir, 'design-spec.json'), 'utf8'));
check('a fashion brief derives the mono world (black brand, white ground)',
  spec.palette && spec.palette.brand === '#141414' && spec.palette.ground === '#FFFFFF',
  `brand=${spec.palette && spec.palette.brand} ground=${spec.palette && spec.palette.ground}`);
const dataJs = readFileSync(join(runDir, 'app', 'data.js'), 'utf8');
check('the compiled model carries the declared families',
  ['"wallet"', '"profile"', '"notices"', '"faq"', '"onboarding"', '"auth"'].every(k => dataJs.includes(k)));

const require = createRequire(import.meta.url);
let puppeteer;
try { puppeteer = require('puppeteer-core'); } catch { puppeteer = null; }
check('puppeteer-core is available for browser probes', !!puppeteer);
if (!puppeteer) {
  console.log(`RESULT ${passed}/${passed + failed}`);
  process.exit(failed ? 1 : 0);
}

const { findChrome } = await import(join(engineDir, 'lib', 'chrome.mjs')).catch(() => ({ findChrome: null }));
const exe = (findChrome && findChrome()) || process.env.CHROME_PATH || '/opt/meta-chromium/chrome';
const browser = await puppeteer.launch({ executablePath: exe, args: ['--no-sandbox', '--allow-file-access-from-files'] });
const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844 });
const errs = [];
page.on('pageerror', e => errs.push(String(e)));
await page.goto('file://' + join(runDir, 'app', 'index.html'), { waitUntil: 'networkidle0' });
const wait = ms => new Promise(r => setTimeout(r, ms));
await wait(500);
const ev = (fn, ...a) => page.evaluate(fn, ...a);

// 1 — the entry gate comes first: onboarding, no shell tabs behind it
const gate1 = await ev(() => ({
  intro: !!document.querySelector('[data-testid="intro-next"]'),
  tabs: document.querySelectorAll('.tab').length,
}));
check('onboarding gates the shell (no tab bar behind it)', gate1.intro && gate1.tabs === 0, JSON.stringify(gate1));
await ev(() => document.querySelector('[data-testid="intro-next"]').click());
await wait(400);
const gate2 = await ev(() => ({
  auth: !!document.querySelector('[data-testid="auth-submit"]'),
  providers: document.querySelectorAll('.social-btn').length,
}));
check('auth follows onboarding, with provider discs', gate2.auth && gate2.providers === 1, JSON.stringify(gate2));
await page.type('#auth-email', 'andrew@yourdomain.com');
await page.type('#auth-pass', 'hunter2');
await ev(() => document.querySelector('[data-testid="auth-submit"]').click());
await wait(500);

// 2 — the greeting home: greeting header, medallions, no tagline heading
const home = await ev(() => ({
  greet: !!document.querySelector('.greet'),
  medallions: document.querySelectorAll('.medallion').length,
  heading: !!document.querySelector('.sect[data-section="heading"]'),
  filterBtn: !!document.querySelector('[data-testid="filter-btn"]'),
  pct: (document.querySelector('.promo-pct') || {}).textContent || '',
}));
check('the greeting header opens the home', home.greet);
check('category medallions render (All + one per option)', home.medallions === 4, `got ${home.medallions}`);
check('a greeting home plans no tagline heading', home.heading === false);
check('the filter button rides the search row even without a chip rail', home.filterBtn);
check('the promo leads with its percent', home.pct.includes('30'), `got ${home.pct}`);

// 3 — the filter sheet: facet chips with real options, rating floors
await ev(() => document.querySelector('[data-testid="filter-btn"]').click());
await wait(400);
const sheet = await ev(() => {
  const sh = document.querySelector('.sheet');
  if (!sh) return null;
  const chips = [...sh.querySelectorAll('.chip')].map(c => c.textContent.trim());
  return { chips, ranges: sh.querySelectorAll('input[type="range"]').length };
});
check('the filter sheet carries the facet options', !!sheet && sheet.chips.includes('Shoes') && sheet.chips.includes('Bags'), JSON.stringify(sheet));
check('the filter sheet carries price range and rating floors',
  !!sheet && sheet.ranges === 2 && sheet.chips.some(c => c.includes('4.5')));
await ev(() => document.querySelector('[data-testid="filter-apply"]').click());
await wait(400);

// 4 — search: a results line for a hit, the not-found state for a miss
await page.type('[data-testid="search"]', 'Suga');
await wait(500);
const hit = await ev(() => (document.querySelector('.results-line') || {}).textContent || '');
check('a search shows the results line with query and count', hit.includes('Suga') && hit.includes('1 found'), `got ${hit}`);
await ev(() => { const i = document.querySelector('[data-testid="search"]'); i.value = ''; i.dispatchEvent(new Event('input', { bubbles: true })); });
await wait(300);
await page.type('[data-testid="search"]', 'zzz-no-such-product');
await wait(500);
const nf = await ev(() => ({
  notfound: !!document.querySelector('.empty.is-notfound'),
  headline: (document.querySelector('.empty-h') || {}).textContent || '',
}));
check('a fruitless search shows the not-found state', nf.notfound && nf.headline === 'Not Found', JSON.stringify(nf));
await ev(() => { const i = document.querySelector('[data-testid="search"]'); i.value = ''; i.dispatchEvent(new Event('input', { bubbles: true })); });
await wait(400);

// 5 — detail: carousel chrome, variant selectors, reviews
await ev(() => { [...document.querySelectorAll('.card-open')].find(e => e.textContent.includes('Suga'))?.click(); });
await wait(600);
const detail = await ev(() => ({
  heroNav: !!document.querySelector('.hero-next'),
  swatches: document.querySelectorAll('.swatch').length,
  dots: document.querySelectorAll('.size-dot').length,
  revAvg: (document.querySelector('.rev-avg') || {}).textContent || '',
}));
check('a multi-photo record gets carousel chrome', detail.heroNav);
check('variant selectors render (swatches and size circles)', detail.swatches === 2 && detail.dots === 2, JSON.stringify(detail));
check('reviews render their average', detail.revAvg.includes('5'), `got ${detail.revAvg}`);
await ev(() => { document.querySelectorAll('.swatch')[1].click(); });
await wait(300);
await ev(() => { [...document.querySelectorAll('.size-dot')].find(d => d.textContent.trim() === '9')?.click(); });
await wait(300);
await ev(() => document.querySelector('[data-testid="add-to-bag"]').click());
await wait(400);
await ev(() => document.querySelector('.tab[data-view="bag"]').click());
await wait(500);
const bagRow = await ev(() => (document.querySelector('.bag-item') || {}).textContent || '');
check('the chosen variant rides into the bag', bagRow.includes('Black') && bagRow.includes('9'), bagRow.slice(0, 80));

// 6 — remove sheet: ask, then cancel keeps the item
await ev(() => document.querySelector('[data-testid="bag-remove"]').click());
await wait(400);
const rmSheet = await ev(() => !!document.querySelector('[data-testid="remove-confirm"]'));
check('removing a bag item asks first (sheet)', rmSheet);
await ev(() => { [...document.querySelectorAll('.sheet [data-act="sheet-close"]')][0]?.click(); });
await wait(400);
const stillThere = await ev(() => !!document.querySelector('.bag-item'));
check('cancelling the sheet keeps the item', stillThere);

// 7 — the declared checkout: priced radio rows, then the success modal
await ev(() => { [...document.querySelectorAll('button')].find(b => b.textContent.trim() === 'Checkout')?.click(); });
await wait(600);
await page.type('[data-testid="field-name"]', 'Andrew Ainsley');
await page.type('[data-testid="field-phone"]', '9876543210');
await ev(() => document.querySelector('[data-testid="step-next"]').click());
await wait(500);
const radios = await ev(() => [...document.querySelectorAll('.radio-row')].map(r => r.textContent.replace(/\s+/g, ' ').trim()));
check('the declared flow renders priced radio rows',
  radios.length === 2 && radios.some(r => r.includes('Express') && r.includes('79')), JSON.stringify(radios));
await ev(() => { [...document.querySelectorAll('.radio-row')].find(r => r.textContent.includes('Express'))?.click(); });
await wait(300);
await ev(() => document.querySelector('[data-testid="step-next"]').click());
await wait(500);
await ev(() => document.querySelector('[data-testid="confirm-btn"]').click());
await wait(700);
const confirm = await ev(() => ({
  card: !!document.querySelector('.confirm-card'),
  ref: (document.querySelector('[data-testid="confirm-ref"]') || {}).textContent || '',
}));
check('the confirmation is a centred modal card', confirm.card);
check('the modal carries the order reference', confirm.ref.startsWith('EP-'), `got ${confirm.ref}`);

// 8 — orders: tracker and a barcode receipt that keeps the ref private
await ev(() => document.querySelector('.tab[data-view="submissions"]').click());
await wait(500);
await ev(() => document.querySelector('[data-testid="receipt-btn"]').click());
await wait(400);
const receipt = await ev(() => ({
  tracker: !!document.querySelector('[data-testid="order-tracker"]'),
  bars: document.querySelectorAll('.barcode span').length,
  text: (document.querySelector('.receipt') || {}).textContent || '',
}));
check('the order carries the stage tracker', receipt.tracker);
check('the receipt barcode is drawn from the reference', receipt.bars > 20, `bars=${receipt.bars}`);
check('the receipt never prints the reference it encodes', !receipt.text.includes(confirm.ref));

// 9 — profile: toggles persist, FAQ opens; wallet tops up from its sheet
await ev(() => document.querySelector('.tab[data-view="products"], .tab')?.click());
await wait(400);
await ev(() => document.querySelector('.greet-av').click());
await wait(500);
const prof = await ev(() => ({
  toggles: document.querySelectorAll('[data-testid="prof-toggle"]').length,
  faq: document.querySelectorAll('.faq-q').length,
}));
check('the profile renders its rows and toggles', prof.toggles === 1, JSON.stringify(prof));
check('the FAQ rides the profile view', prof.faq === 1);
await ev(() => document.querySelectorAll('.faq-q')[0].click());
await wait(300);
const faqOpen = await ev(() => !!document.querySelector('.faq-a'));
check('the FAQ accordion opens its answer', faqOpen);
await ev(() => { [...document.querySelectorAll('.prof-row')].find(r => r.textContent.includes('E-Wallet'))?.click(); });
await wait(500);
const bal0 = await ev(() => document.querySelector('[data-testid="wallet-balance"]').textContent);
await ev(() => document.querySelector('[data-testid="wallet-topup"]').click());
await wait(400);
await ev(() => { [...document.querySelectorAll('.topup-chips .chip')].find(c => c.textContent.includes('500'))?.click(); });
await wait(300);
await ev(() => document.querySelector('[data-testid="topup-confirm"]').click());
await wait(500);
const bal1 = await ev(() => document.querySelector('[data-testid="wallet-balance"]').textContent);
check('a top-up raises the wallet balance', bal0.includes('1,000') && bal1.includes('1,500'), `${bal0} -> ${bal1}`);

// 10 — notices (reached the way a user reaches them: home, avatar,
// profile, row — the tab-rooted back stack is not assumed)
await ev(() => document.querySelector('.tab[data-view="products"], .tab')?.click());
await wait(400);
await ev(() => document.querySelector('.greet-av').click());
await wait(500);
await ev(() => { document.querySelector('.prof-row[data-view="notices"]')?.click(); });
await wait(500);
const notices = await ev(() => [...document.querySelectorAll('.notice')].map(n => n.textContent).join(' '));
check('the notices list renders the declared notices', notices.includes('30% Special Discount'), notices.slice(0, 60));

check('no page errors across the whole drive', errs.length === 0, errs.slice(0, 2).join(' | '));
await browser.close();
console.log(`RESULT ${passed}/${passed + failed}`);
process.exit(failed ? 1 : 0);
