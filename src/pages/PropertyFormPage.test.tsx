import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { PropertyFormPage } from "./PropertyFormPage";
import { properties } from "../data/properties";
import type { AuthUser } from "../types/auth";
import type { PropertyInput } from "../types/property";

const landlord: AuthUser = { id: "u1", email: "landlorda@abc.com", role: "landlord" };
const genericUser: AuthUser = { id: "u2", email: "usera@abc.com", role: "user" };

function renderAt(
  path: string,
  currentUser: AuthUser | null,
  overrides: {
    onAddProperty?: (input: PropertyInput) => string;
    onUpdateProperty?: (id: string, input: PropertyInput) => void;
  } = {},
) {
  const onAddProperty = overrides.onAddProperty ?? vi.fn().mockReturnValue("property-new-1");
  const onUpdateProperty = overrides.onUpdateProperty ?? vi.fn();

  return {
    onAddProperty,
    onUpdateProperty,
    ...render(
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route
            path="/manage-listings/new"
            element={
              <PropertyFormPage
                currentUser={currentUser}
                properties={properties}
                onAddProperty={onAddProperty}
                onUpdateProperty={onUpdateProperty}
              />
            }
          />
          <Route
            path="/manage-listings/:id/edit"
            element={
              <PropertyFormPage
                currentUser={currentUser}
                properties={properties}
                onAddProperty={onAddProperty}
                onUpdateProperty={onUpdateProperty}
              />
            }
          />
          <Route path="/manage-listings" element={<div>Manage listings page</div>} />
          <Route path="/property/:id" element={<div>Property detail page</div>} />
          <Route path="/" element={<div>Home page</div>} />
        </Routes>
      </MemoryRouter>,
    ),
  };
}

describe("PropertyFormPage", () => {
  it("redirects home for a non-landlord", () => {
    renderAt("/manage-listings/new", genericUser);
    expect(screen.getByText("Home page")).toBeInTheDocument();
  });

  it("redirects home when logged out", () => {
    renderAt("/manage-listings/new", null);
    expect(screen.getByText("Home page")).toBeInTheDocument();
  });

  it("shows a create form with no pre-filled values for /manage-listings/new", () => {
    renderAt("/manage-listings/new", landlord);
    expect(screen.getByRole("heading", { name: /add new listing/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/address/i)).toHaveValue("");
    expect(screen.getByRole("button", { name: /create listing/i })).toBeInTheDocument();
  });

  it("shows an edit form pre-filled with the existing listing", () => {
    const target = properties[0];
    renderAt(`/manage-listings/${target.id}/edit`, landlord);
    expect(screen.getByRole("heading", { name: /edit listing/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/address/i)).toHaveValue(target.address);
    expect(screen.getByRole("button", { name: /save changes/i })).toBeInTheDocument();
  });

  it("redirects to Manage Listings for an edit route with an unknown id", () => {
    renderAt("/manage-listings/does-not-exist/edit", landlord);
    expect(screen.getByText("Manage listings page")).toBeInTheDocument();
  });

  it("calls onAddProperty and navigates to the new property's detail page on create", async () => {
    const onAddProperty = vi.fn().mockReturnValue("property-new-1");
    renderAt("/manage-listings/new", landlord, { onAddProperty });

    await userEvent.type(screen.getByLabelText(/address/i), "9 New Build Ave");
    await userEvent.type(screen.getByLabelText(/city/i), "Denver, CO");
    await userEvent.type(screen.getByLabelText(/price/i), "425000");
    await userEvent.type(screen.getByLabelText(/sqft/i), "1100");
    await userEvent.type(screen.getByLabelText(/beds/i), "2");
    await userEvent.type(screen.getByLabelText(/baths/i), "2");
    await userEvent.type(screen.getByLabelText(/description/i), "Freshly listed condo.");
    await userEvent.type(screen.getByLabelText(/photo urls/i), "https://example.com/new.jpg");
    await userEvent.click(screen.getByRole("button", { name: /create listing/i }));

    expect(onAddProperty).toHaveBeenCalled();
    expect(await screen.findByText("Property detail page")).toBeInTheDocument();
  });

  it("calls onUpdateProperty and navigates to the property's detail page on edit", async () => {
    const target = properties[0];
    const onUpdateProperty = vi.fn();
    renderAt(`/manage-listings/${target.id}/edit`, landlord, { onUpdateProperty });

    await userEvent.click(screen.getByRole("button", { name: /save changes/i }));

    expect(onUpdateProperty).toHaveBeenCalledWith(
      target.id,
      expect.objectContaining({ address: target.address }),
    );
    expect(await screen.findByText("Property detail page")).toBeInTheDocument();
  });
});
