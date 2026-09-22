# UI API Contract Register

Frontend-only contract register for UI-7 and future UI phases. These are endpoint concepts, not implemented backend APIs.

## UI-7 Home Care

| UI action | Domain command | Canonical inputs | Permission | Validation / transition | Projection effects | Future endpoint concept |
|---|---|---|---|---|---|---|
| Activate enrollment | `activateHomeCareEnrollment` | `enrollmentId`, `clientId`, `admissionId`, `effectiveStart` | `home-care.enroll` | Draft -> Active; client and tenant/location scope required | Enrollment-start timeline event | `POST /api/home-care/enrollments/{id}/activate` |
| Create plan | `createHomeCarePlan` | `enrollmentId`, `clientId`, `admissionId`, objectives, service types | `home-care.plan.manage` | Active enrollment and non-empty objectives | Plan projection on Client 360 | `POST /api/home-care/plans` |
| Activate plan | `activateHomeCarePlan` | `planId` | `home-care.plan.manage` | Objectives required; Draft -> Active | None | `POST /api/home-care/plans/{id}/activate` |
| Schedule visit | `scheduleHomeVisit` | `enrollmentId`, `planId`, service, date/time, staff, duration | `home-care.visit.schedule` | Active enrollment; duplicate date/time is idempotent | Optional assignment task | `POST /api/home-care/visits` |
| Assign staff | `assignHomeCareStaff` | `visitId`, `staffId` | `home-care.visit.schedule` | Staff location and active visit scope must match | Visit assignment state | `POST /api/home-care/visits/{id}/assignment` |
| Start visit | `startHomeVisit` | `visitId`, `startedAt`, `startedBy` | `home-care.visit.start` | Confirmed, assigned visit -> InProgress; duplicate start rejected | None | `POST /api/home-care/visits/{id}/start` |
| Save documentation | `saveHomeVisitDraft` | `visitId`, observations, services, outcome | `home-care.visit.document` | InProgress only; versioned draft | Draft document metadata | `PUT /api/home-care/visits/{id}/documentation` |
| Complete visit | `completeHomeCareVisit` | `visitId`, completedAt, completedBy, outcome | `home-care.visit.complete` | Required documentation; InProgress -> Completed | Stable `homecare-visit:{id}:completed` timeline event | `POST /api/home-care/visits/{id}/complete` |
| Cancel visit | `cancelHomeCareVisit` | `visitId`, reason, cancelledAt, cancelledBy | `home-care.visit.cancel` | Scheduled/Confirmed only; visit retained | Historical cancellation provenance | `POST /api/home-care/visits/{id}/cancel` |
| Mark missed | `markHomeCareVisitMissed` | `visitId`, reason, missedAt, missedBy | `home-care.visit.miss` | Scheduled/Confirmed only; Missed != Cancelled | Follow-up task and open follow-up record | `POST /api/home-care/visits/{id}/miss` |
| Create follow-up | `createHomeCareFollowUp` | `visitId`, `clientId`, reason | `home-care.follow-up.manage` | One open follow-up per visit | Task where actionable | `POST /api/home-care/follow-ups` |
| Escalate concern | `escalateHomeCareConcern` | `visitId`, `clientId`, concern | `home-care.escalate` | Visit and tenant/location scope required | Task, notification, follow-up record | `POST /api/home-care/escalations` |

## Boundary

Client identity remains owned by the UI-3 Client Registry. Admission identity remains owned by UI-3. Treatment Plan remains owned by UI-4. Incident records remain owned by UI-6; Home Care escalation currently creates a scoped Home Care follow-up/task and is ready to call the canonical Incident command when backend integration is introduced.

The mock store provides API-shaped domain commands and deterministic fixture state only. It does not provide server authorization, transactions, concurrency control, immutable audit logging, or production delivery guarantees.

## UI-8 Extended Care Continuum

