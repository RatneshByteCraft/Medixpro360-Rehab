import test from 'node:test';
import assert from 'node:assert/strict';
import { demoProfiles } from './access.js';
import { activateStaffSession, canClientViewDocument, completeAdmissionDocumentation, evaluateAdmissionDocumentationReadiness, getCurrentIdentityVerification, getIdentityVerificationHistory, getPortalDocumentById, getPortalReportById, getSessionMode, getTimelineEvents, getUi14State, getPortalVisibleRecords, isPortalRecordInScope, loginPortal, logoutPortal, replaceIdentityDocument, resetUi14Store, resolvePortalClientContext, SESSION_MODES, submitFormSignature, submitIdentityDocument, verifyIdentityDocument } from './ui14Store.js';
import { discloseDocumentToClient, getUi10State, resetUi10Store, revokeConsent, UI10_DISCLOSURE, registerDocument, withdrawDocumentDisclosure } from './ui10Store.js';
import { getUi6State } from './ui6Store.js';
import { getUi8State } from './ui8Store.js';

test('portal account resolves to the canonical client and safe projections', () => {
  resetUi14Store();
  assert.equal(loginPortal('portal-account-1001'), true);
  const records = getPortalVisibleRecords();
  assert.equal(records.context.client.id, 'client-1001');
  assert.equal(records.context.client.admissionId, 'adm-1001');
  assert.equal(records.medication.some(item => item.id === 'med-1001'), true);
  assert.equal(records.documents.some(item => item.id === 'document-1001'), true);
  assert.equal(records.identityVerifications[0].documentNumberMasked, 'XXXX XXXX 1234');
  assert.equal(getUi10State().documents.some(item => item.id === records.identityVerifications[0].documentId), true);
});

test('portal context cannot resolve another client by changing identity state', () => {
  resetUi14Store();
  assert.equal(resolvePortalClientContext('portal-account-unknown'), null);
  assert.equal(loginPortal('portal-account-unknown'), false);
});

test('identity submission is masked, review-gated, and staff verification is explicit', () => {
  resetUi14Store();
  assert.equal(loginPortal('portal-account-1001'), true);
  const id = submitIdentityDocument({ documentType: 'Passport', documentNumberMasked: 'P******42' });
  assert.ok(id);
  const verification = getUi14State().identityVerifications.find(item => item.id === id);
  assert.equal(verification.verificationStatus, 'NeedsReview');
  assert.equal(getUi10State().documents.some(item => item.id === verification.documentId), true);
  activateStaffSession();
  assert.equal(verifyIdentityDocument(demoProfiles.centre, id, 'Verified', 'Reviewed'), true);
  assert.equal(getUi14State().identityVerifications.find(item => item.id === id).verificationStatus, 'Verified');
});

test('form signature finalizes once and preserves the signed instance', () => {
  resetUi14Store();
  assert.equal(loginPortal('portal-account-1001'), true);
  assert.equal(submitFormSignature({ formId: 'form-admission-1001', acknowledgement: true, signatureText: 'Aarav Mehta' }).startsWith('signature-'), true);
  assert.equal(submitFormSignature({ formId: 'form-admission-1001', acknowledgement: true, signatureText: 'Aarav Mehta' }), false);
  const form = getUi14State().formInstances.find(item => item.id === 'form-admission-1001');
  assert.equal(form.status, 'Signed');
  assert.equal(getUi14State().signatures.length, 1);
  assert.equal(getUi14State().admissionDocumentation[0].status, 'In Progress');
  assert.equal(evaluateAdmissionDocumentationReadiness(resolvePortalClientContext()).isReady, true);
});

