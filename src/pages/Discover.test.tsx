import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Discover } from "./Discover";
import type { Property } from "../types/property";

const propertyA: Property = {
  id: "a",
  address: "1 Test Way",
  city: "Austin, TX",
  price: 300000,
  listingType: "sale",
  beds: 2,
  baths: 1,
  sqft: 900,
  description: "A",
  images: ["https://example.com/a.jpg"],
};

const propertyB: Property = {
  id: "b",
  address: "2 Test Way",
  city: "Austin, TX",
  price: 800000,
  listingType: "sale",
  beds: 4,
  baths: 3,
  sqft: 2000,
  description: "B",
  images: ["https://example.com/b.jpg"],
};

const propertyC: Property = {
  id: "c",
  address: "3 Test Way",
  city: "Denver, CO",
  price: 1500,
  listingType: "rent",
  beds: 3,
  baths: 2,
  sqft: 1400,
  description: "C",
  images: ["https://example.com/c.jpg"],
};

const deck = [propertyA, propertyB, propertyC];

function expandFilters() {
  return userEvent.click(screen.getByRole("button", { name: /^filters/i }));
}

describe("Discover filters", () => {
  it("shows the full deck's top card when no filter is active", () => {
    render(<Discover deck={deck} onDecide={vi.fn()} />);
    expect(screen.getByRole("heading", { name: propertyA.address })).toBeInTheDocument();
  });

  it("starts with the filter controls collapsed", () => {
    render(<Discover deck={deck} onDecide={vi.fn()} />);
    expect(screen.queryByLabelText(/location/i)).not.toBeInTheDocument();
  });

  it("lists the deck's unique cities as location options", async () => {
    render(<Discover deck={deck} onDecide={vi.fn()} />);
    await expandFilters();
    const select = screen.getByLabelText(/location/i);
    const optionLabels = Array.from(select.querySelectorAll("option")).map((o) => o.textContent);
    expect(optionLabels).toEqual(["All locations", "Austin, TX", "Denver, CO"]);
  });

  it("filtering by location narrows the deck shown", async () => {
    render(<Discover deck={deck} onDecide={vi.fn()} />);
    await expandFilters();

    await userEvent.selectOptions(screen.getByLabelText(/location/i), "Denver, CO");

    expect(screen.getByRole("heading", { name: propertyC.address })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: propertyA.address })).not.toBeInTheDocument();
  });

  it("filtering by listing type narrows the deck shown", async () => {
    render(<Discover deck={deck} onDecide={vi.fn()} />);
    await expandFilters();

    await userEvent.selectOptions(screen.getByLabelText(/listing type/i), "rent");

    expect(screen.getByRole("heading", { name: propertyC.address })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: propertyA.address })).not.toBeInTheDocument();
  });

  it("filtering by minimum bedrooms narrows the deck shown", async () => {
    render(<Discover deck={deck} onDecide={vi.fn()} />);
    await expandFilters();

    await userEvent.selectOptions(screen.getByLabelText(/bedrooms/i), "4");

    expect(screen.getByRole("heading", { name: propertyB.address })).toBeInTheDocument();
  });

  it("shows a no-matches state when filters exclude every remaining listing, with a way to clear them", async () => {
    render(<Discover deck={deck} onDecide={vi.fn()} />);
    await expandFilters();

    await userEvent.type(screen.getByLabelText(/min price/i), "9999999");
    expect(screen.getByTestId("no-matches")).toBeInTheDocument();
    expect(screen.queryByTestId("property-card")).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /^clear filters/i }));
    expect(screen.queryByTestId("no-matches")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: propertyA.address })).toBeInTheDocument();
  });

  it("does not show the no-matches state when the deck itself is empty", () => {
    render(<Discover deck={[]} onDecide={vi.fn()} />);
    expect(screen.queryByTestId("no-matches")).not.toBeInTheDocument();
    expect(screen.getByTestId("deck-empty")).toBeInTheDocument();
  });
});
