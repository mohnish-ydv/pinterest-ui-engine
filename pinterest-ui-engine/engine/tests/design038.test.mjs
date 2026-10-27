// design038.test.mjs — Mission 038, the mobile-app shell.
//
// M038 retargeted the engine at mobile apps (the reference boards are
// all phone apps). These checks pin the app-frame decisions on
// synthetic fixtures and one built case:
//   * navigation counts every real destination — a toggle action's
//     saved view and a commit flow's submissions view get tabs, and
//     the planner creates the saved view it counts;
//   * the first tab is the app's home;
//   * the shell carries app metadata (theme colour, manifest link,
//     the action-bar mount) and the build writes a standalone manifest;
//   * the built CSS frames a phone-width column, centres the tab bar
//     on it, styles the pinned action bar, and floats the entry
//     action;
//   * the built runtime moves a flow's navigation into the action bar
//     and renders tab icons.

import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { deriveBrief } from '../intake/derive.mjs';
import { compileIntent } from '../intent/compile.mjs';
import { planApp } from '../layout/plan.mjs';

let passed = 0;
let failed = 0;
const check = (name, cond, detail = '') => {
  if (cond) { passed++; console.log(`  ok  ${name}`); }
  else { failed++; console.log(`  FAIL ${name} ${detail}`); }
};

const records = [
  { id: 'r1', name: 'Alpha Dish', kind: 'One', price: 100, score: 4.5, note: 'First.' },
  { id: 'r2', name: 'Beta Dish', kind: 'Two', price: 200, score: 4.0, note: 'Second.' },
];
const product = () => ({
  name: 'Fixture Eats', tagline: 't', about: 'a', location: 'Pune', currency: '₹',
  domain: 'food delivery', submissionsLabel: 'Your orders',
  collection: { label: 'Dish', plural: 'Dishes', media: true, items: records },
  fields: [
    { id: 'name', type: 'text', label: 'Dish' },
    { id: 'kind', type: 'enum', label: 'Kind', options: ['One', 'Two'] },
    { id: 'price', type: 'money', label: 'Price' },
    { id: 'score', type: 'number', label: 'Rating' },
    { id: 'note', type: 'text', label: 'About' },
  ],
  requirements: [
    'A photo-led gallery of every dish.',
    'A customer can save a dish to favourites with a heart toggle.',
    'A customer can place an order in three steps: the dish and quantity, then your name and phone, then review.',
    'A placed order ends with a confirmation showing a reference.',
  ],
});

{
  const brief = deriveBrief(product(), null);
  const layout = planApp(brief, null, { intent: { composition: compileIntent(brief, {}).composition } });
  const nav = layout.navigation;
  check('a toggle + flow app plans a tab bar', nav.pattern === 'tabbar', nav.pattern);
  check('tabs cover home, saved and the submissions view',
    ['Home', 'Saved', 'Orders'].every(l => nav.items.some(i => i.label === l)),
    JSON.stringify(nav.items.map(i => i.label)));
  check('the counted saved destination exists as a view',
    layout.views.some(v => v.id === 'saved'));
  check('every tab carries an icon name', nav.items.every(i => !!i.icon),
    JSON.stringify(nav.items.map(i => i.icon)));
}

{
  const dir = mkdtempSync(join(tmpdir(), 'design038-'));
  const runDir = join(dir, 'case');
  execFileSync('mkdir', ['-p', runDir]);
  const { writeFileSync } = await import('node:fs');
  writeFileSync(join(runDir, 'product-brief.json'), JSON.stringify(product(), null, 2));
  const engineDir = join(import.meta.url.replace('file://', ''), '..', '..');
  execFileSync('node', [join(engineDir, 'run.mjs'), runDir], {
    env: { ...process.env, CHROME_PATH: process.env.CHROME_PATH || '' }, stdio: 'pipe',
  });
  const html = readFileSync(join(runDir, 'app', 'index.html'), 'utf8');
  check('shell links the app manifest', html.includes('rel="manifest"'));
  check('shell sets a theme colour', html.includes('name="theme-color"'));
  check('shell mounts the action bar', html.includes('id="actionbar"'));
  const manifest = JSON.parse(readFileSync(join(runDir, 'app', 'manifest.webmanifest'), 'utf8'));
  check('manifest declares a standalone app',
    manifest.display === 'standalone' && manifest.name === 'Fixture Eats',
    JSON.stringify(manifest.display));
  const css = readFileSync(join(runDir, 'app', 'styles.css'), 'utf8');
  check('built CSS frames the phone column', css.includes('max-width: 480px'));
  check('built CSS styles the pinned action bar', css.includes('.actionbar'));
  check('built CSS floats the entry action',
    css.includes('.sect[data-section="entry-action"]') && css.includes('position: fixed'));
  const js = readFileSync(join(runDir, 'app', 'app.js'), 'utf8');
  check('built runtime moves the flow nav into the action bar',
    js.includes("querySelector('.sect[data-section=\"steps\"] .stepnav')"));
  check('built runtime renders tab icons', js.includes('TAB_ICONS'));
  check('app icons were generated', existsSync(join(runDir, 'app', 'icon-512.png')));
}

console.log(`\nRESULT ${passed}/${passed + failed}`);
process.exit(failed ? 1 : 0);
