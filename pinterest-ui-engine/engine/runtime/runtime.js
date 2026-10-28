// runtime.js — the generic app runtime. Copied verbatim into every generated app.
//
// MISSION 021 built this. MISSION 022 extends it with real interaction
// contracts: availability selection (days + slots with free/taken/selected
// states), committed-record collections with confirmed cancellation, banners,
// and validation that reads the live DOM.
//
// It still contains no app name, entity name, field name or colour. Every
// behaviour below is driven by the layout IR and the data model.
//
// Design decisions worth stating:
//
//  * ONE VIEW IS IN THE DOM AT A TIME, so a testid can be reused across views
//    without ambiguity.
//  * ALL INTERACTION IS DELEGATED through data-act, so re-rendering never
//    loses a handler.
//  * VALIDATION READS THE DOM, not an internal mirror. A form field set
//    programmatically (as an automated suite does) must validate the same way
//    a typed one does; reading only from an input-event cache silently ignores
//    it.
//  * AVAILABILITY IS DATA. A slot is taken when the brief's declared rule
//    says so, or when a committed record blocks it. No clinic knowledge lives
//    here.
(function () {
  'use strict';

  var APP = window.__APP__;
  if (!APP || !APP.layout || !APP.model) {
    document.body.innerHTML = '<p style="padding:24px;font-family:sans-serif">' +
      'This app was not built correctly: data.js did not load.</p>';
    return;
  }
  var layout = APP.layout;
  var model = APP.model;

  // ---------------------------------------------------------------- helpers
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function money(n) {
    var v = Number(n);
    if (!isFinite(v)) return String(n == null ? '' : n);
    return (model.app.currency || '') + v.toLocaleString('en-IN');
  }

  var FIELDS = {};
  model.entity.fields.forEach(function (f) { FIELDS[f.id] = f; });
  function byRole(role) { return model.entity.fields.filter(function (f) { return f.role === role; })[0] || null; }
  function byRoleAll(role) { return model.entity.fields.filter(function (f) { return f.role === role; }); }

  var titleF = byRole('title');
  var subF = byRole('subtitle');
  var priceF = byRole('price');
  var badgeF = byRole('badge');
  var statusF = byRole('status');
  var metaFs = byRoleAll('meta');
  var statFs = byRoleAll('stat');

  function fmt(field, rec) {
    // A quantity with a unit must never render as the bare number: "2 kg" is
    // the fact, "2" is a rounding error in the reader's head.
    if (field && field.unitField && rec && rec[field.unitField]) {
      var base = fmt0(field, rec);
      return base ? base + ' ' + String(rec[field.unitField]) : base;
    }
    return fmt0(field, rec);
  }

  // A status value is a state, and a state must be visible as one: in a
  // dense table "Low" and "Out" rendered as bare text identical to "OK"
  // hides the only signal the reader is scanning for. The tone is a
  // small general lexicon of state words, not product vocabulary.
  function statusTone(v) {
    var s = String(v == null ? '' : v).toLowerCase();
    if (/^(out|failed|error|overdue|blocked|expired|cancelled|rejected)/.test(s)) return 'bad';
    if (/^(low|pending|partial|due|waiting|draft|held|in progress)/.test(s)) return 'warn';
    if (/^(ok|good|active|available|in stock|paid|complete|completed|done|scheduled|ready|open)/.test(s)) return 'ok';
    return 'neutral';
  }

  function fmt0(field, rec) {
    if (!field) return '';
    var v = rec ? rec[field.id] : null;
    if (v === null || v === undefined || v === '') return '';
    switch (field.type) {
      case 'money': return money(v) + (field.suffix || '');
      case 'number': {
        // MISSION 035: group digits for counts and quantities, never for
        // identifiers or years. Grouping is a semantic decision, so it is made
        // from the field's own declaration rather than from the value.
        var looksLikeId = /\b(year|code|ref|reference|id|phone|pin|version|no)\b/i.test(
          String(field.id || '') + ' ' + String(field.label || ''));
        var shown = (typeof v === 'number' && Number.isFinite(v) && !looksLikeId && Math.abs(v) >= 1000)
          ? v.toLocaleString('en-IN') : String(v);
        return shown + (field.suffix || '');
      }
      case 'rating': return '\u2605 ' + Number(v).toFixed(1);
      case 'bool': return v ? (field.trueLabel || 'Yes') : '';
      case 'list': return Array.isArray(v) ? v.join(' \u00b7 ') : String(v);
      default: return String(v);
    }
  }
  function initials(s) {
    var words = String(s || '').trim().split(/\s+/).filter(function (w) { return /^[A-Za-z]/.test(w); });
    if (!words.length) return String(s || '?').charAt(0).toUpperCase();
    return words.slice(0, 2).map(function (w) { return w.charAt(0).toUpperCase(); }).join('');
  }
  function hashOf(str) {
    var h = 2166136261;
    for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return Math.abs(h);
  }

  // ------------------------------------------------------------ persistence
  var KEY = model.persistence.key;
  var PERSIST = model.persistence.collections;
  var store = loadStore();

  function loadStore() {
    var empty = { saved: [], collections: {}, bag: {}, wallet: null, authed: false, seenIntro: false, myReviews: {}, profile: {} };
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return empty;
      var p = JSON.parse(raw);
      if (!p || typeof p !== 'object') return empty;
      return {
        saved: Array.isArray(p.saved) ? p.saved : [],
        collections: p.collections && typeof p.collections === 'object' ? p.collections : {},
        bag: p.bag && typeof p.bag === 'object' ? p.bag : {},
        // M046: the declared families keep their own local state under
        // the same key — a topped-up balance, a finished onboarding, a
        // review the user wrote, a settings toggle they flipped.
        wallet: p.wallet && typeof p.wallet === 'object' ? p.wallet : null,
        authed: !!p.authed,
        seenIntro: !!p.seenIntro,
        myReviews: p.myReviews && typeof p.myReviews === 'object' ? p.myReviews : {},
        profile: p.profile && typeof p.profile === 'object' ? p.profile : {},
      };
    } catch (e) { return empty; }
  }
  function saveStore() {
    try {
      var out = { collections: {} };
      if (PERSIST.indexOf('saved') !== -1) out.saved = store.saved;
      PERSIST.forEach(function (c) { if (c !== 'saved') out.collections[c] = store.collections[c] || []; });
      // M039: the bag persists like everything else — leave the app,
      // come back, your items are still there.
      if (model.bag) out.bag = store.bag || {};
      if (model.wallet) out.wallet = store.wallet;
      if (model.auth) out.authed = !!store.authed;
      if (model.onboarding) out.seenIntro = !!store.seenIntro;
      out.myReviews = store.myReviews || {};
      out.profile = store.profile || {};
      localStorage.setItem(KEY, JSON.stringify(out));
    } catch (e) { /* private mode: the app still works, it just forgets */ }
  }
  function isSaved(id) { return store.saved.indexOf(id) !== -1; }
  function collectionItems(id) { return (store.collections[id] || []).slice(); }

  // ------------------------------------------------------------- the bag
  // M046: a bag line is a record, or a record in a chosen variant.
  // The key carries the variant signature ('id::Size=M|Colour=Red');
  // the plain id remains the key when no variant was chosen, so every
  // pre-M046 saved bag still reads correctly.
  function bagKey(id, sig) { return sig ? id + '::' + sig : id; }
  function parseBagKey(k) {
    var i = k.indexOf('::');
    if (i === -1) return { id: k, sig: '' };
    return { id: k.slice(0, i), sig: k.slice(i + 2) };
  }
  function sigLabel(sig) {
    return sig ? sig.split('|').map(function (p) { return p.split('=').slice(1).join('='); }).join(' \u00b7 ') : '';
  }
  function bagQtyKey(k) { return (store.bag && store.bag[k]) || 0; }
  function bagQty(id) {
    // A card or tab badge counts the record, across all its variants.
    var n = 0;
    Object.keys(store.bag || {}).forEach(function (k) { if (parseBagKey(k).id === id) n += store.bag[k]; });
    return n;
  }
  function variantSig(rec) {
    if (!rec || !Array.isArray(rec.variants)) return '';
    return rec.variants.map(function (v) {
      var sel = (S.variantSel[rec.id] || {})[v.label];
      return v.label + '=' + (sel != null ? sel : (v.options || [])[0]);
    }).join('|');
  }
  // M045: how many of a record the bag may hold. A brief can declare
  // its items unique (classifieds listings, one-off pieces); a record
  // can also carry a numeric stock field. Everything else is uncapped.
  function bagCap(rec) {
    if (model.bag && model.bag.unique) return 1;
    var st = rec ? rec.stock : null;
    return (typeof st === 'number' && st > 0) ? Math.floor(st) : Infinity;
  }
  function recById(id) {
    return (model.records || []).filter(function (r) { return r.id === id; })[0] || null;
  }
  function bagEntries() {
    if (!model.bag) return [];
    return Object.keys(store.bag || {}).map(function (k) {
      var p = parseBagKey(k);
      return { key: k, sig: p.sig, rec: model.records.filter(function (r) { return r.id === p.id; })[0], qty: store.bag[k] };
    }).filter(function (e) { return e.rec && e.qty > 0; });
  }
  function bagCount() {
    return bagEntries().reduce(function (n, e) { return n + e.qty; }, 0);
  }
  function bagTotals() {
    var priceId = model.bag && model.bag.priceField;
    var sub = bagEntries().reduce(function (acc, e) {
      return acc + ((Number(e.rec[priceId]) || 0) * e.qty);
    }, 0);
    var fee = model.bag && typeof model.bag.deliveryFee === 'number' ? model.bag.deliveryFee : 0;
    var free = !!(model.bag && typeof model.bag.freeAbove === 'number' && sub >= model.bag.freeAbove);
    var delivery = sub === 0 ? 0 : (free ? 0 : fee);
    return { subtotal: sub, delivery: delivery, total: sub + delivery, free: free };
  }

  // ---------------------------------------------------------------- state
  var S = {
    view: (layout.views[0] && layout.views[0].id) || 'browse',
    query: '',
    filters: {},
    selectedId: null,
    form: {},
    errors: {},
    options: {},
    day: 0,
    slot: null,
    confirmCancel: null,
    confirmation: null,
    step: 0,
    creating: false,
    // M046 state: variant choices per record, the open sheet (filter /
    // remove / topup), advanced browse filters, hero position, the
    // expanded receipt, the open FAQ row, the auth mode, the intro
    // step, the top-up amount being keyed, the review being written.
    variantSel: {},
    sheet: null,
    sheetKey: null,
    filtersX: { minPrice: null, maxPrice: null, sort: '', minRating: null },
    heroIdx: {},
    receiptFor: null,
    faqOpen: -1,
    authMode: 'in',
    introStep: 0,
    topupAmt: '',
    reviewStars: 0,
  };
  (model.filters || []).forEach(function (f) { S.filters[f.id] = 'All'; });
  (model.actions || []).forEach(function (a) { if (a.options) S.options[a.options.id] = null; });

  function currentView() {
    return layout.views.filter(function (v) { return v.id === S.view; })[0] || layout.views[0];
  }
  function sectionOf(component) {
    var v = currentView();
    return v ? v.sections.filter(function (s) { return s.component === component; })[0] || null : null;
  }
  function commitAction() {
    return (model.actions || []).filter(function (a) { return a.kind === 'commit'; })[0] || null;
  }
  function selectedRecord() {
    return model.records.filter(function (r) { return r.id === S.selectedId; })[0] || null;
  }

  // ------------------------------------------------------------- filtering
  function visibleRecords() {
    var out = model.records.slice();
    var col = sectionOf('entity-collection');
    var source = col && col.binding && col.binding.source;
    if (source === 'saved') out = out.filter(function (r) { return isSaved(r.id); });

    var q = S.query.trim().toLowerCase();
    if (q && model.search && model.search.fields) {
      out = out.filter(function (r) {
        return model.search.fields.some(function (f) {
          return String(r[f] == null ? '' : r[f]).toLowerCase().indexOf(q) !== -1;
        });
      });
    }
    (model.filters || []).forEach(function (f) {
      var v = S.filters[f.id];
      if (v && v !== 'All') out = out.filter(function (r) { return String(r[f.field]) === v; });
    });
    // M046: the filter sheet's terms — a price span, a rating floor,
    // an ordering. All optional; an untouched sheet changes nothing.
    var fx = S.filtersX;
    if (priceF && (fx.minPrice != null || fx.maxPrice != null)) {
      out = out.filter(function (r) {
        var p = Number(r[priceF.id]);
        if (!isFinite(p)) return false;
        if (fx.minPrice != null && p < fx.minPrice) return false;
        if (fx.maxPrice != null && p > fx.maxPrice) return false;
        return true;
      });
    }
    var ratingF = ((model.entity && model.entity.fields) || []).filter(function (f) { return f.type === 'rating'; })[0];
    if (ratingF && fx.minRating != null) {
      out = out.filter(function (r) { return Number(r[ratingF.id]) >= fx.minRating; });
    }
    if (fx.sort && priceF) {
      out = out.slice().sort(function (a, b) {
        return fx.sort === 'price-asc' ? Number(a[priceF.id]) - Number(b[priceF.id])
          : fx.sort === 'price-desc' ? Number(b[priceF.id]) - Number(a[priceF.id]) : 0;
      });
    } else if (fx.sort === 'rating' && ratingF) {
      out = out.slice().sort(function (a, b) { return Number(b[ratingF.id]) - Number(a[ratingF.id]); });
    }
    return out;
  }

  // ---------------------------------------------------------- availability
  function dayList(av) {
    var out = [];
    var base = new Date();
    var n = (av && av.days) || 1;
    for (var i = 0; i < n; i++) {
      var d = new Date(base.getTime() + i * 86400000);
      var wd = d.toLocaleDateString('en-IN', { weekday: 'short' });
      out.push({
        weekday: wd,
        dayNum: String(d.getDate()),
        label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : wd + ' ' + d.getDate(),
        iso: d.toISOString().slice(0, 10),
      });
    }
    return out;
  }

  // A slot's state comes from two places, in order: the brief's declared
  // rule, then any committed record that blocks it. Neither is domain
  // knowledge; both are data.
  function slotStates(rec, av) {
    var ri = model.records.map(function (r) { return r.id; }).indexOf(rec ? rec.id : null);
    if (ri < 0) ri = 0;
    var blocked = av.blockOn ? collectionItems(av.blockOn).filter(function (b) {
      return b.id === (rec && rec.id) && Number(b.day) === S.day;
    }) : [];
    return (av.slots || []).map(function (sl, si) {
      var taken = false;
      var rule = av.rule || { kind: 'none' };
      if (rule.kind === 'modulo') {
        var sum = 0;
        (rule.inputs || []).forEach(function (inp) {
          if (inp === 'recordIndex') sum += ri;
          else if (inp === 'dayIndex') sum += S.day;
          else sum += si;
        });
        taken = (sum % rule.modulus) === (rule.remainder || 0);
      }
      if (!taken && blocked.some(function (b) { return b.slot === sl; })) taken = true;
      return { slot: sl, state: taken ? 'taken' : (S.slot === sl ? 'selected' : 'free') };
    });
  }

  // ------------------------------------------------------------ components
  var R = {};

  R['app-header'] = function (s) {
    // M046: the reference home opens with a person, not a logo block —
    // avatar, greeting, and two outline circle buttons (notices, profile).
    if (s.props.variant === 'greeting') {
      var nm = s.props.profileName || model.app.brand;
      return '<div class="wrap hdr-in greet">' +
        '<button class="greet-av" data-act="nav" data-view="profile" aria-label="Profile">' + esc(initials(nm)) + '</button>' +
        '<span class="greet-txt"><span class="greet-hi">Good day</span>' +
        '<span class="greet-name">' + esc(nm) + '</span></span>' +
        (model.notices ? '<button class="circ-btn" data-act="nav" data-view="notices" data-testid="notices-btn" aria-label="Notifications"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6"/><path d="M10 19a2 2 0 0 0 4 0"/></svg></button>' : '') +
        (model.wallet ? '<button class="circ-btn" data-act="nav" data-view="wallet" data-testid="wallet-btn" aria-label="Wallet"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><rect x="3" y="6" width="18" height="13" rx="3"/><path d="M3 10h18"/></svg></button>' : '') +
        '</div>';
    }
    return '<div class="wrap hdr-in">' +
      (s.props.back
        ? '<button class="back-btn" data-act="back" data-testid="' + esc(s.props.backTestid || 'back-btn') + '" aria-label="Back">\u2190</button>'
        : '<span class="brand-mark" aria-hidden="true">' + esc(initials(model.app.brand)) + '</span>') +
      '<span class="brand-name">' + esc(model.app.brand) + '</span>' +
      (s.props.context ? '<span class="hdr-ctx">' + esc(s.props.context) + '</span>' : '') +
      '</div>';
  };

  R['page-heading'] = function (s) {
    return '<div class="wrap">' +
      '<h1 class="page-title">' + esc(s.props.title) + '</h1>' +
      (s.props.subtitle ? '<p class="page-sub">' + esc(s.props.subtitle) + '</p>' : '') +
      '</div>';
  };

  R['search-bar'] = function (s) {
    var t = s.props.testid || 'search';
    return '<div class="wrap"><div class="search-row">' +
      '<label class="search"><span class="vh">Search</span>' +
      '<svg class="search-ic" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.8-3.8"/></svg>' +
      '<input type="search" data-act="search-input" data-testid="' + esc(t) + '" value="' + esc(S.query) + '" placeholder="' + esc(s.props.placeholder) + '">' +
      '</label>' +
      // M046: the board's search pill carries its filter entry inside
      // the pill's row — a sliders button that opens the filter sheet.
      (currentView().sections.some(function (x) { return x.component === 'filter-chips' || x.component === 'category-medallions'; })
        ? '<button class="filter-btn" data-act="sheet-filter" data-testid="filter-btn" aria-label="Sort and filter"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2.2"/><circle cx="10" cy="17" r="2.2"/></svg></button>'
        : '') +
      '</div></div>';
  };

  R['filter-chips'] = function (s) {
    // M043: consecutive facet groups share ONE row (the composer folds
    // them into the first section's `groups`). Facets are tools, not
    // sections: two stacked chip rows pushed the product grid below the
    // fold on every multi-facet browse screen.
    var groups = s.groups || [s];
    var parts = groups.map(function (g) {
      var opts = [g.props.allLabel || 'All'].concat(g.binding.options || []);
      var fid = g.binding.filterId || g.binding.field;
      var active = S.filters[fid] || (g.props.allLabel || 'All');
      var attr = g.props.valueAttr || 'data-value';
      return opts.map(function (o) {
        var on = o === active;
        return '<button class="chip' + (on ? ' chip-on' : '') + '" data-act="filter" data-filter="' + esc(fid) + '"' +
          ' ' + attr + '="' + esc(o) + '" data-field="' + esc(fid) + '" data-testid="' + esc(g.props.testid) + '" aria-pressed="' + on + '">' + esc(o) + '</button>';
      }).join('');
    });
    return '<div class="wrap"><div class="chips" role="group" aria-label="' + esc(s.props.label) + '">' +
      parts.join('<span class="chip-sep" aria-hidden="true"></span>') +
      '</div></div>';
  };

  var MEDIA = model.media || { baseHue: 243, spread: 0, sat: 28, light: 87 };
  function mediaBlock(rec, cls) {
    var seed = String(rec.id || '');
    var span = MEDIA.spread * 2 + 1;
    var hsh = hashOf(seed);
    var hue = ((MEDIA.baseHue + (hsh % span) - MEDIA.spread) + 360) % 360;
    var light = MEDIA.light + ((hsh >> 8) % 3) * 3 - 3;
    var label = titleF ? rec[titleF.id] : rec.id;
    // M040: when the record carries a real image (the brief supplies
    // photography the way real product data does), render it — the
    // gradient + initials remain underneath as the honest fallback if
    // the file is missing. Without an image the block stays a declared
    // substitution, marked so it cannot pass as photography.
    var img = rec.image
      ? '<img class="media-img" src="' + esc(rec.image) + '" alt="" loading="lazy" onerror="this.remove()">'
      : '';
    return '<span class="' + cls + '"' + (rec.image ? '' : ' data-substitute="true"') +
      ' style="--media-hue:' + hue + ';--media-sat:' + MEDIA.sat +
      '%;--media-light:' + light + '%" aria-hidden="true">' +
      '<span class="media-mark">' + esc(initials(label)) + '</span>' + img + '</span>';
  }

  R['entity-collection'] = function (s) {
    // MISSION 032: roles are resolved PER SECTION, not once at module load.
    // A brief that keeps a field out of the entry names a section-level
    // prohibition; applying it globally would also remove the field from the
    // detail view, which the brief permits.
    var _ban = (s.props && s.props.forbiddenRoles) || [];
    var _ok = function (role) { return _ban.indexOf(role) === -1; };
    var sTitleF = _ok('title') ? titleF : null;
    var sSubF = _ok('subtitle') ? subF : null;
    var sPriceF = _ok('price') ? priceF : null;
    var sBadgeF = _ok('badge') ? badgeF : null;
    var sStatusF = _ok('status') ? statusF : null;
    var sMetaFs = _ok('meta') ? metaFs : [];
    var sStatFs = _ok('stat') ? statFs : [];
    var sMedia = _ok('media');
    var recs = visibleRecords();
    var variant = s.variant || 'row';
    if (!recs.length) {
      // M046: a failed search gets the board's treatment — line art, a
      // headline, one sentence — not a bare apology in a dashed box.
      var searching = !!S.query.trim();
      return '<div class="wrap"><div class="empty' + (searching ? ' is-notfound' : '') + '" data-testid="empty-state">' +
        (searching
          ? '<svg class="empty-art" width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" aria-hidden="true"><rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4a3 3 0 0 1 6 0"/><path d="M9 11h6M9 14.5h4"/></svg>' +
            '<p class="empty-h">Not Found</p>'
          : '') +
        '<p>' + esc(s.emptyMessage || 'Nothing here yet.') + '</p>' +
        (S.query || (model.filters || []).some(function (f) { return S.filters[f.id] !== 'All'; })
          ? '<button class="btn-quiet" data-act="reset">Clear filters</button>' : '') +
        '</div></div>';
    }
    var inner = recs.map(function (rec) {
      var saved = isSaved(rec.id);
      var badge = sBadgeF && rec[sBadgeF.id] ? '<span class="badge">' + esc(fmt(sBadgeF, rec)) + '</span>' : '';
      var status = sStatusF && rec[sStatusF.id] ? '<span class="pill">' + esc(fmt(sStatusF, rec)) + '</span>' : '';
      // A typographic index: no card chrome, no media, no initials. The
      // composition exists because a spec asked for it and the planner had no
      // way to honour the request.
      if (variant === 'index') {
        var sff = s.binding && s.binding.standfirstField
          ? (FIELDS[s.binding.standfirstField] || null) : null;
        var standfirst = sff && rec[sff.id] ? '<p class="idx-standfirst">' + esc(fmt(sff, rec)) + '</p>' : '';
        var metaLine = [sSubF ? fmt(sSubF, rec) : ''].concat(
          sMetaFs.map(function (f) { return fmt(f, rec); })).filter(Boolean).join(' \u00b7 ');
        var idxExtra = (s.props.entryExtra || []).map(function (id2) { var f2 = FIELDS[id2]; return f2 && rec[id2] != null ? fmt(f2, rec) : ''; }).filter(Boolean).join(' \u00b7 ');
        return '<div class="idx-row' + (rec === recs[0] ? ' idx-lead' : '') + '" data-act="open" data-id="' + esc(rec.id) + '" data-testid="' + esc(s.props.itemTestid) + '">' +
          '<h2 class="idx-title" data-field="' + esc(sTitleF.id) + '" data-record="' + esc(rec.id) + '">' + esc(fmt(sTitleF, rec)) + '</h2>' +
          standfirst +
          (metaLine ? '<p class="idx-meta">' + esc(metaLine) + '</p>' : '') +
          (idxExtra ? '<p class="idx-extra" data-testid="entry-extra">' + esc(idxExtra) + '</p>' : '') +
        '</div>';
      }
      if (variant === 'card') {
        // M045: the card's two-fact budget is spent deliberately —
        // the first facet (what it is) and the first statistic (how
        // good / how much signal) outrank everything else; any
        // remaining slot backfills in priority order.
        var _present = function (f) { return rec[f.id] != null && String(rec[f.id]) !== ''; };
        var _facetFs = byRoleAll('facet').filter(_present);
        var _ordered = _facetFs.concat(sStatFs.filter(_present)).concat(sMetaFs.filter(_present)).concat(sSubF && _present(sSubF) ? [sSubF] : []);
        var _picks = [];
        if (_facetFs.length) _picks.push(_facetFs[0]);
        if (sStatFs.filter(_present).length) _picks.push(sStatFs.filter(_present)[0]);
        for (var _i = 0; _i < _ordered.length && _picks.length < 2; _i++) {
          if (_picks.indexOf(_ordered[_i]) === -1) _picks.push(_ordered[_i]);
        }
        var _metaHtml = _picks.length
          ? '<span class="card-meta">' + _picks.map(function (f) { return esc(fmt(f, rec)).replace(/ /g, '\u00a0'); }).filter(Boolean).join(' \u00b7 ') + '</span>'
          : '';
        return '<article class="card">' +
          '<button class="card-open" data-act="open" data-id="' + esc(rec.id) + '" data-testid="' + esc(s.props.itemTestid) + '">' +
            (s.props.showMedia ? mediaBlock(rec, 'card-media') : '') +
            '<span class="card-body">' +
              '<span class="card-top"><span class="card-title" data-field="' + esc(sTitleF.id) + '" data-record="' + esc(rec.id) + '">' + esc(fmt(sTitleF, rec)) + '</span>' + badge + '</span>' +
              _metaHtml +
              ((s.props.entryExtra || []).length ? '<span class="card-extra">' + (s.props.entryExtra || []).map(function (id2) { var f2 = FIELDS[id2]; return f2 && rec[id2] != null ? esc(fmt(f2, rec)) : ''; }).filter(Boolean).join(' \u00b7 ') + '</span>' : '') +
              (sPriceF ? '<span class="card-price" data-field="' + esc(sPriceF.id) + '" data-record="' + esc(rec.id) + '">' + esc(fmt(sPriceF, rec)) + '</span>' : '') +
            '</span>' +
          '</button>' +
          (s.props.showSave
            ? '<button class="save-btn' + (saved ? ' is-on' : '') + '" data-act="toggle" data-id="' + esc(rec.id) + '"' +
              ' data-testid="' + esc(s.props.saveTestid || 'save-toggle') + '" aria-pressed="' + saved + '"' +
              ' aria-label="' + (saved ? 'Remove from saved' : 'Save') + '">' + (saved ? '\u2665' : '\u2661') + '</button>'
            : '') +
          // M039: the compact add button the commerce boards put on
          // every card — a round brand button at the card's foot; it
          // carries the in-bag quantity once the item is added.
          (model.bag
            ? (bagQty(rec.id)
              ? '<span class="card-add is-stepper">' +
                '<button class="ca-btn" data-act="bag-dec" data-id="' + esc(rec.id) + '" aria-label="Remove one">\u2212</button>' +
                '<span class="ca-qty">' + bagQty(rec.id) + '</span>' +
                (bagQty(rec.id) < bagCap(rec) ? '<button class="ca-btn" data-act="add" data-id="' + esc(rec.id) + '" data-testid="add-btn" aria-label="Add one more">+</button>' : '') +
                '</span>'
              : '<button class="card-add" data-act="add" data-id="' + esc(rec.id) + '"' +
                ' data-testid="add-btn" aria-label="Add ' + esc(fmt(sTitleF, rec)) + ' to ' + esc(String(model.bag.label || 'bag').toLowerCase()) + '">+</button>')
            : '') +
          '</article>';
      }
      // MISSION 024: a row used to render only title, subtitle and status, so
      // price, statistic and metadata fields vanished from every text-led list.
      // Mission 023 caught it as a content failure on two cases; the preflight
      // now refuses to build until it is fixed. Figures are given their own
      // column so the value is legible rather than buried in the subtitle.
      // A field can be both a filter facet and something the row should show —
      // "whether it is free" is filterable AND required on the row.
      var facetFs = byRoleAll('facet').filter(function (f) { return rec[f.id] != null && String(rec[f.id]) !== ''; });
      // Fields the brief requires in every entry, even when the surface has no
      // native slot for their role. Introduced as a region rather than dropped.
      var extraFs = (s.props.entryExtra || []).map(function (id) { return FIELDS[id]; })
        .filter(function (f) { return f && rec[f.id] != null && String(rec[f.id]) !== ''; });
      var rowMeta = sMetaFs.concat(facetFs).map(function (f) { var t = fmt(f, rec); return t ? '<span data-field="' + esc(f.id) + '" data-record="' + esc(rec.id) + '">' + esc(t) + '</span>' : ''; }).filter(Boolean).join(' \u00b7 ');
      var extraLine = extraFs.map(function (f) {
        var t = fmt(f, rec); return t ? '<span data-field="' + esc(f.id) + '" data-record="' + esc(rec.id) + '">' + esc(t) + '</span>' : '';
      }).filter(Boolean).join(' \u00b7 ');
      var rowStats = sStatFs.map(function (f) { var t = fmt(f, rec); return t ? '<span data-field="' + esc(f.id) + '" data-record="' + esc(rec.id) + '">' + esc(t) + '</span>' : ''; }).filter(Boolean).join(' \u00b7 ');
      var figures = (sPriceF && fmt(sPriceF, rec)) || rowStats
        ? '<span class="row-figures">' +
            (sPriceF && fmt(sPriceF, rec) ? '<span class="row-price" data-field="' + esc(sPriceF.id) + '" data-record="' + esc(rec.id) + '">' + esc(fmt(sPriceF, rec)) + '</span>' : '') +
            (rowStats ? '<span class="row-stats">' + rowStats + '</span>' : '') +
          '</span>'
        : '';
      return '<article class="row">' +
        '<button class="row-open" data-act="open" data-id="' + esc(rec.id) + '" data-testid="' + esc(s.props.itemTestid) + '">' +
          (s.props.showChip === false ? '' :
            '<span class="row-chip" aria-hidden="true">' + esc(initials(fmt(sTitleF, rec))) + '</span>') +
          '<span class="row-main"><span class="row-title" data-field="' + esc(sTitleF.id) + '" data-record="' + esc(rec.id) + '">' + esc(fmt(sTitleF, rec)) + '</span>' +
          (sSubF ? '<span class="row-sub" data-field="' + esc(sSubF.id) + '" data-record="' + esc(rec.id) + '">' + esc(fmt(sSubF, rec)) + '</span>' : '') +
          (rowMeta ? '<span class="row-meta">' + rowMeta + '</span>' : '') +
          (extraLine ? '<span class="row-extra" data-testid="entry-extra">' + extraLine + '</span>' : '') + '</span>' +
          figures + status +
          '<span class="row-chev"' + (s.props.openTestid ? ' data-testid="' + esc(s.props.openTestid) + '"' : '') + ' aria-hidden="true">\u203a</span>' +
        '</button>' +
        '</article>';
    }).join('');
    var resultsLine = (S.query.trim() && variant === 'card')
      ? '<p class="results-line" data-testid="results-count">Results for \u201c' + esc(S.query.trim()) + '\u201d \u00b7 ' + recs.length + ' found</p>'
      : '';
    return '<div class="wrap">' + resultsLine + '<div class="collection ' + (variant === 'card' ? 'is-cards' : 'is-rows') + '"' +
      ' data-testid="' + esc(s.props.testid) + '" data-cols-mobile="' + (s.props.columns ? s.props.columns.mobile : 1) + '"' +
      ' data-cols-desktop="' + (s.props.columns ? s.props.columns.desktop : 2) + '">' + inner + '</div></div>';
  };

  R['record-header'] = function (s) {
    var rec = selectedRecord();
    if (!rec) return '';
    var saved = isSaved(rec.id);
    var titleCls = 'rec-title' + (s.props.titleClass ? ' ' + s.props.titleClass : '');
    var saveBtn = s.props.showSave
      ? '<button class="save-btn' + (s.props.showMedia ? '' : ' wide') + (saved ? ' is-on' : '') + '" data-act="toggle" data-id="' + esc(rec.id) + '"' +
        ' data-testid="' + esc(s.props.saveTestid || 'save-toggle') + '" aria-pressed="' + saved + '" aria-label="' + (saved ? 'Remove from saved' : 'Save') + '">' +
        (saved ? '\u2665' : '\u2661') + (s.props.showMedia ? '' : (saved ? ' Saved' : ' Save')) + '</button>'
      : '';
    var hero = mediaBlock(rec, 'rec-media');
    if (s.props.showMedia && Array.isArray(rec.images) && rec.images.length > 1) {
      var hi = Math.min(S.heroIdx[rec.id] || 0, rec.images.length - 1);
      hero = '<span class="rec-media" aria-hidden="true"><img class="media-img" src="' + esc(rec.images[hi]) + '" alt="" onerror="this.remove()"></span>' +
        '<button class="hero-nav hero-prev" data-act="hero-prev" aria-label="Previous photo">\u2039</button>' +
        '<button class="hero-nav hero-next" data-act="hero-next" aria-label="Next photo">\u203a</button>' +
        '<span class="hero-dots">' + rec.images.map(function (_, i) {
          return '<button class="hero-dot' + (i === hi ? ' is-on' : '') + '" data-act="hero-dot" data-i="' + i + '" aria-label="Photo ' + (i + 1) + '"></button>';
        }).join('') + '</span>';
    }
    return '<div class="wrap">' +
      (s.props.showMedia ? '<div class="rec-media-wrap">' + hero + saveBtn + '</div>' : '') +
      '<div class="rec-head">' +
        '<h1 class="' + esc(titleCls) + '" data-testid="detail-title" data-field="' + esc(titleF.id) + '" data-record="' + esc(rec.id) + '">' + esc(fmt(titleF, rec)) + '</h1>' +
        (badgeF && rec[badgeF.id] ? '<p class="rec-badges"><span class="badge">' + esc(fmt(badgeF, rec)) + '</span></p>' : '') +
        (subF ? '<p class="rec-sub" data-field="' + esc(subF.id) + '" data-record="' + esc(rec.id) + '">' + esc(fmt(subF, rec)) + '</p>' : '') +
        (metaFs.length ? '<p class="rec-meta">' + metaFs.map(function (f) { return esc(fmt(f, rec)); }).filter(Boolean).join(' \u00b7 ') + '</p>' : '') +
        (priceF ? '<p class="rec-price" data-testid="detail-price" data-field="' + esc(priceF.id) + '" data-record="' + esc(rec.id) + '">' + esc(fmt(priceF, rec)) + '</p>' : '') +
        (statusF && rec[statusF.id] ? '<p><span class="pill">' + esc(fmt(statusF, rec)) + '</span></p>' : '') +
      '</div>' +
      (s.props.showMedia ? '' : saveBtn) +
      '</div>';
  };

  R['stat-strip'] = function (s) {
    var rec = selectedRecord();
    if (!rec) return '';
    var items = (s.binding.fields || []).map(function (id) {
      var f = FIELDS[id];
      return '<span><strong data-field="' + esc(f.id) + '" data-record="' + esc(rec.id) + '">' + esc(fmt(f, rec)) + '</strong><small>' + esc(f.label || f.id) + '</small></span>';
    }).join('');
    return '<div class="wrap"><div class="stats" data-testid="' + esc(s.props.testid) + '">' + items + '</div></div>';
  };

  R['detail-list'] = function (s) {
    var rec = selectedRecord();
    if (!rec) return '';
    var rows = (s.binding.fields || []).map(function (id) {
      var f = FIELDS[id];
      var v = fmt(f, rec);
      if (!v) return '';
      // A long prose value is not a label/value pair; right-aligning it reads
      // badly. Prose fields stack instead.
      if (String(v).length > 48) {
        return '<div class="dl-row is-stacked"><span class="dl-label">' + esc(f.label || f.id) + '</span>' +
          '<span class="dl-prose">' + esc(v) + '</span></div>';
      }
      return '<div class="dl-row"><span class="dl-label">' + esc(f.label || f.id) + '</span>' +
        '<span class="dl-value" data-field="' + esc(f.id) + '" data-record="' + esc(rec.id) + '">' + esc(v) + '</span></div>';
    }).join('');
    if (!rows) return '';
    return '<div class="wrap"><div class="dl" data-testid="' + esc(s.props.testid) + '">' + rows + '</div></div>';
  };

  R['option-grid'] = function (s) {
    var id = s.binding.field;
    var cur = S.options[id];
    var err = S.errors[id];
    return '<div class="wrap"><h2 class="sect-title">' + esc(s.props.label) + '</h2>' +
      '<div class="options" role="group" aria-label="' + esc(s.props.label) + '"' +
      (err ? ' aria-describedby="e-' + esc(id) + '"' : '') + '>' +
      (s.binding.options || []).map(function (o) {
        var on = o === cur;
        return '<button class="option' + (on ? ' option-on' : '') + '" data-act="option" data-option="' + esc(id) + '"' +
          ' data-value="' + esc(o) + '" data-testid="' + esc(s.props.testid) + '" aria-pressed="' + on + '"' +
          ' aria-invalid="' + (err ? 'true' : 'false') + '">' + esc(o) + '</button>';
      }).join('') + '</div>' +
      '<p class="err" id="e-' + esc(id) + '" data-testid="error-' + esc(id) + '"' + (err ? '' : ' hidden') + '>' + esc(err || '') + '</p>' +
      '</div>';
  };

  // Availability: a day strip plus a slot grid whose states come from the
  // brief's rule and from committed records. Taken slots are disabled and not
  // focusable; the selected slot is aria-pressed.
  R['availability-picker'] = function (s) {
    var rec = selectedRecord();
    if (!rec) return '';
    var av = s.binding.availability || {};
    var days = dayList(av);
    var states = slotStates(rec, av);
    var err = S.errors['__availability'];
    var dayAttr = s.props.dayAttr || 'data-day';
    var slotAttr = s.props.slotAttr || 'data-slot';
    return '<div class="wrap">' +
      '<h2 class="sect-title">' + esc(s.props.label) + '</h2>' +
      '<div class="daystrip" role="group" aria-label="Day">' +
        days.map(function (d, i) {
          var on = i === S.day;
          return '<button class="day' + (on ? ' day-on' : '') + '" data-act="day" ' + dayAttr + '="' + i + '"' +
            ' data-testid="' + esc(s.props.dayTestid) + '" aria-pressed="' + on + '">' +
            '<span class="day-w">' + esc(d.weekday) + '</span><span class="day-n">' + esc(d.dayNum) + '</span></button>';
        }).join('') +
      '</div>' +
      '<div class="slots" role="group" aria-label="Time"' + (err ? ' aria-describedby="e-availability"' : '') + '>' +
        states.map(function (x) {
          var taken = x.state === 'taken';
          return '<button class="slot slot-' + x.state + '" data-act="slot" ' + slotAttr + '="' + esc(x.slot) + '"' +
            ' data-state="' + x.state + '" data-testid="' + esc(s.props.slotTestid) + '"' +
            (taken ? ' disabled aria-disabled="true"' : '') +
            ' aria-pressed="' + (x.state === 'selected') + '">' + esc(x.slot) + '</button>';
        }).join('') +
      '</div>' +
      '<p class="err" id="e-availability" data-testid="' + esc(s.props.errorTestid) + '"' + (err ? '' : ' hidden') + '>' + esc(err || '') + '</p>' +
      '</div>';
  };

  function fieldInputId(f) { return 'f-' + f.id; }

  // M046: a choice field renders the way the boards render every choice
  // — a row with a medallion, a name, a caption, a price, and a radio
  // that fills when chosen. A <select> is a desktop habit.
  function radioRows(f, etid) {
    var cur = S.form[f.id] || '';
    var err = S.errors[f.id];
    return '<div class="field"><span class="field-label">' + esc(f.label) + '</span>' +
      '<div class="radio-rows" role="radiogroup" aria-label="' + esc(f.label) + '">' +
      (f.options || []).map(function (o) {
        var opt = typeof o === 'string' ? { label: o, value: o } : o;
        var on = String(opt.value) === String(cur);
        return '<button class="radio-row' + (on ? ' is-on' : '') + '" data-act="radio" data-field="' + esc(f.id) + '"' +
          ' data-value="' + esc(opt.value) + '" data-testid="radio-' + esc(f.id) + '" role="radio" aria-checked="' + on + '">' +
          '<span class="radio-med" aria-hidden="true">' + esc(initials(opt.label)) + '</span>' +
          '<span class="radio-main"><span class="radio-name">' + esc(opt.label) + '</span>' +
          (opt.caption ? '<span class="radio-cap">' + esc(opt.caption) + '</span>' : '') + '</span>' +
          (opt.price != null ? '<span class="radio-price">' + esc(money(opt.price)) + '</span>' : '') +
          '<span class="radio-dot" aria-hidden="true"></span></button>';
      }).join('') + '</div>' +
      '<p class="err" data-testid="' + esc(etid) + '"' + (err ? '' : ' hidden') + '>' + esc(err || '') + '</p></div>';
  }

  R['form-fields'] = function (s) {
    return '<div class="wrap"><div class="form" data-testid="' + esc(s.props.testid) + '">' +
      (s.binding.fields || []).map(function (f) {
        if (f.options) return radioRows(f, f.errorTestid || ('error-' + f.id));
        var err = S.errors[f.id];
        var tid = f.testid || ('field-' + f.id);
        var etid = f.errorTestid || ('error-' + f.id);
        return '<div class="field">' +
          '<label for="' + esc(fieldInputId(f)) + '">' + esc(f.label) + '</label>' +
          '<input id="' + esc(fieldInputId(f)) + '" data-act="field" data-field="' + esc(f.id) + '" data-testid="' + esc(tid) + '"' +
          ' type="' + esc(f.type === 'tel' ? 'tel' : f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : 'text') + '"' + (f.type === 'tel' || f.type === 'number' ? ' inputmode="numeric"' : '') +
          ' value="' + esc(S.form[f.id] || '') + '"' + (f.placeholder ? ' placeholder="' + esc(f.placeholder) + '"' : '') +
          ' aria-invalid="' + (err ? 'true' : 'false') + '"' + (err ? ' aria-describedby="e-' + esc(f.id) + '"' : '') +
          (f.required ? ' required' : '') + '>' +
          '<p class="err" id="e-' + esc(f.id) + '" data-testid="' + esc(etid) + '"' + (err ? '' : ' hidden') + '>' + esc(err || '') + '</p>' +
          '</div>';
      }).join('') + '</div></div>';
  };

  R['primary-action'] = function (s) {
    var rec = selectedRecord();
    var amount = '';
    if (s.props.showAmount && rec && s.binding.amountField) {
      amount = ' \u00b7 ' + fmt(FIELDS[s.binding.amountField], rec);
    }
    // An entry action opens the record view in create mode rather than
    // committing an existing record.
    var act = s.props.act === 'start-create' ? 'start-create' : 'commit';
    return '<div class="wrap"><button class="cta" data-act="' + act + '" data-testid="' + esc(s.props.testid) + '">' +
      esc(s.props.label) + esc(amount) + '</button></div>';
  };

  // Committed records, each with a cancel action that requires an explicit
  // confirmation step. Cancelling removes the record, which is what frees the
  // resource it held (a slot, a seat, a room).
  R['collection-manager'] = function (s) {
    var items = collectionItems(s.binding.collection);
    if (!items.length) {
      return '<div class="wrap"><h1 class="page-title">' + esc(s.props.label) + '</h1>' +
        '<div class="empty" data-testid="empty-state">' +
        (model.bag ? '<svg class="empty-art" width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5.5 8h13l-1 12.5h-11L5.5 8Z"/><path d="M9 10.5V6.5a3 3 0 0 1 6 0v4"/></svg>' : '') +
        '<p>' + esc(s.emptyMessage || 'Nothing here yet.') + '</p></div></div>';
    }
    return '<div class="wrap"><h1 class="page-title">' + esc(s.props.label) + '</h1>' +
      '<div class="cm-list" data-testid="' + esc(s.props.testid) + '">' +
      items.map(function (it) {
        var confirming = S.confirmCancel === it.ref;
        var rows = (s.binding.fields || []).map(function (fid) {
          // M045: the reference already heads the item (cm-head); a
          // "ref" row under it only says the same thing twice.
          if (fid === 'ref') return '';
          var label = (model.fieldLabels || {})[fid] || fid;
          var val = it[fid];
          if (fid === 'slot' && it.dayLabel) val = it.dayLabel + ' \u00b7 ' + it.slot;
          if (fid === 'id') val = (model.records.filter(function (r) { return r.id === it.id; })[0] || {})[titleF ? titleF.id : 'id'] || it.id;
          if (val === undefined || val === null || val === '') return '';
          return '<div class="dl-row"><span class="dl-label">' + esc(label) + '</span><span class="dl-value">' + esc(val) + '</span></div>';
        }).join('');
        // M040: a placed order has a lifecycle. The timeline shows it
        // honestly — the order exists, so "Placed" is done (with its
        // date); the kitchen and delivery stages are what's next.
        var stages = ['Placed', 'Preparing', 'On the way', 'Delivered'];
        var stageIcons = ['<path d="M5.5 8h13l-1 12.5h-11L5.5 8Z"/><path d="M9 10V6.5a3 3 0 0 1 6 0V10"/>',
          '<path d="M4 8.5 12 4l8 4.5v7L12 20l-8-4.5v-7Z"/><path d="M4 8.5 12 13l8-4.5M12 13v7"/>',
          '<path d="M3 7h11v9H3zM14 10h4l3 3v3h-7z"/><circle cx="7" cy="18" r="1.8"/><circle cx="17" cy="18" r="1.8"/>',
          '<path d="m5 12.5 4.5 4.5L19 7.5"/>'];
        var tracker = model.bag
          ? '<div class="tracker" data-testid="order-tracker" aria-hidden="true">' + stages.map(function (lb, i) {
              return '<span class="tracker-step' + (i === 0 ? ' is-done' : '') + '"><span class="tracker-ic"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + stageIcons[i] + '</svg></span><span class="tracker-lb">' + lb + '</span></span>' +
                (i < stages.length - 1 ? '<span class="tracker-line' + (i === 0 ? ' is-done' : '') + '"></span>' : '');
            }).join('') + '</div>'
          : '';
        var receipt = '';
        if (model.bag && S.receiptFor === it.ref) {
          var bars = '';
          var seedStr = String(it.ref || '');
          for (var bi = 0; bi < 56; bi++) {
            var bc = seedStr.charCodeAt(bi % seedStr.length);
            bars += '<span style="width:' + (1 + (bc % 3)) + 'px"></span><span class="gap" style="width:' + (1 + (bc % 2)) + 'px"></span>';
          }
          var rrows = ['items', 'delivery', 'total', 'at'].map(function (fid) {
            var v = it[fid];
            if (v === undefined || v === null || v === '') return '';
            var lab = (model.fieldLabels || {})[fid] || fid;
            return '<div class="dl-row"><span class="dl-label">' + esc(lab) + '</span><span class="dl-value">' + esc(v) + '</span></div>';
          }).join('');
          receipt = '<div class="receipt" data-testid="receipt">' +
            '<div class="barcode" aria-hidden="true">' + bars + '</div>' +
            '<div class="dl">' + rrows + '</div>' +
            '<p class="receipt-status"><span class="pill">Placed</span></p></div>';
        }
        var receiptBtn = model.bag
          ? '<button class="btn-quiet receipt-btn" data-act="receipt" data-ref="' + esc(it.ref) + '" data-testid="receipt-btn">' +
            (S.receiptFor === it.ref ? 'Hide receipt' : 'View receipt') + '</button>'
          : '';
        var track = model.bag
          ? '<ol class="track">' + stages.map(function (lb, i) {
              return '<li class="track-step' + (i === 0 ? ' is-done' : '') + '">' +
                '<span class="track-dot"></span><span class="track-lb">' + lb + '</span>' +
                (i === 0 && it.at ? '<span class="track-at">' + esc(it.at) + '</span>' : '') + '</li>';
            }).join('') + '</ol>'
          : '';
        return '<article class="cm-item" data-testid="' + esc(s.props.itemTestid) + '" data-ref="' + esc(it.ref) + '">' +
          '<div class="cm-head"><span class="cm-ref">' + esc(it.ref) + '</span></div>' +
          '<div class="dl">' + rows + '</div>' + tracker + track + receipt + receiptBtn +
          (confirming
            ? '<div class="cancel-confirm">' +
              '<button class="btn-danger" data-act="cancel-confirm" data-ref="' + esc(it.ref) + '" data-testid="' + esc(s.props.confirmTestid) + '">' + esc(s.props.confirmLabel) + '</button>' +
              '<button class="btn-quiet" data-act="cancel-keep" data-ref="' + esc(it.ref) + '">' + esc(s.props.keepLabel) + '</button>' +
              '</div>'
            : '<button class="btn-cancel" data-act="cancel" data-ref="' + esc(it.ref) + '" data-testid="' + esc(s.props.cancelTestid) + '">' + esc(s.props.cancelLabel) + '</button>') +
          '</article>';
      }).join('') + '</div></div>';
  };

  // ---- the bag: line items with steppers, totals, checkout entry ------
  R['bag-list'] = function (s) {
    var entries = bagEntries();
    if (!entries.length) {
      return '<div class="wrap"><div class="empty" data-testid="empty-state"><p>' +
        esc(s.props.emptyMessage || 'Your bag is empty.') + '</p></div></div>';
    }
    var priceId = model.bag.priceField;
    return '<div class="wrap"><div class="bag-list" data-testid="' + esc(s.props.testid) + '">' +
      entries.map(function (e) {
        var name = titleF ? e.rec[titleF.id] : e.rec.id;
        var unit = Number(e.rec[priceId]) || 0;
        var vl = sigLabel(e.sig);
        return '<article class="bag-item" data-testid="' + esc(s.props.itemTestid) + '" data-id="' + esc(e.rec.id) + '">' +
          mediaBlock(e.rec, 'bag-media') +
          '<div class="bag-info"><span class="bag-name">' + esc(name) + '</span>' +
          (vl ? '<span class="bag-variant">' + esc(vl) + '</span>' : '') +
          '<span class="bag-unit">' + esc(money(unit)) + '</span></div>' +
          '<div class="stepper">' +
          '<button class="step-btn" data-act="bag-dec" data-key="' + esc(e.key) + '" data-testid="bag-dec" aria-label="Remove one">\u2212</button>' +
          '<span class="step-qty" data-testid="bag-qty">' + e.qty + '</span>' +
          (bagQty(e.rec.id) < bagCap(e.rec) ? '<button class="step-btn" data-act="bag-inc" data-key="' + esc(e.key) + '" data-testid="bag-inc" aria-label="Add one">+</button>' : '') +
          '</div>' +
          '<span class="bag-line">' + esc(money(unit * e.qty)) + '</span>' +
          '<button class="bag-remove" data-act="bag-remove-ask" data-key="' + esc(e.key) + '" data-testid="bag-remove" aria-label="Remove ' + esc(name) + ' from ' + esc(String(model.bag.label || 'bag').toLowerCase()) + '">Remove</button>' +
          '</article>';
      }).join('') + '</div></div>';
  };

  R['bag-totals'] = function (s) {
    if (!bagEntries().length) return '';
    var t = bagTotals();
    var delivery = t.subtotal === 0 ? money(0) : (t.free ? 'Free' : money(t.delivery));
    return '<div class="wrap"><div class="bag-totals" data-testid="' + esc(s.props.testid) + '"><div class="dl">' +
      '<div class="dl-row"><span class="dl-label">Subtotal</span><span class="dl-value" data-testid="' + esc(s.props.subtotalTestid) + '">' + esc(money(t.subtotal)) + '</span></div>' +
      '<div class="dl-row"><span class="dl-label">Delivery</span><span class="dl-value" data-testid="' + esc(s.props.deliveryTestid) + '">' + esc(delivery) + '</span></div>' +
      '<div class="dl-row dl-total"><span class="dl-label">Total</span><span class="dl-value" data-testid="' + esc(s.props.totalTestid) + '">' + esc(money(t.total)) + '</span></div>' +
      '</div></div></div>';
  };

  R['bag-checkout'] = function (s) {
    if (!bagEntries().length) return '';
    return '<div class="wrap"><button class="cta" data-act="checkout" data-testid="' + esc(s.props.testid) + '">' +
      esc(s.props.label || 'Checkout') + '</button></div>';
  };

  R['bag-add'] = function (s) {
    var rec = selectedRecord();
    if (!rec) return '';
    var key = bagKey(rec.id, variantSig(rec));
    var qty = bagQtyKey(key);
    return '<div class="wrap"><div class="bag-add">' +
      '<button class="cta" data-act="add" data-id="' + esc(rec.id) + '" data-key="' + esc(key) + '" data-testid="' + esc(s.props.testid) + '">' +
      esc(s.props.label || 'Add to bag') + '</button>' +
      (qty ? '<p class="bag-note">' + qty + ' in your ' + esc(String(model.bag.label || 'bag').toLowerCase()) + '</p>' : '') +
      '</div></div>';
  };

  // ---- M040: the promo banner a product declares for its home ------
  R['promo-banner'] = function (s) {
    var p = s.props;
    var inner = '<div class="promo-txt">' +
      (p.percent ? '<span class="promo-pct">' + esc(p.percent) + '</span>' : '') +
      '<span class="promo-title">' + esc(p.title) + '</span>' +
      (p.subtitle ? '<span class="promo-sub">' + esc(p.subtitle) + '</span>' : '') +
      (p.recordId ? '<button class="promo-btn" data-act="open" data-id="' + esc(p.recordId) + '">' + esc(p.cta || 'Shop now') + '</button>' : '') +
      '</div>';
    var media = p.image
      ? '<span class="promo-media"><img class="media-img" src="' + esc(p.image) + '" alt="" loading="lazy" onerror="this.parentNode.remove()"></span>'
      : '';
    return '<div class="wrap"><div class="promo' + (p.percent ? ' has-pct' : '') + '" data-testid="' + esc(p.testid || 'promo') + '">' + inner + media + '</div></div>';
  };

  // ---- M040: related records — "You may also like" ------------------
  R['related-rail'] = function (s) {
    var rec = selectedRecord();
    if (!rec) return '';
    var field = s.binding.field;
    var priceId = model.bag ? model.bag.priceField : (priceF ? priceF.id : null);
    var rel = model.records.filter(function (r) {
      return r.id !== rec.id && (!field || !rec[field] || r[field] === rec[field]);
    }).slice(0, 6);
    if (!rel.length) rel = model.records.filter(function (r) { return r.id !== rec.id; }).slice(0, 6);
    if (!rel.length) return '';
    var head = '<div class="wrap"><div class="related" data-testid="' + esc(s.props.testid) + '">' +
      '<div class="related-head"><span class="related-title">' + esc(s.props.title || 'You may also like') + '</span></div>';
    // Products without photography get a text rail, not media cards
    // whose only content is a pair of initials.
    var anyImg = rel.some(function (r) { return !!r.image; });
    if (!anyImg) {
      return head + '<div class="rel-list">' + rel.map(function (r) {
        var name = titleF ? r[titleF.id] : r.id;
        var meta = [field ? r[field] : '', (priceId && r[priceId] != null) ? money(r[priceId]) : '']
          .filter(function (x) { return x !== '' && x != null; }).join(' \u00b7 ');
        return '<button class="rel-row" data-act="open" data-id="' + esc(r.id) + '" data-testid="' + esc(s.props.itemTestid) + '">' +
          '<span class="rel-name">' + esc(name) + '</span>' +
          (meta ? '<span class="rel-meta">' + esc(meta) + '</span>' : '') +
          '</button>';
      }).join('') + '</div></div></div>';
    }
    return head +
      '<div class="related-row">' + rel.map(function (r) {
        var name = titleF ? r[titleF.id] : r.id;
        return '<article class="rel-card">' +
          '<button class="rel-open" data-act="open" data-id="' + esc(r.id) + '" data-testid="' + esc(s.props.itemTestid) + '">' +
          mediaBlock(r, 'rel-media') +
          '<span class="rel-name">' + esc(name) + '</span>' +
          (priceId && r[priceId] != null ? '<span class="rel-price">' + esc(money(r[priceId])) + '</span>' : '') +
          '</button>' +
          (model.bag ? (bagQty(r.id)
            ? '<span class="card-add rel-add is-stepper">' +
              '<button class="ca-btn" data-act="bag-dec" data-id="' + esc(r.id) + '" aria-label="Remove one">\u2212</button>' +
              '<span class="ca-qty">' + bagQty(r.id) + '</span>' +
              (bagQty(r.id) < bagCap(r) ? '<button class="ca-btn" data-act="add" data-id="' + esc(r.id) + '" data-testid="add-btn" aria-label="Add one more">+</button>' : '') +
              '</span>'
            : '<button class="card-add rel-add" data-act="add" data-id="' + esc(r.id) + '" data-testid="add-btn" aria-label="Add ' + esc(name) + '">+</button>') : '') +
          '</article>';
      }).join('') + '</div></div></div>';
  };

  R['status-banner'] = function (s) {
    var items = collectionItems(s.binding.collection);
    if (!items.length) {
      return s.props.emptyHide ? '' : '<div class="wrap"><div class="banner" data-testid="' + esc(s.props.testid) + '"><span class="banner-label">' + esc(s.props.label || '') + '</span></div></div>';
    }
    var it = items[0];
    var bits = (s.binding.fields || []).map(function (fid) {
      var v = it[fid];
      if (fid === 'slot' && it.dayLabel) v = it.dayLabel + ' \u00b7 ' + it.slot;
      if (fid === 'id') v = (model.records.filter(function (r) { return r.id === it.id; })[0] || {})[titleF ? titleF.id : 'id'] || it.id;
      return v === undefined || v === null || v === '' ? '' : esc(v);
    }).filter(Boolean).join(' \u00b7 ');
    return '<div class="wrap"><div class="banner" data-testid="' + esc(s.props.testid) + '">' +
      '<span class="banner-label">' + esc(s.props.label || 'Upcoming') + '</span>' +
      '<span class="banner-main">' + bits + '</span></div></div>';
  };


  // ==========================================================================
  // MISSION 024 primitives. Each one exists because the frozen Mission 023
  // benchmark proved a required capability was missing; none is app-specific.
  // ==========================================================================

  // ---- aggregates: a KPI row computed over the collection ----------------
  R['metric-row'] = function (s) {
    var aggs = s.binding.aggregates || [];
    var numsOf = function (field) {
      return model.records.map(function (r) { return Number(r[field]); })
        .filter(function (n) { return isFinite(n); });
    };
    var tiles = aggs.map(function (a) {
      var v;
      if (a.op === 'count') v = model.records.length;
      else if (a.op === 'sum') v = numsOf(a.field).reduce(function (x, y) { return x + y; }, 0);
      else if (a.op === 'countWhere') v = model.records.filter(function (r) {
        var x = Number(r[a.field]); var y = Number(r[a.compareField]);
        if (!isFinite(x) || !isFinite(y)) return false;
        return a.compare === '>' ? x > y : x < y;
      }).length;
      else if (a.op === 'countWhereEq') v = model.records.filter(function (r) {
        return String(r[a.field]) === String(a.value);
      }).length;
      else if (a.op === 'sumProduct') v = model.records.reduce(function (acc, r) {
        var x = Number(r[a.fields[0]]); var y = Number(r[a.fields[1]]);
        return acc + ((isFinite(x) ? x : 0) * (isFinite(y) ? y : 0));
      }, 0);
      else if (a.op === 'mean') { var n = numsOf(a.field); v = n.length ? n.reduce(function (x, y) { return x + y; }, 0) / n.length : 0; }
      else if (a.op === 'first') v = model.records.length ? model.records[0][a.field] : '';
      else v = '';
      var f = a.field && FIELDS[a.field] ? FIELDS[a.field].type : null;
      var fmtKind = a.format || (f === 'money' ? 'money' : f === 'rating' ? 'decimal' : 'plain');
      var shown;
      if (fmtKind === 'money') shown = money(v);
      else if (fmtKind === 'percent') shown = Number(v).toFixed(1) + '%';
      else if (fmtKind === 'decimal') shown = Number(v).toFixed(1);
      else if (typeof v === 'number') shown = v.toLocaleString('en-IN', { maximumFractionDigits: 1 });
      else shown = String(v);
      return '<div class="metric" data-testid="' + esc(s.props.tileTestid || 'metric-tile') + '">' +
        '<span class="metric-label">' + esc(a.label || a.id) + '</span>' +
        '<span class="metric-value" data-testid="' + esc(s.props.valueTestid || 'metric-value') + '">' + esc(shown) + '</span></div>';
    }).join('');
    return '<div class="wrap"><div class="metrics" data-testid="' + esc(s.props.testid) + '">' + tiles + '</div></div>';
  };

  // ---- a dense table: one column per declared field ----------------------
  R['data-table'] = function (s) {
    var cols = s.binding.columns || [];
    var recs = visibleRecords();
    if (!recs.length) {
      return '<div class="wrap"><div class="empty" data-testid="empty-state"><p>' + esc(s.emptyMessage || 'Nothing here yet.') + '</p></div></div>';
    }
    var head = cols.map(function (c) {
      return '<th scope="col" data-testid="table-head" data-field="' + esc(c.field) + '"' +
        (c.derived ? ' data-derived="true"' : '') + ' class="' + (c.align === 'right' ? 'ta-r' : '') + '">' +
        esc(c.label || c.field) + '</th>';
    }).join('');
    var body = recs.map(function (rec) {
      var cells = cols.map(function (c) {
        var v = fmt(FIELDS[c.field], rec);
        var fld = FIELDS[c.field];
        // A status column carries a pill when the field is the record's
        // status, or when an enum's value itself reads as a state (the
        // status field usually derives the 'facet' role when the brief asks
        // for filtering, which is why role alone missed it). Classifier
        // values ("Fasteners") tone neutral and stay plain text.
        var shown = (fld && v && (fld.role === 'status' || (fld.type === 'enum' && statusTone(v) !== 'neutral')))
          ? '<span class="pill" data-tone="' + statusTone(v) + '">' + esc(v) + '</span>'
          : esc(v);
        return '<td data-field="' + esc(c.field) + '" data-record="' + esc(rec.id) + '"' +
          (c.derived ? ' data-derived="true"' : '') + ' class="' + (c.align === 'right' ? 'ta-r num' : '') + (fld && fld.role === 'subtitle' ? ' code' : '') + '">' +
          shown + '</td>';
      }).join('');
      return '<tr data-act="open" data-id="' + esc(rec.id) + '" data-record="' + esc(rec.id) + '" data-testid="' + esc(s.props.itemTestid) + '">' + cells + '</tr>';
    }).join('');
    // MISSION 026: a table wider than the viewport must be discoverable, not
    // merely scrollable. The frame reports its own overflow, the wrapper is
    // keyboard-reachable, the first column stays put, and a visible hint names
    // the affordance. A document that technically fits is not proof that every
    // column is usable.
    return '<div class="wrap"><div class="tableframe" data-overflow="false" data-testid="table-frame">' +
        '<div class="tablewrap" tabindex="0" role="region" aria-label="' + esc(s.props.label || 'Data table') + ', scrollable horizontally"' +
        ' data-testid="table-scroll">' +
          '<table class="datatable" data-testid="' + esc(s.props.testid) + '">' +
          '<thead><tr>' + head + '</tr></thead><tbody>' + body + '</tbody></table>' +
        '</div>' +
        '<span class="table-fade" aria-hidden="true"></span>' +
      '</div>' +
      '<p class="table-hint" data-testid="table-scroll-hint" hidden>Scroll sideways for more columns</p></div>';
  };

  // ---- long-form prose with a measured column ---------------------------
  R['article'] = function (s) {
    var rec = selectedRecord();
    if (!rec) return '';
    var a = s.binding.article || {};
    var raw = a.body ? rec[a.body] : '';
    var paras = Array.isArray(raw) ? raw : String(raw == null ? '' : raw).split(/\n{2,}/).filter(Boolean);
    if (!paras.length) return '';
    return '<div class="wrap"><article class="article">' +
      (a.standfirst && rec[a.standfirst] ? '<p class="standfirst" data-testid="standfirst">' + esc(rec[a.standfirst]) + '</p>' : '') +
      (a.byline && rec[a.byline] ? '<p class="article-byline">' + esc(rec[a.byline]) + '</p>' : '') +
      '<div class="article-body" data-testid="article-body" data-field="' + esc(a.body || 'body') + '">' +
        paras.map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('') +
      '</div></article></div>';
  };

  // ---- a multi-step flow with a step indicator --------------------------
  R['step-flow'] = function (s) {
    var steps = s.binding.steps || [];
    if (!steps.length) return '';
    var cur = Math.min(S.step || 0, steps.length - 1);
    var action = commitAction();
    var indicator = steps.map(function (st, i) {
      var state = i === cur ? 'current' : (i < cur ? 'done' : 'todo');
      return '<div class="step" data-step="' + (i + 1) + '" data-state="' + state + '" data-testid="step">' +
        '<span class="step-n">' + (i + 1) + '</span>' + esc(st.label || ('Step ' + (i + 1))) + '</div>';
    }).join('');
    var panelFields = steps[cur].fields || [];
    var panel = panelFields.map(function (fid) {
      var f = (action.form || []).filter(function (x) { return x.id === fid; })[0];
      if (!f) return '';
      if (f.options) return radioRows(f, f.errorTestid || ('error-' + f.id));
      var err = S.errors[f.id];
      var tid = f.testid || ('field-' + f.id);
      var etid = f.errorTestid || ('error-' + f.id);
      return '<div class="field"><label for="' + esc(fieldInputId(f)) + '">' + esc(f.label) + '</label>' +
        '<input id="' + esc(fieldInputId(f)) + '" data-act="field" data-field="' + esc(f.id) + '" data-testid="' + esc(tid) + '"' +
        ' type="' + (f.type === 'tel' ? 'tel' : f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : 'text') + '"' + (f.type === 'tel' || f.type === 'number' ? ' inputmode="numeric"' : '') +
        ' value="' + esc(S.form[f.id] || '') + '"' + (f.placeholder ? ' placeholder="' + esc(f.placeholder) + '"' : '') +
        ' aria-invalid="' + (err ? 'true' : 'false') + '">' +
        '<p class="err" data-testid="' + esc(etid) + '"' + (err ? '' : ' hidden') + '>' + esc(err || '') + '</p></div>';
    }).join('');

    // Review step: show what has been entered so far.
    var review = '';
    if (steps[cur].review) {
      review = '<div class="dl">' + (action.form || []).map(function (f) {
        var v = S.form[f.id] == null ? '' : String(S.form[f.id]);
        return v ? '<div class="dl-row"><span>' + esc(f.label) + '</span><span>' + esc(v) + '</span></div>' : '';
      }).join('') + '</div>';
    }

    var last = cur === steps.length - 1;
    var nav = '<div class="stepnav">' +
      (cur > 0 ? '<button class="btn-quiet" data-act="step-back" data-testid="step-back">Back</button>' : '') +
      (last
        ? '<button class="cta" data-act="commit" data-testid="' + esc(s.props.commitTestid) + '">' + esc(s.props.commitLabel) + '</button>'
        : '<button class="cta" data-act="step-next" data-testid="step-next">Continue</button>') +
      '</div>';

    return '<div class="wrap"><div class="stepflow" data-testid="' + esc(s.props.testid) + '">' +
      '<div class="steps" role="group" aria-label="Progress">' + indicator + '</div>' +
      '<div class="panel">' + panel + review + '</div>' + nav + '</div></div>';
  };

  R['confirmation'] = function (s) {
    var c = S.confirmation;
    if (!c) return '<div class="wrap"><div class="empty"><p>Nothing to confirm.</p></div></div>';
    var rec = c.record;
    var summary = '';
    if (rec) {
      summary = '<div class="dl" data-testid="' + esc(s.props.summaryTestid || 'confirm-summary') + '">' +
        (titleF && !rec.hideTitle ? '<div class="dl-row"><span class="dl-label">' + esc(titleF.label || 'Item') + '</span><span class="dl-value">' + esc(fmt(titleF, rec)) + '</span></div>' : '') +
        Object.keys(c.booking || {}).filter(function (k) { return ['ref', 'id', 'at'].indexOf(k) === -1; }).map(function (k) {
          var label = (model.fieldLabels && model.fieldLabels[k]) || (FIELDS[k] && FIELDS[k].label) || k;
          var val = c.booking[k];
          if (k === 'slot' && c.booking.dayLabel) val = c.booking.dayLabel + ' \u00b7 ' + c.booking.slot;
          return '<div class="dl-row"><span class="dl-label">' + esc(label) + '</span><span class="dl-value">' + esc(val) + '</span></div>';
        }).join('') +
        '</div>';
    }
    return '<div class="wrap confirm"><div class="confirm-card">' +
      '<div class="confirm-mark" aria-hidden="true">\u2713</div>' +
      '<h1 class="confirm-h">' + esc(s.props.title) + '</h1>' +
      '<p class="confirm-ref">' + esc(s.props.referenceLabel || 'Reference') + ' <strong data-testid="' + esc(s.props.testid) + '">' + esc(c.ref) + '</strong></p>' +
      summary +
      '<div class="confirm-actions">' +
        '<button class="cta" data-act="nav" data-view="' + esc(layout.views[0].id) + '">Back to ' + esc(layout.views[0].id) + '</button>' +
      '</div></div></div>';
  };


  // ==========================================================================
  // MISSION 046 — the Evira families. Every renderer below exists because
  // the board repeats the pattern across dozens of screens and the engine
  // could not produce it at all. All are data-driven and declared: records
  // carry variants/reviews/images; the brief declares wallet, profile,
  // notices, faq, onboarding, auth. Undeclared, none of this renders.
  // ==========================================================================

  function starRow(n, cls) {
    var out = '';
    for (var i = 1; i <= 5; i++) out += '<span class="star' + (i <= Math.round(n) ? ' is-on' : '') + '">\u2605</span>';
    return '<span class="stars ' + (cls || '') + '" aria-label="' + n + ' of 5 stars">' + out + '</span>';
  }

  R['category-medallions'] = function (s) {
    var fid = s.binding.filterId;
    var active = S.filters[fid] || 'All';
    var opts = ['All'].concat(s.binding.options || []);
    return '<div class="wrap"><div class="medallions" data-testid="' + esc(s.props.testid) + '">' +
      opts.map(function (o) {
        var on = o === active;
        // M047: the board's medallions are photographs. The first
        // record carrying a photo inside this facet value lends it;
        // a value with no photographed record keeps its initial disc.
        var photo = '';
        if (o !== 'All' && s.binding.field) {
          var hit = (model.records || []).filter(function (rec) { return String(rec[s.binding.field]) === o && rec.image; })[0];
          if (hit) photo = hit.image;
        }
        var disc = photo
          ? '<span class="med-disc has-photo" aria-hidden="true"><img class="media-img" src="' + esc(photo) + '" alt="" onerror="this.remove()"></span>'
          : '<span class="med-disc" aria-hidden="true">' + esc(initials(o === 'All' ? 'All' : o)) + '</span>';
        return '<button class="medallion' + (on ? ' is-on' : '') + '" data-act="filter" data-filter="' + esc(fid) + '"' +
          ' data-value="' + esc(o) + '" data-testid="' + esc(s.props.itemTestid) + '" aria-pressed="' + on + '">' +
          disc +
          '<span class="med-lb">' + esc(o) + '</span></button>';
      }).join('') + '</div></div>';
  };

  R['variant-selectors'] = function (s) {
    var rec = selectedRecord();
    if (!rec || !Array.isArray(rec.variants) || !rec.variants.length) return '';
    var sel = S.variantSel[rec.id] || {};
    return '<div class="wrap"><div class="variants" data-testid="' + esc(s.props.testid) + '">' +
      rec.variants.map(function (v) {
        var cur = sel[v.label] != null ? sel[v.label] : (v.options || [])[0];
        var opts = (v.options || []).map(function (o) {
          var opt = typeof o === 'string' ? { label: o, value: o } : o;
          var on = String(opt.value) === String(cur);
          if (v.style === 'swatch') {
            var col = opt.color || (/^#/.test(String(opt.value)) ? String(opt.value) : 'hsl(' + (hashOf(String(opt.value)) % 360) + ' 45% 55%)');
            return '<button class="swatch' + (on ? ' is-on' : '') + '" data-act="variant" data-id="' + esc(rec.id) + '"' +
              ' data-label="' + esc(v.label) + '" data-value="' + esc(opt.value) + '" data-testid="variant-option"' +
              ' style="--sw:' + esc(col) + '" aria-pressed="' + on + '" aria-label="' + esc(v.label + ': ' + opt.label) + '">' +
              (on ? '<span class="swatch-tick">\u2713</span>' : '') + '</button>';
          }
          if (v.style === 'circles') {
            return '<button class="size-dot' + (on ? ' is-on' : '') + '" data-act="variant" data-id="' + esc(rec.id) + '"' +
              ' data-label="' + esc(v.label) + '" data-value="' + esc(opt.value) + '" data-testid="variant-option"' +
              ' aria-pressed="' + on + '">' + esc(opt.label) + '</button>';
          }
          return '<button class="opt-pill' + (on ? ' is-on' : '') + '" data-act="variant" data-id="' + esc(rec.id) + '"' +
            ' data-label="' + esc(v.label) + '" data-value="' + esc(opt.value) + '" data-testid="variant-option"' +
            ' aria-pressed="' + on + '">' + esc(opt.label) + '</button>';
        }).join('');
        return '<div class="variant-row"><span class="variant-lb">' + esc(v.label) + '</span>' +
          '<span class="variant-opts">' + opts + '</span></div>';
      }).join('') + '</div></div>';
  };

  R['reviews'] = function (s) {
    var rec = selectedRecord();
    if (!rec) return '';
    var mine = (store.myReviews && store.myReviews[rec.id]) || [];
    var list = (rec.reviews || []).concat(mine);
    if (!list.length) return '';
    var avg = list.reduce(function (a, r) { return a + (Number(r.rating) || 0); }, 0) / list.length;
    var rows = list.map(function (r) {
      return '<article class="review" data-testid="' + esc(s.props.itemTestid) + '">' +
        '<span class="rev-av" aria-hidden="true">' + esc(initials(r.name || 'A')) + '</span>' +
        '<span class="rev-main"><span class="rev-top"><span class="rev-name">' + esc(r.name || 'Anonymous') + '</span>' +
        starRow(Number(r.rating) || 0, 'rev-stars') +
        (r.date ? '<span class="rev-date">' + esc(r.date) + '</span>' : '') + '</span>' +
        (r.text ? '<span class="rev-text">' + esc(r.text) + '</span>' : '') + '</span></article>';
    }).join('');
    var form = S.reviewOpen
      ? '<div class="rev-form">' +
        '<div class="rev-pick" role="radiogroup" aria-label="Your rating">' +
        [1, 2, 3, 4, 5].map(function (i) {
          return '<button class="star pick' + (i <= S.reviewStars ? ' is-on' : '') + '" data-act="rev-star" data-i="' + i + '" aria-label="' + i + ' stars">\u2605</button>';
        }).join('') + '</div>' +
        '<textarea id="rev-text" class="rev-input" rows="3" placeholder="How is your order?" aria-label="Your review"></textarea>' +
        '<div class="rev-actions"><button class="btn-quiet" data-act="rev-cancel">Cancel</button>' +
        '<button class="cta rev-submit" data-act="rev-submit" data-testid="review-submit">Submit</button></div></div>'
      : '<button class="btn-quiet rev-open" data-act="rev-open" data-testid="review-open">Write a review</button>';
    return '<div class="wrap"><div class="reviews" data-testid="' + esc(s.props.testid) + '">' +
      '<div class="rev-head"><span class="rev-avg">' + avg.toFixed(1) + '</span>' +
      '<span class="rev-head-meta">' + starRow(avg, 'rev-stars') +
      '<span class="rev-count">' + list.length + ' review' + (list.length === 1 ? '' : 's') + '</span></span></div>' +
      rows + form + '</div></div>';
  };

  function walletState() {
    if (!store.wallet) {
      store.wallet = {
        balance: Number(model.wallet && model.wallet.balance) || 0,
        txns: ((model.wallet && model.wallet.transactions) || []).slice(),
      };
    }
    return store.wallet;
  }

  R['wallet-card'] = function (s) {
    var w = walletState();
    return '<div class="wrap"><div class="wallet-card" data-testid="' + esc(s.props.testid) + '">' +
      '<span class="wallet-lb">' + esc(s.props.label) + '</span>' +
      '<span class="wallet-bal" data-testid="wallet-balance">' + esc(money(w.balance)) + '</span>' +
      '<button class="wallet-topup" data-act="sheet-topup" data-testid="wallet-topup">+ Top Up</button>' +
      '</div></div>';
  };

  R['txn-list'] = function (s) {
    var w = walletState();
    if (!w.txns.length) return '<div class="wrap"><div class="empty" data-testid="empty-state"><p>No transactions yet.</p></div></div>';
    return '<div class="wrap"><h2 class="sect-title">' + esc(s.props.title) + '</h2>' +
      '<div class="txns" data-testid="' + esc(s.props.testid) + '">' +
      w.txns.map(function (t) {
        var amt = Number(t.amount) || 0;
        return '<div class="txn" data-testid="' + esc(s.props.itemTestid) + '">' +
          '<span class="txn-disc" aria-hidden="true">' + (t.kind === 'topup' ? '\u2193' : esc(initials(t.label || 'T'))) + '</span>' +
          '<span class="txn-main"><span class="txn-name">' + esc(t.label || '') + '</span>' +
          (t.when ? '<span class="txn-when">' + esc(t.when) + '</span>' : '') + '</span>' +
          '<span class="txn-amt ' + (amt < 0 ? 'is-neg' : 'is-pos') + '">' + (amt < 0 ? '\u2212' : '+') + esc(money(Math.abs(amt))) + '</span></div>';
      }).join('') + '</div></div>';
  };

  R['profile-sheet'] = function (s) {
    var p = model.profile || {};
    var st = store.profile || {};
    var head = '<div class="prof-head">' +
      '<span class="prof-av" aria-hidden="true">' + esc(initials(p.name || model.app.brand)) +
      '<span class="prof-edit" aria-hidden="true"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M4 20h4L19.5 8.5a2.1 2.1 0 0 0-3-3L5 17v3Z"/></svg></span></span>' +
      '<span class="prof-name">' + esc(p.name || '') + '</span>' +
      (p.sub ? '<span class="prof-sub">' + esc(p.sub) + '</span>' : '') + '</div>';
    var secs = (p.sections || []).map(function (sec, si) {
      var rows = (sec.rows || []).map(function (row, ri) {
        var key = si + ':' + ri;
        if (row.kind === 'toggle') {
          var on = st[key] != null ? !!st[key] : !!row.value;
          return '<div class="prof-row"><span class="prof-lb">' + esc(row.label) + '</span>' +
            '<button class="switch' + (on ? ' is-on' : '') + '" data-act="prof-toggle" data-key="' + esc(key) + '"' +
            ' role="switch" aria-checked="' + on + '" data-testid="prof-toggle" aria-label="' + esc(row.label) + '"><span class="knob"></span></button></div>';
        }
        if (row.kind === 'radio') {
          var cur = st[key] != null ? st[key] : row.value;
          return '<div class="prof-radio-group"><span class="prof-lb prof-radio-lb">' + esc(row.label) + '</span>' +
            (row.options || []).map(function (o) {
              var on = String(o) === String(cur);
              return '<button class="prof-row prof-radio' + (on ? ' is-on' : '') + '" data-act="prof-radio" data-key="' + esc(key) + '"' +
                ' data-value="' + esc(o) + '" role="radio" aria-checked="' + on + '">' +
                '<span class="prof-lb">' + esc(o) + '</span><span class="radio-dot" aria-hidden="true"></span></button>';
            }).join('') + '</div>';
        }
        var inner = '<span class="prof-lb">' + esc(row.label) + '</span>' +
          (row.value ? '<span class="prof-val">' + esc(row.value) + '</span>' : '') +
          '<span class="prof-chev" aria-hidden="true">\u203a</span>';
        return row.view
          ? '<button class="prof-row" data-act="nav" data-view="' + esc(row.view) + '">' + inner + '</button>'
          : '<div class="prof-row">' + inner + '</div>';
      }).join('');
      return (sec.title ? '<h2 class="sect-title">' + esc(sec.title) + '</h2>' : '') + '<div class="prof-sec">' + rows + '</div>';
    }).join('');
    var logout = model.auth
      ? '<button class="prof-logout" data-act="auth-out" data-testid="logout">Logout</button>' : '';
    return '<div class="wrap"><div class="profile" data-testid="' + esc(s.props.testid) + '">' + head + secs + logout + '</div></div>';
  };

  R['faq-list'] = function (s) {
    var items = model.faq || [];
    if (!items.length) return '';
    return '<div class="wrap"><h2 class="sect-title">' + esc(s.props.title) + '</h2>' +
      '<div class="faq" data-testid="' + esc(s.props.testid) + '">' +
      items.map(function (it, i) {
        var open = S.faqOpen === i;
        return '<div class="faq-item"><button class="faq-q" data-act="faq" data-i="' + i + '" aria-expanded="' + open + '">' +
          '<span>' + esc(it.q) + '</span><span class="faq-chev" aria-hidden="true">\u203a</span></button>' +
          (open ? '<p class="faq-a">' + esc(it.a) + '</p>' : '') + '</div>';
      }).join('') + '</div></div>';
  };

  R['notice-list'] = function (s) {
    var items = model.notices || [];
    if (!items.length) return '<div class="wrap"><div class="empty" data-testid="empty-state"><p>No notifications yet.</p></div></div>';
    var groups = [];
    items.forEach(function (n) {
      var g = n.when || 'Earlier';
      var last = groups[groups.length - 1];
      if (!last || last.label !== g) { last = { label: g, items: [] }; groups.push(last); }
      last.items.push(n);
    });
    return '<div class="wrap"><div class="notices" data-testid="' + esc(s.props.testid) + '">' +
      groups.map(function (g) {
        return '<h2 class="sect-title">' + esc(g.label) + '</h2>' + g.items.map(function (n) {
          return '<div class="notice" data-testid="' + esc(s.props.itemTestid) + '">' +
            '<span class="notice-disc" aria-hidden="true">' + esc(initials(n.title || 'N')) + '</span>' +
            '<span class="notice-main"><span class="notice-title">' + esc(n.title || '') + '</span>' +
            (n.text ? '<span class="notice-text">' + esc(n.text) + '</span>' : '') + '</span></div>';
        }).join('');
      }).join('') + '</div></div>';
  };

  // ---- M046 sheets: one scrim, three bodies -----------------------------
  function sheetHtml() {
    if (!S.sheet) return '';
    var body = '';
    if (S.sheet === 'filter') {
      var groups = (model.filters || []).map(function (f) {
        var opts = ['All'].concat(f.options || []);
        var active = S.filters[f.id] || 'All';
        return '<div class="sheet-group"><span class="sheet-lb">' + esc(f.label || f.id) + '</span><div class="chips">' +
          opts.map(function (o) {
            return '<button class="chip' + (o === active ? ' chip-on' : '') + '" data-act="filter" data-filter="' + esc(f.id) + '" data-value="' + esc(o) + '">' + esc(o) + '</button>';
          }).join('') + '</div></div>';
      }).join('');
      var prices = (model.records || []).map(function (r) { return Number(r[priceF ? priceF.id : '']); }).filter(function (n) { return isFinite(n); });
      var pMin = prices.length ? Math.min.apply(null, prices) : 0;
      var pMax = prices.length ? Math.max.apply(null, prices) : 0;
      var fx = S.filtersX;
      var priceGroup = priceF && pMax > pMin
        ? '<div class="sheet-group"><span class="sheet-lb">Price range</span>' +
          '<div class="range-row"><span>Min <strong data-xfl="minPrice">' + esc(money(fx.minPrice != null ? fx.minPrice : pMin)) + '</strong></span>' +
          '<input type="range" data-xf="minPrice" min="' + pMin + '" max="' + pMax + '" value="' + (fx.minPrice != null ? fx.minPrice : pMin) + '" aria-label="Minimum price"></div>' +
          '<div class="range-row"><span>Max <strong data-xfl="maxPrice">' + esc(money(fx.maxPrice != null ? fx.maxPrice : pMax)) + '</strong></span>' +
          '<input type="range" data-xf="maxPrice" min="' + pMin + '" max="' + pMax + '" value="' + (fx.maxPrice != null ? fx.maxPrice : pMax) + '" aria-label="Maximum price"></div></div>'
        : '';
      var ratingF = ((model.entity && model.entity.fields) || []).filter(function (f) { return f.type === 'rating'; })[0];
      var ratingGroup = ratingF
        ? '<div class="sheet-group"><span class="sheet-lb">Rating</span><div class="chips">' +
          [['', 'Any'], ['4', '4.0+'], ['4.5', '4.5+']].map(function (pair) {
            var on = String(fx.minRating == null ? '' : fx.minRating) === pair[0];
            return '<button class="chip' + (on ? ' chip-on' : '') + '" data-act="fx-rating" data-value="' + pair[0] + '">\u2605 ' + pair[1] + '</button>';
          }).join('') + '</div></div>'
        : '';
      var sortGroup = '<div class="sheet-group"><span class="sheet-lb">Sort by</span><div class="chips">' +
        [['', 'Featured'], ['price-asc', 'Price: low to high'], ['price-desc', 'Price: high to low'], ['rating', 'Top rated']].map(function (pair) {
          return '<button class="chip' + (fx.sort === pair[0] ? ' chip-on' : '') + '" data-act="fx-sort" data-value="' + pair[0] + '">' + pair[1] + '</button>';
        }).join('') + '</div></div>';
      body = '<div class="sheet-head"><span class="sheet-title">Sort &amp; Filter</span>' +
        '<button class="sheet-x" data-act="sheet-close" aria-label="Close">\u00d7</button></div>' +
        groups + priceGroup + ratingGroup + sortGroup +
        '<div class="sheet-actions"><button class="btn-quiet" data-act="fx-reset" data-testid="filter-reset">Reset</button>' +
        '<button class="cta" data-act="sheet-close" data-testid="filter-apply">Apply</button></div>';
    } else if (S.sheet === 'remove') {
      var e = bagEntries().filter(function (x) { return x.key === S.sheetKey; })[0];
      if (e) {
        var nm = titleF ? e.rec[titleF.id] : e.rec.id;
        var unit = Number(e.rec[model.bag.priceField]) || 0;
        body = '<div class="sheet-head"><span class="sheet-title">Remove From ' + esc(model.bag.label || 'Bag') + '?</span></div>' +
          '<article class="bag-item">' + mediaBlock(e.rec, 'bag-media') +
          '<div class="bag-info"><span class="bag-name">' + esc(nm) + '</span>' +
          (sigLabel(e.sig) ? '<span class="bag-variant">' + esc(sigLabel(e.sig)) + '</span>' : '') +
          '<span class="bag-unit">' + esc(money(unit)) + '</span></div>' +
          '<span class="bag-line">' + esc(money(unit * e.qty)) + '</span></article>' +
          '<div class="sheet-actions"><button class="btn-quiet" data-act="sheet-close">Cancel</button>' +
          '<button class="cta" data-act="bag-remove-confirm" data-testid="remove-confirm">Yes, Remove</button></div>';
      }
    } else if (S.sheet === 'topup') {
      var amt = S.topupAmt || '';
      body = '<div class="sheet-head"><span class="sheet-title">Top Up E-Wallet</span>' +
        '<button class="sheet-x" data-act="sheet-close" aria-label="Close">\u00d7</button></div>' +
        '<p class="topup-amt" data-testid="topup-amount">' + esc(amt ? money(Number(amt)) : money(0)) + '</p>' +
        '<div class="chips topup-chips">' + [100, 200, 500, 1000].map(function (v) {
          return '<button class="chip' + (amt === String(v) ? ' chip-on' : '') + '" data-act="topup-chip" data-value="' + v + '">' + esc(money(v)) + '</button>';
        }).join('') + '</div>' +
        '<div class="keypad">' + ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'].map(function (d) {
          return d === ''
            ? '<span></span>'
            : '<button class="key" data-act="topup-key" data-d="' + d + '">' + (d === 'del' ? '\u232b' : d) + '</button>';
        }).join('') + '</div>' +
        '<button class="cta" data-act="topup-confirm" data-testid="topup-confirm">Continue</button>';
    }
    if (!body) return '';
    return '<div class="scrim" data-act="sheet-close"></div>' +
      '<div class="sheet" role="dialog" aria-modal="true" data-testid="sheet">' + body + '</div>';
  }

  // ---- M046 entry gates: onboarding, then auth, then the app ------------
  function gateHtml() {
    if (model.onboarding && !store.seenIntro) {
      var slides = model.onboarding.slides || [];
      var i = Math.min(S.introStep, slides.length - 1);
      var sl = slides[i] || {};
      var last = i === slides.length - 1;
      return '<div class="intro" data-testid="onboarding">' +
        '<button class="intro-skip" data-act="intro-skip">Skip</button>' +
        '<div class="intro-hero">' + (sl.image
          ? '<img class="media-img" src="' + esc(sl.image) + '" alt="" onerror="this.remove()">'
          : '<span class="intro-mark">' + esc(initials(model.app.brand)) + '</span>') + '</div>' +
        '<h1 class="intro-h">' + esc(sl.headline || '') + '</h1>' +
        (sl.text ? '<p class="intro-t">' + esc(sl.text) + '</p>' : '') +
        '<div class="intro-dashes">' + slides.map(function (_, j) {
          return '<span class="dash' + (j === i ? ' is-on' : '') + '"></span>';
        }).join('') + '</div>' +
        '<button class="cta" data-act="intro-next" data-testid="intro-next">' + (last ? (model.onboarding.cta || 'Get Started') : 'Next') + '</button>' +
        '</div>';
    }
    if (model.auth && !store.authed) {
      var a = model.auth;
      var up = S.authMode === 'up';
      var social = (a.providers || []).length
        ? '<div class="auth-social">' + a.providers.map(function (pv) {
            return '<button class="social-btn" data-act="auth-social" data-testid="auth-social" aria-label="Continue with ' + esc(pv) + '">' + esc(initials(pv)) + '</button>';
          }).join('') + '</div><p class="auth-or">or continue with</p>'
        : '';
      return '<div class="auth" data-testid="auth">' +
        '<h1 class="auth-h">' + esc(up ? (a.titleUp || 'Create your Account') : (a.titleIn || 'Login to your Account')) + '</h1>' +
        social +
        (up ? '<div class="field"><label for="auth-name">Full name</label><input id="auth-name" data-act="field" data-field="auth-name" type="text" autocomplete="name"></div>' : '') +
        '<div class="field"><label for="auth-email">Email</label><input id="auth-email" data-act="field" data-field="auth-email" type="email" autocomplete="email"></div>' +
        '<div class="field"><label for="auth-pass">Password</label><input id="auth-pass" data-act="field" data-field="auth-pass" type="password" autocomplete="current-password"></div>' +
        '<label class="auth-remember"><span class="checkbox' + (S.remember ? ' is-on' : '') + '" data-act="auth-remember" role="checkbox" aria-checked="' + !!S.remember + '">' + (S.remember ? '\u2713' : '') + '</span> Remember me</label>' +
        (S.authError ? '<p class="err" data-testid="auth-error">' + esc(S.authError) + '</p>' : '') +
        '<button class="cta" data-act="auth-submit" data-testid="auth-submit">' + (up ? 'Sign up' : 'Sign in') + '</button>' +
        '<p class="auth-foot">' + (up ? 'Already have an account? ' : 'Do not have an account? ') +
        '<button class="auth-link" data-act="auth-mode">' + (up ? 'Sign in' : 'Sign up') + '</button></p>' +
        '</div>';
    }
    return null;
  }

  // ------------------------------------------------------------- rendering
  function renderHeader(view) {
    var hdrSec = view.sections.filter(function (s) { return s.component === 'app-header'; })[0];
    $('#hdr').innerHTML = hdrSec && R['app-header'] ? R['app-header'](hdrSec) : '';
  }

  // Tab icons: the planner assigns each destination an icon name; the
  // glyphs are simple stroke shapes in the app's own ink, filled by the
  // brand only through the active pill (see .tab-on .tab-ic in the CSS).
  var TAB_ICONS = {
    home: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 11.5 12 4l8 7.5"/><path d="M6.5 10v9h11v-9"/></svg>',
    heart: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20s-7.5-4.6-9.3-9.2C1.4 7.4 3.6 4.5 6.8 4.5c2 0 3.9 1.1 5.2 3 1.3-1.9 3.2-3 5.2-3 3.2 0 5.4 2.9 4.1 6.3C19.5 15.4 12 20 12 20Z"/></svg>',
    clipboard: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5.5" y="4.5" width="13" height="16" rx="2"/><path d="M9 4.5a3 3 0 0 1 6 0"/><path d="M9 11h6M9 14.5h4"/></svg>',
    calendar: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="5.5" width="16" height="15" rx="2"/><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4"/></svg>',
    grid: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/></svg>',
    user: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="3.6"/><path d="M5 20c1.4-3.4 3.9-5 7-5s5.6 1.6 7 5"/></svg>',
    search: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/></svg>',
    bag: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5.5 8h13l-1 12.5h-11L5.5 8Z"/><path d="M9 10V6.5a3 3 0 0 1 6 0V10"/></svg>',
  };
  function renderTabs() {
    var tabs = $('#tabs');
    if (!tabs) return;
    tabs.innerHTML = layout.navigation.items.map(function (it) {
      var on = it.view === S.view;
      // The bag tab carries its count, the way the reference carts do.
      var badge = it.view === 'bag' && bagCount() > 0
        ? '<span class="tab-badge" data-testid="bag-count">' + bagCount() + '</span>' : '';
      return '<button class="tab' + (on ? ' tab-on' : '') + '" data-act="nav" data-view="' + esc(it.view) + '"' +
        ' data-nav="' + esc(it.dataNav || it.view) + '"' +
        ' data-testid="' + esc(it.id) + '"' + (on ? ' aria-current="page"' : '') + '>' +
        '<span class="tab-ic">' + (TAB_ICONS[it.icon] || TAB_ICONS.grid) + badge + '</span>' +
        '<span class="tab-lb">' + esc(it.label) + '</span></button>';
    }).join('');
  }

  // Snapshot live input values into state BEFORE any re-render.
  //
  // Without this, a value set programmatically (a test suite assigning
  // .value, a browser autofill) survives in the DOM but not in S.form, and the
  // next re-render — caused by, say, picking a time slot — silently wipes the
  // field back to empty. That is a real user-facing bug too: anything that
  // re-renders mid-form would drop typed input that the input listener had not
  // seen.
  function syncInputsFromDom() {
    var form = sectionOf('form-fields');
    if (form) {
      (form.binding.fields || []).forEach(function (f) {
        var el = $('[data-act="field"][data-field="' + f.id + '"]');
        if (el) S.form[f.id] = el.value;
      });
    }
    var searchEl = $('[data-act="search-input"]');
    if (searchEl && document.activeElement !== searchEl) {
      // Only adopt it when focus is elsewhere, so live typing is not fought.
      S.query = searchEl.value;
    }
  }

  // The overflow affordance is a measurement, not a guess: it is recomputed
  // after every render and on resize.
  function syncTableAffordance() {
    var frames = document.querySelectorAll('.tableframe');
    for (var i = 0; i < frames.length; i++) {
      var f = frames[i];
      var w = f.querySelector('.tablewrap');
      if (!w) continue;
      var ov = w.scrollWidth > w.clientWidth + 1;
      f.setAttribute('data-overflow', ov ? 'true' : 'false');
      var hint = f.parentNode.querySelector('[data-testid="table-scroll-hint"]');
      if (hint) hint.hidden = !ov;
    }
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('resize', syncTableAffordance);
    window.addEventListener('load', function () { syncTableAffordance(); });
  }

  function render(opts) {
    opts = opts || {};
    syncInputsFromDom();
    // M046: the entry gates stand in front of the shell — onboarding
    // until it has been seen, auth until it has been passed. Neither
    // is a view; both are the app's front door.
    var gate = gateHtml();
    if (gate != null) {
      $('#hdr').innerHTML = '';
      var gTabs = $('#tabs'); if (gTabs) gTabs.innerHTML = '';
      var gBar = $('#actionbar'); if (gBar) { gBar.innerHTML = ''; gBar.hidden = true; }
      document.body.classList.remove('has-actionbar');
      var gMain = $('#main');
      gMain.dataset.view = 'gate';
      gMain.innerHTML = '<div class="wrap gate-wrap">' + gate + '</div>';
      if (!opts.keepScroll) window.scrollTo(0, 0);
      return;
    }
    var view = currentView();
    S.view = view.id;
    renderHeader(view);
    renderTabs();

    var main = $('#main');
    main.dataset.view = view.id;
    // M037: on a detail view, the action sections (availability, the step
    // flow) form a rail column beside the record's own sections. The two
    // groups are wrapped so the wide layout can place them side by side
    // with independent heights; below the rail breakpoint the wrappers
    // are display:contents and the sections flow in plan order, exactly
    // as they did before — the plan always puts the action sections last.
    var mainParts = [];
    var railParts = [];
    var secs = [];
    view.sections
      .filter(function (s) { return s.component !== 'app-header'; })
      .forEach(function (s) {
        var prev = secs[secs.length - 1];
        if (s.component === 'filter-chips' && prev && prev.component === 'filter-chips') {
          prev.groups.push(s);
        } else {
          var copy = Object.assign({}, s);
          if (s.component === 'filter-chips') copy.groups = [s];
          secs.push(copy);
        }
      });
    secs.forEach(function (s) {
        var fn = R[s.component];
        if (!fn) { mainParts.push('<!-- unknown component: ' + esc(s.component) + ' -->'); return; }
        var out = fn(s);
        if (!out) return;
        var html = '<section class="sect" data-section="' + esc(s.id) + '">' + out + '</section>';
        if (view.id === 'detail' && (s.id === 'availability' || s.id === 'steps')) railParts.push(html);
        else mainParts.push(html);
      });
    main.innerHTML = (view.id === 'detail' && railParts.length)
      ? '<div class="detail-cols"><div class="col-main">' + mainParts.join('') + '</div>' +
        '<div class="rail">' + railParts.join('') + '</div></div>'
      : mainParts.join('');

    // M038: a flow's navigation belongs to the app frame, not the
    // scroll. Reference apps pin Continue/Confirm in a bottom bar while
    // a form is open; the buttons keep their delegated handlers and
    // testids — only their container changes. The tab bar yields while
    // the bar is up (body.has-actionbar in the CSS).
    var bar = $('#actionbar');
    if (bar) {
      document.body.classList.toggle('is-home', view.id === ((layout.views[0] || {}).id || ''));
      document.body.classList.toggle('is-detail', view.id === 'detail');
      document.body.classList.toggle('greet-home', !!model.greetingHome && view.id === ((layout.views[0] || {}).id || ''));
      if (model.composition) document.body.classList.add('comp-' + model.composition);
      var stepnav = (view.id === 'detail' || view.id === 'checkout')
        ? main.querySelector('.sect[data-section="steps"] .stepnav') : null;
      if (stepnav) {
        bar.innerHTML = '';
        bar.appendChild(stepnav);
        bar.hidden = false;
        document.body.classList.add('has-actionbar');
        document.body.classList.remove('bar-priced');
      } else if (view.id === 'detail' && main.querySelector('.sect[data-section="bag-add"] .bag-add')) {
        // M045: on a record page the purchase action belongs to the
        // app frame, paired with the price — the detail pattern every
        // reference board uses — not in the scroll under the facts.
        var bagAdd = main.querySelector('.sect[data-section="bag-add"] .bag-add');
        var priceEl = main.querySelector('.rec-price');
        bar.innerHTML = '';
        if (priceEl) {
          var bp = document.createElement('span');
          bp.className = 'bar-price';
          bp.textContent = priceEl.textContent;
          bagAdd.insertBefore(bp, bagAdd.firstChild);
        }
        bar.appendChild(bagAdd);
        document.body.classList.add('bar-priced');
        var baSect = main.querySelector('.sect[data-section="bag-add"]');
        if (baSect) baSect.hidden = true;
        bar.hidden = false;
        document.body.classList.add('has-actionbar');
      } else {
        bar.innerHTML = '';
        bar.hidden = true;
        document.body.classList.remove('has-actionbar');
        document.body.classList.remove('bar-priced');
      }
    }

    // Layout has not settled when render() returns, so scrollWidth reads 0 and
    // a table that clearly overflows would report "no overflow". Measure on the
    // next frame, twice, and again on load and resize.
    if (typeof window !== 'undefined') {
      window.requestAnimationFrame(function () {
        syncTableAffordance();
        window.requestAnimationFrame(syncTableAffordance);
      });
    } else {
      syncTableAffordance();
    }

    var sheet = sheetHtml();
    if (sheet) main.insertAdjacentHTML('beforeend', sheet);

    if (opts.focus) { var el = $('#' + opts.focus); if (el) el.focus(); }
    if (!opts.keepScroll) window.scrollTo(0, 0);
  }

  // --------------------------------------------------------------- actions
  // Values are read from the live DOM: an automated suite (or a browser
  // autofill) can set a field without firing an input event, and validation
  // must still see it.
  function readField(f) {
    var el = $('[data-act="field"][data-field="' + f.id + '"]');
    var v = el ? String(el.value == null ? '' : el.value) : String(S.form[f.id] == null ? '' : S.form[f.id]);
    if (f.stripWhitespace) v = v.replace(/\s+/g, '');
    else v = v.trim();
    return v;
  }

  function validate() {
    var action = commitAction();
    if (!action) return true;
    var errs = {};
    (action.form || []).forEach(function (f) {
      var v = readField(f);
      if (f.required && !v) { errs[f.id] = f.message || (f.label + ' is required.'); return; }
      if (v && f.minLength && v.length < f.minLength) { errs[f.id] = f.message || (f.label + ' is too short.'); return; }
      if (v && f.pattern && !new RegExp(f.pattern).test(v)) { errs[f.id] = f.message || (f.label + ' is not valid.'); }
    });
    var av = model.availability;
    if (av && av.required !== false && !S.slot) {
      errs.__availability = av.message || ('Choose ' + String(av.label || 'a time').toLowerCase() + '.');
    } else if (!av && action.options && action.options.required && !S.options[action.options.id]) {
      errs[action.options.id] = 'Choose ' + String(action.options.label || 'an option').toLowerCase() + '.';
    }
    S.errors = errs;
    return Object.keys(errs).length === 0;
  }

  // Validate only the fields belonging to the current step, so a multi-step
  // flow does not demand fields the user has not reached yet.
  function validateStep() {
    var action = commitAction();
    var sf = sectionOf('step-flow');
    if (!action || !sf) return true;
    var steps = sf.binding.steps || [];
    var cur = Math.min(S.step || 0, steps.length - 1);
    var ids = steps[cur].fields || [];
    var errs = {};
    (action.form || []).filter(function (f) { return ids.indexOf(f.id) !== -1; }).forEach(function (f) {
      var v = readField(f);
      if (f.required && !v) { errs[f.id] = f.message || (f.label + ' is required.'); return; }
      if (v && f.minLength && v.length < f.minLength) { errs[f.id] = f.message || (f.label + ' is too short.'); return; }
      if (v && f.pattern && !new RegExp(f.pattern).test(v)) { errs[f.id] = f.message || (f.label + ' is not valid.'); }
    });
    S.errors = errs;
    return Object.keys(errs).length === 0;
  }

  function commit() {
    var action = commitAction();
    if (!action) return;
    // M039: a bag checkout commits the bag, not a selected record. The
    // order carries the items summary and the charged total (formatted
    // the way every surface prints money), then the bag empties — the
    // order exists, the cart resets, like every real shop.
    if (model.bag && S.view === 'checkout') {
      if (!bagEntries().length) { S.view = 'bag'; render(); return; }
      if (!validate()) { render({ keepScroll: true }); focusFirstError(); return; }
      var totals = bagTotals();
      var prefixB = (action.result && action.result.referencePrefix) || 'RF';
      var refB = prefixB + '-' + String(Math.floor(100000 + Math.random() * 899999));
      var order = { ref: refB, id: 'bag', at: new Date().toISOString().slice(0, 10) };
      (action.form || []).forEach(function (f) { order[f.id] = readField(f); });
      order.items = bagEntries().map(function (e) {
        return e.qty + ' \u00d7 ' + (titleF ? e.rec[titleF.id] : e.rec.id) +
          (e.sig ? ' (' + sigLabel(e.sig) + ')' : '');
      }).join(', ');
      order.delivery = totals.subtotal === 0 ? money(0) : (totals.free ? 'Free' : money(totals.delivery));
      order.total = money(totals.total);
      var collB = (action.result && action.result.collection) || 'commits';
      store.collections[collB] = [order].concat(store.collections[collB] || []);
      store.bag = {};
      saveStore();
      S.confirmation = { ref: refB, booking: order, record: { name: 'Your order', hideTitle: true } };
      S.errors = {};
      S.view = 'confirmation';
      render();
      return;
    }
    var rec = selectedRecord();
    if (!rec && S.creating) {
      // A create flow has no record yet; make one so the confirmation can
      // summarise it, without adding it to the browsable catalogue.
      rec = { id: '__new__' };
      (action.form || []).forEach(function (f) { rec[f.id] = S.form[f.id] || ''; });
    }
    if (!rec) return;
    if (!validate()) { render({ keepScroll: true }); focusFirstError(); return; }

    var prefix = (action.result && action.result.referencePrefix) || 'REF';
    var ref = prefix + '-' + String(Math.floor(100000 + Math.random() * 899999));
    var booking = { ref: ref, id: rec.id, at: new Date().toISOString().slice(0, 10) };

    (action.form || []).forEach(function (f) { booking[f.id] = readField(f); });
    var av = model.availability;
    if (av) {
      var days = dayList(av);
      booking.day = S.day;
      booking.dayLabel = (days[S.day] || {}).label || '';
      booking.slot = S.slot;
    }
    if (action.options) booking[action.options.id] = S.options[action.options.id];

    var coll = (action.result && action.result.collection) || 'commits';
    store.collections[coll] = [booking].concat(store.collections[coll] || []);
    saveStore();

    S.confirmation = { ref: ref, booking: booking, record: rec };
    S.errors = {};
    S.slot = null;
    S.view = 'confirmation';
    render();
  }

  function focusFirstError() {
    var first = Object.keys(S.errors)[0];
    if (!first) return;
    var el = first === '__availability'
      ? $('[data-testid="' + ((model.availability && model.availability.errorTestid) || 'error-slot') + '"]')
      : $('[data-testid="error-' + first + '"]');
    if (el && el.scrollIntoView) el.scrollIntoView({ block: 'center' });
  }

  function toggleSave(id) {
    var i = store.saved.indexOf(id);
    if (i === -1) store.saved.push(id); else store.saved.splice(i, 1);
    saveStore();
    render({ keepScroll: true });
  }

  function goBack() {
    var first = layout.views[0].id;
    S.view = first;
    render();
  }

  document.addEventListener('click', function (e) {
    var el = e.target.closest ? e.target.closest('[data-act]') : null;
    if (!el) return;
    var act = el.getAttribute('data-act');
    if (act === 'nav') {
      S.view = el.getAttribute('data-view');
      S.confirmCancel = null;
      S.sheet = null;
      render();
    } else if (act === 'open') {
      S.selectedId = el.getAttribute('data-id');
      S.sheet = null;
      S.reviewOpen = false;
      S.errors = {};
      S.slot = null;
      S.day = 0;
      S.step = 0;
      S.view = 'detail';
      render();
    } else if (act === 'back') {
      S.creating = false;
      goBack();
    } else if (act === 'toggle') {
      e.preventDefault();
      toggleSave(el.getAttribute('data-id'));
    } else if (act === 'add') {
      // M039: add one of this record to the bag. The buttons re-render
      // with the new quantity, which is the feedback.
      e.preventDefault();
      var addId = el.getAttribute('data-id');
      if (!store.bag) store.bag = {};
      // M045: unique items and stock caps are hard limits, not hints.
      // M046: the cap counts the record across all its variants; the
      // line added is the one the button names (data-key) — on a card
      // that is the plain line, on a record page the chosen variant.
      if (bagQty(addId) >= bagCap(recById(addId))) return;
      var addKey = el.getAttribute('data-key') || addId;
      store.bag[addKey] = bagQtyKey(addKey) + 1;
      saveStore();
      render({ keepScroll: true });
    } else if (act === 'bag-inc' || act === 'bag-dec') {
      e.preventDefault();
      var bagKeyAttr = el.getAttribute('data-key') || el.getAttribute('data-id');
      var bagRecId = parseBagKey(bagKeyAttr).id;
      if (act === 'bag-inc' && bagQty(bagRecId) >= bagCap(recById(bagRecId))) return;
      var next = bagQtyKey(bagKeyAttr) + (act === 'bag-inc' ? 1 : -1);
      if (next <= 0) delete store.bag[bagKeyAttr]; else store.bag[bagKeyAttr] = next;
      saveStore();
      render({ keepScroll: true });
    } else if (act === 'checkout') {
      if (!bagEntries().length) return;
      S.view = 'checkout';
      S.step = 0;
      S.form = {};
      S.errors = {};
      render();
    } else if (act === 'filter') {
      // The option value lives under the brief's declared attribute
      // (data-value by default, e.g. data-spec for a specialty facet).
      // A brief may declare several facets, so there can be more than one
      // filter-chips section. Resolving the attribute from the FIRST section
      // made every facet after the first inert (found on H6, where a course
      // chip read data-spice and set the filter to null).
      var fidClicked = el.getAttribute('data-filter');
      var view = layout.views.filter(function (v) { return v.id === S.view; })[0];
      var fsec = view && view.sections.filter(function (x) {
        return x.component === 'filter-chips' && x.binding && x.binding.filterId === fidClicked;
      })[0];
      var fattr = fsec && fsec.props ? (fsec.props.valueAttr || 'data-value') : 'data-value';
      var fval = el.getAttribute(fattr);
      if (fval === null) fval = el.getAttribute('data-value');
      S.filters[el.getAttribute('data-filter')] = fval;
      render();
    } else if (act === 'search') {
      var inp = $('[data-act="search-input"]');
      S.query = inp ? inp.value : S.query;
      render();
    } else if (act === 'reset') {
      S.query = '';
      (model.filters || []).forEach(function (f) { S.filters[f.id] = 'All'; });
      render();
    } else if (act === 'day') {
      var sec = sectionOf('availability-picker');
      var attr = sec && sec.props ? (sec.props.dayAttr || 'data-day') : 'data-day';
      S.day = Number(el.getAttribute(attr));
      S.slot = null;
      render({ keepScroll: true });
    } else if (act === 'slot') {
      var sec2 = sectionOf('availability-picker');
      var attr2 = sec2 && sec2.props ? (sec2.props.slotAttr || 'data-slot') : 'data-slot';
      var val = el.getAttribute(attr2);
      if (el.getAttribute('data-state') === 'taken' || el.disabled) return;
      S.slot = (S.slot === val) ? null : val;
      if (S.errors.__availability) delete S.errors.__availability;
      render({ keepScroll: true });
    } else if (act === 'option') {
      S.options[el.getAttribute('data-option')] = el.getAttribute('data-value');
      render();
    } else if (act === 'cancel') {
      S.confirmCancel = el.getAttribute('data-ref');
      render({ keepScroll: true });
    } else if (act === 'cancel-keep') {
      S.confirmCancel = null;
      render({ keepScroll: true });
    } else if (act === 'cancel-confirm') {
      var ref = el.getAttribute('data-ref');
      var coll = (sectionOf('collection-manager') || {}).binding;
      var collId = coll ? coll.collection : null;
      if (collId) {
        store.collections[collId] = collectionItems(collId).filter(function (it) { return it.ref !== ref; });
        saveStore();
      }
      S.confirmCancel = null;
      render({ keepScroll: true });
    } else if (act === 'start-create') {
      S.selectedId = null;
      S.creating = true;
      S.step = 0;
      S.form = {};
      S.errors = {};
      S.view = 'detail';
      render();
    } else if (act === 'step-next') {
      if (!validateStep()) { render({ keepScroll: true }); focusFirstError(); return; }
      S.step = (S.step || 0) + 1;
      render({ keepScroll: true });
    } else if (act === 'step-back') {
      S.step = Math.max(0, (S.step || 0) - 1);
      S.errors = {};
      render({ keepScroll: true });
    } else if (act === 'sheet-filter') {
      S.sheet = 'filter';
      render({ keepScroll: true });
    } else if (act === 'sheet-close') {
      S.sheet = null;
      render({ keepScroll: true });
    } else if (act === 'fx-sort') {
      S.filtersX.sort = el.getAttribute('data-value') || '';
      render({ keepScroll: true });
    } else if (act === 'fx-rating') {
      var rv = el.getAttribute('data-value');
      S.filtersX.minRating = rv ? Number(rv) : null;
      render({ keepScroll: true });
    } else if (act === 'fx-reset') {
      S.filtersX = { minPrice: null, maxPrice: null, sort: '', minRating: null };
      (model.filters || []).forEach(function (f) { S.filters[f.id] = 'All'; });
      render({ keepScroll: true });
    } else if (act === 'bag-remove-ask') {
      S.sheet = 'remove';
      S.sheetKey = el.getAttribute('data-key');
      render({ keepScroll: true });
    } else if (act === 'bag-remove-confirm') {
      if (S.sheetKey) delete store.bag[S.sheetKey];
      S.sheet = null;
      S.sheetKey = null;
      saveStore();
      render({ keepScroll: true });
    } else if (act === 'sheet-topup') {
      S.sheet = 'topup';
      S.topupAmt = '';
      render({ keepScroll: true });
    } else if (act === 'topup-chip') {
      S.topupAmt = el.getAttribute('data-value') || '';
      render({ keepScroll: true });
    } else if (act === 'topup-key') {
      var d = el.getAttribute('data-d');
      if (d === 'del') S.topupAmt = S.topupAmt.slice(0, -1);
      else if (S.topupAmt.length < 7) S.topupAmt += d;
      render({ keepScroll: true });
    } else if (act === 'topup-confirm') {
      var amt = parseInt(S.topupAmt, 10) || 0;
      if (amt > 0) {
        var w = walletState();
        w.balance += amt;
        w.txns.unshift({ label: 'Top Up Wallet', amount: amt, when: 'Just now', kind: 'topup' });
        store.wallet = w;
        saveStore();
      }
      S.sheet = null;
      render({ keepScroll: true });
    } else if (act === 'variant') {
      var vRec = el.getAttribute('data-id');
      if (!S.variantSel[vRec]) S.variantSel[vRec] = {};
      S.variantSel[vRec][el.getAttribute('data-label')] = el.getAttribute('data-value');
      render({ keepScroll: true });
    } else if (act === 'hero-prev' || act === 'hero-next' || act === 'hero-dot') {
      var hRec = selectedRecord();
      if (hRec && Array.isArray(hRec.images)) {
        var cur = S.heroIdx[hRec.id] || 0;
        if (act === 'hero-dot') cur = Number(el.getAttribute('data-i')) || 0;
        else cur = (cur + (act === 'hero-next' ? 1 : -1) + hRec.images.length) % hRec.images.length;
        S.heroIdx[hRec.id] = cur;
      }
      render({ keepScroll: true });
    } else if (act === 'receipt') {
      var rRef = el.getAttribute('data-ref');
      S.receiptFor = S.receiptFor === rRef ? null : rRef;
      render({ keepScroll: true });
    } else if (act === 'radio') {
      S.form[el.getAttribute('data-field')] = el.getAttribute('data-value');
      if (S.errors[el.getAttribute('data-field')]) delete S.errors[el.getAttribute('data-field')];
      render({ keepScroll: true });
    } else if (act === 'faq') {
      var fi = Number(el.getAttribute('data-i'));
      S.faqOpen = S.faqOpen === fi ? -1 : fi;
      render({ keepScroll: true });
    } else if (act === 'prof-toggle') {
      var pk = el.getAttribute('data-key');
      var parts = pk.split(':');
      var prow = ((model.profile.sections || [])[Number(parts[0])] || {}).rows || [];
      var pdef = prow[Number(parts[1])] || {};
      var pcur = store.profile[pk] != null ? !!store.profile[pk] : !!pdef.value;
      store.profile[pk] = !pcur;
      saveStore();
      render({ keepScroll: true });
    } else if (act === 'prof-radio') {
      store.profile[el.getAttribute('data-key')] = el.getAttribute('data-value');
      saveStore();
      render({ keepScroll: true });
    } else if (act === 'rev-open') {
      S.reviewOpen = true;
      render({ keepScroll: true });
    } else if (act === 'rev-cancel') {
      S.reviewOpen = false;
      S.reviewStars = 0;
      render({ keepScroll: true });
    } else if (act === 'rev-star') {
      S.reviewStars = Number(el.getAttribute('data-i')) || 0;
      render({ keepScroll: true });
    } else if (act === 'rev-submit') {
      var rRec = selectedRecord();
      var rTxt = $('#rev-text');
      if (rRec && S.reviewStars > 0) {
        if (!store.myReviews[rRec.id]) store.myReviews[rRec.id] = [];
        store.myReviews[rRec.id].unshift({
          name: (model.profile && model.profile.name) || 'You',
          rating: S.reviewStars,
          text: rTxt ? rTxt.value.trim() : '',
          date: 'Just now',
        });
        saveStore();
      }
      S.reviewOpen = false;
      S.reviewStars = 0;
      render({ keepScroll: true });
    } else if (act === 'intro-next') {
      var slides = (model.onboarding && model.onboarding.slides) || [];
      if (S.introStep >= slides.length - 1) {
        store.seenIntro = true;
        saveStore();
        S.introStep = 0;
      } else {
        S.introStep += 1;
      }
      render();
    } else if (act === 'intro-skip') {
      store.seenIntro = true;
      saveStore();
      S.introStep = 0;
      render();
    } else if (act === 'auth-mode') {
      S.authMode = S.authMode === 'up' ? 'in' : 'up';
      S.authError = '';
      render({ keepScroll: true });
    } else if (act === 'auth-remember') {
      S.remember = !S.remember;
      render({ keepScroll: true });
    } else if (act === 'auth-social') {
      store.authed = true;
      saveStore();
      render();
    } else if (act === 'auth-submit') {
      var em = $('#auth-email');
      var pw = $('#auth-pass');
      var emv = em ? em.value.trim() : '';
      var pwv = pw ? pw.value : '';
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(emv)) { S.authError = 'Enter a valid email address.'; render({ keepScroll: true }); return; }
      if (!pwv) { S.authError = 'Enter your password.'; render({ keepScroll: true }); return; }
      S.authError = '';
      store.authed = true;
      saveStore();
      render();
    } else if (act === 'auth-out') {
      store.authed = false;
      saveStore();
      S.view = (layout.views[0] && layout.views[0].id) || 'browse';
      render();
    } else if (act === 'commit') {
      commit();
    }
  });

  document.addEventListener('input', function (e) {
    var el = e.target;
    if (!el.getAttribute) return;
    if (el.getAttribute('data-xf')) {
      var xf = el.getAttribute('data-xf');
      S.filtersX[xf] = Number(el.value);
      var lab = document.querySelector('[data-xfl="' + xf + '"]');
      if (lab) lab.textContent = money(Number(el.value));
      return;
    }
    if (el.getAttribute('data-act') === 'search-input') {
      S.query = el.value;
      render({ keepScroll: true });
      var again = $('[data-act="search-input"]');
      if (again) {
        again.focus();
        try { again.setSelectionRange(again.value.length, again.value.length); } catch (err) {}
      }
    } else if (el.getAttribute('data-act') === 'field') {
      var f = el.getAttribute('data-field');
      S.form[f] = el.value;
      if (S.errors[f]) {
        delete S.errors[f];
        var sec = sectionOf('form-fields');
        var field = sec && sec.binding.fields.filter(function (x) { return x.id === f; })[0];
        var etid = (field && field.errorTestid) || ('error-' + f);
        var errEl = $('[data-testid="' + etid + '"]');
        if (errEl) { errEl.hidden = true; errEl.textContent = ''; }
        el.setAttribute('aria-invalid', 'false');
      }
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && e.target && e.target.getAttribute && e.target.getAttribute('data-act') === 'search-input') {
      S.query = e.target.value;
      render();
    }
  });

  // ------------------------------------------------------------------ boot
  render();
  window.__READY__ = true;
})();
