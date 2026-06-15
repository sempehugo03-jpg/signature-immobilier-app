import process from "node:process";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { isValidEmail } from "@/lib/email-utils";
import {
  getEffectiveInviteStatus,
  type CreateInviteTokenInput,
  type InviteTokenRecord,
} from "@/lib/invite-tokens";
import { isInviteAccessType } from "@/lib/invite-email";

const INVITE_TOKENS_TABLE = "invite_tokens";

type InviteTokenRow = {
  id: string;
  token: string;
  type: string;
  agency_id: string;
  agency_slug: string;
  team_member_id: string | null;
  property_id: string | null;
  seller_token: string | null;
  email: string;
  status: string | null;
  created_at: string | null;
  used_at: string | null;
  expires_at: string | null;
};

let supabaseClient: SupabaseClient | null | undefined;

export function isSharedInviteStoreConfigured() {
  return Boolean(getSupabaseUrl() && getSupabaseKey());
}

export async function createInviteToken(
  input: CreateInviteTokenInput,
): Promise<InviteTokenRecord> {
  const supabase = getSharedInviteSupabase();
  const now = new Date().toISOString();
  const record: InviteTokenRecord = {
    id: randomUuid(),
    token: generateSecureToken(),
    type: input.type,
    agencyId: input.agencyId,
    agencySlug: input.agencySlug,
    teamMemberId: input.teamMemberId,
    propertyId: input.propertyId,
    sellerToken: input.sellerToken,
    email: input.email.trim().toLowerCase(),
    status: "pending",
    createdAt: now,
    expiresAt: input.expiresAt,
  };

  const { data, error } = await supabase
    .from(INVITE_TOKENS_TABLE)
    .insert(toInviteTokenRow(record))
    .select("*")
    .single();

  if (error) throw error;
  return fromInviteTokenRow(data as InviteTokenRow);
}

export async function getInviteToken(token: string) {
  const supabase = getSharedInviteSupabase();
  const { data, error } = await supabase
    .from(INVITE_TOKENS_TABLE)
    .select("*")
    .eq("token", token)
    .maybeSingle();

  if (error) throw error;
  return data ? fromInviteTokenRow(data as InviteTokenRow) : null;
}

export async function markInviteTokenUsed(token: string) {
  const supabase = getSharedInviteSupabase();
  const usedAt = new Date().toISOString();
  const { data, error } = await supabase
    .from(INVITE_TOKENS_TABLE)
    .update({
      status: "used",
      used_at: usedAt,
    })
    .eq("token", token)
    .select("*")
    .single();

  if (error) throw error;
  return fromInviteTokenRow(data as InviteTokenRow);
}

export async function getPendingInviteForEmail({
  email,
  agencyId,
  type,
}: Pick<CreateInviteTokenInput, "email" | "agencyId" | "type">) {
  const supabase = getSharedInviteSupabase();
  const { data, error } = await supabase
    .from(INVITE_TOKENS_TABLE)
    .select("*")
    .eq("email", email.trim().toLowerCase())
    .eq("agency_id", agencyId)
    .eq("type", type)
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  const record = data ? fromInviteTokenRow(data as InviteTokenRow) : null;
  return record && getEffectiveInviteStatus(record) === "pending"
    ? record
    : null;
}

export async function revokeInviteToken(token: string) {
  const supabase = getSharedInviteSupabase();
  const { data, error } = await supabase
    .from(INVITE_TOKENS_TABLE)
    .update({
      status: "revoked",
    })
    .eq("token", token)
    .select("*")
    .single();

  if (error) throw error;
  return fromInviteTokenRow(data as InviteTokenRow);
}

export function normalizeCreateInviteTokenInput(
  data: unknown,
): CreateInviteTokenInput | null {
  if (!isRecord(data)) return null;

  const type = data.type;
  const agencyId = stringValue(data.agencyId);
  const agencySlug = stringValue(data.agencySlug);
  const email = stringValue(data.email).toLowerCase();
  const teamMemberId = optionalString(data.teamMemberId);
  const propertyId = optionalString(data.propertyId);
  const sellerToken = optionalString(data.sellerToken);
  const expiresAt = optionalString(data.expiresAt);

  if (
    !isInviteAccessType(type) ||
    !agencyId ||
    !agencySlug ||
    !isValidEmail(email)
  ) {
    return null;
  }

  return {
    type,
    agencyId,
    agencySlug,
    email,
    teamMemberId,
    propertyId,
    sellerToken,
    expiresAt,
  };
}

function getSharedInviteSupabase() {
  if (!isSharedInviteStoreConfigured()) {
    throw new Error("SHARED_INVITE_STORE_NOT_CONFIGURED");
  }

  if (!supabaseClient) {
    supabaseClient = createClient(getSupabaseUrl(), getSupabaseKey(), {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  return supabaseClient;
}

function getSupabaseUrl() {
  return process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
}

function getSupabaseKey() {
  return (
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    ""
  );
}

function toInviteTokenRow(record: InviteTokenRecord) {
  return {
    id: record.id,
    token: record.token,
    type: record.type,
    agency_id: record.agencyId,
    agency_slug: record.agencySlug,
    team_member_id: record.teamMemberId ?? null,
    property_id: record.propertyId ?? null,
    seller_token: record.sellerToken ?? null,
    email: record.email,
    status: record.status,
    created_at: record.createdAt,
    used_at: record.usedAt ?? null,
    expires_at: record.expiresAt ?? null,
  };
}

function fromInviteTokenRow(row: InviteTokenRow): InviteTokenRecord {
  return {
    id: row.id,
    token: row.token,
    type: isInviteAccessType(row.type) ? row.type : "seller_invite",
    agencyId: row.agency_id,
    agencySlug: row.agency_slug,
    teamMemberId: row.team_member_id ?? undefined,
    propertyId: row.property_id ?? undefined,
    sellerToken: row.seller_token ?? undefined,
    email: row.email,
    status:
      row.status === "used" ||
      row.status === "expired" ||
      row.status === "revoked"
        ? row.status
        : "pending",
    createdAt: row.created_at ?? new Date().toISOString(),
    usedAt: row.used_at ?? undefined,
    expiresAt: row.expires_at ?? undefined,
  };
}

function generateSecureToken() {
  const cryptoApi = globalThis.crypto;
  if (cryptoApi && "getRandomValues" in cryptoApi) {
    const bytes = new Uint8Array(32);
    cryptoApi.getRandomValues(bytes);
    return Array.from(bytes)
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
  }

  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

function randomUuid() {
  if (globalThis.crypto && "randomUUID" in globalThis.crypto) {
    return globalThis.crypto.randomUUID();
  }

  return `invite-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function stringValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function optionalString(value: unknown) {
  const nextValue = stringValue(value);
  return nextValue || undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
