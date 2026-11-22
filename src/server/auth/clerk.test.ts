import { describe, expect, it } from "vitest";
import {
  getVerifiedClerkSubject,
  UnauthenticatedError,
} from "./clerk";

describe("getVerifiedClerkSubject", () => {
  it("rejects a request without a Clerk user", async () => {
    await expect(
      getVerifiedClerkSubject(async () => ({ userId: null })),
    ).rejects.toBeInstanceOf(UnauthenticatedError);
  });

  it("uses the server-verified Clerk user ID as the subject", async () => {
    await expect(
      getVerifiedClerkSubject(async () => ({
        userId: "user_stage_b_active_a",
      })),
    ).resolves.toEqual({ sub: "user_stage_b_active_a" });
  });

  it("rejects an empty Clerk user ID", async () => {
    await expect(
      getVerifiedClerkSubject(async () => ({ userId: "" })),
    ).rejects.toBeInstanceOf(UnauthenticatedError);
  });
});
