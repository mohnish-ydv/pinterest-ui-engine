// transfer.mjs — decide which parts of a reference may influence this product.
//
// MISSION 029. Mission 028 proved a reference can change a composition. It also
// produced a pantry rendered as a six-card photo grid, with two-letter initials
// standing in for photography the product does not have, and quantities shown
// without units.
//
// Influence without judgement is not design intelligence. This module asks, per
// reference feature: what was observed, what principle does it suggest, is that
// principle compatible with THIS product, what would it gain, what would it cost,
// and therefore should it transfer, be adapted, or be rejected.
//
// The test is never the product category. "Commerce" does not earn a gallery and
// "pantry" does not earn a list. The test is whether the product actually has
// what the reference is made of.

const has = (text, re) => re.test(text);

export function assessTransfer({ brief, product, evidence }) {
  const reqs = (product.requirements || []).join(' \n ');
  const entity = brief.entity || {};
  const items = entity.records || [];
  const fields = entity.fields || [];
  const inf = (evidence && evidence.inferred) || {};
  const obs = (evidence && evidence.observed) || {};

  // ---- what the product actually has ------------------------------------
  const declaresMedia = entity.media === true || fields.some(f => f.role === 'media');
  const asksForImages = has(reqs, /\b(photograph|photo|image|picture|gallery|grid of)\w*/i);
  const hasRealMedia = declaresMedia || asksForImages;
  const hasPrices = fields.some(f => f.role === 'price');
  const hasSave = has(reqs, /\b(save|favourite|favorite|shortlist|bookmark)\w*/i);
  const destinations = Object.keys(brief.navigation || (product.navigation || {})).length || 1;
  const isChecklist = has(reqs, /\b(what is in|checklist|inventory|stock|reorder|count|what we have|pantry)\b/i);
  const isBrowsing = has(reqs, /\b(browse|shop|discover|explore|gallery)\b/i);

  const features = [];
  const add = (o) => features.push(Object.assign({ confidence: 'medium', decision: 'reject' }, o));

  // ---- 1. colour relationships ------------------------------------------
  add({
    id: 'palette',
    observed: obs.clusters ? `${obs.clusters.length} dominant colour clusters` : 'colour not measured',
    principle: 'a limited palette with one committed accent and a light ground',
    productAssumption: 'none — colour carries no information architecture',
    confidence: 'high',
    compatible: true,
    benefit: 'a coherent, brand-consistent surface',
    harm: 'none beyond contrast, which the token gate enforces',
    decision: 'transfer',
    rationale: 'colour is a visual principle, not a structural claim about the product.',
  });

  // ---- 2. density and spacing rhythm ------------------------------------
  add({
    id: 'density',
    observed: `whitespace ${obs.whitespacePct}%, edge density ${obs.edgeDensity}`,
    principle: 'a spacing rhythm and information density',
    productAssumption: 'none — density is a reading comfort, not an IA',
    confidence: 'medium',
    compatible: true,
    benefit: 'comfortable scanning at the reference\'s tempo',
    harm: 'a dense rhythm can crowd a small dataset, a loose one can inflate scroll',
    decision: 'transfer',
    rationale: 'density is a principle that survives a change of subject matter.',
  });

  // ---- 3. media-led balance ---------------------------------------------
  const mediaLed = inf.mediaBalance && inf.mediaBalance.value === 'media-led';
  if (mediaLed) {
    if (hasRealMedia) {
      add({
        id: 'mediaBalance',
        observed: `media-led (${obs.flatRegionPct2}% flat rows)`,
        principle: 'let imagery carry the page',
        productAssumption: 'that the product has imagery to show',
        confidence: 'low',
        compatible: true,
        benefit: 'a visual surface appropriate to a catalogue',
        harm: 'image weight can dominate if the images are weak',
        decision: 'transfer',
        rationale: 'the product declares media or asks for photographs, so the reference\'s media-led balance has something to lead with.',
      });
    } else {
      add({
        id: 'mediaBalance',
        observed: `media-led (${obs.flatRegionPct2}% flat rows)`,
        principle: 'let imagery carry the page',
        productAssumption: 'that the product has imagery to show',
        confidence: 'low',
        compatible: false,
        benefit: 'none — the benefit depends entirely on having images',
        harm: 'the renderer substitutes decorative initials for absent photography, inflating the page and implying a catalogue the product is not',
        decision: 'reject',
        rationale: 'the product has no media field and never asks for photographs, so a media-led balance has nothing to lead with. The reference\'s media aspect is rejected while its palette and density still transfer.',
      });
    }
  }

  // ---- 4. repetition and column count -----------------------------------
  const repeating = inf.repetition && inf.repetition.value === 'repeating-blocks';
  const multiCol = inf.gridStructure && inf.gridStructure.value === 'multi-column';
  if (repeating) {
    add({
      id: 'repetition',
      observed: `${obs.repeatedBlockCount} repeated blocks`,
      principle: 'one repeated block per record',
      productAssumption: 'none — the product is also a list of records',
      confidence: 'medium',
      compatible: true,
      benefit: 'a predictable scan path',
      harm: 'none',
      decision: 'transfer',
      rationale: 'repetition is a structural principle both surfaces share: a list of records is a repeated block.',
    });
  }
  if (multiCol) {
    const wide = items.length >= 6;
    const keepOne = isChecklist && !isBrowsing;
    add({
      id: 'gridColumns',
      observed: 'multi-column grid',
      principle: 'more than one record per row on a wide viewport',
      productAssumption: 'that the task is comparison or browsing',
      confidence: 'low',
      compatible: !keepOne && wide,
      benefit: wide && !keepOne ? 'more records visible at once' : 'none for this task',
      harm: keepOne ? 'a checklist scanned top-to-bottom loses its place when items sit side by side' : 'none',
      decision: !keepOne && wide ? 'transfer' : 'adapt',
      rationale: keepOne
        ? 'the task is checking what is present, read in one column; the reference\'s multi-column rhythm is adapted to a single column and kept only for desktop width.'
        : (wide ? 'the record count and a browsing task both support a multi-column grid.' : 'too few records for a grid to help.'),
    });
  }

  // ---- 5. navigation prominence -----------------------------------------
  const navProminent = inf.navigationProminence && inf.navigationProminence.value === 'prominent-header';
  if (navProminent) {
    const multiDest = destinations >= 2;
    add({
      id: 'navigation',
      observed: 'a prominent header',
      principle: 'give navigation visual weight',
      productAssumption: 'that there is more than one destination',
      confidence: 'low',
      compatible: multiDest,
      benefit: multiDest ? 'clear movement between destinations' : 'none',
      harm: multiDest ? 'none' : 'a heavy header over a single-destination product spends attention on nothing',
      decision: multiDest ? 'transfer' : 'adapt',
      rationale: multiDest
        ? 'the product declares more than one destination, so navigation deserves weight.'
        : 'the product has one destination, so the header keeps the reference\'s type but not its prominence.',
    });
  }

  // ---- 6. commerce affordances ------------------------------------------
  if (mediaLed || repeating) {
    add({
      id: 'commerceAffordances',
      observed: 'product cards with price placement and a save affordance',
      principle: 'show price and a save control on each card',
      productAssumption: 'that the product sells things and users collect them',
      confidence: 'low',
      compatible: hasPrices || hasSave,
      benefit: hasPrices || hasSave ? 'purchase and collection affordances where they belong' : 'none',
      harm: !hasPrices && !hasSave ? 'a price slot with no price and a save control with nothing to save' : 'none',
      decision: (hasPrices || hasSave) ? 'transfer' : 'reject',
      rationale: (hasPrices || hasSave)
        ? `the product ${hasPrices ? 'has prices' : ''}${hasPrices && hasSave ? ' and ' : ''}${hasSave ? 'asks for saving' : ''}, so the affordance has content.`
        : 'the product has neither prices nor a save requirement, so these affordances would render empty.',
    });
  }

  const transferred = features.filter(f => f.decision === 'transfer');
  const rejected = features.filter(f => f.decision === 'reject');
  const adapted = features.filter(f => f.decision === 'adapt');

  return {
    transferVersion: '1.0.0',
    product: {
      declaresMedia, asksForImages, hasRealMedia, hasPrices, hasSave,
      destinations, isChecklist, isBrowsing, records: items.length,
    },
    features,
    // what the composition planner is allowed to use
    usable: {
      mediaLed: mediaLed && hasRealMedia,
      repeating,
      multiColumn: multiCol && !(isChecklist && !isBrowsing) && items.length >= 6,
      density: inf.density ? inf.density.value : 'moderate',
      navProminent: navProminent && destinations >= 2,
    },
    summary: {
      transferred: transferred.map(f => f.id),
      adapted: adapted.map(f => f.id),
      rejected: rejected.map(f => f.id),
      headline: rejected.length
        ? `transferred ${transferred.length}, adapted ${adapted.length}, rejected ${rejected.length} (${rejected.map(f => f.id).join(', ')})`
        : `transferred ${transferred.length}, adapted ${adapted.length}, rejected none`,
    },
  };
}
