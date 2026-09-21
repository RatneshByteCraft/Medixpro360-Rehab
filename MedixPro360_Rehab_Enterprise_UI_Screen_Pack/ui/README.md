# MedixPro360 Rehab — Enterprise UI Screen Pack

This is a runnable React/Vite prototype containing **538 registered screens/views** covering the complete MedixPro360 Rehab enterprise workflow.

## Run
```bash
npm install
npm run dev
```

## Architecture
- One screen registry drives navigation and routing.
- Tenant entitlement + role permissions + data/location scope + consent are the intended authorization inputs.
- Screens use reusable enterprise shells; do not create duplicate editable copies of canonical data.
- Client 360, dashboards, reports and AI are aggregation/read surfaces over authoritative domain records.

## Important
This is a **UI foundation/prototype**, not a production clinical system. Backend APIs, authorization enforcement, clinical validation, audit persistence, FHIR/LIS adapters, AI gateway and regulatory evidence must be implemented separately.

See `docs/SCREEN_CATALOG.csv` and `docs/SCREEN_ARCHITECTURE.md`.
