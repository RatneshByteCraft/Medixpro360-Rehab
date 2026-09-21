import test from 'node:test';
import assert from 'node:assert/strict';
import { getUi3State, createClientFromReferral, createAdmission, completeAdmission, resetUi3Store } from './ui3Store.js';

test('new referral can become a client and residential admission', () => {
  resetUi3Store();
  const clientId = createClientFromReferral('ref-1001', 'new');
  const admissionId = createAdmission('ref-1001', clientId, true);
  const before = getUi3State();
  assert.ok(before.clients.some(client => client.id === clientId));
  assert.equal(before.admissions.find(admission => admission.id === admissionId).residential, true);
  completeAdmission(admissionId);
  const after = getUi3State();
  assert.equal(after.referrals.find(referral => referral.id === 'ref-1001').status, 'Converted');
  assert.equal(after.clients.find(client => client.id === clientId).status, 'Active admission');
});

test('existing client match is deliberate and reuses identity', () => {
  resetUi3Store();
  const clientId = createClientFromReferral('ref-1003', 'existing');
  assert.equal(clientId, 'client-1001');
  assert.equal(getUi3State().referrals.find(referral => referral.id === 'ref-1003').clientId, 'client-1001');
});
