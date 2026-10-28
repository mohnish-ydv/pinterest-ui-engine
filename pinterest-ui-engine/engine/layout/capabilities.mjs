// capabilities.mjs — what each renderer can actually do.
//
// MISSION 031. The planner could place a field into `entryExtra` and the table
// renderer would silently ignore it: a field planned is not a field rendered.
// This module is the contract that makes the difference checkable before a
// single byte is written.
//
// A capability answers four questions per renderer:
//   regions   which scope regions it can host (item, cell, record, feedback…)
//   roles     which field roles it can draw natively
//   extra     whether it can host a field it has no native slot for
//   repeated  whether it renders one element per record

export const CAPABILITIES = {
  'entity-collection': {
    regions: ['item'],
    repeated: true,
    extra: true,
    variants: {
      row: ['title', 'subtitle', 'meta', 'stat', 'price', 'status', 'badge', 'facet'],
      card: ['title', 'subtitle', 'meta', 'stat', 'price', 'status', 'badge', 'facet'],
      index: ['title', 'subtitle', 'meta', 'standfirst'],
    },
  },
  'data-table': {
    regions: ['cell', 'row'],
    repeated: true,
    // MISSION 031: a table CAN host an extra field — as a derived column. It
    // could not before, and said nothing.
    extra: true,
    extraMechanism: 'derived-column',
    variants: { table: ['cell'] },
  },
  'record-header': { regions: ['record'], repeated: false, extra: false,
    variants: { header: ['title', 'subtitle', 'price', 'status', 'badge', 'media'] } },
  'stat-strip': { regions: ['record'], repeated: false, extra: false,
    variants: { strip: ['stat', 'price', 'meta'] } },
  'detail-list': { regions: ['record'], repeated: false, extra: true,
    variants: { list: ['detail', 'meta', 'price', 'stat', 'status', 'badge', 'body', 'tags'] } },
  'article': { regions: ['record'], repeated: false, extra: false,
    variants: { article: ['body', 'standfirst'] } },
  'metric-row': { regions: ['page'], repeated: false, extra: false, variants: { row: ['aggregate'] } },
  'filter-chips': { regions: ['page'], repeated: false, extra: false, variants: { chips: ['facet'] } },
  'step-flow': { regions: ['record', 'feedback'], repeated: false, extra: false, variants: { flow: ['form'] } },
  'primary-action': { regions: ['page', 'record'], repeated: false, extra: false, variants: { action: ['action'] } },
  'confirmation': { regions: ['feedback'], repeated: false, extra: false, variants: { confirmation: ['reference'] } },
  'availability-picker': { regions: ['record'], repeated: false, extra: false, variants: { picker: ['slot'] } },
  'collection-manager': { regions: ['page'], repeated: true, extra: false, variants: { manager: ['item'] } },
  'status-banner': { regions: ['page'], repeated: false, extra: false, variants: { banner: ['status'] } },
  'search-bar': { regions: ['page'], repeated: false, extra: false, variants: { bar: ['query'] } },
  'page-heading': { regions: ['page'], repeated: false, extra: false, variants: { heading: ['title'] } },
  'app-header': { regions: ['page'], repeated: false, extra: false, variants: { header: ['brand'] } },
  'form-fields': { regions: ['record'], repeated: false, extra: false, variants: { form: ['field'] } },
  'bag-list': { regions: ['page'], repeated: true, extra: false, variants: { list: ['item'] } },
  'bag-totals': { regions: ['page'], repeated: false, extra: false, variants: { totals: ['aggregate'] } },
  'bag-checkout': { regions: ['page'], repeated: false, extra: false, variants: { action: ['action'] } },
  'bag-add': { regions: ['record'], repeated: false, extra: false, variants: { action: ['action'] } },
  'promo-banner': { regions: ['page'], repeated: false, extra: false, variants: { banner: ['status'] } },
  'related-rail': { regions: ['record'], repeated: true, extra: false, variants: { rail: ['item'] } },
  // M046: the Evira families — declared-content renderers. They host no
  // entity fields (their content is the brief's declaration or the
  // record's own variants/reviews), so their role lists are their own.
  'category-medallions': { regions: ['page'], repeated: false, extra: false, variants: { rail: ['facet'] } },
  'variant-selectors': { regions: ['record'], repeated: false, extra: false, variants: { rows: ['variant'] } },
  'reviews': { regions: ['record'], repeated: false, extra: false, variants: { list: ['review'] } },
  'wallet-card': { regions: ['page'], repeated: false, extra: false, variants: { card: ['aggregate'] } },
  'txn-list': { regions: ['page'], repeated: true, extra: false, variants: { list: ['item'] } },
  'profile-sheet': { regions: ['page'], repeated: false, extra: false, variants: { sheet: ['field'] } },
  'faq-list': { regions: ['page'], repeated: false, extra: false, variants: { list: ['item'] } },
  'notice-list': { regions: ['page'], repeated: true, extra: false, variants: { list: ['item'] } },
  // M050: declared chat — its content is the brief's threads plus the
  // user's own on-device messages, never entity fields.
  'chat-threads': { regions: ['page'], repeated: true, extra: false, variants: { list: ['item'] } },
};

/** Does this section render the role natively? */
export function canRenderRole(component, variant, role) {
  const cap = CAPABILITIES[component];
  if (!cap) return false;
  const roles = (cap.variants && (cap.variants[variant] || cap.variants[Object.keys(cap.variants)[0]])) || [];
  return roles.includes(role);
}

/** Can this section host a field it has no native slot for? */
export function canHostExtra(component, variant) {
  const cap = CAPABILITIES[component];
  return !!(cap && cap.extra);
}

/** Can this section render one element per record? */
export function isRepeated(component) {
  const cap = CAPABILITIES[component];
  return !!(cap && cap.repeated);
}

/** Which sections in a view can host a given scope region? */
export function sectionsForRegion(ir, viewId, region) {
  const v = ir.views.find(x => x.id === viewId);
  if (!v) return [];
  return v.sections.filter(s => {
    const cap = CAPABILITIES[s.component];
    return cap && cap.regions.includes(region);
  });
}

export function describe(component, variant) {
  const cap = CAPABILITIES[component];
  if (!cap) return `unknown component "${component}"`;
  const roles = (cap.variants && (cap.variants[variant] || [])) || [];
  return `${component}${variant ? '/' + variant : ''}: regions [${cap.regions.join(', ')}], ` +
    `roles [${roles.join(', ')}], extra ${cap.extra ? 'yes' : 'no'}, repeated ${cap.repeated ? 'yes' : 'no'}`;
}
