import test from 'node:test';
import assert from 'node:assert/strict';
import { demoProfiles, PERMISSIONS, can } from './access.js';
import { createBed, getUi12State, resetUi12Store } from './ui12Store.js';
import { activateBedCapacityPurchase, activateCapacityPolicy, activateFacilityEntitlement, activateSubscriptionFromVerifiedPayment, calculateBedCapacityQuote, calculateSubscriptionQuote, createBedCapacityCheckout, createCapacityPolicy, createFacilityAdditionCheckout, createFacilityEntitlement, createInitialFacility, createOnboardingCheckout, createRenewalCheckout, createTenantDiscount, extendSubscriptionFromVerifiedPayment, getActiveTenantAccess, getActiveTenantSession, getApplicableCapacityPolicy, getCapacityEntitlement, getCapacityPolicy, getCapacityPolicyHistory, getOnboardingContext, getOnboardingAccess, getSubscriptionCommercialPolicy, getSubscriptionLifecycle, getUi13State, getUi13VisibleRecords, hasValidOnboardingContext, initializeOnboardingFacility, recordSimulatedPaymentResult, registerTenant, resetUi13Store, simulateSubscriptionLifecycle, supersedeCapacityPolicy, UI13_LIFECYCLE, updateCapacityPolicyDraft, updateSubscriptionCommercialPolicy, validateBedCapacityForActivation } from './ui13Store.js';

test('facility pricing resolves deterministic INR and USD quarterly quotes', () => {
  resetUi13Store();
  const india = calculateSubscriptionQuote({ planId: 'plan-professional', currency: 'INR', facilityQuantity: 2, periodMonths: 3 });
  assert.deepEqual({ base: india.baseAmount, currency: india.currency }, { base: 60000, currency: 'INR' });
  const international = calculateSubscriptionQuote({ planId: 'plan-professional', currency: 'USD', facilityQuantity: 2, periodMonths: 3 });
  assert.deepEqual({ base: international.baseAmount, currency: international.currency }, { base: 6000, currency: 'USD' });
});

test('platform discount is separate from plan price and changes future quote only', () => {
  resetUi13Store();
  const before = calculateSubscriptionQuote({ subscriptionId: 'subscription-veda', periodMonths: 3 });
  assert.equal(createTenantDiscount(demoProfiles.platform, { tenantId: 'tenant-veda', type: 'Percentage', value: 10, reason: 'Renewal agreement' }), 'discount-1');
  const after = calculateSubscriptionQuote({ subscriptionId: 'subscription-veda', periodMonths: 3 });
  assert.deepEqual({ base: after.baseAmount, discount: after.discountAmount, total: after.totalAmount }, { base: before.baseAmount, discount: 6000, total: 54000 });
  assert.equal(can(demoProfiles.tenant, PERMISSIONS.PLATFORM_DISCOUNT_MANAGE), false);
});

test('checkout amount is snapshotted and verified payment is required for activation', () => {
  resetUi13Store();
  const checkoutId = createOnboardingCheckout(demoProfiles.tenant, { tenantId: 'tenant-veda', subscriptionId: 'subscription-veda', purpose: 'Renewal', periodMonths: 3 });
  assert.ok(checkoutId);
  assert.equal(getUi13State().checkouts[0].status, 'Pending');
  assert.equal(activateSubscriptionFromVerifiedPayment(demoProfiles.tenant, checkoutId), false);
  assert.equal(recordSimulatedPaymentResult(demoProfiles.tenant, checkoutId, 'Succeeded'), true);
  assert.equal(activateSubscriptionFromVerifiedPayment(demoProfiles.tenant, checkoutId), true);
  assert.equal(activateSubscriptionFromVerifiedPayment(demoProfiles.tenant, checkoutId), false);
  assert.equal(createOnboardingCheckout(demoProfiles.tenant, { tenantId: 'tenant-veda', subscriptionId: 'subscription-veda', purpose: 'Renewal', periodMonths: 3 }), null);
});

test('tenant commercial records remain isolated and patient billing permissions are separate', () => {
  resetUi13Store();
  assert.equal(createTenantDiscount(demoProfiles.tenant, { tenantId: 'tenant-veda', type: 'Percentage', value: 10 }), null);
  assert.equal(can(demoProfiles.billing, PERMISSIONS.TENANT_SUBSCRIPTION_VIEW), false);
  assert.equal(getUi13State().payments.every(item => item.tenantId === 'tenant-veda'), true);
});

