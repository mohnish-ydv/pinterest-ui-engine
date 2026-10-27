// StayNest BASELINE — ordinary single-pass build. Hand-authored, not generated.
// Same brief and the same derived test plan as the engine output; none of the
// engine's machinery (no design family, no reference analysis, no token gate).
var D = window.__DATA__;
var KEY = 'staynest-baseline-v1';
var S = { view: 'browse', q: '', type: 'All', sel: null, saved: [], slot: null, form: {}, errs: {} };

try { var raw = localStorage.getItem(KEY); if (raw) { var p = JSON.parse(raw); S.saved = p.saved || []; } } catch (e) {}
function persist() { try { localStorage.setItem(KEY, JSON.stringify({ saved: S.saved })); } catch (e) {} }

var $ = function (s) { return document.querySelector(s); };
var money = function (n) { return D.currency + Number(n).toLocaleString('en-IN'); };
var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]; }); };
var init = function (s) { return String(s || '?').split(/\s+/).filter(function (w) { return /^[A-Za-z]/.test(w); }).slice(0, 2).map(function (w) { return w[0].toUpperCase(); }).join(''); };

function visible() {
  var out = D.records.slice();
  if (S.view === 'saved') out = out.filter(function (r) { return S.saved.indexOf(r.id) !== -1; });
  if (S.q) { var q = S.q.toLowerCase(); out = out.filter(function (r) { return (r.name + ' ' + r.area).toLowerCase().indexOf(q) !== -1; }); }
  if (S.type !== 'All') out = out.filter(function (r) { return r.type === S.type; });
  return out;
}
function rec(id) { return D.records.filter(function (r) { return r.id === id; })[0]; }

function card(r) {
  var on = S.saved.indexOf(r.id) !== -1;
  return '<article class="card">' +
    (r.verified ? '<span class="badge">Verified</span>' : '') +
    '<button class="save' + (on ? ' on' : '') + '" data-act="save" data-id="' + r.id + '" data-testid="save-toggle" aria-pressed="' + on + '">' + (on ? '\u2665' : '\u2661') + '</button>' +
    '<button class="cardbtn" data-act="open" data-id="' + r.id + '" data-testid="listing-card">' +
      '<span class="media">' + esc(init(r.name)) + '</span>' +
      '<span class="body"><span class="t card-title">' + esc(r.name) + '</span>' +
      '<span class="s card-sub">' + esc(r.area) + '</span>' +
      '<span class="m">\u2605 ' + r.rating + ' \u00b7 ' + r.reviews + ' reviews</span>' +
      '<span class="p">' + money(r.price) + '/month</span></span>' +
    '</button></article>';
}

function renderBrowse() {
  var list = visible();
  var chips = ['All'].concat(D.types).map(function (t) {
    return '<button class="chip' + (t === S.type ? ' on' : '') + '" data-act="filter" data-value="' + esc(t) + '" data-testid="filter-type" aria-pressed="' + (t === S.type) + '">' + esc(t) + '</button>';
  }).join('');
  var body = list.length ? '<div class="grid" data-testid="listing-list">' + list.map(card).join('') + '</div>'
    : '<div class="empty" data-testid="empty-state">Nothing here yet.</div>';
  $('#main').innerHTML =
    '<h1>' + esc(D.tagline) + '</h1><p class="sub">' + esc(D.subtitle) + '</p>' +
    '<div class="searchrow"><input data-act="q" data-testid="search" placeholder="Search by area or property" value="' + esc(S.q) + '"><button class="btn" data-act="search" data-testid="search-btn">Search</button></div>' +
    '<div class="chips">' + chips + '</div>' + body;
}

