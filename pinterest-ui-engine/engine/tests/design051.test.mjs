// design051.test.mjs — Mission 051: the archetype system (the Kutumb
// failure), the value-label / wallet-sign / permission-glyph fixes,
// and the vocabulary guard. Unit checks run derive/doctor directly;
// the browser probe drives a roster app whose data is built to trip
// every v1.30 bug: a money field on people, a debit stored POSITIVE,
// flow enums whose values differ from their labels, one permission
// with a glyph and one without.
//
// On v1.30 (pristine m050 tree) this suite fails: money derives to
// role "price", there is no archetype, the glyph is dropped in
// derive, review/confirmation/log print raw values, wallet signs
// follow the stored sign, and the permission disc falls back to
// title initials. Those failures are the mission's evidence.
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';
import { deriveBrief } from '../intake/derive.mjs';
import { doctorBrief } from '../intake/brief_doctor.mjs';

const ENGINE = join(dirname(fileURLToPath(import.meta.url)), '..');
const CHROME = process.env.CHROME_PATH || '/opt/meta-chromium/chrome';
let pass = 0, fail = 0;
const check = (name, ok, extra = '') => { console.log(`${ok ? '✓' : '✗ FAIL'} ${name}${extra ? ' — ' + extra : ''}`); ok ? pass++ : fail++; };
const wait = ms => new Promise(r => setTimeout(r, ms));

{
  // Semantics ≠ chrome: a records app's money field is not a price,
  // but aggregate math ("total value of stock" = qty × unit price)
  // must still find it. (Regression caught by recovery/design041.)
  const stock = {
    name: 'Probe051 Stock', brand: 'Probe051 Stock', location: 'Depot',
    register: 'plain', appType: 'Depot stock book',
    collection: { label: 'Line', plural: 'Lines', media: false },
    fields: [
      { id: 'item', label: 'Item', type: 'text' },
      { id: 'qty', label: 'Qty', type: 'number' },
      { id: 'price', label: 'Price', type: 'money' },
    ],
    records: [{ id: 's1', item: 'Bolts', qty: 40, price: 25 }],
    requirements: ['Summary numbers at the top: the total value of stock.'],
  };
  const b = deriveBrief(JSON.parse(JSON.stringify(stock)));
  const sp = (b.aggregates || []).find(a => a.op === 'sumProduct');
  const priceRole = b.entity.fields.find(f => f.id === 'price').role;
  check('semantics: a records app still derives total value = qty × money, while the field is NOT priced',
    !!sp && sp.fields.join(',') === 'qty,price' && priceRole !== 'price' && b.archetype === 'records',
    `archetype=${b.archetype} role=${priceRole} agg=${JSON.stringify(b.aggregates || [])}`);
}

// ---------------------------------------------------------------- units
const rosterBrief = {
  name: 'Probe051 Family', tagline: 'One family, one app.', domain: 'operations',
  location: 'Bengaluru', currency: '₹', homeHeader: 'greeting', showCategories: true,
  collection: { label: 'Member', plural: 'Members', media: true, items: [
    { id: 'm1', name: 'Mohnish Raj', role: 'Head', relation: 'Self', place: 'Home', contribution: 2000, note: 'Head of the family.' },
    { id: 'm2', name: 'Aarav Raj', role: 'Child', relation: 'Son', place: 'School', contribution: 0, note: 'Pick-up at 4pm.' },
    { id: 'm3', name: 'Kavya Raj', role: 'Adult', relation: 'Spouse', place: 'Work', contribution: 1500, note: 'Runs the fund.' },
  ] },
  fields: [
    { id: 'name', label: 'Name', type: 'text' },
    { id: 'role', label: 'Role', type: 'enum', options: ['Head', 'Adult', 'Child', 'Elder'] },
    { id: 'relation', label: 'Relation', type: 'text' },
    { id: 'place', label: 'Where', type: 'enum', options: ['Home', 'Work', 'School', 'Out'] },
    { id: 'contribution', label: 'Fund contribution', type: 'money' },
    { id: 'note', label: 'Note', type: 'text' },
  ],
  requirements: [
    'The head of the family can start a new entry for the family from the home screen.',
    'The home screen is a gallery of every member in the family.',
    'Members can filter members by role.',
    'Members can filter members by where they are.',
    'Members can search members by name.',
    'Opening a member shows their note and their monthly fund contribution.',
    'The head of the family raises a request for a household need by picking its type and submitting it.',
    'Members can review every entry they have raised, with its reference, in one household log.',
  ],
  profile: { name: 'Mohnish Raj', sub: 'Head of the family', sections: [] },
  permissions: [
    { key: 'location', title: 'Location', benefit: 'Members see your last check-in.', glyph: '⌖' },
    { key: 'alerts', title: 'Family alerts', benefit: 'Get told when a new entry lands in the log.' },
  ],
  wallet: { label: 'Family fund', balance: 4800, transactions: [
    { label: 'Monthly contribution', amount: 6000, when: 'Today', kind: 'credit' },
    { label: 'School fees', amount: 3200, when: 'Yesterday', kind: 'debit' },
  ] },
  flow: {
    form: [
      { id: 'type', label: 'What is this?', type: 'enum', required: true, message: 'Pick what this is.', testid: 'field-type', errorTestid: 'error-type', options: [
        { label: 'A need', value: 'need', caption: 'Ask the family' },
        { label: 'A complaint', value: 'complaint', caption: 'Something is not right' },
      ] },
      { id: 'about', label: 'For whom, or what', type: 'text', required: true, minLength: 2, message: 'Say who or what.', testid: 'field-about', errorTestid: 'error-about' },
      { id: 'urgency', label: 'Urgency', type: 'enum', required: true, message: 'Pick urgency.', testid: 'field-urgency', errorTestid: 'error-urgency', options: [
        { label: 'Today', value: 'today', caption: 'Needs attention now' },
        { label: 'This week', value: 'week', caption: 'Before the weekend' },
      ] },
    ],
    steps: [
      { id: 'kind', label: 'Type', fields: ['type', 'about'] },
      { id: 'detail', label: 'Details', fields: ['urgency'] },
      { id: 'review', label: 'Review', fields: [], review: true },
    ],
  },
  commitLabel: 'Submit', commitTitle: 'Added to the household log', referencePrefix: 'P51', submissionsLabel: 'Household log',
};

