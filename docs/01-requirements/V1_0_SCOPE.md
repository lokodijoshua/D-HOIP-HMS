# V1.0 Scope — Digital Hospital Foundation

**Status:** PROPOSED. Documentation only; not approved and not implementation authorization.
**Prepared:** 2026-11-22.
**Product version:** V1.0 (proposed commercial authority; see
[`PRODUCT_VERSION_GOVERNANCE.md`](PRODUCT_VERSION_GOVERNANCE.md)).
**Scope owner:** Project owner with hospital approval for hospital-policy decisions.

This document defines the proposed V1.0 boundary. It does not approve a capability, a role, a
department list, a policy, a gate, or a release.

## 1. Definition

V1.0 establishes the trustworthy digital foundation for one hospital: staff access, configurable
organizational structure, one longitudinal patient identity, a patient-linked encounter data
foundation, and minimum sensitive-action auditing.

V1.0 is **not** V1.1 clinical operations, V1.2 billing, V1.3 pharmacy, V2.x operations, or V3.x
business intelligence. Foundational data structures reserved for later versions are not
implementation of those versions.

## 2. Deployment boundary

- One hospital: Dare2Care Foundation Hospital.
- Single-hospital logical data model.
- No multi-hospital tenant key, tenant isolation, or tenant administration in V1.0.
- Extensibility may be preserved through stable identifiers and configurable registries, but it must
  not become multi-tenant implementation.

## 3. V1.0 users (provisional)

The following user groups are proposed for planning. Named roles, permissions, scopes, and
separation-of-duties rules remain subject to
[`../00-governance/V1_0_DECISION_AND_APPROVAL_REGISTER.md`](../00-governance/V1_0_DECISION_AND_APPROVAL_REGISTER.md)
DEC-006.

- Registration / Records Officer
- System Administrator
- Department Manager / Head
- Clinician (limited foundation access only)
- Director or approved oversight role

No user group is approved by this document.

## 4. Mandatory V1.0 scope

Mandatory scope is the minimum set required for V1.0 acceptance. It does not include conditional
capabilities.

### 4.1 Application foundation

- One-hospital Next.js application shell and navigation.
- Role-aware workspace access for approved V1.0 users.
- Coherent loading, empty, denied, error, and unavailable states.
- No clinical, financial, pharmacy, or reporting workspace implementation.

### 4.2 Authentication and employee access

- Clerk authentication with a sign-in and sign-out path and protected routes.
- Explicit Clerk-user to employee link.
- Only active, linked employees gain access.
- Employee deactivation and revocation take effect promptly.
- Session and sign-out behavior per approved policy.
- MFA configuration only as required by the approved authentication policy.

### 4.3 Minimum roles and permissions

- D-HOIP-owned employee, role, permission, and scope foundations.
- Minimum server-enforced permission checks for every V1.0 action.
- Deny-by-default behavior.
- No client-trusted roles, permissions, employee identifiers, or scopes.

Full role administration is conditional; see section 5.

### 4.4 Configurable department registry

- Departments are configurable organizational units.
- Each department has a stable internal identifier and an approved code/name where applicable.
- Departments can be enabled or disabled without destroying history.
- The **initial department list, count, codes, and enabled states are awaiting hospital approval**.
  No fixed initial list is assumed or selected by this document.
- Departments do not own patient identity, encounters, money, stock, or audit.

### 4.5 Patient registration and identity

- Search-first patient registration.
- Permanent hospital identifier with uniqueness and non-reuse.
- Duplicate detection and mandatory review before registration.
- Pending and verified identity states.
- Persistent patient profile.
- Central patient identity independent of departments.
- No department-created patient identity.

- Patient correction with a reason and append-only correction history.
- Patient lifecycle states: active, inactive, and deceased, with controlled transitions.
- Patient merge is excluded from V1.0.
- The permanent hospital identifier is immutable after allocation.
- Duplicate review requires `patient.duplicate.review`; override requires `patient.duplicate.override`.

### 4.6 Encounter data foundation

- Encounter entity linked to exactly one patient.
- Approved encounter classification, including emergency as a classification.
- Encounter status and opened/closed timestamps at foundation level.
- Responsible clinician and participating-department links where approved.
- Patient encounter history.
- Explicit encounter and association-level authorization.
- Audit of encounter-foundation creation and status changes.

The encounter foundation, patient encounter history, participants, department associations, and a
minimal create/view/close UI are mandatory V1.0 scope. Full encounter and clinical workflows are
deferred to V1.1.

### 4.7 Minimum sensitive-action audit

- Durable, append-only audit records for sensitive V1.0 actions.
- Actor, role, time, action, resource, outcome, and reason where applicable.
- Audit writes for authentication-sensitive events, employee administration, department
  configuration, patient registration/identity changes, and encounter-foundation actions.
- Restricted read access for the approved oversight role.
- Database-level prevention of ordinary update and delete.

Broader audit administration, retention, delegated grants, and tamper-evidence are conditional or
deferred; see
[`../02-architecture/V1_0_AUDIT_FOUNDATION_BOUNDARY.md`](../02-architecture/V1_0_AUDIT_FOUNDATION_BOUNDARY.md).

### 4.8 V1.0 interface

- Coherent workflows for the mandatory scope.
- Keyboard accessibility and the approved accessibility target for critical flows.
- No PHI in logs, URLs, browser storage, fixtures, screenshots, or error surfaces.

## 5. Conditional V1.0 capabilities

These capabilities are **not mandatory V1.0 acceptance criteria** unless separately approved. Each
has a matching conditional milestone scope and exit criterion.