| UI action | Domain command | Canonical references | Permission | Validation / transition | Projection effects | Future endpoint concept |
|---|---|---|---|---|---|---|
| Finalize nutrition assessment | `finalizeNutritionAssessment` | `clientId`, `admissionId` | `nutrition.assess` | Draft -> Finalized; finalized record is immutable | Nutrition assessment timeline event | `POST /api/nutrition/assessments/{id}/finalize` |
| Create nutrition plan | `createNutritionPlan` | `assessmentId`, `clientId`, `admissionId` | `nutrition.plan.manage` | Finalized assessment required | Client 360 nutrition projection | `POST /api/nutrition/plans` |
| Activate nutrition plan | `activateNutritionPlan` | `planId`, `clientId`, `admissionId` | `nutrition.plan.manage` | Draft -> Active; one active scope | Plan activated timeline event | `POST /api/nutrition/plans/{id}/activate` |
| Record nutrition follow-up | `recordNutritionFollowUp` | `planId`, `clientId`, `admissionId` | `nutrition.plan.manage` | Scheduled -> Completed | Follow-up history | `POST /api/nutrition/follow-ups/{id}/complete` |
| Add caregiver | `addCaregiver` | `clientId`, consent reference | `family.manage` | Known contact and authorization status remain distinct | Client 360 family projection | `POST /api/clients/{clientId}/caregivers` |
| Record family session | `recordFamilySession` | `clientId`, `caregiverId`, `admissionId` | `family.session.document` | Explicit authorization check; Scheduled -> Completed | Optional engagement history | `POST /api/family/sessions/{id}/complete` |
| Record caregiver education | `recordCaregiverEducation` | `clientId`, caregiver recipient | `family.manage` | Recipient and topic required | Action history | `POST /api/family/education` |
| Schedule telehealth | `scheduleTelehealthAppointment` | `clientId`, `admissionId` | `telehealth.schedule` | Scoped client, clinician, date/time | Appointment queue | `POST /api/telehealth/appointments` |
| Start telehealth | `startTelehealthSession` | `appointmentId`, `clientId`, `admissionId` | `telehealth.session.manage` | Scheduled/Confirmed/Ready -> InProgress; duplicate start rejected | None | `POST /api/telehealth/appointments/{id}/start` |
| Complete telehealth | `completeTelehealthSession` | `appointmentId`, `clientId`, `admissionId`, outcome | `telehealth.session.manage` | InProgress -> Completed; outcome required | Stable completion timeline event | `POST /api/telehealth/appointments/{id}/complete` |
| Cancel / no-show telehealth | `cancelTelehealthAppointment` / `markTelehealthNoShow` | `appointmentId`, reason | `telehealth.session.manage` | Preserve distinction and provenance | Optional follow-up | `POST /api/telehealth/appointments/{id}/cancel` or `/no-show` |
| Update readiness | `updateDischargeReadiness` | `dischargePlanId`, `clientId`, `admissionId` | `discharge.plan.manage` | Item state transition with owner/provenance | Blocker state | `PUT /api/discharge/plans/{id}/readiness/{itemId}` |
| Review discharge | `reviewDischargePlan` | `dischargePlanId`, `clientId`, `admissionId` | `discharge.review` | All required items complete -> ReadyForDischarge | Review provenance | `POST /api/discharge/plans/{id}/review` |
| Finalize discharge | `finalizeDischarge` | `clientId`, `admissionId`, `dischargePlanId`, disposition, destination | `discharge.finalize` | Active admission, active occupancy, ready plan; finalize once | Admission closure, occupancy closure, bed release, stable discharge event, aftercare task | `POST /api/discharge/plans/{id}/finalize` |
| Activate aftercare | `activateAftercarePlan` | `clientId`, discharged `admissionId`, `dischargePlanId` | `aftercare.plan.manage` | Draft -> Active; discharged episode remains referenceable | Aftercare activated timeline event | `POST /api/aftercare/plans/{id}/activate` |
| Schedule aftercare follow-up | `scheduleAftercareFollowUp` | `aftercarePlanId`, `clientId`, discharged `admissionId` | `aftercare.plan.manage` | Active/Draft plan and scheduled time | Follow-up queue | `POST /api/aftercare/follow-ups` |
| Complete aftercare follow-up | `completeAftercareFollowUp` | `followUpId`, `clientId`, `admissionId`, outcome | `aftercare.followup.document` | Scheduled -> Completed; duplicate completion rejected | Follow-up history | `POST /api/aftercare/follow-ups/{id}/complete` |
| Escalate aftercare concern | `escalateAftercareConcern` | `followUpId`, `clientId`, concern | `aftercare.followup.document` | Open follow-up and concern required | Scoped notification; existing clinical/incident workflow remains owner | `POST /api/aftercare/follow-ups/{id}/escalate` |

### Discharge Transaction Boundary

The frontend simulates the expected coordinated result only. A future backend must execute finalization transactionally: finalize the discharge plan, close the canonical admission, close active occupancy, release the bed, preserve historical occupancy and emit durable timeline/outbox events. Server authorization, atomicity, concurrency control and immutable audit are not claimed by this UI.

### Consent and Privacy Boundary

Family records distinguish known contacts from authorized information recipients. UI-8 stores a consent reference and restrictions but does not create a competing consent authority; UI-10/backend consent enforcement remains the future owner.

## UI-9 Billing and Inventory

| UI action | Domain command | Canonical references | Permission | Validation / transition | Audit / projection | Future endpoint concept |
|---|---|---|---|---|---|---|
| Create manual charge | `createManualCharge` | `clientId`, `admissionId`, optional source reference | `billing.charge.create` | Positive quantity/rate; tenant/location scope | Charge provenance | `POST /api/billing/charges` |
| Create source charge | `createChargeFromSource` | `sourceModule`, `sourceType`, `sourceId` | `billing.charge.create` | Same source cannot produce duplicate active charge | Idempotency required | `POST /api/billing/charges/from-source` |
| Create draft invoice | `createDraftInvoice` | Charge IDs, `clientId`, `admissionId`, payer | `billing.invoice.create` | At least one eligible unbilled charge | Draft invoice history | `POST /api/billing/invoices` |
| Finalize invoice | `finalizeInvoice` | `invoiceId`, charge IDs | `billing.invoice.finalize` | Draft, valid totals, charges not already invoiced | `invoice:{id}:issued`; finalized record immutable | `POST /api/billing/invoices/{id}/finalize` |
| Record payment | `recordPayment` | `invoiceId`, `clientId`, `admissionId` | `billing.payment.record` | Positive amount, no overpayment, valid invoice | `payment:{id}:recorded`; balance update | `POST /api/billing/invoices/{id}/payments` |
| Adjust invoice | `createAdjustment` | `invoiceId`, client/admission references | `billing.adjustment.create` | Finalized invoice and reason required | Adjustment provenance | `POST /api/billing/invoices/{id}/adjustments` |
| Void invoice | `voidInvoice` | `invoiceId`, reason | `billing.invoice.void` | Historical void, no deletion; explicit reason | `invoice:{id}:voided` | `POST /api/billing/invoices/{id}/void` |
| Receive stock | `receiveStock` | `itemId`, `locationId`, lot/batch | `inventory.receive` | Positive quantity; creates receipt transaction | Stock transaction history | `POST /api/inventory/receipts` |
| Issue stock | `issueStock` | `itemId`, `locationId`, optional source | `inventory.issue` | Available quantity; no negative stock | Issue transaction provenance | `POST /api/inventory/issues` |
| Create stock request | `createStockRequest` | item, source/destination locations | `inventory.request` | Source != destination; positive quantity | Request lifecycle | `POST /api/inventory/requests` |
| Approve request | `approveStockRequest` | `requestId` | `inventory.transfer.approve` | Requested -> Approved; available quantity checked | Approval provenance | `POST /api/inventory/requests/{id}/approve` |
| Issue transfer | `issueStockTransfer` | `requestId`, item, source/destination | `inventory.transfer.issue` | Approved, quantity available; one issue | Transfer issue provenance | `POST /api/inventory/transfers/{id}/issue` |
| Receive transfer | `receiveStockTransfer` | `transferId`, destination | `inventory.transfer.receive` | Issued only; one receipt | Transfer completion provenance | `POST /api/inventory/transfers/{id}/receive` |
| Adjust stock | `adjustStock` | item/location, delta, reason | `inventory.adjust` | No negative result; exceptional reason required | Adjustment transaction | `POST /api/inventory/adjustments` |

