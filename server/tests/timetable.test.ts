import { describe, it, expect } from "vitest";
import {
  doTimesOverlap,
  timeToMinutes,
} from "../src/utils/timetableConflict.js";

describe("Timetable Conflict & Overlap Logic", () => {
  it("converts HH:mm strings to minutes correctly", () => {
    expect(timeToMinutes("09:00")).toBe(540);
    expect(timeToMinutes("10:30")).toBe(630);
    expect(timeToMinutes("00:00")).toBe(0);
  });

  it("detects overlapping slots correctly", () => {
    // 09:00-10:30 overlaps with 10:00-11:00
    expect(doTimesOverlap("09:00", "10:30", "10:00", "11:00")).toBe(true);

    // Identical slots overlap
    expect(doTimesOverlap("09:00", "10:00", "09:00", "10:00")).toBe(true);

    // Enclosed slot overlaps
    expect(doTimesOverlap("09:00", "12:00", "10:00", "11:00")).toBe(true);
  });

  it("allows adjacent slots without false positive conflict", () => {
    // 09:00-10:00 and 10:00-11:00 MUST NOT conflict (adjacent slots allowed)
    expect(doTimesOverlap("09:00", "10:00", "10:00", "11:00")).toBe(false);
    expect(doTimesOverlap("11:00", "12:00", "10:00", "11:00")).toBe(false);
  });

  it("recognizes completely disjoint slots as non-overlapping", () => {
    expect(doTimesOverlap("09:00", "10:00", "14:00", "15:00")).toBe(false);
  });
});
