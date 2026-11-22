import { useCallback } from "react";
import { seedIssues } from "../data/issues";
import { newId, storageKey } from "../lib/storage";
import type { AuthUser } from "../types/auth";
import type { Issue, IssueStatus, NewIssueInput } from "../types/issue";
import { useStoredState } from "./useStoredState";

export const ISSUES_KEY = storageKey("issues");

/** Raw issue store. Who may see or change what is decided in AppDataProvider. */
export function useIssues() {
  const [issues, setIssues] = useStoredState<Issue[]>(ISSUES_KEY, seedIssues);

  const addIssue = useCallback(
    (reporter: AuthUser, input: NewIssueInput) => {
      const issue: Issue = {
        id: newId("issue"),
        propertyId: input.propertyId,
        reporterId: reporter.id,
        reporterEmail: reporter.email,
        title: input.title,
        description: input.description,
        status: "open",
        createdAt: new Date().toISOString(),
      };
      setIssues((prev) => [...prev, issue]);
    },
    [setIssues],
  );

  const updateIssueStatus = useCallback(
    (issueId: string, status: IssueStatus) => {
      setIssues((prev) => prev.map((issue) => (issue.id === issueId ? { ...issue, status } : issue)));
    },
    [setIssues],
  );

  const deleteIssuesByReporter = useCallback(
    (reporterId: string) => {
      setIssues((prev) => prev.filter((issue) => issue.reporterId !== reporterId));
    },
    [setIssues],
  );

  return { issues, addIssue, updateIssueStatus, deleteIssuesByReporter };
}
