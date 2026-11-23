import { describe, expect, it } from "vitest";
import { claimsFor } from "./transaction";

describe("claimsFor", () => {
  it("builds only the verified subject and authenticated role claims", () => {
    const claims = claimsFor({ sub: "user_stage_b_active_a" });

    expect(claims).toEqual({
      sub: "user_stage_b_active_a",
      role: "authenticated",
    });
    expect(Object.keys(claims).sort()).toEqual(["role", "sub"]);
  });
});
