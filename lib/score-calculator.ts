import type { TimeAccumulator } from "./types";
import { MIN_TRACKED_SECONDS } from "./constants";

/**
 * Calculate a productivity score (0-100) from time accumulation data.
 *
 * - If total tracked time (productive + nonProductive) is below
 *   MIN_TRACKED_SECONDS, returns 50 (neutral default) so the garden
 *   doesn't swing wildly at the start of the day.
 * - Otherwise: score = productive / (productive + nonProductive) * 100
 * - Neutral seconds are intentionally excluded from the ratio so that
 *   browsing neutral sites (e.g. search engines) doesn't dilute the score.
 */
export function calculateProductivityScore(
  accumulator: TimeAccumulator,
): number {
  const { productiveSeconds, nonProductiveSeconds } = accumulator;
  const total = productiveSeconds + nonProductiveSeconds;

  if (total < MIN_TRACKED_SECONDS) {
    return 50;
  }

  const raw = (productiveSeconds / total) * 100;
  return Math.round(Math.min(100, Math.max(0, raw)));
}
