import { getLagosYear } from "./dates";

const MAX_YEARLY_SEQUENCE = 999_999;

export function formatHospitalId(year: number, sequence: number): string {
  if (
    !Number.isInteger(year) ||
    year < 1000 ||
    year > 9999 ||
    !Number.isInteger(sequence) ||
    sequence < 1 ||
    sequence > MAX_YEARLY_SEQUENCE
  ) {
    throw new Error("Hospital ID allocation is outside the supported range.");
  }

  return `D2C-${year}-${String(sequence).padStart(6, "0")}`;
}

export type HospitalIdAllocator = {
  allocate: (date?: Date) => string;
  currentSequence: (year: number) => number;
};

export function createHospitalIdAllocator(): HospitalIdAllocator {
  const sequences = new Map<number, number>();

  return {
    allocate(date = new Date()) {
      const year = getLagosYear(date);
      const next = (sequences.get(year) ?? 0) + 1;

      if (next > MAX_YEARLY_SEQUENCE) {
        throw new Error("Hospital ID sequence is exhausted for the year.");
      }

      sequences.set(year, next);
      return formatHospitalId(year, next);
    },
    currentSequence(year) {
      return sequences.get(year) ?? 0;
    },
  };
}
