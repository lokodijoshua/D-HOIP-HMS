# Status and Approval

**Status:** PROPOSED governance rule. Pending human ratification.
**Purpose:** define status vocabulary, approval authority, gate evidence, and the rule that an agent
cannot approve its own work.

## 1. Status vocabulary

Every substantive statement in D-HOIP documentation should carry one of these labels.

| Status | Meaning | Who may set it |
|---|---|---|
| CONFIRMED | Stated by the hospital or project owner. Still requires formal recording where a gate or ADR is affected. | Hospital authority or project owner |
| APPROVED | Accepted by an authorized human with recorded role, date, scope, and conditions. | Authorized human only |
| PROPOSED | Recommended by the architect or agent; not approved. | Architect or agent |
| ASSUMPTION | Believed true but not verified; must be validated or accepted as risk. | Architect or agent, with owner identified |
| UNRESOLVED | Requires a decision, legal review, or further evidence. | Anyone may record; only authority closes it |
| VALIDATION REQUIRED | Must be proven by a test, spike, restore drill, or other evidence before reliance. | Architect, security, or engineering |
| DRAFT | Work in progress; not approved. | Author |
| HISTORICAL | Retained for context; not current authority. | Documentation owner |
| DEPRECATED | Not to be used for new work; retained for traceability. | Documentation owner |
| REJECTED | Considered and not selected. | Authorized human |
| DEFERRED | Deliberately not now; requires a future decision. | Project owner |
| WAIVED | Skipped only by authorized human approval with justification, risk acceptance, and expiry. | Authorized human only |

Status is not the same as implementation evidence. A feature is not "implemented" because a
document says it should exist, and it is not "validated" because a design says it will work.

## 2. Approval classes

| Class | Meaning | Typical approver |
|---|---|---|
| HOSPITAL-APPROVAL | Hospital operational rule, role, workflow, or policy | Director or named hospital lead |
| OWNER-APPROVAL | Project direction, scope, priority, or trade-off | Project owner |
| ADR-APPROVAL | Accepted technical decision | Architecture authority with project-owner acceptance |
| LEGAL-DPO | Lawful basis, privacy, retention, cross-border transfer, licensing | Legal counsel / DPO |
| SECURITY-APPROVAL | Threat model, access model, security controls, risk acceptance | Security lead |
| CLINICAL-APPROVAL | Clinical workflow, documentation, triage, results, safety | Medical / Nursing lead |
| FINANCE-APPROVAL | Payment, ledger, audit access, approval limits, reconciliation | Director / Finance |
| TECH-VALIDATION | Compatibility, RLS, restore, migration, performance evidence | Engineering / Security with evidence |
| ENGINEERING-REVIEW | Code, design, test, migration, and documentation review | Engineering lead |

An approval only covers the scope, version, and conditions recorded. It does not imply approval of
later changes.

## 3. Gate sequence

| Gate | Name | Required evidence | Approval responsibility |
|---|---|---|---|
| 0 | Discovery and reference review | Source register, integrity, licence status, scope, conflicts | Project owner + engineering |
| 1 | Requirements and traceability | Traceable requirements with status and source citations | Hospital authority + project owner |
| 2 | Architecture and ADR review | Architecture proposal, ADR set, module boundaries, alternatives | Architecture authority + project owner |
| 3 | Security and permissions review | Threat model, access matrix, SoD, break-glass, data protection | Security lead + clinical/finance leads |
| 4 | Data model and migration review | Conceptual/logical model, constraints, RLS plan, migration and rollback plan | Engineering + security + data owner |
| 5 | Implementation readiness | Approved scope, plan, test strategy, rollback, dependencies, environments | Engineering lead + project owner |
| 6 | Testing and quality | Unit/integration/E2E/security/accessibility evidence, negative authorization tests | Engineering + security |
| 7 | Release and operational readiness | Deployment plan, backup/restore evidence, monitoring, incident response, UAT | Project owner + operations + security |
| 8 | Post-release review | Outcomes, incidents, metrics, lessons, residual risk | Project owner + hospital sponsor |

## 4. Gate status values

- NOT STARTED
- IN PROGRESS
- BLOCKED
- AWAITING APPROVAL
- APPROVED
- APPROVED WITH CONDITIONS
- REJECTED
- WAIVED

An agent may set `IN PROGRESS`, `BLOCKED`, or `AWAITING APPROVAL` while preparing evidence. Only an
authorized human may set `APPROVED`, `APPROVED WITH CONDITIONS`, `REJECTED`, or `WAIVED`.

## 5. Approval record template

```text
Decision / gate:
Decision ID:
Status:
Approver role:
Approver name:
Date:
Scope:
Conditions:
Evidence links:
Expiry or review date:
Risk accepted (if any):
```

