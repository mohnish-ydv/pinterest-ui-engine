// inspect2.mjs — DEPRECATED (Mission 020).
//
// The CarePoint run's bespoke inspector. Its logic now lives in the engine as
// engine/inspect.mjs, driven by inspect.contract.json, so that ONE inspector
// works on any app (engine output or baseline). This file remains only so the
// historical command in INDUS_HANDOFF.md §4 still runs.
//
// Prefer:  node engine/inspect.mjs <appDir> runs/carepoint/inspect.contract.json <outDir>
//
// Usage (unchanged): node runs/carepoint/inspect2.mjs <appDir> <outDir>
import { spawnSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const [appDir, outDir] = process.argv.slice(2);
if (!appDir || !outDir) {
  console.error('usage: node runs/carepoint/inspect2.mjs <appDir> <outDir>');
  process.exit(2);
}
console.error('inspect2.mjs is deprecated; delegating to engine/inspect.mjs with the run contract.');
const r = spawnSync(process.execPath, [
  join(here, '..', '..', 'engine', 'inspect.mjs'),
  resolve(appDir),
  join(here, 'inspect.contract.json'),
  resolve(outDir),
], { stdio: 'inherit' });
process.exit(r.status ?? 1);
