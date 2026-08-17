import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { IssueList } from "./IssueList";
import type { Issue } from "../types/issue";
import type { Property } from "../types/property";

const property: Property = {
  id: "p1",
  address: "142 Maple Street",
  city: "Portland, OR",
  price: 549000,
  beds: 3,
  baths: 2,
  sqft: 1650,
  description: "A house.",
  images: ["https://example.com/1.jpg"],
};

const olderIssue: Issue = {
  id: "issue-1",
  propertyId: "p1",
  title: "Old issue",
  description: "Reported a while ago.",
  status: "resolved",
  createdAt: "2026-01-01T00:00:00.000Z",
};

const newerIssue: Issue = {
  id: "issue-2",
  propertyId: "missing-property",
  title: "New issue",
  description: "Reported recently.",
  status: "open",
  createdAt: "2026-06-01T00:00:00.000Z",
};

describe("IssueList", () => {
  it("shows an empty state when there are no issues", () => {
    render(<IssueList issues={[]} properties={[property]} />);
    expect(screen.getByTestId("issue-list-empty")).toBeInTheDocument();
  });

  it("renders each issue's title, status, and description", () => {
    render(<IssueList issues={[olderIssue]} properties={[property]} />);
    expect(screen.getByText("Old issue")).toBeInTheDocument();
    expect(screen.getByText("Resolved")).toBeInTheDocument();
    expect(screen.getByText("Reported a while ago.")).toBeInTheDocument();
  });

  it("resolves the property address from the propertyId", () => {
    render(<IssueList issues={[olderIssue]} properties={[property]} />);
    expect(screen.getByText(property.address)).toBeInTheDocument();
  });

  it("falls back to 'Unknown property' when the propertyId has no match", () => {
    render(<IssueList issues={[newerIssue]} properties={[property]} />);
    expect(screen.getByText("Unknown property")).toBeInTheDocument();
  });

  it("sorts issues newest first", () => {
    render(<IssueList issues={[olderIssue, newerIssue]} properties={[property]} />);
    const titles = screen.getAllByRole("heading").map((el) => el.textContent);
    expect(titles).toEqual(["New issue", "Old issue"]);
  });
});
