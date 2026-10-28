// design049.test.mjs — Mission 049: the two "All" chips.
//
// An external review of a v1.28 Fern & Co build spotted what 507 green
// checks had not: the browse rail folds every facet group into ONE row
// and each group opens with a bare "All", so the row read
// "All · Foliage · Flowering · Palm | All · Bright · Medium · Low" —
// two identical reset chips, both selected, separated by a hairline,
// the second group's options off-screen with the scrollbar hidden and
// no affordance that more existed. Grammar law 33 is the fix; this
// suite is its evidence. It FAILS on the M048 tree (duplicate visible
// chip text, unqualified resets, no data-overflow affordance) and must
// pass here.
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';

const ENGINE = join(dirname(fileURLToPath(import.meta.url)), '..');
const CHROME = process.env.CHROME_PATH || '/opt/meta-chromium/chrome';
let pass = 0, fail = 0;
const check = (name, ok, extra = '') => { console.log(`${ok ? '✓' : '✗ FAIL'} ${name}${extra ? ' — ' + extra : ''}`); ok ? pass++ : fail++; };
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFAAH/q842iQAAAABJRU5ErkJggg==', 'base64');

const items = [
  { id: 'p1', name: 'Alpha', type: 'Foliage', light: 'Bright', price: 100, rating: 4.8, size: 'S', note: 'n1', image: 'assets/a.png' },
  { id: 'p2', name: 'Beta', type: 'Foliage', light: 'Low', price: 200, rating: 4.7, size: 'S', note: 'n2', image: 'assets/a.png' },
  { id: 'p3', name: 'Gamma', type: 'Foliage', light: 'Medium', price: 300, rating: 4.5, size: 'M', note: 'n3', image: 'assets/a.png' },
  { id: 'p4', name: 'Delta', type: 'Flowering', light: 'Medium', price: 400, rating: 4.4, size: 'M', note: 'n4', image: 'assets/a.png' },
  { id: 'p5', name: 'Epsilon', type: 'Palm', light: 'Bright', price: 500, rating: 4.7, size: 'L', note: 'n5', image: 'assets/a.png' },
  { id: 'p6', name: 'Zeta', type: 'Palm', light: 'Bright', price: 600, rating: 4.6, size: 'L', note: 'n6', image: 'assets/a.png' },
];
const fields = [
  { id: 'name', label: 'Plant', type: 'text' },
  { id: 'type', label: 'Type', type: 'enum', options: ['Foliage', 'Flowering', 'Palm'] },
  { id: 'light', label: 'Light', type: 'enum', options: ['Bright', 'Medium', 'Low'] },
  { id: 'size', label: 'Size', type: 'text' },
  { id: 'price', label: 'Price', type: 'money' },
  { id: 'rating', label: 'Rating', type: 'number' },
  { id: 'note', label: 'Care', type: 'text' },
];
const brief = {
  name: 'Probe Plants', tagline: 'Plants for probing.', about: 'A small plant shop probe.',
  domain: 'plant shop', location: 'Test City', currency: '₹', referencePrefix: 'PP',
  bagLabel: 'Crate', submissionsLabel: 'Your orders', deliveryFee: 49, freeAbove: 999,
  fields,
  requirements: [
    'The home screen is a photo-led gallery of every plant on the shelf.',
    'Customers can search plants by name.',
    'Customers can filter plants by type.',
    'Customers can filter plants by light.',
    'A customer can save a plant to favourites with a heart toggle.',
    'Customers add plants to a bag from the shelf and from each plant\u2019s page, and adjust quantities in the bag before ordering.',
    'Opening a plant shows its care notes, price, rating and size.',
    'A customer checks out from the bag and places an order in three steps: your name and phone, then your delivery address, then review.',
    'A placed order ends with a confirmation showing a reference the customer can quote.',
    'Customers can review their placed orders and cancel an order they no longer want.',
  ],
  collection: { label: 'Plant', plural: 'Plants', media: true, items },
};

function generate(b, dirName) {
  const dir = mkdtempSync(join(tmpdir(), dirName));
  mkdirSync(join(dir, 'assets'), { recursive: true });
  writeFileSync(join(dir, 'assets', 'a.png'), PNG);
  writeFileSync(join(dir, 'product-brief.json'), JSON.stringify(b, null, 2));
  execFileSync('node', [join(ENGINE, 'run.mjs'), dir], { stdio: 'pipe' });
  return dir;
}

const dir = generate(brief, 'd49-');
const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'shell', args: ['--no-sandbox', '--allow-file-access-from-files'] });
const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844 });
const errors = [];
page.on('pageerror', e => errors.push(String(e)));
await page.goto('file://' + join(dir, 'app', 'index.html'), { waitUntil: 'networkidle0' });
await new Promise(r => setTimeout(r, 600));

