import process from "node:process";

import type { User } from "@supabase/supabase-js";

import type { InviteTokenRecord } from "@/lib/invite-tokens";
import {
  getSupabaseAdminClient,
  SupabaseAdminConfigError,
} from "@/lib/server/supabase-admin";

const USER_ACCESSES_TABLE = "user_accesses";
const DEFAULT_ADMIN_EMAIL = "sempehugo03@gmail.com";

export type UserAccessRole = "admin" | "manager" | "agent" | "seller";

export type UserAccessRecord = {
  id: string;
  email: string;
  role: UserAccessRole;
  agencyId?: string;
  agencySlug?: string;
  teamMemberId?: string;
  propertyId?: string;
  sellerToken?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type InviteAuthUserResult = {
  userId: string;
  email: string;
  created: boolean;
};

export type UserAccessServerErrorCode =
  | "missing_supabase_url"
  | "missing_service_role_key"
  | "missing_user_accesses_table"
  | "supabase_permission_error"
  | "auth_creation_failed"
  | "account_exists"
  | "supabase_unknown_error";

const userAccessServerErrorMessages: Record<UserAccessServerErrorCode, string> =
  {
    missing_supabase_url: "NEXT_PUBLIC_SUPABASE_URL manquante côté serveur.",
    missing_service_role_key:
      "SUPABASE_SERVICE_ROLE_KEY manquante côté serveur.",
    missing_user_accesses_table:
      "Table user_accesses absente. Exécutez la migration Supabase.",
    supabase_permission_error:
      "Erreur de permission Supabase. Vérifiez SUPABASE_SERVICE_ROLE_KEY.",
    auth_creation_failed:
      "Impossible de créer le compte utilisateur pour le moment.",
    account_exists:
      "Un compte existe déjà pour cet email. Connectez-vous depuis Mon suivi.",
    supabase_unknown_error: "Erreur Supabase inconnue.",
  };

export class UserAccessServerError extends Error {
  code: UserAccessServerErrorCode;
  cause?: unknown;

  constructor(
    code: UserAccessServerErrorCode,
    message = userAccessServerErrorMessages[code],
    cause?: unknown,
  ) {
    super(message);
    this.name = "UserAccessServerError";
    this.code = code;
    this.cause = cause;
  }
}

type UserAccessRow = {
  id: string;
  email: string;
  role: string;
  agency_id: string | null;
  agency_slug: string | null;
  team_member_id: string | null;
  property_id: string | null;
  seller_token: string | null;
  is_active: boolean | null;
  created_at: string | null;
  updated_at: string | null;
};

export async function createOrUpdateInviteAuthUser(
  record: InviteTokenRecord,
  password: string,
): Promise<InviteAuthUserResult> {
  const supabase = getUserAccessSupabase();
  const email = normalizeEmail(record.email);
  const metadata = getInviteUserMetadata(record);

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: metadata,
  });

  if (!error && data.user?.id) {
    return {
      userId: data.user.id,
      email,
      created: true,
    };
  }

  if (!isAuthUserAlreadyExistsError(error)) {
    throw authUserError(error);
  }

  const existingUser = await findAuthUserByEmail(email);
  if (!existingUser?.id) {
    throw new UserAccessServerError(
      "account_exists",
      userAccessServerErrorMessages.account_exists,
      error,
    );
  }

  const { data: updatedData, error: updateError } =
    await supabase.auth.admin.updateUserById(existingUser.id, {
      password,
      email_confirm: true,
      user_metadata: {
        ...(existingUser.user_metadata ?? {}),
        ...metadata,
      },
    });

  if (updateError) throw authUserError(updateError);

  return {
    userId: updatedData.user?.id ?? existingUser.id,
    email,
    created: false,
  };
}

export async function upsertUserAccessFromInvite(
  record: InviteTokenRecord,
): Promise<UserAccessRecord> {
  const supabase = getUserAccessSupabase();
  const now = new Date().toISOString();
  const row = toUserAccessRow({
    id: record.id,
    email: normalizeEmail(record.email),
    role: getUserAccessRoleFromInvite(record),
    agencyId: record.agencyId,
    agencySlug: record.agencySlug,
    teamMemberId: record.teamMemberId,
    propertyId: record.propertyId,
    sellerToken: record.sellerToken,
    isActive: true,
    createdAt: record.createdAt || now,
    updatedAt: now,
  });

  const existingAccess = await findMatchingUserAccess(record);

  if (existingAccess) {
    const { data, error } = await supabase
      .from(USER_ACCESSES_TABLE)
      .update({
        email: row.email,
        role: row.role,
        agency_id: row.agency_id,
        agency_slug: row.agency_slug,
        team_member_id: row.team_member_id,
        property_id: row.property_id,
        seller_token: row.seller_token,
        is_active: true,
        updated_at: now,
      })
      .eq("id", existingAccess.id)
      .select("*")
      .single();

    if (error) throw userAccessErrorFromSupabase(error);
    return fromUserAccessRow(data as UserAccessRow);
  }

  const { data, error } = await supabase
    .from(USER_ACCESSES_TABLE)
    .insert(row)
    .select("*")
    .single();

  if (error) throw userAccessErrorFromSupabase(error);
  return fromUserAccessRow(data as UserAccessRow);
}

