import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/agences")({
  component: AdminAgenciesLayoutRoute,
});

function AdminAgenciesLayoutRoute() {
  return <Outlet />;
}
