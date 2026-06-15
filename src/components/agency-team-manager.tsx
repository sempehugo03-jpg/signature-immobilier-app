import {
  Copy,
  ExternalLink,
  Link2,
  Mail,
  RotateCcw,
  Trash2,
  UserRoundPlus,
  UserX,
} from "lucide-react";
import { FormEvent, useEffect, useState } from "react";

import { Field, SectionTitle, StatusBadge } from "@/components/agency-saas-ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { sendInviteEmail } from "@/lib/api/agency-email.functions";
import {
  addTeamMember,
  deleteTeamMember,
  disableTeamMember,
  enableTeamMember,
  getAgents,
  getAgencyById,
  getManagers,
  type TeamMember,
  type TeamRole,
} from "@/lib/agency-saas";
import { isValidEmail } from "@/lib/email-utils";
import {
  buildGmailComposeUrl,
  buildMailtoUrl,
  buildManagerInviteEmailContent,
  openGmailCompose,
  openMailApp,
} from "@/lib/invite-email";
import {
  createSharedTeamMemberInviteEmail,
  getInviteCreationErrorMessage,
  getSharedInviteStorageWarning,
  logInviteCreationFailure,
  type SharedInviteEmailResult,
} from "@/lib/shared-invites";

type MemberFormData = Pick<
  TeamMember,
  "firstName" | "lastName" | "email" | "phone"
>;

type SendInviteResult = {
  sent: boolean;
  reason?: string | null;
};

type PreparedInvite = SharedInviteEmailResult;

type InvitePreparationResult = { ok: true } | { ok: false; message: string };

const INVITE_EMAIL_TIMEOUT_MS = 8000;
const MANAGER_INVITE_READY_FEEDBACK =
  "Invitation prête. Le lien peut être envoyé au patron.";

