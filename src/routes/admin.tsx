import {
  createFileRoute,
  Link,
  Outlet,
  useNavigate,
  useRouterState,
} from "@tanstack/react-router";
import {
  ArrowRight,
  Building2,
  Copy,
  Eye,
  ExternalLink,
  Mail,
  Plus,
  Trash2,
} from "lucide-react";
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
import { sendInviteEmail } from "@/lib/api/agency-email.functions";
import {
  isAdminSessionActive,
  isAdminCodeValid,
  saveAdminSession,
} from "@/lib/admin-session";
import {
  activateAgency,
  addTeamMember,
  consumeStorageResetNotice,
  createAgency,
  deleteTeamMember,
  disableAgency,
  generateAgencySlug,
  getAgents,
  getAgencies,
  getAgencyLinks,
  getManagers,
  removeAgency,
  type Agency,
  type TeamMember,
} from "@/lib/agency-saas";
import { isValidEmail } from "@/lib/email-utils";
import {
  createSharedTeamMemberInviteEmail,
  getInviteCreationErrorMessage,
  getSharedInviteStorageWarning,
  logInviteCreationFailure,
} from "@/lib/shared-invites";
import {
  clearAllLocalSessions,
  signOutEverywhere,
} from "@/lib/session-cleanup";

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

const adminFlashKey = "signature_admin_flash";

function AdminRoute() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const isBaseAdmin = pathname === "/admin" || pathname === "/admin/";
  const [authorized, setAuthorized] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setAuthorized(isAdminSessionActive());
    setLoaded(true);
  }, []);

  async function onLogout() {
    await signOutEverywhere();
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
    if (!isAdminCodeValid(code)) {
      setError("Code admin incorrect.");
      return;
    }

    saveAdminSession();
    setError("");
    onAuthorized();
  }

  function onResetSession() {
    clearAllLocalSessions();
    window.location.replace("/admin");
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
            Entrez le code admin pour créer, activer, désactiver et retirer les
            portails agences.
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
          <button
            type="button"
            className="mt-5 text-sm font-medium text-primary/45 underline underline-offset-4 transition hover:text-primary"
            onClick={onResetSession}
          >
            Réinitialiser ma session
          </button>
        </SaasCard>
      </section>
    </SaasShell>
  );
}

