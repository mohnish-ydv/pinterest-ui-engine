// make_plan.mjs — INTAKE v2 plan generator (Mission 050).
//
// Turns collected intake answers into a complete plan pack. Generation
// of the app itself must NOT start from this output until the user has
// confirmed the plan: PLAN.json is written with
// status "awaiting_confirmation" and the CLI prints that warning.
//
// CLI: node make_plan.mjs <answers.json> <outDir>
//
// Accepted answers shape (flat object; keys may be question ids from
// intake-questions.json OR briefPath values — both are accepted and
// briefPath-style keys win when both are present):
//   {
//     "name": "ExampleApp",                 // or "q-name"
//     "tagline": "...",                     // or "q-pitch"
//     "domain": "service",                  // or "q-domain"
//     "location": "Bengaluru, Karnataka",   // or "q-place"
//     "currency": "₹",                      // optional, default ₹
//     "collection.label": "Service",        // or "q-item-word"; also "itemLabel"
//     "fields": ["price","category",...],   // or "q-item-facts"
//     "collection.media": "sample",         // or "q-photos": supplied|sample|none
//     "collection.items": "samples",        // or "q-items-source"
//     "items": [ { "id": "s1", "name": "...", "price": 499, ... } ], // optional real/sample items
//     "commerce": "bag",                    // or "q-commerce": bag|booking|contact|none
//     "bagLabel": "Cart",                   // or "q-bag-name"
//     "uniqueItems": false,                 // or "q-unique": unique|stocked (bool also ok)
//     "checkout": "radio-steps",            // or "q-checkout": radio-steps|plain-steps|one-form
//     "deliveryFee": 49,                    // or "q-fee" (number or numeric text)
//     "homeHeader": "greeting",             // or "q-home": greeting|brand
//     "profile.name": "Asha Rao",           // or "q-user-name"; also "profileName"
//     "families": ["wallet","profile"],     // or "q-families": values or briefKeys
//     "promo": "20% — ...",                 // or "q-promo" (string or brief promo object)
//     "world": "auto",                      // or "q-world"
//     "referenceChoice": "base",            // or "q-reference-choice": "base" | "user:<decode-id>"
//     "journey": "Complete the main task ...", // primary journey; or "journey.primary" / "q-journey-primary"
//     "mustHaveScreens": ["home","booking"],// or "q-must-have-screens"
//     "needs.booking": "yes",               // or "q-booking-need": yes|request|no
//     "needs.chat": "no",                   // or "q-chat-need": yes|contact-only|no
//     "needs.wishlist": "yes"               // or "q-wishlist-need": yes|toggle-only|no
//   }
// Unknown keys are ignored. Missing name falls back to "Untitled App"
// (the brief doctor will GAP it downstream only if the brief is empty;
// plan_doctor surfaces brief-doctor GAPs).

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export const CANONICAL_SCREEN_TYPES = [
  'splash', 'onboarding', 'auth', 'OTP', 'permission-priming', 'home', 'search',
  'filter-sheet', 'catalogue', 'detail', 'wishlist', 'bag', 'checkout', 'payment',
  'success', 'orders', 'tracker', 'wallet', 'loyalty', 'profile', 'settings',
  'notifications', 'reviews', 'chat', 'booking', 'map', 'dashboard',
];

