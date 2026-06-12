import { agencyConfig } from "@/lib/agency-config";

export type AgencyStatus = "demo" | "active" | "disabled";
export type AgencyPlan = "demo" | "pilot";
export type TeamRole = "manager" | "agent";
export type TeamMemberStatus = "active" | "disabled";
export type AccessTokenType = "manager" | "agent" | "seller";
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
  phone: string;
  role: TeamRole;
  status: TeamMemberStatus;
  createdAt: string;
  updatedAt: string;
};

export type AccessToken = {
  id: string;
  token: string;
  type: AccessTokenType;
  agencyId: string;
  propertyId?: string;
  teamMemberId?: string;
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
  demoManager: string;
  demoAgent: string;
  demoSeller: string;
  demoEstimation: string;
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
  accessUrl?: string;
};

const AGENCIES_KEY = "signature_saas_agencies";
const REMOVED_AGENCIES_KEY = "signature_saas_removed_agencies";
const TEAM_KEY = "signature_saas_team_members";
const PROPERTIES_KEY = "signature_saas_properties";
const LEADS_KEY = "signature_saas_leads";
const TOKENS_KEY = "signature_saas_access_tokens";
const ACCESS_SESSION_KEY = "signature_saas_current_access";

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
    id: data.id ?? `agency-${Date.now()}-${randomId()}`,
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
    activatedAt: undefined,
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

export function removeAgency(id: string) {
  const agency = getAgencyById(id);
  const removedIds = readStored<string[]>(REMOVED_AGENCIES_KEY, []);
  writeStored(REMOVED_AGENCIES_KEY, Array.from(new Set([...removedIds, id])));
  writeStored(
    AGENCIES_KEY,
    readStored<Agency[]>(AGENCIES_KEY, []).filter((item) => item.id !== id),
  );
  writeStored(
    TEAM_KEY,
    readStored<TeamMember[]>(TEAM_KEY, []).filter(
      (member) => member.agencyId !== id,
    ),
  );
  writeStored(
    PROPERTIES_KEY,
    readStored<AgencyProperty[]>(PROPERTIES_KEY, []).filter(
      (property) => property.agencyId !== id,
    ),
  );
  writeStored(
    TOKENS_KEY,
    readStored<AccessToken[]>(TOKENS_KEY, []).filter(
      (token) => token.agencyId !== id,
    ),
  );
  if (agency) {
    writeStored(
      LEADS_KEY,
      readStored<AgencyLead[]>(LEADS_KEY, []).filter(
        (lead) => lead.agencySlug !== agency.slug,
      ),
    );
  }
  return true;
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
  return readStored<TeamMember[]>(TEAM_KEY, [])
    .map(coerceTeamMember)
    .filter((member) => member.agencyId === agencyId);
}

export function getManagers(agencyId: string) {
  return getTeamMembers(agencyId).filter((member) => member.role === "manager");
}

export function getAgents(agencyId: string) {
  return getTeamMembers(agencyId).filter((member) => member.role === "agent");
}

export function getActiveManagers(agencyId: string) {
  return getManagers(agencyId).filter((member) => member.status === "active");
}

export function addTeamMember(
  agencyId: string,
  data: Pick<
    TeamMember,
    "firstName" | "lastName" | "email" | "role"
  > &
    Partial<Pick<TeamMember, "phone" | "status">>,
) {
  const now = new Date().toISOString();
  const member: TeamMember = {
    id: `member-${Date.now()}-${randomId()}`,
    agencyId,
    firstName: data.firstName.trim(),
    lastName: data.lastName.trim(),
    email: cleanEmail(data.email),
    phone: data.phone?.trim() ?? "",
    role: data.role,
    status: data.status ?? "active",
    createdAt: now,
    updatedAt: now,
  };
  const existing = readStored<TeamMember[]>(TEAM_KEY, []).map(coerceTeamMember);
  writeStored(TEAM_KEY, [member, ...existing]);
  return member;
}

export function updateTeamMember(memberId: string, data: Partial<TeamMember>) {
  const now = new Date().toISOString();
  const nextMembers = readStored<TeamMember[]>(TEAM_KEY, [])
    .map(coerceTeamMember)
    .map((member) =>
      member.id === memberId
        ? {
            ...member,
            ...data,
            email: cleanEmail(data.email ?? member.email),
            phone: data.phone?.trim() ?? member.phone,
            updatedAt: now,
          }
        : member,
    );
  writeStored(TEAM_KEY, nextMembers);
  return nextMembers.find((member) => member.id === memberId) ?? null;
}

