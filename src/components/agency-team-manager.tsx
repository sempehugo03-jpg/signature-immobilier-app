import { RotateCcw, Trash2, UserRoundPlus, UserX } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";

import { Field, SectionTitle, StatusBadge } from "@/components/agency-saas-ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  addTeamMember,
  deleteTeamMember,
  disableTeamMember,
  enableTeamMember,
  getAgents,
  getManagers,
  type TeamMember,
  type TeamRole,
} from "@/lib/agency-saas";
import { isValidEmail } from "@/lib/email-utils";

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

  useEffect(() => {
    refresh();
  }, [agencyId]);

  function refresh() {
    setManagers(getManagers(agencyId));
    setAgents(getAgents(agencyId));
    onChange?.();
  }

  function onAdd(
    role: TeamRole,
    data: Pick<TeamMember, "firstName" | "lastName" | "email" | "phone">,
  ) {
    addTeamMember(agencyId, { ...data, role, status: "active" });
    setFeedback(role === "manager" ? "Patron ajouté." : "Agent ajouté.");
    refresh();
  }

  function onDelete(member: TeamMember) {
    const isManager = member.role === "manager";
    const message = isManager
      ? "Supprimer ce patron ?"
      : "Supprimer cet agent ?";
    if (!window.confirm(message)) return;
    deleteTeamMember(member.id);
    setFeedback(isManager ? "Patron supprimé." : "Agent supprimé.");
    refresh();
  }

  function onDisable(member: TeamMember) {
    disableTeamMember(member.id);
    setFeedback(
      member.role === "manager" ? "Patron désactivé." : "Agent désactivé.",
    );
    refresh();
  }

  function onEnable(member: TeamMember) {
    enableTeamMember(member.id);
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
        />
      </div>
    </div>
  );
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
}: {
  title: string;
  empty: string;
  members: TeamMember[];
  role: TeamRole;
  onAdd: (
    role: TeamRole,
    data: Pick<TeamMember, "firstName" | "lastName" | "email" | "phone">,
  ) => void;
  onDelete: (member: TeamMember) => void;
  onDisable: (member: TeamMember) => void;
  onEnable: (member: TeamMember) => void;
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
              <StatusBadge
                status={member.status === "active" ? "actif" : "désactivé"}
              />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {member.status === "active" ? (
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full bg-white"
                  onClick={() => onDisable(member)}
                >
                  <UserX className="h-4 w-4" />
                  Désactiver
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full bg-white"
                  onClick={() => onEnable(member)}
                >
                  <RotateCcw className="h-4 w-4" />
                  Réactiver
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
  onAdd: (
    role: TeamRole,
    data: Pick<TeamMember, "firstName" | "lastName" | "email" | "phone">,
  ) => void;
}) {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });
  const [error, setError] = useState("");

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isValidEmail(form.email)) {
      setError("Email invalide.");
      return;
    }

    onAdd(role, form);
    setForm({ firstName: "", lastName: "", email: "", phone: "" });
    setError("");
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
        <Button className="w-full rounded-full" size="lg">
          Ajouter {role === "manager" ? "un patron" : "un agent"}
        </Button>
      </div>
    </form>
  );
}
