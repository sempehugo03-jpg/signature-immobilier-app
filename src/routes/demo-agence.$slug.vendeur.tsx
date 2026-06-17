import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, CalendarDays, FileText } from "lucide-react";
import { useEffect, useState } from "react";

import {
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
  getSellerDemoProperty,
  type Agency,
  type AgencyProperty,
} from "@/lib/agency-saas";

export const Route = createFileRoute("/demo-agence/$slug/vendeur")({
  head: () => ({
    meta: [{ title: "Démo vendeur - Signature Immobilier" }],
  }),
  component: DemoSellerRoute,
});

function DemoSellerRoute() {
  const { slug } = Route.useParams();
  const [agency, setAgency] = useState<Agency | null>(null);
  const [property, setProperty] = useState<AgencyProperty | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const nextAgency = getAgencyBySlug(slug);
    setAgency(nextAgency);
    if (nextAgency) setProperty(getSellerDemoProperty(nextAgency));
    setLoaded(true);
  }, [slug]);

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
      <SaasHero
        eyebrow={`${agency.name} - Démo vendeur`}
        title="Ce que voit le propriétaire"
        description="Votre agence met à jour cet espace à chaque étape importante."
        action={<StatusBadge status="demo" />}
      />

      <section className="mx-auto max-w-5xl px-5 pb-16 md:px-8">
        <Button asChild variant="outline" className="mb-7 rounded-full bg-white">
          <Link to="/demo-agence/$slug" params={{ slug: agency.slug }}>
            <ArrowLeft className="h-4 w-4" />
            Retour à la démo
          </Link>
        </Button>

        <SaasCard className="overflow-hidden">
          <img
            src={property.image}
            alt={property.title}
            className="h-72 w-full object-cover md:h-[430px]"
          />
          <div className="p-6 md:p-8">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={property.publicStatus} />
              <span className="text-sm text-primary/45">{property.city}</span>
            </div>
            <h1 className="mt-4 font-display text-5xl leading-tight">
              {property.title}
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-primary/60">
              {property.description}
            </p>
            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              <Info label="Prix" value={property.price} />
              <Info label="Surface" value={property.surface} />
              <Info label="Pièces" value={property.rooms} />
            </div>
          </div>
        </SaasCard>

        <SaasCard className="mt-7 p-6 md:p-8">
          <SectionTitle
            title="Progression de la vente"
            description="Une lecture simple, sans donnée interne."
          />
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
        </SaasCard>

        <div className="mt-7 grid gap-5 md:grid-cols-2">
          <SaasCard className="p-6 md:p-8">
            <CalendarDays className="h-5 w-5 text-primary/45" />
            <h2 className="mt-5 font-display text-3xl">Prochaine visite</h2>
            <p className="mt-3 text-sm leading-relaxed text-primary/60">
              {property.nextVisit}
            </p>
          </SaasCard>
          <SaasCard className="p-6 md:p-8">
            <FileText className="h-5 w-5 text-primary/45" />
            <h2 className="mt-5 font-display text-3xl">
              Dernier compte rendu
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-primary/60">
              {property.report}
            </p>
          </SaasCard>
        </div>

        <SaasCard className="mt-7 p-6 md:p-8">
          <SectionTitle title="Documents importants" />
          <div className="mt-5 flex flex-wrap gap-2">
            {property.documents.map((document) => (
              <span
                key={document}
                className="rounded-full border border-[#e8e0d5] bg-[#fffdf9] px-4 py-2 text-sm text-primary/60"
              >
                {document}
              </span>
            ))}
          </div>
        </SaasCard>
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
      <div className="mt-2 font-display text-2xl">{value}</div>
    </div>
  );
}
