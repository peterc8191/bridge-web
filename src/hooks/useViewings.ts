import { useCallback, useState } from "react";
import { createSeedViewings } from "../data/viewings";
import { newId, storageKey } from "../lib/storage";
import type { AuthUser } from "../types/auth";
import type { NewViewingInput, ViewingRequest, ViewingStatus } from "../types/viewing";
import { useStoredState } from "./useStoredState";

export const VIEWINGS_KEY = storageKey("viewings");

/** Raw viewing store. Who may see or change what is decided in AppDataProvider. */
export function useViewings() {
  const [seed] = useState(createSeedViewings);
  const [viewings, setViewings] = useStoredState<ViewingRequest[]>(VIEWINGS_KEY, seed);

  const scheduleViewing = useCallback(
    (requester: AuthUser, input: NewViewingInput) => {
      const viewing: ViewingRequest = {
        id: newId("viewing"),
        propertyId: input.propertyId,
        requesterId: requester.id,
        requesterEmail: requester.email,
        date: input.date,
        time: input.time,
        note: input.note,
        status: "pending",
        createdAt: new Date().toISOString(),
      };
      setViewings((prev) => [...prev, viewing]);
    },
    [setViewings],
  );

  const setViewingStatus = useCallback(
    (viewingId: string, status: ViewingStatus) => {
      setViewings((prev) =>
        prev.map((viewing) => (viewing.id === viewingId ? { ...viewing, status } : viewing)),
      );
    },
    [setViewings],
  );

  return { viewings, scheduleViewing, setViewingStatus };
}
