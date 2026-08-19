import type { StoredUser } from "../types/auth";

// Seed test accounts so login can be exercised without registering first.
// All three share the password "password123" (see README). Salt/hash were
// precomputed with src/utils/passwordHash.ts's exact algorithm so they
// validate correctly through the real login() check.
export const seedUsers: StoredUser[] = [
  {
    id: "user-seed-1",
    email: "usera@abc.com",
    role: "user",
    salt: "982d807a9f352b0fd3ee7f26e2f54c52",
    passwordHash: "f9b0f2217bf6433d92f4ee1a2d3d9dec5a406c6d7c8183c6627c001bef1b890e",
    createdAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "user-seed-2",
    email: "landlorda@abc.com",
    role: "landlord",
    salt: "8986554dfa585f2f0b533f7b3afdf97b",
    passwordHash: "f547e001e3d8bf79fa28ee960ebf1d61c5d81fcd5ce09c53f9d42ea20809392f",
    createdAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "user-seed-3",
    email: "tradea@abc.com",
    role: "tradesperson",
    salt: "a92be49f04f5a08aa3938d7682f5430e",
    passwordHash: "01692bb21dca2dd19ce9d22c16efd44c01ce7e25e0963583b09dab88eea2eb49",
    createdAt: "2026-01-01T00:00:00.000Z",
  },
];
