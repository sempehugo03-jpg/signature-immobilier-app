import { createFileRoute } from "@tanstack/react-router";

import { PublicPropertiesPage } from "@/lib/v2/pages";

export const Route = createFileRoute("/a/$agencySlug/biens")({
  component: RouteComponent,
});

function RouteComponent() {
  const { agencySlug } = Route.useParams();
  return <PublicPropertiesPage agencySlug={agencySlug} />;
}
