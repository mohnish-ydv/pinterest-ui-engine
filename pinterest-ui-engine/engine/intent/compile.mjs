// compile.mjs — design intent -> enforceable constraints.
//
// MISSION 026, Phase 2. The audit in AUDIT.md found that design-spec fields
// `composition`, `grammar`, `imagery`, `provenance` and `specVersion` are read
// by NOTHING. U2 Quarto's spec says "A typographic index: title, standfirst,
// byline, rule. No cards, no media." and the planner never saw a word of it —
// which is why the engine emitted cards with initial chips.
//
// This compiles intent into constraints that a later stage can enforce, and it
// keeps two things strictly apart:
//
//   stated    the brief or spec explicitly declares the constraint
//             (design-spec.intent.*)
//   inferred  the engine read it out of prose, and says which phrase it read
//
// An inferred constraint carries the exact text it came from and a confidence.
// Nothing is silently discarded: an instruction the compiler cannot turn into a
// constraint is reported as `uncompiled` with the reason.

const COMPOSITIONS = ['index', 'editorial', 'gallery', 'row-list', 'table', 'dashboard', 'form', 'timeline'];

let SEQ = 0;
const nextId = (kind) => `CI-${String(++SEQ).padStart(3, '0')}-${kind}`;

/** Prose -> candidate constraints. Every rule quotes what it matched. */
const PROSE_RULES = [
  { kind: 'prohibited', element: 'card', re: /\bno cards?\b|\bnot cards?\b|\bwithout cards?\b/i,
    statement: 'Cards are prohibited: the collection must not use card chrome.' },
  { kind: 'prohibited', element: 'media', re: /\bno media\b|\bwithout (?:any )?(?:imagery|images|media)\b|\bno (?:imagery|images)\b/i,
    statement: 'Media is prohibited: no image or media block may be rendered.' },
  { kind: 'prohibited', element: 'initial-chip', re: /\bno (?:avatars?|initials?|initial chips?)\b/i,
    statement: 'Decorative initials are prohibited.' },
  { kind: 'composition', value: 'index', re: /\btypographic index\b|\ban index of\b|\bindex of (?:essays|pieces|articles)\b/i,
    statement: 'The collection must read as a typographic index: rules, no card chrome.' },
  { kind: 'composition', value: 'table', re: /\b(?:a )?(?:five|four|three|\d+)[- ]column table\b|\btable of\b/i,
    statement: 'The collection must be a table.' },
  { kind: 'composition', value: 'dashboard', re: /\bKPI band\b|\bKPI row\b|\bmetrics? (?:band|row)\b/i,
    statement: 'The entry view must open with a KPI band.' },
  { kind: 'composition', value: 'gallery', re: /\bcard grid\b|\bgallery\b|\bgrid of\b/i,
    statement: 'The collection must be a card grid.' },
];

