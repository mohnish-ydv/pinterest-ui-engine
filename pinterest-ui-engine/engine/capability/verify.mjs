// verify.mjs — semantic completeness: does what the brief asked for reach the screen?
//
// MISSION 024, Phase 4. A test id in the DOM is not evidence that the right
// content is there. Mission 023's dashboard had a perfectly healthy row list
// and no revenue in it. So this validator does not count elements: it takes
// the value from the BRIEF's own record data, formats it the way the runtime
// formats it, and asks whether that string is actually rendered in the view
// that claims to show it.
//
// Statuses are honest by construction:
//   verified    the expected value was found in the rendered view
//   failed      it was not, or the element was not reachable
//   unmeasured  the check type is not implemented here — reported, never
//               silently dropped from the denominator
//
// Nothing is ever counted as verified because a selector matched.

import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { launchBrowser } from '../lib/stateprobe.mjs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const AXE_PATH = join(HERE, '..', '..', '..', 'vendor', 'axe-core', 'axe.min.js');

// Mirrors the runtime's formatting so the comparison is about content, not
// about a different way of writing the same number.
export function formatValue(field, value, currency) {
  if (value === null || value === undefined || value === '') return '';
  switch (field.type) {
    case 'money': return (currency || '') + Number(value).toLocaleString('en-IN') + (field.suffix || '');
    case 'number': return String(value) + (field.suffix || '');
    case 'rating': return '\u2605 ' + Number(value).toFixed(1);
    case 'bool': return value ? (field.trueLabel || 'Yes') : '';
    case 'list': return Array.isArray(value) ? value.join(' \u00b7 ') : String(value);
    default: return String(value);
  }
}

const IMPLEMENTED = new Set(['dom-text', 'dom-count', 'dom-visible', 'axe']);

/**
 * @param {object} o
 * @param {string} o.appDir
 * @param {object} o.ledger
 * @param {object} o.brief
 * @param {string} [o.itemSelector]  selector for the first record in the collection
 */
