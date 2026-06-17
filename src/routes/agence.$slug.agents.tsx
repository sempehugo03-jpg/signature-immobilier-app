import { createFileRoute } from "@tanstack/react-router";

import { AgencyAgentsPage } from "@/lib/v2/pages";

export const Route = createFileRoute("/agence/$slug/agents")({
  component: RouteComponent,
});

function RouteComponent() {
  const { slug } = Route.useParams();
  return <AgencyAgentsPage agencySlug={slug} />;
}
