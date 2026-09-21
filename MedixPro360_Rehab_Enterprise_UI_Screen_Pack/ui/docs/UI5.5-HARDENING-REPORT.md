# UI PHASE 5.5 HARDENING REPORT

## Status

UI PHASE 5.5 ACCEPTED

## Audit Findings Verified

1. UI-4 used `clinical.work || clients.view`: VERIFIED and corrected.
2. Centre Administrator and Nurse had `clients.view`: VERIFIED and retained for operational context.
3. That permission reached UI-4 clinical routes: VERIFIED and corrected.
4. UI-4 action guards were incomplete: VERIFIED and corrected for assessment, risk, care team, treatment plan, MDT, therapy, and standardized assessment actions.
5. Search was static/global: VERIFIED and replaced with scoped filtering.
6. Tasks were split/static: VERIFIED and consolidated through `crossCuttingStore.js`.
7. Notifications were static/shared: VERIFIED and filtered through the shared adapter.
8. Location labels did not filter data: VERIFIED and scope filtering added to cross-cutting data.
9. Module checks were inconsistent on direct routes: VERIFIED and added to UI-3/UI-4/UI-5 route checks.
10. Direct admin routes could fall through: VERIFIED and workspace-owned direct routes now produce Access Denied.

## Audit Findings Rejected

None of the ten specified findings were rejected. All were reproducible in the current implementation and required remediation.

## Permission Model Changes

Added granular capabilities for:

- Clinical view/edit/review/sign
- Risk view/manage
- Care-team view/manage
- Treatment-plan view/edit/approve
- MDT view/participate/finalize
- Therapy schedule/view/document/review/sign
- Standardized assessment view/complete/finalize

`clients.view` remains operational identity/context visibility and no longer implies UI-4 or UI-5 clinical access.

Centre Administrator retains operational client and scheduling access. Nurse retains client context plus read-only clinical context permissions, without clinical edit/sign capabilities.

## Route Guard Changes

- UI-3 routes use permission and module checks.
- UI-4 routes require feature-specific clinical permissions and the relevant module.
- UI-5 distinguishes therapy scheduling from therapy documentation.
- Standardized assessment routes require standardized-assessment view and module access.
- Platform, tenant, nursing, residential, home-care, billing, inventory, and centre-owned direct routes reject mismatched workspaces with Access Denied.
- Therapy group and family routes are included in the therapy guard.

## Action Guard Changes

Protected actions include:

- Clinical assessment edit/review/sign/amend
- Risk resolution
- Care-team assign/end assignment
- Treatment-plan revise/approve/hierarchy changes
- MDT participate/action/finalize
- Therapy document/review/sign/amend
- Group/family finalization
- Standardized assessment complete/score/finalize

Signed and finalized record state continues to override edit permission.

## Client 360 Access Changes

Client 360 now filters tabs by capability:

- Operational overview, timeline, admission, and appointments remain available to permitted client-context users.
- Clinical summary, assessments, risk, family, documents, consent, and related clinical tabs require clinical permissions.
- Treatment Plan requires treatment-plan view.
- Care Team requires care-team view.
- Therapy / Sessions requires therapy view or scheduling view.
- Medication, residential, billing, discharge, and aftercare remain absent until their owning future phases.

## Centre Administrator Result

PASS. Centre Admin retains referral, client registry, admission, operational queues, Client 360 operational context, and read-only therapy scheduling. Centre Admin cannot access UI-4 clinical routes, therapy documentation, therapy signing, or standardized assessment completion.

## Nurse Result

PASS. Nurse retains permitted client context and read-only clinical context capabilities. Nurse cannot edit/sign UI-4 records, document/sign therapy notes, or complete/finalize standardized assessments. Nursing/MAR/observation/handover workflows remain unimplemented future scope.

## Global Search Result

PASS. Search results are filtered by effective permission, module entitlement, and location. Platform and tenant administrators do not receive the synthetic clinical client result. Centre and clinician personas receive permitted client/context results. Search renders only authorized results before navigation.

## Global Task Consolidation Result

PASS. Admission, MDT, and therapy task creation now contributes to the shared cross-cutting task adapter. The task drawer and `/work/tasks` use the same scoped source. Tasks retain source module, source record, client, location, sensitivity, permissions, module, and destination metadata.

