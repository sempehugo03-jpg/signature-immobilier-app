import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";

import {
  Field,
  SaasCard,
  SaasHero,
  SaasShell,
  StatusBadge,
} from "@/components/agency-saas-ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { type Agency, getAgencyBySlug } from "@/lib/agency-saas";

export const Route = createFileRoute("/demo-agence/$slug/estimation")({
  head: () => ({
    meta: [{ title: "Estimation fictive - Signature Immobilier" }],
  }),
  component: DemoEstimationRoute,
});

function DemoEstimationRoute() {
  const { slug } = Route.useParams();
  const [agency, setAgency] = useState<Agency | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    type: "Maison",
    city: "Tarbes",
    surface: "120 m²",
    delay: "3 mois",
    firstName: "Jean",
    lastName: "Martin",
    phone: "06 XX XX XX XX",
    email: "jean.martin@email.fr",
  });

  useEffect(() => {
    setAgency(getAgencyBySlug(slug));
    setLoaded(true);
  }, [slug]);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  if (!loaded) return null;

  if (!agency) {
    return (
      <SaasShell>
        <section className="mx-auto max-w-3xl px-5 py-16 text-center md:px-8">
          <SaasCard className="p-8 md:p-12">
            <h1 className="font-display text-4xl">
              Cette agence n’est plus active sur Signature Immobilier.
            </h1>
          </SaasCard>
        </section>
      </SaasShell>
    );
  }

  return (
    <SaasShell>
      <SaasHero
        eyebrow={`${agency.name} - Estimation fictive`}
        title="Tester une estimation fictive"
        description="Le parcours fonctionne visuellement. En mode démo, aucune demande réelle n’est envoyée."
        action={<StatusBadge status="demo" />}
      />

      <section className="mx-auto max-w-4xl px-5 pb-16 md:px-8">
        <Button asChild variant="outline" className="mb-7 rounded-full bg-white">
          <Link to="/demo-agence/$slug" params={{ slug: agency.slug }}>
            <ArrowLeft className="h-4 w-4" />
            Retour à la démo
          </Link>
        </Button>

        <SaasCard className="p-6 md:p-8">
          {submitted ? (
            <div className="text-center">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-50 text-emerald-700">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h1 className="mt-5 font-display text-4xl leading-tight">
                Demande fictive créée
              </h1>
              <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-primary/60">
                En version activée, cette demande serait envoyée directement à :
                <br />
                <span className="font-medium text-primary">
                  {agency.estimationEmail || "email de réception à renseigner"}
                </span>
              </p>

              <div className="mx-auto mt-8 max-w-md rounded-[22px] border border-[#e8e0d5] bg-[#fffdf9] p-5 text-left">
                <StatusBadge status="Nouveau" />
                <h2 className="mt-4 font-display text-3xl leading-tight">
                  Nouvelle demande d’estimation
                </h2>
                <div className="mt-4 space-y-2 text-sm text-primary/60">
                  <p>Jean Martin</p>
                  <p>Maison — Tarbes</p>
                  <p>Délai : 3 mois</p>
                  <p>Tél : 06 XX XX XX XX</p>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="mt-7 rounded-full bg-white"
                onClick={() => setSubmitted(false)}
              >
                Rejouer la démo
              </Button>
            </div>
          ) : (
            <form className="grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
              <Field label="Type de bien">
                <Input
                  value={form.type}
                  onChange={(event) =>
                    setForm({ ...form, type: event.target.value })
                  }
                />
              </Field>
              <Field label="Ville">
                <Input
                  value={form.city}
                  onChange={(event) =>
                    setForm({ ...form, city: event.target.value })
                  }
                />
              </Field>
              <Field label="Surface">
                <Input
                  value={form.surface}
                  onChange={(event) =>
                    setForm({ ...form, surface: event.target.value })
                  }
                />
              </Field>
              <Field label="Délai de vente">
                <Input
                  value={form.delay}
                  onChange={(event) =>
                    setForm({ ...form, delay: event.target.value })
                  }
                />
              </Field>
              <Field label="Prénom">
                <Input
                  value={form.firstName}
                  onChange={(event) =>
                    setForm({ ...form, firstName: event.target.value })
                  }
                />
              </Field>
              <Field label="Nom">
                <Input
                  value={form.lastName}
                  onChange={(event) =>
                    setForm({ ...form, lastName: event.target.value })
                  }
                />
              </Field>
              <Field label="Téléphone">
                <Input
                  value={form.phone}
                  onChange={(event) =>
                    setForm({ ...form, phone: event.target.value })
                  }
                />
              </Field>
              <Field label="Email">
                <Input
                  value={form.email}
                  onChange={(event) =>
                    setForm({ ...form, email: event.target.value })
                  }
                />
              </Field>
              <div className="md:col-span-2">
                <Button className="w-full rounded-full md:w-auto" size="lg">
                  Valider la demande fictive
                </Button>
              </div>
            </form>
          )}
        </SaasCard>
      </section>
    </SaasShell>
  );
}
