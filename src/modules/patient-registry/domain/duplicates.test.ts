import { describe, expect, it } from "vitest";
import { findDuplicateCandidates } from "./duplicates";
import type { PatientRecord, RegisterPatientInput } from "./types";

function input(overrides: Partial<RegisterPatientInput> = {}): RegisterPatientInput {
  return {
    familyName: "Yusuf",
    givenName: "Amina",
    middleName: "",
    preferredName: "",
    sex: "female",
    dateOfBirth: "1990-05-12",
    estimatedAgeValue: "",
    estimatedAgeUnit: "",
    estimatedAgeAsOf: "",
    primaryPhone: "08031234567",
    secondaryPhone: "",
    email: "",
    addressLine1: "5 Allen Avenue",
    addressLine2: "",
    city: "Lagos",
    state: "Lagos",
    postalCode: "",
    nextOfKinName: "Ibrahim Yusuf",
    nextOfKinRelationship: "Spouse",
    nextOfKinPhone: "08031234568",
    ...overrides,
  };
}

function patient(overrides: Partial<PatientRecord> = {}): PatientRecord {
  return {
    id: "7a1f3c2e-5b4d-4e6f-8a90-123456789abc",
    hospitalId: "D2C-2026-000001",
    identity: {
      familyName: "Yusuf",
      givenName: "Amina",
      middleName: "",
      preferredName: "",
      nameStatus: "complete",
      sex: "female",
      dateOfBirth: "1990-05-12",
      dobPrecision: "exact",
      estimatedAge: null,
    },
    contact: {
      primaryPhone: "+2348031234567",
      secondaryPhone: "",
      email: "",
    },
    address: {
      line1: "5 Allen Avenue",
      line2: "",
      city: "Lagos",
      state: "Lagos",
      postalCode: "",
      country: "Nigeria",
    },
    nextOfKin: {
      fullName: "Ibrahim Yusuf",
      relationship: "Spouse",
      phone: "+2348031234568",
    },
    identityStatus: "verified",
    registration: {
      registeredAt: "2026-06-01T10:00:00.000Z",
      registeredBy: "Synthetic Registrar",
      source: "synthetic-preview",
      duplicateReview: null,
    },
    ...overrides,
  };
}

