import { createFileRoute } from "@tanstack/react-router";

import { AdminPricingPage } from "@/lib/v2/pages";

export const Route = createFileRoute("/admin/tarifs")({
  component: AdminPricingPage,
});