test('bed capacity policy is configurable and effective-dated', () => {
  resetUi13Store();
  assert.deepEqual(getCapacityPolicy('plan-professional', 'INR', '21 Sep 2026'), { ...getUi13State().capacityPolicies[0] });
  assert.equal(getCapacityPolicy('plan-professional', 'INR', '01 Jan 2025'), null);
});

test('bed capacity quote uses inclusive daily actual-calendar proration', () => {
  resetUi13Store();
  const quote = calculateBedCapacityQuote({ planId: 'plan-professional', currency: 'INR', additionalBedQuantity: 10, effectiveDate: '21 Sep 2026', periodEnd: '30 Oct 2026' });
  assert.deepEqual({ startDays: quote.startDays, endDays: quote.endDays, total: quote.totalAmount }, { startDays: 10, endDays: 30, total: 6505.38 });
  assert.equal(quote.prorationMethod, 'DAILY');
  assert.equal(quote.dayBasis, 'ACTUAL_CALENDAR_DAYS');
});

test('bed capacity is per facility, payment-gated, idempotent, and enforces 25-bed boundary', () => {
  resetUi13Store();
  assert.equal(getCapacityEntitlement('location-veda-noida').totalLicensedBedCapacity, 25);
  assert.equal(getCapacityEntitlement('location-veda-delhi').totalLicensedBedCapacity, 25);
  assert.equal(validateBedCapacityForActivation('location-veda-noida', 25), true);
  assert.equal(validateBedCapacityForActivation('location-veda-noida', 26), false);
  const checkoutId = createBedCapacityCheckout(demoProfiles.tenant, { subscriptionId: 'subscription-veda', facilityId: 'location-veda-noida', planId: 'plan-professional', currency: 'INR', additionalBedQuantity: 10, effectiveDate: '21 Sep 2026', periodEnd: '30 Oct 2026' });
  assert.ok(checkoutId);
  assert.equal(activateBedCapacityPurchase(demoProfiles.tenant, checkoutId), false);
  assert.equal(recordSimulatedPaymentResult(demoProfiles.tenant, checkoutId, 'Failed'), true);
  assert.equal(getCapacityEntitlement('location-veda-noida').totalLicensedBedCapacity, 25);
  const retry = createBedCapacityCheckout(demoProfiles.tenant, { subscriptionId: 'subscription-veda', facilityId: 'location-veda-noida', planId: 'plan-professional', currency: 'INR', additionalBedQuantity: 10, effectiveDate: '21 Sep 2026', periodEnd: '30 Oct 2026' });
  assert.ok(retry);
  assert.equal(recordSimulatedPaymentResult(demoProfiles.tenant, retry, 'Succeeded'), true);
  assert.equal(activateBedCapacityPurchase(demoProfiles.tenant, retry), true);
  assert.equal(activateBedCapacityPurchase(demoProfiles.tenant, retry), false);
  assert.equal(getCapacityEntitlement('location-veda-noida').totalLicensedBedCapacity, 35);
  assert.equal(getCapacityEntitlement('location-veda-delhi').totalLicensedBedCapacity, 25);
  assert.equal(getUi13State().capacityPurchases[0].policyId, 'capacity-policy-india-v1');
});

test('renewal includes active additional capacity at policy monthly price', () => {
  resetUi13Store();
  const checkoutId = createBedCapacityCheckout(demoProfiles.tenant, { subscriptionId: 'subscription-veda', facilityId: 'location-veda-noida', planId: 'plan-professional', currency: 'INR', additionalBedQuantity: 10, effectiveDate: '21 Sep 2026', periodEnd: '30 Oct 2026' });
  recordSimulatedPaymentResult(demoProfiles.tenant, checkoutId, 'Succeeded');
  activateBedCapacityPurchase(demoProfiles.tenant, checkoutId);
  const renewalId = createRenewalCheckout(demoProfiles.tenant, { subscriptionId: 'subscription-veda' });
  const renewal = getUi13State().checkouts.find(item => item.id === renewalId);
  assert.equal(renewal.capacityAddonQuantity, 10);
  assert.equal(renewal.capacityAddonAmount, 15000);
  assert.equal(renewal.totalAmount, 75000);
});

