// art_direction.mjs — pipeline stage B: candidate art directions.
//
// Expands a design spec's palette into candidate directions using the
// corpus archetypes in engine/archetypes.json (forensics findings: committed
// field / neutral gallery / dark board). Directions are token SKETCHES with
// recorded trade-offs. A human or model selects one with --choose and a
// written rationale, which is stored in the output — the choice is never
// silent.
//
// MISSION 020 CHANGES (P1): the three archetypes used to be literals inside
// this file, including hexes. `neutral-gallery` hardcoded ground:'#FFFFFF',
// which silently overrode every spec's ground colour — that is exactly how
// CarePoint shipped a white ground while its spec asked for #F4F7FB. The
// archetypes are now data, and their sketch values are symbolic references
// resolved against the run's spec.
//
// Usage:
//   node engine/art_direction.mjs <runDir>                    -> writes directions.json
//   node engine/art_direction.mjs <runDir> --choose <id> --why "<rationale>"
//   node engine/art_direction.mjs <runDir> --list              -> prints archetype ids
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ARCHETYPES = JSON.parse(readFileSync(join(HERE, 'archetypes.json'), 'utf8')).archetypes;

const argv = process.argv.slice(2);
const runDir = argv[0];
if (!runDir) { console.error('usage: node engine/art_direction.mjs <runDir> [--choose <id> --why "…"] [--list]'); process.exit(2); }

if (argv.includes('--list')) {
  for (const a of ARCHETYPES) console.log(`${a.id}\t${a.name}`);
  process.exit(0);
}

const spec = JSON.parse(readFileSync(join(runDir, 'design-spec.json'), 'utf8'));
const p = spec.palette || {};

// Resolve a sketch value: {"from":"spec.<key>"} reads the spec palette;
// a literal string is used as-is; null stays null.
const resolveSketch = (sketch) => {
  const out = {};
  for (const [k, val] of Object.entries(sketch)) {
    if (val && typeof val === 'object' && !Array.isArray(val) && typeof val.from === 'string') {
      const key = val.from.replace(/^spec\./, '');
      out[k] = p[key] ?? null;
      if (out[k] === null) console.warn(`archetype sketch "${k}" wants spec.palette.${key}, which is absent — emitting null`);
    } else {
      out[k] = val;
    }
  }
  return out;
};

const candidates = ARCHETYPES.map(a => ({
  id: a.id,
  name: a.name,
  sketch: resolveSketch(a.sketch),
  principles: a.principles,
  tradeoffs: a.tradeoffs,
  recommendedWhen: a.recommendedWhen,
}));

const outPath = join(runDir, 'directions.json');
const chooseIdx = argv.indexOf('--choose');
if (chooseIdx === -1) {
  writeFileSync(outPath, JSON.stringify({ reference: spec.reference, candidates, selection: null }, null, 2));
  console.log(`wrote ${outPath} with ${candidates.length} candidates: ${candidates.map(c => c.id).join(', ')}`);
} else {
  const id = argv[chooseIdx + 1];
  const whyIdx = argv.indexOf('--why');
  const why = whyIdx === -1 ? '' : argv[whyIdx + 1] || '';
  const prev = JSON.parse(readFileSync(outPath, 'utf8'));
  if (!prev.candidates.some(c => c.id === id)) {
    console.error(`unknown direction: ${id}. Known: ${prev.candidates.map(c => c.id).join(', ')}`);
    process.exit(1);
  }
  prev.selection = { id, rationale: why, selectedAt: new Date().toISOString().slice(0, 10) };
  writeFileSync(outPath, JSON.stringify(prev, null, 2));
  console.log(`selected ${id}: ${why}`);
}
