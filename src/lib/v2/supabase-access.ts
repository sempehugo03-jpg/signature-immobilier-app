import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import {
  type Agency,
  type Property,
  type SellerProfile,
  type V2AccessInvitation,
  type V2UserAccess,
} from "@/lib/v2/core";

type InviteRole = "manager" | "agent" | "seller";

type SupabaseAgencyRow = {
  id: string;
  slug: string;
  name: string;
  city: string | null;
  phone: string | null;
  email: string | null;
  status: string | null;
  created_at: string | null;
};

type SupabasePropertyRow = {
  id: string;
  agency_id: string;
  agency_slug: string;
  title: string;
  slug: string | null;
  price: number | null;
  surface: number | null;
  rooms: number | null;
  description: string | null;
  is_published: boolean | null;
  seller_token: string | null;
  created_at: string | null;
};

type SupabaseSellerRow = {
  id: string;
  agency_id: string;
  property_id: string;
  seller_token: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  phone: string | null;
  status: string | null;
  created_at: string | null;
};

type SupabaseInvitationRow = {
  id: string;
  token: string;
  agency_id: string;
  agency_slug: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  role: InviteRole;
  property_id: string | null;
  seller_token: string | null;
  status: "pending" | "accepted" | "expired" | null;
  destination: string;
  created_at: string | null;
  accepted_at: string | null;
};

type SupabaseAccessRow = {
  id: string;
  email: string;
  role: "admin" | InviteRole;
  agency_id: string | null;
  agency_slug: string | null;
  property_id: string | null;
  seller_token: string | null;
  destination: string;
  password_marker: string | null;
  is_active: boolean | null;
  created_at: string | null;
};

export type SupabaseInviteLookup = {
  invitation: V2AccessInvitation;
  agencyName: string;
};

type SupabaseResult<T> =
  | ({ ok: true } & T)
  | { ok: false; code: string; message: string };

export async function createSellerInviteInSupabase(input: {
  agency: Agency;
  property: Property;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  sellerToken?: string;
}): Promise<
  SupabaseResult<{
    invitation: V2AccessInvitation;
    seller: SellerProfile;
    sellerToken: string;
  }>
> {
  if (!isSupabaseConfigured) return supabaseNotConfigured();

  const agency = await ensureAgency(input.agency);
  if (!agency.ok) return agency;

  const property = await ensureProperty(agency.agency, input.property);
  if (!property.ok) return property;

  const sellerToken = input.sellerToken || `seller_${safeId()}`;
  const destination = `/vendeur/${sellerToken}`;
  const normalizedEmail = normalizeEmail(input.email);

  const { data: sellerRow, error: sellerError } = await supabase
    .from("sellers")
    .upsert(
      {
        agency_id: agency.agency.id,
        property_id: property.property.id,
        seller_token: sellerToken,
        first_name: input.firstName,
        last_name: input.lastName,
        email: normalizedEmail,
        phone: input.phone,
        status: "invited",
      },
      { onConflict: "seller_token" },
    )
    .select("*")
    .single<SupabaseSellerRow>();

  if (sellerError || !sellerRow) {
    return supabaseWriteError("seller_create_failed", sellerError?.message);
  }

  const invitation = await insertInvitation({
    agencyId: agency.agency.id,
    agencySlug: agency.agency.slug,
    email: normalizedEmail,
    firstName: input.firstName,
    lastName: input.lastName,
    phone: input.phone,
    role: "seller",
    propertyId: property.property.id,
    sellerToken,
    destination,
    agencyName: agency.agency.name,
  });

  if (!invitation.ok) return invitation;

  return {
    ok: true,
    invitation: invitation.invitation,
    seller: mapSellerRow(sellerRow),
    sellerToken,
  };
}

