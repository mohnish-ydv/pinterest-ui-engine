// design037.test.mjs — Mission 037 composition decisions, pinned.
//
// M036 gave every product a coherent world but composed every page the
// same way: one stacked column, the primary action floating between the
// filters and the content, detail pages queuing the action panel beneath
// the facts, row lists ignoring their declared desktop columns, and an
// index giving every entry identical weight. These checks pin the
// composition layer's decisions on synthetic briefs — never on the
// mission's own products.

import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { deriveBrief } from '../intake/derive.mjs';
import { compileIntent } from '../intent/compile.mjs';
import { planApp } from '../layout/plan.mjs';

// Plan the way build_app does: intent compiled from the brief's own
// requirements, passed to the planner as an option.
const plan = (brief) => planApp(brief, null, {
  intent: { composition: compileIntent(brief, {}).composition },
});

const here = dirname(fileURLToPath(import.meta.url));
const engine = join(here, '..');
let pass = 0, fail = 0;
const check = (name, ok, detail = '') => {
  if (ok) { pass++; console.log('  ok ', name); }
  else { fail++; console.log('  FAIL', name, detail); }
};

const recs = [
  { id: 'r1', name: 'Alpha', kind: 'One', price: 100, score: 4.5, note: 'First note.' },
  { id: 'r2', name: 'Beta', kind: 'Two', price: 200, score: 4.0, note: 'Second note.' },
];
const fields = [
  { id: 'name', type: 'text', label: 'Name' },
  { id: 'kind', type: 'enum', label: 'Kind', options: ['One', 'Two'] },
  { id: 'price', type: 'money', label: 'Price' },
  { id: 'score', type: 'number', label: 'Score' },
  { id: 'note', type: 'text', label: 'Note' },
];
const product = (over = {}) => ({
  name: 'Fixture', tagline: 'Fixture tagline', about: 'A fixture product.',
  location: 'Pune', currency: '₹', domain: 'retail',
  collection: { label: 'Item', plural: 'Items', items: recs },
  fields,
  requirements: [
    'A browsable list of every item, with its price visible.',
    'Opening an item shows its note.',
  ],
  ...over,
});

// ---- plan-level composition decisions --------------------------------
{
  const brief = deriveBrief(product({
    requirements: [
      'An index of every item, newest first.',
      'Opening an item shows its note.',
    ],
  }), null);
  const layout = plan(brief);
  const coll = layout.views[0].sections.find(s => s.id === 'collection');
  check('index composition plans a single desktop column', coll.props.columns.desktop === 1,
    `desktop=${coll.props.columns.desktop}`);
}
{
  const brief = deriveBrief(product(), null);
  const layout = plan(brief);
  const coll = layout.views[0].sections.find(s => s.id === 'collection');
  check('non-index collections keep the density column count', coll.props.columns.desktop >= 2,
    `desktop=${coll.props.columns.desktop}`);
}

// ---- entry labels name the product's actual action --------------------
{
  const brief = deriveBrief(product({
    name: 'Fixture School',
    collection: { label: 'Course', plural: 'Courses', items: recs },
    requirements: [
      'A browsable list of every course.',
      'A student can enrol in three steps: the course, then your name, then review.',
      'A student enrols from a course\u2019s page.',
      'A successful enrolment ends with a confirmation showing a reference.',
    ],
  }), null);
  check('enrol brief labels its entry action',
    !!brief.entryAction && brief.entryAction.label === 'Enrol course',
    `label=${brief.entryAction && brief.entryAction.label}`);
}
{
  const brief = deriveBrief(product({
    requirements: [
      'Opening an item shows its maker and what makes it distinct.',
      'A customer can commission an item in three steps: the item, then your name, then review.',
      'A successful commission ends with a confirmation showing a reference.',
    ],
  }), null);
  check('a relative-clause verb is not the entry label',
    !!brief.entryAction && brief.entryAction.label === 'Commission item',
    `label=${brief.entryAction && brief.entryAction.label}`);
}

// ---- the built app carries the composition layer ----------------------
{
  const dir = mkdtempSync(join(tmpdir(), 'design037-'));
  const caseDir = join(dir, 'case');
  execFileSync('mkdir', ['-p', caseDir]);
  const briefWithFlow = product({
    availability: { label: 'Session time', days: 3, slots: ['9:00 AM', '11:00 AM'] },
    requirements: [
      'A browsable list of every item, with its price visible.',
      'Opening an item shows its note and session times.',
      'A customer can book an item in three steps: your name, then your phone, then review.',
      'A customer books from an item\u2019s page.',
    ],
  });
  writeFileSync(join(caseDir, 'product-brief.json'), JSON.stringify(briefWithFlow, null, 2));
  execFileSync('node', [join(engine, 'run.mjs'), caseDir], { stdio: 'pipe' });
  const layout = JSON.parse(readFileSync(join(caseDir, 'layout.json'), 'utf8'));
  const detail = layout.views.find(v => v.id === 'detail');
  check('availability + flow brief yields both rail sections',
    detail.sections.some(s => s.id === 'availability') && detail.sections.some(s => s.id === 'steps'),
    detail.sections.map(s => s.id).join(','));
  const css = readFileSync(join(caseDir, 'app', 'styles.css'), 'utf8');
  check('built CSS composes the detail rail', css.includes('.detail-cols') && css.includes('.rail'));
  // Renamed in M038: the placement is now the app shell's floating
  // action (design038 pins it); the invariant — a dedicated composition
  // rule for the entry action — is unchanged.
  check('built CSS places the entry action deliberately',
    css.includes('[data-section="entry-action"]'));
  const js = readFileSync(join(caseDir, 'app', 'app.js'), 'utf8');
  check('built runtime groups the rail and marks the index lead',
    js.includes('detail-cols') && js.includes('idx-lead'));
}

console.log(`\nRESULT ${pass}/${pass + fail}`);
process.exit(fail ? 1 : 0);