const derived = deriveBrief(JSON.parse(JSON.stringify(rosterBrief)));
check('archetype: a people collection with a money field infers roster, not commerce', derived.archetype === 'roster', String(derived.archetype));
const contrib = derived.entity.fields.find(f => f.id === 'contribution');
check('money rule: the contribution field is NOT the price in a roster', contrib.role !== 'price', 'role=' + contrib.role);
const place = derived.entity.fields.find(f => f.id === 'place');
check('roster: the Where field is designated the status field (and stays a facet)', place.statusField === true && place.role === 'facet', JSON.stringify({ sf: place.statusField, role: place.role }));
check('permission glyph survives derive into the brief', derived.permissions[0].glyph === '⌖', JSON.stringify(derived.permissions && derived.permissions[0]));

const commerceBrief = {
  name: 'Probe051 Shop', domain: 'store', currency: '₹',
  collection: { label: 'Product', plural: 'Products', media: true, items: [{ id: 'p1', name: 'Fern', price: 499, note: 'Green.' }] },
  fields: [{ id: 'name', label: 'Name', type: 'text' }, { id: 'price', label: 'Price', type: 'money' }, { id: 'note', label: 'Note', type: 'text' }],
  requirements: ['Customers add products to a cart they can review.', 'Customers can search products by name.', 'Opening a product shows its price.'],
};
const derivedCommerce = deriveBrief(JSON.parse(JSON.stringify(commerceBrief)));
check('archetype: cart prose + product label infers commerce', derivedCommerce.archetype === 'commerce', String(derivedCommerce.archetype));
check('money rule: a money field IS the price in commerce', derivedCommerce.entity.fields.find(f => f.id === 'price').role === 'price');

const declaredPrice = JSON.parse(JSON.stringify(rosterBrief));
declaredPrice.fields.find(f => f.id === 'contribution').role = 'price';
check('money rule: an explicitly declared role "price" wins even in a roster', deriveBrief(declaredPrice).entity.fields.find(f => f.id === 'contribution').role === 'price');

const undecidable = {
  name: 'Probe051 Ledger', domain: 'operations', currency: '₹',
  collection: { label: 'Entry', plural: 'Entries', items: [{ id: 'e1', name: 'Rent', amount: 12000 }] },
  fields: [{ id: 'name', label: 'Name', type: 'text' }, { id: 'amount', label: 'Amount', type: 'money' }],
  requirements: ['Users can search entries by name.'],
};
check('money rule: money alone infers records, never commerce', deriveBrief(JSON.parse(JSON.stringify(undecidable))).archetype === 'records');
check('doctor: money + no archetype + no signals is a GAP (q-archetype)', doctorBrief(JSON.parse(JSON.stringify(undecidable))).some(f => f.level === 'gap' && f.qid === 'q-archetype'));
const kutumbShape = JSON.parse(JSON.stringify(rosterBrief)); kutumbShape.archetype = 'commerce';
check('doctor: people declared as commerce is a GAP (the Kutumb shape)', doctorBrief(kutumbShape).some(f => f.level === 'gap' && f.qid === 'q-archetype'));
check('doctor: the plain roster brief has no archetype GAP', !doctorBrief(JSON.parse(JSON.stringify(rosterBrief))).some(f => f.qid === 'q-archetype' && f.level === 'gap'));

