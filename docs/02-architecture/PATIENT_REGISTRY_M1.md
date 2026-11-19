# Patient Registry M1

**Status:** Synthetic preview; approved scope limited to Patient Management M1 under
`AUTH-PATIENT-M1-001`.
**Scope:** application code, in-memory synthetic data, tests, and documentation. No database, real
patient data, authentication, authorization, RLS, or persistent audit is authorized.
**Not an operational patient registry.** This document does not approve Gate 5 or any production
patient capability. Production-readiness status and required evidence are tracked in the
[`Production Readiness Register`](../00-governance/PRODUCTION_READINESS_REGISTER.md).

## 1. Purpose and boundaries

M1 establishes the canonical patient identity and registration capability in the existing
Next.js application shell, using synthetic data only. It demonstrates search-before-create,
duplicate review, server-side duplicate recheck, hospital-ID allocation, and a longitudinal patient
profile.

The following boundaries are intentional:

- Patient management owns the canonical patient identity and record.
- Registration is a shared capability and workspace, not a department. No Registry department is
  created, and department ownership remains unresolved.
- Encounters are patient-centred operational/clinical records and are not part of M1. The profile
  contains a clearly marked future encounter area only.
- Billing, payments, claims, inventory, clinical notes, documents, allergies, alerts, payer
  categories, insurance, guarantors, and consent are separate capabilities and are excluded.
- No patient correction, merge, or deletion workflow is implemented. The model reserves the
  boundary for a later approved milestone; M1 never merges automatically.

## 2. Approved identity data

M1 captures only:

- family name, given name, middle name, and preferred name;
- name completeness/status in the internal model (new M1 records are recorded as complete);
- sex;
- exact date of birth, or estimated age with unit and an as-of date;
- primary and secondary phone numbers;
- email;
- address lines, city or town, Nigerian state or FCT, and optional postal code;
- next-of-kin name, relationship, and phone number;
- basic identity verification status (`pending` or `verified`);
- registration timestamp and the synthetic registering-user placeholder.

An estimated age is stored as an estimate and is never converted into an exact date of birth. New
M1 registrations are created with identity status `pending`; seeded synthetic records illustrate
both pending and verified states. Identity evidence is not captured or verified in M1.

## 3. Hospital identifier

The approved simple format is:

```text
D2C-YYYY-NNNNNN
```

- `D2C` identifies Dare2Care Foundation.
- `YYYY` is the registration year in the `Africa/Lagos` time zone.
- `NNNNNN` is a six-digit, monotonically increasing sequence within that year.
- There is no check character.
- The internal UUID is the application and route identity. The hospital ID is never used as an
  authorization token.
- An allocated identifier is never reused in the preview.

**Preview limitation:** the in-memory allocator uses a process-local map. It does not provide
production-safe concurrency, durability, gap handling, recovery, or cross-instance uniqueness.
Production allocation requires a transactional database-backed yearly counter/sequence, a unique
database constraint on the hospital ID, and fail-closed handling of sequence exhaustion.

## 4. Duplicate review rules

Matching is deterministic and explainable. It uses normalized family and given name, normalized
Nigerian/international phone numbers, exact date of birth, estimated age with as-of date, secondary
phone, email, and next-of-kin phone.

Strong candidates block silent registration:

- same family and given name + same exact date of birth;
- same family and given name + same primary phone;
- same primary phone + same exact date of birth;
- an exact asserted hospital ID match.

Possible candidates require explicit review but do not alone block registration:

- same family and given name only;
- same primary, secondary, or next-of-kin phone only;
- same exact date of birth only;
- same email only;
- similar estimated age and sex where the estimates align within 90 days.

Rules and safeguards:

- No fuzzy name similarity is used, and name similarity alone never blocks registration.
- Names are normalized for comparison only; the entered values are retained.
- Nigerian local numbers with a leading `0` are normalized to `+234` plus the ten national digits.
  Ambiguous numbers without a leading `0` or country code are rejected rather than guessed.
- The server reruns duplicate detection when registering. The initial search is not trusted.
- A strong candidate deliberately bypassed requires an explanatory override reason of at least
  eight characters. Possible candidates require explicit review but not an override reason.
- Records are never merged automatically.
- Search is capped at 20 results and returns a minimal summary: UUID, hospital ID, names, sex,
  date-of-birth display, primary phone, and identity status.
- Name matching is token-based and order-independent. Searching `Amina Yusuf` and `Yusuf Amina`
  match the same record. DOB-only search is supported and uses the same 20-result cap.

