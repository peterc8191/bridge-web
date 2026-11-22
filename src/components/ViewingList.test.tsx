import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ViewingList } from "./ViewingList";
import userEvent from "@testing-library/user-event";
import { futureDate, makeViewing } from "../test/fixtures";
import type { ViewingRequest } from "../types/viewing";

const earlierViewing: ViewingRequest = {
  id: "v1",
  propertyId: "p1",
  requesterId: "u1",
  requesterEmail: "u1@test.com",
  date: "2026-09-01",
  time: "09:00",
  note: "",
  status: "pending",
  createdAt: "2026-08-01T00:00:00.000Z",
};

const laterViewing: ViewingRequest = {
  id: "v2",
  propertyId: "p1",
  requesterId: "u1",
  requesterEmail: "u1@test.com",
  date: "2026-09-01",
  time: "15:30",
  note: "Bringing a contractor",
  status: "confirmed",
  createdAt: "2026-08-02T00:00:00.000Z",
};

describe("ViewingList", () => {
  it("shows an empty state when there are no viewings", () => {
    render(<ViewingList viewings={[]} />);
    expect(screen.getByTestId("viewing-list-empty")).toBeInTheDocument();
  });

  it("formats the date and 12-hour time", () => {
    render(<ViewingList viewings={[earlierViewing]} />);
    expect(screen.getByText("Sep 1, 2026 at 9:00 AM")).toBeInTheDocument();
  });

  it("shows the note when present", () => {
    render(<ViewingList viewings={[laterViewing]} />);
    expect(screen.getByText("Bringing a contractor")).toBeInTheDocument();
  });

  it("sorts viewings earliest first", () => {
    render(<ViewingList viewings={[laterViewing, earlierViewing]} />);
    const items = screen.getAllByText(/at \d/);
    expect(items[0]).toHaveTextContent("9:00 AM");
    expect(items[1]).toHaveTextContent("3:30 PM");
  });

  it("shows each request's status", () => {
    render(
      <ViewingList
        viewings={[
          makeViewing({ id: "a", status: "pending" }),
          makeViewing({ id: "b", status: "declined", date: futureDate(9) }),
        ]}
      />,
    );
    expect(screen.getByText("Pending")).toBeInTheDocument();
    expect(screen.getByText("Declined")).toBeInTheDocument();
  });

  it("offers cancel on active requests only, when onCancel is given", async () => {
    const onCancel = vi.fn();
    render(
      <ViewingList
        viewings={[
          makeViewing({ id: "active", status: "confirmed" }),
          makeViewing({ id: "done", status: "cancelled", date: futureDate(9) }),
        ]}
        onCancel={onCancel}
      />,
    );
    const buttons = screen.getAllByRole("button", { name: /cancel request/i });
    expect(buttons).toHaveLength(1);
    await userEvent.click(buttons[0]);
    expect(onCancel).toHaveBeenCalledWith("active");
  });
});