export function disableTeamMember(memberId: string) {
  return updateTeamMember(memberId, { status: "disabled" });
}

export function enableTeamMember(memberId: string) {
  return updateTeamMember(memberId, { status: "active" });
}

export function deleteTeamMember(memberId: string) {
  const nextMembers = readStored<TeamMember[]>(TEAM_KEY, [])
    .map(coerceTeamMember)
    .filter((member) => member.id !== memberId);
  writeStored(TEAM_KEY, nextMembers);
  writeStored(
    TOKENS_KEY,
    readStored<AccessToken[]>(TOKENS_KEY, []).filter(
      (token) => token.teamMemberId !== memberId,
    ),
  );
  return nextMembers;
}

export function getAgencyLinks(slug: string): AgencyLinks {
  return {
    demo: `/demo-agence/${slug}`,
    demoManager: `/demo-agence/${slug}/patron`,
    demoAgent: `/demo-agence/${slug}/agent`,
    demoSeller: `/demo-agence/${slug}/vendeur`,
    demoEstimation: `/demo-agence/${slug}/estimation`,
    portal: `/agence/${slug}`,
    estimation: `/agence/${slug}/estimation`,
    estimations: `/agence/${slug}/estimations`,
    team: `/agence/${slug}/equipe`,
    settings: `/agence/${slug}/settings`,
  };
}

export function getAbsoluteAgencyLinks(slug: string) {
  const origin = getPublicAppUrl();
  const links = getAgencyLinks(slug);
  return {
    demo: `${origin}${links.demo}`,
    demoManager: `${origin}${links.demoManager}`,
    demoAgent: `${origin}${links.demoAgent}`,
    demoSeller: `${origin}${links.demoSeller}`,
    demoEstimation: `${origin}${links.demoEstimation}`,
    portal: `${origin}${links.portal}`,
    estimation: `${origin}${links.estimation}`,
    estimations: `${origin}${links.estimations}`,
    team: `${origin}${links.team}`,
    settings: `${origin}${links.settings}`,
  };
}

export function getAgencyProperties(agency: Agency) {
  const stored = readStored<AgencyProperty[]>(PROPERTIES_KEY, []).map(
    coerceProperty,
  );
  const agencyProperties = stored.filter(
    (property) => property.agencyId === agency.id,
  );
  if (agency.status === "active" && agencyProperties.length)
    return agencyProperties;
  return createDemoProperties(agency);
}

export function getAgencyProperty(agency: Agency, propertyId: string) {
  return (
    getAgencyProperties(agency).find((property) => property.id === propertyId) ??
    null
  );
}

export function saveAgencyProperty(property: AgencyProperty) {
  const nextProperty = coerceProperty(property);
  const properties = readStored<AgencyProperty[]>(PROPERTIES_KEY, []).map(
    coerceProperty,
  );
  const nextProperties = [
    nextProperty,
    ...properties.filter((item) => item.id !== nextProperty.id),
  ];
  writeStored(PROPERTIES_KEY, nextProperties);
  return nextProperties.filter((item) => item.agencyId === nextProperty.agencyId);
}

export function createSellerAccessForProperty(property: AgencyProperty) {
  const access = createAccessToken({
    type: "seller",
    agencyId: property.agencyId,
    propertyId: property.id,
  });
  const updated = saveAgencyProperty({
    ...property,
    sellerToken: access.token,
  }).find((item) => item.id === property.id);
  return updated ?? { ...property, sellerToken: access.token };
}

