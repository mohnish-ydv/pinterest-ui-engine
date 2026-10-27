// plan.mjs — layout planner: brief + reference profile -> layout IR.
//
// MISSION 021 built this. MISSION 022 extends it around real interaction
// contracts: availability selection, committed-record collections with
// cancellation, banners, declared state transitions, and explicit test hooks.
//
// The IR is now version 2. Version-1 briefs (StayNest, SwiftGo) still plan
// identically: every new capability is opt-in through new brief keys, and the
// absence of a key means "this app has no such interaction", not "use a
// default". That is what keeps the extension backward compatible.

import { chooseDensity } from './density.mjs';

export const PLANNER_VERSION = '2.1.0';
export const IR_VERSION = 2;

const fieldByRole = (entity, role) => (entity.fields || []).filter(f => f.role === role);
const oneByRole = (entity, role) => fieldByRole(entity, role)[0] || null;
const allFields = (entity) => entity.fields || [];

// ---------------------------------------------------------------------------
// Reference profile -> layout register
// ---------------------------------------------------------------------------

export function densityFromProfile(profile) {
  if (!profile) return { density: 'comfortable', basis: 'no reference profile supplied — default' };
  const m = profile.measured || {};
  const light = m['light_pixel_share_pct'] ?? 50;
  const sat = m['sat_ge_0.25_pct'] ?? 10;
  if (sat >= 25) return { density: 'compact', basis: `saturated share ${sat}% — a colour-committed board reads dense` };
  if (light >= 70 && sat < 8) return { density: 'airy', basis: `light share ${light}%, saturated share ${sat}% — a near-white board reads airy` };
  return { density: 'comfortable', basis: `light share ${light}%, saturated share ${sat}%` };
}

export const DENSITY = {
  compact:     { gap: 12, cardGap: 12, desktopCols: 3, mediaRatio: '4 / 3', sectionGap: 18 },
  comfortable: { gap: 14, cardGap: 14, desktopCols: 2, mediaRatio: '16 / 9', sectionGap: 22 },
  airy:        { gap: 16, cardGap: 16, desktopCols: 2, mediaRatio: '16 / 10', sectionGap: 26 },
};

// ---------------------------------------------------------------------------
// Navigation
// ---------------------------------------------------------------------------

export function planNavigation(brief) {
  // M038: the destination list is every top-level place the app actually
  // has — the browse view, the saved view a toggle action creates, and
  // each collection's view (a commit flow's submissions). Counting only
  // brief.views shipped booking apps as "header-only": derivation lists
  // just the browse view there, so the app had a whole second screen
  // with no way to reach it by tab, unlike every reference app.
  const top = [...(brief.views || ['browse'])];
  if ((brief.actions || []).some(a => a.kind === 'toggle') && !top.includes('saved')) top.push('saved');
  // M039: the bag is a primary destination in a commerce app — the
  // reference carts live in the tab bar, not behind a menu.
  if (brief.bag && !top.includes('bag')) top.push('bag');
  for (const c of brief.collections || []) {
    if (c.view && !top.includes(c.view)) top.push(c.view);
  }
  if (top.length <= 1) {
    return { pattern: 'header-only', items: [], basis: 'one top-level destination — no tab bar needed' };
  }
  const declared = brief.navigation || {};
  const collLabel = (brief.collections || []).find(c => c.view)?.label || '';
  const items = top.map((v, i) => {
    const d = declared[v] || {};
    return {
      id: d.testid || `nav-${v}`,
      // The first destination is the app's home, whatever the view is
      // called; a submissions view borrows its collection's short name.
      label: d.label || (i === 0 ? 'Home'
        : v === 'saved' ? 'Saved'
        : v === 'bag' ? (brief.bag && brief.bag.label) || 'Bag'
        : v === 'submissions' ? (collLabel.replace(/^Your\s+/i, '') || 'Submissions').replace(/^./, ch => ch.toUpperCase())
        : v.charAt(0).toUpperCase() + v.slice(1)),
      view: v,
      icon: d.icon || (i === 0 ? 'home' : v === 'saved' ? 'heart' : v === 'bag' ? 'bag' : v === 'submissions' ? 'clipboard' : 'grid'),
      // data-nav is the documented semantic hook the tab bar exposes; the
      // suite under test addresses `.tabbar [data-nav="home"]`, so it is a
      // contract, not an incidental attribute.
      dataNav: v,
    };
  });
  return { pattern: 'tabbar', items, basis: `${top.length} top-level destinations, mobile-first` };
}

// ---------------------------------------------------------------------------
// View composition
// ---------------------------------------------------------------------------

