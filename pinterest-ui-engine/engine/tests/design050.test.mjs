// design050.test.mjs — Mission 050, workstream D: the remaining
// engine families, probed on a real built app in a real browser.
//
// One probe brief declares every M050 feature at once — splash,
// permission priming, OTP auth, chat, a dedicated wishlist, booking
// chip fields (date-strip / time-chips) in its declared flow — and
// the drive walks the whole journey in user order. Search
// suggestions, the filter sheet's dual price range (verified, not
// rebuilt: the min/max range inputs already existed at runtime
// ~M046 and are exercised here end-to-end) and the orders view's
// segmented status tabs are exercised on the same app.
//
// The suite also covers the agreed M050 interfaces owned by the
// parallel workstreams, tolerantly: a missing tool is a FAIL with a
// clear name, never a crash — intake v2 (make_plan generates a plan
// pack; plan_doctor passes a good plan and fails a broken one),
// base_compliance on Fern, and reference_doctor on the brewly
// user-reference directory.
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, mkdirSync, existsSync, readFileSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';

const ENGINE = join(dirname(fileURLToPath(import.meta.url)), '..');
const ENGINE_ROOT = join(ENGINE, '..');            // pinterest-ui-engine/
const DIST_ROOT = join(ENGINE_ROOT, '..');         // distribution root
const CHROME = process.env.CHROME_PATH || '/opt/meta-chromium/chrome';
let pass = 0, fail = 0;
const check = (name, ok, extra = '') => { console.log(`${ok ? '✓' : '✗ FAIL'} ${name}${extra ? ' — ' + extra : ''}`); ok ? pass++ : fail++; };
const wait = ms => new Promise(r => setTimeout(r, ms));