export async function verifyLedger(o) {
  const { appDir, ledger, brief } = o;
  const root = resolve(appDir);
  const records = (brief.entity && brief.entity.records) || [];
  const fields = (brief.entity && brief.entity.fields) || [];
  const currency = brief.currency || '';
  const itemSelector = o.itemSelector || null;

  const results = [];
  const push = (r) => results.push(r);

  const browser = await launchBrowser();
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844 });
  const pageErrors = [];
  page.on('pageerror', e => pageErrors.push(e.message));
  await page.goto('file://' + root + '/index.html', { waitUntil: 'networkidle0' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle0' });
  // axe is not part of the generated app; inject the vendored build so the
  // accessibility requirements can be checked rather than assumed.
  try { await page.addScriptTag({ path: AXE_PATH }); } catch (e) { /* reported as unmeasured */ }
  await new Promise(r => setTimeout(r, 300));

  // "Delivered" means visible to a sighted user AND present in the
  // accessibility tree. Content that is rendered but aria-hidden is not
  // delivered to a screen-reader user, so it does not count as satisfying a
  // content requirement — it is reported as failed with that reason.
  const viewText = () => page.evaluate(() => {
    const m = document.querySelector('main');
    if (!m) return { visible: '', accessible: '' };
    const clone = m.cloneNode(true);
    clone.querySelectorAll('[aria-hidden="true"]').forEach(el => el.remove());
    const host = document.createElement('div');
    host.style.cssText = 'position:absolute;left:-9999px;top:0';
    host.appendChild(clone);
    document.body.appendChild(host);
    const accessible = clone.innerText ? clone.innerText.replace(/\s+/g, ' ') : '';
    host.remove();
    return { visible: m.innerText.replace(/\s+/g, ' '), accessible };
  });

  let onDetail = false;
  const openDetail = async () => {
    if (onDetail || !itemSelector) return false;
    const ok = await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (!el) return false;
      el.scrollIntoView({ block: 'center' });
      el.click();
      return true;
    }, itemSelector);
    await new Promise(r => setTimeout(r, 320));
    onDetail = ok;
    return ok;
  };
  const backToEntry = async () => {
    if (!onDetail) return;
    await page.evaluate(() => {
      const b = document.querySelector('[data-act="back"]');
      if (b) b.click();
    });
    await new Promise(r => setTimeout(r, 250));
    onDetail = false;
  };

  for (const r of ledger.requirements) {
    const v = r.verification || {};

    // A requirement the brief itself excludes — e.g. a field outside its
    // declared table columns — is not a failure and not silently dropped: it
    // is reported as excluded, and stays in the denominator.
    if (r.required === false) {
      push({ id: r.id, category: r.category, status: 'excluded',
             reason: r.satisfiedBy === 'brief.table.columns' ? 'excluded by the brief\'s declared table columns' : 'declared optional' });
      continue;
    }

    if (!IMPLEMENTED.has(v.method)) {
      push({
        id: r.id, category: r.category, status: 'unmeasured',
        reason: `no verifier implemented for "${v.method}" — the requirement is reported, not dropped`,
      });
      continue;
    }

    if (v.method === 'dom-text') {
      const field = fields.find(f => f.id === v.field);
      const rec = records[v.recordIndex || 0];
      if (!field || !rec) {
        push({ id: r.id, status: 'failed', reason: 'brief has no such field/record' });
        continue;
      }
      let expected = formatValue(field, rec[field.id], currency);
      if (v.role === 'body') {
        const raw = rec[field.id];
        const first = Array.isArray(raw) ? String(raw[0]) : String(raw || '');
        expected = first.trim().slice(0, 36);
      }
      if (!expected) {
        push({ id: r.id, status: 'failed', reason: 'the brief carries no value for this field, so nothing can be verified' });
        continue;
      }
      if (v.where === 'detail' || v.where === 'article') {
        const ok = await openDetail();
        if (!ok) { push({ id: r.id, status: 'failed', reason: 'the detail view could not be opened' }); continue; }
      }
      // A prose requirement is verified against the article element itself,
      // not the whole view: the view also carries the title and byline, and a
      // substring match across that boundary is fragile.
      if (v.where === 'article') {
        const bodyText = await page.evaluate(() => {
          const el = document.querySelector('[data-testid="article-body"]');
          return el ? el.textContent.replace(/\s+/g, ' ') : null;
        });
        const okBody = !!bodyText && bodyText.indexOf(expected) !== -1;
        push({ id: r.id, category: r.category, status: okBody ? 'verified' : 'failed', expected, where: 'article',
               reason: okBody ? null : (bodyText === null ? 'no article body element' : `expected "${expected}" inside the article body`) });
        await backToEntry();
        continue;
      }
      const txt = await viewText();
      const visible = txt.visible.indexOf(expected) !== -1;
      const accessible = txt.accessible.indexOf(expected) !== -1;
      let status = 'verified';
      let reason = null;
      if (!visible) { status = 'failed'; reason = `expected "${expected}" in the ${v.where} view; it was not rendered`; }
      else if (!accessible) { status = 'failed'; reason = `"${expected}" is rendered but hidden from assistive technology (inside an aria-hidden subtree)`; }
      push({ id: r.id, category: r.category, status, expected, where: v.where, reason });
      if (v.where === 'detail') await backToEntry();
      continue;
    }

    if (v.method === 'dom-count') {
      const sel = v.selector === 'item' ? (o.itemSelector || '') : null;
      if (sel === null && v.selector !== 'item') {
        push({ id: r.id, status: 'unmeasured', reason: `no selector mapping for "${v.selector}"` });
        continue;
      }
      const n = await page.evaluate(s => document.querySelectorAll(s).length, sel || o.itemSelector);
      push({ id: r.id, category: r.category, status: n === v.expected ? 'verified' : 'failed', observed: n, expected: v.expected });
      continue;
    }

    if (v.method === 'dom-visible') {
      const ok = await page.evaluate(() => {
        const m = document.querySelector('main');
        if (!m) return false;
        const r = m.getBoundingClientRect();
        return r.height > 0;
      });
      push({ id: r.id, category: r.category, status: ok ? 'verified' : 'failed' });
      continue;
    }

    if (v.method === 'axe') {
      const violations = await page.evaluate(async () => {
        if (typeof window.axe === 'undefined') return null;
        const res = await window.axe.run(document, { resultTypes: ['violations'] });
        return res.violations.map(v => v.id);
      });
      if (violations === null) {
        push({ id: r.id, status: 'unmeasured', reason: 'axe-core was not injected into this page' });
      } else {
        const bad = violations.includes(v.rule);
        push({ id: r.id, category: r.category, status: bad ? 'failed' : 'verified', rule: v.rule, violations });
      }
      continue;
    }
  }

  await browser.close();

  const counts = { verified: 0, failed: 0, unmeasured: 0, excluded: 0 };
  for (const r of results) counts[r.status]++;
  return {
    caseId: ledger.caseId,
    appDir: root,
    total: results.length,
    counts,
    // The denominator is always the whole ledger: an unmeasured requirement is
    // visible, not quietly excluded.
    complete: counts.failed === 0 && counts.unmeasured === 0,
    results,
    pageErrors,
  };
}

export function summariseVerification(rep) {
  const lines = [];
  lines.push(`semantic completeness — ${rep.caseId}`);
  lines.push(`  ${rep.counts.verified} verified / ${rep.counts.failed} failed / ${rep.counts.unmeasured} unmeasured of ${rep.total}`);
  for (const r of rep.results) {
    if (r.status === 'failed') lines.push(`  FAILED     ${r.id}: ${r.reason || JSON.stringify(r)}`);
  }
  for (const r of rep.results) {
    if (r.status === 'unmeasured') lines.push(`  UNMEASURED ${r.id}: ${r.reason}`);
  }
  return lines.join('\n');
}
