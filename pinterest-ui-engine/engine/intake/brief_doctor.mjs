// brief_doctor.mjs — the intake interview, enforced.
//
// Mission 047. The Bazaar lesson, again: a free-form prompt produces
// a thin brief, and a thin brief produces a thin app — the engine
// declares its Evira families, so anything the brief never decided
// is a screen the app does not have. The doctor reads a drafted
// product brief and reports the undecided decisions BEFORE
// generation, each one tied to the intake question that decides it
// (intake-questions.json at the distribution root).
//
// doctorBrief(product) -> [{ level: 'gap' | 'tip', qid, message }]
// A gap is a decision whose absence breaks or empties a declared
// feature. A tip is a decision whose absence merely thins the app.
// CLI: node brief_doctor.mjs <product-brief.json> — prints findings,
// exits 1 when gaps exist.

export function doctorBrief(product) {
  const out = [];
  const gap = (qid, message) => out.push({ level: 'gap', qid, message });
  const tip = (qid, message) => out.push({ level: 'tip', qid, message });
  const p = product || {};
  const reqs = (p.requirements || []).join(' ').toLowerCase();
  const items = (p.collection && p.collection.items) || [];
  const fields = p.fields || [];
  const bagImplied = /\b(bag|cart|basket)\b/.test(reqs) || !!p.flow;
  const domain = String(p.domain || '').toLowerCase();

  if (!p.name) gap('q-name', 'no app name — every screen heads with a placeholder.');
  if (!p.tagline && !p.about) tip('q-pitch', 'no tagline/about — the home heading and empty states have nothing to say.');
  if (!items.length) gap('q-items-source', 'the catalogue is empty — there is nothing to browse.');
  if (fields.length < 2) gap('q-item-facts', 'fewer than two item fields declared — cards will carry a name and nothing else.');

  const hasFacet = fields.some(f => f.type === 'enum' && (f.options || []).length);
  if (p.showCategories && !hasFacet) gap('q-item-facts', 'showCategories is declared but no field carries options — the medallions have nothing to show.');
  if (bagImplied && !fields.some(f => f.type === 'money')) gap('q-item-facts', 'buying is on but no money field exists — nothing can be priced.');

  if (p.homeHeader === 'greeting' && !(p.profile && p.profile.name)) {
    gap('q-user-name', 'a greeting home is declared but no person is named — the greeting and the profile head with a hole.');
  }

  // Reachability: a declared screen nothing links to is a dead screen.
  const profileRows = ((p.profile && p.profile.sections) || []).flatMap(s => s.rows || []);
  const linksTo = v => profileRows.some(r => r.view === v);
  if (p.wallet && p.homeHeader !== 'greeting' && !linksTo('wallet')) {
    gap('q-families', 'a wallet is declared but nothing reaches it (no greeting header, no profile row links to it).');
  }
  for (const r of profileRows) {
    if (r.view === 'notices' && !p.notices) gap('q-families', 'a profile row links to Notifications, but no notices are declared.');
    if (r.view === 'wallet' && !p.wallet) gap('q-families', 'a profile row links to the wallet, but no wallet is declared.');
  }
  if (p.notices && p.homeHeader !== 'greeting' && !linksTo('notices')) {
    tip('q-families', 'notices are declared but nothing links to them (no greeting bell, no profile row).');
  }

  if (p.flow) {
    const formIds = new Set((p.flow.form || []).map(f => f.id));
    for (const st of p.flow.steps || []) {
      for (const fid of st.fields || []) {
        if (!formIds.has(fid)) gap('q-checkout', `the declared flow's step "${st.id}" asks for "${fid}", which the form never declares.`);
      }
    }
    for (const f of p.flow.form || []) {
      if (f.type === 'enum' && (f.options || []).length && typeof f.options[0] === 'string') {
        tip('q-checkout', `the flow field "${f.id}" uses plain string options — object options ({ label, value, caption, price }) are what render as the board's radio rows.`);
      }
    }
  }

  if (p.collection && p.collection.media && items.length && !items.some(r => r.image)) {
    tip('q-photos', 'media is on but no item carries a photo — every card will use substituted initials-on-tint media.');
  }
  if (!p.promo) tip('q-families', 'no promo declared — the home opens without its offer card.');
  if (bagImplied && /marketplace|classified/.test(domain) && p.uniqueItems !== true) {
    tip('q-unique', 'a marketplace with a bag usually sells one-of-one items — without uniqueItems: true a used phone can be quantity-8 in the cart (the M045 lesson).');
  }
  if (bagImplied && items.length && !items.some(r => Array.isArray(r.reviews) && r.reviews.length)) {
    tip('q-families', 'no item carries reviews — product pages will have no social proof section.');
  }
  if (/fashion/.test(domain) && items.length && !items.some(r => Array.isArray(r.variants) && r.variants.length)) {
    tip('q-families', 'a fashion catalogue without variants — the colour/size selectors from the board will not appear.');
  }
  return out;
}

export function doctorSummary(product) {
  const findings = doctorBrief(product);
  const gaps = findings.filter(f => f.level === 'gap').length;
  return { findings, gaps, tips: findings.length - gaps };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { readFileSync } = await import('node:fs');
  const product = JSON.parse(readFileSync(process.argv[2], 'utf8'));
  const { findings, gaps } = doctorSummary(product);
  for (const f of findings) console.log(`${f.level === 'gap' ? 'GAP ' : 'tip '} [${f.qid}] ${f.message}`);
  console.log(`intake: ${gaps} gap(s), ${findings.length - gaps} tip(s) — see INTAKE.md`);
  process.exit(gaps ? 1 : 0);
}
