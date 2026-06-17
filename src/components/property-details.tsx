import {
  ArrowLeft,
  Bath,
  BedDouble,
  CheckCircle2,
  Home,
  MapPin,
  Phone,
  Ruler,
  Trees,
  X,
} from "lucide-react";
import { FormEvent, useState } from "react";

import { sendLeadNotificationEmail } from "@/lib/api/agency-email.functions";
import {
  createVisitRequest,
  getAgencyById,
  getAgencyNotificationRecipients,
  type AgencyProperty,
} from "@/lib/agency-saas";

type PropertyDetailsProps = {
  property: AgencyProperty | null;
  onClose: () => void;
};

const buyerSituations = [
  "Je suis acheteur sérieux",
  "Je commence mes recherches",
  "J’ai déjà vendu mon bien",
  "J’ai un bien à vendre",
  "Je suis investisseur",
  "Autre",
];

const financingStatuses = [
  "J’ai un accord bancaire / simulation",
  "Mon financement est en cours",
  "Je n’ai pas encore vu ma banque",
  "Achat comptant",
  "Je ne sais pas encore",
];

const buyingTimelines = [
  "Dès que possible",
  "Sous 3 mois",
  "Sous 6 mois",
  "Plus tard",
];

export function PropertyDetails({ property, onClose }: PropertyDetailsProps) {
  const [showVisitForm, setShowVisitForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    buyerSituation: buyerSituations[0],
    financingStatus: financingStatuses[0],
    buyingTimeline: buyingTimelines[0],
    message: "",
  });

  if (!property) return null;

  const agency = getAgencyById(property.agencyId);
  const gallery = property.photos.length
    ? property.photos
        .slice()
        .sort((a, b) => a.order - b.order)
        .map((photo) => photo.url)
    : [property.imageUrl || property.image];
  const secondaryPhotos = gallery.slice(1, 5);
  const phone = agency?.phone?.trim() || "";
  const phoneHref = phone ? `tel:${phone.replace(/\s/g, "")}` : "";

  async function onSubmitVisitRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!property || !agency) return;

    const request = createVisitRequest({
      agencyId: agency.id,
      agencySlug: agency.slug,
      propertyId: property.id,
      propertyTitle: property.title,
      propertyCity: property.city,
      propertyPrice: property.price,
      ...form,
    });

    const recipients = getAgencyNotificationRecipients(agency, property);
    if (recipients.length) {
      const body = [
        "Nouvelle demande de visite reçue depuis Signature Immobilier.",
        "",
        "Bien concerné :",
        `${request.propertyTitle} — ${request.propertyCity}`,
        `Prix : ${request.propertyPrice}`,
        "",
        "Acheteur :",
        `${request.firstName} ${request.lastName}`,
        `Téléphone : ${request.phone}`,
        `Email : ${request.email}`,
        "",
        `Situation : ${request.buyerSituation}`,
        `Financement : ${request.financingStatus}`,
        `Délai d’achat : ${request.buyingTimeline}`,
        "",
        "Message :",
        request.message || "Non renseigné",
      ].join("\n");

      try {
        await sendLeadNotificationEmail({
          data: {
            to: recipients,
            subject: `Nouvelle demande de visite — ${property.title}`,
            body,
          },
        });
      } catch (error) {
        console.info(
          "Email interne non envoyé : RESEND_API_KEY manquante.",
          error,
        );
      }
    }

    setSubmitted(true);
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-foreground/35 px-4 py-6 backdrop-blur-sm md:px-8">
      <article className="mx-auto max-w-6xl overflow-hidden rounded-[1.75rem] bg-background shadow-2xl">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background/95 px-5 py-4 backdrop-blur">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium transition hover:bg-secondary"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour aux biens
          </button>
          <button
            type="button"
            onClick={onClose}
            className="grid h-10 w-10 place-items-center rounded-full border border-border bg-card transition hover:bg-secondary"
            aria-label="Fermer la fiche du bien"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="p-5 md:p-8">
          <section className="grid gap-3 md:grid-cols-[1.55fr_0.85fr]">
            <div className="overflow-hidden rounded-[1.5rem] bg-secondary">
              <img
                src={gallery[0]}
                alt={property.title}
                className="h-[320px] w-full object-cover md:h-[520px]"
              />
            </div>
            {secondaryPhotos.length > 0 && (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-1">
                {secondaryPhotos.map((photo, index) => (
                  <div
                    key={`${property.id}-gallery-${index}`}
                    className="overflow-hidden rounded-[1.25rem] bg-secondary"
                  >
                    <img
                      src={photo}
                      alt={`${property.title} ${index + 2}`}
                      className="h-36 w-full object-cover md:h-full"
                    />
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="mt-8 grid gap-10 lg:grid-cols-[1fr_380px]">
            <div>
              <div className="flex flex-wrap items-start justify-between gap-5">
                <div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 text-gold" />
                    {property.addressOrDistrict || property.address},{" "}
                    {property.city}
                  </div>
                  <h1 className="mt-3 font-display text-4xl leading-tight md:text-6xl">
                    {property.title}
                  </h1>
                </div>
                <div className="rounded-2xl border border-border bg-card px-5 py-4 shadow-sm">
                  <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Prix
                  </div>
                  <div className="mt-1 font-display text-3xl md:text-4xl">
                    {property.price}
                  </div>
                </div>
              </div>

              <p className="mt-7 max-w-3xl text-base leading-relaxed text-muted-foreground md:text-lg">
                {property.description}
              </p>

              <div className="mt-10">
                <h2 className="font-display text-2xl md:text-3xl">
                  Caractéristiques essentielles
                </h2>
                <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <Spec
                    icon={Ruler}
                    label={property.surface}
                    detail="Surface"
                  />
                  <Spec icon={Home} label={property.rooms} detail="Pièces" />
                  <Spec
                    icon={BedDouble}
                    label={property.bedrooms || "Non renseigné"}
                    detail="Chambres"
                  />
                  <Spec icon={Bath} label={property.type} detail="Type" />
                  <Spec
                    icon={Trees}
                    label={property.addressOrDistrict || property.address}
                    detail="Quartier"
                  />
                </div>
              </div>
            </div>

            <aside className="lg:sticky lg:top-28 lg:self-start">
              <div className="rounded-[1.5rem] border border-border bg-card p-6 shadow-xl shadow-foreground/5">
                <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                  Contact
                </div>
                <h2 className="mt-3 font-display text-3xl">
                  Ce bien vous intéresse ?
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  Laissez vos informations. Un conseiller vous rappelle pour
                  confirmer votre situation et organiser une visite si le bien
                  correspond à votre projet.
                </p>

                <div className="mt-6 grid gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowVisitForm(true);
                      setSubmitted(false);
                    }}
                    className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
                  >
                    Demander une visite
                  </button>
                  {phoneHref ? (
                    <a
                      href={phoneHref}
                      className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-background px-5 py-3 text-sm font-medium transition hover:bg-secondary"
                    >
                      <Phone className="h-4 w-4" />
                      Appeler l’agence
                    </a>
                  ) : (
                    <div className="rounded-2xl border border-border bg-secondary/60 px-4 py-3 text-center text-sm text-muted-foreground">
                      Téléphone indisponible
                    </div>
                  )}
                </div>
              </div>
            </aside>
          </section>
        </div>
      </article>

      {showVisitForm && (
        <div className="fixed inset-0 z-[60] grid place-items-center overflow-y-auto bg-foreground/35 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-[1.75rem] bg-background p-6 shadow-2xl md:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-display text-4xl leading-tight">
                  {submitted
                    ? "Votre demande de visite a bien été transmise."
                    : "Demander une visite"}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {submitted
                    ? "Un conseiller vous rappellera rapidement pour échanger sur votre situation et organiser une visite si le bien correspond à votre projet."
                    : "Laissez vos informations. Un conseiller vous rappelle pour confirmer votre situation et organiser une visite si le bien correspond à votre projet."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowVisitForm(false)}
                className="grid h-10 w-10 place-items-center rounded-full border border-border bg-card transition hover:bg-secondary"
                aria-label="Fermer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {submitted ? (
              <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-emerald-800">
                <CheckCircle2 className="h-5 w-5" />
                <p className="mt-3 text-sm leading-relaxed">
                  Aucune visite n’est confirmée automatiquement. Un conseiller
                  vous rappelle pour valider votre situation et le créneau.
                </p>
              </div>
            ) : (
              <form
                className="mt-6 grid gap-4 md:grid-cols-2"
                onSubmit={onSubmitVisitRequest}
              >
                <Field label="Prénom">
                  <Input
                    value={form.firstName}
                    onChange={(value) => setForm({ ...form, firstName: value })}
                    required
                  />
                </Field>
                <Field label="Nom">
                  <Input
                    value={form.lastName}
                    onChange={(value) => setForm({ ...form, lastName: value })}
                    required
                  />
                </Field>
                <Field label="Téléphone">
                  <Input
                    type="tel"
                    value={form.phone}
                    onChange={(value) => setForm({ ...form, phone: value })}
                    required
                  />
                </Field>
                <Field label="Email">
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(value) => setForm({ ...form, email: value })}
                    required
                  />
                </Field>
                <Field label="Situation acheteur">
                  <Select
                    value={form.buyerSituation}
                    options={buyerSituations}
                    onChange={(value) =>
                      setForm({ ...form, buyerSituation: value })
                    }
                  />
                </Field>
                <Field label="Financement">
                  <Select
                    value={form.financingStatus}
                    options={financingStatuses}
                    onChange={(value) =>
                      setForm({ ...form, financingStatus: value })
                    }
                  />
                </Field>
                <Field label="Délai d’achat" className="md:col-span-2">
                  <Select
                    value={form.buyingTimeline}
                    options={buyingTimelines}
                    onChange={(value) =>
                      setForm({ ...form, buyingTimeline: value })
                    }
                  />
                </Field>
                <Field label="Message optionnel" className="md:col-span-2">
                  <textarea
                    value={form.message}
                    onChange={(event) =>
                      setForm({ ...form, message: event.target.value })
                    }
                    placeholder="Vos disponibilités, questions ou précisions…"
                    className="min-h-28 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-ring"
                  />
                </Field>
                <p className="text-sm leading-relaxed text-muted-foreground md:col-span-2">
                  Aucune visite n’est confirmée automatiquement. Un conseiller
                  vous rappelle pour valider votre situation et le créneau.
                </p>
                <div className="md:col-span-2">
                  <button className="w-full rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition hover:bg-primary/90">
                    Envoyer ma demande de visite
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  className = "",
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`space-y-2 ${className}`}>
      <span className="text-xs font-medium text-foreground">{label}</span>
      {children}
    </label>
  );
}

function Input({
  value,
  onChange,
  type = "text",
  required,
}: {
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      type={type}
      required={required}
      className="h-11 w-full rounded-full border border-border bg-background px-4 text-sm outline-none transition focus:ring-2 focus:ring-ring"
    />
  );
}

function Select({
  value,
  options,
  onChange,
}: {
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-11 w-full rounded-full border border-border bg-background px-4 text-sm outline-none transition focus:ring-2 focus:ring-ring"
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}

function Spec({
  icon: Icon,
  label,
  detail,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  detail: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <Icon className="h-4 w-4 text-gold" />
      <div className="mt-3 text-sm font-medium">{label || "Non renseigné"}</div>
      <div className="mt-1 text-xs text-muted-foreground">{detail}</div>
    </div>
  );
}
