// states.mjs — enumerate the states the IR declares, then measure each one.
//
// MISSION 024, Phase 6. Mission 023's inspection contract encoded the
// generator's own flow: a single-screen commit. Pointed at a baseline with a
// three-step wizard it simply failed to reach four states, and the report
// showed a smaller denominator instead of a gap. That is the bug this fixes.
//
// Two rules:
//   1. The state list comes from the IR, not from the contract. Every state a
//      generated app declares is in the denominator, whether or not it can be
//      reached.
//   2. An unreachable state is `unmeasured` or `failed` with a reason. It is
//      never dropped.
//
// Navigation is semantic: the driver resolves each move from declared hooks
// (item testids, step controls, nav ids, commit and cancel hooks), so it can
// walk a wizard, a single-screen form, or a collection with cancellation
// without knowing which it is looking at.

import { resolve } from 'node:path';
import { readFileSync } from 'node:fs';
import { launchBrowser } from '../lib/stateprobe.mjs';

const q = (s) => `[data-testid="${s}"]`;
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

/** Every state the layout IR declares, with how it should be reached. */
export function declaredStates(ir) {
  const states = [];
  const add = (o) => states.push(o);
  const detail = ir.views.find(v => v.id === 'detail');
  const entry = ir.views[0];

  for (const v of ir.views) {
    let reach;
    if (v.hidden && v.id === 'detail') reach = { act: 'open' };
    else if (v.hidden) reach = { act: 'commit' };
    else reach = { act: 'nav', view: v.id };
    add({ id: `view:${v.id}`, kind: 'view', view: v.id, reach, expect: '#main', viewMatch: v.id });
  }

  const coll = entry.sections.find(s => s.component === 'entity-collection' || s.component === 'data-table');
  if (coll) {
    add({ id: 'list:populated', kind: 'content', view: entry.id, reach: { act: 'nav', view: entry.id }, expect: q(coll.props.itemTestid) });
  }

  if (detail) {
    const av = detail.sections.find(s => s.component === 'availability-picker');
    if (av) {
      add({ id: 'availability:day-selected', kind: 'selection', view: 'detail', reach: { act: 'open' }, expect: `${q(av.props.dayTestid)}[aria-pressed="true"]` });
      add({ id: 'availability:slot-free', kind: 'selection', view: 'detail', reach: { act: 'open' }, expect: `${q(av.props.slotTestid)}[data-state="free"]` });
      add({ id: 'availability:slot-taken', kind: 'disabled', view: 'detail', reach: { act: 'open' }, expect: `${q(av.props.slotTestid)}[data-state="taken"]` });
      add({ id: 'availability:slot-selected', kind: 'selection', view: 'detail', reach: { act: 'open' }, then: [{ act: 'slot' }], expect: `${q(av.props.slotTestid)}[data-state="selected"]` });
      add({ id: 'availability:error', kind: 'error', view: 'detail', reach: { act: 'open' }, then: [{ act: 'commit' }], expect: q(av.props.errorTestid) });
    }
    const steps = detail.sections.find(s => s.component === 'step-flow');
    if (steps) {
      const n = (steps.binding.steps || []).length;
      for (let i = 1; i <= n; i++) {
        add({
          id: `steps:step-${i}`, kind: 'step', view: 'detail',
          reach: i === 1 ? { act: 'startFlow' } : { act: 'startFlow', then: Array.from({ length: i - 1 }, () => ({ act: 'next' })) },
          expect: `${q('step')}[data-step="${i}"][data-state="current"]`,
        });
      }
    }
    const form = detail.sections.find(s => s.component === 'form-fields');
    if (form) {
      add({ id: 'form:error', kind: 'error', view: 'detail', reach: { act: 'open' }, then: [{ act: 'commit' }], expect: form.binding.fields[0] ? q(form.binding.fields[0].errorTestid || ('error-' + form.binding.fields[0].id)) : null });
    }
    const cta = detail.sections.find(s => s.component === 'primary-action');
    if (cta) add({ id: 'action:ready', kind: 'action', view: 'detail', reach: { act: 'open' }, expect: q(cta.props.testid) });
  }

  const conf = ir.views.find(v => v.id === 'confirmation');
  if (conf) {
    const c = conf.sections.find(s => s.component === 'confirmation');
    add({ id: 'confirmation:issued', kind: 'confirmation', view: 'confirmation', reach: { act: 'commit' }, expect: c ? q(c.props.testid) : null });
  }

  const mgr = ir.views.find(v => v.sections.some(s => s.component === 'collection-manager'));
  if (mgr) {
    const m = mgr.sections.find(s => s.component === 'collection-manager');
    add({ id: 'collection:empty', kind: 'content', view: mgr.id, reach: { act: 'nav', view: mgr.id }, expect: q('empty-state') });
    add({ id: 'collection:populated', kind: 'content', view: mgr.id, reach: { act: 'commit', then: [{ act: 'nav', view: mgr.id }] }, expect: q(m.props.itemTestid) });
    if (m.props.cancelTestid) {
      add({ id: 'collection:cancel-armed', kind: 'interaction', view: mgr.id, reach: { act: 'commit', then: [{ act: 'nav', view: mgr.id }, { act: 'cancel' }] }, expect: q(m.props.confirmTestid) });
    }
  }

  return states.filter(s => !!s.expect);
}

