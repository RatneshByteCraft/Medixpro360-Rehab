# UI-13 SaaS Subscription and Facility Licensing - Implementation Report

## Scope

UI-13 adds a frontend-only acceptance foundation for MedixPro360 SaaS commercial billing. It is separate from UI-9 patient billing. No backend API, Stripe browser integration, secret key, database persistence, commit, push or deployment was added.

## Routes

- `/register`
- `/settings/subscription`
- `/settings/facilities`
- `/subscription/checkout`
- `/super-admin/tenants`
- `/settings/subscription/capacity`
- `/super-admin/subscriptions/capacity-policy`

## Commercial Model

- Subscription billing unit: subscribed facility.
- Billing frequency: quarterly.
- Initial included subscription period: three months.
- Deterministic India price: INR 10,000 per facility per month.
- Deterministic international price: USD 1,000 per facility per month.
- Plan price and tenant discount are separate concepts.
- Tenant facility addition creates an operational facility with PendingPayment entitlement; it does not silently grant paid access.

## Pass 1 Facility Ownership

UI-12 is the sole writable owner of operational Facility/Location identity. UI-13 reads canonical UI-12 locations and stores only commercial `facilityId` references in `FacilityEntitlement`. Residential Unit A remains a Unit/Ward child and is not counted as a subscription facility. The previous independent UI-13 facility collection and dual-write path were removed.

## Payment Boundary

The frontend models pending, succeeded and failed checkout states. Checkout amounts are snapshotted and duplicate checkout/payment processing is blocked. Browser redirects cannot activate a subscription. Production activation requires a future backend-verified payment/webhook boundary. Stripe is represented as a provider placeholder only.

## Acceptance Evidence

- Public registration wizard collects account, organization and primary facility data without requiring rooms or beds.
- Tenant dashboard shows plan, currency, facility quantity, quarterly quote, renewal and facilities.
- Super Admin can view tenant commercial records and add a tenant-specific discount.
- Tenant Admin cannot manage platform discounts or plan pricing.
- India quote: 2 facilities x INR 10,000 x 3 months = INR 60,000.
- 10% discount quote: INR 60,000 base, INR 6,000 discount, INR 54,000 total before tax.
- Checkout displays a fixed snapshot and simulated verified success/failure actions.
- 390px UI has no horizontal overflow; browser console had zero errors and warnings during acceptance.
- Canonical facility regression: Greater Noida Centre and Delhi Centre are the two facility identities; Residential Unit A is excluded as a facility and remains a child unit.
- Automated suite after remediation: 64 passed, 0 failed, 0 skipped.

## Pass 2 Lifecycle

- Facility addition policy: `FULL_CURRENT_PERIOD`.
- Facility 3 is created through the canonical UI-12 location command, receives a PendingPayment entitlement, and does not affect active quantity until verified payment.
- Verified facility-addition payment activates the same entitlement and changes effective quantity from 2 to 3.
- Renewal uses the active entitlement quantity: 3 facilities x INR 10,000 x 3 months = INR 90,000 base.
- Existing 10% discount produces INR 9,000 discount and INR 81,000 pre-tax total.
- Renewal extension creates exactly one new period and preserves the prior quantity-2 period.
- Pass 2 automated suite: 66 passed, 0 failed, 0 skipped.

## Pass 3 Commercial Administration and Lifecycle

- Super Admin tenant directory and tenant commercial detail expose overview, canonical facilities, subscription, terms, payments, history, entitlements and audit projections.
- Tenant lifecycle screen exposes RenewalApproaching, RenewalDue, PaymentPending, Grace, Expired and reactivation simulation states.
- Grace policy is deterministic at 14 days; production time and enforcement remain backend responsibilities.
- Grace/expiry changes commercial entitlement state without deleting tenant, facility, operational hierarchy or history.
- Pass 3 automated suite: 68 passed, 0 failed, 0 skipped.
- 13Z final integrated acceptance was intentionally not run.

## Controlled Bed-Capacity Extension

