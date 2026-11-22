# V1.0 Domain Foundations

**Status:** PROPOSED. Documentation only; not an approved domain model or schema.
**Prepared:** 2026-11-22.
**Scope:** conceptual boundaries for V1.0. No table, column, migration, policy, or contract is
authorized by this document.

## 1. Purpose

Define the V1.0 domain boundaries so that patient identity, encounters, departments, access, audit,
and shared capabilities are not conflated. The document distinguishes foundational data structures
from complete operational workflows.

## 2. Core principles

1. One hospital: Dare2Care Foundation Hospital.
2. One central patient identity, independent of departments.
3. One patient-centred encounter concept, not a department-owned encounter.
4. Departments are configurable organizational units, not identity or financial owners.
5. Shared capabilities are not departments.
6. Foundational data structures do not implement later-version workflows.
7. No multi-hospital tenant key or tenant administration in V1.0.
8. No department creates a duplicate patient, ledger, stock, or audit store.

## 3. Domain boundaries

### 3.1 Department

A department is a configurable organizational unit used for organizational structure, participation,
scope, and future workflows.

A department may have:

- a stable internal identifier;
- an approved code and display name;
- an enabled/disabled state;
- ownership and contact metadata;
- a defined relationship to workspaces and future queues.

A department does **not** own:

- patient identity or the permanent hospital identifier;
- encounter identity;
- the financial ledger or payment records;
- inventory or stock;
- audit storage;
- employee identity;
- global notification infrastructure.

**Initial department data:** the initial department list, count, codes, names, and enabled states are
awaiting hospital approval. This document does not select a list or a fixed count. The configuration
mechanism may be designed independently of the approved list, but no list may be seeded as approved
until the hospital decision is recorded.

### 3.2 Patient identity

A patient is a central longitudinal identity. The internal UUID is the application identity; the
permanent hospital identifier is the operational identifier.

The patient domain owns:

- identity and demographic foundations approved for V1.0;
- identity verification state;
- duplicate-review outcome;
- the longitudinal profile shell;
- links to encounters and future clinical or financial records.

The patient domain does not own department-local copies, encounter workflows, clinical notes,
billing, pharmacy, or reporting.

### 3.3 Encounter

An encounter is a patient-centred operational or clinical episode. It links to exactly one patient
and may involve multiple departments and clinicians.

**V1.0 encounter foundation:**

- encounter identity and patient link;
- approved classification, including emergency as a classification;
- foundation status and opened/closed timestamps;
- responsible clinician and participating-department links where approved;
- audit of foundation actions.

**Not included in V1.0:**

- full consultation or clinical documentation;
- notes, orders, results, diagnosis, triage, or clinical queues;
- ward/bed, nursing, emergency operational workflows;
- result verification, escalation, or clinical handoff;
- billing or financial clearance.

An encounter is not a department. Emergency is not a department code; it is an encounter
classification and future operational workspace.

### 3.4 Employee and access

The employee domain links an authenticated Clerk identity to a D-HOIP employee record.

The access domain owns:

- roles and permissions;
- scopes and assignments;
- separation-of-duties rules;
- employee status and deactivation;
- authorization decisions.

It does not own patient, encounter, or financial data. Access decisions are enforced on the server;
client-provided roles or scopes are never trusted.

**Access lifecycle invariants:**

- Employee deactivation and Clerk-link revocation occur in one administrative transaction.
- An inactive employee must not have an active Clerk link.
- Role, permission, and department assignment history is preserved using status/effective dates;
  active mappings are not silently deleted.
- `patient.duplicate.review` is distinct from `patient.duplicate.override`; candidate visibility is
  restricted to the review requester and authorized reviewers.
- The permanent hospital identifier is immutable after allocation; corrections never rewrite it.
- First-administrator bootstrap and Clerk-link provisioning use a privileged, audited provisioning
  path; there is no application self-registration or first-user bootstrap endpoint.
