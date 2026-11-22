# V1.0 Requirements Traceability

**Status:** PROPOSED. Documentation only; requirements are not approved.
**Prepared:** 2026-11-22.
**Product version:** V1.0 Digital Hospital Foundation.

This matrix traces each proposed V1.0 requirement to its source, current implementation, required
work, dependencies, acceptance evidence, and production-readiness classification. It does not
approve a requirement or change the authoritative production-readiness register.

## 1. Classification

| Code | Meaning |
|---|---|
| `M-F` | Mandatory foundation data structure or control |
| `M-O` | Mandatory operational capability for V1.0 acceptance |
| `C` | Conditional capability; not mandatory unless separately approved |
| `D` | Deferred to a later product version |

Readiness vocabulary follows
[`../00-governance/PRODUCTION_READINESS_REGISTER.md`](../00-governance/PRODUCTION_READINESS_REGISTER.md).

## 2. Source keys

| Key | Source |
|---|---|
| `BP` | DARE2CARE D-HOIP Budget Proposal, proposed commercial authority, text pending reconciliation |
| `CPD` | [`CONFIRMED_PROJECT_DIRECTION.md`](CONFIRMED_PROJECT_DIRECTION.md) |
| `AF` | [`../02-architecture/ARCHITECTURE_FOUNDATION.md`](../02-architecture/ARCHITECTURE_FOUNDATION.md) |
| `PRR` | [`../00-governance/PRODUCTION_READINESS_REGISTER.md`](../00-governance/PRODUCTION_READINESS_REGISTER.md) |
| `SBS` | [`../02-architecture/STAGE_B_DATABASE_SECURITY_SPIKE.md`](../02-architecture/STAGE_B_DATABASE_SECURITY_SPIKE.md) |
| `DEV` | [`../03-delivery/DEVOPS_LIFECYCLE.md`](../03-delivery/DEVOPS_LIFECYCLE.md) |
| `M1` | [`../02-architecture/PATIENT_REGISTRY_M1.md`](../02-architecture/PATIENT_REGISTRY_M1.md) |
| `ADR` | Accepted or proposed ADR as named |
| `TASK` | Project-owner V1.0 pack instructions |

## 3. Register

