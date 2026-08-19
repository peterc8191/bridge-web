import { useCallback, useMemo, useState } from "react";
import { seedUsers } from "../data/authUsers";
import { generateSalt, hashPassword } from "../utils/passwordHash";
import type { AuthResult, AuthUser, StoredUser } from "../types/auth";

const ADDED_USERS_KEY = "bridge:auth-users";
const SESSION_KEY = "bridge:auth-session";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

function readAddedUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(ADDED_USERS_KEY);
    return raw ? (JSON.parse(raw) as StoredUser[]) : [];
  } catch {
    return [];
  }
}

function writeAddedUsers(users: StoredUser[]) {
  try {
    localStorage.setItem(ADDED_USERS_KEY, JSON.stringify(users));
  } catch {
    // localStorage unavailable (e.g. private mode) - accounts just won't persist.
  }
}

function readAllUsers(): StoredUser[] {
  return [...seedUsers, ...readAddedUsers()];
}

function readSessionUserId(): string | null {
  try {
    return localStorage.getItem(SESSION_KEY);
  } catch {
    return null;
  }
}

function writeSessionUserId(userId: string | null) {
  try {
    if (userId) localStorage.setItem(SESSION_KEY, userId);
    else localStorage.removeItem(SESSION_KEY);
  } catch {
    // localStorage unavailable - session just won't persist.
  }
}

let userSequence = 0;
function generateUserId(): string {
  userSequence += 1;
  return `user-${userSequence}`;
}

export function useAuth() {
  const [addedUsers, setAddedUsers] = useState<StoredUser[]>(() => readAddedUsers());
  const [sessionUserId, setSessionUserId] = useState<string | null>(() => readSessionUserId());

  const allUsers = useMemo(() => [...seedUsers, ...addedUsers], [addedUsers]);

  const currentUser: AuthUser | null = (() => {
    const match = allUsers.find((user) => user.id === sessionUserId);
    return match ? { id: match.id, email: match.email, role: match.role } : null;
  })();

  const register = useCallback(async (rawEmail: string, password: string): Promise<AuthResult> => {
    const email = rawEmail.trim().toLowerCase();
    if (!EMAIL_PATTERN.test(email)) {
      return { ok: false, error: "Enter a valid email address." };
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      return { ok: false, error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.` };
    }

    if (readAllUsers().some((user) => user.email === email)) {
      return { ok: false, error: "An account with this email already exists." };
    }

    const salt = generateSalt();
    const passwordHash = await hashPassword(password, salt);
    const newUser: StoredUser = {
      id: generateUserId(),
      email,
      role: "user",
      salt,
      passwordHash,
      createdAt: new Date().toISOString(),
    };

    const nextAddedUsers = [...readAddedUsers(), newUser];
    writeAddedUsers(nextAddedUsers);
    setAddedUsers(nextAddedUsers);
    writeSessionUserId(newUser.id);
    setSessionUserId(newUser.id);

    return { ok: true };
  }, []);

  const login = useCallback(async (rawEmail: string, password: string): Promise<AuthResult> => {
    const email = rawEmail.trim().toLowerCase();
    const existingAddedUsers = readAddedUsers();
    const match = [...seedUsers, ...existingAddedUsers].find((user) => user.email === email);

    if (!match || (await hashPassword(password, match.salt)) !== match.passwordHash) {
      return { ok: false, error: "Invalid email or password." };
    }

    setAddedUsers(existingAddedUsers);
    writeSessionUserId(match.id);
    setSessionUserId(match.id);

    return { ok: true };
  }, []);

  const logout = useCallback(() => {
    writeSessionUserId(null);
    setSessionUserId(null);
  }, []);

  return { currentUser, register, login, logout };
}
