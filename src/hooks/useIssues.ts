import { useCallback, useMemo, useState } from "react";
import { seedIssues } from "../data/issues";
import type { Issue, IssueStatus, NewIssueInput } from "../types/issue";

const ADDED_ISSUES_KEY = "bridge:added-issues";
const STATUS_OVERRIDES_KEY = "bridge:issue-status-overrides";

let issueSequence = 0;
function generateIssueId(): string {
  issueSequence += 1;
  return `issue-${issueSequence}`;
}

function readAddedIssues(): Issue[] {
  try {
    const raw = localStorage.getItem(ADDED_ISSUES_KEY);
    return raw ? (JSON.parse(raw) as Issue[]) : [];
  } catch {
    return [];
  }
}

function writeAddedIssues(issues: Issue[]) {
  try {
    localStorage.setItem(ADDED_ISSUES_KEY, JSON.stringify(issues));
  } catch {
    // localStorage unavailable (e.g. private mode) - additions just won't persist.
  }
}

function readStatusOverrides(): Record<string, IssueStatus> {
  try {
    const raw = localStorage.getItem(STATUS_OVERRIDES_KEY);
    return raw ? (JSON.parse(raw) as Record<string, IssueStatus>) : {};
  } catch {
    return {};
  }
}

function writeStatusOverrides(overrides: Record<string, IssueStatus>) {
  try {
    localStorage.setItem(STATUS_OVERRIDES_KEY, JSON.stringify(overrides));
  } catch {
    // localStorage unavailable - status changes just won't persist.
  }
}

export function useIssues() {
  const [addedIssues, setAddedIssues] = useState<Issue[]>(() => readAddedIssues());
  const [statusOverrides, setStatusOverrides] = useState<Record<string, IssueStatus>>(() =>
    readStatusOverrides(),
  );

  const addIssue = useCallback((input: NewIssueInput) => {
    const issue: Issue = {
      id: generateIssueId(),
      propertyId: input.propertyId,
      title: input.title,
      description: input.description,
      status: "open",
      createdAt: new Date().toISOString(),
    };
    setAddedIssues((prev) => {
      const next = [...prev, issue];
      writeAddedIssues(next);
      return next;
    });
  }, []);

  const clearAddedIssues = useCallback(() => {
    setAddedIssues([]);
    writeAddedIssues([]);
  }, []);

  const updateIssueStatus = useCallback((issueId: string, status: IssueStatus) => {
    setStatusOverrides((prev) => {
      const next = { ...prev, [issueId]: status };
      writeStatusOverrides(next);
      return next;
    });
  }, []);

  const issues = useMemo(
    () =>
      [...seedIssues, ...addedIssues].map((issue) =>
        statusOverrides[issue.id] ? { ...issue, status: statusOverrides[issue.id] } : issue,
      ),
    [addedIssues, statusOverrides],
  );

  return { issues, addIssue, clearAddedIssues, updateIssueStatus };
}
