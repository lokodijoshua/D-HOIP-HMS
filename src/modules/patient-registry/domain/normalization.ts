import type { PatientIdentity } from "./types";
import { calculateAgeYears } from "./dates";

const HOSPITAL_ID_PATTERN = /^D2C-\d{4}-\d{6}$/;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function normalizeNameForComparison(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .replace(/\s+/g, " ");
}

export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function normalizePhone(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed || !/^[+0-9()\s.\-/]+$/.test(trimmed)) {
    return null;
  }

  let compact = trimmed.replace(/[()\s.\-/]/g, "");
  if (compact.startsWith("00")) {
    compact = `+${compact.slice(2)}`;
  }

  const hasPlus = compact.startsWith("+");
  const digits = hasPlus ? compact.slice(1) : compact;

  if (!/^\d+$/.test(digits)) {
    return null;
  }

  if (hasPlus) {
    if (digits.startsWith("234")) {
      return digits.length === 13 ? `+${digits}` : null;
    }

    return digits.length >= 8 && digits.length <= 15 ? `+${digits}` : null;
  }

  if (digits.length === 11 && digits.startsWith("0")) {
    return `+234${digits.slice(1)}`;
  }

  if (digits.length === 13 && digits.startsWith("234")) {
    return `+${digits}`;
  }

  return null;
}

export function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

export function normalizeHospitalId(value: string): string {
  const normalized = value.trim().toUpperCase().replace(/\s+/g, "");
  return HOSPITAL_ID_PATTERN.test(normalized) ? normalized : "";
}

export function isValidHospitalId(value: string): boolean {
  return HOSPITAL_ID_PATTERN.test(value.trim().toUpperCase());
}

export function isUuid(value: string): boolean {
  return UUID_PATTERN.test(value);
}

export function formatSexLabel(sex: string): string {
  return sex.charAt(0).toUpperCase() + sex.slice(1);
}

export function formatPatientDateDisplay(
  identity: PatientIdentity,
  now: Date = new Date(),
): string {
  if (identity.dateOfBirth) {
    const age = calculateAgeYears(identity.dateOfBirth, now);
    return age === null
      ? identity.dateOfBirth
      : `${identity.dateOfBirth} (${age} ${age === 1 ? "year" : "years"})`;
  }

  if (identity.estimatedAge) {
    const { value, unit, asOf } = identity.estimatedAge;
    return `${value} ${value === 1 ? unit.replace(/s$/, "") : unit} (estimated as of ${asOf})`;
  }

  return "Unknown";
}
