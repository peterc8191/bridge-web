import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PropertyFormPage } from "./PropertyFormPage";
import { renderWithAppData } from "../test/appData";
import { landlord, makeProperty, otherLandlord } from "../test/fixtures";
import type { AppData } from "../context/appDataContext";

const mine = makeProperty({ id: "p1", ownerId: landlord.id });
const theirs = makeProperty({ id: "p2", ownerId: otherLandlord.id, address: "Someone else's" });

function renderPage(route: string, data: Partial<AppData> = {}) {
  const path = route.endsWith("/new") ? "/manage-listings/new" : "/manage-listings/:id/edit";
  return renderWithAppData(<PropertyFormPage />, {
    path,
    route,
    data: { currentUser: landlord, properties: [mine, theirs], myListings: [mine], ...data },
  });
}

async function fillNew() {
  await userEvent.type(screen.getByLabelText(/address/i), "9 New Build Ave");
  await userEvent.type(screen.getByLabelText(/city/i), "Denver, CO");
  await userEvent.type(screen.getByLabelText(/price/i), "425500");
  await userEvent.type(screen.getByLabelText(/sqft/i), "1100");
  await userEvent.type(screen.getByLabelText(/beds/i), "2");
  await userEvent.type(screen.getByLabelText(/baths/i), "2");
  await userEvent.type(screen.getByLabelText(/description/i), "Freshly listed.");
  await userEvent.type(screen.getByLabelText(/photo urls/i), "https://example.com/new.jpg");
}

describe("PropertyFormPage", () => {
  it("shows an empty create form for /manage-listings/new", () => {
    renderPage("/manage-listings/new");
    expect(screen.getByRole("heading", { name: /add new listing/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/address/i)).toHaveValue("");
  });

  it("shows an edit form pre-filled with the landlord's own listing", () => {
    renderPage("/manage-listings/p1/edit");
    expect(screen.getByRole("heading", { name: /edit listing/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/address/i)).toHaveValue(mine.address);
  });

  it("redirects to Manage Listings for an unknown id", () => {
    renderPage("/manage-listings/nope/edit");
    expect(screen.getByTestId("location")).toHaveTextContent("/manage-listings");
  });

  it("redirects to Manage Listings when editing another landlord's listing", () => {
    renderPage("/manage-listings/p2/edit");
    expect(screen.getByTestId("location")).toHaveTextContent("/manage-listings");
  });

  it("creates a listing (any price, not just round thousands) and opens its page", async () => {
    const { data } = renderPage("/manage-listings/new");
    await fillNew();
    await userEvent.click(screen.getByRole("button", { name: /create listing/i }));

    expect(data.addProperty).toHaveBeenCalledWith(expect.objectContaining({ address: "9 New Build Ave", price: 425500 }));
    expect(await screen.findByTestId("location")).toHaveTextContent("/property/new-id");
  });

  it("saves edits and opens the listing's page", async () => {
    const { data } = renderPage("/manage-listings/p1/edit");
    await userEvent.clear(screen.getByLabelText(/address/i));
    await userEvent.type(screen.getByLabelText(/address/i), "Renamed");
    await userEvent.click(screen.getByRole("button", { name: /save changes/i }));

    expect(data.updateProperty).toHaveBeenCalledWith("p1", expect.objectContaining({ address: "Renamed" }));
    expect(await screen.findByTestId("location")).toHaveTextContent("/property/p1");
  });
});
