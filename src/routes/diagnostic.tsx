import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  CheckCircle2,
  Home,
  MapPin,
  Ruler,
  UserRound,
} from "lucide-react";
import { useState } from "react";

import { EstimateStep } from "@/components/estimate-step";
import { SiteLayout } from "@/components/site-layout";
import { agencyConfig } from "@/lib/agency-config";
import {
  computeScore,
  saveDiagnostic,
  type Diagnostic,
} from "@/lib/demo-store";
import { getIndicativeEstimate } from "@/lib/indicative-estimate";

export const Route = createFileRoute("/diagnostic")({
  head: () => ({
    meta: [
      { title: "Estimation immobilière — Signature Immobilier" },
      {
        name: "description",
        content:
          "Demandez une estimation simple et rapide. Un conseiller vous rappelle rapidement.",
      },
    ],
  }),
  component: Page,
});

type DiagnosticDraft = Omit<
  Diagnostic,
  "id" | "createdAt" | "score" | "temperature"
>;

const empty: DiagnosticDraft = {
  bien: {
    type: "",
    ville: "",
    codePostal: "",
    adresse: "",
    surface: "",
    terrain: "",
    pieces: "",
    chambres: "",
    exterieur: "",
    stationnement: "",
  },
  etat: {
    general: "",
    travaux: "",
    diagnostics: "",
    dpe: "",
    forts: "",
    faibles: "",
  },
  projet: {
    delai: "",
    raison: "",
    estimation: "",
    dejaEnVente: "",
    priorite: "",
  },
  contact: {
    prenom: "",
    nom: "",
    telephone: "",
    email: "",
    moment: "",
    consent: false,
  },
  photos: {
    count: "",
    notes: "",
  },
};

