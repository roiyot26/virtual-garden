import { defineContentScript } from "wxt/utils/define-content-script";
import { browser } from "wxt/browser";
import { createGardenWidget } from "@/content/garden-widget";
import type { GardenStateResponse, PhaseChangeMessage, Settings } from "@/lib/types";

export default defineContentScript({
  matches: ["<all_urls>"],
  runAt: "document_idle",

  main() {
    const url = window.location.href;
    if (
      url.startsWith("chrome://") ||
      url.startsWith("chrome-extension://") ||
      url.startsWith("about:")
    ) {
      return;
    }

    const widget = createGardenWidget();

    browser.runtime.onMessage.addListener((message: unknown) => {
      const msg = message as PhaseChangeMessage | { type: string; payload?: { animationBundle?: string } };
      if (msg.type === "PHASE_CHANGE" && "payload" in msg && msg.payload && "phase" in msg.payload) {
        widget.setPhase((msg as PhaseChangeMessage).payload.phase);
      }
      if (msg.type === "SETTINGS_CHANGE" && msg.payload?.animationBundle) {
        widget.setBundle(msg.payload.animationBundle);
      }
    });

    browser.runtime
      .sendMessage({ type: "GET_SETTINGS" })
      .then((response: unknown) => {
        const settings = response as Settings;
        if (settings?.animationBundle) {
          widget.setBundle(settings.animationBundle);
        }
      })
      .catch(() => {});

    browser.runtime
      .sendMessage({ type: "GET_GARDEN_STATE" })
      .then((response: unknown) => {
        const state = response as GardenStateResponse;
        if (state?.phase) {
          widget.setPhase(state.phase);
        }
      })
      .catch(() => {
        // Background may not be ready yet; widget stays at default phase
      });
  },
});