### UI-9 Atomicity and Concurrency

Future backend implementation must make invoice finalization, payment allocation, source-charge generation, stock issue, stock transfer issue/receipt, and stock adjustment transactional or otherwise concurrency-safe. The frontend provides idempotency and domain validation simulations only; it does not claim server atomicity, locking, or authoritative accounting calculations.

## UI-10 Governance, Audit and Analytics

| UI action | Domain command | Canonical references | Permission | Validation / transition | Audit/task effect | Future endpoint concept |
|---|---|---|---|---|---|---|
| Register document | `registerDocument` | `clientId`, `admissionId`, source reference | `documents.upload` | Metadata and classification required | Document registration audit | `POST /api/documents` |
| Create document version | `createDocumentVersion` | `documentId` | `documents.version.create` | Current version becomes Superseded; history retained | Version audit | `POST /api/documents/{id}/versions` |
| Capture consent | `captureConsent` | Trusted `tenantId`, `clientId`, admission/episode, type, scope and provenance | `consent.capture` | Tenant is mandatory and persisted; active reuse is scoped by tenant, client, admission, type, source form and template/version; invalid context denied | Consent capture audit | `POST /api/consents` |
| Revoke consent | `revokeConsent` | `consentId`, trusted tenant/client context | `consent.revoke` | Active -> Revoked; reason and tenant/client scope required where supplied; no deletion or silent reactivation | Consent revocation audit | `POST /api/consents/{id}/revoke` |
| Resolve compliance exception | `resolveComplianceException` | exception source reference | `compliance.manage` | Open/InProgress -> Resolved; resolution required | Compliance task resolution | `POST /api/compliance/exceptions/{id}/resolve` |
| Request report export | `requestReportExport` | authorized tenant/location filters | `reports.export` | Export request uses current scope; no unauthorized rows | Report task | `POST /api/reports/requests` |

### UI-10 Backend Boundaries

Future backend responsibilities include secure file upload/storage, consent enforcement, append-only immutable audit, server-side tenant/location row-level security, analytics read models, and authorized report generation. Frontend metadata persistence is not production file security, audit immutability, compliance certification, or analytics security enforcement.

## UI-11 Contextual AI

| UI action | Domain command | Canonical references | Permission / boundary | Validation | Result / audit | Future endpoint concept |
|---|---|---|---|---|---|---|
| Build authorized context | `buildAuthorizedAiContext` | client, admission, source references | AI permission intersected with source permission, tenant, location, privacy and consent | Purpose-bound deny-by-default context | Safe context manifest | `POST /api/ai/context` |
| Request assistance | `requestAiAssistance` | client/admission and authorized context references | `ai.use` plus source-domain access | Authorized context required; deterministic failure supported | Request + recommendation IDs | `POST /api/ai/requests` |
| Review recommendation | `reviewAiRecommendation` | `requestId`, `recommendationId` | `ai.recommendation.review` | ReadyForReview only; accept/partial/reject | Review audit event | `POST /api/ai/recommendations/{id}/review` |
| Apply recommendation | `applyAiRecommendation` | recommendation and canonical target | `ai.recommendation.apply` plus target command authorization | Reviewed content, accepted sections, current context fingerprint, one apply | Canonical command reference and audit | `POST /api/ai/recommendations/{id}/apply` |
| Retry failed request | `retryAiRequest` | failed `requestId` | `ai.use` | Failed request only; no canonical mutation | New request/recommendation identity | `POST /api/ai/requests/{id}/retry` |

### AI Orchestration Boundary

Production architecture must remain UI -> MedixPro API -> authorization/context builder -> AI orchestration/provider -> structured recommendation -> human review -> canonical domain API. The browser must not call model providers or hold provider secrets. Frontend filtering is an acceptance foundation, not server-side authorization or clinical AI safety enforcement.

### Stale Context and Idempotency

Recommendations carry a context fingerprint and applied command reference. Backend implementation must enforce stale-context rejection, duplicate apply protection, tenant/location/privacy/consent filtering, and durable provenance.

## UI-12 Enterprise Configuration and Master Data

