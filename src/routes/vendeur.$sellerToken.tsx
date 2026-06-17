import { createFileRoute } from "@tanstack/react-router";

import { SellerHomePage } from "@/lib/v2/pages";

export const Route = createFileRoute("/vendeur/$sellerToken")({
  component: RouteComponent,
});

function RouteComponent() {
  const { sellerToken } = Route.useParams();
  return <SellerHomePage sellerToken={sellerToken} />;
}
