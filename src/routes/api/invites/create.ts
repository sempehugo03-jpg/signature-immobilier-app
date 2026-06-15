import { createFileRoute } from "@tanstack/react-router";

import { buildInviteUrl } from "@/lib/invite-tokens";
import {
  createInviteToken,
  normalizeCreateInviteTokenInput,
} from "@/lib/server/invite-tokens";

export const Route = createFileRoute("/api/invites/create")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const input = normalizeCreateInviteTokenInput(await readJson(request));
        if (!input) {
          return Response.json(
            { error: "INVALID_INVITE_PAYLOAD" },
            { status: 400 },
          );
        }

        try {
          const record = await createInviteToken(input);
          return Response.json({
            token: record.token,
            inviteUrl: buildInviteUrlFromRequest(request, record.token),
            record,
          });
        } catch (error) {
          console.warn("Invitation Supabase non créée", error);
          return Response.json(
            { error: "SHARED_INVITE_STORE_UNAVAILABLE" },
            { status: 503 },
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
