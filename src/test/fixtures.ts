import type { AuthUser } from "../types/auth";
import type { Issue } from "../types/issue";
import type { Property } from "../types/property";
import type { Tender } from "../types/tender";
import type { ViewingRequest } from "../types/viewing";

export const tenant: AuthUser = { id: "u-tenant", email: "tenant@test.com", role: "user" };
export const otherUser: AuthUser = { id: "u-other", email: "other@test.com", role: "user" };
export const landlord: AuthUser = { id: "u-landlord", email: "landlord@test.com", role: "landlord" };
export const otherLandlord: AuthUser = { id: "u-landlord-2", email: "landlord2@test.com", role: "landlord" };
export const trader: AuthUser = { id: "u-trader", email: "trader@test.com", role: "tradesperson" };

export function makeProperty(overrides: Partial<Property> = {}): Property {
  return {
    id: "p1",
    ownerId: landlord.id,
    address: "142 Maple Street",
    city: "Portland, OR",
    price: 549000,
    listingType: "sale",
    beds: 3,
    baths: 2,
    sqft: 1650,
    description: "Bright craftsman bungalow.",
    images: ["https://example.com/1.jpg", "https://example.com/2.jpg"],
    tenantEmails: [],
    ...overrides,
  };
}

export function makeIssue(overrides: Partial<Issue> = {}): Issue {
  return {
    id: "i1",
    propertyId: "p1",
    reporterId: tenant.id,
    reporterEmail: tenant.email,
    title: "Leaking faucet",
    description: "Drips all night.",
    status: "open",
    createdAt: "2026-08-01T09:00:00.000Z",
    ...overrides,
  };
}

export function makeViewing(overrides: Partial<ViewingRequest> = {}): ViewingRequest {
  return {
    id: "v1",
    propertyId: "p1",
    requesterId: tenant.id,
    requesterEmail: tenant.email,
    date: futureDate(7),
    time: "14:30",
    note: "",
    status: "pending",
    createdAt: "2026-08-01T09:00:00.000Z",
    ...overrides,
  };
}

export function makeTender(overrides: Partial<Tender> = {}): Tender {
  return {
    id: "t1",
    issueId: "i1",
    traderId: trader.id,
    traderEmail: trader.email,
    traderServices: ["Plumbing"],
    traderAreas: ["Portland, OR"],
    amount: 180,
    message: "Can fix this tomorrow.",
    status: "pending",
    createdAt: "2026-08-02T10:00:00.000Z",
    ...overrides,
  };
}

/** YYYY-MM-DD `days` from today (negative for the past) - never hardcode dates in tests. */
export function futureDate(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
