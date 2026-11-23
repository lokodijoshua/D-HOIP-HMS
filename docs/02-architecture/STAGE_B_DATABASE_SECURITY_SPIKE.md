# Stage B Authentication and Database Security Spike

**Status:** **DEVELOPMENT IMPLEMENTATION - SECURITY SPIKE - NOT PRODUCTION READY.**
**Authorization:** `AUTH-M2-STAGE-B-001` in
[`../00-governance/STATUS_AND_APPROVAL.md`](../00-governance/STATUS_AND_APPROVAL.md) section 10.
**Date:** 2026-11-21.
**Scope:** non-patient, synthetic authentication and database security scaffolding only.

This document records a bounded engineering spike. It does not approve a feature, a production
authentication configuration, a production database, production row-level security, or any project
gate.

**Current evidence status:** the synthetic Supabase probe was applied successfully. The runtime
connection uses the Session Pooler with TLS, port 5432, and the dedicated `dhoip_app` role. The
proxy was relocated from root-level `proxy.ts` to `src/proxy.ts` with contents preserved, and a
real Clerk development-session request then completed through all six diagnostic phases with
HTTP 200 and exactly the expected synthetic resource. The nine gated live PostgreSQL tests
previously passed, including four actual-helper tests; that suite was **not rerun** during the
real-session request task. This evidence covers the synthetic probe under the tested development
configuration only. Production authentication, production authorization, production schema,
production operations, row-data rollback, and the production security review remain unvalidated.
Stage B remains **NOT PRODUCTION READY**.

## 1. Purpose

Stage B tests whether the chosen direction can establish a trustworthy server-side boundary before
patient persistence is implemented:

1. authenticate a staff member with Clerk;
2. resolve and verify an active employee link in D-HOIP's database;
3. construct transaction-local database claims from the verified Clerk subject;
4. assume the constrained `authenticated` database role;
5. enforce deny-by-default row-level security for a synthetic probe resource; and
6. prove positive, negative, and no-leakage behavior without patient data.

The spike is deliberately smaller than the proposed production authorization model. It does not
define roles, permissions, departments, clinical authorization, financial clearance, or a final
employee schema.

## 2. Implemented scaffolding

| Area | Implementation |
|---|---|
| Dependencies | `@clerk/nextjs` 7.10.6, `drizzle-orm` 0.45.4, `postgres` 4.1.1, and `drizzle-kit` 0.31.11, pinned exactly. Clerk 7.10.6 supports Next.js 16 and React 19.3. |
| Clerk middleware | `src/proxy.ts` runs `clerkMiddleware()`. It does not protect routes by itself. When Clerk keys are absent it is a no-op so the existing synthetic UI remains runnable. That fallback is scaffolding, not authentication. The file was relocated from the repository root with contents unchanged; this allows Next.js 16 to register it alongside `src/app`. |
| Session verification | `src/server/auth/clerk.ts` accepts only the server-verified Clerk `userId` as the subject. It does not trust session claims for employee identity. |
| Employee-link verification | `src/server/auth/employee.ts` looks up the probe employee link under RLS and accepts only `active`. Unlinked, inactive, and revoked identities are denied. |
| Authentication boundary | `src/server/auth/require-employee.ts` requires a verified Clerk subject, the database transaction, an active employee link, and the protected callback in one flow. |
| Database client | `src/server/db/client.ts` creates a lazy server-only Drizzle client from `DATABASE_URL` with one connection and prepared statements disabled. |
| Transaction claims | `src/server/db/transaction.ts` sets `request.jwt.claims`, `request.jwt.claim.sub`, then executes `SET LOCAL ROLE authenticated`. Claims contain only the verified `sub` and the fixed `authenticated` role. |
| Probe schema | `src/server/db/stage-b-schema.ts` maps the two probe-only tables. It is not a patient, employee, role, or permission schema. |
| Probe route | `GET /api/stage-b/probe` exercises the boundary against the probe table in non-production. It returns 404 in production and does not expose employee identity or patient data. |
| Probe SQL | `scripts/stage-b/probe-up.sql` and `probe-down.sql` validate the dedicated role, schema isolation, ownership, and table compatibility; seed before RLS; and create or remove only the synthetic probe objects. |
| Unit tests | Clerk rejection, active/inactive/revoked/unlinked employee decisions, and claim shape are covered with test doubles. These are not live database evidence. |
| Live test suite | `src/server/db/stage-b-live.test.ts` is skipped unless `DATABASE_URL` is set and `STAGE_B_LIVE_TESTS=1`. It contains five raw-connection RLS tests and four actual-helper tests. |

## 3. Live database setup evidence

A read-only Supabase verification confirmed:

