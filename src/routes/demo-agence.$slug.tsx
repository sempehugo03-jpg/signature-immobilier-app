import {
  createFileRoute,
  Link,
  Outlet,
  useRouterState,
} from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  Calculator,
  Home,
  UserRound,
} from "lucide-react";
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
  getAgencyLinks,
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
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const isDemoRoot =
    pathname === `/demo-agence/${slug}` || pathname === `/demo-agence/${slug}/`;

  if (!isDemoRoot) return <Outlet />;

  return <DemoAgencyHub slug={slug} />;
}

function DemoAgencyHub({ slug }: { slug: string }) {
  const [agency, setAgency] = useState<Agency | null>(null);
  const [loaded, setLoaded] = useState(false);

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

  const links = getAgencyLinks(agency.slug);

  return (
    <SaasShell>
      <SaasHero
        eyebrow={agency.city || "Votre ville"}
        title={agency.name}
        description="Votre portail vendeur premium en version démo"
        action={<StatusBadge status="demo" />}
      />

      <section className="mx-auto max-w-7xl px-5 pb-16 md:px-8">
        <div className="mb-7 flex flex-wrap items-center justify-between gap-3">
          <Button asChild variant="outline" className="rounded-full bg-white">
            <Link to="/admin/agencies/$slug" params={{ slug: agency.slug }}>
              <ArrowLeft className="h-4 w-4" />
              Retour à la fiche agence
            </Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full bg-white">
            <Link to="/agence/$slug" params={{ slug: agency.slug }}>
              Accéder à l’espace agence
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="rounded-[28px] border border-amber-200 bg-amber-50 p-5 text-sm leading-relaxed text-amber-800">
          Version démo — le portail complet est débloqué après activation.
        </div>

        <div className="mt-7 grid gap-7 lg:grid-cols-[0.9fr_1.1fr]">
          <SaasCard className="p-6 md:p-8">
            {agency.logoUrl ? (
              <img
                src={agency.logoUrl}
                alt={`Logo ${agency.name}`}
                className="max-h-20 max-w-full object-contain"
              />
            ) : (
              <div className="grid h-16 w-16 place-items-center rounded-full bg-primary font-display text-3xl text-primary-foreground">
                {agency.name.slice(0, 1)}
              </div>
            )}
            <h2 className="mt-7 font-display text-4xl leading-tight">
              Là, vous êtes en version démo.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-primary/60">
              Vous pouvez voir l’espace patron, l’espace agent, l’espace vendeur
              et tester une estimation fictive. Si vous validez, Hugo clique sur
              Activer l’agence, et ce même portail devient votre vrai outil avec
              vos biens, vos accès et vos demandes d’estimation envoyées sur
              votre email.
            </p>
            <div className="mt-6 rounded-2xl bg-[#faf7f0] p-4 text-sm text-primary/65">
              Email de réception des estimations :{" "}
              <span className="font-medium text-primary">
                {agency.estimationEmail || "à renseigner"}
              </span>
            </div>
          </SaasCard>

          <SaasCard className="p-6 md:p-8">
            <SectionTitle
              title="Choisir une vue de démo"
              description="Quatre portes simples pour comprendre le produit en rendez-vous."
            />
            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              <DemoButton
                icon={BriefcaseBusiness}
                title="Voir l’espace patron"
                to={links.demoManager}
              />
              <DemoButton
                icon={Home}
                title="Voir l’espace agent"
                to={links.demoAgent}
              />
              <DemoButton
                icon={UserRound}
                title="Voir l’espace vendeur"
                to={links.demoSeller}
              />
              <DemoButton
                icon={Calculator}
                title="Tester une estimation fictive"
                to={links.demoEstimation}
              />
            </div>
          </SaasCard>
        </div>
      </section>
    </SaasShell>
  );
}

function DemoButton({
  icon: Icon,
  title,
  to,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  to: string;
}) {
  return (
    <Button
      asChild
      variant="outline"
      className="h-auto justify-between rounded-[22px] border-[#e8e0d5] bg-[#fffdf9] p-5 text-left hover:bg-white"
    >
      <Link to={to}>
        <span className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-white text-primary shadow-sm">
            <Icon className="h-5 w-5" />
          </span>
          <span className="font-display text-2xl leading-tight text-primary">
            {title}
          </span>
        </span>
        <ArrowRight className="h-4 w-4 shrink-0" />
      </Link>
    </Button>
  );
}
