import { useCallback, useMemo, useState } from "react";
import { seedViewings } from "../data/viewings";
import type { NewViewingInput, ViewingRequest } from "../types/viewing";

const VIEWINGS_KEY = "bridge:viewing-requests";

let viewingSequence = 0;
function generateViewingId(): string {
  viewingSequence += 1;
  return `viewing-${viewingSequence}`;
}

function readAddedViewings(): ViewingRequest[] {
  try {
    const raw = localStorage.getItem(VIEWINGS_KEY);
    return raw ? (JSON.parse(raw) as ViewingRequest[]) : [];
  } catch {
    return [];
  }
}

function writeAddedViewings(viewings: ViewingRequest[]) {
  try {
    localStorage.setItem(VIEWINGS_KEY, JSON.stringify(viewings));
  } catch {
    // localStorage unavailable (e.g. private mode) - requests just won't persist.
  }
}

export function useViewings() {
  const [addedViewings, setAddedViewings] = useState<ViewingRequest[]>(() => readAddedViewings());

  const scheduleViewing = useCallback((input: NewViewingInput) => {
    const viewing: ViewingRequest = {
      id: generateViewingId(),
      propertyId: input.propertyId,
      date: input.date,
      time: input.time,
      note: input.note,
      confirmed: false,
      createdAt: new Date().toISOString(),
    };
    setAddedViewings((prev) => {
      const next = [...prev, viewing];
      writeAddedViewings(next);
      return next;
    });
  }, []);

  const viewings = useMemo(() => [...seedViewings, ...addedViewings], [addedViewings]);

  return { viewings, scheduleViewing };
}
