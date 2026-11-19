export const SEXES = ["female", "male", "other", "unknown"] as const;
export type Sex = (typeof SEXES)[number];

export const DOB_PRECISIONS = ["exact", "estimated", "unknown"] as const;
export type DobPrecision = (typeof DOB_PRECISIONS)[number];

export const AGE_UNITS = ["years", "months", "days"] as const;
export type AgeUnit = (typeof AGE_UNITS)[number];

export const NAME_STATUSES = ["complete", "partial", "unknown"] as const;
export type PatientNameStatus = (typeof NAME_STATUSES)[number];

export const IDENTITY_STATUSES = ["pending", "verified"] as const;
export type IdentityVerificationStatus = (typeof IDENTITY_STATUSES)[number];

export const MAX_SEARCH_RESULTS = 20;
export const MIN_OVERRIDE_REASON_LENGTH = 8;

export type EstimatedAge = {
  value: number;
  unit: AgeUnit;
  asOf: string;
};

export type RegisterPatientInput = {
  familyName: string;
  givenName: string;
  middleName: string;
  preferredName: string;
  sex: Sex;
  dateOfBirth: string;
  estimatedAgeValue: string;
  estimatedAgeUnit: string;
  estimatedAgeAsOf: string;
  primaryPhone: string;
  secondaryPhone: string;
  email: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  nextOfKinName: string;
  nextOfKinRelationship: string;
  nextOfKinPhone: string;
};

export type PatientIdentity = {
  familyName: string;
  givenName: string;
  middleName: string;
  preferredName: string;
  nameStatus: PatientNameStatus;
  sex: Sex;
  dateOfBirth: string;
  dobPrecision: DobPrecision;
  estimatedAge: EstimatedAge | null;
};

export type PatientContact = {
  primaryPhone: string;
  secondaryPhone: string;
  email: string;
};

export type PatientAddress = {
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
  country: "Nigeria";
};

export type NextOfKin = {
  fullName: string;
  relationship: string;
  phone: string;
};

export type DuplicateReviewMetadata = {
  candidateCount: number;
  hasStrongCandidate: boolean;
  overrideReason: string;
};

export type PatientRegistrationMetadata = {
  registeredAt: string;
  registeredBy: string;
  source: "synthetic-preview";
  duplicateReview: DuplicateReviewMetadata | null;
};

export type PatientRecord = {
  id: string;
  hospitalId: string;
  identity: PatientIdentity;
  contact: PatientContact;
  address: PatientAddress;
  nextOfKin: NextOfKin;
  identityStatus: IdentityVerificationStatus;
  registration: PatientRegistrationMetadata;
};

export type PatientAuditEvent = {
  id: string;
  at: string;
  action: string;
  actor: string;
  detail: string;
};

export type PatientProfile = PatientRecord & {
  auditEvents: PatientAuditEvent[];
};

export type PatientSummary = {
  id: string;
  hospitalId: string;
  familyName: string;
  givenName: string;
  sex: Sex;
  dateOfBirthDisplay: string;
  primaryPhone: string;
  identityStatus: IdentityVerificationStatus;
};

export type DuplicateStrength = "strong" | "possible";

export type DuplicateCandidate = {
  patient: PatientSummary;
  strength: DuplicateStrength;
  reasons: string[];
  score: number;
};

export type SearchPatientsInput = {
  query: string;
  dateOfBirth?: string;
};

export type SearchPatientsResult = {
  results: PatientSummary[];
  capped: boolean;
};

export type SearchPatientsActionResult =
  | ({ status: "ok" } & SearchPatientsResult)
  | { status: "invalid"; errors: RegistrationFieldErrors };

export type RegistrationFieldErrors = Record<string, string>;

export type RegisterPatientOptions = {
  duplicateReviewAcknowledged?: boolean;
  overrideReason?: string;
  submissionKey?: string;
  assertedHospitalId?: string;
};

export type RegisterPatientResult =
  | { status: "registered"; patient: PatientRecord }
  | {
      status: "duplicate_review";
      candidates: DuplicateCandidate[];
      hasStrongCandidate: boolean;
      overrideReasonError?: string;
    }
  | { status: "invalid"; errors: RegistrationFieldErrors };

export type RegisteredPatientSummary = {
  id: string;
  hospitalId: string;
  familyName: string;
  givenName: string;
  identityStatus: IdentityVerificationStatus;
};

export type RegisterPatientActionResult =
  | { status: "registered"; patient: RegisteredPatientSummary }
  | {
      status: "duplicate_review";
      candidates: DuplicateCandidate[];
      hasStrongCandidate: boolean;
      overrideReasonError?: string;
    }
  | { status: "invalid"; errors: RegistrationFieldErrors };
