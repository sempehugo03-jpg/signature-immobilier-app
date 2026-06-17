import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/agence/$slug")({
  component: AgencyLayoutRoute,
});

function AgencyLayoutRoute() {
  return <Outlet />;
}
