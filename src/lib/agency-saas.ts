import { agencyConfig } from "@/lib/agency-config";
import { isValidEmail } from "@/lib/email-utils";
import {
  buildInviteEmailBody,
  getInviteEmailSubject,
  isInviteAccessType,
  type InviteAccessType,
} from "@/lib/invite-email";

export type AgencyStatus = "demo" | "active" | "disabled";
export type AgencyPlan = "demo" | "pilot";
export type TeamRole = "manager" | "agent";
export type TeamMemberStatus = "invited" | "active" | "disabled";
export type AccessTokenType = "manager" | "agent" | "seller" | InviteAccessType;
export type LeadStatus = "new" | "contacted" | "archived";
export type AgencyLeadStatus = LeadStatus;
export type PropertyPublicStatus =
  | "none"
  | "new"
  | "exclusive"
  | "favorite"
  | "Disponible"
  | "Nouveauté"
  | "Exclusivité"
  | "Sous offre"
  | "Vendu"
  | "Coup de cœur";
export type PropertyInternalProgress =
  | "mandate_signed"
  | "published"
  | "visits"
  | "offer_received"
  | "compromise_signed"
  | "sold";
export type VisitStatus = "planned" | "done" | "cancelled";
export type DocumentType =
  | "Mandat"
  | "Diagnostics"
  | "Offre"
  | "Compromis"
  | "Autre";

export type PropertyPhoto = {
  id: string;
  propertyId: string;
  url: string;
  storagePath?: string;
  name?: string;
  size?: number;
  type?: string;
  alt: string;
  isMain: boolean;
  order: number;
  createdAt: string;
};

export type Visit = {
  id: string;
  propertyId: string;
  date: string;
  time: string;
  visitorName: string;
  visitorPhone: string;
  note: string;
  status: VisitStatus;
  createdAt: string;
};

export type VisitReport = {
  id: string;
  propertyId: string;
  visitId?: string;
  title: string;
  content: string;
  visibleToSeller: boolean;
  createdAt: string;
};

export type PropertyDocument = {
  id: string;
  propertyId: string;
  name: string;
  type: DocumentType;
  documentType?: DocumentType;
  storagePath?: string;
  url: string;
  fileName?: string;
  size?: number;
  mimeType?: string;
  visibleToSeller: boolean;
  createdAt: string;
};

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
  agencySlug?: string;
  propertyId?: string;
  teamMemberId?: string;
  sellerId?: string;
  sellerToken?: string;
  email?: string;
  status?: "pending" | "used" | "expired" | "revoked";
  createdAt: string;
  usedAt?: string;
  expiresAt?: string;
  passwordHash?: string;
};

export type AgencyProperty = {
  id: string;
  agencyId: string;
  agencySlug: string;
  slug: string;
  title: string;
  type: string;
  city: string;
  address: string;
  addressOrDistrict: string;
  price: string;
  surface: string;
  rooms: string;
  bedrooms: string;
  publicStatus: PropertyPublicStatus;
  internalProgress: PropertyInternalProgress;
  internalStatus: string;
  isPublished: boolean;
  nextVisit: string;
  report: string;
  description: string;
  image: string;
  imageUrl: string;
  photos: PropertyPhoto[];
  sellerToken: string;
  sellerFirstName: string;
  sellerLastName: string;
  sellerEmail: string;
  sellerPhone: string;
  documents: string[];
  propertyDocuments: PropertyDocument[];
  visits: Visit[];
  visitReports: VisitReport[];
  createdAt: string;
  updatedAt: string;
};

export type SellerInviteInput = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

export type InviteAccessLookup =
  | {
      status: "valid";
      access: AccessToken;
      agency: Agency;
      member?: TeamMember | null;
      property?: AgencyProperty | null;
    }
  | {
      status: "invalid" | "used" | "expired" | "disabled";
      title: string;
      message: string;
      access?: AccessToken | null;
      agency?: Agency | null;
      member?: TeamMember | null;
      property?: AgencyProperty | null;
    };

export type AgencyLead = {
  id: string;
  agencyId?: string;
  agencySlug: string;
  agencyName: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  propertyAddress?: string;
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
  estimatedRangeMin?: string;
  estimatedRangeMax?: string;
  message?: string;
  assignedAgentId?: string;
  answers?: string;
  status: AgencyLeadStatus;
  createdAt: string;
  updatedAt: string;
};

export type VisitRequest = {
  id: string;
  agencyId: string;
  agencySlug: string;
  propertyId: string;
  propertyTitle: string;
  propertyCity: string;
  propertyPrice: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  buyerSituation: string;
  financingStatus: string;
  buyingTimeline: string;
  message: string;
  status: LeadStatus;
  createdAt: string;
  updatedAt: string;
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
export const ESTIMATION_LEADS_KEY = "signature_estimation_leads";
const LEGACY_LEADS_KEY = "signature_saas_leads";
export const VISIT_REQUESTS_KEY = "signature_visit_requests";
export const ACCESS_TOKENS_KEY = "signature_access_tokens";
const LEGACY_TOKENS_KEY = "signature_saas_access_tokens";
const ACCESS_SESSION_KEY = "signature_saas_current_access";
const STORAGE_RESET_NOTICE_KEY = "signature_saas_storage_reset";

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
  return mergeAgencies(readStored<unknown[]>(AGENCIES_KEY, []));
}

export function getPrimaryPublicAgency() {
  const agencies = getAgencies();
  return (
    agencies.find(
      (agency) => agency.status === "active" && agency.publicEnabled,
    ) ??
    agencies.find((agency) => agency.publicEnabled) ??
    agencies[0] ??
    null
  );
}

export function getAgencyBySlug(slug: string) {
  return getAgencies().find((agency) => agency.slug === slug) ?? null;
}

export function getAgencyById(id: string) {
  return getAgencies().find((agency) => agency.id === id) ?? null;
}

export function getAgencyNotificationRecipients(
  agency: Agency,
  _property?: AgencyProperty | null,
) {
  const recipients = [
    agency.estimationEmail,
    agency.email,
    ...getManagers(agency.id)
      .filter((manager) => manager.status === "active")
      .map((manager) => manager.email),
    ...getAgents(agency.id)
      .filter((agent) => agent.status === "active")
      .map((agent) => agent.email),
  ]
    .filter((email): email is string => Boolean(email))
    .map(cleanEmail)
    .filter(isValidEmail);

  return Array.from(new Set(recipients));
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
  const removedIds = safeStringArray(
    readStored<unknown[]>(REMOVED_AGENCIES_KEY, []),
  );
  writeStored(REMOVED_AGENCIES_KEY, Array.from(new Set([...removedIds, id])));
  writeStored(
    AGENCIES_KEY,
    readStored<Partial<Agency>[]>(AGENCIES_KEY, [])
      .map(coerceAgency)
      .filter((item) => item.id !== id),
  );
  writeStored(
    TEAM_KEY,
    readStored<Partial<TeamMember>[]>(TEAM_KEY, [])
      .map(coerceTeamMember)
      .filter((member) => member.agencyId !== id),
  );
  writeStored(
    PROPERTIES_KEY,
    readStored<Partial<AgencyProperty>[]>(PROPERTIES_KEY, [])
      .map(coerceProperty)
      .filter((property) => property.agencyId !== id),
  );
  deleteAccessTokensForAgency(id);
  if (agency) {
    saveEstimationLeads(
      getEstimationLeads().filter((lead) => lead.agencySlug !== agency.slug),
    );
    saveVisitRequests(
      getVisitRequests().filter((request) => request.agencyId !== agency.id),
    );
  }
  return true;
}

