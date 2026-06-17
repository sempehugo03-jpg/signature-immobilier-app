export const ADMIN_SESSION_KEY = "admin_access";
const DEFAULT_ADMIN_CODE = "signature-admin";

const LEGACY_ADMIN_SESSION_KEYS = [
  "admin_session",
  "admin_code",
  "admin_user",
  "owner_access",
  "owner_session",
  "signature_admin_access",
  "signature_admin_session",
  "signature_admin_flash",
  "signature_admin_code",
  "signature_admin_user",
  "signature_owner_access",
  "signature_owner_session",
];

export function isAdminSessionActive() {
  if (typeof window === "undefined") return false;
  try {
    return window.sessionStorage.getItem(ADMIN_SESSION_KEY) === "true";
  } catch {
    return false;
  }
}

export function saveAdminSession() {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(ADMIN_SESSION_KEY, "true");
  } catch {
    // If storage is unavailable, keep the page stable and let the login retry.
  }
}

export function getAdminCode() {
  const env = import.meta.env as Record<string, string | undefined>;
  return env.NEXT_PUBLIC_ADMIN_CODE?.trim() || DEFAULT_ADMIN_CODE;
}

export function isAdminCodeValid(code: string) {
  return code.trim() === getAdminCode();
}

export function clearAdminSession() {
  if (typeof window === "undefined") return;
  const keys = [ADMIN_SESSION_KEY, ...LEGACY_ADMIN_SESSION_KEYS];

  for (const key of keys) {
    try {
      window.sessionStorage.removeItem(key);
    } catch {
      // Ignore unavailable storage.
    }
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Ignore unavailable storage.
    }
  }
}