function Page() {
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [data, setData] = useState<DiagnosticDraft>(empty);
  const steps = agencyConfig.estimation.steps;

  function update<K extends keyof DiagnosticDraft>(
    section: K,
    patch: Partial<DiagnosticDraft[K]>,
  ) {
    setData((current) => ({
      ...current,
      [section]: { ...current[section], ...patch },
    }));
  }

  function submit() {
    const { score, temperature } = computeScore(data);
    saveDiagnostic({
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      ...data,
      score,
      temperature,
    });
    setSubmitted(true);
  }

  if (submitted) {
    const indicativeEstimate = getIndicativeEstimate(data);

    return (
      <SiteLayout variant="public">
        <section className="mx-auto max-w-3xl px-5 py-16 md:px-8 md:py-24">
          <div className="rounded-3xl border border-border bg-card p-8 text-center shadow-sm md:p-12">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-gold text-gold-foreground">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <div className="mt-6 text-xs uppercase tracking-[0.25em] text-muted-foreground">
              {agencyConfig.estimation.finalTitle}
            </div>
            <h1 className="mt-6 font-display text-4xl leading-tight md:text-5xl">
              Votre estimation indicative
            </h1>
            <div className="mx-auto mt-6 max-w-xl rounded-2xl border border-border bg-secondary/50 p-5">
              <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Fourchette de prix indicative
              </div>
              <div className="mt-2 font-display text-3xl leading-tight text-foreground md:text-4xl">
                {indicativeEstimate.formattedRange}
              </div>
            </div>
            <p className="mx-auto mt-5 max-w-xl text-muted-foreground">
              Cette estimation doit être affinée avec un conseiller, après
              analyse du secteur, de l'état réel du bien, des photos et des
              références de vente comparables.
            </p>
            <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
              {agencyConfig.estimation.finalText}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <a
                href={agencyConfig.contact.phoneHref}
                className="inline-flex items-center rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
              >
                Être rappelé pour affiner l’estimation
              </a>
              <Link
                to="/"
                className="inline-flex items-center rounded-full border border-border bg-background px-5 py-3 text-sm font-medium transition hover:bg-secondary"
              >
                Retour aux biens
              </Link>
            </div>
          </div>
        </section>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout variant="public">
      <section className="mx-auto max-w-4xl px-5 py-10 md:px-8 md:py-16">
        <div className="mb-8 text-center">
          <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
            {agencyConfig.estimation.title}
          </div>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
            {agencyConfig.estimation.subtitle}
          </p>
        </div>

        <EstimateStep
          current={step}
          total={steps.length}
          title={steps[step].title}
          description={steps[step].description}
        >
          {step === 0 && (
            <div className="grid gap-3 sm:grid-cols-2">
              {agencyConfig.estimation.propertyTypes.map((type) => (
                <Choice
                  key={type}
                  icon={Home}
                  label={type}
                  selected={data.bien.type === type}
                  onClick={() => update("bien", { type })}
                />
              ))}
            </div>
          )}

          {step === 1 && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Adresse">
                <Input
                  value={data.bien.adresse}
                  onChange={(value) => update("bien", { adresse: value })}
                  placeholder="Rue ou quartier"
                />
              </Field>
              <Field label="Ville">
                <Input
                  value={data.bien.ville}
                  onChange={(value) => update("bien", { ville: value })}
                  placeholder="Tarbes"
                />
              </Field>
              <Field label="Code postal">
                <Input
                  value={data.bien.codePostal}
                  onChange={(value) => update("bien", { codePostal: value })}
                  placeholder="65000"
                  inputMode="numeric"
                />
              </Field>
            </div>
          )}

          {step === 2 && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Surface habitable">
                <Input
                  value={data.bien.surface}
                  onChange={(value) => update("bien", { surface: value })}
                  placeholder="115"
                  type="number"
                />
              </Field>
              <Field label="Surface terrain si concerné">
                <Input
                  value={data.bien.terrain}
                  onChange={(value) => update("bien", { terrain: value })}
                  placeholder="520"
                  type="number"
                />
              </Field>
            </div>
          )}

          {step === 3 && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nombre de pièces">
                <Input
                  value={data.bien.pieces}
                  onChange={(value) => update("bien", { pieces: value })}
                  placeholder="5"
                  type="number"
                />
              </Field>
              <Field label="Nombre de chambres">
                <Input
                  value={data.bien.chambres}
                  onChange={(value) => update("bien", { chambres: value })}
                  placeholder="3"
                  type="number"
                />
              </Field>
              <Field label="Extérieur">
                <Pills
                  value={data.bien.exterieur}
                  options={["Oui", "Non"]}
                  onChange={(value) => update("bien", { exterieur: value })}
                />
              </Field>
              <Field label="Garage">
                <Pills
                  value={data.bien.stationnement}
                  options={["Oui", "Non"]}
                  onChange={(value) => update("bien", { stationnement: value })}
                />
              </Field>
              <Field label="État général" full>
                <Pills
                  value={data.etat.general}
                  options={agencyConfig.estimation.generalStates}
                  onChange={(value) => update("etat", { general: value })}
                />
              </Field>
            </div>
          )}

          {step === 4 && (
            <div className="rounded-2xl border border-dashed border-border bg-secondary/40 p-6">
              <div className="flex items-start gap-4">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-card text-gold">
                  <Camera className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-medium">Ajouter quelques photos</div>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    Cette zone reste locale pour la démo. Les fichiers ne sont
                    pas envoyés à Supabase pour l’instant.
                  </p>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(event) =>
                      update("photos", {
                        count: `${event.target.files?.length ?? 0} photo(s) sélectionnée(s)`,
                      })
                    }
                    className="mt-5 w-full rounded-xl border border-border bg-background p-3 text-sm"
                  />
                  <Field label="Note optionnelle" className="mt-5">
                    <Textarea
                      value={data.photos.notes}
                      onChange={(value) => update("photos", { notes: value })}
                      placeholder="Exemple : photos récentes, cuisine à refaire, jardin exposé sud..."
                    />
                  </Field>
                  {data.photos.count && (
                    <div className="mt-3 text-sm text-muted-foreground">
                      {data.photos.count}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Prénom">
                <Input
                  value={data.contact.prenom}
                  onChange={(value) => update("contact", { prenom: value })}
                />
              </Field>
              <Field label="Nom">
                <Input
                  value={data.contact.nom}
                  onChange={(value) => update("contact", { nom: value })}
                />
              </Field>
              <Field label="Téléphone">
                <Input
                  value={data.contact.telephone}
                  onChange={(value) => update("contact", { telephone: value })}
                  type="tel"
                />
              </Field>
              <Field label="Email">
                <Input
                  value={data.contact.email}
                  onChange={(value) => update("contact", { email: value })}
                  type="email"
                />
              </Field>
              <label className="sm:col-span-2 flex items-start gap-3 rounded-xl bg-secondary/60 p-4 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  checked={data.contact.consent}
                  onChange={(event) =>
                    update("contact", { consent: event.target.checked })
                  }
                  className="mt-1"
                />
                <span>
                  J’accepte d’être recontacté par un conseiller{" "}
                  {agencyConfig.brand.name}
                  au sujet de mon projet de vente.
                </span>
              </label>
            </div>
          )}
        </EstimateStep>

        <div className="mt-6 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setStep((current) => Math.max(0, current - 1))}
            disabled={step === 0}
            className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm text-muted-foreground transition hover:text-foreground disabled:opacity-40"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </button>
          {step < steps.length - 1 ? (
            <button
              type="button"
              onClick={() => setStep((current) => current + 1)}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
            >
              Continuer
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={submit}
              disabled={!data.contact.consent}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
            >
              Transmettre ma demande
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="mt-8 grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
          <Reassurance icon={Ruler} text="Simple et rapide" />
          <Reassurance icon={MapPin} text="Lecture locale du secteur" />
          <Reassurance icon={UserRound} text="Rappel conseiller uniquement" />
        </div>
      </section>
    </SiteLayout>
  );
}

function Field({
  label,
  full,
  className = "",
  children,
}: {
  label: string;
  full?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`${full ? "sm:col-span-2" : ""} ${className}`}>
      <div className="mb-1.5 text-xs font-medium text-foreground">{label}</div>
      {children}
    </div>
  );
}

function Input({
  value,
  onChange,
  type = "text",
  placeholder,
  inputMode,
}: {
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
}) {
  return (
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      inputMode={inputMode}
      onChange={(event) => onChange(event.target.value)}
      className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-ring"
    />
  );
}

function Textarea({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <textarea
      value={value}
      placeholder={placeholder}
      rows={3}
      onChange={(event) => onChange(event.target.value)}
      className="w-full resize-none rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-ring"
    />
  );
}

function Choice({
  icon: Icon,
  label,
  selected,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-24 items-center gap-4 rounded-2xl border p-5 text-left transition ${
        selected
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-background hover:bg-secondary"
      }`}
    >
      <Icon className={`h-5 w-5 ${selected ? "" : "text-gold"}`} />
      <span className="font-medium">{label}</span>
    </button>
  );
}

function Pills({
  value,
  options,
  onChange,
}: {
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={`rounded-full border px-4 py-2 text-sm transition ${
            value === option
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-background hover:bg-secondary"
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

function Reassurance({
  icon: Icon,
  text,
}: {
  icon: React.ComponentType<{ className?: string }>;
  text: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-full bg-secondary px-4 py-2">
      <Icon className="h-4 w-4 text-gold" />
      <span>{text}</span>
    </div>
  );
}