export function consumeStorageResetNotice() {
  if (typeof window === "undefined") return false;
  try {
    const value = window.sessionStorage.getItem(STORAGE_RESET_NOTICE_KEY);
    window.sessionStorage.removeItem(STORAGE_RESET_NOTICE_KEY);
    return value === "true";
  } catch (error) {
    console.warn("Lecture de notification locale impossible", error);
    return false;
  }
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
  data: Pick<TeamMember, "firstName" | "lastName" | "email" | "role"> &
    Partial<Pick<TeamMember, "id" | "phone" | "status">>,
) {
  const now = new Date().toISOString();
  const member: TeamMember = {
    id: data.id ?? `member-${Date.now()}-${randomId()}`,
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
  deleteAccessTokensForMember(memberId);
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
  const origin = getAppBaseUrl();
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
    getAgencyProperties(agency).find(
      (property) => property.id === propertyId || property.slug === propertyId,
    ) ?? null
  );
}

export function getAllStoredProperties() {
  return readStored<Partial<AgencyProperty>[]>(PROPERTIES_KEY, []).map(
    coerceProperty,
  );
}

export function getPublicProperties() {
  const activeAgencies = getAgencies().filter(
    (agency) => agency.status === "active" && agency.publicEnabled,
  );
  const activeAgencyIds = new Set(activeAgencies.map((agency) => agency.id));
  const storedPublished = getAllStoredProperties().filter(
    (property) =>
      activeAgencyIds.has(property.agencyId) && property.isPublished,
  );

  if (storedPublished.length) {
    return storedPublished.sort((a, b) =>
      b.updatedAt.localeCompare(a.updatedAt),
    );
  }

  const fallbackAgency =
    activeAgencies[0] ?? getAgencies().find((agency) => agency.publicEnabled);
  return fallbackAgency ? createDemoProperties(fallbackAgency) : [];
}

export function getPublicProperty(propertyIdOrSlug: string) {
  return (
    getPublicProperties().find(
      (property) =>
        property.id === propertyIdOrSlug || property.slug === propertyIdOrSlug,
    ) ?? null
  );
}

export function getPublicPropertyUrl(property: AgencyProperty) {
  return `/biens/${encodeURIComponent(property.slug || property.id)}`;
}

export function saveAgencyProperty(
  property: Partial<AgencyProperty> & Pick<AgencyProperty, "id" | "agencyId">,
) {
  const nextProperty = coerceProperty(property);
  const properties = readStored<AgencyProperty[]>(PROPERTIES_KEY, []).map(
    coerceProperty,
  );
  const nextProperties = [
    nextProperty,
    ...properties.filter((item) => item.id !== nextProperty.id),
  ];
  writeStored(PROPERTIES_KEY, nextProperties);
  return nextProperties.filter(
    (item) => item.agencyId === nextProperty.agencyId,
  );
}

export function updateAgencyProperty(
  property: AgencyProperty,
  patch: Partial<AgencyProperty>,
) {
  const updated = saveAgencyProperty({
    ...property,
    ...patch,
    updatedAt: new Date().toISOString(),
  }).find((item) => item.id === property.id);
  return updated ?? coerceProperty({ ...property, ...patch });
}

export function addPropertyPhoto(
  property: AgencyProperty,
  data: Pick<PropertyPhoto, "url" | "alt"> &
    Partial<
      Pick<PropertyPhoto, "storagePath" | "name" | "size" | "type" | "isMain">
    >,
) {
  const now = new Date().toISOString();
  const photo: PropertyPhoto = {
    id: `photo-${Date.now()}-${randomId()}`,
    propertyId: property.id,
    url: data.url.trim(),
    storagePath: data.storagePath?.trim() ?? "",
    name: data.name?.trim() ?? "",
    size: data.size ?? 0,
    type: data.type?.trim() ?? "",
    alt: data.alt.trim() || property.title,
    isMain: Boolean(data.isMain) || property.photos.length === 0,
    order: property.photos.length + 1,
    createdAt: now,
  };
  const nextPhotos = [
    ...property.photos.map((item) =>
      photo.isMain ? { ...item, isMain: false } : item,
    ),
    photo,
  ];
  return updateAgencyProperty(property, {
    photos: nextPhotos,
    imageUrl: photo.isMain ? photo.url : property.imageUrl,
    image: photo.isMain ? photo.url : property.image,
  });
}

export function setMainPropertyPhoto(
  property: AgencyProperty,
  photoId: string,
) {
  const nextPhotos = property.photos.map((photo) => ({
    ...photo,
    isMain: photo.id === photoId,
  }));
  const mainPhoto = nextPhotos.find((photo) => photo.isMain);
  return updateAgencyProperty(property, {
    photos: nextPhotos,
    imageUrl: mainPhoto?.url ?? property.imageUrl,
    image: mainPhoto?.url ?? property.image,
  });
}

export function deletePropertyPhoto(property: AgencyProperty, photoId: string) {
  const nextPhotos = property.photos.filter((photo) => photo.id !== photoId);
  const hasMain = nextPhotos.some((photo) => photo.isMain);
  const normalizedPhotos = nextPhotos.map((photo, index) => ({
    ...photo,
    order: index + 1,
    isMain: hasMain ? photo.isMain : index === 0,
  }));
  const mainPhoto = normalizedPhotos.find((photo) => photo.isMain);
  return updateAgencyProperty(property, {
    photos: normalizedPhotos,
    imageUrl: mainPhoto?.url ?? property.imageUrl,
    image: mainPhoto?.url ?? property.image,
  });
}

export function addPropertyVisit(
  property: AgencyProperty,
  data: Omit<Visit, "id" | "propertyId" | "status" | "createdAt">,
) {
  const visit: Visit = {
    ...data,
    id: `visit-${Date.now()}-${randomId()}`,
    propertyId: property.id,
    status: "planned",
    createdAt: new Date().toISOString(),
  };
  return updateAgencyProperty(property, {
    visits: [visit, ...property.visits],
    nextVisit: formatVisitLabel(visit),
  });
}

export function updatePropertyVisitStatus(
  property: AgencyProperty,
  visitId: string,
  status: VisitStatus,
) {
  const visits = property.visits.map((visit) =>
    visit.id === visitId ? { ...visit, status } : visit,
  );
  return updateAgencyProperty(property, {
    visits,
    nextVisit: getNextVisitLabelFromVisits(visits),
  });
}

export function deletePropertyVisit(property: AgencyProperty, visitId: string) {
  const visits = property.visits.filter((visit) => visit.id !== visitId);
  return updateAgencyProperty(property, {
    visits,
    nextVisit: getNextVisitLabelFromVisits(visits),
  });
}

export function addVisitReport(
  property: AgencyProperty,
  data: Omit<VisitReport, "id" | "propertyId" | "createdAt">,
) {
  const report: VisitReport = {
    ...data,
    id: `visit-report-${Date.now()}-${randomId()}`,
    propertyId: property.id,
    createdAt: new Date().toISOString(),
  };
  return updateAgencyProperty(property, {
    visitReports: [report, ...property.visitReports],
    report: report.visibleToSeller ? report.content : property.report,
  });
}

export function updateVisitReportVisibility(
  property: AgencyProperty,
  reportId: string,
  visibleToSeller: boolean,
) {
  const visitReports = property.visitReports.map((report) =>
    report.id === reportId ? { ...report, visibleToSeller } : report,
  );
  const latestVisible = visitReports.find((report) => report.visibleToSeller);
  return updateAgencyProperty(property, {
    visitReports,
    report: latestVisible?.content ?? property.report,
  });
}

export function deleteVisitReport(property: AgencyProperty, reportId: string) {
  return updateAgencyProperty(property, {
    visitReports: property.visitReports.filter(
      (report) => report.id !== reportId,
    ),
  });
}

