import {
  activateInviteAccess,
  activeFeatures,
  buildAgentInviteEmail,
  buildManagerInviteEmail,
  buildSellerInviteEmail,
  createAgency,
  createSellerInviteForProperty,
  createTeamMemberInviteEmail,
  findAgencyPropertyBySellerToken,
  getAgencyById,
  getAgencyBySlug,
  getTeamMembers,
  getAgencyProperty,
  getInviteAccessByToken,
  saveAgencyAccessSession,
  saveAgencyProperty,
  updateTeamMember,
  type AccessToken,
  type Agency,
  type AgencyProperty,
  type EmailContent,
  type InviteAccessLookup,
  type SellerInviteInput,
  type TeamMember,
} from "@/lib/agency-saas";
import {
  getEffectiveInviteStatus,
  type CreateInviteTokenInput,
  type InviteTokenPersistence,
  type InviteTokenRecord,
  type InviteTokenStatus,
} from "@/lib/invite-tokens";

type ApiReadInviteStatus = InviteTokenStatus | "invalid";

type CreateInviteApiResponse = {
  token: string;
  inviteUrl: string;
  record: InviteTokenRecord;
};

type ReadInviteApiResponse = {
  status: ApiReadInviteStatus;
  record?: InviteTokenRecord;
};

type CompleteInviteApiResponse = {
  status: ApiReadInviteStatus;
  destination?: string;
  record?: InviteTokenRecord;
  error?: string;
};

export type SharedInviteEmailResult = {
  email: EmailContent;
  persistedIn: InviteTokenPersistence;
  sharedRecord?: InviteTokenRecord;
};

export type SharedSellerInviteResult = SharedInviteEmailResult & {
  property: AgencyProperty;
};

export type LoadedInviteAccess = {
  lookup: InviteAccessLookup;
  persistedIn: InviteTokenPersistence;
  sharedRecord?: InviteTokenRecord;
};

export type CompletedInviteAccessLookup = InviteAccessLookup & {
  redirectPath?: string;
};

export async function createSharedTeamMemberInviteEmail(
  agency: Agency,
  member: TeamMember,
): Promise<SharedInviteEmailResult> {
  const response = await createInviteTokenViaApi({
    type: member.role === "manager" ? "manager_invite" : "agent_invite",
    agencyId: agency.id,
    agencySlug: agency.slug,
    teamMemberId: member.id,
    email: member.email,
  });

  if (response) {
    const access = accessFromInviteRecord(response.record);
    return {
      email:
        member.role === "manager"
          ? buildManagerInviteEmail(agency, member, access)
          : buildAgentInviteEmail(agency, member, access),
      persistedIn: "supabase",
      sharedRecord: response.record,
    };
  }

  ensureDevLocalFallbackAllowed();
  return {
    email: createTeamMemberInviteEmail(agency, member),
    persistedIn: "local",
  };
}

export async function createSharedSellerInviteForProperty(
  agency: Agency,
  property: AgencyProperty,
  seller: SellerInviteInput,
): Promise<SharedSellerInviteResult> {
  const sellerToken = property.sellerToken || generateSellerToken();
  const updatedProperty =
    saveAgencyProperty({
      ...property,
      sellerToken,
      sellerFirstName: seller.firstName.trim(),
      sellerLastName: seller.lastName.trim(),
      sellerEmail: seller.email.trim().toLowerCase(),
      sellerPhone: seller.phone.trim(),
    }).find((item) => item.id === property.id) ?? property;

  const response = await createInviteTokenViaApi({
    type: "seller_invite",
    agencyId: agency.id,
    agencySlug: agency.slug,
    propertyId: updatedProperty.id,
    sellerToken,
    email: seller.email,
  });

  if (response) {
    return {
      property: updatedProperty,
      email: buildSellerInviteEmail(
        agency,
        updatedProperty,
        seller,
        accessFromInviteRecord(response.record),
      ),
      persistedIn: "supabase",
      sharedRecord: response.record,
    };
  }

  ensureDevLocalFallbackAllowed();
  const localResult = createSellerInviteForProperty(agency, updatedProperty, {
    ...seller,
    email: seller.email.trim().toLowerCase(),
  });
  return {
    property: localResult.property,
    email: localResult.email,
    persistedIn: "local",
  };
}