const probeBrief = {
  name: 'Probe050 Plants', tagline: 'Plants that forgive beginners.',
  about: 'A small indoor-plant shop probe for Mission 050.',
  domain: 'plant shop', location: 'Indiranagar, Bengaluru', currency: '₹',
  referencePrefix: 'P5', bagLabel: 'Crate', submissionsLabel: 'Your orders',
  deliveryFee: 49, freeAbove: 999,
  splash: { title: 'Probe050 Plants', tagline: 'Plants that forgive beginners.', holdMs: 60000 },
  permissions: [
    { key: 'notifications', title: 'Order updates, not noise', benefit: 'We only message when your order moves — placed, on its way, delivered.', glyph: '🔔' },
    { key: 'location', title: 'Plants near you', benefit: 'See nurseries and delivery estimates for your neighbourhood.', glyph: '📍' },
  ],
  auth: { otp: true, providers: ['Google'], titleIn: 'Login to your Account', titleUp: 'Create your Account' },
  chat: { threads: [
    { id: 'support', name: 'Fern Support', messages: [{ from: 'them', text: 'Hi! Ask us anything about light, water or repotting.' }], reply: 'Thanks — a plant person will reply here shortly. (Local demo: this reply is canned.)' },
    { id: 'nursery', name: 'Indiranagar Nursery', messages: [{ from: 'them', text: 'Your Monstera is ready for pickup.' }], reply: 'Got it — we will keep it watered until you arrive. (Local demo: this reply is canned.)' },
  ] },
  wishlist: true,
  flow: {
    form: [
      { id: 'fullName', label: 'Your name', type: 'text', required: true, minLength: 2, testid: 'field-name', errorTestid: 'error-name', message: 'Enter your name.' },
      { id: 'visitDate', label: 'Delivery day', type: 'date-strip', required: true, testid: 'field-visit-date', errorTestid: 'error-visit-date', message: 'Choose a delivery day.' },
      { id: 'visitTime', label: 'Delivery time', type: 'time-chips', options: ['09:00', '13:00', '17:00'], required: true, testid: 'field-visit-time', errorTestid: 'error-visit-time', message: 'Choose a delivery time.' },
    ],
    steps: [
      { id: 'details', label: 'Your details', fields: ['fullName'] },
      { id: 'schedule', label: 'Schedule', fields: ['visitDate', 'visitTime'] },
      { id: 'review', label: 'Review', fields: [], review: true },
    ],
  },
  fields: [
    { id: 'name', label: 'Plant', type: 'text' },
    { id: 'type', label: 'Type', type: 'enum', options: ['Foliage', 'Flowering', 'Palm'] },
    { id: 'light', label: 'Light', type: 'enum', options: ['Bright', 'Medium', 'Low'] },
    { id: 'size', label: 'Size', type: 'text' },
    { id: 'price', label: 'Price', type: 'money' },
    { id: 'rating', label: 'Rating', type: 'number' },
    { id: 'note', label: 'Care', type: 'text' },
  ],
  requirements: [
    'The home screen is a photo-led gallery of every plant on the shelf.',
    'Customers can search plants by name.',
    'Customers can filter plants by type.',
    'Customers can filter plants by light.',
    'A customer can save a plant to favourites with a heart toggle.',
    'Customers add plants to a bag from the shelf and from each plant\u2019s page, and adjust quantities in the bag before ordering.',
    'Opening a plant shows its care notes, price, rating and size.',
    'A customer checks out from the bag and places an order.',
    'A placed order ends with a confirmation showing a reference the customer can quote.',
    'Customers can review their placed orders and cancel an order they no longer want.',
  ],
  collection: { label: 'Plant', plural: 'Plants', media: true, items: [
    { id: 'p1', name: 'Monstera Deliciosa', type: 'Foliage', light: 'Bright', price: 899, rating: 4.8, size: '2 ft, 8-inch pot', note: 'Split leaves, fast grower.' },
    { id: 'p2', name: 'Snake Plant', type: 'Foliage', light: 'Low', price: 499, rating: 4.7, size: '1.5 ft, 6-inch pot', note: 'Nearly unkillable.' },
    { id: 'p3', name: 'Fiddle Leaf Fig', type: 'Foliage', light: 'Bright', price: 1499, rating: 4.5, size: '3 ft, 10-inch pot', note: 'The statement tree.' },
    { id: 'p4', name: 'Golden Pothos', type: 'Foliage', light: 'Medium', price: 349, rating: 4.6, size: 'Trailing, 6-inch pot', note: 'Trails beautifully.' },
    { id: 'p5', name: 'Peace Lily', type: 'Flowering', light: 'Medium', price: 649, rating: 4.4, size: '1.5 ft, 7-inch pot', note: 'White blooms.' },
    { id: 'p6', name: 'Areca Palm', type: 'Palm', light: 'Bright', price: 1199, rating: 4.7, size: '3.5 ft, 10-inch pot', note: 'Soft arching fronds.' },
  ] },
};

function generate(briefObj, dirName) {
  const dir = mkdtempSync(join(tmpdir(), dirName));
  writeFileSync(join(dir, 'product-brief.json'), JSON.stringify(briefObj, null, 2));
  execFileSync('node', [join(ENGINE, 'run.mjs'), dir], { stdio: 'pipe' });
  return dir;
}

// ---------------------------------------------------------------- probe app
const dir = generate(probeBrief, 'd50-');
const dataJs = readFileSync(join(dir, 'app', 'data.js'), 'utf8');
check('model carries the M050 declarations', ['"splash"', '"permissions"', '"chat"', '"wishlist"'].every(k => dataJs.includes(k)));
const layout = JSON.parse(readFileSync(join(dir, 'layout.json'), 'utf8'));
check('planner plans chat + wishlist views and tabs',
  layout.views.some(v => v.id === 'chat') && layout.views.some(v => v.id === 'wishlist')
  && layout.navigation.items.some(i => i.view === 'chat') && layout.navigation.items.some(i => i.view === 'wishlist'),
  layout.navigation.items.map(i => i.view).join(','));

