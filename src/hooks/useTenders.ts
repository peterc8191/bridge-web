import { useCallback } from "react";
import { seedTenders } from "../data/tenders";
import { newId, storageKey } from "../lib/storage";
import type { AuthUser } from "../types/auth";
import type { NewTenderInput, Tender } from "../types/tender";
import type { TraderProfile } from "../types/traderProfile";
import { useStoredState } from "./useStoredState";

export const TENDERS_KEY = storageKey("tenders");

/** Raw tender store. Who may see or change what is decided in AppDataProvider. */
export function useTenders() {
  const [tenders, setTenders] = useStoredState<Tender[]>(TENDERS_KEY, seedTenders);

  const addTender = useCallback(
    (trader: AuthUser, profile: TraderProfile, input: NewTenderInput) => {
      const tender: Tender = {
        id: newId("tender"),
        issueId: input.issueId,
        traderId: trader.id,
        traderEmail: trader.email,
        // Snapshot of the profile at quote time (see docs/features.md).
        traderServices: profile.services,
        traderAreas: profile.areas,
        amount: input.amount,
        message: input.message,
        status: "pending",
        createdAt: new Date().toISOString(),
      };
      setTenders((prev) => [...prev, tender]);
    },
    [setTenders],
  );

  /** Accepts one tender and rejects every other pending tender on the same issue. */
  const acceptTender = useCallback(
    (tenderId: string) => {
      setTenders((prev) => {
        const accepted = prev.find((tender) => tender.id === tenderId);
        if (!accepted) return prev;
        return prev.map((tender): Tender => {
          if (tender.id === tenderId) return { ...tender, status: "accepted" };
          if (tender.issueId === accepted.issueId && tender.status === "pending") {
            return { ...tender, status: "rejected" };
          }
          return tender;
        });
      });
    },
    [setTenders],
  );

  return { tenders, addTender, acceptTender };
}
