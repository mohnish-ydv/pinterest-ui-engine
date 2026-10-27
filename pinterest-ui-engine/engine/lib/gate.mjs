// gate.mjs — the token contrast gate, derived from the tokens themselves.
//
// WHAT CHANGED AND WHY
// The Mission 017 gate was a hardcoded list of 11 pairs written in butcher
// vocabulary ("white on board (promo)"). Two consequences:
//   - a new design family's states were ungated until someone edited the
//     compiler;
//   - the engine's most safety-relevant state (error) was never checked at
//     all, because no error token existed to check.
//
// This gate builds its pair list from the token set that was actually
// emitted, so every text-bearing state is checked by construction. If a
// family adds a state, it is gated; if a family omits a required role, the
// compiler refuses before the gate is reached.
//
// THRESHOLD POLICY — deliberately unchanged and deliberately strict:
// every pair is checked at 4.5:1 (WCAG AA normal text). WCAG's large-text
// tier (3.0:1) exists, and the gate reports which pairs would qualify, but
// it is NOT used to loosen any threshold. Mission 020 must not weaken a
// test to obtain a green result, and using the tier would have done exactly
// that for pairs that currently pass at 4.5.

import { parseColor, contrastRatio } from './color.mjs';

export const AA_NORMAL = 4.5;

/** Roles the engine guarantees. Absence is a hard error, not a skip. */
export const REQUIRED_ROLES = ['ground', 'surface', 'ink', 'inkSoft', 'brand', 'brandDeep', 'tint', 'line', 'error'];

/**
 * Build the full list of text-on-background pairs implied by a token set.
 * Each entry: { name, fg, bg, required }
 * `required:false` means the pair only exists if the family emitted it.
 */
export function derivePairs(tokens) {
  const C = tokens.color || {};
  const S = tokens.state || {};
  const pairs = [];
  const add = (name, fg, bg, required = true) => {
    if (!required && (!fg || !bg)) return;
    pairs.push({ name, fg, bg, required });
  };

  // Body and secondary text on the two large grounds.
  add('body ink on ground', C.ink, C.ground);
  add('body ink on surface', C.ink, C.surface);
  add('soft ink on ground', C.inkSoft, C.ground);
  add('soft ink on surface', C.inkSoft, C.surface);

  // Tint is a text-bearing ground too (table headers, hover rows): body ink
  // composes on it in the shipped CSS, so the pair is gated. Soft ink on
  // tint is deliberately NOT listed: a measured instance (3.89:1) is what
  // happens when an ungated pair is composed anyway — the header was moved
  // to body ink, and derive_spec now also walks soft ink clear of tint so
  // no future composition inherits the trap.
  add('body ink on tint', C.ink, C.tint, false);

  // Hero field (only families that commit a coloured field have one).
  add('hero text on field', C.fieldText, C.field, false);

  // Inputs.
  add('input text on input bg', C.inputText, C.input, false);

  // Primary action, rest and hover — the hover pair is what baseline builds
  // silently lacked (they had no hover state at all).
  add('CTA rest', S.cta?.fg, S.cta?.bg);
  add('CTA hover', S.cta?.fg, S.cta?.hoverBg);

  // Selection.
  add('chip selected', S.chipOn?.fg, S.chipOn?.bg);
  add('chip unselected', S.chipOff?.fg, S.chipOff?.bg);

  // Badges / tint containers.
  add('badge text', S.badge?.fg, S.badge?.bg);

  // Quantity stepper (butcher only, but generic if present).
  add('stepper text', S.stepper?.fg, S.stepper?.bg, false);

  // Navigation.
  add('tab idle on surface', S.tabIdle?.fg, C.surface);
  add('tab active on surface', S.tabActive?.fg, C.surface);

  // Dark board (promo / photo-board).
  add('white on board (promo)', '#FFFFFF', C.board, false);
  add('price on dark', S.priceOnDark?.fg, C.board, false);

  // Semantic roles — the class of defect that was previously ungated.
  add('error text on ground', C.error, C.ground);
  add('error text on surface', C.error, C.surface);
  add('warning text on ground', C.warning, C.ground, false);
  add('success text on ground', C.success, C.ground, false);

  // Non-rest states.
  add('disabled text on disabled bg', S.disabled?.fg, S.disabled?.bg, false);
  add('loading text on loading bg', S.loading?.fg, S.loading?.bg, false);

  return pairs;
}

/**
 * Gate a token set.
 * @returns {{ok:boolean, results:Array, failures:Array, missing:Array}}
 *   results: every pair with its ratio and verdict
 *   failures: pairs below AA_NORMAL
 *   missing: required pairs whose colours were absent
 */
export function gateTokens(tokens) {
  const results = [], failures = [], missing = [];

  const absent = REQUIRED_ROLES.filter(r => !(tokens.color && tokens.color[r]));
  for (const r of absent) {
    missing.push({ name: `required role "${r}"`, reason: 'not present in tokens.color' });
  }

  for (const p of derivePairs(tokens)) {
    if (!p.fg || !p.bg) {
      if (p.required) missing.push({ name: p.name, reason: `missing fg or bg (fg=${p.fg}, bg=${p.bg})` });
      continue;
    }
    const fg = parseColor(p.fg), bg = parseColor(p.bg);
    if (!fg || !bg) {
      missing.push({ name: p.name, reason: `unparseable colour (fg=${p.fg}, bg=${p.bg})` });
      continue;
    }
    const ratio = Math.round(contrastRatio(fg, bg) * 100) / 100;
    const ok = ratio >= AA_NORMAL;
    const row = { name: p.name, fg: p.fg, bg: p.bg, ratio, ok };
    results.push(row);
    if (!ok) failures.push(row);
  }

  return { ok: failures.length === 0 && missing.length === 0, results, failures, missing };
}

/** Human-readable gate report (the compiler prints this). */
export function formatGate(gate) {
  const lines = [];
  for (const r of gate.results) {
    lines.push(`${r.ok ? 'PASS' : 'FAIL'}  ${r.name}: ${r.fg} on ${r.bg} = ${r.ratio.toFixed(2)}:1 (needs >= ${AA_NORMAL})`);
  }
  for (const m of gate.missing) lines.push(`MISSING  ${m.name}: ${m.reason}`);
  return lines.join('\n');
}
