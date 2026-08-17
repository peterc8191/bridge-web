import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ViewingList } from "./ViewingList";
import type { ViewingRequest } from "../types/viewing";

const earlierViewing: ViewingRequest = {
  id: "v1",
  propertyId: "p1",
  date: "2026-09-01",
  time: "09:00",
  note: "",
  createdAt: "2026-08-01T00:00:00.000Z",
};

const laterViewing: ViewingRequest = {
  id: "v2",
  propertyId: "p1",
  date: "2026-09-01",
  time: "15:30",
  note: "Bringing a contractor",
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
});
