import { createFileRoute, Link } from "@tanstack/react-router";
import { KeyRound } from "lucide-react";

import { SiteLayout } from "@/components/site-layout";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Accès sur invitation - Signature Immobilier" },
      {
        name: "description",
        content: "Les espaces vendeurs sont créés par l’agence.",
      },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  return (
    <SiteLayout variant="public">
      <section className="mx-auto grid min-h-[calc(100vh-12rem)] max-w-3xl place-items-center px-5 py-16 text-center md:px-8">
        <div className="rounded-3xl border border-border bg-card p-8 shadow-sm md:p-12">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-primary text-primary-foreground">
            <KeyRound className="h-5 w-5" />
          </div>
          <h1 className="mt-6 font-display text-4xl leading-tight">
            Accès sur invitation uniquement
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Votre espace vendeur est créé par l’agence. Utilisez le lien
            d’activation reçu par email, puis connectez-vous depuis “Mon suivi”.
          </p>
          <Link
            to="/mon-suivi"
            className="mt-8 inline-flex rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
          >
            Aller à Mon suivi
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}
