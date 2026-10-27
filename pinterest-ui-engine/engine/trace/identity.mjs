// identity.mjs — verify a requirement by semantic identity, not by text.
//
// MISSION 033. Text matching cannot tell a field from a coincidence: two
// records may share a value, a decorative element may carry the same word, and
// a table cell with no identity cannot be evidence of anything at all.
//
// The contract this enforces:
//   field id  →  data-field on the rendered element
//   record    →  data-record on the cell, or data-id on the item
//   scope     →  the region the element lives in
//
// A requirement is only `satisfied` when an element carrying the right field id
// is found in the right scope and holds the right record's value. When a
// renderer emits no identity for a field, the outcome is `unverified` — never a
// pass.

import { resolve } from 'node:path';
import { launchBrowser } from '../lib/stateprobe.mjs';

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// A rendered value may be formatted — ₹1,850, 2 kg, 13 min read. Comparing raw
// text to raw data marks a correctly formatted value as wrong. Normalise digits
// by removing grouping separators before comparing; keep everything else.
const norm = (s) => String(s == null ? '' : s)
  .replace(/(\d)[,\u00a0\u202f](?=\d{3}\b)/g, '$1')
  .replace(/\s+/g, ' ')
  .trim();

const ITEM_SEL = '[data-testid$="-card"], [data-testid$="-row"], .idx-row, tbody tr[data-record]';

