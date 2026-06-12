import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, LogOut } from "lucide-react";
import { useEffect, useState } from "react";

import { AgencyTeamManager } from "@/components/agency-team-manager";
import {
  SaasCard,
  SaasHero,
  SaasShell,
  StatusBadge,
} from "@/components/agency-saas-ui";
import { Button } from "@/components/ui/button";
import { getAgencyBySlug, type Agency } from "@/lib/agency-saas";

export const Route = createFileRoute("/agence/$slug/equipe")({
  head: () => ({
    meta: [{ title: "Équipe agence - Signature Immobilier" }],
  }),
  component: AgencyTeamRoute,
});

function AgencyTeamRoute() {
  const { slug } = Route.useParams();
  const [agency, setAgency] = useState<Agency | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setAgency(getAgencyBySlug(slug));
    setLoaded(true);
  }, [slug]);

  if (!loaded) return null;

  if (!agency) {
    return (
      <SaasShell action={<LogoutLink />}>
        <section className="mx-auto max-w-3xl px-5 py-16 text-center md:px-8">
          <SaasCard className="p-8 md:p-12">
            <h1 className="font-display text-4xl">Agence introuvable</h1>
            <Button asChild className="mt-6 rounded-full">
              <Link to="/">Retour à l’accueil</Link>
            </Button>
          </SaasCard>
        </section>
      </SaasShell>
    );
  }

  const locked =
    agency.status === "demo"
      ? "Votre agence est actuellement en version démo."
      : agency.status === "disabled"
        ? "Votre portail est actuellement désactivé. Contactez Signature Immobilier pour le réactiver."
        : "";

  return (
    <SaasShell action={<LogoutLink />}>
      <SaasHero
        eyebrow={agency.name}
        title="Équipe"
        description="Les gérants peuvent ajouter ou supprimer des gérants et agents de leur agence. Les agents utiliseront l’espace agence sans gérer l’équipe."
        action={<StatusBadge status={agency.status} />}
      />

      <section className="mx-auto max-w-7xl px-5 pb-16 md:px-8">
        <Button
          asChild
          variant="outline"
          className="mb-7 rounded-full bg-white"
        >
          <Link to="/agence/$slug" params={{ slug: agency.slug }}>
            <ArrowLeft className="h-4 w-4" />
            Retour au portail
          </Link>
        </Button>

        {locked ? (
          <SaasCard className="p-8 text-center md:p-12">
            <h2 className="font-display text-4xl leading-tight">{locked}</h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-primary/55">
              Cette page sera disponible après activation du portail complet.
            </p>
          </SaasCard>
        ) : (
          <SaasCard className="p-6 md:p-8">
            <AgencyTeamManager
              agencyId={agency.id}
              title="Gérer l’équipe"
              description="Version pilote : le gérant agit comme administrateur de l’équipe. Les restrictions agents pourront être branchées avec l’authentification backend."
            />
          </SaasCard>
        )}
      </section>
    </SaasShell>
  );
}

function LogoutLink() {
  return (
    <Button
      asChild
      variant="outline"
      className="rounded-full border-[#d8cfc2] bg-white"
    >
      <Link to="/">
        <LogOut className="h-4 w-4" />
        Déconnexion
      </Link>
    </Button>
  );
}
