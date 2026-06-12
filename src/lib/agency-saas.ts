import { agencyConfig } from "@/lib/agency-config";

export type AgencyStatus = "demo" | "active" | "disabled";
export type AgencyPlan = "demo" | "pilot";
export type TeamRole = "manager" | "agent";
export type AgencyLeadStatus = "Nouveau" | "Rappelé" | "Converti" | "Perdu";

export type AgencyFeatures = {
  canCreateProperties: boolean;
  canEditProperties: boolean;
  canGenerateSellerLinks: boolean;
  canReceiveLeads: boolean;
  canManageDocuments: boolean;
  canPublishProperties: boolean;
  canManageTeam: boolean;
};

export type Agency = {
  id: string;
  slug: string;
  name: string;
  city: string;
  logoUrl: string;
  phone: string;
  primaryColor: string;
  status: AgencyStatus;
  plan: AgencyPlan;
  estimationEmail: string;
  publicEnabled: boolean;
  activatedAt?: string;
  createdAt: string;
  updatedAt: string;
  features: AgencyFeatures;
  email?: string;
};

export type TeamMember = {
  id: string;
  agencyId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: TeamRole;
  createdAt: string;
};

export type AgencyProperty = {
  id: string;
  agencyId: string;
  title: string;
  type: string;
  city: string;
  address: string;
  price: string;
  surface: string;
  rooms: string;
  bedrooms: string;
  publicStatus:
    | "Disponible"
    | "Nouveauté"
    | "Exclusivité"
    | "Sous offre"
    | "Vendu"
    | "Coup de cœur";
  internalStatus: string;
  nextVisit: string;
  report: string;
  description: string;
  image: string;
  sellerToken: string;
  documents: string[];
};

export type AgencyLead = {
  id: string;
  agencySlug: string;
  agencyName: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  propertyType: string;
  propertyCity: string;
  surface: string;
  rooms: string;
  propertyState: string;
  exterior: string;
  parking: string;
  sellingDelay: string;
  estimateLow?: string;
  estimateHigh?: string;
  answers?: string;
  status: AgencyLeadStatus;
  createdAt: string;
};

export type AgencyLinks = {
  demo: string;
  portal: string;
  estimation: string;
  estimations: string;
  team: string;
  settings: string;
};

export type EmailContent = {
  to: string[];
  subject: string;
  body: string;
  gmailHref: string;
  mailtoHref: string;
};

const AGENCIES_KEY = "signature_saas_agencies";
const TEAM_KEY = "signature_saas_team_members";
const PROPERTIES_KEY = "signature_saas_properties";
const LEADS_KEY = "signature_saas_leads";

const defaultTimestamp = "2026-01-01T00:00:00.000Z";

export const demoFeatures = createFeatures(false);
export const activeFeatures = createFeatures(true);

export const defaultAgencies: Agency[] = [
  applyAgencyStatus({
    id: "betty-immo",
    slug: "betty-immobilier",
    name: "Betty Immobilier",
    city: "Tarbes",
    logoUrl: "",
    phone: "05 00 00 00 00",
    primaryColor: "#111111",
    status: "demo",
    plan: "demo",
    estimationEmail: "contact@betty-immobilier.fr",
    publicEnabled: true,
    activatedAt: undefined,
    createdAt: defaultTimestamp,
    updatedAt: defaultTimestamp,
    features: demoFeatures,
    email: "contact@betty-immobilier.fr",
  }),
  applyAgencyStatus({
    id: "signature-active",
    slug: "signature-active",
    name: "Signature Immobilier",
    city: "Tarbes",
    logoUrl: "",
    phone: "05 00 00 00 00",
    primaryColor: "#111111",
    status: "active",
    plan: "pilot",
    estimationEmail: "contact@signature-immobilier.fr",
    publicEnabled: true,
    activatedAt: defaultTimestamp,
    createdAt: defaultTimestamp,
    updatedAt: defaultTimestamp,
    features: activeFeatures,
    email: "contact@signature-immobilier.fr",
  }),
];

export function getAgencies() {
  return mergeAgencies(readStored<Agency[]>(AGENCIES_KEY, []));
}

export function getAgencyBySlug(slug: string) {
  return getAgencies().find((agency) => agency.slug === slug) ?? null;
}

export function getAgencyById(id: string) {
  return getAgencies().find((agency) => agency.id === id) ?? null;
}

