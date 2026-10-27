// ledger.mjs — brief -> structured requirement ledger.
//
// MISSION 024, Phase 2. The ledger is derived from the BRIEF alone: its
// declarations, its field roles and the capability registry. It never reads
// the layout IR, so it cannot inherit the IR's blind spots — which is the
// whole point, because the IR is what silently omitted the dashboard's
// numbers in Mission 023.
//
// Every requirement carries a stable id, a category, whether it is required,
// what it expects, what should satisfy it, how it will be verified, and a
// status that the preflight then settles.

import { CONTENT_ROLES, renderedRoles, COLLECTION_RENDERS } from './registry.mjs';

export const LEDGER_VERSION = '1.0.0';

const CATEGORIES = ['content', 'layout', 'interaction', 'navigation', 'responsive', 'accessibility'];

// The variant the planner will choose. Documented rule, replicated here so the
// ledger knows what a list can draw without importing the planner.
export function plannedVariant(brief) {
  return brief.entity && brief.entity.media ? 'card' : 'row';
}

function req(o) {
  const r = {
    id: o.id,
    category: o.category,
    required: o.required !== false,
    expectation: o.expectation,
    satisfiedBy: o.satisfiedBy || null,
    verification: o.verification || { method: 'manual' },
    status: 'unclassified',
  };
  if (!CATEGORIES.includes(r.category)) throw new Error(`ledger: bad category "${r.category}" on ${r.id}`);
  return r;
}

/**
 * Build the ledger for one case.
 * @param {string} caseId  e.g. "a-pulse"
 * @param {object} brief
 */
