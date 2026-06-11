import {
  ArrowLeft,
  Bath,
  BedDouble,
  Home,
  Mail,
  MapPin,
  Phone,
  Ruler,
  Trees,
  X,
} from "lucide-react";

import { agencyConfig, type Property } from "@/lib/agency-config";

type PropertyDetailsProps = {
  property: Property | null;
  onClose: () => void;
};

export function PropertyDetails({ property, onClose }: PropertyDetailsProps) {
  if (!property) return null;

  const agent =
    agencyConfig.agents.find((item) => item.id === property.agentId) ??
    agencyConfig.agents[0];
  const gallery = property.gallery.length
    ? property.gallery
    : [property.coverImage];
  const secondaryPhotos = gallery.slice(1, 5);
  const visitSubject = encodeURIComponent(
    `Demande de visite - ${property.title}`,
  );

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
                    {property.address}, {property.city}
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
                    label={`${property.surface} m²`}
                    detail="Surface"
                  />
                  <Spec
                    icon={Home}
                    label={`${property.rooms} pièces`}
                    detail="Pièces"
                  />
                  <Spec
                    icon={BedDouble}
                    label={`${property.bedrooms} chambres`}
                    detail="Nuit"
                  />
                  <Spec
                    icon={Bath}
                    label={pluralize(property.bathrooms, "salle de bain")}
                    detail="Eau"
                  />
                  <Spec
                    icon={Home}
                    label={`DPE ${property.dpe}`}
                    detail="Énergie"
                  />
                  <Spec icon={Trees} label={property.land} detail="Extérieur" />
                </div>
              </div>

              <div className="mt-10">
                <h2 className="font-display text-2xl md:text-3xl">
                  Points forts
                </h2>
                <div className="mt-5 flex flex-wrap gap-2">
                  {property.features.map((feature) => (
                    <span
                      key={feature}
                      className="rounded-full border border-border bg-card px-4 py-2 text-sm text-foreground shadow-sm"
                    >
                      {feature}
                    </span>
                  ))}
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
                  Contactez l’agence pour organiser une visite ou obtenir plus
                  d’informations.
                </p>

                {agent && (
                  <div className="mt-6 flex items-center gap-3 rounded-2xl bg-secondary/70 p-4">
                    <div className="grid h-12 w-12 place-items-center rounded-full bg-primary text-primary-foreground font-display text-lg">
                      {agent.name
                        .split(" ")
                        .map((part) => part[0])
                        .join("")
                        .slice(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium">{agent.name}</div>
                      <a
                        href={agent.phoneHref}
                        className="text-sm text-muted-foreground hover:text-foreground"
                      >
                        {agent.phone}
                      </a>
                    </div>
                  </div>
                )}

                <div className="mt-6 grid gap-3">
                  <a
                    href={`mailto:${agencyConfig.contact.email}?subject=${visitSubject}`}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
                  >
                    <Mail className="h-4 w-4" />
                    Demander une visite
                  </a>
                  <a
                    href={agent?.phoneHref ?? agencyConfig.contact.phoneHref}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-background px-5 py-3 text-sm font-medium transition hover:bg-secondary"
                  >
                    <Phone className="h-4 w-4" />
                    Appeler l’agence
                  </a>
                </div>
              </div>
            </aside>
          </section>
        </div>
      </article>
    </div>
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
      <div className="mt-3 text-sm font-medium">{label}</div>
      <div className="mt-1 text-xs text-muted-foreground">{detail}</div>
    </div>
  );
}

function pluralize(count: number, label: string) {
  return `${count} ${label}${count > 1 ? "s" : ""}`;
}