export async function loadInviteAccess(
  token: string,
): Promise<LoadedInviteAccess> {
  const response = await getInviteTokenViaApi(token);
  if (response) {
    return {
      lookup: lookupFromSharedInviteResponse(response.status, response.record),
      persistedIn: "supabase",
      sharedRecord: response.record,
    };
  }

  ensureDevLocalFallbackAllowed();
  return {
    lookup: getInviteAccessByToken(token),
    persistedIn: "local",
  };
}

export async function completeLoadedInviteAccess({
  token,
  password,
  loaded,
}: {
  token: string;
  password: string;
  loaded: LoadedInviteAccess;
}): Promise<CompletedInviteAccessLookup> {
  if (loaded.persistedIn === "local" || !loaded.sharedRecord) {
    ensureDevLocalFallbackAllowed();
    return activateInviteAccess(token, password);
  }

  const response = await completeInviteTokenViaApi({
    token,
    password,
  });

  if (!response || !response.record || !response.destination) {
    return lookupFromSharedInviteResponse(
      response?.status ?? "invalid",
      response?.record ?? loaded.sharedRecord,
    );
  }

  const lookup = lookupFromSharedInviteResponse("pending", response.record);
  if (lookup.status !== "valid") return lookup;

  const access = {
    ...accessFromInviteRecord(response.record),
    status: "used" as const,
    usedAt: response.record.usedAt ?? new Date().toISOString(),
  };
  ensureAgencyAvailableForInvite(response.record, lookup.agency);
  activateLocalInviteAccess(access, lookup);

  return {
    ...lookup,
    access,
    redirectPath: response.destination,
  };
}

export function getSharedInviteStorageWarning(
  persistedIn: InviteTokenPersistence,
) {
  if (persistedIn !== "local" || !import.meta.env.DEV) return "";
  return " Base partagée non configurée : ce lien ne fonctionnera que dans ce navigateur.";
}

function lookupFromSharedInviteResponse(
  status: ApiReadInviteStatus,
  record?: InviteTokenRecord,
): InviteAccessLookup {
  if (!record || status === "invalid" || status === "revoked") {
    return invalidLookup("invalid", record);
  }

  const effectiveStatus = getEffectiveInviteStatus({ ...record, status });
  if (effectiveStatus !== "pending") {
    return invalidLookup(effectiveStatus, record);
  }

  const access = accessFromInviteRecord(record);
  const agency = getInviteAgency(record);

  if (record.type === "manager_invite" || record.type === "agent_invite") {
    const member =
      getMatchingTeamMember(agency.id, record) ??
      buildFallbackTeamMember(record, agency.id);
    return { status: "valid", access, agency, member };
  }

  const property = getMatchingProperty(agency, record);
  return { status: "valid", access, agency, property };
}

