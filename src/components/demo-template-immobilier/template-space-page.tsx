import { Link } from "@tanstack/react-router";
import { ArrowUpRight, CheckCircle2 } from "lucide-react";
import { useState } from "react";

import { realEstateTemplate } from "@/data/realEstateTemplate";
import { TemplateAppNav } from "./app-nav";

type TemplateSpacePageProps = {
  mode: "connexion" | "vendeur" | "agent" | "patron";
};

const labels = {
  connexion: {
    eyebrow: "Acces",
    title: "Connectez votre espace Signature.",
    body: "Cette demo ne cree aucun compte. Elle affiche simplement une confirmation locale au style du template.",
    cta: "Recevoir le lien de demo",
  },
  vendeur: {
    eyebrow: "Espace vendeur",
    title: "Suivez votre mandat en temps reel.",
    body: "Visites, offres, documents et prochaines actions restent lisibles sur une page claire.",
    cta: "Confirmer la consultation",
  },
  agent: {
    eyebrow: "Espace professionnel",
    title: "Pilotez les mandats actifs.",
    body: "Une vue operationnelle pour les biens, les vendeurs et les prochaines relances.",
    cta: "Ouvrir la vue agent",
  },
  patron: {
    eyebrow: "Direction",
    title: "Gardez une vision nette de l'agence.",
    body: "Mandats, offres, volume d'activite et qualite de suivi sont presentes sans surcharge.",
    cta: "Voir le resume",
  },
} as const;

export function TemplateSpacePage({ mode }: TemplateSpacePageProps) {
  const [confirmed, setConfirmed] = useState(false);
  const copy = labels[mode];
  const property = realEstateTemplate.properties[0];

  return (
    <div className="min-h-screen bg-background text-foreground pb-28 selection:bg-brand-black selection:text-white">
      <header className="border-b border-brand-line px-6 py-6 sm:px-10">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link
            to="/demo/template-immobilier"
            className="font-serif text-lg tracking-tight text-brand-black"
          >
            {realEstateTemplate.agency.name}
          </Link>
          <Link
            to="/demo/template-immobilier"
            className="text-xs font-medium uppercase tracking-[0.25em] text-brand-gray hover:text-brand-black"
          >
            Accueil
          </Link>
        </div>
      </header>

      <main className="px-6 py-20 sm:px-10 sm:py-28">
        <div className="mx-auto grid max-w-6xl gap-12 sm:grid-cols-[0.95fr_1.05fr] sm:items-center">
          <section>
            <span className="text-[10px] font-medium tracking-[0.25em] text-brand-gray uppercase">
              {copy.eyebrow}
            </span>
            <h1 className="mt-4 font-serif text-5xl leading-[1.02] tracking-tight sm:text-7xl">
              {copy.title}
            </h1>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-brand-gray">
              {copy.body}
            </p>

            <form
              className="mt-10 max-w-md space-y-3"
              onSubmit={(event) => {
                event.preventDefault();
                setConfirmed(true);
              }}
            >
              <input
                aria-label="Email"
                type="email"
                required
                placeholder="email@exemple.fr"
                className="h-14 w-full rounded-full border border-brand-line bg-white px-5 text-sm outline-none transition focus:border-brand-black"
              />
              <button
                type="submit"
                className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-brand-black px-8 text-sm font-medium text-white transition-transform active:scale-[0.98]"
              >
                {copy.cta}
                <ArrowUpRight className="size-4" strokeWidth={1.5} />
              </button>
            </form>

            {confirmed && (
              <div className="mt-5 flex max-w-md items-start gap-3 rounded-2xl bg-brand-surface p-4 text-sm text-brand-black">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
                <p>
                  Confirmation enregistree pour la demo. Aucun email n'a ete
                  ouvert ou envoye.
                </p>
              </div>
            )}
          </section>

          <section className="rounded-3xl bg-brand-black p-6 text-white shadow-[0_30px_80px_-30px_rgba(0,0,0,0.4)] sm:p-8">
            <div className="aspect-[4/5] overflow-hidden rounded-2xl bg-white/5">
              <img
                src={property.image}
                alt={property.title}
                className="size-full object-cover"
              />
            </div>
            <div className="mt-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] tracking-widest text-white/50 uppercase">
                  {property.district}
                </p>
                <h2 className="mt-2 font-serif text-3xl">{property.title}</h2>
              </div>
              <p className="text-right font-serif text-2xl">
                {property.progress} %
              </p>
            </div>
            <div className="mt-6 h-1 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-white"
                style={{ width: `${property.progress}%` }}
              />
            </div>
          </section>
        </div>
      </main>

      <TemplateAppNav />
    </div>
  );
}