export async function getActiveUserAccessForEmail(email: string) {
  const supabase = getUserAccessSupabase();
  const { data, error } = await supabase
    .from(USER_ACCESSES_TABLE)
    .select("*")
    .eq("email", normalizeEmail(email))
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) throw userAccessErrorFromSupabase(error);

  const rows = (data ?? []) as UserAccessRow[];
  const access = rows
    .map(fromUserAccessRow)
    .find((item) => Boolean(getUserAccessDestination(item)));

  return access ?? null;
}

export function getConfiguredAdminAccess(email: string) {
  if (!isConfiguredAdminEmail(email)) return null;
  const now = new Date().toISOString();
  return {
    id: `admin-${normalizeEmail(email)}`,
    email: normalizeEmail(email),
    role: "admin",
    isActive: true,
    createdAt: now,
    updatedAt: now,
  } satisfies UserAccessRecord;
}

export function getUserAccessDestination(access: UserAccessRecord) {
  if (access.role === "admin") return "/admin";

  if (
    (access.role === "manager" || access.role === "agent") &&
    access.agencySlug
  ) {
    return `/agence/${encodePathSegment(access.agencySlug)}`;
  }

  if (access.role === "seller" && access.agencySlug && access.sellerToken) {
    return `/agence/${encodePathSegment(access.agencySlug)}/vendeur/${encodePathSegment(access.sellerToken)}`;
  }

  return "";
}

export function userAccessApiError(error: unknown) {
  const typedError =
    error instanceof UserAccessServerError
      ? error
      : error instanceof SupabaseAdminConfigError
        ? new UserAccessServerError(error.code, error.message, error)
        : new UserAccessServerError(
            "supabase_unknown_error",
            getReadableErrorMessage(error),
            error,
          );

  return {
    code: typedError.code,
    message: typedError.message,
    status: getUserAccessErrorHttpStatus(typedError.code),
  };
}

function getUserAccessRoleFromInvite(
  record: InviteTokenRecord,
): UserAccessRole {
  if (record.type === "manager_invite") return "manager";
  if (record.type === "agent_invite") return "agent";
  return "seller";
}

async function findMatchingUserAccess(record: InviteTokenRecord) {
  const supabase = getUserAccessSupabase();
  const role = getUserAccessRoleFromInvite(record);
  const { data, error } = await supabase
    .from(USER_ACCESSES_TABLE)
    .select("*")
    .eq("email", normalizeEmail(record.email))
    .eq("role", role)
    .eq("agency_id", record.agencyId);

  if (error) throw userAccessErrorFromSupabase(error);

  return (
    ((data ?? []) as UserAccessRow[]).map(fromUserAccessRow).find((access) => {
      if (record.teamMemberId && access.teamMemberId !== record.teamMemberId) {
        return false;
      }

      if (record.propertyId && access.propertyId !== record.propertyId) {
        return false;
      }

      if (record.sellerToken && access.sellerToken !== record.sellerToken) {
        return false;
      }

      return true;
    }) ?? null
  );
}

async function findAuthUserByEmail(email: string) {
  const supabase = getUserAccessSupabase();
  const normalizedEmail = normalizeEmail(email);
  const perPage = 1000;

  for (let page = 1; page <= 20; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage,
    });

    if (error) throw authUserError(error);

    const match = data.users.find(
      (user: User) => normalizeEmail(user.email ?? "") === normalizedEmail,
    );

    if (match) return match;
    if (data.users.length < perPage) return null;
  }

  return null;
}

function getInviteUserMetadata(record: InviteTokenRecord) {
  return {
    role: getAuthMetadataRoleFromInvite(record),
    access_role: getUserAccessRoleFromInvite(record),
    agency_id: record.agencyId,
    agency_slug: record.agencySlug,
    team_member_id: record.teamMemberId,
    property_id: record.propertyId,
    seller_token: record.sellerToken,
  };
}

