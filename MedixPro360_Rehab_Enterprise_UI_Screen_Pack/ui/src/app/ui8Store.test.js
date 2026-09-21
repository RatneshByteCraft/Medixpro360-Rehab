import test from 'node:test';
import assert from 'node:assert/strict';
import { demoProfiles, PERMISSIONS, can } from './access.js';
import { getUi3State, resetUi3Store } from './ui3Store.js';
import { getUi6State, resetUi6Store } from './ui6Store.js';
import { resetCrossCuttingStore } from './crossCuttingStore.js';
import { UI8_STATUS, activateAftercarePlan, activateNutritionPlan, completeAftercareFollowUp, completeTelehealthSession, createNutritionPlan, finalizeDischarge, finalizeNutritionAssessment, getUi8State, getUi8VisibleRecords, recordFamilySession, resetUi8Store, reviewDischargePlan, startTelehealthSession, updateDischargeReadiness } from './ui8Store.js';

test('nutrition assessment finalization is immutable and plan requires finalized source', () => {
  resetUi8Store();
  assert.equal(finalizeNutritionAssessment('nutrition-assessment-1001'), false);
  const planId = createNutritionPlan({ assessmentId: 'nutrition-assessment-1001', goals: ['Support intake'] });
  assert.ok(planId);
  const item = getUi8State().nutritionAssessments[0];
  assert.equal(item.status, UI8_STATUS.FINALIZED);
  const draft = { ...item, status: UI8_STATUS.DRAFT, finalizedAt: null };
  getUi8State().nutritionAssessments[0] = draft;
  assert.equal(finalizeNutritionAssessment(item.id), true);
  assert.equal(finalizeNutritionAssessment(item.id), false);
});

test('family session requires an authorization check', () => {
  resetUi8Store();
  assert.equal(recordFamilySession('family-session-1001', { outcome: 'Discussed care' }, { authorizationChecked: false }), false);
  assert.equal(recordFamilySession('family-session-1001', { outcome: 'Discussed care' }, { authorizationChecked: true }), true);
  assert.equal(getUi8State().familySessions[0].status, UI8_STATUS.COMPLETED);
});

test('telehealth prevents duplicate start and completion', () => {
  resetUi8Store();
  assert.equal(startTelehealthSession('telehealth-1001'), true);
  assert.equal(startTelehealthSession('telehealth-1001'), false);
  assert.equal(completeTelehealthSession('telehealth-1001', { outcome: 'Completed' }), true);
  assert.equal(completeTelehealthSession('telehealth-1001', { outcome: 'Duplicate' }), false);
  assert.equal(getUi8State().telehealthAppointments[0].status, UI8_STATUS.COMPLETED);
});

test('discharge readiness blocks finalization, then closes canonical occupancy exactly once', () => {
  resetUi8Store();
  resetUi3Store();
  resetUi6Store();
  resetCrossCuttingStore();
  const planId = 'discharge-plan-1001';
  assert.equal(finalizeDischarge({ clientId: 'client-1001', admissionId: 'adm-1001', dischargePlanId: planId, disposition: 'Completed residential episode', destination: 'Home' }), false);
  const plan = getUi8State().dischargePlans[0];
  plan.checklist.filter(item => item.required && !['Completed', UI8_STATUS.NOT_APPLICABLE].includes(item.status)).forEach(item => updateDischargeReadiness(planId, item.id, { status: 'Completed' }, { actor: 'Arjun Rao' }));
  assert.equal(reviewDischargePlan(planId), true);
  assert.equal(finalizeDischarge({ clientId: 'client-1001', admissionId: 'adm-1001', dischargePlanId: planId, disposition: 'Completed residential episode', destination: 'Home' }), true);
  assert.equal(finalizeDischarge({ clientId: 'client-1001', admissionId: 'adm-1001', dischargePlanId: planId, disposition: 'Completed residential episode', destination: 'Home' }), false);
  assert.equal(getUi3State().clients.find(item => item.id === 'client-1001').status, 'Discharged');
  assert.equal(getUi6State().occupancyHistory.filter(item => item.clientId === 'client-1001' && !item.to).length, 0);
  assert.equal(getUi6State().occupancyHistory.find(item => item.id === 'occupancy-1001').bedId, 'bed-1001');
  assert.equal(getUi6State().beds.find(item => item.id === 'bed-1001').status, 'Available');
});

test('aftercare activates and survives the discharged admission reference', () => {
  resetUi8Store();
  assert.equal(activateAftercarePlan('aftercare-plan-1001'), true);
  const followUp = getUi8State().aftercareFollowUps[0];
  assert.equal(completeAftercareFollowUp(followUp.id, { outcome: 'Completed', nextAction: 'Continue support' }), true);
  assert.equal(getUi8State().aftercarePlans[0].admissionId, 'adm-1001');
  assert.equal(getUi8State().aftercareFollowUps[0].status, UI8_STATUS.COMPLETED);
});

test('UI-8 permission and tenant/location scope are enforced', () => {
  resetUi8Store();
  assert.equal(can(demoProfiles.clinician, PERMISSIONS.DISCHARGE_FINALIZE, 'discharge'), true);
  assert.equal(can(demoProfiles.billing, PERMISSIONS.DISCHARGE_VIEW, 'discharge'), false);
  assert.equal(getUi8VisibleRecords(demoProfiles.clinician).dischargePlans.length, 1);
  assert.equal(getUi8VisibleRecords(demoProfiles.tenant2).dischargePlans.length, 0);
  assert.equal(getUi8VisibleRecords(demoProfiles.centreB).dischargePlans.length, 0);
});
