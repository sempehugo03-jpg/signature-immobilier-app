import { createFileRoute } from "@tanstack/react-router";

import { isValidEmail } from "@/lib/email-utils";
import { isInviteAccessType } from "@/lib/invite-email";
import { buildInviteUrl } from "@/lib/invite-tokens";
import {
  createInviteToken,
  inviteTokenApiError,
  normalizeCreateInviteTokenInput,
} from "@/lib/server/invite-tokens";

type InviteCreateErrorCode =
  | "missing_agency"
  | "invalid_email"
  | "invalid_payload";

const inviteCreateErrorMessages: Record<InviteCreateErrorCode, string> = {
  missing_agency:
    "Impossible de créer le lien d’invitation : agence introuvable.",
  invalid_email: "Email invalide.",
  invalid_payload:
    "Impossible de créer le lien d’invitation : données invalides.",
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
          return inviteCreateError("invalid_payload", 400);
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
          const apiError = inviteTokenApiError(error);
          return Response.json(
            {
              ok: false,
              code: apiError.code,
              message: apiError.message,
            },
            { status: apiError.status },
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
  if (!isRecord(payload)) return "invalid_payload";

  const agencyId = stringValue(payload.agencyId);
  const agencySlug = stringValue(payload.agencySlug);
  const teamMemberId = stringValue(payload.teamMemberId);
  const email = stringValue(payload.email);
  const type = payload.type;

  if (!agencyId || !agencySlug) return "missing_agency";
  if (!isValidEmail(email)) return "invalid_email";
  if (!isInviteAccessType(type)) return "invalid_payload";
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

function stringValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
