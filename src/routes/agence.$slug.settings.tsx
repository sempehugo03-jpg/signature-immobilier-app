import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Building2, LogOut } from "lucide-react";
import { useEffect, useState } from "react";

import {
  SaasCard,
  SaasHero,
  SaasShell,
  SectionTitle,
  StatusBadge,
} from "@/components/agency-saas-ui";
import { Button } from "@/components/ui/button";
import {
  getAgents,
  getAgencyBySlug,
  getAgencyLeads,
  getAgencyProperties,
  getManagers,
  type Agency,
} from "@/lib/agency-saas";
import { signOutToMonSuivi } from "@/lib/session-cleanup";

export const Route = createFileRoute("/agence/$slug/settings")({
  head: () => ({
    meta: [{ title: "Paramètres agence - Signature Immobilier" }],
  }),
  component: AgencySettingsRoute,
});

function AgencySettingsRoute() {
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
          </SaasCard>
        </section>
      </SaasShell>
    );
  }

  const managers = getManagers(agency.id);
  const agents = getAgents(agency.id);
  const properties = getAgencyProperties(agency);
  const leads = getAgencyLeads(agency.slug);

  return (
    <SaasShell action={<LogoutLink />}>
      <SaasHero
        eyebrow={agency.name}
        title="Paramètres"
        description="Consultez les informations principales du portail. Les modifications critiques restent réservées à Hugo dans l’admin."
        action={<StatusBadge status={agency.status} />}
      />

      <section className="mx-auto max-w-5xl px-5 pb-16 md:px-8">
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

        <SaasCard className="p-6 md:p-8">
          <SectionTitle
            title="Informations agence"
            description="Votre portail peut être activé avec vos accès, vos biens et vos demandes d’estimation."
          />
          <div className="mt-7 grid gap-4 md:grid-cols-2">
            <Info label="Nom" value={agency.name} />
            <Info label="Ville" value={agency.city} />
            <Info label="Statut" value={agency.status} />
            <Info label="Email estimation" value={agency.estimationEmail} />
            <Info label="Téléphone" value={agency.phone || "À compléter"} />
            <Info label="Couleur principale" value={agency.primaryColor} />
          </div>
        </SaasCard>

        <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="Biens" value={`${properties.length}`} />
          <Metric label="Estimations" value={`${leads.length}`} />
          <Metric label="Gérants" value={`${managers.length}`} />
          <Metric label="Agents" value={`${agents.length}`} />
        </div>

        <SaasCard className="mt-7 p-6 md:p-8">
          <div className="flex items-start gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#faf7f0] text-primary">
              <Building2 className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-display text-3xl leading-tight">
                Signature Immobilier ne remplace pas votre CRM.
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-primary/55">
                Il améliore ce que vos clients voient. Les réglages sensibles
                comme l’email de réception, l’activation ou la désactivation du
                portail restent gérés depuis l’admin Hugo.
              </p>
            </div>
          </div>
        </SaasCard>
      </section>
    </SaasShell>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#e8e0d5] bg-[#fffdf9] p-5">
      <div className="text-xs font-medium uppercase tracking-[0.18em] text-primary/35">
        {label}
      </div>
      <div className="mt-2 break-words font-medium">
        {value || "Non renseigné"}
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <SaasCard className="p-5">
      <div className="text-xs font-medium uppercase tracking-[0.18em] text-primary/35">
        {label}
      </div>
      <div className="mt-2 font-display text-4xl">{value}</div>
    </SaasCard>
  );
}

function LogoutLink() {
  return (
    <Button
      asChild
      variant="outline"
      className="rounded-full border-[#d8cfc2] bg-white"
    >
      <Link
        to="/mon-suivi"
        onClick={(event) => {
          event.preventDefault();
          void signOutToMonSuivi();
        }}
      >
        <LogOut className="h-4 w-4" />
        Déconnexion
      </Link>
    </Button>
  );
}
