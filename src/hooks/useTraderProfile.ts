import { useCallback, useEffect, useState } from "react";
import { seedTraderProfiles } from "../data/traderProfiles";
import type { TraderProfile } from "../types/traderProfile";

const PROFILE_KEY_PREFIX = "bridge:trader-profile:";
const EMPTY_PROFILE: TraderProfile = { services: [], areas: [], bio: "" };

function readProfile(userId: string): TraderProfile {
  try {
    const raw = localStorage.getItem(`${PROFILE_KEY_PREFIX}${userId}`);
    if (raw) return JSON.parse(raw) as TraderProfile;
  } catch {
    // fall through to seed/default
  }
  return seedTraderProfiles[userId] ?? EMPTY_PROFILE;
}

function writeProfile(userId: string, profile: TraderProfile) {
  try {
    localStorage.setItem(`${PROFILE_KEY_PREFIX}${userId}`, JSON.stringify(profile));
  } catch {
    // localStorage unavailable (e.g. private mode) - changes just won't persist.
  }
}

export function useTraderProfile(userId: string | null) {
  const [profile, setProfile] = useState<TraderProfile>(() => (userId ? readProfile(userId) : EMPTY_PROFILE));

  // Re-read when the signed-in user changes (e.g. logging in as a different
  // trader in the same browser) - the lazy useState initializer above only
  // runs once, so it wouldn't otherwise pick up a later userId change.
  useEffect(() => {
    setProfile(userId ? readProfile(userId) : EMPTY_PROFILE);
  }, [userId]);

  const updateProfile = useCallback(
    (input: TraderProfile) => {
      if (!userId) return;
      writeProfile(userId, input);
      setProfile(input);
    },
    [userId],
  );

  return { profile, updateProfile };
}
