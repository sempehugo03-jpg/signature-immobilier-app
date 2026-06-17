import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { CheckCircle2, LogOut } from "lucide-react";
import { useEffect, useState } from "react";

import { SaasCard, SaasHero, SaasShell } from "@/components/agency-saas-ui";
import { Button } from "@/components/ui/button";
import {
  saveAgencyAccessSession,
  verifyAgencyAccessToken,
  type Agency,
} from "@/lib/agency-saas";

export const Route = createFileRoute("/acces/agence/$token")({
  head: () => ({
    meta: [{ title: "Accès agence - Signature Immobilier" }],
  }),
  component: AgencyAccessRoute,
});

function AgencyAccessRoute() {
  const { token } = Route.useParams();
  const navigate = useNavigate();
  const [agency, setAgency] = useState<Agency | null>(null);
  const [invalid, setInvalid] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const result = verifyAgencyAccessToken(token);
    if (!result) {
      setInvalid(true);
      setLoaded(true);
      return;
    }

    saveAgencyAccessSession(result.access);
    setAgency(result.agency);
    setLoaded(true);

    const timer = window.setTimeout(() => {
      navigate({
        to: "/agence/$slug",
        params: { slug: result.agency.slug },
        replace: true,
      });
    }, 1200);

    return () => window.clearTimeout(timer);
  }, [navigate, token]);

  if (!loaded) return null;

  if (invalid || !agency) {
    return (
      <SaasShell action={<HomeLink />}>
        <SaasHero
          title="Lien invalide ou expiré."
          description="Contactez Signature Immobilier pour recevoir un nouvel accès."
        />
        <section className="mx-auto max-w-3xl px-5 pb-16 md:px-8">
          <SaasCard className="p-8 text-center md:p-12">
            <Button asChild className="rounded-full">
              <Link to="/">Retour à l’accueil</Link>
            </Button>
          </SaasCard>
        </section>
      </SaasShell>
    );
  }

  return (
    <SaasShell action={<HomeLink />}>
      <section className="mx-auto grid min-h-[calc(100vh-80px)] max-w-3xl place-items-center px-5 py-16 text-center md:px-8">
        <SaasCard className="p-8 md:p-12">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-50 text-emerald-700">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <h1 className="mt-5 font-display text-4xl leading-tight">
            Bienvenue sur votre espace Signature Immobilier
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-primary/60">
            Votre accès est prêt. Vous allez être redirigé vers votre espace
            agence.
          </p>
          <Button asChild className="mt-7 rounded-full">
            <Link to="/agence/$slug" params={{ slug: agency.slug }}>
              Ouvrir maintenant
            </Link>
          </Button>
        </SaasCard>
      </section>
    </SaasShell>
  );
}

function HomeLink() {
  return (
    <Button
      asChild
      variant="outline"
      className="rounded-full border-[#d8cfc2] bg-white"
    >
      <Link to="/">
        <LogOut className="h-4 w-4" />
        Accueil
      </Link>
    </Button>
  );
}
