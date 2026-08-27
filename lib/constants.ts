import { GardenPhase } from "./types";

// --- Alarm / Timer ---

/** Minimum interval for chrome.alarms (30 seconds). */
export const ALARM_INTERVAL_MINUTES = 0.5;

/** Seconds of tracked time before scoring deviates from neutral default. */
export const MIN_TRACKED_SECONDS = 300;

/** Maximum elapsed seconds credited per single tick (prevents overnight spikes). */
export const MAX_ELAPSED_CAP_SECONDS = 60;

/** Seconds of inactivity before the user is considered idle. */
export const IDLE_THRESHOLD_SECONDS = 300;

// --- Phase Thresholds (hysteresis) ---

export interface PhaseThreshold {
  phase: GardenPhase;
  /** Score must reach this value (>=) to *enter* the phase from a worse phase. */
  enter: number;
  /** Score must drop below this value (<) to *leave* the phase toward a worse phase. */
  leave: number;
}

/**
 * Ordered from best to worst.  The mapper walks this list top-down
 * when the score is rising, bottom-up when falling.
 */
export const PHASE_THRESHOLDS: readonly PhaseThreshold[] = [
  { phase: GardenPhase.Thriving, enter: 80, leave: 72 },
  { phase: GardenPhase.Serene, enter: 60, leave: 52 },
  { phase: GardenPhase.Neutral, enter: 40, leave: 32 },
  { phase: GardenPhase.Unsettled, enter: 25, leave: 18 },
  { phase: GardenPhase.Neglected, enter: -Infinity, leave: -Infinity },
] as const;

// --- Widget Sizes ---

export const WIDGET_SIZES = {
  compact: { width: 80, height: 80 },
  expanded: { width: 300, height: 200 },
} as const;