function collectionTestids(brief, ent) {
  const c = brief.entity.collection || {};
  return {
    testid: c.listTestid || `${ent.id}-list`,
    itemTestid: c.itemTestid || `${ent.id}-card`,
  };
}

// An index shows one prose line per entry. Prefer a field that names itself as
// a standfirst/summary/description; falling back to "the first detail field"
// picked the issue number on H1 and showed "No. 4" where the standfirst belongs.
function pickStandfirst(ent) {
  const text = allFields(ent).filter(f => f.type === 'text' && f.role !== 'title' && f.role !== 'subtitle');
  const named = text.find(f => /standfirst|summary|description|deck|lede|intro/i.test(f.id + ' ' + (f.label || '')));
  if (named) return named.id;
  const body = text.find(f => f.role === 'body');
  if (body) return body.id;
  return (text[0] || {}).id || null;
}

// An explicit prohibition outranks the entity's shape: a product that says
// "not cards, whatever the reference shows" must not get cards because it
// happens to declare media.
function bansCards(brief) {
  const p = (brief.intent && brief.intent.prohibited) || [];
  return p.some(x => /card|grid/i.test(typeof x === 'string' ? x : x.element));
}

function browseSections(brief, ent, d, intent) {
  const ids = collectionTestids(brief, ent);
  const sections = [];
  sections.push({ id: 'header', component: 'app-header', props: { brand: brief.brand, context: brief.location, testid: 'app-header' } });
  // A working surface is headed by the work, not the slogan. On operational
  // compositions (table, dashboard) the heading names the collection the
  // user came to scan; the tagline stays where it belongs — the document
  // title and the brand block. Editorial and gallery surfaces keep the
  // tagline heading: there the voice IS the content's frame.
  const operational = intent && (intent.composition === 'table' || intent.composition === 'dashboard');
  sections.push({
    id: 'heading', component: 'page-heading',
    props: {
      title: operational ? ent.plural : (brief.tagline || brief.brand),
      subtitle: brief.subtitle || `Find your ${ent.label.toLowerCase()}.`,
    },
  });

  if (brief.search) {
    sections.push({
      id: 'search', component: 'search-bar',
      props: { placeholder: brief.search.placeholder || 'Search', testid: brief.search.testid || 'search' },
      binding: { entity: ent.id, fields: brief.search.fields },
    });
  }

  for (const f of (brief.filters || []).slice(0, 2)) {
    const field = allFields(ent).find(x => x.id === f.field);
    sections.push({
      id: `filter-${f.id}`, component: 'filter-chips',
      props: {
        label: f.label,
        testid: f.testid || `filter-${f.id}`,
        allLabel: f.allLabel || 'All',
        // A facet addresses its options through a declared data attribute, so
        // a contract can say data-spec="Dentist" without the engine knowing
        // what a specialty is.
        valueAttr: f.dataAttr || 'data-value',
      },
      binding: { entity: ent.id, filterId: f.id, field: f.field, options: field?.options || [] },
    });
  }

  // M040: a promo the product declares for its home (a special, a
  // featured record) sits between the filters and the collection —
  // where the reference home screens put theirs.
  if (brief.promo && brief.promo.title) {
    sections.push({
      id: 'promo', component: 'promo-banner',
      props: {
        testid: 'promo', title: brief.promo.title, subtitle: brief.promo.subtitle || '',
        image: brief.promo.image || '', recordId: brief.promo.recordId || '', cta: brief.promo.cta || 'Shop now',
      },
      binding: { entity: ent.id },
    });
  }

  // Banners: a committed-record summary surfaced on the entry view.
  for (const b of (brief.banners || [])) {
    sections.push({
      id: `banner-${b.id}`, component: 'status-banner',
      props: { testid: b.testid, label: b.label, emptyHide: b.emptyHide !== false },
      binding: { collection: b.collection, fields: b.fields || [] },
    });
  }

  // An entry action is a create affordance on the collection view.
  if (brief.entryAction) {
    sections.push({
      id: 'entry-action', component: 'primary-action',
      props: { label: brief.entryAction.label, testid: brief.entryAction.testid, action: brief.entryAction.action, act: 'start-create' },
      binding: { entity: ent.id, amountField: null },
    });
  }

  if (brief.aggregates && brief.aggregates.length) {
    sections.push({
      id: 'aggregates', component: 'metric-row',
      props: {
        testid: brief.aggregatesTestid || 'metrics',
        tileTestid: brief.aggregatesTileTestid || 'metric-tile',
        valueTestid: brief.aggregatesValueTestid || 'metric-value',
      },
      binding: { entity: ent.id, aggregates: brief.aggregates },
      states: ['populated'],
    });
  }

  // A declared table supersedes the generic collection: it can show several
  // numbers per record, which the card and row variants cannot.
  // Fields the brief requires in every entry but that the chosen surface does
  // not render natively. The planner introduces a region for them rather than
  // letting them fall to the detail view.
  const entryRequired = allFields(ent).filter(f => f.requiredIn === 'entry').map(f => f.id);
  const variantNow = (intent && intent.composition === 'index') ? 'index'
    : (intent && intent.composition === 'gallery' && !bansCards(brief)) ? 'card'
    : (ent.media && !bansCards(brief) ? 'card' : 'row');
  const NATIVE = {
    row: ['title', 'subtitle', 'meta', 'stat', 'price', 'status', 'badge', 'facet'],
    card: ['title', 'subtitle', 'meta', 'stat', 'price', 'status', 'badge', 'facet'],
    index: ['title', 'subtitle', 'meta', 'standfirst'],
  };
  const nativeRoles = NATIVE[variantNow] || [];
  const entryExtra = allFields(ent)
    .filter(f => entryRequired.includes(f.id) && !nativeRoles.includes(f.role))
    .map(f => f.id);

  if (brief.table) {
    const ids2 = collectionTestids(brief, ent);
    sections.push({
      id: 'collection', component: 'data-table',
      props: { testid: ids2.testid, itemTestid: ids2.itemTestid, label: (brief.entity.label || 'Records') + ' table' },
      entryExtra: entryRequired.filter(id => !(brief.table.columns || []).some(c => c.field === id)),
      // MISSION 031: a field required in every row that the declared columns
      // omit becomes a DERIVED column. The renderer then draws it, instead of
      // the plan claiming a field the table never showed.
      binding: {
        entity: ent.id, source: 'records',
        columns: (brief.table.columns || []).concat(
          allFields(ent)
            .filter(f => (brief._derived && brief._derived.scoped
              ? brief._derived.scoped.requirements.some(r => r.kind === 'field' && r.subject === f.id && r.scope.view === 'entry')
              : f.requiredIn === 'entry')
              && !(brief.table.columns || []).some(c => c.field === f.id))
            .map(f => ({ field: f.id, label: f.label || f.id, derived: true }))),
      },
      controls: ['search', ...(brief.filters || []).map(f => `filter:${f.id}`)],
      states: ['populated', 'empty'],
    });
    return sections;
  }

  const collectionVariant = (intent && intent.composition === 'index') ? 'index'
    : (intent && intent.composition === 'gallery' && !bansCards(brief)) ? 'card'
    : (ent.media && !bansCards(brief) ? 'card' : 'row');
  sections.push({
    id: 'collection', component: 'entity-collection',
    // The composition decides the surface. A gallery is a card grid whether or
    // not the entity declares media; an index is a reading list. Only when no
    // composition is stated does the entity's shape decide.
    variant: collectionVariant,
    props: {
      testid: ids.testid,
      itemTestid: ids.itemTestid,
      // M037: an index is a single reading column at every width — the
      // density policy's column count is for grids and directories, and
      // applying it to a reading list breaks its order and its lead.
      columns: { mobile: 1, desktop: collectionVariant === 'index' ? 1 : d.desktopCols },
      showMedia: (!!ent.media || (intent && intent.composition === 'gallery')) && !(intent && intent.composition === 'index'),
      // A chip stands in for media. With no media in the product it is a
      // decorative substitute for photography that does not exist.
      showChip: !!ent.media,
      entryExtra,
      // MISSION 031: a field the brief keeps OUT of the entry is enforced, not
      // merely detected. The row/card/index skips these roles.
      forbiddenRoles: allFields(ent).filter(f => f.forbiddenIn === 'entry').map(f => f.role),
      showStatus: !!oneByRole(ent, 'status'),
      showSave: !!(brief.actions || []).some(a => a.kind === 'toggle'),
      saveTestid: 'save-toggle',
      openTestid: brief.entity.collection?.openTestid || null,
    },
    binding: {
      entity: ent.id, source: 'records',
      standfirstField: intent && intent.composition === 'index' ? pickStandfirst(ent) : null,
    },
    controls: ['search', ...(brief.filters || []).map(f => `filter:${f.id}`)],
    states: ['populated', 'empty'],
  });
  return sections;
}

