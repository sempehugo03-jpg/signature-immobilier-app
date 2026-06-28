import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Bell,
  CheckCircle2,
  FileText,
  FolderClosed,
  LockKeyhole,
  MapPin,
  Search,
} from "lucide-react";
import { useEffect, useState } from "react";

import { AppInstallToast } from "@/components/AppInstallToast";
import { PropertyCard } from "@/components/property-card";
import { PropertyDetails } from "@/components/property-details";
import { SiteLayout } from "@/components/site-layout";
import { agencyConfig } from "@/lib/agency-config";
import { getPublicProperties, type AgencyProperty } from "@/lib/agency-saas";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title: `${agencyConfig.brand.name} — Espace vendeur privé et vente transparente`,
      },
      {
        name: "description",
        content:
          "Vendez votre bien avec une présentation premium et un espace vendeur privé pour suivre visites, comptes rendus, documents et étapes de vente.",
      },
      { property: "og:title", content: agencyConfig.brand.name },
      {
        property: "og:description",
        content: agencyConfig.brand.tagline,
      },
    ],
  }),
  component: Page,
});

const reassurance = [
  {
    icon: Bell,
    title: "Suivi en temps réel",
    text: "Soyez informé à chaque nouvelle étape de votre vente.",
  },
  {
    icon: FolderClosed,
    title: "Tout au même endroit",
    text: "Documents, visites, offres : tout est accessible facilement.",
  },
  {
    icon: CheckCircle2,
    title: "Mises à jour importantes",
    text: "Recevez uniquement les informations utiles pour suivre votre dossier.",
  },
  {
    icon: LockKeyhole,
    title: "Données sécurisées",
    text: "Vos informations sont protégées et confidentielles.",
  },
] as const;

const sellerSpaceBlocks = [
  {
    icon: CheckCircle2,
    title: "Avancement clair",
    text: "Mandat, annonce, visites, offre, compromis, vente : chaque étape est visible simplement.",
  },
  {
    icon: Bell,
    title: "Retours après visite",
    text: "Après une visite, l’agence peut ajouter un compte rendu clair pour éviter les zones d’ombre.",
  },
  {
    icon: FileText,
    title: "Documents au même endroit",
    text: "Mandat, diagnostics, offre ou compromis restent accessibles dans votre espace privé.",
  },
  {
    icon: FolderClosed,
    title: "Moins de stress",
    text: "Vous gardez une vision claire de votre vente, même entre deux appels avec l’agence.",
  },
] as const;

