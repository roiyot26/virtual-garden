import { browser, type Browser } from "wxt/browser";
import type { Message, MessageType } from "./types";

/**
 * Send a message to the background script (or whichever listener is active)
 * and return the typed response.
 */
export async function sendMessage<T = void>(message: Message): Promise<T> {
  return browser.runtime.sendMessage(message) as Promise<T>;
}

/**
 * Register a typed handler that only fires for a specific message type.
 *
 * @param type    The MessageType to listen for.
 * @param handler Receives the full Message and a sendResponse callback.
 *                May return a value (or a Promise) that will be sent back
 *                to the caller.
 */
export function onMessage<T extends MessageType>(
  type: T,
  handler: (
    message: Message<T>,
    sender: Browser.runtime.MessageSender,
  ) => void | Promise<unknown> | unknown,
): void {
  browser.runtime.onMessage.addListener(
    (raw: unknown, sender: Browser.runtime.MessageSender) => {
      const msg = raw as Message;
      if (msg.type !== type) return;

      const result = handler(msg as Message<T>, sender);

      // If the handler returns a promise, the listener must return true so
      // the messaging channel stays open until the promise settles.
      if (result instanceof Promise) {
        // We intentionally return the promise — the browser API resolves it.
        return result;
      }
      return result;
    },
  );
}

/**
 * Send a message to a specific tab's content script.
 */
export async function sendToTab<T = void>(
  tabId: number,
  message: Message,
): Promise<T> {
  return browser.tabs.sendMessage(tabId, message) as Promise<T>;
}
