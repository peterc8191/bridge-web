import { useCallback, useState } from "react";
import type { NewViewingInput, ViewingRequest } from "../types/viewing";

const VIEWINGS_KEY = "bridge:viewing-requests";

let viewingSequence = 0;
function generateViewingId(): string {
  viewingSequence += 1;
  return `viewing-${viewingSequence}`;
}

function readViewings(): ViewingRequest[] {
  try {
    const raw = localStorage.getItem(VIEWINGS_KEY);
    return raw ? (JSON.parse(raw) as ViewingRequest[]) : [];
  } catch {
    return [];
  }
}

function writeViewings(viewings: ViewingRequest[]) {
  try {
    localStorage.setItem(VIEWINGS_KEY, JSON.stringify(viewings));
  } catch {
    // localStorage unavailable (e.g. private mode) - requests just won't persist.
  }
}

export function useViewings() {
  const [viewings, setViewings] = useState<ViewingRequest[]>(() => readViewings());

  const scheduleViewing = useCallback((input: NewViewingInput) => {
    const viewing: ViewingRequest = {
      id: generateViewingId(),
      propertyId: input.propertyId,
      date: input.date,
      time: input.time,
      note: input.note,
      createdAt: new Date().toISOString(),
    };
    setViewings((prev) => {
      const next = [...prev, viewing];
      writeViewings(next);
      return next;
    });
  }, []);

  return { viewings, scheduleViewing };
}
