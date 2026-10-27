// CarePoint template logic — data arrives as window.__DATA__ (brief).
// Views: home / detail / confirmation / appointments.
(function () {
  const D = window.__DATA__;
  const doctors = D.doctors;
  const KEY = D.functionalContract.storageKey;
  const byId = id => doctors.find(d => d.id === id);
  const inr = n => '₹' + n.toLocaleString('en-IN');
  const state = { view: 'home', spec: 'All', query: '', doctorId: null, day: 0, slot: null, confirmCancel: null };

  const days = [...Array(7)].map((_, i) => {
    const d = new Date(); d.setDate(d.getDate() + i);
    return { iso: d.toISOString().slice(0, 10), wd: d.toLocaleDateString('en-IN', { weekday: 'short' }), num: d.getDate(), label: d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }) };
  });
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; } };
  const save = a => localStorage.setItem(KEY, JSON.stringify(a));
  const isBooked = (docId, iso, slot) => load().some(a => a.doctorId === docId && a.iso === iso && a.slot === slot);
  const isTaken = (docIdx, dayIdx, slotIdx, docId, iso, slot) =>
    (docIdx + dayIdx + slotIdx) % 3 === 0 || isBooked(docId, iso, slot);
  const initials = name => name.replace('Dr. ', '').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const stars = r => `<span class="stars" aria-label="Rated ${r} of 5">★<span class="stars-num">${r.toFixed(1)}</span></span>`;
  const $ = s => document.querySelector(s);

  // ---------- home ----------
  function renderSpecs() {
    const specs = ['All', ...new Set(doctors.map(d => d.specialty))];
    $('#specs').innerHTML = specs.map(s => `<button class="spec-chip ${state.spec === s ? 'spec-on' : ''}" data-testid="specialty-chip" data-spec="${s}" aria-pressed="${state.spec === s}">${s}</button>`).join('');
    document.querySelectorAll('[data-testid="specialty-chip"]').forEach(b => b.addEventListener('click', () => { state.spec = b.dataset.spec; renderSpecs(); renderDoctors(); }));
  }
  function renderDoctors() {
    const list = doctors.filter(d => (state.spec === 'All' || d.specialty === state.spec) && d.name.toLowerCase().includes(state.query));
    $('#doctors').innerHTML = list.map(d => `
      <button class="doc-card" data-testid="doctor-card" data-id="${d.id}">
        <span class="avatar" aria-hidden="true">${initials(d.name)}</span>
        <span class="doc-main">
          <span class="doc-top"><span class="doc-name" data-testid="doctor-open" data-id="${d.id}">${d.name}</span><span class="chev" aria-hidden="true">›</span></span>
          <span class="doc-spec">${d.specialty}</span>
          <span class="doc-meta">${stars(d.rating)}<span class="reviews">(${d.reviews})</span><span class="dot">·</span>${inr(d.fee)}<span class="dot">·</span>${d.exp} yrs exp</span>
        </span>
      </button>`).join('') || '<p class="no-results">No doctors match your search.</p>';
    document.querySelectorAll('[data-testid="doctor-card"]').forEach(b => b.addEventListener('click', () => openDetail(b.dataset.id)));
  }
  function renderUpcoming() {
    const a = load()[0];
    const el = $('#upcoming');
    if (!a) { el.innerHTML = ''; return; }
    const d = byId(a.doctorId);
    el.innerHTML = `<div class="upcoming" data-testid="upcoming-card">
      <span class="upcoming-label">Upcoming Visit</span>
      <span class="upcoming-main">${d.name} · ${d.specialty}</span>
      <span class="upcoming-when">${a.dayLabel} · ${a.slot} · ${inr(d.fee)}</span></div>`;
  }

  // ---------- detail / booking ----------
  function openDetail(id) {
    const d = byId(id); state.doctorId = id; state.day = 0; state.slot = null;
    const di = doctors.indexOf(d);
    $('#detail-content').innerHTML = `
      <section class="doc-hero">
        <span class="avatar avatar-lg" aria-hidden="true">${initials(d.name)}</span>
        <h1 class="detail-name">${d.name}</h1>
        <p class="doc-spec-lg">${d.specialty} · ${D.location}</p>
        <div class="stats">
          <span><strong>${d.exp} yrs</strong><small>Experience</small></span>
          <span><strong>★ ${d.rating.toFixed(1)}</strong><small>Rating</small></span>
          <span><strong>${d.reviews}</strong><small>Reviews</small></span>
        </div>
      </section>
      <h2 class="section-title">About</h3>
      <p class="about">${d.about}</p>
      <h2 class="section-title">Select Day</h3>
      <div class="day-strip" id="days">${days.map((dy, i) => `
        <button class="day-chip ${i === 0 ? 'day-on' : ''}" data-testid="day-chip" data-day="${i}" aria-pressed="${i === 0}"><span>${dy.wd}</span><strong>${dy.num}</strong></button>`).join('')}
      </div>
      <h2 class="section-title">Select Time</h3>
      <div class="slot-grid" id="slots"></div>
      <h2 class="section-title">Patient Details</h3>
      <form id="book-form" novalidate>
        <label class="field"><span>Patient name</span>
          <input id="p-name" data-testid="patient-name" type="text" autocomplete="name" placeholder="e.g. Asha Nair">
          <small class="error" data-testid="error-name" hidden>Please enter the patient's name (at least 2 characters).</small></label>
        <label class="field"><span>Phone number</span>
          <input id="p-phone" data-testid="patient-phone" type="tel" autocomplete="tel" placeholder="10-digit mobile number">
          <small class="error" data-testid="error-phone" hidden>Enter a valid 10-digit phone number.</small></label>
        <p class="form-note" id="slot-note">Select a time slot to continue.</p>
        <button class="cta" type="submit" data-testid="book-btn">Book Appointment · ${inr(d.fee)}</button>
      </form>`;
    document.querySelectorAll('[data-testid="day-chip"]').forEach(b => b.addEventListener('click', () => {
      state.day = Number(b.dataset.day); state.slot = null;
      document.querySelectorAll('[data-testid="day-chip"]').forEach(x => { x.classList.toggle('day-on', x === b); x.setAttribute('aria-pressed', x === b); });
      renderSlots();
    }));
    renderSlots();
    $('#book-form').addEventListener('submit', e => { e.preventDefault(); book(di); });
    showView('detail');
  }
  function renderSlots() {
    const d = byId(state.doctorId); const di = doctors.indexOf(d); const iso = days[state.day].iso;
    $('#slots').innerHTML = D.rules.slots.map((s, si) => {
      const taken = isTaken(di, state.day, si, d.id, iso, s);
      return `<button type="button" class="slot ${taken ? 'slot-taken' : ''} ${state.slot === s ? 'slot-on' : ''}" data-testid="slot" data-slot="${s}" data-state="${taken ? 'taken' : state.slot === s ? 'selected' : 'free'}" ${taken ? 'disabled' : ''}>${s}</button>`;
    }).join('');
    document.querySelectorAll('#slots [data-testid="slot"]').forEach(b => b.addEventListener('click', () => {
      state.slot = b.dataset.slot;
      document.querySelectorAll('#slots [data-testid="slot"]').forEach(x => { const on = x === b; x.classList.toggle('slot-on', on); if (!x.disabled) x.dataset.state = on ? 'selected' : 'free'; });
      $('#slot-note').textContent = `${days[state.day].label} · ${state.slot} with ${d.name}`;
    }));
  }
  function book(di) {
    const name = $('#p-name').value.trim();
    const phone = $('#p-phone').value.replace(/\s/g, '');
    const nameBad = name.length < 2, phoneBad = !/^\d{10}$/.test(phone);
    $('[data-testid="error-name"]').hidden = !nameBad;
    $('[data-testid="error-phone"]').hidden = !phoneBad;
    $('#p-name').classList.toggle('input-bad', nameBad);
    $('#p-phone').classList.toggle('input-bad', phoneBad);
    if (nameBad || phoneBad) return;
    if (!state.slot) { $('#slot-note').textContent = 'Please select a time slot first.'; $('#slot-note').classList.add('note-bad'); return; }
    const d = byId(state.doctorId);
    const ref = 'CP-' + Math.floor(100000 + Math.random() * 900000);
    const appt = { ref, doctorId: d.id, iso: days[state.day].iso, dayLabel: days[state.day].label, slot: state.slot, name, phone, fee: d.fee };
    save([appt, ...load()]);
    $('#confirm-content').innerHTML = `
      <div class="confirm-mark">✓</div>
      <h1 class="confirm-h">Appointment Booked</h1>
      <p class="confirm-ref">Reference <strong data-testid="appt-ref">${ref}</strong></p>
      <div class="summary">
        <div><span>Doctor</span><strong>${d.name}</strong></div>
        <div><span>Specialty</span><strong>${d.specialty}</strong></div>
        <div><span>When</span><strong>${appt.dayLabel} · ${appt.slot}</strong></div>
        <div><span>Patient</span><strong>${name}</strong></div>
        <div><span>Consultation fee</span><strong>${inr(d.fee)}</strong></div>
      </div>
      <div class="confirm-actions">
        <button class="cta" data-nav="appointments" data-testid="appts-open">View My Appointments</button>
        <button class="btn-quiet" data-nav="home">Done</button>
      </div>`;
    wireNav($('#confirm-content'));
    renderUpcoming(); renderAppts();
    showView('confirmation');
  }

  // ---------- appointments ----------
  function renderAppts() {
    const list = load();
    document.querySelectorAll('[data-testid="appt-count"]').forEach(el => { el.textContent = list.length; el.hidden = list.length === 0; });
    const wrap = $('#appts-content');
    if (!list.length) {
      wrap.innerHTML = `<div class="empty"><h2>No appointments yet</h2><p>Your booked visits will appear here.</p><button class="cta" data-nav="home">Find a Doctor</button></div>`;
      wireNav(wrap); return;
    }
    wrap.innerHTML = list.map(a => { const d = byId(a.doctorId); return `
      <article class="appt" data-testid="appt-item" data-ref="${a.ref}">
        <span class="avatar" aria-hidden="true">${initials(d.name)}</span>
        <div class="appt-main">
          <strong>${d.name}</strong><span>${d.specialty}</span>
          <span class="appt-when">${a.dayLabel} · ${a.slot} · ${inr(a.fee)}</span>
          <span class="appt-for">For ${a.name} · Ref ${a.ref}</span>
        </div>
        ${state.confirmCancel === a.ref
          ? `<span class="cancel-confirm"><button class="btn-danger" data-testid="cancel-confirm" data-ref="${a.ref}">Confirm cancel</button><button class="btn-quiet" data-keep="1">Keep</button></span>`
          : `<button class="btn-cancel" data-testid="cancel-btn" data-ref="${a.ref}">Cancel</button>`}
      </article>`; }).join('');
    wrap.querySelectorAll('[data-testid="cancel-btn"]').forEach(b => b.addEventListener('click', () => { state.confirmCancel = b.dataset.ref; renderAppts(); }));
    wrap.querySelectorAll('[data-keep]').forEach(b => b.addEventListener('click', () => { state.confirmCancel = null; renderAppts(); }));
    wrap.querySelectorAll('[data-testid="cancel-confirm"]').forEach(b => b.addEventListener('click', () => {
      save(load().filter(a => a.ref !== b.dataset.ref));
      state.confirmCancel = null; renderAppts(); renderUpcoming();
    }));
  }

  // ---------- shell ----------
  function showView(v) {
    state.view = v;
    document.querySelectorAll('[data-view]').forEach(s => { s.hidden = s.dataset.view !== v; });
    document.querySelectorAll('.tab').forEach(t => t.classList.toggle('tab-on', t.dataset.nav === v || (v === 'detail' && t.dataset.nav === 'home')));
    window.scrollTo(0, 0);
  }
  function wireNav(root) { root.querySelectorAll('[data-nav]').forEach(b => b.addEventListener('click', () => showView(b.dataset.nav))); }
  $('#search').addEventListener('input', e => { state.query = e.target.value.trim().toLowerCase(); renderDoctors(); });
  wireNav(document);
  document.querySelectorAll('[data-testid="back-btn"]').forEach(b => b.addEventListener('click', () => showView('home')));
  renderSpecs(); renderDoctors(); renderUpcoming(); renderAppts(); showView('home');
})();
