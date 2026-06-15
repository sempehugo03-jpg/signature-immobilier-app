import {
  completeInviteTokenRequest,
  createInviteTokenRequest,
  getInviteTokenRequest,
} from "@/lib/api/invite-tokens.functions";
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
  type InviteTokenPersistence,
  type InviteTokenRecord,
} from "@/lib/invite-tokens";

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
  const response = await createInviteTokenRequest({
    data: {
      type: member.role === "manager" ? "manager_invite" : "agent_invite",
      agencyId: agency.id,
      agencySlug: agency.slug,
      teamMemberId: member.id,
      email: member.email,
    },
  });

  if (response.ok) {
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

  const response = await createInviteTokenRequest({
    data: {
      type: "seller_invite",
      agencyId: agency.id,
      agencySlug: agency.slug,
      propertyId: updatedProperty.id,
      sellerToken,
      email: seller.email,
    },
  });

  if (response.ok) {
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
  const response = await getInviteTokenRequest({ data: { token } });
  if (response.ok) {
    return {
      lookup: lookupFromSharedInviteResponse(response.status, response.record),
      persistedIn: "supabase",
      sharedRecord: response.record,
    };
  }

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
    return activateInviteAccess(token, password);
  }

  const response = await completeInviteTokenRequest({
    data: {
      token,
      password,
    },
  });

  if (!response.ok) {
    return lookupFromSharedInviteResponse(
      response.status ?? "invalid",
      response.record ?? loaded.sharedRecord,
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
  return " Attention : ce lien fonctionne uniquement dans ce navigateur car la base partagée n’est pas configurée.";
}

function lookupFromSharedInviteResponse(
  status: "pending" | "used" | "expired" | "invalid",
  record?: InviteTokenRecord,
): InviteAccessLookup {
  if (!record || status === "invalid") {
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
