// design039.test.mjs — Mission 039, the bag: a complete commerce journey.
//
// A real app journey needs a bag: add from cards and record pages,
// quantities, totals with a delivery rule, checkout, an order that
// carries its items and total. None of that was derivable before M039.
// These checks pin the capability on a synthetic fixture and drive the
// built app's money in a real browser.

import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createRequire } from 'node:module';
import { deriveBrief } from '../intake/derive.mjs';
import { compileIntent } from '../intent/compile.mjs';
import { planApp } from '../layout/plan.mjs';

let passed = 0;
let failed = 0;
const check = (name, cond, detail = '') => {
  if (cond) { passed++; console.log(`  ok  ${name}`); }
  else { failed++; console.log(`  FAIL ${name} ${detail}`); }
};

const product = () => ({
  name: 'Fixture Eats', tagline: 't', about: 'a', location: 'Pune', currency: '₹',
  domain: 'food delivery', submissionsLabel: 'Your orders', deliveryFee: 40, freeAbove: 499,
  collection: {
    label: 'Dish', plural: 'Dishes', media: true,
    items: [
      { id: 'r1', name: 'Alpha Dish', kind: 'One', price: 320, score: 4.5, note: 'First.' },
      { id: 'r2', name: 'Beta Dish', kind: 'Two', price: 200, score: 4.0, note: 'Second.' },
    ],
  },
  fields: [
    { id: 'name', type: 'text', label: 'Dish' },
    { id: 'kind', type: 'enum', label: 'Kind', options: ['One', 'Two'] },
    { id: 'price', type: 'money', label: 'Price' },
    { id: 'score', type: 'number', label: 'Rating' },
    { id: 'note', type: 'text', label: 'About' },
  ],
  requirements: [
    'A photo-led gallery of every dish.',
    'Customers add dishes to a bag and adjust quantities in the bag.',
    'A customer checks out from the bag and places an order in three steps: your name and phone, then your delivery address, then review.',
    'A placed order ends with a confirmation showing a reference.',
  ],
});

{
  const brief = deriveBrief(product(), null);
  check('the bag is derived with its price field and delivery rule',
    !!brief.bag && brief.bag.priceField === 'price' && brief.bag.deliveryFee === 40 && brief.bag.freeAbove === 499,
    JSON.stringify(brief.bag));
  check('a bag app has no browse entry action (checkout lives in the bag)',
    !brief.entryAction);
  check('orders carry items and total',
    (brief.collections?.[0]?.fields || []).slice(0, 3).join(',') === 'ref,items,total',
    JSON.stringify(brief.collections?.[0]?.fields));
  const layout = planApp(brief, null, { intent: { composition: compileIntent(brief, {}).composition } });
  check('the bag and checkout are planned views',
    layout.views.some(v => v.id === 'bag') && layout.views.some(v => v.id === 'checkout'));
  check('the bag is a tab destination',
    layout.navigation.items.some(i => i.view === 'bag' && i.icon === 'bag'),
    JSON.stringify(layout.navigation.items.map(i => i.view)));
  const detail = layout.views.find(v => v.id === 'detail');
  check('the record page adds to the bag instead of hosting the flow',
    detail.sections.some(s => s.component === 'bag-add') && !detail.sections.some(s => s.component === 'step-flow'));
}

{
  const dir = mkdtempSync(join(tmpdir(), 'design039-'));
  const runDir = join(dir, 'case');
  execFileSync('mkdir', ['-p', runDir]);
  writeFileSync(join(runDir, 'product-brief.json'), JSON.stringify(product(), null, 2));
  const engineDir = join(import.meta.url.replace('file://', ''), '..', '..');
  execFileSync('node', [join(engineDir, 'run.mjs'), runDir], {
    env: { ...process.env, CHROME_PATH: process.env.CHROME_PATH || '' }, stdio: 'pipe',
  });
  const js = readFileSync(join(runDir, 'app', 'app.js'), 'utf8');
  check('built runtime renders the bag and computes totals',
    js.includes("R['bag-list']") && js.includes('bagTotals'));
  const css = readFileSync(join(runDir, 'app', 'styles.css'), 'utf8');
  check('built CSS styles bag items and the card add button',
    css.includes('.bag-item') && css.includes('.card-add'));

  // Drive the money: 2 x 320 + 1 x 200 = 840 -> free delivery.
  // Then drop to 1 x 320 = 320 -> the 40 fee returns. Total 360.
  const require = createRequire(join(engineDir, 'package.json'));
  const puppeteer = require('puppeteer-core');
  const browser = await puppeteer.launch({
    executablePath: process.env.CHROME_PATH || '/opt/meta-chromium/chrome',
    args: ['--no-sandbox', '--allow-file-access-from-files'],
  });
  const page = await browser.newPage();
  await page.goto('file://' + join(runDir, 'app', 'index.html'), { waitUntil: 'networkidle0' });
  const wait = (ms) => new Promise(r => setTimeout(r, ms));
  await wait(400);
  const add = (id) => page.evaluate((i) => {
    document.querySelector(`[data-testid="dish-list"] .card [data-act="add"][data-id="${i}"]`).click();
  }, id);
  await add('r1'); await wait(150); await add('r1'); await wait(150); await add('r2'); await wait(250);
  await page.evaluate(() => document.querySelector('[data-testid="nav-bag"]').click());
  await wait(350);
  const read = (tid) => page.evaluate((t) => document.querySelector(`[data-testid="${t}"]`)?.textContent.trim(), tid);
  check('subtotal is the sum of lines', (await read('bag-subtotal')) === '₹840', await read('bag-subtotal'));
  check('delivery is free at or above the threshold', (await read('bag-delivery')) === 'Free', await read('bag-delivery'));
  await page.evaluate(() => document.querySelector('.bag-item[data-id="r2"] [data-testid="bag-dec"]').click());
  await wait(250);
  await page.evaluate(() => document.querySelector('.bag-item[data-id="r1"] [data-testid="bag-dec"]').click());
  await wait(350);
  check('steppers recompute the subtotal', (await read('bag-subtotal')) === '₹320', await read('bag-subtotal'));
  check('the fee returns below the threshold', (await read('bag-delivery')) === '₹40', await read('bag-delivery'));
  check('the total follows', (await read('bag-total')) === '₹360', await read('bag-total'));
  await browser.close();
}

console.log(`\nRESULT ${passed}/${passed + failed}`);
process.exit(failed ? 1 : 0);
