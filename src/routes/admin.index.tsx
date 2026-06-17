import { createFileRoute } from "@tanstack/react-router";

import { AdminDashboardV2Page } from "@/lib/v2/pages";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboardV2Page,
});
