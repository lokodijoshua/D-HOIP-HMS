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

Feature production readiness is tracked separately in
[`PRODUCTION_READINESS_REGISTER.md`](PRODUCTION_READINESS_REGISTER.md). No status label, test pass,
build, demonstration, or gate approval in this document makes a feature production-ready or
deployed to production. Those classifications require the register evidence and explicit human
approval.

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
| 3 | BLOCKED | Stage B synthetic RLS/helper and controlled real Clerk request evidence passed; production access matrix, MFA/step-up, broader adversarial testing, security review, and production RLS remain unresolved |
| 4 | BLOCKED | No approved production schema; Stage B probe is synthetic; money precision unresolved |
| 5 | BLOCKED | No Gate 5 implementation-readiness authorization; the scoped Stage B spike does not satisfy the gate |
| 6 | NOT STARTED | M1 unit tests and synthetic Stage B live tests exist; no full application test harness, production security evidence, or approved Gate 6 evidence exists |
| 7 | NOT STARTED | No deployment or operational readiness |
| 8 | NOT STARTED | No release |

Gate 5 remains BLOCKED. The authorization in §8 is a narrow, scoped implementation authorization
for a UI-only shell and its CI verification. It does not satisfy Gate 5 evidence, and it does not
advance any gate.

## 8. Recorded implementation authorization

The following scoped authorization was issued by the project owner, Joshua Lokodi, for the
existing UI-only application shell and its CI verification. It is recorded here because it
authorizes that existing shell implementation.

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

## 9. Recorded patient management M1 authorization

The following scoped authorization was issued by the project owner for a synthetic-only Patient
Management M1 preview. It is recorded here because it authorizes new patient-registry application
work.

```text
Decision / gate: Scoped implementation authorization - Patient Management M1 synthetic preview
Decision ID: AUTH-PATIENT-M1-001
Status: APPROVED WITH CONDITIONS
Approver role: Project owner
Approver name: Joshua Lokodi
Date: 2026-11-19
Scope:
  - a synthetic-only Patient Management M1 preview in the existing Next.js App Router application,
    including:
      1. a patient directory with capped search;
      2. search-first registration;
      3. duplicate-candidate review before registration;
      4. server-side duplicate recheck at registration time;
      5. hospital patient ID allocation in the approved format D2C-YYYY-NNNNNN;
      6. a patient profile using the internal UUID as its route identifier;
      7. a server-side in-memory synthetic patient repository;
      8. illustrative in-memory audit events;
      9. automated domain and workflow tests;
     10. navigation integration and visible synthetic-preview warnings;
  - patient identity and data fields limited to family, given, middle and preferred names; name
    completeness/status; sex; exact date of birth or estimated age with unit and as-of date;
    primary and secondary phones; email; address lines, city, Nigerian state/FCT and postal code;
    next-of-kin name, relationship and phone; a basic pending/verified identity status;
    registration timestamp and a synthetic registering-user placeholder;
  - the simple permanent-format hospital ID D2C-YYYY-NNNNNN, where YYYY is the registration year in
    Africa/Lagos and NNNNNN is a six-digit monotonically increasing yearly sequence; no check
    character;
  - an internal UUID for application routes and record identity;
  - install of the approved Vitest development dependency and the minimum test configuration;
  - update of the existing application CI verification job to run the Vitest test command in
    addition to npm run typecheck and npm run build, preserving existing CI permissions and pinned
    action versions;
  - the focused architecture document docs/02-architecture/PATIENT_REGISTRY_M1.md and the minimum
    README update needed to describe the preview accurately.
Conditions:
  - this is a synthetic demonstration only and must never be used with real patient data or PHI;
  - patient routes and all patient registration, read and write actions must fail closed based
    unconditionally on the production runtime; no environment variable or configuration switch may
    enable the feature in production;
  - the in-memory repository is a preview mechanism only and provides no production-safe
    concurrency, durability or cross-instance uniqueness;
  - the in-memory audit events are illustrative and do not constitute a compliant, tamper-proof or
    append-only audit trail;
  - no browser local storage, session storage, cookies or other browser persistence may hold
    patient records;
  - no database, API integration, external service, real authentication, production permission
    enforcement, RLS or persistent audit is authorized;
  - no patient correction, merge or deletion workflow is authorized;
  - no encounter, clinical, nursing, ward, billing, payments, claims, HMO, allergy, alert, payer,
    insurance, guarantor, consent or document-upload workflow is authorized;
  - no Registry department may be created; department ownership remains subject to the existing
    unresolved governance decisions;
  - real patient or hospital data remains unauthorized;
  - external integrations and production deployment remain unauthorized;
  - committing, pushing, opening a pull request, and merging remain unauthorized without a separate
    instruction;
  - Gate 5 remains BLOCKED, and this record does not approve any gate or future capability;
  - production authentication, authorization, PostgreSQL persistence, RLS and persistent audit
    remain blocked pending their own approvals and infrastructure readiness.
Evidence links: Project-owner instruction "D-HOIP - Implement Patient Management M1", received
2026-11-19, approving the M1 proposal with the simple D2C-YYYY-NNNNNN patient ID format.
Expiry or review date: Review when M1 is accepted or superseded; no standing authorization.
Risk accepted: Synthetic preview only. No production use or real patient data.
```

