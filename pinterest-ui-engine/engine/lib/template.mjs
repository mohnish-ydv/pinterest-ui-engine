// template.mjs — {{dotted.path}} substitution with actionable diagnostics.
//
// Extracted from generate.mjs in Mission 021 so the layout compiler and the
// legacy template generator share one implementation. Duplicated fill logic
// is how the two paths would drift apart.

/**
 * @param {string} tpl   template text
 * @param {object} ctx   resolution context
 * @param {string} file  template file name, for diagnostics
 * @param {Function} [suggest] optional path-suggestion function
 */
export function fillTemplate(tpl, ctx, file, suggest) {
  const resolve = (obj, path) => path.split('.').reduce((o, k) => (o == null ? o : o[k]), obj);
  return tpl.replace(/\{\{([\w.]+)\}\}/g, (m, path) => {
    const v = resolve(ctx, path);
    if (v === undefined) {
      throw new Error(
        `unresolved placeholder {{${path}}} in ${file}\n` +
        `  No such value in the token set.` +
        (suggest ? '\n' + suggest(path) : '')
      );
    }
    if (v === null) {
      throw new Error(
        `null placeholder {{${path}}} in ${file}\n` +
        `  The value exists but is null, which would ship the literal text "null".\n` +
        `  Fix: have the design family supply this role, or stop referencing it.`
      );
    }
    return String(v);
  });
}

/** Build a "did you mean" line for a missing placeholder path. */
export function makeSuggester(ctx) {
  const all = [];
  const walk = (o, pre) => {
    for (const [k, v] of Object.entries(o || {})) {
      const key = pre ? `${pre}.${k}` : k;
      if (v && typeof v === 'object' && !Array.isArray(v)) walk(v, key);
      else all.push(key);
    }
  };
  walk(ctx, '');
  return (path) => {
    const tail = path.split('.').pop().toLowerCase();
    const hits = all.filter(p => p.toLowerCase().includes(tail)).slice(0, 5);
    return hits.length ? `  Did you mean: ${hits.join(', ')}` : `  Known top-level keys: ${Object.keys(ctx).join(', ')}`;
  };
}
