import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, FileText, Plus, Settings, UsersRound } from "lucide-react";
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

export const Route = createFileRoute("/demo-agence/$slug/patron")({
  head: () => ({
    meta: [{ title: "Démo patron - Signature Immobilier" }],
  }),
  component: DemoManagerRoute,
});

function DemoManagerRoute() {
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
        <MissingAgency />
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
        eyebrow={`${agency.name} - Démo patron`}
        title="Espace patron"
        description="Une vue simple pour piloter les biens, les demandes d’estimation, l’équipe et les informations visibles par les vendeurs."
        action={<StatusBadge status="demo" />}
      />

      <section className="mx-auto max-w-7xl px-5 pb-16 md:px-8">
        <Button asChild variant="outline" className="mb-7 rounded-full bg-white">
          <Link to="/demo-agence/$slug" params={{ slug: agency.slug }}>
            <ArrowLeft className="h-4 w-4" />
            Retour à la démo
          </Link>
        </Button>

        <div className="grid gap-5 md:grid-cols-4">
          <Metric label="Biens en vitrine" value={`${properties.length}`} />
          <Metric label="Demandes fictives" value="3" />
          <Metric label="Patrons" value="1" />
          <Metric label="Agents" value="2" />
        </div>

        <SaasCard className="mt-7 p-6 md:p-8">
          <SectionTitle
            title="Actions visibles en rendez-vous"
            description="En mode démo, elles montrent le produit mais restent verrouillées."
          />
          <div className="mt-6 flex flex-wrap gap-3">
            <Button className="rounded-full" onClick={() => setLockedOpen(true)}>
              <Plus className="h-4 w-4" />
              Ajouter un bien
            </Button>
            <Button
              variant="outline"
              className="rounded-full bg-white"
              onClick={() => setLockedOpen(true)}
            >
              <UsersRound className="h-4 w-4" />
              Ajouter agent
            </Button>
            <Button asChild variant="outline" className="rounded-full bg-white">
              <Link
                to="/demo-agence/$slug/estimation"
                params={{ slug: agency.slug }}
              >
                <FileText className="h-4 w-4" />
                Voir estimations
              </Link>
            </Button>
            <Button
              variant="outline"
              className="rounded-full bg-white"
              onClick={() => setLockedOpen(true)}
            >
              <Settings className="h-4 w-4" />
              Paramètres agence
            </Button>
          </div>
        </SaasCard>

        <div className="mt-7 grid gap-5 md:grid-cols-2">
          {properties.map((property) => (
            <PropertyCard
              key={property.id}
              agencySlug={agency.slug}
              property={property}
            />
          ))}
        </div>

        <div className="mt-7 grid gap-5 lg:grid-cols-2">
          <SaasCard className="p-6 md:p-8">
            <SectionTitle
              title="Demandes d’estimation fictives"
              description="Ce que le patron verra après activation quand les leads arriveront."
            />
            <div className="mt-5 space-y-3">
              {["Jean Martin", "Claire Dupont", "Marc Laffont"].map(
                (name, index) => (
                  <div
                    key={name}
                    className="rounded-2xl border border-[#e8e0d5] bg-[#fffdf9] p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <span className="font-medium">{name}</span>
                      <StatusBadge status={index === 0 ? "Nouveau" : "Rappelé"} />
                    </div>
                    <p className="mt-2 text-sm text-primary/55">
                      Maison — Tarbes · Délai : 3 mois
                    </p>
                  </div>
                ),
              )}
            </div>
          </SaasCard>

          <SaasCard className="p-6 md:p-8">
            <SectionTitle
              title="Équipe fictive"
              description="Patrons et agents sont séparés pour préparer la future gestion des rôles."
            />
            <div className="mt-5 grid gap-3">
              {[
                "Sophie Laurent — Patron",
                "Lucas Bernadet — Agent",
                "Emma Vidal — Agent",
              ].map((member) => (
                <div
                  key={member}
                  className="rounded-2xl border border-[#e8e0d5] bg-[#fffdf9] p-4 text-sm text-primary/65"
                >
                  {member}
                </div>
              ))}
            </div>
          </SaasCard>
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
    <SaasCard className="overflow-hidden">
      <img
        src={property.image}
        alt={property.title}
        className="h-56 w-full object-cover"
      />
      <div className="p-5">
        <StatusBadge status={property.publicStatus} />
        <h3 className="mt-4 font-display text-3xl leading-tight">
          {property.title}
        </h3>
        <p className="mt-2 text-sm text-primary/55">
          {property.price} · {property.surface} · {property.rooms} pièces
        </p>
        <Button asChild className="mt-5 rounded-full">
          <Link
            to="/demo-agence/$slug/biens/$propertyId/gerer"
            params={{ slug: agencySlug, propertyId: property.id }}
          >
            Gérer un bien
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </SaasCard>
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

function MissingAgency() {
  return (
    <section className="mx-auto max-w-3xl px-5 py-16 text-center md:px-8">
      <SaasCard className="p-8 md:p-12">
        <h1 className="font-display text-4xl">
          Cette agence n’est plus active sur Signature Immobilier.
        </h1>
      </SaasCard>
    </section>
  );
}
