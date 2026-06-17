import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CheckCircle2,
  ImagePlus,
  KeyRound,
  Phone,
  Plus,
} from "lucide-react";
import { FormEvent, ReactNode, useState } from "react";

import { SessionLogoutButton } from "@/components/session-logout-button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { isAdminCodeValid, saveAdminSession } from "@/lib/admin-session";
import { signOutEverywhere } from "@/lib/session-cleanup";
import { supabase } from "@/lib/supabase";
import {
  activateAgencyAfterPayment,
  activateAgencySite,
  addPreviewAiRequest,
  addPropertyDocument,
  addPropertyReport,
  addPropertyVisit,
  calculateIndicativeEstimate,
  createCallbackRequest,
  createEstimationRequest,
  createPreviewProject,
  createProperty,
  createSellerAccess,
  createTeamInvite,
  createVisitRequest,
  deleteAgencyDemo,
  deletePreviewDemo,
  formatDate,
  formatPrice,
  generatePreviewDemo,
  getAgencyById,
  getAgencyBySlug,
  getAgencyProperties,
  getBrandingForAgency,
  getMainPhoto,
  getPropertyById,
  getPropertyBySlug,
  getPublicProperties,
  getSellerSpace,
  loadV2State,
  markPaymentValidated,
  saleSteps,
  saveV2State,
  updateEstimationStatus,
  updateProperty,
  updateVisitRequestStatus,
  type Agency,
  type EstimationRequest,
  type Property,
  type PropertySaleStep,
  type PublicBadge,
  type V2State,
  type VisitRequest,
} from "@/lib/v2/core";

type AccessResult =
  | { ok: true; destination: string }
  | { ok: false; message: string };

const badCredentialsMessage = "Email ou mot de passe incorrect.";
const unknownLoginMessage =
  "Impossible de vous connecter pour le moment. Reessayez.";
const noAccessMessage =
  "Votre compte existe, mais aucun espace n'est associe a cet email.";

function useV2Store() {
  const [state, setState] = useState<V2State>(() => loadV2State());
  function commit(next: V2State) {
    saveV2State(next);
    setState(next);
  }
  return { state, commit };
}

export function MonSuiviV2Page() {
  const { loading, session } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [adminCode, setAdminCode] = useState("");
  const [adminError, setAdminError] = useState("");
  const currentEmail = session?.user?.email ?? "";

  async function redirectToCurrentUserSpace(token?: string) {
    setBusy(true);
    setError("");
    const accessToken =
      token ??
      session?.access_token ??
      (await supabase.auth.getSession()).data.session?.access_token;
    if (!accessToken) {
      setBusy(false);
      setError(unknownLoginMessage);
      return;
    }
    const result = await resolveCurrentAccess(accessToken);
    setBusy(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    window.location.assign(result.destination);
  }

  async function onLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setBusy(false);
    if (signInError) {
      setError(getSignInErrorMessage(signInError.message));
      return;
    }
    await redirectToCurrentUserSpace(data.session?.access_token);
  }

  async function onChangeAccount() {
    setBusy(true);
    await signOutEverywhere();
    setEmail("");
    setPassword("");
    setError("");
    setAdminCode("");
    setAdminError("");
    setBusy(false);
  }

  function onAdmin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isAdminCodeValid(adminCode)) {
      setAdminError("Code admin incorrect.");
      return;
    }
    saveAdminSession();
    window.location.assign("/admin");
  }

  return (
    <Shell>
      <main className="mx-auto grid min-h-[calc(100vh-96px)] max-w-6xl items-center gap-8 px-5 py-10 md:grid-cols-[1fr_440px] md:px-8">
        <div>
          <Pill>Mon suivi</Pill>
          <h1 className="mt-5 font-display text-5xl leading-none md:text-6xl">
            Une entree unique, sans redirection forcee.
          </h1>
          <p className="mt-5 max-w-xl text-primary/60">
            Connectez-vous a votre espace agence ou vendeur. L'acces admin
            reste separe via code.
          </p>
        </div>
        <Panel className="p-6">
          <KeyRound className="h-8 w-8" />
          <h2 className="mt-4 font-display text-3xl">Acceder a mon espace</h2>
          {!loading && currentEmail && (
            <div className="mt-5 rounded-2xl border border-[#e8e0d5] bg-[#fffdf9] p-4">
              <p className="text-sm font-medium">
                Vous etes deja connecte avec {currentEmail}.
              </p>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <Button
                  type="button"
                  className="rounded-full"
                  disabled={busy}
                  onClick={() => redirectToCurrentUserSpace()}
                >
                  Continuer vers mon espace
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full bg-white"
                  disabled={busy}
                  onClick={onChangeAccount}
                >
                  Changer de compte
                </Button>
              </div>
            </div>
          )}
          <form className="mt-5 space-y-4" onSubmit={onLogin}>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Field label="Email">
              <Input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </Field>
            <Field label="Mot de passe">
              <Input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </Field>
            <Button className="w-full rounded-full" disabled={busy}>
              Acceder a mon espace
            </Button>
          </form>
          <div className="mt-6 border-t border-[#e8e0d5] pt-5 text-center text-xs text-primary/55">
            Vous gerez Signature Immobilier ?{" "}
            <button
              type="button"
              className="font-medium text-primary underline-offset-4 hover:underline"
              onClick={() => setShowAdmin((value) => !value)}
            >
              Acces administrateur Signature
            </button>
          </div>
          {showAdmin && (
            <form className="mt-4 space-y-3 rounded-2xl bg-[#faf7f0] p-4" onSubmit={onAdmin}>
              <Input
                type="password"
                placeholder="Code admin"
                value={adminCode}
                onChange={(event) => {
                  setAdminCode(event.target.value);
                  setAdminError("");
                }}
              />
              {adminError && <p className="text-sm text-red-600">{adminError}</p>}
              <Button className="w-full rounded-full">Ouvrir l'admin</Button>
            </form>
          )}
        </Panel>
      </main>
    </Shell>
  );
}

export function PublicAgencyHomePage({ agencySlug }: { agencySlug: string }) {
  const { state, commit } = useV2Store();
  const agency = getAgencyBySlug(state, agencySlug);
  const [feedback, setFeedback] = useState("");
  if (!agency) return <NotFound title="Agence introuvable" />;
  const properties = getPublicProperties(state, agency.id);

  function onCallback(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    commit(
      createCallbackRequest(state, agency.id, {
        firstName: readForm(form, "firstName"),
        lastName: readForm(form, "lastName"),
        phone: readForm(form, "phone"),
        email: readForm(form, "email"),
        message: readForm(form, "message"),
      }),
    );
    event.currentTarget.reset();
    setFeedback("Votre demande a bien ete transmise.");
  }

  return (
    <Shell agency={agency}>
      <Hero
        title={`${agency.name}, une experience immobiliere plus claire.`}
        text="Un site public moderne, des biens mieux presentes et un espace vendeur prive pour suivre visites, comptes rendus, documents et etapes de vente."
        image={properties[0] ? getMainPhoto(properties[0])?.url : undefined}
      >
        <Button asChild className="rounded-full">
          <Link to="/a/$agencySlug/biens" params={{ agencySlug }}>
            Voir les biens
          </Link>
        </Button>
        <Button asChild variant="outline" className="rounded-full bg-white">
          <Link to="/a/$agencySlug/estimation" params={{ agencySlug }}>
            Estimer mon bien
          </Link>
        </Button>
      </Hero>
      <Section title="Biens a vendre">
        <PropertyGrid agencySlug={agencySlug} properties={properties.slice(0, 3)} />
      </Section>
      <Section title="Un espace vendeur prive apres le mandat">
        <div className="grid gap-4 md:grid-cols-[1.4fr_0.6fr]">
          <Panel className="p-6">
            <h3 className="font-display text-4xl">
              Vous ne demandez plus ou ca en est. Vous le voyez.
            </h3>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {["Progression", "Prochaine visite", "Comptes rendus", "Documents"].map(
                (item) => (
                  <MiniCard
                    key={item}
                    title={item}
                    text="Visible simplement, sans donnees internes cote public."
                  />
                ),
              )}
            </div>
          </Panel>
          <Panel className="p-6">
            <h3 className="font-display text-3xl">Etre rappele</h3>
            <form className="mt-4 space-y-3" onSubmit={onCallback}>
              <Input name="firstName" placeholder="Prenom" required />
              <Input name="lastName" placeholder="Nom" required />
              <Input name="phone" placeholder="Telephone" required />
              <Input name="email" type="email" placeholder="Email" required />
              <Textarea name="message" placeholder="Message optionnel" />
              <Button className="w-full rounded-full">Etre rappele</Button>
              {feedback && <p className="text-sm text-emerald-700">{feedback}</p>}
            </form>
          </Panel>
        </div>
      </Section>
    </Shell>
  );
}

