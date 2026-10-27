// contract.mjs — validation for inspect contracts. Pure: no browser, no I/O.
//
// Separated from inspect.mjs so the rules can be unit-tested without driving
// a browser (inspect.mjs runs a CLI at import time).
//
// The two rules that matter are the ones the engine learned the hard way:
//   - a contract must measure an ERROR state (validation failures are where
//     illegible text hides), unless it declares why the app has none;
//   - a contract must measure a POST-ACTION state (a state that exists only
//     after a mutation is invisible to load-time audits — Mission 018 found
//     a 4.44:1 card that only exists after a booking).
// ---- contract validation -------------------------------------------------
export function validateContract(c) {
  const errors = [];
  if (!c.id) errors.push('contract needs an "id"');
  if (!Array.isArray(c.steps) || c.steps.length === 0) errors.push('contract needs a non-empty "steps" array');
  const measures = (c.steps || []).filter(s => s.measure);
  const kinds = new Set(measures.map(m => m.kind).filter(Boolean));
  if (measures.length === 0) errors.push('contract exercises no measured states');
  if (!kinds.has('error')) {
    if (typeof c.errorStateWaiver === 'string' && c.errorStateWaiver.trim()) {
      // An app with no error UI cannot have its error contrast measured.
      // That is a real gap, so it must be declared, not silently skipped.
    } else {
      errors.push('contract measures no "error" state — validation failures are where illegible text hides. ' +
        'If the app genuinely has no error state, declare why in "errorStateWaiver".');
    }
  }
  if (!kinds.has('post-action')) {
    errors.push('contract measures no "post-action" state — states that exist only after a mutation are invisible to load-time audits');
  }
  for (const m of measures) {
    if (!m.selector) errors.push(`measure "${m.measure}" has no selector`);
    if (!m.kind) errors.push(`measure "${m.measure}" has no kind (rest|hover|selected|error|post-action|disabled)`);
  }
  const axeViews = (c.steps || []).filter(s => s.axe);
  if (axeViews.length === 0) errors.push('contract runs no axe audit');
  return errors;
}


export const MEASURE_KINDS = ['rest', 'hover', 'selected', 'error', 'post-action', 'disabled'];
