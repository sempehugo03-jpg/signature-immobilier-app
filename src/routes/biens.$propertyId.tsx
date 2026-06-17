import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";

import { PropertyDetails } from "@/components/property-details";
import { SiteLayout } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import { getPublicProperty } from "@/lib/agency-saas";

export const Route = createFileRoute("/biens/$propertyId")({
  head: () => ({
    meta: [{ title: "Bien à vendre - Signature Immobilier" }],
  }),
  component: PublicPropertyRoute,
});

function PublicPropertyRoute() {
  const { propertyId } = Route.useParams();
  const navigate = useNavigate();
  const property = getPublicProperty(propertyId);

  if (!property) {
    return (
      <SiteLayout variant="public">
        <section className="mx-auto max-w-3xl px-5 py-16 text-center md:px-8">
          <h1 className="font-display text-4xl leading-tight">
            Ce bien n’est plus disponible.
          </h1>
          <Button asChild className="mt-6 rounded-full">
            <Link to="/">Retour aux biens</Link>
          </Button>
        </section>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout variant="public">
      <PropertyDetails
        property={property}
        onClose={() => navigate({ to: "/" })}
      />
    </SiteLayout>
  );
}
