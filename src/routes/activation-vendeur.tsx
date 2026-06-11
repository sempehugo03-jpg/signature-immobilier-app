import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { FormEvent, useEffect, useState } from "react";
import { ArrowRight, CheckCircle2, KeyRound } from "lucide-react";

import { SiteLayout } from "@/components/site-layout";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import {
  findSellerSpaceByToken,
  markSellerSpaceActivated,
  type SellerSpace,
} from "@/lib/seller-space";
import { getDashboardPath, supabase } from "@/lib/supabase";

export const Route = createFileRoute("/activation-vendeur")({
  validateSearch: (search: Record<string, unknown>) => ({
    token: typeof search.token === "string" ? search.token : "",
  }),
  head: () => ({
    meta: [
      { title: "Activer mon espace vendeur - Signature Immobilier" },
      {
        name: "description",
        content: "Activation sécurisée de votre espace vendeur.",
      },
    ],
  }),
  component: ActivationVendeurPage,
});

function ActivationVendeurPage() {
  const { token } = Route.useSearch();
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();
  const [space, setSpace] = useState<SellerSpace | null>(null);
  const [persistedIn, setPersistedIn] = useState<"supabase" | "local" | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadSpace() {
      if (!token) {
        setLoading(false);
        return;
      }

      const result = await findSellerSpaceByToken(token);
      if (!active) return;

      setSpace(result?.space ?? null);
      setPersistedIn(result?.persistedIn ?? null);
      setLoading(false);
    }

    loadSpace();

    return () => {
      active = false;
    };
  }, [token]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!space || !persistedIn) return;

    setSubmitting(true);
    setError(null);

    if (password.length < 6) {
      setSubmitting(false);
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    if (password !== confirmPassword) {
      setSubmitting(false);
      setError("Les deux mots de passe ne correspondent pas.");
      return;
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: space.seller_email,
      password,
      options: {
        data: { role: "seller" },
      },
    });

    if (signUpError) {
      setSubmitting(false);
      setError(signUpError.message);
      return;
    }

    const userId = data.user?.id;
    if (!userId) {
      setSubmitting(false);
      setError("Impossible de créer le compte vendeur.");
      return;
    }

    if (persistedIn === "local") {
      const { error: profileError } = await supabase.from("profiles").upsert(
        {
          id: userId,
          email: space.seller_email,
          role: "seller",
        },
        { onConflict: "id" },
      );

      if (profileError) {
        setSubmitting(false);
        setError(profileError.message);
        return;
      }
    }

    try {
      await markSellerSpaceActivated({ token, userId, persistedIn });
    } catch (activationError) {
      console.error(
        "Unable to mark seller space as activated",
        activationError,
      );
    }

    if (!data.session) {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: space.seller_email,
        password,
      });

      if (signInError) {
        setSubmitting(false);
        setError(
          "Le compte est créé, mais la connexion automatique a échoué. Essayez depuis “Mon suivi”.",
        );
        return;
      }
    }

    const profile = await refreshProfile();
    setSubmitting(false);
    navigate({
      to: getDashboardPath(profile?.role ?? "seller"),
      replace: true,
    });
  }

  return (
    <SiteLayout variant="public">
      <section className="mx-auto grid min-h-[calc(100vh-12rem)] max-w-6xl items-center px-5 py-12 md:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_440px] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs tracking-wide text-secondary-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-gold" />
              Espace vendeur sécurisé
            </div>
            <h1 className="mt-5 font-display text-4xl leading-tight md:text-5xl">
              Activer mon espace vendeur
            </h1>
            <p className="mt-4 max-w-xl text-muted-foreground">
              Créez votre mot de passe pour accéder à votre suivi de vente.
            </p>
          </div>

          <Card className="rounded-2xl">
            <CardHeader>
              <div className="mb-3 grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground">
                {space ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  <KeyRound className="h-5 w-5" />
                )}
              </div>
              <CardTitle className="font-display text-3xl">
                Activation
              </CardTitle>
              <CardDescription>
                {loading
                  ? "Vérification du lien d’activation..."
                  : "Choisissez un mot de passe confidentiel."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!loading && !space && (
                <Alert variant="destructive">
                  <AlertDescription>
                    Ce lien d’activation est invalide ou a déjà été utilisé.
                  </AlertDescription>
                </Alert>
              )}

              {space && (
                <form className="space-y-4" onSubmit={onSubmit}>
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label>Email vendeur</Label>
                    <Input value={space.seller_email} readOnly />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Mot de passe</Label>
                    <Input
                      id="password"
                      type="password"
                      autoComplete="new-password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">
                      Confirmer le mot de passe
                    </Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(event) =>
                        setConfirmPassword(event.target.value)
                      }
                      required
                    />
                  </div>

                  <Button
                    className="w-full rounded-full"
                    size="lg"
                    disabled={submitting}
                  >
                    {submitting ? "Activation..." : "Activer mon espace"}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </SiteLayout>
  );
}