export function buildLedger(caseId, brief) {
  const P = caseId.toUpperCase();
  const out = [];
  const ent = brief.entity || {};
  const fields = ent.fields || [];
  const variant = plannedVariant(brief);
  const listRoles = renderedRoles(variant);
  const views = brief.views || ['browse'];
  const commit = (brief.actions || []).find(a => a.kind === 'commit');
  const toggle = (brief.actions || []).find(a => a.kind === 'toggle');

  // ---- content: every role must reach the screen ------------------------
  const tableCols = brief.table ? (brief.table.columns || []).map(c => c.field) : null;

  for (const f of fields) {
    if (!CONTENT_ROLES.includes(f.role)) continue;

    // In the list. When the brief declares an explicit table, the brief is
    // choosing which fields the list shows — a field outside those columns is
    // excluded on purpose, and demanding it would be a false positive.
    const excludedByTable = tableCols && tableCols.indexOf(f.id) === -1;
    const inList = listRoles.includes(f.role);
    out.push(req({
      id: `${P}-C-${f.id}-list`,
      category: 'content',
      required: !excludedByTable,
      expectation: excludedByTable
        ? `"${f.label || f.id}" is excluded from the declared table columns (brief choice).`
        : `Every record's "${f.label || f.id}" (${f.role}) is visible in the ${ent.plural || 'records'} list.`,
      satisfiedBy: excludedByTable ? 'brief.table.columns' : (inList ? `entity-collection (${variant} variant)` : null),
      verification: { method: 'dom-text', view: views[0], where: 'list', field: f.id, role: f.role, recordIndex: 0 },
    }));

    // In the detail
    out.push(req({
      id: `${P}-C-${f.id}-detail`,
      category: 'content',
      required: true,
      expectation: `A record's "${f.label || f.id}" (${f.role}) is visible in its detail view.`,
      satisfiedBy: 'record-header / stat-strip / detail-list',
      verification: { method: 'dom-text', view: 'detail', where: 'detail', field: f.id, role: f.role, recordIndex: 0 },
    }));
  }

  // Article body prose, when declared, is content too.
  if (brief.article) {
    out.push(req({
      id: `${P}-C-article-body`,
      category: 'content',
      required: true,
      expectation: 'The article body prose is rendered in the reading view.',
      satisfiedBy: 'article',
      verification: { method: 'dom-text', view: 'detail', where: 'article', field: brief.article.body, role: 'body', recordIndex: 0 },
    }));
  }

  // ---- layout -----------------------------------------------------------
  out.push(req({
    id: `${P}-L-collection`,
    category: 'layout',
    required: true,
    expectation: `The entry view presents all ${(ent.records || []).length} records.`,
    satisfiedBy: 'entity-collection',
    verification: { method: 'dom-count', view: views[0], selector: 'item', expected: (ent.records || []).length },
  }));
  out.push(req({
    id: `${P}-L-detail`,
    category: 'layout',
    required: true,
    expectation: 'A record detail view exists and is reachable.',
    satisfiedBy: 'record-header',
    verification: { method: 'dom-visible', view: 'detail', selector: 'detail-title' },
  }));

  if (brief.aggregates && brief.aggregates.length) {
    out.push(req({
      id: `${P}-L-aggregates`,
      category: 'layout',
      required: true,
      expectation: `A row of ${brief.aggregates.length} aggregate metrics is shown above the collection.`,
      satisfiedBy: 'metric-row',
      verification: { method: 'dom-count', view: views[0], selector: 'metric-tile', expected: brief.aggregates.length },
    }));
  }
  if (brief.ranges && brief.ranges.length) {
    out.push(req({
      id: `${P}-L-ranges`,
      category: 'layout',
      required: true,
      expectation: `A time-range control offering ${brief.ranges.length} ranges.`,
      satisfiedBy: 'range-filter',
      verification: { method: 'dom-count', view: views[0], selector: 'range-chip', expected: brief.ranges.length },
    }));
  }
  if (brief.table) {
    const cols = (brief.table.columns || []).length;
    out.push(req({
      id: `${P}-L-table`,
      category: 'layout',
      required: true,
      expectation: `The collection is presented as a table with ${cols} labelled columns.`,
      satisfiedBy: 'data-table',
      verification: { method: 'dom-count', view: views[0], selector: 'table-head', expected: cols },
    }));
  }
  if (brief.article) {
    out.push(req({
      id: `${P}-L-article`,
      category: 'layout',
      required: true,
      expectation: 'The reading view sets prose in a measured column (45–80 characters).',
      satisfiedBy: 'article',
      verification: { method: 'measure', view: 'detail', selector: 'article-body', min: 45, max: 80 },
    }));
    out.push(req({
      id: `${P}-L-article-standfirst`,
      category: 'layout',
      required: true,
      expectation: 'The standfirst is set larger than the body text.',
      satisfiedBy: 'article',
      verification: { method: 'compare-font', view: 'detail', larger: 'standfirst', smaller: 'article-body' },
    }));
  }
  if (commit && commit.steps && commit.steps.length) {
    out.push(req({
      id: `${P}-L-steps`,
      category: 'layout',
      required: true,
      expectation: `A ${commit.steps.length}-step flow with a visible step indicator.`,
      satisfiedBy: 'step-flow',
      verification: { method: 'dom-count', view: 'detail', selector: 'step', expected: commit.steps.length },
    }));
  }
  if (views.length > 1) {
    out.push(req({
      id: `${P}-L-nav`,
      category: 'layout',
      required: true,
      expectation: `Navigation between ${views.length} top-level destinations.`,
      satisfiedBy: 'tab bar',
      verification: { method: 'dom-count', view: views[0], selector: 'nav-item', expected: views.length },
    }));
  }

  // ---- interaction ------------------------------------------------------
  if (brief.search) {
    out.push(req({
      id: `${P}-I-search`, category: 'interaction', required: true,
      expectation: 'Search narrows the collection to matching records.',
      satisfiedBy: 'search-bar',
      verification: { method: 'interaction', act: 'search', expect: 'narrowed' },
    }));
  }
  for (const f of brief.filters || []) {
    out.push(req({
      id: `${P}-I-facet-${f.id}`, category: 'interaction', required: true,
      expectation: `The "${f.label}" facet filters the collection.`,
      satisfiedBy: 'filter-chips',
      verification: { method: 'interaction', act: 'facet', field: f.id, expect: 'filtered' },
    }));
  }
  if (commit && commit.options) {
    out.push(req({
      id: `${P}-I-choice`, category: 'interaction', required: true,
      expectation: `Choosing a ${commit.options.label || 'option'} is required before committing.`,
      satisfiedBy: 'option-grid',
      verification: { method: 'interaction', act: 'choice', expect: 'required' },
    }));
  }
  if (brief.availability) {
    out.push(req({
      id: `${P}-I-availability`, category: 'interaction', required: true,
      expectation: 'Days and time slots are selectable, and taken slots are not.',
      satisfiedBy: 'availability-picker',
      verification: { method: 'interaction', act: 'availability', expect: 'states' },
    }));
  }
  if (commit && commit.form) {
    out.push(req({
      id: `${P}-I-validate`, category: 'interaction', required: true,
      expectation: 'Invalid input is refused with a visible error and no commit.',
      satisfiedBy: 'form-fields',
      verification: { method: 'interaction', act: 'validate', expect: 'refused' },
    }));
  }
  if (commit) {
    out.push(req({
      id: `${P}-I-commit`, category: 'interaction', required: true,
      expectation: `A valid submission issues a ${commit.result?.referencePrefix || 'REF'}-###### reference.`,
      satisfiedBy: 'primary-action',
      verification: { method: 'interaction', act: 'commit', expect: 'reference' },
    }));
    if (commit.steps && commit.steps.length) {
      out.push(req({
        id: `${P}-I-steps-progress`, category: 'interaction', required: true,
        expectation: 'Next advances and Back returns, preserving entered data.',
        satisfiedBy: 'step-flow',
        verification: { method: 'interaction', act: 'steps', expect: 'progression' },
      }));
    }
  }
  for (const c of brief.collections || []) {
    if (c.cancel) {
      out.push(req({
        id: `${P}-I-cancel-${c.id}`, category: 'interaction', required: true,
        expectation: 'Cancelling requires a confirmation step and then removes the record.',
        satisfiedBy: 'collection-manager',
        verification: { method: 'interaction', act: 'cancel', collection: c.id, expect: 'removed' },
      }));
    }
  }
  if (toggle) {
    out.push(req({
      id: `${P}-I-save`, category: 'interaction', required: true,
      expectation: 'Saving persists across a reload and appears in the saved view.',
      satisfiedBy: 'entity-collection (save toggle)',
      verification: { method: 'interaction', act: 'save', expect: 'persisted' },
    }));
  }

  // ---- navigation -------------------------------------------------------
  for (const v of views) {
    out.push(req({
      id: `${P}-N-view-${v}`, category: 'navigation', required: true,
      expectation: `The "${v}" destination is reachable.`,
      satisfiedBy: 'navigation',
      verification: { method: 'dom-visible', view: v, selector: 'main' },
    }));
  }

  // ---- responsive -------------------------------------------------------
  out.push(req({
    id: `${P}-R-narrow`, category: 'responsive', required: true,
    expectation: 'No horizontal overflow at 390×844.',
    satisfiedBy: 'component CSS',
    verification: { method: 'layout-metric', viewport: { width: 390, height: 844 }, metric: 'no-h-overflow' },
  }));
  out.push(req({
    id: `${P}-R-wide`, category: 'responsive', required: true,
    expectation: 'The interface renders without breakage at 1440×900.',
    satisfiedBy: 'component CSS',
    verification: { method: 'layout-metric', viewport: { width: 1440, height: 900 }, metric: 'renders' },
  }));

  // ---- accessibility ----------------------------------------------------
  out.push(req({
    id: `${P}-A-contrast`, category: 'accessibility', required: true,
    expectation: 'Rendered text meets AA (≥4.5:1) in every measured state.',
    satisfiedBy: 'token gate + component CSS',
    verification: { method: 'axe', rule: 'color-contrast' },
  }));
  out.push(req({
    id: `${P}-A-labels`, category: 'accessibility', required: true,
    expectation: 'Form inputs have associated labels.',
    satisfiedBy: 'form-fields',
    verification: { method: 'axe', rule: 'label' },
  }));
  out.push(req({
    id: `${P}-A-heading`, category: 'accessibility', required: true,
    expectation: 'Each view has exactly one h1.',
    satisfiedBy: 'page-heading / record-header',
    verification: { method: 'axe', rule: 'page-has-heading-one' },
  }));
  out.push(req({
    id: `${P}-A-targets`, category: 'accessibility', required: true,
    expectation: 'Interactive targets are at least 44px tall.',
    satisfiedBy: 'component CSS',
    verification: { method: 'layout-metric', viewport: { width: 390, height: 844 }, metric: 'min-target-44' },
  }));

  return {
    ledgerVersion: LEDGER_VERSION,
    caseId,
    app: brief.brand,
    domain: brief.domain || null,
    variant,
    listRolesRendered: listRoles,
    detailRolesAvailable: Object.keys(COLLECTION_RENDERS).length ? CONTENT_ROLES.slice() : [],
    requirements: out,
  };
}

export function summarise(ledger) {
  const by = {};
  for (const r of ledger.requirements) {
    by[r.category] = by[r.category] || { total: 0, required: 0 };
    by[r.category].total++;
    if (r.required) by[r.category].required++;
  }
  return { total: ledger.requirements.length, byCategory: by };
}