describe("deterministic duplicate matching", () => {
  it("treats an exact hospital ID as a hard duplicate", () => {
    const candidates = findDuplicateCandidates(
      input(),
      [patient()],
      "d2c-2026-000001",
    );

    expect(candidates).toHaveLength(1);
    expect(candidates[0].strength).toBe("strong");
    expect(candidates[0].reasons).toContain("Exact hospital ID match");
    expect(candidates[0].score).toBe(100);
  });

  it("blocks on the same name and exact date of birth", () => {
    const candidates = findDuplicateCandidates(input(), [patient()]);

    expect(candidates[0].strength).toBe("strong");
    expect(candidates[0].reasons).toContain("Same family and given name");
    expect(candidates[0].reasons).toContain("Same exact date of birth");
  });

  it("blocks on the same name and primary phone", () => {
    const candidates = findDuplicateCandidates(
      input({ dateOfBirth: "1995-01-01" }),
      [patient()],
    );

    expect(candidates[0].strength).toBe("strong");
    expect(candidates[0].reasons).toContain("Same primary phone");
  });

  it("blocks on the same primary phone and exact date of birth", () => {
    const candidates = findDuplicateCandidates(
      input({ familyName: "Bello", givenName: "Fatima" }),
      [patient()],
    );

    expect(candidates[0].strength).toBe("strong");
    expect(candidates[0].reasons).toEqual(
      expect.arrayContaining([
        "Same primary phone",
        "Same exact date of birth",
      ]),
    );
  });

  it("does not block on a name match alone", () => {
    const candidates = findDuplicateCandidates(
      input({
        dateOfBirth: "1993-02-02",
        primaryPhone: "08099999999",
        nextOfKinPhone: "08099999998",
      }),
      [patient()],
    );

    expect(candidates[0].strength).toBe("possible");
    expect(candidates[0].reasons).toEqual(["Same family and given name"]);
  });

  it("does not use fuzzy name similarity as a duplicate ground", () => {
    const candidates = findDuplicateCandidates(
      input({
        givenName: "Aminah",
        dateOfBirth: "1991-01-01",
        primaryPhone: "08099999999",
        nextOfKinPhone: "08099999998",
      }),
      [patient()],
    );

    expect(candidates).toHaveLength(0);
  });

  it("flags a shared family phone as possible, not strong", () => {
    const sibling = patient({
      id: "2f7d8e9a-1b3c-4d5e-8f90-abcdef123456",
      hospitalId: "D2C-2026-000002",
      identity: {
        ...patient().identity,
        givenName: "Mary",
        dateOfBirth: "1992-03-18",
      },
      contact: {
        primaryPhone: "+2348062345678",
        secondaryPhone: "",
        email: "",
      },
      nextOfKin: {
        fullName: "Chinedu Okafor",
        relationship: "Brother",
        phone: "+2348062345678",
      },
    });

    const candidates = findDuplicateCandidates(
      input({
        familyName: "Okafor",
        givenName: "Chinedu",
        dateOfBirth: "1985-11-02",
        primaryPhone: "08062345678",
        nextOfKinPhone: "08062345679",
      }),
      [sibling],
    );

    expect(candidates[0].strength).toBe("possible");
    expect(candidates[0].reasons).toContain("Same primary phone");
    expect(candidates[0].reasons).not.toContain("Same family and given name");
  });

  it("flags a shared date of birth alone as possible, not strong", () => {
    const twin = patient({
      identity: {
        ...patient().identity,
        givenName: "Aisha",
      },
      contact: {
        primaryPhone: "+2348070000000",
        secondaryPhone: "",
        email: "",
      },
      nextOfKin: {
        ...patient().nextOfKin,
        phone: "+2348070000001",
      },
    });

    const candidates = findDuplicateCandidates(input(), [twin]);

    expect(candidates[0].strength).toBe("possible");
    expect(candidates[0].reasons).toContain("Same exact date of birth");
  });

  it("does not flag a same-family-only or same-sex-only record", () => {
    const relatives = patient({
      identity: {
        ...patient().identity,
        givenName: "Zainab",
        dateOfBirth: "1999-09-09",
      },
      contact: {
        primaryPhone: "+2348071111111",
        secondaryPhone: "",
        email: "",
      },
      nextOfKin: {
        ...patient().nextOfKin,
        phone: "+2348071111112",
      },
    });

    const candidates = findDuplicateCandidates(
      input({
        familyName: "Yusuf",
        givenName: "Amina",
        dateOfBirth: "1990-05-12",
        primaryPhone: "08070000000",
        nextOfKinPhone: "08070000001",
      }),
      [relatives],
    );

    expect(candidates).toHaveLength(0);
  });

  it("matches a conservative estimated age only when sex and date align", () => {
    const estimated = patient({
      identity: {
        ...patient().identity,
        familyName: "Bello",
        givenName: "Fatima",
        dateOfBirth: "",
        dobPrecision: "estimated",
        estimatedAge: { value: 34, unit: "years", asOf: "2026-01-15" },
      },
      contact: {
        primaryPhone: "+2348073456789",
        secondaryPhone: "",
        email: "",
      },
      nextOfKin: {
        ...patient().nextOfKin,
        phone: "+2348073456790",
      },
    });

    const candidates = findDuplicateCandidates(
      input({
        familyName: "Bello",
        givenName: "Aisha",
        dateOfBirth: "",
        estimatedAgeValue: "34",
        estimatedAgeUnit: "years",
        estimatedAgeAsOf: "2026-02-01",
        primaryPhone: "08080000000",
        nextOfKinPhone: "08080000001",
      }),
      [estimated],
    );

    expect(candidates[0].strength).toBe("possible");
    expect(candidates[0].reasons).toContain("Similar estimated age and sex");
  });
});
