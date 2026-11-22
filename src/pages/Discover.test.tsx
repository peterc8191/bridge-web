import { describe, expect, it, vi } from "vitest";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Discover } from "./Discover";
import { properties } from "../data/properties";
import { renderWithAppData } from "../test/appData";

const openFilters = () => userEvent.click(screen.getByRole("button", { name: /^filters/i }));
const topAddress = () => {
  const slots = screen.getAllByTestId("card-slot");
  return within(slots[slots.length - 1]).getByRole("heading", { level: 2 }).textContent;
};

describe("Discover", () => {
  it("shows the full deck's top card when no filter is active", () => {
    renderWithAppData(<Discover />, { data: { deck: properties } });
    expect(topAddress()).toBe(properties[0].address);
  });

  it("starts with the filter controls collapsed", () => {
    renderWithAppData(<Discover />, { data: { deck: properties } });
    expect(screen.queryByLabelText(/location/i)).not.toBeInTheDocument();
  });

  it("lists the deck's unique cities as location options", async () => {
    renderWithAppData(<Discover />, { data: { deck: properties } });
    await openFilters();
    const options = within(screen.getByLabelText(/location/i)).getAllByRole("option").slice(1);
    expect(options.map((o) => o.textContent)).toEqual([...new Set(properties.map((p) => p.city))].sort());
  });

  it("filtering by location narrows the deck shown", async () => {
    renderWithAppData(<Discover />, { data: { deck: properties } });
    await openFilters();
    await userEvent.selectOptions(screen.getByLabelText(/location/i), properties[3].city);
    expect(topAddress()).toBe(properties[3].address);
    expect(screen.getByText(/1 listing match/i)).toBeInTheDocument();
  });

  it("filtering by listing type narrows the deck shown", async () => {
    renderWithAppData(<Discover />, { data: { deck: properties } });
    await openFilters();
    await userEvent.selectOptions(screen.getByLabelText(/listing type/i), "rent");
    const firstRental = properties.find((p) => p.listingType === "rent")!;
    expect(topAddress()).toBe(firstRental.address);
  });

  it("filters rentals by monthly rent once 'For Rent' is chosen", async () => {
    renderWithAppData(<Discover />, { data: { deck: properties } });
    await openFilters();
    await userEvent.selectOptions(screen.getByLabelText(/listing type/i), "rent");
    await userEvent.type(screen.getByLabelText(/max rent/i), "1500");
    const cheap = properties.filter((p) => p.listingType === "rent" && p.price <= 1500);
    expect(screen.getByText(new RegExp(`${cheap.length} listings? match`, "i"))).toBeInTheDocument();
  });

  it("shows a no-matches state when filters exclude everything, with a way to clear them", async () => {
    renderWithAppData(<Discover />, { data: { deck: properties.slice(0, 2) } });
    await openFilters();
    await userEvent.selectOptions(screen.getByLabelText(/bedrooms/i), "4");
    await userEvent.selectOptions(screen.getByLabelText(/location/i), properties[0].city);
    expect(screen.getByTestId("no-matches")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /clear filters/i }));
    expect(screen.queryByTestId("no-matches")).not.toBeInTheDocument();
  });

  it("does not show the no-matches state when the deck itself is empty", () => {
    renderWithAppData(<Discover />, { data: { deck: [] } });
    expect(screen.getByTestId("deck-empty")).toBeInTheDocument();
    expect(screen.queryByTestId("no-matches")).not.toBeInTheDocument();
  });

  it("wires the undo button to the deck", async () => {
    const undo = vi.fn();
    renderWithAppData(<Discover />, { data: { deck: properties, undo, canUndo: true } });
    await userEvent.click(screen.getByRole("button", { name: /undo last swipe/i }));
    expect(undo).toHaveBeenCalled();
  });
});
