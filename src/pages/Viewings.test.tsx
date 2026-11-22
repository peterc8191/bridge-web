import { afterEach, describe, expect, it, vi } from "vitest";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Viewings } from "./Viewings";
import { renderWithAppData } from "../test/appData";
import { futureDate, landlord, makeProperty, makeViewing, otherLandlord, tenant } from "../test/fixtures";
import type { AppData } from "../context/appDataContext";
import type { ViewingRequest } from "../types/viewing";

const property = makeProperty({ id: "p1", ownerId: landlord.id });

function renderPage(viewings: ViewingRequest[], data: Partial<AppData> = {}) {
  return renderWithAppData(<Viewings />, {
    data: { currentUser: tenant, properties: [property], viewings, ...data },
  });
}

const upcoming = () => screen.getByTestId("upcoming-viewings");
const past = () => screen.getByTestId("past-viewings");

describe("Viewings page", () => {
  afterEach(() => vi.restoreAllMocks());

  it("shows an empty state when there are no viewings", () => {
    renderPage([]);
    expect(screen.getByTestId("viewings-empty")).toBeInTheDocument();
  });

  it("splits viewings into Upcoming (soonest first) and Past (most recent first)", () => {
    renderPage([
      makeViewing({ id: "u2", date: futureDate(9), note: "later" }),
      makeViewing({ id: "u1", date: futureDate(2), note: "sooner" }),
      makeViewing({ id: "p2", date: futureDate(-9), note: "long ago" }),
      makeViewing({ id: "p1", date: futureDate(-2), note: "recently" }),
    ]);
    const notes = (list: HTMLElement) =>
      within(list).getAllByRole("listitem").map((li) => li.querySelector(".viewings-page__note")?.textContent);
    expect(notes(upcoming())).toEqual(["sooner", "later"]);
    expect(notes(past())).toEqual(["recently", "long ago"]);
  });

  it("shows a section-level empty message when one group has nothing", () => {
    renderPage([makeViewing({ date: futureDate(3) })]);
    expect(screen.getByText(/no past viewings/i)).toBeInTheDocument();
  });

  it("shows each request's status", () => {
    renderPage([
      makeViewing({ id: "a", status: "confirmed" }),
      makeViewing({ id: "b", status: "pending", date: futureDate(4) }),
      makeViewing({ id: "c", status: "declined", date: futureDate(5) }),
      makeViewing({ id: "d", status: "cancelled", date: futureDate(6) }),
    ]);
    for (const label of ["Confirmed", "Pending", "Declined", "Cancelled"]) {
      expect(within(upcoming()).getByText(label)).toBeInTheDocument();
    }
  });

  it("resolves the address (with a fallback) and links to the property", () => {
    renderPage([makeViewing({ id: "a" }), makeViewing({ id: "b", propertyId: "gone", date: futureDate(8) })]);
    expect(screen.getByText(property.address)).toBeInTheDocument();
    expect(screen.getByText("Unknown property")).toBeInTheDocument();
    expect(screen.getAllByRole("link")[0]).toHaveAttribute("href", "/property/p1");
  });

  describe("requester", () => {
    it("can cancel an upcoming request after confirming", async () => {
      vi.spyOn(window, "confirm").mockReturnValue(true);
      const { data } = renderPage([makeViewing({ id: "v1" })]);
      await userEvent.click(screen.getByRole("button", { name: /cancel request/i }));
      expect(data.cancelViewing).toHaveBeenCalledWith("v1");
    });

    it("cannot respond to their own request, or cancel past ones", () => {
      renderPage([makeViewing({ id: "v1", date: futureDate(-3) })]);
      expect(screen.queryByRole("button", { name: /confirm viewing/i })).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /cancel request/i })).not.toBeInTheDocument();
    });
  });

  describe("landlord", () => {
    it("sees who asked, and can confirm or decline pending requests on their listing", async () => {
      const { data } = renderPage(
        [makeViewing({ id: "v1" }), makeViewing({ id: "v2", status: "confirmed", date: futureDate(9) })],
        { currentUser: landlord },
      );
      expect(screen.getAllByText(/requested by tenant@test.com/i)).toHaveLength(2);
      expect(screen.getAllByRole("button", { name: /confirm viewing/i })).toHaveLength(1);

      await userEvent.click(screen.getByRole("button", { name: /confirm viewing/i }));
      expect(data.respondToViewing).toHaveBeenCalledWith("v1", "confirmed");
      await userEvent.click(screen.getByRole("button", { name: /decline/i }));
      expect(data.respondToViewing).toHaveBeenCalledWith("v1", "declined");
    });

    it("cannot respond to requests on another landlord's listing", () => {
      renderPage([makeViewing({ id: "v1" })], { currentUser: otherLandlord });
      expect(screen.queryByRole("button", { name: /confirm viewing/i })).not.toBeInTheDocument();
    });
  });
});
