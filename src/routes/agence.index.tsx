import { createFileRoute, Link } from "@tanstack/react-router";
import { ProtectedRoute } from "@/components/protected-route";
import { SiteLayout } from "@/components/site-layout";
import { fakeProspects, listDiagnostics } from "@/lib/demo-store";
import { useEffect, useState } from "react";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  ClipboardList,
  Flame,
  Home,
  PhoneCall,
  Plus,
  TrendingUp,
} from "lucide-react";

export const Route = createFileRoute("/agence/")({
  head: () => ({
    meta: [
      { title: "Tableau de bord agence — Signature Immobilier" },
      {
        name: "description",
        content: "Vue d'ensemble des prospects vendeurs.",
      },
    ],
  }),
  component: AgenceIndexRoute,
});

function AgenceIndexRoute() {
  return (
    <ProtectedRoute role="agent">
      <Page />
    </ProtectedRoute>
  );
}

function Page() {
  const [extra, setExtra] = useState<number>(0);
  useEffect(() => setExtra(listDiagnostics().length), []);

  return (
    <SiteLayout>
      <section className="border-b border-border bg-primary text-primary-foreground">
        <div className="mx-auto max-w-7xl px-5 md:px-8 py-10 md:py-12 flex flex-wrap items-center justify-between gap-6">
          <div>
            <div className="text-xs uppercase tracking-[0.25em] opacity-70">
              Signature Immobilier · Interne
            </div>
            <h1 className="mt-2 font-display text-3xl md:text-4xl">
              Tableau de bord agence
            </h1>
          </div>
          <Link
            to="/agence/compte-rendu"
            className="inline-flex items-center gap-2 rounded-full bg-gold text-gold-foreground px-4 py-2.5 text-sm font-medium"
          >
            <Plus className="h-4 w-4" /> Nouveau compte-rendu de visite
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 md:px-8 py-10">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <Stat icon={ClipboardList} k={12 + extra} l="Diagnostics commencés" />
          <Stat icon={CheckCircle2} k={7 + extra} l="Diagnostics terminés" />
          <Stat icon={Flame} k={5} l="Prospects chauds" tone="gold" />
          <Stat icon={Calendar} k={3} l="Estimations à planifier" />
          <Stat icon={AlertCircle} k={2} l="Vendeurs urgents" tone="danger" />
          <Stat icon={Home} k={1} l="Déjà en vente ailleurs" />
        </div>

        {/* Prospects */}
        <div className="mt-12 flex items-center justify-between">
          <h2 className="font-display text-2xl">Prospects vendeurs</h2>
          <div className="text-sm text-muted-foreground">
            {fakeProspects.length} prospects qualifiés
          </div>
        </div>

        <div className="mt-5 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {fakeProspects.map((p) => (
            <Link
              key={p.id}
              to="/agence/$id"
              params={{ id: p.id }}
              className="group rounded-2xl border border-border bg-card p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-secondary grid place-items-center text-sm font-medium">
                    {p.prenom[0]}
                    {p.nom[0]}
                  </div>
                  <div>
                    <div className="font-medium">
                      {p.prenom} {p.nom}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {p.ville}
                    </div>
                  </div>
                </div>
                <Badge tone={p.score}>{label(p.score)}</Badge>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                <Row k="Bien" v={p.bien} />
                <Row k="Délai" v={p.delai} />
                <Row k="Motivation" v={p.motivation} />
                <Row k="Pièces" v={`${p.pieces}`} />
              </div>

              <div className="mt-5 pt-4 border-t border-border flex items-center justify-between">
                <div className="text-xs">
                  <div className="text-muted-foreground">
                    Action recommandée
                  </div>
                  <div className="font-medium mt-0.5">{p.action}</div>
                </div>
                <PhoneCall className="h-4 w-4 text-gold" />
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-border bg-secondary/40 p-7 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="font-display text-xl">Performance commerciale</div>
            <div className="text-sm text-muted-foreground mt-1">
              +38% de mandats signés vs. l'année passée
            </div>
          </div>
          <TrendingUp className="h-6 w-6 text-gold" />
        </div>
      </section>
    </SiteLayout>
  );
}

function Stat({
  icon: Icon,
  k,
  l,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  k: number;
  l: string;
  tone?: "gold" | "danger";
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <Icon
        className={`h-4 w-4 ${
          tone === "gold"
            ? "text-gold"
            : tone === "danger"
              ? "text-destructive"
              : "text-muted-foreground"
        }`}
      />
      <div className="mt-3 font-display text-3xl">{k}</div>
      <div className="text-xs text-muted-foreground mt-1">{l}</div>
    </div>
  );
}
function Row({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
        {k}
      </div>
      <div className="mt-0.5">{v}</div>
    </div>
  );
}
function Badge({
  tone,
  children,
}: {
  tone: string;
  children: React.ReactNode;
}) {
  const cls =
    tone === "tres-chaud"
      ? "bg-destructive/15 text-destructive border-destructive/30"
      : tone === "chaud"
        ? "bg-gold/20 text-foreground border-gold"
        : tone === "tiede"
          ? "bg-secondary text-foreground border-border"
          : "bg-secondary text-muted-foreground border-border";
  return (
    <span className={`text-[11px] px-2.5 py-1 rounded-full border ${cls}`}>
      {children}
    </span>
  );
}
function label(t: string) {
  return t === "tres-chaud"
    ? "Très chaud"
    : t === "chaud"
      ? "Chaud"
      : t === "tiede"
        ? "Tiède"
        : "Froid";
}
