// app.js — SwiftGo. Vanilla JS, localStorage, no dependencies.
// Reads window.__DATA__ (the brief, injected by generate.mjs).
// This file is copied verbatim by generate.mjs — it contains no tokens, so
// all styling lives in the generated styles.css.

const DATA = window.__DATA__;
const KEY = 'swiftgo.v1';
const STAGES = ['Order placed', 'Picked up', 'In transit', 'Out for delivery', 'Delivered'];

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const money = (n) => DATA.currency + Math.round(n).toLocaleString('en-IN');
const esc = (s) => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const pkgOf = (id) => DATA.packages.find(p => p.id === id) || DATA.packages[1];
const svcOf = (id) => DATA.services.find(s => s.id === id) || DATA.services[0];

// ---- persistence ---------------------------------------------------------
function seed() {
  return {
    shipments: DATA.seedShipments.map(s => ({
      ...s,
      cancelled: false,
      total: quote(s.pkg, s.weight, s.service),
    })),
  };
}
function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.shipments)) return parsed;
    }
  } catch (e) { /* corrupt storage falls back to seed */ }
  return seed();
}
let db = load();
function save() { try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (e) { /* private mode */ } }

function statusOf(s) {
  if (s.cancelled) return { label: 'Cancelled', cls: 'is-dead' };
  if (s.stage >= 4) return { label: 'Delivered', cls: 'is-done' };
  return { label: STAGES[s.stage], cls: '' };
}

// ---- pricing -------------------------------------------------------------
function quote(pkgId, weight, svcId) {
  const p = pkgOf(pkgId);
  const s = svcOf(svcId);
  const extra = Math.max(0, weight - DATA.rates.includedKg) * DATA.rates.perKg;
  return Math.round((p.base + extra) * s.multiplier);
}

// ---- view switching ------------------------------------------------------
let currentView = 'home';
let detailOrigin = 'home';

function showView(name) {
  currentView = name;
  $$('[data-view]').forEach(v => { v.hidden = v.dataset.view !== name; });
  $$('.tabbar .tab').forEach(t => t.classList.toggle('tab-on', t.dataset.nav === name));
  window.scrollTo(0, 0);
}

// ---- shared fragments ----------------------------------------------------
function stepperH(s) {
  return `<div class="stepper-h" role="list">${STAGES.map((label, i) => {
    const cls = i < s.stage ? 'done' : i === s.stage ? 'current' : '';
    return `<div class="step ${cls}" role="listitem">
      <span class="node" aria-hidden="true">${i < s.stage ? '✓' : ''}</span>
      <span class="step-label">${esc(label)}</span>
    </div>`;
  }).join('')}</div>`;
}

function rowHTML(s) {
  const st = statusOf(s);
  const p = pkgOf(s.pkg);
  return `<button class="row" data-testid="shipment-item" data-ref="${esc(s.ref)}">
    <span class="row-chip" aria-hidden="true">▣</span>
    <span class="row-main">
      <span class="row-ref">${esc(s.ref)}</span>
      <span class="row-sub">${esc(s.from)} → ${esc(s.to)}</span>
    </span>
    <span class="status-pill ${st.cls}" data-testid="status-pill">${esc(st.label)}</span>
    <span class="row-chev" aria-hidden="true">›</span>
  </button>`;
}

// ---- home ----------------------------------------------------------------
function renderHome() {
  const active = db.shipments.find(s => !s.cancelled && s.stage < 4);

  $('#active').innerHTML = active ? (() => {
    const st = statusOf(active);
    return `<button class="ship-card" data-testid="shipment-open" data-ref="${esc(active.ref)}">
      <span class="ship-card-top">
        <span class="ship-ref" data-testid="shipment-card">${esc(active.ref)}</span>
        <span class="status-pill ${st.cls}" data-testid="status-pill">${esc(st.label)}</span>
      </span>
      <span class="ship-eta" data-testid="eta">${esc(active.eta)}</span>
      <span class="ship-route">${esc(active.from)} <span class="arrow" aria-hidden="true">→</span> ${esc(active.to)}</span>
      ${stepperH(active)}
    </button>`;
  })() : '';

  const recent = db.shipments.slice(0, 4);
  $('#recent').innerHTML = recent.length
    ? recent.map(rowHTML).join('')
    : `<div class="empty"><h2>No shipments yet</h2><p>Send your first parcel and it will show up here.</p><button class="cta" data-nav="send">Send a parcel</button></div>`;

  wireRows($('#recent'));
  const open = $('[data-testid="shipment-open"]');
  if (open) open.addEventListener('click', () => openDetail(open.dataset.ref));
  wireNav($('#active'));
  wireNav($('#recent'));
}

