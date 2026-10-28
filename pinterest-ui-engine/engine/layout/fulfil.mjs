// fulfil.mjs — did the plan actually fulfil each mandatory requirement?
//
// MISSION 031, Phase 2. For every mandatory requirement the pipeline must do
// exactly one of:
//   A  render it in the required scope           → satisfied
//   B  choose or introduce a compatible region   → satisfied, resolution B
//   C  report an explicit, actionable failure    → unsupported
//
// Silent omission is prohibited. Before this module, a field planned into
// `entryExtra` was counted as planned even when the renderer ignored it — a
// false pass of exactly the kind the mission forbids.
//
// Outcomes: satisfied | violated | unsupported | contradictory | unmeasured.
// Only `satisfied` is a pass. The others are counted and reported separately,
// so an aggregate score can never hide them.

import { canRenderRole, canHostExtra, isRepeated } from './capabilities.mjs';

/** Is this field actually wired into the section's plan, not merely hostable? */
function regionPlanned(section, fieldId) {
  if (!section) return false;
  const props = section.props || {};
  const binding = section.binding || {};
  if (Array.isArray(props.entryExtra) && props.entryExtra.includes(fieldId)) return true;
  if (Array.isArray(binding.columns) && binding.columns.some(c => c.field === fieldId)) return true;
  if (binding.standfirstField === fieldId) return true;
  if (binding.body === fieldId) return true;
  // The article section nests its fields: binding.article.{body,standfirst}.
  // Not knowing that shape made a bound standfirst report as unplaced.
  if (binding.article && (binding.article.body === fieldId || binding.article.standfirst === fieldId)) return true;
  return false;
}

/** Is this specific field bound into any section, by any binding
 *  mechanism? Role capability is not binding: a stat-strip that renders
 *  SOME stat does not place THIS stat. */
function fieldBoundAnywhere(ir, fieldId) {
  // M047: when a medallion home suppresses the chip rails, the facets
  // beyond the first are bound by the browse view's FILTER SHEET —
  // runtime chrome declared in ir.filters and reachable through the
  // filter button the medallion/chip section guarantees. A facet in
  // ir.filters with such a section present is bound, by the sheet.
  if ((ir.filters || []).some(f => f.field === fieldId)) {
    for (const v of ir.views) {
      const host = v.sections.find(s => s.component === 'filter-chips' || s.component === 'category-medallions');
      if (host) return { component: 'filter-sheet' };
    }
  }
  for (const v of ir.views) {
    for (const s of v.sections) {
      if (regionPlanned(s, fieldId)) return s;
      const b = s.binding || {};
      if (Array.isArray(b.fields) && b.fields.includes(fieldId)) return s;
      if (Object.values(b).some(x => x === fieldId)) return s;
      if (b.article && (b.article.body === fieldId || b.article.standfirst === fieldId)) return s;
    }
  }
  return null;
}

export const OUTCOMES = ['satisfied', 'violated', 'unsupported', 'contradictory', 'unmeasured'];

function sectionsOf(ir, viewId) {
  const v = ir.views.find(x => x.id === viewId);
  return v ? v.sections : [];
}

/**
 * @param {object} o
 * @param {object} o.brief    engine brief
 * @param {object} o.ir       layout IR
 * @param {object} o.scoped   scoped requirement set
 */