test('capacity policy lifecycle is permission-protected, effective-dated, versioned, and historical', () => {
  resetUi13Store();
  const future = { planId: 'plan-professional', market: 'India', currency: 'INR', includedBedsPerFacility: 30, additionalBedPrice: 600, additionalBedPriceUnit: 'bed/month', prorationMethod: 'DAILY', dayBasis: 'ACTUAL_CALENDAR_DAYS', purchaseDateRule: 'INCLUSIVE', periodEndRule: 'INCLUSIVE', discountable: false, taxable: false, effectiveFrom: '01 Jan 2027' };
  assert.equal(createCapacityPolicy(demoProfiles.tenant, future), null);
  const futureId = createCapacityPolicy(demoProfiles.platform, future);
  assert.ok(futureId);
  assert.equal(updateCapacityPolicyDraft(demoProfiles.platform, futureId, { additionalBedPrice: 650 }), true);
  assert.equal(activateCapacityPolicy(demoProfiles.platform, futureId), true);
  assert.equal(getApplicableCapacityPolicy('plan-professional', 'INR', '21 Sep 2026').additionalBedPrice, 500);
  assert.equal(getApplicableCapacityPolicy('plan-professional', 'INR', '02 Jan 2027'), null);
  assert.equal(supersedeCapacityPolicy(demoProfiles.platform, 'capacity-policy-india-v1', { effectiveTo: '31 Dec 2026' }), true);
  assert.equal(getApplicableCapacityPolicy('plan-professional', 'INR', '02 Jan 2027').additionalBedPrice, 650);
  assert.equal(getCapacityPolicyHistory({ planId: 'plan-professional' }).length, 2);
  assert.equal(getCapacityPolicyHistory({ planId: 'plan-professional' }).find(policy => policy.id === 'capacity-policy-india-v1').additionalBedPrice, 500);
});

test('capacity policy rejects invalid and overlapping configurations', () => {
  resetUi13Store();
  const base = { planId: 'plan-professional', market: 'India', currency: 'INR', includedBedsPerFacility: 30, additionalBedPrice: 600, additionalBedPriceUnit: 'bed/month', prorationMethod: 'DAILY', dayBasis: 'ACTUAL_CALENDAR_DAYS', purchaseDateRule: 'INCLUSIVE', periodEndRule: 'INCLUSIVE', discountable: false, taxable: false, effectiveFrom: '21 Sep 2026' };
  assert.equal(createCapacityPolicy(demoProfiles.platform, { ...base, includedBedsPerFacility: -1 }), null);
  assert.equal(createCapacityPolicy(demoProfiles.platform, { ...base, effectiveTo: '01 Sep 2026' }), null);
  assert.equal(createCapacityPolicy(demoProfiles.platform, base), null);
});

test('grace duration resolves from subscription commercial policy', () => {
  resetUi13Store();
  assert.equal(getSubscriptionLifecycle('subscription-veda', '10 Jan 2027').graceDays, 14);
  assert.equal(updateSubscriptionCommercialPolicy(demoProfiles.platform, 'subscription-commercial-policy-v1', { graceDays: 7 }), true);
  assert.equal(getSubscriptionCommercialPolicy('plan-professional').graceDays, 7);
  assert.equal(getSubscriptionLifecycle('subscription-veda', '07 Jan 2027').state, UI13_LIFECYCLE.GRACE);
  assert.equal(getSubscriptionLifecycle('subscription-veda', '09 Jan 2027').state, UI13_LIFECYCLE.EXPIRED);
});

test('subscription terms and facility addition policy resolve from commercial configuration', () => {
  resetUi13Store();
  assert.equal(updateSubscriptionCommercialPolicy(demoProfiles.platform, 'subscription-commercial-policy-v1', { initialTermMonths: 4, renewalTermMonths: 2, facilityAdditionPolicy: 'CONFIGURED_CURRENT_PERIOD' }), true);
  assert.equal(calculateSubscriptionQuote({ subscriptionId: 'subscription-veda' }).periodMonths, 4);
  const facilityId = createInitialFacility('tenant-veda', { name: 'Configured Centre', code: 'CFG' });
  createFacilityEntitlement(demoProfiles.tenant, { tenantId: 'tenant-veda', facilityId, subscriptionId: 'subscription-veda' });
  const addition = createFacilityAdditionCheckout(demoProfiles.tenant, { tenantId: 'tenant-veda', subscriptionId: 'subscription-veda', facilityId });
  assert.equal(getUi13State().checkouts.find(item => item.id === addition).periodMonths, 4);
  assert.equal(getUi13State().checkouts.find(item => item.id === addition).policy, 'CONFIGURED_CURRENT_PERIOD');
});

