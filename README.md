# Dare2Care Hospital Operating & Intelligence Platform (D-HOIP)

D-HOIP is a hospital-specific Hospital Management System (HMS) and Electronic Medical Records
(EMR) platform designed for one private hospital in Nigeria. It is not a multi-tenant SaaS
product.

**Project owner:** ColorX

## Overview

D-HOIP is intended to give a single hospital one coordinated system for patient identity,
clinical care, administration, finance, and operational reporting. The platform is being designed
around one central patient record and one set of auditable workflows rather than department-local
copies of patient, financial, or inventory data.

The repository is currently in an engineering foundation phase. It contains governance and
architecture documentation, delivery standards, repository configuration, and a minimal CI
workflow. No application code, database schema, authentication configuration, or production
deployment exists yet.

## Vision and objectives

D-HOIP aims to:

- maintain one central patient identity across encounters and departments;
- connect clinical, nursing, emergency, inpatient, pharmacy, laboratory, radiology, and financial
  workflows;
- keep clinical authorization separate from financial clearance;
- ensure emergency clinical care is never delayed by payment;
- support manual payment, HMO, claims, and reconciliation operations without requiring external
  integrations;
- enforce least privilege and server-side authorization for individual staff accounts;
- preserve auditable clinical, financial, and security history;
- give the hospital's Director complete financial audit authority;
- avoid claiming that a capability is implemented or validated until evidence exists.

These are product objectives, not statements of completed functionality.

## Planned scope and functional domains

The following domains form the planned system scope. They are not implemented modules.

| Domain | Planned scope |
|---|---|
| Patient registry and administration | Central patient identity, registration, encounters, duplicate review, and identity-verification states. |
| Doctor and clinical workflows | Consultation, clinical requests, results, and notes within a shared patient record. |
| Nursing and ward management | Nursing workspaces, medication administration records, observations, ward occupancy, and inpatient care. |
| Emergency and inpatient workflows | Emergency as an encounter classification, central registration of unidentified patients, triage, admission, and ward flow. |
| Billing, payments, and financial management | Manual cash, POS, transfer, and HMO payment recording; verification, confirmation, allocation, receipts, reversals, and reconciliation. |
| Laboratory and radiology | Request and result workflows, released-only department queues, verification, and critical-result handling. |
| Pharmacy and inventory | Prescription review, costing, paid-quantity dispensing, stock movements, batches, expiry, recalls, and controlled medicines. |
| HMO and claims | Manual enrollment, coverage checks, claim lifecycle, receivables, remittances, and reconciliation without an API dependency. |
| Theatre and other departments | Theatre, maternity, ophthalmology, procurement, workforce, facilities, and patient-safety workflows as proposed operational modules. |

## Technology direction

The stack below is the documented direction. No application dependency is installed, and no stack
component has been validated in this repository.

| Layer | Selected or proposed technology | Status |
|---|---|---|
| Application framework | Next.js App Router | Selected direction; not installed or validated |
| UI runtime | React | Selected direction; not installed |
| Language | TypeScript | Selected direction; not installed |
| Database | PostgreSQL | Selected direction; not provisioned |
| Data access and migrations | Drizzle ORM with SQL migrations | Selected direction; subject to validation |
| Authentication | Clerk | Selected direction; not configured |
| Managed database infrastructure | Supabase-managed PostgreSQL | Selected direction; hosting and residency unresolved |
| UI and design system | "Clinical Chart" design system and role workspaces | Proposed; component library and design tokens unresolved |
| Source control | Git and GitHub | In use |
| Continuous integration | GitHub Actions | Configured for whitespace and patch checks |
| Testing | Vitest, React Testing Library, pgTAP, Playwright, axe | Proposed; not installed |
| Production hosting | Not selected | Unresolved |

No versions are stated because no runtime or dependency version has been selected or validated.
The production component library, typography, and design tokens also remain unresolved.

## Architecture overview

D-HOIP is intended to be a modular monolith: one deployable application, one PostgreSQL database,
and clear domain boundaries within a single codebase. Shared platform capabilities are expected to
provide:

- one central patient identity and encounter model;
- one clinical request lifecycle;
- one financial ledger and one inventory ledger;
- one authorization model and one audit infrastructure;
- typed internal contracts between modules.

Department and operational modules consume shared capabilities through contracts. They must not
create independent copies of patient identity, money, or stock, and core capabilities must not
depend on department modules.

The proposed architecture places authorization behind a server-side trust boundary. Authorization
is intended to be enforced on the server with deny-by-default, least-privilege rules, with
employee, role, permission, and department records owned by D-HOIP rather than Clerk. Clerk is the
selected authenticator; authentication alone does not grant hospital permissions.

Clinical authorization and financial clearance are deliberately separate concerns. The proposed
financial design uses an append-only ledger with reversals instead of destructive edits. Audit
records are intended to be append-only and protected from alteration or deletion.

