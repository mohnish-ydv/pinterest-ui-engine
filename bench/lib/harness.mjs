// harness.mjs — shared runner for the benchmark acceptance suites.
//
// The acceptance suites are hand-written from each case's BRIEF, not from the
// engine's layout IR. That is what makes them a fair measure: both the
// generated app and the hand-authored baseline are held to the requirements,
// and neither can shape the test by shaping its own output.
import { resolve } from 'node:path';
import { launchBrowser } from '../../pinterest-ui-engine/engine/lib/stateprobe.mjs';

export async function runSuite(title, appDir, body) {
  const root = resolve(appDir);
  const browser = await launchBrowser();
  const results = [];
  const errors = [];
  const check = (name, ok, detail = '') => {
    results.push(ok);
    console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`);
  };
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844 });
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error' && !/favicon/.test(m.text())) errors.push('console: ' + m.text()); });
  page.on('dialog', d => d.accept());
  await page.goto('file://' + root + '/index.html', { waitUntil: 'networkidle0' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 300));

  const api = {
    page, errors, check,
    sleep: (ms) => new Promise(r => setTimeout(r, ms)),
    click: (sel) => page.evaluate(s => { const el = document.querySelector(s); if (!el) return false; el.scrollIntoView({ block: 'center' }); el.click(); return true; }, sel),
    vis: (sel) => page.evaluate(s => { const el = document.querySelector(s); if (!el) return false; if (el.hidden) return false; const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.height > 0 && cs.display !== 'none' && cs.visibility !== 'hidden'; }, sel),
    text: (sel) => page.evaluate(s => { const el = document.querySelector(s); return el ? el.textContent.trim() : null; }, sel),
    count: (sel) => page.evaluate(s => document.querySelectorAll(s).length, sel),
    attr: (sel, n) => page.evaluate(([s, a]) => { const el = document.querySelector(s); return el ? el.getAttribute(a) : null; }, [sel, n]),
    css: (sel, prop) => page.evaluate(([s, p]) => { const el = document.querySelector(s); return el ? getComputedStyle(el)[p] : null; }, [sel, prop]),
    measureWidth: (sel) => page.evaluate(s => {
      const el = document.querySelector(s);
      if (!el) return null;
      const cs = getComputedStyle(el);
      const fs = parseFloat(cs.fontSize);
      // average character width for a proportional serif/sans is ~0.5em
      return { px: el.getBoundingClientRect().width, fontSize: fs, chars: Math.round(el.getBoundingClientRect().width / (fs * 0.5)) };
    }, sel),
    type: (sel, v) => page.evaluate(([s, val]) => {
      const el = document.querySelector(s); if (!el) return false;
      el.focus(); el.value = val;
      el.dispatchEvent(new Event('input', { bubbles: true }));
      return true;
    }, [sel, v]),
    setValue: (sel, v) => page.evaluate(([s, val]) => {
      const el = document.querySelector(s); if (!el) return false;
      el.value = val; el.dispatchEvent(new Event('input', { bubbles: true })); return true;
    }, [sel, v]),
    reload: async () => { await page.reload({ waitUntil: 'networkidle0' }); await new Promise(r => setTimeout(r, 300)); },
  };

  console.log(`\n=== ${title} ===\napp: ${root}`);
  try {
    await body(api);
  } catch (e) {
    check('suite completed without throwing', false, String(e.message).slice(0, 140));
  }
  await browser.close();
  const passed = results.filter(Boolean).length;
  console.log(`RESULT ${passed}/${results.length}`);
  process.exit(passed === results.length ? 0 : 1);
}
