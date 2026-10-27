// preflight.mjs — decide whether the engine can honour a brief, BEFORE building.
//
// MISSION 024, Phase 3. The engine's worst failure in Mission 023 was not a
// missing component: it was producing a tidy, plausible, *incomplete*
// interface and saying nothing. A channel directory shipped where a dashboard
// was asked for, and every gate stayed green.
//
// This module is the answer. It takes the ledger and the capability registry,
// classifies every requirement, and returns one of three decisions:
//
//   proceed                  everything required is supported
//   proceed-with-limitations something is supported but weaker than asked
//   stop                     something required cannot be expressed at all
//
// It never substitutes an unrelated layout for a required capability. When a
// requirement cannot be met and no meaning-preserving fallback exists, the
// decision is `stop` and the caller must not silently generate.

import { readFileSync, existsSync } from 'node:fs';
import { resolveCapability, renderedRoles, CAPABILITIES, UNSUPPORTED } from './registry.mjs';
import { buildLedger, summarise, plannedVariant } from './ledger.mjs';

export const PREFLIGHT_VERSION = '1.0.0';

// Which capability backs which ledger requirement. Kept explicit so a new
// requirement cannot be added without deciding what is supposed to satisfy it.
//
// Requirement ids look like "<CASE>-<CATEGORY>-<rest>", and the case id itself
// contains hyphens ("B-HARVEST"), so the category segment is parsed rather than
// matched with an anchored pattern.
const BY_CATEGORY = {
  C: [
    [/-article-body$/, 'article'],
    [/-list$/, 'collection.list'],
    [/-detail$/, 'record.detail'],
  ],
  L: [
    [/^-L-collection$/, 'collection.list'],
    [/^-L-detail$/, 'record.detail'],
    [/^-L-aggregates$/, 'aggregates'],
    [/^-L-ranges$/, 'ranges'],
    [/^-L-table$/, 'table'],
    [/^-L-article(-standfirst)?$/, 'article'],
    [/^-L-steps$/, 'steps'],
    [/^-L-nav$/, 'navigation'],
  ],
  I: [
    [/^-I-search$/, 'control.search'],
    [/^-I-facet-/, 'control.facet'],
    [/^-I-choice$/, 'control.choice'],
    [/^-I-availability$/, 'control.availability'],
    [/^-I-validate$/, 'form.fields'],
    [/^-I-commit$/, 'action.commit'],
    [/^-I-steps-progress$/, 'steps'],
    [/^-I-cancel-/, 'collection.manage'],
    [/^-I-save$/, 'toggle.save'],
  ],
  N: [[/^-N-view-/, 'navigation']],
  R: [[/^-R-/, 'responsive']],
  A: [[/^-A-/, 'accessibility']],
};

// Capabilities that are structural and always available (CSS, token gate,
// navigation shell) rather than component-backed.
const ALWAYS_SUPPORTED = new Set(['navigation', 'responsive', 'accessibility']);

function capabilityFor(requirementId) {
  const m = /-([CLINRA])-(.+)$/.exec(requirementId);
  if (!m) return null;
  const tail = `-${m[1]}-${m[2]}`;
  for (const [re, cap] of (BY_CATEGORY[m[1]] || [])) {
    if (re.test(tail)) return cap;
  }
  return null;
}

/** Read the component names the runtime actually implements. */
export function implementedComponents(runtimePath) {
  if (!existsSync(runtimePath)) return [];
  const src = readFileSync(runtimePath, 'utf8');
  const names = new Set();
  const re = /R\['([a-z-]+)'\]\s*=/g;
  let m;
  while ((m = re.exec(src))) names.add(m[1]);
  return [...names];
}

/**
 * @param {string} caseId
 * @param {object} brief
 * @param {object} opts { runtimePath, variant? }
 */
