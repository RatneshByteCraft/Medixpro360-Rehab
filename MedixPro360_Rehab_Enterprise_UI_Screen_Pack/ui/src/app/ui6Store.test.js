import test from 'node:test';
import assert from 'node:assert/strict';
import { demoProfiles, hasPermission, PERMISSIONS } from './access.js';
import { getUi3State } from './ui3Store.js';
import { addTask, getSearchResults, getVisibleNotifications, getVisibleTasks, resetCrossCuttingStore } from './crossCuttingStore.js';
import { acknowledgeHandover, activateMedicationOrder, addMedicationOrder, addResidentialNote, assignBed, completeCheck, createIncident, createPrnAdministration, correctMar, correctObservation, discontinueMedicationOrder, finalizeHandover, getMedicationSchedule, getUi6State, recordMar, recordObservation, recordPrnFollowup, releaseBedForDischarge, resetUi6Store, reviewIncident, startLeave, returnFromLeave, transferBed, updateHandover, updateIncident } from './ui6Store.js';

test('nurse administration and prescriber ordering are separate capabilities', () => {
  assert.equal(hasPermission(demoProfiles.nurse, PERMISSIONS.MAR_ADMINISTER), true);
  assert.equal(hasPermission(demoProfiles.nurse, PERMISSIONS.MEDICATION_ORDER), false);
  assert.equal(hasPermission(demoProfiles.clinician, PERMISSIONS.MEDICATION_ORDER), true);
  assert.equal(hasPermission(demoProfiles.nurse, PERMISSIONS.MAR_CORRECT), false);
  assert.equal(hasPermission(demoProfiles.clinician, PERMISSIONS.MAR_CORRECT), true);
});

test('MAR exceptions require a reason and finalized entries use controlled correction', () => {
  resetUi6Store();
  assert.equal(recordMar('mar-1001', 'Refused'), false);
  assert.equal(recordMar('mar-1001', 'Refused', { reason: 'Client declined' }), true);
  const before = getUi6State().mar[0];
  assert.equal(before.status, 'Refused');
  correctObservation('obs-1001', 'Correction', 'Engaged and comfortable');
  assert.equal(getUi6State().observations[0].corrections.length, 1);
  assert.equal(correctMar('mar-1001', '', { status: 'Administered' }), false);
  assert.equal(correctMar('mar-1001', 'Correction reason', { status: 'Administered' }), true);
  assert.equal(getUi6State().mar[0].corrections[0].original.status, 'Refused');
});

test('PRN administration requires an active PRN order', () => {
  resetUi6Store();
  resetCrossCuttingStore();
  const id = createPrnAdministration('med-1002', 'Pain reported');
  assert.ok(id);
  assert.equal(getUi6State().mar.some(item => item.id === id && item.status === 'Due'), true);
  recordMar(id, 'Administered');
  assert.equal(getUi6State().prnFollowups.filter(item => item.marId === id).length, 1);
  assert.equal(getVisibleTasks(demoProfiles.nurse).filter(item => item.sourceRecordType === 'PRNFollowup').length, 1);
  assert.equal(getVisibleNotifications(demoProfiles.nurse).some(item => item.sourceRecordType === 'PRNFollowup'), true);
  recordPrnFollowup(id, 'Effective', 'Pain reduced.');
  assert.equal(getUi6State().prnFollowups.some(item => item.marId === id && item.status === 'Completed'), true);
  assert.equal(getVisibleTasks(demoProfiles.nurse).filter(item => item.sourceRecordType === 'PRNFollowup').length, 1);
  assert.equal(getVisibleTasks(demoProfiles.nurse).find(item => item.sourceRecordType === 'PRNFollowup').status, 'Completed');
  assert.equal(getVisibleNotifications(demoProfiles.nurse).some(item => item.sourceRecordType === 'PRNFollowup'), false);
});

test('nursing care check synchronizes one canonical shared task and preserves location scope', () => {
  resetUi6Store();
  resetCrossCuttingStore();
  const nurse = demoProfiles.nurse;
  assert.equal(getVisibleTasks(nurse).filter(task => task.sourceRecordId === 'check-1001').length, 1);
  completeCheck('check-1001', 'Completed during shift.');
  const task = getVisibleTasks(nurse).find(item => item.sourceRecordId === 'check-1001');
  assert.equal(task.status, 'Completed');
  assert.equal(task.completedBy, 'Nisha Verma');
  assert.equal(task.completedAt, 'Just now');
  assert.equal(getVisibleTasks(nurse).filter(item => item.sourceRecordId === 'check-1001').length, 1);
  addTask({ id: 'task-out-of-scope', title: 'Community service task', owner: 'Coordinator', due: 'Today', status: 'Due', sourceModule: 'nursing', sourceRecordType: 'CareCheck', sourceRecordId: 'check-out-of-scope', clientId: 'client-1001', location: 'Greater Noida Community Service', permissions: [PERMISSIONS.NURSING_VIEW], module: 'nursing', destinationRoute: '/clients/client-1001/nursing', sensitivity: 'clinical' });
  assert.equal(getVisibleTasks(nurse).some(item => item.sourceRecordId === 'check-out-of-scope'), false);
});

