import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Copy,
  Mail,
  Power,
  PowerOff,
  RotateCcw,
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
import {
  activateAgency,
  buildManagerActivationEmail,
  deactivateAgency,
  disableAgency,
  getAbsoluteAgencyLinks,
  getAgents,
  getAgencyBySlug,
  getManagers,
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

const adminSessionKey = "signature_admin_access";

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
    window.sessionStorage.removeItem(adminSessionKey);
    navigate({ to: "/admin", replace: true });
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
    const managers = getManagers(agency.id);
    if (!managers.length) {
      setFeedback("Ajoutez au moins un gérant avant d’activer cette agence.");
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
          console.info("Agence activée. Email non envoyé.", error);
          return { sent: false, reason: "SERVER_FUNCTION_FAILED" };
        }
      }),
    );

    const sentCount = results.filter((result) => result.sent).length;
    setFeedback(
      sentCount
        ? `Agence activée. ${sentCount} email(s) envoyé(s) aux gérants.`
        : "Agence activée. Email non envoyé : configuration email manquante.",
    );
  }

  function onDeactivate() {
    if (!agency) return;
    const updated = deactivateAgency(agency.id);
    setAgency(updated);
    setFeedback("Agence repassée en version démo.");
  }

  function onDisable() {
    if (!agency) return;
    const updated = disableAgency(agency.id);
    setAgency(updated);
    setFeedback("Agence désactivée.");
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
            <Button asChild className="mt-6 rounded-full">
              <Link to="/admin">Retour à l’admin</Link>
            </Button>
          </SaasCard>
        </section>
      </SaasShell>
    );
  }

  const links = getAbsoluteAgencyLinks(agency.slug);
  const managers = getManagers(agency.id);
  const agents = getAgents(agency.id);

  return (
    <SaasShell action={<AdminLogoutButton onClick={onLogout} />}>
      <SaasHero
        eyebrow="Contrôle agence"
        title={agency.name}
        description="Activez le portail, gérez les accès équipe et copiez les liens utiles pour la démo et l’espace agence."
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
            <div className="mt-6 grid gap-3 text-sm text-primary/60">
              <InfoRow
                label="Email estimation"
                value={agency.estimationEmail}
              />
              <InfoRow label="Gérants" value={`${managers.length}`} />
              <InfoRow label="Agents" value={`${agents.length}`} />
              <InfoRow
                label="Activée le"
                value={
                  agency.activatedAt
                    ? formatDate(agency.activatedAt)
                    : "Non activée"
                }
              />
            </div>
            <div className="mt-7 flex flex-wrap gap-2">
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
                onClick={onDeactivate}
              >
                <RotateCcw className="h-4 w-4" />
                Repasser en démo
              </Button>
              <Button
                type="button"
                variant="outline"
                className="rounded-full bg-white text-red-700 hover:text-red-700"
                onClick={onDisable}
              >
                <PowerOff className="h-4 w-4" />
                Désactiver
              </Button>
            </div>
          </SaasCard>

          <SaasCard className="p-6 md:p-8">
            <SectionTitle
              title="Liens"
              description="Un lien de démo avant signature, puis un lien unique d’espace agence après activation."
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
                title="Email gérant"
                description="Si l’envoi automatique n’est pas configuré, vous pouvez ouvrir l’email manuellement."
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