export function AgencyTeamManager({
  agencyId,
  title = "Équipe",
  description = "Ajoutez, supprimez, désactivez ou réactivez les patrons et agents rattachés à l’agence.",
  onChange,
}: {
  agencyId: string;
  title?: string;
  description?: string;
  onChange?: () => void;
}) {
  const [managers, setManagers] = useState<TeamMember[]>([]);
  const [agents, setAgents] = useState<TeamMember[]>([]);
  const [feedback, setFeedback] = useState("");
  const [manualInviteLink, setManualInviteLink] = useState("");
  const [manualInviteGmail, setManualInviteGmail] = useState("");
  const [manualInviteMailto, setManualInviteMailto] = useState("");
  const [manualInviteCopied, setManualInviteCopied] = useState(false);

  useEffect(() => {
    refresh();
  }, [agencyId]);

  function clearManualInviteState() {
    setManualInviteLink("");
    setManualInviteGmail("");
    setManualInviteMailto("");
    setManualInviteCopied(false);
  }

  function refresh() {
    setManagers(getManagers(agencyId));
    setAgents(getAgents(agencyId));
    onChange?.();
  }

  async function onAdd(role: TeamRole, data: MemberFormData) {
    const agency = getAgencyById(agencyId);
    if (!agency) {
      const message =
        "Impossible de créer le lien d’invitation : agence introuvable.";
      clearManualInviteState();
      setFeedback(message);
      throw new MemberInviteUiError(message);
    }
    if (!isValidEmail(data.email)) {
      clearManualInviteState();
      setFeedback("Email invalide.");
      throw new MemberInviteUiError("Email invalide.");
    }

    let member: TeamMember;
    try {
      member = addTeamMember(agencyId, {
        ...data,
        role,
        status: "invited",
      });
      logInviteDebug("member_created", {
        memberId: member.id,
        role: member.role,
        status: member.status,
      });
    } catch (error) {
      console.info("Membre non créé", error);
      clearManualInviteState();
      setFeedback(
        role === "manager"
          ? "Impossible d’ajouter ce patron. Vérifiez les informations puis réessayez."
          : "Impossible d’ajouter cet agent. Vérifiez les informations puis réessayez.",
      );
      throw error;
    }

    const inviteReady = await sendInvitation(
      member,
      role === "manager" ? "Patron ajouté" : "Agent ajouté",
    );

    if (!inviteReady.ok) {
      deleteTeamMember(member.id);
      refresh();
      setFeedback(
        role === "manager"
          ? `Patron non ajouté. ${inviteReady.message}`
          : `Agent non ajouté. ${inviteReady.message}`,
      );
      throw new MemberInviteUiError(inviteReady.message);
    }

    try {
      refresh();
    } catch (error) {
      console.info("Liste équipe non rafraîchie automatiquement", error);
    }
  }

  async function onResend(member: TeamMember) {
    const result = await sendInvitation(member, "Invitation renvoyée");
    if (result.ok) refresh();
  }

  async function onGenerateInviteLink(member: TeamMember) {
    const result = await sendInvitation(member, "Invitation prête");
    if (result.ok) refresh();
  }

  async function sendInvitation(
    member: TeamMember,
    successPrefix: string,
  ): Promise<InvitePreparationResult> {
    const agency = getAgencyById(agencyId);
    if (!agency) {
      const message =
        "Impossible de créer le lien d’invitation : agence introuvable.";
      clearManualInviteState();
      setFeedback(message);
      return { ok: false, message };
    }

    let email: PreparedInvite;
    try {
      email = await createSharedTeamMemberInviteEmail(agency, member);
    } catch (error) {
      logInviteCreationFailure(error);
      const message = getInviteCreationErrorMessage(error);
      clearManualInviteState();
      setFeedback(message);
      return { ok: false, message };
    }

    const inviteUrl = email.email.accessUrl ?? "";
    const storageWarning = getSharedInviteStorageWarning(email.persistedIn);
    if (!inviteUrl) {
      const message =
        "Impossible de créer le lien d’invitation. Consultez la console pour le détail.";
      clearManualInviteState();
      setFeedback(message);
      logInviteDebug("invite_url_missing", {
        memberId: member.id,
        role: member.role,
      });
      return { ok: false, message };
    }

    setManualInviteLink(inviteUrl);
    setManualInviteGmail("");
    setManualInviteMailto("");
    setManualInviteCopied(false);
    logInviteDebug("invite_created", {
      memberId: member.id,
      role: member.role,
      tokenCreated: true,
      token: getTokenFromInviteUrl(inviteUrl),
      inviteUrl,
    });

    if (member.role === "manager") {
      const emailContent = buildManagerInviteEmailContent({
        firstName: member.firstName,
        agencyName: agency.name,
        inviteUrl,
      });
      setManualInviteGmail(
        buildGmailComposeUrl({
          to: member.email,
          ...emailContent,
        }),
      );
      setManualInviteMailto(
        buildMailtoUrl({
          to: member.email,
          ...emailContent,
        }),
      );
      setFeedback(`${MANAGER_INVITE_READY_FEEDBACK}${storageWarning}`);
      logInviteDebug("invite_email_result", {
        memberId: member.id,
        role: member.role,
        emailSent: false,
        reason: "manual_send_choice_ready",
        inviteUrl,
      });
      return { ok: true };
    }

    const result = await deliverInviteEmail({
      accessUrl: inviteUrl,
      agencyName: agency.name,
      member,
    });

    logInviteDebug("invite_email_result", {
      memberId: member.id,
      role: member.role,
      emailSent: result.sent,
      reason: result.reason ?? null,
      inviteUrl,
    });

    if (result.sent) {
      setManualInviteGmail("");
      setManualInviteMailto("");
      setManualInviteCopied(false);
      setFeedback(
        `${successPrefix}. Email d’invitation envoyé.${storageWarning}`,
      );
      return { ok: true };
    }

    setManualInviteGmail("");
    setManualInviteMailto(email.email.mailtoHref);
    setManualInviteCopied(false);
    setFeedback(`${getInviteFallbackFeedback(successPrefix)}${storageWarning}`);
    return { ok: true };
  }

  async function onCopyManualInviteLink() {
    if (!manualInviteLink) return;
    await navigator.clipboard?.writeText(manualInviteLink);
    setManualInviteCopied(true);
  }

  function onOpenManualInviteLink() {
    if (!manualInviteLink) return;
    const opened = window.open(
      manualInviteLink,
      "_blank",
      "noopener,noreferrer",
    );
    if (opened) opened.opener = null;
  }

  function onOpenManualInviteGmail() {
    if (!manualInviteGmail) return;
    openGmailCompose(manualInviteGmail);
  }

  function onOpenManualInviteMailApp() {
    if (!manualInviteMailto) return;
    openMailApp(manualInviteMailto);
  }

  function onDelete(member: TeamMember) {
    const isManager = member.role === "manager";
    const message = isManager
      ? "Supprimer ce patron ?"
      : "Supprimer cet agent ?";
    if (!window.confirm(message)) return;
    deleteTeamMember(member.id);
    setManualInviteLink("");
    setManualInviteGmail("");
    setManualInviteMailto("");
    setManualInviteCopied(false);
    setFeedback(isManager ? "Patron supprimé." : "Agent supprimé.");
    refresh();
  }

  function onDisable(member: TeamMember) {
    disableTeamMember(member.id);
    setManualInviteLink("");
    setManualInviteGmail("");
    setManualInviteMailto("");
    setManualInviteCopied(false);
    setFeedback(
      member.role === "manager" ? "Patron désactivé." : "Agent désactivé.",
    );
    refresh();
  }

  function onEnable(member: TeamMember) {
    enableTeamMember(member.id);
    setManualInviteLink("");
    setManualInviteGmail("");
    setManualInviteMailto("");
    setManualInviteCopied(false);
    setFeedback(
      member.role === "manager" ? "Patron réactivé." : "Agent réactivé.",
    );
    refresh();
  }

  return (
    <div>
      <SectionTitle title={title} description={description} />
      {feedback && (
        <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          {feedback}
          {manualInviteLink && (
            <div className="mt-3 rounded-2xl border border-emerald-100 bg-white/70 p-3">
              <div className="break-all font-medium">
                Lien d’invitation : {manualInviteLink}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full bg-white"
                  onClick={onCopyManualInviteLink}
                >
                  <Copy className="h-4 w-4" />
                  Copier le lien
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full bg-white"
                  onClick={onOpenManualInviteLink}
                >
                  <ExternalLink className="h-4 w-4" />
                  Ouvrir le lien
                </Button>
                {manualInviteGmail && (
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-full bg-white"
                    onClick={onOpenManualInviteGmail}
                  >
                    <Mail className="h-4 w-4" />
                    Ouvrir dans Gmail
                  </Button>
                )}
                {manualInviteMailto && (
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-full bg-white"
                    onClick={onOpenManualInviteMailApp}
                  >
                    <Mail className="h-4 w-4" />
                    Ouvrir l’application mail
                  </Button>
                )}
              </div>
              {manualInviteCopied && (
                <div className="mt-2 text-sm font-medium">Lien copié.</div>
              )}
            </div>
          )}
        </div>
      )}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <TeamColumn
          title="Patrons / Gérants"
          empty="Aucun patron ajouté pour le moment."
          members={managers}
          role="manager"
          onAdd={onAdd}
          onDelete={onDelete}
          onDisable={onDisable}
          onEnable={onEnable}
          onResend={onResend}
          onGenerateInviteLink={onGenerateInviteLink}
        />
        <TeamColumn
          title="Agents"
          empty="Aucun agent ajouté pour le moment."
          members={agents}
          role="agent"
          onAdd={onAdd}
          onDelete={onDelete}
          onDisable={onDisable}
          onEnable={onEnable}
          onResend={onResend}
          onGenerateInviteLink={onGenerateInviteLink}
        />
      </div>
    </div>
  );
}

