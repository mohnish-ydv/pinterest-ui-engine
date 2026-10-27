// Acceptance — N4 Posture. Written from the product requirements only.
import { runSuite } from '../../../bench/lib/harness.mjs';
await runSuite('N4. Posture — fleet dashboard', process.argv[2], async (t) => {
  const kpi = await t.count('[data-testid="kpi-tile"]');
  t.check('R1 the dashboard opens with summary numbers', kpi >= 3, `tiles=${kpi}`);
  t.check('R2 every summary number has a value', await t.count('[data-testid="kpi-value"]') === kpi && kpi > 0);
  const heads = await t.count('[data-testid="table-head"]');
  t.check('R3 a table lists every vehicle', await t.count('[data-testid="vehicle-card"]') === 5 && heads >= 4, `rows=${await t.count('[data-testid="vehicle-card"]')} heads=${heads}`);
  const txt = await t.page.evaluate(() => { const m = document.querySelector('main'); return m ? m.innerText.replace(/\s+/g, ' ') : ''; });
  t.check('R4 distance and trips are visible', /65,300|65300/.test(txt) && /1,420|1420/.test(txt), txt.slice(0, 100));
  await t.click('[data-testid="depot-chip"][data-depot="North"]'); await t.sleep(240);
  t.check('R5 filtering by depot leaves 2', await t.count('[data-testid="vehicle-card"]') === 2, `n=${await t.count('[data-testid="vehicle-card"]')}`);
  await t.click('[data-testid="depot-chip"][data-depot="All"]'); await t.sleep(200);
  await t.type('[data-testid="search"]', '7742'); await t.sleep(260);
  t.check('R6 searching a registration leaves 1', await t.count('[data-testid="vehicle-card"]') === 1, `n=${await t.count('[data-testid="vehicle-card"]')}`);
  await t.type('[data-testid="search"]', ''); await t.sleep(200);
  await t.click('[data-testid="vehicle-card"][data-id="v3"]'); await t.sleep(340);
  t.check('R7 opening a vehicle shows its detail', /7742/.test(await t.page.evaluate(() => document.querySelector('main').innerText)));
  const ov = await t.page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  t.check('R8 readable on a phone: no page overflow at 390', !ov);
  t.check('R9 no page or console errors', t.errors.length === 0, t.errors.slice(0, 2).join(' | '));
});
