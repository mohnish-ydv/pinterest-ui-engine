// evidence.mjs — one inspectable artefact of what a reference actually shows.
//
// MISSION 025, Phase 3. Before this, the reference pipeline measured colour
// and inferred everything else from a three-way archetype. This combines the
// structural extractor (structure.py) with the colour measurements and — the
// important part — separates what was OBSERVED from what was INFERRED and what
// is simply UNKNOWABLE from one flat image.
//
// Usage: node engine/reference/evidence.mjs <image> [--out <dir>]
import { execFileSync } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ENGINE = join(HERE, '..');
const [image, ...rest] = process.argv.slice(2);
if (!image) { console.error('usage: node engine/reference/evidence.mjs <image> [--out <dir>]'); process.exit(2); }
const outIdx = rest.indexOf('--out');
const outDir = outIdx !== -1 ? rest[outIdx + 1] : null;

const structural = JSON.parse(execFileSync('python3', [join(HERE, 'structure.py'), image], { encoding: 'utf8' }));

// the existing colour measurements, kept as their own evidence source
let colour = null;
try {
  const raw = execFileSync('python3', [join(ENGINE, 'analyze_image.py'), image], { encoding: 'utf8' });
  colour = JSON.parse(raw);
} catch (e) { /* reported below */ }

const evidence = {
  evidenceVersion: '1.0.0',
  image,
  canvas: structural.canvas,
  observed: {
    note: 'Measured from pixels. These are facts about the image.',
    ...structural.observed,
    colour: colour ? {
      sampledPx: colour.sampled_px,
      satGe025Pct: colour['sat_ge_0.25_pct'],
      satGe003Pct: colour['sat_ge_0.03_pct'],
      modalHueDeg: colour.modal_hue_bin_deg,
      hueFamilySharePct: colour.hue_family_share_of_coloured_pct,
      topClusters: (colour.clusters || []).slice(0, 12),
    } : null,
  },
  inferred: {
    note: 'Derived by a stated rule from the observed values. Each entry names its basis.',
    ...structural.inferred,
  },
  unknowable: structural.unknowable,
  limitations: [
    structural.observed.segmentationConfidence === 'low'
      ? 'This image is a tall collage of several screens; band segmentation is approximate and should not be read as one page layout.'
      : null,
    colour ? null : 'analyze_image.py produced no colour measurement for this file.',
    'Absolute spacing, font identity and interaction states cannot be recovered from a static board.',
  ].filter(Boolean),
};

const text = JSON.stringify(evidence, null, 2) + '\n';
if (outDir) { mkdirSync(outDir, { recursive: true }); writeFileSync(join(outDir, 'reference-evidence.json'), text); }

const o = evidence.observed, i = evidence.inferred;
console.log(`reference evidence — ${basename(image)}`);
console.log(`  observed : ${o.bandCount} bands (confidence ${o.segmentationConfidence}), ${o.whitespacePct}% whitespace, edge ${o.edgeDensity}`);
if (evidence.observed.colour) console.log(`             ${evidence.observed.colour.satGe025Pct}% saturated, modal hue ${evidence.observed.colour.modalHueDeg}deg`);
console.log(`  inferred : layout=${i.layoutPattern.value} density=${i.density.value} detail=${i.detail.value} register=${i.paletteRegister.value}`);
console.log(`  unknowable: ${evidence.unknowable.length} properties, listed rather than guessed`);
for (const l of evidence.limitations) console.log(`  ! ${l}`);
