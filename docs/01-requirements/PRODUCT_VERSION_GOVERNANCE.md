# Product Version Governance

**Status:** PROPOSED. Documentation only; not approved and not implementation authorization.
**Prepared:** 2026-11-22.
**Scope:** defines the proposed product-version authority, the relationship between product versions
and engineering artifacts, and the provisional reconciliation with the internal V0-V5 roadmap.

This document does not approve a product version, a release, a gate, a department model, a policy,
or any implementation. Approval remains a human decision recorded under the applicable governance.

## 1. Purpose

D-HOIP uses two different roadmaps:

1. a **commercial/product-version structure** from the DARE2CARE D-HOIP Budget Proposal; and
2. an **internal engineering roadmap** (V0-V5) recorded in the local knowledge base.

They must not be treated as interchangeable. This document establishes the proposed authority and
the rules that keep product versions distinct from implementation milestones, Git branches,
commits, pull requests, and release tags.

## 2. Proposed commercial authority

The proposed commercial product-version authority is the DARE2CARE D-HOIP Budget Proposal.

| Item | Value |
|---|---|
| Local path | `C:\Users\USER\Downloads\DARE2CARE_D-HOIP_Proposal.docx.pdf` |
| SHA-256 | `8F9A62CCC6576E78583D5A39952C426DB80DB4DC0ED09C8A573EB1E43201F3BF` |
| Size | 496,793 bytes |
| Hash verification | Matches the project-owner-supplied hash on 2026-11-22 |
| Repository source status | Proposed commercial authority; not yet registered as approved repository source |
| Text verification | Exact V1.0-V3.1 text has not been re-extracted in this environment |

The proposal is **not approved** merely because its hash is verified. Registration and authority
require the source-record and approval steps in
[`V1_0_SOURCE_REGISTER.md`](V1_0_SOURCE_REGISTER.md).

## 3. Proposed product roadmap

The following names are recorded from the project-owner instruction and remain subject to exact
proposal-text reconciliation.

| Product version | Proposed name | Proposed primary outcome |
|---|---|---|
| V1.0 | Digital Hospital Foundation | Staff access, organization, patient identity, encounter foundation, minimum audit |
| V1.1 | Clinical Operations | Consultation, clinical documentation, requests, results, departmental clinical workflows |
| V1.2 | Billing & Revenue | Charges, invoices, manual payments, verification, allocation, receipts, reversals, reconciliation |
| V1.3 | Pharmacy, Inventory & Procurement | Prescription, costing, paid-quantity dispensing, stock, batch/expiry, procurement |
| V2.0 | Integrated Hospital Operations | Ward/nursing, emergency, and integrated specialist operations |
| V2.1 | Automated Clinical Workflow | Workflow automation, escalation, orchestration, and automated handoffs |
| V2.2 | HMO & Claims | Manual HMO enrollment, coverage, claims, receivables, and remittances |
| V2.3 | Staff & Operational Management | Workforce, attendance, facilities, IPC, patient safety, operational administration |
| V3.0 | Hospital Business Intelligence | Governed KPIs, read models, operational and clinical reporting |
| V3.1 | Board & Executive Intelligence | Executive dashboards, board reporting, and strategic intelligence |

The primary outcomes above are summaries for engineering planning. They must be checked against the
proposal text before being treated as approved scope.

## 4. Internal V0-V5 roadmap status

The internal roadmap remains in `.local-ai/` as **historical/internal engineering context**. It is
not a production product-version authority. It remains visible until a formal reconciliation is
approved, and it must not be edited to hide conflicts.

### 4.1 Provisional reconciliation