| ID | Requirement | Class | Source | Current state | Required V1.0 work | Decisions / dependencies | Acceptance evidence | Readiness |
|---|---|---|---|---|---|---|---|---|
| GOV-01 | Authoritative proposal path and hash are registered | M-F | BP; TASK | None | Source register with verified path/hash | DEC-001 | Owner-confirmed source record | Not implemented |
| GOV-02 | Product versions, milestones, branches, commits, PRs, and tags are distinct | M-F | BP; TASK; DEV | None | Version governance document | DEC-001 | Approved governance; no version-named branches | Not implemented |
| GOV-03 | V1.0 scope, users, mandatory and conditional capabilities are approved | M-F | BP; TASK | Implicit docs only | Scope document and decision record | DEC-001, DEC-015 | Signed scope | Not implemented |
| AUTH-01 | Clerk authentication with sign-in and sign-out | M-O | CPD; AF §5; ADR 0003 | Middleware only | Provider, sign-in/out, protected routes | CR-015 | Real-session and unauthenticated-denial tests | Synthetic scaffold only |
| AUTH-02 | Active employee link and provisioning | M-O | AF §5; ADR 0003 | Synthetic Stage B probe | Production employee link and provisioning flow | DEC-013 | Linked/unlinked/inactive/revoked tests | Synthetic preview |
| AUTH-03 | Employee deactivation and revocation | M-O | AF §5; SBS §4 | Probe denies inactive/revoked | Production lifecycle and prompt denial | DEC-013 | Deactivation and denial tests | Synthetic preview |
| AUTH-04 | Minimum role and permission enforcement | M-F | AF §5; PRR §6 | None | Role/permission schema and server checks | DEC-006 | Least-privilege, cross-scope, mass-assignment tests | Not implemented |
| AUTH-05 | Full role/permission administration | C | AF §5 | None | Admin UI and assignment workflows | DEC-006 | Assignment, revocation, SoD, negative tests | Not implemented |
| AUTH-06 | Session timeout and sign-out policy | M-O | CPD; AF §5 | None | Approved session behavior | CR-015 | Session expiry and sign-out tests | Not implemented |
| AUTH-07 | MFA and step-up | C | CPD; AF §5 | None | Configured only if approved | CR-015 | MFA/step-up evidence | Not implemented |
| ORG-01 | Configurable department registry foundation | M-F | CPD; AF §3; ADR 0005 | Navigation label only | Department schema and configuration mechanism | CR-001 | Registry, stability, ownership tests | Not implemented |
| ORG-02 | Department enable/disable without destroying history | M-O | ADR 0005; AF §3 | None | Configuration workflow and audit | CR-001, DEC-012 | Disable/history/authorization tests | Not implemented |
| ORG-03 | Departments do not own patient, encounter, money, stock, or audit | M-F | AF §3; ADR 0005 | Not applicable | Contract and FK boundaries | CR-001 | Boundary and ownership tests | Not implemented |
| ORG-04 | Initial department list, codes, and enabled states | C | BP; TASK | None approved | Load only after hospital approval | DEC-016 | Approved list and load record | Not started |
| PAT-01 | Persistent patient registration | M-O | CPD CD-01; ADR 0009; PRR §4 | Synthetic preview | PostgreSQL persistence and workflow | CR-002, CR-004 | Registration, duplicate, persistence tests | Synthetic preview |
| PAT-02 | Permanent unique hospital identifier | M-F | CPD; ADR 0009 | In-memory allocator | DB sequence, unique constraint, exhaustion handling | CR-004 | Concurrency, uniqueness, exhaustion tests | Synthetic preview |
| PAT-03 | Patient search | M-O | ADR 0009; PRR §4 | Synthetic search | DB-backed scoped search | CR-004, DEC-006 | Search, cap, scope tests | Synthetic preview |
| PAT-04 | Duplicate detection and mandatory review | M-O | ADR 0009; PRR §4 | Synthetic rules | Server-issued review reference and DB lookup | CR-004 | Duplicate, override, negative tests | Synthetic preview |
| PAT-05 | Pending and verified identity states | M-F | CPD CD-02/CD-04 | Synthetic status only | Approved verification workflow | CR-004 | State-transition tests | Synthetic preview |
| PAT-06 | Patient correction | C | AF §6; PRR §4 | None | Correction workflow, reason, audit | CR-004, DEC-011 | Correction/history/audit tests | Not implemented |
| PAT-07 | Patient merge and reversal | C | AF §6; CR-004 | None | Two-person merge, link repointing, reversal | CR-004, DEC-011 | Merge/reversal/linkage tests | Not implemented |
| PAT-08 | Longitudinal patient profile | M-F | CPD; AF §6 | Synthetic profile | Persistent patient identity and read profile | CR-004 | Profile and scope tests | Synthetic preview |
| ENC-01 | Encounter entity linked to exactly one patient | M-F | AF §6; CPD CD-03 | None | Encounter schema and patient FK | DEC-005 | Linkage and invalid-link tests | Not implemented |
| ENC-02 | Encounter classification, including emergency | M-F | CPD CD-03; CR-022 | None | Approved type/classification registry | DEC-005 | Classification tests | Not implemented |
| ENC-03 | Clinician and department participation links | M-F | AF §6; TASK | None | Participation links | DEC-005, CR-001 | Participation and authorization tests | Not implemented |
| ENC-04 | Minimal encounter create/view/close UI | C | BP; TASK | None | Basic workflow only if approved | DEC-005 | Create/view/close, audit, denial tests | Not implemented |
| ENC-05 | Full encounter and clinical workflow | D | AF §6-§7 | None | V1.1 | - | V1.1 evidence | Deferred |
| AUD-01 | Minimum durable sensitive-action audit | M-O | CPD CD-10; AF §12; PRR §6 | In-memory illustrative only | Audit schema, write path, basic restricted read | CR-009 | Actor/action/resource/reason tests | Illustrative only |
| AUD-02 | Append-only enforcement at database level | M-F | AF §12 | None | Update/delete denial | CR-009 | Update/delete denial tests | Not implemented |
| AUD-03 | Broader audit administration, retention, legal hold, delegated grants, tamper evidence | C | AF §12; PRR §6 | None | Only if approved; otherwise later | CR-009, DEC-014 | Retention, tamper, access tests | Not implemented |
| SEC-01 | Production schema and migrations | M-F | AF §14; PRR §6 | Probe schema only | V1.0 schema, migrations, rollback | Gate 4 | Migration and rollback evidence | Not implemented |
| SEC-02 | Transaction-scoped identity and approved RLS/defense-in-depth | M-F | ADR 0004; SBS §4 | Synthetic probe evidence | Production roles, grants, policies | CR-014 | Deny-by-default and role tests | Synthetic evidence |
| SEC-03 | Validation, idempotency, uniqueness, concurrency | M-F | PRR §6 | Partial in-memory | DB constraints and transaction tests | Gate 4 | Concurrency and idempotency tests | Partial |
| SEC-04 | No PHI in logs, URLs, browser storage, or errors | M-O | AF §13; PRR §6 | Preview guard only | Redaction and safe errors | Privacy review | Redaction and leakage tests | Not implemented |
| UX-01 | Coherent mandatory V1.0 workflows | M-O | TASK; AF §4 | Synthetic shell and patient UI | Role-aware mandatory flows | DEC-006 | UAT and workflow tests | Partial |
| UX-02 | Accessibility and usability acceptance | M-O | AF §4; PRR §6 | Partial | WCAG 2.2 AA evidence for mandatory flows | Design approval | Axe, manual, keyboard tests | Partial |
| OPS-01 | Local/CI checks do not use real data and do not expose secrets | M-F | DEV §2-§6 | Typecheck/test/build | Lint, security, secret, dependency checks | Hosting decision | CI and scan evidence | Partial |
| OPS-02 | Hosted/staging environment for pilot | C | DEV §2; PRR §6 | None | Hosting decision and environment | CR-016, DEC-015 | Environment, backup, and access evidence | Not implemented |
| OPS-03 | Release, rollback, and pilot approval | C | DEV §5-§8 | None | Runbook and approval | DEC-015 | Release/UAT records | Not implemented |