export function PublicPropertiesPage({ agencySlug }: { agencySlug: string }) {
  const { state } = useV2Store();
  const agency = getAgencyBySlug(state, agencySlug);
  if (!agency) return <NotFound title="Agence introuvable" />;
  return (
    <Shell agency={agency}>
      <Header title="Biens a vendre" text="Uniquement les annonces publiees, sans statuts internes ni documents." />
      <Section>
        <PropertyGrid
          agencySlug={agencySlug}
          properties={getPublicProperties(state, agency.id)}
        />
      </Section>
    </Shell>
  );
}

export function PublicPropertyDetailPage({
  agencySlug,
  propertySlug,
}: {
  agencySlug: string;
  propertySlug: string;
}) {
  const { state, commit } = useV2Store();
  const agency = getAgencyBySlug(state, agencySlug);
  const property = getPropertyBySlug(state, agencySlug, propertySlug);
  const [message, setMessage] = useState("");
  if (!agency || !property) return <NotFound title="Bien introuvable" />;

  function onVisit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    commit(
      createVisitRequest(state, agency.id, property.id, {
        firstName: readForm(form, "firstName"),
        lastName: readForm(form, "lastName"),
        phone: readForm(form, "phone"),
        email: readForm(form, "email"),
        buyerSituation: readForm(form, "buyerSituation"),
        financing: readForm(form, "financing"),
        buyingDelay: readForm(form, "buyingDelay"),
        message: readForm(form, "message"),
      }),
    );
    event.currentTarget.reset();
    setMessage(
      "Votre demande de visite a bien ete transmise. Un conseiller vous rappellera rapidement.",
    );
  }

  return (
    <Shell agency={agency}>
      <main className="mx-auto grid max-w-7xl gap-7 px-5 py-8 md:px-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <img
            src={getMainPhoto(property)?.url}
            alt={property.title}
            className="aspect-[16/10] w-full rounded-[28px] object-cover"
          />
          <h1 className="mt-7 font-display text-5xl">{property.title}</h1>
          <p className="mt-3 text-primary/60">
            {property.city} / {property.district} / {property.surface} m2 /{" "}
            {property.rooms} pieces
          </p>
          <p className="mt-4 text-xl font-medium">{formatPrice(property.price)}</p>
          <p className="mt-5 leading-relaxed text-primary/65">
            {property.description}
          </p>
        </div>
        <Panel className="p-6">
          <h2 className="font-display text-3xl">Demander une visite</h2>
          <Button asChild className="mt-4 w-full rounded-full">
            <a href={`tel:${agency.phone}`}>
              <Phone className="h-4 w-4" />
              Appeler l'agence
            </a>
          </Button>
          <form className="mt-5 space-y-3" onSubmit={onVisit}>
            <Input name="firstName" placeholder="Prenom" required />
            <Input name="lastName" placeholder="Nom" required />
            <Input name="phone" placeholder="Telephone" required />
            <Input name="email" type="email" placeholder="Email" required />
            <Input name="buyerSituation" placeholder="Situation acheteur" />
            <Input name="financing" placeholder="Financement" />
            <Input name="buyingDelay" placeholder="Delai d'achat" />
            <Textarea name="message" placeholder="Message optionnel" />
            <Button className="w-full rounded-full">Transmettre</Button>
            {message && <p className="text-sm text-emerald-700">{message}</p>}
          </form>
        </Panel>
      </main>
    </Shell>
  );
}

export function PublicEstimationPage({ agencySlug }: { agencySlug: string }) {
  const { state, commit } = useV2Store();
  const agency = getAgencyBySlug(state, agencySlug);
  const [sent, setSent] = useState(false);
  if (!agency) return <NotFound title="Agence introuvable" />;

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    commit(
      createEstimationRequest(state, agency.id, {
        propertyType: readForm(form, "propertyType"),
        city: readForm(form, "city"),
        postalCode: readForm(form, "postalCode"),
        surface: readNumber(form, "surface"),
        condition: readForm(form, "condition"),
        sellingDelay: readForm(form, "sellingDelay"),
        firstName: readForm(form, "firstName"),
        lastName: readForm(form, "lastName"),
        phone: readForm(form, "phone"),
        email: readForm(form, "email"),
        message: readForm(form, "message"),
      }),
    );
    setSent(true);
  }

  const preview = calculateIndicativeEstimate({
    surface: 80,
    city: agency.city,
    condition: "bon",
  });

  return (
    <Shell agency={agency}>
      <Header
        title="Obtenez une premiere estimation indicative."
        text="La demande est transmise a l'agence. Aucun mailto ni Gmail cote client."
      />
      <Section>
        <Panel className="mx-auto max-w-3xl p-6">
          {sent ? (
            <div>
              <CheckCircle2 className="h-10 w-10 text-emerald-600" />
              <h2 className="mt-4 font-display text-4xl">
                Votre demande a bien ete transmise.
              </h2>
              <p className="mt-3 text-primary/60">
                Un conseiller vous rappellera rapidement pour affiner
                l'estimation avec les ventes recentes du secteur.
              </p>
              <div className="mt-5 rounded-2xl bg-[#faf7f0] p-4">
                Exemple de fourchette indicative :{" "}
                {formatPrice(preview.lowEstimate)} -{" "}
                {formatPrice(preview.highEstimate)}
              </div>
            </div>
          ) : (
            <form className="grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
              <Input name="propertyType" placeholder="Type de bien" required />
              <Input name="city" placeholder="Ville" defaultValue={agency.city} required />
              <Input name="postalCode" placeholder="Code postal" />
              <Input name="surface" type="number" placeholder="Surface" required />
              <Input name="condition" placeholder="Etat du bien" defaultValue="bon" />
              <Input name="sellingDelay" placeholder="Delai de vente" defaultValue="3 mois" />
              <Input name="firstName" placeholder="Prenom" required />
              <Input name="lastName" placeholder="Nom" required />
              <Input name="phone" placeholder="Telephone" required />
              <Input name="email" type="email" placeholder="Email" required />
              <Textarea name="message" placeholder="Message optionnel" className="md:col-span-2" />
              <Button className="rounded-full md:col-span-2">
                Transmettre ma demande
              </Button>
            </form>
          )}
        </Panel>
      </Section>
    </Shell>
  );
}

export function SellerHomePage({ sellerToken }: { sellerToken: string }) {
  const { state } = useV2Store();
  const space = getSellerSpace(state, sellerToken);
  if (!space) return <NotFound title="Lien vendeur invalide" />;
  return (
    <PrivateShell
      title="Espace vendeur"
      links={[
        ["Accueil", `/vendeur/${sellerToken}`],
        ["Bien", `/vendeur/${sellerToken}/bien`],
        ["Visites", `/vendeur/${sellerToken}/visites`],
        ["Documents", `/vendeur/${sellerToken}/documents`],
      ]}
    >
      <Header
        title={space.property.title}
        text={`Bonjour ${space.seller.firstName}, voici le suivi simple de votre vente.`}
      />
      <Section>
        <div className="grid gap-5 md:grid-cols-[1.2fr_0.8fr]">
          <img
            src={getMainPhoto(space.property)?.url}
            alt={space.property.title}
            className="aspect-[16/10] rounded-[28px] object-cover"
          />
          <Panel className="p-6">
            <h2 className="font-display text-3xl">Progression</h2>
            <Progress current={space.property.saleStep} />
          </Panel>
        </div>
      </Section>
    </PrivateShell>
  );
}

