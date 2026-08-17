import { beforeEach, describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { usePropertyDeck } from "./usePropertyDeck";
import { properties } from "../data/properties";

describe("usePropertyDeck", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("starts with the full deck and an empty saved list", () => {
    const { result } = renderHook(() => usePropertyDeck());
    expect(result.current.deck).toHaveLength(properties.length);
    expect(result.current.saved).toHaveLength(0);
  });

  it("swiping right removes the property from the deck and adds it to saved", () => {
    const { result } = renderHook(() => usePropertyDeck());
    const first = result.current.deck[0];

    act(() => {
      result.current.decide(first, "right");
    });

    expect(result.current.deck.find((p) => p.id === first.id)).toBeUndefined();
    expect(result.current.saved.map((p) => p.id)).toContain(first.id);
  });

  it("swiping left removes the property from the deck without saving it", () => {
    const { result } = renderHook(() => usePropertyDeck());
    const first = result.current.deck[0];

    act(() => {
      result.current.decide(first, "left");
    });

    expect(result.current.deck.find((p) => p.id === first.id)).toBeUndefined();
    expect(result.current.saved.map((p) => p.id)).not.toContain(first.id);
  });

  it("removeSaved takes a property out of the saved list", () => {
    const { result } = renderHook(() => usePropertyDeck());
    const first = result.current.deck[0];

    act(() => {
      result.current.decide(first, "right");
    });
    expect(result.current.saved.map((p) => p.id)).toContain(first.id);

    act(() => {
      result.current.removeSaved(first.id);
    });
    expect(result.current.saved.map((p) => p.id)).not.toContain(first.id);
  });

  it("persists decisions across hook instances via localStorage", () => {
    const first = properties[0];
    const { result, unmount } = renderHook(() => usePropertyDeck());

    act(() => {
      result.current.decide(first, "right");
    });
    unmount();

    const { result: second } = renderHook(() => usePropertyDeck());
    expect(second.current.saved.map((p) => p.id)).toContain(first.id);
    expect(second.current.deck.find((p) => p.id === first.id)).toBeUndefined();
  });
});
