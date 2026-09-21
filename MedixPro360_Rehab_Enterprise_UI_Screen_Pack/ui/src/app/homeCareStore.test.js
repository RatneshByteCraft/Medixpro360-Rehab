import test from 'node:test';
import assert from 'node:assert/strict';
import { demoProfiles, PERMISSIONS, can } from './access.js';
import { getSearchResults, getVisibleTasks, resetCrossCuttingStore } from './crossCuttingStore.js';
import { HOMECARE_STATUSES, activateHomeCareEnrollment, activateHomeCarePlan, assignHomeCareStaff, cancelHomeCareVisit, completeHomeCareVisit, createHomeCareEnrollment, createHomeCarePlan, createHomeCareFollowUp, escalateHomeCareConcern, getHomeCareState, getHomeCareVisibleRecords, markHomeCareVisitMissed, resetHomeCareStore, saveHomeVisitDraft, scheduleHomeVisit, startHomeVisit } from './homeCareStore.js';

test('Home Care lifecycle keeps canonical client and admission references', () => {
  resetHomeCareStore();
  const enrollmentId = createHomeCareEnrollment({ clientId: 'client-1002', admissionId: 'adm-1002', programme: 'Community recovery support', effectiveStart: '22 Sep 2026' });
  assert.ok(enrollmentId);
  assert.equal(activateHomeCareEnrollment(enrollmentId), true);
  const planId = createHomeCarePlan({ enrollmentId, objectives: ['Maintain routines'], serviceTypes: ['Wellbeing check'], treatmentPlanReference: 'client-1002' });
  assert.ok(planId);
  assert.equal(activateHomeCarePlan(planId), true);
  const visitId = scheduleHomeVisit({ enrollmentId, planId, service: 'Wellbeing check', scheduledDate: '22 Sep 2026', scheduledTime: '10:30' });
  assert.ok(visitId);
  assert.equal(scheduleHomeVisit({ enrollmentId, planId, service: 'Wellbeing check', scheduledDate: '22 Sep 2026', scheduledTime: '10:30' }), visitId);
  assert.equal(assignHomeCareStaff(visitId, 'staff-hc-1'), true);
  assert.equal(startHomeVisit(visitId), true);
  assert.equal(saveHomeVisitDraft(visitId, { observations: 'Stable and engaged.', outcome: 'Routine support completed.' }), true);
  assert.equal(completeHomeCareVisit(visitId), true);
  const state = getHomeCareState();
  const visit = state.visits.find(item => item.id === visitId);
  assert.equal(visit.status, HOMECARE_STATUSES.COMPLETED);
  assert.equal(visit.clientId, 'client-1002');
  assert.equal(visit.admissionId, 'adm-1002');
  assert.equal(state.documents.find(item => item.visitId === visitId).status, 'Finalized');
  assert.equal(state.events.some(item => item.id === `homecare-visit:${visitId}:completed`), true);
});

test('missed and cancelled visits remain distinct and protect duplicate follow-up', () => {
  resetHomeCareStore();
  const enrollmentId = 'hc-enrollment-1001';
  const missedId = scheduleHomeVisit({ enrollmentId, service: 'Care coordination', scheduledDate: '23 Sep 2026', scheduledTime: '11:00' });
  const followUpId = markHomeCareVisitMissed(missedId, 'Client unavailable');
  assert.ok(followUpId);
  assert.equal(createHomeCareFollowUp({ visitId: missedId, clientId: 'client-1001', reason: 'Missed visit follow-up' }), followUpId);
  const cancelledId = scheduleHomeVisit({ enrollmentId, service: 'Wellbeing check', scheduledDate: '24 Sep 2026', scheduledTime: '11:00' });
  assert.equal(cancelHomeCareVisit(cancelledId, 'Caregiver unavailable'), true);
  assert.equal(getHomeCareState().visits.find(item => item.id === missedId).status, HOMECARE_STATUSES.MISSED);
  assert.equal(getHomeCareState().visits.find(item => item.id === cancelledId).status, HOMECARE_STATUSES.CANCELLED);
});

test('Home Care scope and permissions filter centre and tenant records', () => {
  resetHomeCareStore();
  resetCrossCuttingStore();
  assert.equal(can(demoProfiles.homeCare, PERMISSIONS.HOMECARE_VISIT_COMPLETE, 'home-care'), true);
  assert.equal(can(demoProfiles.billing, PERMISSIONS.HOMECARE_VIEW, 'home-care'), false);
  assert.equal(getHomeCareVisibleRecords(demoProfiles.homeCare).visits.length, 1);
  assert.equal(getHomeCareVisibleRecords(demoProfiles.centre).visits.length, 1);
  assert.equal(getHomeCareVisibleRecords(demoProfiles.tenant2).visits.length, 0);
  assert.equal(getVisibleTasks(demoProfiles.tenant2).some(item => item.module === 'home-care'), false);
  assert.equal(getSearchResults(demoProfiles.tenant2).some(item => item.type === 'Home Care'), false);
});

test('safety escalation creates one scoped task and notification source', () => {
  resetHomeCareStore();
  resetCrossCuttingStore();
  const id = escalateHomeCareConcern({ visitId: 'hc-visit-1001', concern: 'Unsafe environment reported.' });
  assert.ok(id);
  const state = getHomeCareState();
  assert.equal(state.followUps.some(item => item.id === id && item.status === 'Open'), true);
  assert.equal(getVisibleTasks(demoProfiles.homeCare).filter(item => item.sourceRecordId === id).length, 1);
});