| UI action | Domain command | Canonical references | Permission | Validation / transition | Audit / projection effect | Future endpoint concept |
|---|---|---|---|---|---|---|
| Create or update unit | `createUnit` / `updateUnit` | tenant, location | `facility.configure` | Unique code within tenant/location; active/inactive lifecycle | Unit audit; facility selector projection | `POST /api/configuration/units` / `PUT /api/configuration/units/{id}` |
| Create or update room | `createRoom` / `updateRoom` | tenant, location, `unitId` | `room.manage` | Parent scope must match; duplicate room code blocked; history retained | Room audit; Bed Board configuration projection | `POST /api/configuration/rooms` / `PUT /api/configuration/rooms/{id}` |
| Deactivate room | `deactivateRoom` | `roomId`, active-bed dependency | `room.manage` | Requires reason; active beds block deactivation | Deactivation audit; no historical deletion | `POST /api/configuration/rooms/{id}/deactivate` |
| Create or update bed definition | `createBed` / `updateBed` | tenant, location, `roomId` | `bed.configure` | Unique bed code; active room parent; physical status is distinct from occupancy | Bed audit; registers stable bed ID with UI-6 Bed Board | `POST /api/configuration/beds` / `PUT /api/configuration/beds/{id}` |
| Deactivate bed definition | `deactivateBed` | `bedId`, occupancy reference | `bed.configure` | Occupied bed cannot be deactivated; historical occupancy remains | Bed deactivation audit | `POST /api/configuration/beds/{id}/deactivate` |
| Create programme | `createProgramme` | tenant | `programme.manage` | Unique programme code; active lifecycle | Programme selector projection | `POST /api/configuration/programmes` |
| Create service definition | `createServiceDefinition` | tenant | `billing.service.manage` | Unique service code; controlled category/unit | Service catalogue projection | `POST /api/configuration/services` |
| Create payer | `createPayer` | tenant | `billing.payer.manage` | Unique payer code; controlled payer type | Payer audit | `POST /api/configuration/payers` |
| Create tariff and line | `createTariff` / `addTariffLine` | payer, service, location | `billing.tariff.manage` | Effective range valid; non-negative monetary rate; tariff requires lines before activation | Tariff audit; future charge resolution only | `POST /api/configuration/tariffs` / `POST /api/configuration/tariffs/{id}/lines` |
| Activate or supersede tariff | `activateTariff` / `supersedeTariff` | tariff history | `billing.tariff.manage` | Draft requires lines; supersession requires reason; finalized invoices unchanged | Effective-dated tariff history | `POST /api/configuration/tariffs/{id}/activate` / `/supersede` |
| Create or update inventory item | `createInventoryItem` / `updateInventoryItem` | tenant, item ID | `inventory.item.manage` | Unique item code; item definition cannot edit stock quantity | Item audit; stable item ID registered with UI-9 | `POST /api/configuration/inventory-items` / `PUT /api/configuration/inventory-items/{id}` |

### UI-12 Lifecycle Detail Contracts

| Detail / lifecycle action | Command | Permission | Dependency validation | State transition | Historical preservation |
|---|---|---|---|---|---|
| View master detail | scoped read projection | `configuration.view` plus entity view/manage | Tenant/location and entity ID must match | No mutation | Existing references remain visible |
| Edit bed | `updateBed` | `bed.configure` | Master attributes only; occupancy is excluded | Active/Inactive -> same status | Occupancy history unchanged |
| Deactivate/reactivate bed | `deactivateBed` / `reactivateBed` | `bed.configure` | Occupied bed blocks deactivation; active room required for reactivation | Active <-> Inactive | Stable bed ID and history retained |
| Edit/deactivate/reactivate programme | `updateProgramme` / `setProgrammeStatus` | `programme.manage` | Unique code; inactive programme is excluded from new selection | Active <-> Inactive | Admission/enrolment references retained |
| Edit/deactivate/reactivate service | `updateServiceDefinition` / `deactivateServiceDefinition` / `reactivateServiceDefinition` | `billing.service.manage` | Unique code; inactive service excluded from new tariff selection | Active <-> Inactive | Charge, invoice and tariff line references retained |
| Edit/deactivate/reactivate payer | `updatePayer` / `deactivatePayer` / `reactivatePayer` | `billing.payer.manage` | Unique code; historical payer references retained | Active <-> Inactive | Invoice payer history unchanged |
| Edit tariff / tariff line | `updateTariff` / `updateTariffLine` | `billing.tariff.manage` | Draft/future only; effective range and non-negative rate validation | Draft/Future -> updated | Finalized financial facts are not rewritten |
| Activate/supersede tariff | `activateTariff` / `supersedeTariff` | `billing.tariff.manage` | Activation requires lines; supersession requires reason | Draft -> Active; Active -> Superseded | Historical rate and invoice amount retained |
| Edit/deactivate/reactivate item | `updateInventoryItem` / `deactivateInventoryItem` / `reactivateInventoryItem` | `inventory.item.manage` | Item definition only; stock balance is not editable here | Active <-> Inactive | Receipts, issues, transfers and adjustments retained |

Lifecycle commands require explicit actor/reason metadata in the frontend audit foundation. Backend implementation must add server-side authorization, optimistic concurrency and durable immutable audit.

## UI-13 SaaS Subscription and Facility Licensing