function AdminDashboard() {
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [feedback, setFeedback] = useState("");
  const [manualAccessLink, setManualAccessLink] = useState("");
  const [manualAccessMailto, setManualAccessMailto] = useState("");
  const [manualAccessCopied, setManualAccessCopied] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    city: "",
    estimationEmail: "",
    managerFirstName: "",
    managerLastName: "",
    managerEmail: "",
    phone: "",
    logoUrl: "",
    primaryColor: "#111111",
  });

  useEffect(() => {
    refresh();
    const flash = window.sessionStorage.getItem(adminFlashKey);
    if (flash) {
      setFeedback(flash);
      window.sessionStorage.removeItem(adminFlashKey);
    } else if (consumeStorageResetNotice()) {
      setFeedback("Certaines données locales ont été réinitialisées.");
    }
  }, []);

  const draftSlug = useMemo(() => generateAgencySlug(form.name), [form.name]);

  function refresh() {
    setAgencies(getAgencies());
  }

  function resetCreateForm() {
    setForm({
      name: "",
      city: "",
      estimationEmail: "",
      managerFirstName: "",
      managerLastName: "",
      managerEmail: "",
      phone: "",
      logoUrl: "",
      primaryColor: "#111111",
    });
  }

  async function onCreateAgency(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (
      !isValidEmail(form.estimationEmail) ||
      !isValidEmail(form.managerEmail)
    ) {
      setManualAccessLink("");
      setManualAccessMailto("");
      setManualAccessCopied(false);
      setFeedback("Email invalide.");
      return;
    }

    const agency = createAgency({
      name: form.name,
      city: form.city,
      estimationEmail: form.estimationEmail,
      logoUrl: form.logoUrl,
      phone: form.phone,
      primaryColor: form.primaryColor,
    });
    const manager = addTeamMember(agency.id, {
      firstName: form.managerFirstName,
      lastName: form.managerLastName,
      email: form.managerEmail,
      phone: "",
      role: "manager",
      status: "invited",
    });
    let invite;
    try {
      invite = await createSharedTeamMemberInviteEmail(agency, manager);
    } catch (error) {
      logInviteCreationFailure(error);
      deleteTeamMember(manager.id);
      removeAgency(agency.id);
      setManualAccessLink("");
      setManualAccessMailto("");
      setManualAccessCopied(false);
      setFeedback(`Agence non créée. ${getInviteCreationErrorMessage(error)}`);
      refresh();
      return;
    }
    const storageWarning = getSharedInviteStorageWarning(invite.persistedIn);
    const result = await sendTeamInviteEmail(
      agency.name,
      manager,
      invite.email.accessUrl,
    );
    resetCreateForm();
    setShowCreateForm(false);
    if (result.sent) {
      setManualAccessLink("");
      setManualAccessMailto("");
      setManualAccessCopied(false);
      setFeedback(
        `Agence créée en mode démo. Email d’invitation envoyé au patron.${storageWarning}`,
      );
    } else {
      setManualAccessLink(invite.email.accessUrl ?? "");
      setManualAccessMailto(invite.email.mailtoHref);
      setManualAccessCopied(false);
      setFeedback(
        `Agence créée en mode démo. Invitation créée. Email non envoyé : configuration email manquante.${storageWarning}`,
      );
    }
    refresh();
  }

  async function onActivate(agency: Agency) {
    setManualAccessLink("");
    setManualAccessMailto("");
    setManualAccessCopied(false);
    const managers = getManagers(agency.id).filter(
      (manager) => manager.status !== "disabled",
    );
    if (!managers.length) {
      setFeedback("Ajoutez au moins un patron avant d’activer l’agence.");
      return;
    }
    if (!agency.estimationEmail) {
      setFeedback(
        "Renseignez l’email de réception des estimations avant d’activer.",
      );
      return;
    }
    if (
      !isValidEmail(agency.estimationEmail) ||
      managers.some((manager) => !isValidEmail(manager.email))
    ) {
      setFeedback("Email invalide.");
      return;
    }

    let invites;
    try {
      invites = await Promise.all(
        managers.map((manager) =>
          createSharedTeamMemberInviteEmail(agency, manager),
        ),
      );
    } catch (error) {
      logInviteCreationFailure(error);
      setFeedback(getInviteCreationErrorMessage(error));
      refresh();
      return;
    }
    const updated = activateAgency(agency.id);
    if (!updated) return;
    const emails = invites.map((invite) => invite.email);
    const storageWarning = getSharedInviteStorageWarning(
      invites.some((invite) => invite.persistedIn === "local")
        ? "local"
        : "supabase",
    );
    const results = await Promise.all(
      managers.map((manager, index) =>
        sendTeamInviteEmail(updated.name, manager, emails[index]?.accessUrl),
      ),
    );

    const sentCount = results.filter((result) => result.sent).length;
    if (sentCount) {
      setManualAccessLink("");
      setManualAccessMailto("");
      setManualAccessCopied(false);
      setFeedback(
        `Agence activée. Email envoyé au(x) patron(s).${storageWarning}`,
      );
    } else {
      setManualAccessLink(emails[0]?.accessUrl ?? "");
      setManualAccessMailto(emails[0]?.mailtoHref ?? "");
      setManualAccessCopied(false);
      setFeedback(
        `Agence activée. Email non envoyé : configuration email manquante.${storageWarning}`,
      );
    }
    refresh();
  }

  function onDisable(agency: Agency) {
    disableAgency(agency.id);
    setManualAccessLink("");
    setManualAccessMailto("");
    setManualAccessCopied(false);
    setFeedback("Agence désactivée.");
    refresh();
  }

  function onRemove(agency: Agency) {
    if (
      !window.confirm(
        "Retirer cette agence ? Cette action supprimera l’agence de votre espace admin.",
      )
    ) {
      return;
    }
    removeAgency(agency.id);
    setManualAccessLink("");
    setManualAccessMailto("");
    setManualAccessCopied(false);
    setFeedback("Agence retirée.");
    refresh();
  }

  async function onCopyManualAccessLink() {
    if (!manualAccessLink) return;
    await navigator.clipboard?.writeText(manualAccessLink);
    setManualAccessCopied(true);
  }

  function onOpenManualAccessLink() {
    if (!manualAccessLink) return;
    const opened = window.open(
      manualAccessLink,
      "_blank",
      "noopener,noreferrer",
    );
    if (opened) opened.opener = null;
  }

  return (
    <>
      <SaasHero
        eyebrow="Admin Signature"
        title="Espace admin Signature Immobilier"
        description="Créez une agence en démo, ajoutez son patron principal, puis activez le même portail quand elle signe."
      />

      <section className="mx-auto max-w-7xl px-5 pb-16 md:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <SectionTitle
            title="Agences"
            description="Chaque agence expose sa fiche centrale, sa démo commerciale et son vrai espace agence après activation."
          />
          <Button
            type="button"
            className="rounded-full"
            onClick={() => setShowCreateForm((value) => !value)}
          >
            <Plus className="h-4 w-4" />
            Créer une agence
          </Button>
        </div>

        {feedback && (
          <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-relaxed text-emerald-700">
            {feedback}
            {manualAccessLink && (
              <div className="mt-3 rounded-2xl border border-emerald-100 bg-white/70 p-3">
                <div className="break-all font-medium">
                  Lien d’accès à copier : {manualAccessLink}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-full bg-white"
                    onClick={onCopyManualAccessLink}
                  >
                    <Copy className="h-4 w-4" />
                    Copier le lien
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-full bg-white"
                    onClick={onOpenManualAccessLink}
                  >
                    <ExternalLink className="h-4 w-4" />
                    Ouvrir le lien
                  </Button>
                  {manualAccessMailto && (
                    <Button
                      asChild
                      variant="outline"
                      className="rounded-full bg-white"
                    >
                      <a href={manualAccessMailto}>
                        <Mail className="h-4 w-4" />
                        Ouvrir l’application mail
                      </a>
                    </Button>
                  )}
                </div>
                {manualAccessCopied && (
                  <div className="mt-2 text-sm font-medium">Lien copié.</div>
                )}
              </div>
            )}
          </div>
        )}

        {showCreateForm && (
          <SaasCard className="mt-7 p-6 md:p-8">
            <SectionTitle
              title="Créer une agence"
              description="L’agence est créée en mode démo avec son patron principal en une seule étape."
            />
            <form
              className="mt-7 grid gap-4 md:grid-cols-2"
              onSubmit={onCreateAgency}
            >
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
              <Field
                label="Email de réception des estimations"
                className="md:col-span-2"
              >
                <Input
                  type="email"
                  value={form.estimationEmail}
                  onChange={(event) => {
                    setForm({ ...form, estimationEmail: event.target.value });
                    if (feedback === "Email invalide.") setFeedback("");
                  }}
                  onInvalid={(event) => {
                    event.preventDefault();
                    setManualAccessLink("");
                    setManualAccessMailto("");
                    setFeedback("Email invalide.");
                  }}
                  required
                />
              </Field>
              <div className="md:col-span-2 mt-2 text-xs font-medium uppercase tracking-[0.18em] text-primary/40">
                Patron / gérant principal
              </div>
              <Field label="Prénom du patron">
                <Input
                  value={form.managerFirstName}
                  onChange={(event) =>
                    setForm({ ...form, managerFirstName: event.target.value })
                  }
                  required
                />
              </Field>
              <Field label="Nom du patron">
                <Input
                  value={form.managerLastName}
                  onChange={(event) =>
                    setForm({ ...form, managerLastName: event.target.value })
                  }
                  required
                />
              </Field>
              <Field label="Email du patron" className="md:col-span-2">
                <Input
                  type="email"
                  value={form.managerEmail}
                  onChange={(event) => {
                    setForm({ ...form, managerEmail: event.target.value });
                    if (feedback === "Email invalide.") setFeedback("");
                  }}
                  onInvalid={(event) => {
                    event.preventDefault();
                    setManualAccessLink("");
                    setManualAccessMailto("");
                    setFeedback("Email invalide.");
                  }}
                  required
                />
              </Field>
              <Field label="Téléphone agence">
                <Input
                  value={form.phone}
                  onChange={(event) =>
                    setForm({ ...form, phone: event.target.value })
                  }
                />
              </Field>
              <Field label="Logo URL">
                <Input
                  value={form.logoUrl}
                  onChange={(event) =>
                    setForm({ ...form, logoUrl: event.target.value })
                  }
                />
              </Field>
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
              <div className="md:col-span-2">
                <Button className="rounded-full" size="lg">
                  Créer l’agence
                </Button>
              </div>
            </form>
          </SaasCard>
        )}

        <div className="mt-7 grid gap-4">
          {agencies.length === 0 && (
            <SaasCard className="p-6 text-center md:p-8">
              <h3 className="font-display text-3xl leading-tight">
                Aucune agence créée pour le moment.
              </h3>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-primary/55">
                Créez une agence pour afficher sa fiche, sa démo commerciale et
                son espace agence activé.
              </p>
              <Button
                type="button"
                className="mt-6 rounded-full"
                onClick={() => setShowCreateForm(true)}
              >
                <Plus className="h-4 w-4" />
                Créer une agence
              </Button>
            </SaasCard>
          )}
          {agencies.map((agency) => (
            <AgencyCard
              key={agency.id}
              agency={agency}
              onActivate={() => onActivate(agency)}
              onDisable={() => onDisable(agency)}
              onRemove={() => onRemove(agency)}
            />
          ))}
        </div>
      </section>
    </>
  );
}

