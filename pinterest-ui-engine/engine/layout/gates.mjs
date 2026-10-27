// gates.mjs — generate an app's own test plan and inspection contract from its IR.
//
// MISSION 021 created this. MISSION 022 makes the derivation read the IR's
// DECLARED hooks instead of assuming a naming convention: a filter's testid
// and value attribute, a form field's testid and error testid, the commit
// button's testid, and the app's own entry view all come from the brief.
//
// That is not cosmetic. A derived gate that hardcodes `filter-<id>` and
// `field-<id>` silently tests nothing the moment a brief declares different
// hooks — which is exactly how the first version of this file produced 14
// false failures against a perfectly working app.

// ---------------------------------------------------------------------------
// Availability: the reference implementation of the brief's declared rule.
// The runtime implements the same formula; the derived tests assert the
// OBSERVABLE outcome, so a divergence between the two is caught as behaviour
// rather than as code.
// ---------------------------------------------------------------------------

export function availabilityStates(av, recordIndex, dayIndex, blockedSlots) {
  const blocked = blockedSlots || [];
  return (av.slots || []).map((slot, slotIndex) => {
    let taken = false;
    const rule = av.rule || { kind: 'none' };
    if (rule.kind === 'modulo') {
      let sum = 0;
      for (const inp of rule.inputs || []) {
        if (inp === 'recordIndex') sum += recordIndex;
        else if (inp === 'dayIndex') sum += dayIndex;
        else sum += slotIndex;
      }
      taken = (sum % rule.modulus) === (rule.remainder || 0);
    }
    if (!taken && blocked.indexOf(slot) !== -1) taken = true;
    return { slot, state: taken ? 'taken' : 'free' };
  });
}

const q = (s) => `[data-testid="${s}"]`;

// ---------------------------------------------------------------------------
// Test plan
// ---------------------------------------------------------------------------