function savedSections(brief, ent, d, intent) {
  const ids = collectionTestids(brief, ent);
  return [
    { id: 'header', component: 'app-header', props: { brand: brief.brand, context: brief.location, testid: 'app-header' } },
    { id: 'heading', component: 'page-heading', props: { title: 'Saved', subtitle: `Your shortlisted ${ent.plural.toLowerCase()}.` } },
    {
      id: 'collection', component: 'entity-collection',
      // The composition decides the surface. A gallery is a card grid whether or
    // not the entity declares media; an index is a reading list. Only when no
    // composition is stated does the entity's shape decide.
    variant: intent && intent.composition === 'index' ? 'index'
      : intent && intent.composition === 'gallery' ? 'card'
      : (ent.media ? 'card' : 'row'),
      binding: intent && intent.composition === 'index'
        ? { entity: ent.id, source: 'records',
            standfirstField: (allFields(ent).find(f => f.role === 'detail' && f.type === 'text') || {}).id || null }
        : { entity: ent.id, source: 'records' },
      props: {
        testid: ids.testid, itemTestid: ids.itemTestid,
        columns: { mobile: 1, desktop: intent && intent.composition === 'index' ? 1 : d.desktopCols }, showMedia: !!ent.media,
        showStatus: false, showSave: true, saveTestid: 'save-toggle',
      },
      binding: { entity: ent.id, source: 'saved' },
      states: ['populated', 'empty'],
      emptyMessage: 'Nothing saved yet. Tap the heart on something you like.',
    },
  ];
}