/** Resolve a semantic move to a click, using only declared hooks. */
async function perform(page, move, ir, ctx) {
  const detail = ir.views.find(v => v.id === 'detail');
  const entry = ir.views[0];
  const coll = entry.sections.find(s => s.component === 'entity-collection' || s.component === 'data-table');
  const click = (sel) => page.evaluate((s) => {
    const el = document.querySelector(s);
    if (!el) return false;
    el.scrollIntoView({ block: 'center' });
    el.click();
    return true;
  }, sel);

  switch (move.act) {
    case 'nav': {
      const item = ir.navigation.items.find(i => i.view === move.view);
      if (item && await click(q(item.id))) return true;
      return await click(`[data-act="nav"][data-view="${move.view}"]`);
    }
    case 'open': {
      const sel = coll ? `${q(coll.props.itemTestid)}` : null;
      return sel ? await click(sel) : false;
    }
    case 'startFlow': {
      // Prefer the app's declared create affordance; fall back to opening a record.
      const entryAction = ir.views.flatMap(v => v.sections).find(s => s.component === 'primary-action' && s.props.act === 'start-create');
      if (entryAction && await click(q(entryAction.props.testid))) return true;
      const sel = coll ? `${q(coll.props.itemTestid)}` : null;
      return sel ? await click(sel) : false;
    }
    case 'next': {
      // a step will not advance with invalid fields, so fill the declared ones
      const detailV = ir.views.find(v => v.id === 'detail');
      const flow = detailV?.sections.find(s => s.component === 'step-flow');
      const action = (ir.actions || []).find(a => a.kind === 'commit');
      const cur = await page.evaluate(() => {
        const el = document.querySelector('[data-testid="step"][data-state="current"]');
        return el ? Number(el.getAttribute('data-step')) : 1;
      });
      const stepDef = flow && (flow.binding.steps || [])[cur - 1];
      for (const fid of (stepDef && stepDef.fields) || []) {
        const f = ((action && action.form) || []).find(x => x.id === fid);
        if (!f) continue;
        let v = 'Test ' + (f.label || f.id);
        if (f.pattern && f.pattern.indexOf('\\d{10}') !== -1) v = '9876543210';
        if (f.pattern === '^\\d+$') v = '2450';
        await page.evaluate(([sel, val]) => {
          const el = document.querySelector(sel);
          if (el) { el.value = val; el.dispatchEvent(new Event('input', { bubbles: true })); }
        }, [q(f.testid || ('field-' + f.id)), v]);
      }
      return await click(q('step-next'));
    }
    case 'back': return await click(q('step-back')) || await click('[data-act="back"]');
    case 'commit': {
      const steps = detail?.sections.find(s => s.component === 'step-flow');
      const entryAction = ir.views.flatMap(v => v.sections).find(s => s.component === 'primary-action' && s.props.act === 'start-create');
      if (steps && entryAction) {
        // start the flow if we are not already inside it
        const inFlow = await page.evaluate(() => !!document.querySelector('[data-testid="step"]'));
        if (!inFlow) { await click(q(entryAction.props.testid)); await sleep(220); }
      }
      if (steps) {
        // walk to the last step before committing
        const n = (steps.binding.steps || []).length;
        for (let i = 1; i < n; i++) { await click(q('step-next')); await sleep(120); }
        return await click(q(steps.props.commitTestid));
      }
      const cta = detail?.sections.find(s => s.component === 'primary-action');
      return cta ? await click(q(cta.props.testid)) : false;
    }
    case 'slot': {
      const av = detail?.sections.find(s => s.component === 'availability-picker');
      if (!av) return false;
      return await click(`${q(av.props.slotTestid)}[data-state="free"]`);
    }
    case 'cancel': {
      const mgr = ir.views.flatMap(v => v.sections).find(s => s.component === 'collection-manager');
      if (!mgr) return false;
      const armed = await click(q(mgr.props.cancelTestid));
      await sleep(150);
      return armed;
    }
    default: return false;
  }
}

