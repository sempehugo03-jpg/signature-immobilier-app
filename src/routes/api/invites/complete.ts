import { createFileRoute } from "@tanstack/react-router";

import {
  getEffectiveInviteStatus,
  getInviteDestination,
} from "@/lib/invite-tokens";
import {
  getInviteToken,
  markInviteTokenUsed,
} from "@/lib/server/invite-tokens";

export const Route = createFileRoute("/api/invites/complete")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = await readJson(request);
        const token = readString(body, "token");
        const password = readString(body, "password");

        if (!token || password.length < 8) {
          return Response.json(
            { error: "INVALID_INVITE_COMPLETION", status: "invalid" },
            { status: 400 },
          );
        }

        try {
          const record = await getInviteToken(token);
          if (!record) {
            return Response.json(
              { error: "INVITE_TOKEN_NOT_FOUND", status: "invalid" },
              { status: 404 },
            );
          }

          const status = getEffectiveInviteStatus(record);
          if (status !== "pending") {
            return Response.json(
              {
                error: "INVITE_TOKEN_NOT_PENDING",
                status: status === "revoked" ? "invalid" : status,
                record,
              },
              { status: status === "used" ? 409 : 400 },
            );
          }

          const usedRecord = await markInviteTokenUsed(token);
          return Response.json({
            status: "used",
            destination: getInviteDestination(usedRecord),
            record: usedRecord,
          });
        } catch (error) {
          console.warn("Invitation Supabase non validée", error);
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

function readString(data: unknown, key: string) {
  if (!data || typeof data !== "object" || Array.isArray(data)) return "";
  const value = (data as Record<string, unknown>)[key];
  return typeof value === "string" ? value.trim() : "";
}