function bagSections(brief, ent) {
  return [
    {
      id: 'header', component: 'app-header',
      props: { brand: brief.brand, context: brief.location, back: false, testid: 'app-header' },
    },
    {
      id: 'heading', component: 'page-heading',
      props: { title: brief.bag.label || 'Bag', subtitle: 'Review what you have added, then check out.' },
    },
    {
      id: 'bag-list', component: 'bag-list',
      props: { testid: 'bag-list', itemTestid: 'bag-item', emptyMessage: 'Your ' + String(brief.bag.label || 'Bag').toLowerCase() + ' is empty.' },
      binding: { entity: ent.id },
      states: ['empty', 'populated'],
    },
    {
      id: 'bag-totals', component: 'bag-totals',
      props: { testid: 'bag-totals', subtotalTestid: 'bag-subtotal', deliveryTestid: 'bag-delivery', totalTestid: 'bag-total' },
      binding: { entity: ent.id },
      states: ['populated'],
    },
    {
      id: 'bag-checkout', component: 'bag-checkout',
      props: { testid: 'checkout-btn', label: 'Checkout' },
      binding: { entity: ent.id },
      states: ['populated'],
    },
  ];
}

function checkoutSections(brief, ent, commitAction) {
  const sections = [
    {
      id: 'header', component: 'app-header',
      props: { brand: brief.brand, context: brief.location, back: true, testid: 'app-header', backTestid: 'back-btn' },
    },
    {
      id: 'heading', component: 'page-heading',
      props: { title: 'Checkout', subtitle: 'A few details and your order is placed.' },
    },
  ];
  if (commitAction.steps && commitAction.steps.length) {
    sections.push({
      id: 'steps', component: 'step-flow',
      props: {
        testid: 'stepflow',
        commitTestid: commitAction.testid || 'primary-action',
        commitLabel: commitAction.label,
      },
      binding: { entity: ent.id, steps: commitAction.steps },
      states: ['current', 'done', 'todo', 'error'],
    });
  } else if (commitAction.form) {
    sections.push({
      id: 'form', component: 'form-fields',
      props: { testid: 'form', submitLabel: commitAction.label },
      binding: { entity: ent.id, fields: commitAction.form },
    });
  }
  return sections;
}

function collectionManagerSections(brief, coll, ent) {
  return [
    {
      id: 'header', component: 'app-header',
      props: { brand: brief.brand, context: brief.location, back: true, testid: 'app-header', backTestid: coll.backTestid || 'back-btn' },
    },
    {
      id: 'manager', component: 'collection-manager',
      props: {
        label: coll.label,
        testid: coll.listTestid || `${coll.id}-list`,
        itemTestid: coll.itemTestid || `${coll.id}-item`,
        cancelTestid: coll.cancel?.testid || 'cancel-btn',
        confirmTestid: coll.cancel?.confirmTestid || 'cancel-confirm',
        confirmLabel: coll.cancel?.confirmLabel || 'Confirm cancel',
        keepLabel: coll.cancel?.keepLabel || 'Keep',
        cancelLabel: coll.cancel?.label || 'Cancel',
      },
      binding: { collection: coll.id, fields: coll.fields || [] },
      states: ['populated', 'empty'],
      emptyMessage: coll.emptyMessage || 'Nothing here yet.',
    },
  ];
}

