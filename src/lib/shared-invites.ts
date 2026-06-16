import {
  activeFeatures,
  buildAgentInviteEmail,
  buildManagerInviteEmail,
  buildSellerInviteEmail,
  createAgency,
  findAgencyPropertyBySellerToken,
  getAgencyById,
  getAgencyBySlug,
  getTeamMembers,
  getAgencyProperty,
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
  code: InviteApiErrorCode;
  message: string;
};

type ReadInviteApiResponse = {
  ok?: boolean;
  status: ApiReadInviteStatus;
  code?: InviteApiErrorCode;
  message?: string;
  record?: InviteTokenRecord;
};

type CompleteInviteApiResponse = {
  status: ApiReadInviteStatus;
  destination?: string;
  record?: InviteTokenRecord;
  code?: InviteApiErrorCode;
  message?: string;
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

export type InviteApiErrorCode =
  | InviteCreationErrorCode
  | "missing_supabase_url"
  | "missing_service_role_key"
  | "missing_invite_tokens_table"
  | "supabase_permission_error"
  | "supabase_unknown_error"
  | "not_found"
  | "used"
  | "invalid"
  | "invalid_payload";

const inviteCreationErrorMessages: Record<InviteApiErrorCode, string> = {
  missing_supabase:
    "Impossible de créer le lien d’invitation : base de données non configurée.",
  missing_table:
    "Impossible de créer le lien d’invitation : table invite_tokens absente.",
  missing_agency:
    "Impossible de créer le lien d’invitation : agence introuvable.",
  invalid_email: "Email invalide.",
  missing_supabase_url: "NEXT_PUBLIC_SUPABASE_URL manquante côté serveur.",
  missing_service_role_key: "SUPABASE_SERVICE_ROLE_KEY manquante côté serveur.",
  missing_invite_tokens_table:
    "Table invite_tokens absente. Exécutez la migration Supabase.",
  supabase_permission_error:
    "Erreur de permission Supabase. Vérifiez SUPABASE_SERVICE_ROLE_KEY.",
  supabase_unknown_error: "Erreur Supabase inconnue.",
  not_found: "Lien invalide ou expiré.",
  used: "Ce lien a déjà été utilisé.",
  invalid: "Lien invalide ou expiré.",
  invalid_payload:
    "Impossible de créer le lien d’invitation : données invalides.",
  unknown_error:
    "Impossible de créer le lien d’invitation. Consultez la console pour le détail.",
};

export class InviteCreationError extends Error {
  code: InviteApiErrorCode;
  cause?: unknown;

  constructor(
    code: InviteApiErrorCode,
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

export async function loadInviteAccess(
  token: string,
): Promise<LoadedInviteAccess> {
  const response = await getInviteTokenViaApi(token);
  return {
    lookup: lookupFromSharedInviteResponse(
      response.status,
      response.record,
      response.code,
      response.message,
    ),
    persistedIn: "supabase",
    sharedRecord: response.record,
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
  const response = await completeInviteTokenViaApi({
    token,
    password,
  });

  if (!response || !response.record || !response.destination) {
    return lookupFromSharedInviteResponse(
      response?.status ?? "invalid",
      response?.record ?? loaded.sharedRecord,
      response?.code,
      response?.message,
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
  code?: InviteApiErrorCode,
  message?: string,
): InviteAccessLookup {
  if (!record && code && isInviteInfrastructureErrorCode(code)) {
    return invalidLookup("invalid", undefined, {
      title: getInfrastructureErrorTitle(code, message),
      message: getInfrastructureErrorMessage(code, message),
    });
  }

  if (!record || status === "invalid" || status === "revoked") {
    return invalidLookup("invalid", record, message ? { message } : undefined);
  }

  const effectiveStatus = getEffectiveInviteStatus({ ...record, status });
  if (effectiveStatus !== "pending") {
    return invalidLookup(
      effectiveStatus,
      record,
      message ? { message } : undefined,
    );
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
  custom?: { title?: string; message?: string },
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
    title: custom?.title ?? labels[status].title,
    message: custom?.message ?? labels[status].message,
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
): Promise<ReadInviteApiResponse> {
  try {
    const response = await fetch(`/api/invites/${encodeURIComponent(token)}`);
    const body = await readJsonResponse(response);

    if (isReadInviteApiResponse(body)) {
      return body;
    }

    if (response.status === 404) {
      return { ok: false, status: "invalid", code: "not_found" };
    }

    return {
      ok: false,
      status: "invalid",
      code: "supabase_unknown_error",
      message: inviteCreationErrorMessages.supabase_unknown_error,
    };
  } catch (error) {
    console.warn("Invitation API non lue", error);
    return {
      ok: false,
      status: "invalid",
      code: "supabase_unknown_error",
      message: inviteCreationErrorMessages.supabase_unknown_error,
    };
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
): value is InviteApiErrorCode {
  return (
    value === "missing_supabase" ||
    value === "missing_table" ||
    value === "missing_agency" ||
    value === "invalid_email" ||
    value === "missing_supabase_url" ||
    value === "missing_service_role_key" ||
    value === "missing_invite_tokens_table" ||
    value === "supabase_permission_error" ||
    value === "supabase_unknown_error" ||
    value === "not_found" ||
    value === "used" ||
    value === "invalid" ||
    value === "invalid_payload" ||
    value === "unknown_error"
  );
}

function isReadInviteApiResponse(
  value: unknown,
): value is ReadInviteApiResponse {
  return (
    isRecord(value) &&
    typeof value.status === "string" &&
    (value.status === "pending" ||
      value.status === "used" ||
      value.status === "expired" ||
      value.status === "revoked" ||
      value.status === "invalid")
  );
}

function isInviteInfrastructureErrorCode(code: InviteApiErrorCode) {
  return (
    code === "missing_supabase_url" ||
    code === "missing_service_role_key" ||
    code === "missing_invite_tokens_table" ||
    code === "supabase_permission_error" ||
    code === "supabase_unknown_error"
  );
}

function getInfrastructureErrorTitle(
  code: InviteApiErrorCode,
  message?: string,
) {
  if (import.meta.env.DEV && code === "missing_invite_tokens_table") {
    return message || inviteCreationErrorMessages.missing_invite_tokens_table;
  }

  if (import.meta.env.DEV && message) return message;
  return "Lien temporairement indisponible";
}

function getInfrastructureErrorMessage(
  code: InviteApiErrorCode,
  message?: string,
) {
  if (import.meta.env.DEV && message) return message;
  return "Contactez Signature Immobilier ou votre agence pour recevoir un nouveau lien.";
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