// ---- detail --------------------------------------------------------------
function renderDetail(ref) {
  const s = db.shipments.find(x => x.ref === ref);
  if (!s) { showView('home'); return; }
  const st = statusOf(s);
  const p = pkgOf(s.pkg);
  const sv = svcOf(s.service);
  const done = s.cancelled || s.stage >= 4;

  $('#detail-content').innerHTML = `
    <section class="status-hero">
      <div class="status-hero-top">
        <span class="hero-icon" aria-hidden="true">▣</span>
        <div>
          <h1 class="hero-status">${esc(st.label)}</h1>
          <div class="hero-eta" data-testid="eta">${esc(s.eta)}</div>
        </div>
      </div>
      <div class="ref-line">Tracking reference <strong>${esc(s.ref)}</strong></div>
    </section>

    <div class="route">
      <svg viewBox="0 0 320 120" role="img" aria-label="Route progress: ${esc(s.from)} to ${esc(s.to)}">
        <path d="M22 96 C 90 96, 110 34, 176 34 S 268 46, 298 24" fill="none" stroke="rgba(255,255,255,0.22)" stroke-width="4" stroke-linecap="round"/>
        <path d="M22 96 C 90 96, 110 34, 176 34" fill="none" class="route-done" stroke-width="4" stroke-linecap="round"/>
        <circle class="route-pin-start" cx="22" cy="96" r="6"/>
        <circle cx="298" cy="24" r="7" fill="#FFFFFF"/>
        <circle class="route-pin-end" cx="298" cy="24" r="3"/>
        <circle cx="176" cy="34" r="5" fill="#FFFFFF"/>
      </svg>
      <div class="route-caption"><span>${esc(s.from)}</span><span>${esc(s.to)}</span></div>
    </div>

    <h2 class="block-title">Addresses</h2>
    <div class="addr">
      <div class="addr-line"><span class="addr-dot" aria-hidden="true"></span><span><span class="addr-label">Pickup</span><br>${esc(s.from)}</span></div>
      <div class="addr-line"><span class="addr-dot end" aria-hidden="true"></span><span><span class="addr-label">Drop</span><br>${esc(s.to)}</span></div>
    </div>

    <h2 class="block-title">Progress</h2>
    ${s.cancelled
      ? `<div class="addr"><div class="addr-line"><span class="addr-dot" aria-hidden="true"></span><span>This shipment was cancelled. No further movement will be recorded.</span></div></div>`
      : `<div class="timeline">
          ${STAGES.map((label, i) => {
            const cls = i < s.stage ? 'done' : i === s.stage ? 'current' : '';
            const when = i < s.stage ? 'Completed' : i === s.stage ? s.eta : 'Pending';
            return `<div class="tl-step ${cls}" data-testid="timeline-step">
              <span class="tl-node" aria-hidden="true">${i < s.stage ? '✓' : i === s.stage ? '•' : ''}</span>
              <span class="tl-body"><span class="tl-name">${esc(label)}</span><span class="tl-when">${esc(when)}</span></span>
            </div>`;
          }).join('')}
        </div>`}

    <h2 class="block-title">Details</h2>
    <div class="addr">
      <div class="addr-line"><span><span class="addr-label">Package</span><br>${esc(p.name)} · ${s.weight} ${DATA.unit}</span></div>
      <div class="addr-line"><span><span class="addr-label">Service</span><br>${esc(sv.name)} · ${esc(sv.note)}</span></div>
      <div class="addr-line"><span><span class="addr-label">Paid</span><br>${money(s.total || quote(s.pkg, s.weight, s.service))}</span></div>
      <div class="addr-line"><span><span class="addr-label">Booked</span><br>${esc(s.placed)}</span></div>
    </div>

    ${done ? '' : `<div class="cancel-row" id="cancel-row">
      <button class="btn-cancel" data-testid="cancel-btn">Cancel shipment</button>
    </div>`}
  `;

  const cancelBtn = $('[data-testid="cancel-btn"]');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      $('#cancel-row').innerHTML = `<span class="cancel-confirm">
        <button class="btn-danger" data-testid="cancel-confirm">Confirm cancel</button>
        <button class="btn-quiet" data-keep="1">Keep shipment</button>
      </span>`;
      $('[data-testid="cancel-confirm"]').addEventListener('click', () => {
        s.cancelled = true;
        save();
        renderDetail(ref);
        renderHome();
      });
      $('[data-keep]').addEventListener('click', () => renderDetail(ref));
    });
  }
  wireNav($('#detail-content'));
  showView('detail');
}

