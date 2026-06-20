import { clearAdminSession } from "@/lib/admin-session";
import { supabase } from "@/lib/supabase";

const LOCAL_SESSION_KEYS = [
  "signature_saas_current_access",
  "signature_current_access",
  "signature_current_user_access",
  "signature_selected_access",
  "signature_selected_user_access",
  "signature_mon_suivi_session",
  "signature_mon_suivi_access",
  "signature_agency_session",
  "signature_agency_access",
  "signature_agent_session",
  "signature_agent_access",
  "signature_manager_session",
  "signature_manager_access",
  "signature_seller_session",
  "signature_seller_access",
  "supabase.auth.token",
];

export function clearLocalAccessSessions() {
  if (typeof window === "undefined") return;

  clearAdminSession();
  clearStorage(window.sessionStorage);
  clearStorage(window.localStorage);
}

export async function signOutEverywhere() {
  try {
    await supabase.auth.signOut();
  } catch (error) {
    console.info("Supabase sign out skipped", error);
  } finally {
    clearLocalAccessSessions();
  }
}

export async function signOutToMonSuivi() {
  await signOutEverywhere();
  if (typeof window !== "undefined") {
    window.location.assign("/mon-suivi");
  }
}

function clearStorage(storage: Storage) {
  for (const key of LOCAL_SESSION_KEYS) {
    safeRemove(storage, key);
  }

  for (let index = storage.length - 1; index >= 0; index -= 1) {
    const key = storage.key(index);
    if (key && isSupabaseAuthKey(key)) {
      safeRemove(storage, key);
    }
  }
}

function safeRemove(storage: Storage, key: string) {
  try {
    storage.removeItem(key);
  } catch {
    // Keep logout stable when storage is unavailable.
  }
}

function isSupabaseAuthKey(key: string) {
  return (
    key === "supabase.auth.token" ||
    (key.startsWith("sb-") && key.includes("auth-token"))
  );
}