export function SellerPropertyPage({ sellerToken }: { sellerToken: string }) {
  const { state } = useV2Store();
  const space = getSellerSpace(state, sellerToken);
  if (!space) return <NotFound title="Lien vendeur invalide" />;
  return (
    <SellerHomePage sellerToken={sellerToken} />
  );
}

export function SellerVisitsPage({ sellerToken }: { sellerToken: string }) {
  const { state } = useV2Store();
  const space = getSellerSpace(state, sellerToken);
  if (!space) return <NotFound title="Lien vendeur invalide" />;
  return (
    <PrivateShell title="Visites vendeur" links={sellerLinks(sellerToken)}>
      <Header title="Visites et comptes rendus" text="Le vendeur lit uniquement ce qui est visible pour lui." />
      <Section>
        <div className="grid gap-4">
          {space.visits.map((visit) => (
            <Panel key={visit.id} className="p-5">
              <h2 className="font-display text-3xl">
                {formatDate(visit.date)} a {visit.time}
              </h2>
              <p className="mt-2 text-primary/60">
                {visit.sellerNote || "Compte rendu en attente."}
              </p>
            </Panel>
          ))}
        </div>
      </Section>
    </PrivateShell>
  );
}

export function SellerDocumentsPage({ sellerToken }: { sellerToken: string }) {
  const { state } = useV2Store();
  const space = getSellerSpace(state, sellerToken);
  if (!space) return <NotFound title="Lien vendeur invalide" />;
  return (
    <PrivateShell title="Documents vendeur" links={sellerLinks(sellerToken)}>
      <Header title="Documents visibles" text="Uniquement les documents publies par l'agence." />
      <Section>
        <div className="grid gap-4">
          {space.documents.map((document) => (
            <Panel key={document.id} className="flex items-center justify-between gap-4 p-5">
              <div>
                <Badge variant="secondary">{document.documentType}</Badge>
                <h2 className="mt-2 font-display text-3xl">{document.name}</h2>
              </div>
              <Button asChild className="rounded-full">
                <a href={document.url} target="_blank" rel="noreferrer">
                  Ouvrir
                </a>
              </Button>
            </Panel>
          ))}
        </div>
      </Section>
    </PrivateShell>
  );
}

export function AgencyDashboardPage({ agencySlug }: { agencySlug: string }) {
  const { state } = useV2Store();
  const agency = getAgencyBySlug(state, agencySlug);
  if (!agency) return <NotFound title="Agence introuvable" />;
  const properties = getAgencyProperties(state, agency.id);
  return (
    <AgencyShell agency={agency}>
      <Header
        title="Dashboard agence"
        text="Tous les biens, demandes entrantes, visites et actions visibles par les clients."
      >
        <Button asChild className="rounded-full">
          <Link to="/agence/$slug/biens/nouveau" params={{ slug: agencySlug }}>
            <Plus className="h-4 w-4" />
            Creer une annonce
          </Link>
        </Button>
      </Header>
      <Section>
        <Stats
          items={[
            ["Tous les biens", properties.length],
            ["Demandes estimation", state.estimationRequests.length],
            ["Visites a venir", state.visits.length],
            ["CR a publier", state.reports.filter((r) => !r.visibleToSeller).length],
          ]}
        />
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {properties.map((property) => (
            <AgencyPropertyCard key={property.id} agencySlug={agencySlug} property={property} />
          ))}
        </div>
      </Section>
    </AgencyShell>
  );
}

export function AgencyPropertiesPage({ agencySlug }: { agencySlug: string }) {
  const { state } = useV2Store();
  const agency = getAgencyBySlug(state, agencySlug);
  if (!agency) return <NotFound title="Agence introuvable" />;
  return (
    <AgencyShell agency={agency}>
      <Header title="Biens de l'agence" text="Publiez ou gerez les annonces visibles cote public." />
      <Section>
        <div className="grid gap-4 md:grid-cols-2">
          {getAgencyProperties(state, agency.id).map((property) => (
            <AgencyPropertyCard key={property.id} agencySlug={agencySlug} property={property} />
          ))}
        </div>
      </Section>
    </AgencyShell>
  );
}

export function AgencyNewPropertyPage({ agencySlug }: { agencySlug: string }) {
  const { state, commit } = useV2Store();
  const agency = getAgencyBySlug(state, agencySlug);
  const [feedback, setFeedback] = useState("");
  if (!agency) return <NotFound title="Agence introuvable" />;

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    const form = new FormData(event.currentTarget);
    commit(
      createProperty(state, agency, {
        title: readForm(form, "title"),
        city: readForm(form, "city"),
        price: readNumber(form, "price"),
        surface: readNumber(form, "surface"),
        rooms: readNumber(form, "rooms"),
        bedrooms: readNumber(form, "bedrooms"),
        type: readForm(form, "type"),
        district: readForm(form, "district"),
        address: readForm(form, "address"),
        description: readForm(form, "description"),
        publicBadge: readForm(form, "publicBadge") as PublicBadge,
        isPublished: submitter?.value === "publish",
      }),
    );
    event.currentTarget.reset();
    setFeedback(submitter?.value === "publish" ? "Annonce publiee." : "Brouillon enregistre.");
  }

  return (
    <AgencyShell agency={agency}>
      <Header title="Creer une annonce" text="Un formulaire simple avec vrai selecteur de photos." />
      <Section>
        <Panel className="p-6">
          <form className="grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
            <Input name="title" placeholder="Titre" required />
            <Input name="city" placeholder="Ville" defaultValue={agency.city} required />
            <Input name="price" type="number" placeholder="Prix" required />
            <Input name="surface" type="number" placeholder="Surface" required />
            <Input name="rooms" type="number" placeholder="Pieces" required />
            <Input name="bedrooms" type="number" placeholder="Chambres" />
            <Input name="type" placeholder="Type" defaultValue="Appartement" />
            <Input name="district" placeholder="Adresse ou quartier" />
            <Input name="address" placeholder="Adresse interne" />
            <select name="publicBadge" className="rounded-md border bg-white px-3 py-2">
              <option value="">Aucun badge</option>
              <option value="Nouveaute">Nouveaute</option>
              <option value="Exclusivite">Exclusivite</option>
              <option value="Coup de coeur">Coup de coeur</option>
            </select>
            <label className="flex cursor-pointer items-center gap-2 rounded-md border bg-white px-3 py-2 md:col-span-2">
              <ImagePlus className="h-4 w-4" />
              Ajouter photos
              <input type="file" accept="image/*" multiple className="hidden" />
            </label>
            <Textarea name="description" placeholder="Description" className="md:col-span-2" required />
            <div className="flex gap-2 md:col-span-2">
              <Button name="intent" value="draft" variant="outline" className="rounded-full bg-white">
                Enregistrer brouillon
              </Button>
              <Button name="intent" value="publish" className="rounded-full">
                Publier annonce
              </Button>
            </div>
            {feedback && <p className="text-sm text-emerald-700 md:col-span-2">{feedback}</p>}
          </form>
        </Panel>
      </Section>
    </AgencyShell>
  );
}

