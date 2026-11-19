import { describe, expect, it } from "vitest";
import { InMemoryPatientRepository } from "./repository";
import { createPatientRegistryService } from "./service";

const NOW = new Date("2026-06-15T10:00:00.000Z");

function baseInput(overrides: Record<string, unknown> = {}) {
  return {
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
    email: "amina.yusuf@example.test",
    addressLine1: "5 Allen Avenue",
    addressLine2: "Ikeja",
    city: "Lagos",
    state: "Lagos",
    postalCode: "100281",
    nextOfKinName: "Ibrahim Yusuf",
    nextOfKinRelationship: "Spouse",
    nextOfKinPhone: "0803 123 4568",
    ...overrides,
  };
}

function setup() {
  const repository = new InMemoryPatientRepository({ seed: false });
  const service = createPatientRegistryService(repository, () => NOW);
  return { repository, service };
}

describe("patient registry service", () => {
  it("registers a patient with a generated hospital ID and audit events", () => {
    const { repository, service } = setup();
    const result = service.register(baseInput(), { submissionKey: "key-1" });

    expect(result.status).toBe("registered");
    if (result.status !== "registered") {
      return;
    }

    expect(result.patient.hospitalId).toBe("D2C-2026-000001");
    expect(result.patient.identityStatus).toBe("pending");
    expect(result.patient.identity.dateOfBirth).toBe("1990-05-12");
    expect(result.patient.contact.primaryPhone).toBe("+2348031234567");
    expect(result.patient.registration.registeredBy).toBe(
      "Synthetic Registrar",
    );
    expect(repository.allPatients()).toHaveLength(1);

    const profile = service.getProfile(result.patient.id);
    expect(profile?.auditEvents.map((event) => event.action)).toEqual([
      "patient.registered",
      "patient.hospital_id.allocated",
    ]);
  });

  it("rechecks duplicates on the server and blocks silent creation", () => {
    const { repository, service } = setup();
    const first = service.register(baseInput(), { submissionKey: "first" });
    expect(first.status).toBe("registered");

    const duplicate = service.register(baseInput(), {
      submissionKey: "second",
    });

    expect(duplicate.status).toBe("duplicate_review");
    if (duplicate.status === "duplicate_review") {
      expect(duplicate.hasStrongCandidate).toBe(true);
      expect(duplicate.candidates[0].strength).toBe("strong");
    }
    expect(repository.allPatients()).toHaveLength(1);
  });

  it("treats an asserted exact hospital ID as a hard duplicate", () => {
    const { repository, service } = setup();
    const first = service.register(baseInput(), { submissionKey: "first" });
    expect(first.status).toBe("registered");
    if (first.status !== "registered") {
      return;
    }

    const result = service.register(
      baseInput({
        familyName: "Different",
        givenName: "Person",
        dateOfBirth: "1988-01-01",
        primaryPhone: "08070000000",
        nextOfKinPhone: "08070000001",
      }),
      {
        assertedHospitalId: first.patient.hospitalId.toLowerCase(),
        submissionKey: "second",
      },
    );

    expect(result.status).toBe("duplicate_review");
    if (result.status === "duplicate_review") {
      expect(result.hasStrongCandidate).toBe(true);
      expect(result.candidates[0].reasons).toContain(
        "Exact hospital ID match",
      );
    }
    expect(repository.allPatients()).toHaveLength(1);
  });

  it("documents that an omitted exact-ID assertion cannot be inferred from fields", () => {
    const { repository, service } = setup();
    service.register(baseInput(), { submissionKey: "first" });

    const result = service.register(
      baseInput({
        familyName: "Different",
        givenName: "Person",
        dateOfBirth: "1988-01-01",
        primaryPhone: "08070000000",
        nextOfKinPhone: "08070000001",
        email: "different.person@example.test",
      }),
      { submissionKey: "second" },
    );

    expect(result.status).toBe("registered");
    expect(repository.allPatients()).toHaveLength(2);
  });

  it("hard-blocks an asserted exact ID after a DOB-filter mismatch", () => {
    const { repository, service } = setup();
    const first = service.register(baseInput(), { submissionKey: "first" });
    expect(first.status).toBe("registered");
    if (first.status !== "registered") {
      return;
    }

    const filtered = service.search({
      query: first.patient.hospitalId,
      dateOfBirth: "1999-01-01",
    });
    expect(filtered.results).toHaveLength(0);

    const result = service.register(
      baseInput({
        familyName: "Different",
        givenName: "Person",
        dateOfBirth: "1988-01-01",
        primaryPhone: "08070000000",
        nextOfKinPhone: "08070000001",
      }),
      {
        assertedHospitalId: first.patient.hospitalId,
        submissionKey: "second",
      },
    );

    expect(result.status).toBe("duplicate_review");
    if (result.status === "duplicate_review") {
      expect(result.hasStrongCandidate).toBe(true);
      expect(result.candidates[0].reasons).toContain(
        "Exact hospital ID match",
      );
    }
    expect(repository.allPatients()).toHaveLength(1);
  });

  it("requires an override reason for a strong candidate", () => {
    const { repository, service } = setup();
    service.register(baseInput(), { submissionKey: "first" });

    const withoutReason = service.register(baseInput(), {
      duplicateReviewAcknowledged: true,
      submissionKey: "second",
    });

    expect(withoutReason.status).toBe("duplicate_review");
    if (withoutReason.status === "duplicate_review") {
      expect(withoutReason.overrideReasonError).toMatch(/at least/i);
    }
    expect(repository.allPatients()).toHaveLength(1);

    const withReason = service.register(baseInput(), {
      duplicateReviewAcknowledged: true,
      overrideReason:
        "Different person confirmed by a separate identity document.",
      submissionKey: "third",
    });

    expect(withReason.status).toBe("registered");
    expect(repository.allPatients()).toHaveLength(2);

    if (withReason.status === "registered") {
      expect(withReason.patient.hospitalId).toBe("D2C-2026-000002");
      expect(
        withReason.patient.registration.duplicateReview?.hasStrongCandidate,
      ).toBe(true);
      expect(
        withReason.patient.registration.duplicateReview?.overrideReason,
      ).toContain("Different person");

      const profile = service.getProfile(withReason.patient.id);
      expect(profile?.auditEvents.map((event) => event.action)).toContain(
        "duplicate.reviewed",
      );
    }
  });

  it("allows a reviewed possible candidate without an override reason", () => {
    const { repository, service } = setup();
    service.register(baseInput(), { submissionKey: "first" });

    const result = service.register(
      baseInput({
        dateOfBirth: "1993-02-02",
        primaryPhone: "08099999999",
        nextOfKinPhone: "08099999998",
      }),
      {
        duplicateReviewAcknowledged: true,
        submissionKey: "second",
      },
    );

    expect(result.status).toBe("registered");
    expect(repository.allPatients()).toHaveLength(2);
    if (result.status === "registered") {
      expect(
        result.patient.registration.duplicateReview?.hasStrongCandidate,
      ).toBe(false);
    }
  });

  it("never merges records automatically", () => {
    const { repository, service } = setup();
    const first = service.register(baseInput(), { submissionKey: "first" });
    service.register(baseInput(), {
      duplicateReviewAcknowledged: true,
      overrideReason:
        "Different person confirmed by a separate identity document.",
      submissionKey: "second",
    });

    expect(repository.allPatients()).toHaveLength(2);
    if (first.status === "registered") {
      const original = repository.findById(first.patient.id);
      expect(original?.identity.familyName).toBe("Yusuf");
      expect(original?.hospitalId).toBe("D2C-2026-000001");
    }
  });

  it("is idempotent for a repeated submission key", () => {
    const { repository, service } = setup();
    const first = service.register(baseInput(), { submissionKey: "same-key" });
    const second = service.register(baseInput(), { submissionKey: "same-key" });

    expect(first.status).toBe("registered");
    expect(second.status).toBe("registered");
    expect(repository.allPatients()).toHaveLength(1);

    if (first.status === "registered" && second.status === "registered") {
      expect(second.patient.id).toBe(first.patient.id);
      expect(second.patient.hospitalId).toBe(first.patient.hospitalId);
    }
  });

  it("rejects a submission key reused with different payload details", () => {
    const { repository, service } = setup();
    service.register(baseInput(), { submissionKey: "same-key" });

    const mismatch = service.register(
      baseInput({ givenName: "Different" }),
      { submissionKey: "same-key" },
    );

    expect(mismatch.status).toBe("invalid");
    if (mismatch.status === "invalid") {
      expect(mismatch.errors.submissionKey).toBeDefined();
    }
    expect(repository.allPatients()).toHaveLength(1);
  });

  it("isolates returned profiles and audit events from stored records", () => {
    const { repository, service } = setup();
    const registered = service.register(baseInput(), {
      submissionKey: "mutation",
    });
    expect(registered.status).toBe("registered");
    if (registered.status !== "registered") {
      return;
    }

    const profile = service.getProfile(registered.patient.id);
    expect(profile).not.toBeNull();
    if (!profile) {
      return;
    }

    profile.identity.familyName = "Mutated";
    profile.address.city = "Mutated";
    profile.auditEvents[0].detail = "Mutated";

    const stored = service.getProfile(registered.patient.id);
    expect(stored?.identity.familyName).toBe("Yusuf");
    expect(stored?.address.city).toBe("Lagos");
    expect(stored?.auditEvents[0].detail).toBe(
      "Patient registered in the synthetic preview.",
    );

    const direct = repository.findById(registered.patient.id);
    expect(direct).not.toBeUndefined();
    if (direct) {
      direct.identity.familyName = "Mutated";
    }
    expect(repository.findById(registered.patient.id)?.identity.familyName).toBe(
      "Yusuf",
    );
  });

  it("does not share seeded nested objects across repository instances", () => {
    const firstRepository = new InMemoryPatientRepository({
      seed: true,
      seedNow: NOW,
    });
    const secondRepository = new InMemoryPatientRepository({
      seed: true,
      seedNow: NOW,
    });
    const first = firstRepository.allPatients()[0];
    const originalCity = first.address.city;

    first.address.city = "Mutated";

    expect(secondRepository.allPatients()[0].address.city).toBe(originalCity);
  });

  it("preserves an estimated age without converting it to a date of birth", () => {
    const { service } = setup();
    const result = service.register(
      baseInput({
        dateOfBirth: "",
        estimatedAgeValue: "34",
        estimatedAgeUnit: "years",
        estimatedAgeAsOf: "2026-01-15",
      }),
      { submissionKey: "estimated" },
    );

    expect(result.status).toBe("registered");
    if (result.status === "registered") {
      expect(result.patient.identity.dateOfBirth).toBe("");
      expect(result.patient.identity.dobPrecision).toBe("estimated");
      expect(result.patient.identity.estimatedAge).toEqual({
        value: 34,
        unit: "years",
        asOf: "2026-01-15",
      });
    }
  });

  it("rejects invalid input without creating a record", () => {
    const { repository, service } = setup();
    const result = service.register(
      baseInput({ primaryPhone: "8031234567" }),
      { submissionKey: "invalid" },
    );

    expect(result.status).toBe("invalid");
    expect(repository.allPatients()).toHaveLength(0);
  });

  it("caps search results and returns a minimal projection", () => {
    const { service } = setup();

    for (let index = 0; index < 25; index += 1) {
      const day = String((index % 25) + 1).padStart(2, "0");
      const phone = `+234803${String(1_000_000 + index)}`;
      const kinPhone = `+234803${String(2_000_000 + index)}`;
      const result = service.register(
        baseInput({
          familyName: "Testpatient",
          givenName: `Person${index}`,
          dateOfBirth: `1990-01-${day}`,
          primaryPhone: phone,
          nextOfKinPhone: kinPhone,
          email: `person${index}@example.test`,
        }),
        { submissionKey: `cap-${index}` },
      );
      expect(result.status).toBe("registered");
    }

    const search = service.search({ query: "Testpatient" });
    expect(search.results).toHaveLength(20);
    expect(search.capped).toBe(true);

    const summary = search.results[0];
    expect(summary).not.toHaveProperty("address");
    expect(summary).not.toHaveProperty("email");
    expect(summary).not.toHaveProperty("nextOfKin");
    expect(summary).not.toHaveProperty("auditEvents");
    expect(summary).not.toHaveProperty("identity");
    expect(summary).toHaveProperty("hospitalId");
    expect(summary).toHaveProperty("dateOfBirthDisplay");
  });

  it("requires a meaningful search and supports exact hospital ID and DOB", () => {
    const { service } = setup();
    const registered = service.register(baseInput(), {
      submissionKey: "searchable",
    });
    expect(registered.status).toBe("registered");

    expect(service.search({ query: "Y" }).results).toHaveLength(0);

    if (registered.status === "registered") {
      const byId = service.search({
        query: registered.patient.hospitalId.toLowerCase(),
      });
      expect(byId.results).toHaveLength(1);
      expect(byId.results[0].hospitalId).toBe(registered.patient.hospitalId);

      const byPhone = service.search({ query: "31234567" });
      expect(byPhone.results).toHaveLength(1);
      expect(byPhone.results[0].hospitalId).toBe(
        registered.patient.hospitalId,
      );

      const byDob = service.search({
        query: "Yusuf",
        dateOfBirth: "1990-05-12",
      });
      expect(byDob.results).toHaveLength(1);

      const wrongDob = service.search({
        query: "Yusuf",
        dateOfBirth: "1991-01-01",
      });
      expect(wrongDob.results).toHaveLength(0);
    }
  });

  it("caps DOB-only search results", () => {
    const { service } = setup();

    for (let index = 0; index < 21; index += 1) {
      const result = service.register(
        baseInput({
          familyName: `Dobcap${index}`,
          givenName: "Person",
          dateOfBirth: "1991-07-07",
          primaryPhone: `+234803${String(3_000_000 + index)}`,
          nextOfKinPhone: `+234803${String(4_000_000 + index)}`,
          email: "",
        }),
        {
          duplicateReviewAcknowledged: true,
          submissionKey: `dobcap-${index}`,
        },
      );
      expect(result.status).toBe("registered");
    }

    const search = service.search({
      query: "",
      dateOfBirth: "1991-07-07",
    });
    expect(search.results).toHaveLength(20);
    expect(search.capped).toBe(true);
    expect(search.results[0]).not.toHaveProperty("address");
  });

  it("matches names in either order and supports DOB-only search", () => {
    const { service } = setup();
    service.register(baseInput(), { submissionKey: "searchable" });

    const givenFirst = service.search({ query: "Amina Yusuf" });
    expect(givenFirst.results).toHaveLength(1);

    const familyFirst = service.search({ query: "Yusuf Amina" });
    expect(familyFirst.results).toHaveLength(1);

    const crossName = service.search({ query: "Amina Bello" });
    expect(crossName.results).toHaveLength(0);

    const dobOnly = service.search({
      query: "",
      dateOfBirth: "1990-05-12",
    });
    expect(dobOnly.results).toHaveLength(1);
    expect(dobOnly.results[0]).not.toHaveProperty("address");
    expect(dobOnly.results[0]).not.toHaveProperty("email");

    const noDob = service.search({
      query: "",
      dateOfBirth: "1900-01-01",
    });
    expect(noDob.results).toHaveLength(0);
  });

  it("returns null for an unknown patient profile", () => {
    const { service } = setup();
    expect(
      service.getProfile("7a1f3c2e-5b4d-4e6f-8a90-123456789abc"),
    ).toBeNull();
  });
});