export function addPropertyDocument(
  property: AgencyProperty,
  data: Pick<PropertyDocument, "name" | "type" | "url" | "visibleToSeller"> &
    Partial<
      Pick<
        PropertyDocument,
        "documentType" | "storagePath" | "fileName" | "size" | "mimeType"
      >
    >,
) {
  const document: PropertyDocument = {
    ...data,
    id: `document-${Date.now()}-${randomId()}`,
    propertyId: property.id,
    type: data.type,
    documentType: data.documentType ?? data.type,
    storagePath: data.storagePath?.trim() ?? "",
    fileName: data.fileName?.trim() ?? "",
    size: data.size ?? 0,
    mimeType: data.mimeType?.trim() ?? "",
    createdAt: new Date().toISOString(),
  };
  return updateAgencyProperty(property, {
    propertyDocuments: [document, ...property.propertyDocuments],
    documents: [
      document.name,
      ...property.documents.filter((item) => item !== document.name),
    ],
  });
}

export function updatePropertyDocumentVisibility(
  property: AgencyProperty,
  documentId: string,
  visibleToSeller: boolean,
) {
  return updateAgencyProperty(property, {
    propertyDocuments: property.propertyDocuments.map((document) =>
      document.id === documentId ? { ...document, visibleToSeller } : document,
    ),
  });
}

export function deletePropertyDocument(
  property: AgencyProperty,
  documentId: string,
) {
  const propertyDocuments = property.propertyDocuments.filter(
    (document) => document.id !== documentId,
  );
  return updateAgencyProperty(property, {
    propertyDocuments,
    documents: propertyDocuments.map((document) => document.name),
  });
}

export function createSellerAccessForProperty(property: AgencyProperty) {
  const sellerToken = property.sellerToken || generateAccessTokenValue();
  const updated = saveAgencyProperty({
    ...property,
    sellerToken,
  }).find((item) => item.id === property.id);
  return updated ?? { ...property, sellerToken };
}

export function getSellerAccessLink(property: AgencyProperty) {
  if (!property.sellerToken) return "";
  const agency = getAgencyById(property.agencyId);
  if (!agency) return "";
  return getAgencySellerAccessUrl(agency, property.sellerToken);
}

export function getAgencySellerAccessUrl(agency: Agency, sellerToken: string) {
  return `${getAppBaseUrl()}/agence/${encodeURIComponent(
    agency.slug,
  )}/vendeur/${encodeURIComponent(sellerToken)}`;
}

export function findAgencyPropertyBySellerToken(
  agency: Agency,
  sellerToken: string,
) {
  return (
    getAgencyProperties(agency).find(
      (property) => property.sellerToken === sellerToken,
    ) ?? null
  );
}

export function createSellerInviteForProperty(
  agency: Agency,
  property: AgencyProperty,
  seller: SellerInviteInput,
) {
  const sellerToken = property.sellerToken || generateAccessTokenValue();
  const updatedProperty = saveAgencyProperty({
    ...property,
    sellerToken,
    sellerFirstName: seller.firstName.trim(),
    sellerLastName: seller.lastName.trim(),
    sellerEmail: cleanEmail(seller.email),
    sellerPhone: seller.phone.trim(),
  }).find((item) => item.id === property.id) ?? {
    ...property,
    sellerToken,
    sellerFirstName: seller.firstName.trim(),
    sellerLastName: seller.lastName.trim(),
    sellerEmail: cleanEmail(seller.email),
    sellerPhone: seller.phone.trim(),
  };
  const access = createInviteAccessToken({
    type: "seller_invite",
    agencyId: agency.id,
    agencySlug: agency.slug,
    propertyId: updatedProperty.id,
    sellerToken,
    email: seller.email,
  });

  return {
    property: updatedProperty,
    access,
    email: buildSellerInviteEmail(agency, updatedProperty, seller, access),
  };
}

export function getEstimationLeads() {
  const leads = readStored<Partial<AgencyLead>[]>(ESTIMATION_LEADS_KEY, []).map(
    coerceLead,
  );
  const legacyLeads = readStored<Partial<AgencyLead>[]>(
    LEGACY_LEADS_KEY,
    [],
  ).map(coerceLead);
  const byId = new Map<string, AgencyLead>();

  [...legacyLeads, ...leads].forEach((lead) => {
    if (lead.id) byId.set(lead.id, lead);
  });

  const nextLeads = Array.from(byId.values());
  const hasLegacyLeadToMigrate = legacyLeads.some(
    (legacyLead) => !leads.some((lead) => lead.id === legacyLead.id),
  );
  if (
    legacyLeads.length &&
    (hasLegacyLeadToMigrate || nextLeads.length !== leads.length)
  ) {
    saveEstimationLeads(nextLeads);
  }

  return nextLeads;
}

export function saveEstimationLeads(leads: AgencyLead[]) {
  writeStored(ESTIMATION_LEADS_KEY, leads.map(coerceLead));
}

export function getAgencyLeads(slug: string) {
  return getEstimationLeads().filter((lead) => lead.agencySlug === slug);
}

export function saveAgencyLead(
  lead: Omit<AgencyLead, "id" | "createdAt" | "updatedAt" | "status">,
) {
  const now = new Date().toISOString();
  const nextLead: AgencyLead = {
    ...lead,
    id: `lead-${Date.now()}-${randomId()}`,
    createdAt: now,
    updatedAt: now,
    status: "new",
  };
  saveEstimationLeads([nextLead, ...getEstimationLeads()]);
  return nextLead;
}

export function updateAgencyLeadStatus(id: string, status: AgencyLeadStatus) {
  const leads = getEstimationLeads();
  const nextLeads = leads.map((lead) =>
    lead.id === id
      ? { ...lead, status, updatedAt: new Date().toISOString() }
      : lead,
  );
  saveEstimationLeads(nextLeads);
  return nextLeads;
}

export function getVisitRequests() {
  return readStored<Partial<VisitRequest>[]>(VISIT_REQUESTS_KEY, []).map(
    coerceVisitRequest,
  );
}

export function saveVisitRequests(requests: VisitRequest[]) {
  writeStored(VISIT_REQUESTS_KEY, requests.map(coerceVisitRequest));
}

export function createVisitRequest(
  data: Omit<VisitRequest, "id" | "createdAt" | "updatedAt" | "status">,
) {
  const now = new Date().toISOString();
  const request: VisitRequest = {
    ...data,
    id: `visit-request-${Date.now()}-${randomId()}`,
    status: "new",
    createdAt: now,
    updatedAt: now,
  };
  saveVisitRequests([request, ...getVisitRequests()]);
  return request;
}

export function getVisitRequestsByAgency(agencyId: string) {
  return getVisitRequests().filter((request) => request.agencyId === agencyId);
}

export function getVisitRequestsByProperty(propertyId: string) {
  return getVisitRequests().filter(
    (request) => request.propertyId === propertyId,
  );
}

export function updateVisitRequestStatus(id: string, status: LeadStatus) {
  const requests = getVisitRequests().map((request) =>
    request.id === id
      ? { ...request, status, updatedAt: new Date().toISOString() }
      : request,
  );
  saveVisitRequests(requests);
  return requests;
}

export function getAccessTokens() {
  const tokens = readStored<Partial<AccessToken>[]>(ACCESS_TOKENS_KEY, []).map(
    coerceAccessToken,
  );
  const legacyTokens = readStored<Partial<AccessToken>[]>(
    LEGACY_TOKENS_KEY,
    [],
  ).map(coerceAccessToken);
  const byToken = new Map<string, AccessToken>();

  [...legacyTokens, ...tokens].forEach((token) => {
    if (token.token) byToken.set(token.token, token);
  });

  const nextTokens = Array.from(byToken.values());
  const hasLegacyTokenToMigrate = legacyTokens.some(
    (legacyToken) =>
      legacyToken.token &&
      !tokens.some((token) => token.token === legacyToken.token),
  );
  if (
    legacyTokens.length &&
    (hasLegacyTokenToMigrate || nextTokens.length !== tokens.length)
  ) {
    saveAccessTokens(nextTokens);
  }

  return nextTokens;
}