// ---------------------------------------------------------------- plan tools
{
  const dir = mkdtempSync(join(tmpdir(), 'd51-plan-'));
  const answers = { name: 'Probe051 Family', archetype: 'roster', 'collection.label': 'Member', commerce: 'none', families: ['profile', 'notices'] };
  writeFileSync(join(dir, 'answers.json'), JSON.stringify(answers));
  const mk = spawnSync('node', [join(ENGINE, 'intake', 'make_plan.mjs'), join(dir, 'answers.json'), join(dir, 'plan')], { encoding: 'utf8' });
  const planJson = JSON.parse(readFileSync(join(dir, 'plan', 'PLAN.json'), 'utf8'));
  const briefJson = JSON.parse(readFileSync(join(dir, 'plan', 'product-brief.json'), 'utf8'));
  const design = readFileSync(join(dir, 'plan', 'DESIGN_DIRECTION.md'), 'utf8');
  check('make_plan: archetype answer lands in PLAN.json, the brief, and the roster composition in DESIGN_DIRECTION',
    planJson.archetype === 'roster' && briefJson.archetype === 'roster' && /ROSTER composition/.test(design), mk.stdout.trim().split('\n')[0]);
  const doc = spawnSync('node', [join(ENGINE, 'intake', 'plan_doctor.mjs'), join(dir, 'plan')], { encoding: 'utf8' });
  check('plan_doctor: a coherent roster plan pack passes', doc.status === 0, (doc.stdout || '').trim().split('\n').pop());
}

{
  // M051 adjacent fix: a stated row-list composition with a media
  // entity planned CARDS on v1.30 and the build hard-failed its own
  // intent constraint (CI-001). The plan must honour the row list.
  const rowBrief = JSON.parse(JSON.stringify(rosterBrief));
  rowBrief.name = 'Probe051 Rows';
  rowBrief.intent = { composition: 'row-list' };
  const dir2 = mkdtempSync(join(tmpdir(), 'd51-rows-'));
  writeFileSync(join(dir2, 'product-brief.json'), JSON.stringify(rowBrief, null, 2));
  let genOk = true;
  try { execFileSync('node', [join(ENGINE, 'run.mjs'), dir2], { stdio: 'pipe' }); } catch { genOk = false; }
  let variant = null;
  if (genOk) {
    const lay = JSON.parse(readFileSync(join(dir2, 'layout.json'), 'utf8'));
    const home = lay.views[0];
    variant = (home.sections.find(s => s.component === 'entity-collection') || {}).variant;
  }
  check('composition: a stated row-list with media generates, and plans rows (CI-001)', genOk && variant === 'row', 'variant=' + variant);
}

// ---------------------------------------------------------------- browser probe (roster)
function generate(briefObj, dirName) {
  const dir = mkdtempSync(join(tmpdir(), dirName));
  writeFileSync(join(dir, 'product-brief.json'), JSON.stringify(briefObj, null, 2));
  execFileSync('node', [join(ENGINE, 'run.mjs'), dir], { stdio: 'pipe' });
  return dir;
}
const dir = generate(rosterBrief, 'd51-');
const dataJs = readFileSync(join(dir, 'app', 'data.js'), 'utf8');
check('model carries archetype "roster" and the permission glyph', dataJs.includes('"archetype": "roster"') && dataJs.includes('⌖'));

const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'shell', args: ['--no-sandbox', '--allow-file-access-from-files'] });
const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844 });
const errs = [];
page.on('pageerror', e => errs.push(String(e)));
await page.goto('file://' + join(dir, 'app', 'index.html'), { waitUntil: 'networkidle0' });
await wait(500);
const ev = (fn, ...a) => page.evaluate(fn, ...a);
const click = async (sel) => { const ok = await ev((s) => { const el = document.querySelector(s); if (el) { el.click(); return true; } return false; }, sel); await wait(400); return ok; };

// permissions: glyph disc first, then the neutral fallback (never initials)
let disc1 = await ev(() => { const d = document.querySelector('.perm-disc'); return d ? d.textContent.trim() : null; });
check('permission: the declared glyph renders in the disc', disc1 === '⌖', String(disc1));
await click('[data-testid="perm-later"]');
let disc2 = await ev(() => { const d = document.querySelector('.perm-disc'); return d ? d.textContent.trim() : null; });
check('permission: a glyph-less permission shows the neutral mark, never title initials ("FA")', disc2 === '✦', String(disc2));
await click('[data-testid="perm-later"]');
await click('[data-testid="perm-allow"]');
for (let i = 0; i < 4; i++) { if (!await click('[data-testid="intro-next"]')) break; }
await wait(400);