export function resolveFulfilment({ brief, ir, scoped }) {
  const entryView = ir.views[0].id;
  const detailView = (ir.views.find(v => v.id === 'detail') || {}).id || null;
  const outcomes = [];

  const push = (o) => outcomes.push(Object.assign({ outcome: 'unmeasured', resolution: null, detail: '' }, o));

  // ---- contradictions short-circuit everything else --------------------
  const contradicted = new Set();
  for (const c of (scoped.contradictions || [])) {
    contradicted.add(c.subject);
    push({
      id: c.id, kind: 'contradictory', subject: c.subject,
      scope: { view: 'entry', cardinality: 'every-item' },
      outcome: 'contradictory', resolution: null,
      statement: c.statement,
      sources: c.sources,
      detail: 'the brief demands both presence and absence in the same region; neither can be satisfied',
    });
  }

  for (const req of scoped.requirements) {
    if (contradicted.has(req.subject)) continue;

    // ---- field requirements -------------------------------------------
    if (req.kind === 'field') {
      const field = (brief.entity.fields || []).find(f => f.id === req.subject);
      if (!field) { push({ id: req.id, subject: req.subject, kind: 'field', scope: req.scope, outcome: 'unsupported', detail: 'no such field' }); continue; }

      if (req.scope.excluded) {
        // "the list shows only X" — the field must NOT be drawn in the entry
        const repeated = sectionsOf(ir, entryView).filter(s => isRepeated(s.component));
        if (!repeated.length) { push({ id: req.id, subject: req.subject, kind: 'field', scope: req.scope, outcome: 'unmeasured', detail: 'no repeated surface to exclude from' }); continue; }
        // MISSION 032: an exclusion is enforced per SECTION. A surface that
        // bans the role does not render it, so the exclusion is satisfied —
        // reading capability alone would report a violation that no longer
        // exists in the plan.
        const leaks = repeated.filter(s => {
          const bans = (s.props && s.props.forbiddenRoles) || [];
          if (bans.includes(field.role)) return false;
          return canRenderRole(s.component, s.variant, field.role);
        });
        push({
          id: req.id, subject: req.subject, kind: 'field', scope: req.scope,
          outcome: leaks.length ? 'violated' : 'satisfied',
          resolution: leaks.length ? null : 'A',
          detail: leaks.length
            ? `${leaks.map(s => s.component + '/' + (s.variant || '')).join(', ')} would render "${field.role}" in the entry`
            : 'the repeated surface does not render this role, or the section bans it',
        });
        continue;
      }

      if (req.scope.view === 'entry') {
        const repeated = sectionsOf(ir, entryView).filter(s => isRepeated(s.component));
        if (!repeated.length) {
          push({ id: req.id, subject: req.subject, kind: 'field', scope: req.scope,
            outcome: 'unsupported', detail: 'the entry view has no repeated surface at all' });
          continue;
        }
        let resolved = null;
        for (const s of repeated) {
          if (canRenderRole(s.component, s.variant, field.role)) { resolved = { s, how: 'A', why: `${s.component}/${s.variant || ''} renders "${field.role}" natively` }; break; }
        }
        if (!resolved) {
          for (const s of repeated) {
            // A role banned on this section is not drawn by the extra region
            // either — capability plus a wired region is still not fulfilment
            // if the section suppresses the role.
            const bans = (s.props && s.props.forbiddenRoles) || [];
            if (bans.includes(field.role)) continue;
            // Capability alone is not fulfilment: the region must be in the plan.
            if (canHostExtra(s.component, s.variant) && regionPlanned(s, req.subject)) {
              const mech = s.component === 'data-table' ? 'a derived column' : 'an extra region';
              resolved = { s, how: 'B', why: `${s.component}/${s.variant || ''} hosts it as ${mech}, and the plan wires it` };
              break;
            }
          }
        }
        if (resolved) {
          push({ id: req.id, subject: req.subject, kind: 'field', scope: req.scope,
            outcome: 'satisfied', resolution: resolved.how, detail: resolved.why });
        } else {
          push({ id: req.id, subject: req.subject, kind: 'field', scope: req.scope,
            outcome: 'unsupported',
            detail: `no repeated surface renders "${field.role}" or has it wired: ${repeated.map(s => s.component + '/' + (s.variant || '')).join(', ')}`,
            action: 'choose a composition whose surface supports this role, or remove the requirement' });
        }
        continue;
      }

      if (req.scope.view === 'detail') {
        const secs = detailView ? sectionsOf(ir, detailView) : [];
        if (!secs.length) { push({ id: req.id, subject: req.subject, kind: 'field', scope: req.scope, outcome: 'unsupported', detail: 'there is no detail view' }); continue; }
        const native = secs.find(s => canRenderRole(s.component, s.variant, field.role));
        if (native) { push({ id: req.id, subject: req.subject, kind: 'field', scope: req.scope, outcome: 'satisfied', resolution: 'A', detail: `${native.component} renders "${field.role}"` }); continue; }
        const host = secs.find(s => canHostExtra(s.component, s.variant) && regionPlanned(s, req.subject));
        if (host) { push({ id: req.id, subject: req.subject, kind: 'field', scope: req.scope, outcome: 'satisfied', resolution: 'B', detail: `${host.component} hosts it as an extra, and the plan wires it` }); continue; }
        push({ id: req.id, subject: req.subject, kind: 'field', scope: req.scope, outcome: 'unsupported',
          detail: `the detail view has no surface for "${field.role}"` });
        continue;
      }

      // either / page: the field itself must be bound into some section.
      // The previous rule passed when any section could render the field's
      // ROLE, so a requirement was 'satisfied' by a surface bound to other
      // fields while the surface the brief asked for never showed it — and
      // the headline count then disagreed with the engine's own rendered-DOM
      // verifiers, which check for the field, not the role.
      const boundIn = fieldBoundAnywhere(ir, req.subject);
      push({ id: req.id, subject: req.subject, kind: 'field', scope: req.scope,
        outcome: boundIn ? 'satisfied' : 'unsupported', resolution: boundIn ? 'A' : null,
        detail: boundIn ? `${boundIn.component} binds this field`
          : 'no section binds this field; a surface that could render its role does not place it',
        ...(boundIn ? {} : { action: 'bind the field into a section, or remove the requirement' }) });
      continue;
    }

    // ---- behaviour -----------------------------------------------------
    if (req.kind === 'behaviour') {
      const actions = brief.actions || [];
      const commit = actions.find(a => a.kind === 'commit');
      if (!commit) {
        push({ id: req.id, subject: req.subject, kind: 'behaviour', scope: req.scope, outcome: 'unsupported',
          detail: 'the brief requires a confirmation but no commit action was derived',
          action: 'derive a commit action, or remove the behavioural requirement' });
        continue;
      }
      const hasResult = !!(commit.result && commit.result.referenceTestid);
      const hasUi = !!(commit.testid || (commit.steps || []).length);
      const hasValidation = (commit.form || []).some(f => f.required || f.pattern || f.minLength);
      const legs = { hasUi, hasValidation, hasResult };
      const complete = hasUi && hasValidation && hasResult;
      push({ id: req.id, subject: req.subject, kind: 'behaviour', scope: req.scope,
        outcome: complete ? 'satisfied' : 'violated',
        resolution: complete ? 'A' : null,
        detail: complete ? 'a commit action carries UI, validation and feedback'
          : `incomplete action: ${Object.entries(legs).filter(([, v]) => !v).map(([k]) => k).join(', ')} missing` });
      continue;
    }

    // ---- prohibited ----------------------------------------------------
    if (req.kind === 'prohibited') {
      const el = req.element || '';
      const banned = /card|grid/i.test(el)
        ? ir.views.flatMap(v => v.sections).filter(s => s.variant === 'card')
        : [];
      push({ id: req.id, subject: el, kind: 'prohibited', scope: req.scope,
        outcome: banned.length ? 'violated' : 'satisfied', resolution: banned.length ? null : 'A',
        detail: banned.length ? `${banned.length} card section(s) planned` : 'no section emits the prohibited element' });
      continue;
    }

    push({ id: req.id, subject: req.subject || req.kind, kind: req.kind, scope: req.scope,
      outcome: 'unmeasured', detail: `no fulfilment rule for "${req.kind}"` });
  }

  const counts = {};
  for (const o of outcomes) counts[o.outcome] = (counts[o.outcome] || 0) + 1;
  const mandatory = outcomes.filter(o => {
    const req = scoped.requirements.find(r => r.id === o.id);
    return !req || req.mandatory !== false;
  });
  return {
    fulfilVersion: '1.0.0',
    outcomes,
    counts,
    total: outcomes.length,
    // only 'satisfied' is a pass; everything else is reported separately
    passes: counts.satisfied || 0,
    blocking: outcomes.filter(o => o.outcome === 'unsupported' || o.outcome === 'contradictory'),
    resolutionCounts: outcomes.reduce((a, o) => { if (o.resolution) a[o.resolution] = (a[o.resolution] || 0) + 1; return a; }, {}),
  };
}

export function summariseFulfilment(rep) {
  const c = rep.counts;
  const lines = [`fulfilment — ${rep.passes}/${rep.total} satisfied  ` +
    OUTCOMES.filter(o => c[o]).map(o => `${c[o]} ${o}`).join(', ') +
    `  (resolutions ${JSON.stringify(rep.resolutionCounts)})`];
  for (const o of rep.outcomes) {
    if (o.outcome === 'satisfied') continue;
    lines.push(`  ${o.outcome.toUpperCase().padEnd(14)} ${o.subject || o.kind} [${o.scope.view}] ${o.detail}`);
  }
  return lines.join('\n');
}
