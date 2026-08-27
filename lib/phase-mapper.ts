import { GardenPhase } from "./types";
import { PHASE_THRESHOLDS } from "./constants";

/**
 * Map a productivity score to a garden phase using hysteresis.
 *
 * Hysteresis prevents rapid flickering between adjacent phases when the
 * score hovers near a boundary.  Each phase has separate *enter* and
 * *leave* thresholds — the score must rise above `enter` to upgrade,
 * but must drop below `leave` (which is lower) to downgrade.
 *
 * @param score        Current productivity score (0-100).
 * @param currentPhase The phase the garden is currently in.
 * @returns The phase the garden should transition to.
 */
export function mapScoreToPhase(
  score: number,
  currentPhase: GardenPhase,
): GardenPhase {
  // PHASE_THRESHOLDS is ordered best (Thriving) to worst (Neglected).
  // Find the index of the current phase in the thresholds array.
  const currentIdx = PHASE_THRESHOLDS.findIndex(
    (t) => t.phase === currentPhase,
  );

  // --- Try to upgrade (move toward Thriving / lower index) ---
  // Walk upward from the phase just above current.
  for (let i = 0; i < currentIdx; i++) {
    const threshold = PHASE_THRESHOLDS[i];
    if (score >= threshold.enter) {
      return threshold.phase;
    }
  }

  // --- Try to downgrade (move toward Neglected / higher index) ---
  // Walk downward from the current phase.
  // If the score dropped below the current phase's leave threshold,
  // find the appropriate lower phase.
  if (currentIdx >= 0 && currentIdx < PHASE_THRESHOLDS.length - 1) {
    const currentThreshold = PHASE_THRESHOLDS[currentIdx];
    if (score < currentThreshold.leave) {
      // Find the best phase whose enter threshold we still meet,
      // searching from just below current downward.
      for (let i = currentIdx + 1; i < PHASE_THRESHOLDS.length; i++) {
        const threshold = PHASE_THRESHOLDS[i];
        if (score >= threshold.enter) {
          return threshold.phase;
        }
      }
      // Below everything — Neglected.
      return GardenPhase.Neglected;
    }
  }

  // No transition — stay in the current phase.
  return currentPhase;
}
