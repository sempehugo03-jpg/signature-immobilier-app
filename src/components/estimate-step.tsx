import type { ReactNode } from "react";

type EstimateStepProps = {
  current: number;
  total: number;
  title: string;
  description: string;
  children: ReactNode;
};

export function EstimateStep({
  current,
  total,
  title,
  description,
  children,
}: EstimateStepProps) {
  const progress = Math.round(((current + 1) / total) * 100);

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm md:p-8">
      <div className="flex items-center justify-between gap-4 text-xs text-muted-foreground">
        <span>
          Étape {current + 1} sur {total}
        </span>
        <span>{progress}%</span>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full bg-gold"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mt-8">
        <h1 className="font-display text-3xl leading-tight md:text-5xl">
          {title}
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">{description}</p>
      </div>

      <div className="mt-8">{children}</div>
    </div>
  );
}