**M1 duplicate-review limitation:** `assertedHospitalId`, `duplicateReviewAcknowledged`, and
`overrideReason` are supplied by the registration caller. The server reruns field-based matching
and enforces the acknowledgement/reason contract, but it cannot prove that a human reviewed the
candidates. The registration UI carries an exact-format hospital-ID search assertion into the
registration request even when the search result set is empty, so an existing ID is still
hard-blocked after a DOB-filter mismatch. If a caller omits the assertion, the server cannot infer
an existing hospital ID from the remaining fields alone. This is preview workflow enforcement, not
a production authorization control. Production requires a server-issued, session-bound review
reference tied to the candidate set and an authoritative database lookup; client-supplied flags and
assertions must not be treated as proof.

## 5. Routes and workflow

| Route | Behaviour |
|---|---|
| `/patients` | Search by hospital ID, name tokens in any order, phone, or exact date of birth alone. No full list. Capped, minimal results. |
| `/patients/new` | Search-first registration. Candidates are shown before the form. The form covers identity, contact/address, and next of kin. A server duplicate recheck may return a duplicate-review step. An exact-format search ID is carried into the server recheck. On success the generated hospital ID is shown. |
| `/patients/[patientId]` | Internal UUID route. Shows the hospital ID, approved identity/contact data, verification state, registration provenance, illustrative audit events, and a marked future encounter area. Invalid or missing IDs return 404. |

The registration form is not shown until a search has been completed and the user explicitly
continues. The server independently reruns field-based duplicate matching; client flags and
assertions are preview inputs, not proof of review. The generated hospital ID is shown only after
successful registration.

Every patient route displays a persistent notice:

> Synthetic preview — never enter real patient data.

## 6. Synthetic repository and audit

The repository is a server-side in-memory map. It is seeded with synthetic patients and supports
in-process registration. It is not exposed to the browser, and no patient data is written to
browser local storage, session storage, cookies, a database, a file, or an external service.

The repository records illustrative in-memory audit events for registration, hospital-ID
allocation, and duplicate review. These events exist only in server memory, are lost on restart, and
do not constitute a compliant, append-only, or tamper-evident audit trail. M1 makes no audit
compliance claim.

## 7. Production guard

Patient routes and actions fail closed based unconditionally on the production runtime:

- `isPatientPreviewEnabled()` returns false when `NODE_ENV` is `production`.
- Patient pages call the guard and return 404 in production.
- Search and registration server actions call `assertPatientPreviewEnabled()` and throw a generic
  unavailable error in production.
- No environment variable or configuration switch can enable the preview in production.

Patient routes are explicitly dynamic so the production build does not prerender them.

## 8. Tests

Vitest covers:

- identity validation, exact date of birth, estimated age, and as-of dates;
- Nigerian/international phone normalization and ambiguous-number rejection;
- hospital ID format, yearly sequencing, uniqueness, and Africa/Lagos year boundaries;
- strong and possible duplicate rules, matched reasons, and false-positive-sensitive cases;
- strong-candidate override reason enforcement;
- server-side duplicate recheck, omitted exact-ID assertion behaviour, and exact-ID blocking after
  a DOB-filter mismatch;
- absence of automatic merge, returned-profile immutability, and seeded-object isolation;
- successful registration, generated ID, idempotent submissions, payload-bound idempotency
  mismatch rejection, and audit events;
- search caps, minimal projections, exact hospital-ID search, order-independent name search, and
  DOB-only search;
- fail-closed production guard behaviour, resistance to configuration switches, and direct server
  action rejection before service initialization.

`npm test`, `npm run typecheck`, and `npm run build` are required verification commands. CI runs
the tests in addition to the existing typecheck and production build.

## 9. M2 and later dependencies

Persistent patient management requires separate approval and evidence for:

- Gate 5 implementation readiness, or its approved replacement;
- Clerk authentication and the D-HOIP employee/role/permission model;
- PostgreSQL provisioning, Drizzle integration, migrations, and a transactional hospital-ID
  sequence with a unique database constraint;
- server-enforced authorization, scoping, and negative access tests;
- a server-issued, session-bound duplicate-review reference tied to the candidate set, plus an
  authoritative database lookup for asserted hospital IDs;
- persistent append-only audit with tamper evidence;
- identity evidence, verification rules, and pending-verification workflow;
- patient correction, two-person merge, reversal, and newborn identity;
- encounter implementation as a separate patient-centred domain;
- consent, retention, DPIA, hosting/residency, backup, and operational readiness.

Production authentication, authorization, PostgreSQL persistence, RLS, and persistent audit remain
blocked until their own approvals and infrastructure readiness exist.
