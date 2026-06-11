type StatusBadgeProps = {
  status: string;
  className?: string;
};

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const tone =
    status === "Offre reçue"
      ? "border-gold bg-gold/20 text-foreground"
      : status === "Visites en cours"
        ? "border-primary/20 bg-primary/10 text-primary"
        : status === "Annonce publiée"
          ? "border-emerald-200 bg-emerald-50 text-emerald-900"
          : "border-border bg-secondary text-muted-foreground";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium ${tone} ${className}`}
    >
      {status}
    </span>
  );
}
