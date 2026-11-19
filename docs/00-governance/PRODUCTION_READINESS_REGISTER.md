# Production Readiness Register

**Status:** GOVERNANCE REGISTER - documentation only; no feature or gate approval.
**Authority:** This is the authoritative central index for feature production readiness in D-HOIP.
**Date established:** 2026-11-19.
**Scope:** all application features, capabilities, previews, mocks, partial workflows, and
in-memory implementations.

This register records readiness status and required evidence. It does not approve a feature, a gate,
a release, a production environment, or a production deployment. Approval of production use remains
a separate human decision recorded under the applicable governance and gate process.

A feature listed here is not production-ready merely because code exists, tests pass, a build
succeeds, or a browser demonstration works.

## 1. Readiness classifications

Every implemented or partially implemented feature must be classified using one of the following
levels.

| Classification | Meaning | Permitted use |
|---|---|---|
| **SYNTHETIC PREVIEW** | Demonstration built with synthetic data, mocks, seeded fixtures, or in-memory state. It may be disabled in production. | Demonstration and interface evaluation only. Never use real patient or hospital data. |
| **DEVELOPMENT IMPLEMENTATION** | Real application code that is not yet approved for operational use. It may be incomplete, partially integrated, or awaiting security, database, operational, or acceptance evidence. | Development and approved non-production testing only, with synthetic or de-identified data. |
| **PRODUCTION-READY** | The implementation has satisfied all applicable security, reliability, operational, data, privacy, accessibility, and acceptance requirements, with linked evidence and an explicit approval record. | May be considered for an approved release. Production use still requires deployment and verification. |
| **DEPLOYED TO PRODUCTION** | An explicitly approved production-ready release has actually been deployed and verified in production. | Operational use within the recorded approval scope, conditions, and monitoring arrangements. |

These classifications are not interchangeable:

- A synthetic preview is not a development implementation just because it contains real code.
- A development implementation is not production-ready just because it is integrated.
- Production-ready is not the same as deployed to production.
- Deployment does not retroactively supply missing evidence or approval.
- A feature can regress from a higher classification if evidence becomes stale, a defect is found, or
  its approval expires or is withdrawn.

## 2. Evidence that never qualifies a feature by itself

The following are necessary in some cases but are never sufficient:

- passing unit, integration, or end-to-end tests;
- a successful production build;
- a working browser demonstration;
- a test count or code-coverage figure;
- a code review;
- a completed UI or a polished design;
- an in-memory or seeded data model;
- a feature flag or a fail-closed production guard;
- a verbal statement that a feature "works".

A feature may be `IMPLEMENTED` without being `PRODUCTION-READY`. Evidence must be linked, current,
reproducible, and tied to the relevant commit or release.

## 3. Central register

| Feature / capability | Readiness status | Feature document | Current environment / data | Production evidence status |
|---|---|---|---|---|
| Patient Management M1 | **SYNTHETIC PREVIEW — NOT PRODUCTION READY** | [`docs/02-architecture/PATIENT_REGISTRY_M1.md`](../02-architecture/PATIENT_REGISTRY_M1.md) | In-memory, synthetic, server-only preview; patient routes and actions fail closed in production | Not evidenced. See section 4. |
| Application shell and dashboard preview | **SYNTHETIC PREVIEW — NOT PRODUCTION READY** | [`README.md`](../../README.md) and [`STATUS_AND_APPROVAL.md`](STATUS_AND_APPROVAL.md) section 8 | Synthetic UI preview; no authentication, database, real data, or production operations | Not evidenced. The shell is an interface foundation only. |

No other application capability is currently listed in this register. Any new synthetic preview,
mock, in-memory implementation, partial workflow, or otherwise non-production capability must be
added to this register in the same feature branch.

## 4. Patient Management M1

**Status:** **SYNTHETIC PREVIEW - NOT PRODUCTION READY.**

**Detailed technical source:**
[`docs/02-architecture/PATIENT_REGISTRY_M1.md`](../02-architecture/PATIENT_REGISTRY_M1.md)

**Authorization reference:** `AUTH-PATIENT-M1-001` in
[`STATUS_AND_APPROVAL.md`](STATUS_AND_APPROVAL.md) section 9.

### 4.1 What M1 currently implements

- A synthetic patient directory with search by hospital ID, name tokens in any order, phone, and
  exact date of birth.
- Search-first registration with duplicate-candidate review.
- Server-side duplicate recheck and deterministic duplicate reasons.
- Preview hospital ID allocation in the `D2C-YYYY-NNNNNN` format.
- A patient profile using the internal UUID route.
- A server-side in-memory patient repository.
- Illustrative in-memory audit events.
- Automated domain and workflow tests.
- A production fail-closed guard for patient routes and actions.

