# V1.0 Decision and Approval Register

**Status:** PROPOSED and OPEN. Documentation only; no decision is approved by this document.
**Prepared:** 2026-11-22.
**Scope:** records unresolved V1.0 decisions, options, technical consequences, and the stage each
decision blocks.

This register does not approve a hospital policy, role, department, access rule, audit model,
hosting arrangement, product scope, or gate. Only authorized humans may approve, reject, waive, or
accept risk.

## 1. Blocking-stage model

Decisions do not all block the same activity. The stages below are distinct.

| Stage | Meaning |
|---|---|
| **Logical architecture** | Domain model, boundaries, entity ownership, and product-scope structure |
| **Security/database design** | Access model, roles/permissions, RLS design, audit design, retention design |
| **Hosting/environment implementation** | Provider, region, environment provisioning, secrets, backup location |
| **Implementation start** | Gate 5 and approved schema, plan, dependencies, and environment |
| **Pilot** | Controlled hospital use with synthetic or approved pilot data and UAT |
| **Production** | Real hospital operations, release approval, and operational evidence |

Hosting and residency decisions do not block logical architecture by default. They block hosted
environment implementation and pilot/production approval.

## 2. Summary of blocking decisions

| Decision | Architecture | Security/DB design | Hosting/environment | Implementation | Pilot | Production |
|---|---|---|---|---|---|---|
| DEC-001 Product-version authority | Yes | Yes | - | Yes | Yes | Yes |
| CR-001 Department model | Yes | Yes | - | Yes | Yes | Yes |
| CR-002 Registration ownership | Yes | Yes | - | Yes | Yes | Yes |
| CR-004 Patient identity rules | Yes | Yes | - | Yes | Yes | Yes |
| DEC-005 Encounter foundation scope | Yes | Yes | - | Yes | Yes | Yes |
| DEC-006 Role/permission/SoD | Yes | Yes | - | Yes | Yes | Yes |
| CR-009 Audit model | Yes | Yes | - | Yes | Conditional | Yes |
| CR-014 RLS/access design | - | Yes | - | Yes | Yes | Yes |
| CR-015 MFA/session policy | - | Yes | Yes | Yes | Yes | Yes |
| CR-016 Hosting/residency/privacy | - | Privacy inputs | Yes | Environment only | Yes | Yes |
| DEC-011 Correction/merge inclusion | - | Yes | - | Correction included; merge deferred | Correction included; merge deferred | Correction included; merge deferred |
| DEC-012 Department lifecycle | - | - | - | Yes | Yes | Yes |
| DEC-013 Employee provisioning ownership | - | Yes | - | Yes | Yes | Yes |
| DEC-014 Audit retention/legal hold | - | Yes | - | - | Conditional | Yes |
| DEC-015 Pilot acceptance and approvers | - | - | - | - | Yes | Yes |
| DEC-016 Initial department list | - | - | - | - | Yes | Yes |

`Conditional` means the decision blocks only if the related capability is included.

## 3. Decision detail

### DEC-001 — Authoritative proposal and V1.0 boundary

**Status:** UNRESOLVED.
**Owner:** Project owner with hospital sponsor.
**Options:**

- A. The proposal governs commercial product versions; internal V0-V5 remains historical.
- B. Internal V0-V5 governs; the proposal is commercial language only.
- C. A dual mapping is approved, with the proposal authoritative for external scope.

**Technical consequence:** determines V1.0 scope, traceability, release naming, and milestone
mapping.
**Blocks:** logical architecture, implementation, pilot, production.

### CR-001 — Department and workspace registry

**Status:** OPEN.
**Owner:** Director.
**Options:**

- A. Approve the policy department model.
- B. Approve the architecture-foundation model.
- C. Approve a configurable registry with an initial list to be supplied later.
- D. Another hospital-approved model.

**Technical consequence:** determines department identifiers, enabled states, navigation,
permissions, participation links, and reporting dimensions. The initial list is **not** selected by
this document.
**Blocks:** logical architecture, security/database design, implementation, pilot, production.

### CR-002 — Patient registration ownership