async function sendTeamInviteEmail(
  agencyName: string,
  member: TeamMember,
  accessUrl = "",
) {
  try {
    return await sendInviteEmail({
      data: {
        inviteType:
          member.role === "manager" ? "manager_invite" : "agent_invite",
        agencyName,
        recipientEmail: member.email,
        recipientFirstName: member.firstName,
        accessUrl,
      },
    });
  } catch (error) {
    console.info("Invitation non envoyée", error);
    return { sent: false, reason: "SERVER_FUNCTION_FAILED" };
  }
}

function AgencyCard({
  agency,
  onActivate,
  onDisable,
  onRemove,
}: {
  agency: Agency;
  onActivate: () => void;
  onDisable: () => void;
  onRemove: () => void;
}) {
  const managers = getManagers(agency.id);
  const agents = getAgents(agency.id);
  const mainManager =
    managers.find((manager) => manager.status === "active") ??
    managers.find((manager) => manager.status === "invited");
  const links = getAgencyLinks(agency.slug);

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
          <div className="mt-3 grid gap-1 text-sm text-primary/55">
            <p className="break-words">
              Estimations :{" "}
              {agency.estimationEmail || "Email estimation à compléter"}
            </p>
            <p className="break-words">
              Patron principal : {mainManager?.email || "À ajouter"}
            </p>
          </div>
          <div className="mt-3 flex flex-wrap gap-2 text-xs text-primary/50">
            <span>{managers.length} patron(s)</span>
            <span>{agents.length} agent(s)</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" className="rounded-full bg-white">
            <Link to="/admin/agencies/$slug" params={{ slug: agency.slug }}>
              Ouvrir la fiche
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full bg-white">
            <Link to={links.demo}>
              <Eye className="h-4 w-4" />
              Voir la démo
            </Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full bg-white">
            <Link to={links.portal}>
              <ExternalLink className="h-4 w-4" />
              Accéder à l’espace agence
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
          <Button
            type="button"
            variant="outline"
            className="rounded-full bg-white text-red-700 hover:text-red-700"
            onClick={onRemove}
          >
            <Trash2 className="h-4 w-4" />
            Retirer l’agence
          </Button>
        </div>
      </div>
    </SaasCard>
  );
}
