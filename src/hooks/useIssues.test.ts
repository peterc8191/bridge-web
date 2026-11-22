import { describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useIssues } from "./useIssues";
import { seedIssues } from "../data/issues";
import { otherUser, tenant } from "../test/fixtures";

const input = { propertyId: "p3", title: "Broken heater", description: "No heat since Monday." };

describe("useIssues", () => {
  it("starts with the seed issues", () => {
    const { result } = renderHook(() => useIssues());
    expect(result.current.issues).toEqual(seedIssues);
  });

  it("addIssue appends an open issue stamped with the reporter", () => {
    const { result } = renderHook(() => useIssues());
    act(() => result.current.addIssue(tenant, input));

    const added = result.current.issues.at(-1)!;
    expect(added).toMatchObject({
      ...input,
      status: "open",
      reporterId: tenant.id,
      reporterEmail: tenant.email,
    });
    expect(added.id).toMatch(/^issue-[0-9a-f-]{36}$/);
  });

  it("gives every issue a unique id, even across reloads", () => {
    const first = renderHook(() => useIssues());
    act(() => first.result.current.addIssue(tenant, input));
    first.unmount();

    // A fresh hook instance stands in for a page reload.
    const second = renderHook(() => useIssues());
    act(() => second.result.current.addIssue(tenant, input));

    const ids = second.result.current.issues.map((issue) => issue.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("persists added issues across hook instances", () => {
    const first = renderHook(() => useIssues());
    act(() => first.result.current.addIssue(tenant, input));
    first.unmount();

    const second = renderHook(() => useIssues());
    expect(second.result.current.issues).toHaveLength(seedIssues.length + 1);
  });

  it("updateIssueStatus changes one issue's status and persists it", () => {
    const first = renderHook(() => useIssues());
    act(() => first.result.current.updateIssueStatus("issue-seed-1", "resolved"));
    expect(first.result.current.issues.find((i) => i.id === "issue-seed-1")?.status).toBe("resolved");
    first.unmount();

    const second = renderHook(() => useIssues());
    expect(second.result.current.issues.find((i) => i.id === "issue-seed-1")?.status).toBe("resolved");
  });

  it("deleteIssuesByReporter removes only that reporter's issues", () => {
    const { result } = renderHook(() => useIssues());
    act(() => {
      result.current.addIssue(tenant, input);
      result.current.addIssue(otherUser, input);
    });

    act(() => result.current.deleteIssuesByReporter(tenant.id));

    expect(result.current.issues.some((issue) => issue.reporterId === tenant.id)).toBe(false);
    expect(result.current.issues.some((issue) => issue.reporterId === otherUser.id)).toBe(true);
  });
});
