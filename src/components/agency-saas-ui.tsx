import { Link } from "@tanstack/react-router";
import { CheckCircle2, LockKeyhole, LogOut, X } from "lucide-react";
import type { HTMLAttributes, ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { agencyConfig } from "@/lib/agency-config";
import type { AgencyStatus } from "@/lib/agency-saas";

export function SaasShell({
  children,
  action,
}: {
  children: ReactNode;
  action?: ReactNode;
}) {
  const [brandFirst, ...brandRest] = agencyConfig.brand.name.split(" ");
  return (
    <div className="min-h-screen bg-[#faf7f0] text-primary">
      <header className="sticky top-0 z-40 border-b border-[#e8e0d5] bg-[#faf7f0]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-5 md:px-8">
          <Link to="/" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-primary font-display text-xl leading-none text-primary-foreground shadow-sm">
              {agencyConfig.brand.logoInitial}
            </span>
            <span className="font-display text-xl tracking-tight">
              {brandFirst}{" "}
              <span className="text-primary/55">{brandRest.join(" ")}</span>
            </span>
          </Link>
          {action}
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}

export function AdminLogoutButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      type="button"
      variant="outline"
      className="rounded-full border-[#d8cfc2] bg-white px-4 text-primary hover:bg-white/80"
      onClick={onClick}
    >
      <LogOut className="h-4 w-4" />
      Déconnexion
    </Button>
  );
}

export function SaasHero({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <section className="mx-auto max-w-7xl px-5 pb-8 pt-10 md:px-8 md:pb-10 md:pt-14">
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          {eyebrow && (
            <div className="text-xs font-medium uppercase tracking-[0.22em] text-primary/45">
              {eyebrow}
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

export function SaasCard({
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

export function SectionTitle({
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

export function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      <Label>{label}</Label>
      {children}
    </div>
  );
}

export function StatusBadge({ status }: { status: AgencyStatus | string }) {
  const label =
    status === "active"
      ? "Activé"
      : status === "demo"
        ? "Démo"
        : status === "disabled"
          ? "Désactivé"
          : status;
  const classes =
    status === "active" || status === "Converti"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : status === "disabled" || status === "Perdu"
        ? "border-red-200 bg-red-50 text-red-700"
        : status === "Rappelé"
          ? "border-blue-200 bg-blue-50 text-blue-700"
          : "border-amber-200 bg-amber-50 text-amber-700";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${classes}`}
    >
      {label}
    </span>
  );
}

export function LockedActionModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-primary/35 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#faf7f0] text-primary">
            <LockKeyhole className="h-5 w-5" />
          </span>
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-full border border-[#e8e0d5] text-primary/60"
            aria-label="Fermer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <h2 className="mt-5 font-display text-3xl leading-tight text-primary">
          Disponible après activation
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-primary/60">
          Cette fonctionnalité sera débloquée lorsque votre portail agence sera
          activé. Vous pourrez alors ajouter vos vrais biens, gérer votre
          équipe, générer des accès vendeurs et recevoir vos demandes
          d’estimation.
        </p>
        <Button
          type="button"
          className="mt-6 w-full rounded-full"
          onClick={onClose}
        >
          Compris
        </Button>
      </div>
    </div>
  );
}

export function CheckRow({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-start gap-3 text-sm text-primary/65">
      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
      <span>{children}</span>
    </div>
  );
}
