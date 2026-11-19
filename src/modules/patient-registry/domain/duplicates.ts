import type {
  DuplicateCandidate,
  DuplicateStrength,
  PatientRecord,
  RegisterPatientInput,
} from "./types";
import {
  normalizeEmail,
  normalizeHospitalId,
  normalizeNameForComparison,
  normalizePhone,
} from "./normalization";
import { parseDateOnly } from "./dates";

export type DuplicateRecordCandidate = Omit<DuplicateCandidate, "patient"> & {
  patient: PatientRecord;
};

type Match = {
  reason: string;
  points: number;
  strong: boolean;
};

function identityNameKey(identity: {
  familyName: string;
  givenName: string;
}): string {
  return `${normalizeNameForComparison(identity.familyName)}|${normalizeNameForComparison(identity.givenName)}`;
}

function inputNameKey(input: RegisterPatientInput): string {
  return identityNameKey(input);
}

function estimatedAgeDifferenceInDays(
  left: { asOf: string },
  right: { asOf: string },
): number | null {
  const leftDate = parseDateOnly(left.asOf);
  const rightDate = parseDateOnly(right.asOf);

  if (!leftDate || !rightDate) {
    return null;
  }

  return Math.abs(leftDate.getTime() - rightDate.getTime()) / 86_400_000;
}

function matchesForPatient(
  input: RegisterPatientInput,
  patient: PatientRecord,
): Match[] {
  const matches: Match[] = [];
  const add = (reason: string, points: number, strong = false) => {
    if (!matches.some((match) => match.reason === reason)) {
      matches.push({ reason, points, strong });
    }
  };

  const sameName =
    Boolean(normalizeNameForComparison(input.familyName)) &&
    inputNameKey(input) === identityNameKey(patient.identity);

  const inputPrimaryPhone = normalizePhone(input.primaryPhone);
  const patientPrimaryPhone = normalizePhone(patient.contact.primaryPhone);
  const samePrimaryPhone =
    Boolean(inputPrimaryPhone) && inputPrimaryPhone === patientPrimaryPhone;

  const inputSecondaryPhone = normalizePhone(input.secondaryPhone);
  const patientSecondaryPhone = normalizePhone(patient.contact.secondaryPhone);
  const sameSecondaryPhone =
    Boolean(inputSecondaryPhone) && inputSecondaryPhone === patientSecondaryPhone;

  const inputEmail = normalizeEmail(input.email);
  const sameEmail =
    Boolean(inputEmail) &&
    inputEmail === normalizeEmail(patient.contact.email);

  const inputKinPhone = normalizePhone(input.nextOfKinPhone);
  const patientKinPhone = normalizePhone(patient.nextOfKin.phone);
  const sameKinPhone =
    Boolean(inputKinPhone) && inputKinPhone === patientKinPhone;

  const sameExactDob =
    Boolean(input.dateOfBirth) &&
    input.dateOfBirth === patient.identity.dateOfBirth;

  const inputEstimatedAge = input.estimatedAgeValue
    ? {
        value: Number(input.estimatedAgeValue),
        unit: input.estimatedAgeUnit,
        asOf: input.estimatedAgeAsOf,
      }
    : null;
  const patientEstimatedAge = patient.identity.estimatedAge;
  const estimatedAgeDifference =
    inputEstimatedAge && patientEstimatedAge
      ? estimatedAgeDifferenceInDays(inputEstimatedAge, patientEstimatedAge)
      : null;
  const sameEstimatedAge =
    Boolean(inputEstimatedAge) &&
    Boolean(patientEstimatedAge) &&
    inputEstimatedAge?.value === patientEstimatedAge?.value &&
    inputEstimatedAge?.unit === patientEstimatedAge?.unit &&
    input.sex === patient.identity.sex &&
    estimatedAgeDifference !== null &&
    estimatedAgeDifference <= 90;

  if (sameName && sameExactDob) {
    add("Same family and given name", 30, true);
    add("Same exact date of birth", 25, true);
  }

  if (sameName && samePrimaryPhone) {
    add("Same family and given name", 30, true);
    add("Same primary phone", 30, true);
  }

  if (samePrimaryPhone && sameExactDob) {
    add("Same primary phone", 30, true);
    add("Same exact date of birth", 25, true);
  }

  if (sameName) {
    add("Same family and given name", 30);
  }

  if (samePrimaryPhone) {
    add("Same primary phone", 30);
  }

  if (sameExactDob) {
    add("Same exact date of birth", 25);
  }

  if (sameSecondaryPhone) {
    add("Same secondary phone", 10);
  }

  if (sameEmail) {
    add("Same email address", 10);
  }

  if (sameKinPhone) {
    add("Same next-of-kin phone", 5);
  }

  if (sameEstimatedAge) {
    add("Similar estimated age and sex", 10);
  }

  return matches;
}

function toCandidate(
  patient: PatientRecord,
  matches: Match[],
): DuplicateRecordCandidate | null {
  if (matches.length === 0) {
    return null;
  }

  const strength: DuplicateStrength = matches.some((match) => match.strong)
    ? "strong"
    : "possible";
  const score = Math.min(
    100,
    matches.reduce((total, match) => total + match.points, 0),
  );

  return {
    patient,
    strength,
    reasons: matches.map((match) => match.reason),
    score,
  };
}

export function findDuplicateCandidates(
  input: RegisterPatientInput,
  patients: PatientRecord[],
  assertedHospitalId = "",
): DuplicateRecordCandidate[] {
  const normalizedHospitalId = normalizeHospitalId(assertedHospitalId);

  if (normalizedHospitalId) {
    const exact = patients.find(
      (patient) => patient.hospitalId === normalizedHospitalId,
    );

    if (exact) {
      return [
        {
          patient: exact,
          strength: "strong",
          reasons: ["Exact hospital ID match"],
          score: 100,
        },
      ];
    }
  }

  return patients
    .map((patient) => toCandidate(patient, matchesForPatient(input, patient)))
    .filter((candidate): candidate is DuplicateRecordCandidate =>
      Boolean(candidate),
    )
    .sort((left, right) => {
      if (left.strength !== right.strength) {
        return left.strength === "strong" ? -1 : 1;
      }

      return (
        right.score - left.score ||
        left.patient.hospitalId.localeCompare(right.patient.hospitalId)
      );
    });
}

export function hasStrongCandidate(
  candidates: DuplicateRecordCandidate[],
): boolean {
  return candidates.some((candidate) => candidate.strength === "strong");
}
