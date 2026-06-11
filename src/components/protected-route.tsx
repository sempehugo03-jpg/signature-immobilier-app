import { useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, type ReactNode } from "react";

import { useAuth } from "@/hooks/use-auth";
import { getDashboardPath, getRoleLabel, type UserRole } from "@/lib/supabase";

export function ProtectedRoute({
  role,
  children,
}: {
  role: UserRole | UserRole[];
  children: ReactNode;
}) {
  const { loading, user, profile } = useAuth();
  const navigate = useNavigate();
  const allowedRoles = useMemo(
    () => (Array.isArray(role) ? role : [role]),
    [role],
  );

  useEffect(() => {
    if (loading) return;

    if (!user) {
      navigate({ to: "/mon-suivi", replace: true });
      return;
    }

    if (profile?.role && !allowedRoles.includes(profile.role)) {
      navigate({ to: getDashboardPath(profile.role), replace: true });
    }
  }, [allowedRoles, loading, navigate, profile?.role, user]);

  if (loading) {
    return (
      <AuthStatus title="Chargement" body="Verification de votre session..." />
    );
  }

  if (!user) {
    return <AuthStatus title="Redirection" body="Connexion requise." />;
  }

  if (!profile) {
    return (
      <AuthStatus
        title="Profil incomplet"
        body="Aucun role utilisateur n'est associe a ce compte."
      />
    );
  }

  if (!allowedRoles.includes(profile.role)) {
    return (
      <AuthStatus
        title="Acces reserve"
        body={`Cet espace est reserve au role ${allowedRoles
          .map((allowedRole) => getRoleLabel(allowedRole).toLowerCase())
          .join(" ou ")}.`}
      />
    );
  }

  return <>{children}</>;
}

function AuthStatus({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-5">
      <div className="max-w-sm rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
        <div className="font-display text-2xl">{title}</div>
        <p className="mt-2 text-sm text-muted-foreground">{body}</p>
      </div>
    </div>
  );
}
