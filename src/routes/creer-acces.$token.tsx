import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, LogOut } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";

import {
  Field,
  SaasCard,
  SaasHero,
  SaasShell,
} from "@/components/agency-saas-ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  activateInviteAccess,
  getInviteAccessByToken,
  type InviteAccessLookup,
} from "@/lib/agency-saas";

export const Route = createFileRoute("/creer-acces/$token")({
  head: () => ({
    meta: [{ title: "Créer mon accès - Signature Immobilier" }],
  }),
  component: CreateAccessRoute,
});

function CreateAccessRoute() {
  const { token } = Route.useParams();
  const [lookup, setLookup] = useState<InviteAccessLookup | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState("");
  const [redirectPath, setRedirectPath] = useState("");

  useEffect(() => {
    setLookup(getInviteAccessByToken(token));
    setLoaded(true);
  }, [token]);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    if (password !== passwordConfirm) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    const result = activateInviteAccess(token, password);
    setLookup(result);
    if (result.status !== "valid") {
      setError("");
      return;
    }

    const nextRedirectPath =
      "redirectPath" in result ? result.redirectPath : "/";
    setRedirectPath(nextRedirectPath);
    setError("");
    window.setTimeout(() => {
      window.location.assign(nextRedirectPath);
    }, 900);
  }

  if (!loaded || !lookup) return null;

  if (redirectPath) {
    return (
      <SaasShell action={<HomeLink />}>
        <section className="mx-auto grid min-h-[calc(100vh-80px)] max-w-3xl place-items-center px-5 py-16 text-center md:px-8">
          <SaasCard className="p-8 md:p-12">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-50 text-emerald-700">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h1 className="mt-5 font-display text-4xl leading-tight">
              Votre accès est créé.
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-primary/60">
              Vous allez être redirigé vers votre espace Signature Immobilier.
            </p>
            <Button asChild className="mt-7 rounded-full">
              <a href={redirectPath}>Ouvrir maintenant</a>
            </Button>
          </SaasCard>
        </section>
      </SaasShell>
    );
  }

  if (lookup.status !== "valid") {
    return (
      <SaasShell action={<HomeLink />}>
        <SaasHero title={lookup.title} description={lookup.message} />
        <section className="mx-auto max-w-3xl px-5 pb-16 md:px-8">
          <SaasCard className="p-8 text-center md:p-12">
            <Button asChild className="rounded-full">
              <Link to="/">Retour à l’accueil</Link>
            </Button>
          </SaasCard>
        </section>
      </SaasShell>
    );
  }

  return (
    <SaasShell action={<HomeLink />}>
      <SaasHero
        eyebrow={lookup.agency.name}
        title="Créez votre accès Signature Immobilier"
        description={getInviteDescription(lookup)}
      />
      <section className="mx-auto max-w-3xl px-5 pb-16 md:px-8">
        <SaasCard className="p-6 md:p-8">
          <form className="grid gap-4" onSubmit={onSubmit}>
            <Field label="Email">
              <Input value={getInviteEmail(lookup)} readOnly />
            </Field>
            <Field label="Mot de passe">
              <Input
                type="password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setError("");
                }}
                minLength={8}
                required
              />
            </Field>
            <Field label="Confirmer le mot de passe">
              <Input
                type="password"
                value={passwordConfirm}
                onChange={(event) => {
                  setPasswordConfirm(event.target.value);
                  setError("");
                }}
                minLength={8}
                required
              />
            </Field>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button className="rounded-full" size="lg">
              Créer mon accès
            </Button>
          </form>
        </SaasCard>
      </section>
    </SaasShell>
  );
}

function getInviteDescription(lookup: Extract<InviteAccessLookup, { status: "valid" }>) {
  if (lookup.access.type === "manager_invite") {
    return `Vous allez créer votre mot de passe pour accéder à l’espace de ${lookup.agency.name}.`;
  }

  if (lookup.access.type === "agent_invite") {
    return `Vous allez créer votre mot de passe pour rejoindre l’espace de ${lookup.agency.name}.`;
  }

  return "Vous allez créer votre mot de passe pour accéder au suivi de votre bien.";
}

function getInviteEmail(lookup: Extract<InviteAccessLookup, { status: "valid" }>) {
  return (
    lookup.access.email ||
    lookup.member?.email ||
    lookup.property?.sellerEmail ||
    ""
  );
}

function HomeLink() {
  return (
    <Button
      asChild
      variant="outline"
      className="rounded-full border-[#d8cfc2] bg-white"
    >
      <Link to="/">
        <LogOut className="h-4 w-4" />
        Accueil
      </Link>
    </Button>
  );
}
