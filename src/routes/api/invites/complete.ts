import { createFileRoute } from "@tanstack/react-router";

import {
  getEffectiveInviteStatus,
  getInviteDestination,
} from "@/lib/invite-tokens";
import {
  getInviteToken,
  InviteTokenServerError,
  inviteTokenApiError,
  markInviteTokenUsed,
} from "@/lib/server/invite-tokens";
import {
  createOrUpdateInviteAuthUser,
  getUserAccessDestination,
  upsertUserAccessFromInvite,
  userAccessApiError,
} from "@/lib/server/user-accesses";

export const Route = createFileRoute("/api/invites/complete")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = await readJson(request);
        const token = readString(body, "token");
        const password = readString(body, "password");

        if (!token || password.length < 8) {
          return Response.json(
            {
              ok: false,
              code: "invalid_payload",
              message: "Token ou mot de passe invalide.",
              status: "invalid",
            },
            { status: 400 },
          );
        }

        try {
          const record = await getInviteToken(token);
          if (!record) {
            return Response.json(
              {
                ok: false,
                code: "not_found",
                message: "Lien invalide ou expiré.",
                status: "invalid",
              },
              { status: 404 },
            );
          }

          const status = getEffectiveInviteStatus(record);
          if (status !== "pending") {
            return Response.json(
              {
                ok: false,
                code: status === "used" ? "used" : "invalid",
                message: getInviteCompletionStatusMessage(status),
                status: status === "revoked" ? "invalid" : status,
                record,
              },
              { status: status === "used" ? 409 : 400 },
            );
          }

          const authUser = await createOrUpdateInviteAuthUser(record, password);
          const access = await upsertUserAccessFromInvite(record);
          const usedRecord = await markInviteTokenUsed(token);
          return Response.json({
            ok: true,
            status: "used",
            destination:
              getUserAccessDestination(access) ||
              getInviteDestination(usedRecord),
            email: access.email,
            role: access.role,
            agencySlug: access.agencySlug,
            authUser,
            access,
            record: usedRecord,
          });
        } catch (error) {
          console.warn("Invitation Supabase non validée", error);
          const apiError =
            error instanceof InviteTokenServerError
              ? inviteTokenApiError(error)
              : userAccessApiError(error);
          return Response.json(
            {
              ok: false,
              code: apiError.code,
              message: apiError.message,
              status: "invalid",
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

function readString(data: unknown, key: string) {
  if (!data || typeof data !== "object" || Array.isArray(data)) return "";
  const value = (data as Record<string, unknown>)[key];
  return typeof value === "string" ? value.trim() : "";
}

function getInviteCompletionStatusMessage(status: string) {
  if (status === "used") return "Ce lien a déjà été utilisé.";
  if (status === "expired") return "Ce lien a expiré.";
  return "Lien invalide ou expiré.";
}
