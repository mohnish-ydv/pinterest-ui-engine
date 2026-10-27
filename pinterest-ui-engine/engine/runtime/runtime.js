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
    var empty = { saved: [], collections: {}, bag: {} };
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return empty;
      var p = JSON.parse(raw);
      if (!p || typeof p !== 'object') return empty;
      return {
        saved: Array.isArray(p.saved) ? p.saved : [],
        collections: p.collections && typeof p.collections === 'object' ? p.collections : {},
        bag: p.bag && typeof p.bag === 'object' ? p.bag : {},
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
      localStorage.setItem(KEY, JSON.stringify(out));
    } catch (e) { /* private mode: the app still works, it just forgets */ }
  }
  function isSaved(id) { return store.saved.indexOf(id) !== -1; }
  function collectionItems(id) { return (store.collections[id] || []).slice(); }

  // ------------------------------------------------------------- the bag
  function bagQty(id) { return (store.bag && store.bag[id]) || 0; }
  function bagEntries() {
    if (!model.bag) return [];
    return Object.keys(store.bag || {}).map(function (id) {
      return { rec: model.records.filter(function (r) { return r.id === id; })[0], qty: store.bag[id] };
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

  var MEDIA = model.media || { baseHue: 243, spread: 0, sat: 30, light: 30 };
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
      return '<div class="wrap"><div class="empty" data-testid="empty-state">' +
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
        return '<article class="card">' +
          '<button class="card-open" data-act="open" data-id="' + esc(rec.id) + '" data-testid="' + esc(s.props.itemTestid) + '">' +
            (s.props.showMedia ? mediaBlock(rec, 'card-media') : '') +
            '<span class="card-body">' +
              '<span class="card-top"><span class="card-title" data-field="' + esc(sTitleF.id) + '" data-record="' + esc(rec.id) + '">' + esc(fmt(sTitleF, rec)) + '</span>' + badge + '</span>' +
              ((sSubF || sMetaFs.length || byRoleAll('facet').length || sStatFs.length) ? '<span class="card-meta">' + byRoleAll('facet').filter(function (f) { return rec[f.id] != null && String(rec[f.id]) !== ''; }).concat(sStatFs).concat(sMetaFs).concat(sSubF ? [sSubF] : []).map(function (f) { return esc(fmt(f, rec)).replace(/ /g, '\u00a0'); }).filter(Boolean).join(' \u00b7 ') + '</span>' : '') +
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
            ? '<button class="card-add" data-act="add" data-id="' + esc(rec.id) + '"' +
              ' data-testid="add-btn" aria-label="Add ' + esc(fmt(sTitleF, rec)) + ' to ' + esc(String(model.bag.label || 'bag').toLowerCase()) + '">' +
              (bagQty(rec.id) ? String(bagQty(rec.id)) : '+') + '</button>'
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
    return '<div class="wrap"><div class="collection ' + (variant === 'card' ? 'is-cards' : 'is-rows') + '"' +
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
    return '<div class="wrap">' +
      (s.props.showMedia ? '<div class="rec-media-wrap">' + mediaBlock(rec, 'rec-media') + saveBtn + '</div>' : '') +
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

  R['form-fields'] = function (s) {
    return '<div class="wrap"><div class="form" data-testid="' + esc(s.props.testid) + '">' +
      (s.binding.fields || []).map(function (f) {
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
        '<div class="empty" data-testid="empty-state"><p>' + esc(s.emptyMessage || 'Nothing here yet.') + '</p></div></div>';
    }
    return '<div class="wrap"><h1 class="page-title">' + esc(s.props.label) + '</h1>' +
      '<div class="cm-list" data-testid="' + esc(s.props.testid) + '">' +
      items.map(function (it) {
        var confirming = S.confirmCancel === it.ref;
        var rows = (s.binding.fields || []).map(function (fid) {
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
        var track = model.bag
          ? '<ol class="track">' + ['Placed', 'Preparing', 'On the way', 'Delivered'].map(function (lb, i) {
              return '<li class="track-step' + (i === 0 ? ' is-done' : '') + '">' +
                '<span class="track-dot"></span><span class="track-lb">' + lb + '</span>' +
                (i === 0 && it.at ? '<span class="track-at">' + esc(it.at) + '</span>' : '') + '</li>';
            }).join('') + '</ol>'
          : '';
        return '<article class="cm-item" data-testid="' + esc(s.props.itemTestid) + '" data-ref="' + esc(it.ref) + '">' +
          '<div class="cm-head"><span class="cm-ref">' + esc(it.ref) + '</span></div>' +
          '<div class="dl">' + rows + '</div>' + track +
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
        return '<article class="bag-item" data-testid="' + esc(s.props.itemTestid) + '" data-id="' + esc(e.rec.id) + '">' +
          mediaBlock(e.rec, 'bag-media') +
          '<div class="bag-info"><span class="bag-name">' + esc(name) + '</span>' +
          '<span class="bag-unit">' + esc(money(unit)) + '</span></div>' +
          '<div class="stepper">' +
          '<button class="step-btn" data-act="bag-dec" data-id="' + esc(e.rec.id) + '" data-testid="bag-dec" aria-label="Remove one">\u2212</button>' +
          '<span class="step-qty" data-testid="bag-qty">' + e.qty + '</span>' +
          '<button class="step-btn" data-act="bag-inc" data-id="' + esc(e.rec.id) + '" data-testid="bag-inc" aria-label="Add one">+</button>' +
          '</div>' +
          '<span class="bag-line">' + esc(money(unit * e.qty)) + '</span>' +
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
    var qty = bagQty(rec.id);
    return '<div class="wrap"><div class="bag-add">' +
      '<button class="cta" data-act="add" data-id="' + esc(rec.id) + '" data-testid="' + esc(s.props.testid) + '">' +
      esc(s.props.label || 'Add to bag') + '</button>' +
      (qty ? '<p class="bag-note">' + qty + ' in your ' + esc(String(model.bag.label || 'bag').toLowerCase()) + '</p>' : '') +
      '</div></div>';
  };

  // ---- M040: the promo banner a product declares for its home ------
  R['promo-banner'] = function (s) {
    var p = s.props;
    var inner = '<div class="promo-txt"><span class="promo-title">' + esc(p.title) + '</span>' +
      (p.subtitle ? '<span class="promo-sub">' + esc(p.subtitle) + '</span>' : '') +
      (p.recordId ? '<button class="promo-btn" data-act="open" data-id="' + esc(p.recordId) + '">' + esc(p.cta || 'Shop now') + '</button>' : '') +
      '</div>';
    var media = p.image
      ? '<span class="promo-media"><img class="media-img" src="' + esc(p.image) + '" alt="" loading="lazy" onerror="this.parentNode.remove()"></span>'
      : '';
    return '<div class="wrap"><div class="promo" data-testid="' + esc(p.testid || 'promo') + '">' + inner + media + '</div></div>';
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
          (model.bag ? '<button class="card-add rel-add" data-act="add" data-id="' + esc(r.id) + '" data-testid="add-btn" aria-label="Add ' + esc(name) + '">' + (bagQty(r.id) ? String(bagQty(r.id)) : '+') + '</button>' : '') +
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
    return '<div class="wrap confirm">' +
      '<div class="confirm-mark" aria-hidden="true">\u2713</div>' +
      '<h1 class="confirm-h">' + esc(s.props.title) + '</h1>' +
      '<p class="confirm-ref">' + esc(s.props.referenceLabel || 'Reference') + ' <strong data-testid="' + esc(s.props.testid) + '">' + esc(c.ref) + '</strong></p>' +
      summary +
      '<div class="confirm-actions">' +
        '<button class="cta" data-act="nav" data-view="' + esc(layout.views[0].id) + '">Back to ' + esc(layout.views[0].id) + '</button>' +
      '</div></div>';
  };

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
      if (model.composition) document.body.classList.add('comp-' + model.composition);
      var stepnav = (view.id === 'detail' || view.id === 'checkout')
        ? main.querySelector('.sect[data-section="steps"] .stepnav') : null;
      if (stepnav) {
        bar.innerHTML = '';
        bar.appendChild(stepnav);
        bar.hidden = false;
        document.body.classList.add('has-actionbar');
      } else {
        bar.innerHTML = '';
        bar.hidden = true;
        document.body.classList.remove('has-actionbar');
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
        return e.qty + ' \u00d7 ' + (titleF ? e.rec[titleF.id] : e.rec.id);
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
      render();
    } else if (act === 'open') {
      S.selectedId = el.getAttribute('data-id');
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
      store.bag[addId] = bagQty(addId) + 1;
      saveStore();
      render({ keepScroll: true });
    } else if (act === 'bag-inc' || act === 'bag-dec') {
      e.preventDefault();
      var bagId = el.getAttribute('data-id');
      var next = bagQty(bagId) + (act === 'bag-inc' ? 1 : -1);
      if (next <= 0) delete store.bag[bagId]; else store.bag[bagId] = next;
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
    } else if (act === 'commit') {
      commit();
    }
  });

  document.addEventListener('input', function (e) {
    var el = e.target;
    if (!el.getAttribute) return;
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
