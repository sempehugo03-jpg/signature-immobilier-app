import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  CalendarDays,
  Clipboard,
  Copy,
  ExternalLink,
  FileText,
  ImagePlus,
  Link2,
  LogOut,
  Mail,
  Save,
  Trash2,
} from "lucide-react";
import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Field,
  SaasCard,
  SaasHero,
  SaasShell,
  SectionTitle,
  StatusBadge,
} from "@/components/agency-saas-ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { sendInviteEmail } from "@/lib/api/agency-email.functions";
import {
  addPropertyDocument,
  addPropertyPhoto,
  addPropertyVisit,
  addVisitReport,
  deletePropertyDocument,
  deletePropertyPhoto,
  deletePropertyVisit,
  deleteVisitReport,
  getAgencyBySlug,
  getAgencyProperty,
  getPublicPropertyUrl,
  internalProgressLabel,
  publicStatusLabel,
  saveAgencyProperty,
  setMainPropertyPhoto,
  updatePropertyDocumentVisibility,
  updatePropertyVisitStatus,
  updateVisitReportVisibility,
  type Agency,
  type AgencyProperty,
  type DocumentType,
  type PropertyInternalProgress,
  type PropertyPublicStatus,
} from "@/lib/agency-saas";
import { isValidEmail } from "@/lib/email-utils";
import {
  deletePropertyDocumentFile,
  deletePropertyPhotoFile,
  getPropertyUploadErrorMessage,
  uploadPropertyDocument,
  uploadPropertyPhoto,
} from "@/lib/property-storage";
import {
  createSharedSellerInviteForProperty,
  getSharedInviteStorageWarning,
} from "@/lib/shared-invites";

export const Route = createFileRoute("/agence/$slug/biens/$propertyId/gerer")({
  head: () => ({
    meta: [{ title: "Gérer le bien - Signature Immobilier" }],
  }),
  component: AgencyPropertyDetailRoute,
});

const progressSteps: PropertyInternalProgress[] = [
  "mandate_signed",
  "published",
  "visits",
  "offer_received",
  "compromise_signed",
  "sold",
];

const publicStatusOptions: { value: PropertyPublicStatus; label: string }[] = [
  { value: "none", label: "Aucun badge public" },
  { value: "new", label: "Nouveauté" },
  { value: "exclusive", label: "Exclusivité" },
  { value: "favorite", label: "Coup de cœur" },
];

const documentTypes: DocumentType[] = [
  "Mandat",
  "Diagnostics",
  "Offre",
  "Compromis",
  "Autre",
];