test('direct UI-12 bed creation enforces licensed capacity at the domain boundary', () => {
  resetUi12Store(); resetUi13Store();
  for (let index = 3; index <= 25; index += 1) assert.ok(createBed(demoProfiles.centre, { roomId: 'room-1001', code: `CAP-${index}` }));
  assert.equal(getUi12State().beds.filter(item => item.locationId === 'Greater Noida Centre' && item.status === 'Active').length, 25);
  assert.equal(createBed(demoProfiles.centre, { roomId: 'room-1001', code: 'CAP-26' }), null);
  const checkoutId = createBedCapacityCheckout(demoProfiles.tenant, { subscriptionId: 'subscription-veda', facilityId: 'location-veda-noida', planId: 'plan-professional', currency: 'INR', additionalBedQuantity: 10, effectiveDate: '21 Sep 2026', periodEnd: '30 Oct 2026' });
  recordSimulatedPaymentResult(demoProfiles.tenant, checkoutId, 'Succeeded');
  activateBedCapacityPurchase(demoProfiles.tenant, checkoutId);
  for (let index = 26; index <= 35; index += 1) assert.ok(createBed(demoProfiles.centre, { roomId: 'room-1001', code: `CAP-${index}-POST` }));
  assert.equal(createBed(demoProfiles.centre, { roomId: 'room-1001', code: 'CAP-36' }), null);
});

test('capacity discountability and taxability matrix is configuration-driven', () => {
  resetUi13Store();
  createTenantDiscount(demoProfiles.platform, { tenantId: 'tenant-veda', type: 'Percentage', value: 10, currency: 'INR', reason: 'Capacity matrix' });
  const base = { planId: 'plan-professional', currency: 'INR', additionalBedQuantity: 10, effectiveDate: '21 Sep 2026', periodEnd: '30 Oct 2026', subscriptionId: 'subscription-veda' };
  const policies = getUi13State().capacityPolicies;
  const original = { ...policies[0] };
  const matrix = [['capacity-policy-india-v1', false, false, 0, 0], ['capacity-policy-india-v1', true, false, 650.54, 0], ['capacity-policy-india-v1', false, true, 0, 1170.97], ['capacity-policy-india-v1', true, true, 650.54, 1053.87]];
  for (const [, discountable, taxable, expectedDiscount, expectedTax] of matrix) {
    policies[0].discountable = discountable; policies[0].taxable = taxable; policies[0].taxRate = 18;
    const quote = calculateBedCapacityQuote(base);
    assert.equal(quote.discountAmount, expectedDiscount);
    assert.equal(quote.taxAmount, expectedTax);
    assert.equal(quote.totalAmount, Math.round((quote.baseAmount - expectedDiscount + expectedTax) * 100) / 100);
  }
  Object.assign(policies[0], original);
});

test('capacity discounts honor percentage, fixed, effective dates, currency and floor rules', () => {
  resetUi13Store();
  const policy = getUi13State().capacityPolicies[0]; policy.discountable = true;
  const base = { subscriptionId: 'subscription-veda', planId: 'plan-professional', currency: 'INR', additionalBedQuantity: 10, effectiveDate: '21 Sep 2026', periodEnd: '30 Oct 2026' };
  createTenantDiscount(demoProfiles.platform, { tenantId: 'tenant-veda', type: 'Percentage', value: 10, currency: 'INR', effectiveFrom: '22 Sep 2026', reason: 'Future' });
  assert.equal(calculateBedCapacityQuote(base).discountAmount, 0);
  createTenantDiscount(demoProfiles.platform, { tenantId: 'tenant-veda', type: 'Fixed', value: 1000, currency: 'INR', effectiveFrom: '20 Sep 2026', reason: 'Fixed' });
  assert.equal(calculateBedCapacityQuote(base).discountAmount, 1000);
  createTenantDiscount(demoProfiles.platform, { tenantId: 'tenant-veda', type: 'Fixed', value: 999999, currency: 'INR', effectiveFrom: '20 Sep 2026', reason: 'Floor' });
  assert.equal(calculateBedCapacityQuote(base).discountAmount, 1000);
  resetUi13Store(); getUi13State().capacityPolicies[0].discountable = true;
  createTenantDiscount(demoProfiles.platform, { tenantId: 'tenant-veda', type: 'Percentage', value: 10, currency: 'USD', reason: 'Mismatch' });
  assert.equal(calculateBedCapacityQuote(base).discountAmount, 0);
});

