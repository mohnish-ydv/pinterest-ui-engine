// design040.test.mjs — Mission 040, photography and the composed surfaces.
//
// The reference boards lead with real photography, a brand-coloured
// home zone, a photo hero with a sheet over it, relatives under the
// record, and an order lifecycle. M040 makes those engine behaviour:
// briefs carry images, the build bundles them, and the runtime renders
// them — with the substituted gradient still underneath as fallback.

import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
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

const product = () => ({
  name: 'Fixture Eats', tagline: 't', about: 'a', location: 'Pune', currency: '₹',
  domain: 'food delivery', submissionsLabel: 'Your orders',
  promo: { title: 'Fest', subtitle: 'Today', image: 'assets/promo.jpg', recordId: 'r1', cta: 'Order now' },
  collection: {
    label: 'Dish', plural: 'Dishes', media: true,
    items: [
      { id: 'r1', name: 'Alpha Dish', kind: 'One', price: 320, score: 4.5, note: 'First.', image: 'assets/r1.jpg' },
      { id: 'r2', name: 'Beta Dish', kind: 'One', price: 200, score: 4.0, note: 'Second.', image: 'assets/r2.jpg' },
      { id: 'r3', name: 'Gamma Dish', kind: 'Two', price: 260, score: 4.2, note: 'Third.' },
    ],
  },
  fields: [
    { id: 'name', type: 'text', label: 'Dish' },
    { id: 'kind', type: 'enum', label: 'Kind', options: ['One', 'Two'] },
    { id: 'price', type: 'money', label: 'Price' },
    { id: 'score', type: 'number', label: 'Rating' },
    { id: 'note', type: 'text', label: 'About' },
  ],
  requirements: ['A photo-led gallery of every dish.'],
});

{
  const brief = deriveBrief(product(), null);
  check('a declared promo passes through derivation', brief.promo?.title === 'Fest');
  const layout = planApp(brief, null, { intent: { composition: compileIntent(brief, {}).composition } });
  const browse = layout.views.find(v => v.id === 'dishes') || layout.views[0];
  check('the promo is planned on the home view', browse.sections.some(s => s.component === 'promo-banner'));
  const detail = layout.views.find(v => v.id === 'detail');
  check('the record page ends with a related rail keyed to the facet',
    detail.sections.some(s => s.component === 'related-rail' && s.binding.field === 'kind'));
}

{
  const dir = mkdtempSync(join(tmpdir(), 'design040-'));
  const runDir = join(dir, 'case');
  execFileSync('mkdir', ['-p', join(runDir, 'assets')]);
  // 1x1 jpeg stand-ins: bundling must copy whatever the brief declares.
  const px = Buffer.from('/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////2wBDAf//////////////////////////////////////////////////////////////////////////////////////wAARCAABAAEDASIAAhEBAxEB/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AvwH/2Q==', 'base64');
  for (const f of ['r1.jpg', 'r2.jpg', 'promo.jpg']) writeFileSync(join(runDir, 'assets', f), px);
  writeFileSync(join(runDir, 'product-brief.json'), JSON.stringify(product(), null, 2));
  const engineDir = join(import.meta.url.replace('file://', ''), '..', '..');
  execFileSync('node', [join(engineDir, 'run.mjs'), runDir], {
    env: { ...process.env, CHROME_PATH: process.env.CHROME_PATH || '' }, stdio: 'pipe',
  });
  check('declared images are bundled into the app', existsSync(join(runDir, 'app', 'assets', 'r1.jpg')));
  const js = readFileSync(join(runDir, 'app', 'app.js'), 'utf8');
  check('media renders the real image over the fallback', js.includes('media-img') && js.includes('rec.image'));
  check('the promo and the related rail are implemented', js.includes("R['promo-banner']") && js.includes("R['related-rail']"));
  check('the order timeline ships with bag apps', js.includes('track-step'));
  const css = readFileSync(join(runDir, 'app', 'styles.css'), 'utf8');
  check('the brand-zone home header is styled', css.includes('body.is-home .app-hdr'));
  check('the detail hero sheets over its photo', css.includes('body.is-detail .rec-head'));
  check('card media clips its photo', css.includes('.media-img'));
}

console.log(`\nRESULT ${passed}/${passed + failed}`);
process.exit(failed ? 1 : 0);