export async function createTeamInviteInSupabase(input: {
  agency: Agency;
  role: "manager" | "agent";
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}): Promise<SupabaseResult<{ invitation: V2AccessInvitation }>> {
  if (!isSupabaseConfigured) return supabaseNotConfigured();

  const agency = await ensureAgency(input.agency);
  if (!agency.ok) return agency;

  const destination =
    input.role === "manager"
      ? `/patron/${agency.agency.slug}`
      : `/agent/${agency.agency.slug}`;

  return insertInvitation({
    agencyId: agency.agency.id,
    agencySlug: agency.agency.slug,
    email: normalizeEmail(input.email),
    firstName: input.firstName,
    lastName: input.lastName,
    phone: input.phone,
    role: input.role,
    destination,
    agencyName: agency.agency.name,
  });
}

export async function getInviteByTokenFromSupabase(
  token: string,
): Promise<SupabaseInviteLookup | null> {
  if (!isSupabaseConfigured) return null;
  const cleanToken = token.trim();
  if (!cleanToken) return null;

  const { data, error } = await supabase
    .from("access_invitations")
    .select("*")
    .eq("token", cleanToken)
    .maybeSingle<SupabaseInvitationRow>();

  if (error || !data) return null;

  const agencyName = await getAgencyName(data.agency_id, data.agency_slug);
  return {
    invitation: mapInvitationRow(data),
    agencyName,
  };
}

export async function acceptInviteInSupabase(
  token: string,
  password: string,
): Promise<SupabaseResult<{ access: V2UserAccess; destination: string }>> {
  const lookup = await getInviteByTokenFromSupabase(token);
  if (!lookup) {
    return {
      ok: false,
      code: "invite_not_found",
      message: "Lien d'invitation invalide ou expire.",
    };
  }

  const invitation = lookup.invitation;
  if (invitation.status === "accepted") {
    return {
      ok: false,
      code: "invite_already_accepted",
      message: "Ce lien a deja ete utilise.",
    };
  }

  const destination = invitation.destination;
  if (!destination) {
    return {
      ok: false,
      code: "invite_destination_missing",
      message:
        invitation.role === "seller"
          ? "Acces vendeur incomplet : sellerToken manquant."
          : "Acces incomplet : agencySlug manquant.",
    };
  }

  const { data, error } = await supabase
    .from("user_accesses")
    .insert({
      email: invitation.email,
      role: invitation.role,
      agency_id: invitation.agencyId,
      agency_slug: invitation.agencySlug,
      property_id: invitation.propertyId ?? null,
      seller_token: invitation.sellerToken ?? null,
      destination,
      password_marker: createPilotPasswordMarker(password),
      is_active: true,
    })
    .select("*")
    .single<SupabaseAccessRow>();

  if (error || !data) {
    return supabaseWriteError("access_create_failed", error?.message);
  }

  const { error: updateError } = await supabase
    .from("access_invitations")
    .update({ status: "accepted", accepted_at: new Date().toISOString() })
    .eq("token", invitation.token);

  if (updateError) {
    return supabaseWriteError("invite_accept_failed", updateError.message);
  }

  return {
    ok: true,
    access: mapAccessRow(data),
    destination,
  };
}

export async function findUserAccessByCredentialsFromSupabase(
  email: string,
  password: string,
): Promise<V2UserAccess | null> {
  if (!isSupabaseConfigured) return null;

  const { data, error } = await supabase
    .from("user_accesses")
    .select("*")
    .eq("email", normalizeEmail(email))
    .eq("password_marker", createPilotPasswordMarker(password))
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle<SupabaseAccessRow>();

  if (error || !data) return null;
  return mapAccessRow(data);
}

