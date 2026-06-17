import {
  createFileRoute,
  Link,
  Outlet,
  useRouterState,
} from "@tanstack/react-router";
import { ArrowRight, Plus } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState, type ReactNode } from "react";

import {
  PrivateCard,
  PrivateHero,
  PrivateSectionTitle,
  PrivateShell,
  PrivateStatusBadge,
} from "@/components/private-shell";
import { ProtectedRoute } from "@/components/protected-route";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import {
  AGENT_PROPERTY_TYPES,
  AGENT_SALE_STATUSES,
  getAgentListings,
  readDeletedAgentListingIds,
  readLocalAgentListings,
  writeLocalAgentListings,
  type AgentListing,
} from "@/lib/agent-listings";
import { getAgencyForUser, type AgencySummary } from "@/lib/access-invitations";

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
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const isAgentList = pathname === "/agent" || pathname === "/agent/";

  if (!isAgentList) return <Outlet />;

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
  const [deletedListingIds, setDeletedListingIds] = useState<string[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [form, setForm] = useState<AgentListing>(createEmptyListingForm);

  useEffect(() => {
    async function loadAgency() {
      if (!profile?.email) return;
      setAgency(await getAgencyForUser(profile.email));
    }

    loadAgency();
  }, [profile?.email]);

  useEffect(() => {
    setCreatedListings(readLocalAgentListings());
    setDeletedListingIds(readDeletedAgentListingIds());
  }, []);

  const listings = useMemo(
    () => getAgentListings(createdListings, deletedListingIds),
    [createdListings, deletedListingIds],
  );

  function onCreateListing(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextListing: AgentListing = {
      ...form,
      id: `listing-${Date.now()}`,
      title: form.title.trim(),
      propertyType: form.propertyType?.trim(),
      city: form.city.trim(),
      address: form.address.trim(),
      price: form.price.trim(),
      surface: form.surface.trim(),
      rooms: form.rooms.trim(),
      bedrooms: form.bedrooms?.trim(),
      bathrooms: form.bathrooms?.trim(),
      exterior: form.exterior?.trim(),
      parking: form.parking?.trim(),
      description: form.description?.trim(),
      coverImage: form.photos?.[0],
      photos: form.photos,
      saleStatus: form.saleStatus ?? "En préparation",
      sellerFirstName: form.sellerFirstName.trim(),
      sellerLastName: form.sellerLastName.trim(),
      sellerEmail: form.sellerEmail.trim(),
      sellerPhone: form.sellerPhone.trim(),
      sellerSpaceStatus: "not_created",
      documents: [
        { name: "Mandat", status: "À préparer" },
        { name: "Diagnostics", status: "À préparer" },
        { name: "Offre", status: "À préparer" },
        { name: "Compromis", status: "À préparer" },
      ],
    };
    const nextListings = [nextListing, ...createdListings];
    setCreatedListings(nextListings);
    setShowCreateForm(false);
    writeLocalAgentListings(nextListings);
    setForm(createEmptyListingForm());
  }

  async function onPhotoInput(files: FileList | null) {
    const photos = await readImageFiles(files);
    if (!photos.length) return;

    setForm((current) => ({
      ...current,
      photos,
      coverImage: photos[0],
    }));
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
              <Field label="Titre de l’annonce">
                <Input
                  value={form.title}
                  onChange={(event) =>
                    setForm({ ...form, title: event.target.value })
                  }
                  required
                />
              </Field>
              <Field label="Type de bien">
                <select
                  value={form.propertyType}
                  onChange={(event) =>
                    setForm({ ...form, propertyType: event.target.value })
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  {AGENT_PROPERTY_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
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
              <Field label="Chambres">
                <Input
                  value={form.bedrooms}
                  onChange={(event) =>
                    setForm({ ...form, bedrooms: event.target.value })
                  }
                  placeholder="3"
                />
              </Field>
              <Field label="Extérieur">
                <Input
                  value={form.exterior}
                  onChange={(event) =>
                    setForm({ ...form, exterior: event.target.value })
                  }
                  placeholder="Jardin, balcon, terrasse..."
                />
              </Field>
              <Field label="Garage / parking">
                <Input
                  value={form.parking}
                  onChange={(event) =>
                    setForm({ ...form, parking: event.target.value })
                  }
                  placeholder="Garage, place privative..."
                />
              </Field>
              <Field label="Statut">
                <select
                  value={form.saleStatus}
                  onChange={(event) =>
                    setForm({ ...form, saleStatus: event.target.value })
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  {AGENT_SALE_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </Field>
              <Field
                label="Description de l’annonce"
                className="md:col-span-2 lg:col-span-3"
              >
                <Textarea
                  value={form.description}
                  onChange={(event) =>
                    setForm({ ...form, description: event.target.value })
                  }
                  placeholder="Décrivez le bien, son ambiance, ses atouts et les informations utiles aux acheteurs."
                  className="min-h-32"
                  required
                />
              </Field>
              <Field
                label="Photos du bien"
                className="md:col-span-2 lg:col-span-3"
              >
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(event) => onPhotoInput(event.target.files)}
                />
                {form.photos?.length ? (
                  <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {form.photos.map((photo, index) => (
                      <img
                        key={`${photo}-${index}`}
                        src={photo}
                        alt={`Photo ${index + 1} du bien`}
                        className="aspect-[4/3] w-full rounded-2xl object-cover"
                      />
                    ))}
                  </div>
                ) : null}
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

        <PrivateCard className="p-6 md:p-8">
          <PrivateSectionTitle
            title="Biens de l’agence"
            description={
              agency?.name ??
              "Choisissez une annonce pour ouvrir sa page de gestion dédiée."
            }
          />

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {listings.map((listing) => (
              <div
                key={listing.id}
                className="rounded-[22px] border border-[#e8e0d5] bg-[#fffdf9] p-4 transition hover:-translate-y-0.5 hover:shadow-[0_18px_45px_rgba(17,24,39,0.06)]"
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
                    <p className="mt-1 text-sm text-primary/55">
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
                      asChild
                      variant="outline"
                      className="mt-4 rounded-full"
                    >
                      <Link
                        to="/agent/properties/$id"
                        params={{ id: listing.id }}
                      >
                        Gérer
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </PrivateCard>
      </section>
    </PrivateShell>
  );
}

function getFirstName(value?: string | null) {
  if (!value) return "";
  return value.split("@")[0].split(/[.\s_-]/)[0] || "";
}

function createEmptyListingForm(): AgentListing {
  return {
    id: "",
    title: "",
    propertyType: "Maison",
    city: "",
    address: "",
    price: "",
    surface: "",
    rooms: "",
    bedrooms: "",
    bathrooms: "",
    exterior: "",
    parking: "",
    description: "",
    sellerFirstName: "",
    sellerLastName: "",
    sellerEmail: "",
    sellerPhone: "",
    photos: [],
    saleStatus: "En préparation",
  };
}

async function readImageFiles(files: FileList | null) {
  if (!files?.length) return [];

  return Promise.all(
    Array.from(files).map(
      (file) =>
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.addEventListener("load", () =>
            resolve(String(reader.result ?? "")),
          );
          reader.addEventListener("error", () => reject(reader.error));
          reader.readAsDataURL(file);
        }),
    ),
  );
}

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      <Label>{label}</Label>
      {children}
    </div>
  );
}
