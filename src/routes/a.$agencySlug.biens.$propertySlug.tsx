import { createFileRoute } from "@tanstack/react-router";

import { PublicPropertyDetailPage } from "@/lib/v2/pages";

export const Route = createFileRoute("/a/$agencySlug/biens/$propertySlug")({
  component: RouteComponent,
});

function RouteComponent() {
  const { agencySlug, propertySlug } = Route.useParams();
  return (
    <PublicPropertyDetailPage
      agencySlug={agencySlug}
      propertySlug={propertySlug}
    />
  );
}
