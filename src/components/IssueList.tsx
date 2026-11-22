import type { Issue, IssueStatus } from "../types/issue";
import type { Property } from "../types/property";
import type { AuthUser } from "../types/auth";
import type { NewTenderInput, Tender } from "../types/tender";
import type { TraderProfile } from "../types/traderProfile";
import { canTenderOn, canUpdateIssue, servesArea } from "../lib/permissions";
import { StatusBadge } from "./StatusBadge";
import { IssueTenders } from "./IssueTenders";
import "./IssueList.css";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

const STATUS_OPTIONS: { value: IssueStatus; label: string }[] = [
  { value: "open", label: "Open" },
  { value: "in-progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
];

interface IssueListProps {
  issues: Issue[];
  propertyById: Map<string, Property>;
  currentUser: AuthUser | null;
  onUpdateStatus: (issueId: string, status: IssueStatus) => void;
  /** Tenders the current user may see (owner: all on their issues; trader: their own). */
  tenders: Tender[];
  traderProfile: TraderProfile;
  onAddTender: (input: NewTenderInput) => void;
  onAcceptTender: (tenderId: string) => void;
}

function tenderBlockedReason(
  issue: Issue,
  property: Property | undefined,
  profile: TraderProfile,
  myTender: Tender | undefined,
): string {
  if (myTender) return "You've already tendered a quote on this issue.";
  if (issue.status === "resolved") return "This issue has been resolved.";
  if (!servesArea(profile, property)) return "This property is outside your service areas.";
  return "";
}

export function IssueList({
  issues,
  propertyById,
  currentUser,
  onUpdateStatus,
  tenders,
  traderProfile,
  onAddTender,
  onAcceptTender,
}: IssueListProps) {
  if (issues.length === 0) {
    return (
      <div className="issue-list issue-list--empty" data-testid="issue-list-empty">
        <p>No issues to show.</p>
      </div>
    );
  }

  const sortedIssues = [...issues].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return (
    <ul className="issue-list" data-testid="issue-list">
      {sortedIssues.map((issue) => {
        const property = propertyById.get(issue.propertyId);
        const isOwner = canUpdateIssue(currentUser, issue, propertyById);
        const isTrader = currentUser?.role === "tradesperson";
        const issueTenders = tenders.filter((tender) => tender.issueId === issue.id);
        const myTender = issueTenders.find((tender) => tender.traderId === currentUser?.id);
        const canTender = canTenderOn(currentUser, issue, propertyById, traderProfile, tenders);

        return (
          <li key={issue.id} className="issue-list__item">
            <div className="issue-list__header">
              <h3>{issue.title}</h3>
              {isOwner ? (
                <label className="issue-list__status-select">
                  <span className="issue-list__status-select-label">Status for {issue.title}</span>
                  <select
                    value={issue.status}
                    onChange={(event) => onUpdateStatus(issue.id, event.target.value as IssueStatus)}
                  >
                    {STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              ) : (
                <StatusBadge status={issue.status} />
              )}
            </div>
            <p className="issue-list__property">
              {property ? `${property.address}, ${property.city}` : "Unknown property"}
            </p>
            <p className="issue-list__description">{issue.description}</p>
            <p className="issue-list__date">
              Reported {dateFormatter.format(new Date(issue.createdAt))}
              {issue.reporterId !== currentUser?.id && ` by ${issue.reporterEmail}`}
            </p>
            {(isOwner || isTrader) && (
              <IssueTenders
                issueId={issue.id}
                tenders={issueTenders}
                isOwner={isOwner}
                isTrader={isTrader}
                canTender={canTender}
                blockedReason={
                  isTrader && !canTender
                    ? tenderBlockedReason(issue, property, traderProfile, myTender)
                    : ""
                }
                onAddTender={onAddTender}
                onAcceptTender={onAcceptTender}
              />
            )}
          </li>
        );
      })}
    </ul>
  );
}