test('capacity quote and purchase snapshot discount and tax configuration', () => {
  resetUi13Store();
  const policy = getUi13State().capacityPolicies[0]; Object.assign(policy, { discountable: true, taxable: true, taxRate: 18 });
  createTenantDiscount(demoProfiles.platform, { tenantId: 'tenant-veda', type: 'Percentage', value: 10, currency: 'INR', reason: 'Snapshot' });
  const quote = calculateBedCapacityQuote({ subscriptionId: 'subscription-veda', planId: 'plan-professional', currency: 'INR', additionalBedQuantity: 10, effectiveDate: '21 Sep 2026', periodEnd: '30 Oct 2026' });
  assert.deepEqual({ discount: quote.discountAmount, taxable: quote.taxableAmount, tax: quote.taxAmount, total: quote.totalAmount }, { discount: 650.54, taxable: 5854.84, tax: 1053.87, total: 6908.71 });
  const checkoutId = createBedCapacityCheckout(demoProfiles.tenant, { subscriptionId: 'subscription-veda', facilityId: 'location-veda-noida', planId: 'plan-professional', currency: 'INR', additionalBedQuantity: 10, effectiveDate: '21 Sep 2026', periodEnd: '30 Oct 2026' });
  const checkout = getUi13State().checkouts.find(item => item.id === checkoutId);
  assert.equal(checkout.discountAmount, quote.discountAmount); assert.equal(checkout.taxAmount, quote.taxAmount); assert.equal(checkout.policyVersion, 1); assert.equal(checkout.discountReference.value, 10); assert.equal(checkout.taxReference.rate, 18);
});

test('capacity quote and checkout preserve identical commercial context', () => {
  resetUi13Store();
  const policy = getUi13State().capacityPolicies[0]; Object.assign(policy, { discountable: true, taxable: true, taxRate: 18 });
  createTenantDiscount(demoProfiles.platform, { tenantId: 'tenant-veda', type: 'Percentage', value: 10, currency: 'INR', reason: 'Quote checkout consistency' });
  const command = { subscriptionId: 'subscription-veda', facilityId: 'location-veda-noida', planId: 'plan-professional', currency: 'INR', additionalBedQuantity: 10, effectiveDate: '21 Sep 2026', periodEnd: '30 Oct 2026' };
  const quote = calculateBedCapacityQuote(command);
  const checkoutId = createBedCapacityCheckout(demoProfiles.tenant, command);
  const checkout = getUi13State().checkouts.find(item => item.id === checkoutId);
  assert.deepEqual({ subscriptionId: 'subscription-veda', facilityId: checkout.facilityId, policyId: checkout.policyId, policyVersion: checkout.policyVersion, currency: checkout.currency, quantity: checkout.additionalBedQuantity, base: checkout.baseAmount, discount: checkout.discountAmount, tax: checkout.taxAmount, total: checkout.totalAmount }, { subscriptionId: command.subscriptionId, facilityId: command.facilityId, policyId: quote.policyId, policyVersion: quote.policyVersion, currency: quote.currency, quantity: quote.additionalBedQuantity, base: quote.baseAmount, discount: quote.discountAmount, tax: quote.taxAmount, total: quote.totalAmount });
});

