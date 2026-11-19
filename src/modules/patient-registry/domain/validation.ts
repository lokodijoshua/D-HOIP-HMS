import { AGE_UNITS, SEXES, type AgeUnit, type RegisterPatientInput, type RegistrationFieldErrors, type SearchPatientsInput, type Sex } from "./types";
import { isFutureDateOnly, parseDateOnly } from "./dates";
import { matchNigerianState } from "./nigeria";
import { normalizeEmail, normalizePhone } from "./normalization";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const POSTAL_CODE_PATTERN = /^\d{6}$/;
const CONTROL_CHARACTER_PATTERN = /[\u0000-\u001f\u007f]/;

type RecordValue = Record<string, unknown>;

type ParseResult<T> =
  | { ok: true; value: T }
  | { ok: false; errors: RegistrationFieldErrors };

function asRecord(value: unknown): RecordValue {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as RecordValue)
    : {};
}

function readString(
  record: RecordValue,
  key: string,
  errors: RegistrationFieldErrors,
  options: { required?: boolean; max?: number } = {},
): string {
  const raw = record[key];
  const value = typeof raw === "string" ? raw.trim() : "";

  if (options.required && !value) {
    errors[key] = "This field is required.";
    return "";
  }

  if (options.max && value.length > options.max) {
    errors[key] = `Use ${options.max} characters or fewer.`;
    return "";
  }

  if (CONTROL_CHARACTER_PATTERN.test(value)) {
    errors[key] = "Remove unsupported characters.";
    return "";
  }

  return value;
}

function validateDateOfBirth(
  dateOfBirth: string,
  now: Date,
  errors: RegistrationFieldErrors,
): boolean {
  if (!parseDateOnly(dateOfBirth)) {
    errors.dateOfBirth = "Enter a valid date in YYYY-MM-DD format.";
    return false;
  }

  if (isFutureDateOnly(dateOfBirth, now)) {
    errors.dateOfBirth = "Date of birth cannot be in the future.";
    return false;
  }

  return true;
}

function validateEstimatedAge(
  value: string,
  unit: string,
  asOf: string,
  now: Date,
  errors: RegistrationFieldErrors,
): { value: number; unit: AgeUnit; asOf: string } | null {
  const numericValue = Number(value);
  const maximumForUnit: Record<AgeUnit, number> = {
    years: 130,
    months: 1_560,
    days: 47_450,
  };

  if (
    !Number.isInteger(numericValue) ||
    numericValue < 1 ||
    numericValue > maximumForUnit[unit as AgeUnit]
  ) {
    errors.estimatedAgeValue = "Enter a whole number greater than zero.";
  }

  if (!AGE_UNITS.includes(unit as AgeUnit)) {
    errors.estimatedAgeUnit = "Select a valid age unit.";
  }

  if (!parseDateOnly(asOf)) {
    errors.estimatedAgeAsOf = "Enter a valid date in YYYY-MM-DD format.";
  } else if (isFutureDateOnly(asOf, now)) {
    errors.estimatedAgeAsOf = "The as-of date cannot be in the future.";
  }

  if (
    Object.keys(errors).some((key) =>
      ["estimatedAgeValue", "estimatedAgeUnit", "estimatedAgeAsOf"].includes(
        key,
      ),
    )
  ) {
    return null;
  }

  return {
    value: numericValue,
    unit: unit as AgeUnit,
    asOf,
  };
}