test('consent-bearing form signature captures canonical UI-10 consent once', () => {
  resetUi14Store();
  assert.equal(loginPortal('portal-account-1001'), true);
  const before = getUi10State().consents.length;
  assert.equal(submitFormSignature({ formId: 'form-admission-1001', acknowledgement: true, signatureText: 'Aarav Mehta' }).startsWith('signature-'), true);
  assert.equal(getUi10State().consents.length, before);
  assert.equal(submitFormSignature({ formId: 'form-consent-1001', acknowledgement: true, signatureText: 'Aarav Mehta' }).startsWith('signature-'), true);
  const consent = getUi10State().consents.find(item => item.sourceFormInstanceId === 'form-consent-1001');
  assert.ok(consent);
  assert.equal(consent.clientId, 'client-1001');
  assert.equal(consent.admissionId, 'adm-1001');
  assert.equal(consent.consentType, 'Treatment Consent');
  assert.equal(getUi14State().signatures.find(item => item.formInstanceId === 'form-consent-1001').consentId, consent.id);
  assert.equal(submitFormSignature({ formId: 'form-consent-1001', acknowledgement: true, signatureText: 'Aarav Mehta' }), false);
  assert.equal(getUi10State().consents.filter(item => item.sourceFormInstanceId === 'form-consent-1001').length, 1);
});

test('rejected identity verification creates a canonical replacement and preserves history', () => {
  resetUi14Store();
  assert.equal(loginPortal('portal-account-1001'), true);
  const first = submitIdentityDocument({ documentType: 'Passport', documentNumberMasked: 'P******01' });
  activateStaffSession();
  assert.equal(verifyIdentityDocument(demoProfiles.centre, first, 'Rejected', 'Document image unclear'), true);
  assert.equal(getCurrentIdentityVerification('client-1001').verificationStatus, 'Rejected');
  const replacement = replaceIdentityDocument({ documentType: 'Passport', documentNumberMasked: 'P******02' });
  assert.ok(replacement);
  assert.equal(replaceIdentityDocument({ documentType: 'Passport', documentNumberMasked: 'P******03' }), null);
  const history = getIdentityVerificationHistory('client-1001');
  const oldRecord = history.find(item => item.id === first);
  const newRecord = history.find(item => item.id === replacement);
  assert.equal(oldRecord.verificationStatus, 'Rejected');
  assert.equal(oldRecord.replacedByVerificationId, replacement);
  assert.equal(newRecord.replacesVerificationId, first);
  assert.equal(newRecord.verificationStatus, 'NeedsReview');
  assert.notEqual(oldRecord.documentId, newRecord.documentId);
  assert.equal(verifyIdentityDocument(demoProfiles.centre, replacement, 'Verified', 'Reviewed replacement'), true);
  assert.equal(getCurrentIdentityVerification('client-1001').id, replacement);
  assert.equal(getCurrentIdentityVerification('client-1001').verificationStatus, 'Verified');
});

test('identity rejection and replacement remain permission and context protected', () => {
  resetUi14Store();
  assert.equal(loginPortal('portal-account-1001'), true);
  const pending = submitIdentityDocument({ documentType: 'Aadhaar', documentNumberMasked: 'XXXX XXXX 9999' });
  activateStaffSession();
  assert.equal(verifyIdentityDocument(demoProfiles.nurse, pending, 'Rejected', 'Not authorized'), false);
  assert.equal(replaceIdentityDocument({ documentType: 'Passport', documentNumberMasked: 'P******55' }), null);
  assert.equal(verifyIdentityDocument(demoProfiles.centre, pending, 'Rejected', ''), false);
});