test('capacity purchase history preserves complete commercial snapshot fields', () => {
  resetUi13Store();
  const checkoutId = createBedCapacityCheckout(demoProfiles.tenant, { subscriptionId: 'subscription-veda', facilityId: 'location-veda-noida', planId: 'plan-professional', currency: 'INR', additionalBedQuantity: 10, effectiveDate: '21 Sep 2026', periodEnd: '30 Oct 2026' });
  recordSimulatedPaymentResult(demoProfiles.tenant, checkoutId, 'Succeeded');
  assert.equal(activateBedCapacityPurchase(demoProfiles.tenant, checkoutId), true);
  const purchase = getUi13State().capacityPurchases[0];
  assert.deepEqual({ tenant: purchase.tenantId, subscription: purchase.subscriptionId, facility: purchase.facilityId, previous: purchase.previousLicensedBedCapacity, included: purchase.includedBedCapacity, previousAdditional: purchase.previousAdditionalBedCapacity, added: purchase.additionalBedQuantity, resultingAdditional: purchase.resultingAdditionalBedCapacity, resulting: purchase.newLicensedBedCapacity, policy: purchase.policyId, version: purchase.policyVersion, unitPrice: purchase.unitPrice, priceUnit: purchase.priceUnit, currency: purchase.currency, proration: purchase.prorationMethod, dayBasis: purchase.dayBasis, purchaseDateRule: purchase.purchaseDateRule, periodEndRule: purchase.periodEndRule, base: purchase.subtotal, discount: purchase.discountAmount, tax: purchase.taxAmount, total: purchase.totalAmount, status: purchase.status, checkout: purchase.checkoutId, payment: purchase.paymentReference }, { tenant: 'tenant-veda', subscription: 'subscription-veda', facility: 'location-veda-noida', previous: 25, included: 25, previousAdditional: 0, added: 10, resultingAdditional: 10, resulting: 35, policy: 'capacity-policy-india-v1', version: 1, unitPrice: 500, priceUnit: 'bed/month', currency: 'INR', proration: 'DAILY', dayBasis: 'ACTUAL_CALENDAR_DAYS', purchaseDateRule: 'INCLUSIVE', periodEndRule: 'INCLUSIVE', base: 6505.38, discount: 0, tax: 0, total: 6505.38, status: 'Succeeded', checkout: checkoutId, payment: `simulated-${checkoutId}` });
});

test('renewal keeps facility and bed add-on discount and tax lines separate for two and three facilities', () => {
  resetUi13Store();
  const policy = getUi13State().capacityPolicies[0]; Object.assign(policy, { discountable: true, taxable: true, taxRate: 18 });
  createTenantDiscount(demoProfiles.platform, { tenantId: 'tenant-veda', type: 'Percentage', value: 10, currency: 'INR', reason: 'Renewal lines' });
  const addOn = createBedCapacityCheckout(demoProfiles.tenant, { subscriptionId: 'subscription-veda', facilityId: 'location-veda-noida', planId: 'plan-professional', currency: 'INR', additionalBedQuantity: 10, effectiveDate: '21 Sep 2026', periodEnd: '30 Oct 2026' });
  recordSimulatedPaymentResult(demoProfiles.tenant, addOn, 'Succeeded'); activateBedCapacityPurchase(demoProfiles.tenant, addOn);
  const two = createRenewalCheckout(demoProfiles.tenant, { subscriptionId: 'subscription-veda' }); const twoCheckout = getUi13State().checkouts.find(item => item.id === two);
  assert.equal(twoCheckout.baseAmount, 60000); assert.equal(twoCheckout.discountAmount, 6000); assert.equal(twoCheckout.capacityAddonBaseAmount, 15000); assert.equal(twoCheckout.capacityAddonDiscountAmount, 1500); assert.equal(twoCheckout.capacityAddonTaxAmount, 2430); assert.equal(twoCheckout.totalAmount, 69930);
  recordSimulatedPaymentResult(demoProfiles.tenant, two, 'Failed');
  const facilityId = createInitialFacility('tenant-veda', { name: 'Gurugram Three', code: 'G3' }); createFacilityEntitlement(demoProfiles.tenant, { tenantId: 'tenant-veda', facilityId, subscriptionId: 'subscription-veda' }); const three = createFacilityAdditionCheckout(demoProfiles.tenant, { tenantId: 'tenant-veda', subscriptionId: 'subscription-veda', facilityId }); recordSimulatedPaymentResult(demoProfiles.tenant, three, 'Succeeded'); activateFacilityEntitlement(demoProfiles.tenant, facilityId, { paymentId: `simulated-${three}` });
  const threeId = createRenewalCheckout(demoProfiles.tenant, { subscriptionId: 'subscription-veda' }); const threeCheckout = getUi13State().checkouts.find(item => item.id === threeId);
  assert.equal(threeCheckout.facilityQuantity, 3); assert.equal(threeCheckout.baseAmount, 90000); assert.equal(threeCheckout.discountAmount, 9000); assert.equal(threeCheckout.capacityAddonBaseAmount, 15000); assert.equal(threeCheckout.totalAmount, 96930);
});

