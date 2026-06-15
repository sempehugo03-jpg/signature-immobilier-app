import { createFileRoute } from "@tanstack/react-router";

import { isValidEmail } from "@/lib/email-utils";
import { isInviteAccessType } from "@/lib/invite-email";
import { buildInviteUrl } from "@/lib/invite-tokens";
import {
  createInviteToken,
  isSharedInviteStoreConfigured,
  normalizeCreateInviteTokenInput,
} from "@/lib/server/invite-tokens";

type InviteCreateErrorCode =
  | "missing_supabase"
  | "missing_table"
  | "missing_agency"
  | "invalid_email"
  | "unknown_error";

const inviteCreateErrorMessages: Record<InviteCreateErrorCode, string> = {
  missing_supabase:
    "Impossible de créer le lien d’invitation : base de données non configurée.",
  missing_table:
    "Impossible de créer le lien d’invitation : table invite_tokens absente.",
  missing_agency:
    "Impossible de créer le lien d’invitation : agence introuvable.",
  invalid_email: "Email invalide.",
  unknown_error:
    "Impossible de créer le lien d’invitation. Consultez la console pour le détail.",
};

export const Route = createFileRoute("/api/invites/create")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const payload = await readJson(request);
        const payloadError = getPayloadErrorCode(payload);
        if (payloadError) {
          return inviteCreateError(payloadError, 400);
        }

        const input = normalizeCreateInviteTokenInput(payload);
        if (!input) {
          return inviteCreateError("unknown_error", 400);
        }

        if (!isSharedInviteStoreConfigured()) {
          return inviteCreateError("missing_supabase", 503);
        }

        try {
          const record = await createInviteToken(input);
          return Response.json({
            ok: true,
            token: record.token,
            inviteUrl: buildInviteUrlFromRequest(request, record.token),
            record,
          });
        } catch (error) {
          logInviteCreationError(error);
          return inviteCreateError(
            isMissingInviteTokensTableError(error)
              ? "missing_table"
              : "unknown_error",
            503,
          );
        }
      },
    },
  },
});

async function readJson(request: Request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

function buildInviteUrlFromRequest(request: Request, token: string) {
  try {
    const origin = new URL(request.url).origin.replace(/\/$/, "");
    return `${origin}/creer-acces/${encodeURIComponent(token)}`;
  } catch {
    return buildInviteUrl(token);
  }
}

function inviteCreateError(code: InviteCreateErrorCode, status: number) {
  return Response.json(
    {
      ok: false,
      code,
      message: inviteCreateErrorMessages[code],
    },
    { status },
  );
}

function getPayloadErrorCode(payload: unknown): InviteCreateErrorCode | null {
  if (!isRecord(payload)) return "unknown_error";

  const agencyId = stringValue(payload.agencyId);
  const agencySlug = stringValue(payload.agencySlug);
  const teamMemberId = stringValue(payload.teamMemberId);
  const email = stringValue(payload.email);
  const type = payload.type;

  if (!agencyId || !agencySlug) return "missing_agency";
  if (!isValidEmail(email)) return "invalid_email";
  if (!isInviteAccessType(type)) return "unknown_error";
  if ((type === "manager_invite" || type === "agent_invite") && !teamMemberId) {
    return "missing_agency";
  }

  return null;
}

function logInviteCreationError(error: unknown) {
  if (import.meta.env.DEV) {
    console.error("Invite creation failed", error);
    return;
  }

  console.warn("Invite creation failed", error);
}

function isMissingInviteTokensTableError(error: unknown) {
  const details = [
    readErrorField(error, "code"),
    readErrorField(error, "message"),
    readErrorField(error, "details"),
    readErrorField(error, "hint"),
  ]
    .join(" ")
    .toLowerCase();

  return (
    details.includes("42p01") ||
    details.includes("pgrst205") ||
    (details.includes("invite_tokens") &&
      (details.includes("does not exist") ||
        details.includes("schema cache") ||
        details.includes("relation")))
  );
}

function readErrorField(error: unknown, field: string) {
  if (!isRecord(error)) return "";
  const value = error[field];
  return typeof value === "string" ? value : "";
}

function stringValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
