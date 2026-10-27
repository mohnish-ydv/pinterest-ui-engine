// verify_env.mjs — check the environment before anything else runs.
//
// Mission 020 (P0.3/P0.4). The handoff's setup was four prose steps, and a
// wrong Chromium path produced a puppeteer stack trace that named neither
// CHROME_PATH nor a remedy. This prints a checklist and exits non-zero with
// the specific fix for whatever is missing.
//
// Usage: node engine/verify_env.mjs
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { probeChromium } from './lib/chrome.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..', '..');

const rows = [];
const add = (name, ok, detail, fix) => rows.push({ name, ok, detail, fix });

// Node
const major = Number(process.versions.node.split('.')[0]);
add('Node.js >= 20', major >= 20, `v${process.versions.node}`, 'Install Node 20 or newer.');

// puppeteer-core resolvable from the package root
let puppeteerOK = false, puppeteerDetail = 'not resolvable';
try {
  const p = join(ROOT, 'node_modules', 'puppeteer-core', 'package.json');
  puppeteerOK = existsSync(p);
  if (puppeteerOK) puppeteerDetail = 'puppeteer-core ' + JSON.parse(readFileSync(p, 'utf8')).version;
} catch (e) { puppeteerDetail = e.message; }
add('puppeteer-core installed', puppeteerOK, puppeteerDetail, 'Run: npm install   (at the package root)');

// Chromium
const chrome = probeChromium();
add('Chromium/Chrome found', chrome.ok, chrome.ok ? chrome.path : 'not found', 'Install Chromium, or: export CHROME_PATH=/path/to/chromium');

// Python + Pillow (needed only by the reference analysis stage)
let pyOK = false, pyDetail = 'not found';
try {
  pyDetail = execFileSync('python3', ['-c', 'import PIL,sys;print("Pillow "+PIL.__version__)'], { encoding: 'utf8' }).trim();
  pyOK = true;
} catch (e) {
  pyDetail = String(e.stderr || e.message).split('\n')[0].slice(0, 80);
}
add('Python 3 + Pillow', pyOK, pyDetail, 'Run: pip install -r requirements.txt   (reference analysis only; the rest works without it)');

// vendored axe-core
const axe = join(ROOT, 'vendor', 'axe-core', 'axe.min.js');
add('axe-core vendored', existsSync(axe), existsSync(axe) ? 'vendor/axe-core/axe.min.js' : 'missing', 'Restore vendor/axe-core/ from the archive.');

// engine modules load (catches a broken import without needing a browser)
let modsOK = true, modsDetail = 'ok';
try {
  await import('./lib/color.mjs');
  await import('./lib/gate.mjs');
  await import('./lib/family.mjs');
  await import('./lib/contract.mjs');
} catch (e) { modsOK = false; modsDetail = String(e.message).slice(0, 120); }
add('engine modules load', modsOK, modsDetail, 'The source tree is incomplete; re-extract the package.');

const pad = Math.max(...rows.map(r => r.name.length));
console.log('\nENVIRONMENT\n');
for (const r of rows) {
  console.log(`  ${r.ok ? 'OK  ' : 'FAIL'}  ${r.name.padEnd(pad)}  ${r.detail}`);
}
const failed = rows.filter(r => !r.ok);
// Pillow is a soft requirement: only the reference-analysis stage needs it.
const hardFailed = failed.filter(r => r.name !== 'Python 3 + Pillow');

if (failed.length) {
  console.log('\nTo fix:');
  for (const r of failed) console.log(`  - ${r.name}: ${r.fix}`);
}
if (hardFailed.length) {
  console.log(`\nENV RESULT: ${hardFailed.length} blocking problem(s). Browser-driven stages will not run.`);
  process.exit(1);
}
console.log(`\nENV RESULT: ready${failed.length ? ' (Pillow missing — reference analysis unavailable, everything else runs)' : ''}`);
