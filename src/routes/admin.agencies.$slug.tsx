import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Copy,
  Eye,
  ExternalLink,
  Mail,
  Power,
  PowerOff,
  Trash2,
} from "lucide-react";
import { FormEvent, useEffect, useState } from "react";

import { AgencyTeamManager } from "@/components/agency-team-manager";
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
import { sendManagerAccessEmail } from "@/lib/api/agency-email.functions";
import { clearAdminSession } from "@/lib/admin-session";
import {
  activateAgency,
  buildManagerActivationEmail,
  disableAgency,
  getAbsoluteAgencyLinks,
  getActiveManagers,
  getAgents,
  getAgencyLinks,
  getAgencyBySlug,
  getManagers,
  removeAgency,
  updateAgency,
  type Agency,
  type EmailContent,
} from "@/lib/agency-saas";

export const Route = createFileRoute("/admin/agencies/$slug")({
  head: () => ({
    meta: [{ title: "Agence - Admin Signature Immobilier" }],
  }),
  component: AdminAgencyRoute,
});

const adminFlashKey = "signature_admin_flash";

function AdminAgencyRoute() {
  const { slug } = Route.useParams();
  const navigate = useNavigate();
  const [agency, setAgency] = useState<Agency | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [emailPreviews, setEmailPreviews] = useState<EmailContent[]>([]);
  const [form, setForm] = useState({
    name: "",
    city: "",
    estimationEmail: "",
    logoUrl: "",
    phone: "",
    primaryColor: "#111111",
  });

  useEffect(() => {
    loadAgency();
  }, [slug]);

  function loadAgency() {
    const nextAgency = getAgencyBySlug(slug);
    setAgency(nextAgency);
    if (nextAgency) {
      setForm({
        name: nextAgency.name,
        city: nextAgency.city,
        estimationEmail: nextAgency.estimationEmail,
        logoUrl: nextAgency.logoUrl,
        phone: nextAgency.phone,
        primaryColor: nextAgency.primaryColor,
      });
    }
    setLoaded(true);
  }

  function onLogout() {
    clearAdminSession();
    window.location.assign("/admin");
  }

  function onSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!agency) return;
    const updated = updateAgency(agency.id, form);
    setAgency(updated);
    setFeedback("Informations enregistrées.");
  }

  async function onActivate() {
    if (!agency) return;
    setEmailPreviews([]);
    const managers = getActiveManagers(agency.id);
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

    const updated = activateAgency(agency.id);
    if (!updated) return;

    const emails = managers.map((manager) =>
      buildManagerActivationEmail(updated, manager),
    );
    setAgency(updated);
    setEmailPreviews(emails);

    const results = await Promise.all(
      emails.map(async (email) => {
        try {
          return await sendManagerAccessEmail({
            data: {
              to: email.to,
              subject: email.subject,
              body: email.body,
            },
          });
        } catch (error) {
          console.info("Email non envoyé : RESEND_API_KEY manquante", error);
          return { sent: false, reason: "SERVER_FUNCTION_FAILED" };
        }
      }),
    );

    const sentCount = results.filter((result) => result.sent).length;
    setFeedback(
      sentCount
        ? "Agence activée. Email envoyé au(x) patron(s)."
        : "Agence activée. Email non envoyé : configuration email manquante.",
    );
  }

  function onDisable() {
    if (!agency) return;
    const updated = disableAgency(agency.id);
    setAgency(updated);
    setFeedback("Agence désactivée.");
  }

  function onRemove() {
    if (!agency) return;
    if (
      !window.confirm(
        "Retirer cette agence ? Cette action supprimera l’agence de votre espace admin.",
      )
    ) {
      return;
    }
    removeAgency(agency.id);
    window.sessionStorage.setItem(adminFlashKey, "Agence retirée.");
    navigate({ to: "/admin", replace: true });
  }

  async function copy(value: string, label: string) {
    await navigator.clipboard?.writeText(value);
    setFeedback(`${label} copié.`);
  }

  if (!loaded) return null;

  if (!agency) {
    return (
      <SaasShell action={<AdminLogoutButton onClick={onLogout} />}>
        <section className="mx-auto max-w-3xl px-5 py-16 text-center md:px-8">
          <SaasCard className="p-8 md:p-12">
            <h1 className="font-display text-4xl">Agence introuvable</h1>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-primary/55">
              Cette agence n’existe pas ou a été retirée.
            </p>
            <Button asChild className="mt-6 rounded-full">
              <Link to="/admin">Retour à l’admin</Link>
            </Button>
          </SaasCard>
        </section>
      </SaasShell>
    );
  }

  const links = getAbsoluteAgencyLinks(agency.slug);
  const routeLinks = getAgencyLinks(agency.slug);
  const managers = getManagers(agency.id);
  const agents = getAgents(agency.id);
  const statusMessage = getAgencyStatusMessage(agency.status);

  return (
    <SaasShell action={<AdminLogoutButton onClick={onLogout} />}>
      <SaasHero
        eyebrow="Contrôle agence"
        title={agency.name}
        description="Fiche centrale de l’agence : démo commerciale, vrai espace agence, statut, équipe et liens utiles."
        action={
          <Button asChild variant="outline" className="rounded-full bg-white">
            <Link to="/admin">
              <ArrowLeft className="h-4 w-4" />
              Retour aux agences
            </Link>
          </Button>
        }
      />

      <section className="mx-auto grid max-w-7xl gap-7 px-5 pb-16 md:px-8 lg:grid-cols-[0.82fr_1.18fr]">
        <div className="space-y-7">
          <SaasCard className="p-6 md:p-8">
            <div className="flex flex-wrap items-center gap-3">
              <StatusBadge status={agency.status} />
              <span className="text-sm text-primary/45">{agency.city}</span>
            </div>
            {agency.logoUrl && (
              <img
                src={agency.logoUrl}
                alt={`Logo ${agency.name}`}
                className="mt-6 max-h-16 max-w-full object-contain"
              />
            )}
            <div className="mt-6 grid gap-3 text-sm text-primary/60">
              <InfoRow label="Nom" value={agency.name} />
              <InfoRow label="Ville" value={agency.city} />
              <InfoRow label="Téléphone" value={agency.phone} />
              <InfoRow label="Couleur" value={agency.primaryColor} />
              <InfoRow
                label="Email estimation"
                value={agency.estimationEmail}
              />
              <InfoRow label="Patrons / Gérants" value={`${managers.length}`} />
              <InfoRow label="Agents" value={`${agents.length}`} />
              <InfoRow label="Créée le" value={formatDate(agency.createdAt)} />
              <InfoRow
                label="Activée le"
                value={
                  agency.activatedAt
                    ? formatDate(agency.activatedAt)
                    : "Non activée"
                }
              />
            </div>

            <div className="mt-7 rounded-[22px] border border-[#e8e0d5] bg-[#fffdf9] p-5 text-sm leading-relaxed text-primary/65">
              {statusMessage}
            </div>

            <div className="mt-5 grid gap-3">
              <div className="rounded-2xl bg-[#faf7f0] p-4 text-sm leading-relaxed text-primary/60">
                <span className="font-medium text-primary">Démo :</span>{" "}
                utilisée en rendez-vous pour présenter le portail.
              </div>
              <div className="rounded-2xl bg-[#faf7f0] p-4 text-sm leading-relaxed text-primary/60">
                <span className="font-medium text-primary">
                  Espace agence :
                </span>{" "}
                utilisé après activation par le patron et les agents.
              </div>
            </div>

            <div className="mt-7 flex flex-wrap gap-2">
              <Button
                asChild
                variant="outline"
                className="rounded-full bg-white"
              >
                <Link to={routeLinks.demo}>
                  <Eye className="h-4 w-4" />
                  Voir la démo
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="rounded-full bg-white"
              >
                <Link to={routeLinks.portal}>
                  <ExternalLink className="h-4 w-4" />
                  Accéder à l’espace agence
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                type="button"
                className="rounded-full"
                onClick={onActivate}
              >
                <Power className="h-4 w-4" />
                Activer l’agence
              </Button>
              <Button
                type="button"
                variant="outline"
                className="rounded-full bg-white"
                onClick={onDisable}
              >
                <PowerOff className="h-4 w-4" />
                Désactiver l’agence
              </Button>
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
          </SaasCard>

          <SaasCard className="p-6 md:p-8">
            <SectionTitle
              title="Liens utiles"
              description="Deux chemins séparés pour ne jamais mélanger la démo commerciale et le portail activé."
            />
            <div className="mt-6 space-y-3">
              <CopyRow
                label="Lien démo"
                value={links.demo}
                onCopy={() => copy(links.demo, "Lien démo")}
              />
              <CopyRow
                label="Lien espace agence"
                value={links.portal}
                onCopy={() => copy(links.portal, "Lien agence")}
              />
            </div>
          </SaasCard>

          <SaasCard className="p-6 md:p-8">
            <SectionTitle
              title="Modifier les informations"
              description="Ces informations alimentent le portail agence et les emails."
            />
            <form className="mt-7 grid gap-4" onSubmit={onSave}>
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
              <Field label="Logo URL">
                <Input
                  value={form.logoUrl}
                  onChange={(event) =>
                    setForm({ ...form, logoUrl: event.target.value })
                  }
                />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Téléphone">
                  <Input
                    value={form.phone}
                    onChange={(event) =>
                      setForm({ ...form, phone: event.target.value })
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
              </div>
              <Button className="rounded-full" size="lg">
                Enregistrer
              </Button>
            </form>
          </SaasCard>
        </div>

        <div className="space-y-7">
          {feedback && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
              {feedback}
            </div>
          )}

          {emailPreviews.length > 0 && (
            <SaasCard className="p-6 md:p-8">
              <SectionTitle
                title="Email patron"
                description="Si l’envoi automatique n’est pas configuré, copiez le lien d’accès ou ouvrez l’email manuellement."
              />
              <div className="mt-6 space-y-4">
                {emailPreviews.map((email) => (
                  <div
                    key={`${email.to.join(",")}-${email.subject}`}
                    className="rounded-[22px] border border-[#e8e0d5] bg-[#fffdf9] p-5"
                  >
                    <div className="text-sm font-medium">
                      {email.to.join(", ")}
                    </div>
                    {email.accessUrl && (
                      <div className="mt-3 break-all rounded-2xl bg-white p-3 text-xs text-primary/60">
                        Lien d’accès : {email.accessUrl}
                      </div>
                    )}
                    <pre className="mt-4 max-h-60 overflow-auto whitespace-pre-wrap rounded-2xl bg-white p-4 text-xs leading-relaxed text-primary/65">
                      {email.body}
                    </pre>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button asChild className="rounded-full">
                        <a
                          href={email.gmailHref}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <Mail className="h-4 w-4" />
                          Ouvrir dans Gmail
                        </a>
                      </Button>
                      <Button
                        asChild
                        variant="outline"
                        className="rounded-full bg-white"
                      >
                        <a href={email.mailtoHref}>Ouvrir l’application mail</a>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </SaasCard>
          )}

          <SaasCard className="p-6 md:p-8">
            <AgencyTeamManager agencyId={agency.id} onChange={loadAgency} />
          </SaasCard>
        </div>
      </section>
    </SaasShell>
  );
}

function CopyRow({
  label,
  value,
  onCopy,
}: {
  label: string;
  value: string;
  onCopy: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-[#e8e0d5] bg-[#fffdf9] p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <div className="text-xs font-medium uppercase tracking-[0.18em] text-primary/40">
          {label}
        </div>
        <div className="mt-1 break-all text-sm text-primary/65">{value}</div>
      </div>
      <Button
        type="button"
        variant="outline"
        className="rounded-full bg-white"
        onClick={onCopy}
      >
        <Copy className="h-4 w-4" />
        Copier
      </Button>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-[#eee6db] pb-3 last:border-b-0 last:pb-0">
      <span>{label}</span>
      <span className="text-right font-medium text-primary">
        {value || "À compléter"}
      </span>
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function getAgencyStatusMessage(status: Agency["status"]) {
  if (status === "active") {
    return "Cette agence est activée. Les fonctions sont débloquées et les estimations partent à l’email configuré.";
  }

  if (status === "disabled") {
    return "Cette agence est désactivée. Le portail est bloqué.";
  }

  return "Cette agence est en démo. Elle peut voir le portail, mais les fonctions réelles sont verrouillées.";
}
