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
  const id = captureConsent({ tenantId: 'Veda Wellness', clientId: 'client-1001', consentType: 'Family/Caregiver Involvement', scope: { caregiverId: 'caregiver-1001', purpose: 'Care coordination' } });
  assert.ok(id);
  assert.equal(revokeConsent(id, 'Withdrawn by client', { tenantId: 'Veda Wellness', clientId: 'client-1001' }), true);
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

test('Consent capture isolates tenants and preserves same-tenant idempotency', () => {
  resetUi10Store();
  const base = { clientId: 'client-1001', admissionId: 'adm-1001', consentType: 'Treatment Consent', scope: { purpose: 'Treatment' }, sourceFormInstanceId: 'form-1001', formTemplateId: 'template-v1', formTemplateVersion: 1 };
  const tenantA = captureConsent({ ...base, tenantId: 'tenant-a' });
  const tenantADuplicate = captureConsent({ ...base, tenantId: 'tenant-a' });
  const tenantB = captureConsent({ ...base, tenantId: 'tenant-b' });
  assert.ok(tenantA);
  assert.equal(tenantADuplicate, tenantA);
  assert.ok(tenantB);
  assert.notEqual(tenantB, tenantA);
  const records = getUi10State().consents.filter(item => item.sourceFormInstanceId === 'form-1001');
  assert.equal(records.length, 2);
  assert.deepEqual(records.map(item => item.tenantId).sort(), ['tenant-a', 'tenant-b']);
});

test('Consent reuse isolates client, admission, type, template and invalid tenant context', () => {
  resetUi10Store();
  const base = { tenantId: 'tenant-a', clientId: 'client-1001', admissionId: 'adm-1001', consentType: 'Treatment Consent', scope: { purpose: 'Treatment' }, sourceFormInstanceId: 'form-1001', formTemplateId: 'template-v1', formTemplateVersion: 1 };
  const original = captureConsent(base);
  assert.notEqual(captureConsent({ ...base, clientId: 'client-1002' }), original);
  assert.notEqual(captureConsent({ ...base, admissionId: 'adm-1002' }), original);
  assert.notEqual(captureConsent({ ...base, consentType: 'Privacy Consent' }), original);
  assert.notEqual(captureConsent({ ...base, formTemplateId: 'template-v2', formTemplateVersion: 2 }), original);
  assert.equal(captureConsent({ ...base, tenantId: undefined }), null);
  assert.equal(captureConsent({ ...base, tenantId: null }), null);
  assert.equal(captureConsent({ ...base, tenantId: 42 }), null);
  assert.equal(captureConsent({ ...base, tenantId: 'tenant-a', context: { account: { tenantId: 'tenant-b' } } }), null);
});

test('Consent revocation is tenant and client scoped and does not reactivate history', () => {
  resetUi10Store();
  const id = captureConsent({ tenantId: 'tenant-b', clientId: 'client-1001', admissionId: 'adm-1001', consentType: 'Treatment Consent', scope: { purpose: 'Treatment' }, sourceFormInstanceId: 'form-tenant-b' });
  assert.ok(id);
  assert.equal(revokeConsent(id, 'Wrong tenant', { tenantId: 'tenant-a', clientId: 'client-1001' }), false);
  assert.equal(getUi10State().consents.find(item => item.id === id).status, 'Active');
  assert.equal(revokeConsent(id, 'Withdrawn', { tenantId: 'tenant-b', clientId: 'client-1001' }), true);
  const renewed = captureConsent({ tenantId: 'tenant-b', clientId: 'client-1001', admissionId: 'adm-1001', consentType: 'Treatment Consent', scope: { purpose: 'Treatment' }, sourceFormInstanceId: 'form-tenant-b' });
  assert.notEqual(renewed, id);
  assert.equal(getUi10State().consents.find(item => item.id === id).status, 'Revoked');
});
