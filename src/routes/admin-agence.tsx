import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  Building2,
  Home,
  LogOut,
  Mail,
  UserRoundPlus,
  Users,
} from "lucide-react";
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
import { agencyConfig } from "@/lib/agency-config";
import {
  createAgentAccess,
  getAgencyForUser,
  listAgentInvitations,
  openAccessEmail,
  type AccessCreationResult,
  type AccessInvitation,
  type AgencySummary,
} from "@/lib/access-invitations";

export const Route = createFileRoute("/admin-agence")({
  head: () => ({
    meta: [
      { title: "Admin agence - Signature Immobilier" },
      {
        name: "description",
        content: "Espace patron d’agence Signature Immobilier.",
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
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [agency, setAgency] = useState<AgencySummary | null>(null);
  const [agents, setAgents] = useState<AccessInvitation[]>([]);
  const [source, setSource] = useState<"supabase" | "local" | null>(null);
  const [result, setResult] = useState<AccessCreationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
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
      setSource(data.persistedIn);
      setLoading(false);
    },
    [profile?.email],
  );

  useEffect(() => {
    loadAgencyData();
  }, [loadAgencyData]);

  async function onSignOut() {
    await signOut();
    navigate({ to: "/mon-suivi", replace: true });
  }

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
    openAccessEmail(nextResult.mailtoHref);
    await loadAgencyData();
  }

  return (
    <SiteLayout>
      <section className="border-b border-border bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-7xl flex-wrap items-end justify-between gap-6 px-5 py-10 md:px-8 md:py-12">
          <div>
            <div className="text-xs uppercase tracking-[0.25em] opacity-70">
              Admin agence
            </div>
            <h1 className="mt-2 font-display text-3xl md:text-5xl">
              Gestion de l’agence
            </h1>
            <p className="mt-3 opacity-80">{agency?.name ?? profile?.email}</p>
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
            icon={<Building2 className="h-5 w-5 text-gold" />}
            value={agency?.city ?? "Agence"}
            label={agency?.name ?? "Chargement de l’agence"}
          />
          <Metric
            icon={<Users className="h-5 w-5 text-gold" />}
            value={`${agents.length}`}
            label="Agents préparés"
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
                Créer un accès agent
              </CardTitle>
              <CardDescription>
                L’agent recevra un email prérempli avec son lien d’activation.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
                <Field label="Prénom agent">
                  <Input
                    value={form.firstName}
                    onChange={(event) =>
                      setForm({ ...form, firstName: event.target.value })
                    }
                    required
                  />
                </Field>
                <Field label="Nom agent">
                  <Input
                    value={form.lastName}
                    onChange={(event) =>
                      setForm({ ...form, lastName: event.target.value })
                    }
                    required
                  />
                </Field>
                <Field label="Email agent">
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(event) =>
                      setForm({ ...form, email: event.target.value })
                    }
                    required
                  />
                </Field>
                <Field label="Téléphone agent">
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
                    {submitting ? "Création..." : "Créer l’accès agent"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-5">
            {result && (
              <AccessResultPanel
                result={result}
                label="Agent"
                createdMessage="L’accès agent a été créé. L’email d’activation est prêt à être envoyé."
                existingMessage="L’accès agent existe déjà."
              />
            )}

            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="font-display text-2xl">
                  Agents de l’agence
                </CardTitle>
                <CardDescription>
                  {loading
                    ? "Chargement..."
                    : `${agents.length} accès préparé(s).`}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {agents.length === 0 && !loading && (
                  <p className="text-sm text-muted-foreground">
                    Aucun accès agent créé pour le moment.
                  </p>
                )}
                {agents.map((agent) => (
                  <div
                    key={agent.id}
                    className="rounded-xl border border-border bg-secondary/40 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-medium">
                          {agent.first_name} {agent.last_name}
                        </div>
                        <div className="mt-1 text-sm text-muted-foreground">
                          {agent.email}
                        </div>
                      </div>
                      <Badge variant="secondary">{agent.status}</Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        <Card className="mt-8 rounded-2xl">
          <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="font-display text-2xl">
                Biens de l’agence
              </CardTitle>
              <CardDescription>
                Les annonces visibles et les espaces vendeurs se gèrent depuis
                l’espace agent de l’agence.
              </CardDescription>
            </div>
            <Button asChild className="rounded-full">
              <Link to="/agent">
                Créer ou modifier une annonce
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {agencyConfig.properties.slice(0, 6).map((property) => (
              <div
                key={property.id}
                className="rounded-xl border border-border bg-secondary/40 p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-card text-gold">
                    <Home className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="truncate font-medium">
                      {property.title}
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      {property.city} · {property.price}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
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
