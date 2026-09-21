# UI-13 13Z Blocker Closure

## Scope

Fixed only the public registration to onboarding checkout continuity defect. No backend, Stripe integration, UI-14, commit, push or deployment was added.

## Root Cause

Registration created a tenant and canonical facility, then navigated to `/subscription/checkout` without initializing a subscription/onboarding context. The shell continued using the existing Clinician workspace, so the normal workspace guard denied checkout.

## Closure

- Registration now initializes a pending subscription and purpose-limited onboarding context.
- The primary facility remains owned by UI-12 canonical locations.
- The onboarding context binds tenant, subscription, plan, currency, facility and allowed checkout route.
- Valid onboarding context activates a restricted Tenant Onboarding shell for checkout only.
- Direct checkout without context remains denied.
- Clinician permissions are not expanded or mutated.
- Verified onboarding payment creates the initial period and activates pending entitlements once.
- Onboarding context is completed after activation.

## Validation

- Blocker-focused tests: 11 passed.
- Full suite: 70 passed, 0 failed, 0 skipped.
- Build: passed; existing Vite chunk-size warning remains.
- Browser: Clinician -> registration -> onboarding checkout passed; no Access Restricted state; direct checkout without context remained denied; 390px checkout had no overflow and no console errors/warnings.
