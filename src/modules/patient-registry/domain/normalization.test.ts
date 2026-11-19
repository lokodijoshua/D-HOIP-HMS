import { describe, expect, it } from "vitest";
import {
  formatPatientDateDisplay,
  isUuid,
  normalizeHospitalId,
  normalizeNameForComparison,
  normalizePhone,
} from "./normalization";
import { getLagosDateKey, getLagosYear } from "./dates";
import type { PatientIdentity } from "./types";

function identity(overrides: Partial<PatientIdentity>): PatientIdentity {
  return {
    familyName: "Yusuf",
    givenName: "Amina",
    middleName: "",
    preferredName: "",
    nameStatus: "complete",
    sex: "female",
    dateOfBirth: "1990-05-12",
    dobPrecision: "exact",
    estimatedAge: null,
    ...overrides,
  };
}

describe("name normalization", () => {
  it("normalizes case, accents, punctuation and whitespace", () => {
    expect(normalizeNameForComparison("  Chínédú   Okafor ")).toBe(
      "chinedu okafor",
    );
    expect(normalizeNameForComparison("O'Karo-Hassan")).toBe("o karo hassan");
  });
});

describe("Nigerian phone normalization", () => {
  it("normalizes local and international Nigerian forms", () => {
    expect(normalizePhone("0803 123 4567")).toBe("+2348031234567");
    expect(normalizePhone("+2348031234567")).toBe("+2348031234567");
    expect(normalizePhone("002348031234567")).toBe("+2348031234567");
    expect(normalizePhone("2348031234567")).toBe("+2348031234567");
  });

  it("keeps full international numbers without inventing a country code", () => {
    expect(normalizePhone("+44 20 7946 0958")).toBe("+442079460958");
  });

  it("rejects ambiguous or malformed numbers instead of guessing", () => {
    expect(normalizePhone("8031234567")).toBeNull();
    expect(normalizePhone("0803")).toBeNull();
    expect(normalizePhone("+234803123456")).toBeNull();
    expect(normalizePhone("0803-CALL-NOW")).toBeNull();
  });
});

describe("identifier and date helpers", () => {
  it("normalizes a hospital ID without changing its value", () => {
    expect(normalizeHospitalId(" d2c-2026-000001 ")).toBe(
      "D2C-2026-000001",
    );
    expect(normalizeHospitalId("D2C-2026-1")).toBe("");
  });

  it("validates route UUIDs", () => {
    expect(isUuid("7a1f3c2e-5b4d-4e6f-8a90-123456789abc")).toBe(true);
    expect(isUuid("not-a-uuid")).toBe(false);
  });

  it("uses the Lagos date and year", () => {
    expect(getLagosYear(new Date("2026-12-31T22:30:00.000Z"))).toBe(2026);
    expect(getLagosYear(new Date("2026-12-31T23:30:00.000Z"))).toBe(2027);
    expect(getLagosDateKey(new Date("2026-06-15T10:00:00.000Z"))).toBe(
      "2026-06-15",
    );
  });
});

describe("patient date display", () => {
  const now = new Date("2026-06-15T10:00:00.000Z");

  it("shows an exact birth date with derived age", () => {
    expect(formatPatientDateDisplay(identity({}), now)).toBe(
      "1990-05-12 (36 years)",
    );
  });

  it("shows an estimate without converting it into a birth date", () => {
    expect(
      formatPatientDateDisplay(
        identity({
          dateOfBirth: "",
          dobPrecision: "estimated",
          estimatedAge: { value: 34, unit: "years", asOf: "2026-01-15" },
        }),
        now,
      ),
    ).toBe("34 years (estimated as of 2026-01-15)");
  });

  it("shows unknown age explicitly", () => {
    expect(
      formatPatientDateDisplay(
        identity({
          dateOfBirth: "",
          dobPrecision: "unknown",
          estimatedAge: null,
        }),
        now,
      ),
    ).toBe("Unknown");
  });
});
