import { randomBytes, randomUUID } from "node:crypto";

import { isValidEmail } from "@/lib/email-utils";
import { isInviteAccessType } from "@/lib/invite-email";
import {
  getEffectiveInviteStatus,
  type CreateInviteTokenInput,
  type InviteTokenRecord,
} from "@/lib/invite-tokens";
import {
  getSupabaseAdminClient,
  isSupabaseAdminConfigured,
  SupabaseAdminConfigError,
} from "@/lib/server/supabase-admin";

const INVITE_TOKENS_TABLE = "invite_tokens";

export type InviteTokenServerErrorCode =
  | "missing_supabase_url"
  | "missing_service_role_key"
  | "missing_invite_tokens_table"
  | "supabase_permission_error"
  | "supabase_unknown_error";

const inviteTokenServerErrorMessages: Record<
  InviteTokenServerErrorCode,
  string
> = {
  missing_supabase_url: "NEXT_PUBLIC_SUPABASE_URL manquante côté serveur.",
  missing_service_role_key: "SUPABASE_SERVICE_ROLE_KEY manquante côté serveur.",
  missing_invite_tokens_table:
    "Table invite_tokens absente. Exécutez la migration Supabase.",
  supabase_permission_error:
    "Erreur de permission Supabase. Vérifiez SUPABASE_SERVICE_ROLE_KEY.",
  supabase_unknown_error: "Erreur Supabase inconnue.",
};

export class InviteTokenServerError extends Error {
  code: InviteTokenServerErrorCode;
  cause?: unknown;

  constructor(
    code: InviteTokenServerErrorCode,
    message = inviteTokenServerErrorMessages[code],
    cause?: unknown,
  ) {
    super(message);
    this.name = "InviteTokenServerError";
    this.code = code;
    this.cause = cause;
  }
}

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

export function isSharedInviteStoreConfigured() {
  return isSupabaseAdminConfigured();
}

export async function createInviteToken(
  input: CreateInviteTokenInput,
): Promise<InviteTokenRecord> {
  const supabase = getInviteTokenSupabase();
  const now = new Date().toISOString();
  const record: InviteTokenRecord = {
    id: randomUUID(),
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

  if (error) throw inviteTokenErrorFromSupabase(error);
  return fromInviteTokenRow(data as InviteTokenRow);
}

export async function getInviteToken(token: string) {
  const supabase = getInviteTokenSupabase();
  const { data, error } = await supabase
    .from(INVITE_TOKENS_TABLE)
    .select("*")
    .eq("token", token)
    .maybeSingle();

  if (error) throw inviteTokenErrorFromSupabase(error);
  return data ? fromInviteTokenRow(data as InviteTokenRow) : null;
}

export async function markInviteTokenUsed(token: string) {
  const supabase = getInviteTokenSupabase();
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

  if (error) throw inviteTokenErrorFromSupabase(error);
  return fromInviteTokenRow(data as InviteTokenRow);
}

export async function getPendingInviteForEmail({
  email,
  agencyId,
  type,
}: Pick<CreateInviteTokenInput, "email" | "agencyId" | "type">) {
  const supabase = getInviteTokenSupabase();
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

  if (error) throw inviteTokenErrorFromSupabase(error);
  const record = data ? fromInviteTokenRow(data as InviteTokenRow) : null;
  return record && getEffectiveInviteStatus(record) === "pending"
    ? record
    : null;
}

export async function revokeInviteToken(token: string) {
  const supabase = getInviteTokenSupabase();
  const { data, error } = await supabase
    .from(INVITE_TOKENS_TABLE)
    .update({
      status: "revoked",
    })
    .eq("token", token)
    .select("*")
    .single();

  if (error) throw inviteTokenErrorFromSupabase(error);
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

export function inviteTokenApiError(error: unknown) {
  const typedError =
    error instanceof InviteTokenServerError
      ? error
      : new InviteTokenServerError(
          "supabase_unknown_error",
          getReadableErrorMessage(error),
          error,
        );

  return {
    code: typedError.code,
    message: typedError.message,
    status: getInviteTokenErrorHttpStatus(typedError.code),
  };
}

function getInviteTokenSupabase() {
  try {
    return getSupabaseAdminClient();
  } catch (error) {
    if (error instanceof SupabaseAdminConfigError) {
      throw new InviteTokenServerError(error.code, error.message, error);
    }

    throw error;
  }
}

function getInviteTokenErrorHttpStatus(code: InviteTokenServerErrorCode) {
  if (code === "missing_service_role_key" || code === "missing_supabase_url") {
    return 503;
  }

  if (code === "missing_invite_tokens_table") return 503;
  if (code === "supabase_permission_error") return 403;
  return 503;
}

function inviteTokenErrorFromSupabase(error: unknown) {
  if (isMissingInviteTokensTableError(error)) {
    return new InviteTokenServerError(
      "missing_invite_tokens_table",
      inviteTokenServerErrorMessages.missing_invite_tokens_table,
      error,
    );
  }

  if (isSupabasePermissionError(error)) {
    return new InviteTokenServerError(
      "supabase_permission_error",
      inviteTokenServerErrorMessages.supabase_permission_error,
      error,
    );
  }

  return new InviteTokenServerError(
    "supabase_unknown_error",
    getReadableErrorMessage(error),
    error,
  );
}

function isMissingInviteTokensTableError(error: unknown) {
  const details = getSupabaseErrorDetails(error);

  return (
    details.includes("42p01") ||
    details.includes("pgrst205") ||
    (details.includes("invite_tokens") &&
      (details.includes("does not exist") ||
        details.includes("schema cache") ||
        details.includes("relation")))
  );
}

function isSupabasePermissionError(error: unknown) {
  const details = getSupabaseErrorDetails(error);

  return (
    details.includes("42501") ||
    details.includes("permission denied") ||
    details.includes("row-level security") ||
    details.includes("rls") ||
    details.includes("jwt") ||
    details.includes("service_role")
  );
}

function getSupabaseErrorDetails(error: unknown) {
  return [
    readErrorField(error, "code"),
    readErrorField(error, "message"),
    readErrorField(error, "details"),
    readErrorField(error, "hint"),
  ]
    .join(" ")
    .toLowerCase();
}

function getReadableErrorMessage(error: unknown) {
  const message = readErrorField(error, "message");
  return message || inviteTokenServerErrorMessages.supabase_unknown_error;
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
  return randomBytes(32).toString("hex");
}

function readErrorField(error: unknown, field: string) {
  if (!isRecord(error)) return "";
  const value = error[field];
  return typeof value === "string" ? value : "";
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
