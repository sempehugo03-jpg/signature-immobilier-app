import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { useEffect, useState } from "react";
import { getCurrentDiagnostic, type Diagnostic } from "@/lib/demo-store";
import {
  Camera,
  CheckCircle2,
  Circle,
  Clock,
  FileText,
  Handshake,
  Home,
  KeyRound,
  MessageSquare,
  Search,
  Send,
  Users,
} from "lucide-react";

export const Route = createFileRoute("/espace-vendeur")({
  head: () => ({
    meta: [
      { title: "Mon espace vendeur — Signature Immobilier" },
      { name: "description", content: "Suivez chaque étape de la vente de votre bien." },
    ],
  }),
  component: Page,
});

const STEPS = [
  { t: "Diagnostic du bien", s: "termine", icon: CheckCircle2 },
  { t: "Rendez-vous estimation", s: "planifier", icon: Clock },
  { t: "Préparation du dossier", s: "attente", icon: FileText },
  { t: "Reportage photo", s: "venir", icon: Camera },
  { t: "Mise en ligne de l'annonce", s: "venir", icon: Home },
  { t: "Diffusion sur les plateformes", s: "venir", icon: Send },
  { t: "Visites acheteurs", s: "venir", icon: Users },
  { t: "Retours de visites", s: "venir", icon: MessageSquare },
  { t: "Offre d'achat", s: "venir", icon: Handshake },
  { t: "Compromis de vente", s: "venir", icon: FileText },
  { t: "Suivi notaire", s: "venir", icon: Search },
  { t: "Vente signée", s: "venir", icon: KeyRound },
];

const DOCS = [
  "Titre de propriété",
  "Taxe foncière",
  "Diagnostics immobiliers",
  "Factures de travaux",
  "Plans du bien",
  "Charges de copropriété",
  "Règlement de copropriété",
  "Bail locatif (si le bien est loué)",
  "Pièce d'identité",
  "Relevé de prêt restant (si applicable)",
];

function Page() {
  const [diag, setDiag] = useState<Diagnostic | null>(null);
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setDiag(getCurrentDiagnostic());
  }, []);

  const prenom = diag?.contact.prenom || "Vendeur";
  const bien = diag ? `${diag.bien.type || "Bien"} ${diag.bien.surface ? diag.bien.surface + " m²" : ""} — ${diag.bien.ville || ""}` : "Maison 115 m² — Tarbes";

  return (
    <SiteLayout>
      <section className="border-b border-border bg-secondary/40">
        <div className="mx-auto max-w-6xl px-5 md:px-8 py-10 md:py-14 flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
              Mon espace vendeur
            </div>
            <h1 className="mt-2 font-display text-3xl md:text-5xl">
              Bonjour {prenom}.
            </h1>
            <p className="mt-3 text-muted-foreground">{bien}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-card border border-border px-5 py-3 text-sm">
              <div className="text-xs text-muted-foreground">Conseiller dédié</div>
              <div className="font-medium">Sophie Martin</div>
            </div>
            <a
              href="tel:0562000000"
              className="rounded-full bg-primary text-primary-foreground px-4 py-2.5 text-sm font-medium"
            >
              Appeler
            </a>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 md:px-8 py-12 grid lg:grid-cols-[1.4fr_1fr] gap-10">
        {/* Timeline */}
        <div>
          <h2 className="font-display text-2xl">Suivi de votre vente</h2>
          <p className="text-sm text-muted-foreground mt-1">
            12 étapes, du diagnostic à la signature chez le notaire.
          </p>

          <ol className="mt-6 relative">
            <div className="absolute left-[15px] top-2 bottom-2 w-px bg-border" />
            {STEPS.map((step, i) => (
              <li key={step.t} className="relative pl-12 pb-5">
                <div
                  className={`absolute left-0 top-0 h-8 w-8 rounded-full grid place-items-center border ${
                    step.s === "termine"
                      ? "bg-primary text-primary-foreground border-primary"
                      : step.s === "planifier"
                      ? "bg-gold text-gold-foreground border-gold"
                      : "bg-background text-muted-foreground border-border"
                  }`}
                >
                  {step.s === "termine" ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : step.s === "planifier" ? (
                    <Clock className="h-4 w-4" />
                  ) : (
                    <Circle className="h-3 w-3" />
                  )}
                </div>
                <div className="rounded-xl bg-card border border-border px-4 py-3 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs text-muted-foreground">Étape {i + 1}</div>
                    <div className="font-medium">{step.t}</div>
                  </div>
                  <span
                    className={`text-[11px] px-2.5 py-1 rounded-full ${
                      step.s === "termine"
                        ? "bg-primary text-primary-foreground"
                        : step.s === "planifier"
                        ? "bg-gold/20 text-foreground border border-gold"
                        : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {step.s === "termine"
                      ? "Terminé"
                      : step.s === "planifier"
                      ? "À planifier"
                      : step.s === "attente"
                      ? "En attente"
                      : "À venir"}
                  </span>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <aside className="space-y-8">
          {/* Messages */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-gold">
              <MessageSquare className="h-4 w-4" />
              Messages et conseils de l'agence
            </div>
            <div className="mt-4 space-y-3">
              {[
                "Votre diagnostic a bien été reçu. Un conseiller va vous rappeler pour affiner l'estimation.",
                "Pensez à préparer votre taxe foncière et vos diagnostics.",
                "Votre bien présente de bons atouts, mais quelques éléments doivent être vérifiés avant la mise en vente.",
              ].map((m, i) => (
                <div key={i} className="text-sm bg-secondary/60 rounded-lg p-3 leading-relaxed">
                  {m}
                </div>
              ))}
            </div>
          </div>

          {/* Documents */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-gold">
              <FileText className="h-4 w-4" />
              Documents à préparer
            </div>
            <ul className="mt-4 space-y-1">
              {DOCS.map((d) => (
                <li key={d}>
                  <label className="flex items-start gap-3 text-sm py-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!checked[d]}
                      onChange={(e) =>
                        setChecked((c) => ({ ...c, [d]: e.target.checked }))
                      }
                      className="mt-1"
                    />
                    <span className={checked[d] ? "text-muted-foreground line-through" : ""}>
                      {d}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
            <div className="mt-3 text-xs text-muted-foreground">
              {Object.values(checked).filter(Boolean).length}/{DOCS.length} documents prêts
            </div>
          </div>

          <Link
            to="/agence"
            className="block text-center rounded-full border border-border bg-background px-5 py-3 text-sm font-medium hover:bg-secondary"
          >
            Voir le tableau de bord agence →
          </Link>
        </aside>
      </section>

      {/* Ce que l'agence fait pour vous */}
      <section className="bg-secondary/50 border-t border-border">
        <div className="mx-auto max-w-6xl px-5 md:px-8 py-14">
          <h2 className="font-display text-2xl md:text-3xl">
            Ce que l'agence fait pour vous
          </h2>
          <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              "Estimation précise du bien",
              "Mise en valeur avec photos et description",
              "Diffusion sur les canaux adaptés",
              "Qualification des acheteurs",
              "Organisation des visites",
              "Compte-rendu après chaque visite",
              "Négociation des offres",
              "Suivi administratif et notaire",
            ].map((t) => (
              <div key={t} className="rounded-xl bg-card border border-border p-5 text-sm">
                <div className="h-1 w-8 bg-gold rounded-full mb-3" />
                {t}
              </div>
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