function detailSections(brief, ent, d, commitAction, intent) {
  const entity = brief.entity;
  const sections = [
    {
      id: 'header', component: 'app-header',
      props: { brand: brief.brand, context: brief.location, back: true, testid: 'app-header', backTestid: brief.entity.backTestid || 'back-btn' },
    },
    {
      id: 'record', component: 'record-header',
      props: {
        showMedia: (!!ent.media || (intent && intent.composition === 'gallery')) && !(intent && intent.composition === 'index'),
      // A chip stands in for media. With no media in the product it is a
      // decorative substitute for photography that does not exist.
      showChip: !!ent.media,
        showStatus: !!oneByRole(ent, 'status'),
        showSave: !!(brief.actions || []).some(a => a.kind === 'toggle'),
        saveTestid: 'save-toggle',
        // A declared class hook, because some contracts address the record
        // title by class rather than by test id. Declared in the brief, not
        // hardcoded in the component.
        titleClass: entity.titleClass || null,
      },
      binding: {
        entity: ent.id,
        title: oneByRole(ent, 'title')?.id, subtitle: oneByRole(ent, 'subtitle')?.id,
        price: oneByRole(ent, 'price')?.id, status: oneByRole(ent, 'status')?.id,
        media: oneByRole(ent, 'media')?.id,
      },
    },
  ];

  const stats = fieldByRole(ent, 'stat');
  if (stats.length) {
    sections.push({ id: 'stats', component: 'stat-strip', props: { testid: 'stat-strip' }, binding: { entity: ent.id, fields: stats.map(f => f.id) } });
  }

  if (brief.article) {
    sections.push({
      id: 'article', component: 'article',
      props: { testid: 'article' },
      binding: {
        entity: ent.id,
        article: { body: brief.article.body, standfirst: brief.article.standfirst, byline: brief.article.byline },
      },
      states: ['populated'],
    });
  }

  const detailFields = brief.article ? [] : allFields(ent).filter(f => ['detail', 'meta', 'tags', 'body'].includes(f.role));
  // A second money field has no header slot — the header carries the
  // primary price — but it still belongs on the record's view (a fee cap,
  // a deposit, a balance). Without this, such a field rendered nowhere at
  // all while role-based checks reported its role as covered.
  if (!brief.article) {
    const headerPrice = oneByRole(ent, 'price');
    for (const f of allFields(ent)) {
      if (f.role === 'price' && headerPrice && f.id !== headerPrice.id && !detailFields.includes(f)) detailFields.push(f);
    }
  }
  if (detailFields.length) {
    sections.push({ id: 'details', component: 'detail-list', props: { testid: 'detail-list' }, binding: { entity: ent.id, fields: detailFields.map(f => f.id) } });
  }

  // Availability supersedes a static option list when the brief declares one:
  // it has days, per-slot states and a taken rule, which an option grid cannot
  // express.
  if (commitAction && brief.availability) {
    const av = brief.availability;
    sections.push({
      id: 'availability', component: 'availability-picker',
      props: {
        label: av.label || 'Choose a time',
        dayTestid: av.dayTestid || 'day-chip',
        slotTestid: av.slotTestid || 'slot',
        dayAttr: av.dayAttr || 'data-day',
        slotAttr: av.slotAttr || 'data-slot',
        errorTestid: av.errorTestid || 'error-slot',
        required: av.required !== false,
      },
      binding: { entity: ent.id, availability: av },
      states: ['free', 'taken', 'selected', 'disabled'],
    });
  } else if (commitAction && commitAction.options) {
    sections.push({
      id: 'options', component: 'option-grid',
      props: { label: commitAction.options.label, testid: `option-${commitAction.options.id}`, required: !!commitAction.options.required },
      binding: { entity: ent.id, field: commitAction.options.id, options: commitAction.options.values },
    });
  }

  // M039: in a bag app the record page sells, it does not check out —
  // the flow lives on the checkout view off the bag. The record gets an
  // add-to-bag section instead of the step flow.
  if (brief.bag && commitAction) {
    sections.push({
      id: 'bag-add', component: 'bag-add',
      props: { testid: 'add-to-bag', label: `Add to ${String(brief.bag.label || 'bag').toLowerCase()}` },
      binding: { entity: ent.id },
    });
    return sections;
  }

  if (commitAction && commitAction.steps && commitAction.steps.length) {
    sections.push({
      id: 'steps', component: 'step-flow',
      props: {
        testid: 'stepflow',
        commitTestid: commitAction.testid || 'primary-action',
        commitLabel: commitAction.label,
      },
      binding: { entity: ent.id, steps: commitAction.steps },
      states: ['current', 'done', 'todo', 'error'],
    });
    return sections;
  }

  if (commitAction && commitAction.form) {
    sections.push({
      id: 'form', component: 'form-fields',
      props: { testid: 'form', submitLabel: commitAction.label },
      binding: { entity: ent.id, fields: commitAction.form },
    });
  }

  if (commitAction) {
    sections.push({
      id: 'cta', component: 'primary-action',
      props: {
        label: commitAction.label,
        testid: commitAction.testid || 'primary-action',
        action: commitAction.id,
        showAmount: !!commitAction.result?.amountFrom,
      },
      binding: { entity: ent.id, amountField: commitAction.result?.amountFrom || oneByRole(ent, 'price')?.id || null },
    });
  }
  return sections;
}