export function AgencyPropertyManagePage({
  agencySlug,
  propertyId,
}: {
  agencySlug: string;
  propertyId: string;
}) {
  const { state, commit } = useV2Store();
  const agency = getAgencyBySlug(state, agencySlug);
  const property = getPropertyById(state, propertyId);
  const [feedback, setFeedback] = useState("");
  if (!agency || !property) return <NotFound title="Bien introuvable" />;

  function saveProperty(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    commit(
      updateProperty(state, property.id, {
        title: readForm(form, "title"),
        price: readNumber(form, "price"),
        city: readForm(form, "city"),
        surface: readNumber(form, "surface"),
        rooms: readNumber(form, "rooms"),
        type: readForm(form, "type"),
        description: readForm(form, "description"),
        isPublished: form.get("isPublished") === "on",
      }),
    );
    setFeedback("Annonce enregistree.");
  }

  function setStep(step: PropertySaleStep) {
    commit(updateProperty(state, property.id, { saleStep: step }));
    setFeedback("Progression mise a jour.");
  }

  function addVisit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    commit(
      addPropertyVisit(state, agency.id, property.id, {
        date: readForm(form, "date"),
        time: readForm(form, "time"),
        buyerName: readForm(form, "buyerName"),
        buyerPhone: readForm(form, "buyerPhone"),
        internalNote: readForm(form, "internalNote"),
        sellerNote: readForm(form, "sellerNote"),
      }),
    );
    event.currentTarget.reset();
    setFeedback("Visite ajoutee.");
  }

  function addReport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    commit(
      addPropertyReport(state, agency.id, property.id, {
        title: readForm(form, "title"),
        content: readForm(form, "content"),
        visibleToSeller: form.get("visibleToSeller") === "on",
      }),
    );
    event.currentTarget.reset();
    setFeedback("Compte rendu ajoute.");
  }

  function addDocument(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const file = form.get("file");
    commit(
      addPropertyDocument(state, agency.id, property.id, {
        name: readForm(form, "name"),
        documentType: readForm(form, "documentType") as "mandat",
        fileName: file instanceof File && file.name ? file.name : "document.pdf",
        url: file instanceof File ? URL.createObjectURL(file) : "https://example.com/document.pdf",
        visibleToSeller: form.get("visibleToSeller") === "on",
      }),
    );
    event.currentTarget.reset();
    setFeedback("Document ajoute.");
  }

  function addSeller(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    commit(
      createSellerAccess(state, agency, property, {
        firstName: readForm(form, "firstName"),
        lastName: readForm(form, "lastName"),
        email: readForm(form, "email"),
        phone: readForm(form, "phone"),
      }),
    );
    event.currentTarget.reset();
    setFeedback("Acces vendeur cree.");
  }

  return (
    <AgencyShell agency={agency}>
      <Header title={property.title} text="Gestion complete d'un seul bien." />
      <Section>
        {feedback && <div className="mb-4 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-700">{feedback}</div>}
        <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="space-y-5">
            <Panel className="overflow-hidden">
              <img src={getMainPhoto(property)?.url} alt={property.title} className="aspect-[16/10] w-full object-cover" />
              <div className="p-5">
                <Badge>{property.isPublished ? "Publie" : "Brouillon"}</Badge>
                <h2 className="mt-3 font-display text-4xl">{formatPrice(property.price)}</h2>
              </div>
            </Panel>
            <Panel className="p-5">
              <h3 className="font-display text-3xl">Progression vendeur</h3>
              <div className="mt-4 grid gap-2">
                {saleSteps.map((step) => (
                  <Button
                    key={step.id}
                    type="button"
                    variant={property.saleStep === step.id ? "default" : "outline"}
                    className="justify-start rounded-full bg-white"
                    onClick={() => setStep(step.id)}
                  >
                    {step.label}
                  </Button>
                ))}
              </div>
            </Panel>
          </div>
          <div className="space-y-5">
            <PanelForm title="Modifier annonce" onSubmit={saveProperty}>
              <Input name="title" defaultValue={property.title} />
              <Input name="price" type="number" defaultValue={property.price} />
              <Input name="city" defaultValue={property.city} />
              <Input name="surface" type="number" defaultValue={property.surface} />
              <Input name="rooms" type="number" defaultValue={property.rooms} />
              <Input name="type" defaultValue={property.type} />
              <Textarea name="description" defaultValue={property.description} className="md:col-span-2" />
              <label className="flex items-center gap-2 text-sm md:col-span-2">
                <input name="isPublished" type="checkbox" defaultChecked={property.isPublished} />
                Publie cote public
              </label>
            </PanelForm>
            <PanelForm title="Ajouter visite" onSubmit={addVisit}>
              <Input name="date" type="date" required />
              <Input name="time" type="time" required />
              <Input name="buyerName" placeholder="Acheteur optionnel" />
              <Input name="buyerPhone" placeholder="Telephone acheteur" />
              <Textarea name="internalNote" placeholder="Note interne" />
              <Textarea name="sellerNote" placeholder="Note visible vendeur" />
            </PanelForm>
            <PanelForm title="Ajouter compte rendu" onSubmit={addReport}>
              <Input name="title" placeholder="Titre" required />
              <Textarea name="content" placeholder="Compte rendu" required />
              <label className="flex items-center gap-2 text-sm">
                <input name="visibleToSeller" type="checkbox" />
                Visible vendeur
              </label>
            </PanelForm>
            <PanelForm title="Ajouter document" onSubmit={addDocument}>
              <Input name="name" placeholder="Nom" required />
              <select name="documentType" className="rounded-md border bg-white px-3 py-2">
                <option value="mandat">Mandat</option>
                <option value="diagnostics">Diagnostics</option>
                <option value="offre">Offre</option>
                <option value="compromis">Compromis</option>
                <option value="autre">Autre</option>
              </select>
              <Input name="file" type="file" accept="application/pdf,image/*,.doc,.docx" />
              <label className="flex items-center gap-2 text-sm">
                <input name="visibleToSeller" type="checkbox" />
                Visible vendeur
              </label>
            </PanelForm>
            <PanelForm title="Espace vendeur" onSubmit={addSeller}>
              <Input name="firstName" placeholder="Prenom" required />
              <Input name="lastName" placeholder="Nom" required />
              <Input name="email" type="email" placeholder="Email" required />
              <Input name="phone" placeholder="Telephone" required />
            </PanelForm>
          </div>
        </div>
      </Section>
    </AgencyShell>
  );
}

export function AgencySellersPage({ agencySlug }: { agencySlug: string }) {
  const { state } = useV2Store();
  const agency = getAgencyBySlug(state, agencySlug);
  if (!agency) return <NotFound title="Agence introuvable" />;
  return (
    <AgencyShell agency={agency}>
      <Header title="Vendeurs" text="Acces vendeurs associes aux biens." />
      <Section>
        <ListPanels
          items={state.sellers.filter((seller) => seller.agencyId === agency.id)}
          render={(seller) => (
            <>
              <Badge variant="secondary">{seller.status}</Badge>
              <h3 className="mt-2 font-display text-3xl">
                {seller.firstName} {seller.lastName}
              </h3>
              <p className="text-sm text-primary/55">{seller.email}</p>
              <Button asChild className="mt-4 rounded-full">
                <Link to="/vendeur/$sellerToken" params={{ sellerToken: seller.sellerToken }}>
                  Voir espace vendeur
                </Link>
              </Button>
            </>
          )}
        />
      </Section>
    </AgencyShell>
  );
}

export function AgencyEstimationsPage({ agencySlug }: { agencySlug: string }) {
  const { state, commit } = useV2Store();
  const agency = getAgencyBySlug(state, agencySlug);
  if (!agency) return <NotFound title="Agence introuvable" />;
  const requests = state.estimationRequests.filter((item) => item.agencyId === agency.id);
  return (
    <AgencyShell agency={agency}>
      <Header title="Estimations" text="Nouvelles demandes, contactees, RDV, mandat signe ou perdu." />
      <RequestPanels
        requests={requests}
        actions={[
          ["contacted", "Marquer contactee"],
          ["appointment", "RDV pris"],
          ["mandate_signed", "Mandat signe"],
          ["lost", "Perdu"],
          ["archived", "Archiver"],
        ]}
        onAction={(id, status) =>
          commit(updateEstimationStatus(state, id, status as EstimationRequest["status"]))
        }
      />
    </AgencyShell>
  );
}

export function AgencyVisitRequestsPage({ agencySlug }: { agencySlug: string }) {
  const { state, commit } = useV2Store();
  const agency = getAgencyBySlug(state, agencySlug);
  if (!agency) return <NotFound title="Agence introuvable" />;
  const requests = state.visitRequests.filter((item) => item.agencyId === agency.id);
  return (
    <AgencyShell agency={agency}>
      <Header title="Demandes de visite" text="Acheteurs publics a rappeler." />
      <RequestPanels
        requests={requests}
        actions={[
          ["contacted", "Marquer contactee"],
          ["visit_scheduled", "Visite programmee"],
          ["lost", "Perdu"],
          ["archived", "Archiver"],
        ]}
        onAction={(id, status) =>
          commit(updateVisitRequestStatus(state, id, status as VisitRequest["status"]))
        }
      />
    </AgencyShell>
  );
}

