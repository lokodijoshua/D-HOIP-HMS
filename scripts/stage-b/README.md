# Stage B Security Probe

This directory contains the repeatable, non-patient Stage B database probe for the Clerk and
Supabase/Drizzle security spike. It is synthetic test infrastructure, not a production schema or
authorization system.

The probe has two purposes:

1. prove that transaction-local JWT claims and `SET LOCAL ROLE authenticated` reach PostgreSQL and
   row-level security; and
2. prove positive and negative behavior for active, inactive, revoked, unlinked, and different
   identities without using patient data.

## Preconditions

- A dedicated non-production Supabase project.
- A Clerk development application.
- No real patient or hospital data in the database, terminal history, screenshots, or test output.
- A separately provisioned `dhoip_app` runtime login, never the service role, an administrative
  role, a superuser, or a `BYPASSRLS` role.
- A separate migration/admin identity to run the probe SQL and role provisioning.

## Prepare the runtime role securely

Do this as the migration/admin identity. The probe does **not** create the role, grant membership,
or set a password. Never put a password in SQL, source control, documentation, or command history.

Use an approved secure administrative path to create the role and set its password. The SQL below
creates the role and grants membership only; it does not contain a password.

Role creation and membership grant:

```sql
-- Create only if absent. This statement sets no password; set it separately.
CREATE ROLE dhoip_app LOGIN NOINHERIT NOBYPASSRLS;

-- Required membership so the runtime can execute SET LOCAL ROLE authenticated.
GRANT authenticated TO dhoip_app;
```

Verification queries:

```sql
SELECT rolname, rolcanlogin, rolinherit, rolbypassrls, rolsuper
FROM pg_roles
WHERE rolname = 'dhoip_app';

SELECT granted_role.rolname AS granted_role, member_role.rolname AS member_role
FROM pg_auth_members m
JOIN pg_roles granted_role ON granted_role.oid = m.roleid
JOIN pg_roles member_role ON member_role.oid = m.member
WHERE member_role.rolname = 'dhoip_app';
```

Required result: `LOGIN`, `NOINHERIT`, `NOBYPASSRLS`, not superuser, and direct membership in
`authenticated`. Do not silently alter an existing role; recreate it through an approved
administrative process if its attributes are wrong.

## Apply the probe

Run `probe-up.sql` in the Supabase SQL Editor or another approved migration/admin connection. It:

- refuses to run as `dhoip_app` or another known runtime role;
- validates the existing `dhoip_app` role and its `authenticated` membership;
- requires the migration/admin identity running the script to own the `dhoip` schema and both probe
  tables, rejects runtime or unexpected ownership, and never transfers ownership;
- refuses a `dhoip` schema containing unrelated relations;
- creates the synthetic probe tables only if absent and validates their columns, primary keys,
  unique constraint, and status check;
- seeds the synthetic identities before RLS is enabled or forced;
- enables and forces RLS, creates only the probe policies, and grants only `SELECT` on the probe
  tables to `authenticated`;
- does not revoke schema-wide privileges from `PUBLIC` or `anon`;
- refuses to re-run while the probe tables already have RLS enabled.

The required status constraint is exactly `status IN ('active', 'inactive', 'revoked')`, normalized
by PostgreSQL to `status = ANY (ARRAY['active'::text, 'inactive'::text, 'revoked'::text])`. The
probe rejects extra values, duplicate values, or additional boolean conditions.

Reapplying requires `probe-down.sql` followed by `probe-up.sql`. Do not disable or weaken RLS to
make seeding easier.

## Configure local environment

Keep the exact existing names in an ignored local environment file; never commit it:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `DATABASE_URL`
- `STAGE_B_LIVE_TESTS`

`DATABASE_URL` must use the dedicated `dhoip_app` identity and remote TLS with
`sslmode=require`. Do not use a service-role key or an administrative database role. Do not modify
`.env.local` as part of probe review; change it only through the approved environment procedure.

| Connection mode | Typical Supabase endpoint | Use |
|---|---|---|
| Direct | Direct database host, port 5432 | Initial local development spike; TLS required. |
| Session pooler | Pooler host, port 5432 | Development fallback if direct is unavailable; verify TLS, role support, and session behavior. |
| Transaction pooler | Pooler host, port 6543 | Possible serverless runtime after validation; prepared statements are disabled and all claim/role/query work must remain in one transaction. Verify custom-role support, TLS, limits, and reset behavior. |

The connection mode is not proven by the URL alone. Validate it before production hosting.

**Current environment:** the development probe is applied using the Session Pooler on port 5432
with TLS and the dedicated `dhoip_app` runtime identity. The synthetic probe and actual-helper live
tests pass. Do not record the connection URL or credentials here. Production hosting and
transaction-pooler behavior remain unvalidated.

## Run checks

```powershell
npm run test
npm run typecheck
```

`src/server/db/stage-b-live.test.ts` runs only when `DATABASE_URL` is set and
`STAGE_B_LIVE_TESTS=1`. The live file contains five raw-connection RLS tests and four actual-helper
tests using `withAuthenticatedTransaction` and `requireActiveStageBEmployee`. Run it with
`.env.local` loaded through Next's `@next/env` loader and the gate set only in the test process:

```text
node node_modules/vitest/vitest.mjs run src/server/db/stage-b-live.test.ts --reporter=verbose --testTimeout=30000
```

The live tests use synthetic claims for the DB/RLS proof; they do **not** prove a live Clerk
session or `runAsActiveEmployee` request integration.

The route `GET /api/stage-b/probe` is disabled in production and requires a configured Clerk
session plus an active employee link in non-production. No Clerk sign-in UI or Clerk provider is
added in Stage B. A full live Clerk-session proof needs a separately approved sign-in flow or an
approved Clerk test-session mechanism.

## Data API check

The SQL cannot prove Supabase Data API exposure. In the Supabase Dashboard, confirm that the
`dhoip` schema is not exposed through the Data API, or that exposure is explicitly configured and
reviewed. Do not expose the probe tables through the Data API.

## Remove the probe

Run `probe-down.sql` as the migration/admin identity. It drops only the two Stage B probe tables,
uses no `CASCADE`, and fails rather than removing unexpected dependent objects. It intentionally
does not drop the `dhoip` schema or the `dhoip_app` role; remove those manually only after confirming
nothing else depends on them.
