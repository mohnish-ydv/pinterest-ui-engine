// compose.mjs — choose a composition from purpose and evidence, and say why.
//
// MISSION 028, Phase 3. The rule this replaces: "gallery because the entity has
// media", "dashboard because aggregates exist", "article because the brief says
// story". Each of those is one signal standing in for a decision.
//
// Every candidate is scored from four independent sources, and the winner must
// carry at least one *product* signal — a reference alone never decides, and a
// content shape alone never decides.

const FAMILIES = ['index', 'dashboard', 'gallery', 'table', 'row-list', 'wizard', 'editorial'];

const has = (text, re) => re.test(text);

export function planComposition({ brief, product, evidence, transfer }) {
  const reqs = (product.requirements || []).join(' \n ');
  const stated = (brief.intent && brief.intent.composition) || null;
  const prohibited = (brief.intent && brief.intent.prohibited) || [];
  const entity = brief.entity || {};
  const fields = entity.fields || [];
  const numeric = fields.filter(f => f.role === 'stat' || f.role === 'price').length;
  const textFields = fields.filter(f => f.type === 'text').length;

  const inf = (evidence && evidence.inferred) || {};
  // MISSION 029: the reference speaks only through what survived the
  // transferability assessment. A media-led reference for a product with no
  // media no longer votes for a gallery.
  const use = (transfer && transfer.usable) || null;
  const mediaLed = use ? use.mediaLed : (inf.mediaBalance && inf.mediaBalance.value === 'media-led');
  const textLed = inf.mediaBalance && inf.mediaBalance.value === 'text-led';
  const repeating = use ? use.repeating : (inf.repetition && inf.repetition.value === 'repeating-blocks');
  const multiCol = use ? use.multiColumn : (inf.gridStructure && inf.gridStructure.value === 'multi-column');
  const referenceUsable = !!use && !!(use.mediaLed || use.repeating || use.multiColumn || use.navProminent);

  const signals = [];
  const score = {};
  for (const f of FAMILIES) score[f] = 0;
  const addScore = (family, weight, factor, source) => {
    score[family] += weight;
    signals.push({ family, weight, factor, source });
  };

  // ---- product signals (from the prose) --------------------------------
  if (has(reqs, /\btypographic index\b|\bindex of\b|\bessays?\b|\blong reads?\b/i)) addScore('index', 3, 'the brief describes a reading index', 'product');
  if (has(reqs, /\bfull article\b|\bread (the|an) (essay|article)\b|\bline length\b/i)) addScore('editorial', 3, 'the brief requires a readable article', 'product');
  if (has(reqs, /\bKPI\b|\bsummary numbers\b|\bdashboard\b/i)) addScore('dashboard', 3, 'the brief asks for summary numbers or a dashboard', 'product');
  if (has(reqs, /\btable\b/i)) addScore('table', 3, 'the brief asks for a table', 'product');
  if (has(reqs, /\bgallery\b|\bphoto grid\b|\bgrid of\b/i)) addScore('gallery', 3, 'the brief asks for a gallery or grid', 'product');
  if (has(reqs, /\bsteps?\b|\bwizard\b|\bmulti-step\b/i)) addScore('wizard', 3, 'the brief describes a multi-step flow', 'product');
  if (has(reqs, /\boperations?\b|\bqueue\b|\bpriorit/i)) addScore('table', 1, 'the brief describes an operational queue', 'product');

  // ---- content shape (weak on its own) ---------------------------------
  if (numeric >= 2) { addScore('table', 1, `${numeric} numeric fields read as columns`, 'content'); addScore('dashboard', 1, `${numeric} numeric fields suit a summary`, 'content'); }
  if (entity.media === true) addScore('gallery', 1, 'the entity declares media', 'content');
  if (textFields >= 3) addScore('index', 1, `${textFields} text fields suit a reading list`, 'content');
  addScore('row-list', 1, 'the fallback that assumes nothing', 'content');

  // ---- reference evidence (corroborates, never decides alone) ----------
  if (mediaLed) { addScore('gallery', 2, 'the reference is media-led and the product has media to lead with', 'reference'); }
  else if (transfer && transfer.features.some(f => f.id === 'mediaBalance' && f.decision === 'reject')) {
    // a rejected media aspect must not silently become a text-led vote either
    signals.push({ family: 'gallery', weight: 0, factor: 'the reference is media-led but the product has no media, so that aspect was rejected', source: 'reference-rejected' });
  }
  if (textLed) { addScore('index', 1, 'the reference is text-led', 'reference'); }
  if (repeating && multiCol) addScore('gallery', 1, 'the reference repeats blocks in a multi-column grid', 'reference');
  if (repeating && !multiCol) addScore('table', 1, 'the reference repeats blocks in a single column', 'reference');

  // ---- prohibitions -----------------------------------------------------
  const banned = new Set();
  for (const p of prohibited) {
    const el = typeof p === 'string' ? p : p.element;
    if (/card|gallery|media|image/i.test(el)) { banned.add('gallery'); }
  }
  if (entity.media === true && prohibited.some(p => /media|image/i.test(typeof p === 'string' ? p : p.element))) {
    banned.add('gallery');
  }

  // ---- decision ---------------------------------------------------------
  // Ties are broken by the brief itself before they are broken by list
  // order: the composition named FIRST in the requirements is the product's
  // lead surface. (a stock-operations brief: "a dense table" is requirement 1 and "summary
  // numbers" requirement 2; both scored 4, and the old list-order tie-break
  // silently preferred dashboard — the table the brief led with lost to the
  // summary it mentioned second.)
  const PRODUCT_RES = {
    index: /\btypographic index\b|\bindex of\b|\bessays?\b|\blong reads?\b/i,
    editorial: /\bfull article\b|\bread (the|an) (essay|article)\b|\bline length\b/i,
    dashboard: /\bKPI\b|\bsummary numbers\b|\bdashboard\b/i,
    table: /\btable\b/i,
    gallery: /\bgallery\b|\bphoto grid\b|\bgrid of\b/i,
    wizard: /\bsteps?\b|\bwizard\b|\bmulti-step\b/i,
  };
  const reqList = product.requirements || [];
  const mentionIdx = (fam) => {
    const re = PRODUCT_RES[fam];
    if (!re) return Infinity;
    const i = reqList.findIndex(r => re.test(String(r)));
    return i === -1 ? Infinity : i;
  };
  const candidates = FAMILIES
    .filter(f => !banned.has(f))
    .map(f => ({ family: f, score: score[f], signals: signals.filter(s => s.family === f) }))
    .sort((a, b) => b.score - a.score
      || mentionIdx(a.family) - mentionIdx(b.family)
      || FAMILIES.indexOf(a.family) - FAMILIES.indexOf(b.family));

  const winner = candidates[0];
  const productBacked = winner.signals.some(s => s.source === 'product');
  const referenceBacked = winner.signals.some(s => s.source === 'reference') && referenceUsable;

  // A composition needs a reason. A product requirement is the strongest; a
  // measured reference is a legitimate reason too — that is the whole point of
  // a reference-driven system. Content shape alone is NOT a reason: "it has
  // media" must never be sufficient, which was the rule this mission set out
  // to break.
  let chosen = winner;
  let note = null;
  const justified = productBacked || referenceBacked;
  if (!justified && winner.family !== 'row-list') {
    chosen = candidates.find(c => c.family === 'row-list') || winner;
    note = `"${winner.family}" scored highest (${winner.score}) but on content shape alone; `
      + `neither the product nor the reference asked for it, so "${chosen.family}" was chosen instead.`;
  } else if (!productBacked && referenceBacked) {
    note = `no product requirement names a composition, so the reference decided: "${winner.family}" (${winner.score}).`;
  }

  const rationale = {
    composition: stated || chosen.family,
    decidedBy: stated ? 'stated intent' : 'scored evidence',
    score: chosen.score,
    signals: chosen.signals,
    rejected: candidates.filter(c => c.family !== chosen.family && c.score > 0).map(c => ({
      family: c.family, score: c.score, why: c.signals.map(s => s.factor).join('; ') || 'no signal',
    })),
    banned: [...banned],
    referenceUsed: referenceBacked,
    note,
    sources: {
      product: 'brief requirements',
      content: 'field roles',
      reference: evidence ? 'reference-evidence.json' : 'no reference supplied',
    },
  };
  if (stated && chosen.family !== stated) {
    rationale.note = `stated composition "${stated}" was used; the scored runner-up was "${chosen.family}" (${chosen.score}).`;
  }
  return rationale;
}
