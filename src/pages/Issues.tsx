import type { Property } from "../types/property";
import type { Issue, NewIssueInput } from "../types/issue";
import { properties } from "../data/properties";
import { IssueForm } from "../components/IssueForm";
import { IssueList } from "../components/IssueList";
import "./Issues.css";

interface IssuesProps {
  saved: Property[];
  issues: Issue[];
  onAddIssue: (input: NewIssueInput) => void;
}

export function Issues({ saved, issues, onAddIssue }: IssuesProps) {
  return (
    <main className="issues-page">
      <IssueForm properties={saved} onSubmit={onAddIssue} />
      <IssueList issues={issues} properties={properties} />
    </main>
  );
}
