import test from 'node:test';
import assert from 'node:assert/strict';
import { demoProfiles, PERMISSIONS, can } from './access.js';
import { assignBed, getUi6State, resetUi6Store } from './ui6Store.js';
import { getUi9State, receiveStock, resetUi9Store } from './ui9Store.js';
import { addTariffLine, activateTariff, createBed, createInventoryItem, createPayer, createProgramme, createRoom, createServiceDefinition, createTariff, createUnit, deactivateBed, deactivateInventoryItem, deactivatePayer, deactivateServiceDefinition, getUi12State, reactivateBed, reactivateInventoryItem, reactivatePayer, reactivateServiceDefinition, resetUi12Store, resolveTariff, setProgrammeStatus, supersedeTariff, updateInventoryItem } from './ui12Store.js';

const admin = demoProfiles.centre;

test('facility hierarchy creates unique room and bed and feeds UI-6 by stable bed ID', () => {
  resetUi12Store(); resetUi6Store();
  const unitId = createUnit(admin, { code: 'UNIT-UI12', name: 'UI-12 Unit' });
  const roomId = createRoom(admin, { unitId, code: 'A-101', name: 'Room A-101', capacity: 2 });
  assert.ok(roomId);
  assert.equal(createRoom(admin, { unitId, code: 'A-101', name: 'Duplicate' }), null);
  const bedId = createBed(admin, { roomId, code: 'A-101-1', label: 'A-101-1' });
  assert.ok(bedId);
  assert.equal(createBed(admin, { roomId, code: 'A-101-1', label: 'Duplicate' }), null);
  assert.equal(getUi6State().beds.some(item => item.id === bedId), true);
  assert.equal(assignBed('client-1002', bedId), true);
  assert.equal(getUi6State().occupancyHistory.some(item => item.bedId === bedId), true);
  assert.equal(deactivateBed(admin, bedId, { reason: 'Occupied bed must remain historical' }), false);
});

test('tariff configuration resolves effective service rates without changing invoice state', () => {
  resetUi12Store();
  const payerId = createPayer(admin, { code: 'CORP-UI12', name: 'UI-12 Corporate', type: 'Corporate' });
  const serviceId = createServiceDefinition(admin, { code: 'ROOM-UI12', name: 'UI-12 room day', category: 'Accommodation', unit: 'day' });
  const tariffId = createTariff(admin, { name: 'UI-12 Corporate Standard', payerId, effectiveFrom: '21 Sep 2026' });
  assert.ok(addTariffLine(admin, tariffId, { serviceId, rate: 3200, unit: 'day' }));
  assert.equal(activateTariff(admin, tariffId), true);
  assert.deepEqual(resolveTariff(serviceId, payerId, '21 Sep 2026').rate, 3200);
  assert.equal(createTariff(admin, { name: 'Invalid', payerId, effectiveFrom: '22 Sep 2026', effectiveTo: '21 Sep 2026' }), null);
});

test('inventory item master is separate from stock transactions and remains scoped', () => {
  resetUi12Store(); resetUi9Store();
  const itemId = createInventoryItem(admin, { code: 'UI12-ITEM', name: 'UI-12 configured item', category: 'Consumable', unitOfMeasure: 'box', reorderLevel: 3 });
  assert.ok(itemId);
  const before = getUi9State().stockBalances.reduce((sum, item) => sum + item.quantity, 0);
  assert.ok(receiveStock({ itemId, locationId: 'Ward X', quantity: 4, reason: 'UI-12 receipt' }));
  assert.equal(getUi9State().stockBalances.reduce((sum, item) => sum + item.quantity, 0), before + 4);
  assert.equal(can(demoProfiles.nurse, PERMISSIONS.ROOM_MANAGE, 'configuration'), false);
  assert.equal(getUi12State().items.some(item => item.id === itemId), true);
});

