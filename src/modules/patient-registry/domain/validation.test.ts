import { describe, expect, it } from "vitest";
import {
  parseRegisterPatientInput,
  parseSearchPatientsInput,
} from "./validation";

const NOW = new Date("2026-06-15T10:00:00.000Z");

const BASE_INPUT = {
  familyName: "Yusuf",
  givenName: "Amina",
  middleName: "Halima",
  preferredName: "",
  sex: "female",
  dateOfBirth: "1990-05-12",
  estimatedAgeValue: "",
  estimatedAgeUnit: "",
  estimatedAgeAsOf: "",
  primaryPhone: "0803 123 4567",
  secondaryPhone: "",
  email: "Amina.Yusuf@Example.test",
  addressLine1: "5 Allen Avenue",
  addressLine2: "Ikeja",
  city: "Lagos",
  state: "Lagos",
  postalCode: "100281",
  nextOfKinName: "Ibrahim Yusuf",
  nextOfKinRelationship: "Spouse",
  nextOfKinPhone: "0803 123 4568",
};

describe("registration validation", () => {
  it("normalizes a valid exact-date registration", () => {
    const parsed = parseRegisterPatientInput(BASE_INPUT, NOW);

    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(parsed.value.primaryPhone).toBe("+2348031234567");
      expect(parsed.value.nextOfKinPhone).toBe("+2348031234568");
      expect(parsed.value.email).toBe("amina.yusuf@example.test");
      expect(parsed.value.state).toBe("Lagos");
      expect(parsed.value.dateOfBirth).toBe("1990-05-12");
      expect(parsed.value.estimatedAgeValue).toBe("");
    }
  });

  it("preserves an estimated age without inventing a date of birth", () => {
    const parsed = parseRegisterPatientInput(
      {
        ...BASE_INPUT,
        dateOfBirth: "",
        estimatedAgeValue: "34",
        estimatedAgeUnit: "years",
        estimatedAgeAsOf: "2026-01-15",
      },
      NOW,
    );

    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(parsed.value.dateOfBirth).toBe("");
      expect(parsed.value.estimatedAgeValue).toBe("34");
      expect(parsed.value.estimatedAgeUnit).toBe("years");
      expect(parsed.value.estimatedAgeAsOf).toBe("2026-01-15");
    }
  });

  it("rejects both an exact date of birth and an estimate", () => {
    const parsed = parseRegisterPatientInput(
      {
        ...BASE_INPUT,
        estimatedAgeValue: "34",
        estimatedAgeUnit: "years",
        estimatedAgeAsOf: "2026-01-15",
      },
      NOW,
    );

    expect(parsed.ok).toBe(false);
    if (!parsed.ok) {
      expect(parsed.errors.dateOfBirth).toMatch(/either/i);
    }
  });

  it("rejects future dates and out-of-range estimates", () => {
    const futureDob = parseRegisterPatientInput(
      { ...BASE_INPUT, dateOfBirth: "2026-07-01" },
      NOW,
    );
    expect(futureDob.ok).toBe(false);
    if (!futureDob.ok) {
      expect(futureDob.errors.dateOfBirth).toMatch(/future/i);
    }

    const futureEstimate = parseRegisterPatientInput(
      {
        ...BASE_INPUT,
        dateOfBirth: "",
        estimatedAgeValue: "34",
        estimatedAgeUnit: "years",
        estimatedAgeAsOf: "2026-07-01",
      },
      NOW,
    );
    expect(futureEstimate.ok).toBe(false);

    const excessiveAge = parseRegisterPatientInput(
      {
        ...BASE_INPUT,
        dateOfBirth: "",
        estimatedAgeValue: "131",
        estimatedAgeUnit: "years",
        estimatedAgeAsOf: "2026-01-15",
      },
      NOW,
    );
    expect(excessiveAge.ok).toBe(false);
    if (!excessiveAge.ok) {
      expect(excessiveAge.errors.estimatedAgeValue).toBeDefined();
    }
  });

  it("requires an exact date or an estimate", () => {
    const parsed = parseRegisterPatientInput(
      {
        ...BASE_INPUT,
        dateOfBirth: "",
        estimatedAgeValue: "",
        estimatedAgeAsOf: "",
      },
      NOW,
    );

    expect(parsed.ok).toBe(false);
    if (!parsed.ok) {
      expect(parsed.errors.estimatedAgeValue).toBeDefined();
      expect(parsed.errors.estimatedAgeAsOf).toBeDefined();
    }
  });

  it("rejects ambiguous phone numbers and invalid contact fields", () => {
    const parsed = parseRegisterPatientInput(
      {
        ...BASE_INPUT,
        primaryPhone: "8031234567",
        email: "not-an-email",
        postalCode: "123",
        state: "Lagos State",
      },
      NOW,
    );

    expect(parsed.ok).toBe(false);
    if (!parsed.ok) {
      expect(parsed.errors.primaryPhone).toBeDefined();
      expect(parsed.errors.email).toBeDefined();
      expect(parsed.errors.postalCode).toBeDefined();
      expect(parsed.errors.state).toBeDefined();
    }
  });

  it("requires next-of-kin details", () => {
    const parsed = parseRegisterPatientInput(
      {
        ...BASE_INPUT,
        nextOfKinName: "",
        nextOfKinRelationship: "",
        nextOfKinPhone: "",
      },
      NOW,
    );

    expect(parsed.ok).toBe(false);
    if (!parsed.ok) {
      expect(parsed.errors.nextOfKinName).toBeDefined();
      expect(parsed.errors.nextOfKinRelationship).toBeDefined();
      expect(parsed.errors.nextOfKinPhone).toBeDefined();
    }
  });
});

describe("search validation", () => {
  it("requires at least two characters", () => {
    const parsed = parseSearchPatientsInput({ query: "a" }, NOW);
    expect(parsed.ok).toBe(false);
    if (!parsed.ok) {
      expect(parsed.errors.query).toBeDefined();
    }
  });

  it("accepts an exact date of birth without a text query", () => {
    const parsed = parseSearchPatientsInput(
      { query: "", dateOfBirth: "1990-05-12" },
      NOW,
    );

    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(parsed.value.query).toBe("");
      expect(parsed.value.dateOfBirth).toBe("1990-05-12");
    }
  });

  it("rejects an empty query without a date of birth", () => {
    const parsed = parseSearchPatientsInput({ query: "" }, NOW);
    expect(parsed.ok).toBe(false);
    if (!parsed.ok) {
      expect(parsed.errors.query).toBeDefined();
    }
  });

  it("accepts a name or hospital ID with an optional exact date", () => {
    const parsed = parseSearchPatientsInput(
      { query: "D2C-2026-000001", dateOfBirth: "1990-05-12" },
      NOW,
    );

    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(parsed.value.query).toBe("D2C-2026-000001");
      expect(parsed.value.dateOfBirth).toBe("1990-05-12");
    }
  });

  it("rejects a future search date", () => {
    const parsed = parseSearchPatientsInput(
      { query: "Yusuf", dateOfBirth: "2026-07-01" },
      NOW,
    );

    expect(parsed.ok).toBe(false);
  });
});
