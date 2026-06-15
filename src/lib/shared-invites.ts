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
  ok?: true;
  token: string;
  inviteUrl: string;
  record: InviteTokenRecord;
};

export type InviteCreationErrorCode =
  | "missing_supabase"
  | "missing_table"
  | "missing_agency"
  | "invalid_email"
  | "unknown_error";

type CreateInviteApiErrorResponse = {
  ok: false;
  code: InviteCreationErrorCode;
  message: string;
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

const inviteCreationErrorMessages: Record<InviteCreationErrorCode, string> = {
  missing_supabase:
    "Impossible de créer le lien d’invitation : base de données non configurée.",
  missing_table:
    "Impossible de créer le lien d’invitation : table invite_tokens absente.",
  missing_agency:
    "Impossible de créer le lien d’invitation : agence introuvable.",
  invalid_email: "Email invalide.",
  unknown_error:
    "Impossible de créer le lien d’invitation. Consultez la console pour le détail.",
};

export class InviteCreationError extends Error {
  code: InviteCreationErrorCode;
  cause?: unknown;

  constructor(
    code: InviteCreationErrorCode,
    message = inviteCreationErrorMessages[code],
    cause?: unknown,
  ) {
    super(message);
    this.name = "InviteCreationError";
    this.code = code;
    this.cause = cause;
  }
}

export function getInviteCreationErrorMessage(error: unknown) {
  if (error instanceof InviteCreationError) {
    return error.message || inviteCreationErrorMessages[error.code];
  }

  return inviteCreationErrorMessages.unknown_error;
}

export function logInviteCreationFailure(error: unknown) {
  if (import.meta.env.DEV) {
    console.error("Invite creation failed", error);
  }
}

export async function createSharedTeamMemberInviteEmail(
  agency: Agency,
  member: TeamMember,
): Promise<SharedInviteEmailResult> {
  try {
    const response = await createInviteTokenViaApi({
      type: member.role === "manager" ? "manager_invite" : "agent_invite",
      agencyId: agency.id,
      agencySlug: agency.slug,
      teamMemberId: member.id,
      email: member.email,
    });
    const access = accessFromInviteRecord(response.record);
    return {
      email:
        member.role === "manager"
          ? buildManagerInviteEmail(agency, member, access)
          : buildAgentInviteEmail(agency, member, access),
      persistedIn: "supabase",
      sharedRecord: response.record,
    };
  } catch (error) {
    if (!canUseDevLocalInviteFallback(error)) throw error;
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

  try {
    const response = await createInviteTokenViaApi({
      type: "seller_invite",
      agencyId: agency.id,
      agencySlug: agency.slug,
      propertyId: updatedProperty.id,
      sellerToken,
      email: seller.email,
    });
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
  } catch (error) {
    if (!canUseDevLocalInviteFallback(error)) throw error;
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
  return " Mode démo local : ce lien fonctionne uniquement dans ce navigateur.";
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
): Promise<CreateInviteApiResponse> {
  try {
    const response = await fetch("/api/invites/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const body = await readJsonResponse(response);

    if (!response.ok || isCreateInviteApiError(body)) {
      throw inviteCreationErrorFromResponse(body, response.status);
    }

    if (!isCreateInviteApiResponse(body)) {
      throw new InviteCreationError("unknown_error", undefined, body);
    }

    return body;
  } catch (error) {
    if (error instanceof InviteCreationError) throw error;
    throw new InviteCreationError("unknown_error", undefined, error);
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

function canUseDevLocalInviteFallback(error: unknown) {
  return (
    import.meta.env.DEV &&
    error instanceof InviteCreationError &&
    error.code === "missing_supabase"
  );
}

async function readJsonResponse(response: Response) {
  try {
    return (await response.json()) as unknown;
  } catch {
    return null;
  }
}

function isCreateInviteApiResponse(
  value: unknown,
): value is CreateInviteApiResponse {
  return (
    isRecord(value) &&
    typeof value.token === "string" &&
    typeof value.inviteUrl === "string" &&
    isRecord(value.record)
  );
}

function isCreateInviteApiError(
  value: unknown,
): value is CreateInviteApiErrorResponse {
  return (
    isRecord(value) &&
    value.ok === false &&
    typeof value.message === "string" &&
    isInviteCreationErrorCode(value.code)
  );
}

function inviteCreationErrorFromResponse(
  body: unknown,
  status: number,
): InviteCreationError {
  if (isCreateInviteApiError(body)) {
    return new InviteCreationError(body.code, body.message, body);
  }

  if (status === 400) {
    return new InviteCreationError("unknown_error", undefined, body);
  }

  return new InviteCreationError("unknown_error", undefined, body);
}

function isInviteCreationErrorCode(
  value: unknown,
): value is InviteCreationErrorCode {
  return (
    value === "missing_supabase" ||
    value === "missing_table" ||
    value === "missing_agency" ||
    value === "invalid_email" ||
    value === "unknown_error"
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
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
