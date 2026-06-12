import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, CalendarDays, Clipboard, FileText, Link2, Save } from "lucide-react";
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
import { agencyConfig } from "@/lib/agency-config";
import {
  getAgencyBySlug,
  getAgencyProperty,
  type Agency,
  type AgencyProperty,
} from "@/lib/agency-saas";

export const Route = createFileRoute(
  "/demo-agence/$slug/biens/$propertyId/gerer",
)({
  head: () => ({
    meta: [{ title: "Bien démo - Signature Immobilier" }],
  }),
  component: DemoPropertyDetailRoute,
});

function DemoPropertyDetailRoute() {
  const { slug, propertyId } = Route.useParams();
  const [agency, setAgency] = useState<Agency | null>(null);
  const [property, setProperty] = useState<AgencyProperty | null>(null);
  const [lockedOpen, setLockedOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const nextAgency = getAgencyBySlug(slug);
    setAgency(nextAgency);
    if (nextAgency) setProperty(getAgencyProperty(nextAgency, propertyId));
    setLoaded(true);
  }, [slug, propertyId]);

  if (!loaded) return null;

  if (!agency || !property) {
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
        eyebrow={`${agency.name} - Fiche bien démo`}
        title={property.title}
        description="Cette page affiche uniquement le bien sélectionné. Les actions d’enregistrement sont disponibles après activation."
        action={<StatusBadge status="demo" />}
      />

      <section className="mx-auto max-w-6xl px-5 pb-16 md:px-8">
        <Button asChild variant="outline" className="mb-7 rounded-full bg-white">
          <Link to="/demo-agence/$slug/agent" params={{ slug: agency.slug }}>
            <ArrowLeft className="h-4 w-4" />
            Retour aux biens
          </Link>
        </Button>

        <SaasCard className="overflow-hidden">
          <img
            src={property.image}
            alt={property.title}
            className="h-72 w-full object-cover md:h-[420px]"
          />
          <div className="p-6 md:p-8">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={property.publicStatus} />
              <span className="text-sm text-primary/45">{property.city}</span>
            </div>
            <div className="mt-6 grid gap-3 md:grid-cols-4">
              <Info label="Prix" value={property.price} />
              <Info label="Surface" value={property.surface} />
              <Info label="Pièces" value={property.rooms} />
              <Info label="Adresse" value={property.address} />
            </div>
          </div>
        </SaasCard>

        <div className="mt-7 grid gap-7 lg:grid-cols-[1.1fr_0.9fr]">
          <SaasCard className="p-6 md:p-8">
            <SectionTitle
              title="Progression vendeur"
              description="Mandat, annonce, visites, offre, compromis, vente."
            />
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {agencyConfig.saleProgress.slice(0, 6).map((step, index) => (
                <div
                  key={step}
                  className="rounded-2xl border border-[#e8e0d5] bg-[#fffdf9] p-4"
                >
                  <div className="text-xs font-medium uppercase tracking-[0.18em] text-primary/35">
                    Étape {index + 1}
                  </div>
                  <div className="mt-2 font-medium">{step}</div>
                </div>
              ))}
            </div>
            <Button
              type="button"
              className="mt-6 rounded-full"
              onClick={() => setLockedOpen(true)}
            >
              <Save className="h-4 w-4" />
              Enregistrer la progression
            </Button>
          </SaasCard>

          <div className="space-y-7">
            <Panel
              icon={CalendarDays}
              title="Prochaine visite"
              text={property.nextVisit}
              onAction={() => setLockedOpen(true)}
              action="Ajouter une visite"
            />
            <Panel
              icon={Clipboard}
              title="Compte rendu"
              text={property.report}
              onAction={() => setLockedOpen(true)}
              action="Ajouter un compte rendu"
            />
            <Panel
              icon={FileText}
              title="Documents"
              text={property.documents.join(", ")}
              onAction={() => setLockedOpen(true)}
              action="Ajouter un document"
            />
            <Panel
              icon={Link2}
              title="Lien vendeur"
              text="Le lien vendeur sera généré après activation."
              onAction={() => setLockedOpen(true)}
              action="Générer un accès vendeur"
            />
          </div>
        </div>
      </section>
    </SaasShell>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-[#faf7f0] p-4">
      <div className="text-xs font-medium uppercase tracking-[0.18em] text-primary/35">
        {label}
      </div>
      <div className="mt-2 font-medium">{value || "Non renseigné"}</div>
    </div>
  );
}

function Panel({
  icon: Icon,
  title,
  text,
  action,
  onAction,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  text: string;
  action: string;
  onAction: () => void;
}) {
  return (
    <SaasCard className="p-6">
      <Icon className="h-5 w-5 text-primary/45" />
      <h2 className="mt-5 font-display text-3xl">{title}</h2>
      <p className="mt-3 text-sm leading-relaxed text-primary/60">{text}</p>
      <Button
        type="button"
        variant="outline"
        className="mt-5 rounded-full bg-white"
        onClick={onAction}
      >
        {action}
      </Button>
    </SaasCard>
  );
}
