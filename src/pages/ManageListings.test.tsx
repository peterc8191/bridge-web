import { afterEach, describe, expect, it, vi } from "vitest";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ManageListings } from "./ManageListings";
import { renderWithAppData } from "../test/appData";
import { landlord, makeProperty } from "../test/fixtures";

const sale = makeProperty({ id: "p1", address: "142 Maple Street", price: 549000 });
const rental = makeProperty({ id: "p2", address: "27 Elm Court", price: 1650, listingType: "rent" });

function renderPage(myListings = [sale, rental]) {
  return renderWithAppData(<ManageListings />, {
    path: "/manage-listings",
    data: { currentUser: landlord, myListings, properties: myListings },
  });
}

describe("ManageListings", () => {
  afterEach(() => vi.restoreAllMocks());

  it("lists only the landlord's own listings", () => {
    renderPage();
    const items = within(screen.getByTestId("manage-listings-list")).getAllByRole("listitem");
    expect(items).toHaveLength(2);
  });

  it("shows an empty state when the landlord has no listings", () => {
    renderPage([]);
    expect(screen.getByText(/haven't listed any properties/i)).toBeInTheDocument();
  });

  it("shows each listing's formatted price and listing-type badge", () => {
    renderPage();
    expect(screen.getByText(/\$549,000/)).toBeInTheDocument();
    expect(screen.getByText(/\$1,650\/mo/)).toBeInTheDocument();
    expect(screen.getByText("For Sale")).toBeInTheDocument();
    expect(screen.getByText("For Rent")).toBeInTheDocument();
  });

  it("links Edit to each listing's edit route and Add to the create route", () => {
    renderPage();
    const editLinks = screen.getAllByRole("link", { name: /edit/i });
    expect(editLinks.map((link) => link.getAttribute("href"))).toEqual([
      "/manage-listings/p1/edit",
      "/manage-listings/p2/edit",
    ]);
    expect(screen.getByRole("link", { name: /add new listing/i })).toHaveAttribute("href", "/manage-listings/new");
  });

  it("deletes a listing only after confirmation", async () => {
    const confirm = vi.spyOn(window, "confirm").mockReturnValueOnce(false).mockReturnValueOnce(true);
    const { data } = renderPage();
    const deleteFirst = () => userEvent.click(screen.getAllByRole("button", { name: /delete/i })[0]);

    await deleteFirst();
    expect(data.deleteProperty).not.toHaveBeenCalled();

    await deleteFirst();
    expect(confirm).toHaveBeenCalledTimes(2);
    expect(data.deleteProperty).toHaveBeenCalledWith("p1");
  });
});
