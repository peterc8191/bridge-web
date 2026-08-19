import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { Viewings } from "./Viewings";
import { properties } from "../data/properties";
import type { ViewingRequest } from "../types/viewing";
import type { AuthUser } from "../types/auth";

const propertyA = properties[0];
const propertyB = properties[1];

const landlord: AuthUser = { id: "u1", email: "landlorda@abc.com", role: "landlord" };
const genericUser: AuthUser = { id: "u2", email: "usera@abc.com", role: "user" };

function viewing(overrides: Partial<ViewingRequest> & Pick<ViewingRequest, "id">): ViewingRequest {
  return {
    propertyId: propertyA.id,
    date: "2099-01-01",
    time: "09:00",
    note: "",
    confirmed: false,
    createdAt: "",
    ...overrides,
  };
}

function renderViewings(
  viewings: ViewingRequest[],
  options: { currentUser?: AuthUser | null; onConfirmViewing?: (id: string) => void } = {},
) {
  const { currentUser = null, onConfirmViewing = vi.fn() } = options;
  return render(
    <MemoryRouter>
      <Viewings
        properties={properties}
        viewings={viewings}
        currentUser={currentUser}
        onConfirmViewing={onConfirmViewing}
      />
    </MemoryRouter>,
  );
}

describe("Viewings page", () => {
  it("shows an empty state when there are no viewings", () => {
    renderViewings([]);
    expect(screen.getByTestId("viewings-empty")).toBeInTheDocument();
  });

  it("splits viewings into Upcoming and Past sections", () => {
    const upcoming = viewing({ id: "future", date: "2099-06-01" });
    const past = viewing({ id: "past", date: "2000-01-01" });
    renderViewings([upcoming, past]);

    expect(within(screen.getByTestId("upcoming-viewings")).getAllByRole("listitem")).toHaveLength(1);
    expect(within(screen.getByTestId("past-viewings")).getAllByRole("listitem")).toHaveLength(1);
  });

  it("shows a section-level empty message when one group has nothing", () => {
    const past = viewing({ id: "past", date: "2000-01-01" });
    renderViewings([past]);
    expect(screen.getByText(/no upcoming viewings/i)).toBeInTheDocument();
  });

  it("shows Confirmed and Pending status badges", () => {
    const confirmed = viewing({ id: "confirmed", date: "2099-06-01", confirmed: true });
    const pending = viewing({ id: "pending", date: "2099-06-02", confirmed: false });
    renderViewings([confirmed, pending]);

    expect(screen.getByText("Confirmed")).toBeInTheDocument();
    expect(screen.getByText("Pending")).toBeInTheDocument();
  });

  it("resolves the property address, and falls back for an unknown id", () => {
    const known = viewing({ id: "known", propertyId: propertyB.id, date: "2099-06-01" });
    const unknown = viewing({ id: "unknown", propertyId: "does-not-exist", date: "2099-06-02" });
    renderViewings([known, unknown]);

    expect(screen.getByText(propertyB.address)).toBeInTheDocument();
    expect(screen.getByText("Unknown property")).toBeInTheDocument();
  });

  it("links each row to its property's detail page", () => {
    const entry = viewing({ id: "known", propertyId: propertyB.id, date: "2099-06-01" });
    renderViewings([entry]);

    expect(screen.getByRole("link", { name: new RegExp(propertyB.address) })).toHaveAttribute(
      "href",
      `/property/${propertyB.id}`,
    );
  });

  it("sorts upcoming viewings soonest first", () => {
    const far = viewing({ id: "far", date: "2099-12-01" });
    const soon = viewing({ id: "soon", date: "2099-02-01" });
    renderViewings([far, soon]);

    const items = within(screen.getByTestId("upcoming-viewings")).getAllByRole("listitem");
    expect(items[0]).toHaveTextContent("Feb 1, 2099");
    expect(items[1]).toHaveTextContent("Dec 1, 2099");
  });

  it("sorts past viewings most recent first", () => {
    const longAgo = viewing({ id: "long-ago", date: "2000-01-01" });
    const recent = viewing({ id: "recent", date: "2010-01-01" });
    renderViewings([longAgo, recent]);

    const items = within(screen.getByTestId("past-viewings")).getAllByRole("listitem");
    expect(items[0]).toHaveTextContent("2010");
    expect(items[1]).toHaveTextContent("2000");
  });

  describe("landlord confirm control", () => {
    it("does not show a Confirm button for a non-landlord", () => {
      renderViewings([viewing({ id: "pending", date: "2099-06-01", confirmed: false })], {
        currentUser: genericUser,
      });
      expect(screen.queryByRole("button", { name: /confirm/i })).not.toBeInTheDocument();
    });

    it("does not show a Confirm button when logged out", () => {
      renderViewings([viewing({ id: "pending", date: "2099-06-01", confirmed: false })]);
      expect(screen.queryByRole("button", { name: /confirm/i })).not.toBeInTheDocument();
    });

    it("shows a Confirm button for a landlord only on pending viewings", () => {
      const pending = viewing({ id: "pending", date: "2099-06-01", confirmed: false });
      const confirmed = viewing({ id: "confirmed", date: "2099-06-02", confirmed: true });
      renderViewings([pending, confirmed], { currentUser: landlord });

      expect(screen.getAllByRole("button", { name: /confirm viewing/i })).toHaveLength(1);
    });

    it("calls onConfirmViewing with the viewing id when a landlord clicks Confirm", async () => {
      const onConfirmViewing = vi.fn();
      const pending = viewing({ id: "pending", date: "2099-06-01", confirmed: false });
      renderViewings([pending], { currentUser: landlord, onConfirmViewing });

      await userEvent.click(screen.getByRole("button", { name: /confirm viewing/i }));
      expect(onConfirmViewing).toHaveBeenCalledWith("pending");
    });
  });
});