### 4.2 Known limitations and production blockers

M1 is not suitable for operational use. The following limitations are known and must remain visible
until resolved and verified:

- Process-local in-memory patient repository; no durability or recovery.
- Synthetic seed data only; real patient information is prohibited.
- No Clerk authentication or employee identity integration.
- No production authorization or role/permission enforcement.
- No PostgreSQL or Drizzle persistence.
- No Supabase RLS or database security policies.
- No durable, tamper-resistant audit trail.
- Client-supplied duplicate-review acknowledgment, exact-ID assertion, and override reason are not
  production authorization.
- Idempotency keys are process-global and not actor/session-scoped.
- In-memory ID allocation does not provide production concurrency or cross-instance uniqueness.
- No patient correction, merge, or deletion workflow.
- No production identity-verification evidence workflow.
- No operational encounters, allergies, clinical alerts, billing, HMO, or consent workflows in M1.
- Patient preview routes and actions fail closed in production.

The production fail-closed guard prevents accidental production use of the preview. It is a safety
control, not evidence of production readiness, and it does not satisfy any checklist category below.

### 4.3 Evidence required before reclassification

Patient Management M1 cannot be reclassified as a development implementation, production-ready, or
deployed to production until the applicable evidence in section 6 is linked and explicitly approved.
At minimum, that includes:

- approved registration, identity, duplicate, verification, correction, and merge requirements;
- Clerk authentication and the D-HOIP employee/identity mapping;
- server-enforced authorization, least privilege, scope, separation of duties, and negative access
  tests;
- PostgreSQL/Drizzle persistence, constraints, migrations, rollback rehearsal, and transaction
  tests;
- an authoritative database-backed hospital ID sequence with uniqueness and exhaustion handling;
- RLS and database access-security evidence where applicable;
- durable, append-only, tamper-evident audit with access controls and retention;
- server-issued, session-bound duplicate-review references and authoritative hospital-ID lookup;
- privacy, DPIA, retention, residency, consent, and operational approvals;
- accessibility and usability acceptance;
- performance, backup/restore, monitoring, deployment, rollback, and support evidence;
- an explicit production approval with named authority, date, scope, conditions, and evidence links.

## 5. Application shell and dashboard preview

**Status:** **SYNTHETIC PREVIEW - NOT PRODUCTION READY.**

The existing application shell and dashboard are an interface foundation. They use synthetic
demonstration data and do not include production authentication, authorization, persistence, real
patient data, external integrations, deployment, or operational support. They must not be used as an
operational hospital application.

## 6. Production-readiness checklist

Every feature must provide evidence for each applicable category. A checkbox, a test pass, or a
document statement is not proof. Evidence must be linked and reviewable.

| # | Category | Evidence required |
|---|---|---|
| 1 | Approved functional requirements and workflows | Approved requirements, scope, workflow definitions, acceptance criteria, unresolved decisions, and traceability to the release. |
| 2 | Domain model and ownership boundaries | Approved domain model, ownership map, contracts, invariants, and evidence that core identity, money, stock, and audit are not duplicated by departments. |
| 3 | Authentication and employee identity | Proven Clerk authentication, explicit Clerk-to-employee mapping, inactive/revoked handling, no shared accounts, session policy, and negative tests. |
| 4 | Authorization and least-privilege access | Approved role/permission matrix, server-side enforcement, department and patient scope, separation of duties, restricted-record handling, break-glass review, and negative access tests. |
| 5 | Database persistence, constraints and migrations | Approved schema, constraints, indexes, migration and rollback rehearsal, transaction tests, idempotency, and data-integrity evidence. |
| 6 | RLS and server-side data access security where applicable | A validated database/access design, policies or equivalent controls, connection and role tests, pooling/transaction evidence, and deny-by-default tests. RLS must not be claimed until proven. |
| 7 | Data validation, integrity and concurrency | Server-side validation, uniqueness and idempotency tests, concurrent-operation tests, sequence exhaustion handling, and proof that domain invariants hold under failure. |
| 8 | Auditability and accountability | Append-only audit design, actor/time/action/reason evidence, tamper evidence, audit access control, retention, and tests proving sensitive actions are recorded. |
| 9 | Privacy, data protection and applicable legal requirements | Lawful basis, DPIA, NDPA and applicable regulatory review, consent, retention, residency, processor agreements, de-identification, and no-PHI-in-logs evidence. |
| 10 | Error handling and safe logging | User-facing error states, safe server errors, redaction, correlation IDs, log retention, and tests proving patient information is not exposed. |
| 11 | Automated tests, integration tests and security tests | Unit, component, integration, database/RLS, critical end-to-end, negative authorization, security, and accessibility results linked to the release commit. |
| 12 | Accessibility and usability acceptance | WCAG 2.2 AA evidence, keyboard and screen-reader checks, automated accessibility results where available, user acceptance, and documented exceptions. |
| 13 | Performance and scalability | Load, latency, throughput, database/index, concurrency, capacity, and single-hospital scale evidence appropriate to the feature. |
| 14 | Backup, restore and disaster recovery | Encrypted backup configuration, RPO/RTO, tested restore, point-in-time recovery evaluation, DR runbook, and restore-drill evidence. |
| 15 | Monitoring, alerting and operational support | Health checks, metrics, alerting, log search, incident response, support ownership, escalation, and operational runbooks. |
| 16 | Deployment, rollback and release verification | Environment separation, CI/CD controls, release approval, migration order, rollback plan, smoke tests, and production verification steps. |
| 17 | Documentation, training and operational ownership | Approved operating procedures, training, named owners, support arrangements, change management, and user guidance. |
| 18 | Explicit production approval | Named approver role, name, date, scope, conditions, evidence links, expiry/review date, and any accepted risk. Agents cannot approve their own work. Deployment approval is separate from production-readiness approval. |