export function preflight(caseId, brief, opts = {}) {
  const runtimePath = opts.runtimePath;
  const impl = opts.implementedComponents || implementedComponents(runtimePath);
  const ledger = opts.ledger || buildLedger(caseId, brief);
  const variant = opts.variant || plannedVariant(brief);
  const listRoles = renderedRoles(variant);

  const supported = [];
  const disclosed = [];
  const unsupported = [];

  for (const r of ledger.requirements) {
    const capId = capabilityFor(r.id);
    r.capability = capId;

    if (!capId) {
      r.status = 'unclassified';
      unsupported.push({ ...r, limitation: 'no capability is mapped to this requirement' });
      continue;
    }
    if (ALWAYS_SUPPORTED.has(capId)) {
      r.status = 'supported';
      supported.push(r);
      continue;
    }

    const cap = resolveCapability(capId, impl);

    // A content requirement in a list additionally depends on whether the
    // chosen collection variant draws that role at all. This is the check that
    // would have caught Mission 023's F3 before a line was generated.
    if (r.verification.method === 'dom-text' && r.verification.where === 'list') {
      const role = r.verification.role;
      if (!listRoles.includes(role)) {
        r.status = 'unsupported';
        r.limitation = `the "${variant}" collection variant renders only ${listRoles.join(', ')} — a "${role}" field cannot appear in the list`;
        unsupported.push(r);
        continue;
      }
    }

    if (!cap.supported) {
      r.status = 'unsupported';
      r.limitation = cap.limitation || `capability "${capId}" is not implemented`;
      // Sharper diagnosis where the brief itself makes the capability
      // impossible, not just unimplemented: a range control with no date field
      // to filter on could not be honoured even if the component existed.
      if (capId === 'ranges') {
        const hasDate = (brief.entity?.fields || []).some(f => f.type === 'date');
        if (!hasDate) {
          r.limitation = 'A time-range control is declared but the entity has no date field to filter on, '
            + 'so no honest range filter can be built from this brief — implementing the control alone would produce an inert filter.';
        }
      }
      unsupported.push(r);
      continue;
    }

    r.status = 'supported';
    r.component = cap.component || null;
    supported.push(r);
  }

  const requiredUnsupported = unsupported.filter(r => r.required);
  const decision = requiredUnsupported.length ? 'stop'
    : disclosed.length ? 'proceed-with-limitations'
    : 'proceed';

  const risks = [];
  if (requiredUnsupported.length) {
    risks.push(`${requiredUnsupported.length} required requirement(s) cannot be expressed by the current engine.`);
    risks.push('Generating anyway would produce a plausible but incomplete interface — the exact failure Mission 023 recorded.');
  }
  if (brief.domain === 'analytics' && !brief.aggregates) {
    risks.push('The brief declares an analytics domain but no aggregates; if a KPI row is expected it is not declared and cannot be inferred.');
  }
  if (brief.entity && brief.entity.media && !(brief.entity.records || []).every(r => r.image)) {
    risks.push('The entity is declared media-led but no record carries an image; media is substituted with a brand-derived gradient.');
  }

  const capabilities = {
    implementedComponents: impl,
    declared: CAPABILITIES.map(c => c.id),
    gaps: UNSUPPORTED.map(u => ({ id: u.id, label: u.label, limitation: u.limitation, resolvedBy: u.resolvedBy, open: !impl.includes(u.resolvedBy) })),
  };

  return {
    preflightVersion: PREFLIGHT_VERSION,
    caseId,
    app: brief.brand,
    variant,
    listRolesRendered: listRoles,
    decision,
    summary: summarise(ledger),
    counts: { supported: supported.length, disclosed: disclosed.length, unsupported: unsupported.length },
    supported: supported.map(r => r.id),
    unsupported: unsupported.map(r => ({
      id: r.id, category: r.category, required: r.required,
      expectation: r.expectation, limitation: r.limitation || null,
      fallback: null, // no meaning-preserving fallback is offered for these
    })),
    risks,
    capabilities,
    ledger,
  };
}

/** Human-readable report, for stderr and for capability-report.json. */
export function formatReport(report) {
  const lines = [];
  lines.push(`capability preflight — ${report.caseId} (${report.app})`);
  lines.push(`  decision: ${report.decision.toUpperCase()}`);
  lines.push(`  requirements: ${report.summary.total} total — ${report.counts.supported} supported, ${report.counts.disclosed} disclosed, ${report.counts.unsupported} unsupported`);
  if (report.unsupported.length) {
    lines.push('  cannot express:');
    for (const u of report.unsupported) {
      lines.push(`    - ${u.id}${u.required ? ' (required)' : ''}: ${u.expectation}`);
      if (u.limitation) lines.push(`        why: ${u.limitation}`);
    }
  }
  if (report.risks.length) {
    lines.push('  risks:');
    for (const r of report.risks) lines.push(`    - ${r}`);
  }
  return lines.join('\n');
}