| Capability | Condition | Why conditional |
|---|---|---|
| Full role/permission administration | DEC-006 | Minimum enforcement is mandatory; full administration may follow |
| MFA/step-up configuration | CR-015 | Depends on approved authentication policy |
| Department administration UI beyond the required configuration mechanism | CR-001 | Configuration is mandatory; full administration UX is not assumed |
| Broader audit administration, retention, legal hold, delegated grants, tamper evidence | CR-009 and DEC-014 | Minimum audit is mandatory; broader oversight is not assumed |

## 6. Deferred capabilities

The following are outside V1.0 and must not be delivered as V1.0 work:

- Full clinical operations, consultation notes, orders, results, diagnosis, triage, and clinical
  queues (V1.1).
- Laboratory, radiology, theatre, maternity, and ophthalmology workflows (V1.1 or later).
- Billing, invoices, payments, ledger, receipts, reconciliation (V1.2).
- Pharmacy, inventory, procurement, stock, controlled medicines (V1.3).
- Ward/bed management, nursing MAR, observations, emergency operations (V2.0).
- HMO and claims (V2.2).
- Staff and operational management beyond V1.0 access foundations (V2.3).
- Reporting, BI, and executive intelligence (V3.0/V3.1).
- Offline operation, integrations, patient portal, document upload, SMS.
- Multi-hospital tenancy.
- Patient merge and reversal, until separately approved.
- Automatic patient merge or organization-wide duplicate cleanup.

## 7. Domain boundaries

| Concept | Boundary |
|---|---|
| Department | Configurable organizational unit. Not a patient-identity owner, encounter owner, ledger, stock owner, or audit owner. |
| Patient | Central longitudinal identity independent of departments. |
| Encounter | Patient-centred operational/clinical episode linked to one patient. It may involve multiple departments and clinicians. It is not a department. |
| Shared capability | Authentication, authorization, audit, billing, payments, scheduling, reporting, claims, inventory, and notification are shared capabilities, not departments. |

Detailed boundaries are in
[`../02-architecture/V1_0_DOMAIN_FOUNDATIONS.md`](../02-architecture/V1_0_DOMAIN_FOUNDATIONS.md).

## 8. Mandatory acceptance criteria

| Area | Mandatory acceptance |
|---|---|
| Access | Unauthenticated, unlinked, inactive, and revoked users are denied; active linked users receive only permitted access |
| Employee lifecycle | Deactivation or revocation takes effect promptly and is audited |
| Departments | Configurable registry exists; stable identifiers; enable/disable preserves history; actions audited |
| Initial department data | No initial list is loaded until hospital approval is recorded |
| Patient identity | Search-before-create; duplicate review cannot be silently bypassed; hospital ID is unique, permanent, and immutable |
| Identity status | Pending/verified states operate for the approved workflow |
| Patient correction | Reasoned correction, append-only history, and audit |
| Patient lifecycle | Active/inactive/deceased transitions are authorized and audited |
| Encounter foundation | Every encounter links to exactly one patient; classification, participation, department associations, history view, and transitions are authorized and audited |
| Minimum audit | Sensitive V1.0 actions are durably recorded; ordinary update/delete is denied; access is restricted |
| Authorization | Server-side permission checks pass negative and cross-scope tests |
| Data integrity | Constraints, uniqueness, idempotency, and concurrency behavior are demonstrated |
| UX | Mandatory flows are coherent and meet the approved accessibility target |
| Presentation safety | Synthetic preview remains clearly labeled and cannot accept real data |

## 9. Conditional acceptance criteria

Conditional capabilities are accepted only if approved. When approved, they must meet their own
criteria and evidence requirements. They are not part of the mandatory V1.0 exit.

| Conditional capability | Acceptance if approved |
|---|---|
| Full role administration | Assign/revoke roles and scopes with SoD and negative tests |
| MFA/step-up | Approved policy enforced and evidenced |
| Broader audit | Retention, legal hold, delegated access, and tamper evidence as approved |

## 10. Non-goals and safety rules

1. Do not deliver V1.1 clinical operations as part of V1.0.
2. Do not deliver billing, pharmacy, HMO, ward, or reporting capabilities as V1.0.
3. Do not create a department-owned patient identity or encounter system.
4. Do not treat emergency as a department code.
5. Do not use real patient data in the synthetic preview.
6. Do not claim production readiness from tests, builds, or demonstrations.
7. Do not silently approve a hospital policy or an unresolved decision.

## 11. Related documents

- [`PRODUCT_VERSION_GOVERNANCE.md`](PRODUCT_VERSION_GOVERNANCE.md)
- [`V1_0_SOURCE_REGISTER.md`](V1_0_SOURCE_REGISTER.md)
- [`V1_0_REQUIREMENTS_TRACEABILITY.md`](V1_0_REQUIREMENTS_TRACEABILITY.md)
- [`../00-governance/V1_0_DECISION_AND_APPROVAL_REGISTER.md`](../00-governance/V1_0_DECISION_AND_APPROVAL_REGISTER.md)
- [`../02-architecture/V1_0_DOMAIN_FOUNDATIONS.md`](../02-architecture/V1_0_DOMAIN_FOUNDATIONS.md)
- [`../02-architecture/V1_0_AUDIT_FOUNDATION_BOUNDARY.md`](../02-architecture/V1_0_AUDIT_FOUNDATION_BOUNDARY.md)
- [`../03-delivery/V1_0_MILESTONE_AND_DEPENDENCY_PLAN.md`](../03-delivery/V1_0_MILESTONE_AND_DEPENDENCY_PLAN.md)
