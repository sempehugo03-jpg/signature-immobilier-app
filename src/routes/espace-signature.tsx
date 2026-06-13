import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Building2 } from "lucide-react";

import {
  PrivateCard,
  PrivateHero,
  PrivateSectionTitle,
  PrivateShell,
} from "@/components/private-shell";
import { ProtectedRoute } from "@/components/protected-route";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/espace-signature")({
  head: () => ({
    meta: [
      { title: "Espace admin Signature Immobilier" },
      {
        name: "description",
        content: "Cockpit admin centré sur les agences Signature Immobilier.",
      },
    ],
  }),
  component: EspaceSignatureRoute,
});

function EspaceSignatureRoute() {
  return (
    <ProtectedRoute role="owner">
      <PrivateShell>
        <PrivateHero
          title="Espace admin Signature Immobilier"
          description="Le pilotage se fait maintenant depuis le cockpit agences : création, fiche agence, activation, équipe, démo et retrait."
          action={
            <Button asChild className="rounded-full">
              <Link to="/admin">
                Ouvrir /admin
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          }
        />

        <section className="mx-auto max-w-5xl px-5 pb-14 md:px-8">
          <PrivateCard className="p-6 md:p-8">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-primary text-primary-foreground">
              <Building2 className="h-5 w-5" />
            </div>
            <PrivateSectionTitle
              title="Les agences sont l’unité principale"
              description="Cette ancienne page ne crée plus d’accès patron séparés. Utilisez /admin pour créer une agence, ajouter son patron principal, ouvrir sa fiche, activer le portail et gérer patrons ou agents."
            />
            <div className="mt-7 grid gap-3 text-sm text-primary/60 md:grid-cols-2">
              <Info text="Créer une agence en mode démo" />
              <Info text="Ouvrir une fiche agence" />
              <Info text="Activer, désactiver ou retirer une agence" />
              <Info text="Gérer patrons, agents, démo et biens" />
            </div>
          </PrivateCard>
        </section>
      </PrivateShell>
    </ProtectedRoute>
  );
}

function Info({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-[#e8e0d5] bg-[#fffdf9] p-4">
      {text}
    </div>
  );
}
