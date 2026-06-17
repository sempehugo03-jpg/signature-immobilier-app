import { createFileRoute } from "@tanstack/react-router";
import {
  CalendarClock,
  CheckCircle2,
  FileText,
  Home,
  MessageSquare,
  PhoneCall,
} from "lucide-react";

import {
  PrivateCard,
  PrivateHero,
  PrivateShell,
} from "@/components/private-shell";
import { ProtectedRoute } from "@/components/protected-route";
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
  const { profile } = useAuth();
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

  return (
    <PrivateShell>
      <PrivateHero
        title="Votre suivi de vente"
        subtitle={`Bonjour ${seller?.firstName ?? ""}`}
        description="Retrouvez l’essentiel de la vente de votre bien, simplement."
      />

      <section className="mx-auto grid max-w-7xl gap-7 px-5 pb-14 md:px-8 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-7">
          <PrivateCard className="overflow-hidden">
            <img
              src={property.coverImage}
              alt={property.title}
              className="h-72 w-full object-cover"
            />
            <div className="p-6 md:p-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="font-display text-4xl leading-tight">
                    {property.title}
                  </h2>
                  <p className="mt-2 text-sm text-primary/55">
                    {property.address}, {property.city}
                  </p>
                </div>
                <div className="w-fit rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
                  {property.price}
                </div>
              </div>

              <div className="mt-7 grid gap-3 text-sm sm:grid-cols-4">
                <Info label="Surface" value={`${property.surface} m²`} />
                <Info label="Pièces" value={`${property.rooms}`} />
                <Info label="Chambres" value={`${property.bedrooms}`} />
                <Info label="DPE" value={property.dpe} />
              </div>

              <p className="mt-7 text-sm leading-relaxed text-primary/60">
                {property.description}
              </p>
            </div>
          </PrivateCard>

          <PrivateCard className="p-6 md:p-8">
            <div className="flex items-center gap-2 text-sm font-medium text-primary/55">
              <CheckCircle2 className="h-4 w-4" />
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
                          : "border-[#e8e0d5] bg-[#faf7f0] text-primary/40"
                      }`}
                    >
                      {done ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <span className="text-xs">{index + 1}</span>
                      )}
                    </div>
                    <div className="flex-1 rounded-[18px] border border-[#e8e0d5] bg-[#fffdf9] px-4 py-3">
                      <div className="font-medium">{step}</div>
                      <div className="text-xs text-primary/50">
                        {done ? "Étape validée" : "À venir"}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </PrivateCard>
        </div>

        <aside className="space-y-6">
          <PrivateCard className="p-6 md:p-8">
            <div className="flex items-center gap-2 text-sm font-medium text-primary/55">
              <PhoneCall className="h-4 w-4" />
              Conseiller référent
            </div>
            <div className="mt-5 flex items-center gap-4">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-[#faf7f0] font-medium">
                {agentInitials}
              </div>
              <div>
                <div className="font-medium">{agent?.name}</div>
                <div className="text-sm text-primary/55">{agent?.phone}</div>
              </div>
            </div>
            <a
              href={agent?.phoneHref ?? agencyConfig.contact.phoneHref}
              className="mt-5 inline-flex w-full justify-center rounded-full bg-primary px-4 py-3 text-sm font-medium text-primary-foreground"
            >
              Appeler l’agence
            </a>
          </PrivateCard>

          <Panel
            icon={<CalendarClock className="h-4 w-4" />}
            title="Prochaine visite"
          >
            <div className="font-medium">{property.nextVisit}</div>
            <p className="mt-2 text-sm text-primary/55">
              L’agence mettra à jour les retours après la visite.
            </p>
          </Panel>

          <Panel
            icon={<MessageSquare className="h-4 w-4" />}
            title="Dernier compte rendu"
          >
            <p className="text-sm leading-relaxed text-primary/55">
              {visit?.resume ?? "Aucun compte rendu disponible pour le moment."}
            </p>
          </Panel>

          <Panel icon={<FileText className="h-4 w-4" />} title="Documents">
            <div className="space-y-2">
              {property.documents.map((document) => (
                <div
                  key={document.name}
                  className="flex items-center justify-between rounded-[16px] bg-[#faf7f0] px-3 py-2 text-sm"
                >
                  <span>{document.name}</span>
                  <span className="text-xs text-primary/45">
                    {document.status}
                  </span>
                </div>
              ))}
            </div>
          </Panel>

          <Panel icon={<Home className="h-4 w-4" />} title="Description">
            <p className="text-sm leading-relaxed text-primary/55">
              {property.description}
            </p>
          </Panel>
        </aside>
      </section>
    </PrivateShell>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[18px] border border-[#e8e0d5] bg-[#fffdf9] p-4">
      <div className="text-xs uppercase tracking-[0.16em] text-primary/40">
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
    <PrivateCard className="p-6 md:p-8">
      <div className="flex items-center gap-2 text-sm font-medium text-primary/55">
        {icon}
        {title}
      </div>
      <div className="mt-4">{children}</div>
    </PrivateCard>
  );
}
