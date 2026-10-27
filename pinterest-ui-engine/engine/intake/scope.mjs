// scope.mjs — turn requirement sentences into scoped requirements.
//
// MISSION 030. The recurring defect: "each entry shows the title, the summary,
// the author and the reading time" produced four field ROLES and no record that
// any of them belonged in the entry. The planner placed them by role, the
// summary landed on the detail view, and every downstream check was satisfied
// by a field that was in the wrong place.
//
// A role says what a field IS. A scope says WHERE it must appear, HOW MANY
// times, and HOW to prove it. Those are separate concepts and this module keeps
// them separate.
//
// The vocabulary is small and open: a brief may name a view or region the engine
// has never seen, and it will be carried through without new engine code.

// ---- scope vocabulary ----------------------------------------------------
// view: where the requirement must hold
//   entry        the repeated item inside the collection
//   detail       the selected record's view
//   confirmation the post-action state
//   page         the surrounding page, once
// cardinality:
//   every-item   must hold for every rendered item, not one sample
//   one          must hold exactly once on the page
//   selected     must hold for the record the user opened
export const VIEWS = ['entry', 'detail', 'confirmation', 'page'];
export const CARDINALITY = ['every-item', 'one', 'selected'];

const has = (t, re) => re.test(t);

/** Sentences that establish a scope. Order matters: the narrowest wins. */
const SCOPE_RULES = [
  { re: /\b(each|every|all)\s+(entry|entries|row|rows|card|cards|item|items|result|results|line|lines)\b/i,
    view: 'entry', cardinality: 'every-item', region: 'item',
    evidence: (m) => `"${m[0]}" places the requirement in every repeated item` },
  { re: /\b(each|every)\s+(record|product|project|piece|note|room|slot|response|clinic|job|fault)\b/i,
    view: 'entry', cardinality: 'every-item', region: 'item',
    evidence: (m) => `"${m[0]}" places the requirement in every repeated item` },
  // A sentence that names the table as its surface places the fields it names
  // in every row of that table. "A dense table of every stock line, with the
  // part code, the bin location…" named four fields and placed none of them,
  // because "table" was not a scope phrase at all — the fields fell to
  // 'either' and were counted present wherever they happened to render.
  { re: /\b(table|spreadsheet)\b/i,
    view: 'entry', cardinality: 'every-item', region: 'item',
    evidence: (m) => `"${m[0]}" names the table; the fields it names belong in every row` },
  { re: /\b(opening|open|opened|on the detail|detail (view|page)|shows the (full|complete)|full (text|piece|article|description))\b/i,
    view: 'detail', cardinality: 'selected', region: 'record',
    evidence: (m) => `"${m[0]}" places the requirement on the selected record's view` },
  { re: /\b(confirm|confirmation|receives? a (reference|confirmation)|produces? (a )?visible)\b/i,
    view: 'confirmation', cardinality: 'one', region: 'feedback',
    evidence: (m) => `"${m[0]}" places the requirement in the post-action state` },
];

/** Field references inside a sentence, matched on the field's own label.
 *  Longer labels claim their span first: in "the unit cost" the field
 *  labelled "Unit" is not named — "Unit cost" is. Without claiming, a
 *  one-word label inside a longer label produced scoped requirements for
 *  fields the sentence never mentioned. */
function fieldsNamed(sentence, fields) {
  const lower = String(sentence).toLowerCase();
  const raw = [];
  for (const f of fields) {
    const label = (f.label || f.id).toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // "reading time" must match a field labelled "Reading time"; a bare word
    // match on "time" alone would over-match.
    const m = new RegExp('(^|[^a-z])' + label + '($|[^a-z])').exec(lower);
    if (m) raw.push({ f, idx: m.index, len: (f.label || f.id).length });
  }
  const claimedHits = [];
  const claimedFields = [];
  for (const h of [...raw].sort((a, b) => b.len - a.len)) {
    if (claimedHits.some(c => h.idx < c.idx + c.len && c.idx < h.idx + h.len)) continue;
    claimedHits.push(h);
    claimedFields.push(h.f);
  }
  return fields.filter(f => claimedFields.includes(f));
}

