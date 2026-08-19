import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { IssueTenders } from "./IssueTenders";
import type { AuthUser } from "../types/auth";
import type { Tender } from "../types/tender";
import type { TraderProfile } from "../types/traderProfile";

const landlord: AuthUser = { id: "u1", email: "landlorda@abc.com", role: "landlord" };
const trader: AuthUser = { id: "u3", email: "tradea@abc.com", role: "tradesperson" };
const genericUser: AuthUser = { id: "u2", email: "usera@abc.com", role: "user" };
const traderProfile: TraderProfile = { services: ["Plumbing"], areas: ["Portland, OR"], bio: "" };
const emptyProfile: TraderProfile = { services: [], areas: [], bio: "" };

const pendingTender: Tender = {
  id: "t1",
  issueId: "issue-1",
  traderId: "u3",
  traderEmail: "tradea@abc.com",
  traderServices: ["Plumbing"],
  traderAreas: ["Portland, OR"],
  amount: 150,
  message: "Can fix tomorrow.",
  status: "pending",
  createdAt: "",
};

const acceptedTender: Tender = { ...pendingTender, id: "t2", status: "accepted", amount: 200 };

function renderTenders(overrides: Partial<Parameters<typeof IssueTenders>[0]> = {}) {
  const props = {
    issueId: "issue-1",
    tenders: [] as Tender[],
    currentUser: null as AuthUser | null,
    traderProfile: emptyProfile,
    onAddTender: vi.fn(),
    onAcceptTender: vi.fn(),
    ...overrides,
  };
  render(<IssueTenders {...props} />);
  return props;
}

describe("IssueTenders", () => {
  it("renders nothing for a generic user", () => {
    const { container } = render(
      <IssueTenders
        issueId="issue-1"
        tenders={[]}
        currentUser={genericUser}
        traderProfile={emptyProfile}
        onAddTender={vi.fn()}
        onAcceptTender={vi.fn()}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing when logged out", () => {
    const { container } = render(
      <IssueTenders
        issueId="issue-1"
        tenders={[]}
        currentUser={null}
        traderProfile={emptyProfile}
        onAddTender={vi.fn()}
        onAcceptTender={vi.fn()}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("shows a collapsed toggle with a tender count for a landlord", () => {
    renderTenders({ currentUser: landlord, tenders: [pendingTender] });
    expect(screen.getByRole("button", { name: "Tenders (1)" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    expect(screen.queryByTestId("issue-tenders-list")).not.toBeInTheDocument();
  });

  it("expands to show tender details: amount, status, trader, services, areas, message", async () => {
    renderTenders({ currentUser: landlord, tenders: [pendingTender] });
    await userEvent.click(screen.getByRole("button", { name: /tenders/i }));

    expect(screen.getByText("$150")).toBeInTheDocument();
    expect(screen.getByText("Pending")).toBeInTheDocument();
    expect(screen.getByText("tradea@abc.com")).toBeInTheDocument();
    expect(screen.getByText("Services: Plumbing")).toBeInTheDocument();
    expect(screen.getByText("Areas: Portland, OR")).toBeInTheDocument();
    expect(screen.getByText("Can fix tomorrow.")).toBeInTheDocument();
  });

  it("shows an empty message when there are no tenders yet", async () => {
    renderTenders({ currentUser: landlord, tenders: [] });
    await userEvent.click(screen.getByRole("button", { name: /^tenders$/i }));
    expect(screen.getByText(/no tenders yet/i)).toBeInTheDocument();
  });

  describe("landlord accept action", () => {
    it("shows Accept only on a pending tender, not an accepted one", async () => {
      renderTenders({ currentUser: landlord, tenders: [pendingTender, acceptedTender] });
      await userEvent.click(screen.getByRole("button", { name: /tenders/i }));
      expect(screen.getAllByRole("button", { name: /accept tender/i })).toHaveLength(1);
    });

    it("calls onAcceptTender with the tender id", async () => {
      const onAcceptTender = vi.fn();
      renderTenders({ currentUser: landlord, tenders: [pendingTender], onAcceptTender });
      await userEvent.click(screen.getByRole("button", { name: /tenders/i }));
      await userEvent.click(screen.getByRole("button", { name: /accept tender/i }));
      expect(onAcceptTender).toHaveBeenCalledWith("t1");
    });

    it("does not show a tender form for a landlord", async () => {
      renderTenders({ currentUser: landlord, tenders: [] });
      await userEvent.click(screen.getByRole("button", { name: /^tenders$/i }));
      expect(screen.queryByTestId("tender-form")).not.toBeInTheDocument();
    });
  });

  describe("trader tendering", () => {
    it("shows a tender form when the trader has no existing tender on this issue", async () => {
      renderTenders({ currentUser: trader, traderProfile, tenders: [] });
      await userEvent.click(screen.getByRole("button", { name: /^tenders$/i }));
      expect(screen.getByTestId("tender-form")).toBeInTheDocument();
    });

    it("submits using the trader's profile services/areas plus the entered amount/message", async () => {
      const onAddTender = vi.fn();
      renderTenders({ currentUser: trader, traderProfile, tenders: [], onAddTender });

      await userEvent.click(screen.getByRole("button", { name: /^tenders$/i }));
      await userEvent.type(screen.getByLabelText(/quote amount/i), "150");
      await userEvent.type(screen.getByLabelText(/message/i), "Can fix tomorrow.");
      await userEvent.click(screen.getByRole("button", { name: /^tender a quote$/i }));

      expect(onAddTender).toHaveBeenCalledWith({
        issueId: "issue-1",
        traderId: "u3",
        traderEmail: "tradea@abc.com",
        traderServices: ["Plumbing"],
        traderAreas: ["Portland, OR"],
        amount: 150,
        message: "Can fix tomorrow.",
      });
    });

    it("rejects a zero amount", async () => {
      const onAddTender = vi.fn();
      renderTenders({ currentUser: trader, traderProfile, tenders: [], onAddTender });

      await userEvent.click(screen.getByRole("button", { name: /^tenders$/i }));
      await userEvent.type(screen.getByLabelText(/quote amount/i), "0");
      await userEvent.type(screen.getByLabelText(/message/i), "Message");
      await userEvent.click(screen.getByRole("button", { name: /^tender a quote$/i }));

      expect(await screen.findByRole("alert")).toHaveTextContent(/valid quote amount/i);
      expect(onAddTender).not.toHaveBeenCalled();
    });

    it("does not show a form, and shows a note instead, when the trader already tendered", async () => {
      const myTender: Tender = { ...pendingTender, traderId: trader.id };
      renderTenders({ currentUser: trader, traderProfile, tenders: [myTender] });

      await userEvent.click(screen.getByRole("button", { name: /tenders/i }));
      expect(screen.queryByTestId("tender-form")).not.toBeInTheDocument();
      expect(screen.getByText(/already tendered/i)).toBeInTheDocument();
    });

    it("does not show an Accept button for a trader", async () => {
      renderTenders({ currentUser: trader, traderProfile, tenders: [pendingTender] });
      await userEvent.click(screen.getByRole("button", { name: /tenders/i }));
      expect(screen.queryByRole("button", { name: /accept tender/i })).not.toBeInTheDocument();
    });
  });
});
