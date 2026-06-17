import { createFileRoute } from "@tanstack/react-router";

import { SellerVisitsPage } from "@/lib/v2/pages";

export const Route = createFileRoute("/vendeur/$sellerToken/visites")({
  component: RouteComponent,
});

function RouteComponent() {
  const { sellerToken } = Route.useParams();
  return <SellerVisitsPage sellerToken={sellerToken} />;
}
