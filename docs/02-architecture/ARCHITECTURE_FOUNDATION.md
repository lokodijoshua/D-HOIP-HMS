# Architecture Foundation

**Status:** PROPOSED. This is an architecture foundation for review, not an approved design.
**Scope:** documentation only. No schema, migration, application code, dependency, or service is
authorized by this document.
**Basis:** hospital requirements, owner-confirmed direction, ADRs 0001-0010, and the Stage 4
target-state blueprint. Where sources conflict, the conflict is recorded in
`docs/00-governance/CONFLICT_REGISTER.md`.

## 1. Status summary

| Area | Confirmed requirement | Approved decision | Proposed architecture | Assumptions | Unresolved | Validation required |
|---|---|---|---|---|---|---|
| Application architecture | Modular monolith; one patient identity; one encounter model | ADR 0001 modular monolith | Next.js App Router, React, TypeScript, PostgreSQL, Drizzle | Single-hospital scale; one deployment | Exact module enforcement tooling | Stack compatibility spike |
| Domain and module boundaries | Shared identity, request, ledger, stock, audit; no department-owned copies | ADR 0005/0006/0009/0010 direction | Contract-first modules; core does not depend on departments | In-process contracts are sufficient | Contract shape; outbox use; dedicated DB roles | Boundary and contract tests |
| UI/UX and design system | Clinical safety information visible; financial data permission-gated | None | "Clinical Chart" design system; role workspaces; patient workspace at center | Desktop-first with tablet support | Exact component library and tokens | Accessibility and usability tests |
| Authentication and authorization | Individual accounts; server-enforced; least privilege; Director financial audit | Clerk selected as auth provider (ADR 0003 direction) | Clerk authentication + D-HOIP employee/role/permission tables; hybrid RBAC + ABAC | Clerk can be configured for the hospital | MFA method; step-up policy; session timeout; break-glass cadence | Stage B Clerk/employee mapping and negative access |
| Patient identity and encounters | One central identity; no separate emergency identity; emergency is an encounter classification; pending verification for unidentified patients | ADR 0009 core direction | Central patient record; identity verification lifecycle; duplicate review; two-person merge; encounter per visit/admission | A pending-verification record can satisfy the policy's temporary-ID intent | ID format; duplicate thresholds; merge authority; newborn rules | Identity, duplicate, merge, and cross-scope tests |
| Clinical workflow | Clinical authorization separate from financial clearance; no unreleased queue entry | ADR 0010 direction | Three-axis request lifecycle; released-only queues; result return to originator; append-only notes | Departments can operate a shared request lifecycle | Final state machine; critical-result escalation; diagnosis coding | State-transition and contract tests |
| Manual billing and payments | Manual payments; recording is not confirmation; emergency care never delayed | ADR 0006 append-only ledger and reversals | Capture, verify, confirm, allocate, clear; method-specific evidence; receipts; reconciliation | Hospital can supply bank/POS evidence manually | Cashier/Finance placement; approval limits; transfer evidence | Payment, idempotency, and reconciliation tests |
| Manual HMO claims | Manual HMO; no API dependency; claim is a receivable, not cash | Owner-confirmed direction; policy P-27 | HMO organizations, plans, enrollment, coverage rules, guarded manual claim lifecycle | Hospital will supply contracts, rates, and coverage rules | Claim process; time limits; contracts; co-pay rules | Claim transition and receivable/remittance tests |
| Financial ledger and governance | One central ledger; append-only; Director financial audit | ADR 0006; policy P-29 | Ledger contract; charge/payment/allocation/receivable/collection entries; reversals; reconciliation | A posting journal is sufficient for v1 | Double-entry vs journal; money precision; currency | Ledger invariant and tamper tests |
| Pharmacy and inventory | Paid-quantity dispensing; controlled exceptions; no expired/recalled stock | Policy P-20 confirmed core | Prescription review/costing; Admin payment confirmation; six quantities; FEFO; append-only stock movements | Pharmacy can operate batch/location tracking | Stores; substitution; controlled list; final-check roles | Quantity, over-dispense, recall, and partial-payment tests |
| Audit and accountability | Append-only, tamper-evident; Director-only full financial audit | ADR 0007 principles; policy P-29 | Audit domains; hash chain or equivalent; in-transaction audit for sensitive actions | Audit can be written in the same transaction | Retention; exact values retained; delegated access | Tamper, access, and redaction tests |
| Data protection and security | Lawful basis; confidentiality; validation before production | None | Deny-by-default; server trust boundary; private storage; no PHI in logs; NDPA/NHA controls | Legal/DPO review will be available | Hosting/residency; DPIA; retention; breach runbook | Threat-model, IDOR, mass-assignment, redaction tests |
| Database architecture | One PostgreSQL database; constraints are correctness | ADR 0002 stack direction; ADR 0004 proposed | Conceptual domains; ownership; append-only ledgers; transaction-scoped access; RLS as defense-in-depth | Drizzle + SQL migrations are suitable | RLS viability; pooling; schema details | Stage B spike; migration/rollback rehearsal |
| Integration boundaries | Manual-first; no external dependency for core workflows | None | Internal typed contracts; external adapters only in future | No integration is required for v1 | LIS/PACS/SMS/payment/HMO/FHIR contracts | Contract and security review |
| Reporting | Governed KPI definitions; separated measures; drill-down limited by authorization | None | Read models from contracts; reconciliation; export logging | Reporting needs can be met from read models | KPI catalogue; report owners; export controls | Reconciliation and authorization tests |
| Deployment and infrastructure | Environments separated; no production without validation | None | Local, CI, staging, production; CI gates; secret management | Hosting provider not selected | Region, provider, RPO/RTO, observability | Hosting, recovery, and monitoring readiness |
| Backup and disaster recovery | Encrypted backups; tested restore; RPO/RTO | None | Managed backups; PITR evaluation; restore drills; DR runbook | Hospital will define acceptable downtime | RPO/RTO; backup region; ownership | Restore test evidence |
| Testing and quality assurance | Negative authorization; financial and clinical invariants; synthetic data only | None | Unit, component, integration, DB/RLS, E2E, security, accessibility, property tests | Test tooling can be installed after approval | Exact coverage targets; tool versions | Stage B and per-phase test evidence |