- `dhoip_app` is `LOGIN`, `NOINHERIT`, `NOBYPASSRLS`, and not a superuser.
- `dhoip_app` is a member of `authenticated`.
- The `dhoip` schema and both probe tables are owned by `postgres`.
- Both probe tables have `ENABLE ROW LEVEL SECURITY` and `FORCE ROW LEVEL SECURITY`.
- The employee-link SELECT policy scopes access to `auth.jwt() ->> 'sub'`.
- The probe-resource SELECT policy requires the row's owner subject and an active employee link.
- The status constraint permits exactly `active`, `inactive`, and `revoked`.

The runtime connection was also confirmed read-only as `dhoip_app`; inside the helper it becomes
`authenticated` only for the transaction. No database URL or credentials are recorded here.

## 4. Execution order and security invariants

The protected path is:

```text
Clerk server-side session
  -> verified Clerk subject only
  -> database transaction
  -> set transaction-local JWT claims
  -> SET LOCAL ROLE authenticated
  -> employee link lookup under RLS (active only)
  -> protected operation under RLS
  -> commit or rollback
```

The following controls are intentional:

- No client-supplied employee ID, role, department, permission, or scope is accepted.
- No Clerk session claim is treated as hospital authorization.
- No `auth.uid()` call is used; Clerk IDs are not UUIDs.
- No service-role key, database owner, superuser, or `BYPASSRLS` role is used at runtime.
- Claims are transaction-local and are cleared when the transaction ends.
- The runtime role is a dedicated `dhoip_app` login that is a member of `authenticated`, owns no
  probe table, and has no `BYPASSRLS`.
- RLS is enabled and forced on both probe tables.
- Runtime grants are `SELECT` only on the probe tables.
- The probe route is production-disabled independently of the existing M1 patient preview guard.
- No real patient, hospital, employee, or production data is used.

## 5. Probe model and synthetic identities

The probe uses synthetic Clerk-like subjects and synthetic employee references only.

| Object | Purpose |
|---|---|
| `dhoip.stage_b_employee_link` | Maps a synthetic Clerk subject to a synthetic employee reference and one of `active`, `inactive`, or `revoked`. A subject may see only its own link row. The status check must be exactly `status IN ('active', 'inactive', 'revoked')`; the SQL rejects extra values, duplicates, or additional conditions. |
| `dhoip.stage_b_probe_resource` | Synthetic resource owned by a Clerk subject. A subject may see a row only when the subject owns it and has an active employee link. |

Seeded expectations:

| Subject | Link | Visible probe rows |
|---|---|---|
| `user_stage_b_active_a` | active | `Active A` only |
| `user_stage_b_active_b` | active | `Active B` only |
| `user_stage_b_inactive` | inactive | none |
| `user_stage_b_revoked` | revoked | none |
| `user_stage_b_unlinked` | none | none |

## 6. Connection modes, identities, and TLS

The Stage B code accepts a PostgreSQL URL that provides the required runtime role, TLS, and
transaction semantics. The connection mode is a deployment decision.

| Mode | Typical Supabase endpoint | Stage B status |
|---|---|---|
| Direct connection | Direct database host, port 5432 | Supported in the code; not the current Stage B connection. |
| Session pooler | Pooler host, port 5432 | **Current live development configuration**; connection, role, claims, and rollback/context tests pass. |
| Transaction pooler | Pooler host, port 6543 | Supported by the `prepare: false` client setting; not yet validated with the helper and RLS tests. |

**Runtime identity.** `DATABASE_URL` must use dedicated `dhoip_app` credentials only. The role must
be `LOGIN`, `NOINHERIT`, and `NOBYPASSRLS`, must not be a superuser, must be a member of
`authenticated`, and must not own the probe tables or schema. The application runtime must not use a
service-role key or administrative role.

**Migration/admin identity.** A separate privileged identity applies `probe-up.sql`,
`probe-down.sql`, and role provisioning. It is never used by the application runtime and is not
stored in the application `.env.local`.

**TLS.** Remote TLS uses `sslmode=require`. Pooler TLS and certificate behavior for production
hosting still require operational review.

## 7. Automated test evidence

### Unit tests

`npm test` with the live gate disabled:

- 68 unit tests passed.
- 9 live tests skipped.
- Unit tests cover Clerk subject rejection, employee-status decisions, and claim shape. They do not
  prove PostgreSQL, RLS, or real Clerk session behavior.

### Existing raw live tests

The live file was run with `.env.local` loaded through the existing `@next/env` loader and
`STAGE_B_LIVE_TESTS=1` set only in the test process:

