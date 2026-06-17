export type AccessRole = "admin" | "manager" | "agent" | "seller";

export type AgencyStatus =
  | "demo"
  | "payment_pending"
  | "active"
  | "lost";

export type PropertySaleStep =
  | "mandate_signed"
  | "listing_published"
  | "visits_ongoing"
  | "offer_received"
  | "compromise_signed"
  | "sold";

export type PublicBadge = "Nouveaute" | "Exclusivite" | "Coup de coeur" | "";

export type RequestStatus =
  | "new"
  | "contacted"
  | "appointment"
  | "visit_scheduled"
  | "mandate_signed"
  | "lost"
  | "archived";

export type PreviewStatus =
  | "draft"
  | "analyzed"
  | "demo_ready"
  | "payment_pending"
  | "active";

export type Agency = {
  id: string;
  slug: string;
  name: string;
  city: string;
  phone: string;
  email: string;
  status: AgencyStatus;
  planId?: string;
  stripePaymentUrl?: string;
  createdAt: string;
};

export type AgencyBranding = {
  agencyId: string;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  visualMood: string;
  toneOfVoice: string;
  emotionalPositioning: string;
  backgroundStyle: string;
};

export type PropertyPhoto = {
  id: string;
  propertyId: string;
  url: string;
  name: string;
  alt: string;
  isMain: boolean;
  order: number;
};

export type Property = {
  id: string;
  agencyId: string;
  agencySlug: string;
  slug: string;
  title: string;
  city: string;
  district: string;
  address: string;
  price: number;
  surface: number;
  rooms: number;
  bedrooms?: number;
  type: string;
  description: string;
  highlights: string[];
  publicBadge: PublicBadge;
  assignedAgentId?: string;
  isPublished: boolean;
  saleStep: PropertySaleStep;
  sellerToken?: string;
  photos: PropertyPhoto[];
  createdAt: string;
  updatedAt: string;
};

export type TeamMember = {
  id: string;
  agencyId: string;
  role: "manager" | "agent";
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: "invited" | "active" | "disabled";
};

export type SellerProfile = {
  id: string;
  agencyId: string;
  propertyId: string;
  sellerToken: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: "not_invited" | "invited" | "active" | "disabled";
  inviteUrl?: string;
};

export type PropertyVisit = {
  id: string;
  agencyId: string;
  propertyId: string;
  date: string;
  time: string;
  buyerName?: string;
  buyerPhone?: string;
  internalNote?: string;
  sellerNote?: string;
  status: "planned" | "done" | "cancelled";
};

export type PropertyReport = {
  id: string;
  agencyId: string;
  propertyId: string;
  visitId?: string;
  title: string;
  content: string;
  visibleToSeller: boolean;
  createdAt: string;
};

export type PropertyDocument = {
  id: string;
  agencyId: string;
  propertyId: string;
  name: string;
  documentType: "mandat" | "diagnostics" | "offre" | "compromis" | "autre";
  url: string;
  fileName: string;
  visibleToSeller: boolean;
  createdAt: string;
};

export type EstimationRequest = {
  id: string;
  agencyId: string;
  propertyType: string;
  city: string;
  postalCode: string;
  surface: number;
  condition: string;
  sellingDelay: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  message?: string;
  lowEstimate: number;
  highEstimate: number;
  status: Extract<
    RequestStatus,
    "new" | "contacted" | "appointment" | "mandate_signed" | "lost" | "archived"
  >;
  createdAt: string;
};

export type VisitRequest = {
  id: string;
  agencyId: string;
  propertyId: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  buyerSituation: string;
  financing: string;
  buyingDelay: string;
  message?: string;
  status: Extract<
    RequestStatus,
    "new" | "contacted" | "visit_scheduled" | "lost" | "archived"
  >;
  createdAt: string;
};

export type CallbackRequest = {
  id: string;
  agencyId: string;
  propertyId?: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  message?: string;
  status: Extract<RequestStatus, "new" | "contacted" | "archived">;
  createdAt: string;
};

export type PreviewProject = {
  id: string;
  agencyId: string;
  agencySlug: string;
  agencyName: string;
  websiteUrl: string;
  city: string;
  phone?: string;
  email?: string;
  contactName?: string;
  priority: "test" | "hot" | "meeting" | "signature";
  status: PreviewStatus;
  analysisMode: "automatic" | "assisted" | "manual";
  analysisSummary: string;
  detectedWeaknesses: string[];
  signatureOpportunities: string[];
  scrapedProperties: ScrapedProperty[];
  aiRequests: PreviewAiRequest[];
  meetingBrief?: MeetingBrief;
  createdAt: string;
};

export type ScrapedProperty = {
  id: string;
  sourceUrl: string;
  title: string;
  price: number;
  city: string;
  surface: number;
  rooms: number;
  type: string;
  description: string;
  photos: string[];
  confidenceScore: number;
  status: "pending" | "imported" | "ignored";
};

export type PreviewAiRequest = {
  id: string;
  instruction: string;
  proposal: string;
  status: "draft" | "applied";
  createdAt: string;
};

export type MeetingBrief = {
  pitch: string;
  objections: string[];
  answers: string[];
  recommendedPlanId: string;
  emailMessage: string;
  linkedinMessage: string;
};

export type Plan = {
  id: "essential" | "signature" | "premium";
  name: string;
  setupFee: number;
  monthlyFee: number;
  isActive: boolean;
  description: string;
};

