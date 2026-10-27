// design042.test.mjs — Mission 042, the grammar, mechanically checked.
//
// Fifteen boards agree on a discipline; this suite holds the engine to
// it on a real built app, in a real browser: search is a pill with its
// icon inside and no button; cards are borderless and carry one meta
// line; chips are quiet tints until selected; the working type is the
// UI sans outside editorial compositions; the record page's save is an
// icon on the photo, not an outlined pill.

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
      { id: 'r1', name: 'Alpha Dish With A Long Name', kind: 'One', time: '20-30 min', price: 320, score: 4.5, note: 'First.' },
      { id: 'r2', name: 'Beta Dish', kind: 'Two', time: '10-15 min', price: 200, score: 4.0, note: 'Second.' },
      { id: 'r3', name: 'Gamma Dish', kind: 'One', time: '25-35 min', price: 260, score: 4.2, note: 'Third.' },
    ],
  },
  fields: [
    { id: 'name', type: 'text', label: 'Dish' },
    { id: 'kind', type: 'enum', label: 'Kind', options: ['One', 'Two'] },
    { id: 'time', type: 'text', label: 'Time' },
    { id: 'price', type: 'money', label: 'Price' },
    { id: 'score', type: 'number', label: 'Rating' },
    { id: 'note', type: 'text', label: 'About' },
  ],
  requirements: [
    'The home screen is a photo-led gallery of every dish.',
    'Customers can search dishes by name and filter dishes by kind.',
    'A customer can save a dish to favourites with a heart toggle.',
    'Opening a dish shows its full description and price.',
  ],
});

const dir = mkdtempSync(join(tmpdir(), 'design042-'));
const runDir = join(dir, 'case');
execFileSync('mkdir', ['-p', runDir]);
writeFileSync(join(runDir, 'product-brief.json'), JSON.stringify(product(), null, 2));
const engineDir = join(new URL('.', import.meta.url).pathname, '..');
execFileSync('node', [join(engineDir, 'run.mjs'), runDir], {
  env: { ...process.env, CHROME_PATH: process.env.CHROME_PATH || '' }, stdio: 'pipe',
});

const css = readFileSync(join(runDir, 'app', 'styles.css'), 'utf8');
check('the grammar block ships in the compiled CSS', css.includes('MISSION 042'));
check('cards are borderless in the grammar layer', /\.card \{ border: none/.test(css));

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

const probe = await page.evaluate(() => {
  const cs = (sel) => { const el = document.querySelector(sel); return el ? getComputedStyle(el) : null; };
  const search = cs('.search');
  const card = cs('.card');
  const chip = cs('.chip');
  const title = cs('.page-title');
  const cardEl = document.querySelector('.card');
  return {
    searchRadius: search ? parseFloat(search.borderRadius) : 0,
    searchBtn: !!document.querySelector('.search-btn'),
    searchIcon: !!document.querySelector('.search-ic'),
    cardBorder: card ? card.borderTopWidth : '?',
    chipBorder: chip ? chip.borderTopWidth : '?',
    metaLines: cardEl ? cardEl.querySelectorAll('.card-meta').length : -1,
    subLines: cardEl ? cardEl.querySelectorAll('.card-sub').length : -1,
    statsLines: cardEl ? cardEl.querySelectorAll('.card-stats').length : -1,
    titleFont: title ? title.fontFamily : '',
  };
});
check('search is a pill (radius >= 20px)', probe.searchRadius >= 20, String(probe.searchRadius));
check('there is no search button', !probe.searchBtn);
check('the search icon sits inside the field', probe.searchIcon);
check('cards compute to zero border', probe.cardBorder === '0px', probe.cardBorder);
check('chips compute to zero border', probe.chipBorder === '0px', probe.chipBorder);
check('a card carries exactly one meta line', probe.metaLines === 1, String(probe.metaLines));
check('no stacked sub/stats lines remain on cards', probe.subLines === 0 && probe.statsLines === 0);
check('the browse headline is not a serif display face',
  !/\b(palatino|georgia|didot|playfair|iowan)\b/i.test(probe.titleFont), probe.titleFont);

await page.evaluate(() => document.querySelector('.card [data-act="open"]').click());
await new Promise(r => setTimeout(r, 400));
const detail = await page.evaluate(() => ({
  saveWide: !!document.querySelector('.rec-media-wrap .save-btn'),
  wideBtn: !!document.querySelector('.save-btn.wide'),
}));
check('the record page save is the icon overlaid on the media', detail.saveWide && !detail.wideBtn);
await browser.close();

console.log(`\nRESULT ${passed}/${passed + failed}`);
process.exit(failed ? 1 : 0);
