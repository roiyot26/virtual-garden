import { defineContentScript } from "wxt/utils/define-content-script";
import { browser } from "wxt/browser";
import { createGardenWidget } from "@/content/garden-widget";
import type { GardenStateResponse, PhaseChangeMessage } from "@/lib/types";

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
      const msg = message as PhaseChangeMessage;
      if (msg.type === "PHASE_CHANGE") {
        widget.setPhase(msg.payload.phase);
      }
    });

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
