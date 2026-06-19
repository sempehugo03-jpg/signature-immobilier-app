import { createFileRoute } from "@tanstack/react-router";

import { PatronDashboardPage } from "@/lib/v2/pages";

export const Route = createFileRoute("/patron/$agencySlug")({
  component: PatronRoute,
});

function PatronRoute() {
  const { agencySlug } = Route.useParams();

  return <PatronDashboardPage agencySlug={agencySlug} />;
}
