// flow.test.mjs — generic runner for a generated app's derived test plan.
//
// MISSION 021. The app's testplan.json is produced by the layout planner from
// the same IR that produced the app, so these checks cannot drift from what
// was generated. This runner knows nothing about the app: it executes
// declarative steps.
//
// Usage: node engine/tests/flow.test.mjs <appDir>
import { readFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { launchBrowser } from '../lib/stateprobe.mjs';

const appDir = process.argv[2];
if (!appDir) { console.error('usage: node engine/tests/flow.test.mjs <appDir>'); process.exit(2); }
const planPath = join(appDir, 'testplan.json');
if (!existsSync(planPath)) {
  console.error(`flow.test: ${planPath} not found.\n  This app was not produced by the layout compiler, so it has no derived test plan.`);
  process.exit(1);
}
const plan = JSON.parse(readFileSync(planPath, 'utf8'));
const root = resolve(appDir);

const results = [];
const errors = [];
const check = (name, ok, detail = '') => {
  results.push(ok);
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`);
};

const browser = await launchBrowser();
const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844 });
page.on('pageerror', e => errors.push('pageerror: ' + e.message));
page.on('console', m => { if (m.type() === 'error' && !/favicon/.test(m.text())) errors.push('console: ' + m.text()); });
page.on('dialog', d => d.accept());

await page.goto('file://' + root + '/index.html', { waitUntil: 'networkidle0' });
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: 'networkidle0' });
await page.waitForFunction(() => window.__READY__ === true, { timeout: 5000 }).catch(() => {});
const sleep = ms => new Promise(r => setTimeout(r, ms));
await sleep(150);

const count = (sel) => page.evaluate(s => document.querySelectorAll(s).length, sel);
const text = (sel) => page.evaluate(s => { const e = document.querySelector(s); return e ? e.textContent.trim() : null; }, sel);
const visible = (sel) => page.evaluate(s => {
  const e = document.querySelector(s);
  if (!e) return false;
  if (e.hidden) return false;
  const r = e.getBoundingClientRect(); const cs = getComputedStyle(e);
  return r.height > 0 && cs.display !== 'none' && cs.visibility !== 'hidden';
}, sel);
const attr = (sel, name) => page.evaluate(([s, n]) => { const e = document.querySelector(s); return e ? e.getAttribute(n) : null; }, [sel, name]);
const click = (sel) => page.evaluate(s => { const e = document.querySelector(s); if (!e) return false; e.scrollIntoView({ block: 'center' }); e.click(); return true; }, sel);
const setValue = (sel, v) => page.evaluate(([s, val]) => {
  const e = document.querySelector(s); if (!e) return false;
  e.value = val; e.dispatchEvent(new Event('input', { bubbles: true }));
  return true;
}, [sel, v]);

console.log(`app: ${plan.app}   entity: ${plan.entity}   ${plan.steps.length} derived checks`);
console.log(`plan derived from: ${plan.derivedFrom}\n`);

for (const step of plan.steps) {
  const label = `${step.id} ${step.desc}`;
  try {
    switch (step.act) {
      case 'count': {
        const c = await count(step.sel);
        check(label, c === step.eq, `got ${c}, expected ${step.eq}`);
        break;
      }
      case 'visible': {
        const v = await visible(step.sel);
        check(label, v === step.eq, `visible=${v}`);
        break;
      }
      case 'text': {
        const t = await text(step.sel);
        check(label, t === step.eq, `got ${JSON.stringify(t)}`);
        break;
      }
      case 'attr': {
        const a = await attr(step.sel, step.attr);
        check(label, a === step.eq, `${step.attr}=${JSON.stringify(a)}`);
        break;
      }
      case 'match': {
        const t = await text(step.sel);
        const ok = new RegExp(step.pattern).test(t || '');
        check(label, ok, `got ${JSON.stringify(t)} against ${step.pattern}`);
        break;
      }
      case 'click': {
        const ok = await click(step.sel);
        await sleep(220);
        check(label, ok, ok ? '' : `no element for ${step.sel}`);
        break;
      }
      case 'type': {
        const ok = await setValue(step.sel, step.value);
        await sleep(200);
        check(label, ok, ok ? '' : `no element for ${step.sel}`);
        break;
      }
      case 'nav':
      case 'goto': {
        // A view may be reachable by a tab-bar item, by an in-page navigation
        // control (e.g. the confirmation's "Back to browse"), or the app may
        // already be there. All three are legitimate; none is a failure.
        const onView = () => page.evaluate(v => {
          const m = document.querySelector('#main');
          return !!(m && m.dataset.view === v);
        }, step.view);
        // A click that finds an element but does nothing is NOT a success —
        // Mission 020's lesson about silent wrong answers applies to the
        // runner too, so navigation is confirmed rather than assumed.
        const byTab = await click(`[data-testid="nav-${step.view}"]`);
        await sleep(280);
        if (byTab && await onView()) { check(label, true, 'via tab bar'); break; }
        const byCtl = await click(`[data-act="nav"][data-view="${step.view}"]`);
        await sleep(280);
        if (byCtl && await onView()) { check(label, true, 'via in-page control'); break; }
        // A detail view is left with Back, which returns to the app's first view.
        const onFirst = await page.evaluate(v => {
          const m = document.querySelector('#main');
          const first = (window.__APP__ && window.__APP__.layout.views[0].id) || 'browse';
          return m && first === v && m.dataset.view !== v;
        }, step.view);
        if (onFirst) {
          const byBack = await click('[data-act="back"]');
          await sleep(300);
          if (byBack && await onView()) { check(label, true, 'via Back'); break; }
        }
        const already = await page.evaluate(v => {
          const m = document.querySelector('#main');
          return m && m.dataset.view === v;
        }, step.view);
        check(label, already, already ? 'already on that view' : `no route to ${step.view}`);
        break;
      }
      case 'reload': {
        await page.reload({ waitUntil: 'networkidle0' });
        await page.waitForFunction(() => window.__READY__ === true, { timeout: 5000 }).catch(() => {});
        await sleep(250);
        check(label, true, '');
        break;
      }
      case 'slots': {
        // Availability states are asserted as observable outcomes, so a
        // divergence between the brief's rule and the runtime is caught as
        // behaviour rather than as code.
        const counts = await page.evaluate((cfg) => {
          const q = (id) => '[data-testid="' + id + '"]';
          return {
            taken: document.querySelectorAll(q(cfg.slotTestid) + '[data-state="taken"]').length,
            free: document.querySelectorAll(q(cfg.slotTestid) + '[data-state="free"]').length,
            days: document.querySelectorAll(q(cfg.dayTestid)).length,
          };
        }, step);
        check(label, counts.taken === step.taken && counts.free === step.free,
          `taken=${counts.taken} free=${counts.free} (expected ${step.taken}/${step.free})`);
        break;
      }
      case 'measure': {
        await page.setViewport({ width: 1440, height: 900 }); await sleep(180);
        const m = await page.evaluate((sel) => {
          const el = document.querySelector(sel); if (!el) return null;
          const cs = getComputedStyle(el); const fs = parseFloat(cs.fontSize);
          return { px: el.getBoundingClientRect().width, fs, chars: Math.round(el.getBoundingClientRect().width / (fs * 0.5)) };
        }, step.sel);
        await page.setViewport({ width: 390, height: 844 }); await sleep(120);
        check(label, !!m && m.chars >= step.min && m.chars <= step.max, m ? `${m.chars} chars` : 'no element');
        break;
      }
      case 'fontGreater': {
        const r = await page.evaluate(([a, b]) => {
          const ea = document.querySelector(a), eb = document.querySelector(b);
          if (!ea || !eb) return null;
          return { a: parseFloat(getComputedStyle(ea).fontSize), b: parseFloat(getComputedStyle(eb).fontSize) };
        }, [step.a, step.b]);
        check(label, !!r && r.a > r.b, r ? `${r.a}px > ${r.b}px` : 'missing element');
        break;
      }
      case 'console': {
        check(label, errors.length === step.eq, errors.slice(0, 3).join(' | '));
        break;
      }
      default:
        check(label, false, `unknown act "${step.act}"`);
    }
  } catch (e) {
    check(label, false, String(e.message).slice(0, 120));
  }
}

await browser.close();
const passed = results.filter(Boolean).length;
console.log(`\nRESULT ${passed}/${results.length}`);
process.exit(passed === results.length ? 0 : 1);
