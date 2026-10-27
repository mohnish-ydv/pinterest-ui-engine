// design036.test.mjs — MISSION 036 safeguards for the design-intelligence
// layer. These pin the DERIVATION rules (which world a brief gets, what a
// reference contributes), not any product's content: fixtures are
// synthetic and share only grammatical/domain shapes with real briefs.
//
//   1-5  design worlds: a reference-free brief's domain/composition picks
//        its world; the world reaches palette, family and type.
//   6-7  availability declared in a product brief survives derivation.
//   8    reference colour comes from the colour analyser's clusters, not
//        the structural extractor's (which greys saturated accents out).

import { deriveBrief } from '../intake/derive.mjs';
import { deriveSpec, deriveFamily, pickArchetype } from '../intake/derive_spec.mjs';

let pass = 0, fail = 0;
const check = (name, ok, extra = '') => { if (ok) { pass++; console.log('  ok  ' + name); } else { fail++; console.log('FAIL  ' + name + (extra ? ' — ' + extra : '')); } };

const product = (over) => ({
  name: 'Fixture', tagline: '', about: '', location: '', currency: '₹', domain: 'general',
  collection: { label: 'Item', plural: 'Items', items: [{ id: 'a', name: 'One' }] },
  fields: [{ id: 'name', type: 'text', label: 'Item' }],
  requirements: ['The list shows every item.'],
  ...over,
});

// 1-2: archetype selection by domain and by composition
check('inventory domain -> ledger world', pickArchetype(product({ domain: 'inventory' }), null).id === 'ledger');
check('publishing domain -> editorial world', pickArchetype(product({ domain: 'publishing' }), null).id === 'editorial');
check('health domain -> care world', pickArchetype(product({ domain: 'health' }), null).id === 'care');
check('food domain -> market world', pickArchetype(product({ domain: 'food' }), null).id === 'market');
check('unmarked brief -> studio world', pickArchetype(product({}), null).id === 'studio');
check('index composition -> editorial world', pickArchetype(product({}), { _derived: { composition: 'index' } }).id === 'editorial');
check('table composition -> ledger world', pickArchetype(product({}), { _derived: { composition: 'table' } }).id === 'ledger');

// 3: the world reaches the spec — no universal teal, family named for it
const specLedger = deriveSpec(product({ domain: 'inventory' }), null, null);
check('reference-free spec brand is the world brand, not the old universal teal',
  specLedger.palette.brand !== '#1F4E4A' && specLedger.family === 'ledger',
  `brand ${specLedger.palette.brand}, family ${specLedger.family}`);
check('spec records the world in its derivation notes',
  specLedger._derived.notes.some(n => n.includes('design world: ledger')));

// 4: editorial world is serif-led with the larger display size
const famEd = deriveFamily(product({ domain: 'publishing' }), null);
check('editorial family is serif display', famEd.typography.displayStrategy === 'serif' && /Georgia/.test(famEd.typography.displayStack || ''));
const specEd = deriveSpec(product({ domain: 'publishing' }), null, { _derived: { composition: 'index' } });
check('editorial display size is boosted past the density default', specEd.typography.scalePx.display >= 30, `display ${specEd.typography.scalePx.display}`);

// 5: a stated product.family still wins over the archetype
const specFam = deriveSpec(product({ domain: 'inventory', family: 'butcher' }), null, null);
check('stated family bypasses the archetype palette', specFam.family === 'butcher' && specFam.palette.brand === '#1F4E4A');

// 6-7: availability passthrough
const withAv = deriveBrief(product({ availability: { label: 'Visit time', days: ['Today', 'Tomorrow', 'Wed'], slots: ['9:00 AM', '10:00 AM'], rule: { kind: 'modulo', modulus: 3, remainder: 1, inputs: ['slotIndex'] } } }), null);
check('declared availability survives derivation as a day count + slots',
  !!withAv.availability && withAv.availability.days === 3 && withAv.availability.slots.length === 2 && withAv.availability.rule.modulus === 3,
  JSON.stringify(withAv.availability));
const noAv = deriveBrief(product({}), null);
check('no availability declared -> none invented', !('availability' in noAv && noAv.availability));

// 8: reference colour source — the analyser's clusters beat the structural ones
const ev = { observed: {
  clusters: [{ hex: '#606078', sharePct: 1.5 }, { hex: '#F0F0F0', sharePct: 49.5 }, { hex: '#454557', sharePct: 1.2 }],
  colour: { topClusters: [
    { hex: '#F9F9FB', share_pct: 52.7 }, { hex: '#EEEEEE', share_pct: 31.4 },
    { hex: '#3876E4', share_pct: 0.9 }, { hex: '#2B2B33', share_pct: 0.8 },
  ] },
} };
const specRef = deriveSpec(product({ domain: 'health' }), ev, null);
const rgb = specRef.palette.brand.match(/\w\w/g).map(h => parseInt(h, 16));
check('reference brand comes from the colour analyser (blue), not the structural clusters (grey)',
  specRef.palette.brand !== '#606078' && rgb[2] > rgb[0] + 40,
  `brand ${specRef.palette.brand}`);

console.log(`\nRESULT ${pass}/${pass + fail}`);
process.exit(fail ? 1 : 0);
