import { createFileRoute } from "@tanstack/react-router";

import { AgencyDashboardPage } from "@/lib/v2/pages";

export const Route = createFileRoute("/agence/$slug/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { slug } = Route.useParams();
  return <AgencyDashboardPage agencySlug={slug} />;
}