export function getSellerAccessLink(property: AgencyProperty) {
  if (!property.sellerToken) return "";
  return `${getPublicAppUrl()}/vendeur?token=${encodeURIComponent(
    property.sellerToken,
  )}`;
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
    id: `lead-${Date.now()}-${randomId()}`,
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

export function createAccessToken(
  data: Pick<AccessToken, "type" | "agencyId"> &
    Partial<Pick<AccessToken, "propertyId" | "teamMemberId">>,
) {
  const createdAt = new Date().toISOString();
  const access: AccessToken = {
    id: `access-${Date.now()}-${randomId()}`,
    token: encodeAccessToken({
      type: data.type,
      agencyId: data.agencyId,
      propertyId: data.propertyId,
      teamMemberId: data.teamMemberId,
      createdAt,
      nonce: randomId(),
    }),
    type: data.type,
    agencyId: data.agencyId,
    propertyId: data.propertyId,
    teamMemberId: data.teamMemberId,
    createdAt,
  };
  const tokens = readStored<AccessToken[]>(TOKENS_KEY, []);
  writeStored(TOKENS_KEY, [
    access,
    ...tokens.filter(
      (token) =>
        !(
          token.type === access.type &&
          token.agencyId === access.agencyId &&
          token.propertyId === access.propertyId &&
          token.teamMemberId === access.teamMemberId
        ),
    ),
  ]);
  return access;
}

export function getAccessToken(tokenValue: string) {
  const stored = readStored<AccessToken[]>(TOKENS_KEY, []).find(
    (token) => token.token === tokenValue,
  );
  if (stored) return stored;
  return decodeAccessToken(tokenValue);
}

export function verifyAgencyAccessToken(tokenValue: string) {
  const access = getAccessToken(tokenValue);
  if (!access || (access.type !== "manager" && access.type !== "agent"))
    return null;

  const agency = getAgencyById(access.agencyId);
  if (!agency || agency.status !== "active") return null;

  const member = access.teamMemberId
    ? getTeamMembers(agency.id).find((item) => item.id === access.teamMemberId)
    : null;
  if (access.teamMemberId && (!member || member.status !== "active"))
    return null;

  return { access, agency, member };
}

export function saveAgencyAccessSession(access: AccessToken) {
  if (typeof window === "undefined") return;
  const value = JSON.stringify(access);
  window.sessionStorage.setItem(ACCESS_SESSION_KEY, value);
  window.localStorage.setItem(ACCESS_SESSION_KEY, value);
}

export function getCurrentAgencyAccess(agencyId?: string) {
  const access =
    readSessionStored<AccessToken | null>(ACCESS_SESSION_KEY, null) ??
    readStored<AccessToken | null>(ACCESS_SESSION_KEY, null);
  if (!access) return null;
  if (agencyId && access.agencyId !== agencyId) return null;
  return access;
}

export function getAgencyAccessUrl(access: AccessToken) {
  return `${getPublicAppUrl()}/acces/agence/${encodeURIComponent(
    access.token,
  )}`;
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
  const access = createAccessToken({
    type: "manager",
    agencyId: agency.id,
    teamMemberId: manager.id,
  });
  const accessUrl = getAgencyAccessUrl(access);
  const body = [
    `Bonjour ${manager.firstName || "à vous"},`,
    "",
    `Votre portail Signature Immobilier est maintenant activé pour ${agency.name}.`,
    "",
    "Accédez à votre espace agence ici :",
    "",
    `[ BOUTON : Accéder à mon espace agence ]`,
    accessUrl,
    "",
    "Depuis votre espace, vous pourrez :",
    "- ajouter vos biens",
    "- suivre les demandes d’estimation",
    "- gérer votre équipe",
    "- gérer les informations visibles par vos vendeurs",
    "",
    "Les demandes d’estimation seront envoyées à :",
    agency.estimationEmail,
    "",
    "Signature Immobilier ne remplace pas votre CRM.",
    "Il améliore ce que vos clients voient.",
    "",
    "À bientôt,",
    "Hugo — Signature Immobilier",
  ].join("\n");

  return {
    ...buildEmailContent({
      to: [manager.email],
      subject: "Votre portail Signature Immobilier est activé",
      body,
    }),
    accessUrl,
  };
}

export function buildLeadEmail(agency: Agency, lead: AgencyLead): EmailContent {
  const body = [
    "Nouvelle demande d’estimation reçue depuis votre portail Signature Immobilier.",
    "",
    "Informations vendeur :",
    `Prénom : ${lead.firstName}`,
    `Nom : ${lead.lastName}`,
    `Téléphone : ${lead.phone}`,
    `Email : ${lead.email}`,
    "",
    "Bien à estimer :",
    `Type de bien : ${lead.propertyType}`,
    `Ville : ${lead.propertyCity}`,
    `Délai de vente envisagé : ${lead.sellingDelay}`,
    "",
    "Réponses du parcours :",
    lead.answers ||
      [
        `Surface : ${lead.surface}`,
        `Nombre de pièces : ${lead.rooms}`,
        `État du bien : ${lead.propertyState}`,
        `Extérieur : ${lead.exterior || "Non renseigné"}`,
        `Garage / parking : ${lead.parking || "Non renseigné"}`,
      ].join("\n"),
    "",
    "Cette demande provient de votre portail vendeur Signature Immobilier.",
  ].join("\n");

  return buildEmailContent({
    to: [agency.estimationEmail],
    subject: `Nouvelle demande d’estimation — ${agency.name}`,
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
  const removedIds = new Set(readStored<string[]>(REMOVED_AGENCIES_KEY, []));
  const normalizedStored = stored
    .map(coerceAgency)
    .filter((agency) => !removedIds.has(agency.id));
  const storedIds = new Set(normalizedStored.map((agency) => agency.id));
  const seeded = defaultAgencies.filter(
    (agency) => !storedIds.has(agency.id) && !removedIds.has(agency.id),
  );
  return [...normalizedStored, ...seeded].map(applyAgencyStatus);
}

function writeAgencies(agencies: Agency[]) {
  writeStored(AGENCIES_KEY, agencies.map(coerceAgency).map(applyAgencyStatus));
}

function coerceAgency(agency: Partial<Agency>): Agency {
  const now = new Date().toISOString();
  return {
    id: agency.id ?? `agency-${Date.now()}-${randomId()}`,
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

function coerceTeamMember(member: Partial<TeamMember>): TeamMember {
  const now = new Date().toISOString();
  return {
    id: member.id ?? `member-${Date.now()}-${randomId()}`,
    agencyId: member.agencyId ?? "",
    firstName: member.firstName?.trim() ?? "",
    lastName: member.lastName?.trim() ?? "",
    email: cleanEmail(member.email ?? ""),
    phone: member.phone?.trim() ?? "",
    role: member.role ?? "agent",
    status: member.status ?? "active",
    createdAt: member.createdAt ?? now,
    updatedAt: member.updatedAt ?? member.createdAt ?? now,
  };
}

function coerceProperty(property: AgencyProperty): AgencyProperty {
  return {
    ...property,
    sellerToken: property.sellerToken ?? "",
    documents: property.documents ?? [],
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

function getPublicAppUrl() {
  const env = import.meta.env as Record<string, string | undefined>;
  return (
    env.NEXT_PUBLIC_APP_URL ||
    env.VITE_APP_URL ||
    "https://signature-immobilier-app.vercel.app"
  ).replace(/\/$/, "");
}

function randomId() {
  const random =
    typeof crypto !== "undefined" && "getRandomValues" in crypto
      ? Array.from(crypto.getRandomValues(new Uint32Array(2)))
          .map((value) => value.toString(16))
          .join("")
      : Math.random().toString(16).slice(2);
  return random.replace(/[^a-z0-9]/gi, "").slice(0, 18);
}

function encodeAccessToken(
  payload: Omit<AccessToken, "id" | "token"> & { nonce: string },
) {
  const json = JSON.stringify(payload);
  const encoded =
    typeof btoa === "function"
      ? btoa(json)
      : Buffer.from(json, "utf8").toString("base64");
  return encoded.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function decodeAccessToken(token: string): AccessToken | null {
  try {
    const normalized = token.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(
      normalized.length + ((4 - (normalized.length % 4)) % 4),
      "=",
    );
    const json =
      typeof atob === "function"
        ? atob(padded)
        : Buffer.from(padded, "base64").toString("utf8");
    const payload = JSON.parse(json) as Partial<AccessToken> & {
      nonce?: string;
    };
    if (!payload.type || !payload.agencyId || !payload.createdAt) return null;
    return {
      id: `decoded-${payload.createdAt}-${payload.nonce ?? "token"}`,
      token,
      type: payload.type,
      agencyId: payload.agencyId,
      propertyId: payload.propertyId,
      teamMemberId: payload.teamMemberId,
      createdAt: payload.createdAt,
    };
  } catch {
    return null;
  }
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

function readSessionStored<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.sessionStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch (error) {
    console.warn(`Lecture sessionStorage impossible pour ${key}`, error);
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
