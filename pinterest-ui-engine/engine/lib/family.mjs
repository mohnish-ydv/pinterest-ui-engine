// family.mjs — design-family configuration: load, resolve, validate.
//
// THE PROBLEM THIS SOLVES
// Mission 018's generalisation run exposed design decisions from ONE family
// (Marble Meats / R02) baked into the generic token compiler: a warm blush
// hairline, a warm stepper hairline, a Playfair serif display stack, a
// hardcoded white ground and two warm shadows. A clinic app in clinical blue
// inherited all of them. The clinic template then worked around them by
// hardcoding hexes — which quietly put the rendered app OUTSIDE the token
// gate's guarantee.
//
// THE SHAPE OF THE FIX
// Every one of those decisions is now data in engine/families/<family>.json.
// The compiler reads the family; it contains no design literal of its own.
//
// Deliberately NOT a plugin framework: the config is one flat JSON object
// with named fields and defaults. There is no registry, no lifecycle, no
// inheritance chain. A new design family is a new JSON file.
//
// VALUE RESOLUTION
// Any colour-ish field accepts:
//   "#RRGGBB"  a literal
//   "spec"     take spec.palette[<role>], where <role> is the field's role
//   null       same as "spec", and an ABSENT palette entry is an error
// Absent palette entries never fall back to a default colour: a family that
// has not decided its error colour must be told, not given a guess.

import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
export const FAMILIES_DIR = join(HERE, '..', 'families');

/** Fields the compiler cannot invent a sensible default for. */
export const REQUIRED_FAMILY_FIELDS = [
  'family',
  'typography.uiStack',
  'borders.hairline',
  'shadows.card',
  'surfaces.groundSource',
  'semantic.error',
];

const DEFAULT_UI_STACK = '-apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

/** Structural defaults — applied only where a family may legitimately stay silent. */
const DEFAULTS = {
  typography: { displayStrategy: 'sans', displayStack: null, uiStack: DEFAULT_UI_STACK },
  borders: { hairline: null, stepperHairline: null, hairlineWidth: '1px', stepperWidth: '1.5px' },
  shadows: { card: null, sheet: null },
  surfaces: { groundSource: 'spec', inputBg: null, inputTextSource: 'ink' },
  semantic: { error: null, warning: null, success: null },
  states: { hoverTarget: 'brandDeep', disabled: null, loading: null, selected: null },
  density: { lineHeight: 1.45, bodyScale: 1 },
  space: [4, 8, 12, 16, 20, 24, 32],
  responsive: { breakpoint: 900, mobile: '', desktop: '' },
};

const deepMerge = (base, over) => {
  if (over === undefined) return base;
  if (over === null || typeof over !== 'object' || Array.isArray(over)) return over;
  const out = { ...(base && typeof base === 'object' && !Array.isArray(base) ? base : {}) };
  for (const k of Object.keys(over)) out[k] = deepMerge(out[k], over[k]);
  return out;
};

const getPath = (obj, path) => path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);

/**
 * Resolve a family field that names a colour.
 * @param {*} value      literal hex | "spec" | null/undefined
 * @param {object} spec  the run's design-spec
 * @param {string} role  palette key to read from the spec (e.g. "error")
 * @param {string} label human-readable field name, for diagnostics
 * @returns {string|null} a hex string, or null when the field is genuinely optional
 */
export function resolveColor(value, spec, role, label) {
  if (typeof value === 'string' && value.trim().startsWith('#')) return value.trim();
  const palette = (spec && spec.palette) || {};
  // "palette:<key>" names another palette role explicitly — this is how a
  // family says "hairlines are the tint colour" without repeating a hex.
  if (typeof value === 'string' && value.startsWith('palette:')) {
    const key = value.slice('palette:'.length).trim();
    const v = palette[key];
    if (typeof v === 'string' && v.trim()) return v.trim();
    throw new Error(
      `family field "${label}": "${value}" names palette.${key}, which the design spec does not define.\n` +
      `  Add "${key}" to palette in the run's design-spec.json, or use a hex literal.`
    );
  }
  if (value === 'spec' || value === null || value === undefined) {
    const v = palette[role];
    if (typeof v === 'string' && v.trim()) return v.trim();
    // Optional roles may legitimately be absent; required ones may not.
    return null;
  }
  throw new Error(
    `family field "${label}": unsupported value ${JSON.stringify(value)}. ` +
    `Use a hex literal ("#RRGGBB") or "spec" to read spec.palette.${role}.`
  );
}

