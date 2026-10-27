// scope.mjs — verify a requirement in the region it names.
//
// MISSION 030, Phase 3. A document-wide existence check cannot tell a field in
// the right place from one in the wrong place, and a one-item sample cannot
// tell "every entry" from "the first entry".
//
// The seven outcomes this distinguishes:
//   ok              present, correct value, correct units, in the required scope
//   wrong-scope     present, but only in a different view
//   missing         not present anywhere
//   hidden          present in the DOM but not perceivable
//   wrong-value     present in scope, but the value is not the brief's
//   missing-units   present in scope, the number without its unit
//   partial         present in some repeated items and absent from others
//   present-in-prohibited-scope  present where the brief forbids it

import { resolve } from 'node:path';
import { launchBrowser } from '../lib/stateprobe.mjs';

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

function probeFor(field, record) {
  const raw = record ? record[field.id] : undefined;
  if (raw == null || raw === '') return null;
  const s = Array.isArray(raw) ? String(raw[0]) : String(raw);
  return s.length >= 6 ? s.slice(0, 40) : s;
}

function matcher(needle) {
  const esc = needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  if (needle.length >= 6) return new RegExp(esc, 'i');
  return new RegExp('(^|[^0-9A-Za-z])' + esc + '($|[^0-9A-Za-z])', 'i');
}

/**
 * @param {object} o
 * @param {object} o.brief     engine brief (carries requiredIn per field)
 * @param {object} o.scoped    the scoped requirement set from deriveScopedRequirements
 * @param {string} o.appDir
 */
