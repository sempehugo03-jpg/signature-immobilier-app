import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ProtectedRoute } from "@/components/protected-route";
import { SiteLayout } from "@/components/site-layout";
import { fakeProspects } from "@/lib/demo-store";
import { SellerSpaceCreator } from "@/components/seller-space-creator";
import {
  ArrowLeft,
  ClipboardCopy,
  FileText,
  MessageSquareQuote,
  PhoneCall,
  Sparkles,
} from "lucide-react";

export const Route = createFileRoute("/agence/$id")({
  head: () => ({
    meta: [{ title: "Fiche prospect — Signature Immobilier" }],
  }),
  loader: ({ params }) => {
    const p = fakeProspects.find((x) => x.id === params.id);
    if (!p) throw notFound();
    return p;
  },
  notFoundComponent: () => (
    <SiteLayout>
      <div className="mx-auto max-w-md text-center py-32 px-5">
        <h1 className="font-display text-3xl">Prospect introuvable</h1>
        <Link to="/agence" className="mt-6 inline-block underline">
          Retour au tableau de bord
        </Link>
      </div>
    </SiteLayout>
  ),
  component: AgenceProspectRoute,
});

function AgenceProspectRoute() {
  return (
    <ProtectedRoute role="agent">
      <Page />
    </ProtectedRoute>
  );
}

function Page() {
  const p = Route.useLoaderData();

  return (
    <SiteLayout>
      <section className="border-b border-border bg-primary text-primary-foreground">
        <div className="mx-auto max-w-6xl px-5 md:px-8 py-10">
          <Link
            to="/agence"
            className="inline-flex items-center gap-2 text-sm opacity-70 hover:opacity-100"
          >
            <ArrowLeft className="h-4 w-4" /> Retour au tableau de bord
          </Link>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-[0.25em] opacity-70">
                Fiche prospect
              </div>
              <h1 className="mt-2 font-display text-3xl md:text-4xl">
                {p.prenom} {p.nom}
              </h1>
              <div className="text-sm opacity-80 mt-1">
                {p.ville} · {p.bien}
              </div>
            </div>
            <div className="flex gap-3">
              <a
                href="tel:0562000000"
                className="inline-flex items-center gap-2 rounded-full bg-gold text-gold-foreground px-4 py-2.5 text-sm font-medium"
              >
                <PhoneCall className="h-4 w-4" /> Appeler maintenant
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 md:px-8 py-10 grid lg:grid-cols-3 gap-6">
        <Card title="Informations du bien">
          <Kv k="Type" v={p.type} />
          <Kv k="Surface" v={`${p.surface} m²`} />
          <Kv k="Pièces" v={`${p.pieces}`} />
          <Kv k="Ville" v={p.ville} />
        </Card>
        <Card title="Projet de vente">
          <Kv k="Motivation" v={p.motivation} />
          <Kv k="Délai" v={p.delai} />
          <Kv k="Niveau d'urgence" v={p.score.replace("-", " ")} />
          <Kv k="Peur principale" v={p.peur} />
        </Card>
        <Card title="Action recommandée" highlight>
          <div className="text-sm">{p.action}</div>
          <div className="mt-3 text-xs text-muted-foreground">
            Angle de rappel conseillé :
          </div>
          <div className="mt-1 text-sm leading-relaxed">{p.angle}</div>
        </Card>

        <Card title="Points forts">
          <ul className="space-y-1.5 text-sm">
            {p.forts.map((f: string) => (
              <li key={f} className="flex gap-2">
                <span className="text-gold">+</span> {f}
              </li>
            ))}
          </ul>
        </Card>
        <Card title="Points faibles">
          <ul className="space-y-1.5 text-sm">
            {p.faibles.map((f: string) => (
              <li key={f} className="flex gap-2">
                <span className="text-destructive">−</span> {f}
              </li>
            ))}
          </ul>
        </Card>
        <Card title="Documents disponibles">
          <ul className="space-y-1.5 text-sm">
            {p.docs.map((d: string) => (
              <li key={d} className="flex gap-2">
                <FileText className="h-3.5 w-3.5 mt-0.5 text-muted-foreground" />
                {d}
              </li>
            ))}
          </ul>
        </Card>

        <div className="lg:col-span-3 rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-gold">
            <MessageSquareQuote className="h-4 w-4" />
            Script d'appel recommandé
          </div>
          <p className="mt-3 text-foreground/90 leading-relaxed italic">
            « {p.script} »
          </p>
          <button
            onClick={() => navigator.clipboard?.writeText(p.script)}
            className="mt-5 inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-xs hover:bg-secondary"
          >
            <ClipboardCopy className="h-3.5 w-3.5" /> Copier le script
          </button>
        </div>

        <div className="lg:col-span-3 rounded-2xl bg-secondary/60 border border-border p-7 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-gold" />
            <div>
              <div className="font-medium">Bon à savoir</div>
              <div className="text-sm text-muted-foreground">
                Ce prospect a déjà reçu son pré-diagnostic. Son espace vendeur
                est actif.
              </div>
            </div>
          </div>
          <Link
            to="/espace-vendeur"
            className="rounded-full border border-border bg-background px-4 py-2 text-sm hover:bg-secondary"
          >
            Voir l'espace vendeur →
          </Link>
        </div>

        <div className="lg:col-span-3">
          <SellerSpaceCreator
            propertyId={p.id}
            propertyTitle={p.bien}
            initialSeller={{
              firstName: p.prenom,
              lastName: p.nom,
              email: "",
              phone: "",
            }}
          />
        </div>
      </section>
    </SiteLayout>
  );
}

function Card({
  title,
  highlight,
  children,
}: {
  title: string;
  highlight?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-2xl border p-6 ${
        highlight ? "border-gold bg-gold/5" : "border-border bg-card"
      }`}
    >
      <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
        {title}
      </div>
      <div className="mt-3 space-y-2">{children}</div>
    </div>
  );
}
function Kv({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-3 text-sm">
      <span className="text-muted-foreground">{k}</span>
      <span className="font-medium text-right">{v}</span>
    </div>
  );
}
