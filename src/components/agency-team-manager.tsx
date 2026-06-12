import { Trash2, UserRoundPlus } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";

import { Field, SectionTitle } from "@/components/agency-saas-ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  addTeamMember,
  deleteTeamMember,
  getAgents,
  getManagers,
  type TeamMember,
  type TeamRole,
} from "@/lib/agency-saas";

export function AgencyTeamManager({
  agencyId,
  title = "Équipe",
  description = "Ajoutez ou supprimez les gérants et agents rattachés à l’agence.",
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
    data: Omit<TeamMember, "id" | "agencyId" | "createdAt">,
  ) {
    addTeamMember(agencyId, data);
    setFeedback(role === "manager" ? "Gérant ajouté." : "Agent ajouté.");
    refresh();
  }

  function onDelete(member: TeamMember) {
    const label =
      `${member.firstName} ${member.lastName}`.trim() || member.email;
    if (!window.confirm(`Supprimer ${label} de l’équipe ?`)) return;
    deleteTeamMember(member.id);
    setFeedback("Membre supprimé.");
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
          title="Gérants"
          empty="Aucun gérant ajouté pour le moment."
          members={managers}
          role="manager"
          onAdd={onAdd}
          onDelete={onDelete}
        />
        <TeamColumn
          title="Agents"
          empty="Aucun agent ajouté pour le moment."
          members={agents}
          role="agent"
          onAdd={onAdd}
          onDelete={onDelete}
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
}: {
  title: string;
  empty: string;
  members: TeamMember[];
  role: TeamRole;
  onAdd: (
    role: TeamRole,
    data: Omit<TeamMember, "id" | "agencyId" | "createdAt">,
  ) => void;
  onDelete: (member: TeamMember) => void;
}) {
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
            className="flex flex-col gap-3 rounded-2xl border border-[#e8e0d5] bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <div className="font-medium">
                {member.firstName} {member.lastName}
              </div>
              <div className="break-words text-sm text-primary/55">
                {member.email}
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              className="rounded-full bg-white text-red-700 hover:text-red-700"
              onClick={() => onDelete(member)}
            >
              <Trash2 className="h-4 w-4" />
              Supprimer
            </Button>
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
    data: Omit<TeamMember, "id" | "agencyId" | "createdAt">,
  ) => void;
}) {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onAdd(role, {
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      role,
    });
    setForm({ firstName: "", lastName: "", email: "" });
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
          onChange={(event) => setForm({ ...form, email: event.target.value })}
          required
        />
      </Field>
      <div className="sm:col-span-2">
        <Button className="w-full rounded-full" size="lg">
          Ajouter {role === "manager" ? "un gérant" : "un agent"}
        </Button>
      </div>
    </form>
  );
}
