import { createHash } from "node:crypto";
import {
  findDuplicateCandidates,
  hasStrongCandidate,
} from "../domain/duplicates";
import {
  formatPatientDateDisplay,
  normalizeHospitalId,
  normalizeNameForComparison,
} from "../domain/normalization";
import {
  MAX_SEARCH_RESULTS,
  MIN_OVERRIDE_REASON_LENGTH,
  type AgeUnit,
  type PatientAuditEvent,
  type PatientProfile,
  type PatientRecord,
  type PatientSummary,
  type RegisterPatientInput,
  type RegisterPatientOptions,
  type RegisterPatientResult,
  type SearchPatientsInput,
  type SearchPatientsResult,
} from "../domain/types";
import { parseRegisterPatientInput } from "../domain/validation";
import {
  InMemoryPatientRepository,
  getPatientRepository,
} from "./repository";

function toSummary(patient: PatientRecord, now: Date): PatientSummary {
  return {
    id: patient.id,
    hospitalId: patient.hospitalId,
    familyName: patient.identity.familyName,
    givenName: patient.identity.givenName,
    sex: patient.identity.sex,
    dateOfBirthDisplay: formatPatientDateDisplay(patient.identity, now),
    primaryPhone: patient.contact.primaryPhone,
    identityStatus: patient.identityStatus,
  };
}

function searchableNameParts(patient: PatientRecord): string[] {
  return normalizeNameForComparison(
    [
      patient.identity.familyName,
      patient.identity.givenName,
      patient.identity.middleName,
      patient.identity.preferredName,
    ]
      .filter(Boolean)
      .join(" "),
  )
    .split(" ")
    .filter(Boolean);
}

function matchesNameQuery(
  patient: PatientRecord,
  queryTokens: string[],
): boolean {
  if (queryTokens.length === 0) {
    return false;
  }

  const nameParts = searchableNameParts(patient);
  return queryTokens.every((token) =>
    nameParts.some((part) => part.includes(token)),
  );
}

function matchesDateOfBirth(
  patient: PatientRecord,
  dateOfBirth: string | undefined,
): boolean {
  return !dateOfBirth || patient.identity.dateOfBirth === dateOfBirth;
}

function registrationFingerprint(
  input: RegisterPatientInput,
  assertedHospitalId: string | undefined,
): string {
  return createHash("sha256")
    .update(
      JSON.stringify([
        input.familyName,
        input.givenName,
        input.middleName,
        input.preferredName,
        input.sex,
        input.dateOfBirth,
        input.estimatedAgeValue,
        input.estimatedAgeUnit,
        input.estimatedAgeAsOf,
        input.primaryPhone,
        input.secondaryPhone,
        input.email,
        input.addressLine1,
        input.addressLine2,
        input.city,
        input.state,
        input.postalCode,
        input.nextOfKinName,
        input.nextOfKinRelationship,
        input.nextOfKinPhone,
        normalizeHospitalId(assertedHospitalId ?? ""),
      ]),
    )
    .digest("hex");
}

