import process from "node:process";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type SupabaseAdminConfigErrorCode =
  | "missing_supabase_url"
  | "missing_service_role_key";

const supabaseAdminConfigMessages: Record<
  SupabaseAdminConfigErrorCode,
  string
> = {
  missing_supabase_url: "NEXT_PUBLIC_SUPABASE_URL manquante côté serveur.",
  missing_service_role_key: "SUPABASE_SERVICE_ROLE_KEY manquante côté serveur.",
};

export class SupabaseAdminConfigError extends Error {
  code: SupabaseAdminConfigErrorCode;

  constructor(code: SupabaseAdminConfigErrorCode) {
    super(supabaseAdminConfigMessages[code]);
    this.name = "SupabaseAdminConfigError";
    this.code = code;
  }
}

let supabaseAdminClient: SupabaseClient | null = null;

export function isSupabaseAdminConfigured() {
  const config = readSupabaseAdminConfig();
  return Boolean(config.url && config.serviceRoleKey);
}

export function getSupabaseAdminClient() {
  const config = getSupabaseAdminConfig();

  if (!supabaseAdminClient) {
    supabaseAdminClient = createClient(config.url, config.serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  return supabaseAdminClient;
}

function getSupabaseAdminConfig() {
  const config = readSupabaseAdminConfig();

  if (!config.serviceRoleKey) {
    throw new SupabaseAdminConfigError("missing_service_role_key");
  }

  if (!config.url) {
    throw new SupabaseAdminConfigError("missing_supabase_url");
  }

  return config;
}

function readSupabaseAdminConfig() {
  return {
    url:
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      process.env.SUPABASE_URL ||
      process.env.VITE_SUPABASE_URL ||
      "",
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  };
}