## 2. Application architecture

**Confirmed:** one modular monolith; one central patient identity; one encounter model; one request
lifecycle; one financial ledger; one inventory ledger; one authorization model; one audit
infrastructure. Department modules must not create independent copies of patient identity, money, or
stock.

**Approved:** ADR 0001 (modular monolith) and ADR 0002 (selected stack direction) record the
architectural direction. ADR 0002 is a selected direction, not proof that the stack is validated.

**Proposed:** a single Next.js/TypeScript application with a server-side trust boundary; Server
Actions and Route Handlers for mutations; application services; shared core capabilities; department
modules that depend on core contracts; one PostgreSQL database accessed through Drizzle and SQL
migrations.

**Assumptions:** the hospital can operate one deployable application; in-process contracts and
transactions are sufficient for single-hospital scale; a background worker is not required for v1.

**Unresolved:** module-boundary enforcement tooling; whether each module gets a dedicated database
role; whether a transactional outbox is needed; reporting read-model isolation.

**Validation required:** stack compatibility, build, runtime, and deployment spike; contract
boundary tests; transaction and idempotency tests.

## 3. Domain and module boundaries

**Proposed core capabilities:** Patient Record, Registration, Encounter, Department Registry, Access,
Clinical Request, Financial Ledger, Inventory Ledger, Audit, Documents, Notification, Master Data,
Reporting.

