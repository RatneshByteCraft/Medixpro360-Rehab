# Screen architecture

## Access resolution
Authenticated user → active tenant membership → active subscription → module entitlement → active role → permission → location/data scope → record sensitivity → consent/purpose → allow/deny.

## Canonical ownership
Client Registry owns demographics; Admission owns admission; Facility owns bed allocation; Clinical owns conditions/notes; Treatment Planning owns care plans/goals; Assessment Engine owns scores; Medication owns orders/administration; Diagnostics owns orders/results; Billing owns invoices/payments; Inventory Ledger owns stock; Consent Service owns consent; Identity/RBAC owns users/roles/permissions.

## UI rules
Client 360, dashboards, AI, reports and portals reference canonical records rather than creating duplicate editable stores. Navigation is generated from effective access, not hard-coded role names.
