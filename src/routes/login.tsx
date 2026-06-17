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

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Connexion - Signature Immobilier" },
      {
        name: "description",
        content: "Connexion vendeur ou agent immobilier.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
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
      setError("Connexion reussie, mais aucun role n'est associe a ce compte.");
      return;
    }

    navigate({ to: getDashboardPath(nextProfile.role), replace: true });
  }

  return (
    <SiteLayout>
      <section className="mx-auto grid min-h-[calc(100vh-8rem)] max-w-6xl items-center px-5 py-12 md:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_440px] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs tracking-wide text-secondary-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-gold" />
              Espace securise
            </div>
            <h1 className="mt-5 font-display text-4xl leading-tight md:text-5xl">
              Connectez-vous a votre espace Signature Immobilier.
            </h1>
            <p className="mt-4 max-w-xl text-muted-foreground">
              Les vendeurs accedent a leur suivi de vente. Les agents
              immobiliers accedent a leur tableau de bord.
            </p>
          </div>

          <Card className="rounded-2xl">
            <CardHeader>
              <div className="mb-3 grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground">
                <KeyRound className="h-5 w-5" />
              </div>
              <CardTitle className="font-display text-3xl">Connexion</CardTitle>
              <CardDescription>
                Utilisez l'email et le mot de passe de votre compte.
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
                  {submitting ? "Connexion..." : "Se connecter"}
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