function invalidLookup(
  status: "invalid" | "used" | "expired",
  record?: InviteTokenRecord,
): InviteAccessLookup {
  const access = record ? accessFromInviteRecord(record) : null;
  const agency = record ? getInviteAgency(record) : null;
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

function accessFromInviteRecord(record: InviteTokenRecord): AccessToken {
  return {
    id: record.id,
    token: record.token,
    type: record.type,
    agencyId: record.agencyId,
    agencySlug: record.agencySlug,
    propertyId: record.propertyId,
    teamMemberId: record.teamMemberId,
    sellerToken: record.sellerToken,
    email: record.email,
    status: record.status,
    createdAt: record.createdAt,
    usedAt: record.usedAt,
    expiresAt: record.expiresAt,
  };
}

async function createInviteTokenViaApi(
  data: CreateInviteTokenInput,
): Promise<CreateInviteApiResponse | null> {
  try {
    const response = await fetch("/api/invites/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) return null;
    return (await response.json()) as CreateInviteApiResponse;
  } catch (error) {
    console.warn("Invitation API non créée", error);
    return null;
  }
}

async function getInviteTokenViaApi(
  token: string,
): Promise<ReadInviteApiResponse | null> {
  try {
    const response = await fetch(`/api/invites/${encodeURIComponent(token)}`);

    if (response.status === 404) {
      return { status: "invalid" };
    }
    if (!response.ok) return null;
    return (await response.json()) as ReadInviteApiResponse;
  } catch (error) {
    console.warn("Invitation API non lue", error);
    return null;
  }
}

async function completeInviteTokenViaApi({
  token,
  password,
}: {
  token: string;
  password: string;
}): Promise<CompleteInviteApiResponse | null> {
  try {
    const response = await fetch("/api/invites/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    const body = (await response.json()) as CompleteInviteApiResponse;
    return body;
  } catch (error) {
    console.warn("Invitation API non validée", error);
    return null;
  }
}

function ensureDevLocalFallbackAllowed() {
  if (import.meta.env.DEV) return;
  throw new Error("SHARED_INVITE_STORE_REQUIRED");
}

function getInviteAgency(record: InviteTokenRecord): Agency {
  return (
    getAgencyById(record.agencyId) ??
    getAgencyBySlug(record.agencySlug) ??
    buildFallbackAgency(record)
  );
}

function ensureAgencyAvailableForInvite(
  record: InviteTokenRecord,
  agency: Agency,
) {
  if (getAgencyById(record.agencyId) || getAgencyBySlug(record.agencySlug)) {
    return;
  }

  createAgency({
    ...agency,
    id: record.agencyId,
    slug: record.agencySlug,
    status: "active",
    plan: "pilot",
    publicEnabled: true,
    features: activeFeatures,
  });
}

function buildFallbackAgency(record: InviteTokenRecord): Agency {
  const now = record.createdAt || new Date().toISOString();
  return {
    id: record.agencyId,
    slug: record.agencySlug,
    name: "Signature Immobilier",
    city: "",
    logoUrl: "",
    phone: "",
    primaryColor: "#111111",
    status: "active",
    plan: "pilot",
    estimationEmail: "",
    publicEnabled: true,
    activatedAt: now,
    createdAt: now,
    updatedAt: now,
    features: activeFeatures,
    email: "",
  };
}

function getMatchingTeamMember(agencyId: string, record: InviteTokenRecord) {
  const role = record.type === "manager_invite" ? "manager" : "agent";
  const email = record.email.toLowerCase();
  return (
    (record.teamMemberId
      ? getAgencyMembers(agencyId).find(
          (member) => member.id === record.teamMemberId,
        )
      : null) ??
    getAgencyMembers(agencyId).find(
      (member) => member.role === role && member.email.toLowerCase() === email,
    ) ??
    null
  );
}

function getAgencyMembers(agencyId: string) {
  return getTeamMembers(agencyId);
}

function buildFallbackTeamMember(
  record: InviteTokenRecord,
  agencyId: string,
): TeamMember {
  const now = record.createdAt || new Date().toISOString();
  return {
    id: record.teamMemberId || `member-${record.id}`,
    agencyId,
    firstName: "",
    lastName: "",
    email: record.email,
    phone: "",
    role: record.type === "manager_invite" ? "manager" : "agent",
    status: "invited",
    createdAt: now,
    updatedAt: now,
  };
}

function getMatchingProperty(agency: Agency, record: InviteTokenRecord) {
  return (
    (record.propertyId ? getAgencyProperty(agency, record.propertyId) : null) ??
    (record.sellerToken
      ? findAgencyPropertyBySellerToken(agency, record.sellerToken)
      : null)
  );
}

function activateLocalInviteAccess(
  access: AccessToken,
  lookup: Extract<InviteAccessLookup, { status: "valid" }>,
) {
  if (
    (access.type === "manager_invite" || access.type === "agent_invite") &&
    lookup.member
  ) {
    updateTeamMember(lookup.member.id, { status: "active" });
    saveAgencyAccessSession({
      ...access,
      type: access.type === "manager_invite" ? "manager" : "agent",
    });
    return;
  }

  if (access.type === "seller_invite") {
    saveAgencyAccessSession({ ...access, type: "seller" });
  }
}

function generateSellerToken() {
  if (globalThis.crypto && "randomUUID" in globalThis.crypto) {
    return globalThis.crypto.randomUUID().replace(/-/g, "");
  }

  return `seller-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
