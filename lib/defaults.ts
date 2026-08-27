import type {
  DomainLists,
  GardenState,
  Settings,
  Streak,
  TimeAccumulator,
} from "./types";
import { GardenPhase } from "./types";

// --- Default Domain Lists ---

export const DEFAULT_PRODUCTIVE_DOMAINS: string[] = [
  "github.com",
  "gitlab.com",
  "bitbucket.org",
  "stackoverflow.com",
  "stackexchange.com",
  "developer.mozilla.org",
  "docs.google.com",
  "sheets.google.com",
  "slides.google.com",
  "notion.so",
  "linear.app",
  "jira.atlassian.com",
  "figma.com",
  "vercel.com",
  "netlify.com",
  "coursera.org",
  "udemy.com",
  "edx.org",
  "learn.microsoft.com",
];

export const DEFAULT_NON_PRODUCTIVE_DOMAINS: string[] = [
  "facebook.com",
  "instagram.com",
  "twitter.com",
  "x.com",
  "tiktok.com",
  "reddit.com",
  "9gag.com",
  "youtube.com",
  "netflix.com",
  "twitch.tv",
  "disneyplus.com",
  "hulu.com",
  "buzzfeed.com",
];

// --- Default Settings ---

export const DEFAULT_SETTINGS: Settings = {
  notificationLevel: "pulse",
  widgetPosition: "bottom-right",
  widgetEnabled: true,
  animationBundle: "zen-garden",
};

// --- Default Garden State ---

export const DEFAULT_GARDEN_STATE: GardenState = {
  phase: GardenPhase.Neutral,
  score: 50,
  lastUpdated: Date.now(),
};

// --- Default Streak ---

export const DEFAULT_STREAK: Streak = {
  currentDays: 0,
  longestDays: 0,
  lastStreakDate: "",
};

// --- Default Domain Lists ---

export const DEFAULT_DOMAIN_LISTS: DomainLists = {
  productive: DEFAULT_PRODUCTIVE_DOMAINS,
  nonProductive: DEFAULT_NON_PRODUCTIVE_DOMAINS,
};

// --- Default Time Accumulator ---

/** Returns a fresh TimeAccumulator for today's date. */
export function getDefaultTimeAccumulator(): TimeAccumulator {
  const now = new Date();
  const date = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");

  return {
    date,
    productiveSeconds: 0,
    nonProductiveSeconds: 0,
    neutralSeconds: 0,
    lastTickTimestamp: Date.now(),
  };
}
