// critique.mjs — detect concrete visual problems in a rendered app.
//
// MISSION 025, Phase 5. Inspection until now answered "is it correct?" —
// contrast, states, content, reachability. It never answered "is it wrong?":
// awkward wrapping, a column of identical images, sections spaced unevenly, a
// structure that does not match the reference.
//
// Every finding carries its evidence (measured values, not adjectives), a
// proposed change, and whether it is safe to repair automatically. A repair is
// only accepted after the full check suite is re-run — see repair.mjs.
//
// Usage: node engine/critique/critique.mjs <appDir> <layout.json> [outDir]

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { launchBrowser } from '../lib/stateprobe.mjs';

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

export async function critique(appDir, ir, opts = {}) {
  const root = resolve(appDir);
  const browser = await launchBrowser();
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844 });
  const pageErrors = [];
  page.on('pageerror', e => pageErrors.push(e.message));
  await page.goto('file://' + root + '/index.html', { waitUntil: 'networkidle0' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle0' });
  await sleep(300);

  const findings = [];
  const add = (o) => findings.push(Object.assign({ severity: 'S3', repairable: false }, o));

  // 1. horizontal overflow at mobile
  const overflow = await page.evaluate(() => ({
    scroll: document.documentElement.scrollWidth, inner: window.innerWidth,
  }));
  if (overflow.scroll > overflow.inner + 1) {
    add({ id: 'overflow-mobile', severity: 'S1', repairable: false,
      evidence: `scrollWidth ${overflow.scroll} > innerWidth ${overflow.inner} at 390`,
      proposal: 'Wrap the offending region in an overflow-x container or reduce its min-width.' });
  }

  // 2. heading structure
  const heads = await page.evaluate(() => ({
    h1: document.querySelectorAll('main h1').length,
    levels: Array.from(document.querySelectorAll('main h1,main h2,main h3')).map(h => h.tagName),
  }));
  if (heads.h1 !== 1) {
    add({ id: 'heading-count', severity: 'S2', repairable: false,
      evidence: `${heads.h1} h1 elements in the entry view`,
      proposal: 'Exactly one h1 per view; demote the rest to h2.' });
  }

  // 3. section rhythm — uneven vertical gaps read as an unfinished page
  const gaps = await page.evaluate(() => {
    const secs = Array.from(document.querySelectorAll('main .sect'));
    const out = [];
    for (let i = 1; i < secs.length; i++) {
      const a = secs[i - 1].getBoundingClientRect();
      const b = secs[i].getBoundingClientRect();
      out.push(Math.round(b.top - a.bottom));
    }
    return out;
  });
  if (gaps.length >= 3) {
    const mean = gaps.reduce((x, y) => x + y, 0) / gaps.length;
    const spread = Math.max(...gaps) - Math.min(...gaps);
    if (spread > Math.max(24, mean)) {
      add({ id: 'section-rhythm', severity: 'S3', repairable: true,
        evidence: `inter-section gaps ${gaps.join(', ')} — spread ${spread}px`,
        proposal: 'Use one section gap from the density scale instead of per-section margins.' });
    }
  }

  // 4. media repetition — every card the same hue is the M021 defect
  const media = await page.evaluate(() => {
    const els = Array.from(document.querySelectorAll('.card-media, .rec-media'));
    return els.map(e => getComputedStyle(e).getPropertyValue('--media-hue').trim()).filter(Boolean);
  });
  if (media.length >= 3 && new Set(media).size === 1) {
    add({ id: 'media-repetition', severity: 'S3', repairable: true,
      evidence: `${media.length} media blocks, all hue ${media[0]}`,
      proposal: 'Spread the per-record hue around the brand hue so records are distinguishable.' });
  }

  // 5. awkward wrapping — a very long unbroken line at mobile
  const longest = await page.evaluate(() => {
    let worst = { chars: 0, text: '' };
    for (const el of document.querySelectorAll('main p, main .card-title, main .row-title, main .dl-value')) {
      const t = (el.innerText || '').trim();
      if (!t) continue;
      const r = el.getBoundingClientRect();
      const lines = Math.max(1, Math.round(r.height / (parseFloat(getComputedStyle(el).lineHeight) || 20)));
      const c = Math.round(t.length / lines);
      if (c > worst.chars) worst = { chars: c, text: t.slice(0, 40) };
    }
    return worst;
  });
  if (longest.chars > 90) {
    add({ id: 'line-length-mobile', severity: 'S3', repairable: false,
      evidence: `~${longest.chars} characters per line: "${longest.text}"`,
      proposal: 'Constrain the measure or allow the block to wrap at a narrower width.' });
  }

  // 6. occlusion — a fixed bar covering the last interactive element
  // Occlusion is only meaningful at the bottom of the page: an element below
  // the fold is not covered, it is merely not scrolled to. (First version of
  // this check reported a false S1 for exactly that reason.)
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await sleep(180);
  const occluded = await page.evaluate(() => {
    const bar = document.querySelector('.tabbar');
    if (!bar) return null;
    const r = bar.getBoundingClientRect();
    const targets = Array.from(document.querySelectorAll('main button, main a, main input'))
      .filter(el => { const b = el.getBoundingClientRect(); return b.height > 0 && b.top < window.innerHeight; });
    if (!targets.length) return null;
    const last = targets[targets.length - 1].getBoundingClientRect();
    const overlap = last.bottom > r.top + 1 && last.top < r.bottom;
    return { overlap, barTop: Math.round(r.top), lastBottom: Math.round(last.bottom) };
  });
  if (occluded && occluded.overlap) {
    add({ id: 'occlusion-fixed-bar', severity: 'S1', repairable: false,
      evidence: `last control bottom ${occluded.lastBottom} overlaps the fixed bar top ${occluded.barTop}`,
      proposal: 'Add bottom padding equal to the bar height on the scroll container.' });
  }

  // 7. article measure at desktop
  const artBody = await page.evaluate(() => !!document.querySelector('[data-testid="article-body"]'));
  if (artBody) {
    await page.setViewport({ width: 1440, height: 900 }); await sleep(160);
    const m = await page.evaluate(() => {
      const el = document.querySelector('[data-testid="article-body"]');
      const cs = getComputedStyle(el);
      return Math.round(el.getBoundingClientRect().width / (parseFloat(cs.fontSize) * 0.5));
    });
    if (m < 45 || m > 80) {
      add({ id: 'article-measure', severity: 'S2', repairable: true,
        evidence: `${m} characters per line at 1440`,
        proposal: 'Set the article column to a 55–75ch measure.' });
    }
    await page.setViewport({ width: 390, height: 844 }); await sleep(120);
  }

  // ---- MISSION 026 detectors ------------------------------------------

  // 5a. a table that scrolls with no discoverable affordance
  const tableAff = await page.evaluate(() => {
    const frame = document.querySelector('[data-testid="table-frame"]');
    if (!frame) return null;
    const wrap = frame.querySelector('[data-testid="table-scroll"]');
    const hint = document.querySelector('[data-testid="table-scroll-hint"]');
    const fade = frame.querySelector('.table-fade');
    const vis = (el) => {
      if (!el) return false;
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden') return false;
      const r = el.getBoundingClientRect();
      return r.height > 0 && r.width > 0;
    };
    return {
      scrolls: wrap ? wrap.scrollWidth > wrap.clientWidth + 1 : false,
      hint: vis(hint),
      fade: vis(fade) && parseFloat(getComputedStyle(fade).opacity) > 0.5,
      focusable: wrap ? wrap.getAttribute('tabindex') === '0' : false,
      labelled: wrap ? !!wrap.getAttribute('aria-label') : false,
    };
  });
  if (tableAff && tableAff.scrolls && !(tableAff.hint && tableAff.fade)) {
    add({ id: 'table-no-affordance', severity: 'S2', repairable: true,
      evidence: `the table scrolls (${tableAff.hint ? 'hint' : 'no hint'}, ${tableAff.fade ? 'fade' : 'no fade'})`,
      proposal: 'Show the trailing-edge fade and the scroll hint while the table overflows.' });
  }
  if (tableAff && tableAff.scrolls && !tableAff.focusable) {
    add({ id: 'table-not-focusable', severity: 'S2', repairable: true,
      evidence: 'the scroll container has no tabindex, so it cannot be scrolled by keyboard',
      proposal: 'Give the scroll container tabindex="0" and a role and label.' });
  }

  // 5b. clipping inside a nested container that never advertises it
  const clipped = await page.evaluate(() => {
    const out = [];
    for (const el of document.querySelectorAll('main *')) {
      // A visually-hidden helper clips on purpose; so does an aria-hidden
      // decoration. Neither is content loss. (First version of this check
      // flagged .vh on every case — recorded as a false positive.)
      if (el.classList.contains('vh') || el.closest('[aria-hidden="true"]')) continue;
      const cs = getComputedStyle(el);
      const hidden = cs.overflowX === 'hidden' || cs.overflow === 'hidden';
      if (!hidden) continue;
      // a 1px helper is hiding, not clipping
      if (el.clientWidth <= 4 || el.clientHeight <= 4) continue;
      if (el.scrollWidth > el.clientWidth + 2 && el.clientWidth > 0) {
        // Truncation with a visible ellipsis is a deliberate pattern, not a
        // silent clip — but the text is still lost, so it is reported, at a
        // lower severity and under its own name.
        const ellipsis = cs.textOverflow === 'ellipsis' && cs.whiteSpace === 'nowrap';
        out.push({ cls: el.className || el.tagName, by: el.scrollWidth - el.clientWidth, ellipsis,
                   text: (el.innerText || '').trim().slice(0, 28) });
      }
    }
    return out;
  });
  const silent = clipped.filter(c => !c.ellipsis);
  const truncated = clipped.filter(c => c.ellipsis);
  if (silent.length) {
    add({ id: 'nested-clipping', severity: 'S2', repairable: false,
      evidence: `${silent.length} container(s) clip content with no ellipsis: ${silent.slice(0, 3).map(c => `${c.cls} by ${c.by}px`).join(', ')}`,
      proposal: 'Allow the content to wrap or scroll with an affordance instead of hiding it.' });
  }
  if (truncated.length) {
    add({ id: 'text-truncated', severity: 'S3', repairable: false,
      evidence: `${truncated.length} text node(s) truncated with an ellipsis: ${truncated.slice(0, 3).map(c => `"${c.text}" by ${c.by}px`).join(', ')}`,
      proposal: 'Declared content is being shortened; consider allowing two lines at narrow widths.' });
  }

  // 5c. decorative initials where the composition forbids them
  const initials = await page.evaluate(() => document.querySelectorAll('.row-chip, .card-chip').length);
  if (initials > 0 && opts.constraints) {
    const forbids = opts.constraints.some(c => c.kind === 'prohibited' && c.element === 'initial-chip')
      || opts.constraints.some(c => c.kind === 'composition' && c.value === 'index');
    if (forbids) {
      add({ id: 'forbidden-initials', severity: 'S2', repairable: false,
        evidence: `${initials} decorative initial chip(s) rendered although the composition forbids them`,
        proposal: 'Use the index composition, which carries no initials.' });
    }
  }

  // 5d. hierarchy: the declared primary content must be the largest text in a row
  const hierarchy = await page.evaluate(() => {
    const row = document.querySelector('.idx-row, .card, .row');
    if (!row) return null;
    const kids = Array.from(row.querySelectorAll('h1,h2,h3,p,span,strong'));
    let best = { px: 0, text: '' };
    for (const el of kids) {
      const px = parseFloat(getComputedStyle(el).fontSize) || 0;
      const t = (el.innerText || '').trim();
      if (t && px > best.px) best = { px, text: t.slice(0, 30) };
    }
    return best;
  });
  if (hierarchy && opts.primaryField) {
    // recorded for the report; a mismatch is only claimed when the largest text
    // is clearly not the primary field's content
    add({ id: 'hierarchy-probe', severity: 'S3', repairable: false, informational: true,
      evidence: `largest text in the first row: ${hierarchy.px}px "${hierarchy.text}"`,
      proposal: 'n/a' });
  }

  // 5e. compiled design constraints, checked against the DOM
  if (opts.constraints && opts.constraints.length) {
    const dom = await page.evaluate(() => ({
      card: document.querySelectorAll('.card').length,
      media: document.querySelectorAll('.card-media, .rec-media, main img').length,
      chip: document.querySelectorAll('.row-chip, .card-chip').length,
      idxRow: document.querySelectorAll('.idx-row').length,
    }));
    for (const c of opts.constraints) {
      if (c.kind === 'prohibited') {
        const n = c.element === 'card' ? dom.card : c.element === 'media' ? dom.media : c.element === 'initial-chip' ? dom.chip : 0;
        if (n > 0) {
          add({ id: `constraint-violation:${c.element}`, severity: 'S1', repairable: false,
            evidence: `${n} "${c.element}" element(s) rendered; constraint ${c.id} (${c.source}) forbids it — ${c.statement}`,
            proposal: `The planner must not select a surface that emits "${c.element}".` });
        }
      }
      if (c.kind === 'composition' && c.value === 'index' && dom.idxRow === 0) {
        add({ id: 'constraint-violation:composition', severity: 'S1', repairable: false,
          evidence: `composition "index" declared (${c.source}) but no .idx-row was rendered`,
          proposal: 'The planner must select the index variant for an index composition.' });
      }
    }
  }

  // ---- MISSION 029 gates -----------------------------------------------

  // A quantity declared with a unit must not render as a bare number. This is
  // checked against the DOM text of a record, not a substring of the page.
  if (opts.units && opts.units.length) {
    // Units vary per record — a pantry has kg, litre, bunch, block. The gate
    // asks whether THIS row's quantity carries ANY declared unit, not whether
    // every row carries the same one.
    const unitReport = await page.evaluate((units) => {
      const out = [];
      const alt = units.map(u => u.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
      const re = new RegExp('(^|[^0-9])\\d+(?:[.,]\\d+)?\\s*(' + alt + ')($|[^0-9A-Za-z])', 'i');
      const rows = Array.from(document.querySelectorAll('[data-testid$="-card"], [data-testid$="-row"], .card, .row, .idx-row'));
      for (const r of rows.slice(0, 4)) {
        const t = (r.innerText || '').replace(/\s+/g, ' ');
        out.push({ hasUnit: re.test(t), text: t.slice(0, 60) });
      }
      return out;
    }, opts.units);
    const missing = unitReport.filter(x => !x.hasUnit);
    if (missing.length) {
      add({ id: 'unit-dropped', severity: 'S2', repairable: false,
        evidence: `${missing.length} record(s) show a quantity without its unit — e.g. "${missing[0].text}"`,
        proposal: 'Bind the unit field to the numeric field so it renders with the value.' });
    }
  }

  // A decorative initial standing in for media the product does not have.
  if (opts.expectsRealMedia === false) {
    const subs = await page.evaluate(() => {
      const media = Array.from(document.querySelectorAll('.card-media, .rec-media'));
      const initialish = media.filter(e => (e.textContent || '').trim().length <= 3 && !e.querySelector('img'));
      return { media: media.length, initialish: initialish.length, sample: initialish.slice(0, 3).map(e => e.textContent.trim()) };
    });
    if (subs.initialish > 0) {
      add({ id: 'decorative-media-substitute', severity: 'S2', repairable: true,
        evidence: `${subs.initialish} of ${subs.media} media blocks are initials (${subs.sample.join(', ')}) and the product declares no media`,
        proposal: 'Suppress the media block; an initial is not a photograph.' });
    }
  }

  // Scan cost: a simple repeated-item task should not need many screens.
  if (opts.simpleRepeatedTask) {
    // The occlusion check above scrolls to the bottom of the page; a scan-cost
    // measurement taken from there counts every row as on-screen.
    await page.evaluate(() => window.scrollTo(0, 0));
    await sleep(180);
    const scan = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('[data-testid$="-card"], [data-testid$="-row"], .card, .row, .idx-row'));
      if (!rows.length) return null;
      const per = rows.filter(r => r.getBoundingClientRect().top < window.innerHeight).length;
      return { per, total: rows.length, screens: Math.round(document.documentElement.scrollHeight / window.innerHeight * 10) / 10 };
    });
    if (scan && scan.per < 3 && scan.total >= 4) {
      add({ id: 'scan-cost', severity: 'S3', repairable: false,
        evidence: `only ${scan.per} of ${scan.total} records fit on the first screen (${scan.screens} screens tall) for a checking task`,
        proposal: 'Use a denser surface; a checklist read top to bottom should show most of its items at once.' });
    }
  }

  // 8. reference / generated structure mismatch
  const evPath = opts.evidencePath;
  if (evPath) {
    try {
      const ev = JSON.parse(readFileSync(evPath, 'utf8'));
      const entry = ir.views[0];
      const coll = entry.sections.find(s => s.component === 'entity-collection' || s.component === 'data-table');
      const surface = coll ? coll.component : 'none';
      const refPattern = ev.inferred?.layoutPattern?.value;
      if (refPattern === 'grid-collage' && surface === 'entity-collection' && coll && coll.variant === 'row') {
        add({ id: 'structure-mismatch', severity: 'S3', repairable: false,
          evidence: `reference reads as a grid collage; the generated entry view is a row list`,
          proposal: 'Consider a card grid or a table when the reference is grid-like and the data is dense.' });
      }
    } catch (e) { /* evidence is optional */ }
  }

  await page.evaluate(() => window.scrollTo(0, 0));
  await browser.close();
  const counts = { S1: 0, S2: 0, S3: 0 };
  for (const f of findings) if (!f.informational) counts[f.severity]++;
  return { appDir: root, findings, counts, pageErrors,
           total: findings.filter(f => !f.informational).length,
           informational: findings.filter(f => f.informational).length,
           repairable: findings.filter(f => f.repairable).length };
}

export function summarise(rep) {
  const lines = [`critique — ${rep.total} finding(s): ${rep.counts.S1} S1, ${rep.counts.S2} S2, ${rep.counts.S3} S3`];
  for (const f of rep.findings) lines.push(`  ${f.informational ? 'INFO' : f.severity} ${f.id}: ${f.evidence}`);
  return lines.join('\n');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [appDir, layoutPath, outDir] = process.argv.slice(2);
  if (!appDir || !layoutPath) { console.error('usage: node engine/critique/critique.mjs <appDir> <layout.json> [outDir]'); process.exit(2); }
  const ir = JSON.parse(readFileSync(layoutPath, 'utf8'));
  let constraints = [];
  try { constraints = JSON.parse(readFileSync(join(layoutPath, '..', 'intent-report.json'), 'utf8')).constraints; } catch (e) {}
  const rep = await critique(appDir, ir, {
    evidencePath: join(layoutPath, '..', 'reference-evidence.json'),
    constraints,
  });
  console.log(summarise(rep));
  if (outDir) { mkdirSync(outDir, { recursive: true }); writeFileSync(join(outDir, 'critique.json'), JSON.stringify(rep, null, 2) + '\n'); }
  process.exit(rep.counts.S1 ? 1 : 0);
}
