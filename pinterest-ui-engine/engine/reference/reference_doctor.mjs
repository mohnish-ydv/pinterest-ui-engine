// reference_doctor.mjs — the user-reference ingest, enforced.
//
// Mission 050 (workstream C). engine/reference_profile.mjs measures
// colour pixels and deliberately refuses layout/typography inference.
// REFERENCE_INGEST.md adds the screen-level decode layer on top: when
// a user attaches their own reference, EVERY screen is decoded into
// reference/user/<id>/decode.md (same format as the base board
// decodes) and summarised into reference/user/<id>/profile.json in
// the base_reference.json schema. This doctor is the gate between
// "someone looked at the image" and "the plan may name this decode
// as governing": an ingest that skipped screens, or a profile that
// dropped the palette/type/shape/CTA/header rules, fails here —
// before generation, not after.
//
// doctorReference(dir) -> { passes: [msg], gaps: [msg] }
// CLI: node reference_doctor.mjs <userRefDir>
//   prints one PASS/GAP line per check, exits 1 when gaps exist,
//   exits 2 on usage error (no dir argument / dir does not exist).

import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const REQUIRED_PROFILE_FIELDS = ['id', 'screens', 'palette', 'typeRoles', 'shape', 'ctaRules', 'headerRules'];
const REQUIRED_SCREEN_FIELDS = ['type', 'anatomy', 'headerStyle', 'ctaStyle'];

const isNonEmpty = (v) =>
  (typeof v === 'string' && v.trim().length > 0) ||
  (Array.isArray(v) && v.length > 0) ||
  (v !== null && typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length > 0);

export function doctorReference(dir) {
  const passes = [];
  const gaps = [];
  const pass = (m) => passes.push(m);
  const gap = (m) => gaps.push(m);

  // ---- decode.md -------------------------------------------------------
  const decodePath = join(dir, 'decode.md');
  let decode = null;
  if (!existsSync(decodePath)) {
    gap('decode.md is missing — every attached screen must be decoded before the reference can govern a plan.');
  } else {
    decode = readFileSync(decodePath, 'utf8');
    pass('decode.md exists.');

    if (/^#\s+\S/m.test(decode) && decode.includes('**Source:**')) {
      pass('decode.md header present (title + Source line).');
    } else {
      gap('decode.md header is incomplete — it needs a "# User Reference Decode — …" title and a **Source:** line (see REFERENCE_INGEST.md format spec).');
    }

    // Numbered screen sections: "### N. <name>" headings, exactly as
    // the base board decodes write them.
    const screenRe = /^###\s+(\d+)\.\s+(.+)$/gm;
    const sections = [];
    let m;
    while ((m = screenRe.exec(decode)) !== null) {
      sections.push({ n: Number(m[1]), title: m[2].trim(), start: m.index });
    }
    if (!sections.length) {
      gap('decode.md has no numbered screen sections ("### 1. …") — decode EVERY screen in the reference, in board order.');
    } else {
      pass(`decode.md numbers ${sections.length} screen section(s).`);
      const nums = sections.map(s => s.n);
      const sequential = nums.every((n, i) => n === i + 1);
      if (!sequential) gap(`decode.md screen numbering is not sequential from 1 (found: ${nums.join(', ')}).`);
      for (let i = 0; i < sections.length; i++) {
        const end = i + 1 < sections.length ? sections[i + 1].start : decode.length;
        const body = decode.slice(sections[i].start, end);
        const label = `screen ${sections[i].n} (${sections[i].title})`;
        if (/\*\*Anatomy/.test(body)) pass(`${label}: anatomy present.`);
        else gap(`${label}: no **Anatomy line — record the top→bottom anatomy, not just an impression.`);
        if (/\*\*Engine mapping:\*\*/.test(body)) pass(`${label}: engine mapping present.`);
        else gap(`${label}: no **Engine mapping:** line — name the engine pattern it matches, or say MISSING so the gap is planned, not discovered.`);
      }
    }

    if (/^##\s+Pattern census/im.test(decode)) {
      pass('decode.md pattern census present.');
    } else {
      gap('decode.md has no "## Pattern census" section — count each pattern across screens so one-off screens are not mistaken for the system.');
    }
  }

  // ---- profile.json ----------------------------------------------------
  const profilePath = join(dir, 'profile.json');
  if (!existsSync(profilePath)) {
    gap('profile.json is missing — the decode must be summarised into the base_reference.json schema for the planner to consume.');
  } else {
    let profile = null;
    try {
      profile = JSON.parse(readFileSync(profilePath, 'utf8'));
    } catch (e) {
      gap(`profile.json does not parse: ${e.message}`);
    }
    if (profile) {
      pass('profile.json parses.');
      for (const f of REQUIRED_PROFILE_FIELDS) {
        if (isNonEmpty(profile[f])) pass(`profile.json field "${f}" present.`);
        else gap(`profile.json field "${f}" is missing or empty — required by the base_reference.json schema.`);
      }
      if (Array.isArray(profile.screens)) {
        profile.screens.forEach((s, i) => {
          for (const f of REQUIRED_SCREEN_FIELDS) {
            if (!s || !isNonEmpty(s[f])) {
              gap(`profile.json screens[${i}] is missing "${f}" — each screen entry is { type, anatomy, headerStyle, ctaStyle }.`);
            }
          }
        });
        const bad = profile.screens.filter(s => !s || REQUIRED_SCREEN_FIELDS.some(f => !isNonEmpty(s[f])));
        if (!bad.length && profile.screens.length) {
          pass(`profile.json screens: ${profile.screens.length} entr(ies), each with type/anatomy/headerStyle/ctaStyle.`);
        }
      }
      // Cross-check: the machine profile must not silently drop
      // screens the human decode recorded.
      if (decode && Array.isArray(profile.screens)) {
        const decoded = (decode.match(/^###\s+\d+\./gm) || []).length;
        if (decoded && profile.screens.length !== decoded) {
          gap(`profile.json summarises ${profile.screens.length} screen(s) but decode.md decodes ${decoded} — the profile must cover every decoded screen.`);
        } else if (decoded) {
          pass(`profile.json screen count matches decode.md (${decoded}).`);
        }
      }
    }
  }

  return { passes, gaps };
}

const isMain = process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url));
if (isMain) {
  const dir = process.argv[2];
  if (!dir) {
    console.error('usage: node engine/reference/reference_doctor.mjs <userRefDir>');
    console.error('  e.g. node engine/reference/reference_doctor.mjs reference/user/brewly-coffee');
    process.exit(2);
  }
  if (!existsSync(dir)) {
    console.error(`reference_doctor: no such directory: ${dir}`);
    process.exit(2);
  }
  const { passes, gaps } = doctorReference(dir);
  for (const p of passes) console.log(`PASS ${p}`);
  for (const g of gaps) console.log(`GAP  ${g}`);
  console.log(`reference: ${passes.length} pass, ${gaps.length} gap(s) — see REFERENCE_INGEST.md`);
  process.exit(gaps.length ? 1 : 0);
}
