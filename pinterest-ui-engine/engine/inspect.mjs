// inspect.mjs — pipeline stage E: rendered inspection, contract-driven.
//
// MISSION 020 (P3.1). The Mission 017 inspector was hardcoded to one run:
//   const OPEN_RIBEYE = '#grid [data-testid="product-card"][data-id="ribeye"] …'
// It could not inspect a second app, and the contract-based successor
// (inspect2.mjs) lived inside runs/carepoint/ — a run artifact, not engine
// code. So the engine shipped no reusable inspector at all.
//
// This file is ONE inspector for any app. It reads a contract that lists the
// flow as a sequence of steps, so what to inspect is data, not code. It works
// identically on engine output and on a baseline build, which is what makes
// the comparison fair.
//
// Contract shape (JSON), see runs/<run>/inspect.contract.json:
//   {
//     "id": "carepoint",
//     "viewport": { "width": 390, "height": 844 },
//     "desktop":  { "width": 1440, "height": 900 },
//     "steps": [
//       { "shot": "home-390" },
//       { "measure": "chipSelected", "kind": "selected",
//         "selector": "[data-testid=…]", "sequence": ["initial render"] },
//       { "centre": "#selector" },
//       { "click": "#selector", "settleMs": 400 },
//       { "click": "#selector", "within": "[data-view=\"bag\"]" },   // view-scoped
//       { "click": "#selector", "noCentre": true },   // skip auto-centring
//       { "hover": "#selector", "settleMs": 350 },
//       { "type": { "selector": "#name", "text": "Asha" } },
//       { "setValues": [{ "selector": "#name", "value": "Asha" }] },
//       { "axe": "home" },
//       { "viewport": { "width": 1440, "height": 900 } },
//       { "wait": 300 }
//     ]
//   }
//
// `kind` on a measure is validated: a contract must exercise at least one
// "error" state and one "post-action" state. That is the defect class
// load-time audits structurally cannot see (Mission 018 found a 4.44:1 card
// that only exists after a booking).
//
// Usage: node engine/inspect.mjs <appDir> <contractPath> <outDir>
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { launchBrowser, openFixture, runSequence, measure } from './lib/stateprobe.mjs';
import { validateContract } from './lib/contract.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const AXE_PATH = join(HERE, '..', '..', 'vendor', 'axe-core', 'axe.min.js');

const [appDir, contractPath, outDir] = process.argv.slice(2);
if (!appDir || !contractPath || !outDir) {
  console.error('usage: node engine/inspect.mjs <appDir> <contractPath> <outDir>');
  process.exit(2);
}
if (!existsSync(join(appDir, 'index.html'))) {
  console.error(`inspect: ${appDir} has no index.html — is that an app directory?`);
  process.exit(1);
}
if (!existsSync(AXE_PATH)) {
  console.error(`inspect: vendored axe-core not found at ${AXE_PATH}\n  It ships in vendor/axe-core/. Restore it or re-extract the package.`);
  process.exit(1);
}

const contract = JSON.parse(readFileSync(contractPath, 'utf8'));

const problems = validateContract(contract);
if (problems.length) {
  console.error(`inspect: invalid contract ${contractPath}`);
  for (const p of problems) console.error('  - ' + p);
  process.exit(1);
}

// ---- run -----------------------------------------------------------------
mkdirSync(outDir, { recursive: true });
const root = resolve(appDir);
const axeSrc = readFileSync(AXE_PATH, 'utf8');
const out = { app: root, contract: contract.id, shots: [], measures: {}, axe: {}, warnings: [] };

const browser = await launchBrowser();
const { page } = await openFixture(browser, { root, id: contract.id, viewport: contract.viewport || { width: 390, height: 844 } });

// Scope a selector to a container. Needed because a contract's testids are
// declared per-BRIEF, not per-view: the butcher app legitimately has a
// [data-testid="back-btn"] in both the detail view and the bag view, and a
// bare selector resolves to the hidden one. Clicking a hidden node is a
// silent lie — puppeteer falls back to an in-page click and the measurement
// that follows describes the wrong screen. `within` makes the target explicit.
const scope = (within, sel) => (within ? `${within} ${sel}` : sel);

const centre = (sel) => page.evaluate(s => { const el = document.querySelector(s); if (el) el.scrollIntoView({ block: 'center' }); }, sel);

