import { ArrowUpRight, BedDouble, Home, MapPin } from "lucide-react";

import { publicStatusLabel, type AgencyProperty } from "@/lib/agency-saas";

type PropertyCardProps = {
  property: AgencyProperty;
  onOpen: (property: AgencyProperty) => void;
};

export function PropertyCard({ property, onOpen }: PropertyCardProps) {
  const badge = publicStatusLabel(property.publicStatus);

  return (
    <button
      type="button"
      onClick={() => onOpen(property)}
      className="group text-left"
      aria-label={`Voir le détail de ${property.title}`}
    >
      <article className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
        <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
          <img
            src={property.imageUrl || property.image}
            alt={property.title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
          {badge && (
            <div className="absolute left-3 top-3 rounded-full border border-white/40 bg-background/90 px-3 py-1 text-xs font-medium text-foreground shadow-sm backdrop-blur">
              {badge}
            </div>
          )}
          <span className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-background/90 text-foreground shadow-sm">
            <ArrowUpRight className="h-4 w-4" />
          </span>
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-display text-xl leading-tight">
                {property.title}
              </h3>
              <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                {property.city}
              </div>
            </div>
            <div className="shrink-0 text-right font-medium">
              {property.price}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2 text-xs text-muted-foreground">
            <Feature icon={Home} label={`${property.surface} m²`} />
            <Feature icon={BedDouble} label={`${property.rooms} pièces`} />
            <Feature icon={MapPin} label={property.type} />
          </div>
        </div>
      </article>
    </button>
  );
}

function Feature({
  icon: Icon,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <div className="flex min-h-10 items-center gap-1.5 rounded-lg bg-secondary/60 px-2">
      <Icon className="h-3.5 w-3.5 text-gold" />
      <span className="truncate">{label}</span>
    </div>
  );
}