function getAuthMetadataRoleFromInvite(record: InviteTokenRecord) {
  if (record.type === "manager_invite") return "agency_admin";
  if (record.type === "agent_invite") return "agent";
  return "seller";
}

function getUserAccessSupabase() {
  try {
    return getSupabaseAdminClient();
  } catch (error) {
    if (error instanceof SupabaseAdminConfigError) {
      throw new UserAccessServerError(error.code, error.message, error);
    }

    throw error;
  }
}

function getUserAccessErrorHttpStatus(code: UserAccessServerErrorCode) {
  if (code === "missing_service_role_key" || code === "missing_supabase_url") {
    return 503;
  }

  if (code === "missing_user_accesses_table") return 503;
  if (code === "supabase_permission_error") return 403;
  if (code === "account_exists") return 409;
  return 503;
}

function userAccessErrorFromSupabase(error: unknown) {
  if (isMissingUserAccessesTableError(error)) {
    return new UserAccessServerError(
      "missing_user_accesses_table",
      userAccessServerErrorMessages.missing_user_accesses_table,
      error,
    );
  }

  if (isSupabasePermissionError(error)) {
    return new UserAccessServerError(
      "supabase_permission_error",
      userAccessServerErrorMessages.supabase_permission_error,
      error,
    );
  }

  return new UserAccessServerError(
    "supabase_unknown_error",
    getReadableErrorMessage(error),
    error,
  );
}

function authUserError(error: unknown) {
  if (isSupabasePermissionError(error)) {
    return new UserAccessServerError(
      "supabase_permission_error",
      userAccessServerErrorMessages.supabase_permission_error,
      error,
    );
  }

  return new UserAccessServerError(
    "auth_creation_failed",
    getReadableErrorMessage(error) ||
      userAccessServerErrorMessages.auth_creation_failed,
    error,
  );
}

function isMissingUserAccessesTableError(error: unknown) {
  const details = getSupabaseErrorDetails(error);

  return (
    details.includes("42p01") ||
    details.includes("pgrst205") ||
    (details.includes("user_accesses") &&
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

function isAuthUserAlreadyExistsError(error: unknown) {
  const details = getSupabaseErrorDetails(error);
  return (
    details.includes("already") ||
    details.includes("registered") ||
    details.includes("exists") ||
    details.includes("duplicate")
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
  return message || userAccessServerErrorMessages.supabase_unknown_error;
}

function toUserAccessRow(record: UserAccessRecord): Omit<
  UserAccessRow,
  "id"
> & {
  id?: string;
} {
  return {
    id: record.id,
    email: normalizeEmail(record.email),
    role: record.role,
    agency_id: record.agencyId ?? null,
    agency_slug: record.agencySlug ?? null,
    team_member_id: record.teamMemberId ?? null,
    property_id: record.propertyId ?? null,
    seller_token: record.sellerToken ?? null,
    is_active: record.isActive,
    created_at: record.createdAt,
    updated_at: record.updatedAt,
  };
}

function fromUserAccessRow(row: UserAccessRow): UserAccessRecord {
  return {
    id: row.id,
    email: normalizeEmail(row.email),
    role: isUserAccessRole(row.role) ? row.role : "seller",
    agencyId: row.agency_id ?? undefined,
    agencySlug: row.agency_slug ?? undefined,
    teamMemberId: row.team_member_id ?? undefined,
    propertyId: row.property_id ?? undefined,
    sellerToken: row.seller_token ?? undefined,
    isActive: row.is_active ?? true,
    createdAt: row.created_at ?? new Date().toISOString(),
    updatedAt: row.updated_at ?? new Date().toISOString(),
  };
}

function isUserAccessRole(value: unknown): value is UserAccessRole {
  return (
    value === "admin" ||
    value === "manager" ||
    value === "agent" ||
    value === "seller"
  );
}

function isConfiguredAdminEmail(email: string) {
  const normalizedEmail = normalizeEmail(email);
  return readConfiguredAdminEmails().includes(normalizedEmail);
}

function readConfiguredAdminEmails() {
  return (
    process.env.ADMIN_EMAILS ||
    process.env.NEXT_PUBLIC_ADMIN_EMAILS ||
    process.env.ADMIN_EMAIL ||
    process.env.NEXT_PUBLIC_ADMIN_EMAIL ||
    DEFAULT_ADMIN_EMAIL
  )
    .split(",")
    .map(normalizeEmail)
    .filter(Boolean);
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function encodePathSegment(value: string) {
  return encodeURIComponent(value);
}

function readErrorField(error: unknown, field: string) {
  if (!isRecord(error)) return "";
  const value = error[field];
  return typeof value === "string" ? value : "";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
