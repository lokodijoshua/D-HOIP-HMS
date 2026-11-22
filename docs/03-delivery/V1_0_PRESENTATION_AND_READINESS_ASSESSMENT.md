# V1.0 Presentation and Readiness Assessment

**Status:** PROPOSED. Documentation only; no release, pilot, or production approval.
**Prepared:** 2026-11-22.
**Scope:** separates what can be demonstrated synthetically from what is incomplete, prohibited with
real data, required for pilot, and required for production.

The production-readiness register remains authoritative. A demonstration, test pass, or successful
build does not make a capability operational or production-ready.

## 1. Currently demonstrable with synthetic data

- Application shell, responsive navigation, header, and mobile drawer.
- Synthetic dashboard visual direction, clearly labeled as demonstration data.
- Synthetic patient directory, search, duplicate-candidate review, registration, generated
  `D2C-YYYY-NNNNNN` identifier, and patient profile.
- Synthetic identity-status and contact/next-of-kin presentation.
- Planned-workspace navigation showing intended future scope.
- Engineering checks recorded before this documentation task: 68 unit tests passed, 9 live tests
  skipped, typecheck passed, and production build passed. These were **not rerun** in this task.
- Stage B architecture narrative: Clerk subject verification, employee-link check, transaction
  claims, and a synthetic RLS probe. This is not an interactive product demonstration.

**Presentation statement:** this is a foundation preview and security scaffold, not a completed
operational release.

## 2. Incomplete

- No real sign-in UI or interactive session demonstration.
- No production employee provisioning or role administration.
- No persistent patient, department, employee, role, encounter, or audit data.
- No production schema, migrations, RLS, backup, monitoring, or release process.
- No encounter workflow beyond the proposed data foundation.
- No clinical, billing, pharmacy, HMO, ward, or reporting capability.
- No approved initial department list.

## 3. Must not be used with real hospital data

The following must never contain real patient, staff, or hospital data:

- the synthetic patient preview;
- the synthetic dashboard;
- synthetic Stage B employee links and probe records;
- local or CI databases containing synthetic fixtures;
- screenshots, test fixtures, logs, URLs, browser storage, or AI prompts containing patient or staff
  information.

## 4. Mandatory V1.0 pilot prerequisites

A controlled pilot must not begin until:

1. The authoritative proposal source and V1.0 scope are approved.
2. Required hospital decisions are recorded, including department configuration, registration
   ownership, identity rules, roles/permissions, encounter foundation, audit, authentication, and
   RLS.
3. Clerk authentication, active employee access, deactivation, and minimum role enforcement work.
4. The configurable department registry works; the initial department list is hospital-approved and
   loaded only under DEC-016.
5. Patient registration, permanent identifier, search, duplicate review, and pending/verified
   identity foundation work persistently.
6. The encounter data foundation links to patients and records classification and participation.
7. Minimum sensitive-action audit is durable, append-only, restricted, and operational.
8. Mandatory V1.0 UAT, accessibility, migration/rollback rehearsal, and training are complete.
9. CR-016 hosting/residency/privacy and DEC-015 pilot approval are recorded.
10. A support, monitoring, incident, and rollback arrangement exists for the pilot.

## 5. Conditional pilot capabilities

These are not mandatory V1.0 pilot prerequisites unless approved:

- Patient correction.
- Patient merge and reversal.
- Minimal encounter create/view UI.
- Full role and permission administration.
- MFA/step-up beyond the approved baseline.
- Broader audit administration, retention, legal hold, delegated grants, or tamper evidence.
- Hosted/staging environment beyond the approved pilot environment.

If any conditional capability is included, its matching conditional milestone and exit criterion
apply.

## 6. Mandatory production prerequisites

Production deployment requires all mandatory V1.0 evidence plus:

1. Production RLS/access validation.
2. Backup and tested restore.
3. Monitoring, alerting, and incident response.
4. Retention and tamper-evidence controls as required by hospital policy and legal review.
5. Hosting, residency, DPIA, processor, and cross-border approvals.
6. Security and privacy review.
7. Performance/capacity evidence appropriate to the hospital.
8. Accessibility acceptance for critical flows.
9. Release and rollback rehearsal.
10. A named production approval with scope, conditions, evidence links, and review/expiry date.

## 7. Conditional production capabilities

Conditional V1.0 capabilities are not production-ready merely because they are built. If approved,
they require their own acceptance and, where applicable, security/privacy review. They must not be
used as a reason to delay mandatory foundation controls.

## 8. What must not be claimed

Do not claim:

- that V1.0 is complete because the shell or synthetic preview works;
- that RLS is production-validated because the synthetic Stage B probe passed;
- that audit is compliant because in-memory illustrative events exist;
- that patient identity is operational because the synthetic registration flow works;
- that a conditional capability is mandatory or approved;
- that a pilot or production release is approved by this document.

## 9. Related documents

- [`../01-requirements/V1_0_SCOPE.md`](../01-requirements/V1_0_SCOPE.md)
- [`../01-requirements/V1_0_REQUIREMENTS_TRACEABILITY.md`](../01-requirements/V1_0_REQUIREMENTS_TRACEABILITY.md)
- [`V1_0_MILESTONE_AND_DEPENDENCY_PLAN.md`](V1_0_MILESTONE_AND_DEPENDENCY_PLAN.md)
- [`../00-governance/PRODUCTION_READINESS_REGISTER.md`](../00-governance/PRODUCTION_READINESS_REGISTER.md)
- [`../00-governance/V1_0_DECISION_AND_APPROVAL_REGISTER.md`](../00-governance/V1_0_DECISION_AND_APPROVAL_REGISTER.md)
