import { describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useViewings } from "./useViewings";
import { splitViewingsByTime } from "../utils/sortViewings";
import { futureDate, tenant } from "../test/fixtures";

const input = { propertyId: "p1", date: futureDate(3), time: "10:00", note: "Hi" };

describe("useViewings", () => {
  it("seeds both upcoming and past examples relative to today", () => {
    const { result } = renderHook(() => useViewings());
    const { upcoming, past } = splitViewingsByTime(result.current.viewings);
    expect(upcoming.length).toBeGreaterThan(0);
    expect(past.length).toBeGreaterThan(0);
  });

  it("scheduleViewing appends a pending request stamped with the requester", () => {
    const { result } = renderHook(() => useViewings());
    act(() => result.current.scheduleViewing(tenant, input));

    expect(result.current.viewings.at(-1)).toMatchObject({
      ...input,
      requesterId: tenant.id,
      requesterEmail: tenant.email,
      status: "pending",
    });
  });

  it("persists requests across hook instances", () => {
    const first = renderHook(() => useViewings());
    const before = first.result.current.viewings.length;
    act(() => first.result.current.scheduleViewing(tenant, input));
    first.unmount();

    const { result } = renderHook(() => useViewings());
    expect(result.current.viewings).toHaveLength(before + 1);
  });

  it.each(["confirmed", "declined", "cancelled"] as const)(
    "setViewingStatus sets %s and persists it",
    (status) => {
      const first = renderHook(() => useViewings());
      act(() => first.result.current.setViewingStatus("viewing-seed-4", status));
      expect(first.result.current.viewings.find((v) => v.id === "viewing-seed-4")?.status).toBe(status);
      first.unmount();

      const { result } = renderHook(() => useViewings());
      expect(result.current.viewings.find((v) => v.id === "viewing-seed-4")?.status).toBe(status);
    },
  );
});