**Proposed department and operational modules:** Consultation, Nursing workspace, Emergency workspace,
Ward workspace, Laboratory, Radiology, Maternity, Surgery/Theatre, Ophthalmology, Pharmacy, Billing,
Claims/HMO, Procurement, Workforce, Facilities, Patient Safety.

**Rules:** a module owns its tables and services; cross-module interaction uses contracts; foreign
keys are links, not access grants; core never imports department modules; departments depend on core;
no circular runtime dependencies; UI composition does not move business ownership.

**Unresolved:** contract interface shape; whether the Emergency/Nursing/Ward workspaces are owned by
`CLI` or another approved parent; the final department registry; the exact read-model boundary for
reporting.

## 4. UI/UX architecture and design system

**Confirmed:** clinical safety information must be visible where medicines are ordered, reviewed,
administered, or dispensed; financial data must be permission-gated; status must not rely on colour
alone; critical actions need confirmation.

**Proposed:** role workspaces; a persistent patient banner with hospital ID, name, age, sex,
identity-verification status, allergies, and alerts; an encounter context; a "Clinical Chart" visual
language using semantic tokens; dense tables; accessible forms; explicit loading, empty, denied, and
error states; WCAG 2.2 AA target.

**Reference boundary:** Demo V3 is a UI/workspace reference only. Do not reuse its client-side login,
localStorage persistence, or conflated payment/release flow. Do not reuse assets without a licence.

**Unresolved:** production component inventory; exact typography and colour tokens; responsive
breakpoints for ward tablets; print layouts; accessibility acceptance evidence.

## 5. Authentication and authorization

**Confirmed:** individual staff accounts; no shared accounts; server-side authorization; least
privilege; System Administrator does not automatically get clinical access; Director read-across is
logged; emergency restricted-record access needs a reason and review; validation before production.

**Approved direction:** Clerk is the authentication provider; Supabase is the managed PostgreSQL
provider; D-HOIP owns employee, role, permission, and department records. Clerk authentication does
not grant hospital permissions (ADR 0003 direction).

**Proposed:** Clerk session verification on the server; explicit Clerk-user to employee link;
hybrid RBAC + ABAC; deny-by-default; permission keys per action; department/workspace scope;
patient/encounter relationship scope; sensitivity and purpose rules; separation-of-duties checks;
break-glass with reason, time limit, and review; step-up for sensitive actions.

**Unresolved:** MFA method and step-up maximum age; session timeout; impersonation policy; role and
permission matrix approval; who reviews break-glass access and how often; whether a separate
Security Administrator role is used.

**Validation required:** Clerk session verification, linked/unlinked/inactive/revoked employee
mapping, negative authorization, cross-department denial, cross-patient denial, mass-assignment
denial, and revoked-permission immediacy.

## 6. Patient identity and encounter architecture

**Confirmed by owner direction:** one central patient identity; no separate emergency identity;
emergency is an encounter classification; unidentified emergency patients are registered centrally
with verification pending.

**Approved direction:** ADR 0009 establishes one central record, one internal UUID, one permanent
non-reused hospital identifier, search-before-create, duplicate review, and no department-created
identity.

**Proposed:** identity verification states; descriptor and source capture for unidentified patients;
candidate scoring and human duplicate review; two-person merge approval; history-preserving merge;
newborn as a separate linked patient; encounter per visit or admission; all clinical and financial
events link to patient and encounter.

**Assumptions:** a central pending-verification record can satisfy the policy's temporary-ID intent;
the hospital will approve an identifier format and duplicate rules.

**Unresolved:** identifier format and check digit; duplicate fields and thresholds; who may create or
verify an unidentified record; merge authority and reversal; newborn identity and birth notification;
whether registration may create an encounter directly.

**Validation required:** duplicate blocking, pending-verification workflow, merge approval, merge
reversal, newborn linkage, cross-scope search, and no department-local creation.

## 7. Clinical workflow architecture

