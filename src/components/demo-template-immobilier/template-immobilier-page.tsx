import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Quote } from "lucide-react";

import {
  formatTemplatePrice,
  realEstateTemplate,
} from "@/data/realEstateTemplate";
import { TemplateAppNav } from "./app-nav";

const basePath = "/demo/template-immobilier";
const { agency, assets, properties } = realEstateTemplate;

export function TemplateImmobilierPage() {
  const featured = properties.slice(0, 3);

  return (
    <div className="min-h-screen bg-background text-foreground pb-28 selection:bg-brand-black selection:text-white">
      <section className="relative h-[100svh] min-h-[640px] overflow-hidden">
        <img
          src={assets.hero}
          alt="Penthouse au coucher du soleil"
          width={1280}
          height={1600}
          className="absolute inset-0 size-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-white" />
        <nav className="absolute top-0 z-10 flex w-full items-center justify-between px-6 py-6 sm:px-10 sm:py-8">
          <span className="font-serif text-lg tracking-tight text-white">
            {agency.name}
          </span>
          <div className="hidden gap-7 text-xs font-medium tracking-widest text-white/80 uppercase sm:flex">
            <a href="#biens" className="hover:text-white">
              Biens
            </a>
            <a href="#methode" className="hover:text-white">
              Agence
            </a>
            <Link to={`${basePath}/connexion`} className="hover:text-white">
              Contact
            </Link>
          </div>
        </nav>
        <div className="absolute inset-x-0 bottom-16 z-10 px-6 sm:px-10">
          <div className="mx-auto max-w-3xl">
            <span className="mb-6 block text-[10px] font-medium tracking-[0.25em] text-white/70 uppercase">
              Agence - {agency.city}
            </span>
            <h1 className="font-serif text-5xl leading-[1.02] tracking-tight text-white sm:text-7xl">
              Votre bien merite
              <br />
              <span className="italic">une signature.</span>
            </h1>
            <div className="mt-10 flex flex-col gap-3 sm:max-w-md">
              <a
                href="#estimation"
                className="flex h-14 items-center justify-center rounded-full bg-brand-black text-sm font-medium text-white transition-transform active:scale-[0.98]"
              >
                Estimer mon bien
              </a>
              <a
                href="#biens"
                className="flex h-14 items-center justify-center rounded-full border border-white/30 bg-white/10 text-sm font-medium text-white backdrop-blur-xl transition active:scale-[0.98] hover:bg-white/15"
              >
                Voir les biens
              </a>
            </div>
          </div>
        </div>
      </section>

      <section id="biens" className="px-6 py-24 sm:px-10 sm:py-32">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 flex items-end justify-between">
            <div>
              <span className="text-[10px] font-medium tracking-[0.25em] text-brand-gray uppercase">
                Collection
              </span>
              <h2 className="mt-3 font-serif text-4xl tracking-tight sm:text-5xl">
                Nos exclusivites
              </h2>
            </div>
            <a
              href="#biens"
              className="hidden text-sm text-brand-gray hover:text-brand-black sm:flex sm:items-center sm:gap-1"
            >
              Tout voir <ArrowUpRight className="size-4" strokeWidth={1.5} />
            </a>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {featured.map((p) => (
              <a key={p.id} href="#biens" className="group block">
                <div className="aspect-[4/5] overflow-hidden rounded-2xl bg-brand-surface">
                  <img
                    src={p.image}
                    alt={p.title}
                    loading="lazy"
                    className="size-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="mt-4 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[10px] tracking-widest text-brand-gray uppercase">
                      {p.district}
                    </p>
                    <p className="mt-1 truncate text-sm font-medium">
                      {p.title}
                    </p>
                    <p className="text-xs text-brand-gray">
                      {p.surface} m2 - {p.rooms} pieces
                    </p>
                  </div>
                  <p className="font-serif text-base shrink-0">
                    {formatTemplatePrice(p.price)}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section
        id="methode"
        className="bg-brand-surface px-6 py-24 sm:px-10 sm:py-32"
      >
        <div className="mx-auto max-w-3xl">
          <span className="text-[10px] font-medium tracking-[0.25em] text-brand-gray uppercase">
            Methode
          </span>
          <h2 className="mt-3 font-serif text-4xl tracking-tight sm:text-5xl">
            Une approche artisanale
            <br />
            de la vente immobiliere.
          </h2>
          <div className="mt-16 space-y-14">
            {[
              {
                n: "01",
                t: "Estimation",
                d: "Analyse de 15 000 transactions recentes dans votre quartier pour definir le juste prix.",
              },
              {
                n: "02",
                t: "Mise en scene",
                d: "Photographie d'architecture, narration soignee, diffusion ciblee aupres d'acquereurs qualifies.",
              },
              {
                n: "03",
                t: "Accompagnement",
                d: "Un interlocuteur unique. Un espace vendeur clair. Aucun appel pour reclamer une information.",
              },
            ].map((s) => (
              <div
                key={s.n}
                className="grid grid-cols-[3rem_1fr] gap-6 sm:grid-cols-[5rem_1fr]"
              >
                <span className="font-serif text-2xl text-brand-gray">
                  {s.n}
                </span>
                <div>
                  <h3 className="text-base font-medium">{s.t}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-brand-gray">
                    {s.d}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-24 sm:px-10 sm:py-32">
        <div className="mx-auto grid max-w-6xl gap-12 sm:grid-cols-2 sm:items-center">
          <div>
            <span className="text-[10px] font-medium tracking-[0.25em] text-brand-gray uppercase">
              Espace vendeur
            </span>
            <h2 className="mt-3 font-serif text-4xl tracking-tight sm:text-5xl">
              Vous savez tout, en temps reel.
            </h2>
            <p className="mt-6 text-base leading-relaxed text-brand-gray">
              Visites, comptes rendus, offres, documents. Tout est sur une
              seule page, accessible en un instant.
            </p>
            <Link
              to={`${basePath}/vendeur`}
              className="mt-8 inline-flex h-12 items-center gap-2 rounded-full border border-black/10 bg-white px-6 text-sm font-medium transition hover:border-black/20"
            >
              Voir une demonstration{" "}
              <ArrowUpRight className="size-4" strokeWidth={1.5} />
            </Link>
          </div>
          <div className="rounded-3xl bg-brand-black p-6 text-white shadow-[0_30px_80px_-30px_rgba(0,0,0,0.4)] sm:p-8">
            <div className="flex items-center justify-between text-[10px] tracking-widest text-white/50 uppercase">
              <span>Quai d'Orsay</span>
              <span>Mandat actif</span>
            </div>
            <div className="mt-6 flex items-end justify-between">
              <div>
                <p className="text-[10px] tracking-widest text-white/50 uppercase">
                  Progression
                </p>
                <p className="mt-2 font-serif text-4xl">60 %</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] tracking-widest text-white/50 uppercase">
                  Prochaine visite
                </p>
                <p className="mt-2 text-sm">Demain - 14:00</p>
              </div>
            </div>
            <div className="mt-6 h-1 w-full overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-[60%] rounded-full bg-white" />
            </div>
            <div className="mt-8 grid grid-cols-3 gap-3 text-center">
              {[
                ["12", "Visites"],
                ["2", "Offres"],
                ["4", "Documents"],
              ].map(([n, l]) => (
                <div key={l} className="rounded-2xl bg-white/5 py-4">
                  <p className="font-serif text-xl">{n}</p>
                  <p className="mt-1 text-[10px] tracking-widest text-white/50 uppercase">
                    {l}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-brand-line px-6 py-24 sm:px-10 sm:py-32">
        <div className="mx-auto max-w-3xl">
          <Quote className="size-6 text-brand-gray" strokeWidth={1.25} />
          <p className="mt-6 font-serif text-2xl leading-snug italic sm:text-3xl">
            "Une clarte totale sur le processus. Notre appartement a ete vendu
            en onze jours au prix de l'estimation."
          </p>
          <div className="mt-8 flex items-center gap-3">
            <div className="size-10 rounded-full bg-brand-surface" />
            <div>
              <p className="text-sm font-medium">Marc-Antoine G.</p>
              <p className="text-[10px] tracking-widest text-brand-gray uppercase">
                Vendeur - Paris 16
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        id="estimation"
        className="bg-brand-black px-6 py-24 text-white sm:px-10 sm:py-32"
      >
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-serif text-4xl leading-tight sm:text-6xl">
            Parlons de votre projet.
          </h2>
          <p className="mt-6 text-base text-white/60">
            Une estimation indicative en 3 minutes. Sans engagement.
          </p>
          <Link
            to={`${basePath}/connexion`}
            className="mt-10 inline-flex h-14 items-center justify-center rounded-full bg-white px-10 text-sm font-medium text-brand-black transition-transform active:scale-[0.98]"
          >
            Estimer mon bien
          </Link>
        </div>
      </section>

      <footer className="border-t border-white/5 bg-brand-black px-6 py-10 text-white/50 sm:px-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 text-xs sm:flex-row sm:items-center sm:justify-between">
          <span className="font-serif text-base text-white">{agency.name}</span>
          <span>{agency.address}</span>
          <span>2026 - Tous droits reserves.</span>
        </div>
      </footer>

      <TemplateAppNav />
    </div>
  );
}
