import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  CalendarDays,
  Clipboard,
  Copy,
  ExternalLink,
  FileText,
  Link2,
  LogOut,
  Mail,
  Save,
} from "lucide-react";
import { FormEvent, useEffect, useState } from "react";

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
import { agencyConfig } from "@/lib/agency-config";
import { sendInviteEmail } from "@/lib/api/agency-email.functions";
import {
  createSellerInviteForProperty,
  getAgencyBySlug,
  getAgencyProperty,
  getSellerAccessLink,
  saveAgencyProperty,
  type Agency,
  type AgencyProperty,
} from "@/lib/agency-saas";
import { isValidEmail } from "@/lib/email-utils";

export const Route = createFileRoute("/agence/$slug/biens/$propertyId/gerer")({
  head: () => ({
    meta: [{ title: "Gérer le bien - Signature Immobilier" }],
  }),
  component: AgencyPropertyDetailRoute,
});

function AgencyPropertyDetailRoute() {
  const { slug, propertyId } = Route.useParams();
  const [agency, setAgency] = useState<Agency | null>(null);
  const [property, setProperty] = useState<AgencyProperty | null>(null);
  const [feedback, setFeedback] = useState("");
  const [manualSellerInviteLink, setManualSellerInviteLink] = useState("");
  const [manualSellerInviteCopied, setManualSellerInviteCopied] =
    useState(false);
  const [sellerError, setSellerError] = useState("");
  const [sellerForm, setSellerForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });
  const [newDocument, setNewDocument] = useState("");
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

  function updateProperty(nextProperty: AgencyProperty) {
    saveAgencyProperty(nextProperty);
    setProperty(nextProperty);
  }

  function onSaveInfo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!property) return;
    updateProperty(property);
    setFeedback("Bien enregistré.");
  }

  function onAddDocument(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!property || !newDocument.trim()) return;
    const nextProperty = {
      ...property,
      documents: [...property.documents, newDocument.trim()],
    };
    updateProperty(nextProperty);
    setNewDocument("");
    setFeedback("Document ajouté.");
  }

  async function onCreateSellerSpace(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    if (!agency || !property) return;
    setManualSellerInviteCopied(false);
    if (!isValidEmail(sellerForm.email)) {
      setSellerError("Email invalide.");
      return;
    }

    const result = createSellerInviteForProperty(agency, property, sellerForm);
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
        setManualSellerInviteLink("");
        setManualSellerInviteCopied(false);
        setFeedback("Espace vendeur créé. Email d’invitation envoyé.");
        return;
      }
    } catch (error) {
      console.info("Invitation vendeur non envoyée", error);
    }

    setManualSellerInviteLink(result.email.accessUrl ?? "");
    setManualSellerInviteCopied(false);
    setFeedback(
      "Invitation vendeur créée. Email non envoyé : configuration email manquante.",
    );
  }

  async function onCopySellerLink() {
    if (!property) return;
    const link = getSellerAccessLink(property);
    await navigator.clipboard?.writeText(link);
    setFeedback("Lien vendeur copié.");
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
        description="Vous modifiez ici uniquement les informations visibles par vos clients vendeurs. Votre CRM reste votre outil interne."
        action={<StatusBadge status={agency.status} />}
      />

      <section className="mx-auto max-w-6xl px-5 pb-16 md:px-8">
        <Button
          asChild
          variant="outline"
          className="mb-7 rounded-full bg-white"
        >
          <Link to="/agence/$slug" params={{ slug: agency.slug }}>
            <ArrowLeft className="h-4 w-4" />
            Retour aux biens
          </Link>
        </Button>

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
                  Lien d’invitation vendeur à copier : {manualSellerInviteLink}
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
            src={property.image}
            alt={property.title}
            className="h-72 w-full object-cover md:h-[420px]"
          />
          <div className="p-6 md:p-8">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={property.publicStatus} />
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
                  disabled={agency.status !== "active"}
                />
              </Field>
              <Field label="Ville">
                <Input
                  value={property.city}
                  onChange={(event) =>
                    setProperty({ ...property, city: event.target.value })
                  }
                  disabled={agency.status !== "active"}
                />
              </Field>
              <Field label="Prix">
                <Input
                  value={property.price}
                  onChange={(event) =>
                    setProperty({ ...property, price: event.target.value })
                  }
                  disabled={agency.status !== "active"}
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
                  disabled={agency.status !== "active"}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  {[
                    "Disponible",
                    "Nouveauté",
                    "Exclusivité",
                    "Sous offre",
                    "Vendu",
                    "Coup de cœur",
                  ].map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Adresse ou quartier">
                <Input
                  value={property.address}
                  onChange={(event) =>
                    setProperty({ ...property, address: event.target.value })
                  }
                  disabled={agency.status !== "active"}
                />
              </Field>
              <Field label="Surface">
                <Input
                  value={property.surface}
                  onChange={(event) =>
                    setProperty({ ...property, surface: event.target.value })
                  }
                  disabled={agency.status !== "active"}
                />
              </Field>
              <Field label="Pièces">
                <Input
                  value={property.rooms}
                  onChange={(event) =>
                    setProperty({ ...property, rooms: event.target.value })
                  }
                  disabled={agency.status !== "active"}
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
                  disabled={agency.status !== "active"}
                  className="min-h-28"
                />
              </Field>
              <div className="md:col-span-2">
                <Button
                  className="rounded-full"
                  size="lg"
                  disabled={agency.status !== "active"}
                >
                  <Save className="h-4 w-4" />
                  Enregistrer les informations
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
              {agencyConfig.saleProgress.slice(0, 6).map((step) => (
                <button
                  key={step}
                  type="button"
                  disabled={agency.status !== "active"}
                  className={`rounded-2xl border p-4 text-left text-sm transition ${
                    property.internalStatus === step
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-[#e8e0d5] bg-[#fffdf9] text-primary/65"
                  }`}
                  onClick={() => {
                    const nextProperty = { ...property, internalStatus: step };
                    updateProperty(nextProperty);
                    setFeedback("Progression enregistrée.");
                  }}
                >
                  {step}
                </button>
              ))}
            </div>
          </SaasCard>

          <div className="space-y-7">
            <SaasCard className="p-6 md:p-8">
              <CalendarDays className="h-5 w-5 text-primary/45" />
              <h2 className="mt-5 font-display text-3xl">Visites</h2>
              <Field label="Prochaine visite" className="mt-5">
                <Input
                  value={property.nextVisit}
                  onChange={(event) =>
                    setProperty({ ...property, nextVisit: event.target.value })
                  }
                  disabled={agency.status !== "active"}
                />
              </Field>
              <Button
                type="button"
                className="mt-5 rounded-full"
                disabled={agency.status !== "active"}
                onClick={() => {
                  updateProperty(property);
                  setFeedback("Prochaine visite enregistrée.");
                }}
              >
                Enregistrer la visite
              </Button>
            </SaasCard>

            <SaasCard className="p-6 md:p-8">
              <Clipboard className="h-5 w-5 text-primary/45" />
              <h2 className="mt-5 font-display text-3xl">Compte rendu</h2>
              <Textarea
                value={property.report}
                onChange={(event) =>
                  setProperty({ ...property, report: event.target.value })
                }
                disabled={agency.status !== "active"}
                className="mt-5 min-h-32"
              />
              <Button
                type="button"
                className="mt-5 rounded-full"
                disabled={agency.status !== "active"}
                onClick={() => {
                  updateProperty(property);
                  setFeedback("Compte rendu enregistré.");
                }}
              >
                Ajouter un compte rendu
              </Button>
            </SaasCard>
          </div>
        </div>

        <div className="mt-7 grid gap-7 lg:grid-cols-2">
          <SaasCard className="p-6 md:p-8">
            <SectionTitle
              title="Vendeur"
              description="Ces informations servent à envoyer l’invitation de création d’accès vendeur."
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
                  disabled={agency.status !== "active"}
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
                  disabled={agency.status !== "active"}
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
                  disabled={agency.status !== "active"}
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
                  disabled={agency.status !== "active"}
                />
              </Field>
              <div className="sm:col-span-2">
                <Button
                  className="rounded-full"
                  size="lg"
                  disabled={agency.status !== "active"}
                >
                  <Mail className="h-4 w-4" />
                  {property.sellerToken
                    ? "Renvoyer l’invitation vendeur"
                    : "Créer l’espace vendeur"}
                </Button>
              </div>
            </form>
          </SaasCard>

          <SaasCard className="p-6 md:p-8">
            <SectionTitle title="Documents" />
            <div className="mt-5 flex flex-wrap gap-2">
              {property.documents.map((document) => (
                <span
                  key={document}
                  className="rounded-full border border-[#e8e0d5] bg-[#fffdf9] px-4 py-2 text-sm text-primary/60"
                >
                  {document}
                </span>
              ))}
            </div>
            <form
              className="mt-5 flex flex-col gap-3 sm:flex-row"
              onSubmit={onAddDocument}
            >
              <Input
                value={newDocument}
                onChange={(event) => setNewDocument(event.target.value)}
                placeholder="Ex : Offre"
                disabled={agency.status !== "active"}
              />
              <Button
                className="rounded-full"
                disabled={agency.status !== "active"}
              >
                <FileText className="h-4 w-4" />
                Ajouter
              </Button>
            </form>
          </SaasCard>
        </div>

        <SaasCard className="mt-7 p-6 md:p-8">
          <SectionTitle
            title="Espace vendeur"
            description="L’accès vendeur donne au propriétaire une vue claire sur la progression, les visites, les comptes rendus et les documents."
          />
          {property.sellerToken ? (
            <div className="mt-6">
              <StatusBadge status="actif" />
              <p className="mt-4 text-sm leading-relaxed text-primary/60">
                Espace vendeur créé
              </p>
              <div className="mt-4 break-all rounded-2xl bg-[#faf7f0] p-4 text-sm text-primary/60">
                {getSellerAccessLink(property)}
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full bg-white"
                  disabled={agency.status !== "active"}
                  onClick={() => void onCreateSellerSpace()}
                >
                  <Mail className="h-4 w-4" />
                  Renvoyer l’invitation vendeur
                </Button>
                <Button
                  type="button"
                  className="rounded-full"
                  onClick={onCopySellerLink}
                >
                  <Copy className="h-4 w-4" />
                  Copier le lien vendeur
                </Button>
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
                disabled={agency.status !== "active"}
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
