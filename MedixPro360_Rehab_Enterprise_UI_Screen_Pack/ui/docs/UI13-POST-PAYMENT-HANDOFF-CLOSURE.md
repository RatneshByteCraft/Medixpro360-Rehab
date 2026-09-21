# UI-13 13Z Blocker Closure Pass 3

## Scope

Fixed only the verified onboarding payment to normal tenant application context handoff. No backend, Stripe production integration, UI-14, commit, push or deployment was added.

## Root Cause

Onboarding payment completed commercial activation and cleared the onboarding context, but the frontend did not establish an active tenant membership/session projection. The shell therefore fell back to the original Clinician context and denied `/settings/subscription`.

## Closure

- Verified activation now establishes an active tenant session projection containing tenant ID, tenant name, membership reference and Tenant Administrator role.
- The original Clinician profile/membership is not mutated.
- Normal tenant routes resolve from the active tenant session after onboarding.
- The purpose-limited onboarding context is completed and is not retained as permanent authorization.
- Direct checkout without onboarding context remains denied.
- Initial period and entitlement activation remain idempotent.

## Validation

- Blocker-focused regression: 11 passed.
- Full automated suite: 71 passed, 0 failed, 0 skipped.
- Production build: passed; existing Vite chunk-size warning remains.
- Browser chain passed: Clinician -> registration with two facilities -> onboarding checkout -> verified payment -> Tenant Administrator context -> `/settings/subscription` accessible with the new tenant and two facilities.
