// color.mjs — pure WCAG colour maths. No browser, no puppeteer, no I/O.
//
// Extracted from slotbook-experiment/tools/stateprobe.mjs (Mission 016-B),
// where these functions shared a module with the browser session. They are
// separated here for one architectural reason: the token compiler's contrast
// gate must be runnable with no Chromium present. A design-token compiler
// that cannot validate colours on a machine without a browser is not a
// portable compiler.
//
// Everything below is pure and side-effect free; engine/tests/color.test.mjs
// checks it against independently published WCAG values.

// Parse a CSS colour as returned by getComputedStyle (rgb()/rgba()) or a
// hex string (#rgb/#rrggbb) into { r, g, b, a } with channels 0..255 and
// alpha 0..1. Returns null for anything unparseable — callers must treat
// null as "no measurement", never as a default colour.
export function parseColor(str) {
  if (typeof str !== 'string') return null;
  const s = str.trim().toLowerCase();
  if (s === 'transparent') return { r: 0, g: 0, b: 0, a: 0 };
  const fn = s.match(/^rgba?\(([^)]+)\)$/);
  if (fn) {
    const p = fn[1].split(',').map(x => parseFloat(x));
    if (p.some(Number.isNaN) || p.length < 3) return null;
    return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
  }
  const hex = s.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/);
  if (hex) {
    let h = hex[1];
    if (h.length === 3) h = h.split('').map(c => c + c).join('');
    return {
      r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16),
      b: parseInt(h.slice(4, 6), 16), a: 1,
    };
  }
  return null;
}

// WCAG 2.x relative luminance (sRGB).
export function relativeLuminance({ r, g, b }) {
  const f = c => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

// Alpha-composite fg over bg ("source over"). bg is assumed opaque or is
// itself composited first by the caller.
export function compositeOver(fg, bg) {
  const a = fg.a + bg.a * (1 - fg.a);
  if (a === 0) return { r: 0, g: 0, b: 0, a: 0 };
  const ch = k => (fg[k] * fg.a + bg[k] * bg.a * (1 - fg.a)) / a;
  return { r: ch('r'), g: ch('g'), b: ch('b'), a };
}

// WCAG contrast ratio between two parsed colours. A translucent foreground
// is composited over the background first; a translucent background is
// composited over white (the browser's default canvas).
export function contrastRatio(fg, bg) {
  if (!fg || !bg) return NaN;
  const bgEff = bg.a < 1 ? compositeOver(bg, { r: 255, g: 255, b: 255, a: 1 }) : bg;
  const fgEff = fg.a < 1 ? compositeOver(fg, bgEff) : fg;
  const l1 = relativeLuminance(fgEff), l2 = relativeLuminance(bgEff);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

// Convenience: contrast of two CSS colour strings, rounded to 2dp, or NaN.
export function contrastOf(fgCss, bgCss) {
  const r = contrastRatio(parseColor(fgCss), parseColor(bgCss));
  return Number.isNaN(r) ? NaN : Math.round(r * 100) / 100;
}

// Relative luminance of a CSS colour string, 0..1, or null if unparseable.
export function luminanceOf(css) {
  const c = parseColor(css);
  return c ? relativeLuminance(c) : null;
}

// Darken a CSS hex colour by mixing toward black by `amount` (0..1).
// Used by the reference profiler to derive hover shades without inventing
// a second hue. Returns null if the input is not a 6-digit hex.
export function darkenHex(css, amount) {
  const c = parseColor(css);
  if (!c) return null;
  const k = 1 - Math.max(0, Math.min(1, amount));
  const h = v => Math.round(v * k).toString(16).padStart(2, '0');
  return '#' + h(c.r) + h(c.g) + h(c.b);
}

// Hue (0-360) of a CSS hex colour, or null. Used to derive per-record media
// tints from the family's brand hue so substituted imagery still looks
// designed rather than random.
export function hueOf(css) {
  const c = parseColor(css);
  if (!c) return null;
  const r = c.r / 255, g = c.g / 255, b = c.b / 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
  if (d === 0) return 0;
  let h;
  if (mx === r) h = ((g - b) / d) % 6;
  else if (mx === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  h *= 60;
  return (h + 360) % 360;
}