## Notification Result

PASS. Notifications are filtered by permission, module, and location. Authorized notifications navigate to their source route. Static unrelated notifications are no longer shown to every persona.

## Module Entitlement Result

PASS. Navigation and direct UI-3/UI-4/UI-5 routes now validate relevant module entitlement as well as permission.

## Location Scope Result

PASS for synthetic frontend data. The cross-cutting client, task, notification, and search adapters apply location scope. The synthetic centre/unit relationship permits Greater Noida Centre to see Residential Unit A context; unrelated location data is filtered. Backend row-level enforcement remains future API responsibility.

## Access Denied / Direct Route Result

PASS. Workspace-owned direct routes no longer fall through to unrelated workspace content. Mismatched platform, tenant, centre, nursing, residential, home-care, billing, inventory, and clinical destinations render a controlled restricted state without destination record details.

## Regression Results

UI-1: PASS — shell, navigation, search, task/notification surfaces remain available with scoped data.

UI-2: PASS — platform, tenant, and centre administrative navigation/tests pass.

UI-3: PASS — referral, screening, client matching, client registry, admission, and operational Client 360 remain available.

UI-4: PASS — clinician clinical assessment, care team, treatment plan, and MDT workflows remain available with action guards.

UI-5: PASS — individual/group/family therapy, treatment-goal linkage, signing/locking/amendment, standardized assessment scoring/history/trend remain available to authorized clinicians.

## Tests

Total: 18
Passed: 18
Failed: 0
Skipped: 0

## Build

PASS — Vite production build; 1,900 modules transformed.

## Lint

NOT CONFIGURED.

## Typecheck

NOT CONFIGURED.

## Browser Scenarios

A: PASS — Platform Admin has platform navigation, no clinical search result, no clinical task, and denied direct clinical routes.

B: PASS — Tenant Admin retains administration routes, has no clinical search/task content, and is denied Client 360 clinical access and therapy notes.

C: PASS — Centre Admin retains operational Client 360 and read-only therapy scheduling, while clinical assessment/treatment-plan/therapy documentation routes are denied.

D: PASS — Clinician retains Client 360, clinical assessment, care team, treatment plan, MDT, individual/group/family therapy, and standardized assessment access. Console remained error-free.

E: PASS — Nurse retains client context, is denied UI-4 mutation routes and UI-5 therapy documentation, and future nursing workflows remain controlled placeholders.

F: PASS — Platform/Tenant search excluded the clinical client result; Centre and Clinician search returned the permitted scoped client result.

G: PASS — The scoped global task queue shows authorized MDT/Therapy tasks to Clinician, admission tasks to Centre, and no clinical tasks to Platform.

H: PASS — Unauthorized direct routes render restricted states rather than unrelated workspace shells or destination data.

## Files Changed

- `src/app/access.js`
- `src/app/crossCuttingStore.js`
- `src/app/ui3Store.js`
- `src/app/ui3Views.jsx`
- `src/app/ui4Store.js`
- `src/app/ui4Views.jsx`
- `src/app/ui5Store.js`
- `src/app/ui5Views.jsx`
- `src/app/accessHardening.test.js`
- `src/main.jsx`
- `package.json`
- `docs/API-INTEGRATION-MAP.md`
- `docs/UI-REDESIGN-DECISIONS.md`
- `docs/ui/SCREEN-TRACEABILITY.csv`
- `docs/UI5.5-HARDENING-REPORT.md`

## Backend Files Changed

0

## Mobile Screens Created

0

## Remaining Limitations

- Frontend authorization is not backend authorization.
- Cross-cutting state remains in-memory mock state.
- Lint and typecheck are not configured.
- Nursing, medication, residential, home-care, billing, inventory, mobile, and future phase workflows remain unimplemented.
- Search/task/notification data is synthetic and intentionally small.
- Clinical assignment, tenant-defined roles, consent-purpose enforcement, and server-side scope enforcement require real APIs.

## Recommendation Before UI-6

Review and approve the granular permission names and frontend scope semantics before connecting UI-6 workflows. Backend authorization should mirror these capabilities when real APIs are introduced.
