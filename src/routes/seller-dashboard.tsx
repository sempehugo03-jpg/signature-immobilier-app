import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  CheckCircle2,
  FileText,
  Home,
  LogOut,
  MessageSquare,
} from "lucide-react";

import { ProtectedRoute } from "@/components/protected-route";
import { SiteLayout } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/seller-dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard vendeur - Signature Immobilier" },
      { name: "description", content: "Espace protege vendeur." },
    ],
  }),
  component: SellerDashboardRoute,
});

function SellerDashboardRoute() {
  return (
    <ProtectedRoute role="seller">
      <SellerDashboard />
    </ProtectedRoute>
  );
}

function SellerDashboard() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  async function onSignOut() {
    await signOut();
    navigate({ to: "/mon-suivi", replace: true });
  }

  return (
    <SiteLayout>
      <section className="border-b border-border bg-secondary/40">
        <div className="mx-auto flex max-w-6xl flex-wrap items-end justify-between gap-6 px-5 py-10 md:px-8 md:py-14">
          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
              Dashboard vendeur
            </div>
            <h1 className="mt-2 font-display text-3xl md:text-5xl">
              Bienvenue dans votre espace vendeur.
            </h1>
            <p className="mt-3 text-muted-foreground">{profile?.email}</p>
          </div>
          <Button
            variant="outline"
            className="rounded-full"
            onClick={onSignOut}
          >
            <LogOut className="h-4 w-4" />
            Deconnexion
          </Button>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-12 md:px-8">
        <div className="grid gap-5 md:grid-cols-3">
          {[
            {
              icon: Home,
              title: "Suivi de vente",
              body: "Consultez la timeline vendeur deja presente dans la maquette.",
            },
            {
              icon: FileText,
              title: "Documents",
              body: "Preparez les pieces utiles pour la mise en vente.",
            },
            {
              icon: MessageSquare,
              title: "Messages agence",
              body: "Retrouvez les conseils et points de suivi de l'agence.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-border bg-card p-6"
            >
              <item.icon className="h-5 w-5 text-gold" />
              <div className="mt-4 font-display text-xl">{item.title}</div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {item.body}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-border bg-secondary/50 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-sm font-medium">
                <CheckCircle2 className="h-4 w-4 text-gold" />
                Connexion vendeur validee
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Cette page est accessible uniquement aux comptes avec le role
                vendeur.
              </p>
            </div>
            <Button asChild className="rounded-full">
              <Link to="/vendeur">Ouvrir l’espace vendeur</Link>
            </Button>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
