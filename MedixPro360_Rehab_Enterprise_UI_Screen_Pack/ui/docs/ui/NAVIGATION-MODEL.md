# Navigation Model

## Resolution

Authenticated user -> tenant membership -> active role(s) -> permissions -> module entitlements -> location assignment -> sensitivity/consent scope -> effective navigation.

The UI must consume an effective-navigation contract. It must not branch on role-name strings or expose the full registry to every user.

## Clinician

Home, My Day, Clients, Schedule, Tasks, Clinical Work, MDT, AI Intelligence, Reports.

## Nurse / Residential

Home, My Shift, Assigned Clients/Residents, Medication, Observations, Tasks, Handover, Incidents.

## Tenant Administration

Administration, Users & Access, Locations, Configuration, Integrations, Audit.

## Centre Operations

Operations, Admissions, Discharges, Occupancy/Beds, Appointments, Staff/Assignments, Home Care, Alerts.

## Super Administrator

Platform, Organizations, Subscriptions, Modules, Platform Access, Configuration, Operations, Audit, Support.

## Interaction Rules

Top-level items are workspaces. Minor actions use tabs, drawers, modals or inline workflow steps. AI evidence, report-incorrect, record history and audit detail are contextual surfaces rather than ordinary primary navigation destinations.

## UI-1 Implementation

The active navigation model is implemented in `src/app/navigation.js` and consumes the effective-access profile from `src/app/access.js`. Navigation is filtered by workspace, permission and module entitlement. The 538-route legacy registry remains available for traceability but is not enumerated in the active sidebar.

The development-only persona switcher changes effective-access data and recalculates navigation. It is a demonstration adapter, not production security. Backend authorization remains authoritative.
