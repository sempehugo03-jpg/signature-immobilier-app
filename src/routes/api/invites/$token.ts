import { createFileRoute } from "@tanstack/react-router";

import { getEffectiveInviteStatus } from "@/lib/invite-tokens";
import { getInviteToken } from "@/lib/server/invite-tokens";

export const Route = createFileRoute("/api/invites/$token")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        try {
          const record = await getInviteToken(params.token);
          if (!record) {
            return Response.json({ status: "invalid" }, { status: 404 });
          }

          const status = getEffectiveInviteStatus(record);
          return Response.json({
            status: status === "revoked" ? "invalid" : status,
            record,
          });
        } catch (error) {
          console.warn("Invitation Supabase non lue", error);
          return Response.json(
            { error: "SHARED_INVITE_STORE_UNAVAILABLE" },
            { status: 503 },
          );
        }
      },
    },
  },
});
