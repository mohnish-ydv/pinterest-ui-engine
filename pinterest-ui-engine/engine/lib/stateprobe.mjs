// stateprobe.mjs — interaction-state measurement for local web apps.
//
// VENDORED into the engine by Mission 020 (P0.1). Source of truth for the
// logic is slotbook-experiment/tools/stateprobe.mjs (Mission 016-B), which
// remains in place because its own suites and the historical verifier
// evidence depend on it. This copy exists so that the engine has no
// cross-project import: deleting slotbook-experiment/ must not break the
// engine's token gate or its inspector.
//
// Two changes vs the original, both deliberate and both tested:
//   1. the pure colour maths now lives in ./color.mjs and is re-exported
//      below, so importing this module is the only thing that needs a
//      browser — the token gate imports color.mjs directly and never
//      touches puppeteer or Chromium;
//   2. the browser binary is resolved by ./chrome.mjs (CHROME_PATH, then
//      conventional locations, then PATH) instead of a hardcoded default
//      path from the original developer's machine.
//
// The measurement discipline is unchanged and must stay unchanged:
//   - elements are addressed by selector STRING only; every read
//     re-queries the DOM after interactions settle, so a re-render can
//     never leave the probe holding a detached node;
//   - clicks prefer a real pointer click (so :hover is genuine) and
//     fall back to an atomic in-page click, recording a warning;
//   - a measurement that cannot be made returns a structured failure
//     ({ ok:false, error }) — never a fabricated or default colour.

import puppeteer from 'puppeteer-core';
import { resolve } from 'node:path';
import { parseColor, relativeLuminance, compositeOver, contrastRatio } from './color.mjs';
import { resolveChromium, LAUNCH_ARGS } from './chrome.mjs';

// Re-exported so callers can import everything from one place, as before.
export { parseColor, relativeLuminance, compositeOver, contrastRatio, LAUNCH_ARGS };

const sleep = ms => new Promise(r => setTimeout(r, ms));

// ---------------------------------------------------------------------------
// Browser session
// ---------------------------------------------------------------------------

export async function launchBrowser() {
  // Resolved lazily so that merely importing this module never requires a
  // browser to be installed.
  return puppeteer.launch({ executablePath: resolveChromium(), headless: true, args: LAUNCH_ARGS });
}

