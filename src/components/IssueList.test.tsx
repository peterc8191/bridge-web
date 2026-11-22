import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { IssueList } from "./IssueList";
import type { AuthUser } from "../types/auth";
import type { Issue } from "../types/issue";
import type { Tender } from "../types/tender";
import type { TraderProfile } from "../types/traderProfile";
import { indexProperties } from "../lib/permissions";
import {
  landlord,
  makeIssue,
  makeProperty,
  makeTender,
  otherLandlord,
  tenant,
  trader,
} from "../test/fixtures";

const portland = makeProperty({ id: "p1", ownerId: landlord.id, city: "Portland, OR" });
const austin = makeProperty({ id: "p2", ownerId: landlord.id, address: "88 Riverside Ave", city: "Austin, TX" });
const propertyById = indexProperties([portland, austin]);
const portlandTrader: TraderProfile = { services: [], areas: ["Portland, OR"], bio: "" };

function renderList(
  issues: Issue[],
  {
    currentUser = tenant,
    tenders = [],
    traderProfile = portlandTrader,
    onUpdateStatus = vi.fn(),
  }: {
    currentUser?: AuthUser | null;
    tenders?: Tender[];
    traderProfile?: TraderProfile;
    onUpdateStatus?: (id: string, status: Issue["status"]) => void;
  } = {},
) {
  render(
    <IssueList
      issues={issues}
      propertyById={propertyById}
      currentUser={currentUser}
      onUpdateStatus={onUpdateStatus}
      tenders={tenders}
      traderProfile={traderProfile}
      onAddTender={vi.fn()}
      onAcceptTender={vi.fn()}
    />,
  );
  return { onUpdateStatus };
}

describe("IssueList", () => {
  it("shows an empty state when there are no issues", () => {
    renderList([]);
    expect(screen.getByTestId("issue-list-empty")).toBeInTheDocument();
  });

  it("renders each issue's title, status, description, and property", () => {
    renderList([makeIssue({ status: "in-progress" })]);
    expect(screen.getByText("Leaking faucet")).toBeInTheDocument();
    expect(screen.getByText("In Progress")).toBeInTheDocument();
    expect(screen.getByText("Drips all night.")).toBeInTheDocument();
    expect(screen.getByText("142 Maple Street, Portland, OR")).toBeInTheDocument();
  });

  it("falls back to 'Unknown property' for a deleted listing", () => {
    renderList([makeIssue({ propertyId: "gone" })]);
    expect(screen.getByText("Unknown property")).toBeInTheDocument();
  });

  it("sorts issues newest first", () => {
    renderList([
      makeIssue({ id: "old", title: "Older", createdAt: "2026-01-01T00:00:00Z" }),
      makeIssue({ id: "new", title: "Newer", createdAt: "2026-06-01T00:00:00Z" }),
    ]);
    const titles = screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent);
    expect(titles).toEqual(["Newer", "Older"]);
  });

  it("names the reporter for anyone but the reporter themself", () => {
    renderList([makeIssue()], { currentUser: landlord });
    expect(screen.getByText(/by tenant@test.com/)).toBeInTheDocument();
  });

  it("does not name the reporter to themself", () => {
    renderList([makeIssue()], { currentUser: tenant });
    expect(screen.queryByText(/by tenant@test.com/)).not.toBeInTheDocument();
  });

  describe("status control", () => {
    it("is a status select for the owning landlord, which updates the issue", async () => {
      const { onUpdateStatus } = renderList([makeIssue({ id: "i1" })], { currentUser: landlord });
      const select = screen.getByLabelText(/status for leaking faucet/i);
      expect(select).toHaveValue("open");

      await userEvent.selectOptions(select, "resolved");
      expect(onUpdateStatus).toHaveBeenCalledWith("i1", "resolved");
    });

    it("is a read-only badge for a landlord who doesn't own the property", () => {
      renderList([makeIssue()], { currentUser: otherLandlord });
      expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
      expect(screen.getByText("Open")).toBeInTheDocument();
    });

    it("is a read-only badge for tenants and when signed out", () => {
      renderList([makeIssue()], { currentUser: tenant });
      expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
    });
  });

  describe("tenders", () => {
    it("are hidden from tenants", () => {
      renderList([makeIssue()], { currentUser: tenant, tenders: [makeTender()] });
      expect(screen.queryByRole("button", { name: /tenders/i })).not.toBeInTheDocument();
    });

    it("show each issue's own tenders to the owner", () => {
      renderList([makeIssue({ id: "i1" }), makeIssue({ id: "i2", title: "Second" })], {
        currentUser: landlord,
        tenders: [makeTender({ id: "a", issueId: "i1" }), makeTender({ id: "b", issueId: "i1" })],
      });
      const items = screen.getAllByRole("listitem").filter((li) => li.className === "issue-list__item");
      const counts = items.map((li) => within(li).getByRole("button", { name: /tenders/i }).textContent);
      expect(counts.some((text) => text?.includes("(2)"))).toBe(true);
      expect(counts.filter((text) => !text?.includes("("))).toHaveLength(1);
    });

    it("let a trader quote on an issue in their area", async () => {
      renderList([makeIssue({ propertyId: "p1" })], { currentUser: trader });
      await userEvent.click(screen.getByRole("button", { name: /your quote/i }));
      expect(screen.getByTestId("tender-form")).toBeInTheDocument();
    });

    it("tell a trader when an issue is outside their areas", async () => {
      renderList([makeIssue({ propertyId: "p2" })], { currentUser: trader });
      await userEvent.click(screen.getByRole("button", { name: /your quote/i }));
      expect(screen.queryByTestId("tender-form")).not.toBeInTheDocument();
      expect(screen.getByText(/outside your service areas/i)).toBeInTheDocument();
    });

    it("tell a trader they've already quoted", async () => {
      renderList([makeIssue({ id: "i1", propertyId: "p1" })], {
        currentUser: trader,
        tenders: [makeTender({ issueId: "i1", traderId: trader.id })],
      });
      await userEvent.click(screen.getByRole("button", { name: /your quote/i }));
      expect(screen.getByText(/already tendered/i)).toBeInTheDocument();
    });
  });
});
