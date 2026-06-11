import { Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { Menu, X } from "lucide-react";

import { AssistantWidget } from "@/components/assistant-widget";
import { agencyConfig } from "@/lib/agency-config";

type SiteLayoutProps = {
  children: ReactNode;
  variant?: "default" | "public";
};

export function SiteLayout({ children, variant = "default" }: SiteLayoutProps) {
  const [open, setOpen] = useState(false);
  const [brandFirst, ...brandRest] = agencyConfig.brand.name.split(" ");
  const brandSecond = brandRest.join(" ");
  const primaryCta = agencyConfig.navigation.primaryCta;

  if (variant === "public") {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur-xl">
          <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 md:px-8">
            <Link to="/" className="flex items-center gap-3 group">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground font-display text-xl leading-none shadow-sm">
                {agencyConfig.brand.logoInitial}
              </span>
              <span className="font-display text-xl tracking-tight">
                {brandFirst}{" "}
                <span className="text-muted-foreground">{brandSecond}</span>
              </span>
            </Link>

            <nav className="hidden items-center gap-10 text-sm md:flex">
              <a
                href="/#biens-a-vendre"
                className="text-foreground/70 transition-colors hover:text-foreground"
              >
                Biens à vendre
              </a>
              <Link
                to="/diagnostic"
                className="text-foreground/70 transition-colors hover:text-foreground"
              >
                Estimer mon bien
              </Link>
            </nav>

            <div className="hidden items-center gap-3 md:flex">
              <Link
                to="/mon-suivi"
                className="inline-flex items-center rounded-full border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground/75 transition hover:bg-secondary hover:text-foreground"
              >
                Mon suivi
              </Link>
            </div>

            <button
              className="grid h-10 w-10 place-items-center rounded-full border border-border bg-card md:hidden"
              onClick={() => setOpen(!open)}
              aria-label="Menu"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          {open && (
            <div className="border-t border-border bg-background md:hidden">
              <div className="flex flex-col gap-1 px-5 py-4">
                <a
                  href="/#biens-a-vendre"
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-3 py-2 text-sm text-foreground/80"
                >
                  Biens à vendre
                </a>
                <Link
                  to="/diagnostic"
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-3 py-2 text-sm text-foreground/80"
                >
                  Estimer mon bien
                </Link>
                <Link
                  to="/mon-suivi"
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-3 py-2 text-sm text-foreground/80"
                >
                  Mon suivi
                </Link>
              </div>
            </div>
          )}
        </header>

        <main className="flex-1">{children}</main>

        <footer className="bg-primary text-primary-foreground">
          <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 text-sm md:grid-cols-[1.3fr_0.8fr_0.8fr] md:px-8 md:py-16">
            <div>
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-primary-foreground text-primary font-display text-xl">
                  {agencyConfig.brand.logoInitial}
                </span>
                <div className="font-display text-2xl">
                  {agencyConfig.brand.name}
                </div>
              </div>
              <p className="mt-5 max-w-md leading-relaxed text-primary-foreground/70">
                {agencyConfig.brand.tagline}
              </p>
            </div>

            <div>
              <div className="mb-4 text-xs uppercase tracking-[0.25em] text-primary-foreground/50">
                Navigation
              </div>
              <ul className="space-y-3 text-primary-foreground/75">
                <li>
                  <a href="/#biens-a-vendre">Biens à vendre</a>
                </li>
                <li>
                  <Link to="/diagnostic">Estimer mon bien</Link>
                </li>
                <li>
                  <Link to="/mon-suivi">Mon suivi</Link>
                </li>
              </ul>
            </div>

            <div>
              <div className="mb-4 text-xs uppercase tracking-[0.25em] text-primary-foreground/50">
                Contact
              </div>
              <ul className="space-y-3 text-primary-foreground/75">
                <li>{agencyConfig.contact.email}</li>
                <li>{agencyConfig.contact.phone}</li>
                <li>
                  {agencyConfig.contact.address}, {agencyConfig.contact.city}
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-primary-foreground/10 py-5 text-center text-xs text-primary-foreground/50">
            Copyright {new Date().getFullYear()} {agencyConfig.brand.name}
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto max-w-7xl px-5 md:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <span className="inline-block h-7 w-7 rounded-sm bg-primary text-primary-foreground grid place-items-center font-display text-lg leading-none">
              {agencyConfig.brand.logoInitial}
            </span>
            <span className="font-display text-lg tracking-tight">
              {brandFirst}{" "}
              <span className="text-muted-foreground">{brandSecond}</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-7 text-sm">
            <a
              href="/#biens-a-vendre"
              className="text-foreground/70 hover:text-foreground transition-colors"
            >
              Biens à vendre
            </a>
            <Link
              to="/diagnostic"
              className="text-foreground/70 hover:text-foreground transition-colors"
            >
              Estimer mon bien
            </Link>
            <Link
              to="/mon-suivi"
              className="text-foreground/70 hover:text-foreground transition-colors"
            >
              Mon suivi
            </Link>
          </nav>

          <Link
            to={primaryCta.to}
            className="hidden md:inline-flex items-center rounded-full bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 transition"
          >
            {primaryCta.label}
          </Link>

          <button
            className="md:hidden"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {open && (
          <div className="md:hidden border-t border-border bg-background">
            <div className="px-5 py-3 flex flex-col gap-1">
              <a
                href="/#biens-a-vendre"
                onClick={() => setOpen(false)}
                className="py-2 text-sm text-foreground/80"
              >
                Biens à vendre
              </a>
              <Link
                to="/diagnostic"
                onClick={() => setOpen(false)}
                className="py-2 text-sm text-foreground/80"
              >
                Estimer mon bien
              </Link>
              <Link
                to="/mon-suivi"
                onClick={() => setOpen(false)}
                className="py-2 text-sm text-foreground/80"
              >
                Mon suivi
              </Link>
              <Link
                to={primaryCta.to}
                onClick={() => setOpen(false)}
                className="mt-2 inline-flex justify-center rounded-full bg-primary text-primary-foreground px-4 py-2 text-sm font-medium"
              >
                {primaryCta.label}
              </Link>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border bg-secondary/40 mt-20">
        <div className="mx-auto max-w-7xl px-5 md:px-8 py-12 grid gap-10 md:grid-cols-4 text-sm">
          <div>
            <div className="font-display text-xl">
              {agencyConfig.brand.name}
            </div>
            <p className="mt-3 text-muted-foreground">
              {agencyConfig.brand.tagline}
            </p>
          </div>

          <div>
            <div className="font-medium mb-3">Accompagnement vendeur</div>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <Link to="/diagnostic">Estimer mon bien</Link>
              </li>
              <li>
                <Link to="/mon-suivi">Mon suivi</Link>
              </li>
            </ul>
          </div>

          <div>
            <div className="font-medium mb-3">L'agence</div>
            <ul className="space-y-2 text-muted-foreground">
              <li>Estimation</li>
              <li>Suivi de vente</li>
              <li>Strategie de diffusion</li>
            </ul>
          </div>

          <div>
            <div className="font-medium mb-3">Contact</div>
            <ul className="space-y-2 text-muted-foreground">
              <li>{agencyConfig.contact.email}</li>
              <li>{agencyConfig.contact.phone}</li>
              <li>{agencyConfig.contact.area}</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border py-5 text-center text-xs text-muted-foreground">
          Copyright {new Date().getFullYear()} {agencyConfig.brand.name}
        </div>
      </footer>

      <AssistantWidget />
    </div>
  );
}
