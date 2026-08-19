import { beforeEach, describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useTenders } from "./useTenders";
import { seedTenders } from "../data/tenders";

describe("useTenders", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("starts with the seed tenders", () => {
    const { result } = renderHook(() => useTenders());
    expect(result.current.tenders).toHaveLength(seedTenders.length);
    expect(result.current.tenders.map((t) => t.id)).toEqual(seedTenders.map((t) => t.id));
  });

  it("addTender appends a new pending tender", () => {
    const { result } = renderHook(() => useTenders());

    act(() => {
      result.current.addTender({
        issueId: "issue-seed-2",
        traderId: "user-seed-3",
        traderEmail: "tradea@abc.com",
        traderServices: ["Plumbing"],
        traderAreas: ["Portland, OR"],
        amount: 200,
        message: "Can start Monday.",
      });
    });

    expect(result.current.tenders).toHaveLength(seedTenders.length + 1);
    const added = result.current.tenders.find((t) => t.message === "Can start Monday.");
    expect(added).toBeDefined();
    expect(added?.status).toBe("pending");
    expect(added?.createdAt).toBeTruthy();
  });

  it("persists added tenders across hook instances", () => {
    const { result, unmount } = renderHook(() => useTenders());

    act(() => {
      result.current.addTender({
        issueId: "issue-seed-2",
        traderId: "user-seed-3",
        traderEmail: "tradea@abc.com",
        traderServices: [],
        traderAreas: [],
        amount: 100,
        message: "Second quote.",
      });
    });
    unmount();

    const { result: second } = renderHook(() => useTenders());
    expect(second.current.tenders).toHaveLength(seedTenders.length + 1);
  });

  describe("acceptTender", () => {
    it("marks the target tender accepted", () => {
      const { result } = renderHook(() => useTenders());
      const pendingSeed = seedTenders.find((t) => t.status === "pending")!;

      act(() => {
        result.current.acceptTender(pendingSeed.id);
      });

      expect(result.current.tenders.find((t) => t.id === pendingSeed.id)?.status).toBe("accepted");
    });

    it("rejects other pending tenders on the same issue, leaves other issues' tenders alone", () => {
      const { result } = renderHook(() => useTenders());

      // Add two competing pending tenders on the same issue.
      act(() => {
        result.current.addTender({
          issueId: "issue-seed-2",
          traderId: "trader-a",
          traderEmail: "a@example.com",
          traderServices: [],
          traderAreas: [],
          amount: 100,
          message: "Quote A",
        });
      });
      act(() => {
        result.current.addTender({
          issueId: "issue-seed-2",
          traderId: "trader-b",
          traderEmail: "b@example.com",
          traderServices: [],
          traderAreas: [],
          amount: 120,
          message: "Quote B",
        });
      });

      const quoteA = result.current.tenders.find((t) => t.message === "Quote A")!;
      const quoteB = result.current.tenders.find((t) => t.message === "Quote B")!;
      // A seed tender already pending on the same issue (issue-seed-2) should
      // also get rejected by accepting quote A.
      const pendingSeedOnSameIssue = seedTenders.find(
        (t) => t.issueId === "issue-seed-2" && t.status === "pending",
      )!;
      // Seed tender on a different issue (issue-seed-1) that's already accepted -
      // should be untouched by accepting a tender on issue-seed-2.
      const unrelatedSeed = seedTenders.find((t) => t.issueId === "issue-seed-1")!;

      act(() => {
        result.current.acceptTender(quoteA.id);
      });

      expect(result.current.tenders.find((t) => t.id === quoteA.id)?.status).toBe("accepted");
      expect(result.current.tenders.find((t) => t.id === quoteB.id)?.status).toBe("rejected");
      expect(result.current.tenders.find((t) => t.id === pendingSeedOnSameIssue.id)?.status).toBe(
        "rejected",
      );
      expect(result.current.tenders.find((t) => t.id === unrelatedSeed.id)?.status).toBe(
        unrelatedSeed.status,
      );
    });

    it("does not un-reject or un-accept tenders that were already decided", () => {
      const { result } = renderHook(() => useTenders());
      const alreadyRejected = seedTenders.find((t) => t.status === "rejected")!;
      const pendingSeed = seedTenders.find((t) => t.status === "pending")!;

      act(() => {
        result.current.acceptTender(pendingSeed.id);
      });

      // The already-rejected seed tender (on a different issue) stays rejected,
      // not flipped to anything else.
      expect(result.current.tenders.find((t) => t.id === alreadyRejected.id)?.status).toBe("rejected");
    });

    it("persists an acceptance across hook instances", () => {
      const { result, unmount } = renderHook(() => useTenders());
      const pendingSeed = seedTenders.find((t) => t.status === "pending")!;

      act(() => {
        result.current.acceptTender(pendingSeed.id);
      });
      unmount();

      const { result: second } = renderHook(() => useTenders());
      expect(second.current.tenders.find((t) => t.id === pendingSeed.id)?.status).toBe("accepted");
    });
  });
});
