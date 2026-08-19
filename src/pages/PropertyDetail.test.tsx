import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { PropertyDetail } from "./PropertyDetail";
import { properties } from "../data/properties";
import type { ViewingRequest } from "../types/viewing";

const property = properties[0]; // has 4 images

function renderDetail(path: string, viewings: ViewingRequest[] = [], onScheduleViewing = vi.fn()) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route
          path="/property/:id"
          element={
            <PropertyDetail
              properties={properties}
              viewings={viewings}
              onScheduleViewing={onScheduleViewing}
            />
          }
        />
        <Route path="/saved" element={<div>Saved page</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("PropertyDetail", () => {
  it("shows a not-found state for an unknown id, with a link back to Saved", () => {
    renderDetail("/property/does-not-exist");
    expect(screen.getByTestId("property-not-found")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /back to saved/i })).toHaveAttribute("href", "/saved");
  });

  it("shows all of the property's details", () => {
    renderDetail(`/property/${property.id}`);
    expect(screen.getByRole("heading", { name: property.address })).toBeInTheDocument();
    expect(screen.getByText(property.city)).toBeInTheDocument();
    expect(screen.getByText(property.description)).toBeInTheDocument();
    expect(
      screen.getByText(`${property.beds} bed · ${property.baths} bath · ${property.sqft.toLocaleString()} sqft`),
    ).toBeInTheDocument();
  });

  it("shows the formatted price and listing-type badge", () => {
    renderDetail(`/property/${property.id}`);
    expect(screen.getByText("$549,000")).toBeInTheDocument();
    expect(screen.getByText("For Sale")).toBeInTheDocument();
  });

  it("formats a rental's price per month with a For Rent badge", () => {
    const rental = properties.find((p) => p.listingType === "rent")!;
    renderDetail(`/property/${rental.id}`);
    expect(screen.getByText(`$${rental.price.toLocaleString()}/mo`)).toBeInTheDocument();
    expect(screen.getByText("For Rent")).toBeInTheDocument();
  });

  it("starts on the first photo and switches on thumbnail click", async () => {
    renderDetail(`/property/${property.id}`);
    expect(screen.getByTestId("property-detail-hero")).toHaveStyle(
      `background-image: url(${property.images[0]})`,
    );

    await userEvent.click(screen.getByRole("button", { name: /show photo 2/i }));
    expect(screen.getByTestId("property-detail-hero")).toHaveStyle(
      `background-image: url(${property.images[1]})`,
    );
  });

  it("lists existing viewing requests for this property only", () => {
    const viewings: ViewingRequest[] = [
      {
        id: "v1",
        propertyId: property.id,
        date: "2026-09-01",
        time: "09:00",
        note: "",
        confirmed: false,
        createdAt: "",
      },
      {
        id: "v2",
        propertyId: "some-other-property",
        date: "2026-09-02",
        time: "10:00",
        note: "",
        confirmed: false,
        createdAt: "",
      },
    ];
    renderDetail(`/property/${property.id}`, viewings);

    const list = screen.getByTestId("viewing-list");
    expect(list.querySelectorAll("li")).toHaveLength(1);
  });

  it("schedules a viewing and shows it was requested", async () => {
    const onScheduleViewing = vi.fn();
    renderDetail(`/property/${property.id}`, [], onScheduleViewing);

    fireEvent.change(screen.getByLabelText(/date/i), { target: { value: "2026-09-10" } });
    fireEvent.change(screen.getByLabelText(/time/i), { target: { value: "14:00" } });
    await userEvent.click(screen.getByRole("button", { name: /request viewing/i }));

    expect(onScheduleViewing).toHaveBeenCalledWith({
      propertyId: property.id,
      date: "2026-09-10",
      time: "14:00",
      note: "",
    });
  });
});
