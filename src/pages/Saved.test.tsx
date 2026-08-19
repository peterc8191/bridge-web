import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { Saved } from "./Saved";
import { properties } from "../data/properties";

function renderSaved(props: Parameters<typeof Saved>[0]) {
  return render(
    <MemoryRouter>
      <Saved {...props} />
    </MemoryRouter>,
  );
}

describe("Saved", () => {
  it("shows the empty state when nothing is saved", () => {
    renderSaved({ saved: [], onRemove: vi.fn() });
    expect(screen.getByText(/no saved properties yet/i)).toBeInTheDocument();
  });

  it("lists saved properties", () => {
    renderSaved({ saved: properties.slice(0, 2), onRemove: vi.fn() });
    expect(screen.getByTestId("saved-list")).toBeInTheDocument();
    expect(screen.getByText(properties[0].address)).toBeInTheDocument();
    expect(screen.getByText(properties[1].address)).toBeInTheDocument();
  });

  it("shows the formatted price and listing-type badge for each item", () => {
    renderSaved({ saved: properties.slice(0, 1), onRemove: vi.fn() });
    expect(screen.getByText("$549,000")).toBeInTheDocument();
    expect(screen.getByText("For Sale")).toBeInTheDocument();
  });

  it("links each item to its property detail page", () => {
    renderSaved({ saved: properties.slice(0, 1), onRemove: vi.fn() });
    expect(screen.getByRole("link", { name: new RegExp(properties[0].address) })).toHaveAttribute(
      "href",
      `/property/${properties[0].id}`,
    );
  });

  it("calls onRemove with the property id when Remove is clicked", async () => {
    const onRemove = vi.fn();
    renderSaved({ saved: properties.slice(0, 1), onRemove });

    await userEvent.click(screen.getByRole("button", { name: /remove/i }));
    expect(onRemove).toHaveBeenCalledWith(properties[0].id);
  });

  it("does not navigate or call onRemove just from being rendered - Remove stays a separate control from the link", () => {
    renderSaved({ saved: properties.slice(0, 1), onRemove: vi.fn() });
    const link = screen.getByRole("link", { name: new RegExp(properties[0].address) });
    const removeButton = screen.getByRole("button", { name: /remove/i });
    expect(link).not.toContainElement(removeButton);
  });
});
