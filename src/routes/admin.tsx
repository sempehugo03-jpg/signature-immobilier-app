import {
  createFileRoute,
  Link,
  Outlet,
  useNavigate,
  useRouterState,
} from "@tanstack/react-router";
import { ArrowRight, Building2, Plus } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";

import {
  AdminLogoutButton,
  Field,
  SaasCard,
  SaasHero,
  SaasShell,
  SectionTitle,
  StatusBadge,
} from "@/components/agency-saas-ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  activateAgency,
  createAgency,
  disableAgency,
  generateAgencySlug,
  getAgents,
  getAgencies,
  getManagers,
  type Agency,
} from "@/lib/agency-saas";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin - Signature Immobilier" },
      {
        name: "description",
        content: "Activation simple des portails agences Signature Immobilier.",
      },
    ],
  }),
  component: AdminRoute,
});

const adminSessionKey = "signature_admin_access";

function AdminRoute() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const isBaseAdmin = pathname === "/admin" || pathname === "/admin/";
  const [authorized, setAuthorized] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setAuthorized(window.sessionStorage.getItem(adminSessionKey) === "granted");
    setLoaded(true);
  }, []);

  function onLogout() {
    window.sessionStorage.removeItem(adminSessionKey);
    setAuthorized(false);
    navigate({ to: "/admin", replace: true });
  }

  if (!loaded) return null;

  if (!authorized) {
    return <AdminLogin onAuthorized={() => setAuthorized(true)} />;
  }

  if (!isBaseAdmin) return <Outlet />;

  return (
    <SaasShell action={<AdminLogoutButton onClick={onLogout} />}>
      <AdminDashboard />
    </SaasShell>
  );
}

function AdminLogin({ onAuthorized }: { onAuthorized: () => void }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (code.trim() !== getAdminCode()) {
      setError("Code incorrect.");
      return;
    }

    window.sessionStorage.setItem(adminSessionKey, "granted");
    onAuthorized();
  }

  return (
    <SaasShell>
      <section className="mx-auto grid min-h-[calc(100vh-80px)] max-w-md place-items-center px-5">
        <SaasCard className="w-full p-6 md:p-8">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-primary text-primary-foreground">
            <Building2 className="h-5 w-5" />
          </div>
          <h1 className="mt-5 font-display text-4xl leading-tight">
            Admin Hugo
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-primary/55">
            Entrez le code admin pour créer, activer et désactiver les portails
            agences.
          </p>
          <form className="mt-6 space-y-4" onSubmit={onSubmit}>
            <Field label="Code admin">
              <Input
                value={code}
                onChange={(event) => setCode(event.target.value)}
                placeholder="signature-admin"
                type="password"
                autoFocus
              />
            </Field>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button className="w-full rounded-full" size="lg">
              Ouvrir l’admin
            </Button>
          </form>
        </SaasCard>
      </section>
    </SaasShell>
  );
}