export function planTestplan(brief, ir, model) {
  const ent = ir.entity;
  const records = model.records || [];
  const entry = ir.views[0].id;
  const steps = [];
  let n = 0;
  const add = (desc, o) => steps.push(Object.assign({ id: 'T' + (++n), desc }, o));

  const collSec = ir.views.find(v => v.id === entry).sections.find(s => s.component === 'entity-collection' || s.component === 'data-table');
  const cardSel = q(collSec.props.itemTestid);
  const listSel = q(collSec.props.testid);

  // 1. the collection renders every record
  add(`the ${ent.plural.toLowerCase()} list renders all ${records.length} records`, { act: 'count', sel: cardSel, eq: records.length });
  add('the collection container is present', { act: 'visible', sel: listSel, eq: true });

  // 1b. aggregates
  const aggSec = ir.views.find(v => v.id === entry).sections.find(s => s.component === 'metric-row');
  if (aggSec) {
    const n = (aggSec.binding.aggregates || []).length;
    add(`a KPI row of ${n} metrics is present`, { act: 'count', sel: q(aggSec.props.tileTestid || 'metric-tile'), eq: n });
    add('every metric shows a value', { act: 'count', sel: q(aggSec.props.valueTestid || 'metric-value'), eq: n });
  }

  // 1c. table headers
  if (collSec.component === 'data-table') {
    const cols = (collSec.binding.columns || []).length;
    add(`the table has ${cols} column headers`, { act: 'count', sel: q('table-head'), eq: cols });
  }

  // 2. filters narrow the collection to a computed count
  const filterSec = ir.views.find(v => v.id === entry).sections.find(s => s.component === 'filter-chips');
  if (filterSec) {
    const fid = filterSec.binding.filterId;
    const field = (ent.fields || []).find(f => f.id === filterSec.binding.field);
    const option = field && field.options && field.options[0];
    const vattr = filterSec.props.valueAttr || 'data-value';
    if (option) {
      const chip = (val) => `${q(filterSec.props.testid)}[${vattr}="${val}"]`;
      const expected = records.filter(r => String(r[filterSec.binding.field]) === option).length;
      add(`filtering by ${filterSec.props.label} = ${option} shows ${expected}`, { act: 'click', sel: chip(option) });
      add(`only ${expected} record(s) remain after filtering`, { act: 'count', sel: cardSel, eq: expected });
      add('the filter chip reports pressed state', { act: 'attr', sel: chip(option), attr: 'aria-pressed', eq: 'true' });
      add('the All chip restores every record', { act: 'click', sel: chip(filterSec.props.allLabel || 'All') });
      add('all records are back', { act: 'count', sel: cardSel, eq: records.length });
    }
  }

  // 3. search matches by its declared fields
  if (model.search && model.search.fields && records.length) {
    const term = String(records[0][model.search.fields[0]] || '');
    const expected = records.filter(r => model.search.fields.some(f => String(r[f] || '').toLowerCase().includes(term.toLowerCase()))).length;
    add(`searching "${term}" narrows to ${expected}`, { act: 'type', sel: q(model.search.testid || 'search'), value: term });
    add(`search yields ${expected} record(s)`, { act: 'count', sel: cardSel, eq: expected });
    add('clearing search restores every record', { act: 'type', sel: q(model.search.testid || 'search'), value: '' });
    add('all records are back after clearing search', { act: 'count', sel: cardSel, eq: records.length });
  }

  // 4. opening a record shows its detail
  const first = records[0];
  const titleField = (ent.fields || []).find(f => f.role === 'title');
  if (first && titleField) {
    add('opening the first record shows its detail', { act: 'click', sel: `${cardSel}[data-id="${first.id}"]` });
    add('the detail heading is the record title', { act: 'text', sel: q('detail-title'), eq: String(first[titleField.id]) });
    add('the detail view is the active view', { act: 'attr', sel: '#main', attr: 'data-view', eq: 'detail' });
  }

  // 5. save persists across a reload (apps that declare a saved collection)
  const toggle = (model.actions || []).find(a => a.kind === 'toggle');
  if (toggle && (model.navigation.items || []).some(i => i.view === 'saved')) {
    add('the record is not saved yet', { act: 'attr', sel: q('save-toggle'), attr: 'aria-pressed', eq: 'false' });
    add('tapping save marks the record saved', { act: 'click', sel: q('save-toggle') });
    add('the save control reports pressed', { act: 'attr', sel: q('save-toggle'), attr: 'aria-pressed', eq: 'true' });
    add('the saved collection lists the record', { act: 'goto', view: 'saved' });
    add('one record is saved', { act: 'count', sel: cardSel, eq: 1 });
    add('reload keeps the saved record', { act: 'reload' });
    add('the saved record survives a reload', { act: 'goto', view: 'saved' });
    add('still one saved record after reload', { act: 'count', sel: cardSel, eq: 1 });
  }

  // 6. availability: days, per-slot states, and the selection transition
  const avSec = ir.views.find(v => v.id === 'detail')?.sections.find(s => s.component === 'availability-picker');
  if (avSec) {
    const av = model.availability;
    const expected = availabilityStates(av, 0, 0, []);
    const taken = expected.filter(x => x.state === 'taken').length;
    const free = expected.length - taken;
    add(`${av.days} day chips are offered`, { act: 'count', sel: q(avSec.props.dayTestid), eq: av.days });
    add(`day 0 shows ${taken} taken and ${free} free slots`, {
      act: 'slots', dayTestid: avSec.props.dayTestid, slotTestid: avSec.props.slotTestid, taken, free,
    });
    const firstFree = expected.find(x => x.state === 'free');
    const firstTaken = expected.find(x => x.state === 'taken');
    if (firstFree) {
      add(`choosing ${firstFree.slot} marks it selected`, { act: 'click', sel: `${q(avSec.props.slotTestid)}[data-slot="${firstFree.slot}"]` });
      add('the chosen slot reports the selected state', { act: 'attr', sel: `${q(avSec.props.slotTestid)}[data-slot="${firstFree.slot}"]`, attr: 'data-state', eq: 'selected' });
    }
    if (firstTaken) {
      add(`a taken slot (${firstTaken.slot}) cannot be selected`, { act: 'click', sel: `${q(avSec.props.slotTestid)}[data-slot="${firstTaken.slot}"]` });
      add('the taken slot keeps its state', { act: 'attr', sel: `${q(avSec.props.slotTestid)}[data-slot="${firstTaken.slot}"]`, attr: 'data-state', eq: 'taken' });
    }
  }

  // 7. commit: validation, then a real reference
  const commit = (model.actions || []).find(a => a.kind === 'commit');
  // M039: a bag app's flow lives on the checkout view, not the record
  // page — a step-flow found there must also suppress this section,
  // whose steps assume the form sits on the detail view.
  const stepSecEarly = ir.views.find(v => v.id === 'detail')?.sections.find(s => s.component === 'step-flow')
    || ir.views.find(v => v.id === 'checkout')?.sections.find(s => s.component === 'step-flow');
  if (commit && !stepSecEarly) {
    const ctaSel = q(commit.testid || 'primary-action');
    add('reopening a record for the commit flow', { act: 'goto', view: entry });
    add('opening a record', { act: 'click', sel: `${cardSel}[data-id="${first.id}"]` });

    const requiredField = (commit.form || []).find(f => f.required);
    if (requiredField) {
      add('submitting an empty form is refused', { act: 'click', sel: ctaSel });
      add('the required field shows an error', { act: 'visible', sel: q(requiredField.errorTestid || ('error-' + requiredField.id)), eq: true });
      add('the app did not advance to confirmation', { act: 'attr', sel: '#main', attr: 'data-view', eq: 'detail' });
    }
    const optionalField = (commit.form || []).find(f => !f.required);
    if (optionalField) {
      add(`the optional field "${optionalField.label}" is not treated as required`,
        { act: 'visible', sel: q(optionalField.errorTestid || ('error-' + optionalField.id)), eq: false });
    }
    if (avSec) {
      add('submitting without a time is refused', { act: 'visible', sel: q(avSec.props.errorTestid), eq: true });
      const freeNow = availabilityStates(model.availability, 0, 0, []).find(x => x.state === 'free');
      if (freeNow) add(`choosing ${freeNow.slot}`, { act: 'click', sel: `${q(avSec.props.slotTestid)}[data-slot="${freeNow.slot}"]` });
    } else if (commit.options && commit.options.required) {
      add('submitting without a choice is refused', { act: 'visible', sel: q('error-' + commit.options.id), eq: true });
      add(`choosing ${commit.options.values[0]}`, { act: 'click', sel: `${q('option-' + commit.options.id)}[data-value="${commit.options.values[0]}"]` });
    }
    for (const f of commit.form || []) {
      let v = 'Test ' + (f.label || f.id);
      if (f.pattern && f.pattern.indexOf('\\d{10}') !== -1) v = '9876543210';
      add(`filling ${f.label}`, { act: 'type', sel: q(f.testid || ('field-' + f.id)), value: v });
    }
    add('submitting a valid form reaches confirmation', { act: 'click', sel: ctaSel });
    add('confirmation is shown', { act: 'attr', sel: '#main', attr: 'data-view', eq: 'confirmation' });
    const refTestid = commit.result?.referenceTestid || 'confirm-ref';
    add('a reference is issued in the declared format', {
      act: 'match', sel: q(refTestid),
      pattern: '^' + (commit.result?.referencePrefix || 'REF') + '-\\d{6}$',
    });
    add('the confirmation summarises the submission', { act: 'visible', sel: q(commit.result?.summaryTestid || 'confirm-summary'), eq: true });
    add('the submission survives a reload', { act: 'reload' });
    add('the app returns to a browsable state after reload', { act: 'visible', sel: listSel, eq: true });

    // 8. the committed record is listed and blocks its slot
    const coll = (model.collections || [])[0];
    if (coll) {
      add('the committed record appears in its collection', { act: 'goto', view: coll.view || coll.id });
      add('exactly one record is listed', { act: 'count', sel: q(coll.itemTestid || (coll.id + '-item')), eq: 1 });
      add('the record survives a reload', { act: 'reload' });
      add('the record is still listed after reload', { act: 'goto', view: coll.view || coll.id });
      add('still one record after reload', { act: 'count', sel: q(coll.itemTestid || (coll.id + '-item')), eq: 1 });
      if (avSec && coll.cancel) {
        add('reopening the record shows its slot taken', { act: 'goto', view: entry });
        add('opening the same record', { act: 'click', sel: `${cardSel}[data-id="${first.id}"]` });
        const freeNow2 = availabilityStates(model.availability, 0, 0, []).find(x => x.state === 'free');
        if (freeNow2) {
          add('the booked slot is now taken', { act: 'attr', sel: `${q(avSec.props.slotTestid)}[data-slot="${freeNow2.slot}"]`, attr: 'data-state', eq: 'taken' });
        }
        add('cancelling requires a confirmation step', { act: 'goto', view: coll.view || coll.id });
        add('tapping cancel asks to confirm', { act: 'click', sel: q(coll.cancel.testid || 'cancel-btn') });
        add('the confirmation control appears', { act: 'visible', sel: q(coll.cancel.confirmTestid || 'cancel-confirm'), eq: true });
        add('confirming removes the record', { act: 'click', sel: q(coll.cancel.confirmTestid || 'cancel-confirm') });
        add('the collection is empty again', { act: 'count', sel: q(coll.itemTestid || (coll.id + '-item')), eq: 0 });
        add('the slot is released', { act: 'goto', view: entry });
        add('reopening the record after cancel', { act: 'click', sel: `${cardSel}[data-id="${first.id}"]` });
        if (freeNow2) {
          add('the released slot is free again', { act: 'attr', sel: `${q(avSec.props.slotTestid)}[data-slot="${freeNow2.slot}"]`, attr: 'data-state', eq: 'free' });
        }
      }
    }
  }

  // 9. article
  const artSec = ir.views.find(v => v.id === 'detail')?.sections.find(s => s.component === 'article');
  if (artSec) {
    add('opening a record shows an article body', { act: 'visible', sel: q('article-body'), eq: true });
    add('the article sets a measured column', { act: 'measure', sel: q('article-body'), min: 45, max: 80 });
    add('the standfirst is set larger than the body', { act: 'fontGreater', a: q('standfirst'), b: q('article-body') });
  }

  // 10. multi-step flow
  const stepSec = ir.views.find(v => v.id === 'detail')?.sections.find(s => s.component === 'step-flow');
  const checkoutSec = ir.views.find(v => v.id === 'checkout')?.sections.find(s => s.component === 'step-flow');
  const flowSec = stepSec || checkoutSec;
  if (flowSec && commit) {
    const stepSec = flowSec;
    const n = (stepSec.binding.steps || []).length;
    if (checkoutSec) {
      // M039: the bag journey reaches the flow — add an item, open the
      // bag, check out. The flow's own steps are then identical.
      add('returning to the catalogue for the bag flow', { act: 'goto', view: entry });
      add('adding the first record to the bag', { act: 'click', sel: `${listSel} [data-act="add"][data-id="${first.id}"]` });
      add('opening the bag', { act: 'goto', view: 'bag' });
      add('starting checkout', { act: 'click', sel: q('checkout-btn') });
    } else {
      add('reopening a record for the step flow', { act: 'goto', view: entry });
      add('opening a record', { act: 'click', sel: `${cardSel}[data-id="${first.id}"]` });
    }
    add(`the flow shows ${n} steps`, { act: 'count', sel: q('step'), eq: n });
    add('the first step is current', { act: 'attr', sel: q('step') + '[data-step="1"]', attr: 'data-state', eq: 'current' });
    // Fill each step's fields while that step is current, advancing between
    // steps. The previous plan emitted every fill first and the Continue
    // clicks afterwards, so it typed into step 2's fields while step 1 was
    // still on screen: the driver could not fill them, validation blocked
    // the advance, and one ordering defect failed most of the flow's steps.
    const fillValue = (f) => {
      let v = 'Test ' + (f.label || f.id);
      if (f.type === 'date') v = '2027-01-15';
      else if (f.pattern && f.pattern.indexOf('\\d{10}') !== -1) v = '9876543210';
      else if (f.type === 'number' || (f.pattern && /\\d\+/.test(f.pattern))) v = '2450';
      return v;
    };
    const fillField = (f) => add(`filling ${f.label}`, { act: 'type', sel: q(f.testid || ('field-' + f.id)), value: fillValue(f) });
    const stepDefs = stepSec.binding.steps || commit.steps || [];
    const assigned = new Set(stepDefs.flatMap(st => st.fields || []));
    // Fields assigned to no step are filled on the first step, as before.
    (commit.form || []).filter(f => !assigned.has(f.id)).forEach(fillField);
    let backChecked = false;
    stepDefs.forEach((st, i) => {
      for (const fid of (st.fields || [])) {
        const f = (commit.form || []).find(x => x.id === fid);
        if (f) fillField(f);
      }
      if (i >= stepDefs.length - 1) return;
      add(i === 0 ? 'Continue advances the flow' : `Continue to step ${i + 2}`, { act: 'click', sel: q('step-next') });
      add(`step ${i + 2} is current`, { act: 'attr', sel: q('step') + '[data-step="' + (i + 2) + '"]', attr: 'data-state', eq: 'current' });
      if (!backChecked && i === 0 && stepDefs.length > 1) {
        backChecked = true;
        add('Back returns to the first step', { act: 'click', sel: q('step-back') });
        add('the first step is current again', { act: 'attr', sel: q('step') + '[data-step="1"]', attr: 'data-state', eq: 'current' });
        add('Continue advances the flow again', { act: 'click', sel: q('step-next') });
        add('the second step is current', { act: 'attr', sel: q('step') + '[data-step="2"]', attr: 'data-state', eq: 'current' });
      }
    });
    add('the final step is current', { act: 'attr', sel: q('step') + '[data-step="' + n + '"]', attr: 'data-state', eq: 'current' });
    add('committing issues a reference', {
      act: 'click', sel: q(stepSec.props.commitTestid || 'primary-action'),
    });
    add('the confirmation is shown', { act: 'attr', sel: '#main', attr: 'data-view', eq: 'confirmation' });
    add('a reference is issued in the declared format', {
      act: 'match', sel: q(commit.result?.referenceTestid || 'confirm-ref'),
      pattern: '^' + (commit.result?.referencePrefix || 'REF') + '-\\d{6}$',
    });
  }

  add('no page or console errors occurred', { act: 'console', eq: 0 });

  return {
    app: brief.brand,
    entity: ent.id,
    entryView: entry,
    recordCount: records.length,
    derivedFrom: `layout IR v${ir.irVersion} (planner ${ir.meta.plannerVersion})`,
    steps,
  };
}

