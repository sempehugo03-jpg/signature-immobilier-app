import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  FileText,
  Home,
  MapPin,
  Ruler,
  UserRound,
} from "lucide-react";
import { useEffect, useMemo, useState, type ComponentType } from "react";

import {
  PrivateCard,
  PrivateSectionTitle,
  PrivateShell,
  PrivateStatusBadge,
} from "@/components/private-shell";
import { ProtectedRoute } from "@/components/protected-route";
import { SellerSpaceCreator } from "@/components/seller-space-creator";
import { Button } from "@/components/ui/button";
import {
  AGENT_DOCUMENTS,
  AGENT_PROGRESS_STEPS,
  getAgentListings,
  getProgressStepIndex,
  readLocalAgentListings,
  type AgentListing,
  type ManagedListing,
} from "@/lib/agent-listings";
import { agencyConfig } from "@/lib/agency-config";

export const Route = createFileRoute("/agent/bien/$id")({
  head: () => ({
    meta: [
      { title: "Gestion du bien - Signature Immobilier" },
      {
        name: "description",
        content: "Page de gestion dédiée à un bien de l’espace agent.",
      },
    ],
  }),
  component: AgentPropertyRoute,
});

function AgentPropertyRoute() {
  return (
    <ProtectedRoute role={["agent", "agency_admin"]}>
      <AgentPropertyDetail />
    </ProtectedRoute>
  );
}

