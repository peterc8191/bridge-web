import { beforeEach, describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { usePropertyDeck } from "./usePropertyDeck";
import { properties } from "../data/properties";

describe("usePropertyDeck", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("starts with the full deck and an empty saved list", () => {
    const { result } = renderHook(() => usePropertyDeck(properties, null));
    expect(result.current.deck).toHaveLength(properties.length);
    expect(result.current.saved).toHaveLength(0);
  });

  it("swiping right removes the property from the deck and adds it to saved", () => {
    const { result } = renderHook(() => usePropertyDeck(properties, null));
    const first = result.current.deck[0];

    act(() => {
      result.current.decide(first, "right");
    });

    expect(result.current.deck.find((p) => p.id === first.id)).toBeUndefined();
    expect(result.current.saved.map((p) => p.id)).toContain(first.id);
  });

  it("swiping left removes the property from the deck without saving it", () => {
    const { result } = renderHook(() => usePropertyDeck(properties, null));
    const first = result.current.deck[0];

    act(() => {
      result.current.decide(first, "left");
    });

    expect(result.current.deck.find((p) => p.id === first.id)).toBeUndefined();
    expect(result.current.saved.map((p) => p.id)).not.toContain(first.id);
  });

  it("removeSaved takes a property out of the saved list", () => {
    const { result } = renderHook(() => usePropertyDeck(properties, null));
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
    const { result, unmount } = renderHook(() => usePropertyDeck(properties, null));

    act(() => {
      result.current.decide(first, "right");
    });
    unmount();

    const { result: second } = renderHook(() => usePropertyDeck(properties, null));
    expect(second.current.saved.map((p) => p.id)).toContain(first.id);
    expect(second.current.deck.find((p) => p.id === first.id)).toBeUndefined();
  });

  it("keeps a separate saved list and deck per account", () => {
    const first = properties[0];
    const { result, rerender } = renderHook(({ userId }) => usePropertyDeck(properties, userId), {
      initialProps: { userId: "user-a" as string | null },
    });

    act(() => {
      result.current.decide(first, "right");
    });
    expect(result.current.saved.map((p) => p.id)).toEqual([first.id]);

    rerender({ userId: "user-b" });
    expect(result.current.saved).toHaveLength(0);
    expect(result.current.deck).toHaveLength(properties.length);

    rerender({ userId: null });
    expect(result.current.saved).toHaveLength(0);

    rerender({ userId: "user-a" });
    expect(result.current.saved.map((p) => p.id)).toEqual([first.id]);
  });

  describe("undo", () => {
    it("is unavailable before any swipe", () => {
      const { result } = renderHook(() => usePropertyDeck(properties, null));
      expect(result.current.canUndo).toBe(false);
    });

    it("restores a passed listing to the deck", () => {
      const first = properties[0];
      const { result } = renderHook(() => usePropertyDeck(properties, null));

      act(() => result.current.decide(first, "left"));
      expect(result.current.canUndo).toBe(true);

      act(() => result.current.undo());
      expect(result.current.deck[0].id).toBe(first.id);
      expect(result.current.canUndo).toBe(false);
    });

    it("un-saves a liked listing and puts it back on top", () => {
      const first = properties[0];
      const { result } = renderHook(() => usePropertyDeck(properties, null));

      act(() => result.current.decide(first, "right"));
      act(() => result.current.undo());

      expect(result.current.saved).toHaveLength(0);
      expect(result.current.deck[0].id).toBe(first.id);
    });

    it("undoes several swipes in reverse order", () => {
      const [first, second] = properties;
      const { result } = renderHook(() => usePropertyDeck(properties, null));

      act(() => result.current.decide(first, "left"));
      act(() => result.current.decide(second, "right"));

      act(() => result.current.undo());
      expect(result.current.deck[0].id).toBe(second.id);
      expect(result.current.saved).toHaveLength(0);

      act(() => result.current.undo());
      expect(result.current.deck[0].id).toBe(first.id);
    });

    it("does not carry undo history across accounts", () => {
      const { result, rerender } = renderHook(({ userId }) => usePropertyDeck(properties, userId), {
        initialProps: { userId: "user-a" },
      });
      act(() => result.current.decide(properties[0], "left"));
      rerender({ userId: "user-b" });
      expect(result.current.canUndo).toBe(false);
    });
  });
});
