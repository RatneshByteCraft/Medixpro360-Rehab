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
12. The redesign proceeds in UI phases and is reviewed after every phase; this audit does not implement UI-1.
13. UI-5 therapy sessions reference the canonical UI-3 client and UI-4 treatment-plan records; they do not create a second goal system.
14. Session notes use a configurable default template, explicit review/sign gates, locked signed content, and addenda for corrections.
15. Standardized assessment definitions are reusable and versioned; score and interpretation are deterministic configuration results, separate from clinician interpretation.
16. Group master notes and participant-specific notes are separate records, with participant notes restricted by purpose and permission.
17. Family participant authorization is visible in the session workspace and is not implied by relationship data alone.
18. Therapy follow-up actions use the existing global task service; no therapy-specific task architecture is introduced.
19. AI Assist is a disabled contextual extension point in UI-5; voice and transcription are not simulated.
20. `clients.view` is operational identity/context access only; clinical records and actions require granular clinical capabilities.
21. Direct routes, navigation, actions, search, tasks, and notifications apply effective permission, module, and location scope consistently.
22. Centre operations may see permitted operational Client 360 context and therapy scheduling, but not therapy documentation or clinical mutations.
23. A shared frontend cross-cutting adapter owns scoped tasks, notifications, and search results; domain records remain in their canonical stores.
24. UI-6 medication orders and MAR entries are separate concepts; Nurse administration does not imply prescriber ordering.
25. UI-6 facility occupancy references UI-3 admitted clients and preserves bed movement/leave state without creating a second admission record.
26. UI-6 nursing/residential records are mock-backed and permission-gated; they do not imply backend authorization or clinical interaction checking.
