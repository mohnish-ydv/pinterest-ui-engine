#!/usr/bin/env node
// base_compliance.mjs — Mission 050, Workstream A.
//
// Honest DOM/text compliance check of a generated app against the BASE
// reference (reference/base/base_reference.json, synthesised from the 15
// decoded Pinterest boards + the Evira pattern library in reference/base/).
//
//   node base_compliance.mjs <appDir> <briefJson> [--screens type,type]
//
// What it does, and what it does NOT do:
//  - It determines which canonical screen types the brief PLANS, using the
//    `declarations` mapping in base_reference.json:
//      key:<k>        brief has top-level key <k> (truthy)
//      req:/re/i      some brief.requirements[] sentence matches
//      items:<f>      some brief.collection.items[] entry carries <f>
//    Screens with empty declarations cannot be produced by any brief key
//    in the current engine; they are reported SKIP unless forced.
//  - With --screens a,b,c those types are checked regardless of planning.
//  - For each checked screen it looks for the required anatomy markers in
//    the app's own files. This is a text/DOM-marker check, NOT a
//    fulfilment score and NOT a visual check: PASS means "the markers
//    the board anatomy requires are present in the generated files".
//  - Marker scopes (see base_reference.json "markerSyntax"):
//      plain     any text file under appDir
//      app:      app.js / index.html / styles.css only
//      data:     data.js only — the compiled layout+model. This scope
//                matters: app.js embeds the whole runtime (every family
//                renderer) whether or not the brief planned that family,
//                so an app.js-only check would PASS unplanned screens.
//      re:       after a scope prefix, the rest is a regular expression.
//
// Output: one line per canonical screen —
//   PASS <type>
//   GAP <type>: missing <marker>[, <marker>...]
//   SKIP <type> (not planned by brief)
// Exit code: 1 if any checked (planned or forced) screen has a GAP, else 0.
// Exit code: 2 on usage / unreadable inputs.

import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const args = process.argv.slice(2);
const positional = args.filter(a => !a.startsWith('--'));
const screensArg = args.find(a => a.startsWith('--screens='))
  || (args.includes('--screens') ? args[args.indexOf('--screens') + 1] : null);
if (positional.length < 2) {
  console.error('usage: node base_compliance.mjs <appDir> <briefJson> [--screens type,type]');
  process.exit(2);
}
const [appDir, briefPath] = positional;
if (!existsSync(appDir)) { console.error(`appDir not found: ${appDir}`); process.exit(2); }

const here = dirname(fileURLToPath(import.meta.url));
const basePath = join(here, '..', '..', 'reference', 'base', 'base_reference.json');
let base, brief;
try { base = JSON.parse(readFileSync(basePath, 'utf8')); }
catch (e) { console.error(`cannot read base reference ${basePath}: ${e.message}`); process.exit(2); }
try { brief = JSON.parse(readFileSync(briefPath, 'utf8')); }
catch (e) { console.error(`cannot read brief ${briefPath}: ${e.message}`); process.exit(2); }

// ---- collect app text -------------------------------------------------------
const TEXT_EXT = new Set(['.html', '.js', '.css', '.json', '.webmanifest', '.md', '.txt']);
function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (TEXT_EXT.has(extname(name))) out.push(p);
  }
  return out;
}
const files = walk(appDir);
const read = name => {
  const p = join(appDir, name);
  return existsSync(p) ? readFileSync(p, 'utf8') : '';
};
const corpusAll = files.map(f => { try { return readFileSync(f, 'utf8'); } catch { return ''; } }).join('\n');
const corpusApp = ['index.html', 'app.js', 'styles.css'].map(read).join('\n');
const corpusData = read('data.js');
const CORPORA = { all: corpusAll, app: corpusApp, data: corpusData };

function markerFound(marker) {
  let scope = 'all', body = marker;
  const m = marker.match(/^(app|data):(.*)$/s);
  if (m) { scope = m[1]; body = m[2]; }
  const corpus = CORPORA[scope];
  if (body.startsWith('re:')) {
    try { return new RegExp(body.slice(3)).test(corpus); }
    catch { return false; }
  }
  return corpus.includes(body);
}

// ---- planning ---------------------------------------------------------------
const reqs = Array.isArray(brief.requirements) ? brief.requirements : [];
const items = (brief.collection && Array.isArray(brief.collection.items)) ? brief.collection.items : [];
function plannedBy(decl) {
  if (decl.startsWith('key:')) {
    const v = brief[decl.slice(4)];
    return v !== undefined && v !== null && v !== false && v !== '' && !(Array.isArray(v) && !v.length);
  }
  if (decl.startsWith('req:')) {
    const m = decl.slice(4).match(/^\/(.+)\/([a-z]*)$/s);
    if (!m) return false;
    let re; try { re = new RegExp(m[1], m[2]); } catch { return false; }
    return reqs.some(r => re.test(String(r)));
  }
  if (decl.startsWith('items:')) {
    const f = decl.slice(6);
    return items.some(it => it && it[f] !== undefined && it[f] !== null && !(Array.isArray(it[f]) && !it[f].length));
  }
  return false;
}

const forced = screensArg ? screensArg.split(',').map(s => s.trim()).filter(Boolean) : null;
let gaps = 0, checked = 0;
for (const screen of base.screens) {
  const isForced = forced ? forced.includes(screen.type) : false;
  if (forced && !isForced) continue;
  const planned = (screen.declarations || []).some(plannedBy);
  if (!planned && !isForced) {
    console.log(`SKIP ${screen.type} (not planned by brief)`);
    continue;
  }
  checked++;
  const missing = (screen.anatomy || []).filter(mk => !markerFound(mk));
  if (missing.length) {
    gaps++;
    console.log(`GAP ${screen.type}: missing ${missing.join(', ')}`);
  } else {
    console.log(`PASS ${screen.type}`);
  }
}
if (forced) {
  for (const t of forced) {
    if (!base.screens.some(s => s.type === t)) console.log(`GAP ${t}: unknown screen type (not in base_reference.json)`);
  }
}
console.log(`# base-compliance: ${checked} checked, ${gaps} gap(s), base ${base.version}`);
process.exit(gaps ? 1 : 0);