async function deliverInviteEmail({
  accessUrl,
  agencyName,
  member,
}: {
  accessUrl: string;
  agencyName: string;
  member: TeamMember;
}): Promise<SendInviteResult> {
  try {
    const result = await withTimeout(
      sendInviteEmail({
        data: {
          inviteType:
            member.role === "manager" ? "manager_invite" : "agent_invite",
          agencyName,
          recipientEmail: member.email,
          recipientFirstName: member.firstName,
          accessUrl,
        },
      }),
      INVITE_EMAIL_TIMEOUT_MS,
    );

    if (!result || typeof result.sent !== "boolean") {
      console.info("Invitation non envoyée : réponse email inattendue");
      return { sent: false, reason: "EMAIL_RESULT_INVALID" };
    }

    return {
      sent: result.sent,
      reason: result.reason ?? null,
    };
  } catch (error) {
    console.info("Invitation non envoyée", error);
    return { sent: false, reason: "SERVER_FUNCTION_FAILED" };
  }
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeoutId = globalThis.setTimeout(() => {
      reject(new Error("INVITE_EMAIL_TIMEOUT"));
    }, timeoutMs);

    promise.then(resolve, reject).finally(() => {
      globalThis.clearTimeout(timeoutId);
    });
  });
}

function getInviteFallbackFeedback(successPrefix: string) {
  return `${successPrefix}. Email non envoyé : configuration email manquante. Vous pouvez copier le lien ou ouvrir l’application mail.`;
}

function getTokenFromInviteUrl(inviteUrl: string) {
  const parts = inviteUrl.split("/").filter(Boolean);
  return parts[parts.length - 1] ?? "";
}

function logInviteDebug(event: string, details: Record<string, unknown>) {
  if (!import.meta.env.DEV) return;
  console.log(`[manager-invite] ${event}`, details);
}

