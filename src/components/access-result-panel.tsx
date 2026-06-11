import { Copy, Mail } from "lucide-react";
import { useState } from "react";

import {
  openAccessEmail,
  type AccessCreationResult,
} from "@/lib/access-invitations";

type AccessResultPanelProps = {
  result: AccessCreationResult;
  createdMessage: string;
  existingMessage: string;
  label: string;
};

export function AccessResultPanel({
  result,
  createdMessage,
  existingMessage,
  label,
}: AccessResultPanelProps) {
  const [copied, setCopied] = useState<string | null>(null);

  async function copy(value: string, nextCopied: string) {
    await navigator.clipboard?.writeText(value);
    setCopied(nextCopied);
  }

  return (
    <div className="rounded-2xl border border-gold bg-gold/10 p-5">
      <div className="font-medium">
        {result.alreadyExists ? existingMessage : createdMessage}
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        {label} : {result.invitation.email} ·{" "}
        {result.persistedIn === "supabase"
          ? "enregistré dans Supabase"
          : "enregistré localement pour la démo"}
      </p>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => openAccessEmail(result.mailtoHref)}
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
  );
}
