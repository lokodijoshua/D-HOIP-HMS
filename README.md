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
architecture documentation, delivery standards, repository configuration, CI, a UI application
shell with synthetic demonstration data, and a synthetic-only Patient Management M1 preview. No
database schema, authentication configuration, operational clinical or financial workflow, external
integration, or production deployment exists yet.

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
| Theatre and specialist services | Theatre, maternity, ophthalmology, procurement, workforce, facilities, and patient-safety workflows as proposed operational workspaces. |

## Technology direction

The stack below is the documented direction. Only the UI shell and its CI checks are implemented;
the remaining rows describe direction or proposals, not completed work. Versions are pinned in
`package.json` and `package-lock.json`.

| Layer | Selected or proposed technology | Status |
|---|---|---|
| Application framework | Next.js App Router | Implemented in the UI shell (16.4.6) |
| UI runtime | React | Implemented in the UI shell (19.3.1) |
| Language | TypeScript | Implemented in the UI shell (5.9.3, strict) |
| Database | PostgreSQL | Selected direction; not provisioned |
| Data access and migrations | Drizzle ORM with SQL migrations | Selected direction; not installed or validated |
| Authentication | Clerk | Selected direction; not configured |
| Managed database infrastructure | Supabase-managed PostgreSQL | Selected direction; hosting and residency unresolved |
| UI and design system | Provisional CSS tokens and components; "Clinical Chart" direction | Tokens and components implemented provisionally; design system not approved |
| Source control | Git and GitHub | In use |
| Continuous integration | GitHub Actions | Whitespace check plus application typecheck, tests, and production build |
| Testing | Vitest, React Testing Library, pgTAP, Playwright, axe | Vitest installed for M1 domain/workflow tests; other tools proposed |
| Production hosting | Not selected | Unresolved |

No design system, production component library, typography scale, or database technology has been
validated. The UI shell and synthetic patient preview do not constitute approval of those
decisions.

## Implemented scope (synthetic preview)

The repository contains an application shell, a synthetic dashboard preview, and a synthetic-only
Patient Management M1 registry preview. It is a foundation preview, not a hospital system.

Implemented:

- Next.js App Router shell with a responsive sidebar, header, and mobile navigation drawer;
- a synthetic dashboard that clearly labels all figures as demonstration data;
- a synthetic patient directory, search-first registration, duplicate-candidate review, server-side
  duplicate recheck, `D2C-YYYY-NNNNNN` preview ID allocation, and patient profile;
- an in-memory synthetic patient repository and illustrative in-memory audit events;
- a production fail-closed guard for all patient routes and actions;
- provisional CSS design tokens, dashboard components, and a reduced-motion treatment;
- Vitest domain/workflow tests, TypeScript checking, and a production build configured in GitHub
  Actions.

The patient preview is not an operational registry. It cannot accept real patient data and is
disabled in production. See
[`docs/02-architecture/PATIENT_REGISTRY_M1.md`](docs/02-architecture/PATIENT_REGISTRY_M1.md).
Production readiness for this and every other feature is tracked in the
[`docs/00-governance/PRODUCTION_READINESS_REGISTER.md`](docs/00-governance/PRODUCTION_READINESS_REGISTER.md).
A passing test suite, successful build, or working demonstration does not make a feature
production-ready.

Not implemented or authorized by this scope:

- authentication, authorization, or staff accounts;
- database provisioning, schema, migrations, or Drizzle integration;
- operational patient registration, persistence, encounters, clinical, nursing, ward, laboratory,
  radiology, pharmacy, or theatre workflows;
- billing, payments, claims, HMO, or financial logic;
- real patient or hospital data;
- external integrations, hosting, deployment, or production operations.

See the scoped authorizations in
[`docs/00-governance/STATUS_AND_APPROVAL.md`](docs/00-governance/STATUS_AND_APPROVAL.md) sections 8
and 9.

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

The repository has one GitHub Actions workflow,
[`.github/workflows/ci.yml`](.github/workflows/ci.yml), named **D-HOIP CI**.

Current behavior:

- runs on pull requests targeting `main` and on pushes to all branches;
- requests only `contents: read` permissions;
- runs the **Whitespace and patch check** job, which applies `git diff --check` between the
  applicable base commit and `HEAD`; for pull requests the base is the pull request base SHA, and
  for pushes it is the previous commit; an initial push with no previous commit is checked against
  Git's empty tree; the check fails when the base commit is unavailable or whitespace or patch
  errors are detected;
- runs the **Application verification** job, which pins Node.js 24.22.3, installs dependencies with
  `npm ci`, and runs `npm run typecheck` and `npm run build`.

Branch protection and required-check enforcement are not defined in this repository. Whether they
are enabled for `main` cannot be verified from version-controlled files and is not asserted here.

Linting, unit and component tests, database and RLS tests, end-to-end tests, accessibility checks,
and dependency and secret scanning remain proposed and are not active.

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
├── src/
│   ├── app/
│   │   ├── (workspace)/
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── globals.css
│   │   └── layout.tsx
│   ├── components/
│   │   ├── dashboard/
│   │   └── shell/
│   └── lib/
│       ├── demo-data.ts
│       ├── navigation.ts
│       └── workspace-context.ts
├── .gitattributes
├── .gitignore
├── next.config.ts
├── next-env.d.ts
├── package-lock.json
├── package.json
├── tsconfig.json
└── README.md
```

## Getting started

Prerequisites: Node.js 24.22.3 for parity with CI (the manifest requires >=20.9.0) and npm.

```powershell
npm ci
npm run dev
```

Open `http://localhost:3000`. Only synthetic demonstration data is shown. No environment file,
database, authentication provider, or external service is required or configured.

| Script | Purpose |
|---|---|
| `npm run dev` | Start the local development server |
| `npm run build` | Create a production build |
| `npm run start` | Serve a production build |
| `npm run typecheck` | Run `tsc --noEmit` |

Linting and automated tests are not installed. See
[`docs/README.md`](docs/README.md) for the documentation map. Database setup and environment
configuration are not defined because no database or authentication work is authorized.

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
or operational, and automated application tests do not exist.

| Area | Status |
|---|---|
| Governance and requirements documentation | Available |
| Architecture foundation | Proposed for review |
| Delivery and operations lifecycle | Proposed for review |
| CI whitespace and patch check | Configured |
| CI application verification (typecheck and build) | Configured |
| Application scaffold | UI-only shell created |
| Dependencies and package manifest | Pinned in package.json and package-lock.json (Next.js, React, TypeScript) |
| Database schema and migrations | Not created |
| Authentication and authorization implementation | Not created |
| Clinical, billing, and integration workflows | Not created |
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
