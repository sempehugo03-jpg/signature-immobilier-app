import { Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { Menu, X } from "lucide-react";
import { AssistantWidget } from "@/components/assistant-widget";

const navItems = [
  { to: "/", label: "Accueil" },
  { to: "/diagnostic", label: "Diagnostic vendeur" },
  { to: "/espace-vendeur", label: "Espace vendeur" },
  { to: "/agence", label: "Tableau de bord" },
  { to: "/demo", label: "Démo agence" },
] as const;

export function SiteLayout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto max-w-7xl px-5 md:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <span className="inline-block h-7 w-7 rounded-sm bg-primary text-primary-foreground grid place-items-center font-display text-lg leading-none">
              S
            </span>
            <span className="font-display text-lg tracking-tight">
              Signature <span className="text-muted-foreground">Immobilier</span>
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-7 text-sm">
            {navItems.map((i) => (
              <Link
                key={i.to}
                to={i.to}
                className="text-foreground/70 hover:text-foreground transition-colors"
                activeProps={{ className: "text-foreground font-medium" }}
                activeOptions={{ exact: i.to === "/" }}
              >
                {i.label}
              </Link>
            ))}
          </nav>
          <Link
            to="/diagnostic"
            className="hidden md:inline-flex items-center rounded-full bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 transition"
          >
            Diagnostic gratuit
          </Link>
          <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {open && (
          <div className="md:hidden border-t border-border bg-background">
            <div className="px-5 py-3 flex flex-col gap-1">
              {navItems.map((i) => (
                <Link
                  key={i.to}
                  to={i.to}
                  onClick={() => setOpen(false)}
                  className="py-2 text-sm text-foreground/80"
                  activeProps={{ className: "text-foreground font-medium" }}
                  activeOptions={{ exact: i.to === "/" }}
                >
                  {i.label}
                </Link>
              ))}
              <Link
                to="/diagnostic"
                onClick={() => setOpen(false)}
                className="mt-2 inline-flex justify-center rounded-full bg-primary text-primary-foreground px-4 py-2 text-sm font-medium"
              >
                Diagnostic gratuit
              </Link>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border bg-secondary/40 mt-20">
        <div className="mx-auto max-w-7xl px-5 md:px-8 py-12 grid gap-10 md:grid-cols-4 text-sm">
          <div>
            <div className="font-display text-xl">Signature Immobilier</div>
            <p className="mt-3 text-muted-foreground">
              Vendez votre bien avec clarté, suivi et sérénité.
            </p>
          </div>
          <div>
            <div className="font-medium mb-3">Accompagnement vendeur</div>
            <ul className="space-y-2 text-muted-foreground">
              <li><Link to="/diagnostic">Diagnostic gratuit</Link></li>
              <li><Link to="/espace-vendeur">Suivi de vente</Link></li>
              <li><Link to="/agence">Tableau de bord</Link></li>
            </ul>
          </div>
          <div>
            <div className="font-medium mb-3">L'agence</div>
            <ul className="space-y-2 text-muted-foreground">
              <li>Estimation</li>
              <li>Suivi de vente</li>
              <li>Stratégie de diffusion</li>
            </ul>
          </div>
          <div>
            <div className="font-medium mb-3">Contact</div>
            <ul className="space-y-2 text-muted-foreground">
              <li>contact@signature-immobilier.fr</li>
              <li>05 62 00 00 00</li>
              <li>Hautes-Pyrénées</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border py-5 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Signature Immobilier — Démo commerciale
        </div>
      </footer>

      <AssistantWidget />
    </div>
  );
}
