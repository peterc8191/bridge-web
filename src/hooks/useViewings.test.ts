import { beforeEach, describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useViewings } from "./useViewings";
import { seedViewings } from "../data/viewings";

describe("useViewings", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("starts with the seed viewings", () => {
    const { result } = renderHook(() => useViewings());
    expect(result.current.viewings).toHaveLength(seedViewings.length);
    expect(result.current.viewings.map((v) => v.id)).toEqual(seedViewings.map((v) => v.id));
  });

  it("scheduleViewing appends a new unconfirmed request", () => {
    const { result } = renderHook(() => useViewings());

    act(() => {
      result.current.scheduleViewing({
        propertyId: "p1",
        date: "2026-09-01",
        time: "14:00",
        note: "Weekend preferred",
      });
    });

    expect(result.current.viewings).toHaveLength(seedViewings.length + 1);
    const added = result.current.viewings.find((v) => v.propertyId === "p1" && v.date === "2026-09-01");
    expect(added).toBeDefined();
    expect(added?.time).toBe("14:00");
    expect(added?.note).toBe("Weekend preferred");
    expect(added?.confirmed).toBe(false);
    expect(added?.createdAt).toBeTruthy();
  });

  it("persists added viewings across hook instances via localStorage", () => {
    const { result, unmount } = renderHook(() => useViewings());

    act(() => {
      result.current.scheduleViewing({
        propertyId: "p2",
        date: "2026-09-05",
        time: "10:30",
        note: "",
      });
    });
    unmount();

    const { result: second } = renderHook(() => useViewings());
    expect(second.current.viewings).toHaveLength(seedViewings.length + 1);
    expect(second.current.viewings.some((v) => v.propertyId === "p2")).toBe(true);
  });

  describe("confirmViewing", () => {
    it("marks a pending seed viewing as confirmed", () => {
      const { result } = renderHook(() => useViewings());
      const pendingSeed = seedViewings.find((v) => !v.confirmed)!;

      act(() => {
        result.current.confirmViewing(pendingSeed.id);
      });

      expect(result.current.viewings.find((v) => v.id === pendingSeed.id)?.confirmed).toBe(true);
    });

    it("marks a user-requested viewing as confirmed", () => {
      const { result } = renderHook(() => useViewings());

      act(() => {
        result.current.scheduleViewing({
          propertyId: "p3",
          date: "2026-09-01",
          time: "14:00",
          note: "",
        });
      });
      const added = result.current.viewings.find((v) => v.propertyId === "p3")!;
      expect(added.confirmed).toBe(false);

      act(() => {
        result.current.confirmViewing(added.id);
      });

      expect(result.current.viewings.find((v) => v.id === added.id)?.confirmed).toBe(true);
    });

    it("persists a confirmation across hook instances", () => {
      const { result, unmount } = renderHook(() => useViewings());
      const pendingSeed = seedViewings.find((v) => !v.confirmed)!;

      act(() => {
        result.current.confirmViewing(pendingSeed.id);
      });
      unmount();

      const { result: second } = renderHook(() => useViewings());
      expect(second.current.viewings.find((v) => v.id === pendingSeed.id)?.confirmed).toBe(true);
    });
  });
});
