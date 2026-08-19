import { beforeEach, describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useIssues } from "./useIssues";
import { seedIssues } from "../data/issues";

describe("useIssues", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("starts with the seed issues", () => {
    const { result } = renderHook(() => useIssues());
    expect(result.current.issues).toHaveLength(seedIssues.length);
    expect(result.current.issues.map((i) => i.id)).toEqual(seedIssues.map((i) => i.id));
  });

  it("addIssue appends a new issue with status 'open'", () => {
    const { result } = renderHook(() => useIssues());

    act(() => {
      result.current.addIssue({
        propertyId: "p2",
        title: "Broken thermostat",
        description: "The thermostat doesn't respond to changes.",
      });
    });

    expect(result.current.issues).toHaveLength(seedIssues.length + 1);
    const added = result.current.issues.find((i) => i.title === "Broken thermostat");
    expect(added).toBeDefined();
    expect(added?.status).toBe("open");
    expect(added?.propertyId).toBe("p2");
    expect(added?.createdAt).toBeTruthy();
  });

  it("persists added issues across hook instances via localStorage", () => {
    const { result, unmount } = renderHook(() => useIssues());

    act(() => {
      result.current.addIssue({
        propertyId: "p3",
        title: "Noisy radiator",
        description: "Loud banging noise when the heat turns on.",
      });
    });
    unmount();

    const { result: second } = renderHook(() => useIssues());
    expect(second.current.issues.some((i) => i.title === "Noisy radiator")).toBe(true);
    expect(second.current.issues).toHaveLength(seedIssues.length + 1);
  });

  it("clearAddedIssues removes user-reported issues but keeps the seed issues", () => {
    const { result } = renderHook(() => useIssues());

    act(() => {
      result.current.addIssue({
        propertyId: "p2",
        title: "Broken thermostat",
        description: "The thermostat doesn't respond to changes.",
      });
    });
    expect(result.current.issues).toHaveLength(seedIssues.length + 1);

    act(() => {
      result.current.clearAddedIssues();
    });

    expect(result.current.issues).toHaveLength(seedIssues.length);
    expect(result.current.issues.map((i) => i.id)).toEqual(seedIssues.map((i) => i.id));
  });

  it("clearAddedIssues persists across hook instances", () => {
    const { result, unmount } = renderHook(() => useIssues());

    act(() => {
      result.current.addIssue({
        propertyId: "p2",
        title: "Broken thermostat",
        description: "The thermostat doesn't respond to changes.",
      });
    });
    act(() => {
      result.current.clearAddedIssues();
    });
    unmount();

    const { result: second } = renderHook(() => useIssues());
    expect(second.current.issues).toHaveLength(seedIssues.length);
  });

  describe("updateIssueStatus", () => {
    it("changes the status of a seed issue", () => {
      const { result } = renderHook(() => useIssues());
      const target = seedIssues[0];

      act(() => {
        result.current.updateIssueStatus(target.id, "resolved");
      });

      expect(result.current.issues.find((i) => i.id === target.id)?.status).toBe("resolved");
    });

    it("changes the status of a user-added issue", () => {
      const { result } = renderHook(() => useIssues());

      act(() => {
        result.current.addIssue({
          propertyId: "p2",
          title: "Broken thermostat",
          description: "The thermostat doesn't respond to changes.",
        });
      });
      const added = result.current.issues.find((i) => i.title === "Broken thermostat")!;

      act(() => {
        result.current.updateIssueStatus(added.id, "in-progress");
      });

      expect(result.current.issues.find((i) => i.id === added.id)?.status).toBe("in-progress");
    });

    it("persists a status change across hook instances", () => {
      const { result, unmount } = renderHook(() => useIssues());
      const target = seedIssues[0];

      act(() => {
        result.current.updateIssueStatus(target.id, "resolved");
      });
      unmount();

      const { result: second } = renderHook(() => useIssues());
      expect(second.current.issues.find((i) => i.id === target.id)?.status).toBe("resolved");
    });
  });
});