## 10. Recorded M2 Stage B authentication and database security spike authorization

The following scoped authorization was issued by the project owner for a bounded, non-production
Stage B security spike. It is recorded here because it authorizes authentication, database, and RLS
scaffolding that earlier records did not authorize.

```text
Decision / gate: Scoped implementation authorization - M2 Stage B authentication and database security spike
Decision ID: AUTH-M2-STAGE-B-001
Status: APPROVED WITH CONDITIONS
Approver role: Project owner
Approver name: Joshua Lokodi
Date: 2026-11-21
Scope:
  - install pinned Clerk, Drizzle ORM, Drizzle Kit, and postgres dependencies compatible with the
    existing Next.js 16.4.6, React 19.3.1, and Node.js 24.22.3 foundation;
  - add Next.js proxy.ts Clerk middleware integration;
  - add a server-only Clerk session verification and employee-link authentication boundary;
  - add a Drizzle client and transaction helper that sets transaction-local claims and
    SET LOCAL ROLE authenticated;
  - add non-patient, synthetic Stage B probe tables and RLS policies for employee-link and
    ownership checks;
  - add unit tests and a gated live database/RLS check;
  - add a non-production, production-disabled probe route;
  - add .env.example placeholders without secrets;
  - add Stage B architecture, authorization, readiness, and README documentation.
Conditions:
  - no real patient, hospital, employee, or production data;
  - no patient tables, patient workflows, production employee/role schema, or authorization matrix;
  - no Clerk provider, sign-in UI, shared UI change, or production authentication configuration;
  - no Supabase project, Clerk application, credentials, service-role key, or external service is
    created or configured by this authorization;
  - the runtime database role must be dedicated, non-owner, and NOBYPASSRLS;
  - the runtime must not use a service-role key or auth.uid();
  - RLS remains proposed and unvalidated until the live probe and review evidence exist;
  - live Supabase/RLS tests and live Clerk-session proof are not satisfied by mocked unit tests;
  - Data API exposure must be verified separately and is not claimed;
  - production routes remain fail-closed; the probe route returns 404 in production;
  - committing, pushing, opening a pull request, and merging remain unauthorized without a separate
    instruction;
  - Gate 3, Gate 4, Gate 5, and all other gates remain BLOCKED; this record does not approve a gate
    or production readiness.
Evidence links: Project-owner instruction "D-HOIP - Implement M2 Stage B Authentication and Database
Security Spike", received 2026-11-21; docs/02-architecture/STAGE_B_DATABASE_SECURITY_SPIKE.md.
Expiry or review date: Review when Stage B live evidence is reviewed or the spike is superseded. No
standing authorization.
Risk accepted: Non-production synthetic security scaffolding only. No production use, real data, or
claim that RLS is validated.
```

## 11. Current Stage B evidence status

**Status:** Development implementation / security spike. **NOT PRODUCTION READY.**
**No gate is approved or advanced by this status note.**

Evidence recorded on 2026-11-21 and 2026-11-22:

- The synthetic `dhoip` probe was applied to the development Supabase project.
- The runtime uses the Session Pooler with TLS, port 5432, and the dedicated `dhoip_app` role.
- `dhoip_app` is LOGIN, NOINHERIT, NOBYPASSRLS, not superuser, and a member of `authenticated`.
- The `dhoip` schema and both probe tables are owned by `postgres`; both tables have RLS enabled and
  forced.
- The two SELECT policies scope employee-link access to the Clerk JWT `sub`, and the probe-resource
  policy additionally requires an active employee link.
- The status constraint permits exactly `active`, `inactive`, and `revoked`.
- The gated live suite previously passed 9 of 9 tests: five raw-connection PostgreSQL/RLS tests and
  four tests using the actual `withAuthenticatedTransaction` and `requireActiveStageBEmployee`
  boundary. It was not rerun during the real-session request task.
- Actual-helper evidence confirms `session_user=dhoip_app`, `current_user=authenticated`,
  transaction-local JWT subject propagation, own-subject and cross-subject isolation,
  inactive/revoked/unlinked denial, callback error propagation, and cleared transaction context.
