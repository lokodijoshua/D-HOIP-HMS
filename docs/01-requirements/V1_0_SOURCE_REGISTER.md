# V1.0 Source Register

**Status:** PROPOSED. Documentation only; no source is approved or registered as binding.
**Prepared:** 2026-11-22.
**Scope:** records the proposed V1.0 source files, their local locations, integrity hashes, current
verification status, and the authority they may hold once approved.

This register does not approve a source, a product version, a requirement, a policy, or a gate.

## 1. Registration rules

1. A source is registered only with an exact path, version, owner, date, integrity hash, and
   inspection status.
2. A hash match proves file identity only. It does not prove the contents were read, interpreted
   correctly, or approved.
3. A source outside the repository is not a repository source until the project owner approves its
   registration and a controlled copy or reference is recorded.
4. PDF text extraction is unavailable in this environment. Any PDF whose text has not been
   re-extracted is recorded as **hash-verified, text not re-extracted**.
5. Conflicts between sources are recorded in the conflict register and are not silently resolved.

## 2. Proposed commercial authority

| Field | Value |
|---|---|
| Source ID | `SRC-V1-BP-001` |
| Title | DARE2CARE D-HOIP Budget Proposal |
| Local path | `C:\Users\USER\Downloads\DARE2CARE_D-HOIP_Proposal.docx.pdf` |
| SHA-256 | `8F9A62CCC6576E78583D5A39952C426DB80DB4DC0ED09C8A573EB1E43201F3BF` |
| Size | 496,793 bytes |
| Hash verification | Verified on 2026-11-22; matches the project-owner-supplied hash |
| Selected by | Project-owner instruction, 2026-11-22 |
| Proposed authority | Commercial product-version structure V1.0-V3.1 |
| Text verification | Not re-extracted; exact V1.0-V3.1 wording not independently read |
| Approval status | SOURCE SELECTED - AUTHORITY AND CONTENT PENDING APPROVAL |
| Repository status | Not copied into the repository; reference path only |

**Do not substitute another proposal file automatically.** If the file changes and its hash no longer
matches, stop and report the discrepancy.

## 3. Supporting sources

These sources are used for contextual reconciliation. Their contents were not re-extracted in this
task.

| Source ID | Source | Local path | SHA-256 | Status |
|---|---|---|---|---|
| `SRC-V1-EB-001` | D-HOIP Engineering Architecture & DevOps Blueprint v1.0 | `.local-ai/requirements/sources/DHOIP_Engineering_Architecture_and_DevOps_Blueprint_v1.pdf` | `E7115B5DA07BA873BE263E3A7CDAF13C1D76952C22D9AA0966952CBCFA98DB85` | Hash-verified; text not re-extracted; proposal/reference status |
| `SRC-V1-DFS-001` | D-HOIP Developer Foundation Workflow & System Control Specification v1.1 | `.local-ai/requirements/sources/D-HOIP Developer Foundation Workflow & System Control Specification.pdf` | `63654337D7ADAAEEC0E854151274B9D9494C2C72EBCE9A9BED1D65BB8EBBCE2D` | Hash-verified; text not re-extracted; program document status |
| `SRC-V1-POL-001` | Hospital Policy Manual v0.1 (draft) | `.local-ai/requirements/sources/Hospital Policy Manual.docx` | `1D55EB82264C7D260F8BDA108F72391A5012ED4C2DE38257315ACBDE9BBADEF8` | Draft; unsigned; not binding; individual policy status must be checked |

## 4. Repository governance sources

| Source | Purpose | Status |
|---|---|---|
| [`../00-governance/SOURCE_AUTHORITY.md`](../00-governance/SOURCE_AUTHORITY.md) | Authority hierarchy and conflict handling | Proposed governance rule |
| [`../00-governance/STATUS_AND_APPROVAL.md`](../00-governance/STATUS_AND_APPROVAL.md) | Status vocabulary, gates, approval records | Proposed governance rule |
| [`../00-governance/CONFLICT_REGISTER.md`](../00-governance/CONFLICT_REGISTER.md) | Open conflicts and decisions | Investigation register |
| [`../00-governance/PRODUCTION_READINESS_REGISTER.md`](../00-governance/PRODUCTION_READINESS_REGISTER.md) | Feature readiness classifications and evidence | Authoritative readiness register |
| [`CONFIRMED_PROJECT_DIRECTION.md`](CONFIRMED_PROJECT_DIRECTION.md) | Project-owner direction | Recorded direction; formal approval still required |
| [`../02-architecture/ARCHITECTURE_FOUNDATION.md`](../02-architecture/ARCHITECTURE_FOUNDATION.md) | Architecture proposal | Proposed |
| [`../02-architecture/STAGE_B_DATABASE_SECURITY_SPIKE.md`](../02-architecture/STAGE_B_DATABASE_SECURITY_SPIKE.md) | Synthetic security-spike evidence | Development implementation; not production ready |

## 5. Verification gaps

1. The proposal's exact V1.0-V3.1 text has not been re-extracted.
2. The proposal has not been copied into the repository or registered as an approved source.
3. The blueprint and specification are used through repository summaries and derived documents, not
   fresh full-text reads.
4. The policy manual remains an unsigned draft.
5. No hospital approval has been recorded for the proposal's product-version structure or the
   initial department list.

## 6. Related documents

- [`PRODUCT_VERSION_GOVERNANCE.md`](PRODUCT_VERSION_GOVERNANCE.md)
- [`V1_0_SCOPE.md`](V1_0_SCOPE.md)
- [`V1_0_REQUIREMENTS_TRACEABILITY.md`](V1_0_REQUIREMENTS_TRACEABILITY.md)
- [`../00-governance/SOURCE_AUTHORITY.md`](../00-governance/SOURCE_AUTHORITY.md)
