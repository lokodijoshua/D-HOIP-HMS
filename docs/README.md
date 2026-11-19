# D-HOIP Documentation

This directory is the authoritative production documentation set for D-HOIP. It is separate from
the local-only AI knowledge base under `.local-ai/`.

## 1. Status of this documentation set

The documentation structure is **proposed** and under initialization review. Documents marked
`PROPOSED` are not approved. Approved decisions must name the approver, date, scope, and any
conditions.

No application implementation is authorized by any document in this repository, except the narrow
UI-shell, pinned-dependency, and CI authorization and the synthetic-only Patient Management M1
authorization recorded in
[`00-governance/STATUS_AND_APPROVAL.md`](00-governance/STATUS_AND_APPROVAL.md) sections 8 and 9. All
other implementation remains unauthorized.

Feature production readiness is tracked separately in the
[`00-governance/PRODUCTION_READINESS_REGISTER.md`](00-governance/PRODUCTION_READINESS_REGISTER.md).
That register is authoritative for whether a feature is a synthetic preview, a development
implementation, production-ready, or deployed to production. Tests, builds, and demonstrations do
not by themselves make a feature production-ready.

## 2. Source authority

Read [`00-governance/SOURCE_AUTHORITY.md`](00-governance/SOURCE_AUTHORITY.md) before using any
source. The hierarchy is:

1. Hospital-approved policy and requirements for hospital operational rules.
2. Explicit decisions confirmed by the project owner.
3. Approved ADRs for accepted technical decisions.
4. The target-state blueprint as the principal architectural proposal.
5. Danphe EMR as a functional and workflow reference only.
6. D-HOIP Demo V3 as a UI and workspace reference only.

Third-party references never override hospital requirements. Conflicts are recorded in
[`00-governance/CONFLICT_REGISTER.md`](00-governance/CONFLICT_REGISTER.md); they are not silently
resolved.

## 3. Status vocabulary

Read [`00-governance/STATUS_AND_APPROVAL.md`](00-governance/STATUS_AND_APPROVAL.md). The short
form is:

- **CONFIRMED** - stated by the hospital or project owner; still subject to formal recording.
- **APPROVED** - accepted by an authorized human with recorded evidence.
- **PROPOSED** - recommended but not approved.
- **ASSUMPTION** - believed true but unverified.
- **UNRESOLVED** - requires a decision, legal review, or evidence.
- **VALIDATION REQUIRED** - must be proven by test or spike evidence.
- **HISTORICAL** - retained for context; not current authority.
- **DEPRECATED** - not to be used for new work.

These labels describe documentation and approval status. They do not mean that a feature is
production-ready or deployed. Feature readiness is classified in the
[`00-governance/PRODUCTION_READINESS_REGISTER.md`](00-governance/PRODUCTION_READINESS_REGISTER.md).

## 4. Current production documents

| Document | Purpose | Status |
|---|---|---|
| `00-governance/SOURCE_AUTHORITY.md` | Source hierarchy and handling rules | Proposed |
| `00-governance/STATUS_AND_APPROVAL.md` | Status vocabulary, gates, approval evidence | Proposed |
| `00-governance/PRODUCTION_READINESS_REGISTER.md` | Authoritative feature production-readiness register and required evidence checklist | Governance register; no feature production approval |
| `00-governance/CONFLICT_REGISTER.md` | Consolidated conflicts and open decisions | Investigation register |
| `01-requirements/CONFIRMED_PROJECT_DIRECTION.md` | Owner-confirmed direction and its reconciliation status | Pending formal approval |
| `02-architecture/ARCHITECTURE_FOUNDATION.md` | Proposed architecture foundation across all domains | Proposed |
| `02-architecture/PATIENT_REGISTRY_M1.md` | Synthetic-only Patient Management M1 scope, identity fields, duplicate rules, and production guard | Approved synthetic preview scope |
| `03-delivery/DEVOPS_LIFECYCLE.md` | Proposed delivery, release, and operations lifecycle | Proposed |

## 5. Proposed documentation structure

The following structure is proposed. Directories are created only when they contain an approved
or actively reviewed document; empty placeholder directories are not created.

```text
docs/
  00-governance/        Source authority, status, approvals, conflicts, decision log
  01-requirements/      Hospital requirements, traceability, scope, confirmed direction
  02-architecture/      System, domain, security, data, UI, integration architecture
  03-adr/               Architecture Decision Records
  04-security/          Threat model, access control, privacy, audit, secure development
  05-data/              Conceptual data model, data dictionary, classification, retention
  06-design/            Design system, accessibility, workspace and content standards
  07-operations/        Environments, deployment, backup, incident response, monitoring
  08-delivery/          Gates, testing, release, change management, DevOps lifecycle
  09-references/        Source register, intake records, reference analysis
  10-status/            Current phase, open decisions, risks, readiness reports
```

## 6. Reading order

1. `README.md` (repository root)
2. `docs/README.md` (this file)
3. `00-governance/SOURCE_AUTHORITY.md`
4. `00-governance/STATUS_AND_APPROVAL.md`
5. `00-governance/PRODUCTION_READINESS_REGISTER.md`
6. `00-governance/CONFLICT_REGISTER.md`
7. `01-requirements/CONFIRMED_PROJECT_DIRECTION.md`
8. `02-architecture/ARCHITECTURE_FOUNDATION.md`
9. `03-delivery/DEVOPS_LIFECYCLE.md`

Then read only the documents relevant to the task. Do not load the entire documentation set
indiscriminately.

## 7. Approval gates

The proposed gate sequence is:

| Gate | Purpose |
|---|---|
| 0 | Discovery and reference review |
| 1 | Requirements and traceability |
| 2 | Architecture and ADR review |
| 3 | Security and permissions review |
| 4 | Data model and migration review |
| 5 | Implementation readiness |
| 6 | Testing and quality |
| 7 | Release and operational readiness |
| 8 | Post-release review |

An agent may prepare evidence and recommend an outcome. Only an authorized human may approve,
reject, waive, or accept risk.

## 8. Current phase and stop condition

Current phase: **initialization and foundation review**.

Outside the recorded scoped authorizations, work is limited to investigation, organization,
documentation, and environment foundation. Do not begin further application implementation,
install unapproved dependencies, create schemas or migrations, configure production services, or
commit/push/merge.

The exceptions are the scoped, owner-authorized UI shell and its CI checks, and the synthetic-only
Patient Management M1 preview with its approved Vitest tests, recorded in
[`00-governance/STATUS_AND_APPROVAL.md`](00-governance/STATUS_AND_APPROVAL.md) sections 8 and 9.
Authentication, production authorization, database work, RLS, persistent audit, real patient data,
operational clinical or financial workflows, external integrations, deployment, and
commit/push/merge remain unauthorized.
