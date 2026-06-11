import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Building2, Crown, LogOut, Mail, UserRoundPlus } from "lucide-react";
import {
  FormEvent,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { AccessResultPanel } from "@/components/access-result-panel";
import { ProtectedRoute } from "@/components/protected-route";
import { SiteLayout } from "@/components/site-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import {
  createAgencyAdminAccess,
  listAgencyAdminInvitations,
  openAccessEmail,
  type AccessCreationResult,
  type AccessInvitation,
} from "@/lib/access-invitations";

export const Route = createFileRoute("/espace-signature")({
  head: () => ({
    meta: [
      { title: "Espace Signature - Signature Immobilier" },
      {
        name: "description",
        content: "Espace owner Signature Immobilier.",
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
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
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
  const [source, setSource] = useState<"supabase" | "local" | null>(null);
  const [result, setResult] = useState<AccessCreationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadInvitations = useCallback(async () => {
    const data = await listAgencyAdminInvitations();
    setInvitations(data.invitations);
    setSource(data.persistedIn);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadInvitations();
  }, [loadInvitations]);

  async function onSignOut() {
    await signOut();
    navigate({ to: "/mon-suivi", replace: true });
  }

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
    openAccessEmail(nextResult.mailtoHref);
    await loadInvitations();
  }

  return (
    <SiteLayout>
      <section className="border-b border-border bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-7xl flex-wrap items-end justify-between gap-6 px-5 py-10 md:px-8 md:py-12">
          <div>
            <div className="text-xs uppercase tracking-[0.25em] opacity-70">
              Espace owner
            </div>
            <h1 className="mt-2 font-display text-3xl md:text-5xl">
              Pilotage Signature Immobilier
            </h1>
            <p className="mt-3 opacity-80">{profile?.email}</p>
          </div>
          <Button
            variant="secondary"
            className="rounded-full"
            onClick={onSignOut}
          >
            <LogOut className="h-4 w-4" />
            Déconnexion
          </Button>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-10 md:px-8">
        <div className="grid gap-5 md:grid-cols-3">
          <Metric
            icon={<Crown className="h-5 w-5 text-gold" />}
            value="Owner"
            label="Rôle actif"
          />
          <Metric
            icon={<Building2 className="h-5 w-5 text-gold" />}
            value={`${invitations.length}`}
            label="Agences créées"
          />
          <Metric
            icon={<Mail className="h-5 w-5 text-gold" />}
            value={source === "local" ? "Local" : "Supabase"}
            label="Stockage des accès"
          />
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_0.9fr]">
          <Card className="rounded-2xl">
            <CardHeader>
              <div className="mb-3 grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground">
                <UserRoundPlus className="h-5 w-5" />
              </div>
              <CardTitle className="font-display text-3xl">
                Créer un accès patron
              </CardTitle>
              <CardDescription>
                Le patron recevra un email prérempli avec son lien d’activation.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
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
                <Field label="Téléphone agence">
                  <Input
                    type="tel"
                    value={form.agencyPhone}
                    onChange={(event) =>
                      setForm({ ...form, agencyPhone: event.target.value })
                    }
                    required
                  />
                </Field>
                <Field label="Email agence">
                  <Input
                    type="email"
                    value={form.agencyEmail}
                    onChange={(event) =>
                      setForm({ ...form, agencyEmail: event.target.value })
                    }
                    required
                  />
                </Field>
                <Field label="Prénom patron">
                  <Input
                    value={form.firstName}
                    onChange={(event) =>
                      setForm({ ...form, firstName: event.target.value })
                    }
                    required
                  />
                </Field>
                <Field label="Nom patron">
                  <Input
                    value={form.lastName}
                    onChange={(event) =>
                      setForm({ ...form, lastName: event.target.value })
                    }
                    required
                  />
                </Field>
                <Field label="Email patron">
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(event) =>
                      setForm({ ...form, email: event.target.value })
                    }
                    required
                  />
                </Field>
                <Field label="Téléphone patron">
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
            </CardContent>
          </Card>

          <div className="space-y-5">
            {result && (
              <AccessResultPanel
                result={result}
                label="Patron"
                createdMessage="L’accès patron a été créé. L’email d’activation est prêt à être envoyé."
                existingMessage="L’accès patron existe déjà."
              />
            )}

            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="font-display text-2xl">
                  Accès patrons
                </CardTitle>
                <CardDescription>
                  {loading
                    ? "Chargement..."
                    : `${invitations.length} accès préparé(s).`}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {invitations.length === 0 && !loading && (
                  <p className="text-sm text-muted-foreground">
                    Aucun accès patron créé pour le moment.
                  </p>
                )}
                {invitations.map((invitation) => (
                  <div
                    key={invitation.id}
                    className="rounded-xl border border-border bg-secondary/40 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-medium">
                          {invitation.agency_name}
                        </div>
                        <div className="mt-1 text-sm text-muted-foreground">
                          {invitation.first_name} {invitation.last_name} ·{" "}
                          {invitation.email}
                        </div>
                      </div>
                      <Badge variant="secondary">{invitation.status}</Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

function Metric({
  icon,
  value,
  label,
}: {
  icon: ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      {icon}
      <div className="mt-4 font-display text-3xl">{value}</div>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
