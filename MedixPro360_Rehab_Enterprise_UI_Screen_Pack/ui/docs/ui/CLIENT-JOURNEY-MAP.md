# Client Journey Map

## Rehabilitation / Residential

Referral or enquiry -> duplicate match -> pre-admission eligibility -> registration -> admission readiness -> consent and documents -> program/location/bed assignment -> initial assessment -> risk and safeguarding review -> care-team assignment -> treatment plan -> daily care and therapy -> medication and observations -> assessments and MDT -> progress review -> discharge readiness -> medication reconciliation -> follow-up and aftercare -> outcome/follow-up.

Each stage needs a queue, readiness indicator, blockers, owner, due date, next action and audit history. Client 360 references each canonical domain record; it does not own duplicated clinical data.

## Home Care

Enquiry/referral -> service eligibility -> client registration -> consent and care package -> care plan -> visit planning -> caregiver assignment -> visit execution -> documentation review -> missed/late/cancelled exception -> escalation -> care-plan review -> ongoing service review -> discharge/closure or continuation.

Home care uses a control-centre operating model. It must not inherit residential bed, occupancy or ward workflows.

## Conditional Paths

Residential clients may have beds, leave and shift observations. Outpatient clients may have appointments and therapy without admission or bed allocation. Home-care clients have visits and caregiver coverage. Every path shares client, care plan, tasks, documents, consent, medication and billing references only where applicable.
