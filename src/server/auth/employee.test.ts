import { describe, expect, it } from "vitest";
import {
  toActiveStageBEmployee,
  type StageBEmployeeLink,
} from "./employee";

function link(
  status: StageBEmployeeLink["status"],
): StageBEmployeeLink {
  return {
    clerkUserId: "user_stage_b_active_a",
    employeeRef: "stage-b-employee-active-a",
    status,
  };
}

describe("toActiveStageBEmployee", () => {
  it("accepts only an active employee link", () => {
    expect(toActiveStageBEmployee(link("active"))).toEqual({
      clerkUserId: "user_stage_b_active_a",
      employeeRef: "stage-b-employee-active-a",
    });
  });

  it("rejects inactive and revoked employee links", () => {
    expect(toActiveStageBEmployee(link("inactive"))).toBeNull();
    expect(toActiveStageBEmployee(link("revoked"))).toBeNull();
  });

  it("rejects an unlinked identity", () => {
    expect(toActiveStageBEmployee(null)).toBeNull();
  });
});
