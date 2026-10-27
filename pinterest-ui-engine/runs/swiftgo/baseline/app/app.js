// SwiftGo BASELINE — ordinary single-pass build. Hand-authored, not generated.
// Same brief, same functional contract, none of the engine's machinery:
// no design-family config, no token gate, no reference-derived palette.
// Its purpose is a fair comparison: if it passes the same suite, functional
// results separate nothing and the difference must be found in rendered
// quality and accessibility.

const DATA = window.__DATA__;
const KEY = 'swiftgo.v1';
const STAGES = ['Order placed', 'Picked up', 'In transit', 'Out for delivery', 'Delivered'];

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const money = (n) => DATA.currency + Math.round(n).toLocaleString('en-IN');
const esc = (s) => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const pkgOf = (id) => DATA.packages.find(p => p.id === id) || DATA.packages[1];
const svcOf = (id) => DATA.services.find(s => s.id === id) || DATA.services[0];

function quote(pkgId, weight, svcId) {
  const p = pkgOf(pkgId), s = svcOf(svcId);
  const extra = Math.max(0, weight - DATA.rates.includedKg) * DATA.rates.perKg;
  return Math.round((p.base + extra) * s.multiplier);
}

let db;
try {
  const raw = localStorage.getItem(KEY);
  db = raw ? JSON.parse(raw) : null;
} catch (e) { db = null; }
if (!db || !Array.isArray(db.shipments)) {
  db = { shipments: DATA.seedShipments.map(s => ({ ...s, cancelled: false, total: quote(s.pkg, s.weight, s.service) })) };
}
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (e) {} };

const statusOf = (s) => s.cancelled ? { label: 'Cancelled', cls: 'is-dead' }
  : s.stage >= 4 ? { label: 'Delivered', cls: 'is-done' }
  : { label: STAGES[s.stage], cls: '' };

let currentView = 'home';
let detailOrigin = 'home';

function showView(name) {
  currentView = name;
  $$('[data-view]').forEach(v => { v.hidden = v.dataset.view !== name; });
  $$('.tabs .tab').forEach(t => t.classList.toggle('on', t.dataset.nav === name));
  window.scrollTo(0, 0);
}

const stepsHTML = (s) => `<div class="steps">${STAGES.map((l, i) => {
  const c = i < s.stage ? 'done' : i === s.stage ? 'current' : '';
  return `<div class="st ${c}"><div class="dot"></div>${esc(l)}</div>`;
}).join('')}</div>`;

const rowHTML = (s) => {
  const st = statusOf(s);
  return `<button class="row" data-testid="shipment-item" data-ref="${esc(s.ref)}">
    <span class="row-main">
      <span class="row-ref">${esc(s.ref)}</span>
      <span class="row-sub">${esc(s.from)} → ${esc(s.to)}</span>
    </span>
    <span class="pill ${st.cls}" data-testid="status-pill">${esc(st.label)}</span>
  </button>`;
};

function renderHome() {
  const active = db.shipments.find(s => !s.cancelled && s.stage < 4);
  $('#active').innerHTML = active ? (() => {
    const st = statusOf(active);
    return `<button class="card" data-testid="shipment-open" data-ref="${esc(active.ref)}">
      <span class="card-top">
        <span class="ref">${esc(active.ref)}</span>
        <span class="pill ${st.cls}" data-testid="status-pill">${esc(st.label)}</span>
      </span>
      <span class="eta" data-testid="eta">${esc(active.eta)}</span>
      <span class="route">${esc(active.from)} → ${esc(active.to)}</span>
      ${stepsHTML(active)}
    </button>`;
  })() : '';

  const recent = db.shipments.slice(0, 4);
  $('#recent').innerHTML = recent.length ? recent.map(rowHTML).join('')
    : `<div class="empty">No shipments yet. Send your first parcel.</div>`;

  $$('[data-testid="shipment-item"]', $('#recent')).forEach(b => b.addEventListener('click', () => openDetail(b.dataset.ref)));
  const open = $('[data-testid="shipment-open"]');
  if (open) open.addEventListener('click', () => openDetail(open.dataset.ref));
  wireNav($('#active')); wireNav($('#recent'));
}

