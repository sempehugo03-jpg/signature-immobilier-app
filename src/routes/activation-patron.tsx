import { createFileRoute } from "@tanstack/react-router";

import { AccessActivationPage } from "@/components/access-activation-page";

export const Route = createFileRoute("/activation-patron")({
  validateSearch: (search: Record<string, unknown>) => ({
    token: typeof search.token === "string" ? search.token : "",
  }),
  head: () => ({
    meta: [
      { title: "Activer mon espace agence - Signature Immobilier" },
      {
        name: "description",
        content: "Activation sécurisée de votre espace patron d’agence.",
      },
    ],
  }),
  component: ActivationPatronRoute,
});

function ActivationPatronRoute() {
  const { token } = Route.useSearch();

  return (
    <AccessActivationPage
      token={token}
      role="agency_admin"
      eyebrow="Espace patron sécurisé"
      title="Activer mon espace agence"
      description="Créez votre mot de passe pour administrer votre agence."
      emailLabel="Email patron"
    />
  );
}