| UI action | Domain command | Permission | Validation / state transition | Snapshot / audit boundary | Future endpoint concept |
|---|---|---|---|---|---|
| Register tenant | `registerTenant` | Public registration boundary | Account, organization and primary facility minimum; RegistrationPending | Tenant Registered; no production identity claim | `POST /api/saas/tenants/register` |
| Create initial facility | `createInitialFacility` | Registration or `tenant.facility.create` | Unique tenant facility code; operational facility separate from paid entitlement | Facility Added; entitlement starts PendingPayment | `POST /api/saas/tenants/{id}/facilities` |
| Calculate subscription quote | `calculateSubscriptionQuote` | `tenant.subscription.view` or checkout permission | Facility quantity only; active plan price/currency; quarterly period | Facility quantity, price, discount and currency snapshot | `POST /api/saas/subscriptions/quote` |
| Create checkout | `createOnboardingCheckout` | `tenant.subscription.checkout` | One non-failed checkout per subscription snapshot; browser cannot edit amounts | PlatformCheckout Created; provider is Stripe-ready placeholder only | `POST /api/saas/checkouts` |
| Record verified payment result | `recordSimulatedPaymentResult` | Frontend acceptance boundary | Pending -> Succeeded/Failed; no URL redirect trust | SubscriptionPayment record; provider verification remains backend | `POST /api/saas/checkouts/{id}/result` |
| Activate subscription | `activateSubscriptionFromVerifiedPayment` | `tenant.subscription.checkout` in UI simulation | Succeeded checkout only; idempotent activation | Subscription Activated; future backend webhook verification required | `POST /api/saas/subscriptions/{id}/activate` |
| Add tenant facility | `addTenantFacility` | `tenant.facility.create` | Creates operational facility once; entitlement PendingPayment | Facility added without silent paid activation | `POST /api/saas/subscriptions/{id}/facilities` |
| Add commercial discount | `createTenantDiscount` | `platform.discount.manage` | Percentage <= 100 or non-negative fixed amount; tenant scope; future quote effect | Discount Added with reason and effective period | `POST /api/saas/tenants/{id}/discounts` |

### UI-13 Commercial Boundary

UI-13 owns platform Tenant, Facility, Subscription, Subscription Period, Discount, Checkout and Subscription Payment concepts. UI-9 patient Client, Admission, Charge, Healthcare Invoice, Payer and Patient Payment concepts remain separate and are not reused. The subscription billing unit is the subscribed facility count; rooms, beds, occupancy and patients do not affect the quote.

### UI-13 Pass 1 Canonical Facility Boundary

UI-12 owns the canonical operational Facility/Location identity through its `locations` collection and location commands. UI-13 does not own a writable facility master. UI-13 reads canonical locations through a selector adapter and writes only `FacilityEntitlement` records keyed by `facilityId`.

Registration and add-facility flows call the canonical UI-12 location creation command first, then create commercial entitlement state referencing that same ID. Unit/Ward records remain children of a canonical facility and are not counted as subscribed facilities. Commercial snapshots may retain facility ID/name for historical display, but are not writable facility masters.

Future backend contracts must validate that `FacilityEntitlement.tenantId` matches the referenced canonical facility tenant, preserve operational facility history when entitlement changes, and coordinate registration/facility creation/payment atomically. Frontend acceptance does not claim transaction atomicity or server entitlement enforcement.

### UI-13 Pass 2 Commercial Lifecycle

| UI action | Domain command | Snapshot / validation | State transition | Future backend boundary |
|---|---|---|---|---|
| Create facility entitlement | `createFacilityEntitlement` | Canonical UI-12 `facilityId`, tenant agreement, subscription reference | none -> PendingPayment | Tenant/facility validation and atomic persistence |
| Facility addition quote | `createFacilityAdditionCheckout` | Active quantity + 1, policy `FULL_CURRENT_PERIOD`, plan price, discount and currency snapshot | quote -> checkout Pending | Server-authoritative amount and idempotency |
| Activate added facility | `activateFacilityEntitlement` | Verified payment reference; same canonical facility ID; duplicate activation blocked | PendingPayment -> Active | Payment verification, entitlement activation and audit transaction |
| Renewal quote | `createRenewalCheckout` | Active entitlement quantity, next period, price and discount snapshot | renewal due -> checkout Pending | Server pricing/effective-date resolution |
| Extend subscription | `extendSubscriptionFromVerifiedPayment` | Successful verified checkout; duplicate extension blocked | payment -> exactly one new SubscriptionPeriod; entitlements extended | Atomic payment, period and entitlement transaction |

Pass 2 uses deterministic frontend policy `FULL_CURRENT_PERIOD`: Facility 3 becomes commercially effective after verified payment and the active quantity becomes 3 for the future renewal calculation. The prior period quantity remains 2. Stripe webhooks, server payment verification, persistence, concurrency and accounting remain future backend responsibilities.

### UI-13 Pass 3 Commercial Administration and Lifecycle

| UI action | Domain command / projection | Permission | Validation / lifecycle boundary | Future endpoint concept |
|---|---|---|---|---|
| Platform tenant directory | `getUi13VisibleRecords` platform projection | `platform.tenants.view` | Platform commercial records only; no patient data | `GET /api/platform/tenants` |
| Tenant commercial detail | tenant, subscription, facility, payment, period, entitlement and audit projections | `platform.tenants.view` | Tenant ID and platform scope required | `GET /api/platform/tenants/{tenantId}/commercial` |
| Derived lifecycle status | `getSubscriptionLifecycle` | tenant/platform subscription view | Deterministic fixture date; backend time authoritative | `GET /api/saas/subscriptions/{id}/lifecycle` |
| Simulate lifecycle state | `simulateSubscriptionLifecycle` | tenant subscription view or platform subscription manage | Does not delete operational data; Grace/Expired changes commercial status only | `POST /api/saas/subscriptions/{id}/lifecycle` |
| Reactivate from verified renewal | `extendSubscriptionFromVerifiedPayment` | `tenant.subscription.checkout` | One successful checkout creates one period and reactivates matching entitlements | `POST /api/saas/subscriptions/{id}/reactivate` |

