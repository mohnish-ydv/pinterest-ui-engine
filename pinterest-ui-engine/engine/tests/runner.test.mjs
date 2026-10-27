// runner.test.mjs — the eight injections the mission requires.
// Each proves the runner fails closed on a specific way an evaluation can lie.
import { runChallenge } from '../eval/runner.mjs';

const results = [];
const check = (n, ok, d = '') => { results.push(ok); console.log(`${ok ? 'PASS' : 'FAIL'}  ${n}${d ? ' — ' + d : ''}`); };
const okObs = async () => 'ok';

// 0. a well-formed run completes and scores
{
  const r = await runChallenge({ name: 'baseline', cases: [
    { id: 'A', expected: 'ok', defect: false, observe: okObs },
    { id: 'B', expected: 'bad', defect: true, observe: async () => 'bad' },
  ]});
  check('a well-formed run is complete and scores', r.complete && r.tally.TN === 1 && r.tally.TP === 1, `${r.status} ${JSON.stringify(r.tally)}`);
}

// 1. an unconditional pass must be refused
{
  const r = await runChallenge({ name: 'unconditional-pass', cases: [
    { id: 'A', expected: 'bad', verdict: 'TP', observe: okObs },
  ]});
  check('an unconditional pass is refused', !r.complete && r.errors.some(e => e.kind === 'unconditional'), r.errors[0]?.kind);
}

// 2. an unconditional failure must be refused
{
  const r = await runChallenge({ name: 'unconditional-fail', cases: [
    { id: 'A', expected: 'ok', verdict: 'FN', observe: okObs },
  ]});
  check('an unconditional failure is refused', !r.complete && r.errors.some(e => e.kind === 'unconditional'), r.errors[0]?.kind);
}

// 3. a missing fixture fails closed
{
  const r = await runChallenge({ name: 'missing-fixture', cases: [
    { id: 'A', expected: 'ok', observe: async () => { throw new Error('ENOENT: no such fixture'); } },
  ]});
  check('a missing fixture fails closed', !r.complete && r.errors.some(e => e.kind === 'crash'), r.errors[0]?.kind);
}

// 4. a malformed expectation fails closed
{
  const r = await runChallenge({ name: 'malformed', cases: [
    { id: 'A', observe: okObs },
  ]});
  check('a malformed expectation fails closed', !r.complete && r.errors.some(e => e.kind === 'malformed-expectation'), r.errors[0]?.kind);
}

// 5. a duplicate case identifier fails closed
{
  const r = await runChallenge({ name: 'duplicate', cases: [
    { id: 'A', expected: 'ok', defect: false, observe: okObs },
    { id: 'A', expected: 'ok', defect: false, observe: okObs },
  ]});
  check('a duplicate case id fails closed', !r.complete && r.errors.some(e => e.kind === 'duplicate-id'), r.errors[0]?.kind);
}

// 6. a mutation that changes nothing is not evidence
{
  const r = await runChallenge({ name: 'noop', cases: [
    { id: 'A', expected: 'bad', defect: true, mutate: async () => false, observe: okObs },
  ]});
  check('a mutation that changed nothing is refused', !r.complete && r.errors.some(e => e.kind === 'no-op-mutation'), r.errors[0]?.kind);
}

// 7. a runner crash fails closed
{
  const r = await runChallenge({ name: 'crash', cases: [
    { id: 'A', expected: 'ok', observe: async () => { throw new TypeError('cannot read properties of undefined'); } },
  ]});
  check('a runner crash fails closed', !r.complete && r.status === 'incomplete', r.status);
}

// 8. an outcome omitted from aggregation is detected
{
  const r = await runChallenge({ name: 'omitted', cases: [
    { id: 'A', expected: 'ok', defect: false, observe: okObs },
    { id: 'B', expected: 'ok', defect: false, observe: okObs },
  ], hooks: { beforeCase: async (c) => { if (c.id === 'B') throw new Error('skipped'); } } });
  check('a skipped case cannot disappear silently', !r.complete && r.rows.length + r.errors.length === 2,
    `${r.rows.length} rows, ${r.errors.length} errors, ${r.rows.length + r.errors.length} of 2 accounted`);
}

// 9. an incomplete run reports no score and a non-zero exit
{
  const r = await runChallenge({ name: 'exit', cases: [
    { id: 'A', expected: 'ok', observe: async () => { throw new Error('boom'); } },
  ]});
  check('an incomplete run has no valid score and exits non-zero', r.complete === false && r.exitCode !== 0, `exit=${r.exitCode}`);
}

// 10. a genuine mismatch is classified, not hidden
{
  const r = await runChallenge({ name: 'mismatch', cases: [
    { id: 'A', expected: 'hidden', defect: true, observe: okObs },
  ]});
  check('a genuine mismatch is classified FN, not silently passed', r.complete && r.tally.FN === 1, JSON.stringify(r.tally));
}

const passed = results.filter(Boolean).length;
console.log(`RESULT ${passed}/${results.length}`);
process.exit(passed === results.length ? 0 : 1);