**Confirmed:** clinical authorization is separate from financial clearance; a department queue
receives only released requests, except an approved emergency pathway; notes are not deleted;
corrections are linked entries with a reason.

**Proposed:** a shared request lifecycle with separate clinical, financial, and fulfilment axes;
released-only department queues; result return to the originating clinician; verified results before
completion; critical-result notification and acknowledgement; append-only clinical notes with
draft/signed/amended/corrected/late states; nursing MAR derived from the prescription; ward and
emergency workflows using the same patient and encounter.

**Unresolved:** the final state machine and transition permissions; note types and verification
rules; diagnosis coding standard; triage scale and targets; observation frequency and early-warning
score; critical-result escalation; ward/bed rules; death and medico-legal process.

**Validation required:** state-transition, unauthorized-order, unreleased-queue, amendment,
verification, and result-return tests.

## 8. Manual billing and payment operations

**Confirmed:** manual payments; cash, POS, bank transfer, and HMO; recording a payment is not
confirming it; a screenshot is not proof; emergency care is never delayed for payment; one payment
process linked to Admin.

**Proposed:** distinct service charge, invoice, invoice line, payment capture, payment evidence,
verification, confirmation, allocation, clearance, receivable, receipt, refund, reversal,
reconciliation; method-specific verification; partial payments; outstanding balances; cash-drawer
and shift reconciliation; idempotency; no destructive edit of confirmed invoices.

**Unresolved:** Cashier/Admin/Finance placement; transfer verification evidence; refund/waiver/
discount limits; receipt numbering and reprint rules; bank connection; shift cadence; who may
confirm a payment; separation-of-duties exceptions for a small team.

**Validation required:** capture-is-not-confirmed, screenshot rejection, duplicate idempotency,
partial payment, reversal linkage, receipt reprint, and reconciliation variance tests.

## 9. Manual HMO claims

**Confirmed by owner direction:** manual HMO management and claims for the initial implementation,
without API dependency.

**Proposed:** HMO organizations, plans, patient enrollment, configurable coverage rules, manual
eligibility and authorization, a guarded claim lifecycle, claim lines, communications, remittances,
payments, aging, and reconciliation; claims are receivables, not cash; only verified remittance or
payment counts as collected.

**Unresolved:** HMO list, contracts, rates, benefit limits, co-pays, claim forms, time limits, and
who approves coverage; whether a claims officer sits under Billing.

**Validation required:** claim-state guarding, receivable treatment, remittance verification, aging
reconciliation, and no HMO API dependency.

## 10. Financial ledger and governance

**Confirmed:** one central ledger; append-only; corrections are reversals or adjustments; Director
is the designated authority for the complete financial audit trail; Admin does not automatically
receive full audit.

**Approved direction:** ADR 0006 establishes append-only postings, reversals, and separation of
payment recording from verification.

**Proposed:** a ledger contract used by Billing and Claims; charge, payment capture, verification,
confirmation, allocation, receivable, collection, claim, remittance, refund, reversal, adjustment,
and reconciliation entries; fixed-precision money; idempotency keys; linked originals; Director-only
full financial audit with time-limited delegated grants.

**Unresolved:** journal vs double-entry framework; money precision, rounding, and currency;
reconciliation cadence and owner; delegated audit access; how the ledger handles deposits,
overpayments, and write-offs.

**Validation required:** append-only enforcement, duplicate posting prevention, reversal linkage,
money precision, and Director-vs-Admin audit access.

## 11. Pharmacy and inventory

**Confirmed:** pharmacy costs the order; Admin processes payment; confirmation goes to Pharmacy;
dispensing respects confirmed paid quantity; dispensing beyond that requires an approved exception;
expired, recalled, and quarantined stock is not dispensed.

**Proposed:** prescription versions; review and clarification; availability and costing; six
quantities; Admin payment confirmation; partial dispensing; preparer/checker/dispenser; returns;
recall and quarantine; batches and expiry; FEFO; append-only stock movements; derived balances;
ward stock as a pharmacy location; controlled-medicine two-person approval and shift counts.