function AgentPropertyDetail() {
  const { id } = Route.useParams();
  const [createdListings, setCreatedListings] = useState<AgentListing[]>([]);
  const [localListingsLoaded, setLocalListingsLoaded] = useState(false);

  useEffect(() => {
    setCreatedListings(readLocalAgentListings());
    setLocalListingsLoaded(true);
  }, []);

  const listings = useMemo(
    () => getAgentListings(createdListings),
    [createdListings],
  );
  const listing = listings.find((item) => item.id === id);

  if (!listing) {
    return (
      <PrivateShell>
        <section className="mx-auto max-w-4xl px-5 py-10 md:px-8 md:py-14">
          <BackToListings />
          <PrivateCard className="mt-8 p-8 text-center md:p-12">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[#faf7f0] text-primary">
              <Home className="h-5 w-5" />
            </div>
            <h1 className="mt-5 font-display text-4xl leading-tight text-primary">
              {localListingsLoaded ? "Bien introuvable" : "Chargement du bien"}
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-primary/55">
              {localListingsLoaded
                ? "Cette annonce n’est pas disponible dans votre espace agent."
                : "Nous récupérons les informations de l’annonce."}
            </p>
          </PrivateCard>
        </section>
      </PrivateShell>
    );
  }

  const visit = agencyConfig.visits.find((item) => item.propertyId === id);
  const documents = getDocumentRows(listing);
  const activeProgressIndex = getProgressStepIndex(listing.saleStatus);

  return (
    <PrivateShell>
      <div className="mx-auto max-w-7xl px-5 pb-16 pt-8 md:px-8 md:pb-20 md:pt-10">
        <BackToListings />

        <section className="mt-7 overflow-hidden rounded-[32px] border border-[#e8e0d5] bg-white shadow-[0_24px_70px_rgba(17,24,39,0.06)]">
          <div className="grid gap-0 lg:grid-cols-[1.08fr_0.92fr]">
            <img
              src={listing.coverImage}
              alt={listing.title}
              className="h-[320px] w-full object-cover sm:h-[420px] lg:h-full"
            />
            <div className="p-6 md:p-10">
              <div className="flex flex-wrap items-center gap-3">
                <PrivateStatusBadge status={listing.saleStatus} />
                <PrivateStatusBadge
                  status={
                    listing.sellerSpaceStatus === "created"
                      ? "Espace vendeur créé"
                      : "Espace vendeur non créé"
                  }
                />
              </div>
              <h1 className="mt-6 font-display text-5xl leading-none tracking-tight text-primary md:text-6xl">
                {listing.title}
              </h1>
              <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-primary/55">
                <span className="inline-flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary/40" />
                  {listing.city}
                </span>
                <span className="font-medium text-primary">
                  {listing.price}
                </span>
              </div>
              <p className="mt-6 text-sm leading-relaxed text-primary/55">
                Gestion dédiée de l’annonce, du vendeur, des visites et de
                l’espace vendeur. La liste des biens reste en retrait pour vous
                concentrer sur cette vente.
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                <InfoBlock
                  icon={Ruler}
                  label="Surface"
                  value={`${listing.surface || "—"} m²`}
                />
                <InfoBlock
                  icon={Home}
                  label="Pièces"
                  value={listing.rooms || "—"}
                />
                <InfoBlock
                  icon={MapPin}
                  label="Adresse"
                  value={listing.address || listing.city}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="mt-7 grid gap-7 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="space-y-7">
            <PrivateCard className="p-6 md:p-8">
              <PrivateSectionTitle title="Vendeur" />
              <div className="mt-6 flex items-start gap-4 rounded-[22px] border border-[#e8e0d5] bg-[#fffdf9] p-5">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#faf7f0] text-primary">
                  <UserRound className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <div className="font-display text-2xl leading-tight text-primary">
                    {listing.sellerFirstName} {listing.sellerLastName}
                  </div>
                  <a
                    href={`mailto:${listing.sellerEmail}`}
                    className="mt-2 block text-sm text-primary/55 transition hover:text-primary"
                  >
                    {listing.sellerEmail || "Email à compléter"}
                  </a>
                  <a
                    href={
                      listing.sellerPhone
                        ? `tel:${listing.sellerPhone.replace(/\s/g, "")}`
                        : undefined
                    }
                    className="mt-1 block text-sm text-primary/55 transition hover:text-primary"
                  >
                    {listing.sellerPhone || "Téléphone à compléter"}
                  </a>
                </div>
              </div>
            </PrivateCard>

            <PrivateCard className="p-6 md:p-8">
              <PrivateSectionTitle title="Visites" />
              <div className="mt-6 grid gap-4">
                <VisitBlock
                  icon={CalendarDays}
                  title="Prochaine visite"
                  text={visit?.date ?? getNextVisitLabel(id)}
                />
                <VisitBlock
                  icon={ClipboardList}
                  title="Compte rendu de visite"
                  text={
                    visit?.resume ??
                    "Aucun compte rendu disponible pour le moment."
                  }
                />
              </div>
            </PrivateCard>
          </div>

          <div className="space-y-7">
            <PrivateCard className="p-6 md:p-8">
              <PrivateSectionTitle
                title="Progression"
                description="Suivi synthétique du mandat jusqu’à la vente."
              />
              <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {AGENT_PROGRESS_STEPS.map((step, index) => {
                  const done = index <= activeProgressIndex;
                  return (
                    <div
                      key={step}
                      className={`rounded-[20px] border p-4 ${
                        done
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-[#e8e0d5] bg-[#fffdf9] text-primary/55"
                      }`}
                    >
                      <CheckCircle2
                        className={`h-5 w-5 ${
                          done ? "text-primary-foreground" : "text-primary/30"
                        }`}
                      />
                      <div className="mt-4 font-medium">{step}</div>
                    </div>
                  );
                })}
              </div>
            </PrivateCard>

            <PrivateCard className="p-6 md:p-8">
              <PrivateSectionTitle title="Documents" />
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {documents.map((document) => (
                  <div
                    key={document.name}
                    className="rounded-[20px] border border-[#e8e0d5] bg-[#fffdf9] p-4"
                  >
                    <FileText className="h-5 w-5 text-primary/45" />
                    <div className="mt-4 font-medium text-primary">
                      {document.name}
                    </div>
                    <div className="mt-2">
                      <PrivateStatusBadge status={document.status} />
                    </div>
                  </div>
                ))}
              </div>
            </PrivateCard>
          </div>
        </section>

        <section className="mt-7">
          <SellerSpaceCreator
            key={listing.id}
            propertyId={listing.id}
            propertyTitle={listing.title}
            initialSeller={{
              firstName: listing.sellerFirstName,
              lastName: listing.sellerLastName,
              email: listing.sellerEmail,
              phone: listing.sellerPhone,
            }}
            sellerSpaceExists={listing.sellerSpaceStatus === "created"}
          />
        </section>
      </div>
    </PrivateShell>
  );
}

function BackToListings() {
  return (
    <Button asChild variant="outline" className="rounded-full bg-white">
      <Link to="/agent">
        <ArrowLeft className="h-4 w-4" />
        Retour aux biens
      </Link>
    </Button>
  );
}

function InfoBlock({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[20px] border border-[#e8e0d5] bg-[#fffdf9] p-4">
      <Icon className="h-5 w-5 text-primary/45" />
      <div className="mt-4 text-xs uppercase tracking-[0.16em] text-primary/40">
        {label}
      </div>
      <div className="mt-2 font-medium text-primary">{value}</div>
    </div>
  );
}

function VisitBlock({
  icon: Icon,
  title,
  text,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-[20px] border border-[#e8e0d5] bg-[#fffdf9] p-5">
      <Icon className="h-5 w-5 text-primary/45" />
      <div className="mt-4 font-medium text-primary">{title}</div>
      <p className="mt-2 text-sm leading-relaxed text-primary/55">{text}</p>
    </div>
  );
}

function getDocumentRows(listing: ManagedListing) {
  return AGENT_DOCUMENTS.map((name) => ({
    name,
    status: getDocumentStatus(listing.documents, name),
  }));
}

function getDocumentStatus(
  documents: ManagedListing["documents"],
  expectedName: (typeof AGENT_DOCUMENTS)[number],
) {
  const normalizedExpected = normalize(expectedName);
  const document = documents.find((item) => {
    const normalizedName = normalize(item.name);
    return (
      normalizedName.includes(normalizedExpected) ||
      (expectedName === "Offre" && normalizedName.includes("offre"))
    );
  });

  return document?.status ?? "À préparer";
}

function getNextVisitLabel(propertyId: string) {
  const property = agencyConfig.properties.find(
    (item) => item.id === propertyId,
  );
  return property?.nextVisit ?? "À planifier";
}

function normalize(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}