export function parseRegisterPatientInput(
  input: unknown,
  now: Date = new Date(),
): ParseResult<RegisterPatientInput> {
  const record = asRecord(input);
  const errors: RegistrationFieldErrors = {};

  const familyName = readString(record, "familyName", errors, {
    required: true,
    max: 100,
  });
  const givenName = readString(record, "givenName", errors, {
    required: true,
    max: 100,
  });
  const middleName = readString(record, "middleName", errors, { max: 100 });
  const preferredName = readString(record, "preferredName", errors, {
    max: 100,
  });

  const sexValue = readString(record, "sex", errors, { required: true });
  if (sexValue && !SEXES.includes(sexValue as Sex)) {
    errors.sex = "Select a valid sex.";
  }

  const dateOfBirth = readString(record, "dateOfBirth", errors);
  const estimatedAgeValue = readString(record, "estimatedAgeValue", errors);
  const estimatedAgeUnit = readString(record, "estimatedAgeUnit", errors);
  const estimatedAgeAsOf = readString(record, "estimatedAgeAsOf", errors);

  if (dateOfBirth) {
    validateDateOfBirth(dateOfBirth, now, errors);

    if (estimatedAgeValue || estimatedAgeAsOf) {
      errors.dateOfBirth =
        "Enter either an exact date of birth or an estimated age, not both.";
    }
  } else {
    if (!estimatedAgeValue) {
      errors.estimatedAgeValue = "Enter an estimated age.";
    }
    if (!estimatedAgeAsOf) {
      errors.estimatedAgeAsOf = "Enter the date the estimate was recorded.";
    }
    if (estimatedAgeValue || estimatedAgeAsOf) {
      validateEstimatedAge(
        estimatedAgeValue,
        estimatedAgeUnit,
        estimatedAgeAsOf,
        now,
        errors,
      );
    }
  }

  const primaryPhoneRaw = readString(record, "primaryPhone", errors, {
    required: true,
    max: 40,
  });
  const primaryPhone = normalizePhone(primaryPhoneRaw);
  if (primaryPhoneRaw && !primaryPhone) {
    errors.primaryPhone =
      "Use a Nigerian number with a leading 0 or +234, or a full international number.";
  }

  const secondaryPhoneRaw = readString(record, "secondaryPhone", errors, {
    max: 40,
  });
  const secondaryPhone = secondaryPhoneRaw
    ? normalizePhone(secondaryPhoneRaw)
    : "";
  if (secondaryPhoneRaw && !secondaryPhone) {
    errors.secondaryPhone =
      "Use a Nigerian number with a leading 0 or +234, or a full international number.";
  }

  const emailRaw = readString(record, "email", errors, { max: 254 });
  const email = emailRaw ? normalizeEmail(emailRaw) : "";
  if (email && !EMAIL_PATTERN.test(email)) {
    errors.email = "Enter a valid email address.";
  }

  const addressLine1 = readString(record, "addressLine1", errors, {
    required: true,
    max: 200,
  });
  const addressLine2 = readString(record, "addressLine2", errors, { max: 200 });
  const city = readString(record, "city", errors, { required: true, max: 100 });
  const stateRaw = readString(record, "state", errors, { required: true });
  const state = stateRaw ? matchNigerianState(stateRaw) : null;
  if (stateRaw && !state) {
    errors.state = "Select a Nigerian state or the Federal Capital Territory.";
  }

  const postalCode = readString(record, "postalCode", errors, { max: 10 });
  if (postalCode && !POSTAL_CODE_PATTERN.test(postalCode)) {
    errors.postalCode = "Enter a six-digit postal code or leave it blank.";
  }

  const nextOfKinName = readString(record, "nextOfKinName", errors, {
    required: true,
    max: 100,
  });
  const nextOfKinRelationship = readString(
    record,
    "nextOfKinRelationship",
    errors,
    { required: true, max: 80 },
  );
  const nextOfKinPhoneRaw = readString(record, "nextOfKinPhone", errors, {
    required: true,
    max: 40,
  });
  const nextOfKinPhone = normalizePhone(nextOfKinPhoneRaw);
  if (nextOfKinPhoneRaw && !nextOfKinPhone) {
    errors.nextOfKinPhone =
      "Use a Nigerian number with a leading 0 or +234, or a full international number.";
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: {
      familyName,
      givenName,
      middleName,
      preferredName,
      sex: sexValue as Sex,
      dateOfBirth: dateOfBirth || "",
      estimatedAgeValue: dateOfBirth ? "" : estimatedAgeValue,
      estimatedAgeUnit: dateOfBirth ? "" : estimatedAgeUnit,
      estimatedAgeAsOf: dateOfBirth ? "" : estimatedAgeAsOf,
      primaryPhone: primaryPhone ?? "",
      secondaryPhone: secondaryPhone ?? "",
      email,
      addressLine1,
      addressLine2,
      city,
      state: state ?? "",
      postalCode,
      nextOfKinName,
      nextOfKinRelationship,
      nextOfKinPhone: nextOfKinPhone ?? "",
    },
  };
}

export function parseSearchPatientsInput(
  input: unknown,
  now: Date = new Date(),
): ParseResult<SearchPatientsInput> {
  const record = asRecord(input);
  const errors: RegistrationFieldErrors = {};
  const query = readString(record, "query", errors, { max: 100 });
  const dateOfBirth = readString(record, "dateOfBirth", errors, { max: 10 });

  if (!query && !dateOfBirth) {
    errors.query = "Enter at least two characters or an exact date of birth.";
  } else if (query && query.length < 2) {
    errors.query = "Enter at least two characters.";
  }

  if (dateOfBirth) {
    validateDateOfBirth(dateOfBirth, now, errors);
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: { query, dateOfBirth: dateOfBirth || undefined },
  };
}
