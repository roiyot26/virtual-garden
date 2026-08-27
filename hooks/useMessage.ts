import { useState, useEffect, useCallback } from "react";
import { browser } from "wxt/browser";
import type { MessageType } from "@/lib/types";

interface UseMessageResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Fetches data from the background script via a typed message.
 * Re-fetches when `type`, `payload`, or `deps` change.
 */
export function useMessage<T>(
  type: MessageType,
  payload?: unknown,
  deps: unknown[] = [],
): UseMessageResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [fetchCount, setFetchCount] = useState(0);

  const refetch = useCallback(() => {
    setFetchCount((c) => c + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    browser.runtime
      .sendMessage({ type, payload })
      .then((response: unknown) => {
        if (!cancelled) {
          setData(response as T);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(
            err instanceof Error ? err : new Error(String(err)),
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, fetchCount, ...deps]);

  return { data, loading, error, refetch };
}