export function createPatientRegistryService(
  repository: InMemoryPatientRepository,
  now: () => Date = () => new Date(),
) {
  return {
    search(input: SearchPatientsInput): SearchPatientsResult {
      const currentTime = now();
      const query = input.query.trim();
      const hasDateFilter = Boolean(input.dateOfBirth);

      if (!query && !hasDateFilter) {
        return { results: [], capped: false };
      }

      if (query && query.length < 2) {
        return { results: [], capped: false };
      }

      const exactHospitalId = normalizeHospitalId(query);
      if (exactHospitalId) {
        const patient = repository.findByHospitalId(exactHospitalId);
        return {
          results:
            patient && matchesDateOfBirth(patient, input.dateOfBirth)
              ? [toSummary(patient, currentTime)]
              : [],
          capped: false,
        };
      }

      const normalizedQuery = normalizeNameForComparison(query);
      const queryTokens = normalizedQuery.split(" ").filter(Boolean);
      const queryDigits = query.replace(/\D/g, "");
      const matches: PatientRecord[] = [];

      for (const patient of repository.allPatients()) {
        if (!matchesDateOfBirth(patient, input.dateOfBirth)) {
          continue;
        }

        if (!query) {
          matches.push(patient);
          continue;
        }

        const nameMatch = matchesNameQuery(patient, queryTokens);
        const phoneMatch =
          queryDigits.length >= 4 &&
          [patient.contact.primaryPhone, patient.contact.secondaryPhone].some(
            (phone) => phone.replace(/\D/g, "").includes(queryDigits),
          );
        const hospitalIdMatch =
          query.toUpperCase().includes("D2C") &&
          patient.hospitalId.includes(query.toUpperCase());

        if (nameMatch || phoneMatch || hospitalIdMatch) {
          matches.push(patient);
        }
      }

      const firstQueryToken = queryTokens[0] ?? "";

      matches.sort((left, right) => {
        const leftPrefix = firstQueryToken
          ? searchableNameParts(left).some((part) =>
              part.startsWith(firstQueryToken),
            )
            ? 0
            : 1
          : 1;
        const rightPrefix = firstQueryToken
          ? searchableNameParts(right).some((part) =>
              part.startsWith(firstQueryToken),
            )
            ? 0
            : 1
          : 1;

        return (
          leftPrefix - rightPrefix ||
          left.identity.familyName.localeCompare(right.identity.familyName) ||
          left.identity.givenName.localeCompare(right.identity.givenName) ||
          left.hospitalId.localeCompare(right.hospitalId)
        );
      });

      return {
        results: matches
          .slice(0, MAX_SEARCH_RESULTS)
          .map((patient) => toSummary(patient, currentTime)),
        capped: matches.length > MAX_SEARCH_RESULTS,
      };
    },

    register(
      input: unknown,
      options: RegisterPatientOptions = {},
    ): RegisterPatientResult {
      const currentTime = now();
      const parsed = parseRegisterPatientInput(input, currentTime);

      if (!parsed.ok) {
        return { status: "invalid", errors: parsed.errors };
      }

      const submissionKey = options.submissionKey?.trim() ?? "";
      const payloadFingerprint = registrationFingerprint(
        parsed.value,
        options.assertedHospitalId,
      );

      if (submissionKey) {
        const existing = repository.findIdempotentResult(submissionKey);

        if (existing) {
          if (existing.payloadFingerprint !== payloadFingerprint) {
            return {
              status: "invalid",
              errors: {
                submissionKey:
                  "This submission key was already used for different patient details.",
              },
            };
          }

          const existingPatient = repository.findById(existing.patientId);
          if (existingPatient) {
            return { status: "registered", patient: existingPatient };
          }
        }
      }

      const candidates = findDuplicateCandidates(
        parsed.value,
        repository.allPatients(),
        options.assertedHospitalId,
      );
      const strongCandidate = hasStrongCandidate(candidates);
      const overrideReason = options.overrideReason?.trim() ?? "";

      if (candidates.length > 0) {
        if (!options.duplicateReviewAcknowledged) {
          return {
            status: "duplicate_review",
            candidates: candidates.map(({ patient, ...candidate }) => ({
              ...candidate,
              patient: toSummary(patient, currentTime),
            })),
            hasStrongCandidate: strongCandidate,
          };
        }

        if (
          strongCandidate &&
          overrideReason.length < MIN_OVERRIDE_REASON_LENGTH
        ) {
          return {
            status: "duplicate_review",
            candidates: candidates.map(({ patient, ...candidate }) => ({
              ...candidate,
              patient: toSummary(patient, currentTime),
            })),
            hasStrongCandidate: strongCandidate,
            overrideReasonError: `Provide an explanatory reason of at least ${MIN_OVERRIDE_REASON_LENGTH} characters.`,
          };
        }
      }

      const hospitalId = repository.allocateHospitalId(currentTime);
      const registeredAt = currentTime.toISOString();
      const patient: PatientRecord = {
        id: globalThis.crypto.randomUUID(),
        hospitalId,
        identity: {
          familyName: parsed.value.familyName,
          givenName: parsed.value.givenName,
          middleName: parsed.value.middleName,
          preferredName: parsed.value.preferredName,
          nameStatus: "complete",
          sex: parsed.value.sex,
          dateOfBirth: parsed.value.dateOfBirth,
          dobPrecision: parsed.value.dateOfBirth ? "exact" : "estimated",
          estimatedAge: parsed.value.dateOfBirth
            ? null
            : {
                value: Number(parsed.value.estimatedAgeValue),
                unit: parsed.value.estimatedAgeUnit as AgeUnit,
                asOf: parsed.value.estimatedAgeAsOf,
              },
        },
        contact: {
          primaryPhone: parsed.value.primaryPhone,
          secondaryPhone: parsed.value.secondaryPhone,
          email: parsed.value.email,
        },
        address: {
          line1: parsed.value.addressLine1,
          line2: parsed.value.addressLine2,
          city: parsed.value.city,
          state: parsed.value.state,
          postalCode: parsed.value.postalCode,
          country: "Nigeria",
        },
        nextOfKin: {
          fullName: parsed.value.nextOfKinName,
          relationship: parsed.value.nextOfKinRelationship,
          phone: parsed.value.nextOfKinPhone,
        },
        identityStatus: "pending",
        registration: {
          registeredAt,
          registeredBy: "Synthetic Registrar",
          source: "synthetic-preview",
          duplicateReview:
            candidates.length > 0
              ? {
                  candidateCount: candidates.length,
                  hasStrongCandidate: strongCandidate,
                  overrideReason,
                }
              : null,
        },
      };

      const events: PatientAuditEvent[] = [
        {
          id: globalThis.crypto.randomUUID(),
          at: registeredAt,
          action: "patient.registered",
          actor: "Synthetic Registrar",
          detail: "Patient registered in the synthetic preview.",
        },
        {
          id: globalThis.crypto.randomUUID(),
          at: registeredAt,
          action: "patient.hospital_id.allocated",
          actor: "Synthetic Registrar",
          detail: `Hospital ID ${hospitalId} allocated.`,
        },
      ];

      if (candidates.length > 0) {
        events.push({
          id: globalThis.crypto.randomUUID(),
          at: registeredAt,
          action: "duplicate.reviewed",
          actor: "Synthetic Registrar",
          detail: `${candidates.length} candidate(s) reviewed; ${
            strongCandidate
              ? "a strong candidate was bypassed with a recorded reason."
              : "no strong candidate was present."
          }`,
        });
      }

      repository.save(patient);
      repository.appendAuditEvents(patient.id, events);

      if (submissionKey) {
        repository.rememberIdempotentResult(
          submissionKey,
          patient.id,
          payloadFingerprint,
        );
      }

      return { status: "registered", patient };
    },

    getProfile(patientId: string): PatientProfile | null {
      const patient = repository.findById(patientId);
      if (!patient) {
        return null;
      }

      return {
        ...patient,
        auditEvents: repository.getAuditEvents(patientId),
      };
    },
  };
}

export type PatientRegistryService = ReturnType<
  typeof createPatientRegistryService
>;

let patientRegistryService: PatientRegistryService | undefined;

export function getPatientRegistryService(): PatientRegistryService {
  patientRegistryService ??= createPatientRegistryService(
    getPatientRepository(),
  );
  return patientRegistryService;
}