## 4. Conditional capability to milestone map

This table ensures every conditional requirement has matching conditional milestone scope and
exit criteria.

| Conditional requirement | Conditional milestone | Exit criteria if approved |
|---|---|---|
| PAT-06 Patient correction | M8-C | Correction recorded with reason, linked history, and audit |
| PAT-07 Patient merge and reversal | M8-C | Approved authority, two-person control, link repointing, reversal, audit |
| ENC-04 Minimal encounter UI | M9-C | Create/view/close, patient link, classification, participation, authorization, audit |
| AUTH-05 Full role administration | M10-C | Assign/revoke roles and scopes, SoD, negative access tests |
| AUTH-07 MFA and step-up | M4-C | Approved policy enforced and evidenced |
| ORG-04 Initial department list | M6-C | Hospital-approved list loaded with audit and rollback |
| AUD-03 Broader audit | M11-C | Retention, legal hold, delegated access, tamper evidence as approved |
| OPS-02 Hosted/staging environment | M3-C | Environment isolated, synthetic or de-identified data, access restricted |
| OPS-03 Release/rollback/pilot | M12-P | Release and rollback rehearsal, UAT, named approval |

## 5. Deferred requirements

| Requirement | Deferred to | Note |
|---|---|---|
| Full clinical operations | V1.1 | Includes consultation, notes, orders, results, diagnosis, triage |
| Billing and revenue | V1.2 | No financial workflow in V1.0 |
| Pharmacy, inventory, procurement | V1.3 | No stock or dispensing in V1.0 |
| Ward, nursing, emergency operations | V2.0 | Encounter foundation only in V1.0 |
| HMO and claims | V2.2 | Not in V1.0 |
| Staff and operational management beyond access foundations | V2.3 | Not in V1.0 |
| Reporting and BI | V3.0/V3.1 | Not in V1.0 |
| Offline and integrations | Unresolved | Requires placement in product-version governance |

## 6. Readiness statement

No requirement is production-ready. Synthetic preview evidence does not satisfy operational
acceptance, and no requirement is deployed to production.

## 7. Related documents

- [`V1_0_SCOPE.md`](V1_0_SCOPE.md)
- [`V1_0_SOURCE_REGISTER.md`](V1_0_SOURCE_REGISTER.md)
- [`../00-governance/V1_0_DECISION_AND_APPROVAL_REGISTER.md`](../00-governance/V1_0_DECISION_AND_APPROVAL_REGISTER.md)
- [`../02-architecture/V1_0_DOMAIN_FOUNDATIONS.md`](../02-architecture/V1_0_DOMAIN_FOUNDATIONS.md)
- [`../02-architecture/V1_0_AUDIT_FOUNDATION_BOUNDARY.md`](../02-architecture/V1_0_AUDIT_FOUNDATION_BOUNDARY.md)
- [`../03-delivery/V1_0_MILESTONE_AND_DEPENDENCY_PLAN.md`](../03-delivery/V1_0_MILESTONE_AND_DEPENDENCY_PLAN.md)
