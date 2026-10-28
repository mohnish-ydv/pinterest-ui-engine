#!/usr/bin/env node
// run.mjs — one command: a product brief becomes a working application.
//
// The engine's pipeline is five stages. This wrapper runs them in order and
// stops at the first failure, so the caller never sees a half-built app that
// looks finished.
//
//   node engine/run.mjs <caseDir>
//
// <caseDir> must contain product-brief.json. Everything else is produced.
// A reference image is OPTIONAL: place reference-evidence.json beside the brief
// to let a visual reference inform composition and palette.

import { existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { deriveBrief } from './intake/derive.mjs';
import { doctorSummary } from './intake/brief_doctor.mjs';

const ENGINE = dirname(fileURLToPath(import.meta.url));
const dir = process.argv[2];
if (!dir) { console.error('usage: node engine/run.mjs <caseDir>'); process.exit(2); }
if (!existsSync(join(dir, 'product-brief.json'))) {
  console.error(`run: ${dir}/product-brief.json not found — a product brief is the only required input.`);
  process.exit(2);
}

const step = (label, file, args) => {
  const r = spawnSync(process.execPath, [join(ENGINE, file), ...args], { encoding: 'utf8' });
  const out = (r.stdout || '') + (r.stderr || '');
  if (r.status !== 0) {
    console.error(`\n✗ ${label} failed\n${out.trim()}`);
    process.exit(r.status || 1);
  }
  console.log(`✓ ${label}`);
  return out;
};

// 1. brief -> semantic model, scopes, composition, transfer decisions.
//    derive.mjs is a library, not a CLI: this calls the engine's own function.
{
  const product = JSON.parse(readFileSync(join(dir, 'product-brief.json'), 'utf8'));
  let evidence = null;
  try { evidence = JSON.parse(readFileSync(join(dir, 'reference-evidence.json'), 'utf8')); } catch { /* no reference */ }
  // M047: the intake doctor reads the drafted brief before anything
  // is built and names the decisions it never made (see INTAKE.md).
  // Notes only — generation proceeds; the gaps are the author's to fix.
  try {
    const doc = doctorSummary(product);
    for (const f of doc.findings.slice(0, 8)) {
      console.log(`  intake ${f.level}: [${f.qid}] ${f.message}`);
    }
    if (doc.findings.length > 8) console.log(`  intake: …and ${doc.findings.length - 8} more`);
  } catch { /* the doctor never blocks generation */ }
  const brief = deriveBrief(product, evidence);
  writeFileSync(join(dir, 'brief.json'), JSON.stringify(brief, null, 2) + '\n');
  const sc = brief._derived?.scoped?.counts || {};
  const tr = brief._derived?.transfer;
  console.log(`✓ derive  (semantics, scopes, composition)`);
  console.log(`          composition ${brief._derived?.compositionRationale?.composition || '?'}` +
    `, ${sc.total || 0} scoped requirements` +
    (tr ? `, reference ${tr.summary ? `transferred ${tr.summary.transferred}, adapted ${tr.summary.adapted}, rejected ${tr.summary.rejected}` : 'assessed'}` : ', no reference supplied'));
}

// 2. reference evidence -> design spec and family (works with no reference)
step('spec    (palette, type scale, density policy)', 'intake/derive_spec.mjs', [dir]);

// 3. art direction: pick the direction the reference recommends, else the default
let recommended = 'neutral-gallery';
try {
  const prof = JSON.parse(readFileSync(join(dir, 'reference-profile.json'), 'utf8'));
  recommended = prof.recommendation.recommended;
} catch { /* no reference: the default direction is correct */ }
// art_direction runs twice by design: once to write the candidate set, once to
// select from it. Calling only the second form fails on a missing file.
step('direct  (candidate directions)', 'art_direction.mjs', [dir]);
step('direct  (selection)', 'art_direction.mjs',
  [dir, '--choose', recommended, '--why', 'recommended by the reference profile, or the default when none was supplied']);

// 4. tokens, through the contrast gate — it refuses to write illegible colours
step('tokens  (gated for contrast)', 'make_tokens.mjs', [dir]);

// 5. plan -> IR -> compiled application
const built = step('build   (plan, compile, verify contract)', 'build_app.mjs', [dir]);

const brief = JSON.parse(readFileSync(join(dir, 'brief.json'), 'utf8'));
const comp = brief._derived?.compositionRationale?.composition || '?';
const dens = (() => { try { return JSON.parse(readFileSync(join(dir, 'design-spec.json'), 'utf8'))._derived?.density?.mode; } catch { return '?'; } })();
console.log(`\napp:        ${join(dir, 'app', 'index.html')}`);
console.log(`composition ${comp}   density ${dens}`);
const fulfilPath = join(dir, 'fulfilment.json');
if (existsSync(fulfilPath)) {
  const f = JSON.parse(readFileSync(fulfilPath, 'utf8'));
  console.log(`fulfilment  ${f.passes}/${f.total} satisfied` + (f.blocking.length ? `  — ${f.blocking.length} blocking` : ''));
}
