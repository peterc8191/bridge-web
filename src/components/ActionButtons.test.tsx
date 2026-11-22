import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ActionButtons } from "./ActionButtons";

describe("ActionButtons", () => {
  it("calls onPass when the pass button is clicked", async () => {
    const onPass = vi.fn();
    render(<ActionButtons onPass={onPass} onLike={vi.fn()} />);

    await userEvent.click(screen.getByRole("button", { name: /pass on this property/i }));
    expect(onPass).toHaveBeenCalledTimes(1);
  });

  it("calls onLike when the like button is clicked", async () => {
    const onLike = vi.fn();
    render(<ActionButtons onPass={vi.fn()} onLike={onLike} />);

    await userEvent.click(screen.getByRole("button", { name: /save this property/i }));
    expect(onLike).toHaveBeenCalledTimes(1);
  });

  it("has no undo button unless onUndo is given", () => {
    render(<ActionButtons onPass={vi.fn()} onLike={vi.fn()} />);
    expect(screen.queryByRole("button", { name: /undo/i })).not.toBeInTheDocument();
  });

  it("disables undo when there's nothing to undo", () => {
    render(<ActionButtons onPass={vi.fn()} onLike={vi.fn()} onUndo={vi.fn()} canUndo={false} />);
    expect(screen.getByRole("button", { name: /undo last swipe/i })).toBeDisabled();
  });

  it("calls onUndo when undo is clicked", async () => {
    const onUndo = vi.fn();
    render(<ActionButtons onPass={vi.fn()} onLike={vi.fn()} onUndo={onUndo} canUndo />);
    await userEvent.click(screen.getByRole("button", { name: /undo last swipe/i }));
    expect(onUndo).toHaveBeenCalled();
  });
});
