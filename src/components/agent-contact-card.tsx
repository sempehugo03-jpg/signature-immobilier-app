import { Phone } from "lucide-react";

import type { Agent } from "@/lib/agency-config";

type AgentContactCardProps = {
  agent: Agent;
};

export function AgentContactCard({ agent }: AgentContactCardProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-full bg-primary text-primary-foreground font-display text-lg">
          {agent.name
            .split(" ")
            .map((part) => part[0])
            .join("")
            .slice(0, 2)}
        </div>
        <div>
          <div className="font-medium">{agent.name}</div>
          <div className="text-sm text-muted-foreground">{agent.role}</div>
        </div>
      </div>
      <a
        href={agent.phoneHref}
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
      >
        <Phone className="h-4 w-4" />
        {agent.phone}
      </a>
    </div>
  );
}
