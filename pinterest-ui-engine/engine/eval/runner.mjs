// runner.mjs — a challenge runner that fails closed.
//
// MISSION 033, Phase 3. Mission 032 disclosed that its v1 runner recorded one
// result unconditionally. That is a defect in the verification infrastructure,
// not in the engine, and it is the more dangerous of the two: a runner that can
// record without executing makes every number it produces worthless.
//
// Every result here must come from an executed case compared against a
// preregistered expectation. Anything else — a missing fixture, a malformed
// expectation, a crash, an unclassified outcome — is a RUNNER ERROR and makes
// the run incomplete. Incomplete is never a pass.

export const VERDICTS = ['TP', 'FP', 'TN', 'FN', 'UNMEASURED'];

export class RunnerError extends Error {
  constructor(kind, message, detail) {
    super(message);
    this.name = 'RunnerError';
    this.kind = kind;   // 'missing-fixture' | 'malformed-expectation' | 'duplicate-id'
                        // | 'crash' | 'no-op-mutation' | 'unclassified' | 'unconditional'
    this.detail = detail;
  }
}

/**
 * @param {object} o
 * @param {string} o.name
 * @param {Array<{id, expected, tolerated?, mutate?, observe, judge?}>} o.cases
 * @param {object} [o.hooks]  test-only injection points
 */
export async function runChallenge(o) {
  const { name, cases, hooks = {} } = o;
  const seen = new Set();
  const rows = [];
  const errors = [];

  for (const c of cases) {
    // ---- guard: duplicate identifier --------------------------------
    if (!c || !c.id) { errors.push(new RunnerError('malformed-expectation', 'a case has no id', c)); continue; }
    if (seen.has(c.id)) { errors.push(new RunnerError('duplicate-id', `case id "${c.id}" appears twice`)); continue; }
    seen.add(c.id);

    // ---- guard: the expectation must be one of the known verdicts ----
    if (!c.expected) { errors.push(new RunnerError('malformed-expectation', `case "${c.id}" has no expected outcome`)); continue; }

    // ---- execute ----------------------------------------------------
    let observed;
    try {
      if (typeof c.observe !== 'function') throw new RunnerError('malformed-expectation', `case "${c.id}" has no observer`);
      if (hooks.beforeCase) await hooks.beforeCase(c);
      observed = await c.observe();
    } catch (e) {
      // A crash is a runner error, not an engine failure and not a pass.
      errors.push(new RunnerError('crash', `case "${c.id}" threw: ${e.message}`, e));
      continue;
    }

    // ---- guard: a mutation that changed nothing ---------------------
    if (typeof c.mutate === 'function') {
      let changed;
      try { changed = await c.mutate(); } catch (e) {
        errors.push(new RunnerError('crash', `case "${c.id}" mutation threw: ${e.message}`)); continue;
      }
      if (changed === false) {
        errors.push(new RunnerError('no-op-mutation',
          `case "${c.id}" declares a mutation that changed nothing — its observation cannot be evidence`));
        continue;
      }
    }

    // ---- guard: no unconditional recording --------------------------
    // The verdict must be derived from a comparison, never supplied.
    if (c.verdict !== undefined) {
      errors.push(new RunnerError('unconditional', `case "${c.id}" supplies a verdict instead of deriving one`));
      continue;
    }
    let verdict;
    if (typeof c.judge === 'function') {
      verdict = c.judge(observed);
    } else {
      const allowed = [c.expected, ...(c.tolerated || [])];
      verdict = allowed.includes(observed)
        ? (c.defect === false ? 'TN' : 'TP')
        : (c.defect === false ? 'FP' : 'FN');
    }
    if (!VERDICTS.includes(verdict)) {
      errors.push(new RunnerError('unclassified', `case "${c.id}" produced verdict "${verdict}"`));
      continue;
    }

    rows.push({ id: c.id, scenario: c.scenario || '', expected: c.expected, tolerated: c.tolerated || [], observed, verdict });
  }

  // ---- guard: nothing silently skipped ------------------------------
  if (rows.length + errors.length !== cases.length) {
    errors.push(new RunnerError('unclassified',
      `${cases.length} cases declared but ${rows.length} recorded and ${errors.length} errored — some were skipped`));
  }

  const tally = VERDICTS.reduce((a, v) => { a[v] = rows.filter(r => r.verdict === v).length; return a; }, {});
  const complete = errors.length === 0;
  return {
    name,
    rows, errors: errors.map(e => ({ kind: e.kind, message: e.message })),
    tally,
    complete,
    // an incomplete run cannot report a score
    status: complete ? 'complete' : 'incomplete',
    exitCode: complete ? 0 : 3,
  };
}

export function formatRun(rep) {
  const lines = [`challenge "${rep.name}" — ${rep.status.toUpperCase()}`];
  for (const r of rep.rows) lines.push(`  ${r.verdict.padEnd(11)} ${r.id} expected=${r.expected} observed=${r.observed}`);
  for (const e of rep.errors) lines.push(`  RUNNER-ERROR ${e.kind}: ${e.message}`);
  const t = rep.tally;
  lines.push(`  ${t.TP} TP, ${t.FP} FP, ${t.TN} TN, ${t.FN} FN, ${t.UNMEASURED} unmeasured` +
    (rep.complete ? '' : '  — INCOMPLETE, no score is valid'));
  return lines.join('\n');
}
