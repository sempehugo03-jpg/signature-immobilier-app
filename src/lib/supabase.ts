import { createClient } from "@supabase/supabase-js";

export type UserRole = "owner" | "agency_admin" | "agent" | "seller";
export type ProfileStatus = "pending" | "active" | "disabled";

export type Profile = {
  id: string;
  email: string;
  role: UserRole;
  agency_id?: string | null;
  status?: ProfileStatus | string | null;
  full_name?: string | null;
  phone?: string | null;
  created_at?: string;
  updated_at?: string;
};

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  console.warn(
    "Supabase environment variables are missing. Authenticated Supabase actions are disabled until they are configured.",
  );
}

export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-anon-key",
);

export function isUserRole(value: unknown): value is UserRole {
  return (
    value === "owner" ||
    value === "agency_admin" ||
    value === "seller" ||
    value === "agent"
  );
}

export function normalizeUserRole(value: unknown): UserRole | null {
  if (isUserRole(value)) return value;
  if (value === "vendeur") return "seller";
  if (value === "agent_immobilier") return "agent";
  return null;
}

export function getRoleLabel(role: UserRole) {
  if (role === "owner") return "Owner";
  if (role === "agency_admin") return "Patron d’agence";
  if (role === "agent") return "Agent immobilier";
  return "Vendeur";
}

export function getDashboardPath(role: UserRole) {
  if (role === "owner") return "/admin";
  if (role === "agency_admin") return "/admin-agence";
  if (role === "agent") return "/agent";
  return "/vendeur";
}
