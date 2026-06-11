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

const OWNER_EMAIL = "sempehugo03@gmail.com";
const PUBLIC_FALLBACK_ROLE: UserRole = "seller";

async function fetchProfile(user: User | null) {
  if (!user) return null;

  const email = user.email ?? "";
  const forcedOwnerRole = email.toLowerCase() === OWNER_EMAIL;

  const { data, error } = await supabase
    .from("profiles")
    .select("id,email,role,created_at")
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
      await supabase
        .from("profiles")
        .upsert({ id: user.id, email, role }, { onConflict: "id" });
    }

    return { ...data, email, role } as Profile;
  }

  const fallbackProfile = {
    id: user.id,
    email,
    role: forcedOwnerRole ? "owner" : PUBLIC_FALLBACK_ROLE,
  };

  const { data: inserted, error: insertError } = await supabase
    .from("profiles")
    .upsert(fallbackProfile, { onConflict: "id" })
    .select("id,email,role,created_at")
    .single();

  if (insertError) {
    console.error("Unable to create profile", insertError);
    return fallbackProfile;
  }

  return inserted as Profile;
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
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
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