test('UI-13 facility projections use UI-12 canonical locations and exclude units', () => {
  resetUi12Store(); resetUi13Store();
  const records = getUi13VisibleRecords(demoProfiles.tenant);
  const canonicalIds = getUi12State().locations.map(item => item.id);
  assert.deepEqual(records.facilities.map(item => item.facilityId), canonicalIds);
  assert.equal(records.facilities.some(item => item.name === 'Residential Unit A'), false);
  assert.equal(Object.hasOwn(getUi13State(), 'facilities'), false);
});

test('facility addition keeps quantity at two after failure and activates the third canonical facility after success', () => {
  resetUi12Store(); resetUi13Store();
  const facilityId = createInitialFacility('tenant-veda', { name: 'Gurugram Centre', code: 'GUR' });
  assert.ok(facilityId);
  assert.ok(createFacilityEntitlement(demoProfiles.tenant, { tenantId: 'tenant-veda', facilityId, subscriptionId: 'subscription-veda' }));
  const checkoutId = createFacilityAdditionCheckout(demoProfiles.tenant, { tenantId: 'tenant-veda', subscriptionId: 'subscription-veda', facilityId });
  assert.ok(checkoutId);
  assert.equal(recordSimulatedPaymentResult(demoProfiles.tenant, checkoutId, 'Failed'), true);
  assert.equal(getUi13State().entitlements.find(item => item.facilityId === facilityId).status, 'PendingPayment');
  assert.equal(getUi13State().subscriptions[0].facilityQuantity, 2);
  const retry = createFacilityAdditionCheckout(demoProfiles.tenant, { tenantId: 'tenant-veda', subscriptionId: 'subscription-veda', facilityId });
  assert.ok(retry);
  assert.equal(recordSimulatedPaymentResult(demoProfiles.tenant, retry, 'Succeeded'), true);
  assert.equal(activateFacilityEntitlement(demoProfiles.tenant, facilityId, { paymentId: `simulated-${retry}` }), true);
  assert.equal(getUi13State().subscriptions[0].facilityQuantity, 3);
  assert.equal(activateFacilityEntitlement(demoProfiles.tenant, facilityId, { paymentId: `simulated-${retry}` }), false);
});

test('renewal uses three active facilities and creates one immutable next period', () => {
  resetUi12Store(); resetUi13Store();
  const facilityId = createInitialFacility('tenant-veda', { name: 'Gurugram Centre', code: 'GUR' });
  createFacilityEntitlement(demoProfiles.tenant, { tenantId: 'tenant-veda', facilityId, subscriptionId: 'subscription-veda' });
  const addition = createFacilityAdditionCheckout(demoProfiles.tenant, { tenantId: 'tenant-veda', subscriptionId: 'subscription-veda', facilityId });
  recordSimulatedPaymentResult(demoProfiles.tenant, addition, 'Succeeded');
  activateFacilityEntitlement(demoProfiles.tenant, facilityId, { paymentId: `simulated-${addition}` });
  createTenantDiscount(demoProfiles.platform, { tenantId: 'tenant-veda', type: 'Percentage', value: 10, currency: 'INR', reason: 'Renewal' });
  const renewal = createRenewalCheckout(demoProfiles.tenant, { tenantId: 'tenant-veda', subscriptionId: 'subscription-veda' });
  assert.equal(getUi13State().checkouts.find(item => item.id === renewal).facilityQuantity, 3);
  assert.equal(getUi13State().checkouts.find(item => item.id === renewal).baseAmount, 90000);
  assert.equal(getUi13State().checkouts.find(item => item.id === renewal).discountAmount, 9000);
  recordSimulatedPaymentResult(demoProfiles.tenant, renewal, 'Succeeded');
  assert.ok(extendSubscriptionFromVerifiedPayment(demoProfiles.tenant, renewal));
  assert.equal(extendSubscriptionFromVerifiedPayment(demoProfiles.tenant, renewal), false);
  assert.equal(getUi13State().periods.filter(item => item.subscriptionId === 'subscription-veda').length, 2);
  assert.equal(getUi13State().periods[0].facilityQuantity, 2);
  assert.equal(getUi13State().periods[1].facilityQuantity, 3);
});

