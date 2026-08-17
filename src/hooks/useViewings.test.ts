import { beforeEach, describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useViewings } from "./useViewings";

describe("useViewings", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("starts with no viewing requests", () => {
    const { result } = renderHook(() => useViewings());
    expect(result.current.viewings).toHaveLength(0);
  });

  it("scheduleViewing appends a new request", () => {
    const { result } = renderHook(() => useViewings());

    act(() => {
      result.current.scheduleViewing({
        propertyId: "p1",
        date: "2026-09-01",
        time: "14:00",
        note: "Weekend preferred",
      });
    });

    expect(result.current.viewings).toHaveLength(1);
    const [viewing] = result.current.viewings;
    expect(viewing.propertyId).toBe("p1");
    expect(viewing.date).toBe("2026-09-01");
    expect(viewing.time).toBe("14:00");
    expect(viewing.note).toBe("Weekend preferred");
    expect(viewing.createdAt).toBeTruthy();
  });

  it("persists viewings across hook instances via localStorage", () => {
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
    expect(second.current.viewings).toHaveLength(1);
    expect(second.current.viewings[0].propertyId).toBe("p2");
  });
});
