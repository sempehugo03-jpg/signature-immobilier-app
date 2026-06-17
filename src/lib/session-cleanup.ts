import { clearAdminSession } from "@/lib/admin-session";
import { supabase } from "@/lib/supabase";

const SESSION_KEYS = [
  "signature_saas_current_access",
  "signature_saas_selected_access",
  "signature_current_access",
  "signature_selected_access",
  "signature_agency_session",
  "signature_agent_session",
  "signature_seller_session",
  "signature_vendor_session",
  "signature_mon_suivi_session",
  "signature_saas_session",
  "signature_saas_current_user",
];

export function clearAllLocalSessions() {
  if (typeof window === "undefined") return;
  clearAdminSession();

  for (const key of SESSION_KEYS) {
    removeStorageKey(window.sessionStorage, key);
    removeStorageKey(window.localStorage, key);
  }
}

export async function signOutEverywhere() {
  try {
    await supabase.auth.signOut();
  } catch (error) {
    console.warn("Deconnexion Supabase impossible", error);
  } finally {
    clearAllLocalSessions();
  }
}

function removeStorageKey(storage: Storage, key: string) {
  try {
    storage.removeItem(key);
  } catch {
    // Ignore unavailable storage.
  }
}