```text
node node_modules/vitest/vitest.mjs run src/server/db/stage-b-live.test.ts --reporter=verbose --testTimeout=30000
```

| Test | Result | Evidence |
|---|---|---|
| `uses the verified subject and returns only the active employee's row` | PASS | Claim propagation, `SET LOCAL ROLE`, own-subject RLS, no bypass. |
| `does not expose one active employee's row to another identity` | PASS | Cross-subject isolation. |
| `denies unlinked, inactive, and revoked identities` | PASS | Negative RLS behavior for the three synthetic negative identities. |
| `does not leak claims or rows after a committed transaction` | PASS | Raw-connection transaction-context isolation. |
| `uses a runtime role that owns no probe table and does not bypass RLS` | PASS | Role attributes, table ownership, RLS and FORCE RLS. |

These five tests use the raw `postgres` driver and manually set claims/role. They are live
PostgreSQL/RLS evidence but not actual application-helper evidence.

### Permanent actual-helper live tests

The same gated file now includes tests using the actual `withAuthenticatedTransaction` and
`requireActiveStageBEmployee` implementations:

| Test | Result | Evidence |
|---|---|---|
| `actual helper uses dhoip_app session identity and authenticated transaction claims` | PASS | `session_user=dhoip_app`, `current_user=authenticated`, JWT `sub` matches, active employee link, own row. |
| `actual helper isolates active A and active B probe resources` | PASS | Actual helper and RLS isolate A and B in both directions. |
| `actual helper denies inactive, revoked, and unlinked identities` | PASS | `EmployeeAccessDeniedError` for all three synthetic negative cases. |
| `actual helper propagates callback failure and clears transaction context` | PASS | Callback error propagates; a no-claims transaction shows `session_user/current_user=dhoip_app` and empty claim settings; a follow-up helper transaction gets only Active B. |

Final live suite result: **9 passed, 0 failed, 0 skipped**. That suite was not rerun during the
real-session request task described below.

### Controlled real Clerk request

After a prior request returned `503` because Clerk `auth()` could not detect middleware context,
the proxy was relocated:

- Before: root-level `proxy.ts`.
- After: `src/proxy.ts`.
- File contents were preserved exactly.
- SHA-256 before and after relocation:
  `1A89805B67E3ED1A768B673320724CA546E5D361ED98BC0532F4D2CAD9DAFA2A`.
- The compiled middleware entry references `src/proxy.ts`, and the live development request log
  confirms proxy execution.

The controlled development test used a real Clerk development session for the approved test user:

- A Clerk development session was created successfully.
- A short-lived session token was obtained through the reviewed development-only SDK procedure.
- Exactly one authenticated request was sent to `GET /api/stage-b/probe`.
- HTTP response: `200`.
- Response shape: valid `{ rows: [...] }`.
- Returned rows: exactly one.
- Synthetic resource label: `stage-b-clerk-session-test-resource`.
- No unrelated rows were returned.
- The Clerk session was revoked successfully.

The request emitted all six diagnostic phases:

1. `route_handler_entered`
2. `run_as_active_employee_entered`
3. `clerk_subject_verified`
4. `database_transaction_callback_entered`
5. `active_employee_link_verified`
6. `probe_resource_query_completed`

This demonstrates the real Clerk request path for the synthetic probe: server-side Clerk
authentication, subject verification, active employee-link authorization, restricted database-role
execution, transaction-scoped identity context, RLS-filtered resource access, and expected
synthetic resource isolation.

### Temporary fixture cleanup

The two temporary Clerk-session fixtures were removed through the separately reviewed cleanup
transaction:

- `dhoip.stage_b_employee_link` fixture ID:
  `6b8f6f6e-9c2a-4b7a-9f3e-1c7d5a2b8e01`.
- `dhoip.stage_b_probe_resource` fixture ID:
  `6b8f6f6e-9c2a-4b7a-9f3e-1c7d5a2b8e02`.

Cleanup characteristics:

- Executed in the Supabase development project.
- Used the reviewed atomic transaction.
- Required `current_user = 'postgres'`.
- Deleted the probe-resource fixture before the employee-link fixture.
- Included exact fixture identity checks, deletion row-count checks, and post-deletion checks.
- The operator reports successful execution.

No database output, row counts, or live post-cleanup state were independently verified by the
agent. This cleanup evidence is operator-reported, not agent-verified. The seeded probe fixtures
remain separate, and the nine-test live suite was not rerun during cleanup. The real-session request
test is not immediately repeatable without recreating the approved temporary fixtures.

### Manual one-off diagnostic

A separate read-only diagnostic previously connected through the actual client and confirmed
`current_user = dhoip_app`, `session_user = dhoip_app`, and the PostgreSQL server version. That was
a one-off diagnostic, not a permanent test. The permanent session-identity assertion is now in the
actual-helper live test.

