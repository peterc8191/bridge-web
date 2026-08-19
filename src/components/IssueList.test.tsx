import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { IssueList } from "./IssueList";
import type { Issue } from "../types/issue";
import type { Property } from "../types/property";
import type { AuthUser } from "../types/auth";
import type { Tender } from "../types/tender";

const property: Property = {
  id: "p1",
  address: "142 Maple Street",
  city: "Portland, OR",
  price: 549000,
  listingType: "sale",
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

const landlord: AuthUser = { id: "u1", email: "landlorda@abc.com", role: "landlord" };
const genericUser: AuthUser = { id: "u2", email: "usera@abc.com", role: "user" };

function renderList(
  overrides: Partial<Parameters<typeof IssueList>[0]> & { issues: Issue[]; properties: Property[] },
) {
  const props = {
    currentUser: null,
    onUpdateStatus: vi.fn(),
    tenders: [],
    traderProfile: { services: [], areas: [], bio: "" },
    onAddTender: vi.fn(),
    onAcceptTender: vi.fn(),
    ...overrides,
  };
  render(<IssueList {...props} />);
  return props;
}

describe("IssueList", () => {
  it("shows an empty state when there are no issues", () => {
    renderList({ issues: [], properties: [property] });
    expect(screen.getByTestId("issue-list-empty")).toBeInTheDocument();
  });

  it("renders each issue's title, status, and description", () => {
    renderList({ issues: [olderIssue], properties: [property] });
    expect(screen.getByText("Old issue")).toBeInTheDocument();
    expect(screen.getByText("Resolved")).toBeInTheDocument();
    expect(screen.getByText("Reported a while ago.")).toBeInTheDocument();
  });

  it("resolves the property address from the propertyId", () => {
    renderList({ issues: [olderIssue], properties: [property] });
    expect(screen.getByText(property.address)).toBeInTheDocument();
  });

  it("falls back to 'Unknown property' when the propertyId has no match", () => {
    renderList({ issues: [newerIssue], properties: [property] });
    expect(screen.getByText("Unknown property")).toBeInTheDocument();
  });

  it("sorts issues newest first", () => {
    renderList({ issues: [olderIssue, newerIssue], properties: [property] });
    const titles = screen.getAllByRole("heading").map((el) => el.textContent);
    expect(titles).toEqual(["New issue", "Old issue"]);
  });

  describe("landlord status control", () => {
    it("shows a read-only status badge, not a select, for a non-landlord", () => {
      renderList({ issues: [olderIssue], properties: [property], currentUser: genericUser });
      expect(screen.getByText("Resolved")).toBeInTheDocument();
      expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
    });

    it("shows a read-only status badge when logged out", () => {
      renderList({ issues: [olderIssue], properties: [property], currentUser: null });
      expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
    });

    it("shows a status select for a landlord, reflecting the current status", () => {
      renderList({ issues: [olderIssue], properties: [property], currentUser: landlord });
      expect(screen.getByRole("combobox")).toHaveValue("resolved");
    });

    it("calls onUpdateStatus with the issue id and new status when a landlord changes it", async () => {
      const onUpdateStatus = vi.fn();
      renderList({
        issues: [olderIssue],
        properties: [property],
        currentUser: landlord,
        onUpdateStatus,
      });

      await userEvent.selectOptions(screen.getByRole("combobox"), "in-progress");
      expect(onUpdateStatus).toHaveBeenCalledWith("issue-1", "in-progress");
    });
  });

  describe("tenders wiring", () => {
    const tenderForOlder: Tender = {
      id: "t1",
      issueId: "issue-1",
      traderId: "u3",
      traderEmail: "tradea@abc.com",
      traderServices: ["Plumbing"],
      traderAreas: ["Portland, OR"],
      amount: 150,
      message: "Can do it tomorrow.",
      status: "pending",
      createdAt: "",
    };
    const tenderForNewer: Tender = {
      ...tenderForOlder,
      id: "t2",
      issueId: "issue-2",
      traderEmail: "other-trader@example.com",
    };

    it("passes only the matching issue's tenders to each item", async () => {
      renderList({
        issues: [olderIssue, newerIssue],
        properties: [property],
        currentUser: landlord,
        tenders: [tenderForOlder, tenderForNewer],
      });

      const items = screen.getAllByRole("listitem");
      const olderItem = items.find((item) => within(item).queryByText("Old issue"))!;
      const newerItem = items.find((item) => within(item).queryByText("New issue"))!;

      await userEvent.click(within(olderItem).getByRole("button", { name: /tenders/i }));
      expect(within(olderItem).getByText("tradea@abc.com")).toBeInTheDocument();
      expect(within(olderItem).queryByText("other-trader@example.com")).not.toBeInTheDocument();

      await userEvent.click(within(newerItem).getByRole("button", { name: /tenders/i }));
      expect(within(newerItem).getByText("other-trader@example.com")).toBeInTheDocument();
      expect(within(newerItem).queryByText("tradea@abc.com")).not.toBeInTheDocument();
    });
  });
});
