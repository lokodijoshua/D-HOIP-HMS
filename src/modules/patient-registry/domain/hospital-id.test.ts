import { describe, expect, it } from "vitest";
import {
  createHospitalIdAllocator,
  formatHospitalId,
} from "./hospital-id";

describe("hospital ID allocation", () => {
  it("formats D2C-YYYY-NNNNNN", () => {
    expect(formatHospitalId(2026, 1)).toBe("D2C-2026-000001");
    expect(formatHospitalId(2026, 999999)).toBe("D2C-2026-999999");
  });

  it("rejects unsupported sequence and year values", () => {
    expect(() => formatHospitalId(2026, 0)).toThrow();
    expect(() => formatHospitalId(2026, 1_000_000)).toThrow();
    expect(() => formatHospitalId(999, 1)).toThrow();
    expect(() => formatHospitalId(10_000, 1)).toThrow();
  });

  it("increments monotonically within a year and resets for a new year", () => {
    const allocator = createHospitalIdAllocator();
    const first = allocator.allocate(new Date("2026-06-15T10:00:00.000Z"));
    const second = allocator.allocate(new Date("2026-06-15T11:00:00.000Z"));
    const nextYear = allocator.allocate(new Date("2027-01-02T10:00:00.000Z"));

    expect(first).toBe("D2C-2026-000001");
    expect(second).toBe("D2C-2026-000002");
    expect(nextYear).toBe("D2C-2027-000001");
    expect(allocator.currentSequence(2026)).toBe(2);
  });

  it("uses the Africa/Lagos registration year at the year boundary", () => {
    const allocator = createHospitalIdAllocator();

    expect(
      allocator.allocate(new Date("2026-12-31T22:30:00.000Z")),
    ).toBe("D2C-2026-000001");
    expect(
      allocator.allocate(new Date("2026-12-31T23:30:00.000Z")),
    ).toBe("D2C-2027-000001");
  });

  it("never returns the same preview identifier twice", () => {
    const allocator = createHospitalIdAllocator();
    const identifiers = new Set<string>();

    for (let index = 0; index < 1_000; index += 1) {
      identifiers.add(allocator.allocate(new Date("2026-06-15T10:00:00.000Z")));
    }

    expect(identifiers.size).toBe(1_000);
  });
});
