# V1.0 Milestone and Dependency Plan

**Status:** PROPOSED. Documentation only; no milestone is authorized for implementation.
**Prepared:** 2026-11-22.
**Scope:** proposed V1.0 engineering milestones, dependencies, conditional scope, tests, exit
criteria, and approval gates.

This plan does not authorize schema design, migrations, application code, dependency changes,
environment provisioning, or release. Gate 5 remains blocked.

## 1. Principles

1. Controls before screens; evidence before release.
2. Mandatory V1.0 acceptance is separate from conditional capabilities.
3. Minimum audit precedes persistent sensitive data writes.
4. Broader audit is a separate conditional capability.
5. Encounter data foundations are separate from full clinical workflows.
6. Hosting/residency does not block logical architecture by default.
7. Every conditional requirement has a matching conditional milestone and exit criterion.
8. The Stage B security work and synthetic patient preview are preserved and reused, not discarded.

## 2. Dependency graph

```text
M0 Source and scope
  -> M1 Logical architecture and data design
       -> M2 Security/access design validation
       -> M3 Environment and CI readiness (hosted/staging requires CR-016)
       -> M4 Authentication and employee access
            -> M5 Minimum audit foundation
                 -> M6 Department registry
                      -> M6-C Initial department data (conditional)
                 -> M7 Persistent patient registry
                      -> M8 Identity lifecycle
                           -> M8-C Correction/merge (conditional)
                      -> M9 Encounter foundation (also requires M6)
                           -> M9-C Minimal encounter UI (conditional)
                 -> M11-C Broader audit hardening (conditional)
            -> M10-C Full role administration (conditional)
  -> M12 Mandatory integration and UAT
       -> M12-P Controlled pilot (requires DEC-015 and CR-016)
```

`M10-C` may run after M4 and M6. `M11-C` may run after M5; if delegated audit grants are included,
it also depends on M10-C. Conditional milestones do not gate mandatory M12 exit unless separately
approved as pilot/production requirements.

## 3. Milestones

### M0 — Source verification, version governance, and V1.0 baseline

**Prerequisites:** project-owner selection of the authoritative proposal file.

**Scope:** verify proposal path/hash; register source; approve product-version governance; approve
V1.0 scope, mandatory/conditional boundary, traceability, and decision register.

**Exclusions:** application code, schema, migrations, dependencies, environments.

**Tests/evidence:** document review; source hash record; traceability completeness; conflict entries.

**Exit criteria:** source registered; V1.0 scope and version governance approved; open decisions
recorded; no requirement lacks a source or decision reference.

**Gates:** 0, 1.

### M1 — V1.0 logical architecture and data design

**Prerequisites:** M0; DEC-001; CR-001 configuration model; CR-002; CR-004; DEC-005; DEC-006;
CR-009 minimum audit design; CR-014 design direction.

**Scope:** conceptual domain model; entity ownership; patient, department, employee, role,
permission, encounter-foundation, and audit-foundation design; migration and rollback plan; RLS
design direction.

**Exclusions:** applied migrations; feature code; production environment; initial department data.

**Tests/evidence:** model review; invariant review; boundary tests design; migration/rollback review;
audit/minimum-design review.

**Exit criteria:** Gate 2 and Gate 4 design evidence approved. CR-016 is not required for logical
architecture, but privacy inputs may be needed where retention or residency affects the design.

**Gates:** 2, 4.

### M2 — Security and access design validation

**Prerequisites:** M1; CR-014; CR-015 design direction; DEC-006 minimum access model.

**Scope:** extend Stage B evidence to approved roles, scopes, department participation, and negative
access cases; validate transaction identity, RLS/defense-in-depth, and session behavior.

**Exclusions:** production deployment; real patient data; final role-administration UI.

**Tests/evidence:** RLS negative tests; cross-scope/IDOR tests; unauthenticated/unlinked/inactive/
revoked denial; transaction-context isolation; pooling evidence; session behavior.

**Exit criteria:** security review accepts the access design; no production RLS claim is made beyond
the evidence.

**Gates:** 3.

### M3 — Environment and CI readiness

**Prerequisites:** M2; CR-016 for any hosted/staging environment; DEC-001.

**Scope:** local/CI environment controls, secret management, lint/security/dependency/secret checks,
migration validation, backup design, and hosted/staging environment planning.

**Exclusions:** feature code; production deployment; real data.

**Tests/evidence:** CI pipeline; secret scan; dependency scan; migration dry run; environment access
review.

**Exit criteria:** Gate 5 implementation readiness for the approved scope. A local synthetic
environment may proceed without CR-016; any hosted/staging or pilot environment requires CR-016.

**Gates:** 5.

### M3-C — Hosted/staging environment (conditional)

**Condition:** CR-016 approved and pilot/staging environment authorized.

**Scope:** isolated hosted/staging environment with approved data, secrets, access, backup location,
and monitoring design.

**Exclusions:** production operations.

