import { createFileRoute } from "@tanstack/react-router";

import { AgencyPropertiesPage } from "@/lib/v2/pages";

export const Route = createFileRoute("/agence/$slug/biens")({
  component: RouteComponent,
});

function RouteComponent() {
  const { slug } = Route.useParams();
  return <AgencyPropertiesPage agencySlug={slug} />;
}
