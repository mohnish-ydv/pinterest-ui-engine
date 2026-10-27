// inspect_states.mjs — flow-independent state coverage for any app implementing an IR's contract.
//
// Usage: node engine/inspect_states.mjs <appDir> <layout.json> [outDir]
//
// The state list comes from the IR, so the same run can measure the generated
// app and a hand-authored baseline that implements the same contract — which
// is exactly what Mission 023's contract could not do.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { measureStates, summariseStates } from './capability/states.mjs';

const [appDir, layoutPath, outDir] = process.argv.slice(2);
if (!appDir || !layoutPath) {
  console.error('usage: node engine/inspect_states.mjs <appDir> <layout.json> [outDir]');
  process.exit(2);
}
const ir = JSON.parse(readFileSync(layoutPath, 'utf8'));
const rep = await measureStates(appDir, ir);
console.log(summariseStates(rep));
if (outDir) {
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, 'states.json'), JSON.stringify(rep, null, 2) + '\n');
}
process.exit(rep.counts.failed ? 1 : 0);
