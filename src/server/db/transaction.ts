import { sql } from "drizzle-orm";
import type { VerifiedClerkSubject } from "@/server/auth/clerk";
import type { StageBDiagnosticSink } from "@/server/auth/stage-b-diagnostic";
import { getDb } from "./client";

export type DbTransaction = Parameters<
  Parameters<ReturnType<typeof getDb>["transaction"]>[0]
>[0];

export type VerifiedDatabaseClaims = {
  sub: string;
  role: "authenticated";
};

export function claimsFor(
  subject: VerifiedClerkSubject,
): VerifiedDatabaseClaims {
  return { sub: subject.sub, role: "authenticated" };
}

export async function setTransactionIdentity(
  tx: DbTransaction,
  claims: VerifiedDatabaseClaims,
): Promise<void> {
  await tx.execute(
    sql`select set_config('request.jwt.claims', ${JSON.stringify(claims)}, true)`,
  );
  await tx.execute(
    sql`select set_config('request.jwt.claim.sub', ${claims.sub}, true)`,
  );
  await tx.execute(sql.raw("SET LOCAL ROLE authenticated"));
}

export async function withAuthenticatedTransaction<T>(
  subject: VerifiedClerkSubject,
  operation: (tx: DbTransaction) => Promise<T>,
  diagnostics?: StageBDiagnosticSink,
): Promise<T> {
  return getDb().transaction(async (tx) => {
    diagnostics?.phase("database_transaction_callback_entered");

    await setTransactionIdentity(tx, claimsFor(subject));
    return operation(tx);
  });
}
