import { createFileRoute } from "@tanstack/react-router";
import { FormEvent, useState } from "react";
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
import { isAdminCodeValid, saveAdminSession } from "@/lib/admin-session";
import { signOutEverywhere } from "@/lib/session-cleanup";
import { supabase } from "@/lib/supabase";

type CurrentAccessResult =
  | {
      ok: true;
      destination: string;
    }
  | {
      ok: false;
      code?: string;
      message: string;
    };

const BAD_CREDENTIALS_MESSAGE = "Email ou mot de passe incorrect.";
const NO_ACCESS_MESSAGE =
  "Votre compte existe, mais aucun espace n’est associé à cet email.";
const UNKNOWN_LOGIN_MESSAGE =
  "Impossible de vous connecter pour le moment. Réessayez.";

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
  const { loading, session } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resolvingSession, setResolvingSession] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAdminAccess, setShowAdminAccess] = useState(false);
  const [adminCode, setAdminCode] = useState("");
  const [adminError, setAdminError] = useState<string | null>(null);
  const sessionEmail = session?.user?.email ?? "";

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    await signOutEverywhere();

    const { data, error: signInError } = await supabase.auth.signInWithPassword(
      {
        email,
        password,
      },
    );

    if (signInError) {
      setSubmitting(false);
      setError(getSignInErrorMessage(signInError.message));
      return;
    }

    const accessToken =
      data.session?.access_token ??
      (await supabase.auth.getSession()).data.session?.access_token;

    if (!accessToken) {
      setSubmitting(false);
      setError(UNKNOWN_LOGIN_MESSAGE);
      return;
    }

    const accessResult = await resolveCurrentAccess(accessToken);
    setSubmitting(false);

    if (!accessResult.ok) {
      setError(accessResult.message);
      return;
    }

    window.location.assign(accessResult.destination);
  }

  async function onContinueSession() {
    if (!session?.access_token) return;
    setResolvingSession(true);
    setError(null);

    const accessResult = await resolveCurrentAccess(session.access_token);
    setResolvingSession(false);

    if (!accessResult.ok) {
      setError(accessResult.message);
      return;
    }

    window.location.assign(accessResult.destination);
  }

  async function onChangeAccount() {
    setResolvingSession(true);
    await signOutEverywhere();
    setEmail("");
    setPassword("");
    setError(null);
    setAdminError(null);
    setResolvingSession(false);
  }

  function onAdminSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAdminError(null);

    if (!isAdminCodeValid(adminCode)) {
      setAdminError("Code admin incorrect.");
      return;
    }

    saveAdminSession();
    window.location.assign("/admin");
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
              <div className="mb-5 rounded-xl border border-border/70 bg-secondary/25 p-4">
                <div className="text-sm font-medium">Choisir un accès</div>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Connectez-vous avec votre email pour accéder à votre espace
                  patron, agent ou vendeur. L’accès administrateur reste
                  disponible plus bas.
                </p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span className="rounded-full bg-background px-3 py-1">
                    Accès patron
                  </span>
                  <span className="rounded-full bg-background px-3 py-1">
                    Accès agent
                  </span>
                  <span className="rounded-full bg-background px-3 py-1">
                    Accès vendeur
                  </span>
                  <span className="rounded-full bg-background px-3 py-1">
                    Accès administrateur
                  </span>
                </div>
              </div>

              {!loading && session?.access_token && (
                <Alert className="mb-5">
                  <AlertDescription>
                    <div className="space-y-3">
                      <p>
                        Vous êtes déjà connecté
                        {sessionEmail ? ` avec ${sessionEmail}` : ""}.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          size="sm"
                          className="rounded-full"
                          disabled={resolvingSession}
                          onClick={onContinueSession}
                        >
                          {resolvingSession
                            ? "Ouverture..."
                            : "Continuer vers mon espace"}
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="rounded-full"
                          disabled={resolvingSession}
                          onClick={onChangeAccount}
                        >
                          Changer de compte
                        </Button>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

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
                  disabled={submitting || resolvingSession || loading}
                >
                  {submitting || resolvingSession
                    ? "Connexion..."
                    : "Accéder à mon espace"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </form>

              <div className="mt-6 border-t border-border/60 pt-5">
                <p className="text-center text-xs text-muted-foreground">
                  Vous gérez Signature Immobilier ?{" "}
                  <button
                    type="button"
                    className="font-medium text-primary underline-offset-4 transition hover:underline"
                    onClick={() => {
                      setShowAdminAccess((value) => !value);
                      setAdminError(null);
                    }}
                  >
                    Accès administrateur Signature
                  </button>
                </p>

                {showAdminAccess && (
                  <form
                    className="mt-4 rounded-xl border border-border/70 bg-secondary/30 p-4"
                    onSubmit={onAdminSubmit}
                  >
                    <div className="space-y-2">
                      <Label htmlFor="admin-code">Code admin</Label>
                      <Input
                        id="admin-code"
                        type="password"
                        autoComplete="current-password"
                        value={adminCode}
                        onChange={(event) => {
                          setAdminCode(event.target.value);
                          setAdminError(null);
                        }}
                      />
                    </div>

                    {adminError && (
                      <p className="mt-3 text-sm text-red-600">{adminError}</p>
                    )}

                    <Button className="mt-4 w-full rounded-full" type="submit">
                      Ouvrir l’admin
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </form>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </SiteLayout>
  );
}

async function resolveCurrentAccess(
  accessToken: string,
): Promise<CurrentAccessResult> {
  try {
    const response = await fetch("/api/accesses/current", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const body = await readJsonResponse(response);

    if (
      response.ok &&
      isRecord(body) &&
      body.ok === true &&
      typeof body.destination === "string" &&
      body.destination
    ) {
      return {
        ok: true,
        destination: body.destination,
      };
    }

    if (isRecord(body)) {
      return {
        ok: false,
        code: typeof body.code === "string" ? body.code : undefined,
        message:
          typeof body.message === "string" && body.message
            ? body.message
            : getAccessErrorMessage(body.code),
      };
    }

    return {
      ok: false,
      message: UNKNOWN_LOGIN_MESSAGE,
    };
  } catch {
    return {
      ok: false,
      message: UNKNOWN_LOGIN_MESSAGE,
    };
  }
}

async function readJsonResponse(response: Response) {
  try {
    return (await response.json()) as unknown;
  } catch {
    return null;
  }
}

function getAccessErrorMessage(code: unknown) {
  if (code === "no_access") return NO_ACCESS_MESSAGE;
  return UNKNOWN_LOGIN_MESSAGE;
}

function getSignInErrorMessage(message: string) {
  const details = message.toLowerCase();
  if (
    details.includes("invalid login credentials") ||
    details.includes("invalid credentials") ||
    details.includes("credentials")
  ) {
    return BAD_CREDENTIALS_MESSAGE;
  }

  return UNKNOWN_LOGIN_MESSAGE;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
