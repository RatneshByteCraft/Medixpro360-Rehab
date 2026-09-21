import test from 'node:test';
import assert from 'node:assert/strict';
import { demoProfiles, WORKSPACES } from './access.js';
import { getEffectiveNavigation } from './navigation.js';

test('platform navigation excludes clinical workspaces and exposes governance', () => {
  const items = getEffectiveNavigation(demoProfiles.platform);
  assert.ok(items.some(item => item.id === 'organizations'));
  assert.ok(items.some(item => item.id === 'ai-governance'));
  assert.equal(items.some(item => item.id === 'clients'), false);
});

test('clinician navigation exposes one AI destination', () => {
  const items = getEffectiveNavigation(demoProfiles.clinician);
  assert.ok(items.some(item => item.id === 'clinician-ai'));
  assert.equal(items.filter(item => item.id.includes('ai')).length, 1);
  assert.equal(items.some(item => item.workspace === WORKSPACES.PLATFORM_OPERATIONS), false);
});

test('workspace and module permissions filter destinations', () => {
  const items = getEffectiveNavigation(demoProfiles.homeCare);
  assert.ok(items.some(item => item.id === 'home-control'));
  assert.equal(items.some(item => item.id === 'medication'), false);
  assert.equal(items.some(item => item.id === 'organizations'), false);
});
