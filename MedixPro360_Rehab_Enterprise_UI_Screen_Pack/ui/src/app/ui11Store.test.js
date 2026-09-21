import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import { demoProfiles, PERMISSIONS, can } from './access.js';
import { applyAiRecommendation, buildAuthorizedAiContext, getUi11State, requestAiAssistance, resetUi11Store, reviewAiRecommendation } from './ui11Store.js';

describe('UI-11 AI store', { concurrency: false }, () => {
test('authorized AI context is purpose-bound and excludes restricted sources', () => {
  resetUi11Store();
  const context = buildAuthorizedAiContext(demoProfiles.clinician, { clientId: 'client-1001', purpose: 'current-care-summary' });
  assert.ok(context);
  assert.equal(context.source.some(item => item.type === 'Client'), true);
  assert.equal(context.manifest.includes('Restricted therapy narrative — Excluded'), true);
});

test('AI recommendation requires review and applies through a canonical command once', () => {
  resetUi11Store();
  const result = requestAiAssistance(demoProfiles.clinician, { clientId: 'client-1001', purpose: 'nursing-draft', type: 'Nursing Draft' });
  assert.ok(result);
  assert.equal(applyAiRecommendation(result.recommendationId, { actor: 'Clinician' }), false);
  assert.equal(reviewAiRecommendation(result.recommendationId, 'PartiallyAccepted', ['observation'], { actor: 'Clinician' }), true);
  assert.equal(applyAiRecommendation(result.recommendationId, { actor: 'Clinician' }), true);
  assert.equal(applyAiRecommendation(result.recommendationId, { actor: 'Clinician' }), false);
  assert.ok(getUi11State().audit.some(item => item.action === 'AI Recommendation Applied'));
});

test('AI failure can retry without canonical mutation and permissions remain intersected', () => {
  resetUi11Store();
  const failed = requestAiAssistance(demoProfiles.clinician, { clientId: 'client-1001', purpose: 'current-care-summary', simulateFailure: true });
  assert.ok(failed);
  assert.equal(getUi11State().recommendations[0].status, 'Failed');
  assert.equal(can(demoProfiles.billing, PERMISSIONS.AI_USE, 'ai'), false);
});
});
