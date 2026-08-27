import { defineBackground } from "wxt/utils/define-background";
import { browser } from "wxt/browser";
import { TimeTracker } from "@/lib/time-tracker";
import { StateManager } from "@/lib/state-manager";
import {
  DEFAULT_GARDEN_STATE,
  DEFAULT_DOMAIN_LISTS,
  DEFAULT_SETTINGS,
  DEFAULT_STREAK,
  getDefaultTimeAccumulator,
} from "@/lib/defaults";
import {
  gardenStateStorage,
  settingsStorage,
  domainListsStorage,
  streakStorage,
  timeAccumulatorStorage,
  dailyHistoryStorage,
} from "@/lib/storage";
import type {
  Message,
  Settings,
  DomainLists,
  DomainCategory,
  ExportData,
} from "@/lib/types";

const HEARTBEAT_ALARM = "heartbeat";
const HEARTBEAT_INTERVAL_MINUTES = 0.5;

export default defineBackground(() => {
  const timeTracker = new TimeTracker();
  const stateManager = new StateManager();

  // --- Install handler: initialize default storage ---
  browser.runtime.onInstalled.addListener(async (details) => {
    if (details.reason === "install") {
      await gardenStateStorage.setValue({
        ...DEFAULT_GARDEN_STATE,
        lastUpdated: Date.now(),
      });
      await domainListsStorage.setValue(DEFAULT_DOMAIN_LISTS);
      await settingsStorage.setValue(DEFAULT_SETTINGS);
      await streakStorage.setValue(DEFAULT_STREAK);
      await timeAccumulatorStorage.setValue(getDefaultTimeAccumulator());
    }
  });

  // --- Set up heartbeat alarm ---
  browser.alarms.create(HEARTBEAT_ALARM, {
    periodInMinutes: HEARTBEAT_INTERVAL_MINUTES,
  });

  // --- Alarm handler ---
  browser.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name !== HEARTBEAT_ALARM) return;

    await timeTracker.checkDailyReset();
    await timeTracker.tick();
    const phaseChange = await stateManager.updateState();

    if (phaseChange) {
      try {
        const [tab] = await browser.tabs.query({
          active: true,
          currentWindow: true,
        });
        if (tab?.id) {
          await browser.tabs.sendMessage(tab.id, {
            type: "PHASE_CHANGE",
            payload: phaseChange,
          });
        }
      } catch {
        // Tab may not have content script ready; ignore
      }
    }
  });

  // --- Tab activation ---
  browser.tabs.onActivated.addListener(async (activeInfo) => {
    try {
      const tab = await browser.tabs.get(activeInfo.tabId);
      await timeTracker.onTabChanged(activeInfo.tabId, tab.url);
      await stateManager.updateState();
    } catch {
      // Tab may have been closed; ignore
    }
  });

  // --- Tab updated (URL change within same tab) ---
  browser.tabs.onUpdated.addListener(async (_tabId, changeInfo) => {
    if (changeInfo.url) {
      await timeTracker.onTabChanged(_tabId, changeInfo.url);
      await stateManager.updateState();
    }
  });

  // --- Window focus changed ---
  browser.windows.onFocusChanged.addListener(async (windowId) => {
    await timeTracker.onWindowFocusChanged(
      windowId !== browser.windows.WINDOW_ID_NONE,
    );
  });

  // --- Message handler ---
  browser.runtime.onMessage.addListener(
    (
      message: Message,
      _sender: unknown,
      sendResponse: (response?: unknown) => void,
    ) => {
      handleMessage(message, stateManager)
        .then(sendResponse)
        .catch((err) => {
          console.error("[virtual-garden] Message handling error:", err);
          sendResponse({ error: String(err) });
        });

      // Return true to indicate async response
      return true;
    },
  );
});

async function handleMessage(
  message: Message,
  stateManager: StateManager,
): Promise<unknown> {
  switch (message.type) {
    case "GET_GARDEN_STATE": {
      const state = await gardenStateStorage.getValue();
      return { phase: state.phase, score: state.score };
    }

    case "GET_STATS": {
      return stateManager.getFullStats();
    }

    case "GET_SETTINGS": {
      return settingsStorage.getValue();
    }

    case "UPDATE_SETTINGS": {
      const newSettings = message.payload as Partial<Settings>;
      const current = await settingsStorage.getValue();
      const merged = { ...current, ...newSettings };
      await settingsStorage.setValue(merged);
      return merged;
    }

    case "GET_DOMAIN_LISTS": {
      return domainListsStorage.getValue();
    }

    case "UPDATE_DOMAIN_LISTS": {
      const newLists = message.payload as DomainLists;
      await domainListsStorage.setValue(newLists);
      return newLists;
    }

    case "CLASSIFY_DOMAIN": {
      const { domain, category } = message.payload as {
        domain: string;
        category: DomainCategory;
      };
      const lists = await domainListsStorage.getValue();

      // Remove from both lists first
      lists.productive = lists.productive.filter((d) => d !== domain);
      lists.nonProductive = lists.nonProductive.filter((d) => d !== domain);

      // Add to appropriate list
      if (category === "productive") {
        lists.productive.push(domain);
      } else if (category === "non-productive") {
        lists.nonProductive.push(domain);
      }

      await domainListsStorage.setValue(lists);
      return lists;
    }

    case "RESET_GARDEN": {
      await stateManager.resetGarden();
      await timeAccumulatorStorage.setValue(getDefaultTimeAccumulator());
      return { success: true };
    }

    case "GET_DAILY_HISTORY": {
      const history = await dailyHistoryStorage.getValue();
      return { history };
    }

    case "EXPORT_ALL_DATA": {
      const [gs, ta, dl, st, dh, sk] = await Promise.all([
        gardenStateStorage.getValue(),
        timeAccumulatorStorage.getValue(),
        domainListsStorage.getValue(),
        settingsStorage.getValue(),
        dailyHistoryStorage.getValue(),
        streakStorage.getValue(),
      ]);
      return {
        version: 1,
        exportedAt: new Date().toISOString(),
        gardenState: gs,
        timeAccumulator: ta,
        domainLists: dl,
        settings: st,
        dailyHistory: dh,
        streak: sk,
      } satisfies ExportData;
    }

    case "IMPORT_ALL_DATA": {
      const data = message.payload as ExportData;
      if (data.version !== 1) {
        return { error: "Unsupported export version" };
      }
      await Promise.all([
        gardenStateStorage.setValue(data.gardenState),
        timeAccumulatorStorage.setValue(data.timeAccumulator),
        domainListsStorage.setValue(data.domainLists),
        settingsStorage.setValue(data.settings),
        dailyHistoryStorage.setValue(data.dailyHistory),
        streakStorage.setValue(data.streak),
      ]);
      return { success: true };
    }

    default:
      return { error: `Unknown message type: ${message.type}` };
  }
}
