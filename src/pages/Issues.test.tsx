import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Issues } from "./Issues";
import type { Issue, IssueStatus, NewIssueInput } from "../types/issue";
import type { Property } from "../types/property";
import type { AuthUser } from "../types/auth";
import type { NewTenderInput, Tender } from "../types/tender";
import type { TraderProfile } from "../types/traderProfile";

const savedProperty: Property = {
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

const landlord: AuthUser = { id: "u1", email: "landlorda@abc.com", role: "landlord" };
const trader: AuthUser = { id: "u3", email: "tradea@abc.com", role: "tradesperson" };
const traderProfile: TraderProfile = { services: ["Plumbing"], areas: ["Portland, OR"], bio: "" };

function makeEmptyTenderProps() {
  return {
    tenders: [] as Tender[],
    traderProfile: { services: [], areas: [], bio: "" } as TraderProfile,
    onAddTender: vi.fn(),
    onAcceptTender: vi.fn(),
  };
}

// Mirrors how App.tsx wires useIssues'/useTenders' state through to the
// Issues page, with a role-switch button so a test can act as the trader and
// then the landlord against the *same* underlying state (like two people
// using the shared app, not two isolated renders).
function StatefulIssues({ saved }: { saved: Property[] }) {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [currentUser, setCurrentUser] = useState<AuthUser>(trader);

  const addIssue = (input: NewIssueInput) => {
    setIssues((prev) => [
      ...prev,
      { ...input, id: `issue-${prev.length}`, status: "open", createdAt: new Date().toISOString() },
    ]);
  };
  const updateIssueStatus = (issueId: string, status: IssueStatus) => {
    setIssues((prev) => prev.map((issue) => (issue.id === issueId ? { ...issue, status } : issue)));
  };
  const addTender = (input: NewTenderInput) => {
    setTenders((prev) => [
      ...prev,
      { ...input, id: `tender-${prev.length}`, status: "pending", createdAt: new Date().toISOString() },
    ]);
  };
  const acceptTender = (tenderId: string) => {
    setTenders((prev) => prev.map((t) => (t.id === tenderId ? { ...t, status: "accepted" } : t)));
  };

  return (
    <>
      <button type="button" onClick={() => setCurrentUser(landlord)}>
        Switch to landlord
      </button>
      <Issues
        saved={saved}
        properties={saved}
        issues={issues}
        onAddIssue={addIssue}
        currentUser={currentUser}
        onUpdateIssueStatus={updateIssueStatus}
        tenders={tenders}
        traderProfile={traderProfile}
        onAddTender={addTender}
        onAcceptTender={acceptTender}
      />
    </>
  );
}

describe("Issues page", () => {
  it("shows the empty-state hint when nothing is saved and no issues exist", () => {
    render(
      <Issues
        saved={[]}
        properties={[]}
        issues={[]}
        onAddIssue={vi.fn()}
        currentUser={null}
        onUpdateIssueStatus={vi.fn()}
        {...makeEmptyTenderProps()}
      />,
    );
    expect(screen.getByTestId("issue-form-empty")).toBeInTheDocument();
    expect(screen.getByTestId("issue-list-empty")).toBeInTheDocument();
  });

  it("reporting an issue through the form does not touch tendering", async () => {
    const tenderProps = makeEmptyTenderProps();
    render(
      <Issues
        saved={[savedProperty]}
        properties={[savedProperty]}
        issues={[]}
        onAddIssue={vi.fn()}
        currentUser={null}
        onUpdateIssueStatus={vi.fn()}
        {...tenderProps}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: /report an issue/i }));
    await userEvent.selectOptions(screen.getByLabelText(/property/i), savedProperty.id);
    await userEvent.type(screen.getByLabelText(/title/i), "Cracked window");
    await userEvent.type(screen.getByLabelText(/description/i), "Hairline crack.");
    await userEvent.click(screen.getByRole("button", { name: /^report issue$/i }));

    expect(tenderProps.onAddTender).not.toHaveBeenCalled();
  });

  it("supports the full flow: report an issue, tender a quote as a trader, then accept it as a landlord", async () => {
    render(<StatefulIssues saved={[savedProperty]} />);

    // Currently viewing as the trader - report the issue first (any signed-in
    // user can) so there's something to tender against.
    await userEvent.click(screen.getByRole("button", { name: /report an issue/i }));
    await userEvent.selectOptions(screen.getByLabelText(/property/i), savedProperty.id);
    await userEvent.type(screen.getByLabelText(/title/i), "Cracked window");
    await userEvent.type(screen.getByLabelText(/description/i), "Hairline crack.");
    await userEvent.click(screen.getByRole("button", { name: /^report issue$/i }));

    const list = screen.getByTestId("issue-list");
    expect(within(list).getByText("Cracked window")).toBeInTheDocument();

    // As the trader, tender a quote.
    await userEvent.click(within(list).getByRole("button", { name: /tenders/i }));
    await userEvent.type(within(list).getByLabelText(/quote amount/i), "150");
    await userEvent.type(within(list).getByLabelText(/message/i), "Can fix tomorrow.");
    await userEvent.click(within(list).getByRole("button", { name: /^tender a quote$/i }));

    expect(within(list).getByText("tradea@abc.com")).toBeInTheDocument();
    expect(within(list).getByText("Pending")).toBeInTheDocument();

    // Switch to the landlord and accept the tender.
    await userEvent.click(screen.getByRole("button", { name: /switch to landlord/i }));
    await userEvent.click(within(list).getByRole("button", { name: /accept tender/i }));

    expect(within(list).getByText("Accepted")).toBeInTheDocument();
  });

  it("lets a landlord change an issue's status independent of tendering", async () => {
    render(<StatefulIssues saved={[savedProperty]} />);

    await userEvent.click(screen.getByRole("button", { name: /report an issue/i }));
    await userEvent.selectOptions(screen.getByLabelText(/property/i), savedProperty.id);
    await userEvent.type(screen.getByLabelText(/title/i), "Cracked window");
    await userEvent.type(screen.getByLabelText(/description/i), "Hairline crack.");
    await userEvent.click(screen.getByRole("button", { name: /^report issue$/i }));

    await userEvent.click(screen.getByRole("button", { name: /switch to landlord/i }));

    const list = screen.getByTestId("issue-list");
    await userEvent.selectOptions(within(list).getByRole("combobox"), "resolved");
    expect(within(list).getByRole("combobox")).toHaveValue("resolved");
  });
});