// A pointer click that proves it hit the intended element.
//
// Why not page.click(): puppeteer performs its OWN scrollIntoViewIfNeeded just
// before clicking, which can undo the centring above and leave a target under
// a fixed bottom bar. The click then lands on the tab bar, "succeeds", the app
// navigates elsewhere, and every measurement after it describes the wrong
// screen. That is a silent wrong answer, which is worse than a loud failure.
//
// So: centre, hit-test with elementFromPoint, and click at the computed point
// only if the topmost element is the target or inside it. Occlusion is
// reported as a structured outcome, never papered over.
const pointerClick = async (sel) => {
  await centre(sel);
  const hit = await page.evaluate((s) => {
    const el = document.querySelector(s);
    if (!el) return { ok: false, code: 'TARGET_NOT_FOUND' };
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return { ok: false, code: 'TARGET_NOT_RENDERED' };
    const x = r.x + r.width / 2, y = r.y + r.height / 2;
    const top = document.elementFromPoint(x, y);
    const inside = top && (top === el || el.contains(top));
    const describe = (n) => n ? n.tagName.toLowerCase() + (n.dataset && n.dataset.nav ? `[data-nav="${n.dataset.nav}"]` : '') + (n.className && typeof n.className === 'string' ? '.' + n.className.split(' ')[0] : '') : 'none';
    return { ok: true, x, y, inside, top: describe(top) };
  }, sel);
  if (!hit.ok) return hit;
  if (!hit.inside) return { ok: false, code: 'TARGET_OCCLUDED', top: hit.top };
  await page.mouse.click(hit.x, hit.y);
  return { ok: true };
};
const axeRun = async () => page.evaluate(async (src) => {
  const s = document.createElement('script'); s.textContent = src; document.head.appendChild(s);
  const r = await window.axe.run(document, { resultTypes: ['violations'] });
  return r.violations.map(v => v.id);
}, axeSrc);

for (const [i, step] of contract.steps.entries()) {
  try {
    if (step.shot) {
      const p = join(outDir, step.shot + '.png');
      await page.screenshot({ path: p });
      out.shots.push(p);
    } else if (step.measure) {
      const r = await measure(page, { selector: scope(step.within, step.selector), fixture: contract.id, sequence: step.sequence || [] });
      out.measures[step.measure] = { kind: step.kind, ...r };
      if (!r.ok) out.warnings.push(`measure "${step.measure}" failed: ${r.error.code}`);
    } else if (step.centre) {
      await centre(scope(step.within, step.centre));
    } else if (step.click) {
      const target = scope(step.within, step.click);
      const r = await pointerClick(target);
      if (!r.ok && step.optional) {
        // An optional step (e.g. "dismiss the confirmation if we are on it")
        // is allowed to find nothing. It is still recorded.
        out.warnings.push(`step ${i} click "${target}" (optional) skipped: ${r.code}`);
      } else if (!r.ok) {
        out.warnings.push(`step ${i} click "${target}" failed: ${r.code}${r.top ? ' (covered by ' + r.top + ')' : ''}`);
        // Fall back to an in-page click so one bad target does not abort the
        // run, but the fallback is recorded — a pointer-dependent state may
        // then not be genuine.
        const fb = await runSequence(page, [{ do: 'click', selector: target, settleMs: step.settleMs ?? 400 }]);
        if (!fb.ok) out.warnings.push(`step ${i} click "${target}" fallback failed: ${fb.error.code}`);
        else out.warnings.push(`step ${i} click "${target}": used in-page fallback — pointer-dependent states may not be genuine`);
      }
      await new Promise(r2 => setTimeout(r2, step.settleMs ?? 400));
    } else if (step.hover) {
      const r = await runSequence(page, [{ do: 'hover', selector: scope(step.within, step.hover), settleMs: step.settleMs ?? 350 }]);
      if (!r.ok) out.warnings.push(`step ${i} hover "${step.hover}" failed: ${r.error.code}`);
      for (const w of r.warnings || []) out.warnings.push(`step ${i} hover "${step.hover}": ${w}`);
    } else if (step.type) {
      const r = await runSequence(page, [{ do: 'type', selector: step.type.selector, text: step.type.text, settleMs: step.settleMs ?? 120 }]);
      if (!r.ok) out.warnings.push(`step ${i} type failed: ${r.error.code}`);
    } else if (step.setValues) {
      await page.evaluate((pairs) => {
        for (const { selector, value } of pairs) {
          const el = document.querySelector(selector);
          if (el) { el.value = value; el.dispatchEvent(new Event('input', { bubbles: true })); }
        }
      }, step.setValues);
    } else if (step.axe) {
      out.axe[step.axe] = await axeRun();
    } else if (step.viewport) {
      await page.setViewport(step.viewport);
    } else if (step.wait) {
      await new Promise(r => setTimeout(r, step.wait));
    } else {
      out.warnings.push(`step ${i}: unrecognised step ${JSON.stringify(step)}`);
    }
  } catch (e) {
    out.warnings.push(`step ${i} threw: ${String(e.message).slice(0, 160)}`);
  }
}

await browser.close();
writeFileSync(join(outDir, 'inspection.json'), JSON.stringify(out, null, 2));

// ---- report --------------------------------------------------------------
const m = out.measures;
console.log(`contract: ${contract.id}   app: ${root}`);
console.log('shots: ' + out.shots.map(s => s.split('/').pop()).join(', '));
for (const k of Object.keys(m)) {
  const r = m[k];
  console.log(`  ${k.padEnd(20)} [${r.kind}] ${r.ok ? r.ratio : 'FAILED:' + r.error.code}`);
}
console.log('axe: ' + JSON.stringify(out.axe));
if (out.warnings.length) {
  console.log(`warnings (${out.warnings.length}):`);
  for (const w of out.warnings) console.log('  - ' + w);
}
