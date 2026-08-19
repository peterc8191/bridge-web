import { useCallback, useMemo, useState } from "react";
import { seedTenders } from "../data/tenders";
import type { NewTenderInput, Tender, TenderStatus } from "../types/tender";

const ADDED_TENDERS_KEY = "bridge:added-tenders";
const STATUS_OVERRIDES_KEY = "bridge:tender-status-overrides";

let tenderSequence = 0;
function generateTenderId(): string {
  tenderSequence += 1;
  return `tender-${tenderSequence}`;
}

function readAddedTenders(): Tender[] {
  try {
    const raw = localStorage.getItem(ADDED_TENDERS_KEY);
    return raw ? (JSON.parse(raw) as Tender[]) : [];
  } catch {
    return [];
  }
}

function writeAddedTenders(tenders: Tender[]) {
  try {
    localStorage.setItem(ADDED_TENDERS_KEY, JSON.stringify(tenders));
  } catch {
    // localStorage unavailable (e.g. private mode) - tenders just won't persist.
  }
}

function readStatusOverrides(): Record<string, TenderStatus> {
  try {
    const raw = localStorage.getItem(STATUS_OVERRIDES_KEY);
    return raw ? (JSON.parse(raw) as Record<string, TenderStatus>) : {};
  } catch {
    return {};
  }
}

function writeStatusOverrides(overrides: Record<string, TenderStatus>) {
  try {
    localStorage.setItem(STATUS_OVERRIDES_KEY, JSON.stringify(overrides));
  } catch {
    // localStorage unavailable - status changes just won't persist.
  }
}

function withOverrides(tenders: Tender[], overrides: Record<string, TenderStatus>): Tender[] {
  return tenders.map((tender) =>
    overrides[tender.id] ? { ...tender, status: overrides[tender.id] } : tender,
  );
}

export function useTenders() {
  const [addedTenders, setAddedTenders] = useState<Tender[]>(() => readAddedTenders());
  const [statusOverrides, setStatusOverrides] = useState<Record<string, TenderStatus>>(() =>
    readStatusOverrides(),
  );

  const addTender = useCallback((input: NewTenderInput) => {
    const tender: Tender = {
      id: generateTenderId(),
      issueId: input.issueId,
      traderId: input.traderId,
      traderEmail: input.traderEmail,
      traderServices: input.traderServices,
      traderAreas: input.traderAreas,
      amount: input.amount,
      message: input.message,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    setAddedTenders((prev) => {
      const next = [...prev, tender];
      writeAddedTenders(next);
      return next;
    });
  }, []);

  const acceptTender = useCallback((tenderId: string) => {
    setStatusOverrides((prevOverrides) => {
      const currentTenders = withOverrides([...seedTenders, ...readAddedTenders()], prevOverrides);
      const accepted = currentTenders.find((tender) => tender.id === tenderId);
      if (!accepted) return prevOverrides;

      const nextOverrides = { ...prevOverrides, [tenderId]: "accepted" as TenderStatus };
      for (const tender of currentTenders) {
        if (tender.id !== tenderId && tender.issueId === accepted.issueId && tender.status === "pending") {
          nextOverrides[tender.id] = "rejected";
        }
      }

      writeStatusOverrides(nextOverrides);
      return nextOverrides;
    });
  }, []);

  const tenders = useMemo(
    () => withOverrides([...seedTenders, ...addedTenders], statusOverrides),
    [addedTenders, statusOverrides],
  );

  return { tenders, addTender, acceptTender };
}
