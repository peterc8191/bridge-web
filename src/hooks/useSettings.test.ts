import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useSettings } from "./useSettings";

function mockMatchMedia(matchesDark: boolean) {
  const listeners = new Set<() => void>();
  const media = {
    matches: matchesDark,
    media: "(prefers-color-scheme: dark)",
    addEventListener: (_event: string, handler: () => void) => listeners.add(handler),
    removeEventListener: (_event: string, handler: () => void) => listeners.delete(handler),
  };
  vi.stubGlobal("matchMedia", vi.fn().mockReturnValue(media));
  return {
    triggerChange: (nextMatches: boolean) => {
      media.matches = nextMatches;
      listeners.forEach((handler) => handler());
    },
  };
}

describe("useSettings", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("defaults to system theme and reduce-motion off", () => {
    mockMatchMedia(false);
    const { result } = renderHook(() => useSettings());
    expect(result.current.theme).toBe("system");
    expect(result.current.reduceMotion).toBe(false);
  });

  it("resolves 'system' theme to the OS preference and applies it to the document", () => {
    mockMatchMedia(true);
    const { result } = renderHook(() => useSettings());
    expect(result.current.resolvedTheme).toBe("dark");
    expect(document.documentElement.dataset.theme).toBe("dark");
  });

  it("setTheme overrides the system preference", () => {
    mockMatchMedia(true);
    const { result } = renderHook(() => useSettings());

    act(() => {
      result.current.setTheme("light");
    });

    expect(result.current.resolvedTheme).toBe("light");
    expect(document.documentElement.dataset.theme).toBe("light");
  });

  it("reacts to a system theme change while set to 'system'", () => {
    const { triggerChange } = mockMatchMedia(false);
    const { result } = renderHook(() => useSettings());
    expect(result.current.resolvedTheme).toBe("light");

    act(() => {
      triggerChange(true);
    });

    expect(result.current.resolvedTheme).toBe("dark");
  });

  it("persists theme and reduceMotion across hook instances", () => {
    mockMatchMedia(false);
    const { result, unmount } = renderHook(() => useSettings());

    act(() => {
      result.current.setTheme("dark");
      result.current.setReduceMotion(true);
    });
    unmount();

    const { result: second } = renderHook(() => useSettings());
    expect(second.current.theme).toBe("dark");
    expect(second.current.reduceMotion).toBe(true);
  });
});
