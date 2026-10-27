// trace.mjs — field-level traceability.
//
// MISSION 028, Phase 4. For every field a product brief requires, report the
// complete chain or an explicit failure:
//
//   brief requirement -> semantic model -> planned region -> rendered content -> verification
//
// and for every action:
//
//   user action -> validation/preconditions -> state transition -> visible feedback
//
// A build that silently discards a required field is the failure mode this
// exists to make impossible to miss.

import { readFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { launchBrowser } from '../lib/stateprobe.mjs';

// Which collection variants and sections can render a given role.
const ROLE_HOMES = {
  title: ['entity-collection', 'data-table', 'record-header'],
  subtitle: ['entity-collection', 'data-table', 'record-header'],
  price: ['entity-collection', 'data-table', 'record-header', 'stat-strip', 'detail-list'],
  stat: ['entity-collection', 'data-table', 'stat-strip', 'detail-list'],
  meta: ['entity-collection', 'data-table', 'detail-list'],
  badge: ['entity-collection', 'record-header', 'detail-list'],
  status: ['entity-collection', 'record-header', 'detail-list'],
  facet: ['filter-chips'],
  detail: ['detail-list', 'entity-collection', 'article'],
  body: ['article', 'detail-list'],
  media: ['entity-collection'],
};

function sectionCanRender(section, role) {
  const homes = ROLE_HOMES[role] || [];
  if (!homes.includes(section.component)) return false;
  // the index variant renders a fixed role set
  if (section.component === 'entity-collection' && section.variant === 'index') {
    return ['title', 'subtitle', 'meta', 'standfirst'].includes(role);
  }
  return true;
}

/** Which planned sections could carry this role, and does the view reach them? */
function plannedHomes(ir, role) {
  const out = [];
  for (const v of ir.views) {
    for (const s of v.sections) {
      if (sectionCanRender(s, role)) out.push(`${v.id}:${s.id}${s.variant ? '/' + s.variant : ''}`);
    }
  }
  return out;
}

/**
 * @param {object} o
 * @param {string} o.brief      the engine brief (derived or authored)
 * @param {object} o.ir         layout.json
 * @param {string} o.appDir     rendered app
 * @param {object} [o.model]    semantic model, when one exists
 */
export async function traceCase(o) {
  const { brief, ir, appDir } = o;
  const fields = (brief.entity && brief.entity.fields) || [];
  const records = (brief.entity && brief.entity.records) || [];
  const rows = [];

  const browser = await launchBrowser();
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844 });
  await page.goto('file://' + resolve(appDir) + '/index.html', { waitUntil: 'networkidle0' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 350));

  const listText = await page.evaluate(() => { const m = document.querySelector('main'); return m ? m.innerText.replace(/\s+/g, ' ') : ''; });
  const firstItem = await page.evaluate(() => {
    const el = document.querySelector('[data-testid$="-card"], [data-testid$="-row"]');
    return el ? el.innerText.replace(/\s+/g, ' ') : '';
  });

  // A field may legitimately live only on the detail view. Check it there too,
  // otherwise the audit reports loss that did not happen.
  const opened = await page.evaluate(() => {
    const el = document.querySelector('[data-testid$="-card"], [data-testid$="-row"]');
    if (!el) return false;
    el.click();
    return true;
  });
  await new Promise(r => setTimeout(r, 420));
  const detailText = opened
    ? await page.evaluate(() => { const m = document.querySelector('main'); return m ? m.innerText.replace(/\s+/g, ' ') : ''; })
    : '';

  for (const f of fields) {
    const homes = plannedHomes(ir, f.role);
    const sample = records[0] ? records[0][f.id] : undefined;
    const sampleStr = Array.isArray(sample) ? String(sample[0]) : (sample == null ? '' : String(sample));
    // A short probe is not evidence. "13" appears in almost any page, so a
    // 2-character match would have reported the missing reading time as
    // preserved. Numbers are matched with their declared suffix where one
    // exists, and anything short must match on a word boundary.
    const has = (text, needle) => {
      if (!needle) return null;
      if (needle.length >= 6) return text.indexOf(needle) !== -1;
      const esc = needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return new RegExp('(^|[^0-9A-Za-z])' + esc + '([^0-9A-Za-z]|$)').test(text);
    };
    const probe = (f.suffix && sample != null && !Array.isArray(sample))
      ? String(sample) + f.suffix
      : sampleStr.slice(0, 24);
    const inList = probe ? has(listText, probe) : null;
    const inItem = probe ? has(firstItem, probe) : null;
    const inDetail = probe && opened ? has(detailText, probe) : null;

    let verdict, where = null;
    if (!homes.length) verdict = 'no-slot';
    else if (inList === null) verdict = 'unchecked';
    else if (inList) { verdict = 'preserved'; where = 'list'; }
    else if (inDetail) { verdict = 'preserved'; where = 'detail'; }
    else verdict = 'planned-but-absent';

    rows.push({
      field: f.id, label: f.label || f.id, type: f.type, role: f.role,
      roleSource: f.roleSource || 'declared',
      plannedHomes: homes,
      renderedInList: inList, renderedInFirstItem: inItem, renderedInDetail: inDetail,
      probe, verdict, where,
    });
  }

  await browser.close();

  // ---- actions ---------------------------------------------------------
  const actions = [];
  for (const a of (brief.actions || [])) {
    if (a.kind === 'toggle') {
      actions.push({ id: a.id, kind: a.kind, ui: true, validation: 'n/a', transition: 'saved set toggles',
        feedback: 'aria-pressed flips', complete: true });
      continue;
    }
    const form = a.form || [];
    const steps = a.steps || [];
    const result = a.result || null;
    const hasUi = !!(a.testid || steps.length);
    const hasValidation = form.some(f => f.required || f.pattern || f.minLength);
    const hasTransition = !!(result && result.collection) || steps.length > 0;
    const hasFeedback = !!(result && (result.referenceTestid || result.summaryTestid));
    actions.push({
      id: a.id, kind: a.kind,
      ui: hasUi, validation: hasValidation, transition: hasTransition, feedback: hasFeedback,
      entryPoint: !!(brief.entryAction || form.length),
      steps: steps.length,
      complete: hasUi && hasValidation && hasTransition && hasFeedback,
    });
  }

  const counts = {
    fields: rows.length,
    preserved: rows.filter(r => r.verdict === 'preserved').length,
    absent: rows.filter(r => r.verdict === 'planned-but-absent').length,
    noSlot: rows.filter(r => r.verdict === 'no-slot').length,
    unchecked: rows.filter(r => r.verdict === 'unchecked').length,
    actions: actions.length,
    incompleteActions: actions.filter(a => !a.complete).length,
  };
  return { fields: rows, actions, counts };
}

