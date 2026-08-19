import { useCallback, useMemo, useState } from "react";
import type { Property } from "../types/property";

export type SwipeDirection = "left" | "right";

const SAVED_KEY = "bridge:saved-property-ids";
const DECIDED_KEY = "bridge:decided-property-ids";

function readIds(key: string): string[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function writeIds(key: string, ids: string[]) {
  try {
    localStorage.setItem(key, JSON.stringify(ids));
  } catch {
    // localStorage unavailable (e.g. private mode) - decisions just won't persist.
  }
}

export function usePropertyDeck(properties: Property[]) {
  const [savedIds, setSavedIds] = useState<string[]>(() => readIds(SAVED_KEY));
  const [decidedIds, setDecidedIds] = useState<string[]>(() => readIds(DECIDED_KEY));

  const deck = useMemo(
    () => properties.filter((property) => !decidedIds.includes(property.id)),
    [properties, decidedIds],
  );

  const saved = useMemo(
    () => properties.filter((property) => savedIds.includes(property.id)),
    [properties, savedIds],
  );

  const decide = useCallback((property: Property, direction: SwipeDirection) => {
    setDecidedIds((prev) => {
      if (prev.includes(property.id)) return prev;
      const next = [...prev, property.id];
      writeIds(DECIDED_KEY, next);
      return next;
    });

    if (direction === "right") {
      setSavedIds((prev) => {
        if (prev.includes(property.id)) return prev;
        const next = [...prev, property.id];
        writeIds(SAVED_KEY, next);
        return next;
      });
    }
  }, []);

  const removeSaved = useCallback((propertyId: string) => {
    setSavedIds((prev) => {
      const next = prev.filter((id) => id !== propertyId);
      writeIds(SAVED_KEY, next);
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setSavedIds([]);
    setDecidedIds([]);
    writeIds(SAVED_KEY, []);
    writeIds(DECIDED_KEY, []);
  }, []);

  return { deck, saved, decide, removeSaved, reset };
}