test('medication schedule derives from active orders and preserves MAR history', () => {
  resetUi6Store();
  const initialSchedule = getMedicationSchedule('client-1001');
  assert.equal(initialSchedule[0].medicationOrderId, 'med-1001');
  assert.equal(initialSchedule[0].scheduleEntryId, 'schedule-med-1001');
  assert.equal(initialSchedule[0].administrationStatus, 'Due');
  recordMar('mar-1001', 'Administered');
  assert.equal(getMedicationSchedule('client-1001')[0].administrationStatus, 'Administered');
  discontinueMedicationOrder('med-1001', 'Order replaced');
  assert.equal(getMedicationSchedule('client-1001').some(item => item.medicationOrderId === 'med-1001'), false);
  assert.equal(getUi6State().mar.some(item => item.id === 'mar-1001' && item.status === 'Administered'), true);
  addMedicationOrder({ clientId: 'client-1001', medication: 'Draft medication', dose: '10 mg', strength: '10 mg', route: 'Oral', frequency: 'Once daily', schedule: '09:00', prn: false });
  const draft = getUi6State().medicationOrders.find(item => item.medication === 'Draft medication');
  assert.equal(getMedicationSchedule('client-1001').some(item => item.medicationOrderId === draft.id), false);
  activateMedicationOrder(draft.id);
  assert.equal(getMedicationSchedule('client-1001').some(item => item.medicationOrderId === draft.id && item.administrationStatus === 'Scheduled'), true);
});

test('medication exception preserves outcome, resolves Due state, and creates one canonical task', () => {
  resetUi6Store();
  resetCrossCuttingStore();
  assert.equal(recordMar('mar-1001', 'Refused'), false);
  assert.equal(recordMar('mar-1001', 'Refused', { reason: 'Client declined medication after explanation.' }), true);
  const mar = getUi6State().mar.find(item => item.id === 'mar-1001');
  assert.equal(mar.status, 'Refused');
  assert.equal(mar.actualTime, null);
  assert.equal(mar.administeredBy, null);
  assert.equal(getMedicationSchedule('client-1001')[0].administrationStatus, 'Refused');
  const tasks = getVisibleTasks(demoProfiles.nurse).filter(task => task.sourceRecordId === 'mar-1001');
  assert.equal(tasks.length, 1);
  assert.equal(tasks[0].title, 'Medication exception: Refused');
  assert.equal(tasks[0].destinationRoute, '/clients/client-1001/mar');
  assert.equal(getVisibleTasks(demoProfiles.residential).some(task => task.sourceRecordId === 'mar-1001'), false);
});

test('timeline identity preserves same-display residential events and incident lifecycle events', () => {
  resetUi6Store();
  addResidentialNote('client-1001', { category: 'General wellbeing', observation: 'Same-minute note one' });
  addResidentialNote('client-1001', { category: 'General wellbeing', observation: 'Same-minute note two' });
  createIncident({ clientId: 'client-1001', location: 'Residential Unit A', category: 'Residential observation', description: 'Incident report.' });
  const incidentId = getUi6State().incidents[0].id;
  updateIncident(incidentId, { status: 'Closed' });
  const events = getUi6State().events.filter(event => event.clientId === 'client-1001');
  const notes = events.filter(event => event.type === 'Residential Note');
  const incidentEvents = events.filter(event => event.recordId === incidentId);
  assert.equal(notes.length, 2);
  assert.notEqual(notes[0].id, notes[1].id);
  assert.equal(new Set(notes.map(event => event.id)).size, 2);
  assert.equal(incidentEvents.some(event => event.type === 'Incident Submitted'), true);
  assert.equal(incidentEvents.some(event => event.type === 'Incident Closed'), true);
  assert.equal(new Set(incidentEvents.map(event => event.id)).size, 2);
});

test('handover draft finalization and acknowledgement preserve one record and provenance', () => {
  resetUi6Store();
  const handover = getUi6State().handovers[0];
  updateHandover(handover.id, { summary: 'Continue scheduled observations during incoming shift.' });
  assert.equal(getUi6State().handovers.filter(item => item.id === handover.id).length, 1);
  finalizeHandover(handover.id);
  assert.equal(getUi6State().handovers[0].status, 'Finalized');
  assert.equal(getUi6State().handovers[0].finalizedBy, 'Nisha Verma');
  const summary = getUi6State().handovers[0].summary;
  acknowledgeHandover(handover.id);
  acknowledgeHandover(handover.id);
  const acknowledged = getUi6State().handovers[0];
  assert.equal(acknowledged.id, handover.id);
  assert.equal(acknowledged.status, 'Acknowledged');
  assert.equal(acknowledged.finalizedBy, 'Nisha Verma');
  assert.equal(acknowledged.summary, summary);
  assert.ok(acknowledged.acknowledgedBy);
});

