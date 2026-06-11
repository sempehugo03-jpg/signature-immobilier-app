import { Copy, ExternalLink, Mail } from "lucide-react";
import { useState } from "react";

import { PrivateStatusBadge } from "@/components/private-shell";
import {
  openAccessEmail,
  openAccessGmail,
  type AccessCreationResult,
} from "@/lib/access-invitations";

type AccessResultPanelProps = {
  result: AccessCreationResult;
  label: string;
  gmailBlocked?: boolean;
};

export function AccessResultPanel({
  result,
  label,
  gmailBlocked = false,
}: AccessResultPanelProps) {
  const [copied, setCopied] = useState<string | null>(null);

  async function copy(value: string, nextCopied: string) {
    await navigator.clipboard?.writeText(value);
    setCopied(nextCopied);
  }

  return (
    <div className="rounded-[22px] border border-emerald-100 bg-emerald-50/70 p-5">
      <div className="font-display text-2xl text-primary">
        Accès prêt à envoyer
      </div>
      <p className="mt-2 text-sm leading-relaxed text-primary/60">
        L’accès a été créé avec succès. Vous pouvez maintenant envoyer
        l’invitation.
      </p>
      {gmailBlocked && (
        <p className="mt-3 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          L’accès est prêt. Cliquez sur “Ouvrir dans Gmail” pour envoyer
          l’invitation.
        </p>
      )}

      <div className="mt-4 grid gap-3 rounded-2xl border border-emerald-100 bg-white/80 p-4 text-sm sm:grid-cols-2">
        <Summary label="Agence" value={result.invitation.agency_name} />
        <Summary
          label={label}
          value={`${result.invitation.first_name} ${result.invitation.last_name}`}
        />
        <Summary label="Email destinataire" value={result.invitation.email} />
        <div>
          <div className="text-xs text-primary/45">Statut</div>
          <div className="mt-1">
            <PrivateStatusBadge status={result.invitation.status} />
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => openAccessGmail(result.gmailHref)}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
        >
          <ExternalLink className="h-4 w-4" />
          Ouvrir dans Gmail
        </button>
        <button
          type="button"
          onClick={() => openAccessEmail(result.mailtoHref)}
          className="inline-flex items-center gap-2 rounded-full border border-[#d8cfc2] bg-white px-4 py-2.5 text-sm font-medium text-primary transition hover:bg-[#faf7f0]"
        >
          <Mail className="h-4 w-4" />
          Ouvrir l’application mail
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
          Copier le lien
        </button>
      </div>

      {copied && (
        <div className="mt-3 text-xs text-primary/55">
          {copied === "message" ? "Message copié." : "Lien copié."}
        </div>
      )}
    </div>
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
