import { describe, expect, it } from "vitest";
import { generateSalt, hashPassword } from "./passwordHash";

describe("generateSalt", () => {
  it("produces different salts on each call", () => {
    expect(generateSalt()).not.toBe(generateSalt());
  });

  it("produces a hex string", () => {
    expect(generateSalt()).toMatch(/^[0-9a-f]+$/);
  });
});

describe("hashPassword", () => {
  it("is deterministic for the same password and salt", async () => {
    const hashA = await hashPassword("correct horse battery staple", "salt-1");
    const hashB = await hashPassword("correct horse battery staple", "salt-1");
    expect(hashA).toBe(hashB);
  });

  it("produces different hashes for different passwords with the same salt", async () => {
    const hashA = await hashPassword("password-one", "salt-1");
    const hashB = await hashPassword("password-two", "salt-1");
    expect(hashA).not.toBe(hashB);
  });

  it("produces different hashes for the same password with different salts", async () => {
    const hashA = await hashPassword("password-one", "salt-1");
    const hashB = await hashPassword("password-one", "salt-2");
    expect(hashA).not.toBe(hashB);
  });

  it("never returns the raw password", async () => {
    const password = "correct horse battery staple";
    const hash = await hashPassword(password, "salt-1");
    expect(hash).not.toContain(password);
  });
});
