import { Check } from "lucide-react";

type ProgressTimelineProps = {
  steps: readonly string[];
  currentStep: string;
};

export function ProgressTimeline({
  steps,
  currentStep,
}: ProgressTimelineProps) {
  const currentIndex = Math.max(
    0,
    steps.findIndex((step) => step === currentStep),
  );

  return (
    <ol className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {steps.map((step, index) => {
        const isDone = index < currentIndex;
        const isCurrent = index === currentIndex;

        return (
          <li key={step} className="relative">
            <div
              className={`flex h-full min-h-24 flex-col justify-between rounded-xl border p-4 ${
                isCurrent
                  ? "border-gold bg-gold/15"
                  : isDone
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground"
              }`}
            >
              <div
                className={`grid h-7 w-7 place-items-center rounded-full border text-xs ${
                  isCurrent
                    ? "border-gold bg-gold text-gold-foreground"
                    : isDone
                      ? "border-primary-foreground/30 bg-primary-foreground/10"
                      : "border-border bg-background"
                }`}
              >
                {isDone ? <Check className="h-3.5 w-3.5" /> : index + 1}
              </div>
              <div className="mt-4 text-sm font-medium leading-snug">
                {step}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
