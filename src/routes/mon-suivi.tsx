import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { FormEvent, useEffect, useState } from "react";
import { ArrowRight, KeyRound } from "lucide-react";

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
import { getDashboardPath, supabase } from "@/lib/supabase";

export const Route = createFileRoute("/mon-suivi")({
  head: () => ({
    meta: [
      { title: "Accéder à mon suivi - Signature Immobilier" },
      {
        name: "description",
        content: "Connexion à votre suivi immobilier Signature Immobilier.",
      },
    ],
  }),
  component: MonSuiviPage,
});

function MonSuiviPage() {
  const navigate = useNavigate();
  const { loading, profile, refreshProfile } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && profile) {
      navigate({ to: getDashboardPath(profile.role), replace: true });
    }
  }, [loading, navigate, profile]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setSubmitting(false);
      setError(signInError.message);
      return;
    }

    const nextProfile = await refreshProfile();
    setSubmitting(false);

    if (!nextProfile) {
      setError("Connexion réussie, mais aucun rôle n’est associé à ce compte.");
      return;
    }

    navigate({ to: getDashboardPath(nextProfile.role), replace: true });
  }

  return (
    <SiteLayout variant="public">
      <section className="mx-auto grid min-h-[calc(100vh-12rem)] max-w-6xl items-center px-5 py-12 md:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_440px] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs tracking-wide text-secondary-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-gold" />
              Suivi sécurisé
            </div>
            <h1 className="mt-5 font-display text-4xl leading-tight md:text-5xl">
              Accéder à mon suivi
            </h1>
            <p className="mt-4 max-w-xl text-muted-foreground">
              Connectez-vous pour retrouver votre espace.
            </p>
          </div>

          <Card className="rounded-2xl">
            <CardHeader>
              <div className="mb-3 grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground">
                <KeyRound className="h-5 w-5" />
              </div>
              <CardTitle className="font-display text-3xl">
                Accéder à mon suivi
              </CardTitle>
              <CardDescription>
                Votre accès est créé par l’agence. Aucun compte public ne peut
                être créé ici.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={onSubmit}>
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe</Label>
                  <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                  />
                </div>

                <Button
                  className="w-full rounded-full"
                  size="lg"
                  disabled={submitting}
                >
                  {submitting ? "Connexion..." : "Accéder à mon espace"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    </SiteLayout>
  );
}
