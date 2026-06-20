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
  getVisitRequestsByAgency,
  leadStatusLabel,
  updateVisitRequestStatus,
  type Agency,
  type LeadStatus,
  type VisitRequest,
} from "@/lib/agency-saas";

export const Route = createFileRoute("/agence/$slug/demandes-visites")({
  head: () => ({
    meta: [{ title: "Demandes de visite - Signature Immobilier" }],
  }),
  component: AgencyVisitRequestsRoute,
});

function AgencyVisitRequestsRoute() {
  const { slug } = Route.useParams();
  const [agency, setAgency] = useState<Agency | null>(null);
  const [requests, setRequests] = useState<VisitRequest[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const nextAgency = getAgencyBySlug(slug);
    setAgency(nextAgency);
    if (nextAgency) setRequests(getVisitRequestsByAgency(nextAgency.id));
    setLoaded(true);
  }, [slug]);

  function onStatus(id: string, status: LeadStatus) {
    updateVisitRequestStatus(id, status);
    if (agency) setRequests(getVisitRequestsByAgency(agency.id));
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

  return (
    <SaasShell action={<LogoutLink />}>
      <SaasHero
        eyebrow={agency.name}
        title="Demandes de visite"
        description="Les demandes acheteurs issues des fiches publiques sont centralisées ici."
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

        <SaasCard className="p-6 md:p-8">
          <SectionTitle
            title="Demandes reçues"
            description={`${requests.length} demande(s) enregistrée(s).`}
          />
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {requests.length === 0 && (
              <p className="text-sm text-primary/55">
                Aucune demande de visite pour le moment.
              </p>
            )}
            {requests.map((request) => (
              <VisitRequestCard
                key={request.id}
                request={request}
                onStatus={onStatus}
              />
            ))}
          </div>
        </SaasCard>
      </section>
    </SaasShell>
  );
}

function VisitRequestCard({
  request,
  onStatus,
}: {
  request: VisitRequest;
  onStatus: (id: string, status: LeadStatus) => void;
}) {
  return (
    <div className="rounded-[22px] border border-[#e8e0d5] bg-[#fffdf9] p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-3xl leading-tight">
            {request.firstName} {request.lastName}
          </h3>
          <p className="mt-1 text-sm text-primary/55">
            {request.propertyTitle} — {request.propertyCity}
          </p>
        </div>
        <StatusBadge status={leadStatusLabel(request.status)} />
      </div>

      <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
        <Info label="Situation" value={request.buyerSituation} />
        <Info label="Financement" value={request.financingStatus} />
        <Info label="Délai d’achat" value={request.buyingTimeline} />
        <Info
          label="Date"
          value={new Date(request.createdAt).toLocaleDateString("fr-FR")}
        />
      </div>

      {request.message && (
        <div className="mt-4 rounded-2xl border border-[#e8e0d5] bg-white p-4 text-sm leading-relaxed text-primary/65">
          {request.message}
        </div>
      )}

      <div className="mt-5 flex flex-wrap gap-2">
        <Button asChild variant="outline" className="rounded-full bg-white">
          <a href={`tel:${request.phone.replace(/\s/g, "")}`}>
            <Phone className="h-4 w-4" />
            Appeler
          </a>
        </Button>
        <Button asChild variant="outline" className="rounded-full bg-white">
          <a href={`mailto:${request.email}`}>
            <Mail className="h-4 w-4" />
            Email
          </a>
        </Button>
        <Button
          type="button"
          variant={request.status === "contacted" ? "default" : "outline"}
          className="rounded-full"
          onClick={() => onStatus(request.id, "contacted")}
        >
          Marquer comme contacté
        </Button>
        <Button
          type="button"
          variant={request.status === "archived" ? "default" : "outline"}
          className="rounded-full"
          onClick={() => onStatus(request.id, "archived")}
        >
          Archiver
        </Button>
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
