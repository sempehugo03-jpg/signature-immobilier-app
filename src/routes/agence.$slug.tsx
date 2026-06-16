import {
  createFileRoute,
  Link,
  Outlet,
  useRouterState,
} from "@tanstack/react-router";
import {
  ArrowRight,
  CalendarDays,
  FileText,
  Home,
  Plus,
  Settings,
  UsersRound,
} from "lucide-react";
import { FormEvent, useEffect, useState } from "react";

import {
  Field,
  LockedActionModal,
  SaasCard,
  SaasHero,
  SaasShell,
  SectionTitle,
  StatusBadge,
} from "@/components/agency-saas-ui";
import { SessionLogoutButton } from "@/components/session-logout-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { agencyConfig } from "@/lib/agency-config";
import {
  getAgencyBySlug,
  getAgencyLeads,
  getAgencyProperties,
  getAgents,
  getManagers,
  getVisitRequestsByAgency,
  internalProgressLabel,
  leadStatusLabel,
  publicStatusLabel,
  saveAgencyProperty,
  type Agency,
  type AgencyProperty,
} from "@/lib/agency-saas";

export const Route = createFileRoute("/agence/$slug")({
  head: () => ({
    meta: [{ title: "Portail agence - Signature Immobilier" }],
  }),
  component: AgencyPortalRoute,
});

function AgencyPortalRoute() {
  const { slug } = Route.useParams();
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const isPortalRoot =
    pathname === `/agence/${slug}` || pathname === `/agence/${slug}/`;

  if (!isPortalRoot) return <Outlet />;

  return <AgencyPortal slug={slug} />;
}