function Page() {
  const [properties, setProperties] = useState<AgencyProperty[]>(() =>
    getPublicProperties(),
  );
  const [selectedProperty, setSelectedProperty] =
    useState<AgencyProperty | null>(null);
  const featuredProperty = properties[0];

  useEffect(() => {
    setProperties(getPublicProperties());
  }, []);
  return (
    <SiteLayout variant="public">
      <AppInstallToast />
      <section className="relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-40 bg-secondary/60" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-5 pb-16 pt-10 md:px-8 md:pb-24 md:pt-16 lg:grid-cols-[0.86fr_1.14fr] lg:items-center">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-3 py-1.5 text-xs tracking-wide text-muted-foreground shadow-sm backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-gold" />
              {agencyConfig.brand.positioning}
            </div>
            <h1 className="mt-7 font-display text-5xl leading-[0.96] tracking-normal md:text-7xl">
              Vendez votre bien sans rester dans le flou.
            </h1>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-muted-foreground md:text-lg">
              Signature Immobilier vous accompagne avec une présentation premium
              et un espace vendeur privé pour suivre les visites, les comptes
              rendus, les documents et les étapes de vente.
            </p>
            <p className="mt-4 max-w-lg font-medium text-foreground">
              Vous ne demandez plus où ça en est. Vous le voyez.
            </p>

            <div className="mt-8 max-w-xl rounded-full border border-border bg-card p-2 shadow-xl shadow-foreground/5">
              <div className="flex items-center gap-3">
                <div className="ml-3 hidden text-gold sm:block">
                  <MapPin className="h-5 w-5" />
                </div>
                <input
                  aria-label="Rechercher un bien"
                  placeholder="Ville, quartier, code postal..."
                  className="min-w-0 flex-1 bg-transparent px-2 py-3 text-sm outline-none placeholder:text-muted-foreground"
                />
                <button
                  type="button"
                  className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground transition hover:bg-primary/90"
                  aria-label="Rechercher"
                >
                  <Search className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to={agencyConfig.navigation.primaryCta.to}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary/90"
              >
                Estimer mon bien
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#biens-a-vendre"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-5 py-3 text-sm font-medium transition hover:bg-secondary"
              >
                Voir les biens à vendre
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>

          {featuredProperty && (
            <div className="relative min-h-[520px]">
              <div className="absolute -right-10 top-8 h-64 w-64 rounded-full bg-gold/10 blur-3xl" />
              <div className="relative overflow-hidden rounded-[2rem] bg-secondary shadow-2xl shadow-foreground/10">
                <img
                  src={featuredProperty.imageUrl || featuredProperty.image}
                  alt={featuredProperty.title}
                  className="h-[520px] w-full object-cover md:h-[620px]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/45 via-transparent to-transparent" />
                <div className="absolute bottom-5 left-5 right-5 rounded-[1.5rem] border border-white/20 bg-background/90 p-5 shadow-xl backdrop-blur md:bottom-7 md:left-7 md:right-auto md:w-[360px]">
                  <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                    Bien sélectionné
                  </div>
                  <div className="mt-3 font-display text-2xl leading-tight">
                    {featuredProperty.title}
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    <span>{featuredProperty.city}</span>
                    <span>{featuredProperty.surface}</span>
                    <span>{featuredProperty.rooms} pièces</span>
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-4">
                    <div className="font-display text-3xl">
                      {featuredProperty.price}
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedProperty(featuredProperty)}
                      className="grid h-11 w-11 place-items-center rounded-full bg-primary text-primary-foreground transition hover:bg-primary/90"
                      aria-label={`Voir le détail de ${featuredProperty.title}`}
                    >
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <section
        id="biens-a-vendre"
        className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-24"
      >
        <div className="mb-9 flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
              Biens à vendre
            </div>
            <h2 className="mt-3 font-display text-4xl leading-tight md:text-6xl">
              Une sélection locale, claire et désirable.
            </h2>
          </div>
          <a
            href="#biens-a-vendre"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-3 text-sm font-medium transition hover:bg-secondary"
          >
            Voir tous les biens
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              onOpen={setSelectedProperty}
            />
          ))}
        </div>

        <div className="mt-12 rounded-[2rem] border border-border bg-card p-7 shadow-sm md:flex md:items-center md:justify-between md:gap-8 md:p-10">
          <div className="max-w-2xl">
            <h3 className="font-display text-3xl leading-tight md:text-4xl">
              Votre bien mérite la même qualité de présentation.
            </h3>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Chaque annonce est pensée pour valoriser le bien, rassurer les
              acheteurs et donner au vendeur une vision claire de l’avancement.
            </p>
          </div>
          <Link
            to={agencyConfig.navigation.primaryCta.to}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary/90 md:mt-0"
          >
            Estimer mon bien
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <section className="bg-background">
        <div className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-24">
          <div className="max-w-3xl">
            <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
              SUIVI VENDEUR PRIVÉ
            </div>
            <h2 className="mt-3 font-display text-4xl leading-tight md:text-6xl">
              Vous savez toujours où en est votre vente.
            </h2>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
              Une fois votre bien confié à l’agence, vous accédez à un espace
              simple et privé. Vous y retrouvez les étapes de vente, les visites
              prévues, les retours après visite et les documents importants.
              Tout est centralisé, sans avoir besoin de relancer votre
              conseiller.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {sellerSpaceBlocks.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-border bg-card p-6 shadow-sm"
              >
                <div className="grid h-11 w-11 place-items-center rounded-full bg-secondary text-gold">
                  <item.icon className="h-5 w-5" />
                </div>
                <div className="mt-6 font-display text-xl">{item.title}</div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {item.text}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <p className="max-w-xl font-medium text-foreground">
              Le but n’est pas d’ajouter un outil de plus. Le but est de rendre
              votre vente plus lisible.
            </p>
            <Link
              to={agencyConfig.navigation.primaryCta.to}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary/90"
            >
              Commencer par estimer mon bien
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section id="estimer-mon-bien" className="bg-secondary/50">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 md:px-8 md:py-24 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
              Vous envisagez de vendre ?
            </div>
            <h2 className="mt-4 font-display text-4xl leading-tight md:text-6xl">
              Obtenez une première estimation indicative.
            </h2>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
              Répondez à quelques questions. Vous obtenez une première
              fourchette de prix, puis un conseiller vous rappelle pour
              l’affiner avec les ventes récentes du secteur.
            </p>
            <div className="mt-8">
              <Link
                to={agencyConfig.navigation.primaryCta.to}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-4 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary/90"
              >
                Démarrer mon estimation
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md">
            <div className="relative rounded-[2rem] border border-border bg-card p-6 shadow-2xl shadow-foreground/10">
              <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                Demande de rappel
              </div>
              <h3 className="mt-3 font-display text-3xl">
                Un conseiller vous accompagne.
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Vous transmettez les informations essentielles. L’agence vous
                rappelle pour affiner la valeur, le calendrier et la stratégie
                de vente.
              </p>

              <div className="mt-6 space-y-3">
                <PhoneRow
                  icon={CheckCircle2}
                  title="Analyse locale"
                  value="Prix, quartier, concurrence"
                />
                <PhoneRow
                  icon={FileText}
                  title="Projet vendeur"
                  value="Délai, priorité, situation"
                />
                <PhoneRow
                  icon={Bell}
                  title="Rappel agence"
                  value="Sans création de compte public"
                />
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <Link
                  to="/diagnostic"
                  className="inline-flex justify-center rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
                >
                  Démarrer mon estimation
                </Link>
                <a
                  href={agencyConfig.contact.phoneHref}
                  className="inline-flex justify-center rounded-full border border-border bg-background px-5 py-3 text-sm font-medium transition hover:bg-secondary"
                >
                  Appeler l’agence
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-24">
        <div className="max-w-3xl">
          <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
            Tranquillité
          </div>
          <h2 className="mt-3 font-display text-4xl leading-tight md:text-6xl">
            Ne signez plus un mandat pour attendre dans le vide.
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
            Avec Signature Immobilier, chaque étape importante est visible
            depuis votre espace vendeur : visites, retours, documents et
            progression de la vente.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {reassurance.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-border bg-card p-6 shadow-sm"
            >
              <div className="grid h-11 w-11 place-items-center rounded-full bg-secondary text-gold">
                <item.icon className="h-5 w-5" />
              </div>
              <div className="mt-6 font-display text-xl">{item.title}</div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-20 md:px-8 md:pb-28">
        <div className="overflow-hidden rounded-[2rem] bg-primary text-primary-foreground">
          <div className="grid gap-8 p-8 md:grid-cols-[1fr_0.7fr] md:items-center md:p-14">
            <div>
              <div className="text-xs uppercase tracking-[0.25em] text-primary-foreground/60">
                Estimation
              </div>
              <h2 className="mt-3 font-display text-4xl leading-tight md:text-6xl">
                Votre vente mérite un suivi clair jusqu'à la signature.
              </h2>
              <p className="mt-5 max-w-xl text-primary-foreground/70">
                Demandez une première estimation indicative, puis avancez avec
                un conseiller et un espace vendeur privé pour suivre chaque
                étape importante.
              </p>
            </div>
            <div className="flex md:justify-end">
              <Link
                to={agencyConfig.navigation.primaryCta.to}
                className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-4 text-sm font-medium text-gold-foreground transition hover:bg-gold/90"
              >
                Estimer mon bien
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <PropertyDetails
        property={selectedProperty}
        onClose={() => setSelectedProperty(null)}
      />
    </SiteLayout>
  );
}

function PhoneRow({
  icon: Icon,
  title,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
      <div className="grid h-10 w-10 place-items-center rounded-full bg-secondary text-gold">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <div className="text-xs text-muted-foreground">{title}</div>
        <div className="truncate text-sm font-medium">{value}</div>
      </div>
    </div>
  );
}
