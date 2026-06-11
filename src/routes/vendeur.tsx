import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  CalendarClock,
  CheckCircle2,
  FileText,
  Home,
  LogOut,
  MessageSquare,
  PhoneCall,
} from "lucide-react";

import { ProtectedRoute } from "@/components/protected-route";
import { SiteLayout } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { agencyConfig } from "@/lib/agency-config";
import { fakeVisits } from "@/lib/demo-store";

export const Route = createFileRoute("/vendeur")({
  head: () => ({
    meta: [
      { title: "Espace vendeur - Signature Immobilier" },
      {
        name: "description",
        content: "Suivi privé de vente Signature Immobilier.",
      },
    ],
  }),
  component: VendeurRoute,
});

function VendeurRoute() {
  return (
    <ProtectedRoute role="seller">
      <VendeurSpace />
    </ProtectedRoute>
  );
}

function VendeurSpace() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const seller = agencyConfig.sellers.find(
    (item) => item.email.toLowerCase() === profile?.email?.toLowerCase(),
  );
  const property =
    agencyConfig.properties.find((item) => item.id === seller?.propertyId) ??
    agencyConfig.properties[0];
  const agent = agencyConfig.agents.find(
    (item) => item.id === property.agentId,
  );
  const agentInitials = agent
    ? agent.name
        .split(" ")
        .map((part) => part[0])
        .join("")
    : "SI";
  const visit = fakeVisits.find((item) => item.propertyId === property.id);

  async function onSignOut() {
    await signOut();
    navigate({ to: "/mon-suivi", replace: true });
  }

  return (
    <SiteLayout>
      <section className="border-b border-border bg-secondary/40">
        <div className="mx-auto flex max-w-7xl flex-wrap items-end justify-between gap-6 px-5 py-10 md:px-8 md:py-14">
          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
              Espace vendeur
            </div>
            <h1 className="mt-2 font-display text-3xl md:text-5xl">
              Votre suivi de vente
            </h1>
            <p className="mt-3 text-muted-foreground">{profile?.email}</p>
          </div>
          <Button
            variant="outline"
            className="rounded-full"
            onClick={onSignOut}
          >
            <LogOut className="h-4 w-4" />
            Déconnexion
          </Button>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-5 py-10 md:px-8 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-8">
          <div className="overflow-hidden rounded-3xl border border-border bg-card">
            <img
              src={property.coverImage}
              alt={property.title}
              className="h-64 w-full object-cover"
            />
            <div className="p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="font-display text-3xl">{property.title}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {property.address}, {property.city}
                  </p>
                </div>
                <div className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
                  {property.price}
                </div>
              </div>
              <div className="mt-6 grid gap-3 text-sm sm:grid-cols-4">
                <Info label="Surface" value={`${property.surface} m²`} />
                <Info label="Pièces" value={`${property.rooms}`} />
                <Info label="Chambres" value={`${property.bedrooms}`} />
                <Info label="DPE" value={property.dpe} />
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card p-6">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-gold" />
              Progression de la vente
            </div>
            <div className="mt-6 space-y-4">
              {agencyConfig.saleProgress.map((step, index) => {
                const currentIndex = agencyConfig.saleProgress.indexOf(
                  property.currentStep,
                );
                const done = index <= currentIndex;
                return (
                  <div key={step} className="flex items-center gap-4">
                    <div
                      className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border ${
                        done
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background text-muted-foreground"
                      }`}
                    >
                      {done ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <span className="text-xs">{index + 1}</span>
                      )}
                    </div>
                    <div className="flex-1 rounded-xl border border-border bg-secondary/40 px-4 py-3">
                      <div className="font-medium">{step}</div>
                      <div className="text-xs text-muted-foreground">
                        {done ? "Étape validée" : "À venir"}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-border bg-card p-6">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
              <PhoneCall className="h-4 w-4 text-gold" />
              Conseiller référent
            </div>
            <div className="mt-5 flex items-center gap-4">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-secondary font-medium">
                {agentInitials}
              </div>
              <div>
                <div className="font-medium">{agent?.name}</div>
                <div className="text-sm text-muted-foreground">
                  {agent?.phone}
                </div>
              </div>
            </div>
            <a
              href={agent?.phoneHref ?? agencyConfig.contact.phoneHref}
              className="mt-5 inline-flex w-full justify-center rounded-full bg-primary px-4 py-3 text-sm font-medium text-primary-foreground"
            >
              Appeler l’agence
            </a>
          </div>

          <Panel
            icon={<CalendarClock className="h-4 w-4 text-gold" />}
            title="Prochaine visite"
          >
            <div className="font-medium">{property.nextVisit}</div>
            <p className="mt-2 text-sm text-muted-foreground">
              L’agence mettra à jour les retours après la visite.
            </p>
          </Panel>

          <Panel
            icon={<MessageSquare className="h-4 w-4 text-gold" />}
            title="Dernier compte rendu"
          >
            <p className="text-sm leading-relaxed text-muted-foreground">
              {visit?.resume ?? "Aucun compte rendu disponible pour le moment."}
            </p>
          </Panel>

          <Panel
            icon={<FileText className="h-4 w-4 text-gold" />}
            title="Documents"
          >
            <div className="space-y-2">
              {property.documents.map((document) => (
                <div
                  key={document.name}
                  className="flex items-center justify-between rounded-xl bg-secondary/50 px-3 py-2 text-sm"
                >
                  <span>{document.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {document.status}
                  </span>
                </div>
              ))}
            </div>
          </Panel>

          <Panel icon={<Home className="h-4 w-4 text-gold" />} title="Bien">
            <p className="text-sm leading-relaxed text-muted-foreground">
              {property.description}
            </p>
          </Panel>
        </aside>
      </section>
    </SiteLayout>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-secondary/40 p-4">
      <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-2 font-medium">{value}</div>
    </div>
  );
}

function Panel({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-border bg-card p-6">
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
        {icon}
        {title}
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}
