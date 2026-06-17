import { createFileRoute } from "@tanstack/react-router";

import { MonSuiviV2Page } from "@/lib/v2/pages";

export const Route = createFileRoute("/mon-suivi")({
  head: () => ({
    meta: [
      { title: "Mon suivi - Signature Immobilier" },
      {
        name: "description",
        content: "Porte d'entree unique Signature Immobilier.",
      },
    ],
  }),
  component: MonSuiviV2Page,
});