export function AgencyAgentsPage({ agencySlug }: { agencySlug: string }) {
  const { state, commit } = useV2Store();
  const agency = getAgencyBySlug(state, agencySlug);
  const [feedback, setFeedback] = useState("");
  if (!agency) return <NotFound title="Agence introuvable" />;

  function addAgent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    commit(
      createTeamInvite(state, agency.id, {
        role: readForm(form, "role") as "manager" | "agent",
        firstName: readForm(form, "firstName"),
        lastName: readForm(form, "lastName"),
        email: readForm(form, "email"),
        phone: readForm(form, "phone"),
      }),
    );
    event.currentTarget.reset();
    setFeedback("Invitation creee.");
  }

  return (
    <AgencyShell agency={agency}>
      <Header title="Agents" text="Patrons, managers et agents rattaches a l'agence." />
      <Section>
        <div className="grid gap-5 md:grid-cols-[0.8fr_1.2fr]">
          <Panel className="p-5">
            <form className="grid gap-3" onSubmit={addAgent}>
              <select name="role" className="rounded-md border bg-white px-3 py-2">
                <option value="agent">Agent</option>
                <option value="manager">Patron / manager</option>
              </select>
              <Input name="firstName" placeholder="Prenom" required />
              <Input name="lastName" placeholder="Nom" required />
              <Input name="email" type="email" placeholder="Email" required />
              <Input name="phone" placeholder="Telephone" />
              <Button className="rounded-full">Ajouter et inviter</Button>
              {feedback && <p className="text-sm text-emerald-700">{feedback}</p>}
            </form>
          </Panel>
          <ListPanels
            items={state.teamMembers.filter((member) => member.agencyId === agency.id)}
            render={(member) => (
              <>
                <Badge variant="secondary">{member.role}</Badge>
                <h3 className="mt-2 font-display text-3xl">
                  {member.firstName} {member.lastName}
                </h3>
                <p className="text-sm text-primary/55">{member.email}</p>
              </>
            )}
          />
        </div>
      </Section>
    </AgencyShell>
  );
}

export function AdminDashboardV2Page() {
  const { state } = useV2Store();
  const active = state.agencies.filter((agency) => agency.status === "active");
  const demo = state.agencies.filter((agency) => agency.status === "demo");
  const monthly = state.subscriptions.reduce((sum, sub) => sum + sub.monthlyAmount, 0);
  return (
    <AdminShell>
      <Header title="Dashboard global Signature" text="Demos, agences, abonnements, alertes et paiements." >
        <Button className="rounded-full" onClick={() => goTo("/admin/preview-studio/nouveau")}>
          Creer une demo agence
        </Button>
      </Header>
      <Section>
        <Stats
          items={[
            ["Agences demo", demo.length],
            ["Agences actives", active.length],
            ["Abonnements", state.subscriptions.length],
            ["CA mensuel theorique", formatPrice(monthly)],
          ]}
        />
        <div className="mt-5 grid gap-4 md:grid-cols-4">
          {[
            ["/admin/preview-studio", "Preview Studio"],
            ["/admin/agences", "Agences"],
            ["/admin/tarifs", "Tarifs"],
            ["/admin/abonnements", "Abonnements"],
          ].map(([href, label]) => (
            <button key={href} type="button" onClick={() => goTo(href)} className="block w-full text-left">
              <Panel className="p-5">
                <h3 className="font-display text-3xl">{label}</h3>
                <span className="mt-4 inline-flex rounded-full border border-[#e8e0d5] bg-white px-4 py-2 text-sm font-medium">
                  Ouvrir
                </span>
              </Panel>
            </button>
          ))}
        </div>
      </Section>
    </AdminShell>
  );
}

export function PreviewStudioListPage() {
  const { state, commit } = useV2Store();
  const [feedback, setFeedback] = useState("");

  function removePreview(previewId: string) {
    if (
      !window.confirm(
        "Supprimer cette demo et ses donnees pilotes associees ?",
      )
    ) {
      return;
    }
    commit(deletePreviewDemo(state, previewId));
    setFeedback("Demo supprimee.");
  }

  return (
    <AdminShell>
      <Header title="Signature Preview Studio" text="Creer et piloter les demos premium." >
        <Button asChild className="rounded-full">
          <Link to="/admin/preview-studio/nouveau">Nouvelle demo</Link>
        </Button>
      </Header>
      <Section>
        {feedback && (
          <div className="mb-4 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-700">
            {feedback}
          </div>
        )}
        <ListPanels
          items={state.previewProjects}
          render={(project) => (
            <>
              <Badge variant="secondary">{project.status}</Badge>
              <h3 className="mt-2 font-display text-3xl">{project.agencyName}</h3>
              <p className="text-sm text-primary/55">{project.websiteUrl}</p>
              <Button asChild className="mt-4 rounded-full">
                <Link to="/admin/preview-studio/$previewId" params={{ previewId: project.id }}>
                  Ouvrir
                </Link>
              </Button>
              <Button
                type="button"
                variant="outline"
                className="mt-2 rounded-full bg-white"
                onClick={() => removePreview(project.id)}
              >
                Supprimer
              </Button>
            </>
          )}
        />
      </Section>
    </AdminShell>
  );
}

export function PreviewStudioNewPage() {
  const { state, commit } = useV2Store();
  const [createdId, setCreatedId] = useState("");

  function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const next = createPreviewProject(state, {
      agencyName: readForm(form, "agencyName"),
      websiteUrl: readForm(form, "websiteUrl"),
      city: readForm(form, "city"),
      phone: readForm(form, "phone"),
      email: readForm(form, "email"),
      contactName: readForm(form, "contactName"),
      priority: readForm(form, "priority") as "test",
    });
    commit(next);
    setCreatedId(next.previewProjects[0]?.id ?? "");
  }

  return (
    <AdminShell>
      <Header title="Nouvelle demo agence" text="URL, analyse, mode assiste et fallback manuel rapide." />
      <Section>
        <Panel className="p-6">
          <form className="grid gap-4 md:grid-cols-2" onSubmit={create}>
            <Input name="agencyName" placeholder="Nom agence" required />
            <Input name="websiteUrl" placeholder="URL site actuel" required />
            <Input name="city" placeholder="Ville" required />
            <Input name="phone" placeholder="Telephone optionnel" />
            <Input name="email" type="email" placeholder="Email optionnel" />
            <Input name="contactName" placeholder="Contact connu optionnel" />
            <select name="priority" className="rounded-md border bg-white px-3 py-2 md:col-span-2">
              <option value="test">Test</option>
              <option value="hot">Prospect chaud</option>
              <option value="meeting">RDV prevu</option>
              <option value="signature">A signer rapidement</option>
            </select>
            <Button className="rounded-full md:col-span-2">Analyser automatiquement</Button>
          </form>
          {createdId && (
            <Button asChild className="mt-5 rounded-full">
              <Link to="/admin/preview-studio/$previewId" params={{ previewId: createdId }}>
                Ouvrir la demo creee
              </Link>
            </Button>
          )}
        </Panel>
      </Section>
    </AdminShell>
  );
}

