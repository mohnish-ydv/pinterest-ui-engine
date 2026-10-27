// build.mjs — inject the brief into the hand-authored baseline's index.html.
// The baseline is NOT generated from a template family (that is the point of
// a baseline), but it must run against the same brief, so the brief JSON is
// injected here rather than retyped.
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const here = dirname(fileURLToPath(import.meta.url));
const brief = readFileSync(join(here, '..', 'brief.json'), 'utf8');
const src = readFileSync(join(here, 'app', 'index.html'), 'utf8');
writeFileSync(join(here, 'app', 'index.html'), src.replace('{{DATA_JSON}}', brief));
console.log('baseline built from brief.json');
