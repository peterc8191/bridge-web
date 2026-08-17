import { describe, expect, it } from "vitest";
import { splitViewingsByTime } from "./sortViewings";
import type { ViewingRequest } from "../types/viewing";

// Local time, matching how splitViewingsByTime parses `${date}T${time}` (no
// timezone suffix) - a UTC-suffixed "now" would drift against that by the
// runner's UTC offset and make the exact-match test flaky.
const now = new Date(2026, 7, 17, 12, 0, 0, 0);

function viewing(id: string, date: string, time: string): ViewingRequest {
  return { id, propertyId: "p1", date, time, note: "", confirmed: false, createdAt: "" };
}

describe("splitViewingsByTime", () => {
  it("splits into upcoming and past relative to now", () => {
    const soonUpcoming = viewing("a", "2026-08-18", "09:00");
    const recentPast = viewing("b", "2026-08-16", "09:00");

    const { upcoming, past } = splitViewingsByTime([soonUpcoming, recentPast], now);

    expect(upcoming.map((v) => v.id)).toEqual(["a"]);
    expect(past.map((v) => v.id)).toEqual(["b"]);
  });

  it("treats a viewing at exactly now as upcoming", () => {
    const exact = viewing("a", "2026-08-17", "12:00");
    const { upcoming, past } = splitViewingsByTime([exact], now);
    expect(upcoming.map((v) => v.id)).toEqual(["a"]);
    expect(past).toHaveLength(0);
  });

  it("sorts upcoming viewings soonest first", () => {
    const far = viewing("far", "2026-09-01", "09:00");
    const soon = viewing("soon", "2026-08-18", "09:00");
    const { upcoming } = splitViewingsByTime([far, soon], now);
    expect(upcoming.map((v) => v.id)).toEqual(["soon", "far"]);
  });

  it("sorts past viewings most recent first", () => {
    const longAgo = viewing("long-ago", "2026-07-01", "09:00");
    const recent = viewing("recent", "2026-08-16", "09:00");
    const { past } = splitViewingsByTime([longAgo, recent], now);
    expect(past.map((v) => v.id)).toEqual(["recent", "long-ago"]);
  });
});
