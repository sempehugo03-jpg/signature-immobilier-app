import { createFileRoute } from "@tanstack/react-router";

import { AccessActivationPage } from "@/components/access-activation-page";

export const Route = createFileRoute("/activation-agent")({
  validateSearch: (search: Record<string, unknown>) => ({
    token: typeof search.token === "string" ? search.token : "",
  }),
  head: () => ({
    meta: [
      { title: "Activer mon espace agent - Signature Immobilier" },
      {
        name: "description",
        content: "Activation sécurisée de votre espace agent.",
      },
    ],
  }),
  component: ActivationAgentRoute,
});

function ActivationAgentRoute() {
  const { token } = Route.useSearch();

  return (
    <AccessActivationPage
      token={token}
      role="agent"
      eyebrow="Espace agent sécurisé"
      title="Activer mon espace agent"
      description="Créez votre mot de passe pour accéder à votre espace agent."
      emailLabel="Email agent"
    />
  );
}
