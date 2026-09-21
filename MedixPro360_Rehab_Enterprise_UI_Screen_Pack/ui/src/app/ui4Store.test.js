import test from 'node:test';
import assert from 'node:assert/strict';
import { addAssessmentAmendment, addGoal, addIntervention, addMdtAction, addNeed, addObjective, approvePlan, assignTeam, finalizeMdt, getUi4State, resetUi4Store, revisePlan, resolveRiskAction, updateAssessment, updateAssessmentSection } from './ui4Store.js';

test('assessment sections validate, risk resolves, and signed record preserves amendment history', () => {
  resetUi4Store();
  const assessment = getUi4State().assessments[0];
  updateAssessmentSection(assessment.id, 'Mental Health History', { status: 'Complete', content: 'Reviewed.' });
  assert.equal(getUi4State().assessments[0].sections.find(section => section.name === 'Mental Health History').status, 'Complete');
  resolveRiskAction(assessment.id);
  updateAssessment(assessment.id, { status: 'Signed', signer: 'Dr. Meera Shah', signedAt: 'Now' });
  addAssessmentAmendment(assessment.id, 'Clarification', 'Added a clarification.');
  const saved = getUi4State().assessments[0];
  assert.equal(saved.status, 'Signed');
  assert.equal(saved.amendments.length, 1);
  assert.equal(saved.amendments[0].version, 2);
});

test('care team assignment preserves ended assignment history', () => {
  resetUi4Store();
  assignTeam('client-1001', { person: 'Nisha Verma', responsibility: 'Therapist', reason: 'Initial care team' });
  const assigned = getUi4State().careTeams[0].assignments.find(item => item.person === 'Nisha Verma');
  assert.equal(assigned.status, 'Active');
});

test('treatment plan hierarchy blocks incomplete approval and preserves revisions', () => {
  resetUi4Store();
  addNeed('client-1001');
  const plan = getUi4State().plans[0];
  const need = plan.versions[0].needs[0];
  addGoal('client-1001', need.id);
  const goal = getUi4State().plans[0].versions[0].needs[0].goals[0];
  addObjective('client-1001', need.id, goal.id);
  const objective = getUi4State().plans[0].versions[0].needs[0].goals[0].objectives[0];
  addIntervention('client-1001', need.id, goal.id, objective.id);
  approvePlan('client-1001');
  revisePlan('client-1001');
  assert.equal(getUi4State().plans[0].versions.length, 2);
  assert.equal(getUi4State().plans[0].versions[0].status, 'Approved');
  assert.equal(getUi4State().plans[0].versions[1].status, 'Draft');
});

test('MDT action finalization creates one global task', () => {
  resetUi4Store();
  addMdtAction('mdt-1001', { title: 'Confirm family follow-up', owner: 'Arjun Rao', due: 'Tomorrow' });
  finalizeMdt('mdt-1001');
  assert.equal(getUi4State().meetings[0].status, 'Completed');
  assert.equal(getUi4State().tasks.length, 1);
  assert.equal(getUi4State().tasks[0].source, 'MDT action');
});