**Unresolved:** stores and locations; substitution rules; prescription validity and repeats;
controlled list; final-check roles; negative-stock exception; returns/restock rules; expiry windows;
cold chain; emergency dispensing.

**Validation required:** over-dispense block, expired/recalled block, partial payment/dispensing,
duplicate dispensing, return assessment, and only-Billing-confirms tests.

## 12. Audit and accountability

**Confirmed:** audit sensitive actions; append-only; no silent deletion; Director-only full
financial audit; protected against alteration and deletion.

**Proposed:** audit event fields including actor, role, department, time, event type, resource,
patient/encounter reference, action, protected before/after values, reason, approval reference,
origin, and authorization decision; clinical, financial, technical, and privacy audit domains;
hash-chain or equivalent tamper evidence; in-transaction audit for sensitive actions; audited audit
access; export logging.

**Unresolved:** retention periods; exact values retained; legal hold; whether audit is in the same
transaction for every action; delegated access; review cadence.

**Validation required:** update/delete denial, hash-chain tamper detection, rollback on audit
failure, Director/Admin access difference, restricted-view logging, and PHI redaction.

## 13. Data protection and security

**Confirmed:** patient confidentiality; least privilege; validation before production; breach
notification expectations; no real patient data in development or AI tools.

**Proposed:** deny-by-default; server-side authorization; private object storage with short-lived
signed access; encryption in transit and at rest; secrets in a managed store; no PHI in logs,
URLs, browser storage, fixtures, screenshots, or AI prompts; data classification; retention
controls after approval; DPIA before go-live; processor agreements; incident response aligned to
the NDPA 72-hour expectation.

**Unresolved:** lawful basis; DPIA; retention; cross-border transfer; hosting region; DPO/
registration applicability; breach runbook; vendor risk; consent forms.

**Validation required:** threat-model review, IDOR/cross-department tests, mass-assignment tests,
log-redaction tests, secret scanning, and dependency scanning.

## 14. Database architecture

**Confirmed:** one PostgreSQL database; constraints and migrations are part of correctness; no
destructive edits of clinical, financial, or audit history.

**Approved direction:** Drizzle ORM and SQL migrations are selected, subject to validation (ADR 0002
and ADR 0004).

**Proposed:** conceptual domains and ownership; separate schemas or table namespaces by module;
append-only ledger and stock tables; derived balances; transaction-scoped authorization; a
non-bypass application role; RLS as defense-in-depth; a separate migration role; expand/contract
migrations where needed.

**Assumptions:** the selected Supabase connection mode can support the required transaction
semantics; a direct Drizzle connection can set verified claims safely.

**Unresolved:** RLS viability and performance; pooling and `prepare:false`; dedicated module roles;
`FORCE ROW LEVEL SECURITY`; background-job identity; storage policy identity; schema and index
details.

**Validation required:** Stage B Clerk/Drizzle/RLS/pooling/teardown spike; negative access; migration
and rollback rehearsal; restore test.

**Not authorized:** any production schema, table, column, policy, grant, or migration in this stage.

## 15. Integration boundaries

**Confirmed:** manual payment and manual HMO workflows must work with zero external integrations.

**Proposed:** internal typed contracts; a thin adapter layer for any future external system; no
external calls inside a database transaction; validated input; idempotency; replay protection;
signed webhooks; minimal payload storage; no invented API contracts.

**Future and not implemented:** payment gateway, HMO API, LIS/analyzers, PACS/DICOM, SMS/email,
accounting export, FHIR/HIE.

**Unresolved:** which integrations, if any, are required later; contract versions; security review;
vendor agreements; data-sharing legal basis.

## 16. Reporting

