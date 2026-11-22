# V1.0 Audit Foundation Boundary

**Status:** PROPOSED. Documentation only; not an approved audit design or policy.
**Prepared:** 2026-11-22.
**Scope:** separates the minimum sensitive-action audit required for V1.0 from broader audit
administration, oversight, retention, and tamper-evidence capabilities.

This document does not approve audit access, retention periods, legal hold, tamper-evidence method,
or any policy. Those remain open decisions.

## 1. Purpose

Audit is a shared capability, not a department. V1.0 needs a trustworthy minimum audit foundation
before persistent patient, department, employee, or encounter actions are accepted. Broader audit
administration is a separate capability and must not be assumed as V1.0 commercial scope.

## 2. Minimum V1.0 audit foundation (mandatory)

### 2.1 Scope

The minimum foundation records sensitive V1.0 actions:

- authentication-sensitive events approved for audit;
- employee provisioning, deactivation, and revocation;
- role, permission, or scope assignment where implemented;
- department creation, change, enable, or disable;
- patient registration, identifier allocation, duplicate review, and identity-state change;
- encounter-foundation creation and status change;
- audit-access attempts where approved.

### 2.2 Required event content

At minimum:

- event identifier;
- event type/action;
- actor identity and role/scope at the time of action;
- timestamp;
- affected resource type and identifier;
- outcome (success or denial);
- reason where the action requires one;
- correlation or request reference;
- protected before/after values only where approved and necessary.

Event content must not include unnecessary PHI. Protected values require an approved access and
redaction design.

### 2.3 Write behavior

- Audit records are append-only.
- Ordinary application roles must not update or delete audit records.
- The write path must not silently drop a sensitive-action audit record.
- Whether audit is written in the same transaction as the action, or through an approved durable
  mechanism, is a design decision. The chosen design must demonstrate no silent loss.
- Failure behavior must be explicit. A sensitive action must not silently succeed without its
  required audit record.

### 2.4 Minimum access

- A restricted, approved oversight role can read permitted audit records.
- Ordinary application users cannot browse audit records.
- Audit access itself is audited where technically feasible.
- The exact oversight role and scope are subject to CR-009.

### 2.5 Minimum acceptance evidence

- Sensitive actions produce the required events.
- Denied actions are recorded where required.
- Ordinary update and delete are rejected.
- Unauthorized audit reads are denied.
- Audit records survive application restart.
- No required event is lost in the tested failure modes.
- No unnecessary PHI appears in event content or logs.

## 3. Broader audit capability (conditional or deferred)

The following are **not mandatory V1.0 acceptance** unless separately approved:

- full audit administration UI;
- configurable retention periods and purge jobs;
- legal hold;
- hash-chain or equivalent tamper-evidence beyond database append-only enforcement;
- delegated, time-limited audit grants;
- Director financial audit views;
- clinical audit views;
- audit export and reporting;
- audit analytics and dashboards;
- long-term archival;
- cross-domain audit correlation;
- automated audit review workflows.

They may be required for pilot or production by hospital policy, legal review, or security review.
If so, they must be moved into scope with an approved decision and matching milestone.

## 4. Decision dependencies

| Decision | Effect on audit |
|---|---|
| CR-009 | Access model, delegation, immutability, retention, tamper evidence |
| DEC-014 | Retention period and legal hold |
| CR-014 | Database role and policy enforcement |
| DEC-006 | Oversight role and permissions |
| Privacy/DPO review | Lawful basis, retention, data minimization, cross-border considerations |

No decision is approved by this document.

## 5. Relationship to milestones

- **M5 — Minimum audit foundation** is mandatory and precedes persistent patient, department, and
  encounter writes.
- **M11-C — Broader audit hardening** is conditional. It is not required for mandatory V1.0 exit
  unless hospital policy makes a broader control mandatory.
- Patient registration (M7) must write through the M5 audit foundation; it does not implement its own
  private audit store.

## 6. Immutability and tamper evidence

Database-level append-only enforcement is the proposed minimum. Hash-chain or equivalent
tamper-evidence is a separate control and remains conditional until CR-009 is approved.

Do not claim tamper evidence merely because update/delete is denied. Do not claim audit compliance
merely because events exist.

## 7. Production-readiness note

The existing in-memory patient audit events are illustrative only. They are not durable, append-only,
tamper-evident, or access-controlled. The production-readiness register remains authoritative for
classification.

## 8. Related documents

- [`../01-requirements/V1_0_SCOPE.md`](../01-requirements/V1_0_SCOPE.md)
- [`../01-requirements/V1_0_REQUIREMENTS_TRACEABILITY.md`](../01-requirements/V1_0_REQUIREMENTS_TRACEABILITY.md)
- [`V1_0_DOMAIN_FOUNDATIONS.md`](V1_0_DOMAIN_FOUNDATIONS.md)
- [`../00-governance/V1_0_DECISION_AND_APPROVAL_REGISTER.md`](../00-governance/V1_0_DECISION_AND_APPROVAL_REGISTER.md)
- [`../03-delivery/V1_0_MILESTONE_AND_DEPENDENCY_PLAN.md`](../03-delivery/V1_0_MILESTONE_AND_DEPENDENCY_PLAN.md)
