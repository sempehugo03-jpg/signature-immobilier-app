import { agencyConfig } from "@/lib/agency-config";
import {
  buildInvitationEmail,
  buildPublicAppUrl,
  openGmailCompose,
  openMailApp,
  type InvitationEmail,
} from "@/lib/invitation-email";
import { supabase, type UserRole } from "@/lib/supabase";

const LOCAL_KEY = "signature_access_invitations";

export type AccessStatus = "pending" | "active" | "disabled";
export type AccessRole = "agency_admin" | "agent";

export type AgencySummary = {
  id: string;
  name: string;
  city: string;
  phone: string;
  email: string;
};

export type AccessInvitation = {
  id: string;
  agency_id: string;
  agency_name: string;
  agency_city: string;
  agency_phone: string;
  agency_email: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: AccessRole;
  activation_token: string | null;
  status: AccessStatus;
  user_id?: string | null;
  created_at?: string;
  activated_at?: string | null;
};

export type AccessEmail = InvitationEmail;

export type AccessCreationResult = AccessEmail & {
  invitation: AccessInvitation;
  alreadyExists: boolean;
  persistedIn: "supabase" | "local";
};

export type AgencyAdminInput = {
  agencyName: string;
  agencyCity: string;
  agencyPhone: string;
  agencyEmail: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

export type AgentInput = {
  agency: AgencySummary;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

function readLocalInvitations() {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(LOCAL_KEY);
  return raw ? (JSON.parse(raw) as AccessInvitation[]) : [];
}

function writeLocalInvitations(invitations: AccessInvitation[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LOCAL_KEY, JSON.stringify(invitations));
}

export function generateAccessToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function getActivationPath(role: AccessRole) {
  return role === "agency_admin" ? "/activation-patron" : "/activation-agent";
}

export function getAccessActivationUrl(role: AccessRole, token: string) {
  return buildPublicAppUrl(`${getActivationPath(role)}?token=${encodeURIComponent(
    token,
  )}`);
}

export function buildAgencyAdminEmail({
  firstName,
  email,
  activationUrl,
}: {
  firstName: string;
  email: string;
  activationUrl: string;
}): AccessEmail {
  const subject = "Votre accès Signature Immobilier est prêt";
  const body = `Bonjour ${firstName},

Votre accès Signature Immobilier est prêt.

Vous pouvez maintenant activer votre espace agence et créer votre mot de passe.

Cliquez sur le lien ci-dessous :
${activationUrl}

Une fois votre mot de passe créé, vous pourrez revenir sur le site ${agencyConfig.brand.name} et cliquer sur “Mon suivi” pour accéder à votre espace.

À bientôt,
${agencyConfig.brand.name}`;

  return buildInvitationEmail({
    email,
    activationUrl,
    subject,
    body,
  });
}

export function buildAgentEmail({
  firstName,
  email,
  activationUrl,
}: {
  firstName: string;
  email: string;
  activationUrl: string;
}): AccessEmail {
  const subject = "Votre accès agent Signature Immobilier est prêt";
  const body = `Bonjour ${firstName},

Votre accès agent Signature Immobilier est prêt.

Cliquez sur le lien ci-dessous pour activer votre compte et créer votre mot de passe :
${activationUrl}

Une fois votre mot de passe créé, vous pourrez revenir sur le site ${agencyConfig.brand.name} et cliquer sur “Mon suivi” pour accéder à votre espace agent.

À bientôt,
${agencyConfig.brand.name}`;

  return buildInvitationEmail({
    email,
    activationUrl,
    subject,
    body,
  });
}

export function openAccessEmail(mailtoHref: string) {
  openMailApp(mailtoHref);
}

export function openAccessGmail(gmailHref: string) {
  return openGmailCompose(gmailHref);
}

function upsertLocalInvitation(invitation: AccessInvitation) {
  const invitations = readLocalInvitations();
  const existingIndex = invitations.findIndex(
    (item) =>
      item.role === invitation.role &&
      item.email.toLowerCase() === invitation.email.toLowerCase(),
  );
  const alreadyExists = existingIndex >= 0;

  if (alreadyExists) {
    invitations[existingIndex] = {
      ...invitations[existingIndex],
      ...invitation,
      id: invitations[existingIndex].id,
      created_at: invitations[existingIndex].created_at,
      status: invitations[existingIndex].status,
      activation_token:
        invitations[existingIndex].status === "active"
          ? null
          : invitation.activation_token,
      activated_at: invitations[existingIndex].activated_at,
    };
  } else {
    invitations.unshift(invitation);
  }

  writeLocalInvitations(invitations);
  return {
    invitation: alreadyExists ? invitations[existingIndex] : invitation,
    alreadyExists,
  };
}

export async function listAgencyAdminInvitations() {
  try {
    const { data, error } = await supabase
      .from("access_invitations")
      .select("*")
      .eq("role", "agency_admin")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return {
      invitations: (data ?? []) as AccessInvitation[],
      persistedIn: "supabase" as const,
    };
  } catch (error) {
    console.warn(
      "Unable to load agency admin invitations from Supabase",
      error,
    );
  }

  return {
    invitations: readLocalInvitations().filter(
      (invitation) => invitation.role === "agency_admin",
    ),
    persistedIn: "local" as const,
  };
}

export async function createAgencyAdminAccess(
  input: AgencyAdminInput,
): Promise<AccessCreationResult> {
  const token = generateAccessToken();
  const activationUrl = getAccessActivationUrl("agency_admin", token);
  const email = buildAgencyAdminEmail({
    firstName: input.firstName,
    email: input.email,
    activationUrl,
  });
  const agencyId = crypto.randomUUID();

  try {
    const { data: agency, error: agencyError } = await supabase
      .from("agencies")
      .insert({
        id: agencyId,
        name: input.agencyName,
        city: input.agencyCity,
        phone: input.agencyPhone,
        email: input.agencyEmail,
      })
      .select("*")
      .single();

    if (agencyError) throw agencyError;

    const { data: existing, error: existingError } = await supabase
      .from("access_invitations")
      .select("*")
      .eq("role", "agency_admin")
      .eq("email", input.email)
      .maybeSingle();

    if (existingError) throw existingError;

    if (existing) {
      const { data: updated, error: updateError } = await supabase
        .from("access_invitations")
        .update({
          agency_id: agency.id,
          agency_name: input.agencyName,
          agency_city: input.agencyCity,
          agency_phone: input.agencyPhone,
          agency_email: input.agencyEmail,
          first_name: input.firstName,
          last_name: input.lastName,
          phone: input.phone,
          activation_token: existing.status === "active" ? null : token,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id)
        .select("*")
        .single();

      if (updateError) throw updateError;

      return {
        ...email,
        invitation: updated as AccessInvitation,
        alreadyExists: true,
        persistedIn: "supabase",
      };
    }

    const { data: invitation, error: invitationError } = await supabase
      .from("access_invitations")
      .insert({
        agency_id: agency.id,
        agency_name: input.agencyName,
        agency_city: input.agencyCity,
        agency_phone: input.agencyPhone,
        agency_email: input.agencyEmail,
        first_name: input.firstName,
        last_name: input.lastName,
        email: input.email,
        phone: input.phone,
        role: "agency_admin",
        activation_token: token,
        status: "pending",
      })
      .select("*")
      .single();

    if (invitationError) throw invitationError;

    return {
      ...email,
      invitation: invitation as AccessInvitation,
      alreadyExists: false,
      persistedIn: "supabase",
    };
  } catch (error) {
    console.warn("Agency admin access saved locally", error);
  }

  const localInvitation: AccessInvitation = {
    id: crypto.randomUUID(),
    agency_id: agencyId,
    agency_name: input.agencyName,
    agency_city: input.agencyCity,
    agency_phone: input.agencyPhone,
    agency_email: input.agencyEmail,
    first_name: input.firstName,
    last_name: input.lastName,
    email: input.email,
    phone: input.phone,
    role: "agency_admin",
    activation_token: token,
    status: "pending",
    user_id: null,
    created_at: new Date().toISOString(),
    activated_at: null,
  };
  const local = upsertLocalInvitation(localInvitation);

  return {
    ...email,
    invitation: local.invitation,
    alreadyExists: local.alreadyExists,
    persistedIn: "local",
  };
}

export async function getAgencyForUser(email: string) {
  try {
    const { data, error } = await supabase.rpc("get_my_agency");
    if (error) throw error;
    if (Array.isArray(data) && data[0]) {
      return data[0] as AgencySummary;
    }
  } catch (error) {
    console.warn("Unable to load agency from Supabase", error);
  }

  const invitation = readLocalInvitations().find(
    (item) =>
      (item.role === "agency_admin" || item.role === "agent") &&
      item.email.toLowerCase() === email.toLowerCase(),
  );

  if (invitation) {
    return {
      id: invitation.agency_id,
      name: invitation.agency_name,
      city: invitation.agency_city,
      phone: invitation.agency_phone,
      email: invitation.agency_email,
    };
  }

  return {
    id: "agency-signature-demo",
    name: agencyConfig.brand.name,
    city: agencyConfig.contact.area,
    phone: agencyConfig.contact.phone,
    email: agencyConfig.contact.email,
  };
}

export async function listAgentInvitations(agencyId: string) {
  try {
    const { data, error } = await supabase
      .from("access_invitations")
      .select("*")
      .eq("role", "agent")
      .eq("agency_id", agencyId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return {
      invitations: (data ?? []) as AccessInvitation[],
      persistedIn: "supabase" as const,
    };
  } catch (error) {
    console.warn("Unable to load agent invitations from Supabase", error);
  }

  return {
    invitations: readLocalInvitations().filter(
      (invitation) =>
        invitation.role === "agent" && invitation.agency_id === agencyId,
    ),
    persistedIn: "local" as const,
  };
}

export async function createAgentAccess(
  input: AgentInput,
): Promise<AccessCreationResult> {
  const token = generateAccessToken();
  const activationUrl = getAccessActivationUrl("agent", token);
  const email = buildAgentEmail({
    firstName: input.firstName,
    email: input.email,
    activationUrl,
  });

  try {
    const { data: existing, error: existingError } = await supabase
      .from("access_invitations")
      .select("*")
      .eq("role", "agent")
      .eq("agency_id", input.agency.id)
      .eq("email", input.email)
      .maybeSingle();

    if (existingError) throw existingError;

    if (existing) {
      const { data: updated, error: updateError } = await supabase
        .from("access_invitations")
        .update({
          first_name: input.firstName,
          last_name: input.lastName,
          phone: input.phone,
          activation_token: existing.status === "active" ? null : token,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id)
        .select("*")
        .single();

      if (updateError) throw updateError;

      return {
        ...email,
        invitation: updated as AccessInvitation,
        alreadyExists: true,
        persistedIn: "supabase",
      };
    }

    const { data: invitation, error: invitationError } = await supabase
      .from("access_invitations")
      .insert({
        agency_id: input.agency.id,
        agency_name: input.agency.name,
        agency_city: input.agency.city,
        agency_phone: input.agency.phone,
        agency_email: input.agency.email,
        first_name: input.firstName,
        last_name: input.lastName,
        email: input.email,
        phone: input.phone,
        role: "agent",
        activation_token: token,
        status: "pending",
      })
      .select("*")
      .single();

    if (invitationError) throw invitationError;

    return {
      ...email,
      invitation: invitation as AccessInvitation,
      alreadyExists: false,
      persistedIn: "supabase",
    };
  } catch (error) {
    console.warn("Agent access saved locally", error);
  }

  const localInvitation: AccessInvitation = {
    id: crypto.randomUUID(),
    agency_id: input.agency.id,
    agency_name: input.agency.name,
    agency_city: input.agency.city,
    agency_phone: input.agency.phone,
    agency_email: input.agency.email,
    first_name: input.firstName,
    last_name: input.lastName,
    email: input.email,
    phone: input.phone,
    role: "agent",
    activation_token: token,
    status: "pending",
    user_id: null,
    created_at: new Date().toISOString(),
    activated_at: null,
  };
  const local = upsertLocalInvitation(localInvitation);

  return {
    ...email,
    invitation: local.invitation,
    alreadyExists: local.alreadyExists,
    persistedIn: "local",
  };
}

export async function findAccessInvitationByToken(
  role: AccessRole,
  token: string,
) {
  try {
    const { data, error } = await supabase.rpc(
      "get_access_invitation_by_token",
      {
        p_token: token,
        p_role: role,
      },
    );

    if (error) throw error;
    if (Array.isArray(data) && data[0]) {
      return {
        invitation: data[0] as AccessInvitation,
        persistedIn: "supabase" as const,
      };
    }
  } catch (error) {
    console.warn("Unable to read access invitation from Supabase", error);
  }

  const localInvitation = readLocalInvitations().find(
    (invitation) =>
      invitation.role === role &&
      invitation.activation_token === token &&
      invitation.status === "pending",
  );

  return localInvitation
    ? { invitation: localInvitation, persistedIn: "local" as const }
    : null;
}

export async function markAccessInvitationActivated({
  role,
  token,
  userId,
  persistedIn,
}: {
  role: AccessRole;
  token: string;
  userId: string;
  persistedIn: "supabase" | "local";
}) {
  if (persistedIn === "supabase") {
    const { error } = await supabase.rpc("activate_access_invitation", {
      p_token: token,
      p_role: role,
      p_user_id: userId,
    });

    if (error) throw error;
    return;
  }

  const invitations = readLocalInvitations();
  writeLocalInvitations(
    invitations.map((invitation) =>
      invitation.role === role && invitation.activation_token === token
        ? {
            ...invitation,
            status: "active",
            activation_token: null,
            user_id: userId,
            activated_at: new Date().toISOString(),
          }
        : invitation,
    ),
  );
}

export function getActivationDestination(role: UserRole) {
  if (role === "agency_admin") return "/admin-agence";
  if (role === "agent") return "/agent";
  if (role === "seller") return "/vendeur";
  return "/espace-signature";
}
