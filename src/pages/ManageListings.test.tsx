import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ManageListings } from "./ManageListings";
import { properties } from "../data/properties";
import type { AuthUser } from "../types/auth";

const landlord: AuthUser = { id: "u1", email: "landlorda@abc.com", role: "landlord" };
const genericUser: AuthUser = { id: "u2", email: "usera@abc.com", role: "user" };

function renderManageListings(currentUser: AuthUser | null, onDeleteProperty = vi.fn()) {
  return render(
    <MemoryRouter initialEntries={["/manage-listings"]}>
      <Routes>
        <Route
          path="/manage-listings"
          element={
            <ManageListings
              currentUser={currentUser}
              properties={properties}
              onDeleteProperty={onDeleteProperty}
            />
          }
        />
        <Route path="/" element={<div>Home page</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("ManageListings", () => {
  it("redirects home for a non-landlord", () => {
    renderManageListings(genericUser);
    expect(screen.getByText("Home page")).toBeInTheDocument();
  });

  it("redirects home when logged out", () => {
    renderManageListings(null);
    expect(screen.getByText("Home page")).toBeInTheDocument();
  });

  it("lists every property for a landlord", () => {
    renderManageListings(landlord);
    const list = screen.getByTestId("manage-listings-list");
    expect(list.querySelectorAll("li")).toHaveLength(properties.length);
    expect(screen.getByText(properties[0].address)).toBeInTheDocument();
  });

  it("shows each listing's formatted price and listing-type badge", () => {
    renderManageListings(landlord);
    const rental = properties.find((p) => p.listingType === "rent")!;
    expect(screen.getAllByText("For Sale").length).toBeGreaterThan(0);
    expect(screen.getAllByText("For Rent").length).toBeGreaterThan(0);
    expect(screen.getByText(new RegExp(`\\$${rental.price.toLocaleString()}/mo`))).toBeInTheDocument();
  });

  it("links each listing's Edit button to its edit route", () => {
    renderManageListings(landlord);
    expect(screen.getAllByRole("link", { name: /edit/i })[0]).toHaveAttribute(
      "href",
      `/manage-listings/${properties[0].id}/edit`,
    );
  });

  it("links Add new listing to the create route", () => {
    renderManageListings(landlord);
    expect(screen.getByRole("link", { name: /add new listing/i })).toHaveAttribute(
      "href",
      "/manage-listings/new",
    );
  });

  it("deletes a listing only after confirmation", async () => {
    const onDeleteProperty = vi.fn();
    renderManageListings(landlord, onDeleteProperty);

    vi.spyOn(window, "confirm").mockReturnValue(false);
    await userEvent.click(screen.getAllByRole("button", { name: /delete/i })[0]);
    expect(onDeleteProperty).not.toHaveBeenCalled();

    vi.spyOn(window, "confirm").mockReturnValue(true);
    await userEvent.click(screen.getAllByRole("button", { name: /delete/i })[0]);
    expect(onDeleteProperty).toHaveBeenCalledWith(properties[0].id);

    vi.restoreAllMocks();
  });
});
