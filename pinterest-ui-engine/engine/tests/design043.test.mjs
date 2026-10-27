// design043.test.mjs — Mission 043, composition & density, probed on a
// real built app in a real browser: facet groups share one row, card
// meta wraps to two lines instead of truncating silently, the record
// page's stats and detail list carry no boxes, and the product grid
// starts materially higher than the M042 baseline (530px at 390px).

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
  name: 'Fixture Eats', tagline: 't', about: 'a', location: 'Pune', currency: '₹',
  domain: 'food delivery', submissionsLabel: 'Your orders',
  collection: {
    label: 'Dish', plural: 'Dishes', media: true,
    items: [
      { id: 'r1', name: 'Alpha Dish With A Long Name', kind: 'One', diet: 'Veg', time: '20-30 min', price: 320, score: 4.5, note: 'First.' },
      { id: 'r2', name: 'Beta Dish', kind: 'Two', diet: 'Non-veg', time: '10-15 min', price: 200, score: 4.0, note: 'Second.' },
      { id: 'r3', name: 'Gamma Dish', kind: 'One', diet: 'Veg', time: '25-35 min', price: 260, score: 4.2, note: 'Third.' },
    ],
  },
  fields: [
    { id: 'name', type: 'text', label: 'Dish' },
    { id: 'kind', type: 'enum', label: 'Kind', options: ['One', 'Two'] },
    { id: 'diet', type: 'enum', label: 'Diet', options: ['Veg', 'Non-veg'] },
    { id: 'time', type: 'text', label: 'Time' },
    { id: 'price', type: 'money', label: 'Price' },
    { id: 'score', type: 'number', label: 'Rating' },
    { id: 'note', type: 'text', label: 'About' },
  ],
  requirements: [
    'The home screen is a photo-led gallery of every dish.',
    'Customers can search dishes by name and filter dishes by kind.',
    'Customers can filter dishes by diet.',
    'A customer can save a dish to favourites with a heart toggle.',
    'Opening a dish shows its full description and price.',
  ],
});

const dir = mkdtempSync(join(tmpdir(), 'design043-'));
const runDir = join(dir, 'case');
execFileSync('mkdir', ['-p', runDir]);
writeFileSync(join(runDir, 'product-brief.json'), JSON.stringify(product(), null, 2));
const engineDir = join(new URL('.', import.meta.url).pathname, '..');
execFileSync('node', [join(engineDir, 'run.mjs'), runDir], {
  env: { ...process.env, CHROME_PATH: process.env.CHROME_PATH || '' }, stdio: 'pipe',
});

const css = readFileSync(join(runDir, 'app', 'styles.css'), 'utf8');
check('the MISSION 043 composition layer ships in the compiled CSS', css.includes('MISSION 043'));
check('the promo is a band, not a billboard (min-height 0)', /\.promo \{ min-height: 0/.test(css));

const require = createRequire(join(engineDir, '..', 'package.json'));
const puppeteer = require('puppeteer-core');
const browser = await puppeteer.launch({
  executablePath: process.env.CHROME_PATH || '/opt/meta-chromium/chrome',
  args: ['--no-sandbox', '--allow-file-access-from-files'],
});
const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844 });
await page.goto('file://' + join(runDir, 'app', 'index.html'), { waitUntil: 'networkidle0' });
await new Promise(r => setTimeout(r, 500));

const browse = await page.evaluate(() => {
  const meta = document.querySelector('.card .card-meta');
  const mcs = meta ? getComputedStyle(meta) : null;
  const firstCard = document.querySelector('.card');
  return {
    chipRows: document.querySelectorAll('.chips').length,
    filterSections: document.querySelectorAll('.sect[data-section^="filter-"]').length,
    chipsPresent: document.querySelectorAll('.chips .chip').length,
    metaWhiteSpace: mcs ? mcs.whiteSpace : '',
    metaClamp: mcs ? mcs.webkitLineClamp : '',
    firstCardTop: firstCard ? Math.round(firstCard.getBoundingClientRect().top + window.scrollY) : null,
  };
});
check('two facet groups render as ONE chips row', browse.chipRows === 1 && browse.filterSections === 1,
  `rows=${browse.chipRows} sections=${browse.filterSections}`);
check('both facets\' chips live in the shared row', browse.chipsPresent >= 6, String(browse.chipsPresent));
check('card meta is not forced onto one line', browse.metaWhiteSpace === 'normal');
check('card meta may use two lines before any truncation', browse.metaClamp === '2', browse.metaClamp);
check('the grid starts above the M042 baseline (530px at 390px)', browse.firstCardTop !== null && browse.firstCardTop < 500,
  String(browse.firstCardTop));

await page.evaluate(() => document.querySelector('.card [data-act="open"]').click());
await new Promise(r => setTimeout(r, 400));
const detail = await page.evaluate(() => {
  const stats = document.querySelector('.stats');
  const dl = document.querySelector('.dl');
  const scs = stats ? getComputedStyle(stats) : null;
  const dcs = dl ? getComputedStyle(dl) : null;
  return {
    statsBg: scs ? scs.backgroundColor : 'none',
    statsBorder: scs ? scs.borderTopWidth : '?',
    dlBg: dcs ? dcs.backgroundColor : 'none',
    dlShadow: dcs ? dcs.boxShadow : '?',
  };
});
check('the stat row carries no box on the record page',
  (detail.statsBg === 'transparent' || detail.statsBg === 'rgba(0, 0, 0, 0)') && detail.statsBorder === '0px',
  `${detail.statsBg}/${detail.statsBorder}`);
check('the detail list carries no box on the record page',
  (detail.dlBg === 'transparent' || detail.dlBg === 'rgba(0, 0, 0, 0)') && detail.dlShadow === 'none',
  `${detail.dlBg}/${detail.dlShadow}`);
await browser.close();

console.log(`\nRESULT ${passed}/${passed + failed}`);
process.exit(failed ? 1 : 0);
