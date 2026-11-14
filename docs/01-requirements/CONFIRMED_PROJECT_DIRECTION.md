# Confirmed Project Direction

**Status:** Project-owner direction recorded for reconciliation. Formal approval evidence is still
required where the direction changes an accepted ADR or hospital policy.
**Date recorded:** 2026-11-14
**Source:** D-HOIP production initialization instruction (project owner).

## 1. Purpose

This document records the project direction that the owner has stated as confirmed. It separates
that direction from the architecture proposal so that it is not confused with an approved ADR, an
approved hospital policy, or an implemented feature.

## 2. Direction register

| ID | Confirmed project direction | Classification | Reconciliation status | Required formal action |
|---|---|---|---|---|
| CD-01 | One central patient identity system. | Owner-confirmed; consistent with ADR 0009 core | Consistent in principle; identifier format and merge rules unresolved | Approve identifier/duplicate/merge policy; record in ADR |
| CD-02 | No separate emergency identity system. | Owner-confirmed; resolves the architecture question in favour of one identity | Reconciles policy "temporary ID" as a central record with verification pending; interpretation needs Records/Medical approval | New ADR or approved amendment to ADR 0009 |
| CD-03 | Emergency is an encounter classification. | Owner-confirmed | Consistent with blueprint A5; must not create an `EMR` department code | Confirm registry and encounter terminology |
| CD-04 | Unidentified emergency patients are registered centrally with verification pending. | Owner-confirmed | Requires identity-verification states, evidence, search, correction, and merge rules | Approve operational identity/merge rules; new ADR |
| CD-05 | Admin alone authorizes financial bypass. | Owner-confirmed; hospital policy confirmed (P-08) | ADR 0010 does not name the authority; must be amended through a new ADR | New ADR/amendment naming Admin authority |
| CD-06 | Emergency clinical care must never be delayed by payment. | Owner-confirmed; hospital policy confirmed (P-08) | Consistent with ADR 0010 and blueprint; design target only | Confirm release/clearance workflow at Gate 2/3 |
| CD-07 | Manual payment operations are required. | Owner-confirmed; policy confirmed (P-25) | Consistent with ADR 0006 and blueprint; no gateway dependency | Approve payment methods, evidence, and roles |
| CD-08 | HMO management and claims are manual for the initial implementation, without API dependency. | Owner-confirmed; policy confirmed (P-27) | Consistent with blueprint; no external API contract | Approve HMO data and claim lifecycle |
| CD-09 | Pharmacy dispensing must respect confirmed paid quantities and controlled exceptions. | Owner-confirmed; policy confirmed (P-20) | Six-quantity model proposed; partial dispensing rules need approval | Approve quantities, exceptions, and pharmacy handshake |
| CD-10 | Director has designated authority for complete financial audit. | Owner-confirmed; policy confirmed (P-29) | Existing audit docs conflict; permission model proposed | Approve Director-only access and delegated grants |
| CD-11 | The application is intended as a modular monolith. | Owner-confirmed; accepted ADR 0001 | Consistent | Retain; no new decision needed |
| CD-12 | Hospital workflows, authorization, and audit must be designed before implementation. | Owner-confirmed | Consistent with the proposed gate sequence | Ratify gates and implement evidence discipline |

## 3. Detailed reconciliation notes

### CD-01 / CD-02 / CD-03 / CD-04 - Patient identity and emergency

The owner direction resolves the architectural question: there is one patient identity system, and
emergency is an encounter classification. An unidentified emergency patient is a central patient
record whose identity verification is pending, not a second identity system and not a
department-local temporary patient.

This is consistent with ADR 0009's core rule that clinical modules must not create local patient
identities. It changes the interpretation of the policy's "temporary ID" and the blueprint's
proposal. It does not approve:

- the hospital identifier format or check digit;
- duplicate matching fields or thresholds;
- who may create or verify an unidentified record;
- the merge approval chain, reversal, or notification rules;
- how a pending record is corrected or merged;
- how search results are scoped to avoid leaking other patients;
- the status names and transitions for identity verification.

ADR 0009 must not be edited to hide the change. A new ADR or an approved amendment is required.
The Stage 3 conflict register remains open until that happens.

### CD-05 / CD-06 - Emergency financial authority

The owner confirms the hospital policy: only Admin authorizes a financial bypass, and care is never
delayed for payment. ADR 0010 says an "approved emergency exception" but does not name the
authority. A new ADR or amendment must name Admin and separate:

1. clinical emergency release by an authorized clinician; and
2. financial bypass authorization by Admin.

The about-10-minute payment-first window remains a policy detail. It may be configurable and
advisory, but it must never block urgent or life-saving care. Who decides that the patient's
condition permits the window is still unresolved.

### CD-07 / CD-08 - Manual payments and manual HMO

Manual operations are the required baseline. No payment gateway or HMO API is required. A future
adapter boundary may be documented conceptually, but it must not be implemented or depended on.
HMO claims are receivables, not cash; only a verified remittance or payment counts as collected.

### CD-09 - Pharmacy paid-quantity dispensing

The confirmed sequence is prescription, pharmacy review and costing, Admin payment, payment
confirmation to Pharmacy, then dispensing. The six quantities are prescribed, costed, paid,
confirmed, dispensed, and outstanding. Dispensing must not exceed confirmed quantity without an
approved exception. This is a policy-confirmed rule; the workflow, state machine, permissions, and
exception design remain proposed.

### CD-10 - Director financial audit

The Director is the designated authority for the complete financial audit trail. Admin does not
automatically receive it. Delegated access must be written, purpose-scoped, time-limited, and
logged. The existing audit documentation that grants broader access is in conflict and must be
reconciled through an approved change.

### CD-11 / CD-12 - Architecture and sequencing

The modular monolith is retained. Hospital workflows, authorization, and audit must be designed and
approved before implementation. No application code, schema, dependency, or external service is
authorized by this document.

## 4. What is not confirmed by this document

The following remain open and must not be described as approved:

- the final department registry and ownership map;
- whether Registration and Billing are departments or workspaces;
- whether Consultation is inside Clinical or standalone;
- the patient identifier format and duplicate rules;
- the triage scale, target times, and escalation rules;
- ward/bed rules and bed-charge cut-off;
- diagnosis coding standard;
- consent forms and legal basis;
- retention periods, hosting region, and cross-border transfer basis;
- MFA method and step-up policy;
- payment verification evidence and approval limits;
- HMO contracts, rates, coverage rules, and claim time limits;
- the ledger framework and money precision;
- the final role and permission matrix;
- the offline feasibility and phase details;
- any production release or deployment.

## 5. Approval requirement

This document records direction. It is not an approval record. For each direction that changes an
accepted ADR or an approved hospital policy, the required evidence is:

- a new or amended ADR with context, decision, alternatives, consequences, and open questions;
- the approver role, name, date, scope, and conditions;
- the affected requirements, workflows, permissions, and tests;
- an update to the conflict register and the decision register.

## 6. Related documents

- `docs/00-governance/SOURCE_AUTHORITY.md`
- `docs/00-governance/CONFLICT_REGISTER.md`
- `docs/02-architecture/ARCHITECTURE_FOUNDATION.md`
- `.local-ai/decisions/22_DECISION_ASSUMPTION_AND_APPROVAL_REGISTER.md`
