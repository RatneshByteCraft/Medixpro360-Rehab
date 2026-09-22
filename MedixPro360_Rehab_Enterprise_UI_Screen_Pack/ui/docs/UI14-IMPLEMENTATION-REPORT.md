# UI-14 Client Portal and Digital Admission Documentation

## Scope

UI-14 is additive frontend functionality. It provides a simulated client portal and digital admission documentation workflow while preserving UI-3 Client/Admission, UI-6 MedicationOrder/MAR, UI-8 care-continuum, and UI-10 Document/Consent ownership. No backend, React Native, real OCR, Aadhaar/UIDAI verification, secure object storage, or legally binding signature service was added.

## Routes

- `/portal/login`
- `/portal`
- `/portal/schedule`
- `/portal/reports`
- `/portal/prescriptions`
- `/portal/tasks`
- `/portal/documents`
- `/portal/forms`
- `/portal/profile`

## Portal

- PortalAccount links tenant and canonical Client identity without duplicating clinical demographics.
- Dashboard projections include linked admission, schedule, active medication orders, explicitly disclosed client-visible reports, forms and admission readiness.
- Client documents and reports are projected only when the canonical UI-10 Document has `clientDisclosure: 'DISCLOSED'`, matches the authenticated portal tenant/client, is active, and passes classification/privacy restrictions. Missing or invalid disclosure metadata is denied by default.
- Direct access is resolved through the simulated portal account context; another client ID cannot be selected through the portal projection.
- Collection and direct document/report ID lookups share the same fail-closed disclosure predicate; portal clients cannot disclose, withdraw, classify or otherwise mutate canonical documents.
- Tenant-owned portal projections use a shared fail-closed tenant/client scope check; missing or mismatched ownership metadata is denied rather than inferred from client ID.
- Admission documentation readiness is derived from configured checklist items and current canonical/workflow state. A signed form updates only that form requirement; an authorized `completeAdmissionDocumentation` command is required to transition the overall workflow to `Complete`.
- Medication is read-only and sourced from UI-6 MedicationOrder; MAR administration is not exposed.

## Digital Admission

- Admission documentation checklist references the existing canonical Client and Admission IDs.
- Identity documents are masked and review-gated; staff verification requires `identity.verify`.
- Admission agreement form instances preserve template version and finalize through a typed signature record.
- Signed form instances are immutable in the frontend simulation and linked to admission documentation state.
- Readiness is a frontend-derived projection with blocker codes; completion authorization, transactionality, concurrency, durable audit and server time remain future backend responsibilities.
- Consent-bearing form signatures pass the validated portal tenant to canonical UI-10 `captureConsent`. Consent reuse is tenant/client/admission/type/source/template-version scoped and revoked records are not reused as active evidence.
- Portal route authorization uses explicit `STAFF`, `PORTAL` and `ANONYMOUS` session modes. Portal mode renders only portal routes and denies staff routes before protected staff components render; logout clears portal mode without implicitly granting staff access.
- UI-14 lifecycle events are projected through `getTimelineEvents` into the client-safe `/portal/activity` view and merged, with stable `ui14:` identities, into the existing authorized Client360 timeline. No UI-3/UI-6 event copies are persisted.
- Activity projection uses tenant/client/admission scope and filters `STAFF_ONLY` events for portal readers. Consent revocation is projected from canonical UI-10 revocation provenance; the timeline remains a user-facing projection, not immutable audit.
- Identity submissions create/reference canonical UI-10 Document records; UI-14 stores only IdentityVerification workflow metadata and `documentId` relationships. Legacy in-memory identity records are migrated deterministically to this relationship.

## Responsive Boundary

The portal uses the existing React web application and responsive layout. No React Native staff or client application was added.

## Backend Boundary

Portal authentication, authorization, server-side disclosure enforcement, file persistence, OCR, identity verification, signature legal validity, durable audit, object storage, malware scanning, database isolation and production notification delivery remain future backend responsibilities. Frontend tenant context is validated simulation input; it is not production authentication or tenant isolation. Frontend projection is not a production confidentiality boundary.