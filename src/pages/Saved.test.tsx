import { describe, expect, it } from "vitest";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Saved } from "./Saved";
import { renderWithAppData } from "../test/appData";
import { makeProperty, tenant } from "../test/fixtures";

const sale = makeProperty({ id: "p1" });
const rental = makeProperty({ id: "p3", address: "27 Elm Court", price: 1650, listingType: "rent" });

describe("Saved", () => {
  it("shows the empty state when nothing is saved", () => {
    renderWithAppData(<Saved />);
    expect(screen.getByText(/no saved properties yet/i)).toBeInTheDocument();
  });

  it("lists saved properties with formatted price and listing-type badge", () => {
    renderWithAppData(<Saved />, { data: { saved: [sale, rental] } });
    const items = within(screen.getByTestId("saved-list")).getAllByRole("listitem");
    expect(items).toHaveLength(2);
    expect(within(items[0]).getByText("$549,000")).toBeInTheDocument();
    expect(within(items[1]).getByText("$1,650/mo")).toBeInTheDocument();
    expect(within(items[1]).getByText("For Rent")).toBeInTheDocument();
  });

  it("links each item to its property detail page", () => {
    renderWithAppData(<Saved />, { data: { saved: [sale] } });
    expect(screen.getByRole("link", { name: new RegExp(sale.address) })).toHaveAttribute("href", "/property/p1");
  });

  it("removes with a separate control from the link", async () => {
    const { data } = renderWithAppData(<Saved />, { data: { saved: [sale] } });
    expect(data.removeSaved).not.toHaveBeenCalled();

    const remove = screen.getByRole("button", { name: /remove 142 maple street/i });
    expect(remove.closest("a")).toBeNull();
    await userEvent.click(remove);
    expect(data.removeSaved).toHaveBeenCalledWith("p1");
  });

  it("tells guests their list is per-browser and invites them to log in", () => {
    renderWithAppData(<Saved />, { data: { saved: [sale] } });
    expect(screen.getByTestId("guest-note")).toHaveTextContent(/guest/i);
  });

  it("does not show the guest note when signed in", () => {
    renderWithAppData(<Saved />, { data: { saved: [sale], currentUser: tenant } });
    expect(screen.queryByTestId("guest-note")).not.toBeInTheDocument();
  });
});
