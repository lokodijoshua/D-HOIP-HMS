import { eq } from "drizzle-orm";
import {
  stageBEmployeeLink,
  type StageBEmployeeStatus,
} from "@/server/db/stage-b-schema";
import type { DbTransaction } from "@/server/db/transaction";

export type StageBEmployeeLink = {
  clerkUserId: string;
  employeeRef: string;
  status: StageBEmployeeStatus;
};

export type StageBEmployee = {
  clerkUserId: string;
  employeeRef: string;
};

export class EmployeeAccessDeniedError extends Error {
  constructor() {
    super("An active employee link is required.");
    this.name = "EmployeeAccessDeniedError";
  }
}

export function toActiveStageBEmployee(
  link: StageBEmployeeLink | null,
): StageBEmployee | null {
  if (!link || link.status !== "active") {
    return null;
  }

  return {
    clerkUserId: link.clerkUserId,
    employeeRef: link.employeeRef,
  };
}

export async function findStageBEmployee(
  tx: DbTransaction,
  clerkUserId: string,
): Promise<StageBEmployeeLink | null> {
  const [row] = await tx
    .select({
      clerkUserId: stageBEmployeeLink.clerkUserId,
      employeeRef: stageBEmployeeLink.employeeRef,
      status: stageBEmployeeLink.status,
    })
    .from(stageBEmployeeLink)
    .where(eq(stageBEmployeeLink.clerkUserId, clerkUserId))
    .limit(1);

  return row ?? null;
}

export async function requireActiveStageBEmployee(
  tx: DbTransaction,
  clerkUserId: string,
): Promise<StageBEmployee> {
  const employee = toActiveStageBEmployee(
    await findStageBEmployee(tx, clerkUserId),
  );

  if (!employee) {
    throw new EmployeeAccessDeniedError();
  }

  return employee;
}
