import { useCallback } from "react";
import { seedTraderProfiles } from "../data/traderProfiles";
import { storageKey } from "../lib/storage";
import type { TraderProfile } from "../types/traderProfile";
import { useStoredState } from "./useStoredState";

export const EMPTY_PROFILE: TraderProfile = { services: [], areas: [], bio: "" };

/** The signed-in trader's profile, stored per user id. */
export function useTraderProfile(userId: string | null) {
  const fallback = (userId && seedTraderProfiles[userId]) || EMPTY_PROFILE;
  const [profile, setProfile] = useStoredState<TraderProfile>(
    userId ? storageKey(`trader-profile:${userId}`) : null,
    fallback,
  );

  const updateProfile = useCallback(
    (input: TraderProfile) => {
      if (userId) setProfile(input);
    },
    [userId, setProfile],
  );

  return { profile, updateProfile };
}
