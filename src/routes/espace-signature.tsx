import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Building2 } from "lucide-react";
import { useEffect } from "react";

import { SaasCard, SaasShell } from "@/components/agency-saas-ui";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/espace-signature")({
  head: () => ({
    meta: [
      { title: "Redirection admin - Signature Immobilier" },
      {
        name: "description",
        content: "Redirection vers le cockpit admin Signature Immobilier.",
      },
    ],
  }),
  component: EspaceSignatureRoute,
});

function EspaceSignatureRoute() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate({ to: "/admin", replace: true });
  }, [navigate]);

  return (
    <SaasShell>
      <section className="mx-auto grid min-h-[calc(100vh-80px)] max-w-xl place-items-center px-5 py-16 text-center md:px-8">
        <SaasCard className="p-8 md:p-12">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-primary text-primary-foreground">
            <Building2 className="h-5 w-5" />
          </div>
          <h1 className="mt-5 font-display text-4xl leading-tight">
            Redirection vers le cockpit admin
          </h1>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-primary/55">
            La gestion des agences se fait maintenant uniquement depuis /admin.
          </p>
          <Button asChild className="mt-6 rounded-full">
            <Link to="/admin">
              Ouvrir /admin
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </SaasCard>
      </section>
    </SaasShell>
  );
}
