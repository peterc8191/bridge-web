import type { Tender } from "../types/tender";

// Seed tenders covering all three statuses. tender-seed-1/3 come from the
// seeded trader account (tradea@abc.com); tender-seed-2 is a rejected
// competing quote from a second (demo-only, not a real account) trader, to
// show what "accept" does to the other tenders on the same issue.
export const seedTenders: Tender[] = [
  {
    id: "tender-seed-1",
    issueId: "issue-seed-1",
    traderId: "user-seed-3",
    traderEmail: "tradea@abc.com",
    traderServices: ["Plumbing", "Electrical", "General repairs"],
    traderAreas: ["Portland, OR", "Seattle, WA", "Beaverton, OR"],
    amount: 180,
    message: "Can fix this within a day, parts included.",
    status: "accepted",
    createdAt: "2026-08-02T10:00:00.000Z",
  },
  {
    id: "tender-seed-2",
    issueId: "issue-seed-1",
    traderId: "trader-demo-2",
    traderEmail: "quickfixpro@example.com",
    traderServices: ["Plumbing"],
    traderAreas: ["Portland, OR"],
    amount: 240,
    message: "Available next week, standard callout fee applies.",
    status: "rejected",
    createdAt: "2026-08-01T15:00:00.000Z",
  },
  {
    id: "tender-seed-3",
    issueId: "issue-seed-2",
    traderId: "user-seed-3",
    traderEmail: "tradea@abc.com",
    traderServices: ["Plumbing", "Electrical", "General repairs"],
    traderAreas: ["Portland, OR", "Seattle, WA", "Beaverton, OR"],
    amount: 95,
    message: "Standard lock replacement, same-day availability.",
    status: "pending",
    createdAt: "2026-07-21T09:00:00.000Z",
  },
];