export async function verifyScopes(o) {
  const { brief, scoped, appDir } = o;
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

  const itemSel = '[data-testid$="-card"], [data-testid$="-row"], .idx-row';
  const itemTexts = await page.evaluate((sel) => Array.from(document.querySelectorAll(sel)).map(el => {
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    // A value exposed only through an accessible name is present to a
    // screen-reader user. Counting it as missing would be a false positive
    // against a legitimate equivalent.
    const accessible = Array.from(el.querySelectorAll('[aria-label],[title]'))
      .map(n => (n.getAttribute('aria-label') || '') + ' ' + (n.getAttribute('title') || '')).join(' ');
    return {
      text: ((el.innerText || '') + ' ' + accessible).replace(/\s+/g, ' '),
      // textContent keeps text that innerText drops because an ancestor is
      // hidden — the difference is exactly "present but not perceivable".
      raw: (el.textContent || '').replace(/\s+/g, ' '),
      hidden: cs.display === 'none' || cs.visibility === 'hidden' || r.height === 0,
    };
  }), itemSel);
  const pageText = await page.evaluate(() => { const m = document.querySelector('main'); return m ? m.innerText.replace(/\s+/g, ' ') : ''; });

  // open a record so the detail scope can be checked
  const opened = await page.evaluate((sel) => { const el = document.querySelector(sel); if (!el) return false; el.click(); return true; }, itemSel);
  await sleep(420);
  const detailText = opened ? await page.evaluate(() => { const m = document.querySelector('main'); return m ? m.innerText.replace(/\s+/g, ' ') : ''; }) : '';
  await browser.close();

  const results = [];
  for (const req of scoped.requirements) {
    if (req.kind !== 'field') {
      results.push({ id: req.id, kind: req.kind, subject: req.subject, scope: req.scope, status: 'unmeasured',
        reason: `no verifier for "${req.kind}" requirements yet` });
      continue;
    }
    const f = byId[req.subject];
    if (!f) { results.push({ id: req.id, subject: req.subject, status: 'missing', reason: 'no such field' }); continue; }
    const needle = probeFor(f, records[0]);
    if (!needle) { results.push({ id: req.id, subject: req.subject, status: 'unmeasured', reason: 'the brief carries no sample value' }); continue; }
    const re = matcher(needle);
    const unit = f.suffix || (f.unitField && records[0] ? String(records[0][f.unitField] || '') : '');

    // MISSION 032: a prohibition is verified against the rendered DOM, not
    // against the plan. "Present in a prohibited scope" is its own outcome.
    if (req.scope.excluded) {
      const valuesE = records.map(r => {
        const raw = r[f.id];
        if (raw == null || raw === '') return null;
        const str = Array.isArray(raw) ? String(raw[0]) : String(raw);
        return str.length >= 6 ? str.slice(0, 40) : str;
      }).filter(Boolean).map(v => matcher(v));
      const visibleE = itemTexts.filter(t => !t.hidden);
      const offenders = visibleE.filter(t => valuesE.some(v => v.test(t.text)));
      results.push({
        id: req.id, kind: 'field', subject: req.subject, label: req.label, scope: req.scope,
        status: offenders.length ? 'present-in-prohibited-scope' : 'ok',
        evidence: offenders.length
          ? `${offenders.length}/${visibleE.length} entries carry a value the brief excludes — e.g. "${offenders[0].text.slice(0, 60)}"`
          : `absent from all ${visibleE.length} entries, as required`,
      });
      continue;
    }

    if (req.scope.view === 'entry') {
      // "Every entry shows X" means every item carries ITS OWN value for X.
      // Matching all items against record 0's value marks four of five
      // legitimate entries as failures — the first version of this did exactly
      // that.
      const values = records.map(r => {
        const raw = r[f.id];
        if (raw == null || raw === '') return null;
        const str = Array.isArray(raw) ? String(raw[0]) : String(raw);
        return str.length >= 6 ? str.slice(0, 40) : str;
      }).filter(Boolean).map(v => matcher(v));
      const visible = itemTexts.filter(t => !t.hidden);
      const withField = visible.filter(t => values.some(v => v.test(t.text)));
      const hiddenOnly = itemTexts.filter(t => (t.hidden && re.test(t.text)) || (!t.hidden && re.test(t.raw) && !values.some(v => v.test(t.text))));
      let status;
      if (!visible.length) status = 'missing';
      else if (withField.length === 0 && hiddenOnly.length) status = 'hidden';
      else if (withField.length === 0 && re.test(detailText)) status = 'wrong-scope';
      else if (withField.length === 0 && !re.test(pageText)) status = 'missing';
      else if (withField.length === 0) status = 'wrong-scope';
      else if (withField.length < visible.length) status = 'partial';
      else status = 'ok';
      // Units vary per record — a pantry has kg, litre and bunch. Each item is
      // checked for a number followed by ANY unit the field declares, not by
      // the first record's unit.
      if (status === 'ok' && (f.suffix || f.unitField)) {
        const units = Array.from(new Set(records
          .map(r => (f.unitField ? String(r[f.unitField] || '') : (f.suffix || '').trim()))
          .filter(Boolean)));
        const alt = units.map(u => u.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
        const numUnit = new RegExp('(^|[^0-9])\\d+(?:[.,]\\d+)?\\s*(' + alt + ')($|[^0-9A-Za-z])', 'i');
        if (!withField.every(t => numUnit.test(t.text))) status = 'missing-units';
      }
      results.push({ id: req.id, kind: 'field', subject: req.subject, label: req.label,
        scope: req.scope, status,
        evidence: status === 'ok' ? `${withField.length}/${visible.length} entries` : (withField[0] ? withField[0].text.slice(0, 70) : 'not found in any entry') });
      continue;
    }

    if (req.scope.view === 'detail') {
      let status;
      if (re.test(detailText)) status = 'ok';
      else if (re.test(pageText)) status = 'wrong-scope';
      else status = 'missing';
      results.push({ id: req.id, kind: 'field', subject: req.subject, label: req.label, scope: req.scope, status,
        evidence: status === 'ok' ? 'present on the detail view' : detailText.slice(0, 70) });
      continue;
    }

    const present = re.test(pageText);
    results.push({ id: req.id, kind: 'field', subject: req.subject, label: req.label, scope: req.scope,
      status: present ? 'ok' : 'missing', evidence: present ? 'present on the page' : 'not found' });
  }

  const counts = {};
  for (const r of results) counts[r.status] = (counts[r.status] || 0) + 1;
  return {
    scopeVerifyVersion: '1.0.0',
    appDir: resolve(appDir),
    items: itemTexts.length,
    results, counts,
    ok: (counts.ok || 0),
    failed: results.filter(r => !['ok', 'unmeasured'].includes(r.status)).length,
  };
}

export function summariseScopes(rep) {
  const c = rep.counts;
  const lines = [`scope verification — ${rep.items} items: ` +
    Object.entries(c).map(([k, v]) => `${v} ${k}`).join(', ')];
  for (const r of rep.results) {
    if (r.status !== 'ok') lines.push(`  ${r.status.toUpperCase().padEnd(14)} ${r.subject || r.kind} [${r.scope.view}/${r.scope.cardinality}] ${r.evidence || r.reason || ''}`);
  }
  return lines.join('\n');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const dir = process.argv[2];
  if (!dir) { console.error('usage: node scope.mjs <caseDir>'); process.exit(2); }
  const { readFileSync } = await import('node:fs');
  const { join } = await import('node:path');
  const brief = JSON.parse(readFileSync(join(dir, 'brief.json'), 'utf8'));
  const scoped = brief._derived && brief._derived.scoped;
  if (!scoped) { console.error('brief has no _derived.scoped — run derive.mjs first'); process.exit(2); }
  const rep = await verifyScopes({ brief, scoped, appDir: join(dir, 'app') });
  console.log(summariseScopes(rep));
  process.exit(rep.failed ? 1 : 0);
}
