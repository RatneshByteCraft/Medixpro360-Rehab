# UI-12 Enterprise Configuration and Master Data - Implementation Report

## Scope

UI-12 adds frontend-only master-data configuration for the accepted UI-1 to UI-11 workflows. No backend API, database persistence, React Native screen, commit, push, or deployment was added.

## Configuration Centre

- `/admin/configuration`
- `/admin/configuration/facility`
- `/admin/configuration/billing`
- `/admin/configuration/inventory`

The Configuration Centre is available only to explicitly authorized tenant or centre administrators. Billing users, clinicians and nursing users do not receive configuration permissions merely from operational access.

## Master Data

- Location and unit/ward references
- Room master with parent unit, category, capacity and lifecycle
- Bed master with stable physical definition and lifecycle
- Programme master command foundation
- Service catalogue
- Payer master
- Effective-dated tariff and tariff lines
- Inventory item master
- Configuration audit records

## Ownership Boundary

The UI-12 store owns configuration commands and audit foundation. UI-6 remains the operational owner of occupancy and bed assignment. UI-9 remains the operational owner of stock balances, transactions, charges, invoices and payments. New configured beds and inventory items register into those existing stores by stable ID; no second occupancy or stock-balance store was introduced.

## Verified Acceptance

- Room A-101 and Bed A-101-1 can be created under Residential Unit A.
- The same configured bed ID appears in the existing UI-6 Bed Board.
- An eligible client can be assigned through the existing canonical bed command.
- Duplicate room and bed codes are blocked.
- Occupied bed deactivation is blocked and historical occupancy remains intact.
- Bed list, detail, add, edit, deactivate and reactivate screens are available.
- Programme list, detail, add, edit and lifecycle screens are available.
- Service, payer and tariff detail/edit/lifecycle actions are available.
- Inventory item list, detail, add, edit, deactivate and reactivate screens are available.
- Direct detail routes reauthorize tenant, location and manage permission scope.
- Services, payers and effective-dated tariff lines can be configured.
- Invalid tariff effective ranges are blocked.
- Inventory item configuration is separate from stock receipt and stock quantity.
- Configuration routes deny unauthorized personas.
- Mobile configuration layout has no horizontal overflow at 390px.

## Backend Boundary

Future backend responsibilities include authoritative persistence, server authorization, optimistic concurrency, production pricing enforcement, accounting controls, identifier sequencing, immutable audit and production security. These are not claimed by this frontend phase.