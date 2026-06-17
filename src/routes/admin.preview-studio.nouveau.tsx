import { createFileRoute } from "@tanstack/react-router";

import { PreviewStudioNewPage } from "@/lib/v2/pages";

export const Route = createFileRoute("/admin/preview-studio/nouveau")({
  component: PreviewStudioNewPage,
});
