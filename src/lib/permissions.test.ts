import { describe, expect, it } from "vitest";
import {
  canAcceptTender,
  canCancelViewing,
  canRespondToViewing,
  canTenderOn,
  canUpdateIssue,
  indexProperties,
  ownsProperty,
  reportableProperties,
  visibleIssues,
  visibleTenders,
  visibleViewings,
} from "./permissions";
import {
  landlord,
  makeIssue,
  makeProperty,
  makeTender,
  makeViewing,
  otherLandlord,
  otherUser,
  tenant,
  trader,
} from "../test/fixtures";

const portland = makeProperty({ id: "p1", ownerId: landlord.id, city: "Portland, OR", tenantEmails: [tenant.email] });
const austin = makeProperty({ id: "p2", ownerId: otherLandlord.id, city: "Austin, TX" });
const lookup = indexProperties([portland, austin]);
const portlandProfile = { services: [], areas: ["portland, or"], bio: "" };

describe("permissions", () => {
  it("ownsProperty: only the owning landlord", () => {
    expect(ownsProperty(landlord, portland)).toBe(true);
    expect(ownsProperty(otherLandlord, portland)).toBe(false);
    expect(ownsProperty({ ...tenant, id: landlord.id }, portland)).toBe(false); // role matters too
    expect(ownsProperty(null, portland)).toBe(false);
  });

  it("reportableProperties: properties listing the user as a tenant (case-insensitive)", () => {
    const shouty = makeProperty({ id: "p3", tenantEmails: ["TENANT@test.com"] });
    expect(reportableProperties(tenant, [portland, austin, shouty]).map((p) => p.id)).toEqual(["p1", "p3"]);
    expect(reportableProperties(otherUser, [portland, austin])).toEqual([]);
    expect(reportableProperties(null, [portland])).toEqual([]);
  });

  describe("visibleIssues", () => {
    const onPortland = makeIssue({ id: "i1", propertyId: "p1" });
    const onAustin = makeIssue({ id: "i2", propertyId: "p2", reporterId: otherUser.id });
    const resolved = makeIssue({ id: "i3", propertyId: "p1", status: "resolved" });
    const all = [onPortland, onAustin, resolved];
    const ids = (issues: { id: string }[]) => issues.map((issue) => issue.id);

    it("shows nothing when signed out", () => {
      expect(visibleIssues(null, all, lookup, [], portlandProfile)).toEqual([]);
    });

    it("shows a tenant only their own reports", () => {
      expect(ids(visibleIssues(tenant, all, lookup, [], portlandProfile))).toEqual(["i1", "i3"]);
      expect(ids(visibleIssues(otherUser, all, lookup, [], portlandProfile))).toEqual(["i2"]);
    });

    it("shows a landlord issues on their own listings only", () => {
      expect(ids(visibleIssues(landlord, all, lookup, [], portlandProfile))).toEqual(["i1", "i3"]);
      expect(ids(visibleIssues(otherLandlord, all, lookup, [], portlandProfile))).toEqual(["i2"]);
    });

    it("shows a trader unresolved issues in their areas, plus ones they've quoted on", () => {
      expect(ids(visibleIssues(trader, all, lookup, [], portlandProfile))).toEqual(["i1"]);

      const quotedOnAustin = makeTender({ issueId: "i2", traderId: trader.id });
      expect(ids(visibleIssues(trader, all, lookup, [quotedOnAustin], portlandProfile))).toEqual(["i1", "i2"]);
    });
  });

  it("canUpdateIssue: only the property owner", () => {
    const issue = makeIssue({ propertyId: "p1" });
    expect(canUpdateIssue(landlord, issue, lookup)).toBe(true);
    expect(canUpdateIssue(otherLandlord, issue, lookup)).toBe(false);
    expect(canUpdateIssue(tenant, issue, lookup)).toBe(false);
  });

  describe("canTenderOn", () => {
    const issue = makeIssue({ id: "i1", propertyId: "p1" });

    it("allows a trader serving the area who hasn't quoted yet", () => {
      expect(canTenderOn(trader, issue, lookup, portlandProfile, [])).toBe(true);
    });

    it("blocks outside the trader's areas, on resolved issues, repeat quotes, and non-traders", () => {
      expect(canTenderOn(trader, makeIssue({ propertyId: "p2" }), lookup, portlandProfile, [])).toBe(false);
      expect(canTenderOn(trader, { ...issue, status: "resolved" }, lookup, portlandProfile, [])).toBe(false);
      expect(canTenderOn(trader, issue, lookup, portlandProfile, [makeTender({ issueId: "i1" })])).toBe(false);
      expect(canTenderOn(landlord, issue, lookup, portlandProfile, [])).toBe(false);
    });
  });

  describe("tenders", () => {
    const issues = [makeIssue({ id: "i1", propertyId: "p1" }), makeIssue({ id: "i2", propertyId: "p2" })];
    const mine = makeTender({ id: "t1", issueId: "i1", traderId: trader.id });
    const rival = makeTender({ id: "t2", issueId: "i1", traderId: "rival" });
    const elsewhere = makeTender({ id: "t3", issueId: "i2", traderId: "rival" });
    const all = [mine, rival, elsewhere];

    it("landlords see every tender on their issues; traders see only their own", () => {
      expect(visibleTenders(landlord, all, issues, lookup).map((t) => t.id)).toEqual(["t1", "t2"]);
      expect(visibleTenders(trader, all, issues, lookup).map((t) => t.id)).toEqual(["t1"]);
      expect(visibleTenders(tenant, all, issues, lookup)).toEqual([]);
    });

    it("only the owning landlord can accept, and only pending tenders", () => {
      expect(canAcceptTender(landlord, rival, issues, lookup)).toBe(true);
      expect(canAcceptTender(otherLandlord, rival, issues, lookup)).toBe(false);
      expect(canAcceptTender(landlord, { ...rival, status: "rejected" }, issues, lookup)).toBe(false);
    });
  });

  describe("viewings", () => {
    const mine = makeViewing({ id: "v1", propertyId: "p1", requesterId: tenant.id });
    const theirs = makeViewing({ id: "v2", propertyId: "p2", requesterId: otherUser.id });

    it("requesters see their own; landlords also see requests on their listings", () => {
      expect(visibleViewings(tenant, [mine, theirs], lookup).map((v) => v.id)).toEqual(["v1"]);
      expect(visibleViewings(landlord, [mine, theirs], lookup).map((v) => v.id)).toEqual(["v1"]);
      expect(visibleViewings(otherLandlord, [mine, theirs], lookup).map((v) => v.id)).toEqual(["v2"]);
      expect(visibleViewings(null, [mine, theirs], lookup)).toEqual([]);
    });

    it("only the owner responds, and only to pending requests", () => {
      expect(canRespondToViewing(landlord, mine, lookup)).toBe(true);
      expect(canRespondToViewing(otherLandlord, mine, lookup)).toBe(false);
      expect(canRespondToViewing(landlord, { ...mine, status: "confirmed" }, lookup)).toBe(false);
    });

    it("only the requester cancels, while pending or confirmed", () => {
      expect(canCancelViewing(tenant, mine)).toBe(true);
      expect(canCancelViewing(tenant, { ...mine, status: "confirmed" })).toBe(true);
      expect(canCancelViewing(tenant, { ...mine, status: "declined" })).toBe(false);
      expect(canCancelViewing(landlord, mine)).toBe(false);
    });
  });
});
