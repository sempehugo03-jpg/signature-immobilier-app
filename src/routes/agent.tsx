import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, FileText, Plus, UserRound } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState, type ReactNode } from "react";

import {
  PrivateCard,
  PrivateHero,
  PrivateSectionTitle,
  PrivateShell,
  PrivateStatusBadge,
} from "@/components/private-shell";
import { ProtectedRoute } from "@/components/protected-route";
import { SellerSpaceCreator } from "@/components/seller-space-creator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { agencyConfig } from "@/lib/agency-config";
import { getAgencyForUser, type AgencySummary } from "@/lib/access-invitations";

const LOCAL_LISTINGS_KEY = "signature_agent_listings";
const SALE_STEPS = [
  "En préparation",
  "En commercialisation",
  "Offre en cours",
  "Compromis signé",
  "Vendu",
];

type AgentListing = {
  id: string;
  title: string;
  city: string;
  address: string;
  price: string;
  surface: string;
  rooms: string;
  sellerFirstName: string;
  sellerLastName: string;
  sellerEmail: string;
  sellerPhone: string;
  coverImage?: string;
  saleStatus?: string;
  sellerSpaceStatus?: "created" | "not_created";
  documents?: Array<{ name: string; status: string }>;
};

type ManagedListing = Required<
  Pick<
    AgentListing,
    | "id"
    | "title"
    | "city"
    | "address"
    | "price"
    | "surface"
    | "rooms"
    | "sellerFirstName"
    | "sellerLastName"
    | "sellerEmail"
    | "sellerPhone"
    | "coverImage"
    | "saleStatus"
    | "sellerSpaceStatus"
    | "documents"
  >
>;

export const Route = createFileRoute("/agent")({
  head: () => ({
    meta: [
      { title: "Espace agent - Signature Immobilier" },
      {
        name: "description",
        content: "Création et suivi des annonces Signature Immobilier.",
      },
    ],
  }),
  component: AgentRoute,
});

function AgentRoute() {
  return (
    <ProtectedRoute role={["agent", "agency_admin"]}>
      <AgentSpace />
    </ProtectedRoute>
  );
}

