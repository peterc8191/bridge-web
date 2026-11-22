import { describe, expect, it, vi } from "vitest";
import {
  AUTH_USERS_KEY,
  SESSION_KEY,
  STORAGE_ERROR_EVENT,
  migrateStorage,
  newId,
  readJSON,
  storageKey,
  writeJSON,
} from "./storage";

describe("storage", () => {
  it("namespaces keys by storage version", () => {
    expect(storageKey("issues")).toBe("bridge:v2:issues");
  });

  it("round-trips JSON and falls back on missing or corrupt values", () => {
    writeJSON("k", { a: 1 });
    expect(readJSON("k", null)).toEqual({ a: 1 });
    expect(readJSON("missing", "fallback")).toBe("fallback");
    localStorage.setItem("bad", "{not json");
    expect(readJSON("bad", "fallback")).toBe("fallback");
  });

  it("newId is unique and prefixed", () => {
    const ids = new Set(Array.from({ length: 100 }, () => newId("issue")));
    expect(ids.size).toBe(100);
    expect([...ids][0]).toMatch(/^issue-[0-9a-f-]{36}$/);
  });

  it("reports a failed write (e.g. quota exceeded) via return value and a window event", () => {
    const listener = vi.fn();
    window.addEventListener(STORAGE_ERROR_EVENT, listener);
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const setItem = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("full", "QuotaExceededError");
    });

    expect(writeJSON("k", 1)).toBe(false);
    expect(listener).toHaveBeenCalledTimes(1);

    setItem.mockRestore();
    warn.mockRestore();
    window.removeEventListener(STORAGE_ERROR_EVENT, listener);
  });

  describe("migrateStorage", () => {
    it("drops v1 data keys but keeps accounts, session, and appearance", () => {
      localStorage.setItem("bridge:added-issues", "[]");
      localStorage.setItem("bridge:saved-property-ids", "[]");
      localStorage.setItem(SESSION_KEY, JSON.stringify("user-abc"));
      localStorage.setItem("bridge:reduce-motion", "true");

      migrateStorage();

      expect(localStorage.getItem("bridge:added-issues")).toBeNull();
      expect(localStorage.getItem("bridge:saved-property-ids")).toBeNull();
      expect(localStorage.getItem(SESSION_KEY)).not.toBeNull();
      expect(localStorage.getItem("bridge:reduce-motion")).toBe("true");
    });

    it("converts a v1 bare-string theme to JSON", () => {
      localStorage.setItem("bridge:theme", "dark");
      migrateStorage();
      expect(readJSON("bridge:theme", "system")).toBe("dark");
    });

    it("re-keys v1 counter ids that could collide, and clears the session", () => {
      writeJSON(AUTH_USERS_KEY, [
        { id: "user-1", email: "a@x.com" },
        { id: "user-1", email: "b@x.com" },
      ]);
      writeJSON(SESSION_KEY, "user-1");

      migrateStorage();

      const users = readJSON<{ id: string }[]>(AUTH_USERS_KEY, []);
      expect(users[0].id).not.toBe(users[1].id);
      expect(users.every((user) => user.id !== "user-1")).toBe(true);
      expect(localStorage.getItem(SESSION_KEY)).toBeNull();
    });

    it("leaves already-unique accounts and the session alone", () => {
      writeJSON(AUTH_USERS_KEY, [{ id: "user-6f1c0f3e-1111-4a4a-9b9b-000000000000", email: "a@x.com" }]);
      writeJSON(SESSION_KEY, "user-6f1c0f3e-1111-4a4a-9b9b-000000000000");
      migrateStorage();
      expect(readJSON(SESSION_KEY, null)).toBe("user-6f1c0f3e-1111-4a4a-9b9b-000000000000");
    });
  });
});
