import type {
  GardenState,
  PhaseChangeMessage,
  StatsResponse,
} from "./types";
import { GardenPhase } from "./types";
import {
  gardenStateStorage,
  timeAccumulatorStorage,
  streakStorage,
} from "./storage";
import { DEFAULT_GARDEN_STATE } from "./defaults";
import { calculateProductivityScore } from "./score-calculator";
import { mapScoreToPhase } from "./phase-mapper";

/**
 * Orchestrates high-level state updates: scoring, phase mapping,
 * persistence, and streak tracking.
 *
 * Designed to be instantiated once in the background script.
 */
export class StateManager {
  /**
   * Reads the current time accumulator, calculates the score,
   * maps to a phase (with hysteresis), and persists the garden state.
   *
   * @returns A [[PhaseChangeMessage]] payload if the phase changed,
   *          or `null` if it stayed the same.
   */
  async updateState(): Promise<PhaseChangeMessage["payload"] | null> {
    const accumulator = await timeAccumulatorStorage.getValue();
    const score = calculateProductivityScore(accumulator);

    const current = await gardenStateStorage.getValue();
    const newPhase = mapScoreToPhase(score, current.phase);

    const updated: GardenState = {
      phase: newPhase,
      score,
      lastUpdated: Date.now(),
    };
    await gardenStateStorage.setValue(updated);

    if (newPhase !== current.phase) {
      return {
        phase: newPhase,
        previousPhase: current.phase,
        score,
      };
    }
    return null;
  }

  /**
   * Resets the garden to the neutral default state.
   */
  async resetGarden(): Promise<void> {
    await gardenStateStorage.setValue({
      ...DEFAULT_GARDEN_STATE,
      lastUpdated: Date.now(),
    });
  }

  /**
   * Builds a full stats snapshot for the popup / options page.
   */
  async getFullStats(): Promise<StatsResponse> {
    const accumulator = await timeAccumulatorStorage.getValue();
    const gardenState = await gardenStateStorage.getValue();
    const streak = await streakStorage.getValue();

    return {
      today: {
        productiveSeconds: accumulator.productiveSeconds,
        nonProductiveSeconds: accumulator.nonProductiveSeconds,
        neutralSeconds: accumulator.neutralSeconds,
        score: gardenState.score,
        phase: gardenState.phase,
      },
      streak,
    };
  }
}
