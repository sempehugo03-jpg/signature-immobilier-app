import { createContext } from "react";
import type { Session, User } from "@supabase/supabase-js";

import type { Profile } from "@/lib/supabase";

export type AuthContextValue = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  refreshProfile: () => Promise<Profile | null>;
  signOut: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);