function confirmationSections(brief, ent, commitAction) {
  const r = commitAction?.result || {};
  return [{
    id: 'confirm', component: 'confirmation',
    props: {
      title: r.title || 'Done',
      testid: r.referenceTestid || 'confirm-ref',
      summaryTestid: r.summaryTestid || 'confirm-summary',
      referenceLabel: r.referenceLabel || 'Reference',
      continueTo: r.continueTo || null,
      continueLabel: r.continueLabel || null,
    },
    binding: { entity: ent.id, referencePrefix: r.referencePrefix || 'REF' },
  }];
}

// ---------------------------------------------------------------------------
// State transitions
// ---------------------------------------------------------------------------

function buildTransitions(brief, commitAction, entryView) {
  const t = [
    { id: 'browse-to-detail', from: entryView, to: 'detail', trigger: 'open', preconditions: ['recordExists'] },
    { id: 'detail-to-browse', from: 'detail', to: entryView, trigger: 'back' },
  ];
  if ((brief.actions || []).some(a => a.kind === 'toggle')) {
    t.push({ id: 'toggle-save', from: 'detail', trigger: 'toggle', collection: 'saved', persists: true });
  }
  if (commitAction) {
    t.push({
      id: 'commit',
      from: 'detail', to: 'confirmation', trigger: commitAction.id,
      creates: commitAction.result?.collection || 'commits',
      preconditions: ['formValid', brief.availability ? 'availabilitySelected' : 'optionSelected'],
      persists: true,
    });
  }
  for (const c of (brief.collections || [])) {
    if (c.cancel) {
      t.push({
        id: `cancel-${c.id}`, from: c.view || c.id, trigger: 'cancel',
        deletes: c.id, requiresConfirmation: true,
        preconditions: ['itemExists'],
        restores: 'frees the slot or resource the record held',
      });
    }
  }
  return t;
}

// ---------------------------------------------------------------------------
// Public: plan a whole app
// ---------------------------------------------------------------------------

