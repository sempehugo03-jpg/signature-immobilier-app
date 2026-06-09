import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import hero from "@/assets/hero-house.jpg";
import {
  ArrowRight,
  ShieldCheck,
  LineChart,
  HeartHandshake,
  Clock,
  AlertTriangle,
  Eye,
  Phone,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Signature Immobilier — Vendez avec clarté et sérénité" },
      {
        name: "description",
        content:
          "Diagnostic vendeur, suivi de vente en ligne et accompagnement humain. Confiez votre bien à une agence qui vous accompagne vraiment.",
      },
      { property: "og:title", content: "Signature Immobilier" },
      {
        property: "og:description",
        content: "Vendez votre bien avec clarté, suivi et sérénité.",
      },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <SiteLayout>
      {/* HERO */}
      <section className="relative">
        <div className="mx-auto max-w-7xl px-5 md:px-8 pt-12 md:pt-20 pb-16 md:pb-24 grid md:grid-cols-2 gap-10 md:gap-14 items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs tracking-wide text-secondary-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-gold" />
              Agence immobilière haut de gamme
            </div>
            <h1 className="mt-5 font-display text-4xl md:text-6xl leading-[1.05]">
              Confiez votre bien à une agence qui vous{" "}
              <span className="italic text-primary">accompagne vraiment.</span>
            </h1>
            <p className="mt-5 text-base md:text-lg text-muted-foreground max-w-xl leading-relaxed">
              Estimation, stratégie de vente, diffusion, visites, négociation, notaire :
              suivez chaque étape de votre vente depuis un espace simple et transparent.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/diagnostic"
                className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-5 py-3 text-sm font-medium hover:bg-primary/90"
              >
                Démarrer mon diagnostic vendeur
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/espace-vendeur"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-5 py-3 text-sm font-medium hover:bg-secondary"
              >
                Voir comment fonctionne le suivi
              </Link>
            </div>
            <div className="mt-10 grid grid-cols-3 gap-6 max-w-md">
              {[
                ["12 sem.", "Délai de vente moyen"],
                ["+38%", "De mandats signés"],
                ["98%", "Vendeurs informés"],
              ].map(([k, v]) => (
                <div key={v}>
                  <div className="font-display text-2xl">{k}</div>
                  <div className="text-xs text-muted-foreground mt-1">{v}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 bg-secondary rounded-3xl -z-10" />
            <img
              src={hero}
              alt="Maison haut de gamme"
              className="w-full h-[420px] md:h-[560px] object-cover rounded-2xl shadow-xl"
            />
            <div className="absolute -bottom-5 -left-5 hidden md:block bg-card border border-border rounded-xl p-4 shadow-lg max-w-[230px]">
              <div className="text-xs text-muted-foreground">Score de sérénité</div>
              <div className="font-display text-3xl mt-1">68/100</div>
              <div className="mt-2 h-1.5 rounded-full bg-secondary overflow-hidden">
                <div className="h-full w-[68%] bg-gold" />
              </div>
              <div className="text-[11px] text-muted-foreground mt-2">
                Diagnostic vendeur en 3 min
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEME */}
      <section className="bg-secondary/50 border-y border-border">
        <div className="mx-auto max-w-7xl px-5 md:px-8 py-16 md:py-20">
          <div className="max-w-2xl">
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Le constat
            </div>
            <h2 className="mt-3 font-display text-3xl md:text-4xl">
              Vendre son bien ne devrait plus être source d'inquiétude.
            </h2>
            <p className="mt-4 text-muted-foreground">
              La plupart des propriétaires partagent les mêmes peurs au moment de confier
              leur bien :
            </p>
          </div>
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {[
              "Mal estimer mon bien",
              "Perdre du temps",
              "Ne pas avoir de nouvelles de l'agence",
              "Ne pas savoir ce qui est fait pour vendre",
              "Accepter une mauvaise offre",
            ].map((t) => (
              <div
                key={t}
                className="rounded-xl bg-card border border-border p-5 flex items-start gap-3"
              >
                <AlertTriangle className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                <div className="text-sm">{t}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROMESSE + bénéfices */}
      <section className="mx-auto max-w-7xl px-5 md:px-8 py-20 md:py-28">
        <div className="max-w-3xl">
          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Notre promesse
          </div>
          <h2 className="mt-3 font-display text-3xl md:text-5xl leading-tight">
            Chez Signature Immobilier, vous ne signez pas un mandat dans le flou.
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            Vous êtes accompagné, informé et suivi à chaque étape — du premier rendez-vous
            jusqu'à la signature chez le notaire.
          </p>
        </div>

        <div className="mt-14 grid md:grid-cols-3 gap-5">
          {[
            {
              icon: LineChart,
              title: "Diagnostic vendeur personnalisé",
              body: "Une analyse claire de votre projet : potentiel du bien, points à sécuriser, recommandations concrètes.",
            },
            {
              icon: Eye,
              title: "Suivi clair de la vente",
              body: "Une timeline en ligne, un compte-rendu après chaque visite, et un interlocuteur unique.",
            },
            {
              icon: HeartHandshake,
              title: "Accompagnement humain",
              body: "Estimation, négociation, compromis, notaire : on reste à vos côtés jusqu'à la signature.",
            },
          ].map((b) => (
            <div
              key={b.title}
              className="group rounded-2xl border border-border bg-card p-7 hover:shadow-lg transition-shadow"
            >
              <b.icon className="h-6 w-6 text-gold" />
              <div className="mt-5 font-display text-xl">{b.title}</div>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{b.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* QUOTE */}
      <section className="bg-primary text-primary-foreground">
        <div className="mx-auto max-w-5xl px-5 md:px-8 py-20 md:py-28 text-center">
          <div className="text-xs uppercase tracking-[0.25em] opacity-70">Notre conviction</div>
          <p className="mt-5 font-display text-2xl md:text-4xl leading-snug">
            “Un vendeur rassuré est un vendeur plus facile à accompagner — et un bien mieux
            vendu.”
          </p>
          <div className="mt-8 h-px gold-rule mx-auto w-40" />
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-5 md:px-8 py-20">
        <div className="rounded-3xl bg-secondary/60 border border-border p-8 md:p-14 grid md:grid-cols-[1.4fr_1fr] gap-8 items-center">
          <div>
            <h3 className="font-display text-3xl md:text-4xl">
              Obtenez votre diagnostic vendeur gratuit
            </h3>
            <p className="mt-4 text-muted-foreground max-w-xl">
              3 minutes, sans engagement. Recevez une première analyse claire de votre
              projet : potentiel, risques et recommandations.
            </p>
            <div className="mt-6 flex flex-wrap gap-4 text-sm">
              <div className="inline-flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4 text-gold" /> 3 min
              </div>
              <div className="inline-flex items-center gap-2 text-muted-foreground">
                <ShieldCheck className="h-4 w-4 text-gold" /> Données confidentielles
              </div>
              <div className="inline-flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4 text-gold" /> Rappel sous 24h
              </div>
            </div>
          </div>
          <div className="flex md:justify-end">
            <Link
              to="/diagnostic"
              className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-6 py-4 text-sm font-medium hover:bg-primary/90"
            >
              Démarrer mon diagnostic
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