**Status:** OPEN.
**Owner:** Director and Records.
**Options:**

- A. Admin/Records owns registration under hospital policy.
- B. A registry department owns registration under ADR 0009.
- C. Registration is a shared capability with an approved registration role.

**Technical consequence:** module ownership, authorization, audit, and contract boundaries.
**Blocks:** logical architecture, security/database design, implementation, pilot, production.

### CR-004 — Patient identity, duplicates, verification, correction, and merge

**Status:** OPEN.
**Owner:** Director, Records, and Medical.
**Options:**

- A. Approve the current simple identifier and duplicate rules.
- B. Approve revised identifier, duplicate, and verification rules.
- C. Defer correction/merge while approving a minimum pending/verified lifecycle.

**Technical consequence:** identity schema, duplicate scoring, verification states, merge authority,
and audit requirements. No policy is selected here.
**Blocks:** logical architecture, security/database design, implementation, pilot, production.

### DEC-005 — Encounter foundation scope

**Status:** ARCHITECTURE GATE SELECTED FOUNDATION + MINIMAL WORKFLOW; HOSPITAL RATIFICATION PENDING.
**Owner:** Director and Medical.
**Options:**

- A. Data foundation only in V1.0.
- B. Data foundation plus a minimal create/view/close UI.
- C. Defer all encounter work to V1.1.

**Technical consequence:** encounter schema, participation links, patient encounter history, explicit
encounter/association authorization, UI, audit, and pilot scope. The approved V1.0 architecture gate
requires the encounter foundation, patient encounter history, participants, department associations,
and a minimal create/view/close workflow in V1.0; full clinical workflow remains V1.1.
**Blocks:** logical architecture, security/database design, implementation, pilot, production.

### DEC-006 — Roles, permissions, scopes, and separation of duties

**Status:** OPEN.
**Owner:** Director and Security.
**Options:**

- A. Minimal fixed roles for V1.0.
- B. Configurable role-based access control.
- C. Hybrid role- and attribute-based access control.
- D. Another approved model.

**Technical consequence:** permission schema, administrative UI, scope checks, audit, and test
matrix. Minimum enforcement is mandatory; full administration is conditional.
**Blocks:** logical architecture, security/database design, implementation, pilot, production.

### CR-009 — Audit access, retention, immutability, and delegated grants

**Status:** OPEN.
**Owner:** Director and Legal.
**Options:**

- A. Director-only full audit access.
- B. Director plus written, time-limited delegated grants.
- C. A broader auditor role.
- Immutability: database-only enforcement, hash chain, or both.
- Retention: fixed period, policy-driven, or legal-hold capable.

**Technical consequence:** audit schema, access model, retention jobs, tamper evidence, and audit
review workflow. Minimum sensitive-action auditing is mandatory; broader oversight is conditional.
**Blocks:** logical architecture and security/database design; pilot if policy requires broader
controls; production.

### CR-014 — Database access and RLS

**Status:** OPEN.
**Owner:** Security and Engineering.
**Options:**

- A. Transaction-scoped claims with forced RLS.
- B. Application-only authorization.
- C. Hybrid with RLS as defense-in-depth.

**Technical consequence:** database roles, grants, policies, negative tests, and production security
evidence. RLS must not be claimed as production-validated before the approved evidence exists.
**Blocks:** security/database design, implementation, pilot, production.

### CR-015 — Authentication, MFA, session, and step-up

**Status:** OPEN.
**Owner:** Director and Security.
**Options:**

- A. MFA for all staff.
- B. MFA for privileged staff only.
- C. Phased MFA.
- Session timeout and step-up duration options require approval.

**Technical consequence:** Clerk configuration, session behavior, and sensitive-action controls.
**Blocks:** security/database design, hosted environment, implementation, pilot, production.

### CR-016 — Hosting, residency, privacy, and data protection

**Status:** OPEN.
**Owner:** Director, Legal/DPO, and IT.
**Options:** hosting provider/region, backup region, retention, DPIA approach, processor agreements,
and cross-border transfer basis. These are hospital/legal decisions.

