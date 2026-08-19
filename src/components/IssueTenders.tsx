import { useState, type FormEvent } from "react";
import type { NewTenderInput, Tender } from "../types/tender";
import type { TraderProfile } from "../types/traderProfile";
import type { AuthUser } from "../types/auth";
import { TenderStatusBadge } from "./TenderStatusBadge";
import "./IssueTenders.css";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

interface IssueTendersProps {
  issueId: string;
  tenders: Tender[];
  currentUser: AuthUser | null;
  traderProfile: TraderProfile;
  onAddTender: (input: NewTenderInput) => void;
  onAcceptTender: (tenderId: string) => void;
}

export function IssueTenders({
  issueId,
  tenders,
  currentUser,
  traderProfile,
  onAddTender,
  onAcceptTender,
}: IssueTendersProps) {
  const [expanded, setExpanded] = useState(false);
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (currentUser?.role !== "landlord" && currentUser?.role !== "tradesperson") {
    return null;
  }

  const isLandlord = currentUser.role === "landlord";
  const isTrader = currentUser.role === "tradesperson";
  const myTender = isTrader ? tenders.find((tender) => tender.traderId === currentUser.id) : undefined;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    const amountNumber = Number(amount);
    if (!Number.isFinite(amountNumber) || amountNumber <= 0) {
      setError("Enter a valid quote amount.");
      return;
    }
    if (!message.trim()) {
      setError("Add a short message with your quote.");
      return;
    }

    onAddTender({
      issueId,
      traderId: currentUser.id,
      traderEmail: currentUser.email,
      traderServices: traderProfile.services,
      traderAreas: traderProfile.areas,
      amount: amountNumber,
      message: message.trim(),
    });
    setAmount("");
    setMessage("");
  };

  return (
    <div className="issue-tenders">
      <button
        type="button"
        className="issue-tenders__toggle"
        onClick={() => setExpanded((value) => !value)}
        aria-expanded={expanded}
      >
        <span>Tenders{tenders.length > 0 ? ` (${tenders.length})` : ""}</span>
        <span className="issue-tenders__chevron" aria-hidden="true">
          {expanded ? "▲" : "▼"}
        </span>
      </button>

      {expanded && (
        <div className="issue-tenders__panel">
          {tenders.length === 0 ? (
            <p className="issue-tenders__empty">No tenders yet.</p>
          ) : (
            <ul className="issue-tenders__list" data-testid="issue-tenders-list">
              {tenders.map((tender) => (
                <li key={tender.id} className="issue-tenders__item">
                  <div className="issue-tenders__item-header">
                    <span className="issue-tenders__amount">{currency.format(tender.amount)}</span>
                    <TenderStatusBadge status={tender.status} />
                  </div>
                  <p className="issue-tenders__trader">{tender.traderEmail}</p>
                  {tender.traderServices.length > 0 && (
                    <p className="issue-tenders__meta">Services: {tender.traderServices.join(", ")}</p>
                  )}
                  {tender.traderAreas.length > 0 && (
                    <p className="issue-tenders__meta">Areas: {tender.traderAreas.join(", ")}</p>
                  )}
                  <p className="issue-tenders__message">{tender.message}</p>
                  {isLandlord && tender.status === "pending" && (
                    <button
                      type="button"
                      className="issue-tenders__accept-btn"
                      onClick={() => onAcceptTender(tender.id)}
                    >
                      Accept tender
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}

          {isTrader &&
            (myTender ? (
              <p className="issue-tenders__own-note">You've already tendered a quote on this issue.</p>
            ) : (
              <form className="issue-tenders__form" onSubmit={handleSubmit} data-testid="tender-form">
                <label className="issue-tenders__field">
                  <span>Quote amount ($)</span>
                  <input
                    type="number"
                    min={0}
                    value={amount}
                    onChange={(event) => setAmount(event.target.value)}
                    required
                  />
                </label>
                <label className="issue-tenders__field">
                  <span>Message</span>
                  <textarea
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    rows={2}
                    required
                  />
                </label>
                {error && (
                  <p className="issue-tenders__error" role="alert">
                    {error}
                  </p>
                )}
                <button type="submit" className="issue-tenders__submit">
                  Tender a quote
                </button>
              </form>
            ))}
        </div>
      )}
    </div>
  );
}
