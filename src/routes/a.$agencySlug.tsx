import { createFileRoute } from "@tanstack/react-router";

import { PublicAgencyHomePage } from "@/lib/v2/pages";

export const Route = createFileRoute("/a/$agencySlug")({
  component: RouteComponent,
});

function RouteComponent() {
  const { agencySlug } = Route.useParams();
  return <PublicAgencyHomePage agencySlug={agencySlug} />;
}