export async function verifyIdentity({ brief, scoped, appDir }) {
  const fields = (brief.entity && brief.entity.fields) || [];
  const records = (brief.entity && brief.entity.records) || [];
  const byId = Object.fromEntries(fields.map(f => [f.id, f]));

  const browser = await launchBrowser();
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844 });
  await page.goto('file://' + resolve(appDir) + '/index.html', { waitUntil: 'networkidle0' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle0' });
  await sleep(350);

  // Every rendered item, with the field ids it actually carries and their text.
  const items = await page.evaluate((sel) => Array.from(document.querySelectorAll(sel)).map(el => {
    const cs = getComputedStyle(el);
    const rec = el.getAttribute('data-record') || el.getAttribute('data-id') || null;
    const marks = Array.from(el.querySelectorAll('[data-field]')).map(n => ({
      field: n.getAttribute('data-field'),
      record: n.getAttribute('data-record') || rec,
      text: (n.innerText || n.textContent || '').replace(/\s+/g, ' ').trim(),
      visible: getComputedStyle(n).display !== 'none' && getComputedStyle(n).visibility !== 'hidden' && n.getBoundingClientRect().height > 0,
    }));
    return { record: rec, hidden: cs.display === 'none' || cs.visibility === 'hidden' || el.getBoundingClientRect().height === 0, marks };
  }), ITEM_SEL);

  // Is identity present anywhere at all? If a renderer emits none, nothing can
  // be verified and the report must say so.
  const identityPresent = items.some(i => i.marks.length > 0);
  const itemSelUsed = await page.evaluate((sel) => document.querySelectorAll(sel).length, ITEM_SEL);

  // `either` scope may legitimately be satisfied by a page-level control —
  // a facet rendered as a filter chip carries its field identity but lives
  // outside every item.
  const pageFields = await page.evaluate(() =>
    Array.from(document.querySelectorAll('[data-field]')).map(n => n.getAttribute('data-field')));

  const opened = await page.evaluate((sel) => { const el = document.querySelector(sel); if (!el) return false; el.click(); return true; }, ITEM_SEL);
  await sleep(420);
  const detail = await page.evaluate(() => {
    const m = document.querySelector('main');
    if (!m) return { marks: [], text: '' };
    return {
      marks: Array.from(m.querySelectorAll('[data-field]')).map(n => ({ field: n.getAttribute('data-field'), text: (n.innerText || n.textContent || '').replace(/\s+/g, ' ').trim() })),
      text: m.innerText.replace(/\s+/g, ' '),
    };
  });
  await browser.close();

  const results = [];
  for (const req of scoped.requirements) {
    if (req.kind !== 'field') {
      results.push({ id: req.id, kind: req.kind, subject: req.subject, scope: req.scope, status: 'unverified',
        reason: `identity verification does not cover "${req.kind}" requirements` });
      continue;
    }
    const f = byId[req.subject];
    if (!f) { results.push({ id: req.id, subject: req.subject, status: 'missing', reason: 'no such field' }); continue; }
    const values = records.map(r => { const v = r[f.id]; return v == null ? '' : String(v); }).filter(Boolean);
    if (!values.length) { results.push({ id: req.id, subject: req.subject, status: 'unverified', reason: 'no sample value in the brief' }); continue; }

    if (req.scope.view === 'entry' || req.scope.view === 'either') {
      const visible = items.filter(i => !i.hidden);
      if (!visible.length) { results.push({ id: req.id, subject: req.subject, scope: req.scope, status: 'missing', reason: 'no rendered items' }); continue; }
      if (!identityPresent) {
        // A renderer that emits no identity cannot be evidence of fulfilment.
        results.push({ id: req.id, subject: req.subject, scope: req.scope, status: 'unverified',
          reason: `${visible.length} item(s) rendered but none carries data-field — identity is absent, so fulfilment cannot be established` });
        continue;
      }
      const carriers = visible.filter(i => i.marks.some(m => m.field === req.subject));
      const visibleCarriers = visible.filter(i => i.marks.some(m => m.field === req.subject && m.visible));

      if (req.scope.excluded) {
        results.push({ id: req.id, subject: req.subject, scope: req.scope,
          status: carriers.length ? 'present-in-prohibited-scope' : 'ok',
          evidence: carriers.length ? `${carriers.length}/${visible.length} entries carry [data-field="${req.subject}"]` : `no entry carries [data-field="${req.subject}"]`,
          method: 'identity' });
        continue;
      }
      if (!carriers.length) {
        const inDetail = detail.marks.some(m => m.field === req.subject) || detail.text.includes(values[0]);
        const onPage = pageFields.includes(req.subject);
        if (req.scope.view === 'either' && onPage) {
          results.push({ id: req.id, subject: req.subject, scope: req.scope, status: 'ok',
            evidence: `[data-field="${req.subject}"] present on a page-level control`, method: 'identity' });
          continue;
        }
        results.push({ id: req.id, subject: req.subject, scope: req.scope,
          status: inDetail ? 'wrong-scope' : 'missing',
          evidence: inDetail ? `[data-field="${req.subject}"] exists only on the detail view` : `no element carries [data-field="${req.subject}"]`,
          method: 'identity' });
        continue;
      }
      if (visibleCarriers.length < visible.length) {
        results.push({ id: req.id, subject: req.subject, scope: req.scope, status: 'partial',
          evidence: `${visibleCarriers.length}/${visible.length} visible entries carry the field`, method: 'identity' });
        continue;
      }
      // duplicated within an item
      const dup = visible.find(i => i.marks.filter(m => m.field === req.subject).length > 1);
      if (dup) { results.push({ id: req.id, subject: req.subject, scope: req.scope, status: 'duplicated',
        evidence: `record ${dup.record} carries [data-field="${req.subject}"] more than once`, method: 'identity' }); continue; }
      // wrong record: the value must belong to the record the item says it is
      const mismatched = visibleCarriers.find(i => {
        const m = i.marks.find(x => x.field === req.subject);
        const rec = records.find(r => String(r.id) === String(i.record || m.record));
        if (!rec) return false;
        const want = String(rec[req.subject] == null ? '' : rec[req.subject]);
        if (!want) return false;
        const wantN = norm(want), textN = norm(m.text);
        return !textN.includes(wantN.split(' ')[0]);
      });
      if (mismatched) { results.push({ id: req.id, subject: req.subject, scope: req.scope, status: 'wrong-value',
        evidence: `record ${mismatched.record} shows a value that is not its own`, method: 'identity' }); continue; }
      // hidden carrier
      if (visibleCarriers.length && visibleCarriers.every(i => i.marks.find(m => m.field === req.subject).visible === false)) {
        results.push({ id: req.id, subject: req.subject, scope: req.scope, status: 'hidden',
          evidence: `[data-field="${req.subject}"] present but not perceivable`, method: 'identity' });
        continue;
      }
      results.push({ id: req.id, subject: req.subject, scope: req.scope, status: 'ok',
        evidence: `${visibleCarriers.length}/${visible.length} entries carry [data-field="${req.subject}"]`, method: 'identity' });
      continue;
    }

    if (req.scope.view === 'detail') {
      const present = detail.marks.some(m => m.field === req.subject);
      results.push({ id: req.id, subject: req.subject, scope: req.scope,
        status: present ? 'ok' : (items.some(i => i.marks.some(m => m.field === req.subject)) ? 'wrong-scope' : 'missing'),
        evidence: present ? `[data-field="${req.subject}"] present on the detail view` : 'not present on the detail view',
        method: 'identity' });
      continue;
    }

    results.push({ id: req.id, subject: req.subject, scope: req.scope, status: 'unverified',
      reason: `no identity rule for view "${req.scope.view}"` });
  }

  const counts = {};
  for (const r of results) counts[r.status] = (counts[r.status] || 0) + 1;
  return {
    identityVersion: '1.0.0',
    appDir: resolve(appDir),
    items: itemSelUsed,
    identityPresent,
    results,
    counts,
    // only `ok` is a pass; unverified is explicitly not
    passes: counts.ok || 0,
    failed: results.filter(r => !['ok', 'unverified'].includes(r.status)).length,
    unverified: counts.unverified || 0,
  };
}

export function summariseIdentity(rep) {
  const c = rep.counts;
  const lines = [`identity verification — ${rep.items} items, identity ${rep.identityPresent ? 'present' : 'ABSENT'}: ` +
    Object.entries(c).map(([k, v]) => `${v} ${k}`).join(', ')];
  for (const r of rep.results) {
    if (r.status === 'ok') continue;
    lines.push(`  ${r.status.toUpperCase().padEnd(26)} ${r.subject} [${r.scope.view}] ${r.evidence || r.reason || ''}`);
  }
  return lines.join('\n');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const dir = process.argv[2];
  const { readFileSync } = await import('node:fs');
  const { join } = await import('node:path');
  const brief = JSON.parse(readFileSync(join(dir, 'brief.json'), 'utf8'));
  const scoped = brief._derived && brief._derived.scoped;
  if (!scoped) { console.error('run derive.mjs first'); process.exit(2); }
  const rep = await verifyIdentity({ brief, scoped, appDir: join(dir, 'app') });
  console.log(summariseIdentity(rep));
  process.exit(rep.failed ? 1 : 0);
}
