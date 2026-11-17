# DevOps Lifecycle Proposal

**Status:** PROPOSED. Pending project-owner, engineering, security, and operations approval.
**Scope:** delivery governance. No repository, environment, service, credential, or deployment is
created or configured by this document.

## 1. Principles

1. Controls before screens; evidence before release.
2. Small, reversible changes with a rollback path.
3. Server-side authorization and audit are part of correctness, not release polish.
4. Production credentials never reach local development, CI, or AI tools.
5. Synthetics or de-identified data outside production; never real patient data.
6. No migration or schema change without review, backup, and rollback planning.
7. An agent may prepare evidence; only an authorized human approves a gate or release.

## 2. Environments

| Environment | Purpose | Data | Access | Notes |
|---|---|---|---|---|
| Local | Development and tests | Synthetic only | Developer workstation | No production credentials |
| CI | Automated checks | Ephemeral synthetic | CI identity | No persistent data |
| Staging | Pre-production validation and UAT | Synthetic or de-identified | Named staff | Isolated from production |
| Production | Hospital operations | Real; restricted | Least privilege; named accounts | Release approval required |

Environment separation must prevent accidental cross-environment access. Production secrets and
data must never be copied into local or CI.

## 3. Branch strategy

**Proposed trunk-based flow with short-lived feature branches.**

| Branch | Purpose | Rules |
|---|---|---|
| `main` | Always releasable; protected | No direct pushes; required review and green CI |
| `feature/<ticket>-<slug>` | One scoped change | Short-lived; rebase or merge from `main`; delete after merge |
| `fix/<ticket>-<slug>` | Defect correction | Same rules as feature |
| `docs/<slug>` | Documentation-only change | Same review rules; no application code |
| `release/<version>` | Optional release stabilization | Only when a release train is approved; no new scope |
| `hotfix/<ticket>` | Emergency production correction | Requires incident reference and post-review |

No long-lived `develop` branch is proposed. No direct commits to `main`. No force-push to protected
branches. No merge without review.

## 4. Commit conventions

Use Conventional Commits with a scope where useful:

```text
<type>(<scope>): <short imperative summary>

<body: why, not just what>

<footer: references, risk, migration, tests>
```

Allowed types: `feat`, `fix`, `docs`, `test`, `refactor`, `perf`, `build`, `ci`, `chore`,
`security`. Examples:

```text
docs(governance): add source authority hierarchy
feat(identity): add duplicate review state (not yet approved)
test(payment): prove capture is not confirmation
```

Rules:

- One logical change per commit.
- Do not commit generated artifacts, dependencies, secrets, real patient data, or local AI material.
- Reference the gate, ADR, issue, or decision where applicable.
- Never claim a control works in a commit message without evidence.
- Never commit `.local-ai/`, `AGENTS.md`, or `.opencode/skills/`.

## 5. Pull requests and approvals

Every change enters through a pull request.

| Change type | Required review | Additional approval |
|---|---|---|
| Documentation | One engineering or documentation reviewer | Governance owner if it changes authority or policy |
| Application code | One engineering reviewer | Domain owner for clinical/financial behavior |
| Security-sensitive code | Engineering + security reviewer | Security lead |
| Database migration | Engineering + data reviewer | Security review for grants/RLS; finance review for money |
| Release | Engineering lead | Named production approver; operations readiness |
| Emergency hotfix | Incident commander + engineering | Post-hoc review within an agreed window |

PR requirements:

- Scoped description, linked decision/gate, and explicit non-goals.
- Test evidence, including negative authorization cases where relevant.
- Migration and rollback notes where schema changes.
- Security and privacy impact.
- No unrelated refactoring.
- No self-approval.

## 6. Automated checks

Implemented in `.github/workflows/ci.yml`:

1. Whitespace and patch validation on pull requests to `main` and on all branch pushes.
2. Application verification: install from lockfile with `npm ci`, type check, and production build.

Proposed additional gates, in order:

1. Lint and formatting check.
2. Unit tests.
3. Component and accessibility tests.
4. Database migration validation against a clean database and an upgrade path.
5. Database/RLS and integration tests.
6. Critical Playwright smoke tests.
7. Dependency vulnerability scan.
8. Secret scan.
9. Artifact provenance and checksum (later, when packaging is approved).

A failing required check blocks merge. Do not weaken a test or skip a check to make a build pass
without an approved waiver.

## 7. Testing and quality

| Layer | Tool (proposed) | Required evidence |
|---|---|---|
| Unit | Vitest | State transitions, money, quantities, permission predicates |
| Component | React Testing Library | Role-gated UI, forms, accessibility |
| Integration | Vitest + database | Contracts, transactions, idempotency, queues |
| Database/RLS | pgTAP | Grants and policies allow/deny; role switching |
| End-to-end | Playwright | Registration, request, clearance, release, result, payment, MAR, discharge |
| Security | Dedicated tests | IDOR, cross-department, mass assignment, break-glass, export |
| Accessibility | axe + manual | WCAG 2.2 AA on critical flows |
| Property | fast-check (optional) | Money and quantity invariants |

No real patient data in fixtures, screenshots, logs, snapshot names, or test reports.

## 8. Database migration review

