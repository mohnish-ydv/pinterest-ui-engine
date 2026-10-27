// derive.mjs — a product brief becomes an engine brief.
//
// MISSION 027. Every earlier mission's "held-out" brief was written by someone
// who knew the planner: fields were given roles, capabilities were declared as
// keys. That is leakage, and it is why Mission 026's untouched set scored the
// same for both engines.
//
// This defines the PUBLIC product interface — what a product manager writes —
// and derives everything the planner needs from it. The derivation rules below
// are the engine's inference. They can be wrong, and when they are wrong the
// evaluation says so rather than the brief having quietly encoded the answer.
//
// Public input (product-brief.json) has NO roles, NO capability keys, NO
// functionalContract, NO intent block. Only what a product person would state.

const ROLE_BY_TYPE = { money: 'price', rating: 'meta', bool: 'badge', image: 'media' };

/** Which composition does the requirement prose ask for? */
function deriveComposition(reqs, prohibited) {
  const t = reqs.join(' \n ').toLowerCase();
  if (/\btypographic index\b|\bindex of\b|\blist of (essays|articles|pieces)\b/.test(t)) return { value: 'index', evidence: 'requirements mention an index of reading material' };
  if (/\btable\b/.test(t)) return { value: 'table', evidence: 'requirements ask for a table' };
  if (/\bgallery\b|\bgrid of (photos|prints|items)\b|\bphoto grid\b/.test(t)) return { value: 'gallery', evidence: 'requirements ask for a gallery/grid' };
  if (/\bKPI\b|\bdashboard\b|\bmetrics\b|\bsummary numbers\b/i.test(reqs.join(' '))) return { value: 'dashboard', evidence: 'requirements ask for summary numbers/a dashboard' };
  return { value: null, evidence: 'no composition named in the requirements' };
}

/** Roles for a plain field list. First text is the title, second the subtitle. */
function deriveRoles(fields, reqs) {
  const out = [];
  let textSeen = 0;
  let statSeen = 0;
  const wantsFilter = /\bfilter\b|\bfacet\b|\bby (category|status|type|place|channel|tier)\b/i.test(reqs.join(' '));
  const wantsStatus = /\bstatus\b|\bstage\b|\bstate of\b/i.test(reqs.join(' '));

  for (const f of fields) {
    let role;
    if (f.type === 'text') {
      textSeen += 1;
      role = textSeen === 1 ? 'title' : textSeen === 2 ? 'subtitle' : 'detail';
      // Only one field is the article body. A "summary" and a "body" are
      // different things: the first is a standfirst, the second is the piece.
      if (role === 'detail' && f.label && /^(body|copy|text|content|full text|article)$/i.test(f.label.trim())) role = 'body';
      else if (role === 'detail' && f.label && /description|summary|story|about|notes|standfirst/i.test(f.label)) role = 'detail';
    } else if (f.type === 'enum') {
      // An enum the requirements ask to filter by is a facet; one that names a
      // state is a status pill; otherwise it is a secondary label.
      if (wantsFilter) role = 'facet';
      else if (wantsStatus && /status|stage|state/i.test(f.label || '')) role = 'status';
      else role = 'subtitle';
    } else if (f.type === 'number') {
      statSeen += 1;
      role = statSeen <= 2 ? 'stat' : 'meta';
    } else {
      role = ROLE_BY_TYPE[f.type] || 'meta';
    }
    out.push(Object.assign({}, f, { role, roleSource: 'derived' }));
  }
  // A number with a sibling unit field must render as a quantity, not a bare
  // figure. Bind it so the renderer can append the unit per record.
  // A MONEY field is never unit-bound: a price is already per-unit, so
  // appending the record's unit produced "₹4.5 pcs" on a unit cost — a
  // quantity's unit belongs to quantities only.
  const unitish = out.find(f => f.type === 'text' && /^(unit|units|measure|uom)$/i.test(f.id) || /\bunit\b/i.test(f.label || ''));
  if (unitish) {
    for (const f of out) {
      if (f.type === 'number' && f.id !== unitish.id && !f.suffix) {
        f.unitField = unitish.id;
        f.roleSource = (f.roleSource || 'derived') + '+unit-bound';
      }
    }
  }
  // A facet needs options; derive them from the data if the brief did not list them.
  return out;
}