- Encounter and encounter-association actions are explicitly authorized at function and row level;
  department participation does not imply unrestricted encounter access.

### 3.5 Audit

Audit is a shared capability. The minimum V1.0 audit foundation records sensitive actions in an
append-only store. Broader audit administration, retention, delegated grants, and tamper evidence are
separate capabilities. See
[`V1_0_AUDIT_FOUNDATION_BOUNDARY.md`](V1_0_AUDIT_FOUNDATION_BOUNDARY.md).

Audit does not belong to a department and is not derived from application logs.

### 3.6 Shared capabilities that are not departments

The following are shared capabilities, even where they are operated by a team:

- authentication and authorization;
- audit;
- billing and payments;
- scheduling;
- reporting and business intelligence;
- claims and HMO administration;
- inventory and procurement;
- notification;
- master data.

They may have operational owners, but they are not modelled as departments without a separate
hospital decision.

## 4. Conceptual relationships

```text
Patient 1 --- * Encounter
Encounter * --- * Department        (participation)
Encounter 1 --- * Clinician         (responsibility/participation)
Employee 1 --- 1 Clerk identity
Employee * --- * Role
Role * --- * Permission
Department 1 --- * Employee         (assignment, where approved)
Audit event * --- 1 Actor
Audit event * --- 0..1 Patient/Encounter/Department/Employee reference
```

These are conceptual relationships, not a database schema. Cardinalities and optionality require
approved design.

## 5. V1.0 invariants

1. One canonical patient identity per person.
2. The hospital identifier is permanent, immutable, and never reused.
3. No department creates a patient identity.
4. Every encounter links to exactly one patient.
5. An encounter may involve multiple departments without belonging to one.
6. Emergency is an encounter classification, not a department.
7. Departments do not own money, stock, audit, or employee identity.
8. Shared capabilities remain separate from department modelling.
9. Sensitive V1.0 actions produce audit records.
10. No V1.0 workflow creates clinical, financial, or stock history.
11. No multi-hospital tenant key is introduced.
12. No real patient data is used in synthetic previews or tests.
13. Role, permission, and department assignment history is preserved; revocation does not delete
    history.
14. Employee deactivation and Clerk-link revocation are transactionally consistent.
15. Duplicate-review visibility is restricted; review and override are separate permissions.
16. Encounter and association-level access is explicitly authorized.

## 6. Extensibility rules

- Department codes and states are configurable, not hard-coded into patient identity.
- Encounter classifications are an extensible registry, but only approved classifications may be
  used.
- Permission keys are explicit and server-enforced.
- Audit events use an extensible envelope, but protected fields and access rules remain controlled.
- Future billing, pharmacy, or clinical modules may consume core contracts; core must not depend on
  them.
- A reserved identifier or link is not implementation of a later-version capability.

## 7. Unresolved boundaries

- Initial department list and enabled states (DEC-016).
- Registration ownership (CR-002).
- Exact encounter history/UI presentation details; the foundation and minimal workflow are in V1.0.
- Patient merge (excluded from V1.0; future approval).
- Full role administration (DEC-006).
- Broader audit scope (CR-009 and DEC-014).

## 8. Related documents

- [`../01-requirements/V1_0_SCOPE.md`](../01-requirements/V1_0_SCOPE.md)
- [`../01-requirements/V1_0_REQUIREMENTS_TRACEABILITY.md`](../01-requirements/V1_0_REQUIREMENTS_TRACEABILITY.md)
- [`../00-governance/V1_0_DECISION_AND_APPROVAL_REGISTER.md`](../00-governance/V1_0_DECISION_AND_APPROVAL_REGISTER.md)
- [`V1_0_AUDIT_FOUNDATION_BOUNDARY.md`](V1_0_AUDIT_FOUNDATION_BOUNDARY.md)
- [`ARCHITECTURE_FOUNDATION.md`](ARCHITECTURE_FOUNDATION.md)