let home = await ev(() => ({
  cards: document.querySelectorAll('.card').length,
  prices: document.querySelectorAll('.card-price').length,
  adds: document.querySelectorAll('[data-testid="add-btn"]').length,
  chips: [...document.querySelectorAll('[data-testid="status-chip"]')].map(c => c.textContent.trim()),
  metas: [...document.querySelectorAll('.card-meta')].map(c => c.textContent.trim()),
  sortPrice: document.body.innerText.includes('Price: low to high'),
}));
check('roster home: person cards carry NO price line and NO add button', home.cards === 3 && home.prices === 0 && home.adds === 0, JSON.stringify(home));
check('roster home: status chips show each member\u2019s where', ['Home', 'School', 'Work'].every(v => home.chips.includes(v)), home.chips.join(','));
check('roster home: meta is relation · role', home.metas.some(m => m.includes('Son') && m.includes('Child')), home.metas.join(' | '));

await click('[data-testid="member-card"]');
await wait(300);
await click('[data-testid="member-card"]');
let detail = await ev(() => ({
  price: !!document.querySelector('[data-testid="detail-price"]'),
  dl: [...document.querySelectorAll('.dl-row')].map(r => r.textContent.replace(/\s+/g, ' ').trim()),
}));
check('roster detail: no price element; the money is a labelled row', !detail.price && detail.dl.some(r => r.includes('Fund contribution') && r.includes('2,000')), JSON.stringify(detail));
await click('[data-testid="back-btn"]');

// wallet: sign by kind (the debit was stored POSITIVE)
await click('[data-testid="wallet-btn"]');
let txns = await ev(() => [...document.querySelectorAll('.txn')].map(t => ({ txt: t.textContent.replace(/\s+/g, ' ').trim(), neg: !!t.querySelector('.txn-amt.is-neg') })));
check('wallet: a debit stored positive renders negative (sign = kind)', txns.some(t => t.txt.includes('School fees') && t.neg && t.txt.includes('3,200')), JSON.stringify(txns));
check('wallet: a credit renders positive', txns.some(t => t.txt.includes('Monthly contribution') && !t.neg), JSON.stringify(txns));
await click('[data-testid="back-btn"]');

// flow: labels, not values — review, confirmation, log
await ev(() => { const b = [...document.querySelectorAll('button')].find(x => /start new entry|submit|raise|new entry/i.test(x.textContent) && x.offsetParent); if (b) b.click(); });
await wait(500);
await ev(() => { const b = [...document.querySelectorAll('.radio-row')].find(x => x.textContent.includes('A need')); if (b) b.click(); });
try { await page.type('[data-testid="field-about"]', 'School fees for Aarav'); } catch {}
await click('[data-testid="step-next"]');
await ev(() => { const b = [...document.querySelectorAll('.radio-row')].find(x => x.textContent.includes('Today')); if (b) b.click(); });
await click('[data-testid="step-next"]');
let review = await ev(() => [...document.querySelectorAll('.dl-row')].map(r => r.textContent.replace(/\s+/g, ' ').trim()).join(' | '));
check('flow review: enum values render as LABELS ("A need", "Today")', review.includes('A need') && review.includes('Today') && !/\bneed\b(?!s)/.test(review.replace('A need', '')), review);
await click('[data-testid="confirm-btn"]');
let conf = await ev(() => document.body.innerText.replace(/\s+/g, ' '));
check('confirmation: labels, not raw values', conf.includes('A need') && conf.includes('Today'), conf.slice(0, 200));
await ev(() => { const b = [...document.querySelectorAll('button, a')].find(x => x.dataset.view === 'submissions'); if (b) b.click(); });
await wait(500);
let logRows = await ev(() => [...document.querySelectorAll('.cm-list .dl-row')].map(r => r.textContent.replace(/\s+/g, ' ').trim()));
check('household log: the bound enum row shows its LABEL ("A need"), not the stored value ("need")',
  logRows.some(r => r.includes('What is this?') && r.includes('A need')), logRows.join(' | '));
check('no page errors across the probe drive', errs.length === 0, errs.slice(0, 2).join(' | '));

// first-permission glyph check needs a fresh profile: reload with cleared storage is complex;
// the glyph was asserted in the model above and the disc order is covered by the fallback check.
await browser.close();
console.log(`\ndesign051: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