test('subscription lifecycle derives renewal, grace and expiry without deleting commercial history', () => {
  resetUi13Store();
  assert.equal(getSubscriptionLifecycle('subscription-veda', '21 Dec 2026').state, UI13_LIFECYCLE.RENEWAL_APPROACHING);
  assert.equal(getSubscriptionLifecycle('subscription-veda', '10 Jan 2027').state, UI13_LIFECYCLE.GRACE);
  assert.equal(getSubscriptionLifecycle('subscription-veda', '20 Jan 2027').state, UI13_LIFECYCLE.EXPIRED);
  assert.equal(simulateSubscriptionLifecycle(demoProfiles.tenant, 'subscription-veda', UI13_LIFECYCLE.GRACE), true);
  assert.equal(getUi13State().tenants[0].id, 'tenant-veda');
  assert.equal(getUi13State().periods.length, 1);
});

test('tenant admin cannot access platform commercial mutation while super admin can simulate lifecycle', () => {
  resetUi13Store();
  assert.equal(simulateSubscriptionLifecycle(demoProfiles.tenant, 'subscription-veda', UI13_LIFECYCLE.EXPIRED), true);
  assert.equal(createTenantDiscount(demoProfiles.tenant, { tenantId: 'tenant-veda', type: 'Percentage', value: 10 }), null);
  assert.equal(simulateSubscriptionLifecycle(demoProfiles.platform, 'subscription-veda', UI13_LIFECYCLE.ACTIVE), true);
});

test('registration initializes purpose-limited onboarding context and subscription', () => {
  resetUi13Store();
  const result = registerTenant({ name: 'Onboarding Fixture', country: 'India', email: 'onboarding@example.test' });
  assert.ok(result.tenantId);
  assert.ok(result.subscriptionId);
  assert.ok(getOnboardingContext());
  assert.equal(hasValidOnboardingContext('/subscription/checkout'), true);
  const onboardingAccess = getOnboardingAccess(demoProfiles.clinician);
  assert.equal(onboardingAccess.workspace, 'TENANT_ONBOARDING');
  assert.equal(onboardingAccess.permissions.includes(PERMISSIONS.TENANT_SUBSCRIPTION_CHECKOUT), true);
  assert.equal(getUi13State().subscriptions.find(item => item.id === result.subscriptionId).status, 'PendingOnboardingPayment');
});

test('onboarding context does not authorize unrelated clinical or platform routes', () => {
  resetUi13Store();
  registerTenant({ name: 'Onboarding Fixture', country: 'India', email: 'onboarding@example.test' });
  assert.equal(hasValidOnboardingContext('/clients'), false);
  assert.equal(hasValidOnboardingContext('/super-admin/tenants'), false);
});

test('verified onboarding activation establishes normal tenant membership/session without mutating Clinician access', () => {
  resetUi13Store();
  const result = registerTenant({ name: 'Handoff Tenant', country: 'India', email: 'handoff@example.test' });
  const facilityId = createInitialFacility(result.tenantId, { name: 'Handoff Centre', code: 'HFC' });
  initializeOnboardingFacility(result.tenantId, facilityId);
  const checkoutId = createOnboardingCheckout(getOnboardingAccess(demoProfiles.clinician), { tenantId: result.tenantId, subscriptionId: result.subscriptionId, periodMonths: 3 });
  recordSimulatedPaymentResult(getOnboardingAccess(demoProfiles.clinician), checkoutId, 'Succeeded');
  assert.equal(activateSubscriptionFromVerifiedPayment(getOnboardingAccess(demoProfiles.clinician), checkoutId), true);
  assert.equal(getOnboardingContext(), null);
  assert.equal(getActiveTenantSession().tenantId, result.tenantId);
  assert.equal(getActiveTenantSession().role, 'Tenant Administrator');
  assert.equal(getActiveTenantAccess(demoProfiles.clinician).tenant, 'Handoff Tenant');
  assert.equal(demoProfiles.clinician.workspace, 'CLINICIAN_WORKSPACE');
});
