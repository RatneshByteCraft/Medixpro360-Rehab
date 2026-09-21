# UI-7 Home Care - Implementation Report

## Scope

UI-7 only. UI-8 through UI-11 were not implemented.

## Screens Implemented

- Home Care Control Centre
- Home Care Enrollments
- New Home Care Enrollment
- Home Care Enrollment Detail
- Home Care Plan
- Home Care Visit Schedule
- New Home Care Visit
- Home Care Visit Detail and documentation
- Caregiver Coverage
- Safety and Follow-up / Escalations
- Client 360 Home Care tab projection

## Routes Implemented

- `/home-care/control-centre`
- `/home-care/enrollments`
- `/home-care/enrollments/new`
- `/home-care/enrollments/:enrollmentId`
- `/home-care/enrollments/:enrollmentId/plan`
- `/home-care/visits`
- `/home-care/visits/new`
- `/home-care/visits/:visitId`
- `/home-care/caregivers`
- `/home-care/escalations`

## Domain Entities

`HomeCareEnrollment`, `HomeCarePlan`, `HomeCareVisit`, visit assignment metadata, visit documentation, `HomeCareFollowUp`, and Home Care lifecycle events.

All entities reference the canonical `clientId` and `admissionId` where applicable.

## Domain Commands

`createHomeCareEnrollment`, `activateHomeCareEnrollment`, `createHomeCarePlan`, `updateHomeCarePlan`, `activateHomeCarePlan`, `scheduleHomeVisit`, `assignHomeCareStaff`, `startHomeVisit`, `saveHomeVisitDraft`, `completeHomeCareVisit`, `cancelHomeCareVisit`, `markHomeCareVisitMissed`, `createHomeCareFollowUp`, and `escalateHomeCareConcern`.

## Permissions

`home-care.view`, `home-care.enroll`, `home-care.plan.manage`, `home-care.visit.schedule`, `home-care.visit.start`, `home-care.visit.document`, `home-care.visit.complete`, `home-care.visit.cancel`, `home-care.visit.miss`, `home-care.follow-up.manage`, and `home-care.escalate`.

## Integration

- Client 360: permission-aware Home Care tab references the owning enrollment.
- Timeline: enrollment-start and completed-visit events use stable semantic IDs.
- Tasks: unassigned visit, missed visit, and escalation work use existing scoped task infrastructure.
- Notifications: safety escalation uses existing scoped notification infrastructure.
- Search: one operational Home Care visit result is tenant/location/permission filtered.
- Scope: dedicated Home Care, Centre Operations, and Tenant Administration access are supported without bypassing tenant/location checks.

## Acceptance Status

UI-7 acceptance: PASS

- 7A Enrollment: PASS
- 7B Home Care Plan: PASS
- 7C Visit Scheduling and Staff Assignment: PASS
- 7D Visit Start and Documentation: PASS
- 7E Visit Completion: PASS
- 7F Missed and Cancelled Visit: PASS
- 7G Safety and Escalation: PASS
- 7H Client 360, Timeline, Tasks and Search: PASS
- 7I Permissions, Tenant and Location Scope: PASS
- 7J Responsive Web: PASS
- Integrated UI-1 through UI-6 smoke regression: PASS
- Desktop console: 0 errors, 0 warnings
- Mobile 390px console: 0 errors, 0 warnings
- Automated tests: 34 passed, 0 failed, 0 skipped
- Build: PASS

## Known Limitations

This is a frontend acceptance foundation using mock persistence. Backend authorization, transactions, server-side concurrency, immutable audit logging, address storage, caregiver availability scheduling, and canonical Incident command execution remain future API responsibilities.
