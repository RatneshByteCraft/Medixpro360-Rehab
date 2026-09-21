# MedixPro360 Rehab Enterprise UI/UX Redesign Audit

## A. Current UI Audit

The current UI is a 538-route registry-driven prototype. Its shell is reusable and visually consistent, but all routes render through generic dashboard/workspace templates. The registry captures broad product intent; it does not yet represent executable day-to-day workflows.

## B. Role / Persona Matrix

See `ROLE-WORKSPACE-MATRIX.md`. The primary design unit is a workspace shared by related roles with permission-driven differences, not a separate sidebar for every job title.

## C. Information Architecture

Platform Operations, Tenant Administration, Centre Operations, Intake & Admissions, Clinician Day, Nursing Shift, Residential Shift, Home-Care Control Centre, Billing, Inventory, Client Workspace, Portals, Tasks, Notifications, Search and AI Intelligence/Governance.

## D. Sidebar Proposal

The full registry should not be displayed. Effective navigation should expose only workspace-level destinations and contextual child routes. Minor actions become tabs, drawers, modals or inline steps.

## E. Journey Maps

See `CLIENT-JOURNEY-MAP.md`, `REHAB-WORKFLOW.md` and `HOME-CARE-WORKFLOW.md`.

## F. Consolidation Plan

KEEP: registry IDs, route references, shell visual direction, domain vocabulary, desktop scope, low-level table/detail/feed primitives.

REDESIGN: dashboards, client registry, Client 360, intake, admission, assessments, treatment plans, MDT, therapy, medication, nursing, residential, beds, discharge, aftercare, home care, billing, inventory, documents, tasks, notifications, analytics and governance.

MERGE: Client Registry/Client 360; assessment list/result/history/trends; treatment-plan list/create/workspace/review/history; medication order/reconciliation/MAR/round; residential operations/observation/incident/handover; audit/privacy/security governance where scopes overlap.

EMBED: AI evidence viewer, report-incorrect, transcript review, journey summary, MDT brief, treatment-plan review, trend explanation, discharge review and task extraction.

RETIRE AS TOP-LEVEL ROUTES: minor detail pages, print previews, standalone AI feature pages, isolated history/trend pages and one-action confirmation pages. Preserve each capability through traceability and contextual surfaces.

NEW REQUIRED: My Day, My Shift, Home-Care Control Centre, unified Tasks, actionable Notifications, global permission-aware Search, intake readiness, consent/purpose guardrails, clinical signing/versioning, discharge blockers and reusable state patterns.

The complete registry classification is in `SCREEN-TRACEABILITY.csv`.

## G. AI Embedding

See `AI-EMBEDDING-MAP.md`. AI outputs require provenance, evidence, reviewer action and audit trail. Human responsibility remains explicit.

## H. Traceability Plan

Every existing screen is classified as KEEP, REDESIGN, MERGE, EMBED or RETIRE in the CSV. Future screens are marked NEW REQUIRED and linked to a workspace/workflow rather than an isolated feature.

## I. Implementation Plan

See `IMPLEMENTATION-PHASE-PLAN.md`. This audit stops before UI-1 implementation.

## J. Risks / Assumptions / Gaps

- Phase 1 backend does not expose clinical APIs; typed contracts and mock adapters are required.
- Product requirement documents outside the UI workspace were not present in this repository root during audit; `ui/docs/SCREEN_ARCHITECTURE.md` and the screen catalog were used as local evidence.
- Clinical permissions, consent, sensitivity, signing and audit semantics must be confirmed with domain owners before implementation.
- Synthetic data must become coherent across a single client journey rather than isolated row examples.
- The registry contains more capabilities than should remain top-level navigation.

## K. Exact UI-1 Files Expected to Change

Expected implementation scope only after audit approval:

- `ui/src/main.jsx` or split shell/workspace components
- new `ui/src/app/` workspace, navigation and state components
- `ui/src/styles.css` or split design-system styles
- new typed service-contract and mock-adapter files under `ui/src/services/`
- new UI traceability and API integration docs

No backend files, Docker files, clinical APIs or mobile screens should change in UI-1.

## Stop Point

Audit complete. Do not implement UI-1 until this information architecture, role model, journey model and traceability plan are reviewed and accepted.
