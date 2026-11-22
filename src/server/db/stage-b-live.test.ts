import { sql as drizzleSql } from "drizzle-orm";
import postgres, { type TransactionSql } from "postgres";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  EmployeeAccessDeniedError,
  requireActiveStageBEmployee,
} from "@/server/auth/employee";
import { closeDb, getDb } from "@/server/db/client";
import { stageBProbeResource } from "@/server/db/stage-b-schema";
import { withAuthenticatedTransaction } from "@/server/db/transaction";

const databaseUrl = process.env.DATABASE_URL;
const liveEnabled =
  process.env.STAGE_B_LIVE_TESTS === "1" && Boolean(databaseUrl);
const describeLive = liveEnabled ? describe : describe.skip;

type ProbeRow = {
  id: string;
  label: string;
  clerk_user_id: string;
};

function rowsOf<T>(result: unknown): T[] {
  return Array.isArray(result) ? (result as T[]) : [];
}

describeLive(
  "Stage B live database claims and RLS probe (requires DATABASE_URL, STAGE_B_LIVE_TESTS=1, and probe-up.sql)",
  () => {
    let sql: ReturnType<typeof postgres>;

    beforeAll(() => {
      sql = postgres(databaseUrl!, { max: 1, prepare: false });
    });

    afterAll(async () => {
      await sql?.end({ timeout: 5 });
      await closeDb();
    });

    async function withClaims<T>(
      sub: string,
      operation: (tx: TransactionSql) => Promise<T>,
    ): Promise<T> {
      return sql.begin(async (tx) => {
        const claims = JSON.stringify({ sub, role: "authenticated" });
        await tx`select set_config('request.jwt.claims', ${claims}, true)`;
        await tx`select set_config('request.jwt.claim.sub', ${sub}, true)`;
        await tx.unsafe("SET LOCAL ROLE authenticated");
        return operation(tx);
      });
    }

    async function withRoleWithoutClaims<T>(
      operation: (tx: TransactionSql) => Promise<T>,
    ): Promise<T> {
      return sql.begin(async (tx) => {
        await tx.unsafe("SET LOCAL ROLE authenticated");
        return operation(tx);
      });
    }

    async function readResources(tx: TransactionSql): Promise<ProbeRow[]> {
      const rows = await tx`
        select id::text as id, label, clerk_user_id
        from dhoip.stage_b_probe_resource
        order by label
      `;

      return rows as unknown as ProbeRow[];
    }

    it("uses the verified subject and returns only the active employee's row", async () => {
      const result = await withClaims(
        "user_stage_b_active_a",
        async (tx) => {
          const [identity] = await tx<{
            jwt: { sub?: string; role?: string } | null;
            current_role: string;
            session_role: string;
          }[]>`
            select
              auth.jwt() as jwt,
              current_user::text as current_role,
              session_user::text as session_role
          `;
          const [role] = await tx<{ rolbypassrls: boolean }[]>`
            select rolbypassrls
            from pg_roles
            where rolname = current_user
          `;

          return {
            identity,
            role,
            resources: await readResources(tx),
          };
        },
      );

      expect(result.identity.jwt).toMatchObject({
        sub: "user_stage_b_active_a",
        role: "authenticated",
      });
      expect(result.identity.current_role).toBe("authenticated");
      expect(result.identity.session_role).not.toBe("authenticated");
      expect(result.role.rolbypassrls).toBe(false);
      expect(result.resources.map((row) => row.label)).toEqual(["Active A"]);
    });

    it("does not expose one active employee's row to another identity", async () => {
      const rows = await withClaims(
        "user_stage_b_active_b",
        readResources,
      );

      expect(rows.map((row) => row.label)).toEqual(["Active B"]);
    });

    it("denies unlinked, inactive, and revoked identities", async () => {
      for (const sub of [
        "user_stage_b_unlinked",
        "user_stage_b_inactive",
        "user_stage_b_revoked",
      ]) {
        await expect(
          withClaims(sub, readResources),
        ).resolves.toEqual([]);
      }
    });

    it("does not leak claims or rows after a committed transaction", async () => {
      await withClaims("user_stage_b_active_a", readResources);

      const rows = await withRoleWithoutClaims(readResources);
      expect(rows).toEqual([]);
    });

    it("uses a runtime role that owns no probe table and does not bypass RLS", async () => {
      const [connection] = await sql<{
        session_role: string;
        rolbypassrls: boolean;
      }[]>`
        select
          session_user::text as session_role,
          (select rolbypassrls from pg_roles where rolname = session_user) as rolbypassrls
      `;
      const tables = await sql<{
        relname: string;
        relrowsecurity: boolean;
        relforcerowsecurity: boolean;
        owner: string;
      }[]>`
        select
          c.relname,
          c.relrowsecurity,
          c.relforcerowsecurity,
          pg_get_userbyid(c.relowner) as owner
        from pg_class c
        join pg_namespace n on n.oid = c.relnamespace
        where n.nspname = 'dhoip'
          and c.relname in ('stage_b_employee_link', 'stage_b_probe_resource')
        order by c.relname
      `;

      expect(connection.rolbypassrls).toBe(false);
      expect(tables).toHaveLength(2);

      for (const table of tables) {
        expect(table.relrowsecurity).toBe(true);
        expect(table.relforcerowsecurity).toBe(true);
        expect(table.owner).not.toBe(connection.session_role);
      }
    });

    it("actual helper uses dhoip_app session identity and authenticated transaction claims", async () => {
      const result = await withAuthenticatedTransaction(
        { sub: "user_stage_b_active_a" },
        async (tx) => {
          const [identity] = rowsOf<{
            session_user: string;
            current_user: string;
            jwt_sub: string | null;
          }>(await tx.execute(drizzleSql`
            select
              session_user::text as session_user,
              current_user::text as current_user,
              auth.jwt() ->> 'sub' as jwt_sub
          `));
          const employee = await requireActiveStageBEmployee(
            tx,
            "user_stage_b_active_a",
          );
          const resources = await tx
            .select({ label: stageBProbeResource.label })
            .from(stageBProbeResource);

          return {
            identity,
            employee,
            labels: resources.map((row) => row.label),
          };
        },
      );

      expect(result.identity?.session_user).toBe("dhoip_app");
      expect(result.identity?.current_user).toBe("authenticated");
      expect(result.identity?.jwt_sub).toBe("user_stage_b_active_a");
      expect(result.employee.employeeRef).toBe("stage-b-employee-active-a");
      expect(result.labels).toEqual(["Active A"]);
    });

    it("actual helper isolates active A and active B probe resources", async () => {
      const readLabels = async (sub: string) =>
        withAuthenticatedTransaction({ sub }, async (tx) => {
          const resources = await tx
            .select({ label: stageBProbeResource.label })
            .from(stageBProbeResource);
          return resources.map((row) => row.label);
        });

      const activeA = await readLabels("user_stage_b_active_a");
      const activeB = await readLabels("user_stage_b_active_b");

      expect(activeA).toEqual(["Active A"]);
      expect(activeB).toEqual(["Active B"]);
      expect(activeA).not.toContain("Active B");
      expect(activeB).not.toContain("Active A");
    });

    it("actual helper denies inactive, revoked, and unlinked identities", async () => {
      for (const sub of [
        "user_stage_b_inactive",
        "user_stage_b_revoked",
        "user_stage_b_unlinked",
      ]) {
        await expect(
          withAuthenticatedTransaction({ sub }, (tx) =>
            requireActiveStageBEmployee(tx, sub),
          ),
        ).rejects.toBeInstanceOf(EmployeeAccessDeniedError);
      }
    });

    it("actual helper propagates callback failure and clears transaction context", async () => {
      const failure = new Error("stage-b callback failure");

      await expect(
        withAuthenticatedTransaction(
          { sub: "user_stage_b_active_a" },
          async (tx) => {
            const [identity] = rowsOf<{
              current_user: string;
              jwt_sub: string | null;
            }>(await tx.execute(drizzleSql`
              select
                current_user::text as current_user,
                auth.jwt() ->> 'sub' as jwt_sub
            `));

            expect(identity?.current_user).toBe("authenticated");
            expect(identity?.jwt_sub).toBe("user_stage_b_active_a");
            throw failure;
          },
        ),
      ).rejects.toBe(failure);

      const afterFailure = await getDb().transaction(async (tx) => {
        const [identity] = rowsOf<{
          session_user: string;
          current_user: string;
          jwt_claims: string | null;
          jwt_sub_claim: string | null;
        }>(await tx.execute(drizzleSql`
          select
            session_user::text as session_user,
            current_user::text as current_user,
            nullif(current_setting('request.jwt.claims', true), '') as jwt_claims,
            nullif(current_setting('request.jwt.claim.sub', true), '') as jwt_sub_claim
        `));

        return identity;
      });

      expect(afterFailure?.session_user).toBe("dhoip_app");
      expect(afterFailure?.current_user).toBe("dhoip_app");
      expect(afterFailure?.jwt_claims).toBeNull();
      expect(afterFailure?.jwt_sub_claim).toBeNull();

      const followUp = await withAuthenticatedTransaction(
        { sub: "user_stage_b_active_b" },
        async (tx) => {
          const [identity] = rowsOf<{
            current_user: string;
            jwt_sub: string | null;
          }>(await tx.execute(drizzleSql`
            select
              current_user::text as current_user,
              auth.jwt() ->> 'sub' as jwt_sub
          `));
          const resources = await tx
            .select({ label: stageBProbeResource.label })
            .from(stageBProbeResource);

          return {
            identity,
            labels: resources.map((row) => row.label),
          };
        },
      );

      expect(followUp.identity?.current_user).toBe("authenticated");
      expect(followUp.identity?.jwt_sub).toBe("user_stage_b_active_b");
      expect(followUp.labels).toEqual(["Active B"]);
    });
  },
);