const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'shell', args: ['--no-sandbox', '--allow-file-access-from-files'] });
const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844 });
const errs = [];
page.on('pageerror', e => errs.push(String(e)));
await page.goto('file://' + join(dir, 'app', 'index.html'), { waitUntil: 'networkidle0' });
await wait(500);
const ev = (fn, ...a) => page.evaluate(fn, ...a);

// 1 — splash (item 1)
let s = await ev(() => ({ splash: !!document.querySelector('[data-testid="splash"]'), title: (document.querySelector('.splash-title') || {}).textContent || '', tag: (document.querySelector('.splash-tag') || {}).textContent || '', tabs: document.querySelectorAll('.tab').length }));
check('splash: brand view first (mark/name/tagline), no shell behind it', s.splash && s.title.includes('Probe050') && s.tag.includes('forgive') && s.tabs === 0, JSON.stringify(s));
await ev(() => document.querySelector('[data-testid="splash-dismiss"]').click());
await wait(300);
s = await ev(() => ({ splash: !!document.querySelector('[data-testid="splash"]'), seen: sessionStorage.getItem(window.__APP__.model.persistence.key + ':splash') }));
check('splash: a tap dismisses it and the session is marked seen', !s.splash && s.seen === '1', JSON.stringify(s));

// 2 — permission priming (item 2)
let pm = await ev(() => ({ view: !!document.querySelector('[data-testid="permission-priming"]'), disc: !!document.querySelector('.perm-disc'), title: (document.querySelector('.perm-h') || {}).textContent || '', benefit: (document.querySelector('.perm-benefit') || {}).textContent || '' }));
check('permissions: priming view with glyph disc, title and benefit line', pm.view && pm.disc && pm.title.includes('Order updates') && pm.benefit.length > 10, JSON.stringify(pm));
await ev(() => document.querySelector('[data-testid="perm-allow"]').click());
await wait(300);
pm = await ev(() => (document.querySelector('.perm-h') || {}).textContent || '');
check('permissions: Allow advances to the next permission', pm.includes('Plants near you'), pm);
await ev(() => document.querySelector('[data-testid="perm-later"]').click());
await wait(300);
const permsStored = await ev(() => (JSON.parse(localStorage.getItem(window.__APP__.model.persistence.key) || '{}').perms || {}));
check('permissions: choices persist (granted / later)', permsStored.notifications === 'granted' && permsStored.location === 'later', JSON.stringify(permsStored));

// 3 — OTP (item 3)
let au = await ev(() => ({ send: (document.querySelector('[data-testid="auth-submit"]') || {}).textContent || '', passField: !!document.querySelector('#auth-pass') }));
check('otp: OTP auth is email-first with Send code and no password field', au.send.includes('Send code') && !au.passField, JSON.stringify(au));
await page.type('#auth-email', 'probe@example.com');
await ev(() => document.querySelector('[data-testid="auth-submit"]').click());
await wait(400);
let otp = await ev(() => ({ view: !!document.querySelector('[data-testid="otp"]'), boxes: document.querySelectorAll('.otp-box').length, resend: !!document.querySelector('[data-testid="otp-resend"]') }));
check('otp: the step renders 6 digit boxes and a Resend', otp.view && otp.boxes === 6 && otp.resend, JSON.stringify(otp));
await page.click('.otp-box[data-i="0"]');
await page.keyboard.type('12345');
await wait(200);
otp = await ev(() => ({ vals: [...document.querySelectorAll('.otp-box')].map(b => b.value).join(''), focus: document.activeElement && document.activeElement.getAttribute('data-i') }));
check('otp: digits fill in order and focus auto-advances', otp.vals === '12345' && otp.focus === '5', JSON.stringify(otp));
await page.keyboard.type('6');
await wait(600);
let home = await ev(() => ({ view: document.querySelector('#main').dataset.view, cards: document.querySelectorAll('.card').length }));
check('otp: completing the code signs in to the home', home.view === 'plants' && home.cards === 6, JSON.stringify(home));

