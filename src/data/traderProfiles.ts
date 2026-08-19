import type { TraderProfile } from "../types/traderProfile";

// Seed profile for the seeded tradesperson test account (tradea@abc.com,
// user id "user-seed-3" in src/data/authUsers.ts) so it isn't empty on first
// login, and so the seed tenders below have a plausible origin.
export const seedTraderProfiles: Record<string, TraderProfile> = {
  "user-seed-3": {
    services: ["Plumbing", "Electrical", "General repairs"],
    areas: ["Portland, OR", "Seattle, WA", "Beaverton, OR"],
    bio: "Licensed and insured handyman with 10+ years experience in residential repairs.",
  },
};