export type Subscription = {
  id: string;
  agencyId: string;
  planId: Plan["id"];
  status: "trial" | "payment_pending" | "active" | "failed" | "cancelled";
  monthlyAmount: number;
  stripePaymentUrl: string;
};

export type V2State = {
  agencies: Agency[];
  branding: AgencyBranding[];
  properties: Property[];
  teamMembers: TeamMember[];
  sellers: SellerProfile[];
  visits: PropertyVisit[];
  reports: PropertyReport[];
  documents: PropertyDocument[];
  estimationRequests: EstimationRequest[];
  visitRequests: VisitRequest[];
  callbackRequests: CallbackRequest[];
  previewProjects: PreviewProject[];
  plans: Plan[];
  subscriptions: Subscription[];
};

export type EstimateInput = {
  propertyType: string;
  city: string;
  postalCode: string;
  surface: number;
  condition: string;
  sellingDelay: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  message?: string;
};

const STORAGE_KEY = "signature_v2_state";

export const saleSteps: Array<{ id: PropertySaleStep; label: string }> = [
  { id: "mandate_signed", label: "Mandat" },
  { id: "listing_published", label: "Annonce" },
  { id: "visits_ongoing", label: "Visites" },
  { id: "offer_received", label: "Offre" },
  { id: "compromise_signed", label: "Compromis" },
  { id: "sold", label: "Vente" },
];

export function loadV2State(): V2State {
  if (typeof window === "undefined") return createInitialV2State();

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialV2State();
    return mergeState(JSON.parse(raw) as Partial<V2State>);
  } catch {
    return createInitialV2State();
  }
}

export function saveV2State(state: V2State) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function resetV2State() {
  const state = createInitialV2State();
  saveV2State(state);
  return state;
}

export function getAgencyBySlug(state: V2State, agencySlug: string) {
  return state.agencies.find((agency) => agency.slug === agencySlug) ?? null;
}

export function getAgencyById(state: V2State, agencyId: string) {
  return state.agencies.find((agency) => agency.id === agencyId) ?? null;
}

export function getBrandingForAgency(state: V2State, agencyId: string) {
  return (
    state.branding.find((branding) => branding.agencyId === agencyId) ??
    state.branding[0]
  );
}

export function getPublicProperties(state: V2State, agencyId: string) {
  return state.properties.filter(
    (property) => property.agencyId === agencyId && property.isPublished,
  );
}

export function getAgencyProperties(state: V2State, agencyId: string) {
  return state.properties.filter((property) => property.agencyId === agencyId);
}

export function getPropertyBySlug(
  state: V2State,
  agencySlug: string,
  propertySlug: string,
) {
  return (
    state.properties.find(
      (property) =>
        property.agencySlug === agencySlug && property.slug === propertySlug,
    ) ?? null
  );
}

export function getPropertyById(state: V2State, propertyId: string) {
  return state.properties.find((property) => property.id === propertyId) ?? null;
}

export function getSellerByToken(state: V2State, sellerToken: string) {
  return (
    state.sellers.find((seller) => seller.sellerToken === sellerToken) ?? null
  );
}

export function getSellerSpace(state: V2State, sellerToken: string) {
  const seller = getSellerByToken(state, sellerToken);
  if (!seller) return null;
  const property = getPropertyById(state, seller.propertyId);
  if (!property) return null;
  const agency = getAgencyById(state, seller.agencyId);
  if (!agency) return null;

  return {
    seller,
    property,
    agency,
    branding: getBrandingForAgency(state, agency.id),
    visits: state.visits.filter((visit) => visit.propertyId === property.id),
    reports: state.reports.filter(
      (report) => report.propertyId === property.id && report.visibleToSeller,
    ),
    documents: state.documents.filter(
      (document) =>
        document.propertyId === property.id && document.visibleToSeller,
    ),
  };
}

export function getMainPhoto(property: Property) {
  return (
    property.photos.find((photo) => photo.isMain) ??
    property.photos.sort((a, b) => a.order - b.order)[0]
  );
}

