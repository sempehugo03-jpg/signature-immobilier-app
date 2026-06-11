import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Copy, Mail, Plus, UserRoundPlus } from "lucide-react";
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
import { useAuth } from "@/hooks/use-auth";
import { agencyConfig } from "@/lib/agency-config";
import {
  buildAgentEmail,
  createAgentAccess,
  getAccessActivationUrl,
  getAgencyForUser,
  listAgentInvitations,
  openAccessEmail,
  openAccessGmail,
  type AccessCreationResult,
  type AccessInvitation,
  type AgencySummary,
} from "@/lib/access-invitations";
import { buildPublicAppUrl } from "@/lib/invitation-email";

export const Route = createFileRoute("/admin-agence")({
  head: () => ({
    meta: [
      { title: "Espace agence - Signature Immobilier" },
      {
        name: "description",
        content: "Gestion de l’agence Signature Immobilier.",
      },
    ],
  }),
  component: AdminAgenceRoute,
});

function AdminAgenceRoute() {
  return (
    <ProtectedRoute role="agency_admin">
      <AdminAgence />
    </ProtectedRoute>
  );
}

function AdminAgence() {
  const { profile } = useAuth();
  const [agency, setAgency] = useState<AgencySummary | null>(null);
  const [agents, setAgents] = useState<AccessInvitation[]>([]);
  const [result, setResult] = useState<AccessCreationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [gmailBlocked, setGmailBlocked] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  const loadAgencyData = useCallback(
    async (email = profile?.email ?? "") => {
      if (!email) return;

      const nextAgency = await getAgencyForUser(email);
      const data = await listAgentInvitations(nextAgency.id);
      setAgency(nextAgency);
      setAgents(data.invitations);
      setLoading(false);
    },
    [profile?.email],
  );

  useEffect(() => {
    loadAgencyData();
  }, [loadAgencyData]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!agency) return;

    setSubmitting(true);
    const nextResult = await createAgentAccess({
      agency,
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
    });

    setResult(nextResult);
    setSubmitting(false);
    setGmailBlocked(!openAccessGmail(nextResult.gmailHref));
    await loadAgencyData();
  }

  async function copyLink(agent: AccessInvitation) {
    await navigator.clipboard?.writeText(getAgentUrl(agent));
    setCopied(agent.id);
  }

  return (
    <PrivateShell>
      <PrivateHero
        title="Espace agence"
        subtitle={`Bonjour ${getFirstName(profile?.full_name ?? profile?.email)}`}
        description="Gérez vos agents et les biens suivis par votre agence."
      />

      <section className="mx-auto max-w-7xl px-5 pb-14 md:px-8">
        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <PrivateCard className="p-6 md:p-8">
            <div className="grid h-11 w-11 place-items-center rounded-full bg-primary text-primary-foreground">
              <UserRoundPlus className="h-5 w-5" />
            </div>
            <h2 className="mt-5 font-display text-4xl leading-tight">
              Votre équipe
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-primary/55">
              Ajoutez les agents qui pourront créer les annonces et les espaces
              vendeurs.
            </p>

            <form className="mt-7 grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
              <Field label="Prénom">
                <Input
                  value={form.firstName}
                  onChange={(event) =>
                    setForm({ ...form, firstName: event.target.value })
                  }
                  required
                />
              </Field>
              <Field label="Nom">
                <Input
                  value={form.lastName}
                  onChange={(event) =>
                    setForm({ ...form, lastName: event.target.value })
                  }
                  required
                />
              </Field>
              <Field label="Email">
                <Input
                  type="email"
                  value={form.email}
                  onChange={(event) =>
                    setForm({ ...form, email: event.target.value })
                  }
                  required
                />
              </Field>
              <Field label="Téléphone">
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
                  disabled={submitting || !agency}
                >
                  {submitting ? "Ajout..." : "Ajouter un agent"}
                </Button>
              </div>
            </form>

            {result && (
              <div className="mt-6">
                <AccessResultPanel
                  result={result}
                  label="Agent"
                  gmailBlocked={gmailBlocked}
                />
              </div>
            )}
          </PrivateCard>

          <PrivateCard id="agents" className="p-6 md:p-8">
            <PrivateSectionTitle
              title="Agents"
              description={
                loading
                  ? "Chargement des agents..."
                  : "Les accès de votre équipe sont regroupés ici."
              }
            />

            <div className="mt-6 overflow-hidden rounded-[20px] border border-[#e8e0d5]">
              <div className="hidden grid-cols-[1fr_1.1fr_0.7fr_1fr] gap-4 bg-[#faf7f0] px-5 py-3 text-xs font-medium uppercase tracking-[0.16em] text-primary/45 md:grid">
                <div>Nom</div>
                <div>Email</div>
                <div>Statut</div>
                <div>Actions</div>
              </div>

              {agents.length === 0 && !loading && (
                <div className="px-5 py-8 text-sm text-primary/55">
                  Aucun agent ajouté pour le moment.
                </div>
              )}

              {agents.map((agent) => (
                <div
                  key={agent.id}
                  className="grid gap-4 border-t border-[#e8e0d5] px-5 py-5 text-sm md:grid-cols-[1fr_1.1fr_0.7fr_1fr] md:items-center"
                >
                  <MobileLabel label="Nom" />
                  <div className="font-medium">
                    {agent.first_name} {agent.last_name}
                  </div>
                  <MobileLabel label="Email" />
                  <div className="break-words text-primary/60">
                    {agent.email}
                  </div>
                  <MobileLabel label="Statut" />
                  <div>
                    <PrivateStatusBadge status={agent.status} />
                  </div>
                  <MobileLabel label="Actions" />
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => openAccessEmail(getAgentEmail(agent))}
                      className="inline-flex items-center gap-2 rounded-full border border-[#d8cfc2] bg-white px-3 py-2 text-xs font-medium text-primary"
                    >
                      <Mail className="h-3.5 w-3.5" />
                      Renvoyer l’accès
                    </button>
                    <button
                      type="button"
                      onClick={() => copyLink(agent)}
                      className="inline-flex items-center gap-2 rounded-full border border-[#d8cfc2] bg-white px-3 py-2 text-xs font-medium text-primary"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      {copied === agent.id ? "Lien copié" : "Copier le lien"}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <a
              href="#agents"
              className="mt-5 inline-flex text-sm font-medium text-primary/60 hover:text-primary"
            >
              Voir tous les agents
            </a>
          </PrivateCard>
        </div>

        <PrivateCard className="mt-7 p-6 md:p-8">
          <PrivateSectionTitle
            title="Biens de l’agence"
            description="Suivez les biens confiés à votre équipe."
            action={
              <Button asChild className="rounded-full">
                <Link to="/agent">
                  <Plus className="h-4 w-4" />
                  Créer une annonce
                </Link>
              </Button>
            }
          />

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {agencyConfig.properties.slice(0, 4).map((property, index) => (
              <div
                key={property.id}
                className="grid gap-4 rounded-[22px] border border-[#e8e0d5] bg-[#fffdf9] p-4 sm:grid-cols-[148px_1fr]"
              >
                <img
                  src={property.coverImage}
                  alt={property.title}
                  className="h-36 w-full rounded-2xl object-cover sm:h-full"
                />
                <div className="flex min-w-0 flex-col justify-between gap-4">
                  <div>
                    <h3 className="font-display text-2xl leading-tight">
                      {property.title}
                    </h3>
                    <p className="mt-1 text-sm text-primary/55">
                      {property.city} · {property.price}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <PrivateStatusBadge
                      status={
                        index % 2 === 0
                          ? "Espace vendeur créé"
                          : "À créer"
                      }
                    />
                    <Button asChild variant="outline" className="rounded-full">
                      <Link to="/agent">
                        Gérer
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </PrivateCard>
      </section>
    </PrivateShell>
  );
}

function getFirstName(value?: string | null) {
  if (!value) return "";
  return value.split("@")[0].split(/[.\s_-]/)[0] || "";
}

function getAgentUrl(agent: AccessInvitation) {
  if (agent.activation_token) {
    return getAccessActivationUrl("agent", agent.activation_token);
  }

  return buildPublicAppUrl("/mon-suivi");
}

function getAgentEmail(agent: AccessInvitation) {
  return buildAgentEmail({
    firstName: agent.first_name,
    email: agent.email,
    activationUrl: getAgentUrl(agent),
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
