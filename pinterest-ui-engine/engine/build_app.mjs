// build_app.mjs — one command: brief + reference -> a working, gated app.
//
// MISSION 021. The pipeline the mission asks for, end to end:
//
//   reference analysis -> design spec -> direction -> tokens -> LAYOUT PLAN
//   -> layout IR -> compiled app -> derived test plan -> derived inspect contract
//
// Nothing here is app-specific. Point it at a run directory containing
// brief.json, design-spec.json and a directions.json with a selection, and it
// produces a runnable app plus its own quality gates.
//
// Usage: node engine/build_app.mjs <runDir> [--out <dir>] [--quiet]
import { writeFileSync, readFileSync, existsSync, mkdirSync, copyFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { planApp } from './layout/plan.mjs';
import { compileApp } from './layout/compile.mjs';
import { preflight, formatReport } from './capability/preflight.mjs';
import { compileIntent } from './intent/compile.mjs';
import { validateIR, summarise as summariseViolations } from './intent/enforce.mjs';
import { resolveFulfilment, summariseFulfilment } from './layout/fulfil.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);
const runDir = argv[0];
const quiet = argv.includes('--quiet');
const outIdx = argv.indexOf('--out');
const outDir = outIdx !== -1 ? argv[outIdx + 1] : join(runDir, 'app');

if (!runDir) {
  console.error('usage: node engine/build_app.mjs <runDir> [--out <dir>]');
  process.exit(2);
}

const fail = (m) => { console.error('build_app: ' + m); process.exit(1); };
const readJson = (p, why) => {
  if (!existsSync(p)) fail(`missing ${p}\n  ${why}`);
  try { return JSON.parse(readFileSync(p, 'utf8')); }
  catch (e) { fail(`${p} is not valid JSON — ${e.message}`); }
};

const brief = readJson(join(runDir, 'brief.json'), 'A generated app needs a brief with an entity model. See mission021/LAYOUT_SCHEMA.md.');
const tokens = readJson(join(runDir, 'tokens.json'), 'Run make_tokens.mjs first — it refuses to write tokens that fail the contrast gate.');
const profilePath = join(runDir, 'reference-profile.json');
const profile = existsSync(profilePath) ? JSON.parse(readFileSync(profilePath, 'utf8')).profile : null;

// ---- 0a. compile design intent -------------------------------------------
// MISSION 026: the spec's composition, grammar and imagery fields were read by
// nothing. They are compiled into constraints here, and enforced below.
const spec = existsSync(join(runDir, 'design-spec.json'))
  ? JSON.parse(readFileSync(join(runDir, 'design-spec.json'), 'utf8')) : {};
const intentRes = compileIntent(brief, spec);
writeFileSync(join(runDir, 'intent-report.json'), JSON.stringify(intentRes, null, 2) + '\n');
if (intentRes.conflicts.length) {
  console.error('design intent: the brief and the spec cannot both be honoured:');
  for (const c of intentRes.conflicts) {
    console.error(`  ${c.severity.toUpperCase()} ${c.id}: ${c.statement}`);
    console.error(`     ${c.resolution}`);
  }
  console.error('\nbuild_app: refusing to generate — resolve the conflict rather than dropping a requirement.');
  if (!process.argv.includes('--allow-partial')) process.exit(3);
  console.error('  --allow-partial given: generating with the conflict recorded.');
}
if (intentRes.uncompiled.length) {
  console.error('design intent: instructions that could not be compiled into constraints:');
  for (const u of intentRes.uncompiled) console.error(`  ${u.field} = ${JSON.stringify(u.value)} — ${u.reason}`);
}

// ---- 0. capability preflight --------------------------------------------
// MISSION 024: this runs BEFORE planning. If the brief needs something the
// engine cannot express, it must say so and stop — never quietly ship a
// plausible but incomplete interface.
const caseId = brief.caseId || runDir.replace(/[\\/]+$/, '').split(/[\\/]/).pop();
const pf = preflight(caseId, brief, { runtimePath: join(HERE, 'runtime', 'runtime.js') });
writeFileSync(join(runDir, 'capability-report.json'), JSON.stringify(pf, null, 2) + '\n');
const allowPartial = process.argv.includes('--allow-partial');
if (pf.decision === 'stop') {
  console.error(formatReport(pf));
  console.error('');
  console.error('build_app: refusing to generate — the brief requires capability the engine does not have.');
  console.error('  Options: (a) add the missing capability, (b) drop or downgrade the requirement in the brief,');
  console.error('           (c) re-run with --allow-partial to generate anyway with the limitation recorded.');
  if (!allowPartial) process.exit(2);
  console.error('  --allow-partial given: generating with the limitation recorded in capability-report.json.');
} else if (pf.risks.length) {
  console.error(formatReport(pf));
}

// ---- 1. plan ------------------------------------------------------------
let ir;
try {
  ir = planApp(brief, profile, {
    intent: { composition: intentRes.composition, source: intentRes.constraints.find(c => c.kind === 'composition')?.source },
  });
} catch (e) {
  fail('layout planning failed:\n' + e.message);
}
writeFileSync(join(runDir, 'layout.json'), JSON.stringify(ir, null, 2));

// ---- 1a. requirement fulfilment against renderer capability -------------
// MISSION 031: a requirement planned is not a requirement rendered. Every
// mandatory requirement resolves to A (native), B (introduced region) or C
// (explicit failure). Unsupported and contradictory block the build.
const fulfilment = resolveFulfilment({ brief, ir, scoped: (brief._derived && brief._derived.scoped) || { requirements: [], contradictions: [] } });
writeFileSync(join(runDir, 'fulfilment.json'), JSON.stringify(fulfilment, null, 2) + '\n');
if (fulfilment.blocking.length) {
  console.error('\n' + summariseFulfilment(fulfilment));
  const contradictions = fulfilment.blocking.filter(o => o.outcome === 'contradictory');
  const unsupported = fulfilment.blocking.filter(o => o.outcome === 'unsupported');
  console.error(`\nbuild_app: ${contradictions.length} contradictory and ${unsupported.length} unsupported mandatory requirement(s).`);
  for (const o of contradictions) {
    console.error(`  CONTRADICTORY ${o.subject}: ${o.statement}`);
    for (const src of (o.sources || [])) console.error(`     "${src.text.slice(0, 70)}" demands ${src.demands}`);
  }
  for (const o of unsupported) console.error(`  UNSUPPORTED ${o.subject}: ${o.detail}${o.action ? '\n     → ' + o.action : ''}`);
  console.error('  A requirement that cannot be fulfilled must fail the build, not ship as a plausible page.');
  if (!process.argv.includes('--allow-partial')) process.exit(5);
  console.error('  --allow-partial given: generating with the failure recorded in fulfilment.json.');
} else if (fulfilment.counts.unsupported || fulfilment.counts.contradictory) {
  console.error(summariseFulfilment(fulfilment));
}

// ---- 1b. enforce the compiled constraints against the plan --------------
const irViolations = validateIR(intentRes.constraints, ir, brief);
if (irViolations.length) {
  console.error('\n' + summariseViolations(irViolations));
  const hard = irViolations.filter(v => v.hardness === 'hard');
  if (hard.length && !process.argv.includes('--allow-partial')) {
    console.error('\nbuild_app: refusing to render — the plan violates a hard design constraint.');
    console.error('  A constraint must be satisfied or fail loudly; it must not degrade into what it forbade.');
    process.exit(4);
  }
}
if (!quiet) {
  console.log(`PLAN  ${brief.brand}  (domain: ${ir.meta.domain}, density: ${ir.meta.density} — ${ir.meta.densityBasis})`);
  console.log(`      navigation: ${ir.navigation.pattern} (${ir.navigation.basis})`);
  for (const v of ir.views) {
    console.log(`      view "${v.id}": ${v.sections.map(s => s.component).join(' -> ')}`);
  }
}

// ---- 2. compile ---------------------------------------------------------
let built;
try {
  built = compileApp({ brief, tokens, ir, outDir, composition: intentRes && intentRes.composition });
} catch (e) {
  fail('compilation failed:\n' + e.message);
}

// M040: record and promo images the brief declares are bundled into
// the app (a local path is copied from the case folder; a URL is left
// as declared). A missing file is a note, not a failure — the runtime
// falls back to its substituted media.
try {
  const wanted = new Set();
  for (const r of brief.entity?.records || []) {
    if (r.image) wanted.add(r.image);
    // M046: a record's photo set (the detail carousel) bundles too.
    if (Array.isArray(r.images)) for (const im of r.images) if (im) wanted.add(im);
  }
  if (brief.promo?.image) wanted.add(brief.promo.image);
  // M046: onboarding slide photography bundles like any other image.
  for (const sl of brief.onboarding?.slides || []) if (sl.image) wanted.add(sl.image);
  let copied = 0;
  for (const rel of wanted) {
    if (/^https?:\/\//i.test(rel)) continue;
    const src = join(runDir, rel);
    const dst = join(outDir, rel);
    if (existsSync(src)) { mkdirSync(join(dst, '..'), { recursive: true }); copyFileSync(src, dst); copied++; }
    else if (!quiet) console.log(`      note: declared image not found, media falls back: ${rel}`);
  }
  if (copied && !quiet) console.log(`      ${copied} declared image(s) bundled`);
} catch { /* images are best-effort */ }

// M038: app icons for the web manifest — the brand mark (initials on the
// brand colour, the same mark the header draws) as PNGs. Best-effort:
// without PIL the build still succeeds and the manifest's icon entries
// are removed rather than left pointing at files that do not exist.
// M051: compile.mjs also emits sw.js (offline app shell) into every app;
// its precache tolerates the missing icons via per-asset allSettled.
// App-readiness of the output is checkable with:
//   node engine/tools/app_readiness.mjs <appDir>
try {
  const initials = String(brief.brand || 'A').split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase();
  const script = [
    'import sys',
    'from PIL import Image, ImageDraw, ImageFont',
    'bg, fg, text, out = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4]',
    'for size in (192, 512):',
    '    im = Image.new("RGB", (size, size), bg)',
    '    d = ImageDraw.Draw(im)',
    '    try: font = ImageFont.truetype("DejaVuSans-Bold.ttf", int(size * 0.42))',
    '    except Exception: font = ImageFont.load_default()',
    '    box = d.textbbox((0, 0), text, font=font)',
    '    d.text(((size - (box[2] - box[0])) / 2 - box[0], (size - (box[3] - box[1])) / 2 - box[1]), text, fill=fg, font=font)',
    '    im.save(f"{out}/icon-{size}.png")',
  ].join('\n');
  execFileSync('python3', ['-c', script,
    (tokens.color && tokens.color.brand) || '#333333',
    (tokens.color && tokens.color.onBrand) || '#FFFFFF',
    initials, outDir], { stdio: 'pipe' });
  if (!quiet) console.log('      app icons written (icon-192.png, icon-512.png)');
} catch {
  try {
    const mf = JSON.parse(readFileSync(join(outDir, 'manifest.webmanifest'), 'utf8'));
    delete mf.icons;
    writeFileSync(join(outDir, 'manifest.webmanifest'), JSON.stringify(mf, null, 2));
    if (!quiet) console.log('      note: PIL unavailable — manifest written without icons');
  } catch { /* manifest rewrite is best-effort too */ }
}
if (!quiet) {
  console.log(`\nBUILD ${outDir}`);
  for (const [f, h] of Object.entries(built.files)) console.log(`      ${f.padEnd(16)} ${h}`);
  console.log(`      components used: ${built.counts.components.join(', ')}`);
  console.log(`      sections: ${built.counts.sections} across ${built.counts.views} views`);
  console.log(`\n      gates: testplan.json (${JSON.parse(readFileSync(join(outDir, 'testplan.json'), 'utf8')).steps.length} checks), inspect.contract.json`);
  console.log(`\n      next: node engine/tests/flow.test.mjs ${outDir}`);
  console.log(`            node engine/inspect.mjs ${outDir} ${join(outDir, 'inspect.contract.json')} demo-out/<run>`);
}
