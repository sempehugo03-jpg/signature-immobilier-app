import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2, LogOut } from "lucide-react";
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
import { sendLeadNotificationEmail } from "@/lib/api/agency-email.functions";
import {
  buildLeadEmail,
  getAgencyBySlug,
  saveAgencyLead,
  type Agency,
  type AgencyLead,
} from "@/lib/agency-saas";

export const Route = createFileRoute("/agence/$slug/estimation")({
  head: () => ({
    meta: [{ title: "Estimation agence - Signature Immobilier" }],
  }),
  component: AgencyEstimationRoute,
});

type LeadForm = Omit<
  AgencyLead,
  "id" | "agencySlug" | "agencyName" | "createdAt" | "status"
>;

const initialForm: LeadForm = {
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  propertyType: "Maison",
  propertyCity: "",
  surface: "",
  rooms: "",
  propertyState: "Bon",
  exterior: "",
  parking: "",
  sellingDelay: "",
  estimateLow: "",
  estimateHigh: "",
  answers: "",
};

function AgencyEstimationRoute() {
  const { slug } = Route.useParams();
  const [agency, setAgency] = useState<Agency | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [form, setForm] = useState<LeadForm>(initialForm);
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setAgency(getAgencyBySlug(slug));
    setLoaded(true);
  }, [slug]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!agency) return;

    if (agency.status === "demo") {
      setMessage(
        "Version démo : en version activée, cette demande serait envoyée directement à l’agence.",
      );
      setSubmitted(true);
      return;
    }

    if (agency.status === "disabled") {
      setMessage("Le portail de cette agence est actuellement désactivé.");
      setSubmitted(true);
      return;
    }

    const lead = saveAgencyLead({
      ...form,
      answers:
        form.answers ||
        [
          `Surface : ${form.surface}`,
          `Nombre de pièces : ${form.rooms}`,
          `État du bien : ${form.propertyState}`,
          `Extérieur : ${form.exterior || "Non renseigné"}`,
          `Garage / parking : ${form.parking || "Non renseigné"}`,
        ].join("\n"),
      agencySlug: agency.slug,
      agencyName: agency.name,
    });
    const email = buildLeadEmail(agency, lead);

    try {
      await sendLeadNotificationEmail({
        data: {
          to: email.to,
          subject: email.subject,
          body: email.body,
        },
      });
    } catch (error) {
      console.info("Email non envoyé : RESEND_API_KEY manquante", error);
    }

    setMessage(
      "Votre demande a bien été transmise. Un conseiller vous rappellera pour affiner l’estimation et vous présenter la meilleure stratégie de vente.",
    );
    setSubmitted(true);
  }

  if (!loaded) return null;

  if (!agency) {
    return (
      <SaasShell action={<LogoutLink />}>
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
    <SaasShell action={<LogoutLink />}>
      <SaasHero
        eyebrow={agency.name}
        title="Demande d’estimation"
        description="Répondez à quelques questions. L’agence vous rappelle ensuite pour affiner votre estimation avec les ventes récentes du secteur."
        action={<StatusBadge status={agency.status} />}
      />

      <section className="mx-auto max-w-4xl px-5 pb-16 md:px-8">
        <Button asChild variant="outline" className="mb-7 rounded-full bg-white">
          <Link to="/agence/$slug" params={{ slug: agency.slug }}>
            <ArrowLeft className="h-4 w-4" />
            Retour au portail
          </Link>
        </Button>

        <SaasCard className="p-6 md:p-8">
          {submitted ? (
            <div className="text-center">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-50 text-emerald-700">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h1 className="mt-5 font-display text-4xl leading-tight">
                Demande prête
              </h1>
              <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-primary/60">
                {message}
              </p>
              <div className="mt-7 flex flex-wrap justify-center gap-3">
                <Button asChild className="rounded-full">
                  <Link to="/agence/$slug" params={{ slug: agency.slug }}>
                    Retour au portail
                  </Link>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full bg-white"
                  onClick={() => {
                    setSubmitted(false);
                    setMessage("");
                    setForm(initialForm);
                  }}
                >
                  Nouvelle demande
                </Button>
              </div>
            </div>
          ) : (
            <form className="grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
              <Field label="Prénom">
                <Input
                  value={form.firstName}
                  onChange={(event) =>
                    setForm({ ...form, firstName: event.target.value })
                  }
                  required
                />
              </Field>
              <Field label="Nom">
                <Input
                  value={form.lastName}
                  onChange={(event) =>
                    setForm({ ...form, lastName: event.target.value })
                  }
                  required
                />
              </Field>
              <Field label="Email">
                <Input
                  type="email"
                  value={form.email}
                  onChange={(event) =>
                    setForm({ ...form, email: event.target.value })
                  }
                  required
                />
              </Field>
              <Field label="Téléphone">
                <Input
                  type="tel"
                  value={form.phone}
                  onChange={(event) =>
                    setForm({ ...form, phone: event.target.value })
                  }
                  required
                />
              </Field>
              <Field label="Ville du bien">
                <Input
                  value={form.propertyCity}
                  onChange={(event) =>
                    setForm({ ...form, propertyCity: event.target.value })
                  }
                  required
                />
              </Field>
              <Field label="Type de bien">
                <select
                  value={form.propertyType}
                  onChange={(event) =>
                    setForm({ ...form, propertyType: event.target.value })
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  {["Maison", "Appartement", "Terrain", "Immeuble"].map(
                    (type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ),
                  )}
                </select>
              </Field>
              <Field label="Surface">
                <Input
                  value={form.surface}
                  onChange={(event) =>
                    setForm({ ...form, surface: event.target.value })
                  }
                  placeholder="115 m²"
                  required
                />
              </Field>
              <Field label="Nombre de pièces">
                <Input
                  value={form.rooms}
                  onChange={(event) =>
                    setForm({ ...form, rooms: event.target.value })
                  }
                  required
                />
              </Field>
              <Field label="État du bien">
                <select
                  value={form.propertyState}
                  onChange={(event) =>
                    setForm({ ...form, propertyState: event.target.value })
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  {[
                    "Excellent",
                    "Bon",
                    "À rafraîchir",
                    "Travaux à prévoir",
                  ].map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Extérieur">
                <Input
                  value={form.exterior}
                  onChange={(event) =>
                    setForm({ ...form, exterior: event.target.value })
                  }
                  placeholder="Jardin, balcon, terrasse..."
                />
              </Field>
              <Field label="Garage / parking">
                <Input
                  value={form.parking}
                  onChange={(event) =>
                    setForm({ ...form, parking: event.target.value })
                  }
                  placeholder="Garage, place privative..."
                />
              </Field>
              <Field label="Délai de vente">
                <Input
                  value={form.sellingDelay}
                  onChange={(event) =>
                    setForm({ ...form, sellingDelay: event.target.value })
                  }
                  placeholder="3 mois, 6 mois, pas pressé..."
                />
              </Field>
              <div className="md:col-span-2">
                <Button className="w-full rounded-full md:w-auto" size="lg">
                  Envoyer ma demande
                </Button>
              </div>
            </form>
          )}
        </SaasCard>
      </section>
    </SaasShell>
  );
}

function LogoutLink() {
  return (
    <Button
      asChild
      variant="outline"
      className="rounded-full border-[#d8cfc2] bg-white"
    >
      <Link to="/">
        <LogOut className="h-4 w-4" />
        Déconnexion
      </Link>
    </Button>
  );
}
