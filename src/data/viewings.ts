import type { ViewingRequest } from "../types/viewing";

// Seed viewings so the Viewings page isn't empty on first load, and shows an
// example of each state: past/upcoming crossed with confirmed/pending.
export const seedViewings: ViewingRequest[] = [
  {
    id: "viewing-seed-1",
    propertyId: "p1",
    date: "2026-06-10",
    time: "11:00",
    note: "",
    confirmed: true,
    createdAt: "2026-06-01T09:00:00.000Z",
  },
  {
    id: "viewing-seed-2",
    propertyId: "p4",
    date: "2026-07-02",
    time: "15:00",
    note: "",
    confirmed: false,
    createdAt: "2026-06-25T09:00:00.000Z",
  },
  {
    id: "viewing-seed-3",
    propertyId: "p2",
    date: "2026-09-20",
    time: "13:00",
    note: "Bringing my partner along",
    confirmed: true,
    createdAt: "2026-08-10T09:00:00.000Z",
  },
  {
    id: "viewing-seed-4",
    propertyId: "p6",
    date: "2026-10-05",
    time: "10:30",
    note: "",
    confirmed: false,
    createdAt: "2026-08-12T09:00:00.000Z",
  },
];