function AgencyPropertyDetailRoute() {
  const { slug, propertyId } = Route.useParams();
  const [agency, setAgency] = useState<Agency | null>(null);
  const [property, setProperty] = useState<AgencyProperty | null>(null);
  const [feedback, setFeedback] = useState("");
  const [saving, setSaving] = useState(false);
  const [manualSellerInviteLink, setManualSellerInviteLink] = useState("");
  const [manualSellerInviteMailto, setManualSellerInviteMailto] = useState("");
  const [manualSellerInviteCopied, setManualSellerInviteCopied] =
    useState(false);
  const [sellerError, setSellerError] = useState("");
  const photoInputRef = useRef<HTMLInputElement | null>(null);
  const documentInputRef = useRef<HTMLInputElement | null>(null);
  const [sellerForm, setSellerForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [visitForm, setVisitForm] = useState({
    date: "",
    time: "",
    visitorName: "",
    visitorPhone: "",
    note: "",
  });
  const [reportForm, setReportForm] = useState({
    title: "",
    content: "",
    visibleToSeller: true,
  });
  const [documentForm, setDocumentForm] = useState({
    name: "",
    type: "Mandat" as DocumentType,
    visibleToSeller: true,
  });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const nextAgency = getAgencyBySlug(slug);
    setAgency(nextAgency);
    if (nextAgency) {
      const nextProperty = getAgencyProperty(nextAgency, propertyId);
      setProperty(nextProperty);
      if (nextProperty) {
        setSellerForm({
          firstName: nextProperty.sellerFirstName,
          lastName: nextProperty.sellerLastName,
          email: nextProperty.sellerEmail,
          phone: nextProperty.sellerPhone,
        });
      }
    }
    setLoaded(true);
  }, [slug, propertyId]);

  const publicUrl = useMemo(
    () => (property ? getPublicPropertyUrl(property) : ""),
    [property],
  );

  if (!loaded) return null;

  if (!agency || !property) {
    return (
      <SaasShell action={<LogoutLink />}>
        <section className="mx-auto max-w-3xl px-5 py-16 text-center md:px-8">
          <SaasCard className="p-8 md:p-12">
            <h1 className="font-display text-4xl">
              Cette agence n’est plus active sur Signature Immobilier.
            </h1>
            <Button asChild className="mt-6 rounded-full">
              <Link to="/agence/$slug" params={{ slug }}>
                Retour aux biens
              </Link>
            </Button>
          </SaasCard>
        </section>
      </SaasShell>
    );
  }

  const lockedMessage =
    agency.status === "disabled"
      ? "Votre portail est actuellement désactivé. Contactez Signature Immobilier pour le réactiver."
      : agency.status === "demo"
        ? "Votre agence est actuellement en version démo."
        : "";
  const canEdit = agency.status === "active";
  const heroImage = property.imageUrl || property.image;
  const currentProgressIndex = Math.max(
    progressSteps.indexOf(property.internalProgress),
    0,
  );

  function updateProperty(nextProperty: AgencyProperty, message?: string) {
    saveAgencyProperty(nextProperty);
    setProperty(nextProperty);
    if (message) setFeedback(message);
  }

  function onSaveInfo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!property) return;
    setSaving(true);
    updateProperty(
      {
        ...property,
        addressOrDistrict: property.addressOrDistrict || property.address,
        updatedAt: new Date().toISOString(),
      },
      "Annonce mise à jour.",
    );
    window.setTimeout(() => setSaving(false), 250);
  }

  async function onPhotoFilesSelected(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (!agency || !property || !files.length) return;

    setUploadingPhotos(true);
    setFeedback("Envoi des photos…");
    let nextProperty = property;

    try {
      for (const file of files) {
        const uploaded = await uploadPropertyPhoto({
          agencySlug: agency.slug,
          propertyId: property.id,
          file,
        });
        nextProperty = addPropertyPhoto(nextProperty, {
          url: uploaded.url,
          storagePath: uploaded.path,
          name: uploaded.name,
          size: uploaded.size,
          type: uploaded.type,
          alt: property.title,
          isMain: !nextProperty.photos.some((photo) => photo.storagePath),
        });
      }

      setProperty(nextProperty);
      setFeedback(files.length > 1 ? "Photos ajoutées." : "Photo ajoutée.");
    } catch (error) {
      console.info("Upload photo non finalisé", error);
      setProperty(nextProperty);
      setFeedback(getPropertyUploadErrorMessage(error, "photo"));
    } finally {
      setUploadingPhotos(false);
    }
  }

  async function onDeletePhoto(photoId: string) {
    if (!property) return;
    const photo = property.photos.find((item) => item.id === photoId);
    setProperty(deletePropertyPhoto(property, photoId));
    setFeedback("Photo supprimée.");
    await deletePropertyPhotoFile(photo?.storagePath);
  }

  function onAddVisit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!property || !visitForm.date.trim()) return;
    const nextProperty = addPropertyVisit(property, {
      date: visitForm.date,
      time: visitForm.time,
      visitorName: visitForm.visitorName,
      visitorPhone: visitForm.visitorPhone,
      note: visitForm.note,
    });
    setProperty(nextProperty);
    setVisitForm({
      date: "",
      time: "",
      visitorName: "",
      visitorPhone: "",
      note: "",
    });
    setFeedback("Visite ajoutée.");
  }

  function onAddReport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!property || !reportForm.content.trim()) return;
    const nextProperty = addVisitReport(property, {
      title: reportForm.title.trim() || "Compte rendu de visite",
      content: reportForm.content.trim(),
      visibleToSeller: reportForm.visibleToSeller,
    });
    setProperty(nextProperty);
    setReportForm({ title: "", content: "", visibleToSeller: true });
    setFeedback("Compte rendu ajouté.");
  }

  function onAddDocument(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    documentInputRef.current?.click();
  }

  async function onDocumentFileSelected(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!agency || !property || !file) return;

    setUploadingDocument(true);
    setFeedback("Envoi du document…");

    try {
      const uploaded = await uploadPropertyDocument({
        agencySlug: agency.slug,
        propertyId: property.id,
        file,
      });
      const nextProperty = addPropertyDocument(property, {
        name: documentForm.name.trim() || getFileDisplayName(uploaded.name),
        type: documentForm.type,
        documentType: documentForm.type,
        storagePath: uploaded.path,
        url: uploaded.url,
        fileName: uploaded.name,
        size: uploaded.size,
        mimeType: uploaded.type,
        visibleToSeller: documentForm.visibleToSeller,
      });
      setProperty(nextProperty);
      setDocumentForm({
        name: "",
        type: "Mandat",
        visibleToSeller: true,
      });
      setFeedback("Document ajouté.");
    } catch (error) {
      console.info("Upload document non finalisé", error);
      setFeedback(getPropertyUploadErrorMessage(error, "document"));
    } finally {
      setUploadingDocument(false);
    }
  }

  async function onDeleteDocument(documentId: string) {
    if (!property) return;
    const document = property.propertyDocuments.find(
      (item) => item.id === documentId,
    );
    setProperty(deletePropertyDocument(property, documentId));
    setFeedback("Document supprimé.");
    await deletePropertyDocumentFile(document?.storagePath);
  }

  async function onCreateSellerSpace(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    if (!agency || !property) return;
    setManualSellerInviteCopied(false);
    setManualSellerInviteLink("");
    setManualSellerInviteMailto("");
    if (!isValidEmail(sellerForm.email)) {
      setSellerError("Email invalide.");
      return;
    }

    let result;
    try {
      result = await createSharedSellerInviteForProperty(
        agency,
        property,
        sellerForm,
      );
    } catch (error) {
      console.info("Invitation vendeur non préparée", error);
      setSellerError("");
      setFeedback(
        "Invitation vendeur non préparée : base partagée non configurée.",
      );
      return;
    }
    const storageWarning = getSharedInviteStorageWarning(result.persistedIn);
    setProperty(result.property);
    setSellerError("");

    try {
      const sent = await sendInviteEmail({
        data: {
          inviteType: "seller_invite",
          agencyName: agency.name,
          recipientEmail: sellerForm.email,
          recipientFirstName: sellerForm.firstName,
          accessUrl: result.email.accessUrl ?? "",
          propertyTitle: property.title,
        },
      });

      if (sent.sent) {
        setFeedback(
          `Espace vendeur créé. Email d’invitation envoyé.${storageWarning}`,
        );
        return;
      }
    } catch (error) {
      console.info("Invitation vendeur non envoyée", error);
    }

    setManualSellerInviteLink(result.email.accessUrl ?? "");
    setManualSellerInviteMailto(result.email.mailtoHref);
    setFeedback(
      `Invitation vendeur créée. Email non envoyé : configuration email manquante.${storageWarning}`,
    );
  }

  async function onCopyManualSellerInviteLink() {
    if (!manualSellerInviteLink) return;
    await navigator.clipboard?.writeText(manualSellerInviteLink);
    setManualSellerInviteCopied(true);
  }

  function onOpenManualSellerInviteLink() {
    if (!manualSellerInviteLink) return;
    const opened = window.open(
      manualSellerInviteLink,
      "_blank",
      "noopener,noreferrer",
    );
    if (opened) opened.opener = null;
  }

  return (
    <SaasShell action={<LogoutLink />}>
      <SaasHero
        eyebrow={`${agency.name} - Gestion du bien`}
        title={property.title}
        description="Une page dédiée pour piloter l’annonce, les visites, les documents et l’espace vendeur sans afficher la liste des autres biens."
        action={<StatusBadge status={agency.status} />}
      />

      <section className="mx-auto max-w-6xl px-5 pb-16 md:px-8">
        <div className="mb-7 flex flex-wrap gap-3">
          <Button asChild variant="outline" className="rounded-full bg-white">
            <Link to="/agence/$slug" params={{ slug: agency.slug }}>
              <ArrowLeft className="h-4 w-4" />
              Retour aux biens
            </Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full bg-white">
            <a href={publicUrl} target="_blank" rel="noreferrer">
              <ExternalLink className="h-4 w-4" />
              Visualiser l’annonce
            </a>
          </Button>
        </div>

        {lockedMessage && (
          <div className="mb-7 rounded-[28px] border border-amber-200 bg-amber-50 p-5 text-sm leading-relaxed text-amber-800">
            {lockedMessage}
          </div>
        )}

        {feedback && (
          <div className="mb-7 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            {feedback}
            {manualSellerInviteLink && (
              <div className="mt-3 rounded-2xl bg-white/80 p-3">
                <div className="break-all font-medium">
                  Lien d’invitation vendeur : {manualSellerInviteLink}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="rounded-full bg-white"
                    onClick={() => void onCopyManualSellerInviteLink()}
                  >
                    <Copy className="h-4 w-4" />
                    Copier le lien
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="rounded-full bg-white"
                    onClick={onOpenManualSellerInviteLink}
                  >
                    <ExternalLink className="h-4 w-4" />
                    Ouvrir le lien
                  </Button>
                  {manualSellerInviteMailto && (
                    <Button
                      asChild
                      size="sm"
                      variant="outline"
                      className="rounded-full bg-white"
                    >
                      <a href={manualSellerInviteMailto}>
                        <Mail className="h-4 w-4" />
                        Ouvrir l’application mail
                      </a>
                    </Button>
                  )}
                </div>
                {manualSellerInviteCopied && (
                  <p className="mt-2 text-xs font-medium">Lien copié.</p>
                )}
              </div>
            )}
          </div>
        )}

        <SaasCard className="overflow-hidden">
          <img
            src={heroImage}
            alt={property.title}
            className="h-72 w-full object-cover md:h-[420px]"
          />
          <div className="p-6 md:p-8">
            <div className="flex flex-wrap items-center gap-2">
              {publicStatusLabel(property.publicStatus) && (
                <StatusBadge
                  status={publicStatusLabel(property.publicStatus)}
                />
              )}
              <StatusBadge
                status={property.isPublished ? "publié" : "masqué"}
              />
              <span className="text-sm text-primary/45">{property.city}</span>
            </div>
            <form
              className="mt-7 grid gap-4 md:grid-cols-2"
              onSubmit={onSaveInfo}
            >
              <Field label="Titre du bien" className="md:col-span-2">
                <Input
                  value={property.title}
                  onChange={(event) =>
                    setProperty({ ...property, title: event.target.value })
                  }
                  disabled={!canEdit}
                />
              </Field>
              <Field label="Ville">
                <Input
                  value={property.city}
                  onChange={(event) =>
                    setProperty({ ...property, city: event.target.value })
                  }
                  disabled={!canEdit}
                />
              </Field>
              <Field label="Prix">
                <Input
                  value={property.price}
                  onChange={(event) =>
                    setProperty({ ...property, price: event.target.value })
                  }
                  disabled={!canEdit}
                />
              </Field>
              <Field label="Statut de commercialisation">
                <select
                  value={property.publicStatus}
                  onChange={(event) =>
                    setProperty({
                      ...property,
                      publicStatus: event.target
                        .value as AgencyProperty["publicStatus"],
                    })
                  }
                  disabled={!canEdit}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  {publicStatusOptions.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Publication">
                <select
                  value={property.isPublished ? "published" : "hidden"}
                  onChange={(event) =>
                    setProperty({
                      ...property,
                      isPublished: event.target.value === "published",
                    })
                  }
                  disabled={!canEdit}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="published">Visible publiquement</option>
                  <option value="hidden">Masqué du site public</option>
                </select>
              </Field>
              <Field label="Adresse ou quartier">
                <Input
                  value={property.addressOrDistrict || property.address}
                  onChange={(event) =>
                    setProperty({
                      ...property,
                      address: event.target.value,
                      addressOrDistrict: event.target.value,
                    })
                  }
                  disabled={!canEdit}
                />
              </Field>
              <Field label="Surface">
                <Input
                  value={property.surface}
                  onChange={(event) =>
                    setProperty({ ...property, surface: event.target.value })
                  }
                  disabled={!canEdit}
                />
              </Field>
              <Field label="Pièces">
                <Input
                  value={property.rooms}
                  onChange={(event) =>
                    setProperty({ ...property, rooms: event.target.value })
                  }
                  disabled={!canEdit}
                />
              </Field>
              <Field label="Chambres">
                <Input
                  value={property.bedrooms}
                  onChange={(event) =>
                    setProperty({ ...property, bedrooms: event.target.value })
                  }
                  disabled={!canEdit}
                />
              </Field>
              <Field label="Description" className="md:col-span-2">
                <Textarea
                  value={property.description}
                  onChange={(event) =>
                    setProperty({
                      ...property,
                      description: event.target.value,
                    })
                  }
                  disabled={!canEdit}
                  className="min-h-28"
                />
              </Field>
              <div className="md:col-span-2">
                <Button
                  className="rounded-full"
                  size="lg"
                  disabled={!canEdit || saving}
                >
                  <Save className="h-4 w-4" />
                  {saving
                    ? "Enregistrement..."
                    : "Enregistrer les informations"}
                </Button>
              </div>
            </form>
          </div>
        </SaasCard>

        <div className="mt-7 grid gap-7 lg:grid-cols-[1.05fr_0.95fr]">
          <SaasCard className="p-6 md:p-8">
            <SectionTitle
              title="Progression"
              description="Mandat, annonce, visites, offre, compromis, vente."
            />
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {progressSteps.map((step) => (
                <button
                  key={step}
                  type="button"
                  disabled={!canEdit}
                  className={`rounded-2xl border p-4 text-left text-sm transition ${
                    property.internalProgress === step
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-[#e8e0d5] bg-[#fffdf9] text-primary/65"
                  }`}
                  onClick={() => {
                    const nextProperty = {
                      ...property,
                      internalProgress: step,
                      internalStatus: internalProgressLabel(step),
                    };
                    updateProperty(nextProperty, "Progression enregistrée.");
                  }}
                >
                  {internalProgressLabel(step)}
                </button>
              ))}
            </div>
          </SaasCard>

          <SaasCard className="p-6 md:p-8">
            <SectionTitle title="Caractéristiques essentielles" />
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Info label="Surface" value={property.surface} />
              <Info label="Pièces" value={property.rooms} />
              <Info
                label="Adresse ou quartier"
                value={property.addressOrDistrict || property.address}
              />
              <Info
                label="Étape en cours"
                value={internalProgressLabel(
                  progressSteps[currentProgressIndex] ?? "published",
                )}
              />
            </div>
          </SaasCard>
        </div>

        <SaasCard className="mt-7 p-6 md:p-8">
          <SectionTitle
            title="Photos de l’annonce"
            description="Ajoutez les photos visibles sur la fiche publique du bien."
          />
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={onPhotoFilesSelected}
            />
            <Button
              type="button"
              className="rounded-full"
              disabled={!canEdit || uploadingPhotos}
              onClick={() => photoInputRef.current?.click()}
            >
              <ImagePlus className="h-4 w-4" />
              {uploadingPhotos ? "Envoi en cours…" : "Ajouter des photos"}
            </Button>
            {uploadingPhotos && (
              <p className="text-sm text-primary/55">Envoi des photos…</p>
            )}
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {property.photos.map((photo) => (
              <div
                key={photo.id}
                className="overflow-hidden rounded-[22px] border border-[#e8e0d5] bg-[#fffdf9]"
              >
                <img
                  src={photo.url}
                  alt={photo.alt}
                  className="h-40 w-full object-cover"
                />
                <div className="space-y-3 p-4">
                  <div className="text-sm font-medium">
                    {photo.isMain ? "Photo principale" : photo.alt}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {!photo.isMain && (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="rounded-full bg-white"
                        disabled={!canEdit}
                        onClick={() =>
                          updateProperty(
                            setMainPropertyPhoto(property, photo.id),
                            "Photo principale mise à jour.",
                          )
                        }
                      >
                        Définir principale
                      </Button>
                    )}
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="rounded-full bg-white"
                      disabled={!canEdit}
                      onClick={() => onDeletePhoto(photo.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      Supprimer
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SaasCard>

        <div className="mt-7 grid gap-7 lg:grid-cols-2">
          <SaasCard className="p-6 md:p-8">
            <SectionTitle
              title="Visites"
              description="Planifiez les visites et gardez un historique clair."
            />
            <form
              className="mt-5 grid gap-3 sm:grid-cols-2"
              onSubmit={onAddVisit}
            >
              <Input
                type="date"
                value={visitForm.date}
                onChange={(event) =>
                  setVisitForm({ ...visitForm, date: event.target.value })
                }
                disabled={!canEdit}
                required
              />
              <Input
                type="time"
                value={visitForm.time}
                onChange={(event) =>
                  setVisitForm({ ...visitForm, time: event.target.value })
                }
                disabled={!canEdit}
              />
              <Input
                value={visitForm.visitorName}
                onChange={(event) =>
                  setVisitForm({
                    ...visitForm,
                    visitorName: event.target.value,
                  })
                }
                placeholder="Nom du visiteur"
                disabled={!canEdit}
              />
              <Input
                value={visitForm.visitorPhone}
                onChange={(event) =>
                  setVisitForm({
                    ...visitForm,
                    visitorPhone: event.target.value,
                  })
                }
                placeholder="Téléphone"
                disabled={!canEdit}
              />
              <Textarea
                value={visitForm.note}
                onChange={(event) =>
                  setVisitForm({ ...visitForm, note: event.target.value })
                }
                placeholder="Informations importantes"
                disabled={!canEdit}
                className="sm:col-span-2"
              />
              <Button
                className="rounded-full sm:col-span-2"
                disabled={!canEdit}
              >
                <CalendarDays className="h-4 w-4" />
                Ajouter la visite
              </Button>
            </form>
            <div className="mt-6 space-y-3">
              {property.visits.length === 0 && (
                <p className="text-sm text-primary/55">
                  Aucune visite planifiée pour le moment.
                </p>
              )}
              {property.visits.map((visit) => (
                <div
                  key={visit.id}
                  className="rounded-2xl border border-[#e8e0d5] bg-[#fffdf9] p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="font-medium">
                      {visit.date} {visit.time && `à ${visit.time}`}
                    </div>
                    <StatusBadge
                      status={
                        visit.status === "done"
                          ? "réalisée"
                          : visit.status === "cancelled"
                            ? "annulée"
                            : "prévue"
                      }
                    />
                  </div>
                  <p className="mt-2 text-sm text-primary/55">
                    {visit.visitorName || "Visiteur non renseigné"}
                    {visit.visitorPhone ? ` - ${visit.visitorPhone}` : ""}
                  </p>
                  {visit.note && (
                    <p className="mt-2 text-sm leading-relaxed text-primary/55">
                      {visit.note}
                    </p>
                  )}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="rounded-full bg-white"
                      disabled={!canEdit}
                      onClick={() =>
                        setProperty(
                          updatePropertyVisitStatus(property, visit.id, "done"),
                        )
                      }
                    >
                      Marquer réalisée
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="rounded-full bg-white"
                      disabled={!canEdit}
                      onClick={() =>
                        setProperty(deletePropertyVisit(property, visit.id))
                      }
                    >
                      Supprimer
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </SaasCard>

          <SaasCard className="p-6 md:p-8">
            <SectionTitle
              title="Comptes rendus"
              description="Les comptes rendus visibles apparaissent dans Mon Suivi vendeur."
            />
            <form className="mt-5 space-y-3" onSubmit={onAddReport}>
              <Input
                value={reportForm.title}
                onChange={(event) =>
                  setReportForm({ ...reportForm, title: event.target.value })
                }
                placeholder="Titre"
                disabled={!canEdit}
              />
              <Textarea
                value={reportForm.content}
                onChange={(event) =>
                  setReportForm({ ...reportForm, content: event.target.value })
                }
                placeholder="Compte rendu de visite"
                disabled={!canEdit}
                className="min-h-28"
                required
              />
              <label className="flex items-center gap-2 text-sm text-primary/60">
                <input
                  type="checkbox"
                  checked={reportForm.visibleToSeller}
                  onChange={(event) =>
                    setReportForm({
                      ...reportForm,
                      visibleToSeller: event.target.checked,
                    })
                  }
                  disabled={!canEdit}
                />
                Visible dans l’espace vendeur
              </label>
              <Button className="rounded-full" disabled={!canEdit}>
                <Clipboard className="h-4 w-4" />
                Ajouter le compte rendu
              </Button>
            </form>
            <div className="mt-6 space-y-3">
              {property.visitReports.length === 0 && (
                <p className="text-sm text-primary/55">
                  Aucun compte rendu pour le moment.
                </p>
              )}
              {property.visitReports.map((report) => (
                <div
                  key={report.id}
                  className="rounded-2xl border border-[#e8e0d5] bg-[#fffdf9] p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="font-medium">{report.title}</div>
                    <StatusBadge
                      status={report.visibleToSeller ? "visible" : "interne"}
                    />
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-primary/55">
                    {report.content}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="rounded-full bg-white"
                      disabled={!canEdit}
                      onClick={() =>
                        setProperty(
                          updateVisitReportVisibility(
                            property,
                            report.id,
                            !report.visibleToSeller,
                          ),
                        )
                      }
                    >
                      {report.visibleToSeller ? "Masquer" : "Rendre visible"}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="rounded-full bg-white"
                      disabled={!canEdit}
                      onClick={() =>
                        setProperty(deleteVisitReport(property, report.id))
                      }
                    >
                      Supprimer
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </SaasCard>
        </div>

        <div className="mt-7 grid gap-7 lg:grid-cols-2">
          <SaasCard className="p-6 md:p-8">
            <SectionTitle
              title="Vendeur"
              description="Ces informations servent uniquement à préparer l’invitation de création d’accès vendeur."
            />
            <form
              className="mt-5 grid gap-4 sm:grid-cols-2"
              onSubmit={onCreateSellerSpace}
            >
              <Field label="Prénom">
                <Input
                  value={sellerForm.firstName}
                  onChange={(event) =>
                    setSellerForm({
                      ...sellerForm,
                      firstName: event.target.value,
                    })
                  }
                  disabled={!canEdit}
                  required
                />
              </Field>
              <Field label="Nom">
                <Input
                  value={sellerForm.lastName}
                  onChange={(event) =>
                    setSellerForm({
                      ...sellerForm,
                      lastName: event.target.value,
                    })
                  }
                  disabled={!canEdit}
                  required
                />
              </Field>
              <Field label="Email" className="sm:col-span-2">
                <Input
                  type="email"
                  value={sellerForm.email}
                  onChange={(event) => {
                    setSellerForm({
                      ...sellerForm,
                      email: event.target.value,
                    });
                    setSellerError("");
                  }}
                  onInvalid={(event) => {
                    event.preventDefault();
                    setSellerError("Email invalide.");
                  }}
                  disabled={!canEdit}
                  required
                />
              </Field>
              {sellerError && (
                <p className="sm:col-span-2 text-sm text-red-600">
                  {sellerError}
                </p>
              )}
              <Field label="Téléphone optionnel" className="sm:col-span-2">
                <Input
                  type="tel"
                  value={sellerForm.phone}
                  onChange={(event) =>
                    setSellerForm({
                      ...sellerForm,
                      phone: event.target.value,
                    })
                  }
                  disabled={!canEdit}
                />
              </Field>
              <div className="sm:col-span-2">
                <Button className="rounded-full" size="lg" disabled={!canEdit}>
                  <Mail className="h-4 w-4" />
                  {property.sellerToken
                    ? "Renvoyer l’invitation vendeur"
                    : "Créer l’espace vendeur"}
                </Button>
              </div>
            </form>
          </SaasCard>

          <SaasCard className="p-6 md:p-8">
            <SectionTitle
              title="Documents"
              description="Mandat, diagnostics, offre et compromis peuvent être rendus visibles au vendeur."
            />
            <form className="mt-5 grid gap-3" onSubmit={onAddDocument}>
              <input
                ref={documentInputRef}
                type="file"
                accept="application/pdf,image/*,.doc,.docx"
                className="hidden"
                onChange={onDocumentFileSelected}
              />
              <Input
                value={documentForm.name}
                onChange={(event) =>
                  setDocumentForm({
                    ...documentForm,
                    name: event.target.value,
                  })
                }
                placeholder="Nom du document"
                disabled={!canEdit}
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <select
                  value={documentForm.type}
                  onChange={(event) =>
                    setDocumentForm({
                      ...documentForm,
                      type: event.target.value as DocumentType,
                    })
                  }
                  disabled={!canEdit}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  {documentTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                <div className="rounded-2xl border border-[#e8e0d5] bg-[#fffdf9] px-4 py-3 text-sm text-primary/55">
                  PDF, image, DOC ou DOCX - 20 Mo max
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm text-primary/60">
                <input
                  type="checkbox"
                  checked={documentForm.visibleToSeller}
                  onChange={(event) =>
                    setDocumentForm({
                      ...documentForm,
                      visibleToSeller: event.target.checked,
                    })
                  }
                  disabled={!canEdit}
                />
                Visible dans l’espace vendeur
              </label>
              <Button
                className="rounded-full"
                disabled={!canEdit || uploadingDocument}
              >
                <FileText className="h-4 w-4" />
                {uploadingDocument ? "Envoi en cours…" : "Ajouter un fichier"}
              </Button>
            </form>
            <div className="mt-6 space-y-3">
              {property.propertyDocuments.length === 0 && (
                <p className="text-sm text-primary/55">
                  Aucun document ajouté pour le moment.
                </p>
              )}
              {property.propertyDocuments.map((document) => (
                <div
                  key={document.id}
                  className="rounded-2xl border border-[#e8e0d5] bg-[#fffdf9] p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="font-medium">{document.name}</div>
                    <StatusBadge
                      status={document.visibleToSeller ? "visible" : "interne"}
                    />
                  </div>
                  <p className="mt-1 text-sm text-primary/50">
                    {document.documentType ?? document.type} ·{" "}
                    {formatDate(document.createdAt)}
                    {document.fileName ? ` · ${document.fileName}` : ""}
                    {document.size ? ` · ${formatFileSize(document.size)}` : ""}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {document.url && (
                      <Button
                        asChild
                        size="sm"
                        variant="outline"
                        className="rounded-full bg-white"
                      >
                        <a href={document.url} target="_blank" rel="noreferrer">
                          <ExternalLink className="h-4 w-4" />
                          Ouvrir
                        </a>
                      </Button>
                    )}
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="rounded-full bg-white"
                      disabled={!canEdit}
                      onClick={() =>
                        setProperty(
                          updatePropertyDocumentVisibility(
                            property,
                            document.id,
                            !document.visibleToSeller,
                          ),
                        )
                      }
                    >
                      {document.visibleToSeller ? "Masquer" : "Rendre visible"}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="rounded-full bg-white"
                      disabled={!canEdit}
                      onClick={() => onDeleteDocument(document.id)}
                    >
                      Supprimer
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </SaasCard>
        </div>

        <SaasCard className="mt-7 p-6 md:p-8">
          <SectionTitle
            title="Espace vendeur"
            description="Le vendeur reçoit un lien d’invitation /creer-acces/[token], puis crée son accès privé."
          />
          {property.sellerToken ? (
            <div className="mt-6">
              <StatusBadge status="actif" />
              <p className="mt-4 text-sm leading-relaxed text-primary/60">
                Espace vendeur créé.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full bg-white"
                  disabled={!canEdit}
                  onClick={() => void onCreateSellerSpace()}
                >
                  <Mail className="h-4 w-4" />
                  Renvoyer l’accès vendeur
                </Button>
                {manualSellerInviteLink && (
                  <Button
                    type="button"
                    className="rounded-full"
                    onClick={onCopyManualSellerInviteLink}
                  >
                    <Copy className="h-4 w-4" />
                    Copier le lien d’invitation
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="mt-6">
              <p className="text-sm leading-relaxed text-primary/60">
                Aucun espace vendeur n’est encore créé pour ce bien.
              </p>
              <Button
                type="button"
                className="mt-5 rounded-full"
                disabled={!canEdit}
                onClick={() => void onCreateSellerSpace()}
              >
                <Link2 className="h-4 w-4" />
                Créer l’espace vendeur
              </Button>
            </div>
          )}
        </SaasCard>
      </section>
    </SaasShell>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#e8e0d5] bg-[#fffdf9] p-4">
      <div className="text-xs font-medium uppercase tracking-[0.18em] text-primary/35">
        {label}
      </div>
      <div className="mt-2 font-medium">{value || "Non renseigné"}</div>
    </div>
  );
}

function LogoutLink() {
  return (
    <Button
      asChild
      variant="outline"
      className="rounded-full border-[#d8cfc2] bg-white"
    >
      <Link to="/">
        <LogOut className="h-4 w-4" />
        Déconnexion
      </Link>
    </Button>
  );
}

function getFileDisplayName(fileName: string) {
  const trimmedName = fileName.trim();
  if (!trimmedName) return "Document";
  const extensionIndex = trimmedName.lastIndexOf(".");
  return extensionIndex > 0
    ? trimmedName.slice(0, extensionIndex)
    : trimmedName;
}

function formatFileSize(size: number) {
  if (!Number.isFinite(size) || size <= 0) return "";
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} Ko`;
  return `${(size / (1024 * 1024)).toFixed(1).replace(".", ",")} Mo`;
}

function formatDate(value: string) {
  if (!value) return "Date inconnue";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}