// 8 — search suggestions (item 8)
await page.click('[data-testid="search"]');
await wait(500);
let sg = await ev(() => ({ box: !!document.querySelector('[data-testid="search-suggestions"]'), n: document.querySelectorAll('[data-testid="search-suggestion"]').length }));
check('suggestions: focused empty search shows popular chips + record rows', sg.box && sg.n >= 5, JSON.stringify(sg));
await ev(() => { [...document.querySelectorAll('.sugg-row')].find(r => r.textContent.includes('Monstera'))?.click(); });
await wait(500);
let res = await ev(() => ({ q: document.querySelector('[data-testid="search"]').value, cards: document.querySelectorAll('.card').length }));
check('suggestions: a tap fills the query and runs the search', res.q.includes('Monstera') && res.cards === 1, JSON.stringify(res));
await ev(() => { const i = document.querySelector('[data-testid="search"]'); i.value = ''; i.dispatchEvent(new Event('input', { bubbles: true })); i.focus(); });
await wait(600);
sg = await ev(() => ({ recent: document.querySelectorAll('[data-testid="recent-search"]').length, labels: [...document.querySelectorAll('.sugg-lb')].map(e => e.textContent) }));
check('suggestions: the used search returns as a Recent chip', sg.recent >= 1 && sg.labels.includes('Recent'), JSON.stringify(sg));
await ev(() => { const i = document.querySelector('[data-testid="search"]'); i.blur(); });

// 7 — dual price range, verified end-to-end (item 7)
await ev(() => document.querySelector('[data-testid="filter-btn"]').click());
await wait(400);
let fr = await ev(() => [...document.querySelectorAll('.sheet input[type="range"]')].map(i => i.getAttribute('data-xf')));
check('price range: the filter sheet carries BOTH min and max range inputs', fr.join() === 'minPrice,maxPrice', JSON.stringify(fr));
await ev(() => { const m = document.querySelector('.sheet input[data-xf="maxPrice"]'); m.value = '500'; m.dispatchEvent(new Event('input', { bubbles: true })); });
await wait(150);
await ev(() => document.querySelector('[data-testid="filter-apply"]').click());
await wait(500);
let cnt = await ev(() => document.querySelectorAll('.card').length);
check('price range: max 500 narrows to the 2 plants at or under 500', cnt === 2, 'cards=' + cnt);
await ev(() => document.querySelector('[data-testid="filter-btn"]').click());
await wait(300);
await ev(() => document.querySelector('[data-testid="filter-reset"]').click());
await wait(300);
await ev(() => document.querySelector('[data-testid="filter-apply"]')?.click());
await wait(500);
await ev(() => document.querySelector('[data-testid="filter-btn"]').click());
await wait(300);
await ev(() => { const m = document.querySelector('.sheet input[data-xf="minPrice"]'); m.value = '1000'; m.dispatchEvent(new Event('input', { bubbles: true })); });
await wait(150);
await ev(() => document.querySelector('[data-testid="filter-apply"]').click());
await wait(500);
cnt = await ev(() => document.querySelectorAll('.card').length);
check('price range: min 1000 narrows to the 2 plants at or over 1000', cnt === 2, 'cards=' + cnt);
await ev(() => document.querySelector('[data-testid="filter-btn"]').click());
await wait(300);
await ev(() => document.querySelector('[data-testid="filter-reset"]').click());
await wait(300);
await ev(() => document.querySelector('[data-testid="filter-apply"]')?.click());
await wait(500);
cnt = await ev(() => document.querySelectorAll('.card').length);
check('price range: reset restores all 6', cnt === 6, 'cards=' + cnt);