export async function getSellerSpaceFromSupabase(sellerToken: string) {
  if (!isSupabaseConfigured) return null;
  const cleanToken = sellerToken.trim();
  if (!cleanToken) return null;

  const { data: sellerRow, error: sellerError } = await supabase
    .from("sellers")
    .select("*")
    .eq("seller_token", cleanToken)
    .maybeSingle<SupabaseSellerRow>();

  if (sellerError || !sellerRow) return null;

  const { data: propertyRow } = await supabase
    .from("properties")
    .select("*")
    .eq("id", sellerRow.property_id)
    .maybeSingle<SupabasePropertyRow>();

  if (!propertyRow) {
    return {
      seller: mapSellerRow(sellerRow),
      property: null,
      agency: null,
      branding: null,
      visits: [],
      reports: [],
      documents: [],
    };
  }

  const { data: agencyRow } = await supabase
    .from("agencies")
    .select("*")
    .eq("id", sellerRow.agency_id)
    .maybeSingle<SupabaseAgencyRow>();

  if (!agencyRow) {
    return {
      seller: mapSellerRow(sellerRow),
      property: mapPropertyRow(propertyRow),
      agency: null,
      branding: null,
      visits: [],
      reports: [],
      documents: [],
    };
  }

  return {
    seller: mapSellerRow(sellerRow),
    property: mapPropertyRow(propertyRow),
    agency: mapAgencyRow(agencyRow),
    branding: null,
    visits: [],
    reports: [],
    documents: [],
  };
}

async function ensureAgency(
  agency: Agency,
): Promise<SupabaseResult<{ agency: SupabaseAgencyRow }>> {
  const { data: existing } = await supabase
    .from("agencies")
    .select("*")
    .eq("slug", agency.slug)
    .maybeSingle<SupabaseAgencyRow>();

  if (existing) return { ok: true, agency: existing };

  const insertPayload: Record<string, unknown> = {
    slug: agency.slug,
    name: agency.name,
    city: agency.city,
    phone: agency.phone,
    email: agency.email,
    status: agency.status,
  };
  if (isUuid(agency.id)) insertPayload.id = agency.id;

  const { data, error } = await supabase
    .from("agencies")
    .insert(insertPayload)
    .select("*")
    .single<SupabaseAgencyRow>();

  if (error || !data) {
    return supabaseWriteError("agency_sync_failed", error?.message);
  }

  return { ok: true, agency: data };
}

async function ensureProperty(
  agency: SupabaseAgencyRow,
  property: Property,
): Promise<SupabaseResult<{ property: SupabasePropertyRow }>> {
  const { data: existing } = await supabase
    .from("properties")
    .select("*")
    .eq("agency_slug", agency.slug)
    .eq("slug", property.slug)
    .maybeSingle<SupabasePropertyRow>();

  if (existing) return { ok: true, property: existing };

  const insertPayload: Record<string, unknown> = {
    agency_id: agency.id,
    agency_slug: agency.slug,
    title: property.title,
    slug: property.slug,
    price: property.price,
    surface: property.surface,
    rooms: property.rooms,
    description: property.description,
    is_published: property.isPublished,
    seller_token: property.sellerToken ?? null,
  };
  if (isUuid(property.id)) insertPayload.id = property.id;

  const { data, error } = await supabase
    .from("properties")
    .insert(insertPayload)
    .select("*")
    .single<SupabasePropertyRow>();

  if (error || !data) {
    return supabaseWriteError("property_sync_failed", error?.message);
  }

  return { ok: true, property: data };
}

async function insertInvitation(input: {
  agencyId: string;
  agencySlug: string;
  agencyName: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: InviteRole;
  destination: string;
  propertyId?: string;
  sellerToken?: string;
}): Promise<SupabaseResult<{ invitation: V2AccessInvitation }>> {
  const token = `invite_${safeId()}_${safeId()}`;
  const { data, error } = await supabase
    .from("access_invitations")
    .insert({
      token,
      agency_id: input.agencyId,
      agency_slug: input.agencySlug,
      email: input.email,
      first_name: input.firstName,
      last_name: input.lastName,
      phone: input.phone,
      role: input.role,
      property_id: input.propertyId ?? null,
      seller_token: input.sellerToken ?? null,
      status: "pending",
      destination: input.destination,
    })
    .select("*")
    .single<SupabaseInvitationRow>();

  if (error || !data) {
    return supabaseWriteError("invite_create_failed", error?.message);
  }

  return {
    ok: true,
    invitation: mapInvitationRow(data),
  };
}

async function getAgencyName(agencyId: string, agencySlug: string) {
  const { data } = await supabase
    .from("agencies")
    .select("name")
    .eq("id", agencyId)
    .maybeSingle<{ name: string }>();

  return data?.name ?? agencySlug ?? "Signature Immobilier";
}