## 6. Agent and self-approval rules

1. An agent must never approve its own implementation, design, test evidence, ADR, or gate.
2. An agent must never bypass or retroactively approve a gate.
3. An agent may prepare evidence and recommend an outcome only.
4. An agent must keep missing approvals visibly missing.
5. A skipped gate requires written justification, documented risk, explicit human approval by the
   accountable role, and a recorded expiry or follow-up.
6. A waiver does not approve implementation beyond its recorded scope.
7. If evidence is missing or contradictory, the gate remains blocked.

## 7. Current gate status

| Gate | Status | Reason |
|---|---|---|
| 0 | IN PROGRESS / BLOCKED | Sources located but policy is unsigned; Demo V3 licence unresolved; no hospital workshop records; source register was stale |
| 1 | BLOCKED | Requirements are not approved; department/ownership/identity decisions unresolved |
| 2 | BLOCKED | Department registry, registration/billing ownership, and identity reconciliation unresolved |
| 3 | BLOCKED | RLS unvalidated; MFA/step-up unresolved; permissions matrix not approved |
| 4 | BLOCKED | No approved schema; Stage B spike not executed; money precision unresolved |
| 5 | BLOCKED | No implementation authorization |
| 6 | NOT STARTED | UI-only application shell exists; no automated application test harness has been established |
| 7 | NOT STARTED | No deployment or operational readiness |
| 8 | NOT STARTED | No release |

Gate 5 remains BLOCKED. The authorization in §8 is a narrow, scoped implementation authorization
for a UI-only shell and its CI verification. It does not satisfy Gate 5 evidence, and it does not
advance any gate.

## 8. Recorded implementation authorization

The following scoped authorization was issued by the project owner, Joshua Lokodi, for the
existing UI-only application shell and its CI verification. It is recorded here because it is the
only application implementation authorized in this repository.

```text
Decision / gate: Scoped implementation authorization - existing UI foundation and CI only
Decision ID: AUTH-UI-SHELL-001
Status: APPROVED WITH CONDITIONS
Approver role: Project owner
Approver name: Joshua Lokodi
Date: 2026-11-16
Scope:
  - the existing UI-only application shell in src/ including the dashboard preview, the bounded
    corrections to active navigation, mobile drawer lifecycle, header context, provisional
    design-foundation wording, and department/service navigation terminology, and the following
    eight approved corrections to that existing shell:
      A. mobile drawer stacking, so the native modal dialog and its backdrop correctly cover the
         sticky header;
      B. sidebar scrolling with a pinned footer and a discoverable scroll affordance;
      C. navigation trigger accessibility state that tracks the drawer;
      D. responsive operational-table overflow handling, sticky Reference column, and scroll
         indication;
      E. minimum functional typography sizing;
      F. removal of decorative planned indicators;
      G. simplification of planned-state announcements for assistive technology;
      H. conditional operational-table keyboard focusability;
  - reduced-motion handling for existing non-essential transitions;
  - README and project-status reconciliation for the implemented UI shell;
  - the pinned application dependencies: Next.js 16.4.6, React 19.3.1, React DOM 19.3.1,
    TypeScript 5.9.3, @types/node 24.19.2, @types/react 19.3.0, @types/react-dom 19.3.0, and the
    committed npm lockfile (package-lock.json);
  - the application CI checks npm run typecheck and npm run build.
Conditions:
  - this authorization covers the existing shell and CI work only; it does not authorize new UI
    features or further application capabilities;
  - authentication and authorization implementation remain unauthorized;
  - database provisioning, schema, and migrations remain unauthorized;
  - patient, encounter, clinical, nursing, and ward workflows remain unauthorized;
  - real patient or hospital data remain unauthorized;
  - billing, payments, claims, and financial logic remain unauthorized;
  - external integrations and production deployment remain unauthorized;
  - committing, pushing, opening a pull request, and merging remain unauthorized without a
    separate instruction;
  - Gate 5 remains BLOCKED, and no future gate is approved by this record;
  - CSS tokens and components remain a provisional UI foundation, not an approved design system.
Evidence links: Project-owner instruction for the "Final Pre-Staging Corrections" task, received
2026-11-16, and the prior "Application Shell Corrections and CI Foundation" instruction.
Expiry or review date: Review when the shell corrections are reviewed. No standing authorization.
Risk accepted: None recorded beyond the stated limitations.
```

## 9. Related documents

- `docs/00-governance/SOURCE_AUTHORITY.md`
- `docs/00-governance/CONFLICT_REGISTER.md`
- `docs/03-delivery/DEVOPS_LIFECYCLE.md`
- `.local-ai/instructions/approval-gates.md`
