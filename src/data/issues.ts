import type { Issue } from "../types/issue";

// Seed issues reported by the seeded tenant (usera@abc.com) on the two rental
// listings they rent - one owned by each seeded landlord - so each landlord
// sees only the issue on their own property.
export const seedIssues: Issue[] = [
  {
    id: "issue-seed-1",
    propertyId: "p3",
    reporterId: "user-seed-1",
    reporterEmail: "usera@abc.com",
    title: "Leaking kitchen faucet",
    description: "The kitchen faucet has been dripping steadily for about a week.",
    status: "in-progress",
    createdAt: "2026-08-01T09:00:00.000Z",
  },
  {
    id: "issue-seed-2",
    propertyId: "p7",
    reporterId: "user-seed-1",
    reporterEmail: "usera@abc.com",
    title: "Broken back door lock",
    description: "The lock on the back door doesn't catch properly - it swings open in the wind.",
    status: "open",
    createdAt: "2026-07-20T14:30:00.000Z",
  },
];
