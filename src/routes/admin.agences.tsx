import { createFileRoute } from "@tanstack/react-router";

import { AdminAgenciesPage } from "@/lib/v2/pages";

export const Route = createFileRoute("/admin/agences")({
  component: AdminAgenciesPage,
});
