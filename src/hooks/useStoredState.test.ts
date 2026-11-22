import { describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useStoredState } from "./useStoredState";

describe("useStoredState", () => {
  it("starts from the fallback and persists updates", () => {
    const { result } = renderHook(() => useStoredState("k", 1));
    expect(result.current[0]).toBe(1);

    act(() => result.current[1]((prev) => prev + 1));
    expect(result.current[0]).toBe(2);
    expect(localStorage.getItem("k")).toBe("2");
  });

  it("reads an existing stored value", () => {
    localStorage.setItem("k", JSON.stringify(["a"]));
    const { result } = renderHook(() => useStoredState<string[]>("k", []));
    expect(result.current[0]).toEqual(["a"]);
  });

  it("re-reads when the key changes", () => {
    localStorage.setItem("a", JSON.stringify("value-a"));
    localStorage.setItem("b", JSON.stringify("value-b"));
    const { result, rerender } = renderHook(({ key }) => useStoredState(key, "none"), {
      initialProps: { key: "a" },
    });
    expect(result.current[0]).toBe("value-a");

    rerender({ key: "b" });
    expect(result.current[0]).toBe("value-b");
  });

  it("does not persist when the key is null", () => {
    const { result } = renderHook(() => useStoredState<number>(null, 0));
    act(() => result.current[1](5));
    expect(result.current[0]).toBe(5);
    expect(localStorage.length).toBe(0);
  });

  it("picks up writes made in another tab", () => {
    const { result } = renderHook(() => useStoredState("k", 0));

    act(() => {
      localStorage.setItem("k", "42");
      window.dispatchEvent(new StorageEvent("storage", { key: "k" }));
    });

    expect(result.current[0]).toBe(42);
  });

  it("ignores other-tab writes to unrelated keys", () => {
    const { result } = renderHook(() => useStoredState("k", 0));
    act(() => {
      localStorage.setItem("other", "1");
      window.dispatchEvent(new StorageEvent("storage", { key: "other" }));
    });
    expect(result.current[0]).toBe(0);
  });
});