function renderDetail(ref) {
  const s = db.shipments.find(x => x.ref === ref);
  if (!s) { showView('home'); return; }
  const st = statusOf(s), p = pkgOf(s.pkg), sv = svcOf(s.service);
  const done = s.cancelled || s.stage >= 4;

  $('#detail-content').innerHTML = `
    <div class="hero-box">
      <h1 class="hero-status">${esc(st.label)}</h1>
      <div class="eta" data-testid="eta">${esc(s.eta)}</div>
      <div class="ref-line">Tracking reference <strong>${esc(s.ref)}</strong></div>
    </div>
    <div class="map">Route map unavailable offline</div>
    <h2 class="h2">Addresses</h2>
    <div class="addr"><div><strong>Pickup</strong><br>${esc(s.from)}</div><div><strong>Drop</strong><br>${esc(s.to)}</div></div>
    <h2 class="h2">Progress</h2>
    ${s.cancelled
      ? `<div class="addr"><div>This shipment was cancelled.</div></div>`
      : `<div class="tl">${STAGES.map((l, i) => {
          const c = i < s.stage ? 'done' : i === s.stage ? 'current' : '';
          const when = i < s.stage ? 'Completed' : i === s.stage ? s.eta : 'Pending';
          return `<div class="tl-row ${c}" data-testid="timeline-step"><span class="tl-dot"></span><span><span class="tl-name">${esc(l)}</span><br><span class="tl-when">${esc(when)}</span></span></div>`;
        }).join('')}</div>`}
    <h2 class="h2">Details</h2>
    <div class="addr">
      <div><strong>Package</strong><br>${esc(p.name)} · ${s.weight} ${DATA.unit}</div>
      <div><strong>Service</strong><br>${esc(sv.name)}</div>
      <div><strong>Paid</strong><br>${money(s.total || quote(s.pkg, s.weight, s.service))}</div>
    </div>
    ${done ? '' : `<div class="cancel-row" id="cancel-row"><button class="btn-cancel" data-testid="cancel-btn">Cancel shipment</button></div>`}`;

  const cb = $('[data-testid="cancel-btn"]');
  if (cb) cb.addEventListener('click', () => {
    $('#cancel-row').innerHTML = `<span class="cancel-confirm">
      <button class="btn-danger" data-testid="cancel-confirm">Confirm cancel</button>
      <button class="btn-quiet" data-keep="1">Keep</button></span>`;
    $('[data-testid="cancel-confirm"]').addEventListener('click', () => { s.cancelled = true; save(); renderDetail(ref); renderHome(); });
    $('[data-keep]').addEventListener('click', () => renderDetail(ref));
  });
  wireNav($('#detail-content'));
  showView('detail');
}

function openDetail(ref) {
  detailOrigin = currentView === 'shipments' ? 'shipments' : 'home';
  renderDetail(ref);
}

const send = { pkg: 'small', weight: 1.5, service: 'standard' };

function renderPkg() {
  $('#pkg-grid').innerHTML = DATA.packages.map(p => `
    <button class="pkg ${send.pkg === p.id ? 'on' : ''}" data-testid="package-type" data-pkg="${p.id}">
      <span class="pkg-n">${esc(p.name)}</span>
      <span class="pkg-note">${esc(p.note)}</span>
      <span class="pkg-p">${money(p.base)}</span>
    </button>`).join('');
  $$('[data-testid="package-type"]').forEach(b => b.addEventListener('click', () => { send.pkg = b.dataset.pkg; renderPkg(); updateQuote(); }));
}

function renderSvc() {
  $('#svc-row').innerHTML = DATA.services.map(s => `
    <button class="svc ${send.service === s.id ? 'on' : ''}" data-testid="service-type" data-svc="${s.id}">
      <span class="svc-main"><span class="svc-n">${esc(s.name)}</span><span class="svc-note">${esc(s.note)}</span></span>
      <span class="svc-p">${money(quote(send.pkg, send.weight, s.id))}</span>
    </button>`).join('');
  $$('[data-testid="service-type"]').forEach(b => b.addEventListener('click', () => { send.service = b.dataset.svc; renderSvc(); updateQuote(); }));
}

function updateQuote() {
  $('[data-testid="weight-value"]').textContent = send.weight + ' ' + DATA.unit;
  $('[data-testid="quote-total"]').textContent = money(quote(send.pkg, send.weight, send.service));
  $$('[data-testid="service-type"]').forEach(b => { $('.svc-p', b).textContent = money(quote(send.pkg, send.weight, b.dataset.svc)); });
}

const showErr = (id, msg) => { const el = $('[data-testid="' + id + '"]'); if (el) { el.textContent = msg; el.hidden = !msg; } };

