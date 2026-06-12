import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Building2,
  ClipboardList,
  FileText,
  Home,
  LockKeyhole,
  UsersRound,
} from "lucide-react";
import { useEffect, useState } from "react";

import {
  CheckRow,
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
  getAgencyLinks,
  getAgencyProperties,
  type Agency,
} from "@/lib/agency-saas";

export const Route = createFileRoute("/demo-agence/$slug")({
  head: () => ({
    meta: [{ title: "Démo agence - Signature Immobilier" }],
  }),
  component: DemoAgencyRoute,
});

function DemoAgencyRoute() {
  const { slug } = Route.useParams();
  const [agency, setAgency] = useState<Agency | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [lockedOpen, setLockedOpen] = useState(false);

  useEffect(() => {
    setAgency(getAgencyBySlug(slug));
    setLoaded(true);
  }, [slug]);

  if (!loaded) return null;

  if (!agency) {
    return (
      <SaasShell>
        <section className="mx-auto max-w-3xl px-5 py-16 text-center md:px-8">
          <SaasCard className="p-8 md:p-12">
            <h1 className="font-display text-4xl">Démo introuvable</h1>
            <Button asChild className="mt-6 rounded-full">
              <Link to="/">Retour à l’accueil</Link>
            </Button>
          </SaasCard>
        </section>
      </SaasShell>
    );
  }

  const links = getAgencyLinks(agency.slug);
  const properties = getAgencyProperties(agency);
  const featured = properties[0];

  return (
    <SaasShell>
      <LockedActionModal
        open={lockedOpen}
        onClose={() => setLockedOpen(false)}
      />

      <SaasHero
        eyebrow={`${agency.city || "Votre ville"} - Démo agence`}
        title={agency.name}
        description="Votre portail vendeur premium en version démo."
        action={<StatusBadge status="demo" />}
      />

      <section className="mx-auto max-w-7xl px-5 pb-16 md:px-8">
        <div className="rounded-[28px] border border-amber-200 bg-amber-50 p-5 text-sm leading-relaxed text-amber-800">
          Version démo — le portail complet est débloqué après activation.
        </div>

        <div className="mt-7 grid gap-7 lg:grid-cols-[1.1fr_0.9fr]">
          <SaasCard className="overflow-hidden">
            <img
              src={featured.image}
              alt={featured.title}
              className="h-72 w-full object-cover md:h-96"
            />
            <div className="p-6 md:p-8">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={featured.publicStatus} />
                <span className="text-sm text-primary/45">{featured.city}</span>
              </div>
              <h2 className="mt-4 font-display text-4xl leading-tight">
                Aperçu page vitrine
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-primary/60">
                En rendez-vous mandat, vous ne montrez plus seulement une
                estimation. Vous montrez l’expérience que le vendeur aura s’il
                choisit votre agence.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <Metric label="Prix" value={featured.price} />
                <Metric label="Surface" value={featured.surface} />
                <Metric label="Pièces" value={featured.rooms} />
              </div>
            </div>
          </SaasCard>

          <div className="space-y-7">
            <SaasCard className="p-6 md:p-8">
              <SectionTitle
                title="Version démo aujourd’hui. Portail complet après activation."
                description="Votre portail peut être activé avec vos accès, vos biens et vos demandes d’estimation."
              />
              <p className="mt-5 rounded-2xl bg-[#faf7f0] p-4 text-sm leading-relaxed text-primary/65">
                Je ne vous montre pas une idée. Je vous montre votre portail
                agence en version démo. Si vous validez, je l’active avec vos
                accès, vos demandes d’estimation envoyées directement sur votre
                email, et votre équipe peut l’utiliser immédiatement.
              </p>
              <div className="mt-6 space-y-3">
                <CheckRow>
                  Un seul lien principal pour le gérant : {links.portal}
                </CheckRow>
                <CheckRow>
                  Demandes d’estimation envoyées à {agency.estimationEmail}.
                </CheckRow>
                <CheckRow>
                  Équipe gérants et agents rattachée à l’agence.
                </CheckRow>
              </div>
              <div className="mt-7 flex flex-wrap gap-3">
                <Button
                  type="button"
                  className="rounded-full"
                  onClick={() => setLockedOpen(true)}
                >
                  <LockKeyhole className="h-4 w-4" />
                  Activer les vraies actions
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="rounded-full bg-white"
                >
                  <Link to="/agence/$slug" params={{ slug: agency.slug }}>
                    Voir le portail
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </SaasCard>

            {agency.logoUrl && (
              <SaasCard className="p-6">
                <img
                  src={agency.logoUrl}
                  alt={`Logo ${agency.name}`}
                  className="max-h-16 max-w-full object-contain"
                />
              </SaasCard>
            )}
          </div>
        </div>

        <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <DemoBlock
            icon={Home}
            title="Aperçu page vitrine"
            text="Une présentation premium des biens pour rassurer les vendeurs comme les acheteurs."
          />
          <DemoBlock
            icon={FileText}
            title="Espace vendeur"
            text="Progression, visites, comptes rendus et documents visibles sans relance."
          />
          <DemoBlock
            icon={Building2}
            title="Espace agence"
            text="Vos agents gardent leurs habitudes. Vos vendeurs découvrent une expérience plus claire, plus moderne et plus rassurante."
          />
          <DemoBlock
            icon={ClipboardList}
            title="Parcours estimation"
            text="Les demandes entrent dans le portail et sont envoyées directement à l’email de réception défini."
          />
        </div>

        <SaasCard className="mt-7 p-6 md:p-8">
          <SectionTitle
            title="Ce que l’agence montre à ses vendeurs"
            description="Signature Immobilier ne remplace pas votre CRM. Il améliore ce que vos clients voient."
            action={
              <Button
                type="button"
                className="rounded-full"
                onClick={() => setLockedOpen(true)}
              >
                <UsersRound className="h-4 w-4" />
                Gérer l’équipe
              </Button>
            }
          />
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {agencyConfig.saleProgress.slice(0, 6).map((step, index) => (
              <div
                key={step}
                className="rounded-[20px] border border-[#e8e0d5] bg-[#fffdf9] p-5"
              >
                <div className="text-xs font-medium uppercase tracking-[0.18em] text-primary/35">
                  Étape {index + 1}
                </div>
                <div className="mt-3 font-medium">{step}</div>
              </div>
            ))}
          </div>
        </SaasCard>
      </section>
    </SaasShell>
  );
}

function DemoBlock({
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
      <span className="grid h-11 w-11 place-items-center rounded-full bg-[#faf7f0] text-primary">
        <Icon className="h-5 w-5" />
      </span>
      <h3 className="mt-6 font-display text-2xl leading-tight">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-primary/55">{text}</p>
    </SaasCard>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-[#faf7f0] p-4">
      <div className="text-xs font-medium uppercase tracking-[0.18em] text-primary/35">
        {label}
      </div>
      <div className="mt-2 font-display text-2xl">{value}</div>
    </div>
  );
}
