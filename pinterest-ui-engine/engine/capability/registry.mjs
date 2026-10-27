// registry.mjs — what the engine can actually express.
//
// MISSION 024. Before this, the engine had no model of its own capability.
// It planned whatever the brief happened to declare and silently produced
// something for everything else. Mission 023's dashboard case is the proof:
// the brief asked for channel performance, the runtime's row variant renders
// only title and subtitle, and revenue/sessions/conversion simply vanished —
// with a green derived test suite and no warning anywhere.
//
// This file is the single source of truth for "can the engine express X".
// Everything downstream reads it: the ledger derives requirements, the
// preflight classifies them, and the semantic validator checks that content
// the registry promised actually reached the screen.
//
// Two rules keep it honest:
//   1. A capability with `component: null` is NOT supported. The engine must
//      report it, never substitute something unrelated.
//   2. `rendersInList` / `rendersInDetail` describe what the component
//      REALLY draws, not what we wish it drew. They are asserted against the
//      runtime in capability.test.mjs.

export const REGISTRY_VERSION = '1.0.0';

// Which field roles each collection variant actually renders.
// This is the table that would have caught Mission 023's F3 at build time.
export const COLLECTION_RENDERS = {
  card: { list: ['title', 'subtitle', 'meta', 'price', 'stat', 'badge', 'status'], detail: null },
  // A reading list carries prose and metadata, not numbers: price and stat have
  // no home here, and the constraint compiler reports that as a conflict rather
  // than letting the numbers disappear.
  index: { list: ['title', 'subtitle', 'meta', 'standfirst'], detail: null },
  // Mission 024 repaired the row variant, which used to draw only title,
  // subtitle and status. The registry records the repair; the semantic
  // validator is what proves the claim against a rendered app.
  row: { list: ['title', 'subtitle', 'meta', 'price', 'stat', 'status'], detail: null },
};

// Roles that must be visible wherever a record appears in a list.
export const CONTENT_ROLES = ['title', 'subtitle', 'price', 'stat', 'meta', 'badge', 'status'];

export const CAPABILITIES = [
  // ---- surfaces the engine really has -----------------------------------
  {
    id: 'collection.list',
    component: 'entity-collection',
    briefPath: 'entity',
    semantics: ['list', 'browse'],
    states: ['populated', 'empty'],
    note: 'Renders records as cards (media entities) or rows (text-led entities).',
  },
  {
    id: 'record.detail',
    component: 'record-header',
    briefPath: 'entity',
    semantics: ['detail'],
    states: ['populated'],
  },
  {
    id: 'control.search',
    component: 'search-bar',
    briefPath: 'search',
    semantics: ['filtering'],
    states: ['idle', 'filtered'],
  },
  {
    id: 'control.facet',
    component: 'filter-chips',
    briefPath: 'filters',
    semantics: ['filtering'],
    states: ['all', 'selected'],
  },
  {
    id: 'control.choice',
    component: 'option-grid',
    briefPath: 'actions.options',
    semantics: ['choice'],
    states: ['unselected', 'selected', 'error'],
  },
  {
    id: 'control.availability',
    component: 'availability-picker',
    briefPath: 'availability',
    semantics: ['date-and-time-selection'],
    states: ['free', 'taken', 'selected', 'disabled', 'error'],
  },
  {
    id: 'form.fields',
    component: 'form-fields',
    briefPath: 'actions.form',
    semantics: ['input', 'validation'],
    states: ['pristine', 'error', 'valid'],
  },
  {
    id: 'action.commit',
    component: 'primary-action',
    briefPath: 'actions',
    semantics: ['commit'],
    states: ['ready', 'submitting'],
  },
  {
    id: 'view.confirmation',
    component: 'confirmation',
    briefPath: 'actions.result',
    semantics: ['confirmation'],
    states: ['issued'],
  },
  {
    id: 'collection.manage',
    component: 'collection-manager',
    briefPath: 'collections',
    semantics: ['committed-records', 'cancellation'],
    states: ['populated', 'empty', 'cancel-armed'],
  },
  {
    id: 'banner.status',
    component: 'status-banner',
    briefPath: 'banners',
    semantics: ['summary'],
    states: ['present', 'hidden'],
  },
  {
    id: 'toggle.save',
    component: 'entity-collection',
    briefPath: 'actions.toggle',
    semantics: ['save'],
    states: ['off', 'on'],
  },
  {
    id: 'collection.bag',
    component: 'bag-list',
    briefPath: 'bag',
    semantics: ['bag', 'cart', 'basket'],
    states: ['empty', 'populated'],
  },
];

// ---------------------------------------------------------------------------
// Capabilities the engine does NOT have. Declaring them here is the point:
// preflight reports them instead of the planner quietly ignoring the key.
// `resolvedBy` names the component that closes the gap once it exists.
// ---------------------------------------------------------------------------
export const UNSUPPORTED = [
  {
    id: 'aggregates',
    briefPath: 'aggregates',
    label: 'KPI / aggregate row',
    limitation: 'No surface can render several metrics side by side, or compute aggregates over a collection.',
    resolvedBy: 'metric-row',
    meaningPreservedByFallback: false,
  },
  {
    id: 'table',
    briefPath: 'table',
    label: 'Dense data table',
    limitation: 'No surface can show more than title, subtitle, meta, price and status per record.',
    resolvedBy: 'data-table',
    meaningPreservedByFallback: false,
  },
  {
    id: 'article',
    briefPath: 'article',
    label: 'Long-form article',
    limitation: 'No surface renders prose with a measured line length, standfirst or byline.',
    resolvedBy: 'article',
    meaningPreservedByFallback: false,
  },
  {
    id: 'ranges',
    briefPath: 'ranges',
    label: 'Time-range control',
    limitation: 'No global time-range control exists. A facet filters records by a field value; a range control needs a date field to filter on, and the data model has no date type.',
    resolvedBy: 'range-filter',
    meaningPreservedByFallback: false,
  },
  {
    id: 'steps',
    briefPath: 'actions.steps',
    label: 'Multi-step flow',
    limitation: 'A commit action is a single form; there is no step progression, indicator or back navigation.',
    resolvedBy: 'step-flow',
    meaningPreservedByFallback: false,
  },
];

// A capability is supported when a component provides it AND that component is
// actually implemented by the runtime. The check is passed in so this module
// stays free of I/O.
export function resolveCapability(id, implementedComponents) {
  const cap = CAPABILITIES.find(c => c.id === id);
  if (cap) {
    const ok = !cap.component || implementedComponents.includes(cap.component);
    return { id, supported: ok, component: cap.component, ...cap };
  }
  const gap = UNSUPPORTED.find(u => u.id === id);
  if (gap) {
    const nowHas = implementedComponents.includes(gap.resolvedBy);
    return { ...gap, supported: nowHas, component: nowHas ? gap.resolvedBy : null };
  }
  return { id, supported: false, component: null, limitation: `unknown capability "${id}"` };
}

// Reads a dotted path out of a brief, returning undefined when absent.
export function briefHas(brief, path) {
  let cur = brief;
  for (const part of path.split('.')) {
    if (cur === null || cur === undefined || typeof cur !== 'object') return undefined;
    cur = cur[part];
  }
  return cur;
}

// The roles a collection will actually draw for a given variant. Used by the
// ledger to decide whether a content requirement is satisfiable.
export function renderedRoles(variant) {
  const r = COLLECTION_RENDERS[variant];
  return r ? r.list.slice() : [];
}