/** Capability keys implied by requirement prose. */
function deriveCapabilities(reqs) {
  const t = reqs.join(' \n ');
  const cap = {};
  if (/\b(search|find|look up|filter by name)(es|ed|ing)?\b/i.test(t)) cap.search = true;
  if (/\bfilter\b|\bfacet\b/i.test(t)) cap.filters = true;
  if (/\bKPI\b|\bsummary numbers\b|\btotals?\b/i.test(t)) cap.aggregates = true;
  if (/\btable\b/i.test(t)) cap.table = true;
  if (/\bsteps?\b|\bwizard\b|\bmulti-step\b/i.test(t)) cap.steps = true;
  if (/\barticle\b|\bfull text\b|\bessays?\b|\bread the\b|\bline length\b/i.test(t)) cap.article = true;
  // Inflections matter: the first version matched "confirm" but not "confirms",
  // so a brief saying "the patient confirms" produced no commit at all.
  if (/\b(book|reserve|claim|file|submit|confirm|order|apply|request|send|pay|register|raise|sign ?up)\w*\b/i.test(t)) cap.commit = true;
  if (/\b(save|favourite|favorite|shortlist|bookmark)(s|ed|ing)?\b/i.test(t)) cap.save = true;
  // M039: a bag (cart/basket) the customer adds records to — the core of
  // a real commerce journey, previously impossible to derive at all.
  if (/\b(bag|cart|basket)\b/i.test(t) && /\badd\w*\b/i.test(t)) cap.bag = true;
  if (/\bdetail\b|\bopen\b|\bclick through\b|\bsee more\b/i.test(t)) cap.detail = true;
  return cap;
}

const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

import { planComposition } from './compose.mjs';
import { assessTransfer } from './transfer.mjs';
import { deriveScopedRequirements } from './scope.mjs';

/** Requirement strings split into sentences, in brief order. */
const sentencesOf = (reqs) => (reqs || [])
  .flatMap(r => String(r).split(/(?<=\.)\s+/).map(s => s.trim()).filter(Boolean));

/** Fields a sentence names, in the order the sentence names them. Longer
 *  labels claim their span first: in "the unit cost", the field labelled
 *  "Unit" is not named — "Unit cost" is. */
function fieldsNamedInOrder(sentence, fields) {
  const lower = String(sentence).toLowerCase();
  const raw = [];
  for (const f of fields) {
    const label = (f.label || f.id).toLowerCase();
    const esc = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const m = new RegExp('(^|[^a-z])' + esc + '($|[^a-z])').exec(lower);
    if (m) raw.push({ f, idx: m.index, len: label.length });
  }
  const claimed = [];
  for (const h of [...raw].sort((a, b) => b.len - a.len)) {
    if (claimed.some(c => h.idx < c.idx + c.len && c.idx < h.idx + h.len)) continue;
    claimed.push(h);
  }
  return claimed.sort((a, b) => a.idx - b.idx).map(h => h.f);
}

