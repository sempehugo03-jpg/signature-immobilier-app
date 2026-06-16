import { createFileRoute } from "@tanstack/react-router";

import { getEffectiveInviteStatus } from "@/lib/invite-tokens";
import {
  getInviteToken,
  inviteTokenApiError,
} from "@/lib/server/invite-tokens";

export const Route = createFileRoute("/api/invites/$token")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        try {
          const record = await getInviteToken(params.token);
          if (!record) {
            return Response.json(
              {
                ok: false,
                status: "invalid",
                code: "not_found",
                message: "Lien invalide ou expiré.",
              },
              { status: 404 },
            );
          }

          const status = getEffectiveInviteStatus(record);
          if (status === "used") {
            return Response.json({
              ok: false,
              status: "used",
              code: "used",
              message: "Ce lien a déjà été utilisé.",
              record,
            });
          }

          if (status === "expired" || status === "revoked") {
            return Response.json({
              ok: false,
              status: status === "expired" ? "expired" : "invalid",
              code: "invalid",
              message:
                status === "expired"
                  ? "Ce lien a expiré."
                  : "Lien invalide ou expiré.",
              record,
            });
          }

          return Response.json({
            ok: true,
            status,
            record,
          });
        } catch (error) {
          console.warn("Invitation Supabase non lue", error);
          const apiError = inviteTokenApiError(error);
          return Response.json(
            {
              ok: false,
              status: "invalid",
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