**Exit criteria:** environment isolation, access, and data-handling evidence accepted.

**Gates:** 5, 7.

### M4 — Authentication and employee access

**Prerequisites:** M1, M2, M3; DEC-013; DEC-006 minimum; CR-015 session policy.

**Scope:** Clerk provider and sign-in/out; protected routes; employee link and provisioning;
deactivation/revocation; minimum role checks; session behavior.

**Exclusions:** full role administration; clinical/financial permissions.

**Tests/evidence:** real sign-in; unauthenticated/unlinked/inactive/revoked denial; deactivation;
session expiry; route-protection tests.

**Exit criteria:** only active, linked employees access V1.0 workspaces; access is audited.

**Gates:** 6.

### M4-C — MFA and step-up (conditional)

**Condition:** CR-015 requires MFA/step-up for V1.0.

**Scope:** approved MFA/step-up policy and enforcement.

**Exit criteria:** approved policy enforced and evidenced.

**Gates:** 3, 6.

### M5 — Minimum audit foundation

**Prerequisites:** M1, M2, M4; CR-009 minimum audit design.

**Scope:** append-only audit schema; write path; sensitive-event helpers; basic restricted read;
database-level update/delete denial.

**Exclusions:** retention automation; legal hold; hash chain; delegated grants; audit dashboards;
financial/clinical audit views.

**Tests/evidence:** required events for sensitive actions; denied actions; update/delete denial;
unauthorized read denial; restart persistence; failure behavior; no unnecessary PHI.

**Exit criteria:** minimum audit accepted. M5 must precede M6, M7, M8, and M9.

**Gates:** 6.

### M6 — Department registry

**Prerequisites:** M4, M5; CR-001 configuration model; DEC-012.

**Scope:** department schema and configuration mechanism; stable identifiers; enable/disable;
history preservation; audit.

**Exclusions:** initial department list/count; department clinical workflows.

**Tests/evidence:** create/change/disable; uniqueness/stability; history; unauthorized denial;
audit.

**Exit criteria:** configurable registry accepted without selecting an initial list.

**Gates:** 6.

### M6-C — Initial department data (conditional)

**Condition:** DEC-016 approved by the hospital.

**Scope:** load the approved initial department list, codes, names, and enabled states with audit and
rollback.

**Exclusions:** any unapproved list or count.

**Exit criteria:** approved list loaded and verified; audit and rollback evidence accepted.

**Gates:** 6, pilot.

### M7 — Persistent patient registry

**Prerequisites:** M5; CR-002; CR-004. M6 is not a prerequisite for patient persistence; M6 and M7
may proceed in parallel after M5.

**Scope:** PostgreSQL patient persistence; hospital-ID sequence and uniqueness; search; duplicate
review; pending/verified foundation; profile; reuse of existing patient domain/UI where valid;
minimum audit.

**Exclusions:** correction/merge unless M8-C approved; clinical history; billing; pharmacy.

**Tests/evidence:** persistence; concurrency; ID uniqueness/exhaustion; duplicate review; idempotency;
restart; scope/authorization.

**Exit criteria:** patient registry accepted for the approved pilot scope.

**Gates:** 6.

### M8 — Identity lifecycle foundation

**Prerequisites:** M7; CR-004.

**Scope (mandatory):** pending/verified identity states and approved verification foundation.

**Exclusions:** correction; merge; reversal; organization-wide duplicate cleanup.

**Tests/evidence:** state transitions; authorization; audit; invalid-transition denial.

**Exit criteria:** mandatory identity-state foundation accepted.

**Gates:** 6.

### M8-C — Patient correction and merge (conditional)

**Condition:** DEC-011 and CR-004 approved.

**Scope:** correction; merge and reversal if approved, with reason, authority, link repointing,
history preservation, and audit.

**Exclusions:** unapproved merge authority or automatic merge.

**Tests/evidence:** correction; merge; reversal; link integrity; two-person control if approved;
audit; unauthorized denial.

**Exit criteria:** only the approved subset is accepted; unapproved capabilities remain excluded.

**Gates:** 6.

### M9 — Encounter foundation

**Prerequisites:** M6, M7; DEC-005.

**Scope:** encounter entity; patient link; classification including emergency; foundation status;
clinician/department participation; audit.

**Exclusions:** full encounter UI unless M9-C approved; clinical notes, orders, results, triage, ward,
nursing, billing.

**Tests/evidence:** patient linkage; classification; participation; status transition; authorization;
audit; invalid-link denial.

**Exit criteria:** encounter data foundation accepted. Full clinical workflow remains V1.1.

**Gates:** 6.

### M9-C — Minimal encounter create/view UI (conditional)

**Condition:** DEC-005 and proposal confirm a minimal UI is in V1.0.

**Scope:** create/view/close the encounter foundation with patient link, classification,
participation, authorization, and audit.

**Exclusions:** clinical notes, orders, results, triage, ward, billing.