function AdminDashboard() {
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [feedback, setFeedback] = useState("");
  const [form, setForm] = useState({
    name: "",
    city: "",
    estimationEmail: "",
    logoUrl: "",
    phone: "",
    primaryColor: "#111111",
  });

  useEffect(() => {
    refresh();
  }, []);

  const draftSlug = useMemo(() => generateAgencySlug(form.name), [form.name]);

  function refresh() {
    setAgencies(getAgencies());
  }

  function onCreateAgency(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const agency = createAgency({
      name: form.name,
      city: form.city,
      estimationEmail: form.estimationEmail,
      logoUrl: form.logoUrl,
      phone: form.phone,
      primaryColor: form.primaryColor,
    });
    setForm({
      name: "",
      city: "",
      estimationEmail: "",
      logoUrl: "",
      phone: "",
      primaryColor: "#111111",
    });
    setFeedback(`${agency.name} a été créée en mode démo.`);
    refresh();
  }

  function onActivate(agency: Agency) {
    const managers = getManagers(agency.id);
    if (!managers.length) {
      setFeedback("Ajoutez au moins un gérant avant d’activer cette agence.");
      return;
    }
    activateAgency(agency.id);
    setFeedback(`${agency.name} est activée.`);
    refresh();
  }

  function onDisable(agency: Agency) {
    disableAgency(agency.id);
    setFeedback(`${agency.name} est désactivée.`);
    refresh();
  }

  return (
    <>
      <SaasHero
        eyebrow="Admin Signature"
        title="Portails agences"
        description="Créez une agence en démo, ajoutez ses gérants, puis activez son portail unique quand elle signe."
      />

      <section className="mx-auto grid max-w-7xl gap-7 px-5 pb-16 md:px-8 lg:grid-cols-[0.82fr_1.18fr]">
        <SaasCard className="p-6 md:p-8">
          <SectionTitle
            title="Créer une agence"
            description="Nom, ville et email de réception des estimations suffisent pour préparer une démo."
          />
          <form className="mt-7 grid gap-4" onSubmit={onCreateAgency}>
            <Field label="Nom de l’agence">
              <Input
                value={form.name}
                onChange={(event) =>
                  setForm({ ...form, name: event.target.value })
                }
                required
              />
            </Field>
            <Field label="Ville">
              <Input
                value={form.city}
                onChange={(event) =>
                  setForm({ ...form, city: event.target.value })
                }
                required
              />
            </Field>
            <Field label="Email de réception des estimations">
              <Input
                type="email"
                value={form.estimationEmail}
                onChange={(event) =>
                  setForm({ ...form, estimationEmail: event.target.value })
                }
                required
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Logo URL">
                <Input
                  value={form.logoUrl}
                  onChange={(event) =>
                    setForm({ ...form, logoUrl: event.target.value })
                  }
                />
              </Field>
              <Field label="Téléphone">
                <Input
                  value={form.phone}
                  onChange={(event) =>
                    setForm({ ...form, phone: event.target.value })
                  }
                />
              </Field>
            </div>
            <Field label="Couleur principale">
              <Input
                value={form.primaryColor}
                onChange={(event) =>
                  setForm({ ...form, primaryColor: event.target.value })
                }
              />
            </Field>
            <div className="rounded-2xl bg-[#faf7f0] p-4 text-sm text-primary/55">
              Slug généré :{" "}
              <span className="font-medium text-primary">
                {draftSlug || "agence"}
              </span>
            </div>
            <Button className="rounded-full" size="lg">
              <Plus className="h-4 w-4" />
              Créer l’agence
            </Button>
          </form>
        </SaasCard>

        <div className="space-y-4">
          <SectionTitle
            title="Agences"
            description="Une carte par agence, avec son état, son email estimation et son équipe."
          />
          {feedback && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
              {feedback}
            </div>
          )}
          <div className="grid gap-4">
            {agencies.map((agency) => (
              <AgencyCard
                key={agency.id}
                agency={agency}
                onActivate={() => onActivate(agency)}
                onDisable={() => onDisable(agency)}
              />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function AgencyCard({
  agency,
  onActivate,
  onDisable,
}: {
  agency: Agency;
  onActivate: () => void;
  onDisable: () => void;
}) {
  const managers = getManagers(agency.id);
  const agents = getAgents(agency.id);

  return (
    <SaasCard className="p-5 md:p-6">
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={agency.status} />
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-primary/35">
              {agency.city || "Ville à compléter"}
            </span>
          </div>
          <h3 className="mt-3 font-display text-3xl leading-tight">
            {agency.name}
          </h3>
          <p className="mt-2 break-words text-sm text-primary/55">
            {agency.estimationEmail || "Email estimation à compléter"}
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs text-primary/50">
            <span>{managers.length} gérant(s)</span>
            <span>{agents.length} agent(s)</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" className="rounded-full bg-white">
            <Link to="/admin/agencies/$slug" params={{ slug: agency.slug }}>
              Ouvrir
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          {agency.status !== "active" && (
            <Button type="button" className="rounded-full" onClick={onActivate}>
              Activer
            </Button>
          )}
          {agency.status !== "disabled" && (
            <Button
              type="button"
              variant="outline"
              className="rounded-full bg-white"
              onClick={onDisable}
            >
              Désactiver
            </Button>
          )}
        </div>
      </div>
    </SaasCard>
  );
}

function getAdminCode() {
  const env = import.meta.env as Record<string, string | undefined>;
  return env.NEXT_PUBLIC_ADMIN_CODE || env.VITE_ADMIN_CODE || "signature-admin";
}