1. Migrations are source-controlled SQL; no ad hoc production edits.
2. Every migration has an owner, purpose, forward plan, rollback or forward-fix plan, and data-impact
   statement.
3. Review constraints, indexes, locks, grants, RLS policies, and security-definer functions in the
   same change as the table they protect.
4. Use expand/contract for zero-downtime compatibility where needed.
5. Test against a clean database and an upgrade path from the prior release.
6. Back up before risky changes; verify restore before relying on it.
7. Migrations run through a controlled CI/CD identity, not the application request path.
8. Destructive migrations require a verified backup and an approved rollback plan.
9. No migration is applied through an AI tool or MCP server.

## 9. Staging and UAT

- Deploy the release candidate to staging from the reviewed commit.
- Use synthetic or de-identified data only.
- Run the critical E2E and security suites.
- Conduct departmental UAT with named clinical, pharmacy, finance, records, and nursing
  representatives.
- Record UAT scope, participants, results, defects, and acceptance or rejection.
- UAT is not production approval; it is evidence for the release gate.

## 10. Production release approval

A production release requires:

1. All required CI checks green on the release commit.
2. Security review complete for the scope.
3. Migration and rollback plan approved.
4. Backup verified; restore path understood.
5. Monitoring and alerting ready for the changed surface.
6. UAT accepted for the scope.
7. Named production approver and release window recorded.
8. Rollback owner and decision criteria recorded.
9. No unresolved blocking conflict or gate for the scope.

Deployment is separate from merge. A merged change is not a production release.

## 11. Rollback and forward-fix

- Prefer a tested rollback for application changes.
- Prefer a forward fix for data-compatible schema changes where rollback would lose data.
- Never roll back by deleting clinical, financial, or audit records.
- Feature flags may limit blast radius but must not hide unfinished security work.
- Record the trigger, decision, actor, time, and outcome of a rollback.
- After rollback, run the post-release review and record the root cause.

## 12. Monitoring and alerting

Proposed monitoring:

- Health and readiness checks.
- Database connection and pool health.
- Authentication failures and revoked-account attempts.
- Authorization denials and anomalies.
- Payment verification anomalies and reconciliation variance.
- Queue failures and overdue work.
- Critical-result delivery failures.
- Audit integrity failures.
- Backup and restore failures.
- Error rates, latency, and saturation.

Logs must be structured, correlation-ID based, and redacted. No PHI, credentials, tokens, full
request bodies, or payment details in ordinary logs.

## 13. Backup and recovery verification

- Managed database backups before production; encrypted and access-controlled.
- Evaluate point-in-time recovery against hospital requirements.
- Test restore quarterly, and after major changes.
- Record RPO, RTO, backup frequency, retention, off-site location, and ownership.
- Restore into an isolated environment; never overwrite production to test a restore.
- Verify application-level reconciliation after restore.
- Do not claim recovery readiness without a successful restore record.

## 14. Security and dependency management

- Commit the lockfile; pin the runtime and supported Node.js LTS.
- Review every dependency addition; justify it; check maintenance and licence.
- Run dependency and secret scanning in CI.
- Do not add packages with unexplained install scripts or unnecessary privileges.
- Replace abandoned dependencies.
- Rotate secrets after exposure; audit the exposure.
- Keep operator credentials separate from application credentials.
- Do not enable MCP servers or AI tools with production credentials or data.

## 15. Incident response and change management

- Define security, clinical, and operational incident roles.
- Preserve evidence; do not delete logs, records, or audit entries.
- Provide immediate staff-access revocation.
- Follow the applicable breach notification timeline; coordinate with the Director and legal/DPO.
- Emergency changes require an incident reference and a post-hoc review.
- Every release, rollback, waiver, and emergency change is recorded in the change log.

## 16. Roles

| Role | Responsibility |
|---|---|
| Project owner | Scope, priority, gate acceptance, residual risk |
| Engineering lead | Architecture, code quality, CI, release engineering |
| Security lead | Threat model, access review, security evidence |
| Data owner | Schema, classification, retention, migration review |
| Clinical leads | Clinical workflow, triage, documentation, safety acceptance |
| Finance lead | Payment, ledger, reconciliation, approval limits |
| Pharmacist in Charge | Pharmacy workflow, stock, controlled medicines |
| Records lead | Patient identity, duplicates, merge, registration evidence |
| Legal/DPO | Lawful basis, DPIA, retention, cross-border, licensing |
| Operations/IT | Hosting, backups, monitoring, downtime, device management |

## 17. Current status

The D-HOIP CI workflow runs whitespace and patch validation plus application typecheck and
production build. Branch protection, environments, secret stores, backups, monitoring, and
deployment are not configured. The remaining delivery lifecycle is a proposal only. Do not create
repositories, configure services, or deploy.

## 18. Related documents

- `docs/00-governance/STATUS_AND_APPROVAL.md`
- `docs/02-architecture/ARCHITECTURE_FOUNDATION.md`
- `.local-ai/architecture/target-state-blueprint/19_DEPLOYMENT_RELIABILITY_AND_OPERATIONS.md`
- `.local-ai/architecture/target-state-blueprint/20_ARCHITECTURE_VALIDATION_AND_TEST_STRATEGY.md`
- `.local-ai/architecture/gates/development-lifecycle.md`