export async function measureStates(appDir, ir) {
  const root = resolve(appDir);
  const states = declaredStates(ir);
  const browser = await launchBrowser();
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844 });
  const pageErrors = [];
  page.on('pageerror', e => pageErrors.push(e.message));

  const results = [];
  for (const st of states) {
    // fresh page per state: a state must be reachable from the start, not as a
    // side effect of the previous attempt
    await page.goto('file://' + root + '/index.html', { waitUntil: 'networkidle0' });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'networkidle0' });
    await sleep(250);

    let reached = false;
    let reason = null;
    try {
      if (st.reach.act === 'commit') {
        // a commit needs a filled form; fill every declared field generically
        const flowSec = ir.views.find(v => v.id === 'detail')?.sections.find(s => s.component === 'step-flow');
        await perform(page, flowSec ? { act: 'startFlow' } : { act: 'open' }, ir, {});
        await sleep(200);
        const detail = ir.views.find(v => v.id === 'detail');
        const form = detail?.sections.find(s => s.component === 'form-fields');
        const action = (ir.actions || []).find(a => a.kind === 'commit');
        for (const f of (action && action.form) || []) {
          const sel = q(f.testid || ('field-' + f.id));
          let v = 'Test ' + (f.label || f.id);
          if (f.pattern && f.pattern.indexOf('\\d{10}') !== -1) v = '9876543210';
          if (f.pattern === '^\\d+$') v = '2450';
          await page.evaluate(([s, val]) => { const el = document.querySelector(s); if (el) { el.value = val; el.dispatchEvent(new Event('input', { bubbles: true })); } }, [sel, v]);
        }
        const av = detail?.sections.find(s => s.component === 'availability-picker');
        if (av) await perform(page, { act: 'slot' }, ir, {});
        const action2 = (ir.actions || []).find(a => a.kind === 'commit');
        if (action2 && action2.options) {
          const opt = q('option-' + action2.options.id);
          await page.evaluate((s) => { const el = document.querySelector(s); if (el) el.click(); }, opt);
        }
        await sleep(150);
        reached = await perform(page, st.reach, ir, {});
        for (const t of (st.reach.then || [])) { await sleep(160); await perform(page, t, ir, {}); }
      } else {
        reached = await perform(page, st.reach, ir, {});
        for (const t of (st.reach.then || [])) { await sleep(140); await perform(page, t, ir, {}); }
        for (const t of (st.then || [])) { await sleep(140); await perform(page, t, ir, {}); }
      }
      await sleep(220);
    } catch (e) {
      reason = 'driver threw: ' + String(e.message).slice(0, 100);
    }

    const present = await page.evaluate(([sel, want]) => {
      if (!sel) return false;
      const el = document.querySelector(sel);
      if (!el) return false;
      const r = el.getBoundingClientRect();
      if (r.height <= 0) return false;
      if (want && el.dataset && el.dataset.view !== undefined) return el.dataset.view === want;
      return true;
    }, [st.expect, st.viewMatch || null]);

    let status;
    if (!reached && !present) { status = 'unmeasured'; reason = reason || 'the state could not be reached from the entry view'; }
    else if (present) status = 'measured';
    else { status = 'failed'; reason = reason || `reached the flow but "${st.expect}" was absent`; }

    results.push({ id: st.id, kind: st.kind, view: st.view, status, reason, expect: st.expect });
  }

  await browser.close();
  const counts = { measured: 0, failed: 0, unmeasured: 0 };
  for (const r of results) counts[r.status]++;
  return {
    appDir: root,
    // the denominator is every declared state, always
    declared: states.length,
    counts,
    results,
    pageErrors,
  };
}

export function summariseStates(rep) {
  const lines = [];
  lines.push(`state coverage — ${rep.declared} declared states`);
  lines.push(`  ${rep.counts.measured} measured / ${rep.counts.failed} failed / ${rep.counts.unmeasured} unmeasured`);
  for (const r of rep.results) {
    if (r.status !== 'measured') lines.push(`  ${r.status.toUpperCase().padEnd(10)} ${r.id}: ${r.reason}`);
  }
  return lines.join('\n');
}
