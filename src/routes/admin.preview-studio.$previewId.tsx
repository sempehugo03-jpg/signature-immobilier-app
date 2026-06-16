import { createFileRoute } from "@tanstack/react-router";

import { PreviewStudioDetailPage } from "@/lib/v2/pages";

export const Route = createFileRoute("/admin/preview-studio/$previewId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { previewId } = Route.useParams();
  return <PreviewStudioDetailPage previewId={previewId} />;
}