function openDetail(ref) {
  // Remember where the user came from so the detail view's Back button
  // returns there. (Mission 020: rendered inspection caught this Back button
  // doing nothing at all — it was in static markup and never wired — which
  // silently produced two mislabelled screenshots.)
  detailOrigin = currentView === 'shipments' ? 'shipments' : 'home';
  renderDetail(ref);
}

function goBack() {
  if (detailOrigin === 'shipments') { renderAll(); }
  else { renderHome(); showView('home'); }
}

// ---- send ----------------------------------------------------------------
const sendState = { pkg: 'small', weight: 1.5, service: 'standard' };

function renderPkgGrid() {
  $('#pkg-grid').innerHTML = DATA.packages.map(p => `
    <button class="pkg ${sendState.pkg === p.id ? 'pkg-on' : ''}" data-testid="package-type" data-pkg="${p.id}" aria-pressed="${sendState.pkg === p.id}">
      <span class="pkg-name">${esc(p.name)}</span>
      <span class="pkg-note">${esc(p.note)}</span>
      <span class="pkg-price">${money(p.base)}</span>
    </button>`).join('');
  $$('[data-testid="package-type"]').forEach(b => b.addEventListener('click', () => {
    sendState.pkg = b.dataset.pkg;
    renderPkgGrid(); updateQuote();
  }));
}

function renderSvc() {
  $('#svc-row').innerHTML = DATA.services.map(s => `
    <button class="svc ${sendState.service === s.id ? 'svc-on' : ''}" data-testid="service-type" data-svc="${s.id}" aria-pressed="${sendState.service === s.id}">
      <span class="svc-radio" aria-hidden="true"></span>
      <span class="svc-main"><span class="svc-name">${esc(s.name)}</span><span class="svc-note">${esc(s.note)}</span></span>
      <span class="svc-price">${money(quote(sendState.pkg, sendState.weight, s.id))}</span>
    </button>`).join('');
  $$('[data-testid="service-type"]').forEach(b => b.addEventListener('click', () => {
    sendState.service = b.dataset.svc;
    renderSvc(); updateQuote();
  }));
}

function updateQuote() {
  $('[data-testid="weight-value"]').textContent = sendState.weight + ' ' + DATA.unit;
  $('[data-testid="quote-total"]').textContent = money(quote(sendState.pkg, sendState.weight, sendState.service));
  $('[data-testid="weight-minus"]').disabled = sendState.weight <= DATA.rates.minWeight;
  $('[data-testid="weight-plus"]').disabled = sendState.weight >= DATA.rates.maxWeight;
  // Service prices depend on the current package/weight, so re-render them.
  $$('[data-testid="service-type"]').forEach(b => {
    $('.svc-price', b).textContent = money(quote(sendState.pkg, sendState.weight, b.dataset.svc));
  });
}

function showError(id, msg) {
  const el = $('[data-testid="' + id + '"]');
  if (!el) return;
  el.textContent = msg;
  el.hidden = !msg;
}
function markBad(sel, bad) { $(sel).classList.toggle('input-bad', !!bad); }

function renderSend() {
  renderPkgGrid();
  renderSvc();
  updateQuote();
  showView('send');
}

function submitSend() {
  const drop = $('#drop').value.trim();
  const phone = $('#phone').value.trim();
  const pickup = $('#pickup').value.trim();

  const dropBad = drop.length < 3;
  const phoneBad = !/^\d{10}$/.test(phone);
  showError('error-drop', dropBad ? 'Enter the delivery address.' : '');
  showError('error-phone', phoneBad ? 'Enter a 10-digit mobile number.' : '');
  markBad('#drop', dropBad);
  markBad('#phone', phoneBad);
  if (dropBad || phoneBad) {
    ($('[data-testid="error-drop"]').hidden ? $('[data-testid="error-phone"]') : $('[data-testid="error-drop"]')).scrollIntoView({ block: 'center' });
    return;
  }

  const total = quote(sendState.pkg, sendState.weight, sendState.service);
  const ref = 'SG' + String(Math.floor(100000000 + Math.random() * 899999999));
  const sv = svcOf(sendState.service);
  const ship = {
    ref,
    from: pickup || ('Home · ' + DATA.location),
    to: drop,
    pkg: sendState.pkg,
    weight: sendState.weight,
    service: sendState.service,
    stage: 0,
    eta: svcOf(sendState.service).id === 'express' ? 'Today by 8 PM' : 'In 2–3 business days',
    placed: 'Just now',
    cancelled: false,
    total,
  };
  db.shipments.unshift(ship);
  save();
  renderHome();
  renderConfirm(ref);
}

