import { afterEach, describe, expect, it, vi } from "vitest";

const serviceState = vi.hoisted(() => ({
  getService: vi.fn(() => {
    throw new Error("Patient registry service must not initialize.");
  }),
}));

vi.mock("./service", () => ({
  getPatientRegistryService: serviceState.getService,
}));

import { registerPatientAction, searchPatientsAction } from "./actions";
import { PatientPreviewUnavailableError } from "./preview-guard";

afterEach(() => {
  vi.unstubAllEnvs();
  serviceState.getService.mockClear();
});

describe("patient server actions in production", () => {
  it("rejects search before service initialization", async () => {
    vi.stubEnv("NODE_ENV", "production");

    await expect(
      searchPatientsAction({ query: "Yusuf" }),
    ).rejects.toBeInstanceOf(PatientPreviewUnavailableError);
    expect(serviceState.getService).not.toHaveBeenCalled();
  });

  it("rejects registration before service initialization", async () => {
    vi.stubEnv("NODE_ENV", "production");

    await expect(
      registerPatientAction({ familyName: "Yusuf" }, {}),
    ).rejects.toBeInstanceOf(PatientPreviewUnavailableError);
    expect(serviceState.getService).not.toHaveBeenCalled();
  });
});
