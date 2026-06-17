import { createFileRoute } from "@tanstack/react-router";

import { SellerPropertyPage } from "@/lib/v2/pages";

export const Route = createFileRoute("/vendeur/$sellerToken/bien")({
  component: RouteComponent,
});

function RouteComponent() {
  const { sellerToken } = Route.useParams();
  return <SellerPropertyPage sellerToken={sellerToken} />;
}
