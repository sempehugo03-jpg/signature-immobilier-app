import { createFileRoute } from "@tanstack/react-router";

import { AdminAgencyDetailPage } from "@/lib/v2/pages";

export const Route = createFileRoute("/admin/agences/$agencyId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { agencyId } = Route.useParams();
  return <AdminAgencyDetailPage agencyId={agencyId} />;
}
