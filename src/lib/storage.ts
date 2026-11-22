// The single place the app touches browser storage. Every hook goes through
// these helpers, so swapping localStorage for the backend described in
// docs/architecture/0001-backend-for-existing-features.md means changing this
// module (and the hooks' read/write calls), not every component.

export const STORAGE_VERSION = 2;
const PREFIX = `bridge:v${STORAGE_VERSION}:`;

/** Namespaced storage key, e.g. storageKey("issues") -> "bridge:v2:issues". */
export function storageKey(name: string): string {
  return `${PREFIX}${name}`;
}

export function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw == null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

/** Returns false when the write failed (private mode, quota exceeded). */
export function writeJSON(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.warn(`Could not save "${key}" to localStorage`, error);
    window.dispatchEvent(new CustomEvent(STORAGE_ERROR_EVENT, { detail: { key } }));
    return false;
  }
}

/** Fired on window when a write fails, so the UI can tell the user. */
export const STORAGE_ERROR_EVENT = "bridge:storage-error";

export function removeKey(key: string) {
  try {
    localStorage.removeItem(key);
  } catch {
    // storage unavailable - nothing to remove
  }
}

/** Globally unique id - survives reloads, unlike a module-level counter. */
export function newId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`;
}

/**
 * Calls `onChange` when another tab writes `key`. (The browser only fires
 * `storage` events in *other* tabs, so this never echoes our own writes.)
 */
export function subscribeToKey(key: string, onChange: () => void): () => void {
  const handler = (event: StorageEvent) => {
    if (event.key === key || event.key === null) onChange();
  };
  window.addEventListener("storage", handler);
  return () => window.removeEventListener("storage", handler);
}

// Keys written by the pre-v2 app. Their records lack owner/reporter ids and
// may contain colliding counter-based ids, so they're dropped rather than
// migrated. Accounts, the session, and appearance settings are kept.
const LEGACY_KEYS = [
  "bridge:saved-property-ids",
  "bridge:decided-property-ids",
  "bridge:added-issues",
  "bridge:issue-status-overrides",
  "bridge:viewing-requests",
  "bridge:confirmed-viewing-ids",
  "bridge:added-tenders",
  "bridge:tender-status-overrides",
  "bridge:property-overrides",
  "bridge:deleted-property-ids",
];

export const AUTH_USERS_KEY = "bridge:auth-users";
export const SESSION_KEY = "bridge:auth-session";

/** One-time cleanup of v1 data. Safe to call on every startup. */
export function migrateStorage() {
  LEGACY_KEYS.forEach(removeKey);

  // v1 stored the theme as a bare string ("dark"); v2 stores JSON ("\"dark\"").
  try {
    const theme = localStorage.getItem("bridge:theme");
    if (theme === "light" || theme === "dark" || theme === "system") {
      writeJSON("bridge:theme", theme);
    }
  } catch {
    // storage unavailable
  }

  // v1 generated account ids from a per-page-load counter ("user-1", ...), so
  // two accounts registered in different sessions could share an id.
  const users = readJSON<{ id: string }[]>(AUTH_USERS_KEY, []);
  const seen = new Set<string>();
  let changed = false;
  for (const user of users) {
    if (/^user-\d+$/.test(user.id) || seen.has(user.id)) {
      user.id = newId("user");
      changed = true;
    }
    seen.add(user.id);
  }
  if (changed) {
    writeJSON(AUTH_USERS_KEY, users);
    removeKey(SESSION_KEY); // the session may point at a re-keyed id
  }
}
