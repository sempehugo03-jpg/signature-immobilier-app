import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, LogOut, Mail, Phone } from "lucide-react";
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
  getAgencyBySlug,
  getAgencyLeads,
  leadStatusLabel,
  updateAgencyLeadStatus,
  type Agency,
  type AgencyLead,
  type AgencyLeadStatus,
} from "@/lib/agency-saas";

export const Route = createFileRoute("/agence/$slug/estimations")({
  head: () => ({
    meta: [{ title: "Estimations agence - Signature Immobilier" }],
  }),
  component: AgencyEstimationsRoute,
});

const statuses: AgencyLeadStatus[] = ["new", "contacted", "archived"];

function AgencyEstimationsRoute() {
  const { slug } = Route.useParams();
  const [agency, setAgency] = useState<Agency | null>(null);
  const [leads, setLeads] = useState<AgencyLead[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const nextAgency = getAgencyBySlug(slug);
    setAgency(nextAgency);
    if (nextAgency) setLeads(getAgencyLeads(nextAgency.slug));
    setLoaded(true);
  }, [slug]);

  function onStatus(leadId: string, status: AgencyLeadStatus) {
    updateAgencyLeadStatus(leadId, status);
    if (agency) setLeads(getAgencyLeads(agency.slug));
  }

  if (!loaded) return null;

  if (!agency) {
    return (
      <SaasShell action={<LogoutLink />}>
        <section className="mx-auto max-w-3xl px-5 py-16 text-center md:px-8">
          <SaasCard className="p-8 md:p-12">
            <h1 className="font-display text-4xl">
              Cette agence n’est plus active sur Signature Immobilier.
            </h1>
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
        title="Estimations"
        description="Les demandes issues du parcours estimation sont centralisées ici, puis suivies avec un statut simple."
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
              Les demandes d’estimation seront enregistrées et envoyées à
              l’agence après activation.
            </p>
          </SaasCard>
        ) : (
          <SaasCard className="p-6 md:p-8">
            <SectionTitle
              title="Demandes reçues"
              description={`${leads.length} demande(s) enregistrée(s) pour ${agency.estimationEmail}.`}
            />
            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              {leads.length === 0 && (
                <p className="text-sm text-primary/55">
                  Aucune demande d’estimation pour le moment.
                </p>
              )}
              {leads.map((lead) => (
                <LeadCard key={lead.id} lead={lead} onStatus={onStatus} />
              ))}
            </div>
          </SaasCard>
        )}
      </section>
    </SaasShell>
  );
}

function LeadCard({
  lead,
  onStatus,
}: {
  lead: AgencyLead;
  onStatus: (leadId: string, status: AgencyLeadStatus) => void;
}) {
  return (
    <div className="rounded-[22px] border border-[#e8e0d5] bg-[#fffdf9] p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-3xl leading-tight">
            {lead.firstName} {lead.lastName}
          </h3>
          <p className="mt-1 text-sm text-primary/55">
            {lead.propertyType} — {lead.propertyCity}
          </p>
        </div>
        <StatusBadge status={leadStatusLabel(lead.status)} />
      </div>

      <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
        <Info label="Surface" value={lead.surface} />
        <Info label="Pièces" value={lead.rooms} />
        <Info label="État" value={lead.propertyState} />
        <Info label="Délai" value={lead.sellingDelay} />
        <Info label="Extérieur" value={lead.exterior} />
        <Info label="Parking" value={lead.parking} />
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <Button asChild variant="outline" className="rounded-full bg-white">
          <a href={`tel:${lead.phone.replace(/\s/g, "")}`}>
            <Phone className="h-4 w-4" />
            Appeler
          </a>
        </Button>
        <Button asChild variant="outline" className="rounded-full bg-white">
          <a href={`mailto:${lead.email}`}>
            <Mail className="h-4 w-4" />
            Email
          </a>
        </Button>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {statuses.map((status) => (
          <Button
            key={status}
            type="button"
            size="sm"
            variant={lead.status === status ? "default" : "outline"}
            className="rounded-full"
            onClick={() => onStatus(lead.id, status)}
          >
            {leadStatusLabel(status)}
          </Button>
        ))}
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#e8e0d5] bg-white p-4">
      <div className="text-xs font-medium uppercase tracking-[0.18em] text-primary/35">
        {label}
      </div>
      <div className="mt-2 font-medium">{value || "Non renseigné"}</div>
    </div>
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