const SCREEN_ALIASES = {
  splash: 'splash', onboarding: 'onboarding', entry: 'onboarding', auth: 'auth',
  signin: 'auth', 'sign-in': 'auth', login: 'auth', otp: 'OTP', 'permission-priming': 'permission-priming',
  permissions: 'permission-priming', home: 'home', search: 'search',
  'filter-sheet': 'filter-sheet', filters: 'filter-sheet', filter: 'filter-sheet',
  catalogue: 'catalogue', catalog: 'catalogue', browse: 'catalogue', list: 'catalogue',
  detail: 'detail', product: 'detail', item: 'detail', record: 'detail',
  wishlist: 'wishlist', saved: 'wishlist', favourites: 'wishlist', favorites: 'wishlist',
  bag: 'bag', cart: 'bag', basket: 'bag', checkout: 'checkout', payment: 'payment',
  pay: 'payment', success: 'success', confirmation: 'success', orders: 'orders',
  history: 'orders', tracker: 'tracker', tracking: 'tracker', wallet: 'wallet',
  loyalty: 'loyalty', rewards: 'loyalty', profile: 'profile', settings: 'settings',
  notifications: 'notifications', notices: 'notifications', reviews: 'reviews',
  review: 'reviews', chat: 'chat', messages: 'chat', messaging: 'chat',
  booking: 'booking', book: 'booking', appointment: 'booking', appointments: 'booking',
  map: 'map', nearby: 'map', dashboard: 'dashboard', faq: 'profile', help: 'profile',
};

export function canonicalType(raw) {
  if (!raw) return null;
  const k = String(raw).trim().toLowerCase();
  return SCREEN_ALIASES[k] || (CANONICAL_SCREEN_TYPES.includes(k) ? k : null) || k;
}

function loadBaseScreenTypes() {
  try {
    const here = dirname(fileURLToPath(import.meta.url));
    const p = join(here, '..', '..', 'reference', 'base', 'base_reference.json');
    if (!existsSync(p)) return { types: CANONICAL_SCREEN_TYPES, source: 'canonical list (base_reference.json not present yet)' };
    const data = JSON.parse(readFileSync(p, 'utf8'));
    const raw = data.screenTypes || data.screens || data.types || [];
    const types = (Array.isArray(raw) ? raw : Object.keys(raw)).map(s => (typeof s === 'string' ? s : (s.id || s.type || s.name))).filter(Boolean);
    return types.length ? { types, source: 'reference/base/base_reference.json' } : { types: CANONICAL_SCREEN_TYPES, source: 'canonical list (base_reference.json had no screen types)' };
  } catch {
    return { types: CANONICAL_SCREEN_TYPES, source: 'canonical list (base_reference.json unreadable)' };
  }
}

function pick(a, ...keys) {
  for (const k of keys) if (a[k] !== undefined && a[k] !== null && a[k] !== '') return a[k];
  return undefined;
}
const asArray = v => (v === undefined ? [] : (Array.isArray(v) ? v : [v]));
const truthyUnique = v => v === true || v === 'unique' || v === 'true';