export function PreviewStudioDetailPage({ previewId }: { previewId: string }) {
  const { state, commit } = useV2Store();
  const project = state.previewProjects.find((item) => item.id === previewId);
  const [instruction, setInstruction] = useState("");
  const [managerFeedback, setManagerFeedback] = useState("");
  if (!project) return <NotFound title="Projet introuvable" />;
  const agency = getAgencyById(state, project.agencyId);
  if (!agency) return <NotFound title="Agence introuvable" />;
  const demoSeller = agency
    ? state.sellers.find((seller) => seller.agencyId === agency.id)
    : null;

  function addAi(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!instruction.trim()) return;
    commit(addPreviewAiRequest(state, project.id, instruction));
    setInstruction("");
  }

  function addManager(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isPaymentValidated(state, agency.id)) {
      setManagerFeedback("Validez le paiement avant d'activer l'agence.");
      return;
    }
    const form = new FormData(event.currentTarget);
    commit(
      createTeamInvite(state, agency.id, {
        role: "manager",
        firstName: readForm(form, "firstName"),
        lastName: readForm(form, "lastName"),
        email: readForm(form, "email"),
        phone: readForm(form, "phone"),
      }),
    );
    event.currentTarget.reset();
    setManagerFeedback("Patron / manager ajoute.");
  }

  return (
    <AdminShell>
      <Header title={project.agencyName} text={project.analysisSummary} />
      <Section>
        <div className="grid gap-5 md:grid-cols-2">
          <Panel className="p-5">
            <h3 className="font-display text-3xl">Analyse</h3>
            {[...project.detectedWeaknesses, ...project.signatureOpportunities].map((item) => (
              <p key={item} className="mt-3 rounded-2xl bg-[#faf7f0] p-3 text-sm">
                {item}
              </p>
            ))}
          </Panel>
          <Panel className="p-5">
            <h3 className="font-display text-3xl">Biens detectes</h3>
            {project.scrapedProperties.map((property) => (
              <p key={property.id} className="mt-3 rounded-2xl bg-[#faf7f0] p-3 text-sm">
                {property.title} / confiance {Math.round(property.confidenceScore * 100)}%
              </p>
            ))}
          </Panel>
          <Panel className="p-5">
            <h3 className="font-display text-3xl">Generer la demo premium</h3>
            <p className="mt-2 text-sm text-primary/55">
              Cree la base demo exploitable : biens, equipe, vendeur, visite,
              compte rendu et documents visibles.
            </p>
            <Button className="mt-4 rounded-full" onClick={() => commit(generatePreviewDemo(state, project.id))}>
              Generer la demo premium
            </Button>
          </Panel>
          {["demo_ready", "payment_pending", "active"].includes(project.status) && (
            <DemoAccessPanel agency={agency} sellerToken={demoSeller?.sellerToken} />
          )}
          <Panel className="p-5">
            <h3 className="font-display text-3xl">Modifier avec IA</h3>
            <form className="mt-4 space-y-3" onSubmit={addAi}>
              <Textarea value={instruction} onChange={(event) => setInstruction(event.target.value)} placeholder="Ex : rends le site plus premium" />
              <Button className="rounded-full">Generer proposition</Button>
            </form>
          </Panel>
          <AgencyPaymentPanel state={state} agency={agency} commit={commit} />
          <ManagerAccessPanel
            feedback={managerFeedback}
            onSubmit={addManager}
            paymentValidated={isPaymentValidated(state, agency.id)}
          />
        </div>
      </Section>
    </AdminShell>
  );
}

export function AdminAgenciesPage() {
  const { state, commit } = useV2Store();
  const [feedback, setFeedback] = useState("");

  function removeAgencyDemo(agencyId: string) {
    if (!window.confirm("Supprimer cette agence demo et ses donnees pilotes ?")) {
      return;
    }
    commit(deleteAgencyDemo(state, agencyId));
    setFeedback("Agence demo supprimee.");
  }

  return (
    <AdminShell>
      <Header title="Agences" text="Toutes les agences demo, actives ou perdues." />
      <Section>
        {feedback && (
          <div className="mb-4 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-700">
            {feedback}
          </div>
        )}
        <ListPanels
          items={state.agencies}
          render={(agency) => (
            <>
              <Badge>{agency.status}</Badge>
              <h3 className="mt-2 font-display text-3xl">{agency.name}</h3>
              <p className="text-sm text-primary/55">{agency.city}</p>
              <Button asChild className="mt-4 rounded-full">
                <Link to="/admin/agences/$agencyId" params={{ agencyId: agency.id }}>
                  Ouvrir fiche
                </Link>
              </Button>
              {agency.status !== "active" && (
                <Button
                  type="button"
                  variant="outline"
                  className="mt-2 rounded-full bg-white"
                  onClick={() => removeAgencyDemo(agency.id)}
                >
                  Supprimer demo
                </Button>
              )}
            </>
          )}
        />
      </Section>
    </AdminShell>
  );
}

export function AdminAgencyDetailPage({ agencyId }: { agencyId: string }) {
  const { state, commit } = useV2Store();
  const [managerFeedback, setManagerFeedback] = useState("");
  const agency = getAgencyById(state, agencyId);
  if (!agency) return <NotFound title="Agence introuvable" />;
  const demoSeller = state.sellers.find((seller) => seller.agencyId === agency.id);

  function addManager(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isPaymentValidated(state, agency.id)) {
      setManagerFeedback("Validez le paiement avant d'activer l'agence.");
      return;
    }
    const form = new FormData(event.currentTarget);
    commit(
      createTeamInvite(state, agency.id, {
        role: "manager",
        firstName: readForm(form, "firstName"),
        lastName: readForm(form, "lastName"),
        email: readForm(form, "email"),
        phone: readForm(form, "phone"),
      }),
    );
    event.currentTarget.reset();
    setManagerFeedback("Patron / manager ajoute.");
  }

  return (
    <AdminShell>
      <Header title={agency.name} text={`Statut : ${agency.status}`} />
      <Section>
        <DemoAccessPanel agency={agency} sellerToken={demoSeller?.sellerToken} />
      </Section>
      <Section>
        <div className="grid gap-5 md:grid-cols-2">
          <AgencyPaymentPanel state={state} agency={agency} commit={commit} />
          <ManagerAccessPanel
            feedback={managerFeedback}
            onSubmit={addManager}
            paymentValidated={isPaymentValidated(state, agency.id)}
          />
        </div>
      </Section>
    </AdminShell>
  );
}

export function AdminPricingPage() {
  const { state } = useV2Store();
  return (
    <AdminShell>
      <Header title="Tarifs" text="Frais d'installation, mensualites et formules." />
      <Section>
        <div className="grid gap-4 md:grid-cols-3">
          {state.plans.map((plan) => (
            <Panel key={plan.id} className="p-5">
              <Badge>{plan.isActive ? "active" : "inactive"}</Badge>
              <h3 className="mt-3 font-display text-4xl">{plan.name}</h3>
              <p className="mt-2 text-sm text-primary/55">{plan.description}</p>
              <p className="mt-5 text-2xl font-medium">{formatPrice(plan.setupFee)}</p>
              <p className="text-sm text-primary/50">Installation</p>
              <p className="mt-3 text-2xl font-medium">{formatPrice(plan.monthlyFee)}</p>
              <p className="text-sm text-primary/50">Mensuel</p>
            </Panel>
          ))}
        </div>
      </Section>
    </AdminShell>
  );
}

export function AdminSubscriptionsPage() {
  const { state } = useV2Store();
  return (
    <AdminShell>
      <Header title="Abonnements" text="Stripe et statuts paiement." />
      <Section>
        <ListPanels
          items={state.subscriptions}
          render={(subscription) => (
            <>
              <Badge>{subscription.status}</Badge>
              <h3 className="mt-2 font-display text-3xl">{subscription.planId}</h3>
              <p className="text-sm text-primary/55">{formatPrice(subscription.monthlyAmount)}</p>
              <a href={subscription.stripePaymentUrl} className="mt-3 block break-all text-sm">
                {subscription.stripePaymentUrl}
              </a>
            </>
          )}
        />
      </Section>
    </AdminShell>
  );
}

