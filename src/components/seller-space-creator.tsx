import { Copy, ExternalLink, Mail, Send } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";

import { PrivateStatusBadge } from "@/components/private-shell";
import {
  createOrRefreshSellerSpace,
  openSellerSpaceEmail,
  openSellerSpaceGmail,
  type SellerSpaceCreationResult,
} from "@/lib/seller-space";
import { buildPublicAppUrl } from "@/lib/invitation-email";

type SellerSpaceCreatorProps = {
  propertyId: string;
  propertyTitle: string;
  sellerSpaceExists?: boolean;
  initialSeller: {
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
  };
  onSpaceReady?: (result: SellerSpaceCreationResult) => void;
};

export function SellerSpaceCreator({
  propertyId,
  propertyTitle,
  sellerSpaceExists = false,
  initialSeller,
  onSpaceReady,
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
  const [gmailBlocked, setGmailBlocked] = useState(false);
  const sellerAccessUrl =
    result?.activationUrl ??
    (sellerSpaceExists ? buildPublicAppUrl("/mon-suivi") : "");
  const fullName = useMemo(
    () =>
      `${result?.space.seller_first_name ?? seller.firstName} ${
        result?.space.seller_last_name ?? seller.lastName
      }`.trim(),
    [
      result?.space.seller_first_name,
      result?.space.seller_last_name,
      seller.firstName,
      seller.lastName,
    ],
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
    onSpaceReady?.(nextResult);
    setSubmitting(false);
    setGmailBlocked(!openSellerSpaceGmail(nextResult.gmailHref));
  }

  async function copy(value: string, label: string) {
    await navigator.clipboard?.writeText(value);
    setCopied(label);
  }

  return (
    <section className="rounded-[24px] border border-[#e8e0d5] bg-white p-6 shadow-[0_18px_45px_rgba(17,24,39,0.04)] md:p-8">
      <div>
        <h2 className="font-display text-3xl leading-tight text-primary">
          {sellerSpaceExists ? "Espace vendeur créé" : "Créer l’espace vendeur"}
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-primary/55">
          {sellerSpaceExists
            ? "L’espace vendeur est actif pour ce bien."
            : "L’espace vendeur n’a pas encore été créé pour ce bien."}
        </p>
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

        <div className="flex flex-col gap-3 sm:flex-row md:col-span-2">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60 md:w-auto"
          >
            <Send className="h-4 w-4" />
            {submitting
              ? "Préparation..."
              : sellerSpaceExists
                ? "Renvoyer l’accès vendeur"
                : "Créer l’espace vendeur"}
          </button>
          {sellerSpaceExists && (
            <button
              type="button"
              onClick={() => copy(sellerAccessUrl, "lien")}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#d8cfc2] bg-white px-5 py-3 text-sm font-medium text-primary transition hover:bg-[#faf7f0] md:w-auto"
            >
              <Copy className="h-4 w-4" />
              Copier le lien vendeur
            </button>
          )}
        </div>
      </form>

      {result && (
        <div className="mt-6 rounded-[22px] border border-emerald-100 bg-emerald-50/70 p-5">
          <div className="font-display text-2xl text-primary">
            Accès prêt à envoyer
          </div>
          <p className="mt-2 text-sm leading-relaxed text-primary/60">
            L’accès a été créé avec succès. Vous pouvez maintenant envoyer
            l’invitation.
          </p>
          {gmailBlocked && (
            <p className="mt-3 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              L’accès est prêt. Vous pouvez copier le lien ou préparer l’email
              manuel d’invitation.
            </p>
          )}

          <div className="mt-4 grid gap-3 rounded-2xl border border-emerald-100 bg-white/80 p-4 text-sm sm:grid-cols-2">
            <Summary label="Bien" value={result.space.property_title} />
            <Summary label="Vendeur" value={fullName} />
            <Summary
              label="Email destinataire"
              value={result.space.seller_email}
            />
            <div>
              <div className="text-xs text-primary/45">Statut</div>
              <div className="mt-1">
                <PrivateStatusBadge status={result.space.status} />
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => openSellerSpaceGmail(result.gmailHref)}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
            >
              <ExternalLink className="h-4 w-4" />
              Ouvrir dans Gmail
            </button>
            <button
              type="button"
              onClick={() => openSellerSpaceEmail(result.mailtoHref)}
              className="inline-flex items-center gap-2 rounded-full border border-[#d8cfc2] bg-white px-4 py-2.5 text-sm font-medium text-primary transition hover:bg-[#faf7f0]"
            >
              <Mail className="h-4 w-4" />
              Préparer un email manuel
            </button>
            <button
              type="button"
              onClick={() => copy(result.body, "message")}
              className="inline-flex items-center gap-2 rounded-full border border-[#d8cfc2] bg-white px-4 py-2.5 text-sm font-medium text-primary transition hover:bg-[#faf7f0]"
            >
              <Copy className="h-4 w-4" />
              Copier le message
            </button>
            <button
              type="button"
              onClick={() => copy(result.activationUrl, "lien")}
              className="inline-flex items-center gap-2 rounded-full border border-[#d8cfc2] bg-white px-4 py-2.5 text-sm font-medium text-primary transition hover:bg-[#faf7f0]"
            >
              <Copy className="h-4 w-4" />
              Copier le lien vendeur
            </button>
          </div>

          {copied && (
            <div className="mt-3 text-xs text-primary/55">
              {copied === "message" ? "Message copié." : "Lien copié."}
            </div>
          )}
        </div>
      )}

      <style>{`.seller-input{width:100%;border:1px solid #e8e0d5;background:#fffdf9;padding:0.75rem 0.9rem;border-radius:1rem;font-size:0.875rem;outline:none}.seller-input:focus{box-shadow:0 0 0 2px rgba(31,41,55,0.12)}`}</style>
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
      <div className="mb-1.5 text-xs font-medium text-primary">{label}</div>
      {children}
    </label>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-primary/45">{label}</div>
      <div className="mt-1 font-medium text-primary">{value || "—"}</div>
    </div>
  );
}
