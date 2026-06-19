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
import { type AccessToken, type InviteAccessLookup } from "@/lib/agency-saas";
import {
  completeLoadedInviteAccess,
  loadInviteAccess,
  type CompletedInviteAccessLookup,
  type LoadedInviteAccess,
} from "@/lib/shared-invites";
import {
  acceptInvite,
  getAccessDestinationError,
  getAgencyById,
  getInvitationDestination,
  getInviteByToken,
  isInvitationExpired,
  loadV2State,
  saveV2State,
  type V2AccessInvitation,
  type V2UserAccess,
} from "@/lib/v2/core";

const LOCAL_ACCESS_SESSION_KEY = "signature_v2_access_email";
const LOCAL_ACCESS_ROLE_KEY = "signature_v2_access_role";
const LOCAL_ACCESS_AGENCY_SLUG_KEY = "signature_v2_access_agency_slug";
const LOCAL_ACCESS_SELLER_TOKEN_KEY = "signature_v2_access_seller_token";

type LocalInviteLookup =
  | {
      status: "valid";
      invitation: V2AccessInvitation;
      agencyName: string;
      email: string;
      description: string;
      roleLabel: string;
      destination: string;
    }
  | {
      status: "invalid" | "used" | "expired";
      title: string;
      message: string;
    };

export const Route = createFileRoute("/creer-acces/$token")({
  head: () => ({
    meta: [{ title: "Créer mon accès - Signature Immobilier" }],
  }),
  component: CreateAccessRoute,
});

function CreateAccessRoute() {
  const { token } = Route.useParams();
  const [lookup, setLookup] = useState<InviteAccessLookup | null>(null);
  const [localLookup, setLocalLookup] = useState<LocalInviteLookup | null>(
    null,
  );
  const [loadedInvite, setLoadedInvite] = useState<LoadedInviteAccess | null>(
    null,
  );
  const [loaded, setLoaded] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState("");
  const [redirectPath, setRedirectPath] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoaded(false);
    setLoadedInvite(null);
    setLookup(null);
    setLocalLookup(null);
    setError("");
    setRedirectPath("");

    const local = loadLocalV2Invite(token);
    if (local) {
      setLocalLookup(local);
      setLoaded(true);
      return () => {
        cancelled = true;
      };
    }

    loadInviteAccess(token)
      .then((result) => {
        if (cancelled) return;
        setLoadedInvite(result);
        setLookup(result.lookup);
      })
      .catch((error) => {
        console.info("Invitation non lue", error);
        if (!cancelled) {
          const local = loadLocalV2Invite(token);
          if (local) {
            setLocalLookup(local);
            return;
          }
          setLookup({
            status: "invalid",
            title: "Lien invalide ou expiré",
            message:
              "Contactez Signature Immobilier ou votre agence pour recevoir un nouveau lien.",
          });
        }
      })
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!loadedInvite && localLookup?.status !== "valid") return;
    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    if (password !== passwordConfirm) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    if (localLookup?.status === "valid") {
      const result = acceptInvite(loadV2State(), token, password);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      saveV2State(result.state);
      saveAcceptedAccessSession(result.access);
      setRedirectPath(result.destination);
      setError("");
      window.setTimeout(() => {
        window.location.assign(result.destination);
      }, 900);
      return;
    }

    setSubmitting(true);
    let result: CompletedInviteAccessLookup;
    try {
      result = await completeLoadedInviteAccess({
        token,
        password,
        loaded: loadedInvite,
      });
    } catch (error) {
      console.info("Invitation non validée", error);
      setSubmitting(false);
      setError("Impossible de créer l’accès pour le moment.");
      return;
    }
    setSubmitting(false);
    setLookup(result);
    if (result.status !== "valid") {
      setError("");
      return;
    }

    const nextRedirectPath =
      "redirectPath" in result ? (result.redirectPath ?? "/") : "/";
    if (result.status === "valid" && result.access) {
      saveSharedInviteAccessSession(result.access);
    }
    setRedirectPath(nextRedirectPath);
    setError("");
    window.setTimeout(() => {
      window.location.assign(nextRedirectPath);
    }, 900);
  }

  if (!loaded || (!lookup && !localLookup)) return null;

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

  if (localLookup && localLookup.status !== "valid") {
    return (
      <SaasShell action={<HomeLink />}>
        <SaasHero title={localLookup.title} description={localLookup.message} />
        <section className="mx-auto max-w-3xl px-5 pb-16 md:px-8">
          <SaasCard className="p-8 text-center md:p-12">
            <Button asChild className="rounded-full">
              <Link to="/">Retour a l'accueil</Link>
            </Button>
          </SaasCard>
        </section>
      </SaasShell>
    );
  }

  if (!localLookup && lookup?.status !== "valid") {
    return (
      <SaasShell action={<HomeLink />}>
        <SaasHero title={lookup!.title} description={lookup!.message} />
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
        eyebrow={localLookup?.agencyName ?? lookup!.agency.name}
        title="Créez votre accès Signature Immobilier"
        description={localLookup?.description ?? getInviteDescription(lookup!)}
      />
      <section className="mx-auto max-w-3xl px-5 pb-16 md:px-8">
        <SaasCard className="p-6 md:p-8">
          <form className="grid gap-4" onSubmit={onSubmit}>
            {localLookup?.status === "valid" ? (
              <div className="rounded-[24px] border border-[#e6ddcf] bg-[#fbf7ef] p-4 text-sm text-primary/70">
                <p>
                  Role : <span className="font-semibold text-primary">{localLookup.roleLabel}</span>
                </p>
                <p className="mt-2 break-all">
                  Destination prevue :{" "}
                  <span className="font-semibold text-primary">{localLookup.destination}</span>
                </p>
              </div>
            ) : null}
            <Field label="Email">
              <Input
                value={
                  localLookup?.status === "valid"
                    ? localLookup.email
                    : getInviteEmail(lookup!)
                }
                readOnly
              />
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
            <Button className="rounded-full" size="lg" disabled={submitting}>
              {submitting ? "Création en cours..." : "Créer mon accès"}
            </Button>
          </form>
        </SaasCard>
      </section>
    </SaasShell>
  );
}

