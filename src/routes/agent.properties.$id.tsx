import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  CalendarDays,
  Camera,
  CheckCircle2,
  ClipboardList,
  ExternalLink,
  FileText,
  Home,
  MapPin,
  Pencil,
  Ruler,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
  type ComponentType,
  type ReactNode,
} from "react";

import {
  PrivateCard,
  PrivateSectionTitle,
  PrivateShell,
  PrivateStatusBadge,
} from "@/components/private-shell";
import { ProtectedRoute } from "@/components/protected-route";
import { SellerSpaceCreator } from "@/components/seller-space-creator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AGENT_DOCUMENTS,
  AGENT_PROGRESS_STEPS,
  AGENT_PROPERTY_TYPES,
  AGENT_SALE_STATUSES,
  deleteAgentListing,
  getAgentListings,
  getProgressStepIndex,
  readDeletedAgentListingIds,
  readLocalAgentListings,
  upsertLocalAgentListing,
  type AgentListing,
  type ManagedListing,
} from "@/lib/agent-listings";
import { agencyConfig } from "@/lib/agency-config";

export const Route = createFileRoute("/agent/properties/$id")({
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
  const navigate = useNavigate();
  const [createdListings, setCreatedListings] = useState<AgentListing[]>([]);
  const [deletedListingIds, setDeletedListingIds] = useState<string[]>([]);
  const [localListingsLoaded, setLocalListingsLoaded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<AgentListing | null>(null);

  useEffect(() => {
    refreshListings();
    setLocalListingsLoaded(true);
  }, []);

  const listings = useMemo(
    () => getAgentListings(createdListings, deletedListingIds),
    [createdListings, deletedListingIds],
  );
  const listing = listings.find((item) => item.id === id);

  useEffect(() => {
    if (listing && !editForm) {
      setEditForm(toEditableListing(listing));
    }
  }, [editForm, listing]);

  function refreshListings() {
    setCreatedListings(readLocalAgentListings());
    setDeletedListingIds(readDeletedAgentListingIds());
  }

  function openEditor(mode: "details" | "photos" = "details") {
    if (!listing) return;
    setEditForm(toEditableListing(listing));
    setIsEditing(true);

    window.setTimeout(() => {
      document
        .getElementById(mode === "photos" ? "photos-editor" : "property-editor")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
  }

  function onSaveListing(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!listing || !editForm) return;

    const nextListings = upsertLocalAgentListing({
      ...listing,
      ...editForm,
      id: listing.id,
      coverImage: editForm.photos?.[0],
      photos: editForm.photos ?? listing.photos,
    });

    setCreatedListings(nextListings);
    setEditForm(null);
    setIsEditing(false);
  }

  async function onAddPhotos(files: FileList | null) {
    const newPhotos = await readImageFiles(files);
    if (!newPhotos.length) return;

    setEditForm((current) => {
      if (!current) return current;
      const existingPhotos = current.photos ?? [];
      const photos = [...existingPhotos, ...newPhotos];

      return {
        ...current,
        coverImage: photos[0],
        photos,
      };
    });
  }

  function onRemovePhoto(index: number) {
    setEditForm((current) => {
      if (!current) return current;
      const photos = (current.photos ?? []).filter(
        (_, itemIndex) => itemIndex !== index,
      );

      return {
        ...current,
        coverImage: photos[0],
        photos,
      };
    });
  }

  function onDeleteListing() {
    if (
      !window.confirm(
        "Êtes-vous sûr de vouloir supprimer ce bien ? Cette action est irréversible.",
      )
    ) {
      return;
    }

    deleteAgentListing(id);
    navigate({ to: "/agent", replace: true });
  }

  function onSellerSpaceReady() {
    if (!listing) return;

    const nextListings = upsertLocalAgentListing({
      ...listing,
      sellerSpaceStatus: "created",
    });

    setCreatedListings(nextListings);
  }

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
  const photos = listing.photos.length ? listing.photos : [listing.coverImage];
  const specs = getEssentialSpecs(listing);
  const sellerSpaceCreated = listing.sellerSpaceStatus === "created";

  return (
    <PrivateShell>
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-5 md:px-8 md:pb-20 md:pt-10">
        <BackToListings />

        <section className="mt-5 overflow-hidden rounded-[28px] border border-[#e8e0d5] bg-white shadow-[0_24px_70px_rgba(17,24,39,0.06)] md:rounded-[32px]">
          <div className="overflow-hidden bg-[#f3eee6]">
            <img
              src={photos[0]}
              alt={listing.title}
              className="h-[300px] w-full object-cover sm:h-[420px] lg:h-[520px]"
            />
          </div>

          {photos.length > 1 && (
            <div className="flex gap-3 overflow-x-auto border-b border-[#eee6db] px-5 py-4">
              {photos.slice(0, 8).map((photo, index) => (
                <img
                  key={`${photo}-${index}`}
                  src={photo}
                  alt={`${listing.title} ${index + 1}`}
                  className="h-20 w-28 shrink-0 rounded-2xl object-cover"
                />
              ))}
            </div>
          )}

          <div className="p-5 md:p-10">
            <div className="flex flex-wrap items-center gap-2">
              <PrivateStatusBadge status={listing.saleStatus} />
              <PrivateStatusBadge
                status={
                  sellerSpaceCreated
                    ? "Espace vendeur créé"
                    : "Espace vendeur non créé"
                }
              />
            </div>

            <h1 className="mt-5 font-display text-4xl leading-none tracking-tight text-primary md:text-6xl">
              {listing.title}
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-primary/55">
              <span className="inline-flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary/40" />
                {listing.city}
              </span>
              <span className="font-medium text-primary">{listing.price}</span>
            </div>

            <p className="mt-6 max-w-3xl text-sm leading-relaxed text-primary/60 md:text-base">
              {listing.description ||
                "Aucune description n’est encore renseignée pour cette annonce."}
            </p>

            <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Button
                type="button"
                className="rounded-full"
                onClick={() => openEditor("details")}
              >
                <Pencil className="h-4 w-4" />
                Modifier le bien
              </Button>
              <Button
                type="button"
                variant="outline"
                className="rounded-full bg-white"
                onClick={() => openEditor("photos")}
              >
                <Camera className="h-4 w-4" />
                Gérer les photos
              </Button>
              {sellerSpaceCreated ? (
                <Button
                  asChild
                  variant="outline"
                  className="rounded-full bg-white"
                >
                  <Link to="/mon-suivi">
                    <ExternalLink className="h-4 w-4" />
                    Voir l’espace vendeur
                  </Link>
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full bg-white"
                  onClick={() =>
                    document
                      .getElementById("seller-space-panel")
                      ?.scrollIntoView({ behavior: "smooth", block: "start" })
                  }
                >
                  <UserRound className="h-4 w-4" />
                  Créer l’espace vendeur
                </Button>
              )}
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {specs.map((spec) => (
                <InfoBlock
                  key={spec.label}
                  icon={spec.icon}
                  label={spec.label}
                  value={spec.value}
                />
              ))}
            </div>
          </div>
        </section>

        {isEditing && editForm && (
          <PrivateCard id="property-editor" className="mt-7 p-5 md:p-8">
            <PrivateSectionTitle
              title="Modifier le bien"
              description="Mettez à jour les informations utiles à l’annonce. Les changements restent centrés sur ce bien."
            />
            <form
              className="mt-7 grid gap-4 md:grid-cols-2"
              onSubmit={onSaveListing}
            >
              <Field label="Titre de l’annonce">
                <Input
                  value={editForm.title}
                  onChange={(event) =>
                    setEditForm({ ...editForm, title: event.target.value })
                  }
                  required
                />
              </Field>
              <Field label="Type de bien">
                <SelectField
                  value={editForm.propertyType}
                  options={AGENT_PROPERTY_TYPES}
                  onChange={(value) =>
                    setEditForm({ ...editForm, propertyType: value })
                  }
                />
              </Field>
              <Field label="Ville">
                <Input
                  value={editForm.city}
                  onChange={(event) =>
                    setEditForm({ ...editForm, city: event.target.value })
                  }
                  required
                />
              </Field>
              <Field label="Quartier / adresse">
                <Input
                  value={editForm.address}
                  onChange={(event) =>
                    setEditForm({ ...editForm, address: event.target.value })
                  }
                />
              </Field>
              <Field label="Prix">
                <Input
                  value={editForm.price}
                  onChange={(event) =>
                    setEditForm({ ...editForm, price: event.target.value })
                  }
                  required
                />
              </Field>
              <Field label="Statut">
                <SelectField
                  value={editForm.saleStatus}
                  options={AGENT_SALE_STATUSES}
                  onChange={(value) =>
                    setEditForm({ ...editForm, saleStatus: value })
                  }
                />
              </Field>
              <Field label="Surface">
                <Input
                  value={editForm.surface}
                  onChange={(event) =>
                    setEditForm({ ...editForm, surface: event.target.value })
                  }
                />
              </Field>
              <Field label="Pièces">
                <Input
                  value={editForm.rooms}
                  onChange={(event) =>
                    setEditForm({ ...editForm, rooms: event.target.value })
                  }
                />
              </Field>
              <Field label="Chambres">
                <Input
                  value={editForm.bedrooms}
                  onChange={(event) =>
                    setEditForm({ ...editForm, bedrooms: event.target.value })
                  }
                />
              </Field>
              <Field label="Extérieur">
                <Input
                  value={editForm.exterior}
                  onChange={(event) =>
                    setEditForm({ ...editForm, exterior: event.target.value })
                  }
                />
              </Field>
              <Field label="Garage / parking">
                <Input
                  value={editForm.parking}
                  onChange={(event) =>
                    setEditForm({ ...editForm, parking: event.target.value })
                  }
                />
              </Field>
              <Field label="Téléphone vendeur">
                <Input
                  value={editForm.sellerPhone}
                  onChange={(event) =>
                    setEditForm({
                      ...editForm,
                      sellerPhone: event.target.value,
                    })
                  }
                />
              </Field>
              <Field label="Description de l’annonce" className="md:col-span-2">
                <Textarea
                  value={editForm.description}
                  onChange={(event) =>
                    setEditForm({
                      ...editForm,
                      description: event.target.value,
                    })
                  }
                  className="min-h-36"
                  required
                />
              </Field>

              <div id="photos-editor" className="space-y-3 md:col-span-2">
                <Label>Photos du bien</Label>
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(event) => onAddPhotos(event.target.files)}
                />
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {(editForm.photos ?? []).map((photo, index) => (
                    <div key={`${photo}-${index}`} className="relative">
                      <img
                        src={photo}
                        alt={`Photo ${index + 1} du bien`}
                        className="aspect-[4/3] w-full rounded-2xl object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => onRemovePhoto(index)}
                        className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-white/95 text-primary shadow-sm"
                        aria-label="Retirer cette photo"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row md:col-span-2">
                <Button className="rounded-full" size="lg">
                  Enregistrer les modifications
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full bg-white"
                  size="lg"
                  onClick={() => {
                    setEditForm(toEditableListing(listing));
                    setIsEditing(false);
                  }}
                >
                  Annuler
                </Button>
              </div>
            </form>
          </PrivateCard>
        )}

        <section className="mt-7 grid gap-7 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="space-y-7">
            <PrivateCard className="p-5 md:p-8">
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

            <PrivateCard className="p-5 md:p-8">
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
            <PrivateCard className="p-5 md:p-8">
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

            <PrivateCard className="p-5 md:p-8">
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

        <section id="seller-space-panel" className="mt-7">
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
            sellerSpaceExists={sellerSpaceCreated}
            onSpaceReady={onSellerSpaceReady}
          />
        </section>

        <section className="mt-7 rounded-[24px] border border-red-100 bg-white p-5 md:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-2xl text-primary">
                Zone de suppression
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-primary/55">
                Supprimez uniquement cette annonce. Les autres biens de l’agence
                restent inchangés.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              className="rounded-full border-red-200 bg-white text-red-700 hover:bg-red-50"
              onClick={onDeleteListing}
            >
              <Trash2 className="h-4 w-4" />
              Supprimer le bien
            </Button>
          </div>
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

function SelectField({
  value,
  options,
  onChange,
}: {
  value?: string;
  options: readonly string[];
  onChange: (value: string) => void;
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}

function getEssentialSpecs(listing: ManagedListing) {
  return [
    { icon: Home, label: "Type", value: listing.propertyType },
    {
      icon: Ruler,
      label: "Surface",
      value: listing.surface ? `${listing.surface} m²` : "",
    },
    { icon: Home, label: "Pièces", value: listing.rooms },
    { icon: Home, label: "Chambres", value: listing.bedrooms },
    { icon: MapPin, label: "Adresse", value: listing.address || listing.city },
    { icon: Home, label: "Extérieur", value: listing.exterior },
    { icon: Home, label: "Parking", value: listing.parking },
  ].filter((item) => item.value);
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

function toEditableListing(listing: ManagedListing): AgentListing {
  return {
    id: listing.id,
    title: listing.title,
    propertyType: listing.propertyType,
    city: listing.city,
    address: listing.address,
    price: listing.price,
    surface: listing.surface,
    rooms: listing.rooms,
    bedrooms: listing.bedrooms,
    bathrooms: listing.bathrooms,
    exterior: listing.exterior,
    parking: listing.parking,
    description: listing.description,
    sellerFirstName: listing.sellerFirstName,
    sellerLastName: listing.sellerLastName,
    sellerEmail: listing.sellerEmail,
    sellerPhone: listing.sellerPhone,
    coverImage: listing.coverImage,
    photos: listing.photos.slice(),
    saleStatus: listing.saleStatus,
    sellerSpaceStatus: listing.sellerSpaceStatus,
    documents: listing.documents.slice(),
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

function normalize(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}