test('portal document and report disclosure is explicit and fail-closed', () => {
  resetUi14Store();
  assert.equal(loginPortal('portal-account-1001'), true);
  const context = resolvePortalClientContext();
  const disclosedId = registerDocument({ title: 'Client report', documentType: 'Clinical report', classification: 'Clinical', category: 'Clinical', clientId: 'client-1001', clientDisclosure: UI10_DISCLOSURE.DISCLOSED, visibility: 'Shared', actor: 'Clinician' });
  const internalId = registerDocument({ title: 'Internal report', documentType: 'Clinical report', classification: 'Clinical', category: 'Clinical', clientId: 'client-1001', visibility: 'Shared' });
  const restrictedId = registerDocument({ title: 'Restricted report', documentType: 'Clinical report', classification: 'Restricted Identity', category: 'Clinical', clientId: 'client-1001', clientDisclosure: UI10_DISCLOSURE.DISCLOSED, visibility: 'Restricted' });
  const otherClientId = registerDocument({ title: 'Other client report', documentType: 'Clinical report', classification: 'Clinical', category: 'Clinical', clientId: 'client-2002', clientDisclosure: UI10_DISCLOSURE.DISCLOSED, visibility: 'Shared' });
  const otherTenantId = registerDocument({ title: 'Other tenant report', documentType: 'Clinical report', classification: 'Clinical', category: 'Clinical', clientId: 'client-1001', clientDisclosure: UI10_DISCLOSURE.DISCLOSED, visibility: 'Shared' });
  const inactiveId = registerDocument({ title: 'Archived report', documentType: 'Clinical report', classification: 'Clinical', category: 'Clinical', clientId: 'client-1001', clientDisclosure: UI10_DISCLOSURE.DISCLOSED, visibility: 'Shared' });
  getUi10State().documents.find(item => item.id === otherTenantId).tenantId = 'Tenant T2';
  getUi10State().documents.find(item => item.id === inactiveId).status = 'Archived';
  const records = getPortalVisibleRecords();
  assert.equal(records.documents.some(item => item.id === disclosedId), true);
  assert.equal(records.reports.some(item => item.id === disclosedId), true);
  assert.equal(records.documents.some(item => item.id === internalId), false);
  assert.equal(records.documents.some(item => item.id === restrictedId), false);
  assert.equal(records.documents.some(item => item.id === otherClientId), false);
  assert.equal(records.documents.some(item => item.id === otherTenantId), false);
  assert.equal(records.documents.some(item => item.id === inactiveId), false);
  assert.equal(getPortalDocumentById(disclosedId)?.id, disclosedId);
  assert.equal(getPortalDocumentById(internalId), null);
  assert.equal(getPortalReportById(internalId), null);
  for (const value of [undefined, null, 'UNKNOWN']) {
    const document = getUi10State().documents.find(item => item.id === internalId);
    document.clientDisclosure = value;
    assert.equal(canClientViewDocument({ context, document }), false);
  }
});

test('canonical disclosure commands are staff-controlled and preserve staff access', () => {
  resetUi14Store();
  const id = registerDocument({ title: 'Internal care note', documentType: 'Care note', classification: 'Clinical', clientId: 'client-1001', visibility: 'Shared' });
  assert.equal(getUi10State().documents.some(item => item.id === id), true);
  assert.equal(getUi10State().documents.find(item => item.id === id).clientDisclosure, UI10_DISCLOSURE.NOT_DISCLOSED);
  assert.equal(discloseDocumentToClient(id, { access: demoProfiles.nurse, clientId: 'client-1001' }), false);
  assert.equal(discloseDocumentToClient(id, { access: demoProfiles.clinician, clientId: 'client-1001', reason: 'Client release' }), true);
  assert.equal(getUi10State().documents.find(item => item.id === id).clientDisclosure, UI10_DISCLOSURE.DISCLOSED);
  assert.equal(getUi10State().documents.some(item => item.id === id), true);
  assert.equal(withdrawDocumentDisclosure(id, { access: demoProfiles.clinician, reason: 'Release withdrawn' }), true);
  assert.equal(getUi10State().documents.find(item => item.id === id).clientDisclosure, UI10_DISCLOSURE.WITHDRAWN);
});

