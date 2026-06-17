import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/agence/$slug/biens")({
  component: AgencyPropertiesLayoutRoute,
});

function AgencyPropertiesLayoutRoute() {
  return <Outlet />;
}
