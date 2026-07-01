import { createFileRoute, notFound } from "@tanstack/react-router";

import { TemplateSpacePage } from "@/components/demo-template-immobilier/template-space-page";

const allowedSpaces = ["connexion", "vendeur", "agent", "patron"] as const;

type TemplateSpace = (typeof allowedSpaces)[number];

function isTemplateSpace(value: string): value is TemplateSpace {
  return allowedSpaces.includes(value as TemplateSpace);
}

export const Route = createFileRoute("/demo/template-immobilier/$space")({
  beforeLoad: ({ params }) => {
    if (!isTemplateSpace(params.space)) {
      throw notFound();
    }
  },
  head: ({ params }) => ({
    meta: [
      {
        title: `${params.space.charAt(0).toUpperCase()}${params.space.slice(
          1,
        )} - Signature Immobilier`,
      },
    ],
  }),
  component: Page,
});

function Page() {
  const { space } = Route.useParams();

  return <TemplateSpacePage mode={space as TemplateSpace} />;
}
