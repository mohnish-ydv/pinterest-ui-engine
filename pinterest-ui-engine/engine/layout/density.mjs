// density.mjs — choose information density from the product, not from a constant.
//
// MISSION 035. Mission 034 replaced one global default (28px title, 132px media)
// with another global default (24px, 96px). A single number cannot be right for
// a dense operations table and a long-form index at once.
//
// The policy answers three questions and records why:
//   1. what is this surface FOR (scan, browse, or read)?
//   2. how much content must it carry?
//   3. what are the floors it may never go below?
//
// It deliberately does not optimise page height or records-above-the-fold. Those
// are outcomes, not objectives; a page can be short and unreadable.

export const MODES = ['compact', 'balanced', 'spacious'];

// Floors. A density choice may never breach these, whatever the content wants.
export const FLOORS = {
  bodyPx: 14,
  titlePx: 22,
  sectionPx: 17,
  smallPx: 12,
  cardMediaPx: 88,
  touchTargetPx: 44,
  rowGapPx: 8,
};

const SCALES = {
  compact:   { body: 14, display: 22, section: 17, small: 12, amount: 14, media: 88,  pad: 0.82 },
  balanced:  { body: 14, display: 24, section: 18, small: 12, amount: 15, media: 96,  pad: 1.00 },
  spacious:  { body: 15, display: 28, section: 19, small: 13, amount: 16, media: 132, pad: 1.16 },
};

/**
 * @param {object} brief  engine brief (post-derivation), may be null
 * @param {object} [opts] { viewportWidth }
 */
export function chooseDensity(brief, opts = {}) {
  const signals = [];
  const comp = (brief && brief.intent && brief.intent.composition) || 'row-list';
  const fields = (brief && brief.entity && brief.entity.fields) || [];
  const records = (brief && brief.entity && brief.entity.records) || [];
  const vw = opts.viewportWidth || 390;

  // 1. What is the surface for?
  //    A table or a long list is scanned; a gallery is browsed; prose is read.
  const readingSurfaces = ['index', 'editorial'];
  const scanningSurfaces = ['table', 'dashboard', 'row-list'];
  const browsingSurfaces = ['gallery'];

  let mode = 'balanced';
  if (readingSurfaces.includes(comp)) { mode = 'spacious'; signals.push({ factor: 'composition', value: comp, weight: 'spacious', why: 'prose is read, not scanned — line length and leading matter more than count' }); }
  else if (scanningSurfaces.includes(comp)) { mode = 'compact'; signals.push({ factor: 'composition', value: comp, weight: 'compact', why: 'the surface is scanned for one record — density helps comparison' }); }
  else if (browsingSurfaces.includes(comp)) { mode = 'balanced'; signals.push({ factor: 'composition', value: comp, weight: 'balanced', why: 'a gallery trades records-per-screen against the media it exists to show' }); }

  // 2. How much content must it carry?
  const numeric = fields.filter(f => f.type === 'number' || f.type === 'money').length;
  const texty = fields.filter(f => f.type === 'text').length;
  if (records.length >= 12) { signals.push({ factor: 'recordCount', value: records.length, weight: 'compact', why: 'many records — the cost of extra padding compounds' }); if (mode !== 'spacious') mode = 'compact'; }
  if (numeric >= 3 && comp === 'table') { signals.push({ factor: 'numericFields', value: numeric, weight: 'compact', why: 'a numeric table is compared column-wise; tight rows aid comparison' }); }
  if (texty >= 3 && records.length <= 5) { signals.push({ factor: 'textFields', value: texty, weight: 'spacious', why: 'few records with much prose — room improves reading' }); if (mode === 'compact' && comp !== 'table') mode = 'balanced'; }

  // 3. Viewport: a phone cannot afford the spacing a desktop can.
  if (vw < 420 && mode === 'spacious') { mode = 'balanced'; signals.push({ factor: 'viewport', value: vw, weight: 'balanced', why: 'below 420px the spacious scale pushes content below the fold without improving reading' }); }
  if (vw >= 1200 && mode === 'compact') { mode = 'balanced'; signals.push({ factor: 'viewport', value: vw, weight: 'balanced', why: 'wide viewports have room; compact there reads cramped rather than efficient' }); }

  // 4. A dense reference must not be copied literally.
  const transfer = brief && brief._derived && brief._derived.transfer;
  if (transfer && transfer.summary && transfer.summary.rejected && transfer.summary.rejected.includes('density')) {
    signals.push({ factor: 'reference', value: 'density rejected', weight: mode, why: "the reference's density was assessed as inapplicable to this product" });
  }

  const scale = Object.assign({}, SCALES[mode]);
  // floors are enforced after the choice, never before it
  const clamped = [];
  for (const [k, floor] of Object.entries({
    body: FLOORS.bodyPx, display: FLOORS.titlePx, section: FLOORS.sectionPx,
    small: FLOORS.smallPx, media: FLOORS.cardMediaPx,
  })) {
    if (scale[k] < floor) { clamped.push(`${k} ${scale[k]}→${floor}`); scale[k] = floor; }
  }

  return {
    densityVersion: '1.0.0',
    mode,
    scale,
    floors: FLOORS,
    clamped,
    signals,
    rationale: signals.map(s => `${s.factor}=${s.value} → ${s.weight}: ${s.why}`),
    objective: 'usability, not page height or records-above-the-fold',
  };
}

export function describeDensity(d) {
  return `density "${d.mode}" — display ${d.scale.display}px, body ${d.scale.body}px, media ${d.scale.media}px` +
    (d.clamped.length ? ` (floors applied: ${d.clamped.join(', ')})` : '') +
    `\n  ` + d.rationale.join('\n  ');
}