function AgencyPaymentPanel({
  state,
  agency,
  commit,
}: {
  state: V2State;
  agency: Agency;
  commit: (next: V2State) => void;
}) {
  const [feedback, setFeedback] = useState("");
  const subscription = state.subscriptions.find(
    (item) => item.agencyId === agency.id,
  );
  const paymentValidated = isPaymentValidated(state, agency.id);

  function choosePlan(planId: "essential" | "signature" | "premium") {
    commit(activateAgencyAfterPayment(state, agency.id, planId));
    setFeedback("Lien de paiement pilote genere.");
  }

  function validatePayment() {
    commit(markPaymentValidated(state, agency.id));
    setFeedback("Paiement valide.");
  }

  function activateAgency() {
    if (!paymentValidated) {
      setFeedback("Validez le paiement avant d'activer l'agence.");
      return;
    }
    commit(activateAgencySite(state, agency.id));
    setFeedback("Agence activee.");
  }

  return (
    <Panel className="p-5">
      <h3 className="font-display text-3xl">Paiement / activation agence</h3>
      <p className="mt-2 text-sm text-primary/55">
        {paymentValidated ? "Paiement valide." : "Paiement en attente."}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {state.plans.map((plan) => (
          <Button
            key={plan.id}
            type="button"
            variant="outline"
            className="rounded-full bg-white"
            onClick={() => choosePlan(plan.id)}
          >
            Lien {plan.name}
          </Button>
        ))}
        <Button type="button" className="rounded-full" onClick={validatePayment}>
          Paiement valide
        </Button>
        <Button
          type="button"
          variant="outline"
          className="rounded-full bg-white"
          onClick={activateAgency}
        >
          Activer l'agence
        </Button>
      </div>
      {subscription?.stripePaymentUrl && (
        <a href={subscription.stripePaymentUrl} className="mt-4 block break-all text-sm">
          {subscription.stripePaymentUrl}
        </a>
      )}
      {agency.status === "active" && (
        <p className="mt-3 text-sm text-emerald-700">Agence active.</p>
      )}
      {feedback && <p className="mt-3 text-sm text-emerald-700">{feedback}</p>}
    </Panel>
  );
}

function ManagerAccessPanel({
  feedback,
  onSubmit,
  paymentValidated,
}: {
  feedback: string;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  paymentValidated: boolean;
}) {
  return (
    <Panel className="p-5">
      <h3 className="font-display text-3xl">Acces equipe</h3>
      {!paymentValidated && (
        <p className="mt-2 text-sm text-primary/55">
          Validez le paiement avant d'activer l'agence.
        </p>
      )}
      <form className="mt-4 grid gap-3 md:grid-cols-2" onSubmit={onSubmit}>
        <Input name="firstName" placeholder="Prenom patron" required />
        <Input name="lastName" placeholder="Nom patron" required />
        <Input name="email" type="email" placeholder="Email patron" required />
        <Input name="phone" placeholder="Telephone" />
        <Button className="rounded-full md:col-span-2">
          Ajouter patron / manager
        </Button>
      </form>
      {feedback && <p className="mt-3 text-sm text-emerald-700">{feedback}</p>}
    </Panel>
  );
}

function DemoAccessPanel({
  agency,
  sellerToken,
}: {
  agency: Agency;
  sellerToken?: string;
}) {
  return (
    <Panel className="p-5">
      <Badge>Demo prete</Badge>
      <h2 className="mt-3 font-display text-4xl">Acces demo</h2>
      <p className="mt-2 max-w-2xl text-sm text-primary/55">
        Demo premium generee. Ouvrez directement les vues utiles pour le rendez-vous :
        site public, espace patron, vue agent et espace vendeur.
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        <Button asChild className="rounded-full">
          <Link to="/a/$agencySlug" params={{ agencySlug: agency.slug }}>
            Voir le site public
          </Link>
        </Button>
        <Button asChild variant="outline" className="rounded-full bg-white">
          <Link to="/agence/$slug" params={{ slug: agency.slug }}>
            Ouvrir l'espace patron / agence
          </Link>
        </Button>
        <Button asChild variant="outline" className="rounded-full bg-white">
          <Link to="/agence/$slug" params={{ slug: agency.slug }}>
            Espace agent (vue agence provisoire)
          </Link>
        </Button>
        {sellerToken ? (
          <Button asChild variant="outline" className="rounded-full bg-white">
            <Link to="/vendeur/$sellerToken" params={{ sellerToken }}>
              Ouvrir l'espace vendeur
            </Link>
          </Button>
        ) : (
          <span className="inline-flex items-center rounded-full border border-[#e8e0d5] bg-[#faf7f0] px-4 py-2 text-sm text-primary/55">
            Aucun vendeur demo genere.
          </span>
        )}
        <Button asChild variant="outline" className="rounded-full bg-white">
          <Link to="/admin/agences/$agencyId" params={{ agencyId: agency.id }}>
            Voir fiche agence admin
          </Link>
        </Button>
      </div>
    </Panel>
  );
}

