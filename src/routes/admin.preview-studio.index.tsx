import { createFileRoute } from "@tanstack/react-router";

import { PreviewStudioListPage } from "@/lib/v2/pages";

export const Route = createFileRoute("/admin/preview-studio/")({
  component: PreviewStudioListPage,
});
