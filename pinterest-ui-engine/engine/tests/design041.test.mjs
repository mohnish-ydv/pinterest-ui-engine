// design041.test.mjs — Mission 041, generality.
//
// "Any app" is a claim about the engine, so it is tested as one: the
// aggregate parser must understand summary prose it was not written
// against, entry labels must survive ordinary verb inflections, the
// runtime must evaluate every aggregate the parser can emit, and the
// engine source must stay category-blind — no product's vocabulary
// baked into shared code.

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { deriveBrief } from '../intake/derive.mjs';

let passed = 0;
let failed = 0;
const check = (name, cond, detail = '') => {
  if (cond) { passed++; console.log(`  ok  ${name}`); }
  else { failed++; console.log(`  FAIL ${name} ${detail}`); }
};

const expenseProduct = (summary) => ({
  name: 'Fixture Ledger', tagline: 't', about: 'a', domain: 'finance operations', currency: '₹',
  collection: {
    label: 'Expense', plural: 'Expenses',
    items: [
      { id: 'x1', name: 'Taxi', category: 'Travel', amount: 100, qty: 2, date: '2026-10-01' },
      { id: 'x2', name: 'Hosting', category: 'Software', amount: 300, qty: 1, date: '2026-10-02' },
      { id: 'x3', name: 'Seats', category: 'Software', amount: 50, qty: 4, date: '2026-10-03' },
    ],
  },
  fields: [
    { id: 'name', type: 'text', label: 'Expense' },
    { id: 'category', type: 'enum', label: 'Category', options: ['Travel', 'Software'] },
    { id: 'amount', type: 'money', label: 'Unit amount' },
    { id: 'qty', type: 'number', label: 'Quantity' },
    { id: 'date', type: 'date', label: 'Date' },
  ],
  requirements: [
    'Staff review all expenses in a table with columns for expense, category, unit amount, quantity and date.',
    summary,
    'Staff can add a new expense with a form collecting the expense name, category, unit amount, quantity and date.',
  ],
});

{
  const brief = deriveBrief(expenseProduct(
    'The summary shows KPI totals: the count of expenses, the total spend computed as unit amount times quantity summed across expenses, and the count of software expenses.'), null);
  const ops = brief.aggregates.map(a => a.op);
  check('a computed-as product sentence yields sumProduct', ops.includes('sumProduct'), ops.join(','));
  const prod = brief.aggregates.find(a => a.op === 'sumProduct');
  check('the product operands resolve by label in sentence order',
    prod && prod.fields.join(',') === 'amount,qty', prod && prod.fields.join(','));
  check('its label keeps the sentence\u2019s noun', prod && prod.label === 'Total spend', prod && prod.label);
  const eq = brief.aggregates.find(a => a.op === 'countWhereEq');
  check('"count of software expenses" counts the enum value', eq && eq.field === 'category' && eq.value === 'Software');
  check('a plain collection count is present exactly once',
    brief.aggregates.filter(a => a.op === 'count').length === 1);
  check('sentence order is preserved', brief.aggregates[0].op === 'count'
    && brief.aggregates[brief.aggregates.length - 1].op === 'countWhereEq');
}

{
  const brief = deriveBrief(expenseProduct(
    'The summary shows the total quantity and the total unit amount.'), null);
  const sums = brief.aggregates.filter(a => a.op === 'sum');
  check('"total <field>" phrasing yields field sums', sums.length === 2
    && sums.some(a => a.field === 'qty') && sums.some(a => a.field === 'amount'),
    JSON.stringify(brief.aggregates.map(a => a.id)));
}

{
  // The long-standing Bayline shapes must not move.
  const stock = {
    name: 'Fixture Stores', tagline: 't', about: 'a', domain: 'retail operations', currency: '₹',
    collection: { label: 'Product', plural: 'Products', items: [
      { id: 'p1', name: 'Rice', unitCost: 40, unitsInStock: 10, reorderLevel: 20 },
      { id: 'p2', name: 'Dal', unitCost: 90, unitsInStock: 30, reorderLevel: 5 },
    ] },
    fields: [
      { id: 'name', type: 'text', label: 'Product' },
      { id: 'unitCost', type: 'money', label: 'Unit cost' },
      { id: 'unitsInStock', type: 'number', label: 'Units in stock' },
      { id: 'reorderLevel', type: 'number', label: 'Reorder level' },
    ],
    requirements: ['The summary shows how many products are below their reorder level and the total value of stock on hand.'],
  };
  const brief = deriveBrief(stock, null);
  check('below-their-field still yields the conditional count', brief.aggregates.some(a => a.op === 'countWhere'));
  check('total value still yields the product sum', brief.aggregates.some(a => a.op === 'sumProduct'));
}

{
  // Entry labels across verb inflections: the flow verb is lemmatised,
  // so "applies" names an Apply action, not a generic Start.
  const jobs = {
    name: 'Fixture Jobs', tagline: 't', about: 'a', domain: 'careers',
    collection: { label: 'Role', plural: 'Roles', items: [{ id: 'j1', name: 'Designer', kind: 'Design', note: 'x' }] },
    fields: [
      { id: 'name', type: 'text', label: 'Role' },
      { id: 'kind', type: 'enum', label: 'Function', options: ['Design'] },
      { id: 'note', type: 'text', label: 'About' },
    ],
    requirements: [
      'Candidates browse roles as a directory list.',
      'A candidate applies in three steps: your name and email, then a cover note, then review.',
      'An application ends with a confirmation showing a reference.',
    ],
  };
  const brief = deriveBrief(jobs, null);
  check('"applies in three steps" yields an Apply entry label',
    brief.entryAction && brief.entryAction.label === 'Apply role',
    brief.entryAction && brief.entryAction.label);
}

{
  const engineDir = join(new URL('.', import.meta.url).pathname, '..');
  const files = [];
  const walk = (d) => {
    for (const name of readdirSync(d)) {
      const p = join(d, name);
      if (statSync(p).isDirectory()) { if (name !== 'tests' && name !== 'runs') walk(p); }
      else if (/\.(mjs|js|tmpl|json)$/.test(name) && !name.includes('package')) files.push(p);
    }
  };
  walk(engineDir);
  const productWords = /\b(rasoi|swaad|lotus|bayline|paneer|biryani|thali|groomer|pawcare|skillbridge|ledgerly|musafir|gignight|dailyfold|grobasket)\b/i;
  const offenders = files.filter(f => productWords.test(readFileSync(f, 'utf8')));
  check('engine source is category-blind (no product vocabulary in shared code)',
    offenders.length === 0, offenders.map(f => f.split('/').slice(-2).join('/')).join(', '));
  const runtime = readFileSync(join(engineDir, 'runtime', 'runtime.js'), 'utf8');
  check('the runtime evaluates countWhereEq', runtime.includes("a.op === 'countWhereEq'"));
  check('the related rail has a text mode', runtime.includes('rel-list'));
}

console.log(`\nRESULT ${passed}/${passed + failed}`);
process.exit(failed ? 1 : 0);
