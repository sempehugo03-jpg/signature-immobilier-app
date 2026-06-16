import { createFileRoute } from "@tanstack/react-router";

import {
  getActiveUserAccessForEmail,
  getUserAccessDestination,
  userAccessApiError,
} from "@/lib/server/user-accesses";
import { getSupabaseAdminClient } from "@/lib/server/supabase-admin";

export const Route = createFileRoute("/api/accesses/current")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const bearerToken = readBearerToken(request);
        if (!bearerToken) {
          return Response.json(
            {
              ok: false,
              code: "unauthorized",
              message: "Connexion requise.",
            },
            { status: 401 },
          );
        }

        try {
          const supabase = getSupabaseAdminClient();
          const { data, error } = await supabase.auth.getUser(bearerToken);
          const email = data.user?.email ?? "";

          if (error || !email) {
            return Response.json(
              {
                ok: false,
                code: "unauthorized",
                message: "Connexion requise.",
              },
              { status: 401 },
            );
          }

          const access = await getActiveUserAccessForEmail(email);

          if (!access) {
            return Response.json(
              {
                ok: false,
                code: "no_access",
                message:
                  "Votre compte existe, mais aucun espace n’est associé à cet email.",
              },
              { status: 404 },
            );
          }

          const destination = getUserAccessDestination(access);
          if (!destination) {
            return Response.json(
              {
                ok: false,
                code: "no_access",
                message:
                  "Votre compte existe, mais aucun espace n’est associé à cet email.",
              },
              { status: 404 },
            );
          }

          return Response.json({
            ok: true,
            access,
            destination,
          });
        } catch (error) {
          const apiError = userAccessApiError(error);
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

function readBearerToken(request: Request) {
  const authorization = request.headers.get("authorization") ?? "";
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() ?? "";
}