Pass 3 uses a deterministic 14-day renewal grace policy. RenewalApproaching, RenewalDue, Grace and Expired are derived/simulated lifecycle states; production time, scheduled transitions, payment verification, entitlement enforcement and atomic reactivation remain backend responsibilities. Expiry never deletes tenants, canonical facilities, operational hierarchy, clinical records or historical commercial records.

### UI-13 Onboarding Checkout Handoff

`registerTenant` initializes the tenant, pending subscription and a purpose-limited `OnboardingContext`. The canonical facility is created through UI-12 `createLocation`, then the context is bound to `tenantId`, `subscriptionId`, `planId`, currency and onboarding purpose. `/subscription/checkout` is allowed only when the persisted context is valid and its allowed route includes checkout.

The onboarding context is not a role and does not grant clinical, patient billing, inventory, Super Admin or normal Tenant Admin permissions. A stale Clinician session is replaced only by a restricted onboarding shell/access projection for the checkout route. Direct checkout without context remains denied. Verified onboarding payment creates one initial period, activates pending entitlements and completes the context; production identity, payment verification, transactions and server authorization remain backend responsibilities.

Plan prices carry currency and effective context. A tenant subscription uses one currency. Checkout amounts, facility quantity, discount and period are snapshotted. Historical periods are not recalculated after price or discount changes. Stripe production checkout, webhook verification, server authorization, persistence, tax/accounting enforcement and entitlement enforcement remain backend responsibilities.

### UI-13 Verified Onboarding to Tenant Session Handoff

Verified onboarding payment completes the frontend simulation in this order: activate subscription, create exactly one initial period, activate pending facility entitlements, establish a purpose-scoped TenantMembership/session projection, complete the onboarding context, and navigate into the normal tenant application context. The previous Clinician membership/profile is not mutated.

The simulated session stores `tenantId`, tenant name, membership reference and Tenant Administrator role projection. Normal tenant routes resolve from this active tenant session after onboarding; the onboarding context is not retained as permanent authorization. Production identity, TenantMembership persistence, role assignment, session issuance, server authorization and payment/webhook verification remain backend responsibilities.

### UI-13 Bed-Capacity Extension

| UI action | Domain command / projection | Permission | Validation / snapshot boundary | Future endpoint concept |
|---|---|---|---|---|
| Read capacity policy | `getCapacityPolicy` / `capacityPolicies` | `platform.pricing.manage` or tenant subscription view | Effective-dated plan, market and currency policy; included beds, unit price, discountability, taxability and proration are snapshotted | `GET /api/saas/capacity-policies` |
| Quote additional beds | `calculateBedCapacityQuote` | `tenant.subscription.view` or checkout | Facility-scoped quantity; DAILY / ACTUAL_CALENDAR_DAYS; purchase date and period end inclusive | `POST /api/saas/capacity/quote` |
| Create capacity checkout | `createBedCapacityCheckout` | `tenant.subscription.checkout` | Canonical facility entitlement and tenant match; one non-failed checkout per facility; no browser payment provider call | `POST /api/saas/capacity-checkouts` |
| Activate capacity | `activateBedCapacityPurchase` | `tenant.subscription.checkout` | Succeeded verified result only; idempotent; immutable policy and amount snapshot | `POST /api/saas/capacity-checkouts/{id}/activate` |
| Validate configured bed activation | `validateBedCapacityForActivation` | UI-12/UI-6 command boundary | Active configured beds must not exceed that facility's licensed capacity; occupancy is not billing quantity | `POST /api/facilities/{id}/beds/validate-capacity` |
| Renew capacity | `createRenewalCheckout` | `tenant.subscription.checkout` | Active additional bed quantity is included at the effective policy monthly rate | `POST /api/saas/subscriptions/{id}/renewal-quote` |

UI-12 remains the canonical Facility/Location and Bed master; UI-6 remains the canonical occupancy/Bed Board owner. UI-13 owns only per-facility licensed capacity, add-on checkout, verified activation and immutable purchase history. Capacity is never pooled across facilities. The fixture policy uses 25 included beds and INR 500 per additional bed/month, but policy values are configurable state rather than product constants. Production payment verification, tax, persistence, concurrency and server-side bed entitlement enforcement remain backend responsibilities.

### UI-13 Bed-Capacity Policy Management and Enforcement Closure

| UI action | Domain command / projection | Permission | Validation / lifecycle boundary | Future endpoint concept |
|---|---|---|---|---|
| Create policy version | `createCapacityPolicy` | `platform.subscription.capacityPolicy.manage` | Non-negative whole included capacity and price; supported proration/basis/treatments; no overlapping applicable policy | `POST /api/platform/capacity-policies` |
| Update draft/future policy | `updateCapacityPolicyDraft` | `platform.subscription.capacityPolicy.manage` | Draft/Future only; historical effective policy cannot be rewritten | `PATCH /api/platform/capacity-policies/{id}` |
| Activate policy | `activateCapacityPolicy` | `platform.subscription.capacityPolicy.manage` | Draft/Future -> Active; version remains immutable after use | `POST /api/platform/capacity-policies/{id}/activate` |
| Supersede policy | `supersedeCapacityPolicy` | `platform.subscription.capacityPolicy.manage` | Active -> Superseded with effective end; historical snapshot retained | `POST /api/platform/capacity-policies/{id}/supersede` |
| Resolve applicable policy | `getApplicableCapacityPolicy` | Platform/tenant commercial projection | Plan, market, currency and transaction date; zero or ambiguous applicable matches are configuration errors | `GET /api/saas/capacity-policies/effective` |
| Read policy history | `getCapacityPolicyHistory` | `platform.subscription.capacityPolicy.view` | Version and supersession relationship retained | `GET /api/platform/capacity-policies/history` |
| Resolve subscription lifecycle policy | `getSubscriptionCommercialPolicy` | Platform/tenant subscription view | Grace duration and subscription lifecycle terms come from effective commercial configuration | `GET /api/saas/subscription-commercial-policies/effective` |
| Validate active bed command | UI-12 `createBed`, `updateBed`, `reactivateBed` -> `validateBedCapacityForActivation` | Existing UI-12 bed configuration permission plus commercial entitlement | Active configured bed count after command must not exceed facility licensed capacity; inactive historical beds do not consume capacity | `POST /api/facilities/{id}/beds/validate-capacity` |
| Read capacity purchase history | `getUi13VisibleRecords` / `capacityPurchases` | Tenant subscription view or platform commercial scope | Read-only immutable purchase snapshot with tenant, subscription, facility, capacity before/after, policy/version, price, proration, discount, tax, total, checkout and payment references | `GET /api/saas/capacity-purchases` |

