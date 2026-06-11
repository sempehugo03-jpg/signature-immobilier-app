import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { useEffect, useState } from "react";
import { getCurrentDiagnostic, type Diagnostic } from "@/lib/demo-store";
import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  FileText,
  Megaphone,
  Phone,
  Sparkles,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";

export const Route = createFileRoute("/resultat")({
  head: () => ({
    meta: [
      { title: "Votre pré-diagnostic vendeur — Signature Immobilier" },
      {
        name: "description",
        content: "Analyse personnalisée de votre projet de vente.",
      },
    ],
  }),
  component: Page,
});

function Page() {
  const [diag, setDiag] = useState<Diagnostic | null>(null);
  useEffect(() => {
    setDiag(getCurrentDiagnostic());
  }, []);

  const score = diag?.score ?? 68;
  const prenom = diag?.contact.prenom || "";
  const ville = diag?.bien.ville || "votre secteur";
  const type = diag?.bien.type || "votre bien";
  const surface = diag?.bien.surface || "—";

  return (
    <SiteLayout>
      <section className="mx-auto max-w-5xl px-5 md:px-8 py-12 md:py-16">
        <div className="text-center">
          <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
            Analyse personnalisée
          </div>
          <h1 className="mt-3 font-display text-3xl md:text-5xl">
            Votre pré-diagnostic vendeur est prêt
            {prenom && (
              <span className="text-muted-foreground">, {prenom}</span>
            )}
          </h1>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            Voici une première lecture intelligente de votre projet. Un
            conseiller pourra affiner cette analyse lors d'un échange de 15
            minutes.
          </p>
        </div>

        {/* Score */}
        <div className="mt-10 grid md:grid-cols-[1fr_2fr] gap-6">
          <div className="rounded-2xl bg-primary text-primary-foreground p-8 text-center">
            <div className="text-xs uppercase tracking-[0.25em] opacity-70">
              Score de sérénité de vente
            </div>
            <div className="mt-4 font-display text-6xl">
              {score}
              <span className="text-3xl opacity-60">/100</span>
            </div>
            <div className="mt-5 h-1.5 rounded-full bg-primary-foreground/15 overflow-hidden">
              <div className="h-full bg-gold" style={{ width: `${score}%` }} />
            </div>
            <div className="mt-5 text-sm opacity-80">
              {type} de {surface} m² — {ville}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-7">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-gold">
              <Sparkles className="h-4 w-4" />
              Synthèse
            </div>
            <p className="mt-3 leading-relaxed text-foreground/90">
              Votre projet présente de <strong>bons fondamentaux</strong>. Les
              éléments à sécuriser concernent principalement{" "}
              <strong>le prix de départ</strong> et la
              <strong> qualité de présentation du bien</strong>. Un
              accompagnement structuré permet de réduire significativement le
              délai de vente et d'éviter une négociation excessive.
            </p>
          </div>
        </div>

        {/* 4 blocs */}
        <div className="mt-8 grid md:grid-cols-2 gap-5">
          <Block
            tone="ok"
            icon={TrendingUp}
            title="Potentiel du bien"
            body="Votre bien semble présenter un bon potentiel, notamment grâce à sa surface, son emplacement et ses caractéristiques recherchées."
          />
          <Block
            tone="warn"
            icon={Target}
            title="Points à sécuriser"
            body="L'estimation finale doit être validée avec précision. Un prix mal positionné peut rallonger le délai de vente ou provoquer une négociation importante."
          />
          <Block
            tone="danger"
            icon={AlertTriangle}
            title="Risques possibles"
            list={[
              "Prix de départ trop élevé",
              "Photos peu valorisantes",
              "Dossier incomplet",
              "Mauvaise sélection des acheteurs",
              "Manque de retours après les visites",
            ]}
          />
          <Block
            tone="ok"
            icon={CheckCircle2}
            title="Recommandation"
            body="Pour vendre dans les meilleures conditions, nous vous recommandons de valider une stratégie de vente complète avec un conseiller : prix de départ, présentation du bien, cible acheteur, diffusion, calendrier de vente et documents à préparer."
          />
        </div>

        {/* Ce que l'agence prépare */}
        <div className="mt-10 rounded-2xl border border-border bg-secondary/40 p-7 md:p-10">
          <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
            Ce que l'agence va préparer pour vous
          </div>
          <h2 className="mt-2 font-display text-2xl md:text-3xl">
            Une stratégie de vente complète et concrète
          </h2>
          <div className="mt-7 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                i: TrendingUp,
                t: "Fourchette de prix réaliste",
                d: "Argumentée par les ventes comparables.",
              },
              {
                i: Users,
                t: "Analyse de la concurrence locale",
                d: "Les biens en vente actuellement sur votre secteur.",
              },
              {
                i: Camera,
                t: "Conseils de mise en valeur",
                d: "Home-staging, photos, ordre des visites.",
              },
              {
                i: Megaphone,
                t: "Plan de diffusion",
                d: "Canaux adaptés à votre cible acheteur.",
              },
              {
                i: FileText,
                t: "Liste des documents nécessaires",
                d: "Tout ce qui doit être réuni avant la mise en vente.",
              },
              {
                i: Target,
                t: "Stratégie de négociation",
                d: "Plancher, marge, posture face aux offres.",
              },
            ].map((b) => (
              <div
                key={b.t}
                className="rounded-xl bg-card border border-border p-5"
              >
                <b.i className="h-5 w-5 text-gold" />
                <div className="mt-3 font-medium">{b.t}</div>
                <div className="mt-1 text-sm text-muted-foreground">{b.d}</div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="tel:0562000000"
              className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-5 py-3 text-sm font-medium hover:bg-primary/90"
            >
              <Phone className="h-4 w-4" />
              Réserver un appel avec un conseiller
            </a>
            <Link
              to="/mon-suivi"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-5 py-3 text-sm font-medium hover:bg-secondary"
            >
              Accéder à Mon suivi
            </Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

function Block({
  icon: Icon,
  title,
  body,
  list,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body?: string;
  list?: string[];
  tone: "ok" | "warn" | "danger";
}) {
  const toneClass =
    tone === "danger"
      ? "text-destructive"
      : tone === "warn"
        ? "text-gold"
        : "text-primary";
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <Icon className={`h-5 w-5 ${toneClass}`} />
      <div className="mt-3 font-display text-xl">{title}</div>
      {body && (
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          {body}
        </p>
      )}
      {list && (
        <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
          {list.map((l) => (
            <li key={l} className="flex gap-2">
              <span className="text-gold">•</span> {l}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
