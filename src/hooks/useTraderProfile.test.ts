import { beforeEach, describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useTraderProfile } from "./useTraderProfile";

describe("useTraderProfile", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns an empty profile when there is no signed-in user", () => {
    const { result } = renderHook(() => useTraderProfile(null));
    expect(result.current.profile).toEqual({ services: [], areas: [], bio: "" });
  });

  it("returns the seeded profile for the seeded trader account", () => {
    const { result } = renderHook(() => useTraderProfile("user-seed-3"));
    expect(result.current.profile.services).toContain("Plumbing");
    expect(result.current.profile.areas).toContain("Portland, OR");
  });

  it("returns an empty profile for a user with no seed and no saved profile", () => {
    const { result } = renderHook(() => useTraderProfile("some-other-user"));
    expect(result.current.profile).toEqual({ services: [], areas: [], bio: "" });
  });

  it("updateProfile saves and immediately reflects the new profile", () => {
    const { result } = renderHook(() => useTraderProfile("some-other-user"));

    act(() => {
      result.current.updateProfile({ services: ["Painting"], areas: ["Austin, TX"], bio: "Painter." });
    });

    expect(result.current.profile).toEqual({
      services: ["Painting"],
      areas: ["Austin, TX"],
      bio: "Painter.",
    });
  });

  it("persists an updated profile across hook instances for the same user", () => {
    const { result, unmount } = renderHook(() => useTraderProfile("some-other-user"));

    act(() => {
      result.current.updateProfile({ services: ["Painting"], areas: ["Austin, TX"], bio: "Painter." });
    });
    unmount();

    const { result: second } = renderHook(() => useTraderProfile("some-other-user"));
    expect(second.current.profile.services).toEqual(["Painting"]);
  });

  it("keeps profiles separate per user", () => {
    const { result: first } = renderHook(() => useTraderProfile("user-a"));
    act(() => {
      first.current.updateProfile({ services: ["Electrical"], areas: [], bio: "" });
    });

    const { result: second } = renderHook(() => useTraderProfile("user-b"));
    expect(second.current.profile.services).toEqual([]);
  });

  it("re-reads the profile when the userId prop changes (switching signed-in user)", () => {
    const { result, rerender } = renderHook(({ userId }) => useTraderProfile(userId), {
      initialProps: { userId: "user-seed-3" as string | null },
    });
    expect(result.current.profile.services).toContain("Plumbing");

    rerender({ userId: "some-other-user" });
    expect(result.current.profile).toEqual({ services: [], areas: [], bio: "" });
  });
});