The frontend simulator persists policy versions in session storage only. Future backend candidates include policy identity/version uniqueness, non-overlapping effective ranges, Plan foreign keys, market/currency consistency, non-negative and whole-number constraints, immutable historical snapshots, facility-entitlement foreign keys, and transactional/concurrent bed activation checks. Browser time, browser amount, browser unit price and browser proration are not production authority; ASP.NET Core and PostgreSQL must resolve them authoritatively. Frontend authorization, persistence, enforcement and calculation remain simulation boundaries. Stripe must be called only by a future backend, with verified webhook processing and idempotent commercial activation.

Capacity quote resolution applies the configured order: prorated bed base, eligible tenant discount only when `discountable` is true, configured taxable amount, and configured tax rate only when `taxable` is true. Discount and tax references, eligibility flags and monetary results are snapshotted on checkout/purchase records. The browser does not establish tax-law correctness or production monetary authority.

Capacity purchase history renders stored snapshot values and does not call the current quote, renewal, discount or tax calculators. Future backend history responses must enforce tenant/subscription/facility authorization and return immutable commercial references and amounts from persisted records.

No immediate licensed-capacity reduction command is currently exposed. The frontend therefore cannot reduce licensed capacity below active configured beds, and grace/expiry lifecycle transitions do not delete physical beds or historical capacity records. A future downgrade or scheduled reduction workflow remains a separate commercial capability.

## UI-14 Client Portal and Digital Admission Documentation

| UI action | Domain command / projection | Permission / actor | Validation and ownership | Future endpoint concept |
|---|---|---|---|---|
| Resolve client portal context | `resolvePortalClientContext` | Portal account session | Portal account -> tenant -> canonical UI-3 client; direct client IDs are not trusted | `GET /api/portal/me` |
| Activate portal account | `activatePortalAccount` | Portal account lifecycle management | Invited -> Active; account references Client but does not duplicate demographics | `POST /api/portal/accounts/{id}/activate` |
| Read client dashboard | `getPortalVisibleRecords` | Active portal account | Client-safe projections only; UI-3/UI-4/UI-6/UI-8/UI-10 source IDs retained | `GET /api/portal/me/dashboard` |
| Read schedule | Portal schedule projection | Portal account | Trusted portal tenant + linked client must match record tenant/client; source appointment/session IDs retained | `GET /api/portal/me/schedule` |
| Read reports/documents | UI-10 document projection | Portal account + explicit disclosure | Only active records with `clientDisclosure = DISCLOSED`, matching tenant/client, and eligible classification/privacy; missing, unknown or withdrawn disclosure is denied | `GET /api/portal/me/documents` |
| Read document/report by ID | UI-14 fail-closed projection | Portal account + explicit disclosure | Direct IDs use the same tenant/client, status, disclosure and classification policy as collection reads; unauthorized IDs return not found/denied without metadata | `GET /api/portal/me/documents/{id}` / `GET /api/portal/me/reports/{id}` |
| Disclose document to client | `discloseDocumentToClient` | Authorized staff document permission | Canonical UI-10 Document command; active eligible document, tenant/client binding and reason validated; client cannot self-disclose | `POST /api/documents/{id}/disclosure` |
| Withdraw client disclosure | `withdrawDocumentDisclosure` | Authorized staff document permission | `DISCLOSED -> WITHDRAWN`; portal access ceases while provenance remains | `POST /api/documents/{id}/disclosure/withdraw` |
| Read prescriptions | UI-6 medication-order projection | Portal account | Trusted portal tenant + linked client must match record tenant/client; read-only active MedicationOrder projection; MAR is not prescription source | `GET /api/portal/me/prescriptions` |
| Submit identity document | `submitIdentityDocument` | Portal account | Masked number, linked client/admission, NeedsReview; no OCR or production storage claim | `POST /api/portal/me/identity-documents` |
| Verify identity document | `verifyIdentityDocument` | `identity.verify` staff permission | Verified/Rejected decision, reason and verifier required; history retained | `POST /api/admissions/{id}/identity-documents/{docId}/verify` |
| Replace rejected identity document | `replaceIdentityDocument` | Linked portal account | Current verification must be Rejected; creates a new UI-10 Document and UI-14 IdentityVerification linked by replacement IDs; repeated replacement is idempotently denied | `POST /api/portal/me/identity-documents/{verificationId}/replace` |
| Read identity verification history | `getIdentityVerificationHistory` / `getCurrentIdentityVerification` | Staff review or linked portal projection | Historical rejected records remain immutable; current resolves from replacement relationships | `GET /api/admissions/{id}/identity-documents/history` |
| Sign admission form | `submitFormSignature` | Portal account | Form tenant/client/admission must match trusted portal context; form instance version, acknowledgement and typed signature required; finalized once | `POST /api/portal/me/forms/{id}/sign` |
| Read admission readiness | UI-14 checklist projection | Portal/staff admission scope | Checklist references Client, Admission, Document, Consent, Identity and FormInstance IDs; no duplicate Admission | `GET /api/admissions/{id}/documentation-status` |
| Read admission documentation readiness | `evaluateAdmissionDocumentationReadiness` | Portal/staff admission scope | Derives current mandatory requirements, current identity, finalized signatures, active canonical Consent and required Documents; returns blockers without finalizing workflow | `GET /api/portal/me/admission-documentation/readiness` |
| Complete admission documentation | `completeAdmissionDocumentation` | Authorized admission-document staff permission | Resolves trusted tenant/client/admission, evaluates current requirements, denies with blockers when not ready, then completes once with completion metadata | `POST /api/admissions/{admissionId}/documentation/complete` |
| Read portal activity | `getTimelineEvents` | Active portal account | Client-safe UI-14 lifecycle projection filtered by trusted tenant/client and optional admission; stable event IDs; no restricted identity or staff-only detail | `GET /api/portal/me/activity` |
| Read Client360 lifecycle timeline | `getTimelineEvents` merged with UI-3/UI-6/UI-8 events | Authorized staff scope | Staff tenant/client scope with namespaced stable source IDs; projection only; no copied canonical events | `GET /api/clients/{clientId}/timeline` |

