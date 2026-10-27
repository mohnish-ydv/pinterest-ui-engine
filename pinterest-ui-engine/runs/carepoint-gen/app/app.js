// runtime.js — the generic app runtime. Copied verbatim into every generated app.
//
// MISSION 021. This file contains no app name, no entity name, no field name
// and no colour. It reads window.__APP__ = { layout, model } and renders
// whatever the planner decided. That is what makes "generated, not
// hand-authored" true: a new app is new data, not new code.
//
// Design decisions worth stating:
//
//  * ONE VIEW IS IN THE DOM AT A TIME. The runtime replaces the contents of
//    <main> when the view changes, so a testid can be reused across views
//    without ambiguity. Mission 020 found that duplicate testids across
//    simultaneously-present views made selectors resolve to hidden nodes and
//    produced silently wrong measurements; this removes that defect class by
//    construction rather than by discipline.
//
//  * ALL INTERACTION IS DELEGATED. Every control carries data-act; one
//    listener on the document handles it. Re-rendering never loses a handler.
//
//  * PERSISTENCE IS EXPLICIT. Only the collections named in
//    model.persistence.collections are written to localStorage.
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
  var mediaF = byRole('media');
  var metaFs = byRoleAll('meta');

  function fmt(field, rec) {
    if (!field) return '';
    var v = rec ? rec[field.id] : null;
    if (v === null || v === undefined || v === '') return '';
    switch (field.type) {
      case 'money': return money(v) + (field.suffix || '');
      case 'number': return String(v) + (field.suffix || '');
      case 'rating': return '\u2605 ' + Number(v).toFixed(1);
      case 'bool': return v ? (field.trueLabel || 'Yes') : '';
      case 'list': return Array.isArray(v) ? v.join(' \u00b7 ') : String(v);
      default: return String(v);
    }
  }
  function initials(s) {
    // Only words that START with a letter contribute. "Sunlit 2BHK in
    // Indiranagar" must not yield "S2".
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
    var empty = { saved: [], collections: {} };
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return empty;
      var p = JSON.parse(raw);
      if (!p || typeof p !== 'object') return empty;
      return { saved: Array.isArray(p.saved) ? p.saved : [], collections: p.collections && typeof p.collections === 'object' ? p.collections : {} };
    } catch (e) { return empty; }
  }
  function saveStore() {
    try {
      var out = { collections: {} };
      if (PERSIST.indexOf('saved') !== -1) out.saved = store.saved;
      PERSIST.forEach(function (c) {
        if (c !== 'saved') out.collections[c] = store.collections[c] || [];
      });
      localStorage.setItem(KEY, JSON.stringify(out));
    } catch (e) { /* private mode: the app still works, it just forgets */ }
  }
  function isSaved(id) { return store.saved.indexOf(id) !== -1; }

  // ---------------------------------------------------------------- state
  var S = {
    view: (layout.views[0] && layout.views[0].id) || 'browse',
    query: '',
    filters: {},
    selectedId: null,
    form: {},
    errors: {},
    options: {},
    confirmation: null,
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

  // ------------------------------------------------------------ components
  var R = {};

  R['app-header'] = function (s) {
    var back = s.props.back;
    return '<div class="wrap hdr-in">' +
      (back
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
      '<input type="search" data-act="search-input" data-testid="' + esc(t) + '" value="' + esc(S.query) + '" placeholder="' + esc(s.props.placeholder) + '">' +
      '</label>' +
      '<button class="search-btn" data-act="search" data-testid="' + esc(t) + '-btn">Search</button>' +
      '</div></div>';
  };

  R['filter-chips'] = function (s) {
    var opts = ['All'].concat(s.binding.options || []);
    var fid = s.binding.filterId || s.binding.field;
    var active = S.filters[fid] || 'All';
    return '<div class="wrap"><div class="chips" role="group" aria-label="' + esc(s.props.label) + '">' +
      opts.map(function (o) {
        var on = o === active;
        return '<button class="chip' + (on ? ' chip-on' : '') + '" data-act="filter" data-filter="' + esc(fid) + '"' +
          ' data-value="' + esc(o) + '" data-testid="' + esc(s.props.testid) + '" aria-pressed="' + on + '">' + esc(o) + '</button>';
      }).join('') +
      '</div></div>';
  };

  var MEDIA = model.media || { baseHue: 243, spread: 0, sat: 30, light: 30 };
  function mediaBlock(rec, cls) {
    var seed = String(rec.id || '');
    var span = MEDIA.spread * 2 + 1;
    var hsh = hashOf(seed);
    var hue = ((MEDIA.baseHue + (hsh % span) - MEDIA.spread) + 360) % 360;
    // Vary the value a little too, so two records that land on similar hues
    // are still distinguishable at a glance.
    var light = MEDIA.light + ((hsh >> 8) % 3) * 3 - 3;
    var label = titleF ? rec[titleF.id] : rec.id;
    return '<span class="' + cls + '" style="--media-hue:' + hue + ';--media-sat:' + MEDIA.sat +
      '%;--media-light:' + light + '%" aria-hidden="true">' +
      '<span class="media-mark">' + esc(initials(label)) + '</span></span>';
  }

  R['entity-collection'] = function (s) {
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
      var badge = badgeF && rec[badgeF.id] ? '<span class="badge">' + esc(fmt(badgeF, rec)) + '</span>' : '';
      var status = statusF && rec[statusF.id] ? '<span class="pill">' + esc(fmt(statusF, rec)) + '</span>' : '';
      if (variant === 'card') {
        return '<article class="card">' +
          '<button class="card-open" data-act="open" data-id="' + esc(rec.id) + '" data-testid="' + esc(s.props.itemTestid) + '">' +
            (s.props.showMedia ? mediaBlock(rec, 'card-media') : '') +
            '<span class="card-body">' +
              '<span class="card-top"><span class="card-title">' + esc(fmt(titleF, rec)) + '</span>' + badge + '</span>' +
              (subF ? '<span class="card-sub">' + esc(fmt(subF, rec)) + '</span>' : '') +
              (metaFs.length ? '<span class="card-meta">' + metaFs.map(function (f) { return esc(fmt(f, rec)); }).filter(Boolean).join(' \u00b7 ') + '</span>' : '') +
              (priceF ? '<span class="card-price">' + esc(fmt(priceF, rec)) + '</span>' : '') +
            '</span>' +
          '</button>' +
          (s.props.showSave
            ? '<button class="save-btn' + (saved ? ' is-on' : '') + '" data-act="toggle" data-id="' + esc(rec.id) + '"' +
              ' data-testid="' + esc(s.props.saveTestid || 'save-toggle') + '" aria-pressed="' + saved + '"' +
              ' aria-label="' + (saved ? 'Remove from saved' : 'Save') + '">' + (saved ? '\u2665' : '\u2661') + '</button>'
            : '') +
          '</article>';
      }
      return '<article class="row">' +
        '<button class="row-open" data-act="open" data-id="' + esc(rec.id) + '" data-testid="' + esc(s.props.itemTestid) + '">' +
          '<span class="row-chip" aria-hidden="true">' + esc(initials(fmt(titleF, rec))) + '</span>' +
          '<span class="row-main"><span class="row-title">' + esc(fmt(titleF, rec)) + '</span>' +
          (subF ? '<span class="row-sub">' + esc(fmt(subF, rec)) + '</span>' : '') + '</span>' +
          status + '<span class="row-chev" aria-hidden="true">\u203a</span>' +
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
    return '<div class="wrap">' +
      (s.props.showMedia ? mediaBlock(rec, 'rec-media') : '') +
      '<div class="rec-head">' +
        '<h1 class="rec-title" data-testid="detail-title">' + esc(fmt(titleF, rec)) + '</h1>' +
        (subF ? '<p class="rec-sub">' + esc(fmt(subF, rec)) + '</p>' : '') +
        (metaFs.length ? '<p class="rec-meta">' + metaFs.map(function (f) { return esc(fmt(f, rec)); }).filter(Boolean).join(' \u00b7 ') + '</p>' : '') +
        (priceF ? '<p class="rec-price" data-testid="detail-price">' + esc(fmt(priceF, rec)) + '</p>' : '') +
        (statusF && rec[statusF.id] ? '<p><span class="pill">' + esc(fmt(statusF, rec)) + '</span></p>' : '') +
      '</div>' +
      (s.props.showSave
        ? '<button class="save-btn wide' + (saved ? ' is-on' : '') + '" data-act="toggle" data-id="' + esc(rec.id) + '"' +
          ' data-testid="' + esc(s.props.saveTestid || 'save-toggle') + '" aria-pressed="' + saved + '">' +
          (saved ? '\u2665 Saved' : '\u2661 Save') + '</button>'
        : '') +
      '</div>';
  };

  R['stat-strip'] = function (s) {
    var rec = selectedRecord();
    if (!rec) return '';
    var items = (s.binding.fields || []).map(function (id) {
      var f = FIELDS[id];
      return '<span><strong>' + esc(fmt(f, rec)) + '</strong><small>' + esc(f.label || f.id) + '</small></span>';
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
      return '<div class="dl-row"><span class="dl-label">' + esc(f.label || f.id) + '</span><span class="dl-value">' + esc(v) + '</span></div>';
    }).join('');
    if (!rows) return '';
    return '<div class="wrap"><div class="dl" data-testid="' + esc(s.props.testid) + '">' + rows + '</div></div>';
  };

  R['option-grid'] = function (s) {
    var id = s.binding.field;
    var cur = S.options[id];
    var err = S.errors[id];
    // A required choice needs an error slot of its own. The derived test plan
    // caught this missing: validate() set the error, but nothing rendered it,
    // so a required option could be skipped silently.
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

  R['form-fields'] = function (s) {
    return '<div class="wrap"><div class="form" data-testid="' + esc(s.props.testid) + '">' +
      (s.binding.fields || []).map(function (f) {
        var err = S.errors[f.id];
        return '<div class="field">' +
          '<label for="f-' + esc(f.id) + '">' + esc(f.label) + '</label>' +
          '<input id="f-' + esc(f.id) + '" data-act="field" data-field="' + esc(f.id) + '" data-testid="field-' + esc(f.id) + '"' +
          ' type="' + esc(f.type === 'tel' ? 'tel' : 'text') + '"' + (f.type === 'tel' ? ' inputmode="numeric"' : '') +
          ' value="' + esc(S.form[f.id] || '') + '"' + (f.placeholder ? ' placeholder="' + esc(f.placeholder) + '"' : '') +
          ' aria-invalid="' + (err ? 'true' : 'false') + '"' + (err ? ' aria-describedby="e-' + esc(f.id) + '"' : '') +
          (f.required ? ' required' : '') + '>' +
          '<p class="err" id="e-' + esc(f.id) + '" data-testid="error-' + esc(f.id) + '"' + (err ? '' : ' hidden') + '>' + esc(err || '') + '</p>' +
          '</div>';
      }).join('') + '</div></div>';
  };

  R['primary-action'] = function (s) {
    var rec = selectedRecord();
    var amount = '';
    if (s.props.showAmount && rec && s.binding.amountField) {
      var f = FIELDS[s.binding.amountField];
      amount = ' \u00b7 ' + fmt(f, rec);
    }
    return '<div class="wrap"><button class="cta" data-act="commit" data-testid="' + esc(s.props.testid) + '">' +
      esc(s.props.label) + esc(amount) + '</button></div>';
  };

  R['confirmation'] = function (s) {
    var c = S.confirmation;
    if (!c) return '<div class="wrap"><div class="empty"><p>Nothing to confirm.</p></div></div>';
    var rec = c.record;
    var summary = '';
    if (rec) {
      summary = '<div class="dl" data-testid="' + esc(s.props.summaryTestid || 'confirm-summary') + '">' +
        (titleF ? '<div class="dl-row"><span class="dl-label">' + esc(titleF.label || 'Item') + '</span><span class="dl-value">' + esc(fmt(titleF, rec)) + '</span></div>' : '') +
        Object.keys(c.booking || {}).filter(function (k) { return ['ref', 'id', 'at'].indexOf(k) === -1; }).map(function (k) {
          var label = (model.fieldLabels && model.fieldLabels[k]) || (FIELDS[k] && FIELDS[k].label) || k;
          return '<div class="dl-row"><span class="dl-label">' + esc(label) + '</span><span class="dl-value">' + esc(c.booking[k]) + '</span></div>';
        }).join('') +
        '</div>';
    }
    return '<div class="wrap confirm">' +
      '<div class="confirm-mark" aria-hidden="true">\u2713</div>' +
      '<h1 class="confirm-h">' + esc(s.props.title) + '</h1>' +
      '<p class="confirm-ref">Reference <strong data-testid="' + esc(s.props.testid) + '">' + esc(c.ref) + '</strong></p>' +
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

  function renderTabs() {
    var tabs = $('#tabs');
    if (!tabs) return;
    tabs.innerHTML = layout.navigation.items.map(function (it) {
      var on = it.view === S.view;
      return '<button class="tab' + (on ? ' tab-on' : '') + '" data-act="nav" data-view="' + esc(it.view) + '"' +
        ' data-testid="' + esc(it.id) + '"' + (on ? ' aria-current="page"' : '') + '>' + esc(it.label) + '</button>';
    }).join('');
  }

  function render(opts) {
    opts = opts || {};
    var view = currentView();
    S.view = view.id;
    renderHeader(view);
    renderTabs();

    var main = $('#main');
    main.dataset.view = view.id;
    main.innerHTML = view.sections
      .filter(function (s) { return s.component !== 'app-header'; })
      .map(function (s) {
        var fn = R[s.component];
        if (!fn) return '<!-- unknown component: ' + esc(s.component) + ' -->';
        var out = fn(s);
        // every non-header section is wrapped so spacing is uniform
        return out ? '<section class="sect" data-section="' + esc(s.id) + '">' + out + '</section>' : '';
      }).join('');

    if (opts.focus) {
      var el = $('#' + opts.focus);
      if (el) { el.focus(); }
    }
    if (!opts.keepScroll) window.scrollTo(0, 0);
  }

  // --------------------------------------------------------------- actions
  function validate() {
    var action = commitAction();
    if (!action) return true;
    var errs = {};
    (action.form || []).forEach(function (f) {
      var v = String(S.form[f.id] || '').trim();
      if (f.required && !v) { errs[f.id] = f.message || (f.label + ' is required.'); return; }
      if (v && f.minLength && v.length < f.minLength) { errs[f.id] = f.message || (f.label + ' is too short.'); return; }
      if (v && f.pattern && !new RegExp(f.pattern).test(v)) { errs[f.id] = f.message || (f.label + ' is not valid.'); }
    });
    if (action.options && action.options.required && !S.options[action.options.id]) {
      errs[action.options.id] = 'Choose ' + String(action.options.label || 'an option').toLowerCase() + '.';
    }
    S.errors = errs;
    return Object.keys(errs).length === 0;
  }

  function commit() {
    if (!validate()) { render({ keepScroll: true }); focusFirstError(); return; }
    var action = commitAction();
    var rec = selectedRecord();
    if (!action || !rec) return;
    var prefix = (action.result && action.result.referencePrefix) || 'REF';
    var ref = prefix + '-' + String(Math.floor(100000 + Math.random() * 899999));
    var booking = { ref: ref, id: rec.id, at: new Date().toISOString().slice(0, 10) };
    (action.form || []).forEach(function (f) { booking[f.id] = S.form[f.id]; });
    if (action.options) booking[action.options.id] = S.options[action.options.id];

    var coll = (action.result && action.result.collection) || 'commits';
    store.collections[coll] = [booking].concat(store.collections[coll] || []);
    saveStore();

    S.confirmation = { ref: ref, booking: booking, record: rec };
    S.errors = {};
    S.view = 'confirmation';
    render();
  }

  function focusFirstError() {
    var first = Object.keys(S.errors)[0];
    if (!first) return;
    var el = $('[data-testid="error-' + first + '"]');
    if (el && el.scrollIntoView) el.scrollIntoView({ block: 'center' });
  }

  function toggleSave(id) {
    var i = store.saved.indexOf(id);
    if (i === -1) store.saved.push(id); else store.saved.splice(i, 1);
    saveStore();
    render({ keepScroll: true });
  }

  document.addEventListener('click', function (e) {
    var el = e.target.closest ? e.target.closest('[data-act]') : null;
    if (!el) return;
    var act = el.getAttribute('data-act');
    if (act === 'nav') {
      S.view = el.getAttribute('data-view');
      render();
    } else if (act === 'open') {
      S.selectedId = el.getAttribute('data-id');
      S.errors = {};
      S.view = 'detail';
      render();
    } else if (act === 'back') {
      S.view = layout.views[0].id;
      render();
    } else if (act === 'toggle') {
      e.preventDefault();
      toggleSave(el.getAttribute('data-id'));
    } else if (act === 'filter') {
      S.filters[el.getAttribute('data-filter')] = el.getAttribute('data-value');
      render();
    } else if (act === 'search') {
      var inp = $('[data-act="search-input"]');
      S.query = inp ? inp.value : S.query;
      render();
    } else if (act === 'reset') {
      S.query = '';
      (model.filters || []).forEach(function (f) { S.filters[f.id] = 'All'; });
      render();
    } else if (act === 'option') {
      S.options[el.getAttribute('data-option')] = el.getAttribute('data-value');
      render();
    } else if (act === 'commit') {
      commit();
    }
  });

  // Live search. Re-rendering would drop focus, so the caret is restored.
  document.addEventListener('input', function (e) {
    var el = e.target;
    if (el.getAttribute && el.getAttribute('data-act') === 'search-input') {
      S.query = el.value;
      render({ keepScroll: true });
      var again = $('[data-act="search-input"]');
      if (again) {
        again.focus();
        try { again.setSelectionRange(again.value.length, again.value.length); } catch (err) {}
      }
    } else if (el.getAttribute && el.getAttribute('data-act') === 'field') {
      S.form[el.getAttribute('data-field')] = el.value;
      var f = el.getAttribute('data-field');
      if (S.errors[f]) {
        delete S.errors[f];
        var errEl = $('[data-testid="error-' + f + '"]');
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
