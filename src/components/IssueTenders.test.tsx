import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { IssueTenders } from "./IssueTenders";
import type { Tender } from "../types/tender";
import { makeTender } from "../test/fixtures";

const pending = makeTender({ id: "t1", status: "pending", amount: 180, traderEmail: "a@trade.com" });
const accepted = makeTender({ id: "t2", status: "accepted", amount: 240, traderEmail: "b@trade.com" });

type Props = Parameters<typeof IssueTenders>[0];

function renderTenders(props: Partial<Props> = {}) {
  const defaults: Props = {
    issueId: "i1",
    tenders: [] as Tender[],
    isOwner: false,
    isTrader: false,
    canTender: false,
    blockedReason: "",
    onAddTender: vi.fn(),
    onAcceptTender: vi.fn(),
  };
  const all = { ...defaults, ...props };
  render(<IssueTenders {...all} />);
  return all;
}

const expand = (name: RegExp) => userEvent.click(screen.getByRole("button", { name }));

describe("IssueTenders", () => {
  it("renders nothing for someone who is neither the owner nor a trader", () => {
    const { container } = render(
      <IssueTenders
        issueId="i1"
        tenders={[pending]}
        isOwner={false}
        isTrader={false}
        canTender={false}
        blockedReason=""
        onAddTender={vi.fn()}
        onAcceptTender={vi.fn()}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  describe("owner", () => {
    it("shows a collapsed toggle with the tender count", () => {
      renderTenders({ isOwner: true, tenders: [pending, accepted] });
      expect(screen.getByRole("button", { name: /tenders \(2\)/i })).toHaveAttribute("aria-expanded", "false");
      expect(screen.queryByTestId("issue-tenders-list")).not.toBeInTheDocument();
    });

    it("expands to show tender details", async () => {
      renderTenders({ isOwner: true, tenders: [pending] });
      await expand(/tenders/i);

      const list = screen.getByTestId("issue-tenders-list");
      expect(within(list).getByText("$180")).toBeInTheDocument();
      expect(within(list).getByText("a@trade.com")).toBeInTheDocument();
      expect(within(list).getByText(/services: plumbing/i)).toBeInTheDocument();
      expect(within(list).getByText(/areas: portland, or/i)).toBeInTheDocument();
      expect(within(list).getByText(pending.message)).toBeInTheDocument();
    });

    it("shows an empty message when there are no tenders", async () => {
      renderTenders({ isOwner: true });
      await expand(/tenders/i);
      expect(screen.getByText(/no tenders yet/i)).toBeInTheDocument();
    });

    it("can accept only pending tenders", async () => {
      const { onAcceptTender } = renderTenders({ isOwner: true, tenders: [pending, accepted] });
      await expand(/tenders/i);

      const acceptButtons = screen.getAllByRole("button", { name: /accept tender/i });
      expect(acceptButtons).toHaveLength(1);
      await userEvent.click(acceptButtons[0]);
      expect(onAcceptTender).toHaveBeenCalledWith("t1");
    });

    it("never sees a tender form", async () => {
      renderTenders({ isOwner: true });
      await expand(/tenders/i);
      expect(screen.queryByTestId("tender-form")).not.toBeInTheDocument();
    });
  });

  describe("trader", () => {
    it("labels the section as their own quote", () => {
      renderTenders({ isTrader: true });
      expect(screen.getByRole("button", { name: /your quote/i })).toBeInTheDocument();
    });

    it("submits only the amount and message (the app adds identity and profile)", async () => {
      const { onAddTender } = renderTenders({ isTrader: true, canTender: true });
      await expand(/your quote/i);

      await userEvent.type(screen.getByLabelText(/quote amount/i), "150");
      await userEvent.type(screen.getByLabelText(/message/i), "  Same day  ");
      await userEvent.click(screen.getByRole("button", { name: /tender a quote/i }));

      expect(onAddTender).toHaveBeenCalledWith({ issueId: "i1", amount: 150, message: "Same day" });
    });

    it("rejects a zero amount", async () => {
      const { onAddTender } = renderTenders({ isTrader: true, canTender: true });
      await expand(/your quote/i);

      await userEvent.type(screen.getByLabelText(/quote amount/i), "0");
      await userEvent.type(screen.getByLabelText(/message/i), "Hi");
      await userEvent.click(screen.getByRole("button", { name: /tender a quote/i }));

      expect(screen.getByRole("alert")).toHaveTextContent(/valid quote amount/i);
      expect(onAddTender).not.toHaveBeenCalled();
    });

    it("shows why tendering is blocked instead of the form", async () => {
      renderTenders({
        isTrader: true,
        canTender: false,
        blockedReason: "This property is outside your service areas.",
      });
      await expand(/your quote/i);
      expect(screen.queryByTestId("tender-form")).not.toBeInTheDocument();
      expect(screen.getByText(/outside your service areas/i)).toBeInTheDocument();
    });

    it("sees their own tender but no Accept button", async () => {
      renderTenders({ isTrader: true, tenders: [pending], blockedReason: "already" });
      await expand(/your quote/i);
      expect(screen.getByText("$180")).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /accept tender/i })).not.toBeInTheDocument();
    });
  });
});