test('cross-centre and cross-tenant records remain isolated in shared search', () => {
  const centreA = demoProfiles.centre;
  const centreB = demoProfiles.centreB;
  const tenant2 = demoProfiles.tenant2;
  assert.equal(getSearchResults(centreA).some(record => record.id === 'search-client-centre-b'), false);
  assert.equal(getSearchResults(centreB).some(record => record.id === 'search-client-centre-b'), true);
  assert.equal(getSearchResults(centreB).some(record => record.id === 'search-client-tenant-2'), false);
  assert.equal(getSearchResults(tenant2).some(record => record.id === 'search-client-tenant-2'), true);
  assert.equal(getSearchResults(tenant2).some(record => record.id === 'search-client-centre-b'), false);
});

test('bed assignment and transfer prevent double occupancy and preserve movement state', () => {
  resetUi6Store();
  assert.equal(getUi3State().clients.find(item => item.id === 'client-1002').id, getUi6State().residents.find(item => item.id === 'client-1002').clientId);
  assert.equal(assignBed('client-1002', 'bed-1001'), false);
  assert.equal(assignBed('client-1002', 'bed-1002'), true);
  const assigned = getUi6State().occupancyHistory.find(item => item.clientId === 'client-1002' && !item.to);
  assert.equal(assigned.admissionId, 'adm-1002');
  assert.equal(assigned.bedId, 'bed-1002');
  assert.equal(assignBed('client-1002', 'bed-1003'), false);
  assert.equal(getUi6State().occupancyHistory.filter(item => item.clientId === 'client-1002' && !item.to).length, 1);
  assert.ok(transferBed('client-1001', 'bed-1003', 'Unit transfer'));
  assert.equal(getUi6State().beds.find(item => item.id === 'bed-1001').status, 'Available');
  assert.equal(getUi6State().residents.find(item => item.id === 'client-1001').bed, 'B-03');
  const history = getUi6State().occupancyHistory.filter(item => item.clientId === 'client-1001');
  assert.equal(history.filter(item => item.status === 'Active' && !item.to).length, 1);
  assert.equal(history.find(item => item.bedId === 'bed-1001')?.bed, 'A-12');
  assert.equal(history.find(item => item.bedId === 'bed-1001')?.status, 'Transferred');
  assert.equal(history.find(item => item.bedId === 'bed-1003')?.admissionId, 'adm-1001');
  assert.equal(transferBed('client-1001', 'bed-1003', 'Duplicate transfer'), false);
});

test('temporary leave does not discharge the resident and return restores residence', () => {
  resetUi6Store();
  assert.ok(startLeave('client-1001', '20 Sep 2026 · 18:00', 'Family visit'));
  assert.equal(getUi6State().residents.find(item => item.id === 'client-1001').leaveStatus, 'On leave');
  assert.equal(getUi6State().beds.find(item => item.id === 'bed-1001').status, 'Occupied');
  assert.equal(getUi6State().beds.find(item => item.id === 'bed-1001').leaveStatus, 'On leave');
  assert.equal(getUi6State().leaveEpisodes.length, 1);
  assert.equal(getUi6State().leaveEpisodes[0].admissionId, 'adm-1001');
  assert.equal(startLeave('client-1001', '20 Sep 2026 · 18:00', 'Duplicate'), false);
  assert.equal(returnFromLeave('client-1001'), true);
  assert.equal(getUi6State().residents.find(item => item.id === 'client-1001').leaveStatus, 'In residence');
  assert.equal(getUi6State().beds.find(item => item.id === 'bed-1001').status, 'Occupied');
  assert.equal(getUi6State().leaveEpisodes[0].status, 'Completed');
  assert.equal(returnFromLeave('client-1001'), false);
});

test('incident review and discharge-side bed release preserve state', () => {
  resetUi6Store();
  createIncident({ clientId: 'client-1001', location: 'Residential Unit A', category: 'Fall', description: 'Observed fall without injury.' });
  const incident = getUi6State().incidents[0];
  reviewIncident(incident.id, 'Supervisor reviewed.', 'Under Review');
  assert.equal(getUi6State().incidents[0].status, 'Under Review');
  updateIncidentForTest(incident.id);
  assert.equal(releaseBedForDischarge('client-1001'), true);
  assert.equal(getUi6State().beds.find(item => item.id === 'bed-1001').status, 'Available');
});

function updateIncidentForTest(id) { reviewIncident(id, 'Closed review.', 'Closed'); }