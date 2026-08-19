export type UserRole = "user" | "landlord" | "tradesperson";

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
}

export interface StoredUser extends AuthUser {
  salt: string;
  passwordHash: string;
  createdAt: string;
}

export type AuthResult =
  | { ok: true }
  | { ok: false; error: string };