function Shell({ agency, children }: { agency?: Agency; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#faf7f0] text-primary">
      <header className="sticky top-0 z-40 border-b border-[#e8e0d5] bg-[#faf7f0]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-5 md:px-8">
          <Link
            to={agency ? "/a/$agencySlug" : "/"}
            params={agency ? { agencySlug: agency.slug } : undefined}
            className="flex items-center gap-3"
          >
            <span className="grid h-10 w-10 place-items-center rounded-full bg-primary font-display text-xl text-primary-foreground">
              S
            </span>
            <span className="font-display text-xl">{agency?.name ?? "Signature Immobilier"}</span>
          </Link>
          <div className="flex items-center gap-2">
            {agency && (
              <Button asChild variant="outline" className="hidden rounded-full bg-white md:inline-flex">
                <Link to="/a/$agencySlug/biens" params={{ agencySlug: agency.slug }}>
                  Biens
                </Link>
              </Button>
            )}
            <Button asChild className="rounded-full">
              <Link to="/mon-suivi">Mon suivi</Link>
            </Button>
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}

function AgencyShell({ agency, children }: { agency: Agency; children: ReactNode }) {
  return (
    <PrivateShell
      title={agency.name}
      useBrowserNavigation
      links={[
        ["Dashboard", `/agence/${agency.slug}`],
        ["Biens", `/agence/${agency.slug}/biens`],
        ["Vendeurs", `/agence/${agency.slug}/vendeurs`],
        ["Estimations", `/agence/${agency.slug}/estimations`],
        ["Visites", `/agence/${agency.slug}/demandes-visites`],
        ["Agents", `/agence/${agency.slug}/agents`],
      ]}
    >
      {children}
    </PrivateShell>
  );
}

function goTo(path: string) {
  window.location.assign(path);
}

function AdminShell({ children }: { children: ReactNode }) {
  return (
    <PrivateShell
      title="Signature Admin"
      useBrowserNavigation
      links={[
        ["Dashboard", "/admin"],
        ["Preview Studio", "/admin/preview-studio"],
        ["Agences", "/admin/agences"],
        ["Tarifs", "/admin/tarifs"],
        ["Abonnements", "/admin/abonnements"],
      ]}
    >
      {children}
    </PrivateShell>
  );
}

function PrivateShell({
  title,
  links,
  children,
  useBrowserNavigation = false,
}: {
  title: string;
  links: string[][];
  children: ReactNode;
  useBrowserNavigation?: boolean;
}) {
  return (
    <div className="min-h-screen bg-[#faf7f0] text-primary">
      <header className="sticky top-0 z-40 border-b border-[#e8e0d5] bg-[#faf7f0]/90 backdrop-blur-xl">
        <div className="mx-auto flex min-h-20 max-w-7xl flex-col gap-3 px-5 py-4 md:flex-row md:items-center md:justify-between md:px-8">
          <div className="font-display text-xl">{title}</div>
          <div className="flex items-center gap-2 overflow-auto">
            {links.map(([label, href]) =>
              useBrowserNavigation ? (
                <button
                  key={href}
                  type="button"
                  onClick={() => goTo(href)}
                  className="whitespace-nowrap rounded-full bg-white px-3 py-2 text-sm"
                >
                  {label}
                </button>
              ) : (
                <Link key={href} to={href} className="whitespace-nowrap rounded-full bg-white px-3 py-2 text-sm">
                  {label}
                </Link>
              ),
            )}
            <SessionLogoutButton />
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}

function Header({
  title,
  text,
  children,
}: {
  title: string;
  text: string;
  children?: ReactNode;
}) {
  return (
    <section className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 md:flex-row md:items-end md:justify-between md:px-8">
      <div>
        <Pill>Signature V2</Pill>
        <h1 className="mt-4 font-display text-5xl leading-none md:text-6xl">{title}</h1>
        <p className="mt-4 max-w-2xl text-primary/60">{text}</p>
      </div>
      {children}
    </section>
  );
}

function Hero({
  title,
  text,
  image,
  children,
}: {
  title: string;
  text: string;
  image?: string;
  children?: ReactNode;
}) {
  return (
    <section className="mx-auto grid max-w-7xl gap-7 px-5 py-8 md:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
      <div>
        <Pill>Signature V2</Pill>
        <h1 className="mt-5 font-display text-5xl leading-none md:text-7xl">{title}</h1>
        <p className="mt-5 max-w-xl text-primary/60">{text}</p>
        <div className="mt-7 flex flex-wrap gap-3">{children}</div>
      </div>
      <div className="aspect-[16/11] overflow-hidden rounded-[30px] bg-[#efe7db]">
        {image && <img src={image} alt="" className="h-full w-full object-cover" />}
      </div>
    </section>
  );
}

function Section({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <section className="mx-auto max-w-7xl px-5 py-8 md:px-8">
      {title && <h2 className="mb-5 font-display text-4xl">{title}</h2>}
      {children}
    </section>
  );
}

function PropertyGrid({ agencySlug, properties }: { agencySlug: string; properties: Property[] }) {
  return (
    <div className="grid gap-5 md:grid-cols-3">
      {properties.map((property) => (
        <Link
          key={property.id}
          to="/a/$agencySlug/biens/$propertySlug"
          params={{ agencySlug, propertySlug: property.slug }}
          className="overflow-hidden rounded-[24px] border border-[#e8e0d5] bg-white shadow-[0_18px_45px_rgba(17,24,39,0.04)]"
        >
          <img src={getMainPhoto(property)?.url} alt={property.title} className="aspect-[4/3] w-full object-cover" />
          <div className="p-5">
            {property.publicBadge && <Badge variant="secondary">{property.publicBadge}</Badge>}
            <h3 className="mt-3 font-display text-3xl">{property.title}</h3>
            <p className="text-sm text-primary/55">{property.city} / {property.surface} m2 / {property.rooms} pieces</p>
            <p className="mt-3 font-medium">{formatPrice(property.price)}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}

function AgencyPropertyCard({ agencySlug, property }: { agencySlug: string; property: Property }) {
  return (
    <Panel className="flex gap-4 p-4">
      <img src={getMainPhoto(property)?.url} alt={property.title} className="h-28 w-32 rounded-2xl object-cover" />
      <div>
        <Badge>{property.isPublished ? "Publie" : "Brouillon"}</Badge>
        <h3 className="mt-2 font-display text-3xl">{property.title}</h3>
        <Button asChild className="mt-3 rounded-full">
          <Link to="/agence/$slug/biens/$propertyId" params={{ slug: agencySlug, propertyId: property.id }}>
            Gerer
          </Link>
        </Button>
      </div>
    </Panel>
  );
}

function RequestPanels({
  requests,
  actions,
  onAction,
}: {
  requests: Array<EstimationRequest | VisitRequest>;
  actions: string[][];
  onAction: (id: string, status: string) => void;
}) {
  return (
    <Section>
      <div className="grid gap-4">
        {requests.map((request) => (
          <Panel key={request.id} className="p-5">
            <Badge>{request.status}</Badge>
            <h3 className="mt-2 font-display text-3xl">{request.firstName} {request.lastName}</h3>
            <p className="text-sm text-primary/55">{request.email} / {request.phone}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {actions.map(([status, label]) => (
                <Button key={status} variant="outline" className="rounded-full bg-white" onClick={() => onAction(request.id, status)}>
                  {label}
                </Button>
              ))}
            </div>
          </Panel>
        ))}
        {!requests.length && <Panel className="p-8 text-center text-primary/55">Aucune demande pour le moment.</Panel>}
      </div>
    </Section>
  );
}

function ListPanels<T>({ items, render }: { items: T[]; render: (item: T) => ReactNode }) {
  return (
    <div className="grid gap-4">
      {items.map((item, index) => (
        <Panel key={index} className="p-5">{render(item)}</Panel>
      ))}
      {!items.length && <Panel className="p-8 text-center text-primary/55">Aucun element pour le moment.</Panel>}
    </div>
  );
}

function PanelForm({
  title,
  onSubmit,
  children,
}: {
  title: string;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  children: ReactNode;
}) {
  return (
    <Panel className="p-5">
      <h3 className="font-display text-3xl">{title}</h3>
      <form className="mt-4 grid gap-3 md:grid-cols-2" onSubmit={onSubmit}>
        {children}
        <Button className="rounded-full md:col-span-2">Enregistrer</Button>
      </form>
    </Panel>
  );
}

function Stats({ items }: { items: Array<[string, string | number]> }) {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      {items.map(([label, value]) => (
        <Panel key={label} className="p-5">
          <div className="text-xs font-medium uppercase tracking-[0.18em] text-primary/40">{label}</div>
          <div className="mt-2 font-display text-3xl">{value}</div>
        </Panel>
      ))}
    </div>
  );
}

function Progress({ current }: { current: PropertySaleStep }) {
  const currentIndex = saleSteps.findIndex((step) => step.id === current);
  return (
    <div className="mt-4 grid gap-3">
      {saleSteps.map((step, index) => (
        <div key={step.id} className="flex items-center gap-3">
          <span className={`grid h-8 w-8 place-items-center rounded-full ${index <= currentIndex ? "bg-primary text-white" : "bg-[#faf7f0]"}`}>{index + 1}</span>
          <span>{step.label}</span>
        </div>
      ))}
    </div>
  );
}

function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-[24px] border border-[#e8e0d5] bg-white shadow-[0_18px_45px_rgba(17,24,39,0.04)] ${className}`}>
      {children}
    </div>
  );
}

function MiniCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl bg-[#faf7f0] p-4">
      <div className="font-medium">{title}</div>
      <p className="mt-1 text-sm text-primary/55">{text}</p>
    </div>
  );
}

function Pill({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-primary/55">
      {children}
    </span>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function NotFound({ title }: { title: string }) {
  return (
    <Shell>
      <main className="mx-auto grid min-h-[70vh] max-w-xl place-items-center px-5 text-center">
        <div>
          <h1 className="font-display text-5xl">{title}</h1>
          <Button asChild className="mt-6 rounded-full">
            <Link to="/">Retour a l'accueil</Link>
          </Button>
        </div>
      </main>
    </Shell>
  );
}

function sellerLinks(sellerToken: string) {
  return [
    ["Accueil", `/vendeur/${sellerToken}`],
    ["Bien", `/vendeur/${sellerToken}/bien`],
    ["Visites", `/vendeur/${sellerToken}/visites`],
    ["Documents", `/vendeur/${sellerToken}/documents`],
  ];
}

function isPaymentValidated(state: V2State, agencyId: string) {
  return state.subscriptions.some(
    (subscription) =>
      subscription.agencyId === agencyId && subscription.status === "active",
  );
}

async function resolveCurrentAccess(accessToken: string): Promise<AccessResult> {
  try {
    const response = await fetch("/api/accesses/current", {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const body = (await response.json().catch(() => null)) as unknown;
    if (
      response.ok &&
      body &&
      typeof body === "object" &&
      "destination" in body &&
      typeof body.destination === "string"
    ) {
      return { ok: true, destination: body.destination };
    }
    if (body && typeof body === "object" && "code" in body && body.code === "no_access") {
      return { ok: false, message: noAccessMessage };
    }
    return { ok: false, message: unknownLoginMessage };
  } catch {
    return { ok: false, message: unknownLoginMessage };
  }
}

function getSignInErrorMessage(message: string) {
  return message.toLowerCase().includes("credentials")
    ? badCredentialsMessage
    : unknownLoginMessage;
}

function readForm(form: FormData, key: string) {
  const value = form.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function readNumber(form: FormData, key: string) {
  const value = Number(readForm(form, key));
  return Number.isFinite(value) ? value : 0;
}