export function createAgency(data: Partial<Agency>) {
  const now = new Date().toISOString();
  const name = data.name?.trim() || "Nouvelle agence";
  const agency = applyAgencyStatus({
    id: data.id ?? `agency-${Date.now()}`,
    slug: ensureUniqueSlug(data.slug || generateAgencySlug(name)),
    name,
    city: data.city?.trim() ?? "",
    logoUrl: data.logoUrl?.trim() ?? "",
    phone: data.phone?.trim() ?? "",
    primaryColor: data.primaryColor?.trim() || "#111111",
    status: data.status ?? "demo",
    plan: data.plan ?? "demo",
    estimationEmail: cleanEmail(data.estimationEmail ?? ""),
    publicEnabled: data.publicEnabled ?? true,
    activatedAt: data.activatedAt,
    createdAt: data.createdAt ?? now,
    updatedAt: now,
    features: data.features ?? demoFeatures,
    email: cleanEmail(data.email ?? ""),
  });
  const nextAgencies = [
    agency,
    ...getAgencies().filter((item) => item.id !== agency.id),
  ];
  writeAgencies(nextAgencies);
  return agency;
}

export function updateAgency(id: string, data: Partial<Agency>) {
  const now = new Date().toISOString();
  const nextAgencies = getAgencies().map((agency) =>
    agency.id === id
      ? applyAgencyStatus({
          ...agency,
          ...data,
          slug: normalizeSlug(data.slug ?? agency.slug),
          email: cleanEmail(data.email ?? agency.email ?? ""),
          estimationEmail: cleanEmail(
            data.estimationEmail ?? agency.estimationEmail,
          ),
          updatedAt: now,
        })
      : agency,
  );
  writeAgencies(nextAgencies);
  return nextAgencies.find((agency) => agency.id === id) ?? null;
}

export function activateAgency(id: string) {
  const now = new Date().toISOString();
  return updateAgency(id, {
    status: "active",
    plan: "pilot",
    publicEnabled: true,
    activatedAt: now,
    features: activeFeatures,
  });
}

export function deactivateAgency(id: string) {
  return updateAgency(id, {
    status: "demo",
    plan: "demo",
    publicEnabled: true,
    features: demoFeatures,
  });
}

export function disableAgency(id: string) {
  return updateAgency(id, {
    status: "disabled",
    publicEnabled: false,
    features: demoFeatures,
  });
}

export function generateAgencySlug(name: string) {
  return normalizeSlug(name);
}

export function getAgencyFeatures(agency: Agency) {
  return agency.status === "active" ? activeFeatures : demoFeatures;
}

export function applyAgencyStatus(agency: Agency): Agency {
  const status = agency.status ?? "demo";
  const active = status === "active";
  const disabled = status === "disabled";
  return {
    ...agency,
    status,
    plan: active ? "pilot" : "demo",
    publicEnabled: disabled ? false : agency.publicEnabled,
    features: active ? activeFeatures : demoFeatures,
    createdAt: agency.createdAt ?? defaultTimestamp,
    updatedAt: agency.updatedAt ?? agency.createdAt ?? defaultTimestamp,
  };
}

export function getTeamMembers(agencyId: string) {
  return readStored<TeamMember[]>(TEAM_KEY, []).filter(
    (member) => member.agencyId === agencyId,
  );
}

export function getManagers(agencyId: string) {
  return getTeamMembers(agencyId).filter((member) => member.role === "manager");
}

export function getAgents(agencyId: string) {
  return getTeamMembers(agencyId).filter((member) => member.role === "agent");
}

export function addTeamMember(
  agencyId: string,
  data: Pick<TeamMember, "firstName" | "lastName" | "email" | "role">,
) {
  const member: TeamMember = {
    id: `member-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    agencyId,
    firstName: data.firstName.trim(),
    lastName: data.lastName.trim(),
    email: cleanEmail(data.email),
    role: data.role,
    createdAt: new Date().toISOString(),
  };
  const existing = readStored<TeamMember[]>(TEAM_KEY, []);
  writeStored(TEAM_KEY, [member, ...existing]);
  return member;
}

export function deleteTeamMember(memberId: string) {
  const nextMembers = readStored<TeamMember[]>(TEAM_KEY, []).filter(
    (member) => member.id !== memberId,
  );
  writeStored(TEAM_KEY, nextMembers);
  return nextMembers;
}

export function getAgencyLinks(slug: string): AgencyLinks {
  return {
    demo: `/demo-agence/${slug}`,
    portal: `/agence/${slug}`,
    estimation: `/agence/${slug}/estimation`,
    estimations: `/agence/${slug}/estimations`,
    team: `/agence/${slug}/equipe`,
    settings: `/agence/${slug}/settings`,
  };
}

export function getAbsoluteAgencyLinks(slug: string) {
  const origin =
    typeof window === "undefined"
      ? ""
      : window.location.origin.replace(/\/$/, "");
  const links = getAgencyLinks(slug);
  return {
    demo: `${origin}${links.demo}`,
    portal: `${origin}${links.portal}`,
    estimation: `${origin}${links.estimation}`,
    estimations: `${origin}${links.estimations}`,
    team: `${origin}${links.team}`,
    settings: `${origin}${links.settings}`,
  };
}

export function getAgencyProperties(agency: Agency) {
  const stored = readStored<AgencyProperty[]>(PROPERTIES_KEY, []);
  const agencyProperties = stored.filter(
    (property) => property.agencyId === agency.id,
  );
  if (agency.status === "active" && agencyProperties.length)
    return agencyProperties;
  return createDemoProperties(agency);
}

export function saveAgencyProperty(property: AgencyProperty) {
  const properties = readStored<AgencyProperty[]>(PROPERTIES_KEY, []);
  const nextProperties = [
    property,
    ...properties.filter((item) => item.id !== property.id),
  ];
  writeStored(PROPERTIES_KEY, nextProperties);
  return nextProperties.filter((item) => item.agencyId === property.agencyId);
}

export function getAgencyLeads(slug: string) {
  return readStored<AgencyLead[]>(LEADS_KEY, []).filter(
    (lead) => lead.agencySlug === slug,
  );
}

export function saveAgencyLead(
  lead: Omit<AgencyLead, "id" | "createdAt" | "status">,
) {
  const nextLead: AgencyLead = {
    ...lead,
    id: `lead-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    createdAt: new Date().toISOString(),
    status: "Nouveau",
  };
  writeStored(LEADS_KEY, [
    nextLead,
    ...readStored<AgencyLead[]>(LEADS_KEY, []),
  ]);
  return nextLead;
}

