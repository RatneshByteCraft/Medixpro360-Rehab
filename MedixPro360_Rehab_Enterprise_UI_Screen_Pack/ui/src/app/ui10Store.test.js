import test from 'node:test';
import assert from 'node:assert/strict';
import { demoProfiles, PERMISSIONS, can } from './access.js';
import { createDocumentVersion, captureConsent, getUi10State, getUi10VisibleRecords, registerDocument, requestReportExport, resetUi10Store, revokeConsent, resolveComplianceException } from './ui10Store.js';

test('document versioning preserves historical metadata and prevents unauthorized model bypass', () => {
  resetUi10Store();
  const id = registerDocument({ title: 'Care plan attachment', documentType: 'Supporting record', classification: 'General', clientId: 'client-1001' });
  assert.ok(id);
  const first = getUi10State().documentVersions.find(item => item.documentId === id);
  const second = createDocumentVersion(id, { fileName: 'care-plan-v2.pdf', reason: 'Updated metadata' });
  assert.ok(second);
  assert.equal(getUi10State().documentVersions.find(item => item.id === first.id).status, 'Superseded');
  assert.equal(getUi10State().documentVersions.find(item => item.id === second).versionNumber, 2);
});

test('consent capture and revocation preserve history and active boundary', () => {
  resetUi10Store();
  const id = captureConsent({ clientId: 'client-1001', consentType: 'Family/Caregiver Involvement', scope: { caregiverId: 'caregiver-1001', purpose: 'Care coordination' } });
  assert.ok(id);
  assert.equal(revokeConsent(id, 'Withdrawn by client'), true);
  assert.equal(revokeConsent(id, 'Duplicate'), false);
  assert.equal(getUi10State().consents.find(item => item.id === id).status, 'Revoked');
});

test('compliance resolution and report request are idempotent domain actions', () => {
  resetUi10Store();
  assert.equal(resolveComplianceException('compliance-1001', { resolution: 'Reviewed' }), true);
  assert.equal(resolveComplianceException('compliance-1001', { resolution: 'Duplicate' }), false);
  const reportId = requestReportExport({ reportType: 'Governance summary' });
  assert.ok(reportId);
});

test('UI-10 scope and permission boundaries remain tenant/location aware', () => {
  resetUi10Store();
  assert.equal(can(demoProfiles.clinician, PERMISSIONS.CONSENT_VIEW, 'consent'), true);
  assert.equal(can(demoProfiles.billing, PERMISSIONS.AUDIT_VIEW, 'audit'), false);
  assert.equal(getUi10VisibleRecords(demoProfiles.clinician).documents.length, 1);
  assert.equal(getUi10VisibleRecords(demoProfiles.tenant2).documents.length, 0);
  assert.equal(getUi10VisibleRecords(demoProfiles.centreB).auditEvents.length, 0);
});