// 5 — wishlist (item 5)
await ev(() => { const c = [...document.querySelectorAll('.card')].find(x => x.textContent.includes('Snake Plant')); c.querySelector('[data-testid="save-toggle"]').click(); });
await wait(400);
await ev(() => document.querySelector('.tab[data-view="wishlist"]').click());
await wait(500);
let wl = await ev(() => [...document.querySelectorAll('.card-title, .row-title')].map(e => e.textContent));
check('wishlist: the dedicated view lists the record saved via the heart toggle', wl.some(t => t.includes('Snake Plant')), JSON.stringify(wl));
await ev(() => document.querySelector('.tab[data-view="plants"]').click());
await wait(400);

// 4 — chat (item 4)
await ev(() => document.querySelector('.tab[data-view="chat"]').click());
await wait(500);
let ch = await ev(() => ({ threads: document.querySelectorAll('[data-testid="chat-thread"]').length, note: (document.querySelector('.chat-note') || {}).textContent || '' }));
check('chat: thread list renders the declared threads, honestly labelled local', ch.threads === 2 && ch.note.includes('Local demo'), JSON.stringify(ch));
await ev(() => document.querySelector('[data-testid="chat-thread"]').click());
await wait(400);
ch = await ev(() => ({ msgs: document.querySelectorAll('[data-testid="chat-message"]').length, composer: !!document.querySelector('[data-testid="chat-input"]') }));
check('chat: a thread opens with its messages and a composer', ch.msgs === 1 && ch.composer, JSON.stringify(ch));
await page.type('[data-testid="chat-input"]', 'How often should I water it?');
await ev(() => document.querySelector('[data-testid="chat-send"]').click());
await wait(500);
ch = await ev(() => [...document.querySelectorAll('[data-testid="chat-message"]')].map(m => m.getAttribute('data-from') + ':' + m.textContent));
check('chat: send appends my bubble plus the canned reply', ch.length === 3 && ch[1].startsWith('me:How often') && ch[2].startsWith('them:Thanks'), JSON.stringify(ch));
const chatStored = await ev(() => (JSON.parse(localStorage.getItem(window.__APP__.model.persistence.key) || '{}').chatMsgs || {}));
check('chat: appended messages persist on the device', Array.isArray(chatStored.support) && chatStored.support.length === 2);
await ev(() => document.querySelector('[data-testid="chat-back"]').click());
await wait(300);

// 6 — booking chip fields (item 6), through checkout to the order
await ev(() => document.querySelector('.tab[data-view="plants"]').click());
await wait(400);
await ev(() => { const c = [...document.querySelectorAll('.card')].find(x => x.textContent.includes('Golden Pothos')); c.querySelector('[data-testid="add-btn"]').click(); });
await wait(400);
await ev(() => document.querySelector('.tab[data-view="bag"]').click());
await wait(400);
await ev(() => document.querySelector('[data-testid="checkout-btn"]').click());
await wait(500);
await page.type('[data-testid="field-name"]', 'Probe User');
await ev(() => document.querySelector('[data-testid="step-next"]').click());
await wait(500);
let bk = await ev(() => ({ dates: document.querySelectorAll('[data-testid="chip-visitDate"]').length, times: document.querySelectorAll('[data-testid="chip-visitTime"]').length }));
check('booking fields: date-strip renders 7 day chips, time-chips the 3 slots', bk.dates === 7 && bk.times === 3, JSON.stringify(bk));
await ev(() => document.querySelectorAll('[data-testid="chip-visitDate"]')[1].click());
await wait(250);
await ev(() => [...document.querySelectorAll('[data-testid="chip-visitTime"]')].find(c => c.textContent.includes('13:00'))?.click());
await wait(250);
bk = await ev(() => ({ d: document.querySelector('[data-testid="chip-visitDate"].chip-on')?.getAttribute('data-value') || '', t: document.querySelector('[data-testid="chip-visitTime"].chip-on')?.textContent || '' }));
check('booking fields: chips single-select a day and a time', !!bk.d && bk.t.includes('13:00'), JSON.stringify(bk));
await ev(() => document.querySelector('[data-testid="step-next"]').click());
await wait(500);
const reviewTxt = await ev(() => (document.querySelector('.stepflow') || {}).textContent || '');
check('booking fields: the review summary carries the chosen day label and time', /Delivery day/.test(reviewTxt) && reviewTxt.includes('13:00'), reviewTxt.slice(0, 140));
await ev(() => document.querySelector('[data-testid="confirm-btn"]').click());
await wait(700);
const conf = await ev(() => ({ ref: (document.querySelector('[data-testid="confirm-ref"]') || {}).textContent || '', sum: (document.querySelector('[data-testid="confirm-summary"]') || {}).textContent || '' }));
check('booking fields: the order confirmation carries a reference and the time choice', conf.ref.startsWith('P5-') && conf.sum.includes('13:00'), conf.ref + ' | ' + conf.sum.slice(0, 120));

