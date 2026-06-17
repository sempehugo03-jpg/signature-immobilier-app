import { createFileRoute } from "@tanstack/react-router";

import { SellerDocumentsPage } from "@/lib/v2/pages";

export const Route = createFileRoute("/vendeur/$sellerToken/documents")({
  component: RouteComponent,
});

function RouteComponent() {
  const { sellerToken } = Route.useParams();
  return <SellerDocumentsPage sellerToken={sellerToken} />;
}
