// run_with_chrome.mjs — run a script with CHROME_PATH resolved for this machine.
//
// Some historical suites (slotbook-experiment/) carry their own copy of the
// browser launcher with the original workspace's hardcoded default. Those
// files are METHOD EVIDENCE and must stay byte-identical, so instead of
// editing them we resolve Chromium here and pass it down via CHROME_PATH.
//
// Usage: node engine/tools/run_with_chrome.mjs <script> [args...]
import { spawnSync } from 'node:child_process';
import { resolveChromium } from '../lib/chrome.mjs';

const [script, ...args] = process.argv.slice(2);
if (!script) { console.error('usage: node engine/tools/run_with_chrome.mjs <script> [args...]'); process.exit(2); }

let chrome;
try { chrome = resolveChromium(); }
catch (e) { console.error(e.message); process.exit(1); }

const r = spawnSync(process.execPath, [script, ...args], {
  stdio: 'inherit',
  env: { ...process.env, CHROME_PATH: chrome },
});
process.exit(r.status ?? 1);
