# UI Redesign Decisions

1. The registry remains a traceability source, not the primary navigation model.
2. Top-level navigation is role/workspace oriented and permission-derived.
3. Client Workspace is the longitudinal coordination surface; canonical modules remain record owners.
4. AI capabilities are embedded at points of work; AI Intelligence is a review/governance queue.
5. Residential rehabilitation and home care remain distinct operational models.
6. Every important surface has loading, empty, error, denied, draft, signed/locked, completed, cancelled and conflict states where relevant.
7. Tables support practical operations: filtering, sorting, pagination, saved views, column configuration and safe bulk actions.
8. Clinical signing is visibly separate from editing; amendments preserve history.
9. Sensitive behavioral-health records require purpose, consent, masking and audited elevated access.
10. Desktop/web is the current scope; caregiver/nurse mobile applications are deferred.
11. Mock adapters are allowed only behind typed contracts and must show integration status.
12. The redesign proceeds in UI phases and is reviewed after every phase.

## UI-1 Decisions Implemented

- Active navigation is separate from the 538-route traceability registry.
- Workspace navigation is resolved from effective-access data rather than persona-name conditionals.
- AI Intelligence is one clinician workspace destination; AI feature routes are legacy traceability routes.
- Tasks, notifications, search and attention-required queues are shell-level patterns backed by synthetic data.
- Legacy `/screens/*` paths are retained and explicitly show a workflow-not-implemented state.
- The persona switcher is development-only demonstration infrastructure.

## UI-2 Decisions Implemented

- Platform, tenant and centre administration use one shared shell with workspace-specific operational surfaces.
- Administrative tables, queues and onboarding steps are reusable patterns rather than one component per legacy route.
- Tenant lifecycle, access, subscription, entitlement and audit surfaces are mock workflow states until future APIs exist.
- Centre metrics drill into synthetic admissions, discharges, occupancy, schedule, staffing and alert queues.
- No clinical record browsing is exposed from Platform Operations.

## UI-3 Decisions Implemented

- Referral, matching, admission and Client 360 are one connected journey, not isolated route demos.
- Client identity is created before admission; duplicate matches require deliberate user choice.
- Client 360 references future canonical workflows and uses controlled future-module states.
- Residential admissions require an explicit bed; outpatient admissions omit bed assignment.
- Admission completion updates referral/client/timeline state in the UI-3 mock adapter and routes to Client 360.

## UI-4 Decisions Implemented

- Clinical workflows extend Client 360 and do not create a parallel clinical application.
- Assessment sign-off is blocked by incomplete required sections or outstanding risk actions.
- Signed assessments and finalized MDT records are read-only; amendments/history preserve the original record.
- Treatment plans use a nested need/goal/objective/intervention structure with preserved versions.
- MDT actions reuse the global task concept rather than creating a module-specific task model.
- Clinical module tabs outside UI-4 remain controlled future states rather than invented UI-5 behavior.