function getInviteDescription(
  lookup: Extract<InviteAccessLookup, { status: "valid" }>,
) {
  if (lookup.access.type === "manager_invite") {
    return `Vous allez créer votre mot de passe pour accéder à l’espace de ${lookup.agency.name}.`;
  }

  if (lookup.access.type === "agent_invite") {
    return `Vous allez créer votre mot de passe pour rejoindre l’espace de ${lookup.agency.name}.`;
  }

  return "Vous allez créer votre mot de passe pour accéder au suivi de votre bien.";
}

function loadLocalV2Invite(token: string): LocalInviteLookup | null {
  const state = loadV2State();
  const invitation = getInviteByToken(state, token);
  if (!invitation) {
    return null;
  }

  if (invitation.status === "accepted") {
    return {
      status: "used",
      title: "Ce lien a deja ete utilise",
      message:
        "Connectez-vous depuis Mon suivi ou contactez votre agence si vous avez besoin d'un nouvel acces.",
    };
  }

  if (isInvitationExpired(invitation)) {
    return {
      status: "expired",
      title: "Ce lien a expire",
      message:
        "Contactez Signature Immobilier ou votre agence pour recevoir un nouveau lien.",
    };
  }

  const agency = getAgencyById(state, invitation.agencyId);
  const destination = getInvitationDestination(invitation);
  if (!destination) {
    return {
      status: "invalid",
      title: "Acces incomplet",
      message: getAccessDestinationError(invitation),
    };
  }

  return {
    status: "valid",
    invitation,
    agencyName: agency?.name ?? "Signature Immobilier",
    email: invitation.email,
    description: getLocalInviteDescription(invitation, agency?.name),
    roleLabel: getLocalInviteRoleLabel(invitation),
    destination,
  };
}

function getLocalInviteDescription(
  invitation: V2AccessInvitation,
  agencyName = "votre agence",
) {
  if (invitation.role === "manager") {
    return `Vous allez creer votre mot de passe pour acceder a l'espace de ${agencyName}.`;
  }

  if (invitation.role === "agent") {
    return `Vous allez creer votre mot de passe pour rejoindre l'espace de ${agencyName}.`;
  }

  return "Vous allez creer votre mot de passe pour acceder au suivi de votre bien.";
}

function getLocalInviteRoleLabel(invitation: V2AccessInvitation) {
  if (invitation.role === "manager") return "Patron / manager";
  if (invitation.role === "agent") return "Agent";
  return "Vendeur";
}

function saveAcceptedAccessSession(access: V2UserAccess) {
  window.sessionStorage.setItem(LOCAL_ACCESS_SESSION_KEY, access.email);
  window.sessionStorage.setItem(LOCAL_ACCESS_ROLE_KEY, access.role);

  if (access.agencySlug) {
    window.sessionStorage.setItem(
      LOCAL_ACCESS_AGENCY_SLUG_KEY,
      access.agencySlug,
    );
  } else {
    window.sessionStorage.removeItem(LOCAL_ACCESS_AGENCY_SLUG_KEY);
  }

  if (access.sellerToken) {
    window.sessionStorage.setItem(
      LOCAL_ACCESS_SELLER_TOKEN_KEY,
      access.sellerToken,
    );
  } else {
    window.sessionStorage.removeItem(LOCAL_ACCESS_SELLER_TOKEN_KEY);
  }
}

function saveSharedInviteAccessSession(access: AccessToken) {
  if (access.email) {
    window.sessionStorage.setItem(LOCAL_ACCESS_SESSION_KEY, access.email);
  }
  window.sessionStorage.setItem(
    LOCAL_ACCESS_ROLE_KEY,
    getSharedInviteRole(access),
  );

  if (access.agencySlug) {
    window.sessionStorage.setItem(
      LOCAL_ACCESS_AGENCY_SLUG_KEY,
      access.agencySlug,
    );
  } else {
    window.sessionStorage.removeItem(LOCAL_ACCESS_AGENCY_SLUG_KEY);
  }

  if (access.sellerToken) {
    window.sessionStorage.setItem(
      LOCAL_ACCESS_SELLER_TOKEN_KEY,
      access.sellerToken,
    );
  } else {
    window.sessionStorage.removeItem(LOCAL_ACCESS_SELLER_TOKEN_KEY);
  }
}

function getSharedInviteRole(access: AccessToken) {
  if (access.type === "manager" || access.type === "manager_invite") {
    return "manager";
  }
  if (access.type === "agent" || access.type === "agent_invite") {
    return "agent";
  }
  return "seller";
}

function getInviteEmail(
  lookup: Extract<InviteAccessLookup, { status: "valid" }>,
) {
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
