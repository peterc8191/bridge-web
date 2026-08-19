import type { Issue, IssueStatus } from "../types/issue";
import type { Property } from "../types/property";
import type { AuthUser } from "../types/auth";
import type { NewTenderInput, Tender } from "../types/tender";
import type { TraderProfile } from "../types/traderProfile";
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
  properties: Property[];
  currentUser: AuthUser | null;
  onUpdateStatus: (issueId: string, status: IssueStatus) => void;
  tenders: Tender[];
  traderProfile: TraderProfile;
  onAddTender: (input: NewTenderInput) => void;
  onAcceptTender: (tenderId: string) => void;
}

export function IssueList({
  issues,
  properties,
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
        <p>No issues reported yet.</p>
      </div>
    );
  }

  const canUpdateStatus = currentUser?.role === "landlord";

  const sortedIssues = [...issues].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return (
    <ul className="issue-list" data-testid="issue-list">
      {sortedIssues.map((issue) => {
        const property = properties.find((candidate) => candidate.id === issue.propertyId);
        return (
          <li key={issue.id} className="issue-list__item">
            <div className="issue-list__header">
              <h3>{issue.title}</h3>
              {canUpdateStatus ? (
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
            <p className="issue-list__property">{property ? property.address : "Unknown property"}</p>
            <p className="issue-list__description">{issue.description}</p>
            <p className="issue-list__date">Reported {dateFormatter.format(new Date(issue.createdAt))}</p>
            <IssueTenders
              issueId={issue.id}
              tenders={tenders.filter((tender) => tender.issueId === issue.id)}
              currentUser={currentUser}
              traderProfile={traderProfile}
              onAddTender={onAddTender}
              onAcceptTender={onAcceptTender}
            />
          </li>
        );
      })}
    </ul>
  );
}
