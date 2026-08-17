import type { Issue } from "../types/issue";
import type { Property } from "../types/property";
import { StatusBadge } from "./StatusBadge";
import "./IssueList.css";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

interface IssueListProps {
  issues: Issue[];
  properties: Property[];
}

export function IssueList({ issues, properties }: IssueListProps) {
  if (issues.length === 0) {
    return (
      <div className="issue-list issue-list--empty" data-testid="issue-list-empty">
        <p>No issues reported yet.</p>
      </div>
    );
  }

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
              <StatusBadge status={issue.status} />
            </div>
            <p className="issue-list__property">{property ? property.address : "Unknown property"}</p>
            <p className="issue-list__description">{issue.description}</p>
            <p className="issue-list__date">Reported {dateFormatter.format(new Date(issue.createdAt))}</p>
          </li>
        );
      })}
    </ul>
  );
}
