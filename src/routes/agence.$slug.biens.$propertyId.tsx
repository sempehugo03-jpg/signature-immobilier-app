import { createFileRoute } from "@tanstack/react-router";

import { AgencyPropertyManagePage } from "@/lib/v2/pages";

export const Route = createFileRoute("/agence/$slug/biens/$propertyId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { slug, propertyId } = Route.useParams();
  return <AgencyPropertyManagePage agencySlug={slug} propertyId={propertyId} />;
}