const titleCase = (s) => s.split(/\s+/).map((w, i) =>
  (i > 0 && /^(and|or|of|the|a|an|for|to)$/i.test(w)) ? w.toLowerCase()
    : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');

/**
 * The aggregates the requirement prose actually asks for, in sentence order.
 * Returns [] when the prose names no specific aggregate — the caller then
 * falls back to role-based sums. Two shapes are recognised:
 *   "how many X are below their <field>"  → a conditional count, comparing a
 *     same-typed subject field against the named threshold field;
 *   "the total value of <...>"            → quantity × price summed over the
 *     collection (the quantity is the unit-bound or stat field).
 * The previous derivation ignored the sentences entirely and summed the
 * first three stat/price fields by role, which produced tiles like "TOTAL
 * UNIT COST ₹50,483.7" — a sum of per-unit prices, answering nothing.
 */
function parseAggregateRequirements(reqs, fields, entity = {}) {
  const found = [];   // { idx, agg } — sentence order preserved at the end
  const byLabel = (phrase) => {
    const p = String(phrase).trim().toLowerCase();
    return fields.find(f => (f.label || f.id).toLowerCase() === p)
      || fields.find(f => (f.label || f.id).toLowerCase().includes(p) || p.includes((f.label || f.id).toLowerCase()));
  };
  const pluralLc = String(entity.plural || '').toLowerCase();
  const labelLc = String(entity.label || '').toLowerCase();
  for (const s of sentencesOf(reqs)) {
    // "how many X are below their <field>" — a conditional count.
    const cm = /(?:how many|count of|number of)\b[^.]*?\b(below|above|under|over)\s+(?:their|its|the)\s+([a-z][a-z ]*?)(?:,| and\b|\.|$)/i.exec(s);
    if (cm) {
      const threshold = byLabel(cm[2]);
      if (threshold) {
        const below = /below|under/i.test(cm[1]);
        const subject = fields.find(f => f.id !== threshold.id && f.type === threshold.type && (f.role === 'stat' || f.role === 'price'))
          || fields.find(f => f.id !== threshold.id && f.type === threshold.type);
        if (subject) found.push({ idx: cm.index, agg: {
          id: 'count-' + threshold.id,
          label: `${below ? 'Below' : 'Above'} ${threshold.label || threshold.id}`,
          op: 'countWhere', field: subject.id, compareField: threshold.id,
          compare: below ? '<' : '>', format: 'plain',
        } });
      }
    }
    // "the total <name> computed as <field> times <field>" — a product sum
    // whose operands the sentence names, in either order.
    const pm = /total\s+([a-z][a-z ]*?)\s+computed as\s+([a-z][a-z ]*?)\s+times\s+([a-z][a-z ]*?)(?:\s+summed)?(?:\s+across\s+[a-z ]+?)?(?:,| and\b|\.|$)/i.exec(s);
    if (pm) {
      const fa = byLabel(pm[2]);
      const fb = byLabel(pm[3]);
      if (fa && fb && fa.id !== fb.id) found.push({ idx: pm.index, agg: {
        id: 'total-' + fa.id + '-x-' + fb.id,
        label: 'Total ' + pm[1].trim(),
        op: 'sumProduct', fields: [fa.id, fb.id],
        format: (fa.type === 'money' || fb.type === 'money') ? 'money' : 'plain',
      } });
    }
    // "the total value of <...>" — the long-standing product shape.
    const vm = /total value(?:\s+of\s+([a-z][a-z ]*?))?(?:,|\.|$)/i.exec(s);
    if (vm && !found.some(f => f.agg.op === 'sumProduct')) {
      const qty = fields.find(f => f.unitField) || fields.find(f => f.role === 'stat');
      const money = fields.find(f => f.role === 'price');
      if (qty && money) found.push({ idx: vm.index, agg: {
        id: 'total-value',
        label: 'Total value' + (vm[1] ? ' of ' + vm[1].trim() : ''),
        op: 'sumProduct', fields: [qty.id, money.id], format: 'money',
      } });
    }
    // "the count of <phrase>" / "the number of <phrase>" — the phrase is
    // either the collection itself (a plain count) or "<option> <plural>"
    // naming a value of an enum field (a count of matching records).
    for (const m of s.matchAll(/(?:the\s+)?(?:count of|number of)\s+([a-z][a-z' ]*?)(?=\s*,|\s+and\b|\.|$)/gi)) {
      const phrase = m[1].trim().toLowerCase();
      if (/\b(below|above|under|over)\b/.test(phrase)) continue;
      if (phrase === pluralLc || phrase === labelLc || phrase === labelLc + 's') {
        found.push({ idx: m.index, agg: { id: 'count', label: entity.plural || titleCase(phrase), op: 'count', format: 'plain' } });
        continue;
      }
      for (const f of fields) {
        if (!Array.isArray(f.options)) continue;
        const hit = f.options.find(v => phrase === String(v).toLowerCase()
          || phrase.startsWith(String(v).toLowerCase() + ' '));
        if (hit) {
          found.push({ idx: m.index, agg: {
            id: 'count-' + f.id + '-' + String(hit).toLowerCase().replace(/\s+/g, '-'),
            label: titleCase(phrase), op: 'countWhereEq', field: f.id, value: hit, format: 'plain',
          } });
          break;
        }
      }
    }
    // "the total <field label>" — a plain sum over the named field.
    for (const m of s.matchAll(/(?:the\s+)?total\s+([a-z][a-z ]*?)(?=\s*,|\s+and\b|\.|$)/gi)) {
      const phrase = m[1].trim().toLowerCase();
      if (/computed|value of/.test(phrase)) continue;
      const f = byLabel(phrase);
      if (f && (f.type === 'money' || f.type === 'number')) found.push({ idx: m.index, agg: {
        id: 'sum-' + f.id, label: 'Total ' + (f.label || f.id),
        op: 'sum', field: f.id, format: f.type === 'money' ? 'money' : 'plain',
      } });
    }
  }
  found.sort((a, b) => a.idx - b.idx);
  const seen = new Set();
  return found.filter(f => !seen.has(f.agg.id) && seen.add(f.agg.id)).map(f => f.agg);
}

/**
 * A stepped flow whose steps and fields come from the requirement that
 * describes it: "in three steps: quantity and supplier, then the required
 * date, then review" yields steps [quantity, supplier] → [required date] →
 * [review]. A phrase that names a collection field reuses that field; any
 * other phrase becomes a flow field whose type is inferred from its words
 * (date → date input, quantity → positive number, email/phone → the usual
 * patterns). Returns null when no requirement describes steps this way, so
 * the caller keeps the documented contact-form fallback.
 */
function parseSteppedFlow(reqs, fields) {
  for (const s of sentencesOf(reqs)) {
    if (!/\bsteps?\b/i.test(s) || !s.includes(':')) continue;
    const tail = s.slice(s.indexOf(':') + 1);
    const segments = tail.split(/\bthen\b/i).map(x => x.trim().replace(/[.,;]+$/, '').trim()).filter(Boolean);
    if (segments.length < 2) continue;
    const form = [];
    const steps = [];
    const usedIds = new Set();
    const mkField = (phraseRaw) => {
      const phrase = phraseRaw.replace(/^(the|a|an)\s+/i, '').trim();
      const norm = phrase.toLowerCase();
      const hit = fields.find(f => (f.label || f.id).toLowerCase() === norm || f.id.toLowerCase() === norm);
      let fld;
      if (hit) {
        const type = hit.type === 'date' ? 'date' : (hit.type === 'number' || hit.type === 'money') ? 'number' : 'text';
        fld = { id: hit.id, label: hit.label || hit.id, type };
      } else if (/\bdate\b/i.test(phrase)) fld = { id: slug(phrase), label: titleCase(phrase), type: 'date' };
      else if (/\b(quantity|amount|count|number|units?)\b/i.test(phrase)) fld = { id: slug(phrase), label: titleCase(phrase), type: 'number', pattern: '^[1-9]\\d*$', message: `Enter a ${phrase} of 1 or more.` };
      else if (/\bemail\b/i.test(phrase)) fld = { id: slug(phrase), label: titleCase(phrase), type: 'text', pattern: '^[^@\\s]+@[^@\\s]+\\.[a-z]{2,}$', message: 'Enter a valid email address.' };
      else if (/\b(phone|mobile)\b/i.test(phrase)) fld = { id: slug(phrase), label: titleCase(phrase), type: 'tel', pattern: '^\\d{10}$', stripWhitespace: true, message: 'Enter a 10-digit mobile number.' };
      else fld = { id: slug(phrase), label: titleCase(phrase), type: 'text' };
      let id = fld.id; let n = 2;
      while (usedIds.has(id)) id = `${fld.id}-${n++}`;
      fld.id = id; usedIds.add(id);
      fld.required = true;
      fld.testid = 'field-' + id;
      fld.errorTestid = 'error-' + id;
      if (!fld.message) fld.message = `Enter ${phrase}.`;
      form.push(fld);
      return fld;
    };
    let ok = true;
    for (const seg of segments) {
      const clean = seg.replace(/^(the|a|an)\s+/i, '').trim();
      if (/^review\b/i.test(clean)) { steps.push({ id: 'review', label: 'Review', fields: [], review: true }); continue; }
      const phrases = seg.split(/\s+and\s+/i).map(x => x.trim()).filter(Boolean);
      if (!phrases.length) { ok = false; break; }
      const flds = phrases.map(mkField);
      steps.push({ id: slug(titleCase(clean)) || `step-${steps.length + 1}`, label: titleCase(clean), fields: flds.map(f => f.id) });
    }
    if (!ok || !form.length || steps.length < 2) continue;
    if (!steps.some(st => st.review)) steps.push({ id: 'review', label: 'Review', fields: [], review: true });
    return { form, steps };
  }
  return null;
}

/** The entry action's label from the commit requirement ("raise a
 *  replenishment order" → "Raise replenishment order"), or null. */
function deriveEntryLabel(reqs, product) {
  const STOP_NOUN = /^(from|by|through|in|on|for|with|via|at|to|takes|steps)$/i;
  for (const s of sentencesOf(reqs)) {
    const m = /\b(raise|place|create|submit|book|make|start|enrol|enroll|join|commission|hire|apply|applies|register|reserve|order|request|subscribe)(?:s|es|ing|ed|d)?\s+(?:a\s+|an\s+|the\s+)?([a-z][a-z' ]*?)(?:\s+for\b|\s+in\b|\s+on\b|\s+with\b|\s+from\b|,|\.|:|$)/i.exec(s);
    if (!m) continue;
    // A verb inside a relative clause is not the product's action:
    // "…shows its maker and what makes it distinct" once produced the
    // button label "Make it distinct".
    if (/\b(what|that|which)\s*$/i.test(s.slice(0, m.index))) continue;
    // Lemmatise the matched inflection ("applies" -> apply, "booking" -> book).
    const lemma = m[1].toLowerCase().replace(/ies$/, 'y').replace(/(ing|ed|es|s)$/, '');
    const verb = lemma.charAt(0).toUpperCase() + lemma.slice(1);
    const noun = m[2].trim();
    if (!STOP_NOUN.test(noun.split(' ')[0])) return verb + ' ' + noun;
    // "A patient books from a practitioner's page…" — the verb is real but
    // its object is the thing being booked, named by the availability the
    // brief declares ("Appointment time" -> "Book appointment").
    if (product && product.availability && product.availability.label) {
      const obj = product.availability.label.replace(/\btime\b/i, '').trim();
      if (obj) return verb + ' ' + obj.toLowerCase();
    }
    // "A student can enrol in three steps…" — the verb is real and its
    // object is the collection itself. "Enrol course" beats "Start",
    // which names nothing the user is doing.
    if (product && product.collection && product.collection.label) {
      return verb + ' ' + product.collection.label.toLowerCase();
    }
  }
  return null;
}

export function deriveBrief(product, evidence) {
  const reqs = product.requirements || [];
  const notes = [];
  const fields = deriveRoles(product.fields || [], reqs);
  const cap = deriveCapabilities(reqs);
  const comp = { value: null };
  const compositionPlan = null;

  // facet options, derived from the records when the brief does not give them
  const items = product.collection.items || [];
  for (const f of fields) {
    if (f.role === 'facet' && !f.options) {
      f.options = Array.from(new Set(items.map(r => r[f.id]).filter(Boolean)));
      notes.push(`facet "${f.id}" options derived from the data: ${f.options.join(', ')}`);
    }
  }

  const entityId = slug(product.collection.label || 'record');
  const label = product.collection.label || 'Record';
  const plural = product.collection.plural || (label + 's');

  const brief = {
    app: `${product.name} — ${product.about || product.tagline || ''}`.trim(),
    brand: product.name,
    tagline: product.tagline || '',
    subtitle: product.about || '',
    location: product.location || '',
    currency: product.currency || '',
    unit: product.unit || '',
    domain: product.domain || 'general',
    family: product.family || slug(product.name),
    views: [slug(plural)],
    _derived: {
      note: 'Generated by engine/intake/derive.mjs from a product brief. Roles, capabilities and composition are inferences, not declarations.',
      requirements: reqs,
      capabilities: cap,
      composition: comp,
      notes,
    },
    entity: {
      id: entityId, label, plural,
      media: fields.some(f => f.role === 'media') || product.collection.media === true,
      titleClass: `${entityId}-name`,
      backTestid: 'back-btn',
      collection: { listTestid: `${entityId}-list`, itemTestid: `${entityId}-card`, openTestid: `${entityId}-open` },
      fields,
      records: items,
    },
  };

  // M036: a declared availability (days + slots) in the product brief is
  // product data, like the records — pass it through untouched. Before
  // this, derive silently DROPPED it: the planner, runtime and testplan
  // all implement slot selection, but no brief-driven app could ever
  // offer it, so a booking product lost its central interaction without
  // a word. Shape is validated by the planner's IR checks downstream.
  if (product.availability && Array.isArray(product.availability.slots) && product.availability.slots.length
      && (typeof product.availability.days === 'number' || (Array.isArray(product.availability.days) && product.availability.days.length))) {
    brief.availability = {
      label: product.availability.label || 'Time',
      // The runtime generates real calendar days (weekday + date) from a
      // count; a brief that names its days contributes the count.
      days: typeof product.availability.days === 'number' ? product.availability.days : product.availability.days.length,
      slots: product.availability.slots.slice(),
    };
    if (product.availability.rule) brief.availability.rule = product.availability.rule;
    notes.push('availability declared in the brief: slot selection offered on the detail view');
  }

  // ---- composition: chosen from purpose and evidence, with a rationale ----
  // This runs before any capability is turned into a section, because the
  // composition decides which sections are even meaningful.
  const statedIntent = (product.intent && product.intent.composition) || null;
  brief.intent = {};
  if (product.prohibited && product.prohibited.length) brief.intent.prohibited = product.prohibited;
  if (statedIntent) brief.intent.composition = statedIntent;
  const transfer = evidence ? assessTransfer({ brief, product, evidence }) : null;
  const rationale = planComposition({ brief, product, evidence, transfer });
  if (transfer) brief._derived.transfer = transfer;
  brief.intent.composition = rationale.composition;
  brief._derived.compositionRationale = rationale;

  if (cap.search) {
    const textFields = fields.filter(f => f.role === 'title' || f.role === 'subtitle').map(f => f.id);
    brief.search = { fields: textFields, placeholder: `Search ${plural.toLowerCase()}`, testid: 'search' };
  }
  if (cap.filters) {
    const facets = fields.filter(f => f.role === 'facet');
    if (facets.length) {
      brief.filters = facets.map(f => ({ id: f.id, field: f.id, label: f.label || f.id, testid: `${f.id}-chip`, dataAttr: `data-${f.id}`, allLabel: 'All' }));
    } else {
      notes.push('requirements ask for a filter but no field was derived as a facet');
    }
  }
  if (cap.aggregates) {
    // Aggregates the prose asks for come first; role-based sums are only the
    // fallback for briefs that ask for "summary numbers" without saying
    // which. Summing a per-unit price column was never a summary of anything.
    const parsed = parseAggregateRequirements(reqs, fields, { plural, label: product.collection.label });
    if (parsed.length) {
      brief.aggregates = parsed;
      notes.push(`aggregates derived from the requirement wording: ${parsed.map(a => a.label).join('; ')}`);
    } else {
      const stats = fields.filter(f => f.role === 'stat' || f.role === 'price');
      brief.aggregates = stats.slice(0, 3).map(f => ({
        id: f.id, label: `Total ${f.label || f.id}`, op: f.type === 'number' || f.type === 'money' ? 'sum' : 'count', field: f.id,
        format: f.type === 'money' ? 'money' : 'plain',
      }));
    }
    if (items.length && !brief.aggregates.some(a => a.id === 'count')) brief.aggregates.push({ id: 'count', label: plural, op: 'count', format: 'plain' });
    brief.aggregatesTestid = 'metrics';
    brief.aggregatesTileTestid = 'kpi-tile';
    brief.aggregatesValueTestid = 'kpi-value';
  }
  if (cap.table) {
    // Columns come from the brief, not from declaration order: the title
    // field, then the fields the table sentence names in the order it names
    // them, then the record's classifiers (facet/status). The previous rule
    // — the first five declared fields — silently dropped any named column
    // a brief happened to declare sixth or later.
    const named = [];
    for (const s of sentencesOf(reqs)) {
      if (!/\btable\b/i.test(s)) continue;
      for (const f of fieldsNamedInOrder(s, fields)) if (!named.includes(f)) named.push(f);
    }
    const cols = [];
    const pushCol = (f) => {
      if (f && !cols.some(c => c.field === f.id)) {
        cols.push({ field: f.id, label: f.label || f.id, align: ['stat', 'price'].includes(f.role) ? 'right' : undefined });
      }
    };
    pushCol(fields.find(f => f.role === 'title'));
    named.forEach(pushCol);
    fields.filter(f => f.role === 'facet' || f.role === 'status').forEach(pushCol);
    if (!cols.length) fields.slice(0, 5).forEach(pushCol);
    brief.table = { columns: cols };
  }
  // An article is only declared when the requirements ask the reader to read
  // something long-form AND the chosen composition is an editorial one. A field
  // called "story" is not, by itself, a reason to render an article.
  if (cap.article && ['index', 'editorial'].includes(brief.intent.composition)) {
    const body = fields.find(f => f.role === 'body')
      || fields.find(f => /\b(body|copy|text|content)\b/i.test(f.label || ''))
      || fields.filter(f => f.type === 'text').slice(-1)[0];
    const stand = fields.find(f => /standfirst|summary|deck|lede|intro|description/i.test(f.id + ' ' + (f.label || '')) && f.id !== (body && body.id));
    if (body) {
      if (body.role !== 'body') { body.role = 'body'; body.roleSource = 'derived-for-article'; }
      // The standfirst gets its own role too, as the body does: leaving it
      // at 'detail' made the article's bound standfirst invisible to the
      // capability and fulfilment checks, which look for the role the
      // article actually renders.
      if (stand && stand.role !== 'standfirst') { stand.role = 'standfirst'; stand.roleSource = 'derived-for-article'; }
      brief.article = { body: body.id, standfirst: stand ? stand.id : null, byline: null };
    } else {
      notes.push('requirements ask for an article but no body field was derived');
    }
  } else if (cap.article) {
    notes.push(`a reading requirement was detected but the composition is "${brief.intent.composition}", so no article was declared`);
  }
  if (cap.bag) {
    const priceField = fields.find(f => f.role === 'price') || fields.find(f => f.type === 'money');
    brief.bag = {
      label: product.bagLabel || 'Bag',
      priceField: priceField ? priceField.id : null,
      deliveryFee: typeof product.deliveryFee === 'number' ? product.deliveryFee : null,
      freeAbove: typeof product.freeAbove === 'number' ? product.freeAbove : null,
      // M045: a brief may declare its items unique (classifieds
      // listings, one-off pieces) with "uniqueItems": true — the bag
      // then holds at most one of each record. A record may also
      // carry a numeric "stock" field, which caps its quantity.
      unique: product.uniqueItems === true,
    };
    if (brief.bag.unique) notes.push('the bag treats every item as unique (quantity capped at 1)');
    notes.push(`a bag was derived (price field ${brief.bag.priceField || 'none'}${brief.bag.deliveryFee != null ? `, delivery ${brief.bag.deliveryFee}` : ''}${brief.bag.freeAbove != null ? `, free above ${brief.bag.freeAbove}` : ''})`);
  }
  // M040: a declared home promo passes through as declared — the
  // product's own marketing content, not an engine invention.
  if (product.promo && product.promo.title) {
    brief.promo = {
      title: product.promo.title, subtitle: product.promo.subtitle || '',
      image: product.promo.image || '', recordId: product.promo.recordId || '',
      cta: product.promo.cta || '',
    };
  }
  const actions = [];
  if (cap.save) actions.push({ id: 'save', label: 'Save', kind: 'toggle', field: 'saved' });

  if (cap.commit) {
    // A commit is a form. The fields come from what the product says it
    // needs: when a requirement describes the flow's steps and names their
    // fields, the form IS those fields (parseSteppedFlow). The contact
    // minimum below is only the fallback for briefs that describe a commit
    // without naming what it collects — it used to be the unconditional
    // output, so a replenishment order asked for a name and an email and
    // never for a quantity.
    const parsedFlow = cap.steps ? parseSteppedFlow(reqs, fields) : null;
    const form = parsedFlow ? parsedFlow.form : [
      { id: 'fullName', label: 'Your name', type: 'text', testid: 'field-name', errorTestid: 'error-name', required: true, minLength: 2, message: 'Enter your name.' },
      { id: 'phone', label: 'Mobile number', type: 'tel', testid: 'field-phone', errorTestid: 'error-phone', required: true, pattern: '^\\d{10}$', stripWhitespace: true, message: 'Enter a 10-digit mobile number.' },
      { id: 'email', label: 'Email', type: 'text', testid: 'field-email', errorTestid: 'error-email', required: true, pattern: '^[^@\\s]+@[^@\\s]+\\.[a-z]{2,}$', message: 'Enter a valid email address.' },
    ];
    const commit = {
      id: 'commit', label: product.commitLabel || 'Confirm', kind: 'commit', testid: 'confirm-btn',
      form,
      result: {
        collection: 'submissions',
        referencePrefix: product.referencePrefix || 'RF',
        title: product.commitTitle || 'Confirmed',
        referenceTestid: 'confirm-ref',
        summaryTestid: 'confirm-summary',
      },
    };
    if (parsedFlow) {
      commit.steps = parsedFlow.steps;
      notes.push(`a stepped flow was derived from the requirement wording: ${parsedFlow.steps.map(s => s.label).join(' → ')}`);
    } else if (cap.steps) {
      // Split the form across three steps, ending with a review.
      commit.steps = [
        { id: 'details', label: 'Details', fields: ['fullName'] },
        { id: 'contact', label: 'Contact', fields: ['phone', 'email'] },
        { id: 'review', label: 'Review', fields: [], review: true },
      ];
      notes.push('a three-step flow was derived from the requirement wording; the step split is an inference');
    }
    actions.push(commit);
    brief.collections = [{
      id: 'submissions', view: 'submissions', label: product.submissionsLabel || 'Your submissions',
      listTestid: 'submission-list', itemTestid: 'submission-item', backTestid: 'back-btn',
      fields: brief.bag
        ? ['ref', 'items', 'total', ...((parsedFlow && parsedFlow.steps.find(s => !s.review)) || { fields: [] }).fields]
        : parsedFlow
          ? ['ref', ...(parsedFlow.steps.find(s => !s.review) || { fields: [form[0].id] }).fields]
          : ['ref', 'fullName'],
      emptyMessage: 'Nothing here yet.',
    }];
    // A bag app checks out from the bag, not from a record page or a
    // browse-level button — no entry action is created for it.
    if (!brief.bag && (cap.steps || /\bstart\b|\bplace\b|\badd .* to (an )?order\b/i.test(reqs.join(' ')))) {
      brief.entryAction = { label: product.entryLabel || deriveEntryLabel(reqs, product) || 'Start', testid: 'start-action', action: 'commit' };
    }
  }
  if (actions.length) brief.actions = actions;

  brief._derived.composition = { value: brief.intent.composition, evidence: rationale.note || rationale.decidedBy };
  // Scoped requirements run after roles exist and after the composition is
  // known, so a requirement can be scoped to a view that will actually exist.
  const scoped = deriveScopedRequirements(product, brief);
  brief._derived.scoped = scoped;
  for (const u of scoped.unresolved) notes.push(`unscoped requirement: "${u.text.slice(0, 60)}" — ${u.reason}`);

  brief._derived.roleTable = fields.map(f => `${f.id}: ${f.type} -> ${f.role}`).join('\n');
  return brief;
}

export { deriveCapabilities, deriveComposition, deriveRoles };
