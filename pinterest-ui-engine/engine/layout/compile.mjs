// compile.mjs — layout IR + tokens -> a runnable app.
//
// MISSION 021. This is the stage that replaces hand-authored templates.
// It emits four files and writes no app-specific logic:
//
//   index.html   a shell (skip link, header slot, main slot, nav slot)
//   styles.css   component CSS with the run's tokens substituted in
//   data.js      window.__APP__ = { layout, model }   (inlined: file:// blocks fetch)
//   app.js       a verbatim copy of the generic runtime
//
// Everything that differs between apps lives in data.js, produced by the
// planner. The compiler never mentions an app name, an entity name or a
// field name.
//
// The compiler also emits the app's own gates — testplan.json and
// inspect.contract.json — from the same IR, so the tests cannot drift from
// what was generated.
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { fillTemplate, makeSuggester } from '../lib/template.mjs';
import { planTestplan, planInspectContract } from './gates.mjs';
import { DENSITY } from './plan.mjs';
import { hueOf } from '../lib/color.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ENGINE = join(HERE, '..');
const RUNTIME_DIR = join(ENGINE, 'runtime');

const sha = (s) => createHash('sha256').update(s).digest('hex').slice(0, 16);

/** The model is the data contract the runtime binds to. */
export function buildModel(brief, ir, tokens, composition) {
  const key = 'app:' + (brief.brand || 'app').toLowerCase().replace(/[^a-z0-9]+/g, '-') + ':v1';
  return {
    app: {
      brand: brief.brand,
      tagline: brief.tagline || '',
      location: brief.location || '',
      currency: brief.currency || '',
      unit: brief.unit || '',
    },
    composition: composition || null,
    entity: ir.entity,
    records: (brief.entity.records || []).map(r => ({ ...r })),
    search: ir.search,
    filters: ir.filters,
    availability: ir.availability || null,
    bag: brief.bag || null,
    // M046: the Evira families — declared in the brief, never derived
    // from prose. A brief that declares a wallet, a profile, notices,
    // help content, an onboarding flow or an auth gate gets those
    // screens in the board's constructions; a brief that declares none
    // of them compiles exactly as it did before this mission.
    wallet: brief.wallet || null,
    profile: brief.profile || null,
    notices: brief.notices || null,
    greetingHome: brief.homeHeader === 'greeting',
    faq: brief.faq || null,
    onboarding: brief.onboarding || null,
    auth: brief.auth || null,
    // M050: the next declared families, same contract — declared in
    // the brief, carried to the model, rendered by the runtime.
    // Undeclared, all four are null and nothing changes.
    splash: brief.splash || null,
    permissions: brief.permissions || null,
    chat: brief.chat || null,
    wishlist: brief.wishlist || null,
    collections: ir.collections || [],
    banners: ir.banners || [],
    actions: ir.actions,
    navigation: ir.navigation,
    persistence: {
      key,
      collections: ['saved', ...((brief.actions || []).filter(a => a.kind === 'commit').map(a => a.result?.collection || 'commits'))],
    },
    // Media tints are derived from the family's brand hue, varied per record,
    // so a substituted image slot reads as a designed palette rather than a
    // random colour. The alternative — one flat colour for every card — is
    // what the first generation did, and it looked broken.
    media: (() => {
      const h = hueOf(tokens.color?.brand);
      // M045: substituted media is a LIGHT tile, the way the reference
      // boards' product photography sits on a near-white seamless
      // backdrop — a dark saturated block per card read as noise and
      // made every grid loud. The hue still varies per record; only
      // the lightness moved (29 -> 87).
      return { baseHue: h == null ? 243 : Math.round(h), spread: 58, sat: 28, light: 87 };
    })(),
    // Labels for submission fields, so a confirmation can name what it shows
    // instead of printing the raw field id.
    fieldLabels: (() => {
      const out = {};
      (brief.entity?.fields || []).forEach(f => { out[f.id] = f.label || f.id; });
      (brief.actions || []).forEach(a => {
        (a.form || []).forEach(f => { out[f.id] = f.label || f.id; });
        if (a.options) out[a.options.id] = a.options.label || a.options.id;
      });
      // Labels for values a committed record carries that are not form fields.
      out.id = brief.entity?.label || 'Item';
      if (brief.availability) out.slot = brief.availability.slotLabel || 'Time';
      if (brief.availability) out.dayLabel = 'Day';
      // M039: a bag order's carried values — the items summary and the
      // charged total are computed at commit time, not form fields.
      if (brief.bag) { out.items = 'Items'; out.total = 'Total'; out.deliveryFee = 'Delivery fee'; out.at = 'Date'; out.delivery = 'Delivery'; }
      return out;
    })(),
  };
}

