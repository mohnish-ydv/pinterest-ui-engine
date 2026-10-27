// recovery.test.mjs — targeted regression tests for the M035 recovery.
//
// Each check names the defect it exists for, in the words of the failure
// observed on the Bayline Stores generation (an inventory brief run through
// the lightweight M035 build by an external operator). Every check here
// FAILS against the M035 engine and passes against the corrected one; the
// fixtures are synthetic and share no vocabulary with that brief beyond
// the grammatical shapes being tested.
//
// No browser required. Usage: node engine/tests/recovery.test.mjs
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { deriveBrief } from '../intake/derive.mjs';
import { planApp } from '../layout/plan.mjs';
import { planTestplan } from '../layout/gates.mjs';
import { buildModel } from '../layout/compile.mjs';
import { resolveFulfilment } from '../layout/fulfil.mjs';
import { derivePairs } from '../lib/gate.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));

const results = [];
const check = (name, ok, detail = '') => {
  results.push(ok);
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`);
};

// ---- a synthetic brief in the same grammatical shapes as the failure ----
// Field declaration order is deliberate: the two fields the table sentence
// names last (qty, price) sit at positions 6 and 9, beyond any five-field
// window, and a second money-shaped threshold drives the aggregate.
const product = {
  name: 'Depot Parts',
  tagline: 'Every depot line, one ledger.',
  about: 'Depot stores for a regional maintenance depot.',
  location: 'Nagpur',
  currency: '₹',
  domain: 'inventory',
  collection: {
    label: 'Depot line', plural: 'Depot lines',
    items: [
      { id: 'd1', item: 'Coupling, flexible', sku: 'CPL-220', shelf: 'S-01', kind: 'Couplings', state: 'OK', qty: 140, unit: 'pcs', threshold: 60, price: 320, vendor: 'Vidarbha Industrial', wait: 4 },
      { id: 'd2', item: 'Valve, gate 2in', sku: 'VLV-118', shelf: 'S-04', kind: 'Valves', state: 'Low', qty: 12, unit: 'pcs', threshold: 25, price: 1450, vendor: 'Vidarbha Industrial', wait: 6 },
      { id: 'd3', item: 'Chain, roller 40', sku: 'CHN-540', shelf: 'S-09', kind: 'Drives', state: 'Out', qty: 0, unit: 'pcs', threshold: 8, price: 2100, vendor: 'Orange City Trading', wait: 9 },
    ],
  },
  fields: [
    { id: 'item', label: 'Item', type: 'text' },
    { id: 'sku', label: 'SKU', type: 'text' },
    { id: 'shelf', label: 'Shelf', type: 'text' },
    { id: 'kind', label: 'Kind', type: 'enum' },
    { id: 'state', label: 'State', type: 'enum' },
    { id: 'qty', label: 'Qty', type: 'number' },
    { id: 'unit', label: 'Unit', type: 'text' },
    { id: 'threshold', label: 'Threshold', type: 'number' },
    { id: 'price', label: 'Price', type: 'money' },
    { id: 'vendor', label: 'Vendor', type: 'text' },
    { id: 'wait', label: 'Wait', type: 'number', suffix: ' days' },
  ],
  requirements: [
    'A compact table of every depot line, with the SKU, the shelf, the qty and the price.',
    'Summary numbers at the top: how many lines are below their threshold, and the total value of stock.',
    'Filter by kind and by state, and search by SKU or item name.',
    'Opening a depot line shows its vendor and its wait.',
    'Staff can raise a restock request in three steps: qty and vendor, then the arrival date, then review.',
    'The person raising the request confirms it and receives a visible confirmation with a reference.',
  ],
  prohibited: [],
};

const brief = deriveBrief(product, null);
const field = (id) => brief.entity.fields.find(f => f.id === id);
const commit = (brief.actions || []).find(a => a.kind === 'commit');

// ---- composition: a tie is broken by the brief's own order ---------------
// "table" (req 1) and "summary numbers" (req 2) score equally here; the
// M035 tie-break was the FAMILIES list order, which silently preferred
// dashboard for a brief that leads with its table.
check('composition: the lead requirement wins a tie (table over dashboard)',
  brief.intent.composition === 'table', `got "${brief.intent.composition}"`);

// ---- table columns come from the sentence, not declaration order ---------
const cols = (brief.table && brief.table.columns || []).map(c => c.field);
check('table: columns are the fields the table sentence names',
  ['sku', 'shelf', 'qty', 'price'].every(id => cols.includes(id)),
  `columns: ${cols.join(', ')}`);
check('table: no five-field declaration-order cap',
  cols.length > 5, `columns: ${cols.join(', ')}`);

// ---- scoping: a table sentence places its fields in the entry ------------
const skuSR = brief._derived.scoped.requirements.find(r => r.kind === 'field' && r.subject === 'sku');
check('scope: "a table of every … with the SKU" scopes the SKU to the entry',
  !!skuSR && skuSR.scope.view === 'entry', skuSR ? `scope=${skuSR.scope.view}` : 'no SR');
check('scope: a one-word label inside a longer label is not named ("Unit" in "unit cost" class)',
  !brief._derived.scoped.requirements.some(r => r.subject === 'unit' && r.source.requirementIndex === 0),
  'the Unit field must not be scoped by the table sentence');

// ---- aggregates: the questions the prose asks -----------------------------
const aggs = brief.aggregates || [];
const cw = aggs.find(a => a.op === 'countWhere');
check('aggregates: "how many … below their threshold" derives a conditional count',
  !!cw && cw.field === 'qty' && cw.compareField === 'threshold' && cw.compare === '<',
  JSON.stringify(aggs.map(a => a.op)));
const sp = aggs.find(a => a.op === 'sumProduct');
check('aggregates: "the total value of stock" derives quantity × price',
  !!sp && sp.fields[0] === 'qty' && sp.fields[1] === 'price',
  JSON.stringify(aggs.map(a => a.op)));
check('aggregates: a per-unit price is never summed into a "total"',
  !aggs.some(a => a.op === 'sum' && a.field === 'price'),
  JSON.stringify(aggs.map(a => `${a.op}:${a.field || ''}`)));

// ---- unit binding: quantities carry units, money does not -----------------
check('units: the quantity field is bound to the unit field',
  field('qty').unitField === 'unit', `qty.unitField=${field('qty').unitField}`);
check('units: the money field is NOT unit-bound (no "₹320 pcs")',
  !field('price').unitField, `price.unitField=${field('price').unitField}`);

// ---- the flow: fields and steps from the requirement ----------------------
check('flow: the form collects what the brief names, not a contact template',
  !!commit && ['qty', 'vendor', 'arrival-date'].every(id => commit.form.some(f => f.id === id)),
  commit ? commit.form.map(f => f.id).join(', ') : 'no commit');
check('flow: no invented contact fields when the brief names its own',
  !!commit && !commit.form.some(f => ['fullName', 'phone', 'email'].includes(f.id)),
  commit ? commit.form.map(f => f.id).join(', ') : 'no commit');
check('flow: a named date becomes a date field; a named quantity a number field',
  !!commit && commit.form.find(f => f.id === 'arrival-date')?.type === 'date'
    && commit.form.find(f => f.id === 'qty')?.type === 'number',
  commit ? commit.form.map(f => `${f.id}:${f.type}`).join(', ') : 'no commit');
check('flow: step labels come from the brief',
  !!commit && JSON.stringify((commit.steps || []).map(s => s.label)) === JSON.stringify(['Qty and Vendor', 'Arrival Date', 'Review']),
  commit ? (commit.steps || []).map(s => s.label).join(' → ') : 'no steps');
check('flow: the entry action is labelled from the brief, not "Start"',
  brief.entryAction && brief.entryAction.label === 'Raise restock request',
  brief.entryAction ? brief.entryAction.label : 'no entry action');

// ---- fulfilment: role capability is not field placement -------------------
{
  const ir = {
    views: [
      { id: 'main', sections: [] },
      { id: 'detail', sections: [
        { component: 'stat-strip', binding: { entity: 'depot-line', fields: ['threshold'] } },
      ] },
    ],
  };
  const scoped = {
    requirements: [
      { id: 'SR-T', kind: 'field', subject: 'qty', mandatory: true,
        scope: { view: 'either', cardinality: 'one', region: 'any' } },
    ],
    contradictions: [],
  };
  const rep = resolveFulfilment({ brief, ir, scoped });
  const o = rep.outcomes.find(x => x.id === 'SR-T');
  check('fulfilment: an unplaced field is not "satisfied" by a surface rendering its role',
    !!o && o.outcome !== 'satisfied', o ? `outcome=${o.outcome}` : 'no outcome');
}

// ---- testplan: fills happen on the step that shows the field --------------
{
  const ir = planApp(brief, null, {});
  const model = buildModel(brief, ir, { color: { brand: '#1F4E4A' } });
  const tp = planTestplan(brief, ir, model);
  const idxType = (tid) => tp.steps.findIndex(s => s.act === 'type' && String(s.sel).includes(tid));
  const idxClick = (tid, from = 0) => tp.steps.findIndex((s, i) => i >= from && s.act === 'click' && String(s.sel).includes(tid));
  const firstNext = idxClick('step-next');
  const dateFill = idxType('field-arrival-date');
  check('testplan: the step-2 field is filled only after the flow advances',
    firstNext !== -1 && dateFill > firstNext,
    `first step-next at ${firstNext}, arrival-date fill at ${dateFill} of ${tp.steps.length}`);
  const qtyFill = idxType('field-qty');
  check('testplan: the step-1 field is filled before the first advance',
    qtyFill !== -1 && qtyFill < firstNext, `qty fill at ${qtyFill}, advance at ${firstNext}`);
  const headStep = tp.steps.find(s => s.act === 'count' && String(s.sel).includes('table-head'));
  check('testplan: the header assertion counts the planned table',
    !!headStep && headStep.eq === cols.length, headStep ? `eq=${headStep.eq}, columns=${cols.length}` : 'no header step');
}

// ---- the gate covers the pair the table header composes --------------------
{
  const pairs = derivePairs({ color: { ground: '#FAFAF8', surface: '#FFFFFF', ink: '#141414', inkSoft: '#5B5B5A', brand: '#1F4E4A', brandDeep: '#183D3A', tint: '#E0E5E3', line: '#E6E4E0', error: '#A32026' }, state: {} });
  check('gate: body ink on tint is a gated pair',
    pairs.some(p => p.name === 'body ink on tint'), pairs.map(p => p.name).join(', ').slice(0, 120));
}

const passed = results.filter(Boolean).length;
console.log(`RESULT ${passed}/${results.length}`);
process.exit(passed === results.length ? 0 : 1);
