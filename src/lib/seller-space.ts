import { agencyConfig } from "@/lib/agency-config";
import {
  buildInvitationEmail,
  buildPublicAppUrl,
  openGmailCompose,
  openMailApp,
  type InvitationEmail,
} from "@/lib/invitation-email";
import { supabase } from "@/lib/supabase";

const LOCAL_KEY = "signature_seller_spaces";

export type SellerSpaceStatus = "pending" | "activated";

export type SellerSpace = {
  id: string;
  property_id: string;
  property_title: string;
  seller_first_name: string;
  seller_last_name: string;
  seller_email: string;
  seller_phone: string;
  activation_token: string | null;
  status: SellerSpaceStatus;
  user_id?: string | null;
  created_at?: string;
  activated_at?: string | null;
};

export type SellerSpaceInput = {
  propertyId: string;
  propertyTitle: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

export type SellerSpaceEmail = InvitationEmail;

export type SellerSpaceCreationResult = SellerSpaceEmail & {
  space: SellerSpace;
  alreadyExists: boolean;
  persistedIn: "supabase" | "local";
};

function readLocalSpaces() {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(LOCAL_KEY);
  return raw ? (JSON.parse(raw) as SellerSpace[]) : [];
}

function writeLocalSpaces(spaces: SellerSpace[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LOCAL_KEY, JSON.stringify(spaces));
}

export function generateActivationToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export function getActivationUrl(token: string) {
  return buildPublicAppUrl(
    `/activation-vendeur?token=${encodeURIComponent(token)}`,
  );
}

export function buildSellerSpaceEmail({
  firstName,
  email,
  activationUrl,
}: {
  firstName: string;
  email: string;
  activationUrl: string;
}): SellerSpaceEmail {
  const subject = "Votre espace vendeur est prêt";
  const body = `Bonjour ${firstName},

Votre espace vendeur ${agencyConfig.brand.name} est prêt.

Vous pouvez maintenant suivre l’avancement de la vente de votre bien, consulter les prochaines visites, les comptes rendus et retrouver vos documents importants.

Cliquez sur le lien ci-dessous pour activer votre espace et créer votre mot de passe :
${activationUrl}

Une fois votre mot de passe créé, vous pourrez revenir sur le site ${agencyConfig.brand.name} et cliquer sur “Mon suivi” pour accéder à votre espace avec votre email et votre mot de passe.

À bientôt,
${agencyConfig.brand.name}`;

  return buildInvitationEmail({
    email,
    activationUrl,
    subject,
    body,
  });
}

export function openSellerSpaceEmail(mailtoHref: string) {
  openMailApp(mailtoHref);
}

export function openSellerSpaceGmail(gmailHref: string) {
  return openGmailCompose(gmailHref);
}

export async function createOrRefreshSellerSpace(
  input: SellerSpaceInput,
): Promise<SellerSpaceCreationResult> {
  const activationToken = generateActivationToken();
  const activationUrl = getActivationUrl(activationToken);
  const email = buildSellerSpaceEmail({
    firstName: input.firstName,
    email: input.email,
    activationUrl,
  });

  try {
    const { data: existing, error: existingError } = await supabase
      .from("seller_spaces")
      .select("*")
      .eq("property_id", input.propertyId)
      .eq("seller_email", input.email)
      .maybeSingle();

    if (existingError) throw existingError;

    if (existing) {
      const { data: updated, error: updateError } = await supabase
        .from("seller_spaces")
        .update({
          property_title: input.propertyTitle,
          seller_first_name: input.firstName,
          seller_last_name: input.lastName,
          seller_phone: input.phone,
          activation_token:
            existing.status === "activated" ? null : activationToken,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id)
        .select("*")
        .single();

      if (updateError) throw updateError;

      return {
        ...email,
        activationUrl:
          updated.status === "activated"
            ? buildPublicAppUrl("/mon-suivi")
            : activationUrl,
        space: updated as SellerSpace,
        alreadyExists: true,
        persistedIn: "supabase",
      };
    }

    const { data: created, error: insertError } = await supabase
      .from("seller_spaces")
      .insert({
        property_id: input.propertyId,
        property_title: input.propertyTitle,
        seller_first_name: input.firstName,
        seller_last_name: input.lastName,
        seller_email: input.email,
        seller_phone: input.phone,
        activation_token: activationToken,
        status: "pending",
      })
      .select("*")
      .single();

    if (insertError) throw insertError;

    return {
      ...email,
      space: created as SellerSpace,
      alreadyExists: false,
      persistedIn: "supabase",
    };
  } catch (error) {
    console.warn(
      "Seller space saved locally because Supabase is unavailable",
      error,
    );
  }

  const spaces = readLocalSpaces();
  const existingIndex = spaces.findIndex(
    (space) =>
      space.property_id === input.propertyId &&
      space.seller_email.toLowerCase() === input.email.toLowerCase(),
  );
  const alreadyExists = existingIndex >= 0;
  const nextSpace: SellerSpace = {
    id: alreadyExists ? spaces[existingIndex].id : crypto.randomUUID(),
    property_id: input.propertyId,
    property_title: input.propertyTitle,
    seller_first_name: input.firstName,
    seller_last_name: input.lastName,
    seller_email: input.email,
    seller_phone: input.phone,
    activation_token:
      alreadyExists && spaces[existingIndex].status === "activated"
        ? null
        : activationToken,
    status: alreadyExists ? spaces[existingIndex].status : "pending",
    user_id: alreadyExists ? spaces[existingIndex].user_id : null,
    created_at: alreadyExists
      ? spaces[existingIndex].created_at
      : new Date().toISOString(),
    activated_at: alreadyExists ? spaces[existingIndex].activated_at : null,
  };

  if (alreadyExists) {
    spaces[existingIndex] = nextSpace;
  } else {
    spaces.unshift(nextSpace);
  }
  writeLocalSpaces(spaces);

  return {
    ...email,
    activationUrl:
      nextSpace.status === "activated"
        ? buildPublicAppUrl("/mon-suivi")
        : activationUrl,
    space: nextSpace,
    alreadyExists,
    persistedIn: "local",
  };
}

export async function findSellerSpaceByToken(token: string) {
  try {
    const { data, error } = await supabase.rpc("get_seller_space_by_token", {
      p_token: token,
    });

    if (error) throw error;
    if (Array.isArray(data) && data[0]) {
      return {
        space: data[0] as SellerSpace,
        persistedIn: "supabase" as const,
      };
    }
  } catch (error) {
    console.warn("Unable to read seller space from Supabase", error);
  }

  const localSpace = readLocalSpaces().find(
    (space) => space.activation_token === token && space.status === "pending",
  );

  return localSpace
    ? { space: localSpace, persistedIn: "local" as const }
    : null;
}

export async function markSellerSpaceActivated({
  token,
  userId,
  persistedIn,
}: {
  token: string;
  userId: string;
  persistedIn: "supabase" | "local";
}) {
  if (persistedIn === "supabase") {
    const { error } = await supabase.rpc("activate_seller_space", {
      p_token: token,
      p_user_id: userId,
    });

    if (error) throw error;
    return;
  }

  const spaces = readLocalSpaces();
  writeLocalSpaces(
    spaces.map((space) =>
      space.activation_token === token
        ? {
            ...space,
            status: "activated",
            activation_token: null,
            user_id: userId,
            activated_at: new Date().toISOString(),
          }
        : space,
    ),
  );
}