// ---- confirmation --------------------------------------------------------
function renderConfirm(ref) {
  const s = db.shipments.find(x => x.ref === ref);
  if (!s) { showView('home'); return; }
  const p = pkgOf(s.pkg);
  const sv = svcOf(s.service);
  $('#confirm-content').innerHTML = `
    <div class="confirm-mark" aria-hidden="true">✓</div>
    <h1 class="confirm-h">Parcel booked</h1>
    <p class="confirm-ref">Tracking reference <strong data-testid="confirm-ref">${esc(s.ref)}</strong></p>
    <div class="summary">
      <div><span>Drop</span><strong>${esc(s.to)}</strong></div>
      <div><span>Package</span><strong>${esc(p.name)} · ${s.weight} ${DATA.unit}</strong></div>
      <div><span>Service</span><strong>${esc(sv.name)}</strong></div>
      <div><span>Paid</span><strong>${money(s.total)}</strong></div>
    </div>
    <div class="confirm-actions">
      <button class="cta" data-track="${esc(s.ref)}">Track this shipment</button>
      <button class="btn-quiet" data-nav="home">Back to home</button>
    </div>`;
  const t = $('[data-track]');
  if (t) t.addEventListener('click', () => openDetail(t.dataset.track));
  wireNav($('#confirm-content'));
  showView('confirmation');
}

// ---- all shipments -------------------------------------------------------
function renderAll() {
  $('#shipments-content').innerHTML = db.shipments.length
    ? db.shipments.map(rowHTML).join('')
    : `<div class="empty" data-testid="empty-shipments"><h2>No shipments yet</h2><p>Send your first parcel and it will show up here.</p><button class="cta" data-nav="send">Send a parcel</button></div>`;
  wireRows($('#shipments-content'));
  wireNav($('#shipments-content'));
  showView('shipments');
}

// ---- wiring --------------------------------------------------------------
function wireRows(root) {
  $$('[data-testid="shipment-item"]', root).forEach(b => b.addEventListener('click', () => openDetail(b.dataset.ref)));
}
function wireNav(root) {
  $$('[data-nav]', root).forEach(b => b.addEventListener('click', () => {
    const v = b.dataset.nav;
    if (v === 'home') { renderHome(); showView('home'); }
    else if (v === 'send') renderSend();
    else if (v === 'shipments') renderAll();
  }));
}

// ---- boot ----------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  renderHome();
  renderSend();
  showView('home');

  $('[data-testid="send-open"]').addEventListener('click', () => renderSend());
  $('[data-testid="shipments-open"]').addEventListener('click', () => renderAll());
  $('[data-testid="weight-minus"]').addEventListener('click', () => {
    sendState.weight = Math.max(DATA.rates.minWeight, +(sendState.weight - DATA.rates.weightStep).toFixed(1));
    updateQuote();
  });
  $('[data-testid="weight-plus"]').addEventListener('click', () => {
    sendState.weight = Math.min(DATA.rates.maxWeight, +(sendState.weight + DATA.rates.weightStep).toFixed(1));
    updateQuote();
  });
  $('[data-testid="send-submit"]').addEventListener('click', submitSend);
  const backBtn = $('[data-testid="back-btn"]');
  if (backBtn) backBtn.addEventListener('click', goBack);

  const doTrack = () => {
    const q = $('#track-input').value.trim().toUpperCase();
    const err = $('[data-testid="track-error"]');
    if (!q) { err.textContent = 'Enter a tracking reference to look it up.'; err.hidden = false; return; }
    const hit = db.shipments.find(s => s.ref.toUpperCase() === q);
    if (!hit) { err.textContent = 'No shipment found for "' + q + '". Check the reference and try again.'; err.hidden = false; return; }
    err.hidden = true;
    openDetail(hit.ref);
  };
  $('[data-testid="track-btn"]').addEventListener('click', doTrack);
  $('#track-input').addEventListener('keydown', (e) => { if (e.key === 'Enter') doTrack(); });

  wireNav(document);
});
