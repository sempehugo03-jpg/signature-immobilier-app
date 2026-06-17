import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/preview-studio")({
  component: AdminPreviewStudioLayoutRoute,
});

function AdminPreviewStudioLayoutRoute() {
  return <Outlet />;
}