## 8. `runAsActiveEmployee` findings

Inspection of `src/server/auth/require-employee.ts` confirms:

- It obtains the identity through `getVerifiedClerkSubject()`.
- `getVerifiedClerkSubject()` calls server-side Clerk `auth()` and accepts only the verified
  `userId`; it does not accept a client-supplied identity.
- `runAsActiveEmployee` passes only the verified `sub` to the same
  `withAuthenticatedTransaction` helper.
- `requireActiveStageBEmployee` is called before the protected callback, so an inactive, revoked, or
  unlinked identity cannot reach the callback.
- The route `GET /api/stage-b/probe` is the current caller and is production-disabled.

A real Clerk development-session request now exercises this path successfully. The request reached
`runAsActiveEmployee`, `getVerifiedClerkSubject()` completed with a verified Clerk subject, the
active employee link was resolved, and the RLS-filtered probe query completed.

Remaining limitations: there is no interactive sign-in UI or Clerk provider, so browser sign-in,
MFA, and session-task behavior are not demonstrated. The request used a controlled development
session created through the reviewed testing SDK procedure. Mocked `getVerifiedClerkSubject` tests
still do not prove real Clerk authentication; the real-session test is separate evidence.

## 9. Rollback and limitation of data-rollback proof

The callback-failure test proves:

- the callback error propagates;
- the failed transaction does not leave an authenticated transaction-local context;
- a later transaction cannot reuse the failed subject;
- the pooled application connection returns to the `dhoip_app` session identity without claims.

It does **not** prove rollback of user data because these tests intentionally perform no persistent
writes. Proving actual row rollback would require approved synthetic write permissions and a
dedicated test setup; that is outside the current read-only Stage B probe and was not added.

## 10. Not verified and remaining evidence gaps

- Interactive browser sign-in, a Clerk provider/sign-in UI, MFA, session tasks, and broader
  adversarial token/session testing are not verified.
- The real Clerk development-session request path is demonstrated for the synthetic probe; the
  synthetic probe's RLS is validated only for that tested configuration.
- Production authorization, role, permission, and department models are not verified.
- Transaction-pooler behavior with the helper is not tested.
- Supabase Data API exposure was not checked in the project dashboard.
- No production employee, role, permission, department, or authorization schema exists.
- No durable or tamper-resistant audit exists for the probe.
- No migration history, backup/restore, monitoring, concurrency, deployment, or production
  operational evidence exists.
- Lint is not configured in the repository; no lint command exists.
- The full audit still reports four moderate development-tooling findings in the
  `drizzle-kit`/`@esbuild-kit` chain; the suggested fix downgrades `drizzle-kit` and was not applied.

## 11. Evidence required to exit the spike

Before this work can be described as production-ready or used beyond synthetic development, a
reviewer still needs:

1. an approved synthetic data-rollback test if data rollback is a required proof;
2. broader adversarial authentication/token/session tests and interactive sign-in, MFA, and
   session-task evidence where those behaviors are in scope;
3. a documented Data API exposure decision;
4. transaction-pooler/helper evidence if that mode will be used in hosting;
5. production employee, role, permission, and audit designs;
6. backup, restore, monitoring, deployment, and operational evidence;
7. security/privacy review and explicit human approval. RLS must not be described as
   production-validated before that review.

## 12. Rollback and removal

Run `scripts/stage-b/probe-down.sql` to remove only the two Stage B probe tables. It uses no
`CASCADE`, so unexpected dependencies cause a failure rather than removing unrelated objects. It
intentionally retains the `dhoip` schema and the `dhoip_app` role; remove either manually only after
confirming that no other development work depends on them.

The temporary Clerk-session fixtures have been cleaned up per operator report. The seeded probe
fixtures and the probe schema/tables remain intact. Repeating the real-session test requires
recreating the approved temporary fixtures. The application files are additive; the existing M1
patient preview and its production guard were not modified.

## 13. Related documents

- [`../../README.md`](../../README.md)
- [`../../scripts/stage-b/README.md`](../../scripts/stage-b/README.md)
- [`../00-governance/STATUS_AND_APPROVAL.md`](../00-governance/STATUS_AND_APPROVAL.md)
- [`../00-governance/PRODUCTION_READINESS_REGISTER.md`](../00-governance/PRODUCTION_READINESS_REGISTER.md)
- [`PATIENT_REGISTRY_M1.md`](PATIENT_REGISTRY_M1.md)
- [`ARCHITECTURE_FOUNDATION.md`](ARCHITECTURE_FOUNDATION.md)