export function updateAgencyLeadStatus(id: string, status: AgencyLeadStatus) {
  const leads = readStored<AgencyLead[]>(LEADS_KEY, []);
  const nextLeads = leads.map((lead) =>
    lead.id === id ? { ...lead, status } : lead,
  );
  writeStored(LEADS_KEY, nextLeads);
  return nextLeads;
}

export function createDemoProperties(agency: Agency): AgencyProperty[] {
  const images = agencyConfig.properties;
  return [
    {
      id: `${agency.slug}-maison-familiale`,
      agencyId: agency.id,
      title: `Maison familiale ${agency.city ? `à ${agency.city}` : "avec jardin"}`,
      type: "Maison",
      city: agency.city || "Tarbes",
      address: "Quartier résidentiel",
      price: "356 000 €",
      surface: "124 m²",
      rooms: "5",
      bedrooms: "4",
      publicStatus: "Exclusivité",
      internalStatus: "Visites en cours",
      nextVisit: "Samedi 15 juin à 10h30",
      report:
        "Visite sérieuse. Les acheteurs ont apprécié la luminosité et l’emplacement. Ils souhaitent revoir le bien avec un proche avant de se positionner.",
      description:
        "Une annonce premium pensée pour valoriser le bien et rendre le suivi vendeur plus clair.",
      image: images[0].coverImage,
      sellerToken: `${agency.slug}-seller-demo-1`,
      documents: ["Mandat", "Diagnostics", "Offre", "Compromis"],
    },
    {
      id: `${agency.slug}-appartement-centre`,
      agencyId: agency.id,
      title: `Appartement rénové ${agency.city ? `à ${agency.city}` : "en centre-ville"}`,
      type: "Appartement",
      city: agency.city || "Bagnères-de-Bigorre",
      address: "Centre-ville",
      price: "214 000 €",
      surface: "72 m²",
      rooms: "3",
      bedrooms: "2",
      publicStatus: "Nouveauté",
      internalStatus: "Annonce publiée",
      nextVisit: "Mercredi 19 juin à 17h00",
      report:
        "Les visiteurs ont demandé des précisions sur les charges et le calendrier de signature.",
      description:
        "Un exemple de bien pour montrer la qualité de présentation disponible après activation.",
      image: images[1]?.coverImage ?? images[0].coverImage,
      sellerToken: `${agency.slug}-seller-demo-2`,
      documents: ["Mandat", "Diagnostics"],
    },
  ];
}

export function getSellerDemoProperty(agency: Agency) {
  return createDemoProperties(agency)[0];
}

export function buildManagerActivationEmail(
  agency: Agency,
  manager: TeamMember,
): EmailContent {
  const links = getAbsoluteAgencyLinks(agency.slug);
  const body = [
    `Bonjour ${manager.firstName || "à vous"},`,
    "",
    `Votre portail Signature Immobilier est activé pour ${agency.name}.`,
    "",
    `Lien unique de votre espace agence : ${links.portal}`,
    `Email de réception des demandes d’estimation : ${agency.estimationEmail}`,
    "",
    "Signature Immobilier ne remplace pas votre CRM. Il améliore ce que vos clients voient.",
    "Vos agents gardent leurs habitudes. Vos vendeurs découvrent une expérience plus claire, plus moderne et plus rassurante.",
    "",
    "Vous pouvez maintenant ajouter vos biens, gérer votre équipe, générer des accès vendeurs et recevoir vos demandes d’estimation.",
    "",
    "À bientôt,",
    "Hugo - Signature Immobilier",
  ].join("\n");

  return buildEmailContent({
    to: [manager.email],
    subject: "Votre portail Signature Immobilier est activé",
    body,
  });
}

