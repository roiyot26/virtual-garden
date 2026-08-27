import { storage } from "wxt/utils/storage";
import type {
  DailyHistoryEntry,
  DomainLists,
  GardenState,
  Settings,
  Streak,
  TimeAccumulator,
} from "./types";
import {
  DEFAULT_DOMAIN_LISTS,
  DEFAULT_GARDEN_STATE,
  DEFAULT_SETTINGS,
  DEFAULT_STREAK,
  getDefaultTimeAccumulator,
} from "./defaults";

// --- Typed Storage Items ---

export const gardenStateStorage = storage.defineItem<GardenState>(
  "local:gardenState",
  { fallback: DEFAULT_GARDEN_STATE },
);

export const timeAccumulatorStorage = storage.defineItem<TimeAccumulator>(
  "local:timeAccumulator",
  { fallback: getDefaultTimeAccumulator() },
);

export const domainListsStorage = storage.defineItem<DomainLists>(
  "local:domainLists",
  { fallback: DEFAULT_DOMAIN_LISTS },
);

export const settingsStorage = storage.defineItem<Settings>(
  "local:settings",
  { fallback: DEFAULT_SETTINGS },
);

export const dailyHistoryStorage = storage.defineItem<DailyHistoryEntry[]>(
  "local:dailyHistory",
  { fallback: [] },
);

export const streakStorage = storage.defineItem<Streak>(
  "local:streak",
  { fallback: DEFAULT_STREAK },
);
