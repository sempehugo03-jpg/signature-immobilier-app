import { createFileRoute } from "@tanstack/react-router";

import { AgencyVisitRequestsPage } from "@/lib/v2/pages";

export const Route = createFileRoute("/agence/$slug/demandes-visites")({
  component: RouteComponent,
});

function RouteComponent() {
  const { slug } = Route.useParams();
  return <AgencyVisitRequestsPage agencySlug={slug} />;
}
