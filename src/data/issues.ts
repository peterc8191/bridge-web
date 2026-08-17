import type { Issue } from "../types/issue";

// Seed issues so the tab isn't empty on first load. Mirrors how properties.ts
// seeds mock listings - user-reported issues layer on top via useIssues/localStorage.
export const seedIssues: Issue[] = [
  {
    id: "issue-seed-1",
    propertyId: "p1",
    title: "Leaking kitchen faucet",
    description: "The kitchen faucet has been dripping steadily for about a week.",
    status: "in-progress",
    createdAt: "2026-08-01T09:00:00.000Z",
  },
  {
    id: "issue-seed-2",
    propertyId: "p4",
    title: "Broken balcony door lock",
    description: "The lock on the balcony door doesn't catch properly - it swings open in the wind.",
    status: "resolved",
    createdAt: "2026-07-20T14:30:00.000Z",
  },
];