function submitSend() {
  const drop = $('#drop').value.trim();
  const phone = $('#phone').value.trim();
  const pickup = $('#pickup').value.trim();
  const dropBad = drop.length < 3;
  const phoneBad = !/^\d{10}$/.test(phone);
  showErr('error-drop', dropBad ? 'Enter the delivery address.' : '');
  showErr('error-phone', phoneBad ? 'Enter a 10-digit mobile number.' : '');
  $('#drop').classList.toggle('bad', dropBad);
  $('#phone').classList.toggle('bad', phoneBad);
  if (dropBad || phoneBad) return;

  const ref = 'SG' + String(Math.floor(100000000 + Math.random() * 899999999));
  const sv = svcOf(send.service);
  db.shipments.unshift({
    ref, from: pickup || ('Home · ' + DATA.location), to: drop,
    pkg: send.pkg, weight: send.weight, service: send.service, stage: 0,
    eta: sv.id === 'express' ? 'Today by 8 PM' : 'In 2–3 business days',
    placed: 'Just now', cancelled: false, total: quote(send.pkg, send.weight, send.service),
  });
  save();
  renderHome();
  renderConfirm(ref);
}

function renderConfirm(ref) {
  const s = db.shipments.find(x => x.ref === ref);
  if (!s) { showView('home'); return; }
  const p = pkgOf(s.pkg), sv = svcOf(s.service);
  $('#confirm-content').innerHTML = `
    <div class="ok-mark">✓</div>
    <h1>Parcel booked</h1>
    <p class="eta">Tracking reference <strong data-testid="confirm-ref">${esc(s.ref)}</strong></p>
    <div class="sum">
      <div><span>Drop</span><strong>${esc(s.to)}</strong></div>
      <div><span>Package</span><strong>${esc(p.name)} · ${s.weight} ${DATA.unit}</strong></div>
      <div><span>Service</span><strong>${esc(sv.name)}</strong></div>
      <div><span>Paid</span><strong>${money(s.total)}</strong></div>
    </div>
    <button class="btn-primary wide" data-track="${esc(s.ref)}">Track this shipment</button>
    <button class="btn-quiet" data-nav="home" style="margin-top:10px">Back to home</button>`;
  const t = $('[data-track]');
  if (t) t.addEventListener('click', () => openDetail(t.dataset.track));
  wireNav($('#confirm-content'));
  showView('confirmation');
}

function renderAll() {
  $('#shipments-content').innerHTML = db.shipments.length
    ? `<div class="list">${db.shipments.map(rowHTML).join('')}</div>`
    : `<div class="empty" data-testid="empty-shipments">No shipments yet. Send your first parcel.</div>`;
  $$('[data-testid="shipment-item"]', $('#shipments-content')).forEach(b => b.addEventListener('click', () => openDetail(b.dataset.ref)));
  wireNav($('#shipments-content'));
  showView('shipments');
}

function wireNav(root) {
  $$('[data-nav]', root).forEach(b => b.addEventListener('click', () => {
    const v = b.dataset.nav;
    if (v === 'home') { renderHome(); showView('home'); }
    else if (v === 'send') { renderPkg(); renderSvc(); updateQuote(); showView('send'); }
    else if (v === 'shipments') renderAll();
  }));
}

document.addEventListener('DOMContentLoaded', () => {
  renderHome();
  renderPkg(); renderSvc(); updateQuote();
  showView('home');

  $('[data-testid="send-open"]').addEventListener('click', () => { renderPkg(); renderSvc(); updateQuote(); showView('send'); });
  $('[data-testid="shipments-open"]').addEventListener('click', () => renderAll());
  $('[data-testid="weight-minus"]').addEventListener('click', () => { send.weight = Math.max(DATA.rates.minWeight, +(send.weight - DATA.rates.weightStep).toFixed(1)); updateQuote(); });
  $('[data-testid="weight-plus"]').addEventListener('click', () => { send.weight = Math.min(DATA.rates.maxWeight, +(send.weight + DATA.rates.weightStep).toFixed(1)); updateQuote(); });
  $('[data-testid="send-submit"]').addEventListener('click', submitSend);

  $('[data-testid="back-btn"]').addEventListener('click', () => {
    if (detailOrigin === 'shipments') renderAll();
    else { renderHome(); showView('home'); }
  });

  const doTrack = () => {
    const q = $('#track-input').value.trim().toUpperCase();
    const err = $('[data-testid="track-error"]');
    if (!q) { err.textContent = 'Enter a tracking reference.'; err.hidden = false; return; }
    const hit = db.shipments.find(s => s.ref.toUpperCase() === q);
    if (!hit) { err.textContent = 'No shipment found for "' + q + '".'; err.hidden = false; return; }
    err.hidden = true;
    openDetail(hit.ref);
  };
  $('[data-testid="track-btn"]').addEventListener('click', doTrack);
  $('#track-input').addEventListener('keydown', e => { if (e.key === 'Enter') doTrack(); });

  wireNav(document);
});
