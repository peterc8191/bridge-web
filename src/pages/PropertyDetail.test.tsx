import { describe, expect, it } from "vitest";
import { fireEvent, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PropertyDetail } from "./PropertyDetail";
import { renderWithAppData } from "../test/appData";
import { futureDate, landlord, makeProperty, makeViewing, otherUser, tenant } from "../test/fixtures";
import type { AppData } from "../context/appDataContext";

const property = makeProperty({ id: "p1" });
const rental = makeProperty({ id: "p3", address: "27 Elm Court", price: 1650, listingType: "rent" });

function renderDetail(id: string, data: Partial<AppData> = {}) {
  return renderWithAppData(<PropertyDetail />, {
    path: "/property/:id",
    route: `/property/${id}`,
    data: { properties: [property, rental], ...data },
  });
}

const heroStyle = () => screen.getByTestId("property-detail-hero").style.backgroundImage;

describe("PropertyDetail", () => {
  it("shows a not-found state for an unknown id, with a link back to Saved", () => {
    renderDetail("nope");
    expect(screen.getByTestId("property-not-found")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /back to saved/i })).toHaveAttribute("href", "/saved");
  });

  it("shows the property's details, formatted price and badge", () => {
    renderDetail("p1");
    expect(screen.getByRole("heading", { name: property.address })).toBeInTheDocument();
    expect(screen.getByText(property.city)).toBeInTheDocument();
    expect(screen.getByText("$549,000")).toBeInTheDocument();
    expect(screen.getByText("For Sale")).toBeInTheDocument();
    expect(screen.getByText(/3 bed · 2 bath · 1,650 sqft/)).toBeInTheDocument();
    expect(screen.getByText(property.description)).toBeInTheDocument();
  });

  it("formats a rental's price per month with a For Rent badge", () => {
    renderDetail("p3");
    expect(screen.getByText("$1,650/mo")).toBeInTheDocument();
    expect(screen.getByText("For Rent")).toBeInTheDocument();
  });

  it("starts on the first photo and switches on thumbnail click", async () => {
    renderDetail("p1");
    expect(heroStyle().startsWith(`url("${property.images[0]}")`)).toBe(true);
    await userEvent.click(screen.getByRole("button", { name: /show photo 2/i }));
    expect(heroStyle().startsWith(`url("${property.images[1]}")`)).toBe(true);
  });

  it("asks signed-out visitors to log in before arranging a viewing", () => {
    renderDetail("p1");
    expect(screen.getByTestId("viewing-login-hint")).toBeInTheDocument();
    expect(screen.queryByTestId("viewing-form")).not.toBeInTheDocument();
  });

  it("lists only the signed-in user's own requests for this property", () => {
    renderDetail("p1", {
      currentUser: tenant,
      viewings: [
        makeViewing({ id: "mine", propertyId: "p1", note: "mine" }),
        makeViewing({ id: "other-prop", propertyId: "p3", note: "other property" }),
        makeViewing({ id: "other-user", propertyId: "p1", requesterId: otherUser.id, note: "someone else" }),
      ],
    });
    const list = screen.getByTestId("viewing-list");
    expect(within(list).getAllByRole("listitem")).toHaveLength(1);
    expect(within(list).getByText("mine")).toBeInTheDocument();
  });

  it("schedules a viewing and lets the user cancel a request", async () => {
    const { data } = renderDetail("p1", {
      currentUser: tenant,
      viewings: [makeViewing({ id: "v1", propertyId: "p1" })],
    });
    const date = futureDate(10);
    fireEvent.change(screen.getByLabelText(/date/i), { target: { value: date } });
    fireEvent.change(screen.getByLabelText(/time/i), { target: { value: "11:00" } });
    await userEvent.click(screen.getByRole("button", { name: /request viewing/i }));
    expect(data.scheduleViewing).toHaveBeenCalledWith({ propertyId: "p1", date, time: "11:00", note: "" });
    expect(screen.getByRole("status")).toHaveTextContent(/viewing requested/i);

    await userEvent.click(screen.getByRole("button", { name: /cancel request/i }));
    expect(data.cancelViewing).toHaveBeenCalledWith("v1");
  });

  it("shows the owner an edit link instead of the viewing form", () => {
    renderDetail("p1", { currentUser: landlord });
    expect(screen.getByRole("link", { name: /edit listing/i })).toHaveAttribute("href", "/manage-listings/p1/edit");
    expect(screen.queryByTestId("viewing-form")).not.toBeInTheDocument();
  });
});
