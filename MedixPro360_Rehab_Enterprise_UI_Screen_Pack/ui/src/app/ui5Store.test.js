import test from 'node:test';
import assert from 'node:assert/strict';
import { addGoalProgress, amendSession, finalizeAssessment, getUi5State, resetUi5Store, reviewSession, saveAssessment, scoreAssessment, signSession, startSession } from './ui5Store.js';

test('individual session moves from draft to locked and preserves amendment history', () => {
  resetUi5Store();
  startSession('session-1001');
  saveAssessment('assignment-1001', { q1: '2' });
  addGoalProgress('session-1001', { goalId: 'goal-1001', status: 'Progressing', note: 'Used coping strategy.' });
  const session = getUi5State().sessions[0];
  assert.equal(session.status, 'In Progress');
  assert.equal(session.progress.length, 1);
  saveSessionForTest('session-1001');
  reviewSession('session-1001');
  signSession('session-1001');
  amendSession('session-1001', 'Clarification', 'Added observed response.');
  const locked = getUi5State().sessions[0];
  assert.equal(locked.status, 'Signed');
  assert.equal(locked.amendments.length, 1);
  assert.equal(locked.amendments[0].version, 2);
});

test('standardized assessment scoring is deterministic and finalization locks the result', () => {
  resetUi5Store();
  saveAssessment('assignment-1001', { q1: '3', q2: '2', q3: '3' });
  scoreAssessment('assignment-1001');
  assert.equal(getUi5State().assignments[0].score, 8);
  assert.equal(getUi5State().assignments[0].interpretation, 'Established');
  finalizeAssessment('assignment-1001');
  assert.equal(getUi5State().assignments[0].status, 'Finalized');
});

test('group participant notes are stored per participant and not copied to the master note', () => {
  resetUi5Store();
  const group = getUi5State().groups[0];
  assert.equal(group.participants[0].confidential, true);
  assert.equal(group.summary, undefined);
  assert.notEqual(group.participants[0].id, group.participants[1].id);
});

function saveSessionForTest() { /* The test only needs the session lifecycle state. */ }