// 9 — orders segmented status tabs (item 9)
await ev(() => document.querySelector('.tab[data-view="submissions"]').click());
await wait(500);
let ord = await ev(() => ({ tabs: !!document.querySelector('[data-testid="order-status-tabs"]'), segs: [...document.querySelectorAll('[data-testid="order-filter"]')].map(b => b.textContent.trim()), items: document.querySelectorAll('.cm-item').length }));
check('orders: segmented tabs are built from the statuses present (All + Placed)', ord.tabs && ord.segs.includes('All') && ord.segs.includes('Placed') && ord.items === 1, JSON.stringify(ord));
await ev(() => [...document.querySelectorAll('[data-testid="order-filter"]')].find(b => b.textContent.trim() === 'Placed')?.click());
await wait(400);
ord = await ev(() => document.querySelectorAll('.cm-item').length);
check('orders: the Placed segment keeps the placed order', ord === 1, 'items=' + ord);
check('no page errors across the whole probe drive', errs.length === 0, errs.slice(0, 2).join(' | '));
await browser.close();

// 1b — splash auto-advance: a short hold dismisses itself
const autoBrief = JSON.parse(JSON.stringify(probeBrief));
autoBrief.splash = { title: 'Auto Splash', holdMs: 1200 };
delete autoBrief.permissions; delete autoBrief.auth;
const autoDir = generate(autoBrief, 'd50a-');
const browser2 = await puppeteer.launch({ executablePath: CHROME, headless: 'shell', args: ['--no-sandbox', '--allow-file-access-from-files'] });
const page2 = await browser2.newPage();
await page2.setViewport({ width: 390, height: 844 });
page2.on('pageerror', e => errs.push(String(e)));
await page2.goto('file://' + join(autoDir, 'app', 'index.html'), { waitUntil: 'domcontentloaded' });
await wait(250);
const early = await page2.evaluate(() => !!document.querySelector('[data-testid="splash"]'));
check('splash: present at the start of a visit', early);
await wait(2000);
const late = await page2.evaluate(() => ({ splash: !!document.querySelector('[data-testid="splash"]'), cards: document.querySelectorAll('.card').length }));
check('splash: auto-advances after its holdMs with no tap', !late.splash && late.cards === 6, JSON.stringify(late));
await browser2.close();

