import test from 'node:test';
import assert from 'node:assert/strict';
import { demoProfiles, hasPermission, isLocationAllowed, PERMISSIONS } from './access.js';
import { getSearchResults, getVisibleNotifications, getVisibleTasks, resetCrossCuttingStore } from './crossCuttingStore.js';

const centre = demoProfiles.centre;
const nurse = demoProfiles.nurse;
const clinician = demoProfiles.clinician;
const platform = demoProfiles.platform;
const tenant = demoProfiles.tenant;

test('client visibility is separate from clinical mutation permissions', () => {
  assert.equal(hasPermission(centre, 'clients.view'), true);
  assert.equal(hasPermission(nurse, 'clients.view'), true);
  assert.equal(hasPermission(centre, PERMISSIONS.CLINICAL_EDIT), false);
  assert.equal(hasPermission(centre, PERMISSIONS.CLINICAL_SIGN), false);
  assert.equal(hasPermission(nurse, PERMISSIONS.CLINICAL_EDIT), false);
  assert.equal(hasPermission(nurse, PERMISSIONS.CLINICAL_SIGN), false);
  assert.equal(hasPermission(clinician, PERMISSIONS.CLINICAL_EDIT), true);
  assert.equal(hasPermission(clinician, PERMISSIONS.CLINICAL_SIGN), true);
});

test('scoped search excludes clinical client results from platform and tenant personas', () => {
  assert.equal(getSearchResults(platform).some(result => result.type === 'Client'), false);
  assert.equal(getSearchResults(tenant).some(result => result.type === 'Client'), false);
  assert.equal(getSearchResults(centre).some(result => result.label === 'Aarav Mehta'), true);
  assert.equal(getSearchResults(clinician).some(result => result.label === 'Aarav Mehta'), true);
});

test('location scope filters results and task/notification sources are shared', () => {
  resetCrossCuttingStore();
  assert.equal(isLocationAllowed(centre, 'Residential Unit A'), true);
  assert.equal(isLocationAllowed(nurse, 'Greater Noida Centre'), false);
  assert.equal(getVisibleTasks(platform).some(task => task.sensitivity === 'clinical'), false);
  assert.equal(getVisibleTasks(tenant).some(task => task.sensitivity === 'clinical'), false);
  assert.equal(getVisibleTasks(clinician).some(task => task.sourceModule === 'mdt'), true);
  assert.equal(getVisibleTasks(clinician).some(task => task.sourceModule === 'therapy'), true);
  assert.equal(getVisibleNotifications(platform).some(notification => notification.sourceModule === 'mdt'), false);
  assert.equal(getVisibleNotifications(clinician).some(notification => notification.sourceModule === 'mdt'), true);
});