- The proxy was relocated from root-level `proxy.ts` to `src/proxy.ts` with contents preserved
  (SHA-256 `1A89805B67E3ED1A768B673320724CA546E5D361ED98BC0532F4D2CAD9DAFA2A`); the compiled
  middleware entry and live request log confirm proxy execution.
- A controlled real Clerk development-session request to `GET /api/stage-b/probe` returned `200`,
  exactly one `stage-b-clerk-session-test-resource` row, and no unrelated rows; the session was
  revoked successfully.
- All six diagnostic phases were emitted: `route_handler_entered`,
  `run_as_active_employee_entered`, `clerk_subject_verified`,
  `database_transaction_callback_entered`, `active_employee_link_verified`, and
  `probe_resource_query_completed`.
- The operator reports that the reviewed atomic cleanup transaction removed the two temporary
  Clerk-session fixtures after execution as `postgres`, deleting the probe-resource fixture before
  the employee-link fixture, with exact identity and post-deletion checks. This is operator-reported
  and was not independently verified against live database state.
- The real-session request test is not immediately repeatable without recreating the approved
  temporary fixtures; seeded probe fixtures remain separate.
- Unit tests: 68 passed with the live gate disabled; 9 live tests skipped. Typecheck and production
  build passed. Lint is not configured. `git diff --check` passed.
- Data rollback is not proven because the tests perform no persistent writes; transaction-context
  rollback is proven.
- `runAsActiveEmployee` was exercised through the controlled real Clerk development-session
  request. It obtains only the server-verified Clerk `userId`, calls the same authenticated
  transaction helper, and checks active employee status before the protected callback.

Remaining conditions:

- recreation of approved temporary fixtures if the real-session request test is to be repeated;
- independent verification of live post-cleanup state if required;
- interactive browser sign-in, a Clerk provider/sign-in UI, MFA, session tasks, and broader
  adversarial token/session testing;
- production authorization, employee, role, permission, and department models;
- an approved data-rollback proof if required;
- Data API exposure decision;
- transaction-pooler/helper evidence if that mode is used;
- durable audit, backup/restore, monitoring, deployment, and operational evidence;
- human security/privacy review and explicit approval.

Next approval boundary: Stage B evidence may be reviewed under Gate 3 (security and permissions) and
Gate 4 (data model and migration). Gates 3, 4, 5, and all later gates remain **BLOCKED**. RLS is
validated only for the synthetic Stage B probe; it is not production-validated.

Evidence: [`../02-architecture/STAGE_B_DATABASE_SECURITY_SPIKE.md`](../02-architecture/STAGE_B_DATABASE_SECURITY_SPIKE.md).

## 12. V1.0 documentation preparation status

**Status:** DOCUMENTATION PREPARATION AUTHORIZED - NOT AN IMPLEMENTATION, GATE, PILOT, OR PRODUCTION
APPROVAL.
**Decision ID:** `AUTH-V1-0-DOCS-001`.
**Approver role:** Project owner.
**Approver name:** Not recorded in the 2026-11-22 instruction.
**Date:** 2026-11-22.
**Scope:** create the nine proposed V1.0 documentation files and update the seven listed existing
documentation/governance files, after incorporating the approved corrections.
**Conditions:**

- documentation only;
- no application source, schema, migration, dependency, package, CI, infrastructure, or deployment
  change;
- no branch switch, commit, push, PR, merge, reset, clean, stash, or overwrite;
- no build or file-regenerating command;
- no hospital policy or unresolved decision is approved;
- every V1.0 document remains `PROPOSED` unless separately approved.

**Evidence links:** project-owner instruction "D-HOIP — V1.0 Scope, Requirements and Traceability
Pack", received 2026-11-22, incorporating the corrections on source authority, scope, domain
boundaries, milestones, and decisions.
**Expiry or review date:** review when the V1.0 documentation pack is approved or superseded.
**Risk accepted:** documentation risk only. No production, clinical, financial, or real-data risk is
accepted.

Gate status is unchanged. Gate 1 evidence is in preparation, but Gate 1 is not approved. Gates 0-5
remain blocked to the extent recorded in section 7, and Gates 6-8 remain not started.

## 13. Related documents

- `docs/00-governance/SOURCE_AUTHORITY.md`
- `docs/00-governance/PRODUCTION_READINESS_REGISTER.md`
- `docs/00-governance/CONFLICT_REGISTER.md`
- `docs/00-governance/V1_0_DECISION_AND_APPROVAL_REGISTER.md`
- `docs/01-requirements/PRODUCT_VERSION_GOVERNANCE.md`
- `docs/01-requirements/V1_0_SCOPE.md`
- `docs/03-delivery/V1_0_MILESTONE_AND_DEPENDENCY_PLAN.md`
- `docs/03-delivery/DEVOPS_LIFECYCLE.md`
- `.local-ai/instructions/approval-gates.md`
