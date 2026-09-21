# API Integration Map

The Phase 1 backend is frozen and does not expose the clinical modules required by the redesigned UI. The UI redesign must use typed service contracts and clearly labeled mock adapters until future APIs exist.

| Workflow | Required API | Available now | Mock permitted | Notes |
|---|---|---|---|---|
| Auth/session | identity, tenant, membership, refresh | Foundation only | Yes | integrate with Phase 1 identity contracts |
| Client registry | clients, duplicate matching, search | No | Yes | future Client Registry module |
| Admission | referral, readiness, documents, consent, bed | No | Yes | future Admission/Facility modules |
| Clinical assessment | assessment draft/review/sign/history | No | Yes | future Clinical module |
| Treatment plan/MDT | plan versions, reviews, actions | No | Yes | future Treatment Planning module |
| Medication/MAR | orders, reconciliation, administration | No | Yes | future Medication module |
| Residential | observations, incidents, handover, leave | No | Yes | future Residential module |
| Home care | visits, dispatch, caregiver coverage | No | Yes | future Home Care module |
| Billing/inventory | accounts, invoices, stock ledger | No | Yes | future Billing/Inventory modules |
| AI | provider request, provenance, review, feedback | No | Yes | future AI gateway; never present mocks as live |
| Tasks/notifications | unified tasks and actionable notifications | No | Yes | shared future platform capability |
| Therapy sessions | schedule, start, document, sign, amend, group and family context | No | Yes | `ui5Store.js` typed mock adapters; references UI-3 client and UI-4 treatment plan |
| Standardized assessments | definitions, assignments, responses, scores, bands, history | No | Yes | deterministic scoring in `ui5Store.js`; no LLM scoring |
| Cross-cutting access/search/tasks/notifications | permission, module, location-scoped frontend adapters | No | Yes | `access.js` and `crossCuttingStore.js`; backend authorization remains authoritative |
| Nursing/Residential UI-6 | shifts, observations, checks, incidents, handover, leave and resident context | No | Yes | `ui6Store.js` mock adapters; references UI-3 client/admission and UI-4 risk context |
| Medication/MAR UI-6 | medication orders, schedule entries, MAR outcomes, PRN mock records | No | Yes | `ui6Store.js`; no pharmacy stock or interaction engine |
| Facility/bed UI-6 | bed board, assignment, transfer, leave/return occupancy | No | Yes | `ui6Store.js`; UI-3 admission remains canonical admission owner |
