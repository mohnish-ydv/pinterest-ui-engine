// plan_doctor.mjs — INTAKE v2 plan validator (Mission 050).
//
// Validates a plan pack produced by make_plan.mjs before it is shown
// at the confirmation gate:
//   - every screen in PLAN.json / USER_JOURNEY.md exists in
//     DESIGN_DIRECTION.md and maps to a reference screen type
//     (base_reference.json vocabulary when present, else the
//     canonical screen-type list);
//   - every functionality item traces to a brief declaration — checked
//     by running brief_doctor.mjs on product-brief.json and surfacing
//     its GAPs (plus FUNCTIONALITY.md feature lines must be non-empty
//     and the brief must declare matching requirements/families);
//   - ART_DIRECTION.md names a reference source (base or user:<id>);
//   - PLAN.json status is present.
// PLAN.json status "awaiting_confirmation" is NOT a gap — it is the
// confirmation gate working — and is reported as a `gate:` note.
//
// CLI: node plan_doctor.mjs <planDir> — prints GAP / gate lines,
// exits 1 when gaps exist.

import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { CANONICAL_SCREEN_TYPES, canonicalType } from './make_plan.mjs';

function loadValidTypes() {
  try {
    const here = dirname(fileURLToPath(import.meta.url));
    const p = join(here, '..', '..', 'reference', 'base', 'base_reference.json');
    if (!existsSync(p)) return new Set(CANONICAL_SCREEN_TYPES);
    const data = JSON.parse(readFileSync(p, 'utf8'));
    const raw = data.screenTypes || data.screens || data.types || [];
    const types = (Array.isArray(raw) ? raw : Object.keys(raw)).map(s => (typeof s === 'string' ? s : (s.id || s.type || s.name))).filter(Boolean);
    return types.length ? new Set([...types, ...CANONICAL_SCREEN_TYPES]) : new Set(CANONICAL_SCREEN_TYPES);
  } catch { return new Set(CANONICAL_SCREEN_TYPES); }
}

export function doctorPlan(planDir) {
  const out = [];
  const gap = message => out.push({ level: 'gap', message });
  const note = message => out.push({ level: 'gate', message });
  const read = f => (existsSync(join(planDir, f)) ? readFileSync(join(planDir, f), 'utf8') : null);

  const planRaw = read('PLAN.json');
  if (!planRaw) { gap('PLAN.json is missing — run make_plan.mjs first.'); return out; }
  let plan;
  try { plan = JSON.parse(planRaw); } catch { gap('PLAN.json is not valid JSON.'); return out; }

  if (!plan.status) gap('PLAN.json has no status — the confirmation gate state is unknown.');
  else if (plan.status === 'awaiting_confirmation') note('PLAN.json status is "awaiting_confirmation" — the confirmation gate is holding; generation must not start until the user confirms.');
  else if (plan.status !== 'confirmed') gap(`PLAN.json status "${plan.status}" is not a recognised gate state (awaiting_confirmation | confirmed).`);

  const screens = Array.isArray(plan.screens) ? plan.screens : [];
  if (!screens.length) gap('PLAN.json declares no screens.');

  const design = read('DESIGN_DIRECTION.md');
  if (!design) gap('DESIGN_DIRECTION.md is missing.');
  const journey = read('USER_JOURNEY.md');
  if (!journey) gap('USER_JOURNEY.md is missing.');
  const validTypes = loadValidTypes();
  for (const s of screens) {
    const id = s.id || s.name || '';
    const type = canonicalType(s.referenceType || s.type || id);
    if (design && id && !design.includes(`\`${id}\``) && !design.toLowerCase().includes(String(id).toLowerCase()))
      gap(`screen "${id}" is in PLAN.json but has no section in DESIGN_DIRECTION.md.`);
    if (journey && id && !journey.includes(`\`${id}\``) && !journey.toLowerCase().includes(String(id).toLowerCase()))
      gap(`screen "${id}" is in PLAN.json but never appears in USER_JOURNEY.md.`);
    if (!type || !validTypes.has(type))
      gap(`screen "${id}" maps to reference type "${s.referenceType || type || '(none)'}", which is not a known reference screen type.`);
  }
  // Journey-mentioned screens (backtick ids in USER_JOURNEY) must be planned.
  if (journey) {
    const planned = new Set(screens.map(s => s.id));
    for (const m of journey.matchAll(/screen: `([a-z0-9-]+)`/gi)) {
      if (!planned.has(m[1])) gap(`USER_JOURNEY.md routes a step to screen "${m[1]}", which is not in PLAN.json.`);
    }
  }

  const art = read('ART_DIRECTION.md');
  if (!art) gap('ART_DIRECTION.md is missing.');
  else if (!/base reference|reference source|user[:\s]|user reference|decode/i.test(art))
    gap('ART_DIRECTION.md names no reference source — it must say whether the base reference or a user decode (user:<id>) governs.');

  const refPlan = read('REFERENCE_PLAN.md');
  if (!refPlan) gap('REFERENCE_PLAN.md is missing — every screen needs a named governing reference.');

  const func = read('FUNCTIONALITY.md');
  if (!func) gap('FUNCTIONALITY.md is missing.');
  else if (!/## Features/.test(func) || !func.includes('- ')) gap('FUNCTIONALITY.md lists no features to trace to the brief.');

  const briefPath = join(planDir, 'product-brief.json');
  if (!existsSync(briefPath)) gap('product-brief.json is missing from the plan pack.');
  else {
    const here = dirname(fileURLToPath(import.meta.url));
    const r = spawnSync(process.execPath, [join(here, 'brief_doctor.mjs'), briefPath], { encoding: 'utf8' });
    const briefOut = `${r.stdout || ''}${r.stderr || ''}`;
    for (const line of briefOut.split('\n')) {
      if (line.startsWith('GAP')) gap(`brief: ${line.replace(/^GAP\s*/, '')} (from brief_doctor on product-brief.json)`);
    }
    if (r.error) gap(`brief_doctor could not run: ${r.error.message}`);
  }
  for (const f of ['ROADMAP.md', 'TODO.md']) if (!read(f)) gap(`${f} is missing from the plan pack.`);
  return out;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const planDir = process.argv[2];
  if (!planDir) { console.error('usage: node plan_doctor.mjs <planDir>'); process.exit(2); }
  const findings = doctorPlan(planDir);
  let gaps = 0;
  for (const f of findings) {
    if (f.level === 'gap') { gaps++; console.log(`GAP  ${f.message}`); }
    else console.log(`gate: ${f.message}`);
  }
  console.log(`plan: ${gaps} gap(s) — see INTAKE.md (INTAKE v2, Stage 4)`);
  process.exit(gaps ? 1 : 0);
}