function renderDetail() {
  var r = rec(S.sel); if (!r) return;
  var on = S.saved.indexOf(r.id) !== -1;
  $('#main').innerHTML =
    '<button class="btn" data-act="back" data-testid="back-btn" style="background:#fff;color:#6366F1;border:1px solid #E5E7EB">\u2190 Back</button>' +
    '<div class="recmedia">' + esc(init(r.name)) + '</div>' +
    '<h1 class="rectitle" data-testid="detail-title">' + esc(r.name) + '</h1>' +
    '<p class="recsub">' + esc(r.area) + '</p>' +
    '<p class="recmeta">\u2605 ' + r.rating + ' \u00b7 ' + r.reviews + ' reviews</p>' +
    '<p class="recprice" data-testid="detail-price">' + money(r.price) + '/month</p>' +
    '<button class="savewide' + (on ? ' on' : '') + '" data-act="save" data-id="' + r.id + '" data-testid="save-toggle" aria-pressed="' + on + '">' + (on ? '\u2665 Saved' : '\u2661 Save') + '</button>' +
    '<div class="stats" data-testid="stat-strip"><span><strong>' + r.bedrooms + '</strong><small>Bedrooms</small></span><span><strong>' + r.bathrooms + '</strong><small>Bathrooms</small></span></div>' +
    '<div class="dl" data-testid="detail-list">' +
      '<div class="dlrow"><span>Rating</span><span>\u2605 ' + r.rating + '</span></div>' +
      '<div class="dlrow"><span>Reviews</span><span>' + r.reviews + ' reviews</span></div>' +
      '<div class="dlrow"><span>Furnishing</span><span>' + esc(r.furnished) + '</span></div>' +
      '<div class="dlrow"><span>Deposit</span><span>' + money(r.deposit) + '</span></div>' +
      '<div class="dlrow"><span>Amenities</span><span>' + esc(r.amenities.join(' \u00b7 ')) + '</span></div>' +
    '</div>' +
    '<h2>Preferred visit slot</h2><div class="opts">' + D.slots.map(function (sl) {
      return '<button class="opt' + (S.slot === sl ? ' on' : '') + '" data-act="slot" data-value="' + esc(sl) + '" data-testid="option-slot" aria-pressed="' + (S.slot === sl) + '">' + esc(sl) + '</button>';
    }).join('') + '</div>' +
    '<p class="err" data-testid="error-slot"' + (S.errs.slot ? '' : ' hidden') + '>' + esc(S.errs.slot || '') + '</p>' +
    '<div data-testid="form" style="margin-top:18px">' +
      '<div class="fld"><label>Your name</label><input data-act="f" data-f="visitor" data-testid="field-visitor" value="' + esc(S.form.visitor || '') + '"><p class="err" data-testid="error-visitor"' + (S.errs.visitor ? '' : ' hidden') + '>' + esc(S.errs.visitor || '') + '</p></div>' +
      '<div class="fld"><label>Phone number</label><input data-act="f" data-f="phone" data-testid="field-phone" inputmode="numeric" value="' + esc(S.form.phone || '') + '"><p class="err" data-testid="error-phone"' + (S.errs.phone ? '' : ' hidden') + '>' + esc(S.errs.phone || '') + '</p></div>' +
    '</div>' +
    '<button class="cta" data-act="commit" data-testid="primary-action">Book a visit</button>';
}

function renderConfirm(c) {
  $('#main').innerHTML =
    '<div class="confirm"><div class="mark">\u2713</div><h1>Visit booked</h1>' +
    '<p class="cref">Reference <strong data-testid="confirm-ref">' + esc(c.ref) + '</strong></p>' +
    '<div class="dl" data-testid="confirm-summary">' +
      '<div class="dlrow"><span>Property</span><span>' + esc(c.name) + '</span></div>' +
      '<div class="dlrow"><span>Your name</span><span>' + esc(c.visitor) + '</span></div>' +
      '<div class="dlrow"><span>Phone number</span><span>' + esc(c.phone) + '</span></div>' +
      '<div class="dlrow"><span>Preferred visit slot</span><span>' + esc(c.slot) + '</span></div>' +
    '</div>' +
    '<button class="cta" data-act="go" data-view="browse">Back to browse</button></div>';
}

function render(keep) {
  $('#main').dataset.view = S.view;
  if (S.view === 'browse' || S.view === 'saved') renderBrowse();
  else if (S.view === 'detail') renderDetail();
  else if (S.view === 'confirmation') renderConfirm(S.confirm);
  document.querySelectorAll('.tab').forEach(function (t) { t.classList.toggle('on', t.dataset.go === S.view); });
  if (!keep) window.scrollTo(0, 0);
}

document.addEventListener('click', function (e) {
  var el = e.target.closest('[data-act]'); if (!el) return;
  var a = el.dataset.act;
  if (a === 'open') { S.sel = el.dataset.id; S.errs = {}; S.slot = null; S.view = 'detail'; render(); }
  else if (a === 'back') { S.view = 'browse'; render(); }
  else if (a === 'go') { S.view = el.dataset.view; render(); }
  else if (a === 'save') {
    var i = S.saved.indexOf(el.dataset.id);
    if (i === -1) S.saved.push(el.dataset.id); else S.saved.splice(i, 1);
    persist(); render(true);
  }
  else if (a === 'filter') { S.type = el.dataset.value; render(); }
  else if (a === 'search') { S.q = $('[data-testid="search"]').value; render(); }
  else if (a === 'slot') { S.slot = el.dataset.value; S.errs.slot = null; render(true); }
  else if (a === 'commit') {
    var errs = {};
    if (!(S.form.visitor || '').trim() || S.form.visitor.trim().length < 2) errs.visitor = 'Enter your name (at least 2 characters).';
    if (!/^\d{10}$/.test((S.form.phone || '').trim())) errs.phone = 'Enter a 10-digit mobile number.';
    if (!S.slot) errs.slot = 'Choose preferred visit slot.';
    S.errs = errs;
    if (Object.keys(errs).length) { render(true); return; }
    var r = rec(S.sel);
    S.confirm = { ref: 'BV-' + Math.floor(100000 + Math.random() * 899999), name: r.name, visitor: S.form.visitor, phone: S.form.phone, slot: S.slot };
    S.view = 'confirmation'; render();
  }
  else if (el.dataset.go) { S.view = el.dataset.go; render(); }
});
document.addEventListener('input', function (e) {
  var el = e.target;
  if (el.dataset.act === 'q') { S.q = el.value; render(true); var i = $('[data-testid="search"]'); if (i) { i.focus(); try { i.setSelectionRange(i.value.length, i.value.length); } catch (x) {} } }
  else if (el.dataset.act === 'f') { S.form[el.dataset.f] = el.value; }
});
render();