/** Compile the design spec into constraints. */
export function compileIntent(brief, spec) {
  SEQ = 0;
  const constraints = [];
  const uncompiled = [];
  // Intent may be declared in the design spec (where composition belongs) or in
  // the brief (where "the product must not use cards" belongs). Spec wins when
  // both exist, and the source is recorded so the report says which.
  const intent = spec.intent || brief.intent || {};
  const intentHome = spec.intent ? 'design-spec.intent' : (brief.intent ? 'brief.intent' : null);

  const add = (c) => constraints.push(Object.assign({
    hardness: 'hard', source: 'stated', evidence: '', irField: null,
    enforce: null, test: null, failureMessage: null,
  }, c, { id: nextId(c.kind) }));

  // ---- 1. stated composition -------------------------------------------
  if (intent.composition) {
    const value = typeof intent.composition === 'string' ? intent.composition : intent.composition.value;
    if (!COMPOSITIONS.includes(value)) {
      uncompiled.push({ field: 'intent.composition', value, reason: `"${value}" is not one of the supported compositions (${COMPOSITIONS.join(', ')})` });
    } else {
      // Provenance matters: a composition the PRODUCT stated is an
      // instruction; a composition the ENGINE derived from the brief is an
      // inference, and reporting it as "stated" launders the inference into
      // an instruction (the derived dashboard on a stock brief was
      // enforced downstream as if the product had declared it). The
      // derivation records how the composition was decided; use it.
      const decidedBy = brief._derived && brief._derived.compositionRationale
        ? brief._derived.compositionRationale.decidedBy : null;
      const derived = intentHome === 'brief.intent' && decidedBy && decidedBy !== 'stated intent';
      add({ kind: 'composition', value,
        source: derived ? 'derived' : 'stated',
        statement: `The collection must use the "${value}" composition.`,
        evidence: derived
          ? `${intentHome}.composition (derived by the engine: ${decidedBy})`
          : `${intentHome}.composition (stated)`,
        irField: 'views[0].sections[collection].variant',
        enforce: { stage: 'plan', mechanism: 'the planner selects the collection variant from the composition' },
        test: 'constraint.test.mjs — stated composition selects the matching variant',
        failureMessage: `composition "${value}" was declared but the planner produced a different surface` });
    }
  }

  // ---- 2. stated prohibitions ------------------------------------------
  for (const p of (intent.prohibited || [])) {
    const element = typeof p === 'string' ? p : p.element;
    add({ kind: 'prohibited', element,
      statement: `"${element}" must not be rendered.`,
      evidence: `${intentHome}.prohibited (stated)`,
      irField: 'views[].sections[].component / rendered class names',
      enforce: { stage: 'both', mechanism: 'the planner may not select a component that emits it; the renderer is checked afterwards' },
      test: 'constraint.test.mjs — a stated prohibition is enforced or fails the build',
      failureMessage: `"${element}" was prohibited but appears in the generated app` });
  }

  // ---- 3. inferred from prose ------------------------------------------
  // composition prose, imagery role, grammar — the fields that were inert.
  const proseSources = [
    ['composition.home', spec.composition?.home],
    ['composition.detail', spec.composition?.detail],
    ['composition.density', spec.composition?.density],
    ['grammar.cta', spec.grammar?.cta],
    ['imagery.role', spec.imagery?.role],
  ].filter(([, text]) => typeof text === 'string' && text.trim());

  const statedKinds = new Set(constraints.map(c => `${c.kind}:${c.element || c.value}`));
  for (const [field, text] of proseSources) {
    for (const rule of PROSE_RULES) {
      const m = rule.re.exec(text);
      if (!m) continue;
      const key = `${rule.kind}:${rule.element || rule.value}`;
      if (statedKinds.has(key)) continue; // stated wins; do not duplicate
      statedKinds.add(key);
      add({ kind: rule.kind, value: rule.value, element: rule.element,
        statement: rule.statement,
        source: 'inferred', confidence: 'high',
        evidence: `${field}: "${m[0]}" — read from prose, not declared as a constraint`,
        irField: rule.kind === 'composition' ? 'views[0].sections[collection].variant' : 'rendered class names',
        enforce: rule.kind === 'composition'
          ? { stage: 'plan', mechanism: 'planner selects the variant' }
          : { stage: 'both', mechanism: 'planner avoids it; renderer is checked afterwards' },
        test: 'constraint.test.mjs — an inferred prohibition is enforced or reported',
        failureMessage: `prose in ${field} forbids "${rule.element || rule.value}" but it appears in the generated app` });
    }
  }

  // ---- 4. media declared absent ----------------------------------------
  if (typeof spec.imagery?.role === 'string' && /^none\b/i.test(spec.imagery.role.trim())) {
    if (!statedKinds.has('prohibited:media')) {
      add({ kind: 'prohibited', element: 'media', source: 'inferred', confidence: 'high',
        statement: 'The spec declares no imagery role, so no media block may be rendered.',
        evidence: 'imagery.role: "None." (stated in the spec, compiled to a prohibition)',
        irField: 'rendered .card-media / .rec-media',
        enforce: { stage: 'both', mechanism: 'the card variant is not selected; the renderer is checked' },
        test: 'constraint.test.mjs',
        failureMessage: 'media appears although imagery.role is None' });
    }
  }

  // ---- 5. hierarchy, when declared --------------------------------------
  if (intent.hierarchy) {
    add({ kind: 'hierarchy', value: intent.hierarchy,
      statement: `Content hierarchy: ${intent.hierarchy.primary || 'title'} leads, then ${intent.hierarchy.secondary || 'nothing'}.`,
      evidence: 'design-spec.intent.hierarchy (stated)',
      irField: 'collection variant + typography scale',
      enforce: { stage: 'post', mechanism: 'the critique checks that the primary field is the largest text in the row' },
      test: 'critique.test.mjs — hierarchy-mismatch detector',
      failureMessage: 'the declared primary content is not the most prominent text' });
  }

  // ---- 6. mobile strategy ----------------------------------------------
  const mobile = intent.mobile || {};
  add({ kind: 'mobile', value: mobile.tableStrategy || 'scroll-affordance',
    hardness: mobile.tableStrategy ? 'hard' : 'soft',
    source: mobile.tableStrategy ? 'stated' : 'inferred', confidence: 'high',
    statement: mobile.tableStrategy === 'priority-columns'
      ? 'At mobile widths the table keeps its highest-priority columns visible and the rest reachable.'
      : 'At mobile widths a table that overflows must expose a discoverable scroll affordance and stay keyboard-reachable.',
    evidence: mobile.tableStrategy ? 'design-spec.intent.mobile.tableStrategy (stated)'
      : 'inferred from the responsive requirement: a table wider than the viewport must be discoverable',
    irField: 'data-table wrapper attributes',
    enforce: { stage: 'both', mechanism: 'the renderer emits the affordance; the critique checks it is discoverable' },
    test: 'responsive.test.mjs — affordance present, keyboard-reachable, no lost columns',
    failureMessage: 'a table overflows the viewport with no discoverable affordance' });

  // ---- 7. conflicts ----------------------------------------------------
  const conflicts = [];
  const has = (kind, val) => constraints.some(c => c.kind === kind && (c.element === val || c.value === val));
  if (has('composition', 'index') && (has('prohibited', 'card') === false)) {
    // index implies no card chrome; make that explicit rather than implicit
    add({ kind: 'prohibited', element: 'card', source: 'inferred', confidence: 'high',
      statement: 'An index composition implies no card chrome.',
      evidence: 'derived from composition = "index"',
      irField: 'rendered .card',
      enforce: { stage: 'both', mechanism: 'index variant emits no card class' },
      test: 'constraint.test.mjs', failureMessage: 'cards appear in an index composition' });
  }
  // An index composition was once declared unable to carry numbers, and any
  // price/stat field in an index brief was a hard conflict. That premise is
  // stale: the collection hosts extra regions in every variant
  // (layout/capabilities.mjs — entity-collection extra: true), the planner
  // wires entry-required fields into them, the runtime renders them, and
  // fulfilment verifies the specific field is placed. A reading index whose
  // entries show a reading time is a standard editorial surface, not a
  // contradiction; the conflict made the engine refuse a whole family of
  // briefs it can in fact build. (Flagging gallery here was already found
  // to be a false conflict; the index case rested on the same error.)
  if (has('prohibited', 'media') && (brief.entity?.media === true)) {
    conflicts.push({ id: 'CONFLICT-2', severity: 'hard',
      statement: 'the entity declares media, but the spec prohibits media.',
      resolution: 'Mutually exclusive. Stop and report; do not silently drop the images.' });
  }

  return { constraints, uncompiled, conflicts, composition: constraints.find(c => c.kind === 'composition')?.value || null };
}

export { COMPOSITIONS };
