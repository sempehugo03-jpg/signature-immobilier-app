import { createFileRoute } from "@tanstack/react-router";

import { AgencyNewPropertyPage } from "@/lib/v2/pages";

export const Route = createFileRoute("/agence/$slug/biens/nouveau")({
  component: RouteComponent,
});

function RouteComponent() {
  const { slug } = Route.useParams();
  return <AgencyNewPropertyPage agencySlug={slug} />;
}
