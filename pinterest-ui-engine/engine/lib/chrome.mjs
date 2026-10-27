// chrome.mjs — portable Chromium/Chrome resolution.
//
// The handoff shipped `process.env.CHROME_PATH || '/opt/meta-chromium/chrome'`
// in 34 files. That default is the original developer's workspace and does
// not exist anywhere else, so on any other machine every browser stage died
// with a puppeteer stack trace that did not say what to do.
//
// Resolution order:
//   1. CHROME_PATH (explicit wins, always)
//   2. a list of conventional install locations
//   3. the first of a known set of binary names found on PATH
//
// If nothing resolves, resolveChromium() throws an Error whose message names
// CHROME_PATH and gives a copy-pasteable remedy. Nothing silently falls back
// to a wrong browser.

import { existsSync, statSync } from 'node:fs';
import { delimiter, join } from 'node:path';

// Conventional locations, in priority order. Covers Debian/Ubuntu packages,
// snap, Alpine, the meta-chromium layout the original project used, macOS,
// and Playwright/Puppeteer cache layouts.
const CANDIDATE_PATHS = [
  '/opt/meta-chromium/chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
  '/usr/local/bin/chromium',
  '/usr/local/bin/chrome',
  '/usr/local/bin/google-chrome',
  '/snap/bin/chromium',
  '/usr/lib/chromium/chromium',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
];

const CANDIDATE_NAMES = [
  'chromium', 'chromium-browser', 'google-chrome', 'google-chrome-stable',
  'chrome', 'chrome-headless-shell', 'chromium-headless-shell',
];

const isExecutable = (p) => {
  try { return existsSync(p) && statSync(p).isFile(); } catch { return false; }
};

const onPath = (name) => {
  const dirs = (process.env.PATH || '').split(delimiter).filter(Boolean);
  for (const d of dirs) {
    const p = join(d, name);
    if (isExecutable(p)) return p;
  }
  return null;
};

/**
 * Resolve a Chromium executable path, or throw with an actionable message.
 * @returns {string} absolute path to the browser binary
 */
export function resolveChromium() {
  const explicit = process.env.CHROME_PATH;
  if (explicit) {
    if (isExecutable(explicit)) return explicit;
    throw new Error(
      `CHROME_PATH is set to "${explicit}" but that is not an executable file.\n` +
      `  Fix: point CHROME_PATH at your Chromium/Chrome binary, e.g.\n` +
      `    export CHROME_PATH=/usr/bin/chromium\n` +
      `  Or unset it and let the engine search the conventional locations:\n` +
      `    unset CHROME_PATH`
    );
  }
  for (const p of CANDIDATE_PATHS) if (isExecutable(p)) return p;
  for (const n of CANDIDATE_NAMES) { const p = onPath(n); if (p) return p; }

  throw new Error(
    'No Chromium or Chrome executable found.\n' +
    '  Searched: ' + CANDIDATE_PATHS.join(', ') + '\n' +
    '  and these names on PATH: ' + CANDIDATE_NAMES.join(', ') + '\n' +
    '  Fix: install Chromium, or set CHROME_PATH explicitly:\n' +
    '    export CHROME_PATH=/path/to/chromium\n' +
    '  Browser-driven stages are: functional suites, inspect, demo.'
  );
}

/** Non-throwing variant for environment checks. */
export function probeChromium() {
  try {
    return { ok: true, path: resolveChromium() };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

// Launch args shared by every browser stage, so they cannot drift between
// the suites, the inspector and the demo runner (they had drifted: the
// functional suites carried their own copy).
//
// file:// is used deliberately: some sandboxes block loopback HTTP in
// Chromium, and the apps are static files. --allow-file-access-from-files
// is required for that.
export const LAUNCH_ARGS = [
  '--no-sandbox', '--disable-dev-shm-usage',
  '--disable-features=LocalNetworkAccessChecks,BlockInsecurePrivateNetworkRequests,PrivateNetworkAccessSendPreflights',
  '--allow-insecure-localhost', '--allow-file-access-from-files',
];

export const CHROME_PATH = () => resolveChromium();
