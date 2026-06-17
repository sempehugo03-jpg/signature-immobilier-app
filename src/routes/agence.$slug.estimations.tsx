import { createFileRoute } from "@tanstack/react-router";

import { AgencyEstimationsPage } from "@/lib/v2/pages";

export const Route = createFileRoute("/agence/$slug/estimations")({
  component: RouteComponent,
});

function RouteComponent() {
  const { slug } = Route.useParams();
  return <AgencyEstimationsPage agencySlug={slug} />;
}
