import { describe, expect, it } from "vitest";
import { MIN_TRACKED_SECONDS } from "./constants";
import { calculateProductivityScore } from "./score-calculator";
import type { TimeAccumulator } from "./types";

function acc(
  productiveSeconds: number,
  nonProductiveSeconds: number,
  neutralSeconds = 0,
): TimeAccumulator {
  return {
    date: "2026-03-19",
    productiveSeconds,
    nonProductiveSeconds,
    neutralSeconds,
    lastTickTimestamp: 0,
  };
}

describe("calculateProductivityScore", () => {
  it("stays neutral before enough time is tracked", () => {
    expect(calculateProductivityScore(acc(0, 0))).toBe(50);
    expect(
      calculateProductivityScore(acc(MIN_TRACKED_SECONDS - 1, 0)),
    ).toBe(50);
  });

  it("is the productive share of productive + non-productive time", () => {
    expect(calculateProductivityScore(acc(300, 0))).toBe(100);
    expect(calculateProductivityScore(acc(0, 300))).toBe(0);
    expect(calculateProductivityScore(acc(300, 300))).toBe(50);
    expect(calculateProductivityScore(acc(900, 100))).toBe(90);
  });

  it("ignores neutral seconds in the ratio", () => {
    expect(calculateProductivityScore(acc(300, 0, 10_000))).toBe(100);
  });
});
