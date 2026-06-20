import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";

import { AuthContext, type AuthContextValue } from "@/lib/auth-context";
import {
  normalizeUserRole,
  supabase,
  type Profile,
  type UserRole,
} from "@/lib/supabase";
import { clearLocalAccessSessions } from "@/lib/session-cleanup";

const OWNER_EMAIL = "sempehugo03@gmail.com";
const PUBLIC_FALLBACK_ROLE: UserRole = "seller";

function getMetadataValue(user: User, key: string) {
  const value = user.user_metadata?.[key];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function getMetadataFullName(user: User) {
  const fullName = getMetadataValue(user, "full_name");
  if (fullName) return fullName;

  const firstName = getMetadataValue(user, "first_name");
  const lastName = getMetadataValue(user, "last_name");
  return [firstName, lastName].filter(Boolean).join(" ").trim() || null;
}

async function upsertProfile(profile: Profile) {
  const { data, error } = await supabase
    .from("profiles")
    .upsert(profile, { onConflict: "id" })
    .select("*")
    .single();

  if (!error) return data as Profile;

  const minimalProfile = {
    id: profile.id,
    email: profile.email,
    role: profile.role,
  };

  const { data: minimalData, error: minimalError } = await supabase
    .from("profiles")
    .upsert(minimalProfile, { onConflict: "id" })
    .select("*")
    .single();

  if (minimalError) {
    console.error("Unable to create profile", minimalError);
    return null;
  }

  return minimalData as Profile;
}

async function fetchProfile(user: User | null) {
  if (!user) return null;

  const email = user.email ?? "";
  const forcedOwnerRole = email.toLowerCase() === OWNER_EMAIL;
  const metadataRole = normalizeUserRole(user.user_metadata?.role);
  const metadataAgencyId = getMetadataValue(user, "agency_id");
  const metadataFullName = getMetadataFullName(user);
  const metadataPhone = getMetadataValue(user, "phone");
  const metadataStatus = getMetadataValue(user, "status") ?? "active";

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    console.error("Unable to load profile", error);
    return null;
  }

  const normalizedRole = normalizeUserRole(data?.role);
  if (normalizedRole) {
    const role: UserRole = forcedOwnerRole ? "owner" : normalizedRole;

    if (data?.role !== role) {
      await upsertProfile({
        ...data,
        id: user.id,
        email,
        role,
        agency_id: data?.agency_id ?? metadataAgencyId,
        status: data?.status ?? metadataStatus,
        full_name: data?.full_name ?? metadataFullName,
        phone: data?.phone ?? metadataPhone,
      } as Profile);
    }

    return { ...data, email, role } as Profile;
  }

  const fallbackProfile = {
    id: user.id,
    email,
    role: forcedOwnerRole ? "owner" : (metadataRole ?? PUBLIC_FALLBACK_ROLE),
    agency_id: metadataAgencyId,
    status: metadataStatus,
    full_name: metadataFullName,
    phone: metadataPhone,
  };

  const inserted = await upsertProfile(fallbackProfile);

  return inserted ?? fallbackProfile;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const user = session?.user ?? null;

  const refreshProfile = useCallback(async () => {
    const { data } = await supabase.auth.getUser();
    const nextProfile = await fetchProfile(data.user ?? user);
    setProfile(nextProfile);
    return nextProfile;
  }, [user]);

  useEffect(() => {
    let active = true;

    async function loadSession() {
      const { data } = await supabase.auth.getSession();
      if (!active) return;

      setSession(data.session);
      setProfile(await fetchProfile(data.session?.user ?? null));
      setLoading(false);
    }

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      fetchProfile(nextSession?.user ?? null).then((nextProfile) => {
        if (active) setProfile(nextProfile);
      });
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } finally {
      clearLocalAccessSessions();
      setSession(null);
      setProfile(null);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user,
      profile,
      loading,
      refreshProfile,
      signOut,
    }),
    [session, user, profile, loading, refreshProfile, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
