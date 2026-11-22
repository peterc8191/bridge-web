import { useCallback, useEffect, useRef, useState } from "react";
import { readJSON, subscribeToKey, writeJSON } from "../lib/storage";

type Updater<T> = T | ((prev: T) => T);

/**
 * useState backed by localStorage.
 * - `key` may change (e.g. per-user keys); the value is re-read when it does.
 * - `key === null` means "nothing to persist" and always yields `fallback`.
 * - Writes from other tabs are picked up live.
 */
export function useStoredState<T>(key: string | null, fallback: T) {
  const fallbackRef = useRef(fallback);
  fallbackRef.current = fallback;

  const read = useCallback(
    (k: string | null): T => (k ? readJSON(k, fallbackRef.current) : fallbackRef.current),
    [],
  );

  const [state, setState] = useState(() => ({ key, value: read(key) }));

  // Key changed since last render: re-read synchronously (React's
  // "adjust state during render" pattern) so no stale frame is shown.
  let current = state;
  if (state.key !== key) {
    current = { key, value: read(key) };
    setState(current);
  }

  useEffect(() => {
    if (!key) return;
    return subscribeToKey(key, () => setState({ key, value: read(key) }));
  }, [key, read]);

  const setValue = useCallback(
    (updater: Updater<T>) => {
      setState((prev) => {
        const prevValue = prev.key === key ? prev.value : read(key);
        const next =
          typeof updater === "function" ? (updater as (p: T) => T)(prevValue) : updater;
        if (key) writeJSON(key, next);
        return { key, value: next };
      });
    },
    [key, read],
  );

  return [current.value, setValue] as const;
}
