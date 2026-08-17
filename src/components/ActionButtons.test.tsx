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
});