**Confirmed:** every KPI needs a written definition and source; reports must reconcile to source;
revenue, collections, receivables, claims, and inventory value must not be combined; clinical detail
is restricted.

**Proposed:** versioned KPI definitions; read models from contracts; dashboard reconciliation;
drill-down limited by authorization; export permission, reason, and audit; Director financial
drill-down as the authoritative full view.

**Unresolved:** KPI catalogue; report owners; export controls; clinical-detail access; review
cadence.

**Validation required:** dashboard-to-source reconciliation, separated measures, drill-down
authorization, and export audit tests.

## 17. Deployment and infrastructure

**Confirmed:** local, CI, staging, and production environments; synthetic or de-identified data
outside production; production credentials never in local or CI; no production without validation.

**Proposed:** GitHub Actions CI; lockfile installs; typecheck, lint, unit, component, integration,
database/RLS, critical E2E, dependency and secret scans, build; staging deployment; UAT; named
production approval; rollback plan; monitoring and alerting; secret manager; structured logs with
correlation IDs.

**Unresolved:** hosting provider and region; Supabase plan; file storage; observability vendor;
CI runner and branch protection; backup region; RPO/RTO; support model.

**Validation required:** hosting and residency review, secret management, CI pipeline, backup/
restore, monitoring, and release rehearsal.

## 18. Backup, recovery, and disaster recovery

**Confirmed:** encrypted backups; access-controlled; restore tested; RPO/RTO required before
production; quarterly restore testing per policy P-37.

**Proposed:** managed PostgreSQL backups; point-in-time recovery evaluation; separate backup region;
tested restore into an isolated environment; DR roles and call tree; department downtime procedure;
paper fallback with serial numbers and a downtime flag until offline exists.

**Unresolved:** RPO, RTO, backup frequency, retention, off-site location, ownership, and test
evidence.

## 19. Testing and quality assurance

**Confirmed:** negative authorization tests; financial and clinical invariants; synthetic or
de-identified data only; no claim of validation without evidence.

**Proposed test layers:** unit (Vitest), component (React Testing Library), integration (Vitest plus
database), database/RLS (pgTAP), end-to-end (Playwright), security, accessibility (axe plus manual),
and optional property-based tests for money and quantities.

**Required negative cases:** unauthenticated; unlinked/inactive/revoked employee; no permission;
wrong department; wrong patient/encounter; restricted record without reason; export without
approval.

**Unresolved:** coverage targets; exact tool versions; test environment; performance and load
targets; accessibility conformance evidence.

**Validation required:** Stage B spike, per-domain invariant tests, and phase acceptance evidence.

## 20. Cross-cutting invariants

1. One canonical active patient per person.
2. The hospital identifier is permanent and never reused; the internal UUID is unique.
3. No department creates its own patient identity.
4. An unidentified patient is one record with pending verification, not multiple records.
5. A merge preserves the survivor and superseded identifiers and repoints links without deletion.
6. A newborn is a separate linked identity.
7. Every clinical and financial event links to a patient and encounter.
8. Clinical authorization is not financial clearance.
9. No unreleased request enters a department queue.
10. A department cannot change another department's clinical or financial status.
11. Completion requires the required verification.
12. No silent deletion of clinical, financial, or audit records.
13. Notes are append-only; amendments and corrections link to the original.
14. Payment capture is not confirmation; unverified payment is not collected.
15. A claim is not cash; only a verified remittance or payment is collected.
16. Ledger and stock history are append-only; corrections are reversals or movements.
17. Duplicate postings are prevented by idempotency and uniqueness.
18. Dispensing does not exceed confirmed quantity without an approved exception.
19. Only Admin authorizes an emergency financial bypass; the obligation is recorded and deferred.
20. The MAR derives from the prescription; nursing does not alter it.
21. Bed occupancy changes only through events; cleaning precedes availability.
22. Clinical discharge is not financial clearance; safety is not held hostage to payment.
23. The Director holds the complete financial audit; delegated grants are time-limited.
24. No PHI or credentials in ordinary logs; no shared accounts.
25. Every sensitive action is audited; audit is append-only.