export function saveAccessTokens(tokens: AccessToken[]) {
  writeStored(ACCESS_TOKENS_KEY, tokens.map(coerceAccessToken));
}

export function getAccessTokenByToken(tokenValue: string) {
  return (
    getAccessTokens().find((token) => token.token === tokenValue) ??
    decodeAccessToken(tokenValue)
  );
}

export function markAccessTokenUsed(
  tokenValue: string,
  data: Partial<AccessToken> = {},
) {
  const usedAt = data.usedAt ?? new Date().toISOString();
  const nextTokens = getAccessTokens().map((token) =>
    token.token === tokenValue ? { ...token, ...data, usedAt } : token,
  );
  saveAccessTokens(nextTokens);
  return nextTokens.find((token) => token.token === tokenValue) ?? null;
}

export function deleteAccessTokensForMember(memberId: string) {
  saveAccessTokens(
    getAccessTokens().filter((token) => token.teamMemberId !== memberId),
  );
}

export function deleteAccessTokensForAgency(agencyId: string) {
  saveAccessTokens(
    getAccessTokens().filter((token) => token.agencyId !== agencyId),
  );
}

export function createAccessToken(
  data: Pick<AccessToken, "type" | "agencyId"> &
    Partial<
      Pick<
        AccessToken,
        | "agencySlug"
        | "propertyId"
        | "teamMemberId"
        | "sellerId"
        | "sellerToken"
        | "email"
      >
    >,
) {
  const createdAt = new Date().toISOString();
  const access: AccessToken = {
    id: `access-${Date.now()}-${randomId()}`,
    token: encodeAccessToken({
      type: data.type,
      agencyId: data.agencyId,
      agencySlug: data.agencySlug,
      propertyId: data.propertyId,
      teamMemberId: data.teamMemberId,
      createdAt,
      nonce: randomId(),
    }),
    type: data.type,
    agencyId: data.agencyId,
    agencySlug: data.agencySlug,
    propertyId: data.propertyId,
    teamMemberId: data.teamMemberId,
    sellerId: data.sellerId,
    sellerToken: data.sellerToken,
    email: data.email ? cleanEmail(data.email) : undefined,
    createdAt,
  };
  const tokens = getAccessTokens();
  saveAccessTokens([
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

export function createInviteAccessToken(
  data: Pick<AccessToken, "agencyId" | "type" | "email"> &
    Partial<
      Pick<
        AccessToken,
        | "agencySlug"
        | "propertyId"
        | "teamMemberId"
        | "sellerId"
        | "sellerToken"
        | "expiresAt"
      >
    >,
) {
  if (!isInviteAccessType(data.type)) {
    throw new Error("Invalid invite access type");
  }

  const createdAt = new Date().toISOString();
  const access: AccessToken = {
    id: `access-${Date.now()}-${randomId()}`,
    token: generateAccessTokenValue(),
    type: data.type,
    agencyId: data.agencyId,
    agencySlug: data.agencySlug,
    propertyId: data.propertyId,
    teamMemberId: data.teamMemberId,
    sellerId: data.sellerId,
    sellerToken: data.sellerToken,
    email: cleanEmail(data.email ?? ""),
    status: "pending",
    createdAt,
    expiresAt: data.expiresAt,
  };
  const tokens = getAccessTokens();
  saveAccessTokens([
    access,
    ...tokens.filter(
      (token) =>
        !(
          token.type === access.type &&
          token.agencyId === access.agencyId &&
          token.propertyId === access.propertyId &&
          token.teamMemberId === access.teamMemberId &&
          token.sellerId === access.sellerId &&
          !token.usedAt
        ),
    ),
  ]);
  return access;
}

export function getAccessToken(tokenValue: string) {
  return getAccessTokenByToken(tokenValue);
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

export function getInviteAccessUrl(access: AccessToken) {
  return `${getAppBaseUrl()}/creer-acces/${encodeURIComponent(access.token)}`;
}

export function createTeamMemberInviteEmail(
  agency: Agency,
  member: TeamMember,
) {
  const access = createInviteAccessToken({
    type: member.role === "manager" ? "manager_invite" : "agent_invite",
    agencyId: agency.id,
    agencySlug: agency.slug,
    teamMemberId: member.id,
    email: member.email,
  });

  return member.role === "manager"
    ? buildManagerInviteEmail(agency, member, access)
    : buildAgentInviteEmail(agency, member, access);
}

export function getInviteAccessByToken(tokenValue: string): InviteAccessLookup {
  const access = getAccessToken(tokenValue);
  if (!access || !isInviteAccessType(access.type)) {
    return invalidInviteResult();
  }

  if (access.status === "used" || access.usedAt) {
    return invalidInviteResult("used", access);
  }

  if (access.status === "revoked") {
    return invalidInviteResult("invalid", access);
  }

  if (
    access.status === "expired" ||
    (access.expiresAt && new Date(access.expiresAt).getTime() < Date.now())
  ) {
    return invalidInviteResult("expired", access);
  }

  const agency = getAgencyById(access.agencyId);
  if (!agency) return invalidInviteResult("invalid", access);

  if (agency.status === "disabled") {
    return {
      status: "disabled",
      title: "Ce portail est actuellement désactivé.",
      message: "Contactez Signature Immobilier pour réactiver votre accès.",
      access,
      agency,
    };
  }

  if (access.type === "manager_invite" || access.type === "agent_invite") {
    const member = access.teamMemberId
      ? getTeamMembers(agency.id).find(
          (item) => item.id === access.teamMemberId,
        )
      : null;

    if (!member) return invalidInviteResult("invalid", access, agency);
    if (member.status === "disabled") {
      return {
        status: "disabled",
        title: "Votre accès est désactivé.",
        message: "Contactez votre agence pour réactiver votre accès.",
        access,
        agency,
        member,
      };
    }

    return { status: "valid", access, agency, member };
  }

  const property = access.propertyId
    ? getAgencyProperty(agency, access.propertyId)
    : access.sellerToken
      ? findAgencyPropertyBySellerToken(agency, access.sellerToken)
      : null;

  if (!property) return invalidInviteResult("invalid", access, agency);

  return { status: "valid", access, agency, property };
}

export function activateInviteAccess(tokenValue: string, password: string) {
  const lookup = getInviteAccessByToken(tokenValue);
  if (lookup.status !== "valid") return lookup;

  const now = new Date().toISOString();
  const activatedAccess = markAccessTokenUsed(lookup.access.token, {
    usedAt: now,
    passwordHash: createPilotPasswordMarker(password),
  });
  const access = activatedAccess ?? { ...lookup.access, usedAt: now };

  if (
    (access.type === "manager_invite" || access.type === "agent_invite") &&
    lookup.member
  ) {
    updateTeamMember(lookup.member.id, { status: "active" });
    saveAgencyAccessSession({
      ...access,
      type: access.type === "manager_invite" ? "manager" : "agent",
    });
  }

  if (access.type === "seller_invite") {
    saveAgencyAccessSession({ ...access, type: "seller" });
  }

  return {
    ...lookup,
    access,
    redirectPath: getInviteRedirectPath(access, lookup.agency, lookup.property),
  };
}

export function getInviteRedirectPath(
  access: AccessToken,
  agency: Agency,
  property?: AgencyProperty | null,
) {
  if (access.type === "seller_invite") {
    const sellerToken = access.sellerToken || property?.sellerToken || "";
    return `/agence/${agency.slug}/vendeur/${sellerToken}`;
  }

  return `/agence/${agency.slug}`;
}

export function saveAgencyAccessSession(access: AccessToken) {
  if (typeof window === "undefined") return;
  const value = JSON.stringify(access);
  window.sessionStorage.setItem(ACCESS_SESSION_KEY, value);
  window.localStorage.setItem(ACCESS_SESSION_KEY, value);
}

export function getCurrentAgencyAccess(agencyId?: string) {
  const rawAccess =
    readSessionStored<Partial<AccessToken> | null>(ACCESS_SESSION_KEY, null) ??
    readStored<Partial<AccessToken> | null>(ACCESS_SESSION_KEY, null);
  if (!isRecord(rawAccess)) return null;
  const access = coerceAccessToken(rawAccess);
  if (!access.token || !access.agencyId) return null;
  if (agencyId && access.agencyId !== agencyId) return null;
  const agency = getAgencyById(access.agencyId);
  if (!agency || agency.status === "disabled") return null;
  if (
    access.teamMemberId &&
    (access.type === "manager" || access.type === "agent")
  ) {
    const member = getTeamMembers(access.agencyId).find(
      (item) => item.id === access.teamMemberId,
    );
    if (!member || member.status !== "active") return null;
  }
  return access;
}

export function getAgencyAccessUrl(access: AccessToken) {
  return `${getAppBaseUrl()}/acces/agence/${encodeURIComponent(access.token)}`;
}

export function createDemoProperties(agency: Agency): AgencyProperty[] {
  const images = agencyConfig.properties;
  const now = defaultTimestamp;
  const firstImage = images[0].coverImage;
  const secondImage = images[1]?.coverImage ?? firstImage;
  return [
    {
      id: `${agency.slug}-maison-familiale`,
      agencyId: agency.id,
      agencySlug: agency.slug,
      slug: `${agency.slug}-maison-familiale`,
      title: `Maison familiale ${agency.city ? `à ${agency.city}` : "avec jardin"}`,
      type: "Maison",
      city: agency.city || "Tarbes",
      address: "Quartier résidentiel",
      addressOrDistrict: "Quartier résidentiel",
      price: "356 000 €",
      surface: "124 m²",
      rooms: "5",
      bedrooms: "4",
      publicStatus: "exclusive",
      internalProgress: "visits",
      internalStatus: "Visites en cours",
      isPublished: true,
      nextVisit: "Samedi 15 juin à 10h30",
      report:
        "Visite sérieuse. Les acheteurs ont apprécié la luminosité et l’emplacement. Ils souhaitent revoir le bien avec un proche avant de se positionner.",
      description:
        "Une annonce premium pensée pour valoriser le bien et rendre le suivi vendeur plus clair.",
      image: firstImage,
      imageUrl: firstImage,
      photos: [
        {
          id: `${agency.slug}-maison-photo-1`,
          propertyId: `${agency.slug}-maison-familiale`,
          url: firstImage,
          alt: "Maison familiale",
          isMain: true,
          order: 1,
          createdAt: now,
        },
      ],
      sellerToken: `${agency.slug}-seller-demo-1`,
      sellerFirstName: "Claire",
      sellerLastName: "Martin",
      sellerEmail: "claire.martin@example.com",
      sellerPhone: "06 00 00 00 00",
      documents: ["Mandat", "Diagnostics", "Offre", "Compromis"],
      propertyDocuments: ["Mandat", "Diagnostics", "Offre", "Compromis"].map(
        (name, index) => ({
          id: `${agency.slug}-maison-document-${index + 1}`,
          propertyId: `${agency.slug}-maison-familiale`,
          name,
          type: isDocumentType(name) ? name : "Autre",
          url: "",
          visibleToSeller: true,
          createdAt: now,
        }),
      ),
      visits: [
        {
          id: `${agency.slug}-maison-visit-1`,
          propertyId: `${agency.slug}-maison-familiale`,
          date: "2026-06-15",
          time: "10:30",
          visitorName: "Acheteur qualifié",
          visitorPhone: "",
          note: "Visite de découverte.",
          status: "planned",
          createdAt: now,
        },
      ],
      visitReports: [
        {
          id: `${agency.slug}-maison-report-1`,
          propertyId: `${agency.slug}-maison-familiale`,
          title: "Retour de visite",
          content:
            "Visite sérieuse. Les acheteurs ont apprécié la luminosité et l’emplacement.",
          visibleToSeller: true,
          createdAt: now,
        },
      ],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: `${agency.slug}-appartement-centre`,
      agencyId: agency.id,
      agencySlug: agency.slug,
      slug: `${agency.slug}-appartement-centre`,
      title: `Appartement rénové ${agency.city ? `à ${agency.city}` : "en centre-ville"}`,
      type: "Appartement",
      city: agency.city || "Bagnères-de-Bigorre",
      address: "Centre-ville",
      addressOrDistrict: "Centre-ville",
      price: "214 000 €",
      surface: "72 m²",
      rooms: "3",
      bedrooms: "2",
      publicStatus: "new",
      internalProgress: "published",
      internalStatus: "Annonce publiée",
      isPublished: true,
      nextVisit: "Mercredi 19 juin à 17h00",
      report:
        "Les visiteurs ont demandé des précisions sur les charges et le calendrier de signature.",
      description:
        "Un exemple de bien pour montrer la qualité de présentation disponible après activation.",
      image: secondImage,
      imageUrl: secondImage,
      photos: [
        {
          id: `${agency.slug}-appartement-photo-1`,
          propertyId: `${agency.slug}-appartement-centre`,
          url: secondImage,
          alt: "Appartement rénové",
          isMain: true,
          order: 1,
          createdAt: now,
        },
      ],
      sellerToken: `${agency.slug}-seller-demo-2`,
      sellerFirstName: "Julien",
      sellerLastName: "Durand",
      sellerEmail: "julien.durand@example.com",
      sellerPhone: "06 00 00 00 00",
      documents: ["Mandat", "Diagnostics"],
      propertyDocuments: ["Mandat", "Diagnostics"].map((name, index) => ({
        id: `${agency.slug}-appartement-document-${index + 1}`,
        propertyId: `${agency.slug}-appartement-centre`,
        name,
        type: isDocumentType(name) ? name : "Autre",
        url: "",
        visibleToSeller: true,
        createdAt: now,
      })),
      visits: [
        {
          id: `${agency.slug}-appartement-visit-1`,
          propertyId: `${agency.slug}-appartement-centre`,
          date: "2026-06-19",
          time: "17:00",
          visitorName: "",
          visitorPhone: "",
          note: "",
          status: "planned",
          createdAt: now,
        },
      ],
      visitReports: [
        {
          id: `${agency.slug}-appartement-report-1`,
          propertyId: `${agency.slug}-appartement-centre`,
          title: "Questions acheteurs",
          content:
            "Les visiteurs ont demandé des précisions sur les charges et le calendrier.",
          visibleToSeller: true,
          createdAt: now,
        },
      ],
      createdAt: now,
      updatedAt: now,
    },
  ];
}

export function getSellerDemoProperty(agency: Agency) {
  return createDemoProperties(agency)[0];
}

export function buildManagerInviteEmail(
  agency: Agency,
  manager: TeamMember,
  access = createInviteAccessToken({
    type: "manager_invite",
    agencyId: agency.id,
    agencySlug: agency.slug,
    teamMemberId: manager.id,
    email: manager.email,
  }),
): EmailContent {
  return buildInviteEmail({
    inviteType: "manager_invite",
    agency,
    firstName: manager.firstName,
    email: manager.email,
    access,
  });
}

export function buildAgentInviteEmail(
  agency: Agency,
  agent: TeamMember,
  access = createInviteAccessToken({
    type: "agent_invite",
    agencyId: agency.id,
    agencySlug: agency.slug,
    teamMemberId: agent.id,
    email: agent.email,
  }),
): EmailContent {
  return buildInviteEmail({
    inviteType: "agent_invite",
    agency,
    firstName: agent.firstName,
    email: agent.email,
    access,
  });
}

export function buildSellerInviteEmail(
  agency: Agency,
  property: AgencyProperty,
  seller: SellerInviteInput,
  access = createInviteAccessToken({
    type: "seller_invite",
    agencyId: agency.id,
    agencySlug: agency.slug,
    propertyId: property.id,
    sellerToken: property.sellerToken,
    email: seller.email,
  }),
): EmailContent {
  return buildInviteEmail({
    inviteType: "seller_invite",
    agency,
    firstName: seller.firstName,
    email: seller.email,
    access,
    propertyTitle: property.title,
  });
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
  const recipients = to.map(cleanEmail).filter(isValidEmail);
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

function buildInviteEmail({
  inviteType,
  agency,
  firstName,
  email,
  access,
  propertyTitle,
}: {
  inviteType: InviteAccessType;
  agency: Agency;
  firstName: string;
  email: string;
  access: AccessToken;
  propertyTitle?: string;
}) {
  const accessUrl = getInviteAccessUrl(access);
  const body = buildInviteEmailBody({
    inviteType,
    agencyName: agency.name,
    recipientFirstName: firstName,
    accessUrl,
    propertyTitle,
  });

  return {
    ...buildEmailContent({
      to: [email],
      subject: getInviteEmailSubject(inviteType),
      body,
    }),
    accessUrl,
  };
}

function mergeAgencies(stored: unknown[]) {
  const removedIds = new Set(
    safeStringArray(readStored<unknown[]>(REMOVED_AGENCIES_KEY, [])),
  );
  const storedRecords = stored.filter((agency) => {
    if (isRecord(agency)) return true;
    markStorageReset();
    return false;
  });
  const normalizedStored = storedRecords
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

function coerceAgency(agency: unknown): Agency {
  const now = new Date().toISOString();
  if (!isRecord(agency)) markStorageReset();
  const source = isRecord(agency) ? agency : {};
  const name = safeString(source.name).trim() || "Agence";
  return {
    id: safeString(source.id, `agency-${Date.now()}-${randomId()}`),
    slug: normalizeSlug(safeString(source.slug) || name || "agence"),
    name,
    city: safeString(source.city).trim(),
    logoUrl: safeString(source.logoUrl).trim(),
    phone: safeString(source.phone).trim(),
    primaryColor:
      safeString(source.primaryColor, "#111111").trim() || "#111111",
    status: isAgencyStatus(source.status) ? source.status : "demo",
    plan: isAgencyPlan(source.plan) ? source.plan : "demo",
    estimationEmail: cleanEmail(
      safeString(source.estimationEmail) || safeString(source.email),
    ),
    publicEnabled: safeBoolean(source.publicEnabled, true),
    activatedAt: optionalString(source.activatedAt),
    createdAt: safeString(source.createdAt, now),
    updatedAt:
      safeString(source.updatedAt) || safeString(source.createdAt, now),
    features: coerceFeatures(source.features, demoFeatures),
    email: cleanEmail(safeString(source.email)),
  };
}

function coerceTeamMember(member: unknown): TeamMember {
  const now = new Date().toISOString();
  if (!isRecord(member)) markStorageReset();
  const source = isRecord(member) ? member : {};
  return {
    id: safeString(source.id, `member-${Date.now()}-${randomId()}`),
    agencyId: safeString(source.agencyId),
    firstName: safeString(source.firstName).trim(),
    lastName: safeString(source.lastName).trim(),
    email: cleanEmail(safeString(source.email)),
    phone: safeString(source.phone).trim(),
    role: isTeamRole(source.role) ? source.role : "agent",
    status: isTeamMemberStatus(source.status) ? source.status : "active",
    createdAt: safeString(source.createdAt, now),
    updatedAt:
      safeString(source.updatedAt) || safeString(source.createdAt, now),
  };
}

function coerceProperty(property: unknown): AgencyProperty {
  const now = new Date().toISOString();
  if (!isRecord(property)) markStorageReset();
  const source = isRecord(property) ? property : {};
  const fallbackImage = agencyConfig.properties[0]?.coverImage ?? "";
  const id = safeString(source.id, `property-${Date.now()}-${randomId()}`);
  const agencyId = safeString(source.agencyId);
  const agency = agencyId ? getAgencyById(agencyId) : null;
  const title = safeString(source.title, "Bien sans titre");
  const address =
    safeString(source.address) || safeString(source.addressOrDistrict);
  const imageUrl =
    safeString(source.imageUrl) ||
    safeString(source.image) ||
    safeString(source.coverImage) ||
    fallbackImage;
  const photos = coercePropertyPhotos(source.photos, id, title, imageUrl);
  const documents = safeStringArray(source.documents);
  const propertyDocuments = coercePropertyDocuments(
    source.propertyDocuments,
    id,
    documents,
  );
  return {
    id,
    agencyId,
    agencySlug: safeString(source.agencySlug) || agency?.slug || "",
    slug: safeString(source.slug) || normalizeSlug(`${title}-${id}`),
    title,
    type: safeString(source.type, "Maison"),
    city: safeString(source.city),
    address,
    addressOrDistrict: safeString(source.addressOrDistrict) || address,
    price: safeString(source.price),
    surface: safeString(source.surface),
    rooms: safeString(source.rooms),
    bedrooms: safeString(source.bedrooms),
    publicStatus: isPropertyPublicStatus(source.publicStatus)
      ? source.publicStatus
      : "none",
    internalProgress: isPropertyInternalProgress(source.internalProgress)
      ? source.internalProgress
      : internalProgressFromLabel(source.internalStatus),
    internalStatus: safeString(
      source.internalStatus,
      internalProgressLabel(
        isPropertyInternalProgress(source.internalProgress)
          ? source.internalProgress
          : "published",
      ),
    ),
    isPublished:
      typeof source.isPublished === "boolean" ? source.isPublished : true,
    nextVisit: safeString(source.nextVisit, "À planifier"),
    report: safeString(
      source.report,
      "Aucun compte rendu disponible pour le moment.",
    ),
    description: safeString(source.description),
    image: imageUrl,
    imageUrl,
    photos,
    sellerToken: safeString(source.sellerToken),
    sellerFirstName: safeString(source.sellerFirstName),
    sellerLastName: safeString(source.sellerLastName),
    sellerEmail: cleanEmail(safeString(source.sellerEmail)),
    sellerPhone: safeString(source.sellerPhone).trim(),
    documents,
    propertyDocuments,
    visits: coerceVisits(source.visits, id),
    visitReports: coerceVisitReports(source.visitReports, id),
    createdAt: safeString(source.createdAt, now),
    updatedAt:
      safeString(source.updatedAt) || safeString(source.createdAt, now),
  };
}

function coerceLead(lead: unknown): AgencyLead {
  const now = new Date().toISOString();
  if (!isRecord(lead)) markStorageReset();
  const source = isRecord(lead) ? lead : {};
  return {
    id: safeString(source.id, `lead-${Date.now()}-${randomId()}`),
    agencyId: optionalString(source.agencyId),
    agencySlug: safeString(source.agencySlug),
    agencyName: safeString(source.agencyName),
    firstName: safeString(source.firstName),
    lastName: safeString(source.lastName),
    phone: safeString(source.phone),
    email: cleanEmail(safeString(source.email)),
    propertyAddress: optionalString(source.propertyAddress),
    propertyType: safeString(source.propertyType),
    propertyCity: safeString(source.propertyCity),
    surface: safeString(source.surface),
    rooms: safeString(source.rooms),
    propertyState: safeString(source.propertyState),
    exterior: safeString(source.exterior),
    parking: safeString(source.parking),
    sellingDelay: safeString(source.sellingDelay),
    estimateLow: optionalString(source.estimateLow),
    estimateHigh: optionalString(source.estimateHigh),
    estimatedRangeMin:
      optionalString(source.estimatedRangeMin) ??
      optionalString(source.estimateLow),
    estimatedRangeMax:
      optionalString(source.estimatedRangeMax) ??
      optionalString(source.estimateHigh),
    message: optionalString(source.message),
    assignedAgentId: optionalString(source.assignedAgentId),
    answers: optionalString(source.answers),
    status: normalizeLeadStatus(source.status),
    createdAt: safeString(source.createdAt, now),
    updatedAt:
      safeString(source.updatedAt) || safeString(source.createdAt, now),
  };
}

function coerceVisitRequest(request: unknown): VisitRequest {
  const now = new Date().toISOString();
  if (!isRecord(request)) markStorageReset();
  const source = isRecord(request) ? request : {};
  return {
    id: safeString(source.id, `visit-request-${Date.now()}-${randomId()}`),
    agencyId: safeString(source.agencyId),
    agencySlug: safeString(source.agencySlug),
    propertyId: safeString(source.propertyId),
    propertyTitle: safeString(source.propertyTitle),
    propertyCity: safeString(source.propertyCity),
    propertyPrice: safeString(source.propertyPrice),
    firstName: safeString(source.firstName),
    lastName: safeString(source.lastName),
    phone: safeString(source.phone),
    email: cleanEmail(safeString(source.email)),
    buyerSituation: safeString(source.buyerSituation),
    financingStatus: safeString(source.financingStatus),
    buyingTimeline: safeString(source.buyingTimeline),
    message: safeString(source.message),
    status: normalizeLeadStatus(source.status),
    createdAt: safeString(source.createdAt, now),
    updatedAt:
      safeString(source.updatedAt) || safeString(source.createdAt, now),
  };
}

function coercePropertyPhotos(
  value: unknown,
  propertyId: string,
  title: string,
  fallbackUrl: string,
) {
  const now = new Date().toISOString();
  const photos = Array.isArray(value)
    ? value
        .filter(isRecord)
        .map(
          (photo, index): PropertyPhoto => ({
            id: safeString(photo.id, `photo-${propertyId}-${index + 1}`),
            propertyId: safeString(photo.propertyId, propertyId),
            url: safeString(photo.url),
            storagePath: safeString(photo.storagePath),
            name: safeString(photo.name),
            size: Number(photo.size) || 0,
            type: safeString(photo.type),
            alt: safeString(photo.alt, title),
            isMain: Boolean(photo.isMain),
            order: Number(photo.order) || index + 1,
            createdAt: safeString(photo.createdAt, now),
          }),
        )
        .filter((photo) => photo.url)
    : [];

  if (!photos.length && fallbackUrl) {
    return [
      {
        id: `photo-${propertyId}-main`,
        propertyId,
        url: fallbackUrl,
        storagePath: "",
        name: "",
        size: 0,
        type: "",
        alt: title,
        isMain: true,
        order: 1,
        createdAt: now,
      },
    ];
  }

  const hasMain = photos.some((photo) => photo.isMain);
  return photos.map((photo, index) => ({
    ...photo,
    order: index + 1,
    isMain: hasMain ? photo.isMain : index === 0,
  }));
}

function coerceVisits(value: unknown, propertyId: string) {
  const now = new Date().toISOString();
  return Array.isArray(value)
    ? value.filter(isRecord).map(
        (visit, index): Visit => ({
          id: safeString(visit.id, `visit-${propertyId}-${index + 1}`),
          propertyId: safeString(visit.propertyId, propertyId),
          date: safeString(visit.date),
          time: safeString(visit.time),
          visitorName: safeString(visit.visitorName),
          visitorPhone: safeString(visit.visitorPhone),
          note: safeString(visit.note),
          status: isVisitStatus(visit.status) ? visit.status : "planned",
          createdAt: safeString(visit.createdAt, now),
        }),
      )
    : [];
}

function coerceVisitReports(value: unknown, propertyId: string) {
  const now = new Date().toISOString();
  return Array.isArray(value)
    ? value.filter(isRecord).map(
        (report, index): VisitReport => ({
          id: safeString(report.id, `visit-report-${propertyId}-${index + 1}`),
          propertyId: safeString(report.propertyId, propertyId),
          visitId: optionalString(report.visitId),
          title: safeString(report.title),
          content: safeString(report.content),
          visibleToSeller:
            typeof report.visibleToSeller === "boolean"
              ? report.visibleToSeller
              : true,
          createdAt: safeString(report.createdAt, now),
        }),
      )
    : [];
}

function coercePropertyDocuments(
  value: unknown,
  propertyId: string,
  legacyNames: string[],
) {
  const now = new Date().toISOString();
  const documents = Array.isArray(value)
    ? value.filter(isRecord).map(
        (document, index): PropertyDocument => ({
          id: safeString(document.id, `document-${propertyId}-${index + 1}`),
          propertyId: safeString(document.propertyId, propertyId),
          name: safeString(document.name, "Document"),
          type: isDocumentType(document.type) ? document.type : "Autre",
          documentType: isDocumentType(document.documentType)
            ? document.documentType
            : isDocumentType(document.type)
              ? document.type
              : "Autre",
          storagePath: safeString(document.storagePath),
          url: safeString(document.url),
          fileName: safeString(document.fileName),
          size: Number(document.size) || 0,
          mimeType: safeString(document.mimeType),
          visibleToSeller:
            typeof document.visibleToSeller === "boolean"
              ? document.visibleToSeller
              : true,
          createdAt: safeString(document.createdAt, now),
        }),
      )
    : [];

  if (documents.length) return documents;

  return legacyNames.map((name, index) => ({
    id: `document-${propertyId}-${index + 1}`,
    propertyId,
    name,
    type: isDocumentType(name) ? name : "Autre",
    documentType: isDocumentType(name) ? name : "Autre",
    storagePath: "",
    url: "",
    fileName: "",
    size: 0,
    mimeType: "",
    visibleToSeller: true,
    createdAt: now,
  }));
}

function coerceAccessToken(access: unknown): AccessToken {
  const now = new Date().toISOString();
  if (!isRecord(access)) markStorageReset();
  const source = isRecord(access) ? access : {};
  const createdAt = safeString(source.createdAt, now);
  return {
    id: safeString(source.id, `access-${createdAt}-${randomId()}`),
    token: safeString(source.token),
    type: isAccessTokenType(source.type) ? source.type : "seller",
    agencyId: safeString(source.agencyId),
    agencySlug: optionalString(source.agencySlug),
    propertyId: optionalString(source.propertyId),
    teamMemberId: optionalString(source.teamMemberId),
    sellerId: optionalString(source.sellerId),
    sellerToken: optionalString(source.sellerToken),
    email: optionalString(cleanEmail(safeString(source.email))),
    status:
      source.status === "used" ||
      source.status === "expired" ||
      source.status === "revoked"
        ? source.status
        : source.status === "pending"
          ? "pending"
          : undefined,
    createdAt,
    usedAt: optionalString(source.usedAt),
    expiresAt: optionalString(source.expiresAt),
    passwordHash: optionalString(source.passwordHash),
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function safeString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function optionalString(value: unknown) {
  const nextValue = safeString(value);
  return nextValue || undefined;
}

function safeStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function safeBoolean(value: unknown, fallback: boolean) {
  return typeof value === "boolean" ? value : fallback;
}

function coerceFeatures(
  features: unknown,
  fallback: AgencyFeatures,
): AgencyFeatures {
  const source = isRecord(features) ? features : {};
  return {
    canCreateProperties: safeBoolean(
      source.canCreateProperties,
      fallback.canCreateProperties,
    ),
    canEditProperties: safeBoolean(
      source.canEditProperties,
      fallback.canEditProperties,
    ),
    canGenerateSellerLinks: safeBoolean(
      source.canGenerateSellerLinks,
      fallback.canGenerateSellerLinks,
    ),
    canReceiveLeads: safeBoolean(
      source.canReceiveLeads,
      fallback.canReceiveLeads,
    ),
    canManageDocuments: safeBoolean(
      source.canManageDocuments,
      fallback.canManageDocuments,
    ),
    canPublishProperties: safeBoolean(
      source.canPublishProperties,
      fallback.canPublishProperties,
    ),
    canManageTeam: safeBoolean(source.canManageTeam, fallback.canManageTeam),
  };
}

function isAgencyStatus(value: unknown): value is AgencyStatus {
  return value === "demo" || value === "active" || value === "disabled";
}

function isAgencyPlan(value: unknown): value is AgencyPlan {
  return value === "demo" || value === "pilot";
}

function isTeamRole(value: unknown): value is TeamRole {
  return value === "manager" || value === "agent";
}

function isTeamMemberStatus(value: unknown): value is TeamMemberStatus {
  return value === "invited" || value === "active" || value === "disabled";
}

function isAccessTokenType(value: unknown): value is AccessTokenType {
  return (
    value === "manager" ||
    value === "agent" ||
    value === "seller" ||
    isInviteAccessType(value)
  );
}

function isAgencyLeadStatus(value: unknown): value is AgencyLeadStatus {
  return isLeadStatus(value);
}

function isLeadStatus(value: unknown): value is LeadStatus {
  return value === "new" || value === "contacted" || value === "archived";
}

function normalizeLeadStatus(value: unknown): LeadStatus {
  if (value === "contacted" || value === "Rappelé" || value === "Converti")
    return "contacted";
  if (value === "archived" || value === "Perdu") return "archived";
  return "new";
}

function isPropertyPublicStatus(
  value: unknown,
): value is AgencyProperty["publicStatus"] {
  return (
    value === "none" ||
    value === "new" ||
    value === "exclusive" ||
    value === "favorite" ||
    value === "Disponible" ||
    value === "Nouveauté" ||
    value === "Exclusivité" ||
    value === "Sous offre" ||
    value === "Vendu" ||
    value === "Coup de cœur"
  );
}

function isPropertyInternalProgress(
  value: unknown,
): value is PropertyInternalProgress {
  return (
    value === "mandate_signed" ||
    value === "published" ||
    value === "visits" ||
    value === "offer_received" ||
    value === "compromise_signed" ||
    value === "sold"
  );
}

function isVisitStatus(value: unknown): value is VisitStatus {
  return value === "planned" || value === "done" || value === "cancelled";
}

function isDocumentType(value: unknown): value is DocumentType {
  return (
    value === "Mandat" ||
    value === "Diagnostics" ||
    value === "Offre" ||
    value === "Compromis" ||
    value === "Autre"
  );
}

export function publicStatusLabel(status: PropertyPublicStatus) {
  if (status === "new" || status === "Nouveauté") return "Nouveauté";
  if (status === "exclusive" || status === "Exclusivité") return "Exclusivité";
  if (status === "favorite" || status === "Coup de cœur") return "Coup de cœur";
  return "";
}

export function internalProgressLabel(progress: PropertyInternalProgress) {
  const labels: Record<PropertyInternalProgress, string> = {
    mandate_signed: "Mandat signé",
    published: "Annonce publiée",
    visits: "Visites",
    offer_received: "Offre reçue",
    compromise_signed: "Compromis signé",
    sold: "Vente",
  };
  return labels[progress];
}

export function leadStatusLabel(status: LeadStatus) {
  if (status === "contacted") return "Contacté";
  if (status === "archived") return "Archivé";
  return "Nouveau";
}

function internalProgressFromLabel(value: unknown): PropertyInternalProgress {
  const label = safeString(value).toLowerCase();
  if (label.includes("mandat")) return "mandate_signed";
  if (label.includes("visite")) return "visits";
  if (label.includes("offre")) return "offer_received";
  if (label.includes("compromis")) return "compromise_signed";
  if (label.includes("vente") || label.includes("vendu")) return "sold";
  return "published";
}

function formatVisitLabel(visit: Visit) {
  const date = visit.date || "Date à préciser";
  const time = visit.time ? ` à ${visit.time}` : "";
  return `${date}${time}`;
}

function getNextVisitLabelFromVisits(visits: Visit[]) {
  const nextVisit = visits
    .filter((visit) => visit.status === "planned")
    .sort((a, b) =>
      `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`),
    )[0];
  return nextVisit ? formatVisitLabel(nextVisit) : "À planifier";
}

function invalidInviteResult(
  status: "invalid" | "used" | "expired" = "invalid",
  access?: AccessToken | null,
  agency?: Agency | null,
): InviteAccessLookup {
  const labels = {
    invalid: {
      title: "Lien invalide ou expiré",
      message:
        "Contactez Signature Immobilier ou votre agence pour recevoir un nouveau lien.",
    },
    used: {
      title: "Ce lien a déjà été utilisé",
      message:
        "Connectez-vous à votre espace ou contactez votre agence si vous avez besoin d’un nouvel accès.",
    },
    expired: {
      title: "Ce lien a expiré",
      message:
        "Contactez Signature Immobilier ou votre agence pour recevoir un nouveau lien.",
    },
  };

  return {
    status,
    title: labels[status].title,
    message: labels[status].message,
    access,
    agency,
  };
}

function createPilotPasswordMarker(password: string) {
  return `pilot:${password.length}:${randomId()}`;
}

export function getAppBaseUrl() {
  const env = import.meta.env as Record<string, string | undefined>;
  if (typeof window !== "undefined" && window.location.origin) {
    return window.location.origin.replace(/\/$/, "");
  }
  if (env.NEXT_PUBLIC_APP_URL)
    return env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  return "https://signature-immobilier-app.vercel.app";
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

function generateAccessTokenValue() {
  const cryptoApi = globalThis.crypto;
  if (cryptoApi && "getRandomValues" in cryptoApi) {
    const bytes = new Uint8Array(32);
    cryptoApi.getRandomValues(bytes);
    return Array.from(bytes)
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
  }

  return `${randomId()}${Date.now().toString(36)}${randomId()}${randomId()}`;
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
    if (
      !isAccessTokenType(payload.type) ||
      !payload.agencyId ||
      !payload.createdAt
    )
      return null;
    return {
      id: `decoded-${payload.createdAt}-${payload.nonce ?? "token"}`,
      token,
      type: payload.type,
      agencyId: payload.agencyId,
      agencySlug: payload.agencySlug,
      propertyId: payload.propertyId,
      teamMemberId: payload.teamMemberId,
      sellerId: payload.sellerId,
      sellerToken: payload.sellerToken,
      email: payload.email,
      createdAt: payload.createdAt,
      usedAt: payload.usedAt,
      expiresAt: payload.expiresAt,
    };
  } catch {
    return null;
  }
}

function readStored<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as unknown;
    if (Array.isArray(fallback) && !Array.isArray(parsed)) {
      resetStoredKey(key);
      return fallback;
    }
    return parsed as T;
  } catch (error) {
    console.warn(`Lecture localStorage impossible pour ${key}`, error);
    resetStoredKey(key);
    return fallback;
  }
}

function readSessionStored<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.sessionStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as unknown;
    if (Array.isArray(fallback) && !Array.isArray(parsed)) {
      resetSessionKey(key);
      return fallback;
    }
    return parsed as T;
  } catch (error) {
    console.warn(`Lecture sessionStorage impossible pour ${key}`, error);
    resetSessionKey(key);
    return fallback;
  }
}

function markStorageReset() {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(STORAGE_RESET_NOTICE_KEY, "true");
  } catch (error) {
    console.warn("Notification de réinitialisation locale impossible", error);
  }
}

function resetStoredKey(key: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key);
    markStorageReset();
  } catch (error) {
    console.warn(`Réinitialisation localStorage impossible pour ${key}`, error);
  }
}

function resetSessionKey(key: string) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(key);
    markStorageReset();
  } catch (error) {
    console.warn(
      `Réinitialisation sessionStorage impossible pour ${key}`,
      error,
    );
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