// ------------------------------------------------- intake v2 (workstream B)
const makePlanPath = join(ENGINE, 'intake', 'make_plan.mjs');
const planDoctorPath = join(ENGINE, 'intake', 'plan_doctor.mjs');
check('intake: make_plan tool exists', existsSync(makePlanPath), makePlanPath);
check('intake: plan_doctor tool exists', existsSync(planDoctorPath), planDoctorPath);
if (existsSync(makePlanPath) && existsSync(planDoctorPath)) {
  const tmpPlan = mkdtempSync(join(tmpdir(), 'd50plan-'));
  const answersPath = join(tmpPlan, 'answers.json');
  writeFileSync(answersPath, JSON.stringify({
    name: 'Plan Probe', tagline: 'A plan probe.', domain: 'plant shop',
    'collection.label': 'Plant', commerce: 'bag', bagLabel: 'Crate',
    journey: 'Browse plants, add one to the bag, check out',
    families: ['wallet', 'profile', 'notices'],
  }, null, 2));
  const outPlan = join(tmpPlan, 'plan');
  const mp = spawnSync('node', [makePlanPath, answersPath, outPlan], { encoding: 'utf8' });
  const planFiles = ['PLAN.json', 'ROADMAP.md', 'TODO.md', 'ART_DIRECTION.md', 'DESIGN_DIRECTION.md', 'FUNCTIONALITY.md', 'USER_JOURNEY.md', 'product-brief.json'];
  check('intake: make_plan generates the plan pack', mp.status === 0 && planFiles.every(f => existsSync(join(outPlan, f))),
    (mp.stdout || '') + (mp.stderr || ''));
  let planStatus = null;
  try { planStatus = JSON.parse(readFileSync(join(outPlan, 'PLAN.json'), 'utf8')).status; } catch { /* reported below */ }
  check('intake: the generated plan sits at the confirmation gate', planStatus === 'awaiting_confirmation', String(planStatus));
  const pdGood = spawnSync('node', [planDoctorPath, outPlan], { encoding: 'utf8' });
  check('intake: plan_doctor passes a good plan', pdGood.status === 0, ((pdGood.stdout || '') + (pdGood.stderr || '')).slice(0, 200));
  const brokenDir = mkdtempSync(join(tmpdir(), 'd50broken-'));
  const pdBad = spawnSync('node', [planDoctorPath, brokenDir], { encoding: 'utf8' });
  check('intake: plan_doctor fails a broken (empty) plan dir', pdBad.status !== 0, 'exit=' + pdBad.status);
}

// ------------------------------------------------- base compliance on Fern
const bcPath = join(ENGINE, 'reference', 'base_compliance.mjs');
check('base: base_compliance tool exists', existsSync(bcPath), bcPath);
if (existsSync(bcPath)) {
  const fernSrc = join(DIST_ROOT, 'examples', 'fern-and-co', 'product-brief.json');
  check('base: the Fern example brief exists', existsSync(fernSrc), fernSrc);
  if (existsSync(fernSrc)) {
    const fernDir = mkdtempSync(join(tmpdir(), 'd50fern-'));
    writeFileSync(join(fernDir, 'product-brief.json'), readFileSync(fernSrc, 'utf8'));
    execFileSync('node', [join(ENGINE, 'run.mjs'), fernDir], { stdio: 'pipe' });
    const bc = spawnSync('node', [bcPath, join(fernDir, 'app'), join(fernDir, 'product-brief.json')], { encoding: 'utf8' });
    check('base: base_compliance passes Fern (no GAP on planned screens)', bc.status === 0,
      ((bc.stdout || '') + (bc.stderr || '')).split('\n').filter(l => l.includes('GAP')).join(' | '));
  }
}

// ------------------------------------------------- reference doctor (workstream C)
const rdPath = join(ENGINE, 'reference', 'reference_doctor.mjs');
const brewlyDir = join(ENGINE_ROOT, 'reference', 'user', 'brewly-coffee');
check('reference: reference_doctor tool exists', existsSync(rdPath), rdPath);
check('reference: the brewly user-reference dir exists', existsSync(brewlyDir), brewlyDir);
if (existsSync(rdPath) && existsSync(brewlyDir)) {
  const rd = spawnSync('node', [rdPath, brewlyDir], { encoding: 'utf8' });
  check('reference: reference_doctor passes the brewly dir', rd.status === 0,
    ((rd.stdout || '') + (rd.stderr || '')).split('\n').filter(l => l.includes('GAP')).join(' | '));
}

console.log(`RESULT ${pass}/${pass + fail}`);
process.exit(fail ? 1 : 0);