export function buildLeadEmail(agency: Agency, lead: AgencyLead): EmailContent {
  const body = [
    `Nouvelle demande d’estimation reçue depuis le portail ${agency.name}.`,
    "",
    "Informations du prospect :",
    `Prénom : ${lead.firstName}`,
    `Nom : ${lead.lastName}`,
    `Email : ${lead.email}`,
    `Téléphone : ${lead.phone}`,
    "",
    "Informations du bien :",
    `Ville : ${lead.propertyCity}`,
    `Type de bien : ${lead.propertyType}`,
    `Surface : ${lead.surface}`,
    `Nombre de pièces : ${lead.rooms}`,
    `État du bien : ${lead.propertyState}`,
    `Extérieur : ${lead.exterior}`,
    `Garage / parking : ${lead.parking}`,
    `Délai de vente : ${lead.sellingDelay}`,
    "",
    "Message :",
    "Ce prospect souhaite être rappelé pour affiner son estimation.",
  ].join("\n");

  return buildEmailContent({
    to: [agency.estimationEmail],
    subject: `Nouvelle demande d’estimation - ${agency.name}`,
    body,
  });
}

export function buildEmailContent({
  to,
  subject,
  body,
}: {
  to: string[];
  subject: string;
  body: string;
}): EmailContent {
  const recipients = to.map(cleanEmail).filter(Boolean);
  const recipientValue = recipients.join(",");
  const encodedSubject = encodeURIComponent(subject);
  const encodedBody = encodeURIComponent(body);
  return {
    to: recipients,
    subject,
    body,
    gmailHref: `https://mail.google.com/mail/?view=cm&fs=1&to=${recipientValue}&su=${encodedSubject}&body=${encodedBody}`,
    mailtoHref: `mailto:${recipientValue}?subject=${encodedSubject}&body=${encodedBody}`,
  };
}

function mergeAgencies(stored: Agency[]) {
  const normalizedStored = stored.map(coerceAgency);
  const storedIds = new Set(normalizedStored.map((agency) => agency.id));
  const seeded = defaultAgencies.filter((agency) => !storedIds.has(agency.id));
  return [...normalizedStored, ...seeded].map(applyAgencyStatus);
}

function writeAgencies(agencies: Agency[]) {
  writeStored(AGENCIES_KEY, agencies.map(coerceAgency).map(applyAgencyStatus));
}

function coerceAgency(agency: Partial<Agency>): Agency {
  const now = new Date().toISOString();
  return {
    id: agency.id ?? `agency-${Date.now()}`,
    slug: normalizeSlug(agency.slug || agency.name || "agence"),
    name: agency.name?.trim() || "Agence",
    city: agency.city?.trim() ?? "",
    logoUrl: agency.logoUrl?.trim() ?? "",
    phone: agency.phone?.trim() ?? "",
    primaryColor: agency.primaryColor?.trim() || "#111111",
    status: agency.status ?? "demo",
    plan: agency.plan ?? "demo",
    estimationEmail: cleanEmail(agency.estimationEmail ?? agency.email ?? ""),
    publicEnabled: agency.publicEnabled ?? true,
    activatedAt: agency.activatedAt,
    createdAt: agency.createdAt ?? now,
    updatedAt: agency.updatedAt ?? agency.createdAt ?? now,
    features: agency.features ?? demoFeatures,
    email: cleanEmail(agency.email ?? ""),
  };
}

function ensureUniqueSlug(slug: string) {
  const base = normalizeSlug(slug);
  const existing = new Set(getAgencies().map((agency) => agency.slug));
  if (!existing.has(base)) return base;
  let index = 2;
  while (existing.has(`${base}-${index}`)) {
    index += 1;
  }
  return `${base}-${index}`;
}

function createFeatures(enabled: boolean): AgencyFeatures {
  return {
    canCreateProperties: enabled,
    canEditProperties: enabled,
    canGenerateSellerLinks: enabled,
    canReceiveLeads: enabled,
    canManageDocuments: enabled,
    canPublishProperties: enabled,
    canManageTeam: enabled,
  };
}

function normalizeSlug(value: string) {
  const slug = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "agence";
}

function cleanEmail(value: string) {
  return value.trim().toLowerCase();
}

function readStored<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch (error) {
    console.warn(`Lecture localStorage impossible pour ${key}`, error);
    return fallback;
  }
}

function writeStored<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Écriture localStorage impossible pour ${key}`, error);
  }
}
