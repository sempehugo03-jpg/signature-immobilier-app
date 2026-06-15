import type { InviteAccessType } from "@/lib/invite-email";

export type InviteTokenStatus = "pending" | "used" | "expired";
export type InviteTokenPersistence = "supabase" | "local";

export type InviteTokenRecord = {
  id: string;
  token: string;
  type: InviteAccessType;
  agencyId: string;
  agencySlug: string;
  teamMemberId?: string;
  propertyId?: string;
  sellerToken?: string;
  email: string;
  status: InviteTokenStatus;
  createdAt: string;
  usedAt?: string;
  expiresAt?: string;
};

export type CreateInviteTokenInput = {
  type: InviteAccessType;
  agencyId: string;
  agencySlug: string;
  teamMemberId?: string;
  propertyId?: string;
  sellerToken?: string;
  email: string;
  expiresAt?: string;
};

export function getInviteAppBaseUrl() {
  const env = import.meta.env as Record<string, string | undefined>;
  if (typeof window !== "undefined" && window.location.origin) {
    return window.location.origin.replace(/\/$/, "");
  }
  if (env.VITE_APP_URL) return env.VITE_APP_URL.replace(/\/$/, "");
  if (env.NEXT_PUBLIC_APP_URL)
    return env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  return "https://signature-immobilier-app.vercel.app";
}

export function buildInviteUrl(token: string) {
  return `${getInviteAppBaseUrl()}/creer-acces/${encodeURIComponent(token)}`;
}

export function getInviteDestination(record: InviteTokenRecord) {
  const agencyPath = `/agence/${encodeURIComponent(record.agencySlug)}`;
  if (record.type === "seller_invite") {
    return `${agencyPath}/vendeur/${encodeURIComponent(record.sellerToken ?? "")}`;
  }

  return agencyPath;
}

export function getEffectiveInviteStatus(record: InviteTokenRecord) {
  if (
    record.status === "pending" &&
    record.expiresAt &&
    new Date(record.expiresAt).getTime() < Date.now()
  ) {
    return "expired";
  }

  return record.status;
}