const rail = await page.evaluate(() => {
  const el = document.querySelector('.sect[data-section="filter-type"] .chips') || document.querySelector('.chips');
  const chips = [...el.querySelectorAll('.chip')].map(c => ({
    text: c.textContent.trim(),
    aria: c.getAttribute('aria-label') || '',
    type: c.getAttribute('data-type'), light: c.getAttribute('data-light'),
    testid: c.getAttribute('data-testid'),
  }));
  return { chips, ariaLabel: el.getAttribute('aria-label') || '', overflow: el.getAttribute('data-overflow'), mask: getComputedStyle(el).maskImage || getComputedStyle(el).webkitMaskImage || '', sw: el.scrollWidth, cw: el.clientWidth };
});
const texts = rail.chips.map(c => c.text);
check('rail: no two chips share identical visible text', new Set(texts).size === texts.length, JSON.stringify(texts));
const resetType = rail.chips.find(c => c.type === 'All');
const resetLight = rail.chips.find(c => c.light === 'All');
check('rail: the Type reset chip is qualified by its facet', !!resetType && resetType.text.includes('Type') && resetType.text !== 'All', resetType && resetType.text);
check('rail: the Light reset chip is qualified by its facet', !!resetLight && resetLight.text.includes('Light') && resetLight.text !== 'All', resetLight && resetLight.text);
check('rail: reset values stay "All" (state and gates key on value)', !!resetType && !!resetLight);
check('rail: the rail aria-label names both facets', rail.ariaLabel.includes('Type') && rail.ariaLabel.includes('Light'), rail.ariaLabel);
check('rail: every chip aria-label names its facet', rail.chips.every(c => c.aria.includes('Type') || c.aria.includes('Light')), JSON.stringify(rail.chips.map(c => c.aria)));
check('rail: an overflowing rail carries the measured affordance', rail.sw > rail.cw && rail.overflow === 'true', `sw=${rail.sw} cw=${rail.cw} overflow=${rail.overflow}`);
check('rail: the affordance fades the trailing edge', rail.mask.includes('linear-gradient'), rail.mask.slice(0, 60));

const cards = () => page.evaluate(() => document.querySelectorAll('.card').length);
check('browse: all 6 records show at rest', (await cards()) === 6);
await page.evaluate(() => document.querySelector('[data-testid="type-chip"][data-type="Foliage"]').click());
await new Promise(r => setTimeout(r, 350));
check('filter: Type=Foliage narrows to 3', (await cards()) === 3);
await page.evaluate(() => document.querySelector('[data-testid="type-chip"][data-type="All"]').click());
await new Promise(r => setTimeout(r, 350));
check('filter: the qualified Type reset restores all 6', (await cards()) === 6);
await page.evaluate(() => document.querySelector('[data-testid="light-chip"][data-light="Bright"]').click());
await new Promise(r => setTimeout(r, 350));
check('filter: Light=Bright narrows to 3', (await cards()) === 3);
await page.evaluate(() => document.querySelector('[data-testid="light-chip"][data-light="All"]').click());
await new Promise(r => setTimeout(r, 350));
check('filter: the qualified Light reset restores all 6', (await cards()) === 6);

// The filter sheet: groups are headed visually; resets must still name
// their facet to a screen reader.
await page.evaluate(() => document.querySelector('[data-testid="filter-btn"]').click());
await new Promise(r => setTimeout(r, 400));
const sheetAria = await page.evaluate(() => [...document.querySelectorAll('.sheet .chip')].filter(c => c.getAttribute('data-value') === 'All').map(c => c.getAttribute('aria-label') || ''));
check('sheet: each reset chip names its facet in aria-label', sheetAria.length === 2 && sheetAria.some(a => a.includes('Type')) && sheetAria.some(a => a.includes('Light')), JSON.stringify(sheetAria));
await page.evaluate(() => document.querySelector('[data-testid="filter-apply"]').click());
await new Promise(r => setTimeout(r, 300));
await browser.close();

// A single-facet rail is unambiguous: the plain reset label stays.
const single = { ...brief, name: 'Probe One Facet', fields: fields.filter(f => f.id !== 'light'),
  requirements: brief.requirements.filter(r => !r.includes('by light')),
  collection: { label: 'Plant', plural: 'Plants', media: true, items: items.map(({ light, ...rest }) => rest) } };
const dir1 = generate(single, 'd49s-');
const browser1 = await puppeteer.launch({ executablePath: CHROME, headless: 'shell', args: ['--no-sandbox', '--allow-file-access-from-files'] });
const page1 = await browser1.newPage();
await page1.setViewport({ width: 390, height: 844 });
page1.on('pageerror', e => errors.push(String(e)));
await page1.goto('file://' + join(dir1, 'app', 'index.html'), { waitUntil: 'networkidle0' });
await new Promise(r => setTimeout(r, 500));
const singleTexts = await page1.evaluate(() => [...document.querySelectorAll('.chips .chip')].map(c => c.textContent.trim()));
check('single facet: the reset chip keeps the plain label', singleTexts[0] === 'All', JSON.stringify(singleTexts));
check('single facet: chip texts are still unique', new Set(singleTexts).size === singleTexts.length, JSON.stringify(singleTexts));
await browser1.close();

check('no page errors anywhere', errors.length === 0, errors.join(' | '));
console.log(`\ndesign049: ${pass} passed, ${fail} failed`);
console.log(`RESULT ${pass}/${pass + fail}`);
process.exit(fail ? 1 : 0);