test('portal projections deny same-client-ID records from another tenant and malformed ownership', () => {
  resetUi10Store();
  resetUi14Store();
  assert.equal(loginPortal('portal-account-1001'), true);
  const records = getPortalVisibleRecords();
  const ui6 = getUi6State();
  const ui8 = getUi8State();
  const ui10 = getUi10State();
  const ui14 = getUi14State();
  ui8.telehealthAppointments.push({ id: 'telehealth-tenant-b', tenantId: 'Tenant T2', clientId: 'client-1001', service: 'Tenant B appointment' });
  ui8.telehealthAppointments.push({ id: 'telehealth-missing-tenant', clientId: 'client-1001', service: 'Missing tenant appointment' });
  ui6.medicationOrders.push({ id: 'med-tenant-b', tenantId: 'Tenant T2', clientId: 'client-1001', medication: 'Tenant B medication', status: 'Active' });
  ui6.medicationOrders.push({ id: 'med-missing-tenant', clientId: 'client-1001', medication: 'Missing tenant medication', status: 'Active' });
  ui10.consents.push({ id: 'consent-tenant-b', tenantId: 'Tenant T2', clientId: 'client-1001', status: 'Active' });
  ui10.consents.push({ id: 'consent-missing-tenant', clientId: 'client-1001', status: 'Active' });
  ui14.formInstances.push({ id: 'form-tenant-b', tenantId: 'Tenant T2', clientId: 'client-1001', admissionId: 'adm-1001', status: 'PendingSignature' });
  ui14.formInstances.push({ id: 'form-missing-tenant', clientId: 'client-1001', admissionId: 'adm-1001', status: 'PendingSignature' });
  ui14.identityVerifications.push({ id: 'identity-tenant-b', tenantId: 'Tenant T2', clientId: 'client-1001', admissionId: 'adm-1001', documentId: 'identity-document-tenant-b', verificationStatus: 'Verified' });
  ui14.identityVerifications.push({ id: 'identity-missing-tenant', clientId: 'client-1001', admissionId: 'adm-1001', documentId: 'identity-document-missing-tenant', verificationStatus: 'Verified' });
  const projected = getPortalVisibleRecords();
  assert.equal(isPortalRecordInScope(projected.context, { tenantId: 'Veda Wellness', title: 'Missing client' }), false);
  assert.equal(projected.schedule.some(item => item.id === 'telehealth-tenant-b'), false);
  assert.equal(projected.schedule.some(item => item.id === 'telehealth-missing-tenant'), false);
  assert.equal(projected.medication.some(item => item.id === 'med-tenant-b'), false);
  assert.equal(projected.medication.some(item => item.id === 'med-missing-tenant'), false);
  assert.equal(projected.consents.some(item => item.id === 'consent-tenant-b'), false);
  assert.equal(projected.consents.some(item => item.id === 'consent-missing-tenant'), false);
  assert.equal(projected.forms.some(item => item.id === 'form-tenant-b'), false);
  assert.equal(projected.forms.some(item => item.id === 'form-missing-tenant'), false);
  assert.equal(projected.identityVerifications.some(item => item.id === 'identity-tenant-b'), false);
  assert.equal(projected.identityVerifications.some(item => item.id === 'identity-missing-tenant'), false);
  assert.equal(submitFormSignature({ formId: 'form-tenant-b', acknowledgement: true, signatureText: 'Aarav Mehta' }), false);
  ui14.portalAccounts.push({ id: 'portal-account-malformed', tenantId: 'Tenant T2', clientId: 'client-1001', status: 'Active' });
  assert.equal(loginPortal('portal-account-malformed'), false);
  assert.equal(records.context.account.tenantId, 'Veda Wellness');
});

test('admission documentation requires readiness and explicit authorized completion', () => {
  resetUi10Store();
  resetUi14Store();
  assert.equal(loginPortal('portal-account-1001'), true);
  const identity = submitIdentityDocument({ documentType: 'Passport', documentNumberMasked: 'P******77' });
  activateStaffSession();
  assert.equal(verifyIdentityDocument(demoProfiles.centre, identity, 'Verified', 'Reviewed'), true);
  const context = resolvePortalClientContext();
  const initial = evaluateAdmissionDocumentationReadiness(context);
  assert.equal(initial.isReady, false);
  assert.equal(initial.blockers.includes('REQUIRED_FORM_INCOMPLETE'), true);
  assert.equal(completeAdmissionDocumentation({ permissions: [] }, { admissionId: 'adm-1001' }).completed, false);
  assert.equal(submitFormSignature({ formId: 'form-admission-1001', acknowledgement: true, signatureText: 'Aarav Mehta' }).startsWith('signature-'), true);
  assert.equal(evaluateAdmissionDocumentationReadiness(context).isReady, true);
  assert.equal(getUi14State().admissionDocumentation[0].status, 'In Progress');
  const completed = completeAdmissionDocumentation(demoProfiles.centre, { admissionId: 'adm-1001' });
  assert.deepEqual(completed, { completed: true, alreadyComplete: false, blockers: [] });
  assert.equal(getUi14State().admissionDocumentation[0].status, 'Complete');
  assert.equal(completeAdmissionDocumentation(demoProfiles.centre, { admissionId: 'adm-1001' }).alreadyComplete, true);
});

