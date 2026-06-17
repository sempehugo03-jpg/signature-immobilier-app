import { createFileRoute } from "@tanstack/react-router";

import { AgencySellersPage } from "@/lib/v2/pages";

export const Route = createFileRoute("/agence/$slug/vendeurs")({
  component: RouteComponent,
});

function RouteComponent() {
  const { slug } = Route.useParams();
  return <AgencySellersPage agencySlug={slug} />;
}
