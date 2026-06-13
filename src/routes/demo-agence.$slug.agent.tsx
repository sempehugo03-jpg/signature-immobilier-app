import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, ClipboardList, FileText, Link2 } from "lucide-react";
import { useEffect, useState } from "react";

import {
  LockedActionModal,
  SaasCard,
  SaasHero,
  SaasShell,
  SectionTitle,
  StatusBadge,
} from "@/components/agency-saas-ui";
import { Button } from "@/components/ui/button";
import {
  getAgencyBySlug,
  getAgencyProperties,
  type Agency,
  type AgencyProperty,
} from "@/lib/agency-saas";

export const Route = createFileRoute("/demo-agence/$slug/agent")({
  head: () => ({
    meta: [{ title: "Démo agent - Signature Immobilier" }],
  }),
  component: DemoAgentRoute,
});

function DemoAgentRoute() {
  const { slug } = Route.useParams();
  const [agency, setAgency] = useState<Agency | null>(null);
  const [properties, setProperties] = useState<AgencyProperty[]>([]);
  const [lockedOpen, setLockedOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const nextAgency = getAgencyBySlug(slug);
    setAgency(nextAgency);
    if (nextAgency) setProperties(getAgencyProperties(nextAgency));
    setLoaded(true);
  }, [slug]);

  if (!loaded) return null;

  if (!agency) {
    return (
      <SaasShell>
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
    <SaasShell>
      <LockedActionModal
        open={lockedOpen}
        onClose={() => setLockedOpen(false)}
      />
      <SaasHero
        eyebrow={`${agency.name} - Démo agent`}
        title="Espace agent"
        description="L’agent met uniquement à jour les informations visibles par le client. Votre CRM reste votre outil interne."
        action={<StatusBadge status="demo" />}
      />

      <section className="mx-auto max-w-7xl px-5 pb-16 md:px-8">
        <Button asChild variant="outline" className="mb-7 rounded-full bg-white">
          <Link to="/demo-agence/$slug" params={{ slug: agency.slug }}>
            <ArrowLeft className="h-4 w-4" />
            Retour à la démo
          </Link>
        </Button>

        <SaasCard className="p-6 md:p-8">
          <SectionTitle
            title="Biens à suivre"
            description="Chaque bouton Gérer ouvre la fiche du bien sélectionné uniquement."
          />
          <div className="mt-7 grid gap-5 md:grid-cols-2">
            {properties.map((property) => (
              <PropertyCard
                key={property.id}
                agencySlug={agency.slug}
                property={property}
              />
            ))}
          </div>
        </SaasCard>

        <div className="mt-7 grid gap-5 md:grid-cols-3">
          <PreviewCard
            icon={ClipboardList}
            title="Progression vendeur"
            text="Mandat, annonce, visites, offre, compromis, vente."
          />
          <PreviewCard
            icon={FileText}
            title="Comptes rendus"
            text="Les retours après visite sont centralisés pour le vendeur."
          />
          <PreviewCard
            icon={Link2}
            title="Lien vendeur"
            text="Un accès clair à partager après activation."
          />
        </div>
      </section>
    </SaasShell>
  );
}

function PropertyCard({
  agencySlug,
  property,
}: {
  agencySlug: string;
  property: AgencyProperty;
}) {
  return (
    <div className="rounded-[24px] border border-[#e8e0d5] bg-[#fffdf9] p-5">
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge status={property.publicStatus} />
        <span className="text-sm text-primary/45">{property.city}</span>
      </div>
      <h3 className="mt-4 font-display text-3xl leading-tight">
        {property.title}
      </h3>
      <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <Info label="Progression" value={property.internalStatus} />
        <Info label="Prochaine visite" value={property.nextVisit} />
        <Info label="Documents" value={`${property.documents.length}`} />
        <Info label="Lien vendeur" value="Prêt en démo" />
      </div>
      <Button asChild className="mt-5 rounded-full">
        <Link
          to="/demo-agence/$slug/biens/$propertyId/gerer"
          params={{ slug: agencySlug, propertyId: property.id }}
        >
          Gérer
          <ArrowRight className="h-4 w-4" />
        </Link>
      </Button>
    </div>
  );
}

function PreviewCard({
  icon: Icon,
  title,
  text,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  text: string;
}) {
  return (
    <SaasCard className="p-6">
      <Icon className="h-5 w-5 text-primary/45" />
      <h3 className="mt-5 font-display text-2xl">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-primary/55">{text}</p>
    </SaasCard>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white p-4">
      <div className="text-xs font-medium uppercase tracking-[0.18em] text-primary/35">
        {label}
      </div>
      <div className="mt-2 font-medium">{value}</div>
    </div>
  );
}
