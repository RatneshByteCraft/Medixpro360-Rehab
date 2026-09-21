import test from 'node:test';
import assert from 'node:assert/strict';
import { demoProfiles } from './access.js';
import { getEffectiveNavigation } from './navigation.js';

test('platform UI-2 navigation exposes lifecycle and governance destinations', () => {
  const ids = getEffectiveNavigation(demoProfiles.platform).map(item => item.id);
  assert.deepEqual(ids.slice(0, 6), ['platform-overview', 'organizations', 'tenant-onboarding', 'subscriptions', 'saas-commercial', 'platform-modules']);
  assert.ok(ids.includes('platform-access'));
  assert.ok(ids.includes('ai-governance'));
});

test('tenant UI-2 navigation separates administration from platform operations', () => {
  const ids = getEffectiveNavigation(demoProfiles.tenant).map(item => item.id);
  assert.ok(ids.includes('admin-overview'));
  assert.ok(ids.includes('users'));
  assert.equal(ids.includes('organizations'), false);
});

test('centre UI-2 navigation exposes operational queues', () => {
  const ids = getEffectiveNavigation(demoProfiles.centre).map(item => item.id);
  assert.ok(ids.includes('referrals'));
  assert.ok(ids.includes('clients'));
  assert.ok(ids.includes('admissions'));
  assert.ok(ids.includes('discharges'));
  assert.ok(ids.includes('occupancy'));
  assert.ok(ids.includes('operational-alerts'));
});
