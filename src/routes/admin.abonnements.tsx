import { createFileRoute } from "@tanstack/react-router";

import { AdminSubscriptionsPage } from "@/lib/v2/pages";

export const Route = createFileRoute("/admin/abonnements")({
  component: AdminSubscriptionsPage,
});
