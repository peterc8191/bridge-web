import { beforeEach, describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useAuth } from "./useAuth";
import { seedUsers } from "../data/authUsers";

describe("useAuth", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("starts logged out", () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.currentUser).toBeNull();
  });

  it("register creates an account and logs the user in", async () => {
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      const outcome = await result.current.register("New@Example.com", "password123");
      expect(outcome).toEqual({ ok: true });
    });

    expect(result.current.currentUser).toEqual({
      id: expect.any(String),
      email: "new@example.com",
      role: "user",
    });
  });

  it("rejects registration with an invalid email", async () => {
    const { result } = renderHook(() => useAuth());

    let outcome;
    await act(async () => {
      outcome = await result.current.register("not-an-email", "password123");
    });

    expect(outcome).toEqual({ ok: false, error: expect.stringMatching(/valid email/i) });
    expect(result.current.currentUser).toBeNull();
  });

  it("rejects registration with a short password", async () => {
    const { result } = renderHook(() => useAuth());

    let outcome;
    await act(async () => {
      outcome = await result.current.register("user@example.com", "short");
    });

    expect(outcome).toEqual({ ok: false, error: expect.stringMatching(/at least 8 characters/i) });
  });

  it("rejects registering an email that's already in use", async () => {
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.register("user@example.com", "password123");
    });
    await act(async () => {
      result.current.logout();
    });

    let outcome;
    await act(async () => {
      outcome = await result.current.register("user@example.com", "different-password");
    });

    expect(outcome).toEqual({ ok: false, error: expect.stringMatching(/already exists/i) });
  });

  it("logs in with the correct password", async () => {
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.register("user@example.com", "password123");
    });
    await act(async () => {
      result.current.logout();
    });

    let outcome;
    await act(async () => {
      outcome = await result.current.login("user@example.com", "password123");
    });

    expect(outcome).toEqual({ ok: true });
    expect(result.current.currentUser?.email).toBe("user@example.com");
  });

  it("rejects login with the wrong password", async () => {
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.register("user@example.com", "password123");
    });
    await act(async () => {
      result.current.logout();
    });

    let outcome;
    await act(async () => {
      outcome = await result.current.login("user@example.com", "wrong-password");
    });

    expect(outcome).toEqual({ ok: false, error: expect.stringMatching(/invalid email or password/i) });
    expect(result.current.currentUser).toBeNull();
  });

  it("rejects login for an email that was never registered", async () => {
    const { result } = renderHook(() => useAuth());

    let outcome;
    await act(async () => {
      outcome = await result.current.login("ghost@example.com", "password123");
    });

    expect(outcome).toEqual({ ok: false, error: expect.stringMatching(/invalid email or password/i) });
  });

  it("logout clears the session", async () => {
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.register("user@example.com", "password123");
    });
    expect(result.current.currentUser).not.toBeNull();

    act(() => {
      result.current.logout();
    });
    expect(result.current.currentUser).toBeNull();
  });

  it("persists the session across hook instances", async () => {
    const { result, unmount } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.register("user@example.com", "password123");
    });
    unmount();

    const { result: second } = renderHook(() => useAuth());
    expect(second.current.currentUser?.email).toBe("user@example.com");
  });

  it("persists accounts across hook instances so a fresh session can log in", async () => {
    const { result: first, unmount } = renderHook(() => useAuth());

    await act(async () => {
      await first.current.register("user@example.com", "password123");
    });
    unmount();

    const { result: second } = renderHook(() => useAuth());
    await act(async () => {
      second.current.logout();
    });

    const { result: third } = renderHook(() => useAuth());
    let outcome;
    await act(async () => {
      outcome = await third.current.login("user@example.com", "password123");
    });
    expect(outcome).toEqual({ ok: true });
  });

  describe("seed test accounts", () => {
    it.each(seedUsers.map((seed) => [seed.email, seed.role] as const))(
      "logs in to the seeded %s account (role: %s) with the shared test password",
      async (email, role) => {
        const { result } = renderHook(() => useAuth());

        let outcome;
        await act(async () => {
          outcome = await result.current.login(email, "password123");
        });

        expect(outcome).toEqual({ ok: true });
        expect(result.current.currentUser).toEqual({ id: expect.any(String), email, role });
      },
    );

    it("rejects a seed account login with the wrong password", async () => {
      const { result } = renderHook(() => useAuth());

      let outcome;
      await act(async () => {
        outcome = await result.current.login(seedUsers[0].email, "wrong-password");
      });

      expect(outcome).toEqual({ ok: false, error: expect.stringMatching(/invalid email or password/i) });
    });

    it("rejects registering with an email already used by a seed account", async () => {
      const { result } = renderHook(() => useAuth());

      let outcome;
      await act(async () => {
        outcome = await result.current.register(seedUsers[0].email, "password123");
      });

      expect(outcome).toEqual({ ok: false, error: expect.stringMatching(/already exists/i) });
    });

    it("matches a seed account's email case-insensitively", async () => {
      const { result } = renderHook(() => useAuth());

      let outcome;
      await act(async () => {
        outcome = await result.current.login(seedUsers[0].email.toUpperCase(), "password123");
      });

      expect(outcome).toEqual({ ok: true });
    });
  });
});
