import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  BarChart3,
  CheckCircle2,
  ClipboardList,
  LogOut,
  Users,
} from "lucide-react";

import { ProtectedRoute } from "@/components/protected-route";
import { SiteLayout } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/agent-dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard agent - Signature Immobilier" },
      { name: "description", content: "Espace protege agent immobilier." },
    ],
  }),
  component: AgentDashboardRoute,
});

function AgentDashboardRoute() {
  return (
    <ProtectedRoute role="agent">
      <AgentDashboard />
    </ProtectedRoute>
  );
}

function AgentDashboard() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  async function onSignOut() {
    await signOut();
    navigate({ to: "/mon-suivi", replace: true });
  }

  return (
    <SiteLayout>
      <section className="border-b border-border bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-7xl flex-wrap items-end justify-between gap-6 px-5 py-10 md:px-8 md:py-12">
          <div>
            <div className="text-xs uppercase tracking-[0.25em] opacity-70">
              Dashboard agent immobilier
            </div>
            <h1 className="mt-2 font-display text-3xl md:text-5xl">
              Pilotage des vendeurs et prospects.
            </h1>
            <p className="mt-3 opacity-80">{profile?.email}</p>
          </div>
          <Button
            variant="secondary"
            className="rounded-full"
            onClick={onSignOut}
          >
            <LogOut className="h-4 w-4" />
            Deconnexion
          </Button>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-12 md:px-8">
        <div className="grid gap-5 md:grid-cols-3">
          {[
            {
              icon: ClipboardList,
              title: "Prospects vendeurs",
              value: "12",
            },
            {
              icon: Users,
              title: "Comptes vendeurs",
              value: "7",
            },
            {
              icon: BarChart3,
              title: "Actions a suivre",
              value: "3",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-border bg-card p-6"
            >
              <item.icon className="h-5 w-5 text-gold" />
              <div className="mt-4 font-display text-4xl">{item.value}</div>
              <p className="mt-1 text-sm text-muted-foreground">{item.title}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-border bg-secondary/50 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-sm font-medium">
                <CheckCircle2 className="h-4 w-4 text-gold" />
                Connexion agent validee
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Cette page est accessible uniquement aux comptes avec le role
                agent.
              </p>
            </div>
            <Button asChild className="rounded-full">
              <Link to="/agent">Ouvrir l’espace agent</Link>
            </Button>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