function TeamColumn({
  title,
  empty,
  members,
  role,
  onAdd,
  onDelete,
  onDisable,
  onEnable,
  onResend,
  onGenerateInviteLink,
}: {
  title: string;
  empty: string;
  members: TeamMember[];
  role: TeamRole;
  onAdd: (role: TeamRole, data: MemberFormData) => Promise<void>;
  onDelete: (member: TeamMember) => void;
  onDisable: (member: TeamMember) => void;
  onEnable: (member: TeamMember) => void;
  onResend: (member: TeamMember) => void;
  onGenerateInviteLink: (member: TeamMember) => void;
}) {
  const noun = role === "manager" ? "patron" : "agent";

  return (
    <div className="rounded-[22px] border border-[#e8e0d5] bg-[#fffdf9] p-5">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-white text-primary shadow-sm">
          <UserRoundPlus className="h-4 w-4" />
        </span>
        <h3 className="font-display text-2xl">{title}</h3>
      </div>
      <AddMemberForm role={role} onAdd={onAdd} />
      <div className="mt-5 space-y-3">
        {members.length === 0 && (
          <p className="rounded-2xl border border-dashed border-[#d8cfc2] p-4 text-sm text-primary/45">
            {empty}
          </p>
        )}
        {members.map((member) => (
          <div
            key={member.id}
            className="rounded-2xl border border-[#e8e0d5] bg-white p-4"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="font-medium">
                  {member.firstName} {member.lastName}
                </div>
                <div className="break-words text-sm text-primary/55">
                  {member.email}
                </div>
                {member.phone && (
                  <div className="mt-1 text-sm text-primary/45">
                    {member.phone}
                  </div>
                )}
              </div>
              <StatusBadge status={getMemberStatusLabel(member.status)} />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {member.status === "disabled" ? (
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full bg-white"
                  onClick={() => onEnable(member)}
                >
                  <RotateCcw className="h-4 w-4" />
                  Réactiver
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full bg-white"
                  onClick={() => onDisable(member)}
                >
                  <UserX className="h-4 w-4" />
                  Désactiver
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                className="rounded-full bg-white"
                disabled={member.status === "disabled"}
                onClick={() => onResend(member)}
              >
                <Mail className="h-4 w-4" />
                Renvoyer l’invitation
              </Button>
              {member.status === "invited" && (
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full bg-white"
                  onClick={() => onGenerateInviteLink(member)}
                >
                  <Link2 className="h-4 w-4" />
                  Générer un lien d’invitation
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                className="rounded-full bg-white text-red-700 hover:text-red-700"
                onClick={() => onDelete(member)}
              >
                <Trash2 className="h-4 w-4" />
                Supprimer {noun}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AddMemberForm({
  role,
  onAdd,
}: {
  role: TeamRole;
  onAdd: (role: TeamRole, data: MemberFormData) => Promise<void>;
}) {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isValidEmail(form.email)) {
      setError("Email invalide.");
      return;
    }

    setSubmitting(true);
    try {
      await onAdd(role, form);
      setForm({ firstName: "", lastName: "", email: "", phone: "" });
      setError("");
    } catch (error) {
      console.info("Ajout du membre non finalisé", error);
      setError(getMemberInviteErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="mt-5 grid gap-3 sm:grid-cols-2" onSubmit={onSubmit}>
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
      <Field label="Email" className="sm:col-span-2">
        <Input
          type="email"
          value={form.email}
          onChange={(event) => {
            setForm({ ...form, email: event.target.value });
            setError("");
          }}
          onInvalid={(event) => {
            event.preventDefault();
            setError("Email invalide.");
          }}
          required
        />
      </Field>
      {error && <p className="sm:col-span-2 text-sm text-red-600">{error}</p>}
      <Field label="Téléphone optionnel" className="sm:col-span-2">
        <Input
          type="tel"
          value={form.phone}
          onChange={(event) => setForm({ ...form, phone: event.target.value })}
        />
      </Field>
      <div className="sm:col-span-2">
        <Button className="w-full rounded-full" size="lg" disabled={submitting}>
          {submitting
            ? "Préparation..."
            : `Ajouter ${role === "manager" ? "un patron" : "un agent"}`}
        </Button>
      </div>
    </form>
  );
}

function getMemberStatusLabel(status: TeamMember["status"]) {
  if (status === "active") return "actif";
  if (status === "invited") return "invité";
  return "désactivé";
}

class MemberInviteUiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MemberInviteUiError";
  }
}

function getMemberInviteErrorMessage(error: unknown) {
  if (error instanceof MemberInviteUiError && error.message) {
    return error.message;
  }

  return "Impossible de créer le lien d’invitation. Consultez la console pour le détail.";
}