/** Resolve a required colour, throwing a diagnostic that names the fix. */
export function requireColor(value, spec, role, label) {
  const c = resolveColor(value, spec, role, label);
  if (c) return c;
  throw new Error(
    `MISSING SEMANTIC ROLE "${role}" (family field "${label}").\n` +
    `  The design spec has no palette.${role}, and the family config does not supply a literal.\n` +
    `  Fix one of:\n` +
    `    - add "${role}": "#RRGGBB" to palette in the run's design-spec.json, or\n` +
    `    - set "semantic.${role}": "#RRGGBB" in the family config.\n` +
    `  Refusing to guess: an ungated state colour is how illegible error text ships.`
  );
}

/**
 * Load a family config for a run.
 * Lookup order:
 *   1. explicit path argument (absolute, or relative to cwd)
 *   2. <runDir>/family.json
 *   3. engine/families/<name>.json
 * @param {string} runDir
 * @param {string} [nameOrPath]
 */
export function loadFamily(runDir, nameOrPath) {
  const candidates = [];
  if (nameOrPath) {
    candidates.push(isAbsolute(nameOrPath) ? nameOrPath : join(process.cwd(), nameOrPath));
    candidates.push(join(FAMILIES_DIR, nameOrPath.endsWith('.json') ? nameOrPath : nameOrPath + '.json'));
  }
  if (runDir) candidates.push(join(runDir, 'family.json'));
  for (const c of candidates) {
    if (existsSync(c)) return { family: normalizeFamily(JSON.parse(readFileSync(c, 'utf8'))), path: c };
  }
  throw new Error(
    'No design-family config found.\n' +
    '  Looked for: ' + candidates.join(', ') + '\n' +
    '  Fix: pass a family name (engine/families/<name>.json) or put family.json in the run directory.\n' +
    '  Known families: ' + listFamilies().join(', ')
  );
}

export function listFamilies() {
  try {
    return readdirSync(FAMILIES_DIR).filter(f => f.endsWith('.json')).map(f => f.replace(/\.json$/, ''));
  } catch {
    return [];
  }
}

/** Apply defaults without hiding what the family actually declared. */
export function normalizeFamily(raw) {
  const merged = deepMerge(DEFAULTS, raw || {});
  merged._declared = raw || {};
  return merged;
}

/**
 * Validate a normalized family config. Returns { errors, warnings }.
 * Errors are things that must stop compilation; warnings are things a
 * family should fix but which have a documented, safe fallback.
 */
export function validateFamily(fam) {
  const errors = [], warnings = [];
  for (const f of REQUIRED_FAMILY_FIELDS) {
    const v = getPath(fam, f);
    if (v === undefined || v === null || v === '') {
      if (f === 'semantic.error' || f === 'borders.hairline' || f === 'shadows.card') {
        warnings.push(`"${f}" not declared — it will be resolved from the spec palette or the gate will refuse.`);
      } else {
        errors.push(`missing required family field "${f}"`);
      }
    }
  }
  const strat = getPath(fam, 'typography.displayStrategy');
  if (!['serif', 'sans', 'none'].includes(strat)) {
    errors.push(`typography.displayStrategy must be "serif" | "sans" | "none" (got ${JSON.stringify(strat)})`);
  }
  if (strat === 'serif' && !fam.typography.displayStack) {
    errors.push('typography.displayStrategy is "serif" but typography.displayStack is empty');
  }
  const gs = getPath(fam, 'surfaces.groundSource');
  if (!(gs === 'spec' || (typeof gs === 'string' && gs.startsWith('#')))) {
    errors.push(`surfaces.groundSource must be "spec" or a hex literal (got ${JSON.stringify(gs)})`);
  }
  if (!Array.isArray(fam.space) || fam.space.length < 4) {
    errors.push('space must be an array of at least 4 numeric steps');
  }
  const bp = getPath(fam, 'responsive.breakpoint');
  if (typeof bp !== 'number' || bp < 320) errors.push('responsive.breakpoint must be a number >= 320');
  return { errors, warnings };
}

/** Resolve the display font stack according to the family's declared strategy. */
export function displayStack(fam) {
  const t = fam.typography;
  if (t.displayStrategy === 'serif') return t.displayStack;
  if (t.displayStrategy === 'none') return t.uiStack;
  return t.uiStack; // 'sans'
}
