import { useState, useCallback } from "react";
import { browser } from "wxt/browser";
import type { MessageType } from "@/lib/types";

interface UseMutateResult<TPayload, TResponse> {
  mutate: (payload: TPayload) => Promise<TResponse>;
  loading: boolean;
  error: Error | null;
}

/**
 * Sends a mutation message to the background script and returns the response.
 */
export function useMutateMessage<TPayload, TResponse>(
  type: MessageType,
): UseMutateResult<TPayload, TResponse> {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(
    async (payload: TPayload): Promise<TResponse> => {
      setLoading(true);
      setError(null);
      try {
        const response = await browser.runtime.sendMessage({
          type,
          payload,
        });
        return response as TResponse;
      } catch (err) {
        const e = err instanceof Error ? err : new Error(String(err));
        setError(e);
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [type],
  );

  return { mutate, loading, error };
}