export function formatPrice(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

export function calculateIndicativeEstimate(input: {
  surface: number;
  condition: string;
  city: string;
}) {
  const cityFactor = input.city.toLowerCase().includes("paris")
    ? 11200
    : input.city.toLowerCase().includes("lyon")
      ? 6200
      : input.city.toLowerCase().includes("bordeaux")
        ? 5200
        : 4300;
  const conditionFactor =
    input.condition === "renove"
      ? 1.08
      : input.condition === "a_rafraichir"
        ? 0.92
        : input.condition === "travaux"
          ? 0.84
          : 1;
  const center = Math.max(90000, input.surface * cityFactor * conditionFactor);
  return {
    lowEstimate: Math.round((center * 0.92) / 1000) * 1000,
    highEstimate: Math.round((center * 1.08) / 1000) * 1000,
  };
}

export function createEstimationRequest(
  state: V2State,
  agencyId: string,
  input: EstimateInput,
) {
  const estimate = calculateIndicativeEstimate(input);
  const request: EstimationRequest = {
    id: makeId("est"),
    agencyId,
    ...input,
    ...estimate,
    status: "new",
    createdAt: nowIso(),
  };
  return {
    ...state,
    estimationRequests: [request, ...state.estimationRequests],
  };
}

export function createVisitRequest(
  state: V2State,
  agencyId: string,
  propertyId: string,
  input: Omit<VisitRequest, "id" | "agencyId" | "propertyId" | "status" | "createdAt">,
) {
  const request: VisitRequest = {
    id: makeId("visit_request"),
    agencyId,
    propertyId,
    ...input,
    status: "new",
    createdAt: nowIso(),
  };
  return { ...state, visitRequests: [request, ...state.visitRequests] };
}

export function createCallbackRequest(
  state: V2State,
  agencyId: string,
  input: Omit<CallbackRequest, "id" | "agencyId" | "status" | "createdAt">,
) {
  const request: CallbackRequest = {
    id: makeId("callback"),
    agencyId,
    ...input,
    status: "new",
    createdAt: nowIso(),
  };
  return { ...state, callbackRequests: [request, ...state.callbackRequests] };
}

export function updateEstimationStatus(
  state: V2State,
  requestId: string,
  status: EstimationRequest["status"],
) {
  return {
    ...state,
    estimationRequests: state.estimationRequests.map((request) =>
      request.id === requestId ? { ...request, status } : request,
    ),
  };
}

export function updateVisitRequestStatus(
  state: V2State,
  requestId: string,
  status: VisitRequest["status"],
) {
  return {
    ...state,
    visitRequests: state.visitRequests.map((request) =>
      request.id === requestId ? { ...request, status } : request,
    ),
  };
}

export function createProperty(
  state: V2State,
  agency: Agency,
  input: {
    title: string;
    city: string;
    price: number;
    surface: number;
    rooms: number;
    bedrooms?: number;
    type: string;
    address: string;
    district: string;
    description: string;
    publicBadge: PublicBadge;
    assignedAgentId?: string;
    isPublished: boolean;
    photoFiles?: FileList | null;
  },
) {
  const propertyId = makeId("property");
  const slug = slugify(input.title);
  const photos = filesToPhotos(propertyId, input.photoFiles);
  const property: Property = {
    id: propertyId,
    agencyId: agency.id,
    agencySlug: agency.slug,
    slug,
    title: input.title,
    city: input.city,
    district: input.district,
    address: input.address,
    price: input.price,
    surface: input.surface,
    rooms: input.rooms,
    bedrooms: input.bedrooms,
    type: input.type,
    description: input.description,
    highlights: ["Présentation premium", "Accompagnement vendeur", "Annonce optimisée"],
    publicBadge: input.publicBadge,
    assignedAgentId: input.assignedAgentId,
    isPublished: input.isPublished,
    saleStep: input.isPublished ? "listing_published" : "mandate_signed",
    photos,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };

  return { ...state, properties: [property, ...state.properties] };
}

export function updateProperty(
  state: V2State,
  propertyId: string,
  patch: Partial<Property>,
) {
  return {
    ...state,
    properties: state.properties.map((property) =>
      property.id === propertyId
        ? { ...property, ...patch, updatedAt: nowIso() }
        : property,
    ),
  };
}

export function addPropertyVisit(
  state: V2State,
  agencyId: string,
  propertyId: string,
  input: Omit<PropertyVisit, "id" | "agencyId" | "propertyId" | "status">,
) {
  const visit: PropertyVisit = {
    id: makeId("visit"),
    agencyId,
    propertyId,
    ...input,
    status: "planned",
  };
  return { ...state, visits: [visit, ...state.visits] };
}

export function addPropertyReport(
  state: V2State,
  agencyId: string,
  propertyId: string,
  input: Omit<PropertyReport, "id" | "agencyId" | "propertyId" | "createdAt">,
) {
  const report: PropertyReport = {
    id: makeId("report"),
    agencyId,
    propertyId,
    ...input,
    createdAt: nowIso(),
  };
  return { ...state, reports: [report, ...state.reports] };
}

export function addPropertyDocument(
  state: V2State,
  agencyId: string,
  propertyId: string,
  input: Omit<PropertyDocument, "id" | "agencyId" | "propertyId" | "createdAt">,
) {
  const document: PropertyDocument = {
    id: makeId("doc"),
    agencyId,
    propertyId,
    ...input,
    createdAt: nowIso(),
  };
  return { ...state, documents: [document, ...state.documents] };
}

export function createSellerAccess(
  state: V2State,
  agency: Agency,
  property: Property,
  input: Pick<SellerProfile, "firstName" | "lastName" | "email" | "phone">,
) {
  const sellerToken = `seller_${cryptoSafeId()}`;
  const seller: SellerProfile = {
    id: makeId("seller"),
    agencyId: agency.id,
    propertyId: property.id,
    sellerToken,
    ...input,
    status: "invited",
    inviteUrl: `/creer-acces/${makeId("invite")}`,
  };

  return {
    ...state,
    sellers: [
      seller,
      ...state.sellers.filter((item) => item.propertyId !== property.id),
    ],
    properties: state.properties.map((item) =>
      item.id === property.id ? { ...item, sellerToken } : item,
    ),
  };
}

export function createTeamInvite(
  state: V2State,
  agencyId: string,
  input: Omit<TeamMember, "id" | "agencyId" | "status">,
) {
  const member: TeamMember = {
    id: makeId("member"),
    agencyId,
    ...input,
    status: "invited",
  };
  return { ...state, teamMembers: [member, ...state.teamMembers] };
}

export function createPreviewProject(
  state: V2State,
  input: {
    agencyName: string;
    websiteUrl: string;
    city: string;
    phone?: string;
    email?: string;
    contactName?: string;
    priority: PreviewProject["priority"];
  },
) {
  const agencyId = makeId("agency");
  const agencySlug = slugify(input.agencyName);
  const agency: Agency = {
    id: agencyId,
    slug: agencySlug,
    name: input.agencyName,
    city: input.city,
    phone: input.phone ?? "",
    email: input.email ?? "",
    status: "demo",
    createdAt: nowIso(),
  };
  const branding: AgencyBranding = {
    agencyId,
    logoUrl: "",
    primaryColor: "#0b1d2e",
    secondaryColor: "#f5efe5",
    accentColor: "#c8a96a",
    visualMood: "moderne Airbnb",
    toneOfVoice: "premium, clair et rassurant",
    emotionalPositioning: "ultra simple vendeur",
    backgroundStyle: "fond creme, photos grandes, cartes sobres",
  };
  const project: PreviewProject = analyzePreviewProject({
    id: makeId("preview"),
    agencyId,
    agencySlug,
    agencyName: input.agencyName,
    websiteUrl: input.websiteUrl,
    city: input.city,
    phone: input.phone,
    email: input.email,
    contactName: input.contactName,
    priority: input.priority,
    status: "draft",
    analysisMode: "automatic",
    analysisSummary: "",
    detectedWeaknesses: [],
    signatureOpportunities: [],
    scrapedProperties: [],
    aiRequests: [],
    createdAt: nowIso(),
  });

  return {
    ...state,
    agencies: [agency, ...state.agencies],
    branding: [branding, ...state.branding],
    previewProjects: [project, ...state.previewProjects],
  };
}

export function analyzePreviewProject(project: PreviewProject): PreviewProject {
  return {
    ...project,
    status: "analyzed",
    analysisMode: "assisted",
    analysisSummary:
      "Analyse initiale prête. Le noyau V2 prévoit un mode automatique, un mode assisté et un mode manuel rapide pour ne jamais bloquer Hugo si le site source refuse le scraping.",
    detectedWeaknesses: [
      "Présentation des biens trop peu immersive",
      "Manque de preuve de transparence après mandat",
      "Parcours vendeur peu différenciant",
    ],
    signatureOpportunities: [
      "Créer une page vendeur claire autour de Mon suivi",
      "Importer les biens publics dans une démo premium",
      "Préparer un pitch RDV centré sur la visibilité après mandat",
    ],
    scrapedProperties: project.scrapedProperties.length
      ? project.scrapedProperties
      : [
          {
            id: makeId("scraped"),
            sourceUrl: project.websiteUrl,
            title: "Appartement familial lumineux",
            price: 420000,
            city: project.city,
            surface: 86,
            rooms: 4,
            type: "Appartement",
            description:
              "Bien détecté en mode assisté. Hugo peut l'importer, le modifier ou l'ignorer.",
            photos: [samplePhotos[1]],
            confidenceScore: 0.72,
            status: "pending",
          },
        ],
  };
}

export function generatePreviewDemo(state: V2State, previewId: string) {
  const project = state.previewProjects.find((item) => item.id === previewId);
  if (!project) return state;
  const agency = getAgencyById(state, project.agencyId);
  if (!agency) return state;

  const demoBase = createSignatureDemoBase(project, agency);

  return {
    ...state,
    agencies: state.agencies.map((item) =>
      item.id === agency.id
        ? {
            ...item,
            phone: item.phone || project.phone || "04 00 00 00 00",
            email: item.email || project.email || "contact@signature-demo.fr",
            status: "demo",
          }
        : item,
    ),
    properties: [
      ...demoBase.properties,
      ...state.properties.filter((property) => property.agencyId !== agency.id),
    ],
    teamMembers: [
      ...demoBase.teamMembers,
      ...state.teamMembers.filter((member) => member.agencyId !== agency.id),
    ],
    sellers: [
      ...demoBase.sellers,
      ...state.sellers.filter((seller) => seller.agencyId !== agency.id),
    ],
    visits: [
      ...demoBase.visits,
      ...state.visits.filter((visit) => visit.agencyId !== agency.id),
    ],
    reports: [
      ...demoBase.reports,
      ...state.reports.filter((report) => report.agencyId !== agency.id),
    ],
    documents: [
      ...demoBase.documents,
      ...state.documents.filter((document) => document.agencyId !== agency.id),
    ],
    estimationRequests: [
      ...demoBase.estimationRequests,
      ...state.estimationRequests.filter(
        (request) => request.agencyId !== agency.id,
      ),
    ],
    visitRequests: [
      ...demoBase.visitRequests,
      ...state.visitRequests.filter((request) => request.agencyId !== agency.id),
    ],
    callbackRequests: [
      ...demoBase.callbackRequests,
      ...state.callbackRequests.filter(
        (request) => request.agencyId !== agency.id,
      ),
    ],
    previewProjects: state.previewProjects.map((item) =>
      item.id === previewId
        ? {
            ...item,
            status: "demo_ready",
            scrapedProperties: item.scrapedProperties.map((property) =>
              property.status === "ignored"
                ? property
                : { ...property, status: "imported" },
            ),
            meetingBrief: createMeetingBrief(item),
          }
        : item,
    ),
  };
}

type SignatureDemoPropertySeed = {
  title: string;
  city: string;
  district: string;
  address: string;
  price: number;
  surface: number;
  rooms: number;
  type: string;
  description: string;
  highlights: string[];
  publicBadge: PublicBadge;
  saleStep: PropertySaleStep;
  photos: string[];
};

function createSignatureDemoBase(project: PreviewProject, agency: Agency) {
  const createdAt = nowIso();
  const sellerToken = `vendeur-${agency.slug}-demo`;
  const managerId = `member_${agency.slug}_manager`;
  const agentId = `member_${agency.slug}_agent`;
  const seeds = createSignatureDemoPropertySeeds(project, agency);
  const properties: Property[] = seeds.map((seed, index) =>
    createSignatureDemoProperty({
      agency,
      seed,
      index,
      createdAt,
      assignedAgentId: agentId,
      sellerToken: index === 0 ? sellerToken : undefined,
    }),
  );
  const sellerProperty = properties[0];

  const teamMembers: TeamMember[] = [
    {
      id: managerId,
      agencyId: agency.id,
      role: "manager",
      firstName: "Hugo",
      lastName: "Demo",
      email: project.email || `direction@${agency.slug}.demo`,
      phone: project.phone || agency.phone || "06 00 00 00 01",
      status: "active",
    },
    {
      id: agentId,
      agencyId: agency.id,
      role: "agent",
      firstName: "Camille",
      lastName: "Martin",
      email: `camille@${agency.slug}.demo`,
      phone: "06 00 00 00 02",
      status: "active",
    },
  ];

  const sellers: SellerProfile[] = [
    {
      id: `seller_profile_${agency.slug}_demo`,
      agencyId: agency.id,
      propertyId: sellerProperty.id,
      sellerToken,
      firstName: "Claire",
      lastName: "Bernard",
      email: `vendeur@${agency.slug}.demo`,
      phone: "06 00 00 00 03",
      status: "active",
      inviteUrl: `/creer-acces/invite-${agency.slug}-demo`,
    },
  ];

  const visitId = `visit_${agency.slug}_demo_next`;
  const visits: PropertyVisit[] = [
    {
      id: visitId,
      agencyId: agency.id,
      propertyId: sellerProperty.id,
      date: demoDateIn(3),
      time: "10:30",
      buyerName: "Famille Durand",
      buyerPhone: "06 00 00 00 04",
      internalNote: "Acheteurs qualifies pour la demonstration.",
      sellerNote: "Visite confirmee avec un dossier de financement solide.",
      status: "planned",
    },
  ];

  const reports: PropertyReport[] = [
    {
      id: `report_${agency.slug}_demo_visible`,
      agencyId: agency.id,
      propertyId: sellerProperty.id,
      visitId,
      title: "Compte rendu visible vendeur",
      content:
        "Les visiteurs ont apprecie la luminosite, la qualite de presentation et la clarte du parcours. Un second echange est prevu.",
      visibleToSeller: true,
      createdAt,
    },
  ];

  const documents: PropertyDocument[] = [
    {
      id: `doc_${agency.slug}_demo_diagnostics`,
      agencyId: agency.id,
      propertyId: sellerProperty.id,
      name: "Diagnostics techniques",
      documentType: "diagnostics",
      url: "https://example.com/signature-demo-diagnostics.pdf",
      fileName: "diagnostics-demo.pdf",
      visibleToSeller: true,
      createdAt,
    },
  ];

  const estimationRequests: EstimationRequest[] = [
    {
      id: `estimation_${agency.slug}_demo`,
      agencyId: agency.id,
      propertyType: "Maison",
      city: agency.city,
      postalCode: "",
      surface: 118,
      condition: "bon",
      sellingDelay: "3 mois",
      firstName: "Paul",
      lastName: "Riviere",
      phone: "06 00 00 00 05",
      email: `estimation@${agency.slug}.demo`,
      message: "Demande demo issue de la base Signature Immobilier.",
      lowEstimate: 520000,
      highEstimate: 610000,
      status: "new",
      createdAt,
    },
  ];

  const visitRequests: VisitRequest[] = [
    {
      id: `visit_request_${agency.slug}_demo`,
      agencyId: agency.id,
      propertyId: properties[1]?.id ?? sellerProperty.id,
      firstName: "Emma",
      lastName: "Laurent",
      phone: "06 00 00 00 06",
      email: `visite@${agency.slug}.demo`,
      buyerSituation: "Residence principale",
      financing: "Financement valide",
      buyingDelay: "Moins de 3 mois",
      message: "Souhaite visiter rapidement.",
      status: "new",
      createdAt,
    },
  ];

  const callbackRequests: CallbackRequest[] = [
    {
      id: `callback_${agency.slug}_demo`,
      agencyId: agency.id,
      propertyId: sellerProperty.id,
      firstName: "Nicolas",
      lastName: "Petit",
      phone: "06 00 00 00 07",
      email: `rappel@${agency.slug}.demo`,
      message: "Souhaite etre rappele apres consultation de la demo publique.",
      status: "new",
      createdAt,
    },
  ];

  return {
    properties,
    teamMembers,
    sellers,
    visits,
    reports,
    documents,
    estimationRequests,
    visitRequests,
    callbackRequests,
  };
}

function createSignatureDemoPropertySeeds(
  project: PreviewProject,
  agency: Agency,
): SignatureDemoPropertySeed[] {
  const scrapedSeeds: SignatureDemoPropertySeed[] = project.scrapedProperties
    .filter((property) => property.status !== "ignored")
    .slice(0, 2)
    .map((property, index) => ({
      title: property.title,
      city: property.city || agency.city,
      district: index === 0 ? "Centre" : "Quartier residentiel",
      address: "Adresse precise masquee cote public",
      price: property.price,
      surface: property.surface,
      rooms: property.rooms,
      type: property.type,
      description: `${property.description} Cette fiche est enrichie par la base demo Signature pour montrer une presentation premium et un suivi vendeur clair.`,
      highlights: ["Photo immersive", "Annonce rassurante", "Suivi vendeur"],
      publicBadge: index === 0 ? "Coup de coeur" : "Nouveaute",
      saleStep: index === 0 ? "visits_ongoing" : "listing_published",
      photos: property.photos.length
        ? property.photos
        : [samplePhotos[index % samplePhotos.length]],
    }));

  const fallbackSeeds: SignatureDemoPropertySeed[] = [
    {
      title: `Maison Signature ${agency.city}`,
      city: agency.city,
      district: "Quartier residentiel",
      address: "Adresse precise masquee cote public",
      price: 735000,
      surface: 132,
      rooms: 6,
      type: "Maison",
      description:
        "Maison familiale lumineuse, preparee pour une demonstration premium avec photos, progression vendeur, visite prevue et documents visibles.",
      highlights: ["Piece de vie lumineuse", "Jardin calme", "Presentation premium"],
      publicBadge: "Exclusivite",
      saleStep: "visits_ongoing",
      photos: [samplePhotos[0], samplePhotos[1]],
    },
    {
      title: `Appartement lumineux ${agency.city}`,
      city: agency.city,
      district: "Centre",
      address: "Adresse precise masquee cote public",
      price: 420000,
      surface: 84,
      rooms: 4,
      type: "Appartement",
      description:
        "Appartement pret a publier cote public, avec une fiche claire, des caracteristiques essentielles et une demande de visite demo.",
      highlights: ["Balcon", "Plan optimise", "Proche commerces"],
      publicBadge: "Nouveaute",
      saleStep: "listing_published",
      photos: [samplePhotos[2]],
    },
  ];

  return [...scrapedSeeds, ...fallbackSeeds].slice(0, 2);
}

function createSignatureDemoProperty({
  agency,
  seed,
  index,
  createdAt,
  assignedAgentId,
  sellerToken,
}: {
  agency: Agency;
  seed: SignatureDemoPropertySeed;
  index: number;
  createdAt: string;
  assignedAgentId: string;
  sellerToken?: string;
}): Property {
  const propertyId = `property_${agency.slug}_demo_${index + 1}`;
  const photos = seed.photos.slice(0, 6).map((url, photoIndex) => ({
    id: `photo_${agency.slug}_demo_${index + 1}_${photoIndex + 1}`,
    propertyId,
    url,
    name: `photo-demo-${photoIndex + 1}.jpg`,
    alt: seed.title,
    isMain: photoIndex === 0,
    order: photoIndex,
  }));

  return {
    id: propertyId,
    agencyId: agency.id,
    agencySlug: agency.slug,
    slug: `${slugify(seed.title)}-${index + 1}`,
    title: seed.title,
    city: seed.city,
    district: seed.district,
    address: seed.address,
    price: seed.price,
    surface: seed.surface,
    rooms: seed.rooms,
    type: seed.type,
    description: seed.description,
    highlights: seed.highlights,
    publicBadge: seed.publicBadge,
    assignedAgentId,
    isPublished: true,
    saleStep: seed.saleStep,
    sellerToken,
    photos,
    createdAt,
    updatedAt: createdAt,
  };
}

function demoDateIn(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

export function addPreviewAiRequest(
  state: V2State,
  previewId: string,
  instruction: string,
) {
  const request: PreviewAiRequest = {
    id: makeId("ai"),
    instruction,
    proposal: `Proposition prête : ${instruction}. Le ton reste premium, vendeur et simple, avec validation manuelle par Hugo avant application.`,
    status: "draft",
    createdAt: nowIso(),
  };
  return {
    ...state,
    previewProjects: state.previewProjects.map((project) =>
      project.id === previewId
        ? { ...project, aiRequests: [request, ...project.aiRequests] }
        : project,
    ),
  };
}

export function activateAgencyAfterPayment(
  state: V2State,
  agencyId: string,
  planId: Plan["id"],
) {
  const plan = state.plans.find((item) => item.id === planId);
  if (!plan) return state;
  const subscription: Subscription = {
    id: makeId("sub"),
    agencyId,
    planId,
    status: "payment_pending",
    monthlyAmount: plan.monthlyFee,
    stripePaymentUrl: `https://buy.stripe.com/test_signature_${agencyId}_${planId}`,
  };
  return {
    ...state,
    agencies: state.agencies.map((agency) =>
      agency.id === agencyId
        ? {
            ...agency,
            status: "payment_pending",
            planId,
            stripePaymentUrl: subscription.stripePaymentUrl,
          }
        : agency,
    ),
    subscriptions: [
      subscription,
      ...state.subscriptions.filter((item) => item.agencyId !== agencyId),
    ],
  };
}

export function markPaymentValidated(state: V2State, agencyId: string) {
  return {
    ...state,
    agencies: state.agencies.map((agency) =>
      agency.id === agencyId ? { ...agency, status: "active" } : agency,
    ),
    subscriptions: state.subscriptions.map((subscription) =>
      subscription.agencyId === agencyId
        ? { ...subscription, status: "active" }
        : subscription,
    ),
    previewProjects: state.previewProjects.map((project) =>
      project.agencyId === agencyId ? { ...project, status: "active" } : project,
    ),
  };
}

export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function mergeState(partial: Partial<V2State>): V2State {
  const initial = createInitialV2State();
  return {
    agencies: partial.agencies ?? initial.agencies,
    branding: partial.branding ?? initial.branding,
    properties: partial.properties ?? initial.properties,
    teamMembers: partial.teamMembers ?? initial.teamMembers,
    sellers: partial.sellers ?? initial.sellers,
    visits: partial.visits ?? initial.visits,
    reports: partial.reports ?? initial.reports,
    documents: partial.documents ?? initial.documents,
    estimationRequests:
      partial.estimationRequests ?? initial.estimationRequests,
    visitRequests: partial.visitRequests ?? initial.visitRequests,
    callbackRequests: partial.callbackRequests ?? initial.callbackRequests,
    previewProjects: partial.previewProjects ?? initial.previewProjects,
    plans: partial.plans ?? initial.plans,
    subscriptions: partial.subscriptions ?? initial.subscriptions,
  };
}

function createInitialV2State(): V2State {
  const agency: Agency = {
    id: "agency_signature-demo",
    slug: "signature-demo",
    name: "Signature Demo Immobilier",
    city: "Lyon",
    phone: "04 72 00 00 00",
    email: "contact@signature-demo.fr",
    status: "active",
    planId: "signature",
    createdAt: "2026-06-16T08:00:00.000Z",
  };
  const propertyOneId = "property_hauteurs";
  const propertyTwoId = "property_atelier";
  return {
    agencies: [agency],
    branding: [
      {
        agencyId: agency.id,
        logoUrl: "",
        primaryColor: "#0b1d2e",
        secondaryColor: "#f7f0e6",
        accentColor: "#c8a96a",
        visualMood: "luxe discret",
        toneOfVoice: "premium, direct et rassurant",
        emotionalPositioning: "Vous ne demandez plus ou ca en est. Vous le voyez.",
        backgroundStyle: "fond creme, grandes photos, cartes blanches",
      },
    ],
    properties: [
      {
        id: propertyOneId,
        agencyId: agency.id,
        agencySlug: agency.slug,
        slug: "maison-des-hauteurs",
        title: "Maison des Hauteurs",
        city: "Lyon",
        district: "Croix-Rousse",
        address: "Rue des Tables Claudiennes",
        price: 890000,
        surface: 142,
        rooms: 6,
        bedrooms: 4,
        type: "Maison",
        description:
          "Une maison familiale lumineuse, pensee pour recevoir, avec une terrasse ouverte sur les toits et une circulation tres simple au quotidien.",
        highlights: ["Terrasse plein ciel", "Suite parentale", "Calme absolu"],
        publicBadge: "Exclusivite",
        assignedAgentId: "member_agent_jade",
        isPublished: true,
        saleStep: "visits_ongoing",
        sellerToken: "seller-demo",
        photos: [
          {
            id: "photo_hauteurs_1",
            propertyId: propertyOneId,
            url: samplePhotos[0],
            name: "terrasse.jpg",
            alt: "Terrasse de la Maison des Hauteurs",
            isMain: true,
            order: 0,
          },
          {
            id: "photo_hauteurs_2",
            propertyId: propertyOneId,
            url: samplePhotos[1],
            name: "salon.jpg",
            alt: "Salon lumineux",
            isMain: false,
            order: 1,
          },
        ],
        createdAt: "2026-06-16T08:00:00.000Z",
        updatedAt: "2026-06-16T08:00:00.000Z",
      },
      {
        id: propertyTwoId,
        agencyId: agency.id,
        agencySlug: agency.slug,
        slug: "atelier-saint-georges",
        title: "Atelier Saint-Georges",
        city: "Lyon",
        district: "Saint-Georges",
        address: "Quai Fulchiron",
        price: 545000,
        surface: 91,
        rooms: 4,
        bedrooms: 2,
        type: "Appartement",
        description:
          "Un ancien atelier transforme en appartement chaleureux, avec de beaux volumes, une grande piece de vie et une adresse tres recherchee.",
        highlights: ["Volumes atypiques", "Adresse historique", "Lumiere douce"],
        publicBadge: "Coup de coeur",
        assignedAgentId: "member_agent_jade",
        isPublished: true,
        saleStep: "listing_published",
        photos: [
          {
            id: "photo_atelier_1",
            propertyId: propertyTwoId,
            url: samplePhotos[2],
            name: "atelier.jpg",
            alt: "Piece de vie de l'atelier",
            isMain: true,
            order: 0,
          },
        ],
        createdAt: "2026-06-16T08:00:00.000Z",
        updatedAt: "2026-06-16T08:00:00.000Z",
      },
    ],
    teamMembers: [
      {
        id: "member_manager_hugo",
        agencyId: agency.id,
        role: "manager",
        firstName: "Hugo",
        lastName: "Sempe",
        email: "hugo@signature-demo.fr",
        phone: "07 66 31 42 53",
        status: "active",
      },
      {
        id: "member_agent_jade",
        agencyId: agency.id,
        role: "agent",
        firstName: "Jade",
        lastName: "Martin",
        email: "jade@signature-demo.fr",
        phone: "06 12 34 56 78",
        status: "active",
      },
    ],
    sellers: [
      {
        id: "seller_profile_demo",
        agencyId: agency.id,
        propertyId: propertyOneId,
        sellerToken: "seller-demo",
        firstName: "Claire",
        lastName: "Bernard",
        email: "claire.bernard@example.com",
        phone: "06 20 30 40 50",
        status: "active",
        inviteUrl: "/creer-acces/invite-demo",
      },
    ],
    visits: [
      {
        id: "visit_next",
        agencyId: agency.id,
        propertyId: propertyOneId,
        date: "2026-06-20",
        time: "10:30",
        buyerName: "Famille Durand",
        buyerPhone: "06 01 02 03 04",
        internalNote: "Acheteurs qualifies, financement valide.",
        sellerNote: "Visite confirmee samedi matin.",
        status: "planned",
      },
      {
        id: "visit_done",
        agencyId: agency.id,
        propertyId: propertyOneId,
        date: "2026-06-12",
        time: "18:00",
        buyerName: "Mme Laurent",
        sellerNote: "Retour positif sur la terrasse et le calme.",
        status: "done",
      },
    ],
    reports: [
      {
        id: "report_demo",
        agencyId: agency.id,
        propertyId: propertyOneId,
        visitId: "visit_done",
        title: "Retour visite - Mme Laurent",
        content:
          "Le bien correspond au projet. Les points forts retenus sont la terrasse, la luminosite et la qualite de l'adresse.",
        visibleToSeller: true,
        createdAt: "2026-06-12T19:00:00.000Z",
      },
    ],
    documents: [
      {
        id: "doc_mandat",
        agencyId: agency.id,
        propertyId: propertyOneId,
        name: "Mandat de vente",
        documentType: "mandat",
        url: "https://example.com/mandat.pdf",
        fileName: "mandat.pdf",
        visibleToSeller: true,
        createdAt: "2026-06-10T08:00:00.000Z",
      },
      {
        id: "doc_diagnostics",
        agencyId: agency.id,
        propertyId: propertyOneId,
        name: "Diagnostics techniques",
        documentType: "diagnostics",
        url: "https://example.com/diagnostics.pdf",
        fileName: "diagnostics.pdf",
        visibleToSeller: true,
        createdAt: "2026-06-11T08:00:00.000Z",
      },
    ],
    estimationRequests: [
      {
        id: "estimation_demo",
        agencyId: agency.id,
        propertyType: "Appartement",
        city: "Lyon",
        postalCode: "69004",
        surface: 78,
        condition: "bon",
        sellingDelay: "3 mois",
        firstName: "Paul",
        lastName: "Riviere",
        phone: "06 44 55 66 77",
        email: "paul.riviere@example.com",
        lowEstimate: 438000,
        highEstimate: 512000,
        status: "new",
        createdAt: "2026-06-16T10:00:00.000Z",
      },
    ],
    visitRequests: [],
    callbackRequests: [],
    previewProjects: [],
    plans: [
      {
        id: "essential",
        name: "Essentiel",
        setupFee: 900,
        monthlyFee: 149,
        isActive: true,
        description: "Site agence premium, biens publics et demandes entrantes.",
      },
      {
        id: "signature",
        name: "Signature",
        setupFee: 1500,
        monthlyFee: 249,
        isActive: true,
        description: "Ajoute espace vendeur, documents visibles et suivi apres mandat.",
      },
      {
        id: "premium",
        name: "Premium",
        setupFee: 2500,
        monthlyFee: 399,
        isActive: true,
        description: "Accompagnement complet, Preview Studio avance et priorite support.",
      },
    ],
    subscriptions: [
      {
        id: "sub_demo",
        agencyId: agency.id,
        planId: "signature",
        status: "active",
        monthlyAmount: 249,
        stripePaymentUrl: "https://buy.stripe.com/test_signature_demo",
      },
    ],
  };
}

function createMeetingBrief(project: PreviewProject): MeetingBrief {
  return {
    pitch:
      "Signature Immobilier ne remplace pas votre CRM. Il ameliore ce que le client voit : une vitrine premium, des annonces plus rassurantes et un espace vendeur qui rend chaque etape visible.",
    objections: [
      "Nous avons deja un site",
      "Nous avons deja un CRM",
      "Nos vendeurs nous appellent quand ils veulent des nouvelles",
    ],
    answers: [
      "Justement, la demo montre ce que votre site actuel ne rend pas visible au vendeur.",
      "Signature se branche autour de l'experience client, pas a la place de votre outil interne.",
      "Mon suivi reduit les relances en montrant progression, visites, retours et documents.",
    ],
    recommendedPlanId: "signature",
    emailMessage: `Bonjour, j'ai prepare une demo Signature personnalisee pour ${project.agencyName}. Elle montre comment valoriser vos biens et rendre le suivi vendeur plus transparent apres mandat.`,
    linkedinMessage: `J'ai prepare une lecture rapide du site ${project.agencyName} avec une piste concrete pour mieux vendre l'experience vendeur.`,
  };
}

function filesToPhotos(propertyId: string, files?: FileList | null) {
  if (!files?.length) {
    return [
      {
        id: makeId("photo"),
        propertyId,
        url: samplePhotos[0],
        name: "placeholder.jpg",
        alt: "Photo du bien",
        isMain: true,
        order: 0,
      },
    ];
  }

  return Array.from(files)
    .filter((file) => file.type.startsWith("image/"))
    .slice(0, 8)
    .map((file, index) => ({
      id: makeId("photo"),
      propertyId,
      url: URL.createObjectURL(file),
      name: file.name,
      alt: file.name,
      isMain: index === 0,
      order: index,
    }));
}

function makeId(prefix: string) {
  return `${prefix}_${cryptoSafeId()}`;
}

function cryptoSafeId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID().slice(0, 8);
  }
  return Math.random().toString(36).slice(2, 10);
}

function nowIso() {
  return new Date().toISOString();
}

const samplePhotos = [
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=80",
];