export function buildPlan(answers) {
  const a = answers || {};
  const name = pick(a, 'name', 'q-name') || 'Untitled App';
  const tagline = pick(a, 'tagline', 'q-pitch') || '';
  const domainRaw = pick(a, 'domain', 'q-domain') || 'store';
  const world = pick(a, 'world', 'q-world', 'domain[world-cue]') || 'auto';
  const domain = world === 'mono' ? `${domainRaw} mono` : String(domainRaw);
  const location = pick(a, 'location', 'q-place') || 'Bengaluru, Karnataka';
  const currency = pick(a, 'currency') || '₹';
  const itemLabel = pick(a, 'collection.label', 'q-item-word', 'itemLabel') || 'Product';
  const itemPlural = pick(a, 'collection.plural', 'itemPlural') || `${itemLabel}s`;
  const factSel = asArray(pick(a, 'fields', 'q-item-facts') || ['price', 'category', 'description']).map(String);
  const mediaSel = pick(a, 'collection.media', 'q-photos') || 'sample';
  const commerce = pick(a, 'commerce', 'q-commerce', 'requirements[commerce]') || 'bag';
  const bagLabel = pick(a, 'bagLabel', 'q-bag-name') || 'Cart';
  const uniqueItems = truthyUnique(pick(a, 'uniqueItems', 'q-unique'));
  const checkout = pick(a, 'checkout', 'q-checkout') || 'radio-steps';
  const feeRaw = pick(a, 'deliveryFee', 'q-fee');
  const deliveryFee = feeRaw === undefined ? undefined : (Number(String(feeRaw).replace(/[^0-9.]/g, '')) || undefined);
  const homeHeader = pick(a, 'homeHeader', 'q-home') || 'greeting';
  const personName = pick(a, 'profile.name', 'q-user-name', 'profileName') || '';
  const familiesSel = asArray(pick(a, 'families', 'q-families') || []).map(String);
  const promoRaw = pick(a, 'promo', 'q-promo');
  const referenceChoice = String(pick(a, 'referenceChoice', 'q-reference-choice') || 'base');
  const journeyPrimary = String(pick(a, 'journey.primary', 'journey', 'q-journey-primary') || '');
  const mustHave = asArray(pick(a, 'mustHaveScreens', 'q-must-have-screens') || []);
  const needBooking = String(pick(a, 'needs.booking', 'q-booking-need') || (commerce === 'booking' ? 'yes' : 'no'));
  const needChat = String(pick(a, 'needs.chat', 'q-chat-need') || 'no');
  const needWishlist = String(pick(a, 'needs.wishlist', 'q-wishlist-need') || 'no');

  // ---- families expansion (values or briefKeys both accepted) ----
  const fam = new Set();
  const famMap = { gates: ['onboarding', 'auth'], onboarding: ['onboarding'], auth: ['auth'], wallet: ['wallet'], profile: ['profile'], notices: ['notices'], notifications: ['notices'], faq: ['faq'], reviews: ['reviews'], 'record.reviews': ['reviews'], variants: ['variants'], 'record.variants': ['variants'], promo: ['promo'] };
  for (const f of familiesSel) for (const x of famMap[f] || [f]) fam.add(x);
  if (personName) fam.add('profile');

  // ---- fields ----
  const fields = [{ id: 'name', label: itemLabel, type: 'text' }];
  if (factSel.includes('category')) fields.push({ id: 'category', label: 'Category', type: 'enum', options: ['General', 'Popular', 'New'] });
  if (factSel.includes('second-facet')) fields.push({ id: 'facet', label: 'Facet', type: 'enum', options: ['Option A', 'Option B'] });
  if (factSel.includes('price')) fields.push({ id: 'price', label: 'Price', type: 'money' });
  if (factSel.includes('rating')) fields.push({ id: 'rating', label: 'Rating', type: 'number' });
  if (factSel.includes('seller')) fields.push({ id: 'seller', label: 'Seller', type: 'text' });
  if (factSel.includes('description')) fields.push({ id: 'description', label: 'Description', type: 'text' });
  const hasFacet = fields.some(f => f.type === 'enum');

  // ---- items ----
  let items = asArray(pick(a, 'items', 'collection.items'));
  if (!items.length || typeof items[0] === 'string') {
    items = [1, 2, 3].map(i => {
      const it = { id: `s${i}`, name: `Sample ${itemLabel} ${i}` };
      for (const f of fields) {
        if (f.id === 'name') continue;
        if (f.type === 'money') it[f.id] = 499 * i;
        else if (f.type === 'number') it[f.id] = 4.5;
        else if (f.type === 'enum') it[f.id] = f.options[0];
        else it[f.id] = `Sample ${f.label.toLowerCase()} ${i}`;
      }
      if (fam.has('reviews')) it.reviews = [{ name: 'Sample Reviewer', rating: 5, text: 'Sample review — replace with real reviews.' }];
      if (fam.has('variants')) it.variants = [{ label: 'Option', options: ['Standard', 'Premium'] }];
      return it;
    });
  }

  // ---- requirements ----
  const reqs = [
    `The home screen is a photo-led gallery of every ${itemLabel.toLowerCase()} in the catalogue.`,
    `Customers can search ${itemPlural.toLowerCase()} by name.`,
  ];
  if (hasFacet) reqs.push(`Customers can filter ${itemPlural.toLowerCase()} by category.`);
  if (needWishlist === 'yes' || needWishlist === 'toggle-only') reqs.push(`A customer can save a ${itemLabel.toLowerCase()} to favourites with a heart toggle.`);
  reqs.push(`Opening a ${itemLabel.toLowerCase()} shows its details, price and description.`);
  if (commerce === 'bag') {
    reqs.push(`Customers add ${itemPlural.toLowerCase()} to a cart they can review and adjust quantities in before ordering.`);
    reqs.push(`A customer checks out from the bag and places an order in three steps: your name and phone, then your delivery address, then review.`);
    reqs.push('A placed order ends with a confirmation showing a reference the customer can quote.');
    reqs.push('Customers can review their placed orders and cancel an order they no longer want.');
  }
  if (needBooking === 'yes' || needBooking === 'request' || commerce === 'booking') {
    reqs.push(`Customers book a ${itemLabel.toLowerCase()} by picking a date and time slot, then confirm the booking.`);
  }
  if (commerce === 'contact') reqs.push(`Buyers contact the provider to arrange a ${itemLabel.toLowerCase()} — there is no checkout.`);
  if (needChat === 'yes') reqs.push(`Customers can message the provider about a ${itemLabel.toLowerCase()} inside the app.`);
  if (needChat === 'contact-only') reqs.push(`Customers can contact the provider from a ${itemLabel.toLowerCase()} page.`);

  // ---- brief ----
  const brief = {
    name, tagline: tagline || `${name} — ${domainRaw}`, about: tagline || undefined,
    domain, location, currency,
    collection: { label: itemLabel, plural: itemPlural, media: mediaSel !== 'none', items },
    fields, requirements: reqs,
  };
  if (commerce === 'bag') { brief.bagLabel = bagLabel; if (uniqueItems) brief.uniqueItems = true; if (deliveryFee !== undefined) brief.deliveryFee = deliveryFee; }
  if (homeHeader === 'greeting') { brief.homeHeader = 'greeting'; if (hasFacet) brief.showCategories = true; }
  if (fam.has('onboarding')) brief.onboarding = { slides: [{ headline: `Welcome to ${name}`, text: tagline || name }, { headline: `Browse ${itemPlural.toLowerCase()}`, text: `Find the right ${itemLabel.toLowerCase()} for you.` }], cta: 'Get started' };
  if (fam.has('auth')) brief.auth = { providers: ['Google'], titleIn: 'Welcome back', titleUp: 'Create your account' };
  if (fam.has('wallet')) brief.wallet = { label: 'Wallet', balance: 500, transactions: [{ label: 'Opening balance', amount: 500, when: 'Today', kind: 'credit' }] };
  if (fam.has('profile') || personName) brief.profile = { name: personName || 'Demo User', sub: location, sections: [{ rows: [{ kind: 'link', label: 'Notifications', view: 'notices' }, ...(fam.has('wallet') ? [{ kind: 'link', label: 'Wallet', view: 'wallet' }] : []), { kind: 'toggle', label: 'Notifications', value: true }] }] };
  if (fam.has('notices')) brief.notices = [{ when: 'Today', title: `Welcome to ${name}`, text: tagline || 'Thanks for joining.' }];
  if (fam.has('faq')) brief.faq = [{ q: `How does ${name} work?`, a: tagline || 'Browse, choose, and confirm — everything happens on this device.' }];
  if (fam.has('promo') || promoRaw) {
    const promoObj = (promoRaw && typeof promoRaw === 'object') ? promoRaw : null;
    const promoText = promoObj ? '' : String(promoRaw || '20% — Introductory offer');
    const pct = promoObj?.percent || (promoText.match(/\d+%/) || ['20%'])[0];
    brief.promo = promoObj || { percent: pct, title: promoText.replace(/^\s*\d+%\s*[—-]?\s*/, '') || 'Introductory offer', subtitle: promoText, cta: 'Explore', recordId: items[0]?.id };
  }
  if (commerce === 'bag' && checkout === 'radio-steps') {
    brief.flow = {
      form: [
        { id: 'name', label: 'Your name', type: 'text' }, { id: 'phone', label: 'Phone', type: 'text' },
        { id: 'address', label: 'Address', type: 'text' },
        { id: 'delivery', label: 'Delivery', type: 'enum', options: [{ label: 'Standard delivery', value: 'standard', caption: '2–3 days', price: deliveryFee ?? 49 }, { label: 'Pickup', value: 'pickup', caption: 'Collect yourself', price: 0 }] },
        { id: 'payment', label: 'Payment', type: 'enum', options: [{ label: 'UPI', value: 'upi', caption: 'Pay on confirmation' }, { label: 'Cash', value: 'cash', caption: 'Pay on delivery' }] },
      ],
      steps: [{ id: 'details', fields: ['name', 'phone'] }, { id: 'delivery', fields: ['address', 'delivery'] }, { id: 'payment', fields: ['payment'] }],
    };
  }
  Object.keys(brief).forEach(k => brief[k] === undefined && delete brief[k]);

  // ---- screens ----
  const screens = [];
  const addScreen = (id, type, why) => {
    const t = canonicalType(type);
    if (!screens.some(s => s.id === id)) screens.push({ id, name: id.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' '), referenceType: t, why });
  };
  if (fam.has('onboarding')) addScreen('onboarding', 'onboarding', 'Declared family: onboarding');
  if (fam.has('auth')) { addScreen('auth', 'auth', 'Declared family: auth'); addScreen('otp', 'OTP', 'Auth verification step'); }
  addScreen('home', 'home', 'Primary landing screen');
  addScreen('search', 'search', 'Requirement: search by name');
  if (hasFacet) addScreen('filter-sheet', 'filter-sheet', 'Facet filters declared in fields');
  addScreen('catalogue', 'catalogue', 'Catalogue browse');
  addScreen('detail', 'detail', `${itemLabel} detail`);
  if (fam.has('reviews')) addScreen('reviews', 'reviews', 'Declared family: per-record reviews');
  if (needWishlist === 'yes') addScreen('wishlist', 'wishlist', 'Wishlist need: saved screen');
  if (commerce === 'bag') { addScreen('bag', 'bag', 'Commerce model: bag'); addScreen('checkout', 'checkout', 'Commerce model: checkout'); if (checkout === 'radio-steps') addScreen('payment', 'payment', 'Radio-row payment step'); addScreen('success', 'success', 'Order confirmation'); addScreen('orders', 'orders', 'Order book'); addScreen('tracker', 'tracker', 'Order tracking'); }
  if (needBooking === 'yes' || needBooking === 'request' || commerce === 'booking') addScreen('booking', 'booking', 'Booking need declared');
  if (needChat === 'yes') addScreen('chat', 'chat', 'Chat need declared');
  if (fam.has('wallet')) addScreen('wallet', 'wallet', 'Declared family: wallet');
  if (fam.has('notices')) addScreen('notifications', 'notifications', 'Declared family: notices');
  if (fam.has('profile') || personName) { addScreen('profile', 'profile', 'Declared family: profile'); addScreen('settings', 'settings', 'Profile settings rows'); }
  for (const m of mustHave) { const t = canonicalType(m); if (t) addScreen(t === 'OTP' ? 'otp' : t, t, 'Must-have screen named in intake'); }
  const journeyLower = journeyPrimary.toLowerCase();
  if (/chat|message/.test(journeyLower) && !screens.some(s => s.id === 'chat')) addScreen('chat', 'chat', 'Named in primary journey');
  if (/book|appointment|slot/.test(journeyLower) && !screens.some(s => s.id === 'booking')) addScreen('booking', 'booking', 'Named in primary journey');
  if (/map|nearby|near me/.test(journeyLower) && !screens.some(s => s.id === 'map')) addScreen('map', 'map', 'Named in primary journey');
  if (/wallet|balance/.test(journeyLower) && !screens.some(s => s.id === 'wallet')) addScreen('wallet', 'wallet', 'Named in primary journey');

  // ---- milestones ----
  const milestones = [
    { id: 'M1', title: 'Foundation & home', screens: screens.filter(s => ['onboarding', 'auth', 'otp', 'home'].includes(s.id)).map(s => s.id), outcome: 'App opens, entry gates (if declared) work, home renders with real catalogue data.' },
    { id: 'M2', title: 'Discovery: catalogue, search, detail', screens: screens.filter(s => ['search', 'filter-sheet', 'catalogue', 'detail', 'reviews', 'wishlist'].includes(s.id)).map(s => s.id), outcome: 'User can find, filter, open and save items end-to-end.' },
    { id: 'M3', title: 'Transaction: bag / booking / checkout', screens: screens.filter(s => ['bag', 'checkout', 'payment', 'booking', 'success', 'orders', 'tracker'].includes(s.id)).map(s => s.id), outcome: 'Primary journey completes to a confirmation with a reference.' },
    { id: 'M4', title: 'Families & account', screens: screens.filter(s => ['wallet', 'profile', 'settings', 'notifications', 'chat', 'map', 'dashboard', 'loyalty'].includes(s.id)).map(s => s.id), outcome: 'Every declared family is reachable and functional on-device.' },
    { id: 'M5', title: 'Polish & verification', screens: screens.map(s => s.id), outcome: 'Fulfilment, doctors and screenshots verified at 390px against DESIGN_DIRECTION.md.' },
  ].filter(m => m.screens.length || m.id === 'M5');

  const refSource = referenceChoice.startsWith('user') ? referenceChoice : 'base';
  const worldName = world !== 'auto' ? world : (String(domainRaw).includes('food') ? 'warm market' : String(domainRaw).includes('service') ? 'clinical calm' : 'mono (base board world)');
  return { name, tagline, domain, domainRaw, world, worldName, location, currency, itemLabel, itemPlural, commerce, bagLabel, checkout, homeHeader, personName, families: [...fam], referenceChoice, refSource, journeyPrimary, mustHave, needBooking, needChat, needWishlist, brief, screens, milestones, hasFacet };
}