function mapInvitationRow(row: SupabaseInvitationRow): V2AccessInvitation {
  return {
    id: row.id,
    token: row.token,
    role: row.role,
    agencyId: row.agency_id,
    agencySlug: row.agency_slug,
    email: row.email,
    firstName: row.first_name ?? undefined,
    lastName: row.last_name ?? undefined,
    phone: row.phone ?? undefined,
    propertyId: row.property_id ?? undefined,
    sellerToken: row.seller_token ?? undefined,
    status: row.status === "accepted" ? "accepted" : row.status ?? "pending",
    inviteUrl: `/creer-acces/${row.token}`,
    destination: row.destination,
    emailStatus: "prepared",
    createdAt: row.created_at ?? new Date().toISOString(),
    acceptedAt: row.accepted_at ?? undefined,
  };
}

function mapAccessRow(row: SupabaseAccessRow): V2UserAccess {
  return {
    id: row.id,
    email: row.email,
    role: row.role,
    agencyId: row.agency_id ?? undefined,
    agencySlug: row.agency_slug ?? undefined,
    propertyId: row.property_id ?? undefined,
    sellerToken: row.seller_token ?? undefined,
    destination: row.destination,
    passwordMarker: row.password_marker ?? "",
    isActive: row.is_active ?? true,
    createdAt: row.created_at ?? new Date().toISOString(),
    updatedAt: row.created_at ?? new Date().toISOString(),
  };
}

function mapAgencyRow(row: SupabaseAgencyRow): Agency {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    city: row.city ?? "",
    phone: row.phone ?? "",
    email: row.email ?? "",
    status: row.status === "active" ? "active" : "demo",
    createdAt: row.created_at ?? new Date().toISOString(),
  };
}

function mapPropertyRow(row: SupabasePropertyRow): Property {
  return {
    id: row.id,
    agencyId: row.agency_id,
    agencySlug: row.agency_slug,
    slug: row.slug ?? row.id,
    title: row.title,
    city: "",
    district: "",
    address: "",
    price: Number(row.price ?? 0),
    surface: Number(row.surface ?? 0),
    rooms: Number(row.rooms ?? 0),
    type: "Bien",
    description: row.description ?? "",
    highlights: [],
    publicBadge: "",
    isPublished: Boolean(row.is_published),
    saleStep: "visits_ongoing",
    sellerToken: row.seller_token ?? undefined,
    photos: [
      {
        id: `${row.id}_placeholder`,
        propertyId: row.id,
        url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=80",
        name: "Photo principale",
        alt: row.title,
        isMain: true,
        order: 1,
      },
    ],
    createdAt: row.created_at ?? new Date().toISOString(),
    updatedAt: row.created_at ?? new Date().toISOString(),
  };
}

function mapSellerRow(row: SupabaseSellerRow): SellerProfile {
  return {
    id: row.id,
    agencyId: row.agency_id,
    propertyId: row.property_id,
    sellerToken: row.seller_token,
    firstName: row.first_name ?? "",
    lastName: row.last_name ?? "",
    email: row.email,
    phone: row.phone ?? "",
    status: row.status === "active" ? "active" : "invited",
    inviteUrl: undefined,
  };
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function createPilotPasswordMarker(password: string) {
  let hash = 0;
  for (const char of password) {
    hash = (hash * 31 + char.charCodeAt(0)) | 0;
  }
  return `pilot:${Math.abs(hash).toString(36)}`;
}

function safeId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID().replace(/-/g, "").slice(0, 16);
  }
  return Math.random().toString(36).slice(2, 18);
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

function supabaseNotConfigured(): SupabaseResult<never> {
  return {
    ok: false,
    code: "supabase_not_configured",
    message:
      "Supabase n'est pas configure. Le lien reste disponible en mode local.",
  };
}

function supabaseWriteError(
  code: string,
  message = "Impossible d'enregistrer l'invitation dans Supabase.",
): SupabaseResult<never> {
  return {
    ok: false,
    code,
    message,
  };
}
