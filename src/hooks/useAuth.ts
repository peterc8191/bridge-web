import { useCallback, useMemo } from "react";
import { seedUsers } from "../data/authUsers";
import { AUTH_USERS_KEY, SESSION_KEY, newId, readJSON } from "../lib/storage";
import { generateSalt, hashPassword } from "../utils/passwordHash";
import type { AuthResult, AuthUser, StoredUser } from "../types/auth";
import { useStoredState } from "./useStoredState";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;
const NO_USERS: StoredUser[] = [];

// Client-only accounts (see utils/passwordHash.ts for the security caveats).
// Login/logout in one tab is picked up live by other open tabs.
export function useAuth() {
  const [addedUsers, setAddedUsers] = useStoredState<StoredUser[]>(AUTH_USERS_KEY, NO_USERS);
  const [sessionUserId, setSessionUserId] = useStoredState<string | null>(SESSION_KEY, null);

  const currentUser: AuthUser | null = useMemo(() => {
    const match = [...seedUsers, ...addedUsers].find((user) => user.id === sessionUserId);
    return match ? { id: match.id, email: match.email, role: match.role } : null;
  }, [addedUsers, sessionUserId]);

  const register = useCallback(
    async (rawEmail: string, password: string): Promise<AuthResult> => {
      const email = rawEmail.trim().toLowerCase();
      if (!EMAIL_PATTERN.test(email)) {
        return { ok: false, error: "Enter a valid email address." };
      }
      if (password.length < MIN_PASSWORD_LENGTH) {
        return { ok: false, error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.` };
      }

      // Read fresh from storage so an account created in another tab counts.
      const existing = [...seedUsers, ...readJSON<StoredUser[]>(AUTH_USERS_KEY, [])];
      if (existing.some((user) => user.email === email)) {
        return { ok: false, error: "An account with this email already exists." };
      }

      const salt = generateSalt();
      const newUser: StoredUser = {
        id: newId("user"),
        email,
        role: "user",
        salt,
        passwordHash: await hashPassword(password, salt),
        createdAt: new Date().toISOString(),
      };

      setAddedUsers((prev) => [...prev, newUser]);
      setSessionUserId(newUser.id);
      return { ok: true };
    },
    [setAddedUsers, setSessionUserId],
  );

  const login = useCallback(
    async (rawEmail: string, password: string): Promise<AuthResult> => {
      const email = rawEmail.trim().toLowerCase();
      const users = [...seedUsers, ...readJSON<StoredUser[]>(AUTH_USERS_KEY, [])];
      const match = users.find((user) => user.email === email);

      if (!match || (await hashPassword(password, match.salt)) !== match.passwordHash) {
        return { ok: false, error: "Invalid email or password." };
      }

      setAddedUsers(readJSON<StoredUser[]>(AUTH_USERS_KEY, []));
      setSessionUserId(match.id);
      return { ok: true };
    },
    [setAddedUsers, setSessionUserId],
  );

  const logout = useCallback(() => setSessionUserId(null), [setSessionUserId]);

  return { currentUser, register, login, logout };
}