Identity submission creates a canonical UI-10 Document through `registerDocument` and creates an UI-14 IdentityVerification record containing `documentId`. UI-14 owns verification status/history only; it does not own a second file/document collection. Future backend submission must transactionally create the Document metadata and IdentityVerification relationship, with tenant/client/admission binding and immutable replacement/rejection history.

Rejection and replacement are separate workflow transitions: `verifyIdentityDocument(..., 'Rejected', reason)` is the single authoritative rejection transition; `replaceIdentityDocument` creates a new canonical Document and verification record with explicit replacement linkage. Future backend rejection/replacement/reverification must enforce state, tenant/client/admission/document binding, idempotency, concurrency and durable audit/server timestamps.

Portal document disclosure is an explicit UI-10 Document state, not ownership or consent inference. `clientDisclosure` must equal `DISCLOSED`; missing, null, undefined, invalid and `WITHDRAWN` values fail closed. Future API handlers and PostgreSQL queries must enforce authenticated portal account, tenant binding, canonical client binding, active/eligible status, explicit disclosure, classification/privacy restrictions and direct-ID authorization before returning metadata or issuing file access. Staff document reads remain governed by staff authorization and are not reduced to the client-portal disclosure projection.

Every tenant-owned portal `/me` query must derive tenant and client from the authenticated portal principal and linked canonical Client, then constrain the underlying query by both record `tenantId` and `clientId`. Browser-supplied tenant/client values are not authorization authority. Missing, null, undefined or invalid tenant/client ownership fails closed; the frontend remains a simulation and production ASP.NET Core/PostgreSQL authorization and query scoping remain authoritative future responsibilities.

The frontend session boundary distinguishes `STAFF`, `PORTAL` and `ANONYMOUS` modes. Portal login activates portal-only route and command scope; staff routes are denied before staff components render. Logout clears portal context and enters anonymous mode, while the existing explicit demo persona transition is required to restore staff mode. Future APIs must use distinct authenticated principal semantics: a Staff principal resolves staff membership, tenant and permissions; a Portal principal resolves PortalAccount, tenant and linked Client. A portal principal must not satisfy staff permissions by supplying tenant/client identifiers.

UI-14 lifecycle activity is a read-only projection over stable UI-14 event identities and relevant canonical Consent audit provenance. It is not immutable audit, a second canonical event store, or a browser-authoritative security boundary. Future portal DTOs must derive tenant/client from the portal principal; future staff Client360 DTOs must enforce staff scope before merging UI-3/UI-6/UI-8/UI-14 lifecycle sources.

Timeline DTOs should expose a stable `eventId`, event type, persisted occurrence time, safe display label, source type/identifier where appropriate, and admission scope where applicable. Portal activity must exclude staff-only detail, full identity values, restricted Document content and raw signature data. `READY_FOR_COMPLETION` does not emit an admission-completed event; only the guarded completion command does.

Admission documentation completion is a separate guarded workflow transition. Form signing, identity verification and Consent capture update their own canonical/workflow state only; they do not finalize admission documentation. Future completion must evaluate current requirements in a transaction with authorization, version/concurrency checks, audit intent and server time before marking the workflow complete.

Canonical Consent commands use the validated frontend domain context for simulation. Future ASP.NET Core handlers must derive tenant from the authenticated principal and authorize the linked Client/Admission; browser-provided tenant IDs are not authority. Future PostgreSQL uniqueness/idempotency must include tenant ownership in the appropriate lifecycle/provenance key without collapsing valid re-consent history, and concurrent captures require server transaction/concurrency control.

### UI-12 Configuration Boundary

Configuration is tenant/location scoped and explicitly permissioned. UI-6 remains the canonical owner of occupancy and UI-9 remains the canonical owner of stock, charges, invoices and payments. UI-12 registers stable configured bed/item IDs with those operational stores but does not create a second occupancy or stock-balance authority. Tariff resolution is frontend acceptance behavior only; backend authorization, persistence, optimistic concurrency, pricing enforcement, sequencing, accounting controls and immutable audit remain future responsibilities.