// ---------------------------------------------------------------------------
// Inspection contract
// ---------------------------------------------------------------------------

export function planInspectContract(brief, ir, model) {
  const ent = ir.entity;
  const records = model.records || [];
  const first = records[0];
  const entry = ir.views[0].id;
  const collSec = ir.views.find(v => v.id === entry).sections.find(s => s.component === 'entity-collection' || s.component === 'data-table');
  const cardSel = q(collSec.props.itemTestid);
  const filterSec = ir.views.find(v => v.id === entry).sections.find(s => s.component === 'filter-chips');
  const field = filterSec ? (ent.fields || []).find(f => f.id === filterSec.binding.field) : null;
  const option = field && field.options && field.options[0];
  const vattr = filterSec ? (filterSec.props.valueAttr || 'data-value') : 'data-value';
  const avSec = ir.views.find(v => v.id === 'detail')?.sections.find(s => s.component === 'availability-picker');
  const commit = (model.actions || []).find(a => a.kind === 'commit');
  const requiredField = commit && (commit.form || []).find(f => f.required);
  const ctaSel = q((commit && commit.testid) || 'primary-action');

  const isTable = collSec.component === 'data-table';
  const steps = [{ shot: 'browse-390' }];
  if (!isTable) {
    steps.push({ measure: 'cardTitle', kind: 'rest', selector: `${cardSel} .card-title, ${cardSel} .row-title`, sequence: ['initial render'] });
    steps.push({ measure: 'cardSub', kind: 'rest', selector: `${cardSel} .card-sub, ${cardSel} .row-sub`, sequence: ['initial render'] });
  }

  if (option) {
    const chip = `${q(filterSec.props.testid)}[${vattr}="${option}"]`;
    steps.push({ centre: chip });
    steps.push({ click: chip, settleMs: 250 });
    steps.push({ measure: 'chipSelected', kind: 'selected', selector: chip, sequence: ['select filter'] });
    steps.push({ shot: 'browse-filtered-390' });
    steps.push({ click: `${q(filterSec.props.testid)}[${vattr}="${filterSec.props.allLabel || 'All'}"]`, settleMs: 250 });
  }

  steps.push({ centre: `${cardSel}[data-id="${first.id}"]` });
  steps.push({ click: `${cardSel}[data-id="${first.id}"]`, settleMs: 350 });
  steps.push({ shot: 'detail-390' });
  steps.push({ measure: 'detailTitle', kind: 'rest', selector: q('detail-title'), sequence: ['open first record'] });

  if (commit) {
    if (avSec) {
      // The selected day chip is a distinct state from the selected slot, and
      // Mission 020 documented both. Keep measuring both.
      steps.push({ measure: 'daySelected', kind: 'selected', selector: `${q(avSec.props.dayTestid)}[aria-pressed="true"]`, sequence: ['day 0 preselected'] });
      const freeSlot = availabilityStates(model.availability, 0, 0, []).find(x => x.state === 'free');
      const takenSlot = availabilityStates(model.availability, 0, 0, []).find(x => x.state === 'taken');
      if (takenSlot) {
        steps.push({ measure: 'slotTaken', kind: 'disabled', selector: `${q(avSec.props.slotTestid)}[data-slot="${takenSlot.slot}"]`, sequence: ['day 0'] });
      }
      if (freeSlot) {
        steps.push({ centre: `${q(avSec.props.slotTestid)}[data-slot="${freeSlot.slot}"]` });
        steps.push({ click: `${q(avSec.props.slotTestid)}[data-slot="${freeSlot.slot}"]`, settleMs: 250 });
        steps.push({ measure: 'slotSelected', kind: 'selected', selector: `${q(avSec.props.slotTestid)}[data-slot="${freeSlot.slot}"]`, sequence: ['choose a slot'] });
      }
    } else if (commit.options && commit.options.required) {
      const os = `${q('option-' + commit.options.id)}[data-value="${commit.options.values[0]}"]`;
      steps.push({ centre: os });
      steps.push({ click: os, settleMs: 250 });
      steps.push({ measure: 'optionSelected', kind: 'selected', selector: os, sequence: ['choose an option'] });
    }

    steps.push({ measure: 'ctaRest', kind: 'rest', selector: ctaSel, sequence: ['detail view, pointer away'] });
    steps.push({ centre: ctaSel });
    steps.push({ hover: ctaSel, settleMs: 300 });
    steps.push({ measure: 'ctaHover', kind: 'hover', selector: ctaSel, sequence: ['hover the primary action'] });

    if (requiredField) {
      steps.push({ click: ctaSel, settleMs: 350 });
      steps.push({ measure: 'errorText', kind: 'error', selector: q(requiredField.errorTestid || ('error-' + requiredField.id)), sequence: ['submit an empty form'] });
      steps.push({ shot: 'detail-errors-390' });
    }

    const sets = (commit.form || []).map(f => {
      let v = 'Test ' + (f.label || f.id);
      if (f.pattern && f.pattern.indexOf('\\d{10}') !== -1) v = '9876543210';
      return { selector: q(f.testid || ('field-' + f.id)), value: v };
    });
    if (sets.length) steps.push({ setValues: sets });
    steps.push({ centre: ctaSel });
    steps.push({ click: ctaSel, settleMs: 450 });
    steps.push({ shot: 'confirmation-390' });
    steps.push({ measure: 'confirmRef', kind: 'post-action', selector: q(commit.result?.referenceTestid || 'confirm-ref'), sequence: ['complete a submission'] });
  }

  steps.push({ axe: entry });
  steps.push({ viewport: { width: 1440, height: 900 } });
  steps.push({ click: `[data-act="nav"][data-view="${entry}"], [data-act="go"][data-view="${entry}"]`, settleMs: 350, optional: true });
  steps.push({ shot: 'browse-1440' });
  steps.push({ centre: `${cardSel}[data-id="${first.id}"]` });
  steps.push({ click: `${cardSel}[data-id="${first.id}"]`, settleMs: 300 });
  steps.push({ shot: 'detail-1440' });
  steps.push({ axe: 'detail' });

  return {
    id: `${ent.id}-generated`,
    app: 'app',
    viewport: { width: 390, height: 844 },
    desktop: { width: 1440, height: 900 },
    derivedFrom: `layout IR v${ir.irVersion} (planner ${ir.meta.plannerVersion})`,
    steps,
  };
}