| Proposal version | Provisional internal mapping | Status |
|---|---|---|
| V1.0 Digital Hospital Foundation | Internal V0 foundation plus the bounded identity/registration/encounter-foundation part of internal V1 | PROVISIONAL - source text not yet reconciled |
| V1.1 Clinical Operations | Internal V1 clinical request plus internal V3.1 Consultation and V3.2/V3.3 Laboratory/Radiology | PROVISIONAL |
| V1.2 Billing & Revenue | Internal V2 | PROVISIONAL |
| V1.3 Pharmacy, Inventory & Procurement | Internal V3.4 Pharmacy plus inventory/procurement portions of internal V4 | PROVISIONAL |
| V2.0 Integrated Hospital Operations | Internal V3.5 Ward/Nursing, V3.6 Emergency, and V3.7/V3.8 specialist operations | PROVISIONAL |
| V2.1 Automated Clinical Workflow | No direct V0-V5 equivalent; intersects clinical requests and automation | CONFLICT - new concept |
| V2.2 HMO & Claims | HMO/claims portion of internal V4 | PROVISIONAL |
| V2.3 Staff & Operational Management | Workforce/facilities/IPC/patient-safety portion of internal V4, excluding claims and procurement | PROVISIONAL |
| V3.0 Hospital Business Intelligence | Internal V4 reporting plus a new analytics layer | PROVISIONAL |
| V3.1 Board & Executive Intelligence | Not represented in V0-V5 | CONFLICT - new layer |
| Unassigned | Internal V5 offline and integrations | UNRESOLVED - placement required |

The reconciliation is recorded in
[`docs/00-governance/CONFLICT_REGISTER.md`](../00-governance/CONFLICT_REGISTER.md) as CR-023.

## 5. Product version versus engineering artifact

| Artifact | Purpose | Rule |
|---|---|---|
| Product version | Commercial/product release boundary | Defined only by the approved proposal and this governance |
| Implementation milestone | Independently testable engineering work package | May map many-to-one or one-to-many with product versions |
| Git branch | Short-lived work container | Named by change type and scope, never by product version |
| Commit | One logical change | Conventional Commits; not a release claim |
| Pull request | Review and evidence unit | Not proof of product completion |
| Release tag | Immutable marker of an approved deployable state | Created only after release approval and verification |

## 6. Governance rules

1. Product-version numbers appear in product, scope, release, and acceptance documents. They are not
   used as branch names.
2. Short-lived branches follow the DevOps lifecycle: `feature/`, `fix/`, `docs/`, `release/`, and
   `hotfix/`.
3. A merge does not complete a product version. Completion requires the applicable gate evidence and
   human approval.
4. A release tag is created only for an approved, verified release.
5. The internal V0-V5 roadmap must not be used externally as the product roadmap once the proposal is
   approved.
6. Every requirement must cite its product version and its source. Unverified mappings are marked
   provisional.
7. Version changes require a recorded decision. They are not silently re-labelled.
8. A product version does not authorize implementation. Gate 5 and the applicable approvals are still
   required.
9. Conflicts between the proposal, hospital policy, ADRs, and internal roadmap are recorded, not
   silently resolved.

## 7. Open issues

- Exact V1.0-V3.1 proposal text has not been re-extracted and reconciled.
- The placement of internal V5 offline/integration work is unresolved.
- V2.1 and V3.1 have no established internal equivalent.
- The proposal's treatment of procurement and staff management must be confirmed.
- The initial department list is awaiting hospital approval and is not fixed by this document.

## 8. Related documents

- [`V1_0_SOURCE_REGISTER.md`](V1_0_SOURCE_REGISTER.md)
- [`V1_0_SCOPE.md`](V1_0_SCOPE.md)
- [`V1_0_REQUIREMENTS_TRACEABILITY.md`](V1_0_REQUIREMENTS_TRACEABILITY.md)
- [`../00-governance/V1_0_DECISION_AND_APPROVAL_REGISTER.md`](../00-governance/V1_0_DECISION_AND_APPROVAL_REGISTER.md)
- [`../00-governance/CONFLICT_REGISTER.md`](../00-governance/CONFLICT_REGISTER.md)
- [`../03-delivery/DEVOPS_LIFECYCLE.md`](../03-delivery/DEVOPS_LIFECYCLE.md)
