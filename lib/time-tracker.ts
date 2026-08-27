import type { DomainCategory, TimeAccumulator, DailyHistoryEntry } from "./types";
import { GardenPhase } from "./types";
import { MAX_ELAPSED_CAP_SECONDS } from "./constants";
import { getDefaultTimeAccumulator } from "./defaults";
import {
  timeAccumulatorStorage,
  dailyHistoryStorage,
  gardenStateStorage,
} from "./storage";
import { classifyDomain } from "./domain-classifier";
import { domainListsStorage } from "./storage";

/**
 * TimeTracker is responsible for accumulating browsing time
 * into the three buckets (productive / non-productive / neutral)
 * stored in [[TimeAccumulator]].
 *
 * It is designed to be instantiated once in the background script.
 */
export class TimeTracker {
  private currentCategory: DomainCategory = "neutral";
  private tracking = true;

  // --- Public API ---

  /**
   * Called on every alarm tick.  Reads the accumulator from storage,
   * adds elapsed seconds to the appropriate bucket, and writes back.
   */
  async tick(): Promise<void> {
    if (!this.tracking) return;

    const accumulator = await timeAccumulatorStorage.getValue();
    const now = Date.now();
    const elapsedMs = now - accumulator.lastTickTimestamp;
    const elapsedSec = Math.min(
      elapsedMs / 1000,
      MAX_ELAPSED_CAP_SECONDS,
    );

    this.addSeconds(accumulator, this.currentCategory, elapsedSec);
    accumulator.lastTickTimestamp = now;

    await timeAccumulatorStorage.setValue(accumulator);
  }

  /**
   * Called when the active tab changes or a tab navigates to a new URL.
   * Immediately flushes accumulated time for the *previous* domain,
   * then switches to the new domain's category.
   */
  async onTabChanged(tabId: number, url: string | undefined): Promise<void> {
    // Flush time for the previous category.
    await this.tick();

    // Determine the new category.
    if (!url) {
      this.currentCategory = "neutral";
      return;
    }

    try {
      const hostname = new URL(url).hostname;
      const lists = await domainListsStorage.getValue();
      this.currentCategory = classifyDomain(hostname, lists);
    } catch {
      // Invalid URL (e.g. chrome:// pages).
      this.currentCategory = "neutral";
    }
  }

  /**
   * Called when the browser window gains or loses focus.
   * Pauses tracking when unfocused, resumes (with a fresh timestamp)
   * when focused again.
   */
  async onWindowFocusChanged(focused: boolean): Promise<void> {
    if (focused) {
      // Reset the tick timestamp so we don't count time while unfocused.
      const accumulator = await timeAccumulatorStorage.getValue();
      accumulator.lastTickTimestamp = Date.now();
      await timeAccumulatorStorage.setValue(accumulator);
      this.tracking = true;
    } else {
      // Flush whatever time has elapsed, then pause.
      await this.tick();
      this.tracking = false;
    }
  }

  /**
   * Returns today's date as "YYYY-MM-DD".
   */
  getDateString(): string {
    const now = new Date();
    return [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, "0"),
      String(now.getDate()).padStart(2, "0"),
    ].join("-");
  }

  /**
   * Checks whether the stored accumulator belongs to a previous day.
   * If so, archives yesterday's data into dailyHistory and resets
   * the accumulator for today.
   */
  async checkDailyReset(): Promise<void> {
    const accumulator = await timeAccumulatorStorage.getValue();
    const today = this.getDateString();

    if (accumulator.date === today) return;

    // Archive the old day.
    const gardenState = await gardenStateStorage.getValue();
    const entry: DailyHistoryEntry = {
      date: accumulator.date,
      productiveSeconds: accumulator.productiveSeconds,
      nonProductiveSeconds: accumulator.nonProductiveSeconds,
      peakPhase: gardenState.phase,
      finalPhase: gardenState.phase,
    };

    const history = await dailyHistoryStorage.getValue();
    history.push(entry);
    await dailyHistoryStorage.setValue(history);

    // Reset for today.
    const fresh = getDefaultTimeAccumulator();
    fresh.date = today;
    fresh.lastTickTimestamp = Date.now();
    await timeAccumulatorStorage.setValue(fresh);
  }

  // --- Internals ---

  private addSeconds(
    acc: TimeAccumulator,
    category: DomainCategory,
    seconds: number,
  ): void {
    switch (category) {
      case "productive":
        acc.productiveSeconds += seconds;
        break;
      case "non-productive":
        acc.nonProductiveSeconds += seconds;
        break;
      case "neutral":
        acc.neutralSeconds += seconds;
        break;
    }
  }
}