- Capacity policy is configurable and effective-dated per plan, market and currency. The fixture policy is 25 included beds and INR 500 per additional bed/month.
- Capacity is scoped to each canonical UI-12 facility; it is not pooled, and occupancy remains owned by UI-6.
- Tenant Admin can quote, payment-gate and activate additional licensed beds, with immutable purchase history and policy snapshots.
- The accepted proration fixture is DAILY / ACTUAL_CALENDAR_DAYS with purchase-date and period-end inclusion: 10 beds from 21 Sep 2026 through 30 Oct 2026 totals INR 6,505.38.
- Failed payment leaves licensed capacity unchanged; verified activation is idempotent. The 25-bed boundary allows 25 active configured beds and rejects 26 until capacity is added.
- Renewal includes active additional capacity at the configured monthly rate.
- Dedicated capacity suite: 16 passed, 0 failed, 0 skipped. Full pre-extension baseline was 71 passed; no final pre-API audit or UI-14 was run.

## Bed-Capacity Blocker Closure Pass 1

- Platform capacity-policy permissions and commands now support Draft/Future creation, safe Draft/Future edits, activation, supersession and policy history with effective-date resolution.
- Historical capacity policy versions and checkout/purchase snapshots are preserved; overlapping applicable policies resolve as configuration errors rather than silently falling back to fixture values.
- Subscription grace duration is resolved from persisted commercial lifecycle configuration rather than a lifecycle constant.
- UI-12 `createBed`, `updateBed` activation and `reactivateBed` call the registered UI-13 capacity resolver at the domain-command boundary. Active beds consume capacity; inactive historical beds do not.
- Closure tests cover policy authorization/lifecycle, effective dating, configurable grace and terms, and direct 25/26 plus 35/36 bed-command enforcement.
- Closure suite: 28 passed, 0 failed, 0 skipped. Complete suite after closure: 80 passed, 0 failed, 0 skipped. Build passed with the existing Vite chunk-size warning.
- Browser smoke passed for Super Admin policy create/edit/activate/supersede/reload, tenant policy denial, failed-payment retry, verified capacity activation, purchase history, 390px layout and zero browser console errors/warnings.

## Bed-Capacity Blocker Closure Pass 2

- Capacity add-on quotes now apply tenant discounts only when the resolved capacity policy is discountable and the existing tenant discount is active, effective for the purchase date and currency-compatible.
- Configured taxability now controls whether the policy tax rate is applied. The deterministic order is prorated base, discount, taxable amount, tax, then total, with aggregate two-decimal money rounding.
- Checkout and purchase snapshots retain discount/tax eligibility, references, rates and monetary results. Renewal keeps facility subscription discounting separate from the bed add-on component.
- The quote screen exposes prorated base, discount, taxable amount, tax and total.
- Pass 2 focused suite: 25 passed, 0 failed, 0 skipped. Complete suite after Pass 2: 84 passed, 0 failed, 0 skipped. Build passed with the existing Vite chunk-size warning.

## Bed-Capacity Blocker Closure Pass 4

- Capacity purchase history now uses a compact read-only summary with accessible expandable details sourced solely from the immutable `capacityPurchases` snapshot.
- History exposes purchase, tenant, subscription, facility, checkout/payment references, capacity before/after, policy/version, unit price, proration, discount, tax and total fields without recalculating historical values.
- No immediate capacity-reduction workflow exists; no command reduces licensed capacity below active configured beds, and lifecycle transitions preserve physical and historical records.
- Pass 4 focused snapshot suite: 27 passed, 0 failed, 0 skipped. Full suite after Pass 4: 86 passed, 0 failed, 0 skipped. Build passed with the existing Vite chunk-size warning.

## Backend Boundary

Future backend responsibilities include identity/authentication, subscription persistence, authoritative pricing, Stripe Checkout Session creation, webhook verification, payment idempotency, tax/accounting compliance, entitlement enforcement, concurrency control and immutable audit.
