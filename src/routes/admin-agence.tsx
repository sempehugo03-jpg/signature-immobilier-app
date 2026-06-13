import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Building2, Home, UsersRound } from "lucide-react";

import {
  PrivateCard,
  PrivateHero,
  PrivateSectionTitle,
  PrivateShell,
} from "@/components/private-shell";
import { ProtectedRoute } from "@/components/protected-route";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin-agence")({
  head: () => ({
    meta: [
      { title: "Espace agence - Signature Immobilier" },
      {
        name: "description",
        content: "Orientation vers le portail agence Signature Immobilier.",
      },
    ],
  }),
  component: AdminAgenceRoute,
});

function AdminAgenceRoute() {
  return (
    <ProtectedRoute role="agency_admin">
      <PrivateShell>
        <PrivateHero
          title="Espace agence"
          description="Le portail agence est maintenant organisé autour de l’agence, de ses biens, de son équipe et de la démo vendeur."
        />

        <section className="mx-auto max-w-6xl px-5 pb-14 md:px-8">
          <PrivateCard className="p-6 md:p-8">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-primary text-primary-foreground">
              <Building2 className="h-5 w-5" />
            </div>
            <PrivateSectionTitle
              title="Votre portail est géré depuis la fiche agence"
              description="Les agents et les patrons ne sont plus pilotés comme une liste d’accès séparés. Hugo active l’agence depuis /admin, puis le lien propre envoyé par email ouvre le portail /agence/[slug]."
            />
            <div className="mt-7 grid gap-4 md:grid-cols-2">
              <ActionCard
                icon={Home}
                title="Portail agence"
                text="Biens, estimations, équipe et paramètres sont regroupés dans /agence/[slug]."
              />
              <ActionCard
                icon={UsersRound}
                title="Équipe"
                text="Les patrons peuvent gérer les agents depuis la page Équipe du portail activé."
              />
            </div>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild className="rounded-full">
                <Link to="/">
                  Retour au site
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full bg-white">
                <Link to="/demo-agence/$slug" params={{ slug: "betty-immobilier" }}>
                  Voir une démo agence
                </Link>
              </Button>
            </div>
          </PrivateCard>
        </section>
      </PrivateShell>
    </ProtectedRoute>
  );
}

function ActionCard({
  icon: Icon,
  title,
  text,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-[22px] border border-[#e8e0d5] bg-[#fffdf9] p-5">
      <Icon className="h-5 w-5 text-primary/45" />
      <h3 className="mt-5 font-display text-2xl leading-tight">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-primary/55">{text}</p>
    </div>
  );
}