export function planApp(brief, profile, opts) {
  const intent = (opts && opts.intent) || null;
  const ent = brief.entity;
  if (!ent) throw new Error('plan: brief.entity is required — the planner cannot infer a data model from prose');
  if (!allFields(ent).length) throw new Error('plan: brief.entity.fields is required');

  const dInfo = densityFromProfile(profile);
  // MISSION 035: the reference informs density, but the policy has the final
  // say because it also knows the composition and the content. The profile's
  // verdict is kept as evidence rather than discarded.
  const policy = chooseDensity(brief, { viewportWidth: 390 });
  const d = DENSITY[policy.mode === 'compact' ? 'compact' : policy.mode === 'spacious' ? 'airy' : 'comfortable'];
  const nav = planNavigation(brief);
  const commitAction = (brief.actions || []).find(a => a.kind === 'commit') || null;

  const views = [
    { id: brief.views?.[0] || 'browse', purpose: 'browse', title: brief.tagline || brief.brand, sections: browseSections(brief, ent, d, intent) },
  ];
  // M038: a toggle (save) action makes the saved collection a real
  // destination whether or not the brief bothered to list it as a view —
  // the navigation counts it, so the view must exist.
  if ((brief.views || []).includes('saved') || (brief.actions || []).some(a => a.kind === 'toggle')) {
    views.push({ id: 'saved', purpose: 'collection', title: 'Saved', sections: savedSections(brief, ent, d, intent) });
  }
  // M039: the bag and its checkout — a tab destination and the flow
  // that completes the journey (items → details → review → confirmed).
  if (brief.bag && commitAction) {
    views.push({ id: 'bag', purpose: 'collection', title: brief.bag.label || 'Bag', sections: bagSections(brief, ent) });
    views.push({ id: 'checkout', purpose: 'form', title: 'Checkout', hidden: true, sections: checkoutSections(brief, ent, commitAction) });
  }
  for (const coll of (brief.collections || [])) {
    const sections = collectionManagerSections(brief, coll, ent);
    // M038: when the app navigates by tab bar, a collection view is a
    // tab root — reference apps do not put a back chevron on tab roots.
    if (nav.pattern === 'tabbar') {
      const hdr = sections.find(s => s.component === 'app-header');
      if (hdr) hdr.props.back = false;
    }
    views.push({
      id: coll.view || coll.id,
      purpose: 'collection',
      title: coll.label,
      sections,
    });
  }
  const detailSecs = detailSections(brief, ent, d, commitAction, intent);
  // M040: a record page in a collection product ends with its relatives
  // — same facet value first — the "You may also like" rail every
  // commerce reference shows. Only when there are records to relate.
  const facetField = (brief.entity.fields || []).find(f => f.role === 'facet' || f.type === 'enum');
  if ((brief.entity.records || []).length > 2) {
    detailSecs.push({
      id: 'related', component: 'related-rail',
      props: { testid: 'related-list', itemTestid: 'related-item', title: 'You may also like' },
      binding: { entity: ent.id, field: facetField ? facetField.id : null },
    });
  }
  views.push({ id: 'detail', purpose: 'record', title: ent.label, sections: detailSecs, hidden: true });
  if (commitAction) {
    views.push({ id: 'confirmation', purpose: 'confirmation', title: 'Confirmed', sections: confirmationSections(brief, ent, commitAction), hidden: true });
  }

  // Every major planning decision, with the evidence it rests on. Mission 024
  // recorded density and navigation; the rest was implicit in the section
  // list. An inspector should be able to ask "why a table?" and get an answer.
  const decisions = [];
  const decide = (id, value, basis, source) => decisions.push({ id, value, basis, source });
  decide('density', dInfo.density, dInfo.basis, 'reference');
  decide('navigation', nav.pattern, nav.basis, 'rule');
  if (intent && intent.composition) decide('composition', intent.composition,
    intent.source === 'stated' ? 'declared in design-spec.intent' : 'compiled from design-spec prose',
    intent.source === 'stated' ? 'brief' : 'reference');
  decide('collectionVariant', intent && intent.composition === 'index' ? 'index' : (ent.media ? 'card' : 'row'),
    ent.media ? 'the entity declares media, so records lead with an image' : 'no media role, so records are text-led', 'brief');
  decide('desktopColumns', String(d.desktopCols), `density "${dInfo.density}" sets ${d.desktopCols} columns`, 'rule');
  if (brief.table) decide('collectionSurface', 'data-table', `${(brief.table.columns || []).length} declared table columns cannot be shown as a list`, 'brief');
  else decide('collectionSurface', 'entity-collection', 'no table declared', 'brief');
  if (brief.aggregates && brief.aggregates.length) decide('aggregates', 'metric-row', `${brief.aggregates.length} declared aggregates shown above the collection`, 'brief');
  if (brief.article) decide('recordBody', 'article', 'an article is declared, so prose replaces the label/value list', 'brief');
  if (commitAction && commitAction.steps && commitAction.steps.length) decide('commitShape', 'step-flow', `${commitAction.steps.length} declared steps replace a single form`, 'brief');
  else if (commitAction) decide('commitShape', 'form+primary-action', 'a single-step commit is declared', 'brief');
  if (brief.availability) decide('timeSelection', 'availability-picker', 'availability is declared with days and slots', 'brief');
  else if (commitAction && commitAction.options) decide('timeSelection', 'option-grid', 'a static option list is declared', 'brief');
  if (brief.ranges && brief.ranges.length) decide('rangeControl', 'declared', `${brief.ranges.length} ranges declared`, 'brief');
  decide('sectionOrder', views[0].sections.map(s2 => s2.component).join(' -> '),
    'entry view reads header, heading, search, facets, aggregates, collection — broad to narrow', 'rule');

  const ir = {
    irVersion: IR_VERSION,
    meta: {
      plannerVersion: PLANNER_VERSION,
      app: brief.brand,
      domain: brief.domain || 'generic',
      family: brief.family || null,
      density: policy.mode,
      densityBasis: policy.rationale.join('; ') || dInfo.basis,
      referenceDensity: dInfo.density,
      generatedFrom: ['brief.json', profile ? 'reference-profile.json' : '(no profile)'],
    },
    entity: {
      id: ent.id, label: ent.label, plural: ent.plural || ent.label + 's',
      media: !!ent.media, fields: allFields(ent),
      titleClass: ent.titleClass || null,
    },
    search: brief.search || null,
    filters: brief.filters || [],
    availability: brief.availability || null,
    actions: brief.actions || [],
    collections: brief.collections || [],
    banners: brief.banners || [],
    navigation: nav,
    views,
    transitions: buildTransitions(brief, commitAction, views[0].id),
    decisions,
    a11y: {
      landmarks: ['banner', 'main', 'navigation'],
      headingLevels: 'one h1 per view; sections use h2',
      minTargetPx: 44,
      keyboard: brief.a11y?.keyboard || ['Enter activates the focused control', 'Tab order follows reading order', 'disabled controls are not focusable'],
    },
  };

  validateIR(ir, brief);
  return ir;
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

const COMPONENT_PROPS = {
  'app-header': ['brand'],
  'page-heading': ['title'],
  'search-bar': ['placeholder'],
  'filter-chips': ['label'],
  'entity-collection': ['testid', 'itemTestid'],
  'record-header': [],
  'stat-strip': [],
  'detail-list': [],
  'option-grid': ['label'],
  'availability-picker': ['label', 'dayTestid', 'slotTestid'],
  'form-fields': [],
  'primary-action': ['label'],
  'confirmation': ['title'],
  'collection-manager': ['label', 'itemTestid'],
  'status-banner': ['testid'],
  'metric-row': ['testid'],
  'data-table': ['testid', 'itemTestid'],
  'article': ['testid'],
  'step-flow': ['testid', 'commitTestid'],
  'bag-list': ['testid', 'itemTestid'],
  'bag-totals': ['testid'],
  'bag-checkout': ['testid'],
  'bag-add': ['testid'],
  'promo-banner': ['testid', 'title'],
  'related-rail': ['testid', 'itemTestid'],
};

export function validateIR(ir, brief) {
  const errors = [];
  const viewIds = new Set(ir.views.map(v => v.id));

  for (const v of ir.views) {
    if (!v.sections.length) errors.push(`view "${v.id}" has no sections`);
    for (const s of v.sections) {
      const need = COMPONENT_PROPS[s.component];
      if (!need) { errors.push(`view "${v.id}" section "${s.id}": unknown component "${s.component}"`); continue; }
      for (const p of need) {
        if (s.props?.[p] === undefined) errors.push(`view "${v.id}" section "${s.id}": component "${s.component}" missing prop "${p}"`);
      }
    }
  }
  for (const it of ir.navigation.items) {
    if (!viewIds.has(it.view)) errors.push(`navigation item "${it.id}" targets unknown view "${it.view}"`);
  }
  for (const t of ir.transitions) {
    if (t.from && !viewIds.has(t.from)) errors.push(`transition "${t.id}" starts in unknown view "${t.from}"`);
    if (t.to && !viewIds.has(t.to)) errors.push(`transition "${t.id}" ends in unknown view "${t.to}"`);
  }

  // A declared availability rule must be executable, not aspirational.
  if (ir.availability) {
    const av = ir.availability;
    if (!Array.isArray(av.slots) || !av.slots.length) errors.push('availability.slots must be a non-empty array');
    if (!(av.days >= 1)) errors.push('availability.days must be >= 1');
    if (av.rule && av.rule.kind === 'modulo') {
      if (!(av.rule.modulus > 0)) errors.push('availability.rule.modulus must be > 0');
      if (!Array.isArray(av.rule.inputs) || !av.rule.inputs.length) errors.push('availability.rule.inputs must list recordIndex/dayIndex/slotIndex');
      for (const inp of av.rule.inputs) {
        if (!['recordIndex', 'dayIndex', 'slotIndex'].includes(inp)) errors.push(`availability.rule.inputs: unsupported input "${inp}"`);
      }
    } else if (av.rule && av.rule.kind !== 'none') {
      errors.push(`availability.rule.kind "${av.rule.kind}" is not implemented (use "modulo" or "none")`);
    }
  }

  // Every testid the brief's functional contract promises must be emitted by
  // some section — including the ones the runtime derives.
  const promised = brief.functionalContract?.testids || [];
  if (promised.length) {
    const emitted = new Set();
    const collect = (o) => {
      if (!o || typeof o !== 'object') return;
      for (const [k, v] of Object.entries(o)) {
        if (typeof v === 'string' && /testid$/i.test(k)) emitted.add(v);
        else collect(v);
      }
    };
    collect(ir);
    ['detail-title', 'confirm-ref', 'empty-state', 'search-btn', 'metric-tile', 'metric-value',
     'table-head', 'article-body', 'standfirst', 'step', 'step-next', 'step-back'].forEach(t => emitted.add(t));
    ir.navigation.items.forEach(it => emitted.add(it.id));
    for (const v of ir.views) {
      for (const s2 of v.sections) {
        if (s2.component === 'form-fields') {
          for (const f of s2.binding.fields || []) {
            emitted.add(f.testid || ('field-' + f.id));
            emitted.add(f.errorTestid || ('error-' + f.id));
          }
        }
        if (s2.component === 'record-header' && s2.binding.price) emitted.add('detail-price');
      }
    }
    const missing = promised.filter(t => !emitted.has(t));
    if (missing.length) errors.push(`functionalContract promises testids the layout never emits: ${missing.join(', ')}`);
  }

  if (errors.length) throw new Error('plan: invalid layout IR\n  - ' + errors.join('\n  - '));
  return true;
}
