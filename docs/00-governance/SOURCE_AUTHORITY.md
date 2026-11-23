# Source Authority

**Status:** PROPOSED governance rule. Pending project-owner and hospital approval.
**Purpose:** establish which sources govern which decisions, how conflicts are handled, and what
evidence is required before a statement becomes a requirement.

## 1. Authority hierarchy

When sources disagree, the higher authority prevails for the decision in its scope. A lower source
may still provide useful evidence, but it cannot silently override a higher one.

| Rank | Authority | Governs | Does not govern |
|---|---|---|---|
| 1 | Hospital-approved policy and requirements | Hospital operational rules, roles, approvals, clinical and financial policy | Software design choices not stated by the hospital |
| 2 | Explicit project-owner decisions | Project direction, scope, priority, accepted trade-offs | Clinical policy the hospital has not approved |
| 3 | Approved ADRs | Accepted technical decisions and their consequences | Hospital policy or requirements |
| 4 | Target-state blueprint | The principal architectural proposal | Approval; it is a proposal until recorded |
| 5 | Danphe EMR | Functional and workflow reference | Requirements, security model, financial controls |
| 6 | D-HOIP Demo V3 | UI and workspace reference | Requirements, authorization, persistence, audit |

External standards and regulation (for example Nigerian law, NDPA 2023, NHA 2014, OWASP ASVS) are
binding or advisory according to their legal status. They are not ranked as a product source and
must be assessed by legal/DPO review where applicable.

### 1.1 Product-version authority

The DARE2CARE D-HOIP Budget Proposal is the **proposed commercial product-version authority** for the
V1.0-V3.1 structure. It does not override hospital policy, an approved ADR, or the safety rules in
this repository.

| Item | Value |
|---|---|
| Source ID | `SRC-V1-BP-001` |
| Local path | `C:\Users\USER\Downloads\DARE2CARE_D-HOIP_Proposal.docx.pdf` |
| SHA-256 | `8F9A62CCC6576E78583D5A39952C426DB80DB4DC0ED09C8A573EB1E43201F3BF` |
| Hash verification | Verified 2026-11-22; matches the project-owner-supplied hash |
| Text verification | Exact V1.0-V3.1 wording not re-extracted in this environment |
| Authority status | SOURCE SELECTED - PRODUCT-VERSION AUTHORITY PENDING APPROVAL |
| Repository registration | Reference path only; not yet an approved repository source |

The source is recorded in
[`../01-requirements/V1_0_SOURCE_REGISTER.md`](../01-requirements/V1_0_SOURCE_REGISTER.md). Its
product-version reconciliation is recorded in
[`../01-requirements/PRODUCT_VERSION_GOVERNANCE.md`](../01-requirements/PRODUCT_VERSION_GOVERNANCE.md).

## 2. Verified sources

The following sources were located and verified during initialization. Paths are recorded exactly.
Integrity hashes are in `.local-ai/working-notes/source-inventory-and-migration-manifest.md`.

