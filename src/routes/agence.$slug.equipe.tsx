import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";

import { AgencyTeamManager } from "@/components/agency-team-manager";
import {
  SaasCard,
  SaasHero,
  SaasShell,
  StatusBadge,
} from "@/components/agency-saas-ui";
import { SessionLogoutButton } from "@/components/session-logout-button";
import { Button } from "@/components/ui/button";
import {
  getAgencyBySlug,
  getCurrentAgencyAccess,
  type Agency,
} from "@/lib/agency-saas";

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
            <h1 className="font-display text-4xl">
              Cette agence n’est plus active sur Signature Immobilier.
            </h1>
            <Button asChild className="mt-6 rounded-full">
              <Link to="/">Retour à l’accueil</Link>
            </Button>
          </SaasCard>
        </section>
      </SaasShell>
    );
  }

  const access = getCurrentAgencyAccess(agency.id);
  const isAgent = access?.type === "agent";
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
        description="Les patrons peuvent gérer leur équipe. Les agents utilisent l’espace agence sans gérer les accès."
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
        ) : isAgent ? (
          <SaasCard className="p-8 text-center md:p-12">
            <h2 className="font-display text-4xl leading-tight">
              La gestion de l’équipe est réservée aux patrons.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-primary/55">
              Les agents peuvent gérer les informations visibles par les
              vendeurs, sans modifier l’équipe de l’agence.
            </p>
          </SaasCard>
        ) : (
          <SaasCard className="p-6 md:p-8">
            <AgencyTeamManager
              agencyId={agency.id}
              title="Gérer l’équipe"
              description="Ajoutez ou retirez des patrons, ajoutez des agents, puis désactivez ou réactivez leurs accès si nécessaire."
            />
          </SaasCard>
        )}
      </section>
    </SaasShell>
  );
}

function LogoutLink() {
  return <SessionLogoutButton />;
}
