import { afterEach, describe, expect, it } from "vitest";
import {
  PATIENT_PREVIEW_UNAVAILABLE_MESSAGE,
  PatientPreviewUnavailableError,
  assertPatientPreviewEnabled,
  isPatientPreviewEnabled,
} from "./preview-guard";

const ORIGINAL_SWITCH = process.env.PATIENT_PREVIEW_ENABLED;

afterEach(() => {
  if (ORIGINAL_SWITCH === undefined) {
    delete process.env.PATIENT_PREVIEW_ENABLED;
  } else {
    process.env.PATIENT_PREVIEW_ENABLED = ORIGINAL_SWITCH;
  }
});

describe("patient preview production guard", () => {
  it("enables the preview outside production", () => {
    expect(isPatientPreviewEnabled("development")).toBe(true);
    expect(isPatientPreviewEnabled("test")).toBe(true);
    expect(() => assertPatientPreviewEnabled("development")).not.toThrow();
  });

  it("fails closed in production", () => {
    expect(isPatientPreviewEnabled("production")).toBe(false);
    expect(() => assertPatientPreviewEnabled("production")).toThrow(
      PatientPreviewUnavailableError,
    );
    expect(() => assertPatientPreviewEnabled("production")).toThrow(
      PATIENT_PREVIEW_UNAVAILABLE_MESSAGE,
    );
  });

  it("cannot be enabled in production by configuration", () => {
    process.env.PATIENT_PREVIEW_ENABLED = "true";
    process.env.PATIENT_PREVIEW_MODE = "synthetic";

    expect(isPatientPreviewEnabled("production")).toBe(false);
    expect(() => assertPatientPreviewEnabled("production")).toThrow(
      PatientPreviewUnavailableError,
    );
  });
});
