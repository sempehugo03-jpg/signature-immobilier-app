import { createFileRoute } from "@tanstack/react-router";

import { TemplateImmobilierPage } from "@/components/demo-template-immobilier/template-immobilier-page";
import { realEstateTemplate } from "@/data/realEstateTemplate";

export const Route = createFileRoute("/demo/template-immobilier")({
  head: () => ({
    meta: [
      { title: "Signature Immobilier - L'immobilier, signe." },
      {
        name: "description",
        content:
          "Template immobilier premium integre depuis le front Lovable Opus Domus.",
      },
      {
        property: "og:title",
        content: "Signature Immobilier - L'immobilier, signe.",
      },
      {
        property: "og:description",
        content: "Une agence qui travaille differemment.",
      },
      { property: "og:image", content: realEstateTemplate.assets.hero },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;1,600&display=swap",
      },
    ],
  }),
  component: TemplateImmobilierPage,
});
