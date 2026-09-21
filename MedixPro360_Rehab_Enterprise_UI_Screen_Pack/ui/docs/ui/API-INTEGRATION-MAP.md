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

## UI-1 Mock Adapter Files

- `src/app/access.js`: effective-access contract and development profiles
- `src/app/navigation.js`: permission/module/workspace navigation resolver
- `src/app/mockData.js`: synthetic tasks, notifications, attention items and search results

These files are intentionally typed-by-convention JavaScript boundaries. They do not claim that the corresponding clinical APIs exist.

## UI-2 Mock Workflow Surfaces

- `src/app/adminViews.jsx`: synthetic platform, tenant-administration and centre-operations views
- `src/app/mockData.js`: shared shell queues and synthetic attention data

UI-2 does not claim live tenant provisioning, subscriptions, entitlement changes, invitation delivery, access persistence, operational metrics or audit persistence. Those remain future API integrations.

## UI-3 Mock Workflow Services

- `src/app/ui3Store.js`: coherent synthetic referral, client and admission journey state
- `referralService`: queue, detail, screening and decision boundary
- `clientRegistryService`: search, identity and deliberate duplicate-match boundary
- `admissionService`: draft, readiness, bed condition and completion boundary
- `documentReadinessService`: required document readiness state
- `consentReadinessService`: admission consent state
- `staffAssignmentService`: synthetic care-team options
- `bedAvailabilityService`: synthetic residential bed options
- `taskService`: initial admission task generation

No UI-3 service claims live backend availability. The UI-3 store is a replaceable mock adapter.

## UI-4 Mock Clinical Services

- `src/app/ui4Store.js`: shared clinical state and mock services
- `ClinicalAssessmentService`: structured sections, review, sign, lock and amendment history
- `RiskAssessmentService`: clinician-recorded safety action state and sign-off blocker
- `CareTeamService`: assignment, ending and responsibility history
- `TreatmentPlanService`: need/goal/objective/intervention hierarchy, review, approval and versioning
- `MdtService`: meeting review, decisions, actions and finalization
- `ClinicalTimelineService`: represented through shared client/UI-4 event state

These services are explicitly mock-backed. No UI-4 API is claimed as available.
