// generate.mjs — pipeline stage D: render a runnable app from tokens.
//
// Renders a run's brief.json + tokens.json through a template family
// directory. Templates contain {{dotted.path}} placeholders resolved against
// { ...tokens, brief, productsJson }. No other magic: what the template says
// is what ships. app.js is copied verbatim (it reads window.__DATA__).
//
// MISSION 020 CHANGES (P0.4): failures are now actionable. The old version
// threw a bare `unresolved placeholder: x.y`, and — worse — silently emitted
// the string "null" into CSS when a token existed but was null. A template
// asking for a colour the compiler never produced used to ship `color: null`.
// It now fails, naming the file, the placeholder, and the nearest real paths.
//
// Usage: node engine/generate.mjs <runDir> <templateName> <outDir>
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { REQUIRED_ROLES } from './lib/gate.mjs';

const [runDir, template, outDir] = process.argv.slice(2);
if (!runDir || !template || !outDir) {
  console.error('usage: node engine/generate.mjs <runDir> <templateName> <outDir>');
  process.exit(2);
}
const here = dirname(fileURLToPath(import.meta.url));

const need = (p, why) => {
  if (!existsSync(p)) {
    console.error(`generate: missing ${p}\n  ${why}`);
    process.exit(1);
  }
};
need(join(runDir, 'brief.json'), 'The run needs a brief.json.');
need(join(runDir, 'tokens.json'), 'The run needs tokens.json. Run make_tokens.mjs first — it refuses to write tokens that fail the contrast gate.');
need(join(here, 'templates', template), `No template family named "${template}". Available: ${listTemplates(here)}`);

const brief = JSON.parse(readFileSync(join(runDir, 'brief.json'), 'utf8'));
const tokens = JSON.parse(readFileSync(join(runDir, 'tokens.json'), 'utf8'));

// Token completeness is a compiler invariant, so generate enforces it too.
// A template that happens not to reference a role would otherwise let an
// incomplete token set ship silently — and the next template that DID use
// that role would emit the text "null" into CSS.
const absent = REQUIRED_ROLES.filter(r => !(tokens.color && tokens.color[r]));
if (absent.length) {
  console.error(
    `generate: tokens.json is missing required colour role(s): ${absent.join(', ')}\n` +
    `  A complete token set is produced by make_tokens.mjs, which also gates every\n` +
    `  text/background pair. Do not hand-edit tokens.json.\n` +
    `  Fix: node engine/make_tokens.mjs ${runDir}`
  );
  process.exit(1);
}
const ctx = { ...tokens, brief, productsJson: JSON.stringify(brief) };

const resolve = (obj, path) => path.split('.').reduce((o, k) => (o == null ? o : o[k]), obj);

/** Suggest the closest real placeholder paths, so the error is actionable. */
const suggest = (path) => {
  const all = [];
  const walk = (o, pre) => {
    for (const [k, v] of Object.entries(o || {})) {
      const key = pre ? `${pre}.${k}` : k;
      if (v && typeof v === 'object' && !Array.isArray(v)) walk(v, key);
      else all.push(key);
    }
  };
  walk(ctx, '');
  const tail = path.split('.').pop().toLowerCase();
  const hits = all.filter(p => p.toLowerCase().includes(tail)).slice(0, 5);
  return hits.length ? `  Did you mean: ${hits.join(', ')}` : `  Known top-level keys: ${Object.keys(ctx).join(', ')}`;
};

const fill = (tpl, file) => tpl.replace(/\{\{([\w.]+)\}\}/g, (m, path) => {
  const v = resolve(ctx, path);
  if (v === undefined) {
    throw new Error(`unresolved placeholder {{${path}}} in ${file}\n  No such value in tokens.json or brief.json.${'\n'}${suggest(path)}`);
  }
  if (v === null) {
    throw new Error(
      `null placeholder {{${path}}} in ${file}\n` +
      `  The value exists but is null, which would ship the literal text "null" into the app.\n` +
      `  Fix: have the design family (engine/families/*.json) or the spec supply this role, ` +
      `or stop referencing it in the template.${'\n'}${suggest(path)}`
    );
  }
  return String(v);
});

function listTemplates(here) {
  try { return readdirSync(join(here, 'templates')).join(', '); } catch { return '(none)'; }
}

const tdir = join(here, 'templates', template);
mkdirSync(outDir, { recursive: true });
const written = [];
for (const [src, dest] of [['index.html.tmpl', 'index.html'], ['styles.css.tmpl', 'styles.css']]) {
  const sp = join(tdir, src);
  need(sp, `Template "${template}" is missing ${src}.`);
  writeFileSync(join(outDir, dest), fill(readFileSync(sp, 'utf8'), src));
  written.push(dest);
}
const jsSrc = join(tdir, 'app.js');
need(jsSrc, `Template "${template}" is missing app.js.`);
copyFileSync(jsSrc, join(outDir, 'app.js'));
written.push('app.js');

console.log(`generated ${outDir} from template "${template}" (direction: ${tokens.meta.direction}, family: ${tokens.meta.family || '?'})`);
console.log(`  files: ${written.join(', ')}`);
