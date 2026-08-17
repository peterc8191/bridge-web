import { useCallback, useMemo, useState } from "react";
import { seedIssues } from "../data/issues";
import type { Issue, NewIssueInput } from "../types/issue";

const ADDED_ISSUES_KEY = "bridge:added-issues";

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

export function useIssues() {
  const [addedIssues, setAddedIssues] = useState<Issue[]>(() => readAddedIssues());

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

  const issues = useMemo(() => [...seedIssues, ...addedIssues], [addedIssues]);

  return { issues, addIssue, clearAddedIssues };
}