test('readiness evaluates each configured requirement from current canonical state', () => {
  resetUi10Store();
  resetUi14Store();
  assert.equal(loginPortal('portal-account-1001'), true);
  const identity = submitIdentityDocument({ documentType: 'Passport', documentNumberMasked: 'P******88' });
  activateStaffSession();
  assert.equal(verifyIdentityDocument(demoProfiles.centre, identity, 'Verified', 'Reviewed'), true);
  const ui14 = getUi14State();
  ui14.formInstances.push({ id: 'form-admission-1001-b', tenantId: 'Veda Wellness', clientId: 'client-1001', admissionId: 'adm-1001', templateId: 'form-template-admission-v2', templateVersion: 2, formPurpose: 'ADMISSION', title: 'Care agreement', status: 'PendingSignature', fields: [{ key: 'acknowledgement', label: 'I confirm.', value: false }], signatureId: null });
  ui14.admissionDocumentation[0].items.push({ id: 'agreement-b', label: 'Care agreement', sourceType: 'FormInstance', required: true, status: 'Pending', sourceId: 'form-admission-1001-b' }, { id: 'optional-note', label: 'Optional note', sourceType: 'Document', required: false, status: 'Pending', sourceId: 'missing-optional-document' }, { id: 'required-note', label: 'Required note', sourceType: 'Document', required: true, status: 'Pending', sourceId: 'missing-required-document' });
  assert.equal(submitFormSignature({ formId: 'form-admission-1001', acknowledgement: true, signatureText: 'Aarav Mehta' }).startsWith('signature-'), true);
  let readiness = evaluateAdmissionDocumentationReadiness(resolvePortalClientContext());
  assert.equal(readiness.isReady, false);
  assert.equal(readiness.requirements.find(item => item.sourceId === 'form-admission-1001').status, 'Complete');
  assert.equal(readiness.blockers.includes('REQUIRED_FORM_INCOMPLETE'), true);
  assert.equal(readiness.blockers.includes('REQUIRED_DOCUMENT_MISSING'), true);
  assert.equal(submitFormSignature({ formId: 'form-admission-1001-b', acknowledgement: true, signatureText: 'Aarav Mehta' }).startsWith('signature-'), true);
  readiness = evaluateAdmissionDocumentationReadiness(resolvePortalClientContext());
  assert.equal(readiness.isReady, false);
  assert.equal(readiness.blockers.includes('REQUIRED_DOCUMENT_MISSING'), true);
  assert.equal(readiness.requirements.find(item => item.sourceId === 'missing-optional-document').satisfied, false);
  assert.equal(revokeConsent('consent-1001', 'Withdrawn by client'), true);
  readiness = evaluateAdmissionDocumentationReadiness(resolvePortalClientContext());
  assert.equal(readiness.blockers.includes('REQUIRED_CONSENT_INACTIVE'), true);
  assert.equal(submitFormSignature({ formId: 'form-admission-1001-b', acknowledgement: true, signatureText: 'Aarav Mehta' }), false);
});

test('portal session mode excludes staff authority until explicit staff transition', () => {
  resetUi14Store();
  assert.equal(getSessionMode(), SESSION_MODES.STAFF);
  assert.equal(loginPortal('portal-account-1001'), true);
  assert.equal(getSessionMode(), SESSION_MODES.PORTAL);
  const pending = submitIdentityDocument({ documentType: 'Passport', documentNumberMasked: 'P******99' });
  assert.equal(verifyIdentityDocument(demoProfiles.centre, pending, 'Verified', 'Portal cannot review'), false);
  assert.equal(completeAdmissionDocumentation(demoProfiles.centre, { admissionId: 'adm-1001' }).completed, false);
  logoutPortal();
  assert.equal(getSessionMode(), SESSION_MODES.ANONYMOUS);
  activateStaffSession();
  assert.equal(getSessionMode(), SESSION_MODES.STAFF);
});

