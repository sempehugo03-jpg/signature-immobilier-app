import { Copy, Mail, Send } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";

import {
  createOrRefreshSellerSpace,
  openSellerSpaceEmail,
  type SellerSpaceCreationResult,
} from "@/lib/seller-space";

type SellerSpaceCreatorProps = {
  propertyId: string;
  propertyTitle: string;
  initialSeller: {
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
  };
};

export function SellerSpaceCreator({
  propertyId,
  propertyTitle,
  initialSeller,
}: SellerSpaceCreatorProps) {
  const [seller, setSeller] = useState({
    firstName: initialSeller.firstName,
    lastName: initialSeller.lastName,
    email: initialSeller.email ?? "",
    phone: initialSeller.phone ?? "",
  });
  const [result, setResult] = useState<SellerSpaceCreationResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const fullName = useMemo(
    () => `${seller.firstName} ${seller.lastName}`.trim(),
    [seller.firstName, seller.lastName],
  );

  async function createSellerSpace(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setCopied(null);

    const nextResult = await createOrRefreshSellerSpace({
      propertyId,
      propertyTitle,
      firstName: seller.firstName.trim(),
      lastName: seller.lastName.trim(),
      email: seller.email.trim(),
      phone: seller.phone.trim(),
    });

    setResult(nextResult);
    setSubmitting(false);
    openSellerSpaceEmail(nextResult.mailtoHref);
  }

  async function copy(value: string, label: string) {
    await navigator.clipboard?.writeText(value);
    setCopied(label);
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Espace vendeur
          </div>
          <h2 className="mt-2 font-display text-2xl">Créer l’espace vendeur</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Renseignez les informations vendeur. Le compte sera préparé, puis
            l’application mail s’ouvrira avec l’email d’activation déjà rempli.
          </p>
        </div>
      </div>

      <form
        className="mt-6 grid gap-4 md:grid-cols-2"
        onSubmit={createSellerSpace}
      >
        <Field label="Prénom">
          <input
            value={seller.firstName}
            onChange={(event) =>
              setSeller({ ...seller, firstName: event.target.value })
            }
            className="seller-input"
            required
          />
        </Field>
        <Field label="Nom">
          <input
            value={seller.lastName}
            onChange={(event) =>
              setSeller({ ...seller, lastName: event.target.value })
            }
            className="seller-input"
            required
          />
        </Field>
        <Field label="Email">
          <input
            type="email"
            value={seller.email}
            onChange={(event) =>
              setSeller({ ...seller, email: event.target.value })
            }
            className="seller-input"
            placeholder="vendeur@email.fr"
            required
          />
        </Field>
        <Field label="Téléphone">
          <input
            type="tel"
            value={seller.phone}
            onChange={(event) =>
              setSeller({ ...seller, phone: event.target.value })
            }
            className="seller-input"
            placeholder="06 00 00 00 00"
          />
        </Field>

        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60 md:w-auto"
          >
            <Send className="h-4 w-4" />
            {submitting ? "Création..." : "Créer l’espace vendeur"}
          </button>
        </div>
      </form>

      {result && (
        <div className="mt-6 rounded-2xl border border-gold bg-gold/10 p-5">
          <div className="font-medium">
            {result.alreadyExists
              ? "L’espace vendeur existe déjà."
              : "L’espace vendeur a été créé. L’email d’activation est prêt à être envoyé."}
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Vendeur : {fullName || result.space.seller_email} ·{" "}
            {result.persistedIn === "supabase"
              ? "enregistré dans Supabase"
              : "enregistré localement pour la démo"}
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => openSellerSpaceEmail(result.mailtoHref)}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
            >
              <Mail className="h-4 w-4" />
              Ouvrir l’email
            </button>
            <button
              type="button"
              onClick={() => copy(result.body, "message")}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2.5 text-sm font-medium transition hover:bg-secondary"
            >
              <Copy className="h-4 w-4" />
              Copier le message
            </button>
            <button
              type="button"
              onClick={() => copy(result.activationUrl, "lien")}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2.5 text-sm font-medium transition hover:bg-secondary"
            >
              <Copy className="h-4 w-4" />
              Copier le lien
            </button>
          </div>

          {copied && (
            <div className="mt-3 text-xs text-muted-foreground">
              {copied === "message" ? "Message copié." : "Lien copié."}
            </div>
          )}
        </div>
      )}

      <style>{`.seller-input{width:100%;border:1px solid var(--color-input);background:var(--color-background);padding:0.75rem 0.9rem;border-radius:0.75rem;font-size:0.875rem;outline:none}.seller-input:focus{box-shadow:0 0 0 2px var(--color-ring)}`}</style>
    </section>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label>
      <div className="mb-1.5 text-xs font-medium text-foreground">{label}</div>
      {children}
    </label>
  );
}
