// enforce.mjs — hold the layout IR and the rendered app to the compiled intent.
//
// MISSION 026, Phase 3. A hard constraint must either be satisfied or produce a
// clear failure. It must not silently degrade into the thing it forbade — which
// is exactly what happened to U2 Quarto: the spec said "no cards, no media" and
// the engine produced cards with initial chips, because nothing checked.
//
// Two stages, because the two failure modes are different:
//   validateIR       the plan cannot possibly satisfy the constraint
//   validateRendered the plan looked right and the renderer did something else

/** Pre-render: check the layout IR against the constraints. */
export function validateIR(constraints, ir, brief) {
  const violations = [];
  const entry = ir.views[0];
  const coll = entry.sections.find(s => s.component === 'entity-collection' || s.component === 'data-table');
  const push = (c, message) => violations.push({
    constraintId: c.id, kind: c.kind, hardness: c.hardness,
    statement: c.statement, source: c.source, message,
    stage: 'plan',
  });

  for (const c of constraints) {
    if (c.kind === 'composition') {
      if (!coll) { push(c, 'no collection surface was planned at all'); continue; }
      if (c.value === 'index') {
        if (coll.variant !== 'index') push(c, `planned variant is "${coll.variant || coll.component}", expected "index"`);
      } else if (c.value === 'gallery') {
        if (coll.variant !== 'card') push(c, `planned variant is "${coll.variant || coll.component}", expected a card grid`);
      } else if (c.value === 'table') {
        if (coll.component !== 'data-table') push(c, `planned surface is "${coll.component}", expected a table`);
      } else if (c.value === 'dashboard') {
        if (!entry.sections.some(s => s.component === 'metric-row')) push(c, 'no metric row was planned for a dashboard composition');
      } else if (c.value === 'row-list') {
        if (coll.component !== 'entity-collection' || coll.variant !== 'row') push(c, `planned surface is "${coll.component}/${coll.variant}", expected a row list`);
      }
    }

    if (c.kind === 'prohibited') {
      if (c.element === 'card') {
        const carded = ir.views.flatMap(v => v.sections).filter(s => s.variant === 'card');
        if (carded.length) push(c, `${carded.length} section(s) use the card variant`);
      }
      if (c.element === 'media') {
        const withMedia = ir.views.flatMap(v => v.sections).filter(s => s.props && s.props.showMedia);
        if (withMedia.length) push(c, `${withMedia.length} section(s) enable media`);
        if (brief.entity && brief.entity.media === true && withMedia.length === 0) {
          // not a violation of the constraint, but the media requirement is now unmet
        }
      }
    }
  }
  return violations;
}

/** Post-render: check the DOM. Needs a live page. */
export async function validateRendered(page, constraints) {
  const violations = [];
  const counts = await page.evaluate(() => ({
    card: document.querySelectorAll('.card').length,
    media: document.querySelectorAll('.card-media, .rec-media, main img').length,
    chip: document.querySelectorAll('.row-chip, .card-chip').length,
    idxRow: document.querySelectorAll('.idx-row').length,
    idxStandfirst: document.querySelectorAll('.idx-standfirst').length,
  }));
  const push = (c, message) => violations.push({
    constraintId: c.id, kind: c.kind, hardness: c.hardness,
    statement: c.statement, source: c.source, message, stage: 'render',
  });

  for (const c of constraints) {
    if (c.kind === 'prohibited') {
      if (c.element === 'card' && counts.card > 0) push(c, `${counts.card} element(s) with class "card" are rendered`);
      if (c.element === 'media' && counts.media > 0) push(c, `${counts.media} media element(s) are rendered`);
      if (c.element === 'initial-chip' && counts.chip > 0) push(c, `${counts.chip} decorative initial chip(s) are rendered`);
    }
    if (c.kind === 'composition' && c.value === 'index') {
      if (counts.idxRow === 0) push(c, 'no .idx-row elements were rendered for an index composition');
      if (counts.card > 0) push(c, `${counts.card} card element(s) appear in an index composition`);
      if (counts.chip > 0) push(c, `${counts.chip} initial chip(s) appear in an index composition`);
    }
  }
  return violations;
}

export function summarise(violations) {
  if (!violations.length) return 'constraints: all satisfied';
  const hard = violations.filter(v => v.hardness === 'hard').length;
  const lines = [`constraints: ${violations.length} violation(s), ${hard} hard`];
  for (const v of violations) lines.push(`  ${v.hardness.toUpperCase()} ${v.constraintId} [${v.stage}] ${v.message}`);
  return lines.join('\n');
}