## 21. V1.0 scope and boundary cross-reference

The V1.0 scope is defined in
[`../01-requirements/V1_0_SCOPE.md`](../01-requirements/V1_0_SCOPE.md). It is PROPOSED, not approved,
and does not authorize schema or implementation work.

V1.0 is limited to the Digital Hospital Foundation:

- authentication, employee access, and minimum role/permission enforcement;
- a configurable department registry whose initial list is awaiting hospital approval;
- patient registration, permanent identity, duplicate review, and pending/verified identity;
- an encounter **data foundation**, not full clinical operations;
- minimum sensitive-action auditing.

Conditional V1.0 capabilities include patient correction, merge, minimal encounter UI, full role
administration, MFA/step-up, and broader audit. They are not mandatory V1.0 acceptance unless
separately approved. Full clinical operations, billing, pharmacy, HMO, ward, and reporting remain
later-version work.

Boundary rules:

1. Departments are configurable organizational units and do not own patient identity, encounters,
   money, stock, or audit.
2. Patient identity is central and independent of departments.
3. An encounter is a patient-centred episode and is not a department.
4. Emergency is an encounter classification, not a department code.
5. Shared capabilities, including audit, are not departments.
6. Encounter data structures do not implement V1.1 clinical workflows.
7. Minimum audit does not imply retention, delegated grants, or tamper evidence.
8. Hosting and residency decisions block hosted environment and pilot/production approval, not
   logical architecture by default.

See
[`V1_0_DOMAIN_FOUNDATIONS.md`](V1_0_DOMAIN_FOUNDATIONS.md) and
[`V1_0_AUDIT_FOUNDATION_BOUNDARY.md`](V1_0_AUDIT_FOUNDATION_BOUNDARY.md).

## 22. What must be decided before implementation

1. Approve the department/workspace registry and ownership map.
2. Approve patient identity, unidentified-emergency, and merge rules; record the new ADR.
3. Approve the emergency clinical-release versus Admin financial-bypass split; amend ADR 0010.
4. Approve pharmacy costing, Admin payment, confirmation, dispensing, and partial quantities.
5. Approve Director-only financial audit and delegated access.
6. Approve manual payment and HMO operating roles, evidence, and limits.
7. Approve retention, residency, consent, DPIA, and breach process.
8. Approve money precision, ledger framework, and reconciliation ownership.
9. Complete the Stage B compatibility and security spike before schema design.
10. Ratify the gate sequence and evidence requirements.

## 23. Related documents

- `docs/00-governance/SOURCE_AUTHORITY.md`
- `docs/00-governance/STATUS_AND_APPROVAL.md`
- `docs/00-governance/CONFLICT_REGISTER.md`
- `docs/00-governance/V1_0_DECISION_AND_APPROVAL_REGISTER.md`
- `docs/01-requirements/CONFIRMED_PROJECT_DIRECTION.md`
- `docs/01-requirements/PRODUCT_VERSION_GOVERNANCE.md`
- `docs/01-requirements/V1_0_SCOPE.md`
- `docs/02-architecture/V1_0_DOMAIN_FOUNDATIONS.md`
- `docs/02-architecture/V1_0_AUDIT_FOUNDATION_BOUNDARY.md`
- `docs/03-delivery/V1_0_MILESTONE_AND_DEPENDENCY_PLAN.md`
- `.local-ai/architecture/target-state-blueprint/FINAL_DHOIP_TARGET_STATE_SYSTEM_BLUEPRINT.md`
- `.local-ai/architecture/target-state-blueprint/22_DECISION_ASSUMPTION_AND_APPROVAL_REGISTER.md`
- `.local-ai/decisions/09_CONFLICT_AND_OPEN_DECISION_REGISTER.md`
