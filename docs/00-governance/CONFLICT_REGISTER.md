# Conflict and Open Decision Register

**Status:** Investigation register. Items are not resolved by this document.
**Rule:** No item may be silently closed by an agent. Preserve the original statements, citations,
and approval status. Historical ADRs are amended or superseded; they are not rewritten.

## 1. Register

| ID | Type | Conflict or gap | Evidence | Impact | Proposed resolution (not approved) | Approver | Blocks | Status |
|---|---|---|---|---|---|---|---|---|
| CR-001 | Conflict | Four department models exist: policy 8 (CONS, CLI, LAB, RAD, MAT, SUR, OPH, PHA); Foundation 7; nursing supplement 9 (adds EMR, WRD); baseline 9 active (adds REG, BIL) + 2 reserved | Policy P-03; Foundation §2; Nursing §1; ADR 0005/0009/0010; `departments.md` | Registry, permissions, module ownership, schema, and navigation cannot be approved | Director approves one registry; amend ADRs 0005/0009/0010 through new approved ADRs | Director | Yes | OPEN |
| CR-002 | Conflict | Policy gives registration ownership to Admin lead/Records Officer; ADR 0009 gives it to `REG` | Policy P-04; ADR 0009 | Registration module owner and access model unresolved | Decide owner; if policy wins, amend ADR 0009; keep one creation contract | Director + Records | Yes | OPEN |
| CR-003 | Conflict | Policy gives Admin the payment point; ADR 0010 gives `BIL` the operational financial workflow; Cashier/Finance placement open | Policy P-25; ADR 0006/0010 | Billing ownership, roles, and separation of duties unresolved | Define Admin/BIL/Cashier/Finance boundaries in one approved model | Director + Finance | Yes | OPEN |
| CR-004 | Conflict | Policy requires a temporary emergency ID and merge with a second approver; ADR 0009 rejects department-created temporary identities; blueprint proposes one central record with `verification=pending` | Policy P-04/P-08; ADR 0009; blueprint 05 §1/§8; owner-confirmed direction | Emergency identity and merge workflow cannot be implemented as currently documented | Owner-confirmed direction: no separate emergency identity; central record with verification pending. Record this in a new ADR; obtain Records/Medical approval for the operational rules | Director + Records + Medical | Yes | OWNER-CONFIRMED DIRECTION; ADR AMENDMENT REQUIRED |
| CR-005 | Conflict | Foundation says an authorized clinician marks the emergency exception and releases; policy says only Admin authorizes a financial bypass; ADR 0010 does not name the authority | Foundation §12.1; ADR 0010; Policy P-08; Nursing §2.1; owner-confirmed direction | Emergency release and bypass authority ambiguous | Split clinical emergency release (clinician) from financial bypass authorization (Admin); amend ADR 0010 through a new ADR | Director + Medical + Admin | Yes | POLICY-CONFIRMED; ADR AMENDMENT REQUIRED |
| CR-006 | Conflict | Policy allows about 10 minutes for payment first only when the patient's condition permits; Foundation has no window; nursing supplement says never delay care | Policy P-08; Foundation; Nursing §2.1 | Triage and payment workflow ambiguity | Configurable setting, advisory to Admin, never a gate on clinical care; define who decides "condition permits" | Director + Medical | Yes | OPEN |
| CR-007 | Conflict | Pharmacy payment owner: policy says Admin; Foundation says Finance/Cashier; ADR says `BIL`; policy also leaves Cashier placement open | Policy P-20/P-25; Foundation §6.9; ADR 0006/0010 | Pharmacy workflow and permissions blocked | Approve one payment point and the confirmation-to-Pharmacy contract; reconcile Admin/BIL roles | Director + Finance + Pharmacist in Charge | Yes | OPEN |
| CR-008 | Conflict | Partial payment and partial dispensing: Foundation leaves open; policy confirms paid-quantity dispensing; Danphe does not implement the policy handshake | Policy P-20; Foundation §19.2; Danphe `UpdatePrescriptionItemsStatus` | Pharmacy schema, UI, and ledger blocked | Adopt six quantity concepts; dispensing limited to confirmed quantity; exception requires approval | Director + Finance + Pharmacist in Charge | Yes | POLICY-CONFIRMED; DESIGN PROPOSED |
| CR-009 | Conflict | Policy gives the Director the complete financial audit trail; existing audit docs list Director/SysAdmin/Auditor; Admin must not automatically receive it | Policy P-29/P-35; ADR 0007; `audit-requirements.md`; `identity-and-access.md`; owner-confirmed direction | Audit permissions and potential over-access | Director-only full financial audit; delegated grants written, time-limited, logged; amend docs/ADR | Director + Legal | Yes | POLICY-CONFIRMED; PERMISSION MODEL PROPOSED |
| CR-010 | Conflict | Existing source register and investigation status say sources are absent, but the sources exist outside the repository | `source-register.md`; `investigation-status.md`; verified filesystem | Governance documents are stale; Gate 0 evidence is unreliable | Update the source register through a controlled documentation change | Program owner | Gate 0 accuracy | OPEN |
| CR-011 | Missing evidence | The policy manual is v0.1 draft, unsigned, and was outside the repository and unregistered | Policy cover and approval section; `C:\Users\USER\Downloads\Hospital Policy Manual.docx`; Stage 3 C-038/C-039 | The manual cannot be treated as binding as a whole | Preserve per-policy statuses; register with hash/version/owner; obtain sign-off | Director / Program owner | Yes, for requirements | OPEN |
| CR-012 | Missing evidence | In-repository `DHOIP-Reference-Sources/Danphe-EMR`, `DHOIP-Demo-V3`, and `design-References` are empty; actual repositories are outside Git | Repository file listing; Stage 3 C-040 | Evidence cannot be reproduced from the repository alone | Record approved external workspace paths in the source register | Program owner | Gate 0 closure | OPEN |
| CR-013 | Licensing | Demo V3 has no licence file | Demo V3 `SOURCE-INVENTORY.md`; Stage 3 C-045/C-073 | No code, asset, or logo reuse is permitted | Treat as reference-only until licence/permission is approved | Program owner / Legal | Yes, for reuse | OPEN |
| CR-014 | Technical risk | RLS strategy is proposed and unvalidated; direct Drizzle connections are not authenticated by Clerk | ADR 0004; security docs; Stage 3 C-049/C-050 | Cannot claim database defense-in-depth | Execute Stage B spike; keep RLS "proposed" until evidence; amend ADR only after verification | Security lead + Engineering | Yes, for DB design | OPEN |
| CR-015 | Security risk | MFA method and step-up policy are unresolved | Policy P-34; ADR 0003; Stage 3 C-066 | Privileged access control cannot be approved | Director/Security approve method and policy before production | Director + Security | Yes, for production | OPEN |
| CR-016 | Technical risk | Production hosting, region, residency, storage provider, RPO, and RTO are unresolved | ADR 0008; devops docs; Stage 3 C-051/C-052/C-072 | Production readiness blocked | Legal/DPO and IT approve residency, transfer basis, provider, and recovery targets | Director + IT + Legal | Yes, for production | OPEN |
| CR-017 | Technical risk | Money precision, rounding, currency, and ledger framework are unresolved | ADR 0006; database principles; Stage 3 C-054 | Financial correctness risk | Approve exact money model (no floating point) and ledger framework before schema | Finance + Engineering | Yes, for ledger | OPEN |
| CR-018 | Environment risk | A separate parent Git repository exists at `C:\Users\USER`; this project is nested beneath it | `git -C C:\Users\USER rev-parse --git-dir`; new repo resolves to its own `.git` | Accidental Git operations from the parent directory could target the wrong repository | Keep the new repository's own `.git`; always run Git commands from the project root; do not use the parent repository | Engineering lead | No, if discipline is maintained | OPEN |
| CR-019 | Environment limitation | PDF text extraction tooling is unavailable; PDF content was not re-extracted in this stage | `pdftotext` and Word COM unavailable; Stage 3 report records prior inspection | Fresh full-text verification of the two PDFs is not available | Use the recorded Stage 3 evidence; add a PDF extraction tool only through an approved environment change | Engineering lead | No, for initialization | OPEN |
| CR-020 | Reference risk | Danphe contains security and financial anti-patterns; Demo V3 has no production authentication, authorization, persistence, or audit | Stage 3 security findings; reference source inventories | Copying reference behaviour would introduce vulnerabilities | Reference-only; never reuse code/assets; design from hospital requirements | Security lead + Engineering | Yes, for reuse | OPEN |
| CR-021 | Ambiguity | "Admin" is used for the payment desk, while `BIL` is the department code and "Billing" is the workflow owner | Policy P-25; ADR 0010; blueprint 09/11 | Role and department terminology may be conflated | Define role vs department vs workspace in the approved registry and permission model | Director + Finance | Yes, for RBAC | OPEN |
| CR-022 | Ambiguity | "Emergency is an encounter classification" (owner direction) and "Emergency is a workspace inside Clinical" (blueprint) are related but not identical statements | Owner direction; blueprint 04/07 | Encounter type, workspace, and department code could be conflated | Treat emergency as an encounter classification and a clinical workspace; do not create an `EMR` department code; confirm terminology | Director + Medical/Nursing | Yes, for registry/UI | OPEN |

## 2. Resolution rules

1. Each item must be closed by an authorized human with role, date, scope, and evidence.
2. Closing an item requires updating this register and the relevant decision/ADR record.
3. An owner-confirmed direction does not automatically amend an accepted ADR. A new ADR or an
   approved amendment is required.
4. A policy `PROPOSED` or `TEMPLATE` item remains unresolved until the hospital approves it.
5. Technical validation items remain open until test evidence exists.
6. No agent may mark an item `CONFIRMED`, `APPROVED`, or `CLOSED` on its own authority.

## 3. Mapping to Stage 3

This register consolidates and restates the Stage 3 conflicts. The Stage 3 register remains the
source of `C-001` through `C-085` and `D-001` through `D-035`:

`.local-ai/decisions/09_CONFLICT_AND_OPEN_DECISION_REGISTER.md`

Any resolution must update both registers through an approved documentation change.

## 4. Related documents

- `docs/00-governance/SOURCE_AUTHORITY.md`
- `docs/00-governance/STATUS_AND_APPROVAL.md`
- `docs/01-requirements/CONFIRMED_PROJECT_DIRECTION.md`
- `.local-ai/decisions/22_DECISION_ASSUMPTION_AND_APPROVAL_REGISTER.md`
