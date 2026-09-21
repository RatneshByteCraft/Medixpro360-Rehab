# MedixPro360 Rehab UI Audit

## Scope

Audit of the existing React/Vite UI before implementation. No UI or backend implementation changes are included in this pass.

## Inventory

- Registered screen IDs: 538
- Registered routes: 538
- Rendering model: one `Screen` component selects either generic `Dashboard` or generic `Workspace`
- Reusable UI components currently present: sidebar, grouped navigation, screen search, header context, metric cards, generic table, activity feed, detail panel, workflow panel
- Production build: verified previously with Vite

## Current Shell

The shell is a fixed desktop sidebar plus sticky header and workspace canvas. It presents a tenant, centre, region, user and role context, but these are static display values. Navigation is generated from the full registry and filtered by text search; it is not derived from authenticated permissions, entitlements or location scope.

## Role Assumptions

The current shell assumes a `Platform Administrator` working inside `Veda Wellness`, with `Super Admin` status and a centre context. The same context is shown for authentication, clinical, residential, home-care, billing, portal and platform screens. No effective-role workspace switching or permission-aware action state is implemented.

## Workflow Reality

The registry contains many genuine workflow concepts: referral, admission, assessments, treatment plans, MDT, therapy, medication, residential care, beds, discharge, aftercare, home care, billing, inventory, documents and AI. However, route registration is not equivalent to workflow implementation. Current routes render static generic tables/cards and do not preserve client journey state between steps.

## Standalone Feature Demonstrations

The AI Intelligence category is the clearest example: documentation assistant, transcript review, intake extraction, client summary, copilot, MDT brief, treatment-plan review, trend explanation, medication intelligence, discharge review, handover, task extraction, analytics copilot, evidence viewer and feedback are separate routes. These should become contextual actions, drawers, review queues and governance surfaces.

The same issue applies to many detail, history, trend, review and print-preview routes across clinical, billing, inventory and documents.

## Duplicate Concepts

Likely consolidation targets include:

- Client Registry plus Client 360 plus portal client views into one permission-aware client workspace over canonical records
- Assessment queues, result, trend, history and review into assessment work queues and client assessment tabs
- Treatment-plan list, create, workspace, progress, review and history into one versioned treatment-plan workflow
- Medication dashboard, orders, reconciliation, MAR, rounds, missed/refused and changes into role-specific prescribing and administration queues
- Residential dashboard, observations, notes, incidents, leave and handover into shift operations
- AI evidence viewer and feedback into contextual AI review actions
- Audit, compliance, privacy, security and AI audit into role-filtered governance workspaces

## Dead Ends / Placeholder Signals

- Generic `Primary Action` and `Export` buttons appear on unrelated screens.
- Search, filters and saved views have no data behavior.
- Table rows are synthetic and not selectable.
- Selected record details are not connected to the table.
- Workflow feed items are static.
- Authentication routes do not render authentication forms.
- No loading, empty, error, denied, locked, signed, conflict or unsaved-change states are represented.

## Missing Workflow Surfaces

The current UI needs explicit workflow surfaces for permission-aware My Day, nursing shift, residential shift, home-care dispatch, intake readiness, clinical signing, treatment-plan approval, MDT agenda/actions, discharge blockers, aftercare follow-up, unified tasks, actionable notifications, global search, consent/purpose restrictions and sensitive-record access.

## Existing Assets Worth Preserving

- Registry IDs and route naming as traceability references
- Dark navigation/light workspace visual direction
- Tenant and location context placement
- Grouped navigation with counts
- Generic table/detail/feed primitives as low-level components
- Existing domain vocabulary and category inventory
- Desktop-first operating model

## Verdict

The current UI is a navigable screen-pack prototype, not an end-to-end enterprise rehabilitation application. The redesign should reduce top-level destinations, create role workspaces, connect actions to client journeys and embed AI at points of work.
