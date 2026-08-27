import { describe, expect, it } from "vitest";
import { mapScoreToPhase } from "./phase-mapper";
import { GardenPhase } from "./types";

describe("mapScoreToPhase", () => {
  it("upgrades when the score clears an enter threshold", () => {
    expect(mapScoreToPhase(60, GardenPhase.Neutral)).toBe(GardenPhase.Serene);
    expect(mapScoreToPhase(80, GardenPhase.Neutral)).toBe(GardenPhase.Thriving);
    expect(mapScoreToPhase(80, GardenPhase.Serene)).toBe(GardenPhase.Thriving);
  });

  it("uses hysteresis so a small dip does not flicker", () => {
    expect(mapScoreToPhase(75, GardenPhase.Thriving)).toBe(GardenPhase.Thriving);
    expect(mapScoreToPhase(72, GardenPhase.Thriving)).toBe(GardenPhase.Thriving);
    expect(mapScoreToPhase(71, GardenPhase.Thriving)).toBe(GardenPhase.Serene);
  });

  it("downgrades toward Neglected when the score collapses", () => {
    expect(mapScoreToPhase(20, GardenPhase.Thriving)).toBe(
      GardenPhase.Neglected,
    );
    expect(mapScoreToPhase(0, GardenPhase.Neutral)).toBe(GardenPhase.Neglected);
  });

  it("stays put when the score is inside the current band", () => {
    expect(mapScoreToPhase(50, GardenPhase.Neutral)).toBe(GardenPhase.Neutral);
    expect(mapScoreToPhase(40, GardenPhase.Neutral)).toBe(GardenPhase.Neutral);
  });
});