export function renderPlan(plan, baseInfo) {
  const { name, screens, milestones } = plan;
  const refLabel = plan.refSource === 'base' ? 'base reference (decoded Pinterest board library)' : `user reference decode \`${plan.referenceChoice}\` (base reference as fallback for uncovered screens)`;
  const journeySteps = plan.journeyPrimary
    ? plan.journeyPrimary.split(/[,;.]| then | and then /i).map(s => s.trim()).filter(Boolean)
    : ['Open the app', 'Browse the catalogue', 'Open a detail page', 'Complete the primary action'];
  const screenLine = s => `- **${s.name}** (\`${s.id}\`) — reference type \`${s.referenceType}\` — ${s.why}`;

  const roadmap = `# ROADMAP — ${name}\n\nReference governing this build: **${refLabel}**. Screen-type vocabulary source: ${baseInfo.source}.\n\n` +
    milestones.map(m => `## ${m.id} — ${m.title}\n\nScreens: ${m.screens.join(', ') || '(cross-cutting)'}\n\nOutcome: ${m.outcome}\n`).join('\n') +
    `\n## Beyond the milestones\n\n- No generation starts before the confirmation gate (PLAN.json status \`awaiting_confirmation\` → \`confirmed\`).\n- Each milestone is driven in the generated app and screenshotted at 390px before it is checked off.\n`;

  const todo = `# TODO — ${name}\n\nStatus: awaiting confirmation. Do not start until the user confirms this plan.\n\n` +
    milestones.map(m => `## ${m.id} — ${m.title}\n\n` + m.screens.map(id => `- [ ] Build & verify screen: ${id}`).join('\n') + `\n- [ ] Drive the app through ${m.id} and screenshot at 390px\n- [ ] Check off ${m.id} in this file only with screenshot evidence\n`).join('\n');

  const art = `# ART DIRECTION — ${name}\n\n## Reference source\n\nThis direction is justified from the **${refLabel}**. ${plan.refSource === 'base' ? 'No user reference was attached, so the base reference governs every screen.' : 'The user reference governs the screens it covers (see REFERENCE_PLAN.md); the base reference governs the rest.'}\n\n## World\n\n${plan.worldName} — chosen ${plan.world === 'auto' ? 'automatically from the domain' : 'explicitly in intake'} for a ${plan.domainRaw} app. The world sets the ground, the brand colour and the type voice before any screen is drawn.\n\n## Palette\n\n- Ground: the reference world's ground (base board: white in the mono world; photography carries colour).\n- Brand / accent: exactly one accent, per the engine grammar — never two competing brand colours.\n- Text: near-black on light ground; secondary text one step quieter, never a second hue.\n- Media: ${plan.brief.collection.media ? 'real/sample photography is the colour of the app; cards without photos fall back to initials on tint, labelled honestly.' : 'no photography — initials on tint over the ground, by explicit intake choice.'}\n\n## Type\n\nOne sans for working type (the board's voice); display weight reserved for the home greeting and detail titles. No serif in working UI unless the chosen world is editorial.\n\n## Shape & composition\n\nPill search with the icon inside; quiet chips; cards content-first with priority-ordered meta that wraps before it truncates; shadow OR outline, never both (engine grammar). Category medallions on the home when facets are declared.\n`;

  const design = `# DESIGN DIRECTION — ${name}\n\nEvery screen below is mapped to a base-reference screen type. Anatomy follows that type in the ${refLabel}.\n\n` +
    screens.map(s => `## ${s.name} (\`${s.id}\`)\n\n- Reference screen type: \`${s.referenceType}\`\n- Why it exists: ${s.why}\n- Anatomy: header zone (title / greeting as the type requires), primary content region in the type's canonical order, primary action in the type's action position, empty + loading + error states in the type's pattern.\n- States: default, empty, and (where the screen holds user data) populated — all three are built, not just the happy path.\n`).join('\n');

  const functionality = `# FUNCTIONALITY — ${name}\n\n## Features (each traces to a brief declaration)\n\n` +
    plan.brief.requirements.map(r => `- ${r}`).join('\n') +
    `\n\n## Declared families\n\n${plan.families.length ? plan.families.map(f => `- ${f}`).join('\n') : '- None declared — the app is catalogue + primary action only.'}\n\n## Data model\n\n- Collection: \`${plan.itemLabel}\` — fields: ${plan.brief.fields.map(f => `\`${f.id}:${f.type}\``).join(', ')}.\n- Catalogue items in plan: ${plan.brief.collection.items.length} (labelled samples unless the user supplied real items).\n- User state (bag/favourites/orders/bookings, wallet balance, profile toggles) persists in browser localStorage on the device.\n\n## Flows\n\n- Primary flow: see USER_JOURNEY.md.\n- Commerce model: \`${plan.commerce}\`${plan.commerce === 'bag' ? ` (bag label "${plan.bagLabel}", checkout "${plan.checkout}"${plan.brief.uniqueItems ? ', one-of-one items' : ''})` : ''}.\n- Booking need: \`${plan.needBooking}\`. Chat need: \`${plan.needChat}\`. Wishlist need: \`${plan.needWishlist}\`.\n\n## States\n\nEmpty catalogue, empty bag/wishlist, no-results search, no-orders, and first-run (onboarding/auth if declared) are all specified states — not afterthoughts.\n\n## Honest local-only limits\n\n- The engine generates front-ends with local state. Accounts, real payments, push notifications, live chat delivery, maps/geocoding and multi-device sync are services an integrator must supply — the app does not fake them.\n- Wallet, chat and booking (where planned) are on-device simulations with real local state changes, labelled as such in the app where a user could mistake them for live services.\n- Photography is the user's to supply; without it the engine renders branded gradient / initials media.\n`;

  const journey = `# USER JOURNEY — ${name}\n\n## Primary journey (user's own words)\n\n> ${plan.journeyPrimary || '(not stated in intake — default browse-to-action journey used; confirm with the user at the gate)'}\n\n### Step-by-step (each step resolves to a planned screen)\n\n` +
    journeySteps.map((st, i) => {
      const match = screens.find(s => st.toLowerCase().includes(s.id) || st.toLowerCase().includes(s.referenceType)) || screens[Math.min(i, screens.length - 1)];
      return `${i + 1}. ${st} → screen: \`${match ? match.id : 'home'}\``;
    }).join('\n') +
    `\n\n## Secondary journeys\n\n- Browse without intent: home → catalogue → detail → back (no dead ends; every detail returns to its list position).\n- Return visit: home → orders/profile → repeat the primary action.\n- Saved-items return: home → ${screens.some(s => s.id === 'wishlist') ? 'wishlist' : 'detail (save toggle)'} → primary action.\n\n## All planned screens\n\n${screens.map(screenLine).join('\n')}\n`;

  const refPlan = `# REFERENCE PLAN — ${name}\n\nGoverning reference: **${refLabel}** (\`referenceChoice: ${plan.referenceChoice}\`).\n\n| Screen | Reference type | Governing reference |\n| --- | --- | --- |\n` +
    screens.map(s => `| ${s.id} | ${s.referenceType} | ${plan.refSource === 'base' ? 'base' : `${plan.referenceChoice} if covered, else base`} |`).join('\n') +
    `\n\nRule: a screen with no governing reference is not built. If the user reference does not cover a screen type, the base reference type of the same name governs it — the fallback is named here, never silent.\n`;

  const planJson = { status: 'awaiting_confirmation', app: name, referenceChoice: plan.referenceChoice, screens, milestones: milestones.map(m => ({ id: m.id, title: m.title, screens: m.screens, outcome: m.outcome })), journey: plan.journeyPrimary, mustHaveScreens: plan.mustHave };
  return { roadmap, todo, art, design, functionality, journey, refPlan, planJson };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [answersPath, outDir] = process.argv.slice(2);
  if (!answersPath || !outDir) { console.error('usage: node make_plan.mjs <answers.json> <outDir>'); process.exit(2); }
  const answers = JSON.parse(readFileSync(answersPath, 'utf8'));
  const baseInfo = loadBaseScreenTypes();
  const plan = buildPlan(answers);
  const files = renderPlan(plan, baseInfo);
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, 'ROADMAP.md'), files.roadmap);
  writeFileSync(join(outDir, 'TODO.md'), files.todo);
  writeFileSync(join(outDir, 'ART_DIRECTION.md'), files.art);
  writeFileSync(join(outDir, 'DESIGN_DIRECTION.md'), files.design);
  writeFileSync(join(outDir, 'FUNCTIONALITY.md'), files.functionality);
  writeFileSync(join(outDir, 'USER_JOURNEY.md'), files.journey);
  writeFileSync(join(outDir, 'REFERENCE_PLAN.md'), files.refPlan);
  writeFileSync(join(outDir, 'product-brief.json'), JSON.stringify(plan.brief, null, 2) + '\n');
  writeFileSync(join(outDir, 'PLAN.json'), JSON.stringify(files.planJson, null, 2) + '\n');
  console.log(`plan: wrote 9 files to ${outDir} (${plan.screens.length} screens, ${plan.milestones.length} milestones)`);
  console.log('WARNING: PLAN.json status is "awaiting_confirmation" — generation must NOT start until the user confirms the plan and status is set to "confirmed".');
}