PostgreSQL row-level security is a proposed defense-in-depth measure. It has not been implemented
or validated, and the database access model remains subject to a technical validation spike.

## Development and CI

The intended development workflow uses short-lived branches and pull requests into `main`. Changes
should be reviewed before merge; direct commits to `main` are not part of the documented workflow.

The repository currently has one GitHub Actions workflow,
[`.github/workflows/ci.yml`](.github/workflows/ci.yml), named **D-HOIP CI**.

Current behavior:

- runs on pull requests targeting `main` and on pushes to all branches;
- requests only `contents: read` permissions;
- checks out full Git history with persisted credentials disabled;
- runs the **Whitespace and patch check** job;
- uses `git diff --check` between the applicable base commit and `HEAD`;
- for pull requests, the base is the pull request base SHA; for pushes, it is the previous commit;
- for an initial push with no previous commit, checks the full tree against Git's empty tree;
- fails when the base commit is unavailable or when whitespace or patch errors are detected.

Branch protection and required-check enforcement are not defined in this repository. Whether they
are enabled for `main` cannot be verified from version-controlled files and is not asserted here.

The broader CI pipeline is planned, not active. Future checks are expected to include dependency
installation from a lockfile, type checking, linting, unit and component tests, database and RLS
tests, end-to-end tests, accessibility checks, dependency and secret scanning, and build
verification. No application pipeline can run until an application foundation exists.

## Repository structure

```text
.
├── .github/
│   └── workflows/
│       └── ci.yml
├── docs/
│   ├── 00-governance/
│   │   ├── CONFLICT_REGISTER.md
│   │   ├── SOURCE_AUTHORITY.md
│   │   └── STATUS_AND_APPROVAL.md
│   ├── 01-requirements/
│   │   └── CONFIRMED_PROJECT_DIRECTION.md
│   ├── 02-architecture/
│   │   └── ARCHITECTURE_FOUNDATION.md
│   ├── 03-delivery/
│   │   └── DEVOPS_LIFECYCLE.md
│   └── README.md
├── .gitattributes
├── .gitignore
└── README.md
```

## Getting started

The repository currently contains documentation, repository configuration, and CI only. There is
no application scaffold, package manifest, database schema, environment template, or runnable
service.

No application prerequisites or setup commands are defined yet. Clone the repository and start
with [`docs/README.md`](docs/README.md) for the documentation map. Installation, local
development, database setup, and environment configuration instructions will be added when the
application foundation is approved and created.

## Engineering standards

- Treat hospital information as confidential and use synthetic or de-identified data outside
  production.
- Do not place PHI in logs, URLs, browser storage, fixtures, screenshots, or AI prompts.
- Use individual staff accounts and enforce authorization on the server with least privilege.
- Never commit secrets, credentials, production data, or local environment files to Git.
- Submit changes through review and the available CI checks.
- Record significant architecture and delivery decisions before implementation.
- Design and test clinical, financial, and authorization invariants rather than relying on
  assumptions.
- Preserve clinical, financial, and audit history; corrections are recorded, not silently deleted.

## Project status

**Phase:** initialization and foundation review. The platform is not deployed, production-ready,
tested, or operational.

| Area | Status |
|---|---|
| Governance and requirements documentation | Available |
| Architecture foundation | Proposed for review |
| Delivery and operations lifecycle | Proposed for review |
| CI whitespace and patch check | Configured |
| Application scaffold | Not created |
| Dependencies and package manifest | Not created |
| Database schema and migrations | Not created |
| Authentication and authorization implementation | Not created |
| Automated application tests | Not created |
| Hosting, deployment, and backups | Not selected or configured |
| Production readiness | Not established |
| License | Not established |

Open decisions include the final department registry, patient identifier and merge rules, payment
and ledger model, pharmacy quantity rules, Director audit access, RLS validation, and hosting and
data residency. These are tracked in the
[conflict register](docs/00-governance/CONFLICT_REGISTER.md).

## Documentation

[`docs/README.md`](docs/README.md) is the entry point to the production documentation set.

- [Source authority](docs/00-governance/SOURCE_AUTHORITY.md)
- [Status and approval model](docs/00-governance/STATUS_AND_APPROVAL.md)
- [Conflict and open decision register](docs/00-governance/CONFLICT_REGISTER.md)
- [Confirmed project direction](docs/01-requirements/CONFIRMED_PROJECT_DIRECTION.md)
- [Architecture foundation](docs/02-architecture/ARCHITECTURE_FOUNDATION.md)
- [DevOps lifecycle proposal](docs/03-delivery/DEVOPS_LIFECYCLE.md)

## License

No license file is present. Licensing has not yet been established, and no open-source license is
granted or implied.
