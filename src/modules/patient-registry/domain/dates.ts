const LAGOS_TIME_ZONE = "Africa/Lagos";
const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

function lagosParts(date: Date): Record<string, string> {
  return Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: LAGOS_TIME_ZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
      .formatToParts(date)
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  );
}

export function getLagosDateKey(date: Date = new Date()): string {
  const parts = lagosParts(date);
  return `${parts.year}-${parts.month}-${parts.day}`;
}

export function getLagosYear(date: Date = new Date()): number {
  return Number(lagosParts(date).year);
}

export function parseDateOnly(value: string): Date | null {
  const match = DATE_ONLY_PATTERN.exec(value.trim());
  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const parsed = new Date(Date.UTC(year, month - 1, day));

  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== month - 1 ||
    parsed.getUTCDate() !== day
  ) {
    return null;
  }

  return parsed;
}

export function isFutureDateOnly(value: string, now: Date = new Date()): boolean {
  return value > getLagosDateKey(now);
}

export function calculateAgeYears(
  dateOfBirth: string,
  now: Date = new Date(),
): number | null {
  const birth = parseDateOnly(dateOfBirth);
  if (!birth) {
    return null;
  }

  const [year, month, day] = getLagosDateKey(now).split("-").map(Number);
  let age = year - birth.getUTCFullYear();

  if (
    month < birth.getUTCMonth() + 1 ||
    (month === birth.getUTCMonth() + 1 && day < birth.getUTCDate())
  ) {
    age -= 1;
  }

  return age >= 0 ? age : null;
}
