import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { useState } from "react";
import { computeScore, saveDiagnostic, type Diagnostic } from "@/lib/demo-store";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

export const Route = createFileRoute("/diagnostic")({
  head: () => ({
    meta: [
      { title: "Diagnostic vendeur — Signature Immobilier" },
      {
        name: "description",
        content:
          "Obtenez une première analyse claire de votre projet de vente en quelques minutes.",
      },
    ],
  }),
  component: Page,
});

const STEPS = ["Le bien", "L'état", "Le projet", "Coordonnées"];

const empty = {
  bien: {
    type: "",
    ville: "",
    adresse: "",
    surface: "",
    pieces: "",
    chambres: "",
    exterieur: "",
    stationnement: "",
  },
  etat: { general: "", travaux: "", diagnostics: "", dpe: "", forts: "", faibles: "" },
  projet: { delai: "", raison: "", estimation: "", dejaEnVente: "", priorite: "" },
  contact: { prenom: "", nom: "", telephone: "", email: "", moment: "", consent: false },
};

function Page() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [data, setData] = useState(empty);

  function update<K extends keyof typeof empty>(section: K, patch: Partial<(typeof empty)[K]>) {
    setData((d) => ({ ...d, [section]: { ...d[section], ...patch } }));
  }

  function submit() {
    const { score, temperature } = computeScore(data);
    const diag: Diagnostic = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      ...data,
      score,
      temperature,
    };
    saveDiagnostic(diag);
    navigate({ to: "/resultat" });
  }

  return (
    <SiteLayout>
      <section className="mx-auto max-w-3xl px-5 md:px-8 py-12 md:py-16">
        <div className="text-center">
          <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
            Diagnostic vendeur
          </div>
          <h1 className="mt-3 font-display text-3xl md:text-5xl">
            Diagnostic vendeur personnalisé
          </h1>
          <p className="mt-4 text-muted-foreground">
            Répondez à quelques questions pour obtenir une première analyse de votre projet de
            vente.
          </p>
        </div>

        {/* Stepper */}
        <div className="mt-10 flex items-center justify-between gap-2">
          {STEPS.map((s, i) => (
            <div key={s} className="flex-1 flex items-center gap-2">
              <div
                className={`h-7 w-7 grid place-items-center rounded-full text-[11px] font-medium border ${
                  i < step
                    ? "bg-primary text-primary-foreground border-primary"
                    : i === step
                    ? "bg-gold text-gold-foreground border-gold"
                    : "bg-background text-muted-foreground border-border"
                }`}
              >
                {i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </div>
              <div
                className={`text-xs hidden sm:block ${
                  i === step ? "text-foreground font-medium" : "text-muted-foreground"
                }`}
              >
                {s}
              </div>
              {i < STEPS.length - 1 && (
                <div className="flex-1 h-px bg-border" />
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-border bg-card p-6 md:p-8 shadow-sm">
          {step === 0 && (
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Type de bien">
                <Select
                  value={data.bien.type}
                  onChange={(v) => update("bien", { type: v })}
                  options={["Maison", "Appartement", "Immeuble", "Terrain"]}
                />
              </Field>
              <Field label="Ville">
                <Input
                  value={data.bien.ville}
                  onChange={(v) => update("bien", { ville: v })}
                  placeholder="Tarbes"
                />
              </Field>
              <Field label="Adresse approximative" full>
                <Input
                  value={data.bien.adresse}
                  onChange={(v) => update("bien", { adresse: v })}
                  placeholder="Quartier ou rue"
                />
              </Field>
              <Field label="Surface (m²)">
                <Input
                  value={data.bien.surface}
                  onChange={(v) => update("bien", { surface: v })}
                  placeholder="115"
                  type="number"
                />
              </Field>
              <Field label="Nombre de pièces">
                <Input
                  value={data.bien.pieces}
                  onChange={(v) => update("bien", { pieces: v })}
                  type="number"
                  placeholder="5"
                />
              </Field>
              <Field label="Nombre de chambres">
                <Input
                  value={data.bien.chambres}
                  onChange={(v) => update("bien", { chambres: v })}
                  type="number"
                  placeholder="3"
                />
              </Field>
              <Field label="Extérieur">
                <Select
                  value={data.bien.exterieur}
                  onChange={(v) => update("bien", { exterieur: v })}
                  options={["Jardin", "Balcon", "Terrasse", "Aucun"]}
                />
              </Field>
              <Field label="Stationnement" full>
                <Select
                  value={data.bien.stationnement}
                  onChange={(v) => update("bien", { stationnement: v })}
                  options={["Garage", "Parking", "Aucun"]}
                />
              </Field>
            </div>
          )}

          {step === 1 && (
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="État général" full>
                <Pills
                  value={data.etat.general}
                  onChange={(v) => update("etat", { general: v })}
                  options={[
                    { v: "excellent", l: "Excellent" },
                    { v: "bon", l: "Bon" },
                    { v: "rafraichir", l: "À rafraîchir" },
                    { v: "travaux", l: "Travaux importants" },
                  ]}
                />
              </Field>
              <Field label="Travaux récents réalisés" full>
                <Textarea
                  value={data.etat.travaux}
                  onChange={(v) => update("etat", { travaux: v })}
                  placeholder="Toiture refaite en 2022, cuisine équipée…"
                />
              </Field>
              <Field label="Diagnostics disponibles">
                <Select
                  value={data.etat.diagnostics}
                  onChange={(v) => update("etat", { diagnostics: v })}
                  options={["oui", "non", "en cours"]}
                />
              </Field>
              <Field label="DPE connu">
                <Select
                  value={data.etat.dpe}
                  onChange={(v) => update("etat", { dpe: v })}
                  options={["A", "B", "C", "D", "E", "F", "G", "Je ne sais pas"]}
                />
              </Field>
              <Field label="Points forts du bien" full>
                <Textarea
                  value={data.etat.forts}
                  onChange={(v) => update("etat", { forts: v })}
                  placeholder="Lumière, jardin, calme…"
                />
              </Field>
              <Field label="Points faibles ou inquiétudes" full>
                <Textarea
                  value={data.etat.faibles}
                  onChange={(v) => update("etat", { faibles: v })}
                  placeholder="Cuisine ancienne, voisinage…"
                />
              </Field>
            </div>
          )}

          {step === 2 && (
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Délai souhaité" full>
                <Pills
                  value={data.projet.delai}
                  onChange={(v) => update("projet", { delai: v })}
                  options={[
                    { v: "urgent", l: "Urgent" },
                    { v: "1-3", l: "1 à 3 mois" },
                    { v: "3-6", l: "3 à 6 mois" },
                    { v: "non-presse", l: "Pas pressé" },
                  ]}
                />
              </Field>
              <Field label="Raison de la vente">
                <Select
                  value={data.projet.raison}
                  onChange={(v) => update("projet", { raison: v })}
                  options={[
                    "Achat d'un autre bien",
                    "Séparation",
                    "Succession",
                    "Mutation",
                    "Investissement",
                    "Autre",
                  ]}
                />
              </Field>
              <Field label="Avez-vous déjà une estimation ?">
                <Select
                  value={data.projet.estimation}
                  onChange={(v) => update("projet", { estimation: v })}
                  options={["oui", "non"]}
                />
              </Field>
              <Field label="Le bien est-il déjà en vente ?">
                <Select
                  value={data.projet.dejaEnVente}
                  onChange={(v) => update("projet", { dejaEnVente: v })}
                  options={["oui", "non"]}
                />
              </Field>
              <Field label="Votre priorité">
                <Select
                  value={data.projet.priorite}
                  onChange={(v) => update("projet", { priorite: v })}
                  options={[
                    "Vendre vite",
                    "Vendre au meilleur prix",
                    "Vendre sereinement",
                    "Être accompagné",
                  ]}
                />
              </Field>
            </div>
          )}

          {step === 3 && (
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Prénom">
                <Input
                  value={data.contact.prenom}
                  onChange={(v) => update("contact", { prenom: v })}
                />
              </Field>
              <Field label="Nom">
                <Input
                  value={data.contact.nom}
                  onChange={(v) => update("contact", { nom: v })}
                />
              </Field>
              <Field label="Téléphone">
                <Input
                  value={data.contact.telephone}
                  onChange={(v) => update("contact", { telephone: v })}
                  type="tel"
                />
              </Field>
              <Field label="Email">
                <Input
                  value={data.contact.email}
                  onChange={(v) => update("contact", { email: v })}
                  type="email"
                />
              </Field>
              <Field label="Meilleur moment pour être rappelé" full>
                <Select
                  value={data.contact.moment}
                  onChange={(v) => update("contact", { moment: v })}
                  options={["Matin (9h-12h)", "Après-midi (14h-17h)", "Soir (17h-19h)"]}
                />
              </Field>
              <label className="sm:col-span-2 flex items-start gap-3 text-sm text-muted-foreground rounded-lg bg-secondary/60 p-4">
                <input
                  type="checkbox"
                  checked={data.contact.consent}
                  onChange={(e) => update("contact", { consent: e.target.checked })}
                  className="mt-1"
                />
                <span>
                  J'accepte d'être contacté par un conseiller Signature Immobilier au sujet
                  de mon projet de vente.
                </span>
              </label>
            </div>
          )}

          <div className="mt-8 flex items-center justify-between">
            <button
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground disabled:opacity-40"
            >
              <ArrowLeft className="h-4 w-4" /> Retour
            </button>
            {step < STEPS.length - 1 ? (
              <button
                onClick={() => setStep((s) => s + 1)}
                className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-5 py-2.5 text-sm font-medium hover:bg-primary/90"
              >
                Continuer <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={submit}
                disabled={!data.contact.consent}
                className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-5 py-2.5 text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
              >
                Obtenir mon diagnostic <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

function Field({ label, full, children }: { label: string; full?: boolean; children: React.ReactNode }) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <div className="text-xs font-medium text-foreground mb-1.5">{label}</div>
      {children}
    </div>
  );
}
function Input({
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
    />
  );
}
function Textarea({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <textarea
      value={value}
      placeholder={placeholder}
      rows={3}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring resize-none"
    />
  );
}
function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
    >
      <option value="">— Sélectionner —</option>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}
function Pills({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { v: string; l: string }[];
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o.v}
          type="button"
          onClick={() => onChange(o.v)}
          className={`rounded-full border px-4 py-2 text-sm transition ${
            value === o.v
              ? "bg-primary text-primary-foreground border-primary"
              : "border-border hover:bg-secondary"
          }`}
        >
          {o.l}
        </button>
      ))}
    </div>
  );
}
