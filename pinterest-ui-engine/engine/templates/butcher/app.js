// Marble Meats template logic — data arrives as window.__DATA__ (brief).
// Views: home / detail / bag / confirmation, switched in-page.
(function () {
  const D = window.__DATA__;
  const products = D.products;
  const byId = id => products.find(p => p.id === id);
  const inr = n => '₹' + n.toLocaleString('en-IN');
  const state = { view: 'home', cat: 'All', query: '', detailId: null, weight: 1, bag: new Map() };

  // ---------- drawn product visuals (SVG substitute for photography) ----------
  const MEAT = '#9E1B23', DEEP = '#7C1116', FAT = '#F2D7CB';
  const marble = (paths) => paths.map(d => `<path d="${d}" stroke="${FAT}" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.85"/>`).join('');
  const CUTS = {
    ribeye: `<ellipse cx="100" cy="80" rx="72" ry="50" fill="${MEAT}"/><ellipse cx="100" cy="80" rx="72" ry="50" fill="none" stroke="${DEEP}" stroke-width="6"/><ellipse cx="88" cy="76" rx="26" ry="17" fill="${DEEP}"/>${marble(['M40 60 Q70 44 104 56', 'M52 102 Q92 116 140 96', 'M126 52 Q148 66 156 84'])}`,
    sirloin: `<path d="M28 84 Q24 40 78 34 L150 38 Q176 42 172 82 Q168 118 104 124 L56 120 Q30 114 28 84Z" fill="${MEAT}"/><path d="M28 84 Q24 40 78 34 L150 38" fill="none" stroke="${FAT}" stroke-width="9"/>${marble(['M52 84 Q92 70 138 84', 'M66 104 Q100 114 142 100'])}`,
    fillet: `<circle cx="72" cy="80" r="42" fill="${MEAT}"/><circle cx="132" cy="80" r="34" fill="${MEAT}"/><circle cx="72" cy="80" r="42" fill="none" stroke="${DEEP}" stroke-width="5"/>${marble(['M48 66 Q72 56 94 68', 'M112 70 Q132 62 150 72'])}`,
    ribs: `<path d="M30 108 Q100 20 170 108 L158 122 Q100 58 42 122Z" fill="${MEAT}"/>${[58, 100, 142].map(x => `<rect x="${x - 7}" y="86" width="14" height="34" rx="7" fill="${FAT}"/>`).join('')}${marble(['M44 96 Q100 40 156 96'])}`,
    chunks: `${[[62, 62], [108, 52], [146, 76], [84, 102], [130, 110]].map(([x, y]) => `<rect x="${x - 22}" y="${y - 18}" width="44" height="36" rx="12" fill="${MEAT}" stroke="${DEEP}" stroke-width="4"/>`).join('')}${marble(['M52 58 L74 66', 'M118 100 L142 108'])}`,
    mince: `${[[64, 70, 26], [98, 56, 30], [132, 72, 27], [80, 102, 29], [118, 104, 26], [150, 98, 20], [48, 96, 20]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${MEAT}"/>`).join('')}${marble(['M56 62 Q76 52 96 60', 'M96 96 Q118 88 138 96'])}`,
    roast: `<ellipse cx="100" cy="82" rx="74" ry="46" fill="${MEAT}"/>${[64, 100, 136].map(x => `<path d="M${x} 38 Q${x - 8} 82 ${x} 126" stroke="${FAT}" stroke-width="4" fill="none" opacity="0.8"/>`).join('')}${marble(['M44 74 Q90 58 150 72'])}`,
    brisket: `<path d="M24 62 L176 54 L172 108 L28 112Z" fill="${MEAT}"/><path d="M24 62 L176 54 L174 76 L26 82Z" fill="${FAT}" opacity="0.55"/>${marble(['M44 94 Q100 86 156 92'])}`,
  };
  const visual = (cut, label) => `<svg viewBox="0 0 200 160" role="img" aria-label="${label}">${CUTS[cut] || CUTS.ribeye}</svg>`;
  const stars = r => `<span class="stars" aria-label="Rated ${r} of 5">${'★'.repeat(Math.round(r))}<span class="stars-num">${r.toFixed(1)}</span></span>`;

  // ---------- rendering ----------
  const $ = s => document.querySelector(s);
  const grid = $('#grid'), cats = $('#cats');

  function renderCats() {
    cats.innerHTML = ['All', ...D.categories].map(c => `
      <button class="chip ${state.cat === c ? 'chip-on' : ''}" data-testid="category-chip" data-cat="${c}" aria-pressed="${state.cat === c}">
        <span class="chip-dot">${c === 'All' ? '✦' : c[0]}</span><span class="chip-label">${c}</span>
      </button>`).join('');
    cats.querySelectorAll('[data-testid="category-chip"]').forEach(b => b.addEventListener('click', () => { state.cat = b.dataset.cat; renderCats(); renderGrid(); }));
  }
  function renderGrid() {
    const list = products.filter(p => (state.cat === 'All' || p.category === state.cat) && p.name.toLowerCase().includes(state.query));
    grid.innerHTML = list.map(p => `
      <article class="card" data-testid="product-card" data-id="${p.id}">
        <button class="card-visual" data-testid="product-open" data-id="${p.id}">${visual(p.cut, p.name)}${p.badge ? `<span class="badge">${p.badge}</span>` : ''}<span class="vh">View ${p.name}</span></button>
        <div class="card-body">
          <h3 class="card-name">${p.name}</h3>
          ${stars(p.rating)}<span class="reviews">(${p.reviews})</span>
          <div class="card-row"><span class="price">${inr(p.price)}<span class="per"> /kg</span></span>
          <button class="add-btn" data-testid="add-btn" data-id="${p.id}">+<span class="vh">Add ${p.name} to bag</span></button></div>
        </div>
      </article>`).join('') || '<p class="no-results">No cuts match your search.</p>';
    grid.querySelectorAll('[data-testid="product-open"]').forEach(b => b.addEventListener('click', () => openDetail(b.dataset.id)));
    grid.querySelectorAll('[data-testid="add-btn"]').forEach(b => b.addEventListener('click', () => { addToBag(b.dataset.id, 1); bump(); }));
  }
  function openDetail(id) {
    const p = byId(id); state.detailId = id; state.weight = 1;
    $('#detail-content').innerHTML = `
      <div class="detail-visual">${visual(p.cut, p.name)}</div>
      <div class="sheet detail-sheet">
        ${p.badge ? `<span class="badge badge-static">${p.badge}</span>` : ''}
        <h2 class="detail-name" data-testid="detail-name">${p.name}</h2>
        ${stars(p.rating)}<span class="reviews">(${p.reviews} reviews)</span>
        <div class="detail-price">${inr(p.price)}<span class="per"> /kg</span></div>
        <p class="blurb">${p.blurb}</p>
        <ul class="features">${D.features.map(f => `<li><span class="feat-dot${f === 'Halal certified' ? ' feat-cert' : ''}">✓</span>${f}</li>`).join('')}</ul>
        <div class="buy-row">
          <div class="stepper" data-testid="weight-stepper">
            <button data-testid="qty-minus">−<span class="vh">Decrease weight</span></button>
            <span class="qty-value" data-testid="qty-value">1 kg</span>
            <button data-testid="qty-plus">+<span class="vh">Increase weight</span></button>
          </div>
          <button class="cta" data-testid="add-to-bag">Add to Bag · <span id="buy-price">${inr(p.price)}</span></button>
        </div>
        <h3 class="section-title">You May Also Like</h3>
        <div class="also-row">${products.filter(x => x.category === p.category && x.id !== p.id).map(x => `
          <button class="also-card" data-testid="product-open" data-id="${x.id}">${visual(x.cut, x.name)}<span>${x.name}</span><span class="also-price">${inr(x.price)}/kg</span></button>`).join('')}
        </div>
      </div>`;
    $('#detail-content').querySelectorAll('[data-testid="product-open"]').forEach(b => b.addEventListener('click', () => openDetail(b.dataset.id)));
    $('#detail-content').querySelector('[data-testid="qty-minus"]').addEventListener('click', () => setWeight(-0.5));
    $('#detail-content').querySelector('[data-testid="qty-plus"]').addEventListener('click', () => setWeight(0.5));
    $('#detail-content').querySelector('[data-testid="add-to-bag"]').addEventListener('click', () => { addToBag(id, state.weight); showView('bag'); });
    showView('detail');
  }
  function setWeight(d) {
    state.weight = Math.min(5, Math.max(0.5, state.weight + d));
    const p = byId(state.detailId);
    $('[data-testid="qty-value"]').textContent = (state.weight % 1 ? state.weight.toFixed(1) : state.weight) + ' kg';
    $('#buy-price').textContent = inr(Math.round(p.price * state.weight));
  }
  function addToBag(id, kg) { state.bag.set(id, (state.bag.get(id) || 0) + kg); renderBag(); }
  function bagTotals() {
    let sub = 0; state.bag.forEach((kg, id) => { sub += Math.round(byId(id).price * kg); });
    const del = state.bag.size === 0 || sub >= D.delivery.freeAbove ? 0 : D.delivery.fee;
    return { sub, del, total: sub + del };
  }
  function renderBag() {
    const count = state.bag.size;
    document.querySelectorAll('[data-testid="bag-count"]').forEach(el => { el.textContent = count; el.hidden = count === 0; });
    const wrap = $('#bag-content');
    if (!count) {
      wrap.innerHTML = `<div class="empty" data-testid="empty-bag"><div class="empty-mark">🧺</div><h2>Your bag is empty</h2><p>Fresh cuts are waiting. Start with a best seller.</p><button class="cta" id="empty-browse">Browse Cuts</button></div>`;
      $('#empty-browse').addEventListener('click', () => showView('home'));
      return;
    }
    const t = bagTotals();
    wrap.innerHTML = `
      <div class="bag-items">${[...state.bag.entries()].map(([id, kg]) => { const p = byId(id); return `
        <div class="bag-item" data-testid="bag-item" data-id="${id}">
          <div class="bag-thumb">${visual(p.cut, p.name)}</div>
          <div class="bag-info"><h2>${p.name}</h2><span class="bag-unit">${inr(p.price)} /kg · ${kg % 1 ? kg.toFixed(1) : kg} kg</span></div>
          <div class="stepper stepper-sm">
            <button data-dec="${id}">−<span class="vh">Decrease ${p.name}</span></button><span>${kg % 1 ? kg.toFixed(1) : kg}</span><button data-inc="${id}">+<span class="vh">Increase ${p.name}</span></button>
          </div>
          <div class="bag-line">${inr(Math.round(p.price * kg))}</div>
        </div>`; }).join('')}
      </div>
      <div class="totals">
        <div><span>Subtotal</span><span data-testid="bag-subtotal">${inr(t.sub)}</span></div>
        <div><span>Delivery</span><span data-testid="bag-delivery">${t.del === 0 ? 'Free' : inr(t.del)}</span></div>
        <div class="totals-grand"><span>Total</span><span data-testid="bag-total">${inr(t.total)}</span></div>
      </div>
      <button class="cta cta-wide" data-testid="checkout-btn">Place Order · ${inr(t.total)}</button>`;
    wrap.querySelectorAll('[data-inc]').forEach(b => b.addEventListener('click', () => { state.bag.set(b.dataset.inc, state.bag.get(b.dataset.inc) + 0.5); renderBag(); }));
    wrap.querySelectorAll('[data-dec]').forEach(b => b.addEventListener('click', () => { const v = state.bag.get(b.dataset.dec) - 0.5; if (v <= 0) state.bag.delete(b.dataset.dec); else state.bag.set(b.dataset.dec, v); renderBag(); }));
    wrap.querySelector('[data-testid="checkout-btn"]').addEventListener('click', checkout);
  }
  function checkout() {
    const t = bagTotals();
    const ref = 'MM-' + Math.floor(100000 + Math.random() * 900000);
    $('#confirm-content').innerHTML = `
      <div class="confirm-mark">✓</div>
      <h1 class="confirm-h">Order placed</h1>
      <p class="confirm-ref">Order ref <strong data-testid="order-ref">${ref}</strong></p>
      <p class="confirm-note">${state.bag.size} cut(s) · ${inr(t.total)} · arriving chilled today, 6–9 pm.</p>
      <button class="cta" id="confirm-home">Continue Shopping</button>`;
    state.bag.clear(); renderBag();
    $('#confirm-home').addEventListener('click', () => showView('home'));
    showView('confirmation');
  }
  function bump() { document.querySelectorAll('[data-testid="bag-count"]').forEach(el => { el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); }); }
  function showView(v) {
    state.view = v;
    document.querySelectorAll('[data-view]').forEach(s => { s.hidden = s.dataset.view !== v; });
    document.querySelectorAll('.tab').forEach(t => t.classList.toggle('tab-on', t.dataset.nav === v || (v === 'detail' && t.dataset.nav === 'home')));
    window.scrollTo(0, 0);
  }

  // ---------- wiring ----------
  $('#promo-visual').innerHTML = visual('ribeye', 'Premium beef cuts');
  $('#search').addEventListener('input', e => { state.query = e.target.value.trim().toLowerCase(); renderGrid(); });
  document.querySelectorAll('[data-nav]').forEach(b => b.addEventListener('click', () => showView(b.dataset.nav)));
  document.querySelectorAll('[data-testid="back-btn"]').forEach(b => b.addEventListener('click', () => showView('home')));
  renderCats(); renderGrid(); renderBag(); showView('home');
})();