function AgentSpace() {
  const { profile } = useAuth();
  const [agency, setAgency] = useState<AgencySummary | null>(null);
  const [createdListings, setCreatedListings] = useState<AgentListing[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [form, setForm] = useState<AgentListing>({
    id: "",
    title: "",
    city: "",
    address: "",
    price: "",
    surface: "",
    rooms: "",
    sellerFirstName: "",
    sellerLastName: "",
    sellerEmail: "",
    sellerPhone: "",
  });

  useEffect(() => {
    async function loadAgency() {
      if (!profile?.email) return;
      setAgency(await getAgencyForUser(profile.email));
    }

    loadAgency();
  }, [profile?.email]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem(LOCAL_LISTINGS_KEY);
    const listings = raw ? (JSON.parse(raw) as AgentListing[]) : [];
    setCreatedListings(listings);
    setSelectedId(listings[0]?.id ?? agencyConfig.properties[0]?.id ?? "");
  }, []);

  const baseListings = useMemo(
    () =>
      agencyConfig.properties.map((property, index): ManagedListing => {
        const seller = agencyConfig.sellers.find(
          (item) => item.id === property.sellerId,
        );
        return {
          id: property.id,
          title: property.title,
          city: property.city,
          address: property.address,
          price: property.price,
          surface: `${property.surface}`,
          rooms: `${property.rooms}`,
          sellerFirstName: seller?.firstName ?? "",
          sellerLastName: seller?.lastName ?? "",
          sellerEmail: seller?.email ?? "",
          sellerPhone: seller?.phone ?? "",
          coverImage: property.coverImage,
          saleStatus: normalizeSaleStatus(property.status),
          sellerSpaceStatus: index % 2 === 0 ? "created" : "not_created",
          documents: property.documents.slice(0, 3),
        };
      }),
    [],
  );

  const listings = useMemo(
    () => [
      ...createdListings.map((listing): ManagedListing => ({
        ...listing,
        coverImage: listing.coverImage ?? agencyConfig.properties[0].coverImage,
        saleStatus: listing.saleStatus ?? "En préparation",
        sellerSpaceStatus: listing.sellerSpaceStatus ?? "not_created",
        documents: listing.documents ?? [
          { name: "Mandat", status: "À préparer" },
          { name: "Diagnostics", status: "À préparer" },
          { name: "Plans", status: "À préparer" },
        ],
      })),
      ...baseListings,
    ],
    [baseListings, createdListings],
  );
  const selectedListing = listings.find((listing) => listing.id === selectedId);

  function onCreateListing(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextListing: AgentListing = {
      ...form,
      id: `listing-${Date.now()}`,
      title: form.title.trim(),
      city: form.city.trim(),
      address: form.address.trim(),
      price: form.price.trim(),
      surface: form.surface.trim(),
      rooms: form.rooms.trim(),
      sellerFirstName: form.sellerFirstName.trim(),
      sellerLastName: form.sellerLastName.trim(),
      sellerEmail: form.sellerEmail.trim(),
      sellerPhone: form.sellerPhone.trim(),
      coverImage: agencyConfig.properties[0].coverImage,
      saleStatus: "En préparation",
      sellerSpaceStatus: "not_created",
      documents: [
        { name: "Mandat", status: "À préparer" },
        { name: "Diagnostics", status: "À préparer" },
        { name: "Plans", status: "À préparer" },
      ],
    };
    const nextListings = [nextListing, ...createdListings];
    setCreatedListings(nextListings);
    setSelectedId(nextListing.id);
    setShowCreateForm(false);
    localStorage.setItem(LOCAL_LISTINGS_KEY, JSON.stringify(nextListings));
    setForm({
      id: "",
      title: "",
      city: "",
      address: "",
      price: "",
      surface: "",
      rooms: "",
      sellerFirstName: "",
      sellerLastName: "",
      sellerEmail: "",
      sellerPhone: "",
    });
  }

  return (
    <PrivateShell>
      <PrivateHero
        title="Espace agent"
        subtitle={`Bonjour ${getFirstName(profile?.full_name ?? profile?.email)}`}
        description="Créez une annonce, puis envoyez au vendeur son espace de suivi."
        action={
          <Button
            type="button"
            className="rounded-full"
            size="lg"
            onClick={() => setShowCreateForm((value) => !value)}
          >
            <Plus className="h-4 w-4" />
            Créer une annonce
          </Button>
        }
      />

      <section className="mx-auto max-w-7xl px-5 pb-14 md:px-8">
        {showCreateForm && (
          <PrivateCard className="mb-7 p-6 md:p-8">
            <PrivateSectionTitle
              title="Nouvelle annonce"
              description="Renseignez le bien et son vendeur. Vous pourrez créer l’espace vendeur ensuite."
            />
            <form
              className="mt-7 grid gap-4 md:grid-cols-2 lg:grid-cols-3"
              onSubmit={onCreateListing}
            >
              <Field label="Titre du bien">
                <Input
                  value={form.title}
                  onChange={(event) =>
                    setForm({ ...form, title: event.target.value })
                  }
                  required
                />
              </Field>
              <Field label="Ville">
                <Input
                  value={form.city}
                  onChange={(event) =>
                    setForm({ ...form, city: event.target.value })
                  }
                  required
                />
              </Field>
              <Field label="Quartier / adresse">
                <Input
                  value={form.address}
                  onChange={(event) =>
                    setForm({ ...form, address: event.target.value })
                  }
                />
              </Field>
              <Field label="Prix">
                <Input
                  value={form.price}
                  onChange={(event) =>
                    setForm({ ...form, price: event.target.value })
                  }
                  placeholder="325 000 €"
                  required
                />
              </Field>
              <Field label="Surface">
                <Input
                  value={form.surface}
                  onChange={(event) =>
                    setForm({ ...form, surface: event.target.value })
                  }
                  placeholder="115"
                />
              </Field>
              <Field label="Pièces">
                <Input
                  value={form.rooms}
                  onChange={(event) =>
                    setForm({ ...form, rooms: event.target.value })
                  }
                  placeholder="5"
                />
              </Field>
              <Field label="Prénom vendeur">
                <Input
                  value={form.sellerFirstName}
                  onChange={(event) =>
                    setForm({ ...form, sellerFirstName: event.target.value })
                  }
                  required
                />
              </Field>
              <Field label="Nom vendeur">
                <Input
                  value={form.sellerLastName}
                  onChange={(event) =>
                    setForm({ ...form, sellerLastName: event.target.value })
                  }
                  required
                />
              </Field>
              <Field label="Email vendeur">
                <Input
                  type="email"
                  value={form.sellerEmail}
                  onChange={(event) =>
                    setForm({ ...form, sellerEmail: event.target.value })
                  }
                  required
                />
              </Field>
              <Field label="Téléphone vendeur">
                <Input
                  type="tel"
                  value={form.sellerPhone}
                  onChange={(event) =>
                    setForm({ ...form, sellerPhone: event.target.value })
                  }
                />
              </Field>
              <div className="flex items-end lg:col-span-2">
                <Button className="w-full rounded-full md:w-auto" size="lg">
                  Créer l’annonce
                </Button>
              </div>
            </form>
          </PrivateCard>
        )}

        <div className="grid gap-7 xl:grid-cols-[0.95fr_1.05fr]">
          <PrivateCard className="p-6 md:p-8">
            <PrivateSectionTitle
              title="Biens de l’agence"
              description={agency?.name ?? "Sélectionnez un bien à gérer."}
            />

            <div className="mt-6 space-y-4">
              {listings.map((listing) => (
                <div
                  key={listing.id}
                  className={`rounded-[22px] border p-4 transition ${
                    selectedId === listing.id
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-[#e8e0d5] bg-[#fffdf9]"
                  }`}
                >
                  <div className="grid gap-4 sm:grid-cols-[132px_1fr]">
                    <img
                      src={listing.coverImage}
                      alt={listing.title}
                      className="h-32 w-full rounded-2xl object-cover"
                    />
                    <div className="min-w-0">
                      <h3 className="font-display text-2xl leading-tight">
                        {listing.title}
                      </h3>
                      <p
                        className={`mt-1 text-sm ${
                          selectedId === listing.id
                            ? "text-primary-foreground/70"
                            : "text-primary/55"
                        }`}
                      >
                        {listing.city} · {listing.price}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <PrivateStatusBadge status={listing.saleStatus} />
                        <PrivateStatusBadge
                          status={
                            listing.sellerSpaceStatus === "created"
                              ? "Créé"
                              : "Non créé"
                          }
                        />
                      </div>
                      <Button
                        type="button"
                        variant={
                          selectedId === listing.id ? "secondary" : "outline"
                        }
                        className="mt-4 rounded-full"
                        onClick={() => setSelectedId(listing.id)}
                      >
                        Gérer
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </PrivateCard>

          <div className="space-y-6">
            {selectedListing ? (
              <>
                <PrivateCard className="overflow-hidden">
                  <img
                    src={selectedListing.coverImage}
                    alt={selectedListing.title}
                    className="h-64 w-full object-cover"
                  />
                  <div className="p-6 md:p-8">
                    <PrivateSectionTitle
                      title="Gérer le bien"
                      description={`${selectedListing.city} · ${selectedListing.price}`}
                    />
                    <div className="mt-5">
                      <PrivateStatusBadge status={selectedListing.saleStatus} />
                    </div>

                    <div className="mt-7 grid gap-4 md:grid-cols-3">
                      <Info label="Surface" value={`${selectedListing.surface} m²`} />
                      <Info label="Pièces" value={selectedListing.rooms || "—"} />
                      <Info label="Adresse" value={selectedListing.address || selectedListing.city} />
                    </div>
                  </div>
                </PrivateCard>

                <PrivateCard className="p-6 md:p-8">
                  <PrivateSectionTitle title="Vendeur" />
                  <div className="mt-5 flex flex-col gap-4 rounded-[20px] border border-[#e8e0d5] bg-[#fffdf9] p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <span className="grid h-11 w-11 place-items-center rounded-full bg-[#faf7f0] text-primary">
                        <UserRound className="h-5 w-5" />
                      </span>
                      <div>
                        <div className="font-medium">
                          {selectedListing.sellerFirstName}{" "}
                          {selectedListing.sellerLastName}
                        </div>
                        <div className="text-sm text-primary/55">
                          {selectedListing.sellerEmail}
                        </div>
                        <div className="text-sm text-primary/55">
                          {selectedListing.sellerPhone || "Téléphone à compléter"}
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" className="rounded-full">
                      Voir le vendeur
                    </Button>
                  </div>
                </PrivateCard>

                <PrivateCard className="p-6 md:p-8">
                  <PrivateSectionTitle title="Avancement de la vente" />
                  <div className="mt-6 space-y-3">
                    {SALE_STEPS.map((step, index) => {
                      const activeIndex = getSaleStepIndex(
                        selectedListing.saleStatus,
                      );
                      const done = index <= activeIndex;
                      return (
                        <div key={step} className="flex items-center gap-3">
                          <span
                            className={`h-3 w-3 rounded-full ${
                              done ? "bg-primary" : "bg-[#d8cfc2]"
                            }`}
                          />
                          <div
                            className={`rounded-full px-4 py-2 text-sm ${
                              done
                                ? "bg-primary text-primary-foreground"
                                : "bg-[#faf7f0] text-primary/55"
                            }`}
                          >
                            {step}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </PrivateCard>

                <PrivateCard className="p-6 md:p-8">
                  <PrivateSectionTitle title="Documents" />
                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    {["Mandat", "Diagnostics", "Plans"].map((name) => (
                      <div
                        key={name}
                        className="rounded-[18px] border border-[#e8e0d5] bg-[#fffdf9] p-4"
                      >
                        <FileText className="h-5 w-5 text-primary/55" />
                        <div className="mt-3 font-medium">{name}</div>
                      </div>
                    ))}
                  </div>
                  <a className="mt-5 inline-flex text-sm font-medium text-primary/60">
                    Voir tous les documents
                  </a>
                </PrivateCard>

                <SellerSpaceCreator
                  key={selectedListing.id}
                  propertyId={selectedListing.id}
                  propertyTitle={selectedListing.title}
                  initialSeller={{
                    firstName: selectedListing.sellerFirstName,
                    lastName: selectedListing.sellerLastName,
                    email: selectedListing.sellerEmail,
                    phone: selectedListing.sellerPhone,
                  }}
                  sellerSpaceExists={selectedListing.sellerSpaceStatus === "created"}
                />
              </>
            ) : (
              <PrivateCard className="p-6 text-sm text-primary/55">
                Aucun bien sélectionné.
              </PrivateCard>
            )}
          </div>
        </div>
      </section>
    </PrivateShell>
  );
}

function normalizeSaleStatus(status: string) {
  if (status.includes("Offre")) return "Offre en cours";
  if (status.includes("Compromis")) return "Compromis signé";
  if (status.includes("Vendu") || status.includes("finalisée")) return "Vendu";
  if (status.includes("Annonce") || status.includes("Visites")) {
    return "En commercialisation";
  }
  return "En préparation";
}

function getSaleStepIndex(status: string) {
  const index = SALE_STEPS.indexOf(status);
  return index >= 0 ? index : 0;
}

function getFirstName(value?: string | null) {
  if (!value) return "";
  return value.split("@")[0].split(/[.\s_-]/)[0] || "";
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[18px] border border-[#e8e0d5] bg-[#fffdf9] p-4">
      <div className="text-xs uppercase tracking-[0.16em] text-primary/40">
        {label}
      </div>
      <div className="mt-2 font-medium text-primary">{value}</div>
    </div>
  );
}
