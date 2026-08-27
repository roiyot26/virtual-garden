// --- Garden Phases ---

export enum GardenPhase {
  Thriving = 1,
  Serene = 2,
  Neutral = 3,
  Unsettled = 4,
  Neglected = 5,
}

// --- Storage Schema ---

export interface GardenState {
  phase: GardenPhase;
  score: number;
  lastUpdated: number; // Unix ms
}

export interface TimeAccumulator {
  date: string; // "YYYY-MM-DD"
  productiveSeconds: number;
  nonProductiveSeconds: number;
  neutralSeconds: number;
  lastTickTimestamp: number; // Unix ms
}

export interface DomainLists {
  productive: string[];
  nonProductive: string[];
}

export type NotificationLevel = "none" | "pulse" | "toast";
export type WidgetPosition = "bottom-right" | "bottom-left";

export interface Settings {
  notificationLevel: NotificationLevel;
  widgetPosition: WidgetPosition;
  widgetEnabled: boolean;
  animationBundle: string;
}

export interface DailyHistoryEntry {
  date: string; // "YYYY-MM-DD"
  productiveSeconds: number;
  nonProductiveSeconds: number;
  peakPhase: GardenPhase;
  finalPhase: GardenPhase;
}

export interface Streak {
  currentDays: number;
  longestDays: number;
  lastStreakDate: string; // "YYYY-MM-DD"
}

export interface StorageSchema {
  gardenState: GardenState;
  timeAccumulator: TimeAccumulator;
  domainLists: DomainLists;
  settings: Settings;
  dailyHistory: DailyHistoryEntry[];
  streak: Streak;
}

// --- Domain Classification ---

export type DomainCategory = "productive" | "non-productive" | "neutral";

// --- Messages ---

export type MessageType =
  | "GET_GARDEN_STATE"
  | "GET_STATS"
  | "GET_SETTINGS"
  | "UPDATE_SETTINGS"
  | "GET_DOMAIN_LISTS"
  | "UPDATE_DOMAIN_LISTS"
  | "CLASSIFY_DOMAIN"
  | "RESET_GARDEN"
  | "PHASE_CHANGE"
  | "GET_DAILY_HISTORY"
  | "EXPORT_ALL_DATA"
  | "IMPORT_ALL_DATA"
  | "SETTINGS_CHANGE";

export interface Message<T extends MessageType = MessageType> {
  type: T;
  payload?: unknown;
}

export interface GardenStateResponse {
  phase: GardenPhase;
  score: number;
}

export interface StatsResponse {
  today: {
    productiveSeconds: number;
    nonProductiveSeconds: number;
    neutralSeconds: number;
    score: number;
    phase: GardenPhase;
  };
  streak: Streak;
}

export interface DailyHistoryResponse {
  history: DailyHistoryEntry[];
}

export interface ExportData {
  version: 1;
  exportedAt: string; // ISO date
  gardenState: GardenState;
  timeAccumulator: TimeAccumulator;
  domainLists: DomainLists;
  settings: Settings;
  dailyHistory: DailyHistoryEntry[];
  streak: Streak;
}

export interface PhaseChangeMessage {
  type: "PHASE_CHANGE";
  payload: {
    phase: GardenPhase;
    previousPhase: GardenPhase;
    score: number;
  };
}
