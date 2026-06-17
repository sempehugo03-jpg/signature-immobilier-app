import { createFileRoute } from "@tanstack/react-router";

import { PublicEstimationPage } from "@/lib/v2/pages";

export const Route = createFileRoute("/a/$agencySlug/estimation")({
  component: RouteComponent,
});

function RouteComponent() {
  const { agencySlug } = Route.useParams();
  return <PublicEstimationPage agencySlug={agencySlug} />;
}
