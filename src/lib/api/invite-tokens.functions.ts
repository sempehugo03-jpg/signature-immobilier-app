import { createServerFn } from "@tanstack/react-start";

import {
  buildInviteUrl,
  getEffectiveInviteStatus,
  getInviteDestination,
  type CreateInviteTokenInput,
  type InviteTokenRecord,
} from "@/lib/invite-tokens";

type ServerFnOptions<TPayload> = {
  data: TPayload;
};

export type CreateInviteTokenResponse =
  | {
      ok: true;
      persistedIn: "supabase";
      token: string;
      inviteUrl: string;
      record: InviteTokenRecord;
    }
  | {
      ok: false;
      persistedIn: "local";
      reason: string;
    };

export type ReadInviteTokenResponse =
  | {
      ok: true;
      persistedIn: "supabase";
      status: "pending" | "used" | "expired" | "invalid";
      record?: InviteTokenRecord;
    }
  | {
      ok: false;
      persistedIn: "local";
      reason: string;
    };

export type CompleteInviteTokenResponse =
  | {
      ok: true;
      persistedIn: "supabase";
      status: "used";
      destination: string;
      record: InviteTokenRecord;
    }
  | {
      ok: false;
      persistedIn: "supabase" | "local";
      status?: "used" | "expired" | "invalid";
      reason: string;
      record?: InviteTokenRecord;
    };

type CreateInviteTokenServerFn = (
  options: ServerFnOptions<CreateInviteTokenInput>,
) => Promise<CreateInviteTokenResponse>;

type ReadInviteTokenServerFn = (
  options: ServerFnOptions<{ token: string }>,
) => Promise<ReadInviteTokenResponse>;

type CompleteInviteTokenServerFn = (
  options: ServerFnOptions<{ token: string; password: string }>,
) => Promise<CompleteInviteTokenResponse>;

export const createInviteTokenRequest = createServerFn({
  method: "POST",
}).handler(async ({ data }) => {
  const { createInviteToken, normalizeCreateInviteTokenInput } =
    await import("@/lib/invite-tokens.server");
  const input = normalizeCreateInviteTokenInput(data);
  if (!input) {
    return {
      ok: false,
      persistedIn: "local",
      reason: "INVALID_INVITE_PAYLOAD",
    } satisfies CreateInviteTokenResponse;
  }

  try {
    const record = await createInviteToken(input);
    return {
      ok: true,
      persistedIn: "supabase",
      token: record.token,
      inviteUrl: buildInviteUrl(record.token),
      record,
    } satisfies CreateInviteTokenResponse;
  } catch (error) {
    console.warn("Invitation partagée non créée", error);
    return {
      ok: false,
      persistedIn: "local",
      reason: "SHARED_INVITE_STORE_UNAVAILABLE",
    } satisfies CreateInviteTokenResponse;
  }
}) as unknown as CreateInviteTokenServerFn;

export const getInviteTokenRequest = createServerFn({
  method: "GET",
}).handler(async ({ data }) => {
  const token = readToken(data);
  if (!token) {
    return {
      ok: true,
      persistedIn: "supabase",
      status: "invalid",
    } satisfies ReadInviteTokenResponse;
  }

  try {
    const { getInviteToken } = await import("@/lib/invite-tokens.server");
    const record = await getInviteToken(token);
    if (!record) {
      return {
        ok: true,
        persistedIn: "supabase",
        status: "invalid",
      } satisfies ReadInviteTokenResponse;
    }

    return {
      ok: true,
      persistedIn: "supabase",
      status: getEffectiveInviteStatus(record),
      record,
    } satisfies ReadInviteTokenResponse;
  } catch (error) {
    console.warn("Invitation partagée non lue", error);
    return {
      ok: false,
      persistedIn: "local",
      reason: "SHARED_INVITE_STORE_UNAVAILABLE",
    } satisfies ReadInviteTokenResponse;
  }
}) as unknown as ReadInviteTokenServerFn;

export const completeInviteTokenRequest = createServerFn({
  method: "POST",
}).handler(async ({ data }) => {
  const token = readToken(data);
  const password = readPassword(data);
  if (!token || password.length < 8) {
    return {
      ok: false,
      persistedIn: "supabase",
      status: "invalid",
      reason: "INVALID_INVITE_COMPLETION",
    } satisfies CompleteInviteTokenResponse;
  }

  try {
    const { getInviteToken, markInviteTokenUsed } =
      await import("@/lib/invite-tokens.server");
    const record = await getInviteToken(token);
    if (!record) {
      return {
        ok: false,
        persistedIn: "supabase",
        status: "invalid",
        reason: "INVITE_TOKEN_NOT_FOUND",
      } satisfies CompleteInviteTokenResponse;
    }

    const status = getEffectiveInviteStatus(record);
    if (status !== "pending") {
      return {
        ok: false,
        persistedIn: "supabase",
        status,
        reason: "INVITE_TOKEN_NOT_PENDING",
        record,
      } satisfies CompleteInviteTokenResponse;
    }

    const usedRecord = await markInviteTokenUsed(token);
    return {
      ok: true,
      persistedIn: "supabase",
      status: "used",
      destination: getInviteDestination(usedRecord),
      record: usedRecord,
    } satisfies CompleteInviteTokenResponse;
  } catch (error) {
    console.warn("Invitation partagée non validée", error);
    return {
      ok: false,
      persistedIn: "local",
      reason: "SHARED_INVITE_STORE_UNAVAILABLE",
    } satisfies CompleteInviteTokenResponse;
  }
}) as unknown as CompleteInviteTokenServerFn;

function readToken(data: unknown) {
  if (!isRecord(data)) return "";
  return typeof data.token === "string" ? data.token.trim() : "";
}

function readPassword(data: unknown) {
  if (!isRecord(data)) return "";
  return typeof data.password === "string" ? data.password : "";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
