import { useCallback, useMemo, useState } from "react";
import { storageKey } from "../lib/storage";
import type { Property } from "../types/property";
import { useStoredState } from "./useStoredState";

export type SwipeDirection = "left" | "right";

interface Decision {
  propertyId: string;
  direction: SwipeDirection;
}

const EMPTY: string[] = [];

/** Swipe decisions and saved listings, stored per account ("guest" when signed out). */
export function usePropertyDeck(properties: Property[], userId: string | null) {
  const owner = userId ?? "guest";
  const [savedIds, setSavedIds] = useStoredState<string[]>(storageKey(`saved:${owner}`), EMPTY);
  const [decidedIds, setDecidedIds] = useStoredState<string[]>(storageKey(`decided:${owner}`), EMPTY);
  // Undo history lives for the session only, and is scoped to the account.
  const [history, setHistory] = useState<{ owner: string; decisions: Decision[] }>({
    owner,
    decisions: [],
  });
  const decisions = useMemo(
    () => (history.owner === owner ? history.decisions : []),
    [history, owner],
  );

  const deck = useMemo(
    () => properties.filter((property) => !decidedIds.includes(property.id)),
    [properties, decidedIds],
  );

  const saved = useMemo(
    () => properties.filter((property) => savedIds.includes(property.id)),
    [properties, savedIds],
  );

  const decide = useCallback(
    (property: Property, direction: SwipeDirection) => {
      setDecidedIds((prev) => (prev.includes(property.id) ? prev : [...prev, property.id]));
      if (direction === "right") {
        setSavedIds((prev) => (prev.includes(property.id) ? prev : [...prev, property.id]));
      }
      setHistory((prev) => ({
        owner,
        decisions: [
          ...(prev.owner === owner ? prev.decisions : []),
          { propertyId: property.id, direction },
        ],
      }));
    },
    [owner, setDecidedIds, setSavedIds],
  );

  const undo = useCallback(() => {
    const last = decisions[decisions.length - 1];
    if (!last) return;
    setDecidedIds((prev) => prev.filter((id) => id !== last.propertyId));
    if (last.direction === "right") {
      setSavedIds((prev) => prev.filter((id) => id !== last.propertyId));
    }
    setHistory({ owner, decisions: decisions.slice(0, -1) });
  }, [decisions, owner, setDecidedIds, setSavedIds]);

  const removeSaved = useCallback(
    (propertyId: string) => setSavedIds((prev) => prev.filter((id) => id !== propertyId)),
    [setSavedIds],
  );

  const reset = useCallback(() => {
    setSavedIds([]);
    setDecidedIds([]);
    setHistory({ owner, decisions: [] });
  }, [owner, setDecidedIds, setSavedIds]);

  return { deck, saved, decide, undo, canUndo: decisions.length > 0, removeSaved, reset };
}
