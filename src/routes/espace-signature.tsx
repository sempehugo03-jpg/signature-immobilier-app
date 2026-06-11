import { createFileRoute } from "@tanstack/react-router";
import { Copy, Mail, UserRoundPlus } from "lucide-react";
import {
  FormEvent,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { AccessResultPanel } from "@/components/access-result-panel";
import {
  PrivateCard,
  PrivateHero,
  PrivateSectionTitle,
  PrivateShell,
  PrivateStatusBadge,
} from "@/components/private-shell";
import { ProtectedRoute } from "@/components/protected-route";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  buildAgencyAdminEmail,
  createAgencyAdminAccess,
  getAccessActivationUrl,
  listAgencyAdminInvitations,
  openAccessEmail,
  openAccessGmail,
  type AccessCreationResult,
  type AccessInvitation,
} from "@/lib/access-invitations";
import { buildPublicAppUrl } from "@/lib/invitation-email";

export const Route = createFileRoute("/espace-signature")({
  head: () => ({
    meta: [
      { title: "Espace Signature - Signature Immobilier" },
      {
        name: "description",
        content: "Création des accès patrons Signature Immobilier.",
      },
    ],
  }),
  component: EspaceSignatureRoute,
});

function EspaceSignatureRoute() {
  return (
    <ProtectedRoute role="owner">
      <EspaceSignature />
    </ProtectedRoute>
  );
}

