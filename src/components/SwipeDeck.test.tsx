import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SwipeDeck } from "./SwipeDeck";
import { properties } from "../data/properties";

describe("SwipeDeck", () => {
  it("shows the empty state once the deck is exhausted", () => {
    render(<SwipeDeck deck={[]} onDecide={vi.fn()} />);
    expect(screen.getByTestId("deck-empty")).toBeInTheDocument();
  });

  it("renders the top card's address", () => {
    render(<SwipeDeck deck={properties.slice(0, 3)} onDecide={vi.fn()} />);
    expect(screen.getByRole("heading", { name: properties[0].address })).toBeInTheDocument();
  });

  it("clicking the like button decides the top property to the right", async () => {
    const onDecide = vi.fn();
    render(<SwipeDeck deck={properties.slice(0, 3)} onDecide={onDecide} />);

    await userEvent.click(screen.getByRole("button", { name: /save this property/i }));

    await waitFor(
      () => expect(onDecide).toHaveBeenCalledWith(properties[0], "right"),
      { timeout: 2000 },
    );
  });

  it("clicking the pass button decides the top property to the left", async () => {
    const onDecide = vi.fn();
    render(<SwipeDeck deck={properties.slice(0, 3)} onDecide={onDecide} />);

    await userEvent.click(screen.getByRole("button", { name: /pass on this property/i }));

    await waitFor(
      () => expect(onDecide).toHaveBeenCalledWith(properties[0], "left"),
      { timeout: 2000 },
    );
  });

  it("disables the stacking transition on background cards when reduceMotion is on", () => {
    render(<SwipeDeck deck={properties.slice(0, 3)} onDecide={vi.fn()} reduceMotion />);
    const slots = screen.getAllByTestId("card-slot");
    expect(slots.length).toBeGreaterThan(1);
    for (const slot of slots) {
      expect(slot).toHaveStyle({ transition: "none" });
    }
  });

  it("leaves the stacking transition alone when reduceMotion is off", () => {
    render(<SwipeDeck deck={properties.slice(0, 3)} onDecide={vi.fn()} />);
    const slots = screen.getAllByTestId("card-slot");
    for (const slot of slots) {
      expect(slot.style.transition).toBe("");
    }
  });

  it("still decides the top property when reduceMotion is on", async () => {
    const onDecide = vi.fn();
    render(<SwipeDeck deck={properties.slice(0, 3)} onDecide={onDecide} reduceMotion />);

    await userEvent.click(screen.getByRole("button", { name: /save this property/i }));

    await waitFor(
      () => expect(onDecide).toHaveBeenCalledWith(properties[0], "right"),
      { timeout: 2000 },
    );
  });
});
