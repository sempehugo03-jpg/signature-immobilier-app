import { createFileRoute } from "@tanstack/react-router";

import { AgentDashboardPage } from "@/lib/v2/pages";

export const Route = createFileRoute("/agent/$agencySlug")({
  component: AgentRoute,
});

function AgentRoute() {
  const { agencySlug } = Route.useParams();

  return <AgentDashboardPage agencySlug={agencySlug} />;
}