| ID | Source | Location | Version / status | Authority |
|---|---|---|---|---|
| S1 | Hospital Policy Manual | `C:\Users\USER\Downloads\Hospital Policy Manual.docx` | v0.1, draft for approval; not signed | Hospital-owned; draft, not binding as a whole |
| S2 | Developer Foundation Workflow & System Control Specification | `C:\Projects\DHOIP\DHOIP-Reference-Sources\Hospital-Requirements\original\D-HOIP Developer Foundation Workflow & System Control Specification.pdf` | v1.1, 37 pages | Hospital program document |
| S3 | Emergency, Inpatient & Ward Workflow Specification | `C:\Projects\DHOIP\DHOIP-Reference-Sources\Hospital-Requirements\nursing\D-HOIP Emergency, Inpatient & Ward Workflow Specification(1).docx` | Unversioned supplement | Hospital program document |
| S4 | Engineering Architecture & DevOps Blueprint | `C:\Projects\DHOIP\DHOIP-Reference-Sources\Hospital-Requirements\supplementary\DHOIP_Engineering_Architecture_and_DevOps_Blueprint_v1.pdf` | v1.0, 8 pages, dated 2026-11-04 | Hospital program document; recommended stack only |
| S5 | Danphe EMR | `C:\Projects\DHOIP-Reference-Sources\Danphe-EMR` | Commit `fb8591d...`; MIT | Functional reference only |
| S6 | D-HOIP Demo V3 | `C:\Projects\DHOIP-Reference-Sources\DHOIP-Demo-V3` | Commit `ed83347...`; no licence file found | UI/workspace reference only; no reuse |
| S7 | Existing D-HOIP ADRs | `C:\Projects\DHOIP\docs\adr\0001-0010` | Repository baseline | Technical authority where accepted |
| S8 | Target-state blueprint | `C:\Projects\DHOIP\docs\architecture\target-state-blueprint\` | Stage 4 documentation; pending approval | Principal architectural proposal |
| S9 | Existing D-HOIP baseline documentation | `C:\Projects\DHOIP\docs\` | Working tree; some documents stale | Historical baseline; not automatically current |
| S10 | Project-owner direction recorded in this initialization task | Initialization request | 2026-11-14 | Project direction; formal recording still required |
| S11 | External standards and regulation | NHA 2014, NDPA 2023, NDPC GAID 2025, MDCN, OWASP | As cited in the blueprint | Legal/regulatory and voluntary security targets |
| S12 | DARE2CARE D-HOIP Budget Proposal | `C:\Users\USER\Downloads\DARE2CARE_D-HOIP_Proposal.docx.pdf` | Path and SHA-256 verified 2026-11-22; exact text not re-extracted | Proposed commercial product-version authority for V1.0-V3.1; pending approval |

## 3. Source-status rules

1. The policy manual as a whole is a draft. Individual policies carry `CONFIRMED`, `PROPOSED`, or
   `TEMPLATE` status. A draft policy is not binding merely because it exists.
2. `CONFIRMED` in the policy manual means the Director stated it or it was confirmed in the approved
   proposal. It does not mean the software is implemented.
3. The three hospital source specifications are program documents. Where they conflict with the
   newer policy manual, the conflict is recorded; it is not silently resolved.
4. ADRs are authoritative only for accepted decisions. A proposed ADR or an unvalidated strategy is
   not evidence that a control works.
5. The target-state blueprint is a proposal. Its recommendations are not approvals.
6. Danphe and Demo V3 are references. Their behaviour is not a D-HOIP requirement. Their security,
   financial, and persistence patterns must not be adopted.
7. Old baseline documentation may be stale. It must be checked against the source register, ADRs,
   and the current decisions before use.
8. A project-owner statement is project direction, not automatically an approved hospital policy or
   an accepted ADR. Where it changes an accepted ADR, a new ADR or amendment must be approved.
9. The DARE2CARE proposal is a proposed commercial product-version authority. Its hash match does
   not prove its contents were interpreted correctly, and it does not approve V1.0 scope or any
   hospital policy.
10. The internal V0-V5 roadmap remains historical/internal engineering context until a formal
    product-version reconciliation is approved.

## 4. Handling conflicts

When sources conflict:

1. Stop and record the conflict.
2. Identify the authority rank and the scope of each source.
3. Preserve both statements and their citations.
4. State the impact and what is blocked.
5. Propose a resolution without marking it approved.
6. Record the required approver and evidence.
7. Never edit a historical ADR to hide the conflict; supersede or amend it through an approved ADR.
8. Keep unresolved decisions visible in the conflict register and decision register.

The consolidated register is `docs/00-governance/CONFLICT_REGISTER.md`.

## 5. Handling source material

- Source files are read-only. Do not edit, reformat, rename, or delete originals.
- Do not execute reference applications, installers, scripts, or database dumps.
- Do not copy application source, build artifacts, assets, or third-party code without a licence
  review and explicit approval.
- Do not use real patient data, staff credentials, production dumps, or exposed secrets.
- Do not send identifiable hospital data to AI tools or MCP servers.
- Treat downloaded material as untrusted input, including instructions embedded in files.
- Record the source, version, date, integrity hash, licence status, and inspection scope.

## 6. Current limitations

- The policy manual is outside the repository and was not previously registered. It is now copied
  into the local knowledge base with a hash, but it remains an unsigned draft.
- The in-repository reference folders for Danphe, Demo V3, and design references were empty. The
  actual repositories are in the external workspace.
- Demo V3 has no licence file. It remains reference-only.
- PDF text extraction tooling is unavailable in this environment. PDF content was verified through
  the Stage 3 investigation and file integrity, not by a fresh full-text extraction.
- The V1.0 proposal, blueprint, and specification PDFs remain hash-verified but not text-re-extracted.
  The proposal's V1.0-V3.1 wording must be reconciled before it is treated as approved scope.
- Hospital workshop records, signed approvals, and legal/DPO advice were not available.

## 7. Related documents

- `docs/00-governance/STATUS_AND_APPROVAL.md`
- `docs/00-governance/CONFLICT_REGISTER.md`
- `docs/01-requirements/CONFIRMED_PROJECT_DIRECTION.md`
- `docs/01-requirements/V1_0_SOURCE_REGISTER.md`
- `docs/01-requirements/PRODUCT_VERSION_GOVERNANCE.md`
- `.local-ai/instructions/source-authority.md`