test('configuration permissions and tenant/location scope are explicit', () => {
  assert.equal(can(demoProfiles.centre, PERMISSIONS.ROOM_MANAGE, 'configuration'), true);
  assert.equal(can(demoProfiles.clinician, PERMISSIONS.ROOM_MANAGE, 'configuration'), false);
  assert.equal(can(demoProfiles.billing, PERMISSIONS.TARIFF_MANAGE, 'configuration'), false);
  resetUi12Store();
  assert.equal(createRoom(demoProfiles.centreB, { unitId: 'unit-residential-a', code: 'B-101', name: 'Wrong scope' }), null);
  assert.equal(getUi12State().audit.length, 0);
});

test('unoccupied bed can deactivate and reactivate with the same ID', () => {
  resetUi12Store();
  const roomId = createRoom(admin, { unitId: 'unit-residential-a', code: 'LIFE-ROOM', name: 'Lifecycle Room' });
  const bedId = createBed(admin, { roomId, code: 'LIFE-BED', label: 'LIFE-BED' });
  assert.equal(deactivateBed(admin, bedId, { reason: 'Maintenance' }), true);
  assert.equal(getUi12State().beds.find(item => item.id === bedId).status, 'Inactive');
  assert.equal(reactivateBed(admin, bedId, { reason: 'Maintenance complete' }), true);
  assert.equal(getUi12State().beds.find(item => item.id === bedId).status, 'Active');
});

test('programme, service and payer lifecycle preserves identity and history', () => {
  resetUi12Store();
  const programmeId = createProgramme(admin, { code: 'LIFE-PROG', name: 'Lifecycle Programme' });
  const serviceId = createServiceDefinition(admin, { code: 'LIFE-SVC', name: 'Lifecycle Service' });
  const payerId = createPayer(admin, { code: 'LIFE-PAYER', name: 'Lifecycle Payer' });
  assert.equal(setProgrammeStatus(admin, programmeId, 'Inactive', { reason: 'Retired' }), true);
  assert.equal(deactivateServiceDefinition(admin, serviceId, { reason: 'Retired' }), true);
  assert.equal(reactivateServiceDefinition(admin, serviceId, { reason: 'Reopened' }), true);
  assert.equal(deactivatePayer(admin, payerId, { reason: 'Retired' }), true);
  assert.equal(reactivatePayer(admin, payerId, { reason: 'Reopened' }), true);
  assert.equal(getUi12State().programmes.find(item => item.id === programmeId).id, programmeId);
  assert.equal(getUi12State().services.find(item => item.id === serviceId).id, serviceId);
  assert.equal(getUi12State().payers.find(item => item.id === payerId).id, payerId);
});

test('tariff supersede and item edit do not rewrite operational history or stock', () => {
  resetUi12Store(); resetUi9Store();
  const payerId = createPayer(admin, { code: 'HIST-PAYER', name: 'History Payer' });
  const serviceId = createServiceDefinition(admin, { code: 'HIST-SVC', name: 'History Service' });
  const tariffId = createTariff(admin, { name: 'History Tariff', payerId, effectiveFrom: '20 Sep 2026' });
  addTariffLine(admin, tariffId, { serviceId, rate: 1000, unit: 'day' });
  activateTariff(admin, tariffId);
  assert.equal(supersedeTariff(admin, tariffId, { reason: 'New rate' }), true);
  const itemId = createInventoryItem(admin, { code: 'HIST-ITEM', name: 'History Item' });
  assert.equal(updateInventoryItem(admin, itemId, { name: 'Renamed History Item' }), true);
  assert.equal(deactivateInventoryItem(admin, itemId, { reason: 'Retired' }), true);
  assert.equal(reactivateInventoryItem(admin, itemId, { reason: 'Reopened' }), true);
  assert.equal(getUi12State().items.find(item => item.id === itemId).id, itemId);
  assert.equal(getUi9State().stockBalances.some(item => item.itemId === itemId), false);
});
