import { Link, useNavigate } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import type { HTMLAttributes, ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { agencyConfig } from "@/lib/agency-config";

type PrivateShellProps = {
  children: ReactNode;
};

type PrivateHeroProps = {
  title: string;
  subtitle?: string;
  description: string;
  action?: ReactNode;
};

export function PrivateShell({ children }: PrivateShellProps) {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [brandFirst, ...brandRest] = agencyConfig.brand.name.split(" ");
  const brandSecond = brandRest.join(" ");

  async function onSignOut() {
    await signOut();
    navigate({ to: "/mon-suivi", replace: true });
  }

  return (
    <div className="min-h-screen bg-[#faf7f0] text-primary">
      <header className="sticky top-0 z-40 border-b border-[#e8e0d5] bg-[#faf7f0]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 md:px-8">
          <Link to="/" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground font-display text-xl leading-none shadow-sm">
              {agencyConfig.brand.logoInitial}
            </span>
            <span className="font-display text-xl tracking-tight">
              {brandFirst}{" "}
              <span className="text-primary/55">{brandSecond}</span>
            </span>
          </Link>

          <Button
            type="button"
            variant="outline"
            className="rounded-full border-[#d8cfc2] bg-white px-4 text-primary hover:bg-white/80"
            onClick={onSignOut}
          >
            <LogOut className="h-4 w-4" />
            Déconnexion
          </Button>
        </div>
      </header>

      <main>{children}</main>
    </div>
  );
}

export function PrivateHero({
  title,
  subtitle,
  description,
  action,
}: PrivateHeroProps) {
  return (
    <section className="mx-auto max-w-7xl px-5 pb-8 pt-10 md:px-8 md:pb-10 md:pt-14">
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          {subtitle && (
            <div className="text-sm font-medium text-primary/55">
              {subtitle}
            </div>
          )}
          <h1 className="mt-2 font-display text-5xl leading-none tracking-tight text-primary md:text-6xl">
            {title}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-primary/60">
            {description}
          </p>
        </div>
        {action}
      </div>
    </section>
  );
}

export function PrivateCard({
  children,
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={`rounded-[24px] border border-[#e8e0d5] bg-white shadow-[0_18px_45px_rgba(17,24,39,0.04)] ${className}`}
    >
      {children}
    </div>
  );
}

export function PrivateStatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  const isNegative =
    normalized.includes("non créé") ||
    normalized.includes("non cree") ||
    normalized.includes("not_created");
  const isPending =
    isNegative ||
    normalized.includes("pending") ||
    normalized.includes("attente") ||
    normalized.includes("créer");
  const isActive =
    !isPending &&
    (normalized.includes("active") ||
      normalized.includes("activé") ||
      normalized.includes("créé") ||
      normalized.includes("created"));

  const label =
    status === "active"
      ? "Activé"
      : status === "pending"
        ? "En attente"
        : status === "activated"
          ? "Activé"
          : status;

  const classes = isActive
    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
    : isPending
      ? "border-amber-200 bg-amber-50 text-amber-700"
      : "border-slate-200 bg-slate-50 text-slate-600";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${classes}`}
    >
      {label}
    </span>
  );
}

export function PrivateSectionTitle({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h2 className="font-display text-3xl leading-tight text-primary">
          {title}
        </h2>
        {description && (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-primary/55">
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}
