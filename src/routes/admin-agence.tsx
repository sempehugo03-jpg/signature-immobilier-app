import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Building2 } from "lucide-react";
import { useEffect } from "react";

import { SaasCard, SaasShell } from "@/components/agency-saas-ui";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin-agence")({
  head: () => ({
    meta: [
      { title: "Portail agence - Signature Immobilier" },
      {
        name: "description",
        content:
          "Orientation vers le vrai portail agence Signature Immobilier.",
      },
    ],
  }),
  component: AdminAgenceRoute,
});

function AdminAgenceRoute() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate({
      to: "/agence/$slug",
      params: { slug: "signature-active" },
      replace: true,
    });
  }, [navigate]);

  return (
    <SaasShell>
      <section className="mx-auto grid min-h-[calc(100vh-80px)] max-w-xl place-items-center px-5 py-16 text-center md:px-8">
        <SaasCard className="p-8 md:p-12">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-primary text-primary-foreground">
            <Building2 className="h-5 w-5" />
          </div>
          <h1 className="mt-5 font-display text-4xl leading-tight">
            Redirection vers l’espace agence
          </h1>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-primary/55">
            L’ancien accès agence renvoie maintenant vers le portail réel
            /agence/[slug].
          </p>
          <Button asChild className="mt-6 rounded-full">
            <Link to="/agence/$slug" params={{ slug: "signature-active" }}>
              Ouvrir l’espace agence
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </SaasCard>
      </section>
    </SaasShell>
  );
}
