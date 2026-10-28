#!/usr/bin/env node
// app_readiness.mjs — M051: is a generated app actually an APP?
//
// The engine has always generated a manifest and icons (M038), but until
// M051 nothing checked the whole installability/offline contract in one
// place, and no service worker existed at all. This tool audits a
// generated app directory against that contract and prints one PASS/GAP
// line per item:
//
//   node engine/tools/app_readiness.mjs <appDir> [--json]
//
// Exit code: 0 when every item passes, 1 when any item is a GAP,
// 2 on usage errors. Pure Node stdlib; no browser, no network.
import { existsSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const args = process.argv.slice(2);
const json = args.includes('--json');
const appDir = args.find(a => !a.startsWith('--'));
if (!appDir) {
  console.error('usage: node engine/tools/app_readiness.mjs <appDir> [--json]');
  process.exit(2);
}
if (!existsSync(appDir)) {
  console.error(`app_readiness: ${appDir} does not exist`);
  process.exit(2);
}

const results = [];
const check = (id, ok, detail = '') => results.push({ id, status: ok ? 'PASS' : 'GAP', detail });

const read = (name) => {
  const p = join(appDir, name);
  return existsSync(p) ? readFileSync(p, 'utf8') : null;
};
const nonEmpty = (name) => {
  const p = join(appDir, name);
  return existsSync(p) && statSync(p).size > 0;
};

// PNG IHDR dimensions (bytes 16..24, big-endian) — verify an icon file is
// really the size the manifest claims, not just present.
const pngSize = (name) => {
  const p = join(appDir, name);
  if (!existsSync(p)) return null;
  const buf = readFileSync(p);
  if (buf.length < 24 || buf.toString('ascii', 1, 4) !== 'PNG') return null;
  return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
};

// ---- shell ---------------------------------------------------------------
const html = read('index.html');
check('index.html present', !!html);
if (html) {
  check('index.html links the web manifest', /rel=["']manifest["']/.test(html) && html.includes('manifest.webmanifest'));
  check('index.html carries a theme-color meta', /name=["']theme-color["']/.test(html));
  check('service worker registered from index.html',
    html.includes('serviceWorker') && html.includes('sw.js'),
    html.includes('serviceWorker') ? '' : 'no registration snippet found');
}
for (const f of ['styles.css', 'app.js', 'data.js']) {
  check(`${f} present and non-empty`, nonEmpty(f));
}

// ---- manifest --------------------------------------------------------------
let manifest = null;
const mfRaw = read('manifest.webmanifest');
check('manifest.webmanifest present', !!mfRaw);
if (mfRaw) {
  try { manifest = JSON.parse(mfRaw); } catch (e) {
    check('manifest.webmanifest is valid JSON', false, e.message);
  }
}
if (manifest) {
  check('manifest.name present', typeof manifest.name === 'string' && manifest.name.length > 0, manifest.name || '');
  check('manifest.short_name present', typeof manifest.short_name === 'string' && manifest.short_name.length > 0, manifest.short_name || '');
  check('manifest.display is standalone', manifest.display === 'standalone', String(manifest.display || '(missing)'));
  check('manifest.theme_color present', typeof manifest.theme_color === 'string' && manifest.theme_color.length > 0, manifest.theme_color || '');
  check('manifest.background_color present', typeof manifest.background_color === 'string' && manifest.background_color.length > 0, manifest.background_color || '');
  check('manifest.start_url present', typeof manifest.start_url === 'string' && manifest.start_url.length > 0, manifest.start_url || '');

  const icons = Array.isArray(manifest.icons) ? manifest.icons : [];
  const hasSize = (s) => icons.some(i => String(i.sizes || '').split(/\s+/).includes(s));
  check('manifest declares a 192x192 icon', hasSize('192x192'));
  check('manifest declares a 512x512 icon', hasSize('512x512'));
  for (const icon of icons) {
    const src = String(icon.src || '');
    if (!src) { check('manifest icon has a src', false); continue; }
    check(`icon file exists: ${src}`, existsSync(join(appDir, src)));
    const declared = String(icon.sizes || '').match(/^(\d+)x(\d+)$/);
    if (declared && existsSync(join(appDir, src))) {
      const actual = pngSize(src);
      check(`icon ${src} is really ${declared[1]}x${declared[2]}`,
        !!actual && actual.w === Number(declared[1]) && actual.h === Number(declared[2]),
        actual ? `actual ${actual.w}x${actual.h}` : 'not a readable PNG');
    }
  }
}

// ---- service worker ----------------------------------------------------------
const sw = read('sw.js');
check('sw.js present', !!sw);
if (sw) {
  check('sw.js declares a versioned cache name', /const CACHE\s*=\s*['"][^'"]+['"]/.test(sw));
  check('sw.js installs a precache (install listener)', sw.includes("addEventListener('install'") || sw.includes('addEventListener("install"'));
  check('sw.js cleans old caches (activate listener)', sw.includes("addEventListener('activate'") || sw.includes('addEventListener("activate"'));
  check('sw.js intercepts fetches (fetch listener)', sw.includes("addEventListener('fetch'") || sw.includes('addEventListener("fetch"'));
  for (const asset of ['index.html', 'styles.css', 'app.js', 'data.js', 'manifest.webmanifest']) {
    check(`sw.js precaches ${asset}`, sw.includes(asset));
  }
  check('sw.js has a navigation fallback to index.html',
    sw.includes('navigate') && sw.includes('index.html'));
}

// ---- report -------------------------------------------------------------------
const gaps = results.filter(r => r.status === 'GAP');
if (json) {
  console.log(JSON.stringify({ appDir, pass: results.length - gaps.length, gap: gaps.length, results }, null, 2));
} else {
  console.log(`APP READINESS  ${appDir}`);
  for (const r of results) {
    console.log(`  ${r.status.padEnd(4)}  ${r.id}${r.detail ? `  — ${r.detail}` : ''}`);
  }
  console.log(`\n  ${results.length - gaps.length}/${results.length} PASS${gaps.length ? `, ${gaps.length} GAP(s)` : ''}`);
}
process.exit(gaps.length ? 1 : 0);