## 7. Mandatory rules for future development

Whenever a new feature is implemented as a synthetic preview, mock, in-memory implementation,
partial workflow, or otherwise non-production capability:

1. Add it to this register in the same feature branch.
2. Link its detailed architecture or feature document.
3. Explicitly record what is implemented and what is not.
4. Identify production blockers and the evidence required to remove them.
5. Do not label it production-ready based on tests, builds, or UI completion.
6. Update the register as implementation progresses.
7. Remove or change its preview classification only after the production-readiness requirements have
   been verified and explicitly approved by an authorized human.

The register is the central index. Feature-specific documents remain the technical source of truth
for their feature. If a feature is not in this register, treat it as not production-ready.

## 8. Classification and approval procedure

A classification change requires all of the following:

1. The feature owner prepares evidence for every applicable checklist category.
2. Engineering, security, privacy/legal, clinical, finance, or operations reviews are completed as
   applicable.
3. An authorized human records an approval with role, name, date, scope, conditions, evidence links,
   and expiry or review date.
4. This register is updated with the new classification and approval reference.
5. Deployment is recorded separately only after an approved release is actually deployed and
   verified in production.

An agent may prepare evidence, record a feature as a preview or development implementation, and
recommend a classification. An agent must not approve production readiness, waive a requirement,
accept risk, or mark a blocked gate as complete.

### Register maintenance

- Keep every registered feature in this document while it remains below production-ready.
- Do not delete a prior classification. Record a superseded status with the date, reason, evidence
  link, and approving authority.
- Review the entry when implementation, evidence, risk, or approval changes.
- Downgrade a feature if evidence becomes stale, a defect invalidates an assumption, or an approval
  expires or is withdrawn.
- Review the register at each applicable gate, release decision, and production change.

## 9. Relationship to gates, ADRs and feature documents

- This register does not replace the gate sequence in
  [`STATUS_AND_APPROVAL.md`](STATUS_AND_APPROVAL.md).
- A register classification is not a gate approval.
- ADRs and hospital approvals remain authoritative for their decisions.
- Feature documents describe technical scope, limitations, and evidence. They do not make a feature
  production-ready by themselves.
- Historical ADRs must not be edited to hide a change; use a new ADR or approved amendment.
- Missing or contradictory evidence keeps a feature below production-ready.

## 10. Related documents

- [`docs/README.md`](../README.md)
- [`SOURCE_AUTHORITY.md`](SOURCE_AUTHORITY.md)
- [`STATUS_AND_APPROVAL.md`](STATUS_AND_APPROVAL.md)
- [`CONFLICT_REGISTER.md`](CONFLICT_REGISTER.md)
- [`../02-architecture/ARCHITECTURE_FOUNDATION.md`](../02-architecture/ARCHITECTURE_FOUNDATION.md)
- [`../02-architecture/PATIENT_REGISTRY_M1.md`](../02-architecture/PATIENT_REGISTRY_M1.md)
- [`../03-delivery/DEVOPS_LIFECYCLE.md`](../03-delivery/DEVOPS_LIFECYCLE.md)
- [`../../README.md`](../../README.md)
