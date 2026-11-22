import { describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useTenders } from "./useTenders";
import { seedTenders } from "../data/tenders";
import { trader } from "../test/fixtures";

const profile = { services: ["Plumbing"], areas: ["Denver, CO"], bio: "" };

describe("useTenders", () => {
  it("starts with the seed tenders", () => {
    const { result } = renderHook(() => useTenders());
    expect(result.current.tenders).toEqual(seedTenders);
  });

  it("addTender appends a pending tender with the trader's identity and profile snapshot", () => {
    const { result } = renderHook(() => useTenders());
    act(() => result.current.addTender(trader, profile, { issueId: "issue-x", amount: 120, message: "Hi" }));

    expect(result.current.tenders.at(-1)).toMatchObject({
      issueId: "issue-x",
      traderId: trader.id,
      traderEmail: trader.email,
      traderServices: ["Plumbing"],
      traderAreas: ["Denver, CO"],
      amount: 120,
      message: "Hi",
      status: "pending",
    });
  });

  it("persists added tenders across hook instances", () => {
    const first = renderHook(() => useTenders());
    act(() => first.result.current.addTender(trader, profile, { issueId: "issue-x", amount: 1, message: "m" }));
    first.unmount();

    const { result } = renderHook(() => useTenders());
    expect(result.current.tenders).toHaveLength(seedTenders.length + 1);
  });

  describe("acceptTender", () => {
    function setup() {
      const hook = renderHook(() => useTenders());
      act(() => {
        hook.result.current.addTender(trader, profile, { issueId: "A", amount: 100, message: "a1" });
        hook.result.current.addTender({ ...trader, id: "t2" }, profile, { issueId: "A", amount: 90, message: "a2" });
        hook.result.current.addTender({ ...trader, id: "t3" }, profile, { issueId: "B", amount: 80, message: "b1" });
      });
      const byMessage = (message: string) =>
        hook.result.current.tenders.find((tender) => tender.message === message)!;
      return { hook, byMessage };
    }

    it("accepts the target and rejects other pending tenders on the same issue only", () => {
      const { hook, byMessage } = setup();
      act(() => hook.result.current.acceptTender(byMessage("a1").id));

      expect(byMessage("a1").status).toBe("accepted");
      expect(byMessage("a2").status).toBe("rejected");
      expect(byMessage("b1").status).toBe("pending");
    });

    it("does not change tenders that were already decided", () => {
      // Seed: tender-seed-1 accepted, tender-seed-2 rejected, both on issue-seed-1.
      const { result } = renderHook(() => useTenders());
      act(() => result.current.acceptTender("tender-seed-3"));

      const status = (id: string) => result.current.tenders.find((t) => t.id === id)?.status;
      expect(status("tender-seed-1")).toBe("accepted");
      expect(status("tender-seed-2")).toBe("rejected");
      expect(status("tender-seed-3")).toBe("accepted");
    });

    it("persists an acceptance across hook instances", () => {
      const first = renderHook(() => useTenders());
      act(() => first.result.current.acceptTender("tender-seed-3"));
      first.unmount();

      const { result } = renderHook(() => useTenders());
      expect(result.current.tenders.find((t) => t.id === "tender-seed-3")?.status).toBe("accepted");
    });
  });
});