export function summariseTrace(rep) {
  const c = rep.counts;
  const lines = [`trace: ${c.preserved} preserved / ${c.absent} planned-but-absent / ${c.noSlot} no-slot / ${c.unchecked} unchecked of ${c.fields} fields; ${c.incompleteActions} incomplete of ${c.actions} actions`];
  for (const r of rep.fields) {
    if (r.verdict !== 'preserved') lines.push(`  ${r.verdict.toUpperCase().padEnd(20)} ${r.field} (${r.role}) -> homes: ${r.plannedHomes.join(', ') || 'NONE'}`);
  }
  for (const a of rep.actions) if (!a.complete) lines.push(`  INCOMPLETE ACTION    ${a.id}: ui=${a.ui} validation=${a.validation} transition=${a.transition} feedback=${a.feedback}`);
  return lines.join('\n');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const dir = process.argv[2];
  if (!dir) { console.error('usage: node trace.mjs <caseDir>'); process.exit(2); }
  const brief = JSON.parse(readFileSync(join(dir, 'brief.json'), 'utf8'));
  const ir = JSON.parse(readFileSync(join(dir, 'layout.json'), 'utf8'));
  const rep = await traceCase({ brief, ir, appDir: join(dir, 'app') });
  console.log(summariseTrace(rep));
}
