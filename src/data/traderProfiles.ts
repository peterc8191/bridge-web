import type { TraderProfile } from "../types/traderProfile";

// Seed profile for the seeded tradesperson (tradea@abc.com, "user-seed-3").
// Its areas cover both seed issues' properties (p3 Denver, p7 Minneapolis) so
// the trader can tender on them; issues elsewhere are hidden from them.
export const seedTraderProfiles: Record<string, TraderProfile> = {
  "user-seed-3": {
    services: ["Plumbing", "Electrical", "General repairs"],
    areas: ["Denver, CO", "Minneapolis, MN", "Portland, OR"],
    bio: "Licensed and insured handyman with 10+ years experience in residential repairs.",
  },
};
