import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { useState } from "react";
import { ArrowLeft, Copy, FileCheck } from "lucide-react";

export const Route = createFileRoute("/agence/compte-rendu")({
  head: () => ({
    meta: [{ title: "Compte-rendu de visite — Signature Immobilier" }],
  }),
  component: Page,
});

function Page() {
  const [form, setForm] = useState({
    acheteur: "",
    date: "",
    interet: "moyen",
    apprecies: "",
    blocages: "",
    financement: "en cours",
    prochaine: "Relance",
  });
  const [resume, setResume] = useState<string | null>(null);

  function generate() {
    const r = `Les visiteurs ${
      form.acheteur ? `(${form.acheteur}) ` : ""
    }ont apprécié ${form.apprecies || "plusieurs aspects du bien"}. Leur principale hésitation concerne ${
      form.blocages || "quelques points à clarifier"
    }. Leur financement est ${
      form.financement === "oui"
        ? "validé"
        : form.financement === "non"
        ? "non confirmé"
        : "en cours de validation"
    }. Prochaine action : ${form.prochaine.toLowerCase()}.`;
    setResume(r);
  }

  return (
    <SiteLayout>
      <section className="border-b border-border bg-primary text-primary-foreground">
        <div className="mx-auto max-w-4xl px-5 md:px-8 py-10">
          <Link to="/agence" className="inline-flex items-center gap-2 text-sm opacity-70 hover:opacity-100">
            <ArrowLeft className="h-4 w-4" /> Tableau de bord
          </Link>
          <h1 className="mt-3 font-display text-3xl md:text-4xl">
            Compte-rendu de visite
          </h1>
          <p className="mt-2 text-sm opacity-80">
            Quelques minutes pour générer un compte-rendu professionnel à envoyer au vendeur.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 md:px-8 py-10 grid md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <F label="Nom de l'acheteur">
            <input
              value={form.acheteur}
              onChange={(e) => setForm({ ...form, acheteur: e.target.value })}
              className="i"
              placeholder="Famille Dubois"
            />
          </F>
          <F label="Date de visite">
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="i"
            />
          </F>
          <F label="Niveau d'intérêt">
            <div className="flex gap-2">
              {["faible", "moyen", "fort"].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setForm({ ...form, interet: v })}
                  className={`px-4 py-2 rounded-full text-sm border ${
                    form.interet === v
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border hover:bg-secondary"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </F>
          <F label="Points appréciés">
            <textarea
              rows={2}
              value={form.apprecies}
              onChange={(e) => setForm({ ...form, apprecies: e.target.value })}
              className="i"
              placeholder="Emplacement, luminosité, jardin…"
            />
          </F>
          <F label="Points de blocage">
            <textarea
              rows={2}
              value={form.blocages}
              onChange={(e) => setForm({ ...form, blocages: e.target.value })}
              className="i"
              placeholder="Travaux cuisine à prévoir"
            />
          </F>
          <F label="Financement validé">
            <select
              value={form.financement}
              onChange={(e) => setForm({ ...form, financement: e.target.value })}
              className="i"
            >
              <option value="oui">Oui</option>
              <option value="non">Non</option>
              <option value="en cours">En cours</option>
            </select>
          </F>
          <F label="Prochaine action">
            <select
              value={form.prochaine}
              onChange={(e) => setForm({ ...form, prochaine: e.target.value })}
              className="i"
            >
              <option>Relance sous 48h</option>
              <option>Deuxième visite</option>
              <option>Offre attendue</option>
              <option>Abandon</option>
            </select>
          </F>
          <button
            onClick={generate}
            className="w-full rounded-full bg-primary text-primary-foreground py-3 text-sm font-medium hover:bg-primary/90"
          >
            Générer le compte-rendu
          </button>
        </div>

        <div className="rounded-2xl border border-border bg-secondary/40 p-6">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-gold">
            <FileCheck className="h-4 w-4" />
            Compte-rendu pour le vendeur
          </div>
          {resume ? (
            <div className="mt-4">
              <p className="text-sm leading-relaxed bg-card border border-border rounded-xl p-5">
                {resume}
              </p>
              <button
                onClick={() => navigator.clipboard?.writeText(resume)}
                className="mt-4 inline-flex items-center gap-2 text-xs rounded-md border border-border bg-background px-3 py-2 hover:bg-secondary"
              >
                <Copy className="h-3.5 w-3.5" /> Copier
              </button>
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">
              Remplissez le formulaire puis cliquez sur « Générer ». Vous obtiendrez un texte
              propre, prêt à être envoyé au vendeur.
            </p>
          )}
        </div>
      </section>

      <style>{`.i{width:100%;border:1px solid var(--color-input);background:var(--color-background);padding:0.55rem 0.75rem;border-radius:0.375rem;font-size:0.875rem;outline:none}.i:focus{box-shadow:0 0 0 2px var(--color-ring)}`}</style>
    </SiteLayout>
  );
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs font-medium mb-1.5">{label}</div>
      {children}
    </div>
  );
}