function EspaceSignature() {
  const [form, setForm] = useState({
    agencyName: "",
    agencyCity: "",
    agencyPhone: "",
    agencyEmail: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });
  const [invitations, setInvitations] = useState<AccessInvitation[]>([]);
  const [result, setResult] = useState<AccessCreationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [gmailBlocked, setGmailBlocked] = useState(false);

  const loadInvitations = useCallback(async () => {
    const data = await listAgencyAdminInvitations();
    setInvitations(data.invitations);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadInvitations();
  }, [loadInvitations]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);

    const nextResult = await createAgencyAdminAccess({
      agencyName: form.agencyName.trim(),
      agencyCity: form.agencyCity.trim(),
      agencyPhone: form.agencyPhone.trim(),
      agencyEmail: form.agencyEmail.trim(),
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
    });

    setResult(nextResult);
    setSubmitting(false);
    setGmailBlocked(!openAccessGmail(nextResult.gmailHref));
    await loadInvitations();
  }

  async function copyLink(invitation: AccessInvitation) {
    await navigator.clipboard?.writeText(getInvitationUrl(invitation));
    setCopied(invitation.id);
  }

  return (
    <PrivateShell>
      <PrivateHero
        title="Espace Signature"
        description="Créez et envoyez les accès aux patrons d’agence."
      />

      <section className="mx-auto max-w-7xl px-5 pb-14 md:px-8">
        <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
          <PrivateCard className="p-6 md:p-8">
            <div className="grid h-11 w-11 place-items-center rounded-full bg-primary text-primary-foreground">
              <UserRoundPlus className="h-5 w-5" />
            </div>
            <h2 className="mt-5 font-display text-4xl leading-tight">
              Créer un accès patron
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-primary/55">
              Renseignez les informations du patron d’agence pour créer son
              accès à l’Espace Signature.
            </p>

            <form className="mt-7 grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
              <Field label="Nom de l’agence">
                <Input
                  value={form.agencyName}
                  onChange={(event) =>
                    setForm({ ...form, agencyName: event.target.value })
                  }
                  required
                />
              </Field>
              <Field label="Ville">
                <Input
                  value={form.agencyCity}
                  onChange={(event) =>
                    setForm({ ...form, agencyCity: event.target.value })
                  }
                  required
                />
              </Field>
              <Field label="Prénom du patron">
                <Input
                  value={form.firstName}
                  onChange={(event) =>
                    setForm({ ...form, firstName: event.target.value })
                  }
                  required
                />
              </Field>
              <Field label="Nom du patron">
                <Input
                  value={form.lastName}
                  onChange={(event) =>
                    setForm({ ...form, lastName: event.target.value })
                  }
                  required
                />
              </Field>
              <Field label="Email du patron">
                <Input
                  type="email"
                  value={form.email}
                  onChange={(event) =>
                    setForm({ ...form, email: event.target.value })
                  }
                  required
                />
              </Field>
              <Field label="Téléphone du patron">
                <Input
                  type="tel"
                  value={form.phone}
                  onChange={(event) =>
                    setForm({ ...form, phone: event.target.value })
                  }
                />
              </Field>
              <div className="md:col-span-2">
                <Button
                  className="w-full rounded-full md:w-auto"
                  size="lg"
                  disabled={submitting}
                >
                  {submitting ? "Création..." : "Créer l’accès patron"}
                </Button>
              </div>
            </form>
          </PrivateCard>

          <PrivateCard className="p-6 md:p-8">
            <h2 className="font-display text-4xl leading-tight">
              Accès patron prêt à envoyer
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-primary/55">
              L’accès a été créé avec succès. Vous pouvez envoyer l’invitation
              au patron de l’agence.
            </p>

            <div className="mt-6">
              {result ? (
                <AccessResultPanel
                  result={result}
                  label="Patron"
                  gmailBlocked={gmailBlocked}
                />
              ) : (
                <div className="rounded-[22px] border border-dashed border-[#d8cfc2] bg-[#faf7f0] p-6 text-sm leading-relaxed text-primary/55">
                  Le prochain accès créé apparaîtra ici avec l’email, le lien
                  et le message prêts à envoyer.
                </div>
              )}
            </div>
          </PrivateCard>
        </div>

        <PrivateCard className="mt-7 p-6 md:p-8">
          <PrivateSectionTitle
            title="Accès créés"
            description={
              loading
                ? "Chargement des accès..."
                : "Retrouvez les invitations déjà préparées."
            }
          />

          <div className="mt-6 overflow-hidden rounded-[20px] border border-[#e8e0d5]">
            <div className="hidden grid-cols-[1.1fr_1fr_1.2fr_0.7fr_1fr] gap-4 bg-[#faf7f0] px-5 py-3 text-xs font-medium uppercase tracking-[0.16em] text-primary/45 md:grid">
              <div>Agence</div>
              <div>Patron</div>
              <div>Email</div>
              <div>Statut</div>
              <div>Actions</div>
            </div>

            {invitations.length === 0 && !loading && (
              <div className="px-5 py-8 text-sm text-primary/55">
                Aucun accès patron créé pour le moment.
              </div>
            )}

            {invitations.map((invitation) => (
              <div
                key={invitation.id}
                className="grid gap-4 border-t border-[#e8e0d5] px-5 py-5 text-sm md:grid-cols-[1.1fr_1fr_1.2fr_0.7fr_1fr] md:items-center"
              >
                <MobileLabel label="Agence" />
                <div className="font-medium">{invitation.agency_name}</div>
                <MobileLabel label="Patron" />
                <div>
                  {invitation.first_name} {invitation.last_name}
                </div>
                <MobileLabel label="Email" />
                <div className="break-words text-primary/60">
                  {invitation.email}
                </div>
                <MobileLabel label="Statut" />
                <div>
                  <PrivateStatusBadge status={invitation.status} />
                </div>
                <MobileLabel label="Actions" />
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      openAccessEmail(getInvitationEmail(invitation))
                    }
                    className="inline-flex items-center gap-2 rounded-full border border-[#d8cfc2] bg-white px-3 py-2 text-xs font-medium text-primary"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    Ouvrir l’email
                  </button>
                  <button
                    type="button"
                    onClick={() => copyLink(invitation)}
                    className="inline-flex items-center gap-2 rounded-full border border-[#d8cfc2] bg-white px-3 py-2 text-xs font-medium text-primary"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    {copied === invitation.id ? "Lien copié" : "Copier le lien"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </PrivateCard>
      </section>
    </PrivateShell>
  );
}

function getInvitationUrl(invitation: AccessInvitation) {
  if (invitation.activation_token) {
    return getAccessActivationUrl(invitation.role, invitation.activation_token);
  }

  return buildPublicAppUrl("/mon-suivi");
}

function getInvitationEmail(invitation: AccessInvitation) {
  return buildAgencyAdminEmail({
    firstName: invitation.first_name,
    email: invitation.email,
    activationUrl: getInvitationUrl(invitation),
  }).mailtoHref;
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function MobileLabel({ label }: { label: string }) {
  return (
    <div className="-mb-2 text-xs font-medium uppercase tracking-[0.16em] text-primary/40 md:hidden">
      {label}
    </div>
  );
}