**Technical consequence:** deployment topology, backup location, privacy controls, and operational
readiness.
**Blocks:** hosted/staging environment implementation and pilot/production approval. It does **not**
block logical architecture or the local synthetic design work by default. Security/database design
must receive privacy inputs where data residency or retention affects the design.

### DEC-011 — Patient correction and merge in V1.0

**Status:** CORRECTION INCLUDED BY V1.0 ARCHITECTURE GATE; MERGE UNRESOLVED.
**Owner:** Director, Records, and Medical.
**Options:**

- A. Correction only in V1.0. (Current V1.0 architecture direction.)
- B. Correction plus merge in V1.0. (Not approved; merge excluded.)
- C. Defer both. (Rejected for V1.0.)

**Technical consequence:** correction and lifecycle are mandatory V1.0 scope; merge remains a future
decision. The architecture gate does not replace hospital policy ratification for correction,
deactivation, deceased status, or merge.
**Blocks:** correction and lifecycle: no, they are in V1.0; merge: future approval only.

### DEC-012 — Department disable and history

**Status:** OPEN.
**Owner:** Director.
**Options:**

- A. Disable only.
- B. Soft delete.
- C. Hard delete with constraints.

**Technical consequence:** historical integrity and foreign-key behavior.
**Blocks:** implementation, pilot, production.

### DEC-013 — Employee provisioning ownership

**Status:** OPEN.
**Owner:** Director and Admin/HR.
**Options:**

- A. Admin/HR owns provisioning.
- B. System Administrator owns provisioning.
- C. Joint request and approval.

**Technical consequence:** administrative authorization, audit, and onboarding workflow.
**Blocks:** security/database design, implementation, pilot, production.

### DEC-014 — Audit retention and legal hold

**Status:** OPEN.
**Owner:** Director and Legal.
**Options:** fixed retention, policy-driven retention, or legal-hold-capable retention.

**Technical consequence:** storage, purge, access, and production audit evidence.
**Blocks:** broader audit capability and production; not minimum append-only audit.

### DEC-015 — Pilot acceptance and approvers

**Status:** OPEN.
**Owner:** Project owner and hospital.
**Options:** Director-led acceptance, multi-role acceptance board, or owner-delegated acceptance.

**Technical consequence:** UAT ownership, release authorization, and pilot scope.
**Blocks:** pilot and production.

### DEC-016 — Initial department list and enabled states

**Status:** OPEN — AWAITING HOSPITAL APPROVAL.
**Owner:** Director.
**Options:** any hospital-approved list, codes, names, and enabled states. No count or list is
selected here.

**Technical consequence:** initial configuration data, navigation, permissions, and pilot readiness.
The configuration mechanism can be built without the list; the list must not be seeded as if
approved.
**Blocks:** pilot data load and pilot acceptance; not the logical model.

## 4. Approval rules

1. An agent may prepare evidence and recommend an outcome only.
2. An agent must not approve, waive, or accept risk.
3. A recommendation is not an approved decision.
4. Missing or contradictory evidence keeps the decision open.
5. A decision closure must record role, name, date, scope, conditions, evidence, and expiry/review
   date.
6. The conflict register must be updated when a conflict is closed.

## 5. Related documents

- [`../01-requirements/V1_0_SCOPE.md`](../01-requirements/V1_0_SCOPE.md)
- [`../01-requirements/V1_0_REQUIREMENTS_TRACEABILITY.md`](../01-requirements/V1_0_REQUIREMENTS_TRACEABILITY.md)
- [`../01-requirements/PRODUCT_VERSION_GOVERNANCE.md`](../01-requirements/PRODUCT_VERSION_GOVERNANCE.md)
- [`CONFLICT_REGISTER.md`](CONFLICT_REGISTER.md)
- [`STATUS_AND_APPROVAL.md`](STATUS_AND_APPROVAL.md)
- [`../03-delivery/V1_0_MILESTONE_AND_DEPENDENCY_PLAN.md`](../03-delivery/V1_0_MILESTONE_AND_DEPENDENCY_PLAN.md)