export function compileApp({ brief, tokens, ir, outDir, composition }) {
  if (!existsSync(RUNTIME_DIR)) throw new Error(`compile: runtime directory missing at ${RUNTIME_DIR}`);
  mkdirSync(outDir, { recursive: true });

  const model = buildModel(brief, ir, tokens, composition);
  // The component library is scale-agnostic: it needs a base size and a few
  // relative steps, not each run's bespoke key names. Derive them from the
  // run's own type scale so the family still governs the result.
  const t = tokens.type || {};
  const body = Number(t.body) || 15;
  // Layout density comes from the planner (a reference-derived decision about
  // air and column count), so it is merged into the token context alongside
  // the family's typographic density.
  const ld = DENSITY[ir.meta.density] || DENSITY.comfortable;
  const ctx = {
    ...tokens,
    app: model.app,
    meta: ir.meta,
    density: { ...(tokens.density || {}), ...ld },
    scale: {
      body,
      small: Number(t.small) || Math.round(body * 0.85),
      section: Number(t.section) || Math.round(body * 1.2),
      display: Number(t.display) || Number(t.pageTitle) || Math.round(body * 1.75),
      amount: Number(t.amount) || Number(t.price) || body,
    },
  };
  const suggest = makeSuggester(ctx);

  // ---- styles: component CSS with tokens substituted ---------------------
  const cssSrc = readFileSync(join(RUNTIME_DIR, 'components.css.tmpl'), 'utf8');
  const css = fillTemplate(cssSrc, ctx, 'components.css.tmpl', suggest)
    .replace('/*@GENERATED@*/', `/* Generated by the layout compiler from layout IR ${sha(JSON.stringify(ir))} — do not hand-edit. */`);

  // ---- data: layout + model ---------------------------------------------
  const data = [
    '// Generated by the layout compiler. Do not hand-edit.',
    `window.__APP__ = ${JSON.stringify({ layout: ir, model }, null, 2)};`,
    '',
  ].join('\n');

  // ---- shell ------------------------------------------------------------
  const title = `${brief.brand}${brief.tagline ? ' — ' + brief.tagline : ''}`;
  const navPattern = ir.navigation.pattern;
  const brandColour = (tokens.color && tokens.color.brand) || '#333333';
  const groundColour = (tokens.color && tokens.color.ground) || '#ffffff';
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="${brandColour}">
<meta name="mobile-web-app-capable" content="yes">
<title>${escapeHtml(title)}</title>
<link rel="manifest" href="manifest.webmanifest">
<link rel="stylesheet" href="styles.css">
</head>
<body data-nav-pattern="${navPattern}" data-density="${ir.meta.density}">
<a class="skip" href="#main">Skip to content</a>
<header id="hdr" class="app-hdr" role="banner"></header>
<main id="main" class="app-main" role="main" tabindex="-1" data-view="browse"></main>
<div id="actionbar" class="actionbar" hidden></div>
${navPattern === 'tabbar' ? '<nav id="tabs" class="tabbar" aria-label="Main"></nav>' : ''}
<script src="data.js"></script>
<script src="app.js"></script>
</body>
</html>
`;
  // M038: the build is a mobile app delivered as a web app — it carries
  // the metadata a phone needs to treat it as one (name, colours,
  // standalone display). Icons are generated by build_app when PIL is
  // available; the manifest degrades honestly without them.
  const manifest = {
    name: brief.brand,
    short_name: brief.brand,
    description: brief.tagline || brief.brand,
    start_url: '.',
    scope: '.',
    display: 'standalone',
    background_color: groundColour,
    theme_color: brandColour,
    icons: [
      { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  };

  const written = {};
  const put = (name, content) => { writeFileSync(join(outDir, name), content); written[name] = sha(content); };
  put('index.html', html);
  put('styles.css', css);
  put('data.js', data);
  put('manifest.webmanifest', JSON.stringify(manifest, null, 2));
  copyFileSync(join(RUNTIME_DIR, 'runtime.js'), join(outDir, 'app.js'));
  written['app.js'] = sha(readFileSync(join(RUNTIME_DIR, 'runtime.js'), 'utf8'));

  // ---- the app's own gates ---------------------------------------------
  const testplan = planTestplan(brief, ir, model);
  const contract = planInspectContract(brief, ir, model);
  put('testplan.json', JSON.stringify(testplan, null, 2));
  put('inspect.contract.json', JSON.stringify(contract, null, 2));

  return {
    outDir,
    model,
    files: written,
    irHash: sha(JSON.stringify(ir)),
    counts: {
      views: ir.views.length,
      sections: ir.views.reduce((n, v) => n + v.sections.length, 0),
      components: [...new Set(ir.views.flatMap(v => v.sections.map(s => s.component)))],
    },
  };
}

const escapeHtml = (s) => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
