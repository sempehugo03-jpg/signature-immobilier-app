import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import {
  ArrowRight,
  Briefcase,
  Eye,
  LayoutDashboard,
  Sparkles,
  User2,
} from "lucide-react";

export const Route = createFileRoute("/demo")({
  head: () => ({
    meta: [
      { title: "Démo agence — Tester le parcours vendeur" },
      {
        name: "description",
        content:
          "Testez le parcours vendeur Signature Immobilier comme si vous étiez un propriétaire.",
      },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <SiteLayout>
      <section className="mx-auto max-w-5xl px-5 md:px-8 py-16 md:py-24">
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-xs">
            <Sparkles className="h-3.5 w-3.5 text-gold" />
            Démo agence
          </div>
          <h1 className="mt-5 font-display text-4xl md:text-6xl">
            Tester le parcours vendeur
          </h1>
          <p className="mt-5 text-muted-foreground text-lg">
            Remplissez le parcours comme si vous étiez un propriétaire. Vous verrez comment
            le système qualifie le prospect, rassure le vendeur et prépare le travail de
            l'agence.
          </p>
        </div>

        <div className="mt-12 grid md:grid-cols-3 gap-5">
          <Tile
            to="/diagnostic"
            icon={User2}
            title="Tester comme vendeur"
            body="Remplissez le diagnostic en 3 minutes et obtenez un pré-diagnostic personnalisé."
            cta="Démarrer le parcours"
          />
          <Tile
            to="/agence"
            icon={LayoutDashboard}
            title="Voir le tableau de bord agence"
            body="Visualisez les prospects qualifiés, leur urgence et l'action recommandée."
            cta="Ouvrir le tableau de bord"
          />
          <Tile
            to="/espace-vendeur"
            icon={Eye}
            title="Voir l'espace de suivi vendeur"
            body="La timeline complète de vente, les messages de l'agence et les documents."
            cta="Ouvrir l'espace vendeur"
          />
        </div>

        <div className="mt-16 rounded-3xl bg-primary text-primary-foreground p-8 md:p-14">
          <div className="text-xs uppercase tracking-[0.25em] opacity-70">
            Pourquoi cette démo
          </div>
          <h2 className="mt-3 font-display text-2xl md:text-4xl leading-snug">
            Transformez votre site en assistant commercial disponible 24h/24.
          </h2>
          <p className="mt-4 opacity-80 max-w-3xl">
            Votre site ne doit pas seulement présenter votre agence. Il doit convaincre un
            propriétaire qu'il sera mieux accompagné chez vous qu'ailleurs.
          </p>
          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
            {[
              "Capter plus de mandats vendeurs",
              "Qualifier les prospects automatiquement",
              "Rassurer les propriétaires",
              "Montrer le travail invisible de l'agence",
              "Gagner du temps",
              "Améliorer son image premium",
              "Se différencier des autres agences",
              "Suivre les vendeurs de manière claire",
            ].map((t) => (
              <div
                key={t}
                className="rounded-xl bg-primary-foreground/5 border border-primary-foreground/10 p-4"
              >
                <Briefcase className="h-4 w-4 text-gold" />
                <div className="mt-3">{t}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

function Tile({
  to,
  icon: Icon,
  title,
  body,
  cta,
}: {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: string;
  cta: string;
}) {
  return (
    <Link
      to={to}
      className="group rounded-2xl border border-border bg-card p-7 hover:shadow-lg hover:border-gold/50 transition"
    >
      <Icon className="h-6 w-6 text-gold" />
      <div className="mt-5 font-display text-xl">{title}</div>
      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{body}</p>
      <div className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium">
        {cta}
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}