const PROHIBITIONS = [
  { re: /\bno\s+(cards?|images?|imagery|photos?|photographs?|decorative initials?|avatars?)\b/i,
    element: (m) => m[1].toLowerCase() },
  { re: /\bnot\s+(cards?|a grid)\b/i, element: (m) => m[1].toLowerCase() },
];

/**
 * Parse a product brief into scoped requirements.
 * @returns {{requirements: Array, unresolved: Array, byField: Object}}
 */
export function deriveScopedRequirements(product, brief) {
  const fields = (brief.entity && brief.entity.fields) || [];
  const sentences = [];
  (product.requirements || []).forEach((r, i) => {
    String(r).split(/(?<=\.)\s+/).forEach(s => { if (s.trim()) sentences.push({ text: s.trim(), requirementIndex: i }); });
  });

  const requirements = [];
  const unresolved = [];
  let seq = 0;
  const id = (k) => `SR-${String(++seq).padStart(3, '0')}-${k}`;

  for (const { text, requirementIndex } of sentences) {
    // ---- prohibitions --------------------------------------------------
    let matchedProhibition = false;
    for (const p of PROHIBITIONS) {
      const m = p.re.exec(text);
      if (!m) continue;
      matchedProhibition = true;
      requirements.push({
        id: id('prohibited'), kind: 'prohibited', element: p.element(m),
        scope: { view: 'page', cardinality: 'one', region: 'page' },
        mandatory: true,
        source: { text, requirementIndex },
        validation: { method: 'dom-count', expect: 0,
          failure: `"${p.element(m)}" is prohibited but rendered` },
      });
    }
    if (matchedProhibition) continue;

    // ---- scope ---------------------------------------------------------
    let scope = null;
    for (const rule of SCOPE_RULES) {
      const m = rule.re.exec(text);
      if (!m) continue;
      scope = { view: rule.view, cardinality: rule.cardinality, region: rule.region, evidence: rule.evidence(m) };
      break;
    }
    if (!scope) scope = { view: 'either', cardinality: 'one', region: 'any', evidence: 'no scope phrase found; the requirement is unplaced' };

    // ---- exclusions: "the list shows only X, Y and Z" -------------------
    const onlyMatch = /\b(?:list|entry|entries|row|rows|table|card|cards|tile|tiles|gallery)\b[^.]*?\b(?:shows?|contains?|displays?|carries?)\s+only\s+([^.]*)/i.exec(text);
    if (onlyMatch) {
      const allowed = new Set(fieldsNamed(onlyMatch[1], fields).map(f => f.id));
      for (const f of fields) {
        if (allowed.has(f.id)) continue;
        if (!['title', 'subtitle', 'meta', 'price', 'stat', 'detail', 'body', 'badge', 'status'].includes(f.role)) continue;
        requirements.push({
          id: id('field'), kind: 'field', subject: f.id, label: f.label || f.id,
          scope: { view: 'entry', cardinality: 'every-item', region: 'item', excluded: true,
                   evidence: `"${onlyMatch[0].slice(0, 60)}" admits only ${[...allowed].join(', ')}` },
          mandatory: true,
          source: { text, requirementIndex },
          validation: { method: 'scoped-absent', failure: `"${f.label || f.id}" must not appear in the entry` },
        });
      }
      continue;
    }

    // ---- subjects ------------------------------------------------------
    const named = fieldsNamed(text, fields);

    // a behaviour: an action plus a feedback expectation
    if (has(text, /\b(confirm|submit|book|reserve|claim|order|apply|register|send)\w*/i) && !named.length) {
      requirements.push({
        id: id('behaviour'), kind: 'behaviour', subject: 'commit',
        scope: { view: 'confirmation', cardinality: 'one', region: 'feedback' },
        mandatory: true,
        source: { text, requirementIndex },
        validation: { method: 'post-action', expect: 'reference-or-summary',
          failure: 'the action produced no visible confirmation' },
        scopeEvidence: scope.evidence,
      });
      continue;
    }

    if (!named.length) {
      unresolved.push({ text, requirementIndex, reason: 'no field label from the brief appears in this sentence', scope });
      continue;
    }

    for (const f of named) {
      const units = f.suffix || null;
      requirements.push({
        id: id('field'), kind: 'field', subject: f.id,
        label: f.label || f.id, units,
        scope,
        mandatory: !has(text, /\b(optional|if present|where available)\b/i),
        source: { text, requirementIndex },
        validation: {
          method: 'scoped-text',
          selector: scope.view === 'entry' ? '[data-testid$="-card"], [data-testid$="-row"]' : 'main',
          failure: `"${f.label || f.id}" is required in the ${scope.view} scope and was not found there`,
        },
      });
    }
  }

  // ---- contradictions ---------------------------------------------------
  // The same field demanded in a region and forbidden from it. This must be
  // reported, not resolved by whichever sentence happened to be parsed last.
  const contradictions = [];
  const entryRequired = new Map();
  const entryForbidden = new Map();
  for (const r of requirements) {
    if (r.kind !== 'field' || r.scope.view !== 'entry') continue;
    if (r.scope.excluded) entryForbidden.set(r.subject, r);
    else entryRequired.set(r.subject, r);
  }
  for (const [field, req] of entryRequired) {
    if (!entryForbidden.has(field)) continue;
    const forb = entryForbidden.get(field);
    contradictions.push({
      id: `CX-${field}`,
      kind: 'contradictory',
      subject: field,
      statement: `"${field}" is required in every entry and forbidden from it.`,
      sources: [
        { text: req.source.text, requirementIndex: req.source.requirementIndex, demands: 'present in entry' },
        { text: forb.source.text, requirementIndex: forb.source.requirementIndex, demands: 'absent from entry' },
      ],
    });
  }
  for (const c of contradictions) {
    // the contradiction replaces both demands: neither can be satisfied
    for (const r of requirements) {
      if (r.kind === 'field' && r.subject === c.subject && r.scope.view === 'entry') r.contradictedBy = c.id;
    }
  }

  // ---- fold the entry scope back onto the fields ------------------------
  // This is the piece that was missing: a field now carries where it is
  // required, not only what it is.
  const byField = {};
  const forbidden = {};
  for (const r of requirements) {
    if (r.kind !== 'field') continue;
    // An EXCLUDED requirement is the opposite of a demand: it must never be
    // folded into `requiredIn`. Doing so made S3 render the very field its
    // brief forbade — a regression the frozen benchmark caught.
    if (r.scope.excluded) { forbidden[r.subject] = r.scope.view; continue; }
    const prev = byField[r.subject];
    // entry is the stricter scope; it wins if both are demanded
    if (!prev || (prev !== 'entry' && r.scope.view === 'entry')) byField[r.subject] = r.scope.view;
  }
  for (const f of fields) {
    f.requiredIn = byField[f.id] || (f.requiredIn || 'either');
    if (forbidden[f.id]) f.forbiddenIn = forbidden[f.id];
    if (byField[f.id]) f.scopeSource = requirements.find(r => r.subject === f.id && !r.scope.excluded).source.text.slice(0, 80);
  }

  return {
    scopeVersion: '1.1.0',
    requirements,
    unresolved,
    contradictions,
    byField,
    counts: {
      total: requirements.length,
      field: requirements.filter(r => r.kind === 'field').length,
      entry: requirements.filter(r => r.scope && r.scope.view === 'entry').length,
      detail: requirements.filter(r => r.scope && r.scope.view === 'detail').length,
      behaviour: requirements.filter(r => r.kind === 'behaviour').length,
      prohibited: requirements.filter(r => r.kind === 'prohibited').length,
      excluded: requirements.filter(r => r.scope && r.scope.excluded).length,
      contradictions: contradictions.length,
    },
  };
}
