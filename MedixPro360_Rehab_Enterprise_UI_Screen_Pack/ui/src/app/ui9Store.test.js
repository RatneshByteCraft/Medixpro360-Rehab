import test from 'node:test';
import assert from 'node:assert/strict';
import { demoProfiles, PERMISSIONS, can } from './access.js';
import { getUi9State, approveStockRequest, calculateInvoiceTotal, createChargeFromSource, createDraftInvoice, createManualCharge, createStockRequest, finalizeInvoice, getUi9VisibleRecords, issueStockTransfer, receiveStockTransfer, recordPayment, resetUi9Store, voidInvoice } from './ui9Store.js';

test('source charge is idempotent and invoice finalization is immutable', () => {
  resetUi9Store();
  const chargeId = createChargeFromSource({ serviceName: 'Home Care visit', serviceCode: 'HC-VISIT', quantity: 1, unitPrice: 900, sourceId: 'hc-visit-1001', sourceModule: 'home-care', sourceType: 'visit' });
  assert.ok(chargeId);
  assert.equal(createChargeFromSource({ serviceName: 'Duplicate', quantity: 1, unitPrice: 900, sourceId: 'hc-visit-1001' }), null);
  const invoiceId = createDraftInvoice(['charge-occupancy-1001', chargeId]);
  assert.ok(invoiceId);
  assert.equal(finalizeInvoice(invoiceId), true);
  assert.equal(finalizeInvoice(invoiceId), false);
  const invoice = getUi9State().invoices.find(item => item.id === invoiceId);
  assert.equal(invoice.status, 'Issued');
  assert.equal(invoice.total, calculateInvoiceTotal(invoice.chargeLines));
});

test('payment updates balance and duplicate or overpayment is blocked', () => {
  resetUi9Store();
  const invoiceId = createDraftInvoice(['charge-occupancy-1001']);
  finalizeInvoice(invoiceId);
  const invoice = getUi9State().invoices.find(item => item.id === invoiceId);
  const paymentId = recordPayment(invoiceId, { amount: 1000, method: 'Bank Transfer', reference: 'PAY-1' });
  assert.ok(paymentId);
  assert.equal(recordPayment(invoiceId, { amount: invoice.balance + 1 }), null);
  assert.equal(recordPayment(invoiceId, { amount: 1000, reference: 'PAY-1' }), null);
  assert.equal(getUi9State().invoices.find(item => item.id === invoiceId).balance, 1500);
});

test('invoice void preserves the original financial record', () => {
  resetUi9Store();
  const invoiceId = createDraftInvoice(['charge-occupancy-1001']);
  finalizeInvoice(invoiceId);
  assert.equal(voidInvoice(invoiceId, 'Duplicate payer submission'), true);
  assert.equal(voidInvoice(invoiceId, 'Duplicate void'), false);
  assert.equal(getUi9State().invoices.find(item => item.id === invoiceId).status, 'Voided');
});

test('ward transfer preserves issue/receipt provenance and prevents duplicates', () => {
  resetUi9Store();
  const requestId = createStockRequest({ itemId: 'item-med-1001', fromLocationId: 'Ward X', toLocationId: 'Ward Y', quantity: 6, reason: 'Ward Y request' });
  assert.ok(requestId);
  assert.equal(approveStockRequest(requestId), true);
  const transferId = issueStockTransfer(requestId);
  assert.ok(transferId);
  assert.equal(issueStockTransfer(requestId), null);
  const transfer = getUi9State().transfers.find(item => item.id === transferId);
  assert.equal(transfer.issuedQuantity, 6);
  assert.equal(receiveStockTransfer(transferId), true);
  assert.equal(receiveStockTransfer(transferId), false);
  assert.equal(getUi9State().stockBalances.find(item => item.locationId === 'Ward X').quantity, 18);
  assert.equal(getUi9State().stockBalances.find(item => item.locationId === 'Ward Y').quantity, 6);
});

test('inventory blocks negative stock, invalid transfer, and cross-tenant visibility', () => {
  resetUi9Store();
  assert.equal(issueStockTransfer('missing'), null);
  assert.equal(createStockRequest({ itemId: 'item-med-1001', fromLocationId: 'Ward X', toLocationId: 'Ward X', quantity: 1 }), null);
  assert.equal(getUi9VisibleRecords(demoProfiles.tenant2).stockBalances.length, 0);
  assert.equal(getUi9VisibleRecords(demoProfiles.centreB).stockBalances.length, 0);
  assert.equal(can(demoProfiles.billing, PERMISSIONS.BILLING_INVOICE_FINALIZE, 'billing'), true);
  assert.equal(can(demoProfiles.inventory, PERMISSIONS.BILLING_INVOICE_FINALIZE, 'billing'), false);
});
