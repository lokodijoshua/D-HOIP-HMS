import { getVerifiedClerkSubject } from "./clerk";
import type { StageBDiagnosticSink } from "./stage-b-diagnostic";
import {
  requireActiveStageBEmployee,
  type StageBEmployee,
} from "./employee";
import {
  withAuthenticatedTransaction,
  type DbTransaction,
} from "@/server/db/transaction";

export async function runAsActiveEmployee<T>(
  operation: (tx: DbTransaction, employee: StageBEmployee) => Promise<T>,
  diagnostics?: StageBDiagnosticSink,
): Promise<T> {
  diagnostics?.phase("run_as_active_employee_entered");

  const subject = await getVerifiedClerkSubject();
  diagnostics?.phase("clerk_subject_verified");

  return withAuthenticatedTransaction(subject, async (tx) => {
    const employee = await requireActiveStageBEmployee(tx, subject.sub);
    diagnostics?.phase("active_employee_link_verified");
    return operation(tx, employee);
  }, diagnostics);
}
