import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  CalendarDays,
  Clipboard,
  FileText,
  Home,
} from "lucide-react";
import { useEffect, useState } from "react";

import {
  SaasCard,
  SaasHero,
  SaasShell,
  StatusBadge,
} from "@/components/agency-saas-ui";
import { SessionLogoutButton } from "@/components/session-logout-button";
import { Button } from "@/components/ui/button";
import {
  findAgencyPropertyBySellerToken,
  getAgencyBySlug,
  internalProgressLabel,
  type Agency,
  type AgencyProperty,
  type PropertyInternalProgress,
} from "@/lib/agency-saas";

export const Route = createFileRoute("/agence/$slug/vendeur/$sellerToken")({
  head: () => ({
    meta: [{ title: "Suivi vendeur - Signature Immobilier" }],
  }),
  component: AgencySellerRoute,
});

const progressSteps: PropertyInternalProgress[] = [
  "mandate_signed",
  "published",
  "visits",
  "offer_received",
  "compromise_signed",
  "sold",
];

function AgencySellerRoute() {
  const { slug, sellerToken } = Route.useParams();
  const [agency, setAgency] = useState<Agency | null>(null);
  const [property, setProperty] = useState<AgencyProperty | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const nextAgency = getAgencyBySlug(slug);
    setAgency(nextAgency);
    if (nextAgency) {
      setProperty(findAgencyPropertyBySellerToken(nextAgency, sellerToken));
    }
    setLoaded(true);
  }, [slug, sellerToken]);

  if (!loaded) return null;

  if (!agency || !property) {
    return (
      <SaasShell action={<HomeLink />}>
        <SaasHero
          title="Lien invalide ou expiré"
          description="Contactez Signature Immobilier ou votre agence pour recevoir un nouveau lien."
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

  if (agency.status === "disabled") {
    return (
      <SaasShell action={<HomeLink />}>
        <SaasHero
          eyebrow={agency.name}
          title="Ce portail est actuellement désactivé."
          description="Contactez votre agence pour réactiver votre suivi vendeur."
        />
      </SaasShell>
    );
  }

  const heroImage = property.imageUrl || property.image;
  const visibleReports = property.visitReports.filter(
    (report) => report.visibleToSeller,
  );
  const visibleDocuments = property.propertyDocuments.filter(
    (document) => document.visibleToSeller,
  );
  const nextVisit =
    property.visits.find((visit) => visit.status === "planned")?.date ||
    property.nextVisit;
  const currentIndex = Math.max(
    progressSteps.indexOf(property.internalProgress),
    0,
  );

  return (
    <SaasShell action={<HomeLink />}>
      <SaasHero
        eyebrow={agency.name}
        title="Votre suivi de vente"
        description={`Bonjour ${property.sellerFirstName || ""}. Retrouvez les étapes importantes de la vente de votre bien.`}
        action={
          <StatusBadge
            status={internalProgressLabel(property.internalProgress)}
          />
        }
      />

      <section className="mx-auto max-w-7xl px-5 pb-16 md:px-8">
        <Button
          asChild
          variant="outline"
          className="mb-7 rounded-full bg-white"
        >
          <Link to="/">
            <ArrowLeft className="h-4 w-4" />
            Retour à l’accueil
          </Link>
        </Button>

        <div className="grid gap-7 lg:grid-cols-[1.12fr_0.88fr]">
          <div className="space-y-7">
            <SaasCard className="overflow-hidden">
              <img
                src={heroImage}
                alt={property.title}
                className="h-72 w-full object-cover md:h-[420px]"
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

                <div className="mt-7 grid gap-3 text-sm sm:grid-cols-3">
                  <Info label="Surface" value={property.surface} />
                  <Info label="Pièces" value={property.rooms} />
                  <Info label="Chambres" value={property.bedrooms} />
                </div>

                <p className="mt-7 text-sm leading-relaxed text-primary/60">
                  {property.description}
                </p>
              </div>
            </SaasCard>

            <SaasCard className="p-6 md:p-8">
              <div className="flex items-center gap-2 text-sm font-medium text-primary/55">
                <Home className="h-4 w-4" />
                Progression de la vente
              </div>
              <div className="mt-6 space-y-4">
                {progressSteps.map((step, index) => {
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
                        {index + 1}
                      </div>
                      <div className="flex-1 rounded-[18px] border border-[#e8e0d5] bg-[#fffdf9] px-4 py-3">
                        <div className="font-medium">
                          {internalProgressLabel(step)}
                        </div>
                        <div className="text-xs text-primary/50">
                          {done ? "Étape en cours ou validée" : "À venir"}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </SaasCard>
          </div>

          <aside className="space-y-7">
            <Panel
              icon={<CalendarDays className="h-4 w-4" />}
              title="Prochaine visite"
            >
              <div className="font-medium">{nextVisit || "À planifier"}</div>
              <p className="mt-2 text-sm text-primary/55">
                Votre agence mettra à jour cet espace à chaque étape importante.
              </p>
            </Panel>

            <Panel
              icon={<Clipboard className="h-4 w-4" />}
              title="Compte rendu"
            >
              <div className="space-y-3">
                {visibleReports.length === 0 && (
                  <p className="text-sm leading-relaxed text-primary/55">
                    Aucun compte rendu visible pour le moment.
                  </p>
                )}
                {visibleReports.map((report) => (
                  <div
                    key={report.id}
                    className="rounded-[16px] bg-[#faf7f0] px-3 py-3 text-sm"
                  >
                    <div className="font-medium">{report.title}</div>
                    <p className="mt-1 leading-relaxed text-primary/55">
                      {report.content}
                    </p>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel icon={<FileText className="h-4 w-4" />} title="Documents">
              <div className="space-y-2">
                {visibleDocuments.length === 0 && (
                  <p className="text-sm text-primary/55">
                    Aucun document visible pour le moment.
                  </p>
                )}
                {visibleDocuments.map((document) =>
                  document.url ? (
                    <a
                      key={document.id}
                      href={document.url}
                      target="_blank"
                      rel="noreferrer"
                      className="block rounded-[16px] bg-[#faf7f0] px-3 py-2 text-sm font-medium transition hover:bg-[#f2eadc]"
                    >
                      {document.name}
                    </a>
                  ) : (
                    <div
                      key={document.id}
                      className="rounded-[16px] bg-[#faf7f0] px-3 py-2 text-sm"
                    >
                      {document.name}
                    </div>
                  ),
                )}
              </div>
            </Panel>
          </aside>
        </div>
      </section>
    </SaasShell>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[18px] border border-[#e8e0d5] bg-[#fffdf9] p-4">
      <div className="text-xs uppercase tracking-[0.16em] text-primary/40">
        {label}
      </div>
      <div className="mt-2 font-medium">{value || "Non renseigné"}</div>
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
    <SaasCard className="p-6 md:p-8">
      <div className="flex items-center gap-2 text-sm font-medium text-primary/55">
        {icon}
        {title}
      </div>
      <div className="mt-4">{children}</div>
    </SaasCard>
  );
}

function HomeLink() {
  return <SessionLogoutButton />;
}
