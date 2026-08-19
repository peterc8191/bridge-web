// Client-only mock auth (no backend - see docs/architecture/0001-backend-for-existing-features.md).
// This hashes+salts so the raw password is never persisted, but it is NOT real
// account security: anyone with devtools access to this browser can read the
// hash/salt from localStorage. Do not treat this as production auth.

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export function generateSalt(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return toHex(bytes.buffer);
}

export async function hashPassword(password: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(`${salt}:${password}`));
  return toHex(digest);
}
