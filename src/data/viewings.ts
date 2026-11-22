import type { ViewingRequest } from "../types/viewing";

// Dates are relative to first load so there are always both upcoming and past
// examples, whatever day the app is opened.
function daysFromNow(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function seedViewing(
  id: string,
  propertyId: string,
  offsetDays: number,
  time: string,
  status: ViewingRequest["status"],
  note = "",
): ViewingRequest {
  return {
    id,
    propertyId,
    requesterId: "user-seed-1",
    requesterEmail: "usera@abc.com",
    date: daysFromNow(offsetDays),
    time,
    note,
    status,
    createdAt: new Date(Date.now() + (offsetDays - 7) * 86_400_000).toISOString(),
  };
}

// Requested by the seeded user on landlord A's listings (p1, p2, p4, p6),
// covering past/upcoming x confirmed/pending plus a declined one.
export function createSeedViewings(): ViewingRequest[] {
  return [
    seedViewing("viewing-seed-1", "p1", -30, "11:00", "confirmed"),
    seedViewing("viewing-seed-2", "p4", -10, "15:00", "pending"),
    seedViewing("viewing-seed-3", "p2", 5, "13:00", "confirmed", "Bringing my partner along"),
    seedViewing("viewing-seed-4", "p6", 12, "10:30", "pending"),
    seedViewing("viewing-seed-5", "p8", 8, "17:00", "declined"),
  ];
}
