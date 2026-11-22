import { describe, expect, it } from "vitest";
import { navCounts } from "./navCounts";
import { indexProperties } from "./permissions";
import {
  futureDate,
  landlord,
  makeIssue,
  makeProperty,
  makeViewing,
  tenant,
  trader,
} from "../test/fixtures";

const propertyById = indexProperties([makeProperty({ id: "p1", ownerId: landlord.id, city: "Portland, OR" })]);
const base = { propertyById, tenders: [], traderProfile: { services: [], areas: ["Portland, OR"], bio: "" } };

const viewings = [
  makeViewing({ id: "v1", status: "pending", date: futureDate(2) }),
  makeViewing({ id: "v2", status: "confirmed", date: futureDate(3) }),
  makeViewing({ id: "v3", status: "pending", date: futureDate(-3) }),
  makeViewing({ id: "v4", status: "cancelled", date: futureDate(4) }),
];
const issues = [
  makeIssue({ id: "i1", status: "open" }),
  makeIssue({ id: "i2", status: "in-progress" }),
  makeIssue({ id: "i3", status: "resolved" }),
];

describe("navCounts", () => {
  it("is zero when signed out", () => {
    expect(navCounts({ ...base, currentUser: null, issues, viewings })).toEqual({ viewings: 0, issues: 0 });
  });

  it("tenant: upcoming active viewings and unresolved own issues", () => {
    expect(navCounts({ ...base, currentUser: tenant, issues, viewings })).toEqual({ viewings: 2, issues: 2 });
  });

  it("landlord: pending requests to answer and open issues on their listings", () => {
    expect(navCounts({ ...base, currentUser: landlord, issues, viewings })).toEqual({ viewings: 2, issues: 1 });
  });

  it("trader: issues they can still quote on", () => {
    expect(navCounts({ ...base, currentUser: trader, issues, viewings: [] }).issues).toBe(2);
  });
});