// Open a local app directory (containing index.html) the same way the
// experiment harnesses did: file:// URL, localStorage cleared, reload,
// settle. Returns { page, fixture }.
export async function openFixture(browser, { root, id, viewport = { width: 390, height: 844 }, settleMs = 300 }) {
  const page = await browser.newPage();
  await page.setViewport(viewport);
  page.on('dialog', d => d.accept());
  const url = 'file://' + resolve(root) + '/index.html';
  await page.goto(url, { waitUntil: 'networkidle0' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle0' });
  await sleep(settleMs);
  return { page, fixture: id || root, url };
}

// ---------------------------------------------------------------------------
// Interaction sequences
// ---------------------------------------------------------------------------

// Run interaction steps. Each step: { do, selector?, text?, settleMs? }
//   do: 'click' | 'hover' | 'moveAway' | 'type' | 'wait'
// Selectors are CSS strings, re-resolved by puppeteer on every step —
// no element handle ever crosses a step boundary.
// Clicks try a real pointer click first (genuine :hover/:active); if the
// CDP click fails (the experiment saw post-dispatch throws on builds
// that re-render on state change), an atomic in-page click is used and a
// warning is recorded, because pointer-dependent states may then differ.
// Returns { ok, failedStep?, error?, warnings[] }; never throws for a
// missing target — that is a measurement outcome, not an exception.
export async function runSequence(page, steps) {
  const warnings = [];
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    const settleMs = step.settleMs ?? 400;
    try {
      if (step.do === 'click') {
        try {
          await page.click(step.selector, { timeout: 3000 });
        } catch (e) {
          const hit = await page.evaluate(sel => {
            const el = document.querySelector(sel);
            if (!el) return false;
            el.scrollIntoView({ block: 'center' });
            el.click();
            return true;
          }, step.selector);
          if (!hit) return { ok: false, failedStep: i, error: { code: 'TARGET_NOT_FOUND', selector: step.selector }, warnings };
          warnings.push(`step ${i}: pointer click failed (${String(e.message).slice(0, 80)}); used in-page click — pointer-dependent states may not be genuine`);
        }
      } else if (step.do === 'hover') {
        await page.hover(step.selector, { timeout: 3000 });
      } else if (step.do === 'moveAway') {
        await page.mouse.move(4, 4);
      } else if (step.do === 'type') {
        await page.focus(step.selector);
        await page.keyboard.type(step.text || '');
      } else if (step.do === 'wait') {
        // settle only
      } else {
        return { ok: false, failedStep: i, error: { code: 'UNKNOWN_ACTION', selector: step.selector }, warnings };
      }
    } catch (e) {
      return { ok: false, failedStep: i, error: { code: 'STEP_FAILED', selector: step.selector, message: String(e.message).slice(0, 160) }, warnings };
    }
    if (settleMs) await sleep(settleMs);
  }
  return { ok: true, warnings };
}

// ---------------------------------------------------------------------------
// Measurement
// ---------------------------------------------------------------------------

// Measure the contrast of a target element IN ITS CURRENT STATE.
// The element is re-queried inside the page at call time. Its effective
// background is found by compositing the background layers of the
// element and its ancestors (outermost first) until opacity is reached;
// if the chain never reaches an opaque layer it is composited over the
// browser's default white canvas and a warning says so. A translucent
// foreground is composited over that effective background.
//
// Returns a structured result:
//   { ok:true, fixture, selector, sequence, state, text,
//     foreground: { css, rgba, composited },
//     background: { css, chain[], rgba, composited },
//     ratio, computedStyles, warnings[] }
// or { ok:false, fixture, selector, error: { code, message }, warnings[] }
// with code SELECTOR_NOT_FOUND or TARGET_NOT_RENDERED.
export async function measure(page, { selector, fixture = null, sequence = [] } = {}) {
  const warnings = [];
  const raw = await page.evaluate(sel => {
    const el = document.querySelector(sel);
    if (!el) return { found: false };
    const cs = getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    const chain = [];
    let node = el;
    while (node) {
      const ncs = getComputedStyle(node);
      chain.push(ncs.backgroundColor);
      const parsed = ncs.backgroundColor;
      if (parsed !== 'rgba(0, 0, 0, 0)' && parsed !== 'transparent') {
        // keep walking only while layers are translucent; the Node side
        // decides via parsed alpha — record up to the first opaque layer
        // plus any translucent layers above it.
        const m = parsed.match(/rgba?\(([^)]+)\)/);
        const parts = m ? m[1].split(',').map(x => parseFloat(x)) : [];
        if (parts.length < 4 || parts[3] >= 1) break;
      }
      node = node.parentElement;
    }
    return {
      found: true,
      color: cs.color,
      chain,
      backgroundImage: cs.backgroundImage,
      fontSize: cs.fontSize, fontWeight: cs.fontWeight,
      display: cs.display, visibility: cs.visibility,
      width: rect.width, height: rect.height,
      state: el.getAttribute('data-state'),
      text: el.textContent.trim().slice(0, 80),
    };
  }, selector);

  if (!raw.found) {
    return { ok: false, fixture, selector, sequence, error: { code: 'SELECTOR_NOT_FOUND', message: `no element matches ${selector}` }, warnings };
  }
  if (raw.display === 'none' || raw.visibility === 'hidden' || raw.width === 0 || raw.height === 0) {
    return { ok: false, fixture, selector, sequence, error: { code: 'TARGET_NOT_RENDERED', message: `element is not rendered (display=${raw.display}, visibility=${raw.visibility}, box=${raw.width}x${raw.height})` }, computedStyles: raw, warnings };
  }
  if (raw.backgroundImage && raw.backgroundImage !== 'none') {
    warnings.push('target or an ancestor paints a background-image; backgroundColor compositing may not reflect the rendered backdrop');
  }

  // Composite the background chain outermost-first over white; if the
  // outermost recorded layer is already opaque the white never shows.
  const layers = raw.chain.map(parseColor);
  if (layers.some(l => l === null)) {
    return { ok: false, fixture, selector, sequence, error: { code: 'UNPARSEABLE_BACKGROUND', message: `chain: ${raw.chain.join(' | ')}` }, warnings };
  }
  let bg = { r: 255, g: 255, b: 255, a: 1 };
  let reachedOpaque = false;
  for (let i = layers.length - 1; i >= 0; i--) {
    bg = compositeOver(layers[i], bg);
    if (layers[i].a >= 1) reachedOpaque = true;
  }
  if (!reachedOpaque) warnings.push('background chain never reached an opaque layer; composited over the default white canvas');

  const fgParsed = parseColor(raw.color);
  if (!fgParsed) {
    return { ok: false, fixture, selector, sequence, error: { code: 'UNPARSEABLE_FOREGROUND', message: `color: ${raw.color}` }, warnings };
  }
  const fg = fgParsed.a < 1 ? compositeOver(fgParsed, bg) : fgParsed;
  const ratio = contrastRatio(fgParsed, bg);

  const fmt = c => `rgb(${Math.round(c.r)}, ${Math.round(c.g)}, ${Math.round(c.b)})`;
  return {
    ok: true,
    fixture, selector, sequence,
    state: raw.state, text: raw.text,
    foreground: { css: raw.color, rgba: fgParsed, composited: fmt(fg) },
    background: { css: raw.chain[0], chain: raw.chain, rgba: bg, composited: fmt(bg) },
    ratio: Math.round(ratio * 100) / 100,
    computedStyles: {
      color: raw.color, backgroundColor: raw.chain[0],
      fontSize: raw.fontSize, fontWeight: raw.fontWeight,
      display: raw.display, visibility: raw.visibility,
    },
    warnings,
  };
}

export async function shootState(page, path) {
  await page.screenshot({ path });
  return path;
}