**Tests/evidence:** create/view/close; patient link; participation; denial; audit.

**Exit criteria:** approved minimal UI accepted; not required for mandatory M12 exit.

**Gates:** 6.

### M10-C — Full role and permission administration (conditional)

**Condition:** DEC-006 approves full administration in V1.0.

**Scope:** assign/revoke roles, permissions, and scopes; separation-of-duties checks; negative access
tests.

**Exclusions:** clinical/financial permissions for later versions.

**Exit criteria:** administration accepted with SoD and negative tests. Not required for mandatory M12
exit.

**Gates:** 6.

### M11-C — Broader audit hardening (conditional)

**Condition:** CR-009 and DEC-014 approve broader controls for V1.0, pilot, or production.

**Scope:** retention, legal hold, delegated audit access, tamper evidence, oversight views, export as
approved.

**Exclusions:** unapproved retention or tamper-evidence claims.

**Tests/evidence:** retention; tamper; delegated access; unauthorized denial; export audit.

**Exit criteria:** only the approved broader controls accepted. Not required for mandatory M12 exit
unless hospital policy makes them mandatory.

**Gates:** 6, 7.

### M12 — Mandatory V1.0 integration, UAT, and acceptance

**Prerequisites:** M0-M9 mandatory scope; M4-C/M6-C only if approved; M12 does **not** require M8-C,
M9-C, M10-C, or M11-C.

**Scope:** integrate mandatory V1.0 workflows; accessibility; error/empty/denied states; UAT;
training notes; operational runbooks; evidence pack.

**Exclusions:** mandatory inclusion of full role administration, minimal encounter UI, correction,
merge, or broader audit. Conditional capabilities are accepted separately only if approved.

**Tests/evidence:** E2E mandatory flows; negative authorization; accessibility; UAT; migration/
rollback rehearsal; release rehearsal.

**Exit criteria:** mandatory V1.0 scope accepted for controlled pilot consideration. Production
approval remains separate.

**Gates:** 6, 7.

### M12-P — Controlled pilot (conditional)

**Prerequisites:** mandatory V1.0 acceptance; DEC-015; CR-016; DEC-016/M6-C if departments are used
in the pilot; M4-C if MFA is required by the approved policy.

**Scope:** controlled pilot with approved users, synthetic or approved pilot data, support,
monitoring, and rollback.

**Exclusions:** uncontrolled production use; real data without approval.

**Exit criteria:** pilot approval and operational evidence recorded; production release still
separate.

**Gates:** 7.

## 4. Conditional requirement mapping

| Requirement | Conditional milestone | Exit criterion |
|---|---|---|
| PAT-06 Patient correction | M8-C | Correction with reason, history, audit |
| PAT-07 Patient merge/reversal | M8-C | Approved authority, link repointing, reversal, audit |
| ENC-04 Minimal encounter UI | M9-C | Create/view/close with authorization and audit |
| AUTH-05 Full role administration | M10-C | Role/scope assignment, SoD, negative tests |
| AUTH-07 MFA/step-up | M4-C | Approved policy enforced |
| ORG-04 Initial department list | M6-C | Approved list loaded with audit and rollback |
| AUD-03 Broader audit | M11-C | Approved retention/tamper/delegation controls |
| OPS-02 Hosted/staging environment | M3-C | Isolated approved environment |
| OPS-03 Release/rollback/pilot | M12-P | Release rehearsal, UAT, named approval |

## 5. Decision gates by stage

| Stage | Decisions |
|---|---|
| Logical architecture | DEC-001, CR-001, CR-002, CR-004, DEC-005, DEC-006, CR-009, CR-014 |
| Security/database design | CR-014, CR-015, CR-009, DEC-006; CR-016 privacy inputs where applicable |
| Hosting/environment implementation | CR-016, CR-015 configuration |
| Implementation start | Gate 5; approved schema/plan; M0-M3 prerequisites |
| Pilot | Mandatory V1.0 acceptance, DEC-015, CR-016, approved pilot data handling |
| Production | RLS validation, backup/restore, monitoring, retention/tamper if required, security review, named release approval |

## 6. Related documents

- [`../01-requirements/V1_0_SCOPE.md`](../01-requirements/V1_0_SCOPE.md)
- [`../01-requirements/V1_0_REQUIREMENTS_TRACEABILITY.md`](../01-requirements/V1_0_REQUIREMENTS_TRACEABILITY.md)
- [`../00-governance/V1_0_DECISION_AND_APPROVAL_REGISTER.md`](../00-governance/V1_0_DECISION_AND_APPROVAL_REGISTER.md)
- [`../02-architecture/V1_0_AUDIT_FOUNDATION_BOUNDARY.md`](../02-architecture/V1_0_AUDIT_FOUNDATION_BOUNDARY.md)
- [`V1_0_PRESENTATION_AND_READINESS_ASSESSMENT.md`](V1_0_PRESENTATION_AND_READINESS_ASSESSMENT.md)
