import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Saved } from "./Saved";
import { properties } from "../data/properties";

describe("Saved", () => {
  it("shows the empty state when nothing is saved", () => {
    render(<Saved saved={[]} onRemove={vi.fn()} />);
    expect(screen.getByText(/no saved properties yet/i)).toBeInTheDocument();
  });

  it("lists saved properties", () => {
    render(<Saved saved={properties.slice(0, 2)} onRemove={vi.fn()} />);
    expect(screen.getByTestId("saved-list")).toBeInTheDocument();
    expect(screen.getByText(properties[0].address)).toBeInTheDocument();
    expect(screen.getByText(properties[1].address)).toBeInTheDocument();
  });

  it("calls onRemove with the property id when Remove is clicked", async () => {
    const onRemove = vi.fn();
    render(<Saved saved={properties.slice(0, 1)} onRemove={onRemove} />);

    await userEvent.click(screen.getByRole("button", { name: /remove/i }));
    expect(onRemove).toHaveBeenCalledWith(properties[0].id);
  });
});