test('UI-14 lifecycle timeline is stable, scoped, and audience-safe', () => {
  resetUi10Store();
  resetUi14Store();
  assert.equal(loginPortal('portal-account-1001'), true);
  const context = resolvePortalClientContext();
  const submitted = submitIdentityDocument({ documentType: 'Passport', documentNumberMasked: 'P******44' });
  assert.ok(submitted);
  let portalEvents = getTimelineEvents({ context, audience: 'PORTAL' });
  assert.equal(portalEvents.some(event => event.eventId === `identity-submitted:${submitted}`), true);
  activateStaffSession();
  assert.equal(verifyIdentityDocument(demoProfiles.centre, submitted, 'Rejected', 'Image unclear'), true);
  assert.ok(replaceIdentityDocument({ documentType: 'Passport', documentNumberMasked: 'P******45' }));
  const replacement = getCurrentIdentityVerification('client-1001').id;
  assert.equal(verifyIdentityDocument(demoProfiles.centre, replacement, 'Verified', 'Reviewed replacement'), true);
  assert.equal(loginPortal('portal-account-1001'), true);
  assert.equal(submitFormSignature({ formId: 'form-admission-1001', acknowledgement: true, signatureText: 'Aarav Mehta' }).startsWith('signature-'), true);
  assert.equal(submitFormSignature({ formId: 'form-consent-1001', acknowledgement: true, signatureText: 'Aarav Mehta' }).startsWith('signature-'), true);
  activateStaffSession();
  assert.deepEqual(completeAdmissionDocumentation(demoProfiles.centre, { admissionId: 'adm-1001' }).completed, true);
  assert.equal(completeAdmissionDocumentation(demoProfiles.centre, { admissionId: 'adm-1001' }).alreadyComplete, true);
  assert.equal(revokeConsent('consent-1001', 'Withdrawn', { tenantId: 'Veda Wellness', clientId: 'client-1001' }), true);
  const contextAfter = resolvePortalClientContext();
  portalEvents = getTimelineEvents({ context: contextAfter, audience: 'PORTAL' });
  const eventIds = portalEvents.map(event => event.eventId);
  assert.equal(new Set(eventIds).size, eventIds.length);
  assert.equal(eventIds.some(id => id.startsWith('identity-rejected:')), true);
  assert.equal(eventIds.some(id => id.startsWith('identity-replacement-submitted:')), true);
  assert.equal(eventIds.some(id => id.startsWith('identity-verified:')), true);
  assert.equal(eventIds.some(id => id.startsWith('form-signed:')), true);
  assert.equal(eventIds.some(id => id.startsWith('consent-captured:')), true);
  assert.equal(eventIds.some(id => id.startsWith('consent-revoked:')), true);
  assert.equal(eventIds.some(id => id.startsWith('admission-documentation-completed:')), true);
  assert.deepEqual(getTimelineEvents({ context: contextAfter, audience: 'PORTAL' }).map(event => event.eventId), eventIds);
  getUi14State().portalEvents.push({ eventId: 'staff-only:1', tenantId: 'Veda Wellness', clientId: 'client-1001', admissionId: 'adm-1001', eventType: 'STAFF_NOTE', displayLabel: 'Staff note', staffDetail: 'Internal note', occurredAt: '21 Sep 2026', audience: 'STAFF_ONLY' });
  assert.equal(getTimelineEvents({ context: contextAfter, audience: 'PORTAL' }).some(event => event.eventId === 'staff-only:1'), false);
  assert.equal(getTimelineEvents({ tenantId: 'Tenant T2', clientId: 'client-1001', audience: 'STAFF' }).length, 0);
  assert.equal(getTimelineEvents({ tenantId: 'Veda Wellness', clientId: 'client-2002', audience: 'STAFF' }).length, 0);
});
