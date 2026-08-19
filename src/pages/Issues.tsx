import type { Property } from "../types/property";
import type { Issue, IssueStatus, NewIssueInput } from "../types/issue";
import type { AuthUser } from "../types/auth";
import type { NewTenderInput, Tender } from "../types/tender";
import type { TraderProfile } from "../types/traderProfile";
import { IssueForm } from "../components/IssueForm";
import { IssueList } from "../components/IssueList";
import "./Issues.css";

interface IssuesProps {
  saved: Property[];
  properties: Property[];
  issues: Issue[];
  onAddIssue: (input: NewIssueInput) => void;
  currentUser: AuthUser | null;
  onUpdateIssueStatus: (issueId: string, status: IssueStatus) => void;
  tenders: Tender[];
  traderProfile: TraderProfile;
  onAddTender: (input: NewTenderInput) => void;
  onAcceptTender: (tenderId: string) => void;
}

export function Issues({
  saved,
  properties,
  issues,
  onAddIssue,
  currentUser,
  onUpdateIssueStatus,
  tenders,
  traderProfile,
  onAddTender,
  onAcceptTender,
}: IssuesProps) {
  return (
    <main className="issues-page">
      <IssueForm properties={saved} onSubmit={onAddIssue} />
      <IssueList
        issues={issues}
        properties={properties}
        currentUser={currentUser}
        onUpdateStatus={onUpdateIssueStatus}
        tenders={tenders}
        traderProfile={traderProfile}
        onAddTender={onAddTender}
        onAcceptTender={onAcceptTender}
      />
    </main>
  );
}