function AgencyPortal({ slug }: { slug: string }) {
  const [agency, setAgency] = useState<Agency | null>(null);
  const [properties, setProperties] = useState<AgencyProperty[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [lockedOpen, setLockedOpen] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    const nextAgency = getAgencyBySlug(slug);
    setAgency(nextAgency);
    if (nextAgency) setProperties(getAgencyProperties(nextAgency));
    setLoaded(true);
  }, [slug]);

  if (!loaded) return null;

  if (!agency) {
    return (
      <SaasShell action={<LogoutLink />}>
        <section className="mx-auto max-w-3xl px-5 py-16 text-center md:px-8">
          <SaasCard className="p-8 md:p-12">
            <h1 className="font-display text-4xl">
              Cette agence n’est plus active sur Signature Immobilier.
            </h1>
            <Button asChild className="mt-6 rounded-full">
              <Link to="/">Retour à l’accueil</Link>
            </Button>
          </SaasCard>
        </section>
      </SaasShell>
    );
  }

  const isActive = agency.status === "active";
  const isDemo = agency.status === "demo";
  const isDisabled = agency.status === "disabled";
  const leads = getAgencyLeads(agency.slug);
  const visitRequests = getVisitRequestsByAgency(agency.id);
  const managers = getManagers(agency.id);
  const agents = getAgents(agency.id);

  return (
    <SaasShell action={<LogoutLink />}>
      <LockedActionModal
        open={lockedOpen}
        onClose={() => setLockedOpen(false)}
      />

      <SaasHero
        eyebrow={agency.city || "Portail agence"}
        title={agency.name}
        description="Signature Immobilier ne remplace pas votre CRM. Il améliore ce que vos clients voient."
        action={<StatusBadge status={agency.status} />}
      />

      <section className="mx-auto max-w-7xl px-5 pb-16 md:px-8">
        {isDemo && (
          <div className="rounded-[28px] border border-amber-200 bg-amber-50 p-5 text-sm leading-relaxed text-amber-800">
            Votre agence est actuellement en version démo.{" "}
            <Link
              to="/demo-agence/$slug"
              params={{ slug: agency.slug }}
              className="font-medium underline"
            >
              Ouvrir la démo complète
            </Link>
            .
          </div>
        )}
        {isDisabled && (
          <StatusMessage text="Votre portail est actuellement désactivé. Contactez Signature Immobilier pour le réactiver." />
        )}

        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <NavCard
            icon={Home}
            title="Biens"
            value={`${properties.length}`}
            to={`/agence/${agency.slug}`}
          />
          <NavCard
            icon={CalendarDays}
            title="Estimations"
            value={`${leads.length}`}
            to={`/agence/${agency.slug}/estimations`}
            disabled={!isActive}
            onLocked={() => setLockedOpen(true)}
          />
          <NavCard
            icon={CalendarDays}
            title="Visites"
            value={`${visitRequests.length}`}
            to={`/agence/${agency.slug}/demandes-visites`}
            disabled={!isActive}
            onLocked={() => setLockedOpen(true)}
          />
          <NavCard
            icon={UsersRound}
            title="Équipe"
            value={`${managers.length + agents.length}`}
            to={`/agence/${agency.slug}/equipe`}
            disabled={!isActive}
            onLocked={() => setLockedOpen(true)}
          />
          <NavCard
            icon={Settings}
            title="Paramètres"
            value={agency.status}
            to={`/agence/${agency.slug}/settings`}
            disabled={!isActive}
            onLocked={() => setLockedOpen(true)}
          />
        </div>

        <SaasCard className="mt-7 p-6 md:p-8">
          <SectionTitle
            title="Biens"
            description="Vous modifiez ici uniquement les informations visibles par vos clients vendeurs. Votre CRM reste votre outil interne."
            action={
              <Button
                type="button"
                className="rounded-full"
                onClick={
                  isActive
                    ? () => setShowCreateForm((value) => !value)
                    : () => setLockedOpen(true)
                }
                disabled={isDisabled}
              >
                <Plus className="h-4 w-4" />
                Créer une annonce
              </Button>
            }
          />

          {feedback && (
            <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
              {feedback}
            </div>
          )}

          {isActive && showCreateForm && agency && (
            <CreatePropertyForm
              agency={agency}
              onCreated={(nextProperties) => {
                setProperties(nextProperties);
                setShowCreateForm(false);
                setFeedback("Bien ajouté au portail agence.");
              }}
            />
          )}

          <div className="mt-7 grid gap-5 md:grid-cols-2">
            {properties.map((property) => (
              <PropertyCard
                key={property.id}
                agencySlug={agency.slug}
                property={property}
                isActive={isActive}
                onLocked={() => setLockedOpen(true)}
              />
            ))}
          </div>
        </SaasCard>

        <div className="mt-7 grid gap-7 lg:grid-cols-3">
          <SaasCard className="p-6 md:p-8">
            <SectionTitle
              title="Demandes d’estimation"
              description={
                isActive
                  ? "Les nouvelles demandes apparaissent ici et sont envoyées à l’email de réception."
                  : "Version démo aujourd’hui. Portail complet après activation."
              }
              action={
                <Button
                  asChild={isActive}
                  type="button"
                  variant="outline"
                  className="rounded-full bg-white"
                  onClick={isActive ? undefined : () => setLockedOpen(true)}
                >
                  {isActive ? (
                    <Link
                      to="/agence/$slug/estimations"
                      params={{ slug: agency.slug }}
                    >
                      Voir les demandes
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  ) : (
                    <>
                      Voir les demandes
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              }
            />
            <div className="mt-6 space-y-3">
              {(isActive ? leads.slice(0, 3) : []).map((lead) => (
                <div
                  key={lead.id}
                  className="rounded-2xl border border-[#e8e0d5] bg-[#fffdf9] p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="font-medium">
                      {lead.firstName} {lead.lastName}
                    </div>
                    <StatusBadge status={leadStatusLabel(lead.status)} />
                  </div>
                  <div className="mt-2 text-sm text-primary/55">
                    {lead.propertyType} — {lead.propertyCity}
                  </div>
                </div>
              ))}
              {(!isActive || leads.length === 0) && (
                <p className="text-sm text-primary/55">
                  Aucune demande d’estimation pour le moment.
                </p>
              )}
            </div>
          </SaasCard>

          <SaasCard className="p-6 md:p-8">
            <SectionTitle
              title="Demandes de visite"
              description={
                isActive
                  ? "Les demandes acheteurs issues des annonces publiques arrivent ici."
                  : "Version démo aujourd’hui. Portail complet après activation."
              }
              action={
                <Button
                  asChild={isActive}
                  type="button"
                  variant="outline"
                  className="rounded-full bg-white"
                  onClick={isActive ? undefined : () => setLockedOpen(true)}
                >
                  {isActive ? (
                    <Link
                      to="/agence/$slug/demandes-visites"
                      params={{ slug: agency.slug }}
                    >
                      Voir les demandes
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  ) : (
                    <>
                      Voir les demandes
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              }
            />
            <div className="mt-6 space-y-3">
              {(isActive ? visitRequests.slice(0, 3) : []).map((request) => (
                <div
                  key={request.id}
                  className="rounded-2xl border border-[#e8e0d5] bg-[#fffdf9] p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="font-medium">
                      {request.firstName} {request.lastName}
                    </div>
                    <StatusBadge status={leadStatusLabel(request.status)} />
                  </div>
                  <div className="mt-2 text-sm text-primary/55">
                    {request.propertyTitle} — {request.propertyCity}
                  </div>
                </div>
              ))}
              {(!isActive || visitRequests.length === 0) && (
                <p className="text-sm text-primary/55">
                  Aucune demande de visite pour le moment.
                </p>
              )}
            </div>
          </SaasCard>

          <SaasCard className="p-6 md:p-8">
            <SectionTitle
              title="Équipe"
              description="Les patrons peuvent ajouter, supprimer, désactiver ou réactiver les membres depuis la page équipe."
              action={
                <Button
                  asChild={isActive}
                  type="button"
                  className="rounded-full"
                  onClick={isActive ? undefined : () => setLockedOpen(true)}
                >
                  {isActive ? (
                    <Link
                      to="/agence/$slug/equipe"
                      params={{ slug: agency.slug }}
                    >
                      Gérer l’équipe
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  ) : (
                    <>
                      Gérer l’équipe
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              }
            />
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Metric label="Patrons" value={`${managers.length}`} />
              <Metric label="Agents" value={`${agents.length}`} />
            </div>
          </SaasCard>
        </div>
      </section>
    </SaasShell>
  );
}

function StatusMessage({ text }: { text: string }) {
  return (
    <div className="rounded-[28px] border border-amber-200 bg-amber-50 p-5 text-sm leading-relaxed text-amber-800">
      {text}
    </div>
  );
}

function NavCard({
  icon: Icon,
  title,
  value,
  to,
  disabled,
  onLocked,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  value: string;
  to: string;
  disabled?: boolean;
  onLocked?: () => void;
}) {
  const content = (
    <SaasCard className="p-5 transition hover:-translate-y-0.5 hover:shadow-[0_18px_45px_rgba(17,24,39,0.08)]">
      <Icon className="h-5 w-5 text-primary/45" />
      <div className="mt-5 text-sm text-primary/45">{title}</div>
      <div className="mt-1 font-display text-3xl leading-tight">{value}</div>
    </SaasCard>
  );

  if (disabled) {
    return (
      <button type="button" className="text-left" onClick={onLocked}>
        {content}
      </button>
    );
  }

  return <Link to={to}>{content}</Link>;
}

function CreatePropertyForm({
  agency,
  onCreated,
}: {
  agency: Agency;
  onCreated: (properties: AgencyProperty[]) => void;
}) {
  const [form, setForm] = useState({
    title: "",
    type: "Maison",
    city: agency.city,
    address: "",
    price: "",
    surface: "",
    rooms: "",
    bedrooms: "",
    description: "",
  });

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fallbackImage = agencyConfig.properties[0].coverImage;
    const now = new Date().toISOString();
    const propertyId = `property-${Date.now()}`;
    const nextProperties = saveAgencyProperty({
      id: propertyId,
      agencyId: agency.id,
      agencySlug: agency.slug,
      title: form.title,
      type: form.type,
      city: form.city,
      address: form.address,
      addressOrDistrict: form.address,
      price: form.price,
      surface: form.surface,
      rooms: form.rooms,
      bedrooms: form.bedrooms,
      publicStatus: "new",
      internalProgress: "published",
      internalStatus: "Annonce publiée",
      isPublished: true,
      nextVisit: "À planifier",
      report: "Aucun compte rendu de visite disponible pour le moment.",
      description: form.description,
      image: fallbackImage,
      imageUrl: fallbackImage,
      photos: [
        {
          id: `photo-${Date.now()}`,
          propertyId,
          url: fallbackImage,
          alt: form.title,
          isMain: true,
          order: 1,
          createdAt: now,
        },
      ],
      sellerToken: "",
      sellerFirstName: "",
      sellerLastName: "",
      sellerEmail: "",
      sellerPhone: "",
      documents: ["Mandat", "Diagnostics"],
      propertyDocuments: [
        {
          id: `document-${Date.now()}-mandat`,
          propertyId,
          name: "Mandat",
          type: "Mandat",
          url: "",
          visibleToSeller: false,
          createdAt: now,
        },
        {
          id: `document-${Date.now()}-diagnostics`,
          propertyId,
          name: "Diagnostics",
          type: "Diagnostics",
          url: "",
          visibleToSeller: false,
          createdAt: now,
        },
      ],
      visits: [],
      visitReports: [],
      createdAt: now,
      updatedAt: now,
    });
    onCreated(nextProperties);
  }

  return (
    <form
      className="mt-7 grid gap-4 rounded-[22px] border border-[#e8e0d5] bg-[#fffdf9] p-5 md:grid-cols-2"
      onSubmit={onSubmit}
    >
      <Field label="Titre">
        <Input
          value={form.title}
          onChange={(event) => setForm({ ...form, title: event.target.value })}
          required
        />
      </Field>
      <Field label="Type">
        <Input
          value={form.type}
          onChange={(event) => setForm({ ...form, type: event.target.value })}
          required
        />
      </Field>
      <Field label="Ville">
        <Input
          value={form.city}
          onChange={(event) => setForm({ ...form, city: event.target.value })}
          required
        />
      </Field>
      <Field label="Adresse ou quartier">
        <Input
          value={form.address}
          onChange={(event) =>
            setForm({ ...form, address: event.target.value })
          }
        />
      </Field>
      <Field label="Prix">
        <Input
          value={form.price}
          onChange={(event) => setForm({ ...form, price: event.target.value })}
          required
        />
      </Field>
      <Field label="Surface">
        <Input
          value={form.surface}
          onChange={(event) =>
            setForm({ ...form, surface: event.target.value })
          }
          required
        />
      </Field>
      <Field label="Pièces">
        <Input
          value={form.rooms}
          onChange={(event) => setForm({ ...form, rooms: event.target.value })}
          required
        />
      </Field>
      <Field label="Chambres">
        <Input
          value={form.bedrooms}
          onChange={(event) =>
            setForm({ ...form, bedrooms: event.target.value })
          }
        />
      </Field>
      <Field label="Description" className="md:col-span-2">
        <Textarea
          value={form.description}
          onChange={(event) =>
            setForm({ ...form, description: event.target.value })
          }
          className="min-h-28"
          required
        />
      </Field>
      <div className="md:col-span-2">
        <Button className="rounded-full" size="lg">
          Enregistrer le bien
        </Button>
      </div>
    </form>
  );
}

function PropertyCard({
  agencySlug,
  property,
  isActive,
  onLocked,
}: {
  agencySlug: string;
  property: AgencyProperty;
  isActive: boolean;
  onLocked: () => void;
}) {
  const badge = publicStatusLabel(property.publicStatus);
  const image = property.imageUrl || property.image;

  return (
    <div className="overflow-hidden rounded-[24px] border border-[#e8e0d5] bg-[#fffdf9]">
      <img
        src={image}
        alt={property.title}
        className="h-56 w-full object-cover"
      />
      <div className="p-5">
        <div className="flex flex-wrap items-center gap-2">
          {badge && <StatusBadge status={badge} />}
          <StatusBadge status={property.isPublished ? "publié" : "masqué"} />
          <span className="text-sm text-primary/45">{property.city}</span>
        </div>
        <h3 className="mt-4 font-display text-3xl leading-tight">
          {property.title}
        </h3>
        <p className="mt-2 text-sm text-primary/55">
          {property.price} · {property.surface} · {property.rooms} pièces
        </p>
        <p className="mt-4 text-sm leading-relaxed text-primary/55">
          {property.description}
        </p>
        <p className="mt-3 text-xs font-medium uppercase tracking-[0.16em] text-primary/35">
          {internalProgressLabel(property.internalProgress)}
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {isActive ? (
            <Button asChild className="rounded-full">
              <Link
                to="/agence/$slug/biens/$propertyId/gerer"
                params={{ slug: agencySlug, propertyId: property.id }}
              >
                Gérer
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              className="rounded-full bg-white"
              onClick={onLocked}
            >
              <FileText className="h-4 w-4" />
              Gérer
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#e8e0d5] bg-[#fffdf9] p-5">
      <div className="text-xs font-medium uppercase tracking-[0.18em] text-primary/35">
        {label}
      </div>
      <div className="mt-2 font-display text-3xl">{value}</div>
    </div>
  );
}

function LogoutLink() {
  return <SessionLogoutButton />;
}